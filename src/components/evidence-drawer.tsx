import type { ReactElement } from 'react';
import type { IEvidenceRecord } from '../domain/evidence';
import type { ISourceCitation } from '../domain/fund-flow';
import { CloseIcon } from './ui-icons';

export function EvidenceDrawer({
  records,
  title,
  sourceCitations,
  onClose
}: {
  records: readonly IEvidenceRecord[];
  title: string;
  sourceCitations?: readonly ISourceCitation[];
  onClose: () => void;
}): ReactElement {
  const synthetic = records.every((record) => record.synthetic);
  const citations = sourceCitations ?? [];
  return (
    <div className="evidence-drawer-backdrop" role="presentation" onClick={onClose}>
      <aside
        className="evidence-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="evidence-drawer-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="evidence-drawer-header">
          <div>
            <p className="evidence-drawer-badge">
              {synthetic ? 'Synthetic record trail' : 'Public record trail'}
            </p>
            <h2 id="evidence-drawer-title">{title}</h2>
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close evidence drawer">
            <CloseIcon />
          </button>
        </header>

        <p className="evidence-drawer-lead">
          {synthetic
            ? 'Every figure below is from a fictional hackathon scenario. This is not live government data.'
            : 'Figures below are reconstructed from a public MGNREGA MIS Financial Statement extract. Independent prototype — not a government product. Verify current totals on the official MIS.'}
        </p>

        {citations.length > 0 ? (
          <section className="evidence-sources" aria-label="Official sources">
            <h3 className="evidence-sources-title">Sources</h3>
            <ul className="evidence-sources-list">
              {citations.map((citation) => (
                <li key={citation.url}>
                  <a
                    href={citation.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {citation.label}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <ul className="evidence-list">
          {records.map((record) => (
            <li key={record.id} className={`evidence-item evidence-${record.kind}`}>
              <div className="evidence-item-head">
                <strong>{record.label}</strong>
                {record.amountDisplay ? <b>{record.amountDisplay}</b> : null}
              </div>
              <p>{record.detail}</p>
              <small>
                {record.reference ? `${record.reference} · ` : ''}
                {record.reportedAt ? `reported ${record.reportedAt} · ` : ''}
                {record.sourceLabel}
                {' · '}
                <em>{record.synthetic ? 'synthetic' : 'public record'}</em>
              </small>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
