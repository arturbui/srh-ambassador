import type { Event } from '../types';
import { useLocale } from '../i18n';

const API_URL = import.meta.env.VITE_API_URL as string;

interface Props {
  event: Event;
}

export default function EventCard({ event }: Props) {
  const { t } = useLocale();

  return (
    <article className="card">
      <h2>{event.name ?? t('untitledEvent')}</h2>

      {event.material.length > 0 && (
        <section>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--grey)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
            {t('materials')}
          </h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {event.material.map((mat) => {
              const fileUrl = mat.file?.url
                ? mat.file.url.startsWith('/')
                  ? `${API_URL}${mat.file.url}`
                  : mat.file.url
                : null;

              return (
                <li key={mat.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ flex: 1 }}>{mat.name ?? 'Unnamed'}</span>
                  {mat.organizerProvided && (
                    <span className="badge">{t('organizerProvided')}</span>
                  )}
                  {fileUrl && (
                    <a href={fileUrl} target="_blank" rel="noreferrer" style={{ fontSize: 13 }}>
                      {t('downloadPlain')}
                    </a>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {event.publishedAt && (
        <p className="muted" style={{ marginTop: 12, marginBottom: 0 }}>
          {new Date(event.publishedAt).toLocaleDateString()}
        </p>
      )}
    </article>
  );
}
