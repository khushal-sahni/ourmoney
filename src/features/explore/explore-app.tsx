import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type ReactElement
} from 'react';
import { navigateTo } from '../../app/routing';
import { useSession } from '../../app/session-context';
import { AppChrome } from '../../components/app-chrome';
import { BottomSheet } from '../../components/bottom-sheet';
import { ChatPanel } from '../../components/chat-panel';
import { EvidenceDrawer } from '../../components/evidence-drawer';
import { ExplorerShell, useExplorerPanes } from '../../components/explorer-shell';
import { FlowCanvas } from '../../components/flow-canvas';
import { ChatIcon, ChevronDownIcon, DetailsIcon, DraftIcon, MapIcon, ShareIcon, TableIcon } from '../../components/ui-icons';
import { buildShareText } from '../../components/information-request';
import { GOLDEN_PATH } from '../../constants/golden-path';
import { SyntheticScenarioSource } from '../../data/fixtures/synthetic-scenario.source';
import { citizenStanding } from '../../domain/citizen-standing';
import { buildEvidenceBundle } from '../../domain/evidence';
import {
  reconciliationChipClass,
  reconciliationFlagSummary,
  reconciliationStatusLabel
} from '../../domain/reconciliation-display';
import type {
  IFundingNode,
  IReconciliation,
  ISchemeScenario,
  ISchemeSummary,
  ITransfer,
  ReconciliationStatus
} from '../../domain/fund-flow';
import { bodyKindLabel, schemeKindDescription } from '../../domain/fund-flow';
import {
  computeSchemeMetrics,
  ledgerRows,
  pathFor,
  type HierarchyMode
} from '../../domain/flow-hierarchy';
import { useT } from '../../i18n/strings';
import { ExplainService, formatCitationLabels, templateNarration } from '../../services/explain.service';
import { LedgerService } from '../../services/ledger.service';
import { formatCrore, formatPaiseFull, percentOf } from '../../utils/money';

const ledgerService = new LedgerService(new SyntheticScenarioSource());
const explainService = new ExplainService(ledgerService);

