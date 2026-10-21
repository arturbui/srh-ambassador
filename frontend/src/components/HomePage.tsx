import { Link } from 'react-router-dom';
import { useLocale } from '../i18n';

export default function HomePage() {
  const { t } = useLocale();

  return (
    <section className="hero">
      <h1>{t('heroHeadline')}</h1>
      <p>{t('heroSubtext')}</p>
      <div className="hero-actions">
        <Link to="/clubs" className="btn btn-primary">{t('heroCtaClubs')}</Link>
        <Link to="/events" className="btn">{t('heroCtaEvents')}</Link>
      </div>
    </section>
  );
}
