import type { IFundingNode, ISchemeScenario, SchemeKind } from './fund-flow';

export type LedgerOpenKind = 'still-on-books' | 'next-unnamed' | 'none';

export interface ICitizenStanding {
  readonly receivedPaise: number;
  /** Amount this row treats as sent to named next offices (or utilised at a leaf). */
  readonly reportedSentPaise: number;
  readonly stillOnBooksPaise: number;
  readonly unnamedNextPaise: number;
  readonly namedChildrenPaise: number;
  readonly childCount: number;
  readonly childrenCoverReceived: boolean;
  readonly ledgerOpenPaise: number;
  readonly ledgerOpenKind: LedgerOpenKind;
  readonly ledgerHint: string;
  readonly inspectorSummary: string;
  readonly showUnnamedBar: boolean;
}

/**
 * Citizen leftover for one node.
 *
 * Rule citizens can check on their fingers:
 *   What's left = Received − Reported sent
 *
 * When this office has named children, Reported sent is the sum of those children
 * (money with a named next office). Any remainder is "next office not named".
 * Leaf rows use the fixture's reported figure (utilisation on this ledger).
 */
export function citizenStanding(scenario: ISchemeScenario, node: IFundingNode): ICitizenStanding {
  const receivedPaise = node.receivedPaise;
  const children = scenario.nodes.filter((candidate) => candidate.parentId === node.id);
  const childCount = children.length;
  const namedChildrenPaise = children.reduce((sum, child) => sum + child.receivedPaise, 0);
  const matchingNational = scenario.schemeKind === 'matching-society' && node.level === 'national';

  let reportedSentPaise: number;
  let unnamedNextPaise: number;

  if (childCount > 0 && !matchingNational) {
    // Structural truth: named next offices vs remainder.
    reportedSentPaise = Math.min(namedChildrenPaise, receivedPaise);
    unnamedNextPaise = Math.max(0, receivedPaise - reportedSentPaise);
  } else {
    reportedSentPaise = node.reportedPaise;
    unnamedNextPaise = 0;
  }

  const stillOnBooksPaise = Math.max(0, receivedPaise - reportedSentPaise);
  const childrenCoverReceived = childCount > 0 && namedChildrenPaise >= receivedPaise && receivedPaise > 0;

  let ledgerOpenPaise = 0;
  let ledgerOpenKind: LedgerOpenKind = 'none';
  let ledgerHint = '';

  if (childCount > 0 && unnamedNextPaise > 0) {
    ledgerOpenPaise = unnamedNextPaise;
    ledgerOpenKind = 'next-unnamed';
    ledgerHint = 'next office not named';
  } else if (stillOnBooksPaise > 0) {
    ledgerOpenPaise = stillOnBooksPaise;
    ledgerOpenKind = 'still-on-books';
    ledgerHint = 'still on this ledger';
  }

  const showUnnamedBar = ledgerOpenKind === 'next-unnamed';
  const inspectorSummary = explainStanding({
    ledgerOpenKind,
    ledgerOpenPaise,
    childCount,
    matchingNational,
    schemeKind: scenario.schemeKind
  });

  return {
    receivedPaise,
    reportedSentPaise,
    stillOnBooksPaise,
    unnamedNextPaise,
    namedChildrenPaise,
    childCount,
    childrenCoverReceived,
    ledgerOpenPaise,
    ledgerOpenKind,
    ledgerHint,
    inspectorSummary,
    showUnnamedBar
  };
}

/**
 * Fixture coherence checks. Empty = citizen math holds for every row.
 * Matching-society national may have children larger than centre share (state match merges below).
 */
export function findStandingInconsistencies(scenario: ISchemeScenario): readonly string[] {
  const issues: string[] = [];
  for (const node of scenario.nodes) {
    const children = scenario.nodes.filter((candidate) => candidate.parentId === node.id);
    const childSum = children.reduce((sum, child) => sum + child.receivedPaise, 0);
    const matchingNational = scenario.schemeKind === 'matching-society' && node.level === 'national';

    if (children.length > 0 && !matchingNational && childSum > node.receivedPaise) {
      issues.push(`${node.id}: children (${childSum}) exceed received (${node.receivedPaise})`);
    }

    if (children.length > 0 && !matchingNational) {
      const expectedUnpub = Math.max(0, node.receivedPaise - childSum);
      const actualUnpub = node.unpublishedPaise ?? 0;
      if (Math.abs(actualUnpub - expectedUnpub) > 1) {
        issues.push(
          `${node.id}: unpublishedPaise ${actualUnpub} should equal received − children ${expectedUnpub}`
        );
      }
      if (Math.abs(node.reportedPaise - childSum) > 1) {
        issues.push(
          `${node.id}: reportedPaise ${node.reportedPaise} should equal named children ${childSum}`
        );
      }
    }

    if (children.length === 0 && (node.unpublishedPaise ?? 0) > 0) {
      issues.push(`${node.id}: leaf should not set unpublishedPaise (use reported < received instead)`);
    }
  }
  return issues;
}

function explainStanding(input: {
  ledgerOpenKind: LedgerOpenKind;
  ledgerOpenPaise: number;
  childCount: number;
  matchingNational: boolean;
  schemeKind: SchemeKind;
}): string {
  const { ledgerOpenKind, childCount, matchingNational } = input;

  if (matchingNational) {
    return 'This is the centre share only. State matching money joins at the state health society, so child totals can look larger than this row — that is the matching pattern, not a missing leftover.';
  }

  if (ledgerOpenKind === 'none') {
    return childCount > 0
      ? 'Everything received here is already sitting under a named next office. Nothing is left open on this row.'
      : 'This office has reported sending or using everything it received. Nothing is left open on this row.';
  }

  if (ledgerOpenKind === 'next-unnamed') {
    return 'Received minus the money already under named next offices. That remainder has no named next office in the published record yet — a data gap, not a verdict.';
  }

  return 'This leftover is still on this office’s own ledger. It has not yet been reported as sent or used.';
}
