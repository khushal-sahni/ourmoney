import type { IFundingNode, ISchemeScenario } from './fund-flow';

export type LedgerOpenKind = 'still-on-books' | 'next-unnamed' | 'none';

export interface ICitizenStanding {
  readonly receivedPaise: number;
  readonly reportedSentPaise: number;
  readonly stillOnBooksPaise: number;
  readonly unnamedNextPaise: number;
  readonly namedChildrenPaise: number;
  readonly childrenCoverReceived: boolean;
  readonly ledgerOpenPaise: number;
  readonly ledgerOpenKind: LedgerOpenKind;
  readonly ledgerHint: string;
  readonly inspectorSummary: string;
  readonly showUnnamedBar: boolean;
}

/**
 * Citizen-facing leftover for one node.
 * Still on books = received − reported sent.
 * Next unnamed is only a separate story when it is not just that same leftover.
 */
export function citizenStanding(scenario: ISchemeScenario, node: IFundingNode): ICitizenStanding {
  const receivedPaise = node.receivedPaise;
  const reportedSentPaise = node.reportedPaise;
  const stillOnBooksPaise = Math.max(0, receivedPaise - reportedSentPaise);
  const unnamedNextPaise = node.unpublishedPaise ?? 0;
  const namedChildrenPaise = scenario.nodes
    .filter((candidate) => candidate.parentId === node.id)
    .reduce((sum, child) => sum + child.receivedPaise, 0);
  const childrenCoverReceived = namedChildrenPaise >= receivedPaise && receivedPaise > 0;

  let ledgerOpenPaise = 0;
  let ledgerOpenKind: LedgerOpenKind = 'none';
  let ledgerHint = '';

  if (stillOnBooksPaise > 0) {
    ledgerOpenPaise = stillOnBooksPaise;
    ledgerOpenKind = 'still-on-books';
    ledgerHint = 'still on this ledger';
  } else if (unnamedNextPaise > 0) {
    ledgerOpenPaise = unnamedNextPaise;
    ledgerOpenKind = 'next-unnamed';
    ledgerHint = 'next office not named';
  }

  const showUnnamedBar = unnamedNextPaise > 0 && unnamedNextPaise !== stillOnBooksPaise;
  const inspectorSummary = explainStanding({
    stillOnBooksPaise,
    unnamedNextPaise,
    childrenCoverReceived,
    namedChildrenPaise,
    receivedPaise
  });

  return {
    receivedPaise,
    reportedSentPaise,
    stillOnBooksPaise,
    unnamedNextPaise,
    namedChildrenPaise,
    childrenCoverReceived,
    ledgerOpenPaise,
    ledgerOpenKind,
    ledgerHint,
    inspectorSummary,
    showUnnamedBar
  };
}

function explainStanding(input: {
  stillOnBooksPaise: number;
  unnamedNextPaise: number;
  childrenCoverReceived: boolean;
  namedChildrenPaise: number;
  receivedPaise: number;
}): string {
  const { stillOnBooksPaise, unnamedNextPaise, childrenCoverReceived } = input;

  if (stillOnBooksPaise === 0 && unnamedNextPaise === 0) {
    return 'This office has reported sending everything it received, and the next offices are named. Nothing is left open on this row.';
  }

  if (stillOnBooksPaise > 0 && (unnamedNextPaise === 0 || unnamedNextPaise === stillOnBooksPaise)) {
    if (childrenCoverReceived) {
      return 'The next offices are already named for the full amount received. The leftover is only this: the office has not yet reported that last slice as sent. It is still on this ledger — not a missing place.';
    }
    return 'This leftover is still on this office’s ledger. It has not yet been reported as sent onward.';
  }

  if (stillOnBooksPaise === 0 && unnamedNextPaise > 0) {
    return 'This office has reported sending everything it received. The leftover is different: the next office for that slice is not named in the published record yet.';
  }

  return 'Two different leftovers: some money is still on this ledger (not yet reported as sent), and a smaller slice has no named next office in the published record.';
}
