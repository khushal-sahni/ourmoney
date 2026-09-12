import { useEffect, useRef, useState, type ReactElement } from 'react';
import type { ExplainLocale } from '../domain/explain-types';
import type { AppRoute } from '../app/routing';
import { ThemeToggle } from './theme-toggle';
import { DataModeToggle } from './data-mode-toggle';
import { InfoIcon } from './ui-icons';
import { useT } from '../i18n/strings';
import type { DataMode } from '../utils/data-mode';

const SITE_PAGES: readonly AppRoute[] = ['compare', 'features', 'scale', 'about'];

export function AppChrome({
  route,
  locale,
  dataMode,
  onRouteChange,
  onLocaleChange,
  onDataModeChange,
  contextLabel
}: {
  route: AppRoute;
  locale: ExplainLocale;
  dataMode: DataMode;
  onRouteChange: (route: AppRoute) => void;
  onLocaleChange: (locale: ExplainLocale) => void;
  onDataModeChange: (mode: DataMode) => void;
  contextLabel?: string;
}): ReactElement {
  const t = useT();
  const [pagesOpen, setPagesOpen] = useState(false);
  const pagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!pagesOpen) return;
    const onPointerDown = (event: MouseEvent): void => {
      if (pagesRef.current && !pagesRef.current.contains(event.target as Node)) {
        setPagesOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') setPagesOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [pagesOpen]);

  return (
    <header className="app-chrome">
      <div className="app-chrome-brand">
        <span className="app-chrome-wordmark">ourmoney</span>
        {contextLabel ? <span className="app-chrome-context">{contextLabel}</span> : null}
      </div>

      <nav className="mode-switcher" aria-label="Application mode">
        <button
          type="button"
          className={route === 'ask' ? 'active' : ''}
          onClick={() => onRouteChange('ask')}
          aria-current={route === 'ask' ? 'page' : undefined}
        >
          {t('ask')}
        </button>
        <button
          type="button"
          className={route === 'explore' ? 'active' : ''}
          onClick={() => onRouteChange('explore')}
          aria-current={route === 'explore' ? 'page' : undefined}
        >
          {t('explore')}
        </button>
      </nav>

      <div className="app-chrome-actions">
        <div className="locale-toggle" role="group" aria-label={t('language')}>
          <button type="button" className={locale === 'en' ? 'active' : ''} onClick={() => onLocaleChange('en')}>EN</button>
          <button type="button" className={locale === 'hi' ? 'active' : ''} onClick={() => onLocaleChange('hi')}>हि</button>
        </div>
        <DataModeToggle mode={dataMode} onChange={onDataModeChange} />
        <ThemeToggle />
        <div className="chrome-pages" ref={pagesRef}>
          <button
            type="button"
            className={`chrome-pages-trigger${pagesOpen ? ' active' : ''}`}
            onClick={() => setPagesOpen((open) => !open)}
            aria-haspopup="menu"
            aria-expanded={pagesOpen}
            aria-label={t('sitePages')}
            title={t('sitePages')}
          >
            <InfoIcon />
            <span>{t('sitePages')}</span>
          </button>
          {pagesOpen ? (
            <div className="chrome-pages-menu" role="menu" aria-label={t('sitePages')}>
              {SITE_PAGES.map((page) => (
                <button
                  key={page}
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setPagesOpen(false);
                    onRouteChange(page);
                  }}
                >
                  {t(page)}
                </button>
              ))}
              <p className="chrome-pages-note">
                {dataMode === 'live' ? t('footerDisclosureLive') : t('footerDisclosure')}
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
