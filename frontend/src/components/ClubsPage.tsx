import { useEffect, useState } from 'react';
import { useAuth } from '../auth';
import { useLocale } from '../i18n';
import {
  createClub,
  fetchCategories,
  fetchClubs,
  fetchMemberships,
  joinClub,
  leaveMembership,
  toBlocks,
} from '../api';
import type { Category, Club, Membership } from '../types';
import type { TranslationKey } from '../i18n';
import BlocksRenderer from './BlocksRenderer';

const STATUS_KEY: Record<Club['approvalStatus'], TranslationKey> = {
  pending: 'clubsStatusPending',
  approved: 'clubsStatusApproved',
  rejected: 'clubsStatusRejected',
};

export default function ClubsPage() {
  const { user } = useAuth();
  const { t, locale } = useLocale();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [hostName, setHostName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  function load() {
    setLoading(true);
    setError(null);
    Promise.all([
      fetchClubs(locale),
      fetchCategories(locale),
      user ? fetchMemberships() : Promise.resolve({ data: [] as Membership[] }),
    ])
      .then(([clubsRes, categoriesRes, membershipsRes]) => {
        setClubs(clubsRes.data);
        setCategories(categoriesRes.data);
        setMemberships(membershipsRes.data);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(load, [locale, user]);

  function membershipFor(club: Club) {
    return memberships.find((m) => m.club?.documentId === club.documentId) ?? null;
  }

  async function submitCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setFormError(null);
    try {
      await createClub({
        name,
        description: description ? toBlocks(description) : undefined,
        hostName: hostName || undefined,
        category: categoryId || undefined,
      });
      setName('');
      setDescription('');
      setHostName('');
      setCategoryId('');
      load();
    } catch (err) {
      setFormError((err as Error).message);
    } finally {
      setCreating(false);
    }
  }

  async function join(club: Club) {
    try {
      await joinClub(club.documentId);
    } catch {
      // Ignore — the list simply won't change if this failed.
    }
    load();
  }

  async function leave(membership: Membership) {
    try {
      await leaveMembership(membership.documentId);
    } catch {
      // Ignore — the list simply won't change if this failed.
    }
    load();
  }

  return (
    <div>
      <h1 className="section-title">{t('navClubs')}</h1>

      {loading && <p className="muted">{t('loading')}</p>}
      {error && <p className="error-text">{t('errorPrefix')} {error}</p>}

      {!loading && !error && clubs.length === 0 && <p className="muted">{t('clubsNoneVisible')}</p>}

      {clubs.map((club) => {
        const membership = membershipFor(club);
        return (
          <div className="card" key={club.id}>
            <h2>{club.name}</h2>
            <div className="card-meta">
              <span className={`badge ${club.approvalStatus}`}>{t(STATUS_KEY[club.approvalStatus])}</span>
              {club.category && <span className="badge">{club.category.name}</span>}
              {membership && (
                <span className="badge leader">{membership.role === 'leader' ? t('clubsYouLead') : t('clubsYouAreMember')}</span>
              )}
            </div>
            {club.description && <BlocksRenderer content={club.description} />}
            {club.hostName && <p className="muted">{t('clubsHostedBy', { name: club.hostName })}</p>}
            {user && (
              <div className="btn-row">
                {!membership && (
                  <button className="btn btn-small btn-primary" onClick={() => join(club)}>{t('clubsJoin')}</button>
                )}
                {membership && membership.role === 'member' && (
                  <button className="btn btn-small btn-danger" onClick={() => leave(membership)}>{t('clubsLeave')}</button>
                )}
              </div>
            )}
          </div>
        );
      })}

      {user && (
        <>
          <div className="section-heading"><h2>{t('clubsStart')}</h2></div>
          <form className="form card" onSubmit={submitCreate}>
            <div className="field">
              <label htmlFor="club-name">{t('fieldName')}</label>
              <input id="club-name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="field">
              <label htmlFor="club-description">{t('fieldDescription')}</label>
              <textarea id="club-description" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="club-host">{t('fieldHostName')}</label>
              <input id="club-host" value={hostName} onChange={(e) => setHostName(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="club-category">{t('fieldCategory')}</label>
              <select id="club-category" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                <option value="">{t('none')}</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.documentId}>{c.name}</option>
                ))}
              </select>
            </div>
            {formError && <p className="error-text">{formError}</p>}
            <p className="muted">{t('clubsPendingNotice')}</p>
            <button className="btn btn-primary" type="submit" disabled={creating}>{t('clubsCreate')}</button>
          </form>
        </>
      )}
    </div>
  );
}
