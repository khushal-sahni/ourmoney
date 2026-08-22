import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent,
  type ReactElement,
  type WheelEvent
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

export function FlowCanvas({
  scenario,
  selectedId,
  hierarchyMode,
  onHierarchyModeChange,
  onSelect
}: {
  scenario: ISchemeScenario;
  selectedId: string;
  hierarchyMode: HierarchyMode;
  onHierarchyModeChange: (mode: HierarchyMode) => void;
  onSelect: (id: string) => void;
}): ReactElement {
  const stageRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState<ITransform>({ x: 48, y: 36, zoom: 0.82 });
  const drag = useRef<{ readonly pointerId: number; readonly point: IPoint; readonly transform: ITransform } | undefined>(undefined);
  const touches = useRef(new Map<number, IPoint>());
  const pinch = useRef<{ readonly distance: number; readonly centre: IPoint; readonly transform: ITransform } | undefined>(undefined);
  const bandOptions = useMemo(() => hierarchyOptions(scenario.lastMileLabel), [scenario.lastMileLabel]);

  const layout = useMemo(
    () => buildFlowLayout(scenario, hierarchyMode, transform.zoom, selectedId),
    [scenario, hierarchyMode, transform.zoom, selectedId]
  );
  const schemeTotalPaise = scenario.nodes.find((node) => node.level === 'national')?.receivedPaise
    ?? scenario.nodes[0]?.receivedPaise
    ?? 0;

  const pointFromClient = (clientX: number, clientY: number): IPoint => {
    const rect = stageRef.current?.getBoundingClientRect();
    return { x: clientX - (rect?.left ?? 0), y: clientY - (rect?.top ?? 0) };
  };

  const zoomAt = (anchor: IPoint, nextZoom: number): void => {
    setTransform((current) => {
      const zoom = clampZoom(nextZoom);
      const ratio = zoom / current.zoom;
      return {
        zoom,
        x: anchor.x - (anchor.x - current.x) * ratio,
        y: anchor.y - (anchor.y - current.y) * ratio
      };
    });
  };

  const onWheel = (event: WheelEvent<HTMLDivElement>): void => {
    event.preventDefault();
    const factor = event.deltaY > 0 ? 0.9 : 1.1;
    zoomAt(pointFromClient(event.clientX, event.clientY), transform.zoom * factor);
  };

  const onPointerDown = (event: PointerEvent<HTMLDivElement>): void => {
    if ((event.target as HTMLElement).closest('button, article')) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    const next = pointFromClient(event.clientX, event.clientY);
    touches.current.set(event.pointerId, next);
    if (touches.current.size === 1) {
      drag.current = { pointerId: event.pointerId, point: next, transform };
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
      setTransform({
        zoom,
        x: centre.x - (pinch.current.centre.x - base.x) * (zoom / base.zoom),
        y: centre.y - (pinch.current.centre.y - base.y) * (zoom / base.zoom)
      });
      return;
    }

    if (drag.current?.pointerId === event.pointerId) {
      const start = drag.current;
      setTransform({
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
      transform
    };
  };

  const focusSelected = (): void => {
    const target = layout.nodes.find((node) => node.fundingNodeId === selectedId && node.kind === 'funding');
    if (!target) return;
    const rect = stageRef.current?.getBoundingClientRect();
    const zoom = Math.max(transform.zoom, 1.05);
    setTransform({
      zoom,
      x: (rect?.width ?? 800) / 2 - (target.x + NODE_WIDTH / 2) * zoom,
      y: (rect?.height ?? 600) / 2 - (target.y + 70) * zoom
    });
  };

  useEffect(() => {
    // Keep the selected node framed when hierarchy band changes.
    const target = layout.nodes.find((node) => node.fundingNodeId === selectedId && node.kind === 'funding');
    if (!target || !stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const screenX = transform.x + (target.x + NODE_WIDTH / 2) * transform.zoom;
    const screenY = transform.y + (target.y + 70) * transform.zoom;
    const padded = 72;
    if (screenX > padded && screenX < rect.width - padded && screenY > padded && screenY < rect.height - padded) {
      return;
    }
    setTransform((current) => ({
      ...current,
      x: rect.width / 2 - (target.x + NODE_WIDTH / 2) * current.zoom,
      y: rect.height / 2 - (target.y + 70) * current.zoom
    }));
  }, [layout.activeBand, selectedId]);

  return (
    <div
      className="flow-stage"
      ref={stageRef}
      onWheel={onWheel}
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
        <div className="canvas-help">
          <span>
            Showing <b>{layout.activeBand}</b>
            {hierarchyMode === 'auto' ? ' · auto from zoom' : ''}
          </span>
          <span>Scroll to zoom · drag to pan · pinch on trackpad/touch</span>
          <button type="button" onClick={focusSelected}>
            Focus selected
          </button>
        </div>
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
              onSelect={onSelect}
            />
          )
        )}
      </div>
    </div>
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
  onSelect
}: {
  node: IFlowLayoutNode;
  selected: boolean;
  zoom: number;
  schemeTotalPaise: number;
  onSelect: (id: string) => void;
}): ReactElement {
  const compact = zoom < 0.62;
  const dot = zoom < 0.42;
  const reported = node.reportedPaise ?? node.amountPaise;
  const share = percentOf(node.amountPaise, schemeTotalPaise);

  return (
    <button
      type="button"
      className={`map-node ${selected ? 'selected' : ''} ${compact ? 'compact' : ''} ${dot ? 'dot-node' : ''}`}
      style={{ left: node.x, top: node.y }}
      onClick={() => onSelect(node.fundingNodeId)}
      aria-pressed={selected}
    >
      <span>{node.levelLabel}</span>
      <strong>{node.label}</strong>
      {!dot && (
        <>
          <b>{formatCrore(node.amountPaise)}</b>
          {!compact && <em className="node-share">{share.toFixed(1)}%</em>}
          <i>
            <em style={{ width: `${percentOf(reported, node.amountPaise)}%` }} />
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
      aria-label={`Awaiting details ${formatCrore(node.amountPaise)}`}
    >
      <span>Awaiting details</span>
      <strong>{zoom < 0.45 ? '△' : formatCrore(node.amountPaise)}</strong>
      {zoom >= 0.62 && <p>Onward split not yet published — a data gap, not a verdict.</p>}
    </article>
  );
}

function clampZoom(value: number): number {
  return Math.max(0.34, Math.min(1.75, value));
}

function midpoint(a: IPoint, b: IPoint): IPoint {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}
