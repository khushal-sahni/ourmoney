import { useEffect, useMemo, useState, type ReactElement } from 'react';
import { FlowCanvas } from './components/flow-canvas';
import { SyntheticScenarioSource } from './data/fixtures/synthetic-scenario.source';
import type { IFundingNode, IReconciliation, ISchemeScenario, ITransfer } from './domain/fund-flow';
import {
  computeSchemeMetrics,
  ledgerRows,
  pathFor,
  type HierarchyMode
} from './domain/flow-hierarchy';
import { LedgerService } from './services/ledger.service';
import { formatCrore, formatPaiseFull, percentOf } from './utils/money';

const ledgerService = new LedgerService(new SyntheticScenarioSource());

export function App(): ReactElement {
  const [scenario, setScenario] = useState<ISchemeScenario>();
  const [selectedId, setSelectedId] = useState('nadi');
  const [query, setQuery] = useState('');
  const [view, setView] = useState<'flow' | 'ledger'>('flow');
  const [hierarchyMode, setHierarchyMode] = useState<HierarchyMode>('auto');

  useEffect(() => {
    void ledgerService.load().then(setScenario);
  }, []);

  const selected = useMemo(
    () => (scenario ? ledgerService.findNode(scenario, selectedId) : undefined),
    [scenario, selectedId]
  );
  const reconciliation = useMemo(
    () => (scenario ? ledgerService.reconciliationFor(scenario, selectedId) : undefined),
    [scenario, selectedId]
  );
  const matches = useMemo(
    () => scenario?.nodes.filter((node) => node.name.toLowerCase().includes(query.toLowerCase())
      || node.shortName.toLowerCase().includes(query.toLowerCase())) ?? [],
    [scenario, query]
  );
  const metrics = useMemo(
    () => (scenario ? computeSchemeMetrics(scenario) : undefined),
    [scenario]
  );

  if (!scenario || !selected || !metrics) {
    return <main className="loading">Loading synthetic scenario…</main>;
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <div className="scheme-switcher">
          <span>Scheme explorer</span>
          <button type="button" aria-label="Scheme">
            {scenario.schemeName}
            <b>⌄</b>
          </button>
          <em>{scenario.period}</em>
        </div>

        <nav className="view-switcher" aria-label="Workspace view">
          <button type="button" className={view === 'flow' ? 'active' : ''} onClick={() => setView('flow')}>
            Flow map
          </button>
          <button type="button" className={view === 'ledger' ? 'active' : ''} onClick={() => setView('ledger')}>
            Ledger table
          </button>
        </nav>

        <label className="search">
          <span aria-hidden="true">⌕</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search a state, district…"
            aria-label="Search funding nodes"
          />
          <kbd>⌘ K</kbd>
        </label>

        {query && (
          <div className="search-results" role="listbox">
            {matches.length ? matches.map((node) => (
              <button
                key={node.id}
                type="button"
                role="option"
                onClick={() => {
                  setSelectedId(node.id);
                  setQuery('');
                  setView('flow');
                  if (node.level === 'agency' || node.level === 'district') {
                    setHierarchyMode('auto');
                  }
                }}
              >
                <span>{node.level}</span>
                {node.name}
                <b>{formatCrore(node.receivedPaise)}</b>
              </button>
            )) : <p>No matching record</p>}
          </div>
        )}
      </header>

      <section className="metrics">
        <Metric label="Central release" value={formatCrore(metrics.centralReleasePaise)} />
        <Metric label="Traced onward" value={formatCrore(metrics.tracedOnwardPaise)} tone="gold" />
        <Metric
          label="Awaiting details"
          value={formatCrore(metrics.awaitingDetailsPaise)}
          tone="amber"
          detail={`${metrics.awaitingSharePercent}% of scheme`}
        />
        <p>
          Amber marks money whose onward destination is not yet published — a data gap, not a verdict.
          Independent hackathon prototype · all figures synthetic.
        </p>
      </section>

      <section className="workbench">
        <div className="workspace">
          {view === 'flow' ? (
            <FlowCanvas
              scenario={scenario}
              selectedId={selectedId}
              hierarchyMode={hierarchyMode}
              onHierarchyModeChange={setHierarchyMode}
              onSelect={setSelectedId}
            />
          ) : (
            <LedgerTable
              scenario={scenario}
              selectedId={selectedId}
              query={query}
              onSelect={setSelectedId}
            />
          )}

          <div className="workspace-footer">
            <div className="breadcrumbs">
              {pathFor(scenario, selected).map((node) => (
                <button key={node.id} type="button" onClick={() => setSelectedId(node.id)}>
                  {node.shortName}
                </button>
              ))}
            </div>
            <div className="legend">
              <span><i /> Allocated</span>
              <span><i className="amber" /> Awaiting details</span>
            </div>
          </div>
        </div>

        <Inspector
          node={selected}
          reconciliation={reconciliation}
          transfers={ledgerService.transfersFor(scenario, selectedId)}
          scenario={scenario}
        />
      </section>
    </main>
  );
}

