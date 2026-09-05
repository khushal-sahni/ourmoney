import { ALL_SCENARIOS } from './fixtures/catalog';
import type { IFundingNode, NodeLevel } from '../domain/fund-flow';

export interface IPlaceEntry {
  readonly nodeId: string;
  readonly schemeId: string;
  readonly schemeName: string;
  readonly label: string;
  readonly sublabel: string;
  readonly level: NodeLevel;
  readonly searchText: string;
  readonly prototypeCode?: string;
}

function levelSublabel(level: NodeLevel, lastMileLabel: string): string {
  if (level === 'agency') return lastMileLabel;
  return level;
}

function buildSearchText(node: IFundingNode, schemeName: string): string {
  return [
    node.shortName,
    node.name,
    node.workLabel,
    schemeName
  ].filter(Boolean).join(' ').toLowerCase();
}

/** Searchable fictional places across all synthetic scenarios. */
export function buildPlaceIndex(): readonly IPlaceEntry[] {
  const entries: IPlaceEntry[] = [];
  for (const scenario of ALL_SCENARIOS) {
    for (const node of scenario.nodes) {
      if (node.level === 'national') continue;
      entries.push({
        nodeId: node.id,
        schemeId: scenario.id,
        schemeName: scenario.schemeName,
        label: node.shortName,
        sublabel: node.workLabel
          ? `${levelSublabel(node.level, scenario.lastMileLabel)} · ${node.workLabel}`
          : levelSublabel(node.level, scenario.lastMileLabel),
        level: node.level,
        searchText: buildSearchText(node, scenario.schemeName),
        prototypeCode: node.level === 'agency' ? `LOC-${node.id.slice(0, 6).toUpperCase()}` : undefined
      });
    }
  }
  return entries.sort((a, b) => a.label.localeCompare(b.label));
}

export function searchPlaces(
  index: readonly IPlaceEntry[],
  query: string,
  limit = 8
): readonly IPlaceEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return index.slice(0, limit);
  const matches = index.filter((entry) =>
    entry.searchText.includes(q)
    || entry.label.toLowerCase().includes(q)
    || (entry.prototypeCode?.toLowerCase().includes(q) ?? false)
  );
  return matches.slice(0, limit);
}
