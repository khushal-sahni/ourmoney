import type { IFundingNode, ISchemeScenario, SchemeKind } from './fund-flow';

export type LedgerOpenKind = 'still-on-books' | 'next-unnamed' | 'none';

export interface ICitizenStanding {
  readonly receivedPaise: number;
  /** Money under named next offices (0 on leaves). */
  readonly sentOnwardPaise: number;
  /** Allowed own spend at this office (admin / support / last-mile use). */
  readonly usedHerePaise: number;
  readonly usedHereLabel: string | undefined;
  readonly stillOnBooksPaise: number;
  readonly unnamedNextPaise: number;
  readonly namedChildrenPaise: number;
  readonly childCount: number;
  readonly childrenCoverReceived: boolean;
  readonly ledgerOpenPaise: number;
  readonly ledgerOpenKind: LedgerOpenKind;
  readonly ledgerHint: string;
  readonly inspectorSummary: string;
  readonly usedHereRemark: string | undefined;
  readonly showUnnamedBar: boolean;
  readonly showUsedHereBar: boolean;
  /** @deprecated Prefer sentOnwardPaise — kept for call-site compatibility during rename. */
  readonly reportedSentPaise: number;
}

/**
 * Citizen leftover for one node.
 *
 * Received = sent onward + used here + what’s left
 */
export function citizenStanding(scenario: ISchemeScenario, node: IFundingNode): ICitizenStanding {
  const receivedPaise = node.receivedPaise;
  const children = scenario.nodes.filter((candidate) => candidate.parentId === node.id);
  const childCount = children.length;
  const namedChildrenPaise = children.reduce((sum, child) => sum + child.receivedPaise, 0);
  const matchingNational = scenario.schemeKind === 'matching-society' && node.level === 'national';

  let sentOnwardPaise: number;
  let usedHerePaise: number;
  let usedHereLabel: string | undefined;
  let unnamedNextPaise: number;

  if (childCount > 0 && !matchingNational) {
    sentOnwardPaise = Math.min(namedChildrenPaise, receivedPaise);
    usedHerePaise = node.usedHerePaise ?? 0;
    usedHereLabel = usedHerePaise > 0 ? (node.usedHereLabel ?? 'Used here') : undefined;
    unnamedNextPaise = Math.max(0, receivedPaise - sentOnwardPaise - usedHerePaise);
  } else if (matchingNational) {
    sentOnwardPaise = node.reportedPaise;
    usedHerePaise = node.usedHerePaise ?? 0;
    usedHereLabel = usedHerePaise > 0 ? (node.usedHereLabel ?? 'Used here') : undefined;
    unnamedNextPaise = 0;
  } else {
    // Leaf: reported utilisation is "used here".
    sentOnwardPaise = 0;
    usedHerePaise = node.usedHerePaise ?? node.reportedPaise;
    usedHereLabel = usedHerePaise > 0
      ? (node.usedHereLabel ?? defaultLeafUsedLabel(scenario.schemeKind))
      : undefined;
    unnamedNextPaise = 0;
  }

  const stillOnBooksPaise = Math.max(0, receivedPaise - sentOnwardPaise - usedHerePaise);
  const childrenCoverReceived = childCount > 0 && namedChildrenPaise >= receivedPaise && receivedPaise > 0;

  let ledgerOpenPaise = 0;
  let ledgerOpenKind: LedgerOpenKind = 'none';
  let ledgerHint = '';

  if (childCount > 0 && !matchingNational && unnamedNextPaise > 0) {
    ledgerOpenPaise = unnamedNextPaise;
    ledgerOpenKind = 'next-unnamed';
    ledgerHint = 'next office not named';
  } else if (stillOnBooksPaise > 0) {
    ledgerOpenPaise = stillOnBooksPaise;
    ledgerOpenKind = 'still-on-books';
    ledgerHint = 'still on this ledger';
  }

  const showUnnamedBar = ledgerOpenKind === 'next-unnamed';
  const showUsedHereBar = usedHerePaise > 0;
  const inspectorSummary = explainStanding({
    ledgerOpenKind,
    childCount,
    matchingNational,
    usedHerePaise
  });
  const usedHereRemark = showUsedHereBar
    ? explainUsedHere(scenario.schemeKind, childCount > 0, usedHereLabel)
    : undefined;

  return {
    receivedPaise,
    sentOnwardPaise,
    reportedSentPaise: sentOnwardPaise,
    usedHerePaise,
    usedHereLabel,
    stillOnBooksPaise,
    unnamedNextPaise,
    namedChildrenPaise,
    childCount,
    childrenCoverReceived,
    ledgerOpenPaise,
    ledgerOpenKind,
    ledgerHint,
    inspectorSummary,
    usedHereRemark,
    showUnnamedBar,
    showUsedHereBar
  };
}

