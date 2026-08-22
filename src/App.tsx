import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent as ReactMouseEvent, type ReactElement } from 'react';
import { FlowCanvas } from './components/flow-canvas';
import { ThemeToggle } from './components/theme-toggle';
import { DEFAULT_SCHEME_ID } from './data/fixtures/catalog';
import { SyntheticScenarioSource } from './data/fixtures/synthetic-scenario.source';
import type {
  IFundingNode,
  IReconciliation,
  ISchemeScenario,
  ISchemeSummary,
  ITransfer
} from './domain/fund-flow';
import { citizenStanding } from './domain/citizen-standing';
import { bodyKindLabel, schemeKindDescription } from './domain/fund-flow';
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
  const [catalog, setCatalog] = useState<readonly ISchemeSummary[]>([]);
  const [schemeId, setSchemeId] = useState(DEFAULT_SCHEME_ID);
  const [scenario, setScenario] = useState<ISchemeScenario>();
  const [selectedId, setSelectedId] = useState('piprahi-paani');
  /** Stable branch used by auto layout; tap/select only updates the sidebar. */
  const [branchFocusId, setBranchFocusId] = useState('piprahi-paani');
  const [query, setQuery] = useState('');
  const [view, setView] = useState<'flow' | 'ledger'>('flow');
  const [hierarchyMode, setHierarchyMode] = useState<HierarchyMode>('auto');
  const [menuOpen, setMenuOpen] = useState(false);
  const switcherRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    void ledgerService.loadCatalog().then(setCatalog);
  }, []);

  useEffect(() => {
    void ledgerService.load(schemeId).then((next) => {
      setScenario(next);
      setSelectedId(next.defaultFocusNodeId);
      setBranchFocusId(next.defaultFocusNodeId);
      setHierarchyMode('auto');
      setQuery('');
      setMenuOpen(false);
    });
  }, [schemeId]);

  useEffect(() => {
    if (!menuOpen) return;
    const onPointerDown = (event: MouseEvent): void => {
      if (switcherRef.current && !switcherRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [menuOpen]);

  const selectScheme = useCallback((id: string): void => {
    setSchemeId(id);
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
    () => scenario?.nodes.filter((node) => {
      const hay = `${node.name} ${node.shortName} ${node.workLabel ?? ''}`.toLowerCase();
      return hay.includes(query.toLowerCase());
    }) ?? [],
    [scenario, query]
  );
  const metrics = useMemo(
    () => (scenario ? computeSchemeMetrics(scenario) : undefined),
    [scenario]
  );
  const activeSummary = catalog.find((entry) => entry.id === schemeId);

  if (!scenario || !selected || !metrics) {
    return <main className="loading">Loading synthetic scenario…</main>;
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <div className="scheme-switcher" ref={switcherRef}>
          <div className="scheme-switcher-title">
            <span>Scheme explorer</span>
            <button
              type="button"
              aria-label="Scheme"
              aria-expanded={menuOpen}
              aria-haspopup="listbox"
              onClick={() => setMenuOpen((open) => !open)}
            >
              {scenario.schemeName}
              <b>{menuOpen ? '⌃' : '⌄'}</b>
            </button>
          </div>
          <em>{scenario.period}</em>
          {activeSummary && <em className="kind-chip">{activeSummary.kindLabel}</em>}
          {menuOpen && (
            <div className="scheme-menu" role="listbox" aria-label="Synthetic schemes">
              {catalog.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  role="option"
                  aria-selected={entry.id === schemeId}
                  className={entry.id === schemeId ? 'active' : ''}
                  onClick={() => selectScheme(entry.id)}
                >
                  <strong>{entry.schemeName}</strong>
                  <span>{entry.kindLabel}</span>
                  <em>{entry.schemeCode}</em>
                </button>
              ))}
            </div>
          )}
        </div>

        <nav className="view-switcher" aria-label="Workspace view">
          <button type="button" className={view === 'flow' ? 'active' : ''} onClick={() => setView('flow')}>
            Flow map
          </button>
          <button type="button" className={view === 'ledger' ? 'active' : ''} onClick={() => setView('ledger')}>
            Ledger table
          </button>
        </nav>

        <div className="header-actions">
          <ThemeToggle />
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
        </div>

        {query && (
          <div className="search-results" role="listbox">
            {matches.length ? matches.map((node) => (
              <button
                key={node.id}
                type="button"
                role="option"
                onClick={() => {
                  setSelectedId(node.id);
                  setBranchFocusId(node.id);
                  setQuery('');
                  setView('flow');
                  if (node.level === 'agency' || node.level === 'block' || node.level === 'district') {
                    setHierarchyMode('auto');
                  }
                }}
              >
                <span>{node.level === 'agency' ? scenario.lastMileLabel.toLowerCase() : node.level}</span>
                {node.shortName}
                {node.workLabel ? ` · ${node.workLabel}` : ''}
                <b>{formatCrore(node.receivedPaise)}</b>
              </button>
            )) : <p>No matching record</p>}
          </div>
        )}
      </header>

      <section className="metrics">
        <Metric label="Received at centre" value={formatCrore(metrics.centralReleasePaise)} />
        <Metric label="Traced onward" value={formatCrore(metrics.tracedOnwardPaise)} tone="gold" />
        <Metric
          label="What's left"
          value={formatCrore(metrics.awaitingDetailsPaise)}
          tone="amber"
          detail={`${metrics.awaitingSharePercent}% of scheme`}
        />
        <p>
          What’s left = Received − sent onward − used here on the centre row. Used here is this office’s allowed own spend.
          Open a row for the one-line explanation. Independent prototype · all figures synthetic.
        </p>
      </section>

      <section className="workbench">
        <div className="workspace">
          {view === 'flow' ? (
            <FlowCanvas
              scenario={scenario}
              selectedId={selectedId}
              branchFocusId={branchFocusId}
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
              <span><i /> Received</span>
              <span><i className="used" /> Used here</span>
              <span><i className="amber" /> Next office not named</span>
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
  const byParent = useMemo(() => {
    const map = new Map<string, IFundingNode[]>();
    for (const node of scenario.nodes) {
      if (!node.parentId) continue;
      const list = map.get(node.parentId) ?? [];
      list.push(node);
      map.set(node.parentId, list);
    }
    return map;
  }, [scenario.nodes]);

  const roots = useMemo(
    () => scenario.nodes.filter((node) => !node.parentId),
    [scenario.nodes]
  );

  const [expanded, setExpanded] = useState<ReadonlySet<string>>(() => new Set());

  useEffect(() => {
    setExpanded(() => {
      const next = new Set<string>();
      for (const root of scenario.nodes.filter((node) => !node.parentId)) {
        next.add(root.id);
      }
      const selected = scenario.nodes.find((node) => node.id === selectedId);
      if (selected) {
        for (const step of pathFor(scenario, selected)) {
          if (step.id !== selected.id) next.add(step.id);
        }
      }
      return next;
    });
  }, [scenario]);

  useEffect(() => {
    const selected = scenario.nodes.find((node) => node.id === selectedId);
    if (!selected) return;
    setExpanded((prev) => {
      let changed = false;
      const next = new Set(prev);
      for (const step of pathFor(scenario, selected)) {
        if (step.id === selected.id) continue;
        if (!next.has(step.id)) {
          next.add(step.id);
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [scenario, selectedId]);

  const rows = useMemo(() => {
    const q = query.trim();
    if (q) return ledgerRows(scenario, q);

    const ordered: IFundingNode[] = [];
    const walk = (node: IFundingNode): void => {
      ordered.push(node);
      if (!expanded.has(node.id)) return;
      for (const child of byParent.get(node.id) ?? []) walk(child);
    };
    for (const root of roots) walk(root);
    return ordered;
  }, [scenario, query, expanded, byParent, roots]);

  const depthOf = (node: IFundingNode): number => pathFor(scenario, node).length - 1;
  const levelLabel = (node: IFundingNode): string =>
    node.level === 'agency' ? scenario.lastMileLabel.toLowerCase() : node.level;
  const searching = query.trim().length > 0;

  const toggleExpanded = (nodeId: string, event: ReactMouseEvent<HTMLButtonElement>): void => {
    event.stopPropagation();
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) next.delete(nodeId);
      else next.add(nodeId);
      return next;
    });
  };

  return (
    <div className="ledger-wrap">
      <table>
        <thead>
          <tr>
            <th>Node</th>
            <th>Received</th>
            <th>Sent onward</th>
            <th>Used here</th>
            <th>What&apos;s left</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((node) => {
            const childCount = byParent.get(node.id)?.length ?? 0;
            const isBranch = childCount > 0;
            const isOpen = searching || expanded.has(node.id);
            const standing = citizenStanding(scenario, node);
            return (
              <tr
                key={node.id}
                className={node.id === selectedId ? 'selected' : ''}
                onClick={() => onSelect(node.id)}
              >
                <td style={{ paddingLeft: `${12 + depthOf(node) * 18}px` }}>
                  <div className="ledger-node">
                    {isBranch ? (
                      <button
                        type="button"
                        className={`ledger-toggle ${isOpen ? 'open' : ''}`}
                        aria-expanded={isOpen}
                        aria-label={isOpen ? `Collapse ${node.shortName}` : `Expand ${node.shortName}`}
                        title={isOpen ? 'Hide constituent nodes' : 'Show constituent nodes'}
                        onClick={(event) => toggleExpanded(node.id, event)}
                      >
                        <span aria-hidden="true">▸</span>
                      </button>
                    ) : (
                      <span className="ledger-toggle-spacer" aria-hidden="true" />
                    )}
                    <div className="ledger-node-copy">
                      <strong>{node.shortName}</strong>
                      <span>
                        {levelLabel(node)}
                        {node.workLabel ? ` · ${node.workLabel}` : ''}
                        {isBranch && !searching ? ` · ${childCount}` : ''}
                      </span>
                    </div>
                  </div>
                </td>
                <td>{formatCrore(standing.receivedPaise)}</td>
                <td>
                  {standing.childCount > 0 ? (
                    <>
                      {formatCrore(standing.sentOnwardPaise)}
                      <small>{Math.round(percentOf(standing.sentOnwardPaise, standing.receivedPaise))}%</small>
                    </>
                  ) : (
                    '—'
                  )}
                </td>
                <td>
                  {standing.usedHerePaise > 0 ? (
                    <>
                      {formatCrore(standing.usedHerePaise)}
                      {standing.usedHereLabel ? <small>{standing.usedHereLabel}</small> : null}
                    </>
                  ) : (
                    '—'
                  )}
                </td>
                <LedgerOpenCell standing={standing} />
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function LedgerOpenCell({
  standing
}: {
  standing: ReturnType<typeof citizenStanding>;
}): ReactElement {
  if (standing.ledgerOpenKind === 'none') {
    return <td>—</td>;
  }
  return (
    <td className={standing.ledgerOpenKind === 'next-unnamed' ? 'amber-text' : ''}>
      {formatCrore(standing.ledgerOpenPaise)}
      <small>{standing.ledgerHint}</small>
    </td>
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
  const standing = citizenStanding(scenario, node);
  const sentOnwardPercentage = percentOf(standing.sentOnwardPaise, standing.receivedPaise);
  const levelWord = node.level === 'agency'
    ? scenario.lastMileLabel.toLowerCase()
    : node.level;
  const bodyLabel = bodyKindLabel(node.bodyKind);

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
      <span className="node-level">{levelWord}</span>
      <h1>{node.shortName}</h1>
      {node.workLabel ? <p className="work-label">{node.workLabel}</p> : null}
      {bodyLabel && bodyLabel !== node.workLabel ? (
        <p className="body-kind">{bodyLabel}</p>
      ) : null}
      <p className="official-name">{node.name}</p>
      <p className="scheme-kind-blurb">{schemeKindDescription(scenario.schemeKind)}</p>
      <p>
        {node.level === 'national'
          ? 'Programme-level release in this synthetic scenario.'
          : `${levelWord[0].toUpperCase()}${levelWord.slice(1)}-level record receiving funds under this scheme.`}
      </p>
      {scenario.centreSharePaise !== undefined && scenario.stateSharePaise !== undefined && node.level === 'national' ? (
        <p className="share-note">
          Matching pattern (synthetic): centre {formatCrore(scenario.centreSharePaise)} · state {formatCrore(scenario.stateSharePaise)}.
        </p>
      ) : null}

      <section>
        <h2>Financial standing</h2>
        <FinancialBar label="Received here" value={formatCrore(standing.receivedPaise)} percent={100} />
        {standing.childCount > 0 || standing.sentOnwardPaise > 0 ? (
          <FinancialBar
            label="Sent onward"
            value={formatCrore(standing.sentOnwardPaise)}
            percent={sentOnwardPercentage}
            soft
          />
        ) : null}
        {standing.showUsedHereBar ? (
          <FinancialBar
            label={standing.usedHereLabel ? `Used here · ${standing.usedHereLabel}` : 'Used here'}
            value={formatCrore(standing.usedHerePaise)}
            percent={percentOf(standing.usedHerePaise, standing.receivedPaise)}
            used
          />
        ) : null}
        {standing.ledgerOpenKind === 'still-on-books' ? (
          <FinancialBar
            label="Still on this ledger"
            value={formatCrore(standing.ledgerOpenPaise)}
            percent={percentOf(standing.ledgerOpenPaise, standing.receivedPaise)}
          />
        ) : null}
        {standing.showUnnamedBar ? (
          <FinancialBar
            label="Next office not named"
            value={formatCrore(standing.ledgerOpenPaise)}
            percent={percentOf(standing.ledgerOpenPaise, standing.receivedPaise)}
            amber
          />
        ) : null}
        <p className="standing-summary">{standing.inspectorSummary}</p>
        {standing.usedHereRemark ? <p className="used-here-remark">{standing.usedHereRemark}</p> : null}
        <p className="full-amount">Received in full · {formatPaiseFull(node.receivedPaise)}</p>
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

      {transfers.length > 0 && (
        <section className="transfer-list">
          <h2>Connected transfers</h2>
          {transfers.map((transfer) => (
            <div key={transfer.id}>
              <span>
                {transfer.reference}
                {transfer.component ? ` · ${transfer.component}` : ''}
              </span>
              <b>{formatCrore(transfer.amountPaise)}</b>
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
  amber,
  used
}: {
  label: string;
  value: string;
  percent: number;
  soft?: boolean;
  amber?: boolean;
  used?: boolean;
}): ReactElement {
  return (
    <div className="financial-bar">
      <div>
        <span>{label}</span>
        <b>{value}</b>
      </div>
      <i>
        <em
          className={`${soft ? 'soft' : ''} ${amber ? 'amber' : ''} ${used ? 'used' : ''}`}
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </i>
      <small>{percent}% of allocation</small>
    </div>
  );
}
