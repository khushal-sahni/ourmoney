import { useEffect, useState, type ReactElement } from 'react';
import { useT } from '../i18n/strings';

export function OfflineBanner(): ReactElement | null {
  const t = useT();
  const [offline, setOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const goOffline = (): void => setOffline(true);
    const goOnline = (): void => setOffline(false);
    window.addEventListener('offline', goOffline);
    window.addEventListener('online', goOnline);
    return () => {
      window.removeEventListener('offline', goOffline);
      window.removeEventListener('online', goOnline);
    };
  }, []);

  if (!offline) return null;

  return (
    <div className="offline-banner" role="status">
      {t('offlineBanner')}
    </div>
  );
}
