import { citizenStanding } from './citizen-standing';
import type { IReconciliation, IReconciliationItem, ISchemeScenario, ReconciliationStatus } from './fund-flow';

/** Share-of-received thresholds for automated classification. */
const NEEDS_EXPLANATION_SHARE = 0.08;
const WATCH_SHARE = 0.03;

export interface IComputedReconciliation {
  readonly nodeId: string;
  readonly status: ReconciliationStatus;
  readonly items: readonly IReconciliationItem[];
}

function shareOf(receivedPaise: number, amountPaise: number): number {
  if (receivedPaise <= 0) return 0;
  return amountPaise / receivedPaise;
}

function classifyStanding(
  standing: ReturnType<typeof citizenStanding>,
  receivedPaise: number
): ReconciliationStatus {
  if (standing.ledgerOpenKind === 'next-unnamed') {
    const share = shareOf(receivedPaise, standing.ledgerOpenPaise);
    return share >= NEEDS_EXPLANATION_SHARE ? 'needs-explanation' : 'watch';
  }
  if (standing.ledgerOpenKind === 'still-on-books') {
    const share = shareOf(receivedPaise, standing.ledgerOpenPaise);
    return share >= WATCH_SHARE ? 'watch' : 'clear';
  }
  return 'clear';
}

function buildComputedItems(
  scenario: ISchemeScenario,
  nodeId: string,
  standing: ReturnType<typeof citizenStanding>
): readonly IReconciliationItem[] {
  const node = scenario.nodes.find((candidate) => candidate.id === nodeId);
  if (!node) return [];

  const items: IReconciliationItem[] = [];

  if (standing.sentOnwardPaise > 0) {
    items.push({
      label: 'Sent to named offices',
      amountPaise: standing.sentOnwardPaise,
      description: 'Published onward splits to named next offices in this synthetic record.'
    });
  }

  if (standing.usedHerePaise > 0) {
    items.push({
      label: standing.usedHereLabel ?? 'Used here',
      amountPaise: standing.usedHerePaise,
      description: standing.usedHereRemark ?? 'Allowed own spend at this office in this scenario.'
    });
  }

  if (standing.ledgerOpenKind === 'next-unnamed' && standing.ledgerOpenPaise > 0) {
    items.push({
      label: 'Next office not named',
      amountPaise: standing.ledgerOpenPaise,
      description: 'Received minus named next offices minus used here — no named next office in the published record yet.'
    });
  } else if (standing.ledgerOpenKind === 'still-on-books' && standing.ledgerOpenPaise > 0) {
    items.push({
      label: 'Still on this ledger',
      amountPaise: standing.ledgerOpenPaise,
      description: 'Balance still recorded on this office ledger — not yet reported as sent or used.'
    });
  }

  return items;
}

/** Derive reconciliation status and amount lines from citizen standing math. */
export function computeReconciliation(
  scenario: ISchemeScenario,
  nodeId: string
): IComputedReconciliation {
  const node = scenario.nodes.find((candidate) => candidate.id === nodeId);
  if (!node) {
    return { nodeId, status: 'clear', items: [] };
  }

  const standing = citizenStanding(scenario, node);
  const status = classifyStanding(standing, node.receivedPaise);
  const items = buildComputedItems(scenario, nodeId, standing);

  return { nodeId, status, items };
}

/** Merge authored narrative items from fixtures with computed amounts where present. */
export function mergeWithAuthored(
  computed: IComputedReconciliation,
  authored: IReconciliation | undefined
): IReconciliation {
  if (!authored) {
    return {
      nodeId: computed.nodeId,
      status: computed.status,
      items: computed.items
    };
  }

  const authoredHasNarrative = authored.items.some(
    (item) => item.description.includes('not yet filed')
      || item.description.includes('pending')
      || item.description.includes('Late')
      || item.description.includes('Unmatched')
  );

  return {
    nodeId: computed.nodeId,
    status: authoredHasNarrative ? authored.status : computed.status,
    items: authored.items.length > 0 ? authored.items : computed.items
  };
}

/** Compute reconciliations for every node that has an open ledger position or authored flag. */
export function computeScenarioReconciliations(scenario: ISchemeScenario): readonly IComputedReconciliation[] {
  const results: IComputedReconciliation[] = [];
  const authoredIds = new Set(scenario.reconciliations.map((entry) => entry.nodeId));

  for (const node of scenario.nodes) {
    const computed = computeReconciliation(scenario, node.id);
    if (computed.status !== 'clear' || authoredIds.has(node.id)) {
      results.push(computed);
    }
  }

  return results;
}
