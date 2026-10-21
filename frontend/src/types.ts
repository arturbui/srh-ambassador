// Strapi v5 — responses have no `attributes` wrapper; fields are top-level on each item.

// Locales configured in the CMS (see srh-ambassador bootstrap/locales.ts).
export type Locale = 'en' | 'de-DE';

export interface StrapiMedia {
  id: number;
  url: string;
  name: string;
  alternativeText: string | null;
  width: number | null;
  height: number | null;
}

export interface StrapiUser {
  id: number;
  documentId: string;
  username: string;
  email: string;
}

export type UniversityStatus = 'student' | 'exchange_student' | 'professor' | 'ambassador';

// From /api/account/me — role is the Users-Permissions permission role (what
// you can do); universityStatus is who you are at the university (admin-
// assigned only) — kept deliberately separate, see i18n.tsx for display logic.
export interface AuthUser extends StrapiUser {
  role?: { name: string; type: string };
  universityStatus?: UniversityStatus | null;
}

// components.material — repeatable component on Event
export interface Material {
  id: number;
  name: string | null;
  organizerProvided: boolean | null;
  file: StrapiMedia | null;
}

// api::news-article.news-article
// `author` can never come back populated (Strapi blocks populating relations
// to plugin::users-permissions.user from the public API) — see api.ts.
export interface NewsArticle {
  id: number;
  documentId: string;
  title: string;
  category: 'announcement' | 'report' | null;
  content: BlocksContent | null;
  author: StrapiUser | null;
  publishedAt: string | null;
  locale: string;
}

// api::event.event — `host` has the same populate restriction as `author` above.
export interface Event {
  id: number;
  documentId: string;
  name: string | null;
  material: Material[];
  publishedAt: string | null;
  locale: string;
}

// api::category.category
export interface Category {
  id: number;
  documentId: string;
  name: string;
  description: string | null;
}

// api::club.club
export interface Club {
  id: number;
  documentId: string;
  name: string;
  description: BlocksContent | null;
  hostName: string | null;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  category: Category | null;
  locale: string;
}

// api::activity.activity
export interface Activity {
  id: number;
  documentId: string;
  title: string;
  description: BlocksContent | null;
  date: string | null;
  location: string | null;
  building: string | null;
  room: string | null;
  capacity: number | null;
  timetable: string | null;
  club: { id: number; documentId: string } | null;
}

// api::document.document — `uploadedBy` has the same populate restriction as
// `author`/`host` above; `club` is a normal (non-user) relation and populates fine.
export interface ClubDocument {
  id: number;
  documentId: string;
  title: string;
  description: string | null;
  file: StrapiMedia | null;
  visibility: 'public' | 'members' | 'leaders';
  club: { id: number; documentId: string } | null;
}

// api::membership.membership — `user` has the same populate restriction as
// `author`/`host`/`uploadedBy` above; `club` populates fine.
export interface Membership {
  id: number;
  documentId: string;
  joinedDate: string | null;
  role: 'member' | 'leader';
  club: { id: number; documentId: string; name?: string } | null;
}

// Strapi v5 Blocks (rich-text) AST — minimal subset needed for rendering
export type BlocksContent = BlockNode[];

export interface BlockNode {
  type: string;
  children?: InlineNode[];
  level?: number;   // heading level 1-6
  format?: string;  // list format: 'ordered' | 'unordered'
  image?: StrapiMedia;
}

export interface InlineNode {
  type: string;
  text?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  code?: boolean;
  url?: string;
  children?: InlineNode[];
}

export interface StrapiListResponse<T> {
  data: T[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface StrapiItemResponse<T> {
  data: T;
  meta: Record<string, unknown>;
}
