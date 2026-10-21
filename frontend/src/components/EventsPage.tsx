import { useEffect, useState } from 'react';
import { useAuth } from '../auth';
import { useLocale } from '../i18n';
import { createEvent, deleteEvent, fetchEvents, fetchMyEventIds, updateEvent } from '../api';
import type { Event } from '../types';
import EventCard from './EventCard';

export default function EventsPage() {
  const { user } = useAuth();
  const { t, locale } = useLocale();
  const isAmbassador = user?.role?.type === 'ambassador';
  const [events, setEvents] = useState<Event[]>([]);
  const [myEventIds, setMyEventIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  function load() {
    setLoading(true);
    setError(null);
    Promise.all([
      fetchEvents(locale),
      // Only Ambassadors have the `event.mine` permission — anyone else
      // hitting it 403s, which would otherwise sink the whole events list.
      isAmbassador ? fetchMyEventIds() : Promise.resolve(new Set<string>()),
    ])
      .then(([eventsRes, mine]) => {
        setEvents(eventsRes.data);
        setMyEventIds(mine);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(load, [locale, user]);

  async function submitCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setFormError(null);
    try {
      await createEvent({ name });
      setName('');
      load();
    } catch (err) {
      setFormError((err as Error).message);
    } finally {
      setCreating(false);
    }
  }

  async function saveRename(documentId: string) {
    try {
      await updateEvent(documentId, { name: editingName });
    } catch {
      // Ignore — the list simply won't change if this failed.
    }
    setEditingId(null);
    load();
  }

  async function remove(documentId: string) {
    try {
      await deleteEvent(documentId);
    } catch {
      // Ignore — the list simply won't change if this failed.
    }
    load();
  }

  return (
    <div>
      <h1 className="section-title">{t('navEvents')}</h1>

      {loading && <p className="muted">{t('loading')}</p>}
      {error && <p className="error-text">{t('errorPrefix')} {error}</p>}

      {!loading && !error && events.length === 0 && <p className="muted">{t('eventsNone')}</p>}

      {events.map((event) => {
        const isMine = myEventIds.has(event.documentId);
        return (
          <div key={event.id}>
            <EventCard event={event} />
            {isMine && (
              <div className="btn-row" style={{ marginTop: -12, marginBottom: 16 }}>
                {editingId === event.documentId ? (
                  <>
                    <input value={editingName} onChange={(e) => setEditingName(e.target.value)} style={{ minHeight: 36 }} />
                    <button className="btn btn-small btn-primary" onClick={() => saveRename(event.documentId)}>{t('save')}</button>
                    <button className="btn btn-small" onClick={() => setEditingId(null)}>{t('cancel')}</button>
                  </>
                ) : (
                  <>
                    <button className="btn btn-small" onClick={() => { setEditingId(event.documentId); setEditingName(event.name ?? ''); }}>{t('rename')}</button>
                    <button className="btn btn-small btn-danger" onClick={() => remove(event.documentId)}>{t('delete')}</button>
                  </>
                )}
              </div>
            )}
          </div>
        );
      })}

      {isAmbassador && (
        <>
          <div className="section-heading"><h2>{t('eventsHost')}</h2></div>
          <form className="form card" onSubmit={submitCreate}>
            <div className="field">
              <label htmlFor="event-name">{t('fieldName')}</label>
              <input id="event-name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            {formError && <p className="error-text">{formError}</p>}
            <button className="btn btn-primary" type="submit" disabled={creating}>{t('eventsCreate')}</button>
          </form>
        </>
      )}

      {user && !isAmbassador && (
        <p className="muted">{t('eventsAmbassadorOnly')}</p>
      )}
    </div>
  );
}
