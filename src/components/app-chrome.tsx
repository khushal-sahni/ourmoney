import type { ReactElement } from 'react';
import type { ExplainLocale } from '../domain/explain-types';
import type { AppRoute } from '../app/routing';
import { ThemeToggle } from './theme-toggle';
import { InfoIcon } from './ui-icons';

export function AppChrome({
  route,
  locale,
  onRouteChange,
  onLocaleChange,
  onAbout,
  contextLabel
}: {
  route: AppRoute;
  locale: ExplainLocale;
  onRouteChange: (route: AppRoute) => void;
  onLocaleChange: (locale: ExplainLocale) => void;
  onAbout: () => void;
  contextLabel?: string;
}): ReactElement {
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
          Ask
        </button>
        <button
          type="button"
          className={route === 'explore' ? 'active' : ''}
          onClick={() => onRouteChange('explore')}
          aria-current={route === 'explore' ? 'page' : undefined}
        >
          Explore
        </button>
      </nav>

      <div className="app-chrome-actions">
        <div className="locale-toggle" role="group" aria-label="Answer language">
          <button type="button" className={locale === 'en' ? 'active' : ''} onClick={() => onLocaleChange('en')}>EN</button>
          <button type="button" className={locale === 'hi' ? 'active' : ''} onClick={() => onLocaleChange('hi')}>हि</button>
        </div>
        <button type="button" className="header-link" onClick={onAbout}>
          <InfoIcon />
          <span>About</span>
        </button>
        <ThemeToggle />
      </div>
    </header>
  );
}
