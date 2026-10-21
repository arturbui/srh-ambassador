import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../auth';
import { useLocale } from '../i18n';
import type { Locale } from '../types';
import Logo from './Logo';
import UserBadges from './UserBadges';

const LOCALE_LABEL: Record<Locale, string> = {
  en: 'EN',
  'de-DE': 'DE',
};

function HeaderAuth() {
  const { user, loading, logout } = useAuth();
  const { t } = useLocale();

  if (loading) {
    return null;
  }

  if (!user) {
    return <Link to="/login" className="btn btn-small">{t('navLogin')}</Link>;
  }

  return (
    <div className="btn-row" style={{ flexWrap: 'nowrap' }}>
      <strong>{user.username}</strong>
      <UserBadges user={user} />
      <button className="btn btn-small" onClick={logout}>{t('authLogOut')}</button>
    </div>
  );
}

export default function Layout() {
  const { t, locale, setLocale } = useLocale();

  const navItems = [
    { to: '/', label: t('navHome'), end: true },
    { to: '/news', label: t('navNews'), end: false },
    { to: '/events', label: t('navEvents'), end: false },
    { to: '/clubs', label: t('navClubs'), end: false },
    { to: '/activities', label: t('navActivities'), end: false },
    { to: '/documents', label: t('navDocuments'), end: false },
    { to: '/membership', label: t('navMembership'), end: false },
  ];

  return (
    <div className="page">
      <header className="topbar">
        <Link to="/" className="brand-link">
          <Logo />
        </Link>

        <div className="btn-row" style={{ flexWrap: 'nowrap', alignItems: 'center' }}>
          <HeaderAuth />
          <div className="locale-switch" role="group" aria-label={t('language')}>
            {(['en', 'de-DE'] as Locale[]).map((l) => (
              <button
                key={l}
                onClick={() => setLocale(l)}
                aria-pressed={locale === l}
                className={locale === l ? 'locale-btn active' : 'locale-btn'}
              >
                {LOCALE_LABEL[l]}
              </button>
            ))}
          </div>
        </div>
      </header>

      <nav className="tabs">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => (isActive ? 'tab-btn active' : 'tab-btn')}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <Outlet />
    </div>
  );
}
