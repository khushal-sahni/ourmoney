import type { IFundingNode, ISchemeScenario, NodeLevel } from './fund-flow';

/**
 * Rank named offices at a hierarchy band by reported received amount.
 * Used to ground scheme-only comparison questions without inventing places.
 */
export function rankNamedPlaces(
  scenario: ISchemeScenario,
  level: NodeLevel = 'district',
  limit = 3
): readonly IFundingNode[] {
  return scenario.nodes
    .filter((node) => node.level === level)
    .slice()
    .sort((left, right) => right.receivedPaise - left.receivedPaise)
    .slice(0, Math.max(0, limit));
}

/** National programme root for scheme-wide grounding. */
export function nationalRootNode(scenario: ISchemeScenario): IFundingNode | undefined {
  return scenario.nodes.find((node) => node.level === 'national')
    ?? scenario.nodes.find((node) => node.parentId === undefined);
}
