import type { IFundingNode, ISchemeScenario, NodeLevel } from './fund-flow';

export type HierarchyMode =
  | 'auto'
  | 'national-state'
  | 'state-district'
  | 'district-block'
  | 'block-agency'
  | 'full';

export function hierarchyOptions(lastMileLabel: string): readonly { readonly id: HierarchyMode; readonly label: string }[] {
  return [
    { id: 'auto', label: 'Auto' },
    { id: 'national-state', label: 'National → State' },
    { id: 'state-district', label: 'State → District' },
    { id: 'district-block', label: 'District → Block' },
    { id: 'block-agency', label: `Block → ${lastMileLabel}` },
    { id: 'full', label: 'Full tree' }
  ];
}

/** @deprecated Prefer hierarchyOptions(scenario.lastMileLabel). */
export const HIERARCHY_OPTIONS = hierarchyOptions('Agency');

const LEVEL_ORDER: readonly NodeLevel[] = ['national', 'state', 'district', 'block', 'agency'];

export interface ISchemeMetrics {
  readonly centralReleasePaise: number;
  readonly tracedOnwardPaise: number;
  readonly awaitingDetailsPaise: number;
  readonly awaitingSharePercent: number;
}

export interface IFlowLayoutNode {
  readonly id: string;
  readonly kind: 'funding' | 'awaiting';
  readonly fundingNodeId: string;
  readonly label: string;
  readonly levelLabel: string;
  readonly workLabel?: string;
  readonly amountPaise: number;
  readonly reportedPaise?: number;
  readonly level: NodeLevel;
  readonly parentVisualId?: string;
  readonly x: number;
  readonly y: number;
}

export interface IFlowLayoutEdge {
  readonly id: string;
  readonly fromId: string;
  readonly toId: string;
  readonly amountPaise: number;
  readonly awaiting: boolean;
}

export interface IFlowLayout {
  readonly nodes: readonly IFlowLayoutNode[];
  readonly edges: readonly IFlowLayoutEdge[];
  readonly width: number;
  readonly height: number;
  readonly activeBand: string;
}

const COLUMN_X = [80, 420, 760, 1100, 1440] as const;
const NODE_HEIGHT = 192;
const ROW_GAP = 48;
const NODE_PITCH = NODE_HEIGHT + ROW_GAP;

export function levelIndex(level: NodeLevel): number {
  return LEVEL_ORDER.indexOf(level);
}

export function resolveVisibleLevels(mode: HierarchyMode, zoom: number): readonly NodeLevel[] {
  if (mode === 'national-state') return ['national', 'state'];
  if (mode === 'state-district') return ['state', 'district'];
  if (mode === 'district-block') return ['district', 'block'];
  if (mode === 'block-agency') return ['block', 'agency'];
  if (mode === 'full') return LEVEL_ORDER;
  if (zoom < 0.5) return ['national', 'state'];
  if (zoom < 0.78) return ['state', 'district'];
  if (zoom < 1.05) return ['district', 'block'];
  return ['block', 'agency'];
}

export function activeBandLabel(levels: readonly NodeLevel[], lastMileLabel = 'Agency'): string {
  if (levels.length === 0) return 'Empty';
  const first = levels[0];
  const last = levels[levels.length - 1];
  if (first === last) return levelDisplayName(first, lastMileLabel);
  return `${levelDisplayName(first, lastMileLabel)} → ${levelDisplayName(last, lastMileLabel)}`;
}