/**
 * Fixture coherence checks. Empty = citizen math holds for every row.
 */
export function findStandingInconsistencies(scenario: ISchemeScenario): readonly string[] {
  const issues: string[] = [];
  for (const node of scenario.nodes) {
    const children = scenario.nodes.filter((candidate) => candidate.parentId === node.id);
    const childSum = children.reduce((sum, child) => sum + child.receivedPaise, 0);
    const matchingNational = scenario.schemeKind === 'matching-society' && node.level === 'national';
    const usedHere = node.usedHerePaise ?? 0;

    if (children.length > 0 && !matchingNational && childSum + usedHere > node.receivedPaise + 1) {
      issues.push(
        `${node.id}: children (${childSum}) + usedHere (${usedHere}) exceed received (${node.receivedPaise})`
      );
    }

    if (children.length > 0 && !matchingNational) {
      const expectedUnpub = Math.max(0, node.receivedPaise - childSum - usedHere);
      const actualUnpub = node.unpublishedPaise ?? 0;
      if (Math.abs(actualUnpub - expectedUnpub) > 1) {
        issues.push(
          `${node.id}: unpublishedPaise ${actualUnpub} should equal received − children − usedHere ${expectedUnpub}`
        );
      }
      if (Math.abs(node.reportedPaise - childSum) > 1) {
        issues.push(
          `${node.id}: reportedPaise ${node.reportedPaise} should equal named children ${childSum}`
        );
      }
    }

    if (children.length === 0 && (node.unpublishedPaise ?? 0) > 0) {
      issues.push(`${node.id}: leaf should not set unpublishedPaise (use reported / usedHere instead)`);
    }
  }
  return issues;
}

function defaultLeafUsedLabel(kind: SchemeKind): string {
  switch (kind) {
    case 'demand-wage':
      return 'Wages & material';
    case 'works-sna':
      return 'Works';
    case 'matching-society':
      return 'Facility';
    case 'central-dbt':
      return 'Credits';
    default: {
      const _exhaustive: never = kind;
      return _exhaustive;
    }
  }
}

function explainUsedHere(kind: SchemeKind, isParent: boolean, label: string | undefined): string {
  if (!isParent) {
    return 'Reported as used at this last-mile unit.';
  }
  switch (kind) {
    case 'demand-wage':
      return 'This office’s allowed admin slice (staff, IEC, MIS) — not money missing from the next office.';
    case 'works-sna':
      return 'This office’s support slice (training, consultants, IEC) — not money missing from the next office.';
    case 'matching-society':
      return 'This office’s programme-management slice (SPMU/DPMU-style costs) — not money missing from the next office.';
    case 'central-dbt':
      return 'Thin admin for running enrollment / DBT machinery — the benefit rupee itself is not held here.';
    default: {
      const _exhaustive: never = kind;
      return _exhaustive;
    }
  }
}

function explainStanding(input: {
  ledgerOpenKind: LedgerOpenKind;
  childCount: number;
  matchingNational: boolean;
  usedHerePaise: number;
}): string {
  const { ledgerOpenKind, childCount, matchingNational, usedHerePaise } = input;

  if (matchingNational) {
    return 'This is the centre share only. State matching money joins at the state health society, so child totals can look larger than this row — that is the matching pattern, not a missing leftover.';
  }

  if (ledgerOpenKind === 'none') {
    if (childCount > 0 && usedHerePaise > 0) {
      return 'Everything received here is either under a named next office or this office’s allowed own use. Nothing is left open on this row.';
    }
    return childCount > 0
      ? 'Everything received here is already sitting under a named next office. Nothing is left open on this row.'
      : 'This office has reported using everything it received. Nothing is left open on this row.';
  }

  if (ledgerOpenKind === 'next-unnamed') {
    return 'Received minus named next offices minus this office’s own use. That remainder has no named next office in the published record yet — a data gap, not a verdict.';
  }

  return 'This leftover is still on this office’s own ledger. It has not yet been reported as sent or used.';
}
