import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth';
import { useLocale } from '../i18n';

// Pure login/register form — lives on the /login page now, not embedded in
// every page's header. See UserBadges + Layout for the logged-in state.
export default function AuthPanel() {
  const { login, register } = useAuth();
  const { t } = useLocale();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(username, email, password);
      }
      navigate('/');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="card">
      <h3>{mode === 'login' ? t('authLogIn') : t('authCreateAccount')}</h3>
      <form className="form" onSubmit={submit}>
        {mode === 'register' && (
          <div className="field">
            <label htmlFor="username">{t('authUsername')}</label>
            <input id="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
          </div>
        )}
        <div className="field">
          <label htmlFor="email">{t('authEmail')}</label>
          <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="field">
          <label htmlFor="password">{t('authPassword')}</label>
          <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
        </div>
        {error && <p className="error-text">{error}</p>}
        <div className="btn-row">
          <button className="btn btn-primary" type="submit" disabled={submitting}>
            {mode === 'login' ? t('authLogIn') : t('authRegister')}
          </button>
          <button
            type="button"
            className="toggle-link"
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(null); }}
          >
            {mode === 'login' ? t('authNeedAccount') : t('authHaveAccount')}
          </button>
        </div>
      </form>
    </div>
  );
}