export function computeSchemeMetrics(scenario: ISchemeScenario): ISchemeMetrics {
  const root = scenario.nodes.find((node) => node.level === 'national') ?? scenario.nodes[0];
  const centralReleasePaise = root?.receivedPaise ?? 0;
  const children = root
    ? scenario.nodes.filter((node) => node.parentId === root.id)
    : [];
  const matchingNational = scenario.schemeKind === 'matching-society' && root?.level === 'national';
  const namedChildrenPaise = children.reduce((sum, child) => sum + child.receivedPaise, 0);
  const awaitingDetailsPaise = root && children.length > 0 && !matchingNational
    ? Math.max(0, root.receivedPaise - Math.min(namedChildrenPaise, root.receivedPaise))
    : root
      ? Math.max(0, root.receivedPaise - root.reportedPaise)
      : 0;
  const tracedOnwardPaise = Math.max(0, centralReleasePaise - awaitingDetailsPaise);
  const awaitingSharePercent = centralReleasePaise === 0
    ? 0
    : Math.round((awaitingDetailsPaise / centralReleasePaise) * 1000) / 10;
  return { centralReleasePaise, tracedOnwardPaise, awaitingDetailsPaise, awaitingSharePercent };
}

export function buildFlowLayout(
  scenario: ISchemeScenario,
  mode: HierarchyMode,
  zoom: number,
  focusNodeId: string
): IFlowLayout {
  const visibleLevels = resolveVisibleLevels(mode, zoom);
  const band = activeBandLabel(visibleLevels, scenario.lastMileLabel);
  const focusPath = ancestorIds(scenario, focusNodeId);
  const visibleFunding = scenario.nodes.filter((node) => {
    if (!visibleLevels.includes(node.level)) {
      // Keep the focus path visible so search/select never strands the user.
      return focusPath.has(node.id);
    }
    if (mode === 'auto' && zoom >= 0.78) {
      return isNearFocusBranch(scenario, node, focusNodeId, focusPath);
    }
    return true;
  });

  const visibleIds = new Set(visibleFunding.map((node) => node.id));
  const childrenByParent = groupChildren(visibleFunding);

  const positions = new Map<string, { x: number; y: number }>();
  const roots = visibleFunding.filter((node) => !node.parentId || !visibleIds.has(node.parentId));
  let cursorY = 40;
  for (const root of roots) {
    cursorY = placeSubtree(root, childrenByParent, positions, cursorY);
    cursorY += ROW_GAP;
  }

  const mutableNodes: Array<{
    id: string;
    kind: 'funding' | 'awaiting';
    fundingNodeId: string;
    label: string;
    levelLabel: string;
    workLabel?: string;
    amountPaise: number;
    reportedPaise?: number;
    level: NodeLevel;
    parentVisualId?: string;
    x: number;
    y: number;
  }> = [];
  const layoutEdges: IFlowLayoutEdge[] = [];

  for (const node of visibleFunding) {
    const pos = positions.get(node.id);
    if (!pos) continue;
    mutableNodes.push({
      id: node.id,
      kind: 'funding',
      fundingNodeId: node.id,
      label: node.shortName,
      levelLabel: levelLabelFor(node, scenario.lastMileLabel),
      workLabel: node.workLabel,
      amountPaise: node.receivedPaise,
      reportedPaise: node.reportedPaise,
      level: node.level,
      parentVisualId: node.parentId && visibleIds.has(node.parentId) ? node.parentId : undefined,
      x: pos.x,
      y: pos.y
    });

    if (node.unpublishedPaise && node.unpublishedPaise > 0 && shouldShowAwaiting(node, visibleLevels, mode, zoom)) {
      const awaitingId = `${node.id}__awaiting`;
      const nextCol = Math.min(levelIndex(node.level) + 1, COLUMN_X.length - 1);
      const children = childrenByParent.get(node.id) ?? [];
      let awaitingY: number;
      if (children.length > 0) {
        const childYs = children
          .map((child) => positions.get(child.id)?.y)
          .filter((y): y is number => y !== undefined);
        const lastChildY = childYs.length > 0 ? Math.max(...childYs) : pos.y;
        awaitingY = lastChildY + NODE_PITCH;
      } else {
        awaitingY = pos.y + NODE_PITCH;
      }
      mutableNodes.push({
        id: awaitingId,
        kind: 'awaiting',
        fundingNodeId: node.id,
        label: 'Awaiting details',
        levelLabel: 'unpublished',
        amountPaise: node.unpublishedPaise,
        level: node.level,
        parentVisualId: node.id,
        x: COLUMN_X[nextCol],
        y: awaitingY
      });
      layoutEdges.push({
        id: `${node.id}->${awaitingId}`,
        fromId: node.id,
        toId: awaitingId,
        amountPaise: node.unpublishedPaise,
        awaiting: true
      });
    }
  }

  resolveColumnCollisions(mutableNodes);
  recenterParents(mutableNodes, childrenByParent);
  resolveColumnCollisions(mutableNodes);
  recenterParents(mutableNodes, childrenByParent);

  for (const transfer of scenario.transfers) {
    if (!visibleIds.has(transfer.fromNodeId) || !visibleIds.has(transfer.toNodeId)) continue;
    layoutEdges.push({
      id: transfer.id,
      fromId: transfer.fromNodeId,
      toId: transfer.toNodeId,
      amountPaise: transfer.amountPaise,
      awaiting: false
    });
  }

  const layoutNodes: IFlowLayoutNode[] = mutableNodes.map((node) => ({ ...node }));
  const maxX = layoutNodes.reduce((max, node) => Math.max(max, node.x + 260), 1600);
  const maxY = layoutNodes.reduce((max, node) => Math.max(max, node.y + 180), 700);
  return { nodes: layoutNodes, edges: layoutEdges, width: maxX + 80, height: maxY + 80, activeBand: band };
}

