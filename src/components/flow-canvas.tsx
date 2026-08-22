import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent,
  type ReactElement
} from 'react';
import type { ISchemeScenario } from '../domain/fund-flow';
import {
  buildFlowLayout,
  hierarchyOptions,
  type HierarchyMode,
  type IFlowLayoutEdge,
  type IFlowLayoutNode
} from '../domain/flow-hierarchy';
import { formatCrore, percentOf } from '../utils/money';

interface ITransform {
  readonly x: number;
  readonly y: number;
  readonly zoom: number;
}

interface IPoint {
  readonly x: number;
  readonly y: number;
}

const NODE_WIDTH = 240;
const BUTTON_ZOOM_STEP = 1.18;
const FIT_PADDING = 56;
const DOUBLE_TAP_MS = 340;

interface IBranchToggleState {
  readonly collapsedIds: ReadonlySet<string>;
  readonly revealedIds: ReadonlySet<string>;
}

const EMPTY_BRANCH_TOGGLE: IBranchToggleState = {
  collapsedIds: new Set(),
  revealedIds: new Set()
};

export function FlowCanvas({
  scenario,
  selectedId,
  branchFocusId,
  hierarchyMode,
  onHierarchyModeChange,
  onSelect
}: {
  scenario: ISchemeScenario;
  selectedId: string;
  /** Branch used for auto-mode culling; independent of sidebar selection. */
  branchFocusId: string;
  hierarchyMode: HierarchyMode;
  onHierarchyModeChange: (mode: HierarchyMode) => void;
  onSelect: (id: string) => void;
}): ReactElement {
  const stageRef = useRef<HTMLDivElement>(null);
  const transformRef = useRef<ITransform>({ x: 48, y: 36, zoom: 0.82 });
  const [transform, setTransform] = useState<ITransform>(transformRef.current);
  const [branchToggle, setBranchToggle] = useState<IBranchToggleState>(EMPTY_BRANCH_TOGGLE);
  const drag = useRef<{ readonly pointerId: number; readonly point: IPoint; readonly transform: ITransform } | undefined>(undefined);
  const touches = useRef(new Map<number, IPoint>());
  const pinch = useRef<{ readonly distance: number; readonly centre: IPoint; readonly transform: ITransform } | undefined>(undefined);
  const pendingWheel = useRef<{ anchor: IPoint; factor: number } | undefined>(undefined);
  const wheelRaf = useRef<number | undefined>(undefined);
  const lastTapRef = useRef<{ readonly id: string; readonly at: number } | undefined>(undefined);
  const pendingCenterIdRef = useRef<string | undefined>(undefined);
  const bandOptions = useMemo(() => hierarchyOptions(scenario.lastMileLabel), [scenario.lastMileLabel]);

  useEffect(() => {
    setBranchToggle(EMPTY_BRANCH_TOGGLE);
    lastTapRef.current = undefined;
    pendingCenterIdRef.current = undefined;
  }, [scenario.id]);

  const applyTransform = useCallback((next: ITransform | ((current: ITransform) => ITransform)): void => {
    setTransform((current) => {
      const resolved = typeof next === 'function' ? next(current) : next;
      transformRef.current = resolved;
      return resolved;
    });
  }, []);

  const layout = useMemo(
    () => buildFlowLayout(
      scenario,
      hierarchyMode,
      transform.zoom,
      branchFocusId,
      branchToggle.collapsedIds,
      branchToggle.revealedIds
    ),
    [scenario, hierarchyMode, transform.zoom, branchFocusId, branchToggle]
  );
  const schemeTotalPaise = scenario.nodes.find((node) => node.level === 'national')?.receivedPaise
    ?? scenario.nodes[0]?.receivedPaise
    ?? 0;

  const centerOnNode = useCallback((nodeId: string): void => {
    const target = layout.nodes.find((node) => node.fundingNodeId === nodeId && node.kind === 'funding');
    if (!target || !stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const zoom = transformRef.current.zoom;
    applyTransform({
      zoom,
      x: rect.width / 2 - (target.x + NODE_WIDTH / 2) * zoom,
      y: rect.height / 2 - (target.y + 70) * zoom
    });
  }, [applyTransform, layout.nodes]);

  const toggleImmediateChildren = useCallback((nodeId: string): void => {
    const hasChildren = scenario.nodes.some((node) => node.parentId === nodeId);
    if (!hasChildren) return;

    const childVisible = layout.nodes.some((node) => {
      if (node.kind !== 'funding') return false;
      const raw = scenario.nodes.find((candidate) => candidate.id === node.fundingNodeId);
      return raw?.parentId === nodeId;
    });

    pendingCenterIdRef.current = nodeId;
    setBranchToggle((prev) => {
      const collapsedIds = new Set(prev.collapsedIds);
      const revealedIds = new Set(prev.revealedIds);
      if (collapsedIds.has(nodeId) || !childVisible) {
        collapsedIds.delete(nodeId);
        revealedIds.add(nodeId);
      } else {
        collapsedIds.add(nodeId);
        revealedIds.delete(nodeId);
      }
      return { collapsedIds, revealedIds };
    });
  }, [layout.nodes, scenario.nodes]);

  useEffect(() => {
    const nodeId = pendingCenterIdRef.current;
    if (!nodeId) return;
    pendingCenterIdRef.current = undefined;
    centerOnNode(nodeId);
  }, [layout, centerOnNode]);

  const activateNode = useCallback((nodeId: string): void => {
    const now = performance.now();
    const last = lastTapRef.current;
    if (last && last.id === nodeId && now - last.at < DOUBLE_TAP_MS) {
      lastTapRef.current = undefined;
      onSelect(nodeId);
      toggleImmediateChildren(nodeId);
      return;
    }
    lastTapRef.current = { id: nodeId, at: now };
    onSelect(nodeId);
  }, [onSelect, toggleImmediateChildren]);

  const pointFromClient = (clientX: number, clientY: number): IPoint => {
    const rect = stageRef.current?.getBoundingClientRect();
    return { x: clientX - (rect?.left ?? 0), y: clientY - (rect?.top ?? 0) };
  };

  const zoomAt = useCallback((anchor: IPoint, nextZoom: number): void => {
    applyTransform((current) => {
      const zoom = clampZoom(nextZoom);
      const ratio = zoom / current.zoom;
      return {
        zoom,
        x: anchor.x - (anchor.x - current.x) * ratio,
        y: anchor.y - (anchor.y - current.y) * ratio
      };
    });
  }, [applyTransform]);

  const stageCentre = useCallback((): IPoint => {
    const rect = stageRef.current?.getBoundingClientRect();
    return { x: (rect?.width ?? 800) / 2, y: (rect?.height ?? 600) / 2 };
  }, []);

  const zoomByButton = useCallback((direction: 1 | -1): void => {
    const current = transformRef.current;
    const factor = direction > 0 ? BUTTON_ZOOM_STEP : 1 / BUTTON_ZOOM_STEP;
    zoomAt(stageCentre(), current.zoom * factor);
  }, [stageCentre, zoomAt]);

  const fitToView = useCallback((): void => {
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect || layout.nodes.length === 0) return;
    const minX = Math.min(...layout.nodes.map((node) => node.x));
    const minY = Math.min(...layout.nodes.map((node) => node.y));
    const maxX = Math.max(...layout.nodes.map((node) => node.x + NODE_WIDTH));
    const maxY = Math.max(...layout.nodes.map((node) => node.y + 160));
    const contentW = Math.max(1, maxX - minX);
    const contentH = Math.max(1, maxY - minY);
    const zoom = clampZoom(
      Math.min(
        (rect.width - FIT_PADDING * 2) / contentW,
        (rect.height - FIT_PADDING * 2) / contentH
      )
    );
    applyTransform({
      zoom,
      x: rect.width / 2 - ((minX + maxX) / 2) * zoom,
      y: rect.height / 2 - ((minY + maxY) / 2) * zoom
    });
  }, [applyTransform, layout.nodes]);

  const focusSelected = useCallback((): void => {
    const target = layout.nodes.find((node) => node.fundingNodeId === selectedId && node.kind === 'funding');
    if (!target) return;
    const rect = stageRef.current?.getBoundingClientRect();
    const zoom = Math.max(transformRef.current.zoom, 1.05);
    applyTransform({
      zoom,
      x: (rect?.width ?? 800) / 2 - (target.x + NODE_WIDTH / 2) * zoom,
      y: (rect?.height ?? 600) / 2 - (target.y + 70) * zoom
    });
  }, [applyTransform, layout.nodes, selectedId]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const onWheel = (event: WheelEvent): void => {
      // Non-passive listener so we can stop page scroll and browser pinch-zoom.
      event.preventDefault();
      event.stopPropagation();
      const pixels = normalizeWheelDelta(event.deltaY, event.deltaMode);
      const clamped = Math.max(-80, Math.min(80, pixels));
      const factor = Math.exp(-clamped * 0.0016);
      const anchor = {
        x: event.clientX - stage.getBoundingClientRect().left,
        y: event.clientY - stage.getBoundingClientRect().top
      };
      if (pendingWheel.current) {
        pendingWheel.current = {
          anchor,
          factor: pendingWheel.current.factor * factor
        };
      } else {
        pendingWheel.current = { anchor, factor };
      }
      if (wheelRaf.current !== undefined) return;
      wheelRaf.current = requestAnimationFrame(() => {
        const pending = pendingWheel.current;
        pendingWheel.current = undefined;
        wheelRaf.current = undefined;
        if (!pending) return;
        const current = transformRef.current;
        const zoom = clampZoom(current.zoom * pending.factor);
        const ratio = zoom / current.zoom;
        applyTransform({
          zoom,
          x: pending.anchor.x - (pending.anchor.x - current.x) * ratio,
          y: pending.anchor.y - (pending.anchor.y - current.y) * ratio
        });
      });
    };

    const blockBrowserGesture = (event: Event): void => {
      event.preventDefault();
    };

    stage.addEventListener('wheel', onWheel, { passive: false });
    stage.addEventListener('gesturestart', blockBrowserGesture, { passive: false });
    stage.addEventListener('gesturechange', blockBrowserGesture, { passive: false });
    return () => {
      stage.removeEventListener('wheel', onWheel);
      stage.removeEventListener('gesturestart', blockBrowserGesture);
      stage.removeEventListener('gesturechange', blockBrowserGesture);
      if (wheelRaf.current !== undefined) cancelAnimationFrame(wheelRaf.current);
    };
  }, [applyTransform]);

  const onPointerDown = (event: PointerEvent<HTMLDivElement>): void => {
    window.getSelection()?.removeAllRanges();
    if ((event.target as HTMLElement).closest('button, article')) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    const next = pointFromClient(event.clientX, event.clientY);
    touches.current.set(event.pointerId, next);
    if (touches.current.size === 1) {
      drag.current = { pointerId: event.pointerId, point: next, transform: transformRef.current };
    }
    if (touches.current.size === 2) startPinch();
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>): void => {
    const next = pointFromClient(event.clientX, event.clientY);
    if (touches.current.has(event.pointerId)) touches.current.set(event.pointerId, next);

    if (touches.current.size === 2 && pinch.current) {
      const [a, b] = [...touches.current.values()];
      const distance = Math.hypot(a.x - b.x, a.y - b.y);
      const centre = midpoint(a, b);
      const base = pinch.current.transform;
      const zoom = clampZoom(base.zoom * (distance / pinch.current.distance));
      applyTransform({
        zoom,
        x: centre.x - (pinch.current.centre.x - base.x) * (zoom / base.zoom),
        y: centre.y - (pinch.current.centre.y - base.y) * (zoom / base.zoom)
      });
      return;
    }

    if (drag.current?.pointerId === event.pointerId) {
      const start = drag.current;
      applyTransform({
        ...start.transform,
        x: start.transform.x + next.x - start.point.x,
        y: start.transform.y + next.y - start.point.y
      });
    }
  };

  const onPointerEnd = (event: PointerEvent<HTMLDivElement>): void => {
    touches.current.delete(event.pointerId);
    drag.current = undefined;
    pinch.current = undefined;
  };

  const startPinch = (): void => {
    const points = [...touches.current.values()];
    if (points.length < 2) return;
    const [a, b] = points;
    pinch.current = {
      distance: Math.hypot(a.x - b.x, a.y - b.y),
      centre: midpoint(a, b),
      transform: transformRef.current
    };
  };

  useEffect(() => {
    const target = layout.nodes.find((node) => node.fundingNodeId === selectedId && node.kind === 'funding');
    if (!target || !stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const current = transformRef.current;
    const screenX = current.x + (target.x + NODE_WIDTH / 2) * current.zoom;
    const screenY = current.y + (target.y + 70) * current.zoom;
    const padded = 72;
    if (screenX > padded && screenX < rect.width - padded && screenY > padded && screenY < rect.height - padded) {
      return;
    }
    applyTransform({
      ...current,
      x: rect.width / 2 - (target.x + NODE_WIDTH / 2) * current.zoom,
      y: rect.height / 2 - (target.y + 70) * current.zoom
    });
  }, [applyTransform, layout.activeBand, selectedId]);

  return (
    <div
      className="flow-stage"
      ref={stageRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerEnd}
      onPointerCancel={onPointerEnd}
    >
      <div className="canvas-toolbar">
        <div className="hierarchy-switcher" role="group" aria-label="Hierarchy band">
          {bandOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              className={hierarchyMode === option.id ? 'active' : ''}
              onClick={() => onHierarchyModeChange(option.id)}
            >
              {option.label}
            </button>
          ))}
        </div>
        <div className="canvas-band" aria-live="polite">
          <b>{layout.activeBand}</b>
          {hierarchyMode === 'auto' ? <span>auto</span> : null}
        </div>
      </div>

      <div className="map-controls" role="group" aria-label="Map controls">
        <button type="button" className="map-control-btn" onClick={() => zoomByButton(1)} aria-label="Zoom in" title="Zoom in">
          <span aria-hidden="true">+</span>
        </button>
        <button type="button" className="map-control-btn" onClick={() => zoomByButton(-1)} aria-label="Zoom out" title="Zoom out">
          <span aria-hidden="true">−</span>
        </button>
        <button
          type="button"
          className="map-control-btn map-control-fit"
          onClick={fitToView}
          aria-label="Fit map to view"
          title="Fit to view"
        >
          <FitIcon />
        </button>
        <button
          type="button"
          className="map-control-btn map-control-focus"
          onClick={focusSelected}
          aria-label="Focus selected node"
          title="Focus selected"
        >
          <FocusIcon />
        </button>
      </div>

      <div
        className="flow-world"
        style={{
          width: layout.width,
          height: layout.height,
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.zoom})`
        }}
      >
        <svg className="flow-edges" width={layout.width} height={layout.height} aria-hidden="true">
          {layout.edges.map((edge) => {
            const from = layout.nodes.find((node) => node.id === edge.fromId);
            const to = layout.nodes.find((node) => node.id === edge.toId);
            return <FlowEdge key={edge.id} edge={edge} from={from} to={to} />;
          })}
        </svg>

        {layout.nodes.map((node) =>
          node.kind === 'awaiting' ? (
            <AwaitingNode key={node.id} node={node} zoom={transform.zoom} />
          ) : (
            <FlowNode
              key={node.id}
              node={node}
              selected={node.fundingNodeId === selectedId}
              zoom={transform.zoom}
              schemeTotalPaise={schemeTotalPaise}
              onActivate={activateNode}
            />
          )
        )}
      </div>
    </div>
  );
}

function FitIcon(): ReactElement {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M2 6V2h4M10 2h4v4M14 10v4h-4M6 14H2v-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FocusIcon(): ReactElement {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="2.2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 1.5v2.2M8 12.3v2.2M1.5 8h2.2M12.3 8h2.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function FlowEdge({
  edge,
  from,
  to
}: {
  edge: IFlowLayoutEdge;
  from: IFlowLayoutNode | undefined;
  to: IFlowLayoutNode | undefined;
}): ReactElement | null {
  if (!from || !to) return null;
  const sx = from.x + NODE_WIDTH;
  const sy = from.y + 72;
  const ex = to.x;
  const ey = to.y + 72;
  const curve = Math.max(80, (ex - sx) * 0.45);
  const strokeWidth = Math.min(10, Math.max(2.2, edge.amountPaise / 1_000_000_000 * 0.42));
  return (
    <path
      d={`M ${sx} ${sy} C ${sx + curve} ${sy}, ${ex - curve} ${ey}, ${ex} ${ey}`}
      fill="none"
      strokeWidth={strokeWidth}
      className={edge.awaiting ? 'edge edge-awaiting' : 'edge'}
    />
  );
}

function FlowNode({
  node,
  selected,
  zoom,
  schemeTotalPaise,
  onActivate
}: {
  node: IFlowLayoutNode;
  selected: boolean;
  zoom: number;
  schemeTotalPaise: number;
  onActivate: (id: string) => void;
}): ReactElement {
  const compact = zoom < 0.62;
  const dot = zoom < 0.42;
  const share = percentOf(node.amountPaise, schemeTotalPaise);
  const usedHere = node.usedHerePaise ?? 0;
  const leftover = node.leftoverPaise ?? 0;
  const onward = Math.max(0, node.amountPaise - usedHere - leftover);
  const onwardPct = percentOf(onward, node.amountPaise);
  const usedPct = percentOf(usedHere, node.amountPaise);
  const leftoverPct = percentOf(leftover, node.amountPaise);

  return (
    <button
      type="button"
      className={`map-node ${selected ? 'selected' : ''} ${compact ? 'compact' : ''} ${dot ? 'dot-node' : ''}`}
      style={{ left: node.x, top: node.y }}
      onClick={() => onActivate(node.fundingNodeId)}
      onDoubleClick={(event) => event.preventDefault()}
      aria-pressed={selected}
    >
      <div className="node-head">
        <div className="node-head-main">
          <span>{node.levelLabel}</span>
          <strong>{node.label}</strong>
          {!compact && !dot && node.workLabel ? <em className="node-work">{node.workLabel}</em> : null}
        </div>
        {!compact && !dot ? (
          <div className="node-head-meta">
            <em className="node-share">{share.toFixed(1)}%</em>
            {usedHere > 0 ? <em className="node-used-chip">{formatCrore(usedHere)}</em> : null}
          </div>
        ) : null}
      </div>
      {!dot && (
        <>
          <b>{formatCrore(node.amountPaise)}</b>
          <i aria-hidden="true">
            {onwardPct > 0 ? <em className="seg-onward" style={{ width: `${onwardPct}%` }} /> : null}
            {usedPct > 0 ? <em className="seg-used" style={{ width: `${usedPct}%` }} /> : null}
            {leftoverPct > 0 ? <em className="seg-left" style={{ width: `${leftoverPct}%` }} /> : null}
          </i>
        </>
      )}
    </button>
  );
}

function AwaitingNode({ node, zoom }: { node: IFlowLayoutNode; zoom: number }): ReactElement {
  return (
    <article
      className={`awaiting-node ${zoom < 0.62 ? 'compact' : ''}`}
      style={{ left: node.x, top: node.y }}
      aria-label={`Next office not named ${formatCrore(node.amountPaise)}`}
    >
      <span>Next office not named</span>
      <strong>{zoom < 0.45 ? '△' : formatCrore(node.amountPaise)}</strong>
      {zoom >= 0.62 && <p>This slice left the books, but the next office is not in the published record yet.</p>}
    </article>
  );
}

function clampZoom(value: number): number {
  return Math.max(0.34, Math.min(1.75, value));
}

function normalizeWheelDelta(deltaY: number, deltaMode: number): number {
  if (deltaMode === 1) return deltaY * 16;
  if (deltaMode === 2) return deltaY * 400;
  return deltaY;
}

function midpoint(a: IPoint, b: IPoint): IPoint {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}
