import type { IFundingNode, ISchemeScenario } from './fund-flow';
import { pathFor } from './flow-hierarchy';

interface IPhraseMatch {
  readonly nodeId: string;
  readonly phrase: string;
  readonly start: number;
  readonly end: number;
}

function isWordChar(character: string): boolean {
  return /[a-z0-9\u0900-\u097f]/.test(character);
}

function normalizeText(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, ' ');
}

function phrasesForNode(node: IFundingNode): readonly string[] {
  const phrases = new Set<string>();
  phrases.add(node.shortName.trim().toLowerCase());
  phrases.add(node.id.replace(/-/g, ' ').trim().toLowerCase());
  phrases.add(node.name.trim().toLowerCase());
  return [...phrases].filter((phrase) => phrase.length >= 2);
}

function findWholeWordSpans(text: string, phrase: string): readonly { readonly start: number; readonly end: number }[] {
  const spans: { start: number; end: number }[] = [];
  if (!phrase) return spans;

  let cursor = 0;
  while (cursor <= text.length - phrase.length) {
    const start = text.indexOf(phrase, cursor);
    if (start === -1) break;

    const before = start === 0 ? ' ' : text[start - 1] ?? ' ';
    const after = start + phrase.length >= text.length
      ? ' '
      : text[start + phrase.length] ?? ' ';

    if (!isWordChar(before) && !isWordChar(after)) {
      spans.push({ start, end: start + phrase.length });
    }
    cursor = start + 1;
  }
  return spans;
}

function collectPhraseMatches(scenario: ISchemeScenario, question: string): readonly IPhraseMatch[] {
  const normalized = normalizeText(question);
  const matches: IPhraseMatch[] = [];

  for (const node of scenario.nodes) {
    for (const phrase of phrasesForNode(node)) {
      for (const span of findWholeWordSpans(normalized, phrase)) {
        matches.push({
          nodeId: node.id,
          phrase,
          start: span.start,
          end: span.end
        });
      }
    }
  }

  return matches.sort((left, right) => {
    const lengthDelta = (right.end - right.start) - (left.end - left.start);
    if (lengthDelta !== 0) return lengthDelta;
    return left.start - right.start;
  });
}

function selectNonOverlappingMatches(matches: readonly IPhraseMatch[]): readonly IPhraseMatch[] {
  const selected: IPhraseMatch[] = [];

  for (const candidate of matches) {
    const overlaps = selected.some(
      (picked) => candidate.start < picked.end && picked.start < candidate.end
    );
    if (!overlaps) {
      selected.push(candidate);
    }
  }

  return selected.sort((left, right) => left.start - right.start);
}

/** Resolve place mentions in a citizen question using longest overlapping span wins. */
export function resolveQuestionNodes(
  scenario: ISchemeScenario,
  question: string
): readonly string[] {
  const normalized = normalizeText(question);
  if (!normalized) return [];

  const selected = selectNonOverlappingMatches(collectPhraseMatches(scenario, question));
  const seen = new Set<string>();
  const nodeIds: string[] = [];

  for (const match of selected) {
    if (seen.has(match.nodeId)) continue;
    seen.add(match.nodeId);
    nodeIds.push(match.nodeId);
  }

  return nodeIds;
}

function findNode(scenario: ISchemeScenario, nodeId: string): IFundingNode | undefined {
  return scenario.nodes.find((node) => node.id === nodeId);
}

function lowestCommonAncestor(
  scenario: ISchemeScenario,
  nodeIds: readonly string[]
): IFundingNode | undefined {
  if (nodeIds.length === 0) return undefined;
  const first = findNode(scenario, nodeIds[0]);
  if (!first) return undefined;

  const firstPath = pathFor(scenario, first);

  let lca: IFundingNode | undefined;
  for (const step of firstPath) {
    const isCommon = nodeIds.every((nodeId) => {
      const node = findNode(scenario, nodeId);
      if (!node) return false;
      return pathFor(scenario, node).some((ancestor) => ancestor.id === step.id);
    });
    if (isCommon) {
      lca = step;
    }
  }

  return lca ?? firstPath[0];
}

