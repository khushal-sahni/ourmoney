import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type ReactElement
} from 'react';
import { AboutPage } from './components/about-page';
import { ChatPanel, type IChatMessage } from './components/chat-panel';
import { ExplorerShell, useExplorerPanes } from './components/explorer-shell';
import { FlowCanvas } from './components/flow-canvas';
import { ChatIcon, DraftIcon, InfoIcon, MapIcon, ShareIcon, TableIcon } from './components/ui-icons';
import {
  buildInformationRequestDraft,
  buildShareText,
  InformationRequestPanel
} from './components/information-request';
import { LandingOverlay } from './components/landing-overlay';
import { ThemeToggle } from './components/theme-toggle';
import { GOLDEN_PATH, LANDING_STORAGE_KEY } from './constants/golden-path';
import { DEFAULT_SCHEME_ID } from './data/fixtures/catalog';
import type { IPlaceEntry } from './data/place-index';
import { SyntheticScenarioSource } from './data/fixtures/synthetic-scenario.source';
import type { ExplainLocale } from './domain/explain-types';
import { citizenStanding } from './domain/citizen-standing';
import {
  reconciliationChipClass,
  reconciliationFlagSummary,
  reconciliationStatusLabel
} from './domain/reconciliation-display';
import type {
  IFundingNode,
  IReconciliation,
  ISchemeScenario,
  ISchemeSummary,
  ITransfer,
  ReconciliationStatus
} from './domain/fund-flow';
import { bodyKindLabel, schemeKindDescription } from './domain/fund-flow';
import {
  computeSchemeMetrics,
  ledgerRows,
  pathFor,
  type HierarchyMode
} from './domain/flow-hierarchy';
import { ExplainService, templateNarration } from './services/explain.service';
import { LedgerService } from './services/ledger.service';
import { formatCrore, formatPaiseFull, percentOf } from './utils/money';

const ledgerService = new LedgerService(new SyntheticScenarioSource());
const explainService = new ExplainService(ledgerService);

type AppPage = 'explorer' | 'about';

function readPageFromHash(): AppPage {
  return window.location.hash === '#about' ? 'about' : 'explorer';
}

