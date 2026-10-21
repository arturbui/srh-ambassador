import { useState } from 'react';
import { useLocale } from '../i18n';

// Falls back to the text wordmark until frontend/public/logo.png exists —
// see the project README / chat instructions for where to add the file.
export default function Logo() {
  const { t } = useLocale();
  const [broken, setBroken] = useState(false);

  if (broken) {
    return <span className="brand-text">{t('appName')}</span>;
  }

  return <img src="/logo.png" alt={t('appName')} className="brand-logo" onError={() => setBroken(true)} />;
}