function Metric({
  label,
  value,
  tone,
  detail
}: {
  label: string;
  value: string;
  tone?: string;
  detail?: string;
}): ReactElement {
  return (
    <div>
      <span>{label}</span>
      <strong className={tone}>{value}</strong>
      {detail && <em>{detail}</em>}
    </div>
  );
}

function LedgerTable({
  scenario,
  selectedId,
  query,
  onSelect
}: {
  scenario: ISchemeScenario;
  selectedId: string;
  query: string;
  onSelect: (id: string) => void;
}): ReactElement {
  const rows = ledgerRows(scenario, query);
  const depthOf = (node: IFundingNode): number => pathFor(scenario, node).length - 1;

  return (
    <div className="ledger-wrap">
      <table>
        <thead>
          <tr>
            <th>Node</th>
            <th>Allocated</th>
            <th>Disbursed</th>
            <th>Awaiting</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((node) => (
            <tr
              key={node.id}
              className={node.id === selectedId ? 'selected' : ''}
              onClick={() => onSelect(node.id)}
            >
              <td style={{ paddingLeft: `${20 + depthOf(node) * 18}px` }}>
                <strong>{node.shortName}</strong>
                <span>{node.level}</span>
              </td>
              <td>{formatCrore(node.receivedPaise)}</td>
              <td>
                {formatCrore(node.reportedPaise)}
                <small>{Math.round(percentOf(node.reportedPaise, node.receivedPaise))}%</small>
              </td>
              <td className={node.unpublishedPaise ? 'amber-text' : ''}>
                {node.unpublishedPaise ? formatCrore(node.unpublishedPaise) : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Inspector({
  node,
  reconciliation,
  transfers,
  scenario
}: {
  node: IFundingNode;
  reconciliation: IReconciliation | undefined;
  transfers: readonly ITransfer[];
  scenario: ISchemeScenario;
}): ReactElement {
  const crumbs = pathFor(scenario, node);
  const reportedPercentage = percentOf(node.reportedPaise, node.receivedPaise);

  return (
    <aside className="inspector">
      <div className="crumb-text">
        {crumbs.map((step, index) => (
          <span key={step.id}>
            {index > 0 ? ' / ' : ''}
            {index === crumbs.length - 1 ? <b>{step.shortName}</b> : step.shortName}
          </span>
        ))}
      </div>
      <span className="node-level">{node.level}</span>
      <h1>{node.shortName}</h1>
      <p>
        {node.level === 'national'
          ? 'Programme-level release in this synthetic scenario.'
          : `${node.level[0].toUpperCase()}${node.level.slice(1)}-level record receiving funds under this scheme.`}
      </p>

      <section>
        <h2>Financial standing</h2>
        <FinancialBar label="Allocated to this node" value={formatCrore(node.receivedPaise)} percent={100} />
        <FinancialBar
          label="Reported disbursed"
          value={formatCrore(node.reportedPaise)}
          percent={reportedPercentage}
          soft
        />
        {node.unpublishedPaise ? (
          <FinancialBar
            label="Awaiting onward details"
            value={formatCrore(node.unpublishedPaise)}
            percent={percentOf(node.unpublishedPaise, node.receivedPaise)}
            amber
          />
        ) : null}
        <p className="full-amount">Allocation in full · {formatPaiseFull(node.receivedPaise)}</p>
      </section>

      {reconciliation && (
        <section className="reason">
          <h2>Reported status</h2>
          {reconciliation.items.map((item) => (
            <div key={item.label}>
              <span>{item.label}</span>
              <b>{formatCrore(item.amountPaise)}</b>
            </div>
          ))}
        </section>
      )}

      <button type="button" className="clarify">View record explanation</button>
      <small className="updated">
        Synthetic scenario · reported {node.reportedAt}
        <br />
        {transfers.length} connected transfer{transfers.length === 1 ? '' : 's'} · {scenario.sourceLabel}
      </small>
    </aside>
  );
}

function FinancialBar({
  label,
  value,
  percent,
  soft,
  amber
}: {
  label: string;
  value: string;
  percent: number;
  soft?: boolean;
  amber?: boolean;
}): ReactElement {
  return (
    <div className="financial-bar">
      <div>
        <span>{label}</span>
        <b>{value}</b>
      </div>
      <i>
        <em className={`${soft ? 'soft' : ''} ${amber ? 'amber' : ''}`} style={{ width: `${Math.min(percent, 100)}%` }} />
      </i>
      <small>{percent}% of allocation</small>
    </div>
  );
}
