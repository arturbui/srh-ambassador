import type {
  Activity,
  AuthUser,
  BlocksContent,
  Category,
  Club,
  ClubDocument,
  Event,
  Locale,
  Membership,
  NewsArticle,
  StrapiItemResponse,
  StrapiListResponse,
  StrapiMedia,
} from './types';

const BASE = import.meta.env.VITE_API_URL as string;
const TOKEN_KEY = 'srh_ambassador_jwt';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function throwOnError(res: Response, path: string): Promise<never> {
  const body = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
  const detail = body?.error?.message ?? res.statusText;
  throw new Error(`API ${res.status} (${path}): ${detail}`);
}

async function get<T>(path: string): Promise<T> {
  // Content here changes on every create/edit/delete, so a client-side nav
  // reusing a browser-cached GET would show stale data — only a full reload
  // happened to force revalidation. Never cache these.
  const res = await fetch(`${BASE}${path}`, { headers: authHeaders(), cache: 'no-store' });
  if (!res.ok) return throwOnError(res, path);
  return res.json() as Promise<T>;
}

async function send<T>(method: string, path: string, body?: unknown): Promise<T> {
  const isForm = body instanceof FormData;
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: isForm ? authHeaders() : { 'Content-Type': 'application/json', ...authHeaders() },
    body: isForm ? body : body !== undefined ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });
  if (!res.ok) return throwOnError(res, path);
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// Turns a plain textarea value into the minimal Strapi Blocks (rich-text) AST
// the CMS's `blocks` fields expect — one paragraph per non-empty line.
export function toBlocks(text: string): BlocksContent {
  return text
    .split('\n')
    .filter((line) => line.trim().length > 0)
    .map((line) => ({ type: 'paragraph', children: [{ type: 'text', text: line }] }));
}

// Inverse of toBlocks() — for pre-filling an edit form's plain textarea from
// content that came back from the CMS as Blocks.
export function blocksToText(content: BlocksContent): string {
  return content
    .map((node) => (node.children ?? []).map((child) => child.text ?? '').join(''))
    .join('\n');
}

// ---------- auth ----------

export function register(username: string, email: string, password: string) {
  return send<{ jwt: string; user: AuthUser }>('POST', '/api/auth/local/register', {
    username,
    email,
    password,
  });
}

export function login(identifier: string, password: string) {
  return send<{ jwt: string; user: AuthUser }>('POST', '/api/auth/local', { identifier, password });
}

// /api/users/me can't return `role` — Strapi's content API strips it from
// populate regardless of syntax — so this hits a small custom endpoint instead.
export function fetchMe() {
  return get<AuthUser>('/api/account/me');
}

// ---------- media upload ----------
// Two-step flow: upload the raw file, then reference its numeric id when
// creating/updating an entity — Strapi's public API create/update actions
// don't accept multipart bodies directly.
export async function uploadFile(file: File): Promise<StrapiMedia> {
  const form = new FormData();
  form.append('files', file);
  const [uploaded] = await send<StrapiMedia[]>('POST', '/api/upload', form);
  return uploaded;
}

// ---------- categories ----------

export function fetchCategories(locale: Locale) {
  const params = new URLSearchParams([['locale', locale]]);
  return get<StrapiListResponse<Category>>(`/api/categories?${params}`);
}

// ---------- clubs ----------

export function fetchClubs(locale: Locale) {
  const params = new URLSearchParams([
    ['locale', locale],
    ['populate[category]', 'true'],
  ]);
  return get<StrapiListResponse<Club>>(`/api/clubs?${params}`);
}

export function createClub(data: { name: string; description?: BlocksContent; hostName?: string; category?: string }) {
  return send<StrapiItemResponse<Club>>('POST', '/api/clubs', { data });
}

export function updateClub(
  documentId: string,
  data: { name: string; description?: BlocksContent; hostName?: string; category?: string }
) {
  return send<StrapiItemResponse<Club>>('PUT', `/api/clubs/${documentId}`, { data });
}

// ---------- activities ----------

export function fetchActivities(locale: Locale, clubDocumentId?: string) {
  const params = new URLSearchParams([
    ['locale', locale],
    ['populate[club]', 'true'],
  ]);
  if (clubDocumentId) {
    params.append('filters[club][documentId][$eq]', clubDocumentId);
  }
  return get<StrapiListResponse<Activity>>(`/api/activities?${params}`);
}

export function createActivity(data: {
  title: string;
  description?: string;
  date?: string;
  location?: string;
  building?: string;
  room?: string;
  capacity?: number;
  club: string;
}) {
  return send<StrapiItemResponse<Activity>>('POST', '/api/activities', { data });
}

