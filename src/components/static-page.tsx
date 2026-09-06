import type { ReactElement, ReactNode } from 'react';

export function StaticPage({
  title,
  lead,
  onBack,
  backLabel = '← Back',
  children,
  badge
}: {
  title: string;
  lead?: string;
  onBack: () => void;
  backLabel?: string;
  children: ReactNode;
  badge?: string;
}): ReactElement {
  return (
    <main className="doc-page">
      <header className="doc-page-header">
        <button type="button" className="doc-page-back" onClick={onBack}>{backLabel}</button>
        {badge ? <p className="doc-page-badge">{badge}</p> : null}
        <h1>{title}</h1>
        {lead ? <p className="doc-page-lead">{lead}</p> : null}
      </header>
      <article className="doc-page-content">
        {children}
      </article>
    </main>
  );
}
