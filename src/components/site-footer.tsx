import type { ReactElement } from 'react';
import type { AppRoute } from '../app/routing';

export function SiteFooter({
  onNavigate,
  labels
}: {
  onNavigate: (route: AppRoute) => void;
  labels: {
    compare: string;
    features: string;
    scale: string;
    about: string;
    disclosure: string;
  };
}): ReactElement {
  return (
    <footer className="site-footer">
      <nav className="site-footer-nav" aria-label="Site">
        <button type="button" onClick={() => onNavigate('compare')}>{labels.compare}</button>
        <button type="button" onClick={() => onNavigate('features')}>{labels.features}</button>
        <button type="button" onClick={() => onNavigate('scale')}>{labels.scale}</button>
        <button type="button" onClick={() => onNavigate('about')}>{labels.about}</button>
      </nav>
      <p className="site-footer-note">{labels.disclosure}</p>
    </footer>
  );
}
