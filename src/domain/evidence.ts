import { citizenStanding } from './citizen-standing';
import type {
  IFundingNode,
  IReconciliation,
  ISchemeScenario,
  ITransfer
} from './fund-flow';
import { scenarioProvenance } from './fund-flow';
import { formatCrore } from '../utils/money';

export type EvidenceKind = 'node' | 'transfer' | 'reconciliation' | 'formula';

export interface IEvidenceRecord {
  readonly id: string;
  readonly kind: EvidenceKind;
  readonly label: string;
  readonly detail: string;
  readonly reportedAt?: string;
  readonly amountPaise?: number;
  readonly amountDisplay?: string;
  readonly sourceLabel: string;
  readonly synthetic: boolean;
  readonly reference?: string;
}

const FORMULA_LINE =
  'Received = sent to named offices + used here + what\'s left';

function isSynthetic(scenario: ISchemeScenario): boolean {
  return scenarioProvenance(scenario) === 'synthetic';
}

export function buildNodeEvidence(
  scenario: ISchemeScenario,
  node: IFundingNode
): readonly IEvidenceRecord[] {
  const standing = citizenStanding(scenario, node);
  const synthetic = isSynthetic(scenario);
  const records: IEvidenceRecord[] = [
    {
      id: `node-${node.id}-received`,
      kind: 'node',
      label: `${node.shortName} · received`,
      detail: node.name,
      reportedAt: node.reportedAt,
      amountPaise: standing.receivedPaise,
      amountDisplay: formatCrore(standing.receivedPaise),
      sourceLabel: scenario.sourceLabel,
      synthetic
    },
    {
      id: `formula-${node.id}`,
      kind: 'formula',
      label: 'Citizen equation',
      detail: FORMULA_LINE,
      sourceLabel: scenario.sourceLabel,
      synthetic
    }
  ];

  if (standing.sentOnwardPaise > 0) {
    records.push({
      id: `node-${node.id}-onward`,
      kind: 'node',
      label: 'Sent onward',
      detail: synthetic
        ? 'Sum of named next offices in this synthetic tree.'
        : 'Sum of named next offices in this public-record extract.',
      amountPaise: standing.sentOnwardPaise,
      amountDisplay: formatCrore(standing.sentOnwardPaise),
      sourceLabel: scenario.sourceLabel,
      synthetic
    });
  }

  if (standing.usedHerePaise > 0) {
    records.push({
      id: `node-${node.id}-used`,
      kind: 'node',
      label: standing.usedHereLabel ?? 'Used here',
      detail: standing.usedHereRemark ?? 'Reported utilisation at this office.',
      amountPaise: standing.usedHerePaise,
      amountDisplay: formatCrore(standing.usedHerePaise),
      sourceLabel: scenario.sourceLabel,
      synthetic
    });
  }

  if (standing.ledgerOpenPaise > 0) {
    records.push({
      id: `node-${node.id}-left`,
      kind: 'node',
      label: standing.ledgerHint,
      detail: standing.inspectorSummary,
      amountPaise: standing.ledgerOpenPaise,
      amountDisplay: formatCrore(standing.ledgerOpenPaise),
      sourceLabel: scenario.sourceLabel,
      synthetic
    });
  }

  return records;
}

export function buildTransferEvidence(
  scenario: ISchemeScenario,
  transfer: ITransfer
): IEvidenceRecord {
  return {
    id: `transfer-${transfer.id}`,
    kind: 'transfer',
    label: transfer.reference,
    detail: `${transfer.component ?? 'transfer'} · ${transfer.date}`,
    amountPaise: transfer.amountPaise,
    amountDisplay: formatCrore(transfer.amountPaise),
    sourceLabel: scenario.sourceLabel,
    synthetic: isSynthetic(scenario),
    reference: transfer.reference,
    reportedAt: transfer.date
  };
}

export function buildReconciliationEvidence(
  scenario: ISchemeScenario,
  reconciliation: IReconciliation
): readonly IEvidenceRecord[] {
  const synthetic = isSynthetic(scenario);
  return reconciliation.items.map((item, index) => ({
    id: `recon-${reconciliation.nodeId}-${index}`,
    kind: 'reconciliation' as const,
    label: item.label,
    detail: item.description,
    amountPaise: item.amountPaise,
    amountDisplay: formatCrore(item.amountPaise),
    sourceLabel: scenario.sourceLabel,
    synthetic
  }));
}

export function buildEvidenceBundle(
  scenario: ISchemeScenario,
  node: IFundingNode,
  transfers: readonly ITransfer[],
  reconciliation: IReconciliation | undefined
): readonly IEvidenceRecord[] {
  const records: IEvidenceRecord[] = [...buildNodeEvidence(scenario, node)];
  for (const transfer of transfers) {
    records.push(buildTransferEvidence(scenario, transfer));
  }
  if (reconciliation) {
    records.push(...buildReconciliationEvidence(scenario, reconciliation));
  }
  return records;
}
