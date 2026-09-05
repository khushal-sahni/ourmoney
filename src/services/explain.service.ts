import { citizenStanding } from '../domain/citizen-standing';
import type {
  IAskResponse,
  IExplainContext,
  IGroundedExplainSlice,
  IGroundedNodeSlice,
  INarrateResponse,
  ExplainLocale
} from '../domain/explain-types';
import type { IFundingNode, ISchemeScenario, ITransfer } from '../domain/fund-flow';
import { reconciliationStatusLabel } from '../domain/reconciliation-display';
import { pathFor } from '../domain/flow-hierarchy';
import { formatCrore } from '../utils/money';
import type { LedgerService } from './ledger.service';

const SYNTHETIC_DISCLAIMER =
  'All figures are from a synthetic hackathon scenario. This is not live government data.';

function nodeSlice(scenario: ISchemeScenario, node: IFundingNode): IGroundedNodeSlice {
  const standing = citizenStanding(scenario, node);
  const levelWord = node.level === 'agency' ? scenario.lastMileLabel.toLowerCase() : node.level;
  return {
    id: node.id,
    shortName: node.shortName,
    level: levelWord,
    workLabel: node.workLabel,
    receivedCrore: formatCrore(standing.receivedPaise),
    sentOnwardCrore: formatCrore(standing.sentOnwardPaise),
    usedHereCrore: formatCrore(standing.usedHerePaise),
    leftCrore: formatCrore(standing.ledgerOpenPaise),
    reportedAt: node.reportedAt
  };
}

export function buildGroundedSlice(
  ledger: LedgerService,
  context: IExplainContext
): IGroundedExplainSlice {
  const { scenario, node, standing, reconciliation, transfers, locale } = context;
  const pathNodes = pathFor(scenario, node);
  const children = scenario.nodes.filter((candidate) => candidate.parentId === node.id);

  return {
    schemeId: scenario.id,
    schemeName: scenario.schemeName,
    schemeKind: scenario.schemeKind,
    period: scenario.period,
    sourceLabel: scenario.sourceLabel,
    locale,
    focusNodeId: node.id,
    path: pathNodes.map((pathNode) => nodeSlice(scenario, pathNode)),
    children: children.map((child) => nodeSlice(scenario, child)),
    standing: {
      inspectorSummary: standing.inspectorSummary,
      ledgerHint: standing.ledgerHint
    },
    reconciliation: reconciliation
      ? {
          status: reconciliationStatusLabel(reconciliation.status),
          items: reconciliation.items.map((item) => ({
            label: item.label,
            amountCrore: formatCrore(item.amountPaise),
            description: item.description
          }))
        }
      : undefined,
    transfers: transfers.slice(0, 6).map((transfer) => ({
      reference: transfer.reference,
      amountCrore: formatCrore(transfer.amountPaise),
      date: transfer.date,
      direction: transfer.toNodeId === node.id ? 'in' : 'out'
    })),
    syntheticDisclaimer: SYNTHETIC_DISCLAIMER
  };
}

export function templateNarration(slice: IGroundedExplainSlice): string {
  const focus = slice.path[slice.path.length - 1];
  if (!focus) return slice.syntheticDisclaimer;

  const pathNames = slice.path.map((step) => step.shortName).join(' → ');
  const reconLine = slice.reconciliation
    ? ` Reported status: ${slice.reconciliation.status}. ${slice.reconciliation.items[0]?.description ?? ''}`
    : '';

  if (slice.locale === 'hi') {
    return `${focus.shortName} के लिए ${slice.schemeName} (${slice.period}) में ${focus.receivedCrore} रिपोर्ट किए गए। `
      + `रास्ता: ${pathNames}. `
      + `${slice.standing.inspectorSummary}`
      + reconLine
      + ` यह आँकड़े केवल एक काल्पनिक प्रदर्शन परिदृश्य से हैं।`;
  }

  return `Under ${slice.schemeName} (${slice.period}), ${focus.shortName} shows ${focus.receivedCrore} received on this ledger. `
    + `Path: ${pathNames}. `
    + `${slice.standing.inspectorSummary}`
    + reconLine
    + ` All figures are synthetic demonstration data only.`;
}

export function templateAsk(slice: IGroundedExplainSlice, question: string): IAskResponse {
  const focus = slice.path[slice.path.length - 1];
  const citedNodeIds = slice.path.map((step) => step.id);
  const q = question.toLowerCase();

  let answer: string;
  if (slice.locale === 'hi') {
    if (q.includes('late') || q.includes('देर') || q.includes('util')) {
      answer = slice.reconciliation
        ? `${focus?.shortName ?? 'इस नोड'} पर रिपोर्ट स्थिति "${slice.reconciliation.status}" है। `
          + `${slice.reconciliation.items.map((item) => item.description).join(' ')}`
        : slice.standing.inspectorSummary;
    } else {
      answer = `${focus?.shortName ?? 'यह नोड'} पर ${focus?.receivedCrore ?? ''} प्राप्त हुए। ${slice.standing.inspectorSummary}`;
    }
    answer += ' यह केवल काल्पनिक डेमो डेटा है।';
  } else if (q.includes('late') || q.includes('why') || q.includes('util')) {
    answer = slice.reconciliation
      ? `At ${focus?.shortName ?? 'this node'}, reported status is "${slice.reconciliation.status}". `
        + slice.reconciliation.items.map((item) => `${item.label}: ${item.description}`).join(' ')
      : slice.standing.inspectorSummary;
    answer += ' This answer uses only the synthetic ledger shown in the prototype.';
  } else {
    answer = `${focus?.shortName ?? 'This node'} received ${focus?.receivedCrore ?? ''} in this scenario. `
      + slice.standing.inspectorSummary
      + ' Answer grounded in synthetic demonstration data only.';
  }

  const followUps = slice.locale === 'hi'
    ? ['अगले कार्यालय का नाम क्यों नहीं दिख रहा?', 'यहाँ कितना उपयोग हुआ?']
    : ['What is still on this ledger?', 'Which transfers connect here?'];

  return { answer, citedNodeIds, followUps, source: 'template' };
}

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!response.ok) {
    throw new Error(`API ${url} failed: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export class ExplainService {
  public constructor(private readonly ledger: LedgerService) {}

  public buildSlice(
    scenario: ISchemeScenario,
    nodeId: string,
    locale: ExplainLocale
  ): IGroundedExplainSlice {
    const node = this.ledger.findNode(scenario, nodeId);
    if (!node) {
      throw new Error(`Node ${nodeId} not found`);
    }
    return buildGroundedSlice(this.ledger, {
      scenario,
      node,
      standing: citizenStanding(scenario, node),
      reconciliation: this.ledger.reconciliationFor(scenario, nodeId),
      transfers: this.ledger.transfersFor(scenario, nodeId),
      locale
    });
  }

  public async narrate(slice: IGroundedExplainSlice): Promise<INarrateResponse> {
    try {
      const result = await postJson<{ narration: string; source?: INarrateResponse['source'] }>(
        '/api/narrate',
        { slice }
      );
      return { narration: result.narration, source: result.source ?? 'model' };
    } catch {
      return { narration: templateNarration(slice), source: 'template' };
    }
  }

  public async ask(slice: IGroundedExplainSlice, question: string): Promise<IAskResponse> {
    try {
      const result = await postJson<IAskResponse>('/api/ask', { slice, question });
      return result;
    } catch {
      return templateAsk(slice, question);
    }
  }
}
