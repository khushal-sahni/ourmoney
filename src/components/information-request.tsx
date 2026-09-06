import type { IFundingNode, ISchemeScenario } from '../domain/fund-flow';
import type { ICitizenStanding } from '../domain/citizen-standing';
import { formatCrore } from '../utils/money';

/** Share card text for the Web Share API / clipboard. */
export function buildShareText(
  scenario: ISchemeScenario,
  node: IFundingNode,
  standing: ICitizenStanding
): string {
  return [
    `${node.shortName} · ${scenario.schemeName}`,
    `Received ${formatCrore(standing.receivedPaise)}`,
    standing.usedHerePaise > 0 ? `Used here ${formatCrore(standing.usedHerePaise)}` : null,
    standing.ledgerOpenPaise > 0 ? `What's left ${formatCrore(standing.ledgerOpenPaise)}` : null,
    'Synthetic demo · ourmoney.fyi'
  ].filter(Boolean).join(' · ');
}
