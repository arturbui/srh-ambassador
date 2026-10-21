import { useEffect, useState } from 'react';
import { useAuth } from '../auth';
import { useLocale } from '../i18n';
import {
  blocksToText,
  fetchCategories,
  fetchClubs,
  fetchMemberships,
  fetchMyMemberships,
  leaveMembership,
  promoteMembership,
  toBlocks,
  updateClub,
} from '../api';
import type { Category, Club, Membership } from '../types';
import BlocksRenderer from './BlocksRenderer';

export default function MembershipPage() {
  const { user } = useAuth();
  const { t, locale } = useLocale();
  const [myMemberships, setMyMemberships] = useState<Membership[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [rosters, setRosters] = useState<Record<string, Membership[]>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editingClubId, setEditingClubId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editHostName, setEditHostName] = useState('');
  const [editCategoryId, setEditCategoryId] = useState('');
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  function load() {
    if (!user) return;
    setLoading(true);
    setError(null);
    Promise.all([fetchMyMemberships(), fetchClubs(locale), fetchCategories(locale)])
      .then(async ([myRes, clubsRes, categoriesRes]) => {
        setMyMemberships(myRes.data);
        setClubs(clubsRes.data);
        setCategories(categoriesRes.data);

        const ledClubDocIds = myRes.data.filter((m) => m.role === 'leader').map((m) => m.club?.documentId).filter((id): id is string => Boolean(id));
        const rosterEntries = await Promise.all(
          ledClubDocIds.map(async (clubDocId) => {
            const roster = await fetchMemberships(clubDocId);
            return [clubDocId, roster.data] as const;
          })
        );
        setRosters(Object.fromEntries(rosterEntries));
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(load, [locale, user]);

  function clubFor(documentId: string | undefined) {
    return clubs.find((c) => c.documentId === documentId);
  }

  async function leave(membership: Membership) {
    try {
      await leaveMembership(membership.documentId);
    } catch {
      // Ignore — the list simply won't change if this failed.
    }
    load();
  }

  async function promote(membership: Membership) {
    try {
      await promoteMembership(membership.documentId, 'leader');
    } catch {
      // Ignore — the list simply won't change if this failed.
    }
    load();
  }

  async function removeMember(membership: Membership) {
    try {
      await leaveMembership(membership.documentId);
    } catch {
      // Ignore — the list simply won't change if this failed.
    }
    load();
  }

  function startEdit(club: Club) {
    setEditingClubId(club.documentId);
    setEditName(club.name);
    setEditDescription(club.description ? blocksToText(club.description) : '');
    setEditHostName(club.hostName ?? '');
    setEditCategoryId(club.category?.documentId ?? '');
    setEditError(null);
  }

  async function submitEdit(e: React.FormEvent, documentId: string) {
    e.preventDefault();
    setSaving(true);
    setEditError(null);
    try {
      await updateClub(documentId, {
        name: editName,
        description: editDescription ? toBlocks(editDescription) : undefined,
        hostName: editHostName || undefined,
        category: editCategoryId || undefined,
      });
      setEditingClubId(null);
      load();
    } catch (err) {
      setEditError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  if (!user) {
    return (
      <div>
        <h1 className="section-title">{t('navMembership')}</h1>
        <p className="muted">{t('membershipLoginPrompt')}</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="section-title">{t('navMembership')}</h1>

      {loading && <p className="muted">{t('loading')}</p>}
      {error && <p className="error-text">{t('errorPrefix')} {error}</p>}

      {!loading && !error && myMemberships.length === 0 && <p className="muted">{t('membershipNone')}</p>}

      {myMemberships.map((m) => {
        const club = clubFor(m.club?.documentId);
        const isLeader = m.role === 'leader';
        const isEditingThisClub = club && editingClubId === club.documentId;

        if (isEditingThisClub && club) {
          return (
            <form key={m.id} className="form card" onSubmit={(e) => submitEdit(e, club.documentId)}>
              <div className="field">
                <label htmlFor={`edit-name-${club.id}`}>{t('fieldName')}</label>
                <input id={`edit-name-${club.id}`} value={editName} onChange={(e) => setEditName(e.target.value)} required />
              </div>
              <div className="field">
                <label htmlFor={`edit-description-${club.id}`}>{t('fieldDescription')}</label>
                <textarea id={`edit-description-${club.id}`} value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />
              </div>
              <div className="field">
                <label htmlFor={`edit-host-${club.id}`}>{t('fieldHostName')}</label>
                <input id={`edit-host-${club.id}`} value={editHostName} onChange={(e) => setEditHostName(e.target.value)} />
              </div>
              <div className="field">
                <label htmlFor={`edit-category-${club.id}`}>{t('fieldCategory')}</label>
                <select id={`edit-category-${club.id}`} value={editCategoryId} onChange={(e) => setEditCategoryId(e.target.value)}>
                  <option value="">{t('none')}</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.documentId}>{c.name}</option>
                  ))}
                </select>
              </div>
              {editError && <p className="error-text">{editError}</p>}
              <div className="btn-row">
                <button className="btn btn-primary" type="submit" disabled={saving}>{t('clubsSaveEdit')}</button>
                <button className="btn" type="button" onClick={() => setEditingClubId(null)}>{t('cancel')}</button>
              </div>
            </form>
          );
        }

        return (
          <div className="card" key={m.id}>
            <h2>{club?.name ?? ''}</h2>
            <div className="card-meta">
              <span className="badge leader">{isLeader ? t('roleLeader') : t('roleMember')}</span>
              {m.joinedDate && <span className="muted">{t('sinceDate', { date: new Date(m.joinedDate).toLocaleDateString() })}</span>}
            </div>
            {club?.description && <BlocksRenderer content={club.description} />}
            <div className="btn-row">
              <button className="btn btn-small btn-danger" onClick={() => leave(m)}>{t('clubsLeave')}</button>
              {isLeader && club && (
                <button className="btn btn-small" onClick={() => startEdit(club)}>{t('clubsEdit')}</button>
              )}
            </div>

            {isLeader && m.club?.documentId && rosters[m.club.documentId] && (
              <div style={{ marginTop: 16 }}>
                <h3 style={{ fontSize: 14 }}>{t('roster')}</h3>
                {rosters[m.club.documentId]
                  .filter((row) => row.documentId !== m.documentId)
                  .map((row) => (
                    <div key={row.id} className="card-meta" style={{ marginBottom: 8 }}>
                      <span className="badge leader">{row.role === 'leader' ? t('roleLeader') : t('roleMember')}</span>
                      <span className="muted">{row.joinedDate ? t('sinceDate', { date: new Date(row.joinedDate).toLocaleDateString() }) : ''}</span>
                      {row.role === 'member' && (
                        <button className="btn btn-small" onClick={() => promote(row)}>{t('promoteToLeader')}</button>
                      )}
                      <button className="btn btn-small btn-danger" onClick={() => removeMember(row)}>{t('remove')}</button>
                    </div>
                  ))}
                {rosters[m.club.documentId].filter((row) => row.documentId !== m.documentId).length === 0 && (
                  <p className="muted">{t('noOtherMembers')}</p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