export function App(): ReactElement {
  const [page, setPage] = useState<AppPage>(readPageFromHash);

  useEffect(() => {
    const onHashChange = (): void => setPage(readPageFromHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    document.body.classList.toggle('route-about', page === 'about');
    return () => document.body.classList.remove('route-about');
  }, [page]);

  const goAbout = useCallback((): void => {
    window.location.hash = 'about';
    setPage('about');
  }, []);

  const goExplorer = useCallback((): void => {
    window.location.hash = '';
    setPage('explorer');
  }, []);

  if (page === 'about') {
    return <AboutPage onBack={goExplorer} />;
  }

  return <ExplorerApp onAbout={goAbout} />;
}

function ExplorerApp({ onAbout }: { onAbout: () => void }): ReactElement {
  const [catalog, setCatalog] = useState<readonly ISchemeSummary[]>([]);
  const [schemeId, setSchemeId] = useState(DEFAULT_SCHEME_ID);
  const [scenario, setScenario] = useState<ISchemeScenario>();
  const [selectedId, setSelectedId] = useState<string>(GOLDEN_PATH.nodeId);
  const [branchFocusId, setBranchFocusId] = useState<string>(GOLDEN_PATH.nodeId);
  const [query, setQuery] = useState('');
  const [view, setView] = useState<'flow' | 'ledger'>('flow');
  const [hierarchyMode, setHierarchyMode] = useState<HierarchyMode>('auto');
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobileLayout, setIsMobileLayout] = useState(false);
  const panes = useExplorerPanes();
  const expandInspector = panes.inspector.expand;
  const expandChat = panes.chat.expand;
  const [showLanding, setShowLanding] = useState(
    () => localStorage.getItem(LANDING_STORAGE_KEY) !== '1'
  );
  const [chatOpen, setChatOpen] = useState(false);
  const [chatLocale, setChatLocale] = useState<ExplainLocale>('en');
  const [chatMessages, setChatMessages] = useState<readonly IChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [highlightPathIds, setHighlightPathIds] = useState<readonly string[]>([]);
  const [narration, setNarration] = useState<string>('');
  const [narrationSource, setNarrationSource] = useState<'model' | 'template' | 'backup' | ''>('');
  const [narrationLoading, setNarrationLoading] = useState(false);
  const [infoRequestOpen, setInfoRequestOpen] = useState(false);
  const switcherRef = useRef<HTMLDivElement>(null);
  const pendingFocusRef = useRef<string | null>(null);

  useEffect(() => {
    void ledgerService.loadCatalog().then(setCatalog);
  }, []);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 850px)');
    const sync = (): void => setIsMobileLayout(media.matches);
    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    void ledgerService.load(schemeId).then((next) => {
      const focusId = pendingFocusRef.current ?? next.defaultFocusNodeId;
      pendingFocusRef.current = null;
      setScenario(next);
      setSelectedId(focusId);
      setBranchFocusId(focusId);
      setHierarchyMode('auto');
      setQuery('');
      setMenuOpen(false);
      setChatOpen(false);
      setChatMessages([]);
      setHighlightPathIds([]);
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

  useEffect(() => {
    if (!chatOpen && !infoRequestOpen) return;
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key !== 'Escape') return;
      if (infoRequestOpen) setInfoRequestOpen(false);
      else setChatOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [chatOpen, infoRequestOpen]);

  useEffect(() => {
    if (!chatOpen) return;
    expandInspector();
    expandChat();
  }, [chatOpen, expandInspector, expandChat]);

  const focusNode = useCallback((nodeId: string): void => {
    setSelectedId(nodeId);
    setBranchFocusId(nodeId);
    setView('flow');
    setHierarchyMode('auto');
    setHighlightPathIds([]);
  }, []);

  const dismissLanding = useCallback((): void => {
    localStorage.setItem(LANDING_STORAGE_KEY, '1');
    setShowLanding(false);
  }, []);

  const openGoldenPath = useCallback((): void => {
    pendingFocusRef.current = GOLDEN_PATH.nodeId;
    setSchemeId(GOLDEN_PATH.schemeId);
    expandInspector();
  }, [expandInspector]);

  const selectPlace = useCallback((entry: IPlaceEntry): void => {
    pendingFocusRef.current = entry.nodeId;
    setSchemeId(entry.schemeId);
    setView('flow');
    setHierarchyMode('auto');
    expandInspector();
  }, [expandInspector]);

  const openAsk = useCallback((): void => {
    expandInspector();
    setChatOpen(true);
  }, [expandInspector]);

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
  const standing = useMemo(
    () => (scenario && selected ? citizenStanding(scenario, selected) : undefined),
    [scenario, selected]
  );
  const reconciliationByNodeId = useMemo(() => {
    const map = new Map<string, ReconciliationStatus>();
    if (!scenario) return map;
    for (const entry of scenario.reconciliations) {
      map.set(entry.nodeId, entry.status);
    }
    return map;
  }, [scenario]);
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
  const infoRequestDraft = useMemo(() => {
    if (!scenario || !selected || !standing) return '';
    return buildInformationRequestDraft(scenario, selected, standing, reconciliation);
  }, [scenario, selected, standing, reconciliation]);

  useEffect(() => {
    if (!scenario || !selected) return;
    let cancelled = false;
    const slice = explainService.buildSlice(scenario, selected.id, chatLocale);
    setNarration(templateNarration(slice));
    setNarrationSource('template');
    setNarrationLoading(true);
    void explainService.narrate(slice).then((result) => {
      if (cancelled) return;
      setNarration(result.narration);
      setNarrationSource(result.source);
      setNarrationLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [scenario, selected, chatLocale]);

  const handleAsk = useCallback(async (question: string): Promise<void> => {
    if (!scenario || !selected) return;
    setChatLoading(true);
    setChatMessages((prev) => [...prev, { role: 'user', text: question }]);
    const slice = explainService.buildSlice(scenario, selected.id, chatLocale);
    try {
      const result = await explainService.ask(slice, question);
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: result.answer,
          citedNodeIds: result.citedNodeIds,
          source: result.source
        }
      ]);
      setHighlightPathIds(result.citedNodeIds);
      if (result.citedNodeIds.length > 0) {
        setBranchFocusId(result.citedNodeIds[result.citedNodeIds.length - 1] ?? selected.id);
      }
    } finally {
      setChatLoading(false);
    }
  }, [scenario, selected, chatLocale]);

  const shareStanding = useCallback(async (): Promise<void> => {
    if (!scenario || !selected || !standing) return;
    const text = buildShareText(scenario, selected, standing);
    if (navigator.share) {
      await navigator.share({ title: 'ourmoney standing card', text, url: 'https://ourmoney.fyi' });
      return;
    }
    await navigator.clipboard.writeText(text);
  }, [scenario, selected, standing]);

  if (!scenario || !selected || !metrics || !standing) {
    return <main className="loading">Loading synthetic scenario…</main>;
  }

  const suggestedQuestion = selected.id === GOLDEN_PATH.nodeId
    ? GOLDEN_PATH.suggestedQuestion
    : reconciliation
      ? `Why is this marked ${reconciliationStatusLabel(reconciliation.status).toLowerCase()}?`
      : 'Where did the reported money go from here?';

  return (
    <main className="app-shell">
      {showLanding && (
        <LandingOverlay
          onSelectPlace={selectPlace}
          onOpenGoldenPath={openGoldenPath}
          onDismiss={dismissLanding}
        />
      )}

      <header className="app-header">
        <div className="scheme-switcher" ref={switcherRef}>
          <div className="scheme-switcher-title">
            <span>ourmoney</span>
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
          <button
            type="button"
            className={view === 'flow' ? 'active' : ''}
            onClick={() => setView('flow')}
            aria-label="Flow map"
            title="Flow map"
          >
            <MapIcon />
          </button>
          <button
            type="button"
            className={view === 'ledger' ? 'active' : ''}
            onClick={() => setView('ledger')}
            aria-label="Ledger table"
            title="Ledger table"
          >
            <TableIcon />
          </button>
        </nav>

        <div className="header-actions">
          <button type="button" className="icon-btn header-icon" onClick={onAbout} aria-label="About" title="About">
            <InfoIcon />
          </button>
          <button type="button" className="icon-btn header-icon" onClick={openAsk} aria-label="Ask" title="Ask">
            <ChatIcon />
          </button>
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
                  focusNode(node.id);
                  setQuery('');
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

      <ExplorerShell
        isMobile={isMobileLayout}
        view={view}
        chatOpen={chatOpen}
        panes={panes}
        metricsContent={
          <section className="metrics">
            <Metric label="Received at centre" value={formatCrore(metrics.centralReleasePaise)} />
            <Metric label="Traced onward" value={formatCrore(metrics.tracedOnwardPaise)} tone="gold" />
            <Metric
              label="What's left"
              value={formatCrore(metrics.awaitingDetailsPaise)}
              tone="amber"
              detail={`${metrics.awaitingSharePercent}% of scheme`}
            />
            <p className="metrics-note">
              Independent prototype · all data synthetic
              <span>Double-tap a node to see its immediate branches</span>
            </p>
          </section>
        }
        workspaceContent={
          <>
            {view === 'flow' ? (
              <FlowCanvas
                scenario={scenario}
                selectedId={selectedId}
                branchFocusId={branchFocusId}
                hierarchyMode={hierarchyMode}
                onHierarchyModeChange={setHierarchyMode}
                onSelect={setSelectedId}
                reconciliationByNodeId={reconciliationByNodeId}
                highlightPathIds={highlightPathIds}
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
          </>
        }
        inspectorContent={
          <Inspector
            node={selected}
            reconciliation={reconciliation}
            transfers={ledgerService.transfersFor(scenario, selectedId)}
            scenario={scenario}
            narration={narration}
            narrationLoading={narrationLoading}
            narrationSource={narrationSource}
            onOpenChat={openAsk}
            onDraftRequest={() => setInfoRequestOpen(true)}
            onShare={() => void shareStanding()}
          />
        }
        chatContent={
          <ChatPanel
            locale={chatLocale}
            onLocaleChange={setChatLocale}
            messages={chatMessages}
            loading={chatLoading}
            suggestedQuestion={suggestedQuestion}
            onAsk={(question) => void handleAsk(question)}
            onClose={() => setChatOpen(false)}
          />
        }
      />

      {infoRequestOpen && (
        <InformationRequestPanel
          draft={infoRequestDraft}
          onClose={() => setInfoRequestOpen(false)}
        />
      )}
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
            const nodeStanding = citizenStanding(scenario, node);
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
                <td>{formatCrore(nodeStanding.receivedPaise)}</td>
                <td>
                  {nodeStanding.childCount > 0 ? (
                    <>
                      {formatCrore(nodeStanding.sentOnwardPaise)}
                      <small>{Math.round(percentOf(nodeStanding.sentOnwardPaise, nodeStanding.receivedPaise))}%</small>
                    </>
                  ) : (
                    '—'
                  )}
                </td>
                <td>
                  {nodeStanding.usedHerePaise > 0 ? (
                    <>
                      {formatCrore(nodeStanding.usedHerePaise)}
                      {nodeStanding.usedHereLabel ? <small>{nodeStanding.usedHereLabel}</small> : null}
                    </>
                  ) : (
                    '—'
                  )}
                </td>
                <LedgerOpenCell standing={nodeStanding} />
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
  scenario,
  narration,
  narrationLoading,
  narrationSource,
  onOpenChat,
  onDraftRequest,
  onShare
}: {
  node: IFundingNode;
  reconciliation: IReconciliation | undefined;
  transfers: readonly ITransfer[];
  scenario: ISchemeScenario;
  narration: string;
  narrationLoading: boolean;
  narrationSource: string;
  onOpenChat: () => void;
  onDraftRequest: () => void;
  onShare: () => void;
}): ReactElement {
  const crumbs = pathFor(scenario, node);
  const standing = citizenStanding(scenario, node);
  const sentOnwardPercentage = percentOf(standing.sentOnwardPaise, standing.receivedPaise);
  const levelWord = node.level === 'agency'
    ? scenario.lastMileLabel.toLowerCase()
    : node.level;
  const bodyLabel = bodyKindLabel(node.bodyKind);

  return (
    <article id="node-inspector" className="inspector">
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
      {reconciliation && (
        <p className={`status-chip ${reconciliationChipClass(reconciliation.status)}`}>
          {reconciliationStatusLabel(reconciliation.status)} — {reconciliationFlagSummary(reconciliation)}
        </p>
      )}
      {node.workLabel ? <p className="work-label">{node.workLabel}</p> : null}
      {bodyLabel && bodyLabel !== node.workLabel ? (
        <p className="body-kind">{bodyLabel}</p>
      ) : null}
      <p className="official-name">{node.name}</p>
      <p className="scheme-kind-blurb">{schemeKindDescription(scenario.schemeKind)}</p>

      <section className="ai-narration">
        <h2>Plain-language summary</h2>
        <p>{narration}</p>
        {narrationLoading ? (
          <p className="narration-loading">Reading this ledger…</p>
        ) : null}
        {!narrationLoading && narrationSource === 'template' && (
          <small>Offline summary (API unavailable)</small>
        )}
        {!narrationLoading && narrationSource === 'backup' && (
          <small>Summary via backup model</small>
        )}
      </section>

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
              <p>{item.description}</p>
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

      <div className="inspector-actions">
        <button type="button" className="icon-btn clarify" onClick={onOpenChat} aria-label="Ask about this" title="Ask about this">
          <ChatIcon />
        </button>
        <button type="button" className="icon-btn clarify secondary" onClick={onDraftRequest} aria-label="Draft information request" title="Draft information request">
          <DraftIcon />
        </button>
        <button type="button" className="icon-btn clarify secondary" onClick={onShare} aria-label="Share standing card" title="Share standing card">
          <ShareIcon />
        </button>
      </div>
      <small className="updated">
        Synthetic scenario · reported {node.reportedAt}
        <br />
        {transfers.length} connected transfer{transfers.length === 1 ? '' : 's'} · {scenario.sourceLabel}
      </small>
    </article>
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
