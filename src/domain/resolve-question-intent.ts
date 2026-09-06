import { ALL_SCENARIOS } from '../data/fixtures/catalog';
import { buildPlaceIndex, searchPlaces, type IPlaceEntry } from '../data/place-index';
import type { ISchemeScenario } from './fund-flow';
import { nationalRootNode } from './rank-named-places';
import { resolveQuestionNodes } from './resolve-question-nodes';

export type IntentKind = 'resolved' | 'unknown_place' | 'scheme_only' | 'ambiguous';

export interface IResolvedIntent {
  readonly kind: IntentKind;
  readonly schemeId: string;
  readonly schemeName: string;
  readonly focusNodeId: string;
  readonly placeLabel: string;
  readonly mentionedNodeIds: readonly string[];
  readonly scenario: ISchemeScenario;
  readonly placeEntry?: IPlaceEntry;
  readonly suggestions?: readonly IPlaceEntry[];
  readonly unknownPlaceToken?: string;
}

const SCHEME_KEYWORDS: readonly { readonly schemeId: string; readonly keywords: readonly string[] }[] = [
  {
    schemeId: 'water-access',
    keywords: ['water', 'paani', 'pani', 'jjm', 'sanitation', 'cwam', 'piprahi', 'samiti']
  },
  {
    schemeId: 'rural-works-guarantee',
    keywords: ['road', 'roads', 'wage', 'rozgar', 'nrega', 'mgnrega', 'panchayat', 'rural works', 'rwg', 'bakul']
  },
  {
    schemeId: 'landholder-income',
    keywords: ['kisan', 'farmer', 'credit', 'dbt', 'income', 'landholder', 'apbs', 'lis']
  },
  {
    schemeId: 'neighbourhood-health',
    keywords: ['health', 'phc', 'hospital', 'nhm', 'facility', 'chc', 'bpmu']
  }
];

const REAL_PLACE_REDIRECTS: Readonly<Record<string, string>> = {
  orai: 'Uttar Raital',
  jhansi: 'Raital',
  kanpur: 'Kanak Pradesh'
};

const DEMO_SUGGESTIONS = ['Piprahi', 'Uttar Raital', 'Kharonda', 'Bakul'] as const;

function normalizeQuestion(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, ' ');
}

function inferSchemeId(question: string): string | undefined {
  const normalized = normalizeQuestion(question);
  for (const entry of SCHEME_KEYWORDS) {
    if (entry.keywords.some((keyword) => normalized.includes(keyword))) {
      return entry.schemeId;
    }
  }
  return undefined;
}

function detectUnknownRealPlace(question: string): string | undefined {
  const normalized = normalizeQuestion(question);
  for (const [token, label] of Object.entries(REAL_PLACE_REDIRECTS)) {
    if (normalized.includes(token)) {
      return label;
    }
  }
  return undefined;
}

function findScenario(schemeId: string): ISchemeScenario | undefined {
  return ALL_SCENARIOS.find((scenario) => scenario.id === schemeId);
}

function resolvePlaceInScenario(
  scenario: ISchemeScenario,
  question: string,
  placeIndex: readonly IPlaceEntry[]
): { readonly entry?: IPlaceEntry; readonly nodeIds: readonly string[] } {
  const schemePlaces = placeIndex.filter((entry) => entry.schemeId === scenario.id);
  const searchResults = searchPlaces(schemePlaces, question, 4);
  if (searchResults.length > 0) {
    return { entry: searchResults[0], nodeIds: [searchResults[0].nodeId] };
  }

  const nodeIds = resolveQuestionNodes(scenario, question);
  if (nodeIds.length > 0) {
    const entry = schemePlaces.find((candidate) => candidate.nodeId === nodeIds[0]);
    return { entry, nodeIds };
  }

  return { nodeIds: [] };
}

function demoSuggestions(placeIndex: readonly IPlaceEntry[]): readonly IPlaceEntry[] {
  const picks: IPlaceEntry[] = [];
  for (const label of DEMO_SUGGESTIONS) {
    const match = placeIndex.find((entry) => entry.label.toLowerCase() === label.toLowerCase());
    if (match) picks.push(match);
  }
  return picks.slice(0, 3);
}

