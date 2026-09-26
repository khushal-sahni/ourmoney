import type { IFundingNode, ISchemeScenario, NodeLevel } from '../domain/fund-flow';
import type { DataMode } from '../utils/data-mode';
import { scenariosForMode } from './sources/source-for-mode';

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

/** Searchable places across scenarios in the active data mode. */
export function buildPlaceIndexForMode(mode: DataMode = 'mock'): readonly IPlaceEntry[] {
  return buildPlaceIndex(scenariosForMode(mode));
}

/** Searchable places across the given scenarios. */
export function buildPlaceIndex(scenarios: readonly ISchemeScenario[]): readonly IPlaceEntry[] {
  const entries: IPlaceEntry[] = [];
  for (const scenario of scenarios) {
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
        prototypeCode: node.level === 'agency' && scenario.provenance !== 'public-record'
          ? `LOC-${node.id.slice(0, 6).toUpperCase()}`
          : undefined
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
  const needle = query.trim().toLowerCase();
  if (!needle) return index.slice(0, limit);

  const scored = index
    .map((entry) => {
      const label = entry.label.toLowerCase();
      let score = 0;
      if (label === needle) score = 100;
      else if (label.startsWith(needle)) score = 80;
      else if (entry.searchText.includes(needle)) score = 50;
      else return null;
      return { entry, score };
    })
    .filter((row): row is { entry: IPlaceEntry; score: number } => row !== null)
    .sort((a, b) => b.score - a.score || a.entry.label.localeCompare(b.entry.label));

  return scored.slice(0, limit).map((row) => row.entry);
}
