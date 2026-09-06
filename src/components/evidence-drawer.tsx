import type { ReactElement } from 'react';
import type { IEvidenceRecord } from '../domain/evidence';
import { CloseIcon } from './ui-icons';

export function EvidenceDrawer({
  records,
  title,
  onClose
}: {
  records: readonly IEvidenceRecord[];
  title: string;
  onClose: () => void;
}): ReactElement {
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
            <p className="evidence-drawer-badge">Synthetic record trail</p>
            <h2 id="evidence-drawer-title">{title}</h2>
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close evidence drawer">
            <CloseIcon />
          </button>
        </header>

        <p className="evidence-drawer-lead">
          Every figure below is from a fictional hackathon scenario. This is not live government data.
        </p>

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
                <em>synthetic</em>
              </small>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