export function pathFor(scenario: ISchemeScenario, node: IFundingNode): readonly IFundingNode[] {
  const path: IFundingNode[] = [node];
  let cursor = node;
  while (cursor.parentId) {
    const parent = scenario.nodes.find((candidate) => candidate.id === cursor.parentId);
    if (!parent) break;
    path.unshift(parent);
    cursor = parent;
  }
  return path;
}

export function ledgerRows(scenario: ISchemeScenario, query: string): readonly IFundingNode[] {
  const q = query.trim().toLowerCase();
  const byParent = groupChildren([...scenario.nodes]);
  const roots = scenario.nodes.filter((node) => !node.parentId);

  if (!q) {
    const ordered: IFundingNode[] = [];
    const walk = (node: IFundingNode): void => {
      ordered.push(node);
      for (const child of byParent.get(node.id) ?? []) walk(child);
    };
    for (const root of roots) walk(root);
    return ordered;
  }

  const matches = new Set(
    scenario.nodes
      .filter((node) => {
        const hay = `${node.name} ${node.shortName} ${node.workLabel ?? ''}`.toLowerCase();
        return hay.includes(q);
      })
      .map((node) => node.id)
  );
  const keep = new Set<string>();
  for (const id of matches) {
    for (const ancestor of ancestorIds(scenario, id)) keep.add(ancestor);
  }

  const ordered: IFundingNode[] = [];
  const walk = (node: IFundingNode): void => {
    if (keep.has(node.id)) ordered.push(node);
    for (const child of byParent.get(node.id) ?? []) walk(child);
  };
  for (const root of roots) walk(root);
  return ordered;
}

function levelDisplayName(level: NodeLevel, lastMileLabel: string): string {
  if (level === 'agency') return lastMileLabel;
  return level.charAt(0).toUpperCase() + level.slice(1);
}

function levelLabelFor(node: IFundingNode, lastMileLabel: string): string {
  if (node.level === 'agency') return lastMileLabel.toLowerCase();
  return node.level;
}

function ancestorIds(scenario: ISchemeScenario, nodeId: string): Set<string> {
  const ids = new Set<string>([nodeId]);
  let cursor = scenario.nodes.find((node) => node.id === nodeId);
  while (cursor?.parentId) {
    ids.add(cursor.parentId);
    cursor = scenario.nodes.find((node) => node.id === cursor?.parentId);
  }
  return ids;
}

function isNearFocusBranch(
  scenario: ISchemeScenario,
  node: IFundingNode,
  focusNodeId: string,
  focusPath: Set<string>
): boolean {
  if (node.level === 'national' || node.level === 'state') return true;
  if (focusPath.has(node.id)) return true;
  if (node.parentId && focusPath.has(node.parentId)) return true;
  const focus = scenario.nodes.find((candidate) => candidate.id === focusNodeId);
  if (!focus) return true;
  // Same state branch as the focus node.
  const focusState = pathFor(scenario, focus).find((step) => step.level === 'state');
  const nodeState = pathFor(scenario, node).find((step) => step.level === 'state');
  return Boolean(focusState && nodeState && focusState.id === nodeState.id);
}

