import { useEffect, useState } from 'react';
import { useAuth } from '../auth';
import { useLocale } from '../i18n';
import { createActivity, fetchActivities, fetchClubs, fetchMemberships } from '../api';
import type { Activity, Club, Membership } from '../types';

export default function ActivitiesPage() {
  const { user } = useAuth();
  const { t, locale } = useLocale();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [myClubIds, setMyClubIds] = useState<string[]>([]);
  const [ledClubIds, setLedClubIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [clubId, setClubId] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [capacity, setCapacity] = useState('');
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  function load() {
    setLoading(true);
    setError(null);
    Promise.all([
      fetchActivities(locale),
      fetchClubs(locale),
      user ? fetchMemberships() : Promise.resolve({ data: [] as Membership[] }),
    ])
      .then(([activitiesRes, clubsRes, membershipsRes]) => {
        setActivities(activitiesRes.data);
        setClubs(clubsRes.data);
        const memberClubDocIds = membershipsRes.data
          .map((m) => m.club?.documentId)
          .filter((id): id is string => Boolean(id));
        setMyClubIds(memberClubDocIds);
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
  // Only activities for clubs the viewer actually belongs to — not every club's.
  const myActivities = activities.filter((a) => a.club?.documentId && myClubIds.includes(a.club.documentId));

  async function submitCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setFormError(null);
    try {
      await createActivity({
        title,
        club: clubId,
        date: date ? new Date(date).toISOString() : undefined,
        location: location || undefined,
        capacity: capacity ? Number(capacity) : undefined,
      });
      setTitle('');
      setDate('');
      setLocation('');
      setCapacity('');
      load();
    } catch (err) {
      setFormError((err as Error).message);
    } finally {
      setCreating(false);
    }
  }

  return (
    <div>
      <h1 className="section-title">{t('navActivities')}</h1>

      {loading && <p className="muted">{t('loading')}</p>}
      {error && <p className="error-text">{t('errorPrefix')} {error}</p>}

      {!loading && !error && !user && <p className="muted">{t('activitiesLoginToSee')}</p>}
      {!loading && !error && user && myClubIds.length === 0 && <p className="muted">{t('activitiesJoinToSee')}</p>}
      {!loading && !error && user && myClubIds.length > 0 && myActivities.length === 0 && (
        <p className="muted">{t('activitiesNone')}</p>
      )}

      {myActivities.map((activity) => (
        <div className="card" key={activity.id}>
          <h2>{activity.title}</h2>
          <div className="card-meta">
            <span className="badge">{clubName(activity.club?.documentId)}</span>
            {activity.date && <span className="muted">{new Date(activity.date).toLocaleString()}</span>}
          </div>
          {activity.location && <p className="muted">{activity.location}{activity.building ? `, ${activity.building}` : ''}{activity.room ? ` (${activity.room})` : ''}</p>}
          {activity.capacity != null && <p className="muted">{t('activitiesCapacityLabel', { n: activity.capacity })}</p>}
        </div>
      ))}

      {ledClubs.length > 0 && (
        <>
          <div className="section-heading"><h2>{t('activitiesSchedule')}</h2></div>
          <form className="form card" onSubmit={submitCreate}>
            <div className="field">
              <label htmlFor="activity-club">{t('fieldClub')}</label>
              <select id="activity-club" value={clubId} onChange={(e) => setClubId(e.target.value)} required>
                <option value="">{t('activitiesSelectLedClub')}</option>
                {ledClubs.map((c) => (
                  <option key={c.id} value={c.documentId}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="activity-title">{t('fieldTitle')}</label>
              <input id="activity-title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div className="field">
              <label htmlFor="activity-date">{t('fieldDateTime')}</label>
              <input id="activity-date" type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="activity-location">{t('fieldLocation')}</label>
              <input id="activity-location" value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="activity-capacity">{t('fieldCapacity')}</label>
              <input id="activity-capacity" type="number" min="0" value={capacity} onChange={(e) => setCapacity(e.target.value)} />
            </div>
            {formError && <p className="error-text">{formError}</p>}
            <button className="btn btn-primary" type="submit" disabled={creating}>{t('activitiesCreate')}</button>
          </form>
        </>
      )}

      {user && ledClubs.length === 0 && (
        <p className="muted">{t('activitiesLeadFirst')}</p>
      )}
    </div>
  );
}