/** Resolve a citizen question to a scheme + place across the full synthetic catalog. */
export function resolveQuestionIntent(question: string): IResolvedIntent | undefined {
  const trimmed = question.trim();
  if (!trimmed) return undefined;

  const placeIndex = buildPlaceIndex();
  const globalSearch = searchPlaces(placeIndex, trimmed, 6);
  const inferredSchemeId = inferSchemeId(trimmed);
  const unknownRedirect = detectUnknownRealPlace(trimmed);

  if (globalSearch.length > 0) {
    const entry = globalSearch[0];
    const scenario = findScenario(entry.schemeId);
    if (!scenario) return undefined;
    const nodeIds = resolveQuestionNodes(scenario, trimmed);
    const focusNodeId = nodeIds.length > 0 ? nodeIds[nodeIds.length - 1] ?? entry.nodeId : entry.nodeId;
    return {
      kind: 'resolved',
      schemeId: entry.schemeId,
      schemeName: entry.schemeName,
      focusNodeId,
      placeLabel: entry.label,
      mentionedNodeIds: nodeIds.length > 0 ? nodeIds : [entry.nodeId],
      scenario,
      placeEntry: entry
    };
  }

  const schemeId = inferredSchemeId ?? ALL_SCENARIOS[0].id;
  const scenario = findScenario(schemeId);
  if (!scenario) return undefined;

  const { entry, nodeIds } = resolvePlaceInScenario(scenario, trimmed, placeIndex);

  if (nodeIds.length > 0) {
    const focusNodeId = nodeIds[nodeIds.length - 1] ?? scenario.defaultFocusNodeId;
    const node = scenario.nodes.find((candidate) => candidate.id === focusNodeId);
    return {
      kind: 'resolved',
      schemeId: scenario.id,
      schemeName: scenario.schemeName,
      focusNodeId,
      placeLabel: entry?.label ?? node?.shortName ?? 'Selected place',
      mentionedNodeIds: nodeIds,
      scenario,
      placeEntry: entry
    };
  }

  if (unknownRedirect) {
    const redirectEntry = placeIndex.find(
      (candidate) => candidate.label.toLowerCase() === unknownRedirect.toLowerCase()
    );
    if (redirectEntry) {
      const redirectScenario = findScenario(redirectEntry.schemeId);
      if (redirectScenario) {
        return {
          kind: 'unknown_place',
          schemeId: redirectEntry.schemeId,
          schemeName: redirectEntry.schemeName,
          focusNodeId: redirectEntry.nodeId,
          placeLabel: redirectEntry.label,
          mentionedNodeIds: [redirectEntry.nodeId],
          scenario: redirectScenario,
          placeEntry: redirectEntry,
          suggestions: demoSuggestions(placeIndex),
          unknownPlaceToken: trimmed
        };
      }
    }
  }

  if (inferredSchemeId) {
    const root = nationalRootNode(scenario);
    const focusNodeId = root?.id ?? scenario.defaultFocusNodeId;
    return {
      kind: 'scheme_only',
      schemeId: scenario.id,
      schemeName: scenario.schemeName,
      focusNodeId,
      placeLabel: scenario.schemeName,
      mentionedNodeIds: [focusNodeId],
      scenario,
      suggestions: demoSuggestions(placeIndex)
    };
  }

  return {
    kind: 'ambiguous',
    schemeId: scenario.id,
    schemeName: scenario.schemeName,
    focusNodeId: scenario.defaultFocusNodeId,
    placeLabel: '',
    mentionedNodeIds: [],
    scenario,
    suggestions: demoSuggestions(placeIndex)
  };
}

export function unknownPlaceMessage(intent: IResolvedIntent, locale: 'en' | 'hi'): string {
  if (intent.kind !== 'unknown_place') return '';
  if (locale === 'hi') {
    return `यह डेमो केवल काल्पनिक स्थानों का उपयोग करता है — वास्तविक शहरों के लिए लाइव डेटा नहीं है। `
      + `आप "${intent.placeLabel}" (${intent.schemeName}) देख सकते हैं, जो इस प्रश्न के लिए निकटतम डेमो स्थान है।`;
  }
  return `This demo uses fictional places only — we do not have live data for real towns. `
    + `You can explore ${intent.placeLabel} under ${intent.schemeName}, the closest demo analogue for your question.`;
}