function shouldShowAwaiting(
  node: IFundingNode,
  visibleLevels: readonly NodeLevel[],
  mode: HierarchyMode,
  zoom: number
): boolean {
  if (!node.unpublishedPaise) return false;
  if (mode === 'full') return true;
  // Show awaiting as a sibling-depth card when the next hierarchy step is in view.
  const next = LEVEL_ORDER[levelIndex(node.level) + 1];
  if (!next) return zoom > 0.9;
  return visibleLevels.includes(next) || visibleLevels.includes(node.level);
}

function groupChildren(nodes: readonly IFundingNode[]): Map<string, IFundingNode[]> {
  const map = new Map<string, IFundingNode[]>();
  for (const node of nodes) {
    if (!node.parentId) continue;
    const list = map.get(node.parentId) ?? [];
    list.push(node);
    map.set(node.parentId, list);
  }
  return map;
}

function placeSubtree(
  node: IFundingNode,
  childrenByParent: Map<string, IFundingNode[]>,
  positions: Map<string, { x: number; y: number }>,
  startY: number
): number {
  const children = childrenByParent.get(node.id) ?? [];
  const col = Math.min(levelIndex(node.level), COLUMN_X.length - 1);
  if (children.length === 0) {
    positions.set(node.id, { x: COLUMN_X[col], y: startY });
    return startY + NODE_PITCH;
  }
  let y = startY;
  const childYs: number[] = [];
  for (const child of children) {
    const before = y;
    y = placeSubtree(child, childrenByParent, positions, y);
    const childPos = positions.get(child.id);
    childYs.push(childPos?.y ?? before);
  }
  const midY = (Math.min(...childYs) + Math.max(...childYs)) / 2;
  positions.set(node.id, { x: COLUMN_X[col], y: midY });
  return y;
}

interface IMutableLayoutNode {
  id: string;
  kind: 'funding' | 'awaiting';
  fundingNodeId: string;
  label: string;
  levelLabel: string;
  workLabel?: string;
  amountPaise: number;
  reportedPaise?: number;
  level: NodeLevel;
  parentVisualId?: string;
  x: number;
  y: number;
}

function resolveColumnCollisions(nodes: IMutableLayoutNode[]): void {
  const byColumn = new Map<number, IMutableLayoutNode[]>();
  for (const node of nodes) {
    const list = byColumn.get(node.x) ?? [];
    list.push(node);
    byColumn.set(node.x, list);
  }
  for (const column of byColumn.values()) {
    column.sort((a, b) => a.y - b.y || a.id.localeCompare(b.id));
    for (let i = 1; i < column.length; i += 1) {
      const prev = column[i - 1];
      const curr = column[i];
      const minY = prev.y + NODE_PITCH;
      if (curr.y < minY) curr.y = minY;
    }
  }
}

function recenterParents(
  nodes: IMutableLayoutNode[],
  childrenByParent: Map<string, IFundingNode[]>
): void {
  const byId = new Map(nodes.map((node) => [node.id, node]));
  // Bottom-up so parents follow shifted children.
  const funding = nodes.filter((node) => node.kind === 'funding');
  funding.sort((a, b) => levelIndex(b.level) - levelIndex(a.level));
  for (const parent of funding) {
    const children = childrenByParent.get(parent.id) ?? [];
    if (children.length === 0) continue;
    const childYs: number[] = [];
    for (const child of children) {
      const laidOut = byId.get(child.id);
      if (laidOut) childYs.push(laidOut.y);
    }
    const awaiting = byId.get(`${parent.id}__awaiting`);
    if (awaiting) childYs.push(awaiting.y);
    if (childYs.length === 0) continue;
    parent.y = (Math.min(...childYs) + Math.max(...childYs)) / 2;
  }
}