function pathFromAncestor(
  scenario: ISchemeScenario,
  ancestor: IFundingNode,
  node: IFundingNode
): readonly IFundingNode[] {
  const fullPath = pathFor(scenario, node);
  const ancestorIndex = fullPath.findIndex((step) => step.id === ancestor.id);
  if (ancestorIndex === -1) return fullPath;
  return fullPath.slice(ancestorIndex);
}

export interface IQuestionCorridor {
  readonly mentionedNodeIds: readonly string[];
  readonly focusNodeId: string;
  readonly corridorNodes: readonly IFundingNode[];
}

/** Build an ordered corridor through resolved mentions for ask grounding. */
export function buildQuestionCorridor(
  scenario: ISchemeScenario,
  question: string,
  fallbackNodeId: string
): IQuestionCorridor {
  const mentionedNodeIds = resolveQuestionNodes(scenario, question);
  if (mentionedNodeIds.length === 0) {
    const fallback = findNode(scenario, fallbackNodeId);
    if (!fallback) {
      throw new Error(`Node ${fallbackNodeId} not found`);
    }
    return {
      mentionedNodeIds: [],
      focusNodeId: fallbackNodeId,
      corridorNodes: pathFor(scenario, fallback)
    };
  }

  if (mentionedNodeIds.length === 1) {
    const node = findNode(scenario, mentionedNodeIds[0]);
    if (!node) {
      throw new Error(`Node ${mentionedNodeIds[0]} not found`);
    }
    return {
      mentionedNodeIds,
      focusNodeId: node.id,
      corridorNodes: pathFor(scenario, node)
    };
  }

  const mentionedNodes = mentionedNodeIds
    .map((nodeId) => findNode(scenario, nodeId))
    .filter((node): node is IFundingNode => node !== undefined);

  if (mentionedNodes.length === 0) {
    const fallback = findNode(scenario, fallbackNodeId);
    if (!fallback) {
      throw new Error(`Node ${fallbackNodeId} not found`);
    }
    return {
      mentionedNodeIds: [],
      focusNodeId: fallbackNodeId,
      corridorNodes: pathFor(scenario, fallback)
    };
  }

  const lca = lowestCommonAncestor(scenario, mentionedNodeIds);
  if (!lca) {
    const deepest = mentionedNodes.reduce((current, candidate) =>
      pathFor(scenario, candidate).length > pathFor(scenario, current).length ? candidate : current
    );
    return {
      mentionedNodeIds,
      focusNodeId: deepest.id,
      corridorNodes: pathFor(scenario, deepest)
    };
  }

  const corridorById = new Map<string, IFundingNode>();
  for (const node of mentionedNodes) {
    for (const step of pathFromAncestor(scenario, lca, node)) {
      corridorById.set(step.id, step);
    }
  }

  const corridorNodes = [...corridorById.values()].sort(
    (left, right) => pathFor(scenario, left).length - pathFor(scenario, right).length
  );

  const focusNode = mentionedNodes.reduce((current, candidate) => {
    const currentDepth = pathFor(scenario, current).length;
    const candidateDepth = pathFor(scenario, candidate).length;
    if (candidateDepth !== currentDepth) {
      return candidateDepth > currentDepth ? candidate : current;
    }
    const currentIndex = mentionedNodeIds.indexOf(current.id);
    const candidateIndex = mentionedNodeIds.indexOf(candidate.id);
    return candidateIndex > currentIndex ? candidate : current;
  });

  return {
    mentionedNodeIds,
    focusNodeId: focusNode.id,
    corridorNodes
  };
}

export function corridorNodeIdSet(corridor: IQuestionCorridor): ReadonlySet<string> {
  return new Set(corridor.corridorNodes.map((node) => node.id));
}
