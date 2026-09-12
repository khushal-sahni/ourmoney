import { buildPlaceIndex, searchPlaces, type IPlaceEntry } from '../data/place-index';
import { findScenarioInMode, scenariosForMode } from '../data/sources/source-for-mode';
import type { DataMode } from '../utils/data-mode';
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

const MOCK_SCHEME_KEYWORDS: readonly { readonly schemeId: string; readonly keywords: readonly string[] }[] = [
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

const LIVE_SCHEME_KEYWORDS: readonly { readonly schemeId: string; readonly keywords: readonly string[] }[] = [
  {
    schemeId: 'mgnrega-hp-2025-26',
    keywords: [
      'nrega',
      'mgnrega',
      'rozgar',
      'wage',
      'panchayat',
      'himachal',
      'shimla',
      'kangra',
      'mandi',
      'mashobra'
    ]
  }
];

const REAL_PLACE_REDIRECTS: Readonly<Record<string, string>> = {
  orai: 'Uttar Raital',
  jhansi: 'Raital',
  kanpur: 'Kanak Pradesh'
};

const MOCK_DEMO_SUGGESTIONS = ['Piprahi', 'Uttar Raital', 'Kharonda', 'Bakul'] as const;
const LIVE_DEMO_SUGGESTIONS = ['Mashobra', 'Shimla', 'Rajasthan', 'Kangra'] as const;

function normalizeQuestion(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, ' ');
}

function inferSchemeId(mode: DataMode, question: string): string | undefined {
  const normalized = normalizeQuestion(question);
  const keywords = mode === 'live' ? LIVE_SCHEME_KEYWORDS : MOCK_SCHEME_KEYWORDS;
  for (const entry of keywords) {
    if (entry.keywords.some((keyword) => normalized.includes(keyword))) {
      return entry.schemeId;
    }
  }
  return undefined;
}

function detectUnknownRealPlace(mode: DataMode, question: string): string | undefined {
  if (mode === 'live') return undefined;
  const normalized = normalizeQuestion(question);
  for (const [token, label] of Object.entries(REAL_PLACE_REDIRECTS)) {
    if (normalized.includes(token)) {
      return label;
    }
  }
  return undefined;
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

function demoSuggestions(mode: DataMode, placeIndex: readonly IPlaceEntry[]): readonly IPlaceEntry[] {
  const labels = mode === 'live' ? LIVE_DEMO_SUGGESTIONS : MOCK_DEMO_SUGGESTIONS;
  const picks: IPlaceEntry[] = [];
  for (const label of labels) {
    const match = placeIndex.find((entry) => entry.label.toLowerCase() === label.toLowerCase());
    if (match) picks.push(match);
  }
  return picks.slice(0, 3);
}

/** Resolve a citizen question to a scheme + place in the active data mode catalog. */
export function resolveQuestionIntent(
  question: string,
  mode: DataMode = 'mock'
): IResolvedIntent | undefined {
  const trimmed = question.trim();
  if (!trimmed) return undefined;

  const scenarios = scenariosForMode(mode);
  const placeIndex = buildPlaceIndex(scenarios);
  const globalSearch = searchPlaces(placeIndex, trimmed, 6);
  const inferredSchemeId = inferSchemeId(mode, trimmed);
  const unknownRedirect = detectUnknownRealPlace(mode, trimmed);

  if (globalSearch.length > 0) {
    const entry = globalSearch[0];
    const scenario = findScenarioInMode(mode, entry.schemeId);
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

  const schemeId = inferredSchemeId ?? scenarios[0]?.id;
  if (!schemeId) return undefined;
  const scenario = findScenarioInMode(mode, schemeId);
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
      const redirectScenario = findScenarioInMode(mode, redirectEntry.schemeId);
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
          suggestions: demoSuggestions(mode, placeIndex),
          unknownPlaceToken: trimmed
        };
      }
    }
  }

  if (mode === 'live') {
    const suggestions = demoSuggestions(mode, placeIndex);
    const root = nationalRootNode(scenario);
    return {
      kind: 'ambiguous',
      schemeId: scenario.id,
      schemeName: scenario.schemeName,
      focusNodeId: root?.id ?? scenario.defaultFocusNodeId,
      placeLabel: '',
      mentionedNodeIds: [],
      scenario,
      suggestions
    };
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
      suggestions: demoSuggestions(mode, placeIndex)
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
    suggestions: demoSuggestions(mode, placeIndex)
  };
}

export function unknownPlaceMessage(
  intent: IResolvedIntent,
  locale: 'en' | 'hi',
  mode: DataMode = 'mock'
): string {
  if (intent.kind !== 'unknown_place') return '';
  if (mode === 'live') {
    if (locale === 'hi') {
      return `यह लाइव दृश्य MGNREGA FY 2025–26 निकाल है (गहराई हिमाचल में)। `
        + `आप "${intent.placeLabel}" देख सकते हैं।`;
    }
    return `This live view covers the MGNREGA FY 2025–26 extract (deep corridor in Himachal). `
      + `You can explore ${intent.placeLabel} under ${intent.schemeName}.`;
  }
  if (locale === 'hi') {
    return `यह डेमो केवल काल्पनिक स्थानों का उपयोग करता है — वास्तविक शहरों के लिए लाइव डेटा नहीं है। `
      + `आप "${intent.placeLabel}" (${intent.schemeName}) देख सकते हैं, जो इस प्रश्न के लिए निकटतम डेमो स्थान है।`;
  }
  return `This demo uses fictional places only — we do not have live data for real towns. `
    + `You can explore ${intent.placeLabel} under ${intent.schemeName}, the closest demo analogue for your question.`;
}