// ---------- events ----------

// material is a repeatable component; file is media inside it.
// We cannot use [file]=* because plugin::upload.file has a `related` morphToMany field
// that Strapi blocks on the public API. Select only the scalar fields we actually need.
export function fetchEvents(locale: Locale) {
  const params = new URLSearchParams([
    ['locale', locale],
    ['populate[material][populate][file][fields][0]', 'url'],
    ['populate[material][populate][file][fields][1]', 'name'],
    ['populate[material][populate][file][fields][2]', 'alternativeText'],
    ['populate[material][populate][file][fields][3]', 'width'],
    ['populate[material][populate][file][fields][4]', 'height'],
  ]);
  return get<StrapiListResponse<Event>>(`/api/events?${params}`);
}

export function createEvent(data: { name: string }) {
  return send<StrapiItemResponse<Event>>('POST', '/api/events', { data });
}

export function updateEvent(documentId: string, data: { name: string }) {
  return send<StrapiItemResponse<Event>>('PUT', `/api/events/${documentId}`, { data });
}

export function deleteEvent(documentId: string) {
  return send<void>('DELETE', `/api/events/${documentId}`);
}

// documentIds of events hosted by the current user — `host` can't be
// populated or filtered on directly from the public API (see types.ts).
export function fetchMyEventIds(): Promise<Set<string>> {
  return get<{ data: Event[] }>('/api/events/mine').then((res) => new Set(res.data.map((e) => e.documentId)));
}

// ---------- news articles ----------

// author → plugin::users-permissions.user is blocked by Strapi v5's public REST API
// for security reasons; omit it from populate to avoid it being silently stripped.
export function fetchNewsArticles(locale: Locale) {
  const params = new URLSearchParams([['locale', locale]]);
  return get<StrapiListResponse<NewsArticle>>(`/api/news-articles?${params}`);
}

export function createNewsArticle(data: { title: string; category?: string; content?: BlocksContent }) {
  return send<StrapiItemResponse<NewsArticle>>('POST', '/api/news-articles', { data });
}

export function updateNewsArticle(documentId: string, data: { title: string; category?: string; content?: BlocksContent }) {
  return send<StrapiItemResponse<NewsArticle>>('PUT', `/api/news-articles/${documentId}`, { data });
}

export function deleteNewsArticle(documentId: string) {
  return send<void>('DELETE', `/api/news-articles/${documentId}`);
}

// documentIds of articles written by the current user — same restriction as fetchMyEventIds.
export function fetchMyNewsArticleIds(): Promise<Set<string>> {
  return get<{ data: NewsArticle[] }>('/api/news-articles/mine').then(
    (res) => new Set(res.data.map((a) => a.documentId))
  );
}

// ---------- documents ----------

export function fetchDocuments(locale: Locale, clubDocumentId?: string) {
  const params = new URLSearchParams([['locale', locale]]);
  if (clubDocumentId) {
    params.append('filters[club][documentId][$eq]', clubDocumentId);
  }
  return get<StrapiListResponse<ClubDocument>>(`/api/documents?${params}`);
}

export function createDocument(data: {
  title: string;
  description?: string;
  file: number;
  visibility: 'public' | 'members' | 'leaders';
  club: string;
}) {
  return send<StrapiItemResponse<ClubDocument>>('POST', '/api/documents', { data });
}

// ---------- memberships ----------

// Scoped server-side to "my own" + "clubs I lead" — see membership controller.
export function fetchMemberships(clubDocumentId?: string) {
  const params = new URLSearchParams();
  if (clubDocumentId) {
    params.append('filters[club][documentId][$eq]', clubDocumentId);
  }
  const qs = params.toString();
  return get<StrapiListResponse<Membership>>(`/api/memberships${qs ? `?${qs}` : ''}`);
}

// Only the current user's own membership rows — `user` can't be populated or
// filtered on directly from the public API (see types.ts), and a roster
// fetched via fetchMemberships() has no other way to tell "which row is me".
export function fetchMyMemberships() {
  return get<StrapiListResponse<Membership>>('/api/memberships/mine');
}

export function joinClub(clubDocumentId: string) {
  return send<StrapiItemResponse<Membership>>('POST', '/api/memberships', { data: { club: clubDocumentId } });
}

export function leaveMembership(documentId: string) {
  return send<void>('DELETE', `/api/memberships/${documentId}`);
}

export function promoteMembership(documentId: string, role: 'member' | 'leader') {
  return send<StrapiItemResponse<Membership>>('PUT', `/api/memberships/${documentId}`, { data: { role } });
}
