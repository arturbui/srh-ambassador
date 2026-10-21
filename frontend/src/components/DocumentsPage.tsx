import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../auth';
import { useLocale } from '../i18n';
import { createDocument, fetchClubs, fetchDocuments, fetchMemberships, uploadFile } from '../api';
import type { Club, ClubDocument, Membership } from '../types';
import type { TranslationKey } from '../i18n';

const API_URL = import.meta.env.VITE_API_URL as string;

const VISIBILITY_KEY: Record<ClubDocument['visibility'], TranslationKey> = {
  public: 'visibilityPublic',
  members: 'visibilityMembers',
  leaders: 'visibilityLeaders',
};

export default function DocumentsPage() {
  const { user } = useAuth();
  const { t, locale } = useLocale();
  const [documents, setDocuments] = useState<ClubDocument[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [ledClubIds, setLedClubIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [clubId, setClubId] = useState('');
  const [visibility, setVisibility] = useState<ClubDocument['visibility']>('members');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  function load() {
    setLoading(true);
    setError(null);
    Promise.all([
      fetchDocuments(locale),
      fetchClubs(locale),
      user ? fetchMemberships() : Promise.resolve({ data: [] as Membership[] }),
    ])
      .then(([documentsRes, clubsRes, membershipsRes]) => {
        setDocuments(documentsRes.data);
        setClubs(clubsRes.data);
        const leaderClubDocIds = membershipsRes.data
          .filter((m) => m.role === 'leader')
          .map((m) => m.club?.documentId)
          .filter((id): id is string => Boolean(id));
        setLedClubIds(leaderClubDocIds);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(load, [locale, user]);

  function clubName(documentId: string | undefined) {
    return clubs.find((c) => c.documentId === documentId)?.name ?? '';
  }

  const ledClubs = clubs.filter((c) => ledClubIds.includes(c.documentId));

  async function submitCreate(e: React.FormEvent) {
    e.preventDefault();
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      setFormError(t('documentsChooseFile'));
      return;
    }
    setCreating(true);
    setFormError(null);
    try {
      const uploaded = await uploadFile(file);
      await createDocument({
        title,
        description: description || undefined,
        file: uploaded.id,
        visibility,
        club: clubId,
      });
      setTitle('');
      setDescription('');
      setVisibility('members');
      if (fileInputRef.current) fileInputRef.current.value = '';
      load();
    } catch (err) {
      setFormError((err as Error).message);
    } finally {
      setCreating(false);
    }
  }

  return (
    <div>
      <h1 className="section-title">{t('navDocuments')}</h1>

      {loading && <p className="muted">{t('loading')}</p>}
      {error && <p className="error-text">{t('errorPrefix')} {error}</p>}

      {!loading && !error && documents.length === 0 && <p className="muted">{t('documentsNone')}</p>}

      {documents.map((doc) => {
        const fileUrl = doc.file?.url
          ? doc.file.url.startsWith('/') ? `${API_URL}${doc.file.url}` : doc.file.url
          : null;
        return (
          <div className="card" key={doc.id}>
            <h2>{doc.title}</h2>
            <div className="card-meta">
              <span className="badge">{clubName(doc.club?.documentId)}</span>
              <span className={`badge ${doc.visibility}`}>{t(VISIBILITY_KEY[doc.visibility])}</span>
            </div>
            {doc.description && <p className="muted">{doc.description}</p>}
            {fileUrl && <a className="toggle-link" href={fileUrl} target="_blank" rel="noreferrer">{t('download', { name: doc.file?.name ?? '' })}</a>}
          </div>
        );
      })}

      {ledClubs.length > 0 && (
        <>
          <div className="section-heading"><h2>{t('documentsUpload')}</h2></div>
          <form className="form card" onSubmit={submitCreate}>
            <div className="field">
              <label htmlFor="doc-club">{t('fieldClub')}</label>
              <select id="doc-club" value={clubId} onChange={(e) => setClubId(e.target.value)} required>
                <option value="">{t('activitiesSelectLedClub')}</option>
                {ledClubs.map((c) => (
                  <option key={c.id} value={c.documentId}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="doc-title">{t('fieldTitle')}</label>
              <input id="doc-title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div className="field">
              <label htmlFor="doc-description">{t('fieldDescription')}</label>
              <textarea id="doc-description" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="doc-visibility">{t('documentsWhoCanSee')}</label>
              <select id="doc-visibility" value={visibility} onChange={(e) => setVisibility(e.target.value as ClubDocument['visibility'])}>
                <option value="public">{t('visibilityPublicOption')}</option>
                <option value="members">{t('visibilityMembers')}</option>
                <option value="leaders">{t('visibilityLeaders')}</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="doc-file">{t('fieldFile')}</label>
              <input id="doc-file" type="file" ref={fileInputRef} required />
            </div>
            {formError && <p className="error-text">{formError}</p>}
            <button className="btn btn-primary" type="submit" disabled={creating}>{t('upload')}</button>
          </form>
        </>
      )}

      {user && ledClubs.length === 0 && (
        <p className="muted">{t('documentsLeadFirst')}</p>
      )}
    </div>
  );
}
