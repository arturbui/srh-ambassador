import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth';
import { useLocale } from '../i18n';
import type { TranslationKey } from '../i18n';
import AuthPanel from './AuthPanel';

interface DemoProfile {
  email: string;
  password: string;
  labelKey: TranslationKey;
  descKey: TranslationKey;
}

// Matches srh-ambassador/src/bootstrap/demo-accounts.ts — local dev demo
// accounts seeded on every server boot, not treated as secret.
const DEMO_PROFILES: DemoProfile[] = [
  { email: 'demo-student@example.com', password: 'DemoPass123!', labelKey: 'demoStudentLabel', descKey: 'demoStudentDesc' },
  { email: 'demo-leader@example.com', password: 'DemoPass123!', labelKey: 'demoLeaderLabel', descKey: 'demoLeaderDesc' },
  { email: 'demo-editor@example.com', password: 'DemoPass123!', labelKey: 'demoEditorLabel', descKey: 'demoEditorDesc' },
  { email: 'demo-ambassador@example.com', password: 'DemoPass123!', labelKey: 'demoAmbassadorLabel', descKey: 'demoAmbassadorDesc' },
];

export default function LoginPage() {
  const { login } = useAuth();
  const { t } = useLocale();
  const navigate = useNavigate();
  const [loadingEmail, setLoadingEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loginAsDemo(profile: DemoProfile) {
    setLoadingEmail(profile.email);
    setError(null);
    try {
      await login(profile.email, profile.password);
      navigate('/');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoadingEmail(null);
    }
  }

  return (
    <div>
      <h1 className="section-title">{t('loginPageTitle')}</h1>

      <div className="section-heading"><h2>{t('demoProfilesHeading')}</h2></div>
      <p className="muted">{t('demoProfilesSubtext')}</p>

      {error && <p className="error-text">{error}</p>}

      {DEMO_PROFILES.map((profile) => (
        <button
          key={profile.email}
          className="card"
          style={{ textAlign: 'left', width: '100%', cursor: 'pointer', border: '1px solid var(--border)', font: 'inherit', display: 'block' }}
          onClick={() => loginAsDemo(profile)}
          disabled={loadingEmail !== null}
        >
          <h2>{t(profile.labelKey)}</h2>
          <p className="muted" style={{ marginBottom: 0 }}>{t(profile.descKey)}</p>
        </button>
      ))}

      <div className="section-heading"><h2>{t('orManualLogin')}</h2></div>
      <AuthPanel />
    </div>
  );
}