export function ExploreView(): ReactElement {
  const session = useSession();
  const t = useT();
  const [catalog, setCatalog] = useState<readonly ISchemeSummary[]>([]);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [scenario, setScenario] = useState<ISchemeScenario>();
  const [scenarioError, setScenarioError] = useState<string | null>(null);
  const [scenarioLoading, setScenarioLoading] = useState(true);
  const schemeId = session.schemeId;
  const selectedId = session.selectedId;
  const [branchFocusId, setBranchFocusId] = useState<string>(session.selectedId);
  const [query, setQuery] = useState('');
  const [view, setView] = useState<'flow' | 'ledger'>('flow');
  const [hierarchyMode, setHierarchyMode] = useState<HierarchyMode>('auto');
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobileLayout, setIsMobileLayout] = useState(false);
  const panes = useExplorerPanes();
  const expandInspector = panes.inspector.expand;
  const expandChat = panes.chat.expand;
  const [chatOpen, setChatOpen] = useState(false);
  const [inspectorSheetOpen, setInspectorSheetOpen] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatFollowUps, setChatFollowUps] = useState<readonly string[]>([]);
  const [narration, setNarration] = useState<string>('');
  const [narrationSource, setNarrationSource] = useState<'model' | 'template' | 'backup' | ''>('');
  const [narrationLoading, setNarrationLoading] = useState(false);
  const [evidenceOpen, setEvidenceOpen] = useState(false);
  const switcherRef = useRef<HTMLDivElement>(null);
  const pendingFocusRef = useRef<string | null>(null);

  useEffect(() => {
    setBranchFocusId(session.selectedId);
  }, [session.selectedId]);

  useEffect(() => {
    void ledgerService.loadCatalog()
      .then((entries) => {
        setCatalog(entries);
        setCatalogError(null);
      })
      .catch(() => setCatalogError('Could not load scheme catalog.'));
  }, []);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 850px)');
    const sync = (): void => {
      const mobile = media.matches;
      setIsMobileLayout(mobile);
      if (!mobile) {
        setInspectorSheetOpen(false);
      }
    };
    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setScenarioLoading(true);
    setScenarioError(null);
    void ledgerService.load(schemeId)
      .then((next) => {
        if (cancelled) return;
        const preferred = pendingFocusRef.current ?? session.selectedId;
        pendingFocusRef.current = null;
        // Node ids are scheme-local; keep selection only when it exists in the new tree.
        const focusId = preferred && next.nodes.some((node) => node.id === preferred)
          ? preferred
          : next.defaultFocusNodeId;
        setScenario(next);
        session.setSelectedId(focusId);
        setBranchFocusId(focusId);
        setHierarchyMode('auto');
        setQuery('');
        setMenuOpen(false);
        setChatOpen(false);
        setInspectorSheetOpen(false);
        setScenarioLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setScenarioError('Could not load synthetic scenario.');
        setScenarioLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    if (!chatOpen) return;
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') setChatOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [chatOpen]);

  useEffect(() => {
    if (!chatOpen || isMobileLayout) return;
    expandInspector();
    expandChat();
  }, [chatOpen, isMobileLayout, expandInspector, expandChat]);

  const focusNode = useCallback((nodeId: string): void => {
    session.setSelectedId(nodeId);
    setBranchFocusId(nodeId);
    setView('flow');
    setHierarchyMode('auto');
    session.setHighlightPathIds([]);
  }, [session]);

  const openAsk = useCallback((): void => {
    if (isMobileLayout) {
      setInspectorSheetOpen(false);
      setChatOpen(true);
      return;
    }
    expandInspector();
    setChatOpen(true);
  }, [expandInspector, isMobileLayout]);

  const openInspectorSheet = useCallback((): void => {
    setChatOpen(false);
    setInspectorSheetOpen(true);
  }, []);

  const closeInspectorSheet = useCallback((): void => {
    setInspectorSheetOpen(false);
  }, []);

  const closeChat = useCallback((): void => {
    setChatOpen(false);
  }, []);

  const selectScheme = useCallback((id: string): void => {
    if (id === schemeId) {
      setMenuOpen(false);
      return;
    }
    const entry = catalog.find((item) => item.id === id);
    const focusId = entry?.defaultFocusNodeId;
    if (focusId) pendingFocusRef.current = focusId;
    session.setHighlightPathIds([]);
    session.setSchemeId(id);
    navigateTo('explore', { schemeId: id, nodeId: focusId });
  }, [catalog, schemeId, session]);

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

  useEffect(() => {
    if (!scenario || !selected) return;
    let cancelled = false;
    const slice = explainService.buildSlice(scenario, selected.id, session.chatLocale);
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
  }, [scenario, selected, session.chatLocale]);

  const handleAsk = useCallback(async (question: string): Promise<void> => {
    if (!scenario || !selected) return;
    setChatLoading(true);
    setChatFollowUps([]);
    session.setChatMessages((prev) => [...prev, { role: 'user', text: question }]);
    const slice = explainService.buildAskSlice(scenario, selected.id, question, session.chatLocale);
    try {
      const result = await explainService.ask(slice, question);
      session.setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: result.answer,
          citedNodeIds: result.citedNodeIds,
          citedNodeLabels: formatCitationLabels(slice, result.citedNodeIds),
          source: result.source,
          schemeId: scenario.id,
          scenario
        }
      ]);
      session.setHighlightPathIds(result.citedNodeIds);
      setChatFollowUps(result.followUps);
      if (result.citedNodeIds.length > 0) {
        setBranchFocusId(result.citedNodeIds[result.citedNodeIds.length - 1] ?? selected.id);
      }
    } finally {
      setChatLoading(false);
    }
  }, [scenario, selected, session]);

  const shareStanding = useCallback(async (): Promise<void> => {
    if (!scenario || !selected || !standing) return;
    const text = buildShareText(scenario, selected, standing);
    if (navigator.share) {
      await navigator.share({ title: 'ourmoney standing card', text, url: 'https://ourmoney.fyi' });
      return;
    }
    await navigator.clipboard.writeText(text);
  }, [scenario, selected, standing]);

  if (catalogError) {
    return (
      <main className="loading error-state">
        <p>{catalogError}</p>
        <button type="button" onClick={() => window.location.reload()}>Retry</button>
        <button type="button" onClick={() => session.setRoute('about')}>About</button>
      </main>
    );
  }

  if (scenarioError) {
    return (
      <main className="loading error-state">
        <p>{scenarioError}</p>
        <button type="button" onClick={() => void ledgerService.load(schemeId).then(setScenario)}>Retry</button>
        <button type="button" onClick={() => session.setRoute('about')}>About</button>
      </main>
    );
  }

  if (scenarioLoading || !scenario || !selected || !metrics || !standing) {
    return (
      <main className="app-shell explore-loading">
        <div className="skeleton-header" />
        <div className="skeleton-metrics" />
        <div className="skeleton-workspace" />
        <p className="loading-hint">Loading synthetic scenario…</p>
      </main>
    );
  }

  const suggestedQuestion = selected.id === GOLDEN_PATH.nodeId
    ? GOLDEN_PATH.suggestedQuestion
    : reconciliation
      ? `Why is this marked ${reconciliationStatusLabel(reconciliation.status).toLowerCase()}?`
      : 'Where did the reported money go from here?';

  const evidenceRecords = buildEvidenceBundle(
    scenario,
    selected,
    ledgerService.transfersFor(scenario, selectedId),
    reconciliation
  );

  return (
    <main className="app-shell">
      <AppChrome
        route="explore"
        locale={session.chatLocale}
        onRouteChange={session.setRoute}
        onLocaleChange={session.setChatLocale}
        contextLabel={scenario.schemeName}
      />

      <header className="app-header explore-subheader">
        <div className="scheme-switcher" ref={switcherRef}>
          <div className="scheme-switcher-title">
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
          >
            <MapIcon />
            <span className="view-label-full">Flow map</span>
            <span className="view-label-short">Map</span>
          </button>
          <button
            type="button"
            className={view === 'ledger' ? 'active' : ''}
            onClick={() => setView('ledger')}
          >
            <TableIcon />
            <span className="view-label-full">Ledger table</span>
            <span className="view-label-short">Ledger</span>
          </button>
        </nav>

        <div className="header-actions">
          <button type="button" className="header-link" onClick={() => openAsk()}>
            <ChatIcon />
            <span>Ask</span>
          </button>
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
        chatOpen={!isMobileLayout && chatOpen}
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
                onSelect={session.setSelectedId}
                reconciliationByNodeId={reconciliationByNodeId}
                highlightPathIds={session.highlightPathIds}
              />
            ) : (
              <LedgerTable
                scenario={scenario}
                selectedId={selectedId}
                query={query}
                onSelect={session.setSelectedId}
              />
            )}
            <div className="workspace-footer">
              <div className="breadcrumbs">
                {pathFor(scenario, selected).map((node) => (
                  <button key={node.id} type="button" onClick={() => session.setSelectedId(node.id)}>
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
            onOpenChat={() => openAsk()}
            onDraftRequest={() => session.openRti(schemeId, selectedId)}
            onShare={() => void shareStanding()}
            onShowEvidence={() => setEvidenceOpen(true)}
          />
        }
        chatContent={
          <ChatPanel
            locale={session.chatLocale}
            onLocaleChange={session.setChatLocale}
            messages={session.chatMessages}
            loading={chatLoading}
            suggestedQuestion={suggestedQuestion}
            followUps={chatFollowUps}
            onAsk={(question) => void handleAsk(question)}
            onClose={closeChat}
            onCollapse={panes.chat.collapse}
            collapseIcon={<ChevronDownIcon />}
            onRequestRecords={(scheme, node) => session.openRti(scheme, node)}
            activeSchemeId={schemeId}
          />
        }
      />

      {isMobileLayout ? (
        <button
          type="button"
          className="inspector-cta"
          onClick={openInspectorSheet}
        >
          <DetailsIcon />
          <span>
            <strong>{selected.shortName}</strong>
            {t('viewDetails')}
          </span>
        </button>
      ) : null}

      {isMobileLayout && inspectorSheetOpen ? (
        <BottomSheet title={selected.shortName} onClose={closeInspectorSheet}>
          <Inspector
            node={selected}
            reconciliation={reconciliation}
            transfers={ledgerService.transfersFor(scenario, selectedId)}
            scenario={scenario}
            narration={narration}
            narrationLoading={narrationLoading}
            narrationSource={narrationSource}
            onOpenChat={() => openAsk()}
            onDraftRequest={() => session.openRti(schemeId, selectedId)}
            onShare={() => void shareStanding()}
            onShowEvidence={() => setEvidenceOpen(true)}
          />
        </BottomSheet>
      ) : null}

      {isMobileLayout && chatOpen ? (
        <BottomSheet title={t('ask')} onClose={closeChat} labelledBy="explore-chat-sheet-title">
          <ChatPanel
            locale={session.chatLocale}
            onLocaleChange={session.setChatLocale}
            messages={session.chatMessages}
            loading={chatLoading}
            suggestedQuestion={suggestedQuestion}
            followUps={chatFollowUps}
            onAsk={(question) => void handleAsk(question)}
            onClose={closeChat}
            onRequestRecords={(scheme, node) => session.openRti(scheme, node)}
            activeSchemeId={schemeId}
          />
        </BottomSheet>
      ) : null}

      {evidenceOpen && (
        <EvidenceDrawer
          records={evidenceRecords}
          title={selected.shortName}
          onClose={() => setEvidenceOpen(false)}
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
  onShare,
  onShowEvidence
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
  onShowEvidence: () => void;
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
        <button type="button" className="clarify" onClick={onOpenChat}>
          <ChatIcon />
          <span>Ask about this</span>
        </button>
        <button type="button" className="clarify secondary" onClick={onShowEvidence}>
          <span>View evidence</span>
        </button>
        <button type="button" className="clarify secondary" onClick={onDraftRequest}>
          <DraftIcon />
          <span>Request records</span>
        </button>
        <button type="button" className="clarify secondary" onClick={onShare}>
          <ShareIcon />
          <span>Share</span>
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
