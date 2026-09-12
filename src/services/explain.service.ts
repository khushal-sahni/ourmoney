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
import { scenarioProvenance } from '../domain/fund-flow';
import { pathFor } from '../domain/flow-hierarchy';
import { reconciliationStatusLabel } from '../domain/reconciliation-display';
import {
  buildQuestionCorridor,
  corridorNodeIdSet,
  type IQuestionCorridor
} from '../domain/resolve-question-nodes';
import { formatCrore } from '../utils/money';
import type { LedgerService } from './ledger.service';

const SYNTHETIC_DISCLAIMER =
  'All figures are from a synthetic hackathon scenario. This is not live government data.';

const PUBLIC_RECORD_DISCLAIMER =
  'Figures are from a reconstructed public MGNREGA MIS Financial Statement extract for Himachal Pradesh FY 2025–26. Independent prototype — not a government product. Do not allege misconduct.';

function isComparisonQuestion(question: string): boolean {
  const q = question.toLowerCase();
  return (
    q.includes('most')
    || q.includes('highest')
    || q.includes('maximum')
    || q.includes('top ')
    || q.includes('which village')
    || q.includes('which district')
    || q.includes('which place')
    || q.includes('सबसे')
    || q.includes('किस गाँव')
    || q.includes('किस जिले')
  );
}

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

function mapTransfers(
  transfers: readonly ITransfer[],
  focusNodeId: string
): IGroundedExplainSlice['transfers'] {
  return transfers.slice(0, 6).map((transfer) => ({
    reference: transfer.reference,
    amountCrore: formatCrore(transfer.amountPaise),
    date: transfer.date,
    direction: transfer.toNodeId === focusNodeId ? 'in' : 'out'
  }));
}

function transfersAlongCorridor(
  scenario: ISchemeScenario,
  corridor: IQuestionCorridor
): readonly ITransfer[] {
  const corridorIds = corridorNodeIdSet(corridor);
  return scenario.transfers.filter(
    (transfer) => corridorIds.has(transfer.fromNodeId) && corridorIds.has(transfer.toNodeId)
  );
}

export function buildGroundedSlice(
  ledger: LedgerService,
  context: IExplainContext,
  options?: {
    readonly pathNodes?: readonly IFundingNode[];
    readonly mentionedNodeIds?: readonly string[];
    readonly relatedNodes?: readonly IFundingNode[];
    readonly transfers?: readonly ITransfer[];
  }
): IGroundedExplainSlice {
  const { scenario, node, standing, reconciliation, transfers, locale } = context;
  const pathNodes = options?.pathNodes ?? pathFor(scenario, node);
  const pathIds = new Set(pathNodes.map((pathNode) => pathNode.id));
  const children = scenario.nodes.filter((candidate) => candidate.parentId === node.id);
  const relatedNodes = (options?.relatedNodes ?? []).filter((related) => !pathIds.has(related.id));
  const transferRows = options?.transfers ?? transfers;

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
    mentionedNodeIds: options?.mentionedNodeIds,
    related: relatedNodes.length > 0
      ? relatedNodes.map((related) => nodeSlice(scenario, related))
      : undefined,
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
    transfers: mapTransfers(transferRows, node.id),
    syntheticDisclaimer: scenarioProvenance(scenario) === 'public-record'
      ? PUBLIC_RECORD_DISCLAIMER
      : SYNTHETIC_DISCLAIMER
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
  const focus = slice.path.find((step) => step.id === slice.focusNodeId) ?? slice.path[slice.path.length - 1];
  const citedNodeIds = slice.mentionedNodeIds?.length
    ? [...slice.mentionedNodeIds]
    : slice.path.map((step) => step.id);
  const q = question.toLowerCase();
  const ranked = slice.related ?? [];
  const topNamed = ranked[0];

  const endpointNames = citedNodeIds
    .map((nodeId) =>
      slice.path.find((step) => step.id === nodeId)
      ?? slice.related?.find((step) => step.id === nodeId)
    )
    .filter((step): step is IGroundedNodeSlice => step !== undefined)
    .map((step) => step.shortName);

  let answer: string;
  let answerCitedIds = citedNodeIds;
  let followUps = slice.locale === 'hi'
    ? ['अगले कार्यालय का नाम क्यों नहीं दिख रहा?', 'यहाँ कितना उपयोग हुआ?']
    : ['What is still on this ledger?', 'Which transfers connect here?'];

  if (isComparisonQuestion(question) && topNamed) {
    const runners = ranked.slice(1, 3).map((step) => `${step.shortName} (${step.receivedCrore})`).join(', ');
    if (slice.locale === 'hi') {
      answer = `${slice.schemeName} (${slice.period}) में नामित जिला कार्यालयों में सबसे अधिक ${topNamed.shortName} को ${topNamed.receivedCrore} रिपोर्ट किए गए।`
        + (runners ? ` इसके बाद: ${runners}.` : '')
        + ' यह केवल इस सिंथेटिक लेजर पर नामित कार्यालय हैं — पूरी गाँव सूची नहीं।';
    } else {
      answer = `Among named district offices in ${slice.schemeName} (${slice.period}), `
        + `${topNamed.shortName} shows the highest reported receipt at ${topNamed.receivedCrore}.`
        + (runners ? ` Next: ${runners}.` : '')
        + ' These are named offices on this synthetic ledger — not a complete village ranking.';
    }
    answerCitedIds = [topNamed.id, ...ranked.slice(1, 3).map((step) => step.id)];
    followUps = slice.locale === 'hi'
      ? [`${topNamed.shortName} के लिए पैसा कहाँ गया?`, 'और कौन-से जिले नामित हैं?']
      : [`Where did the reported money go for ${topNamed.shortName}?`, 'What is still on this ledger at the top district?'];
  } else if (slice.locale === 'hi') {
    if (q.includes('late') || q.includes('देर') || q.includes('util')) {
      answer = slice.reconciliation
        ? `${focus?.shortName ?? 'इस नोड'} पर रिपोर्ट स्थिति "${slice.reconciliation.status}" है। `
          + `${slice.reconciliation.items.map((item) => item.description).join(' ')}`
        : slice.standing.inspectorSummary;
    } else if (endpointNames.length >= 2) {
      answer = `${endpointNames[0]} और ${endpointNames[endpointNames.length - 1]} के बीच ${slice.schemeName} (${slice.period}) में `
        + `${focus?.receivedCrore ?? ''} तक की रिपोर्ट दिखती है। ${slice.standing.inspectorSummary}`;
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
  } else if (endpointNames.length >= 2) {
    answer = `Between ${endpointNames[0]} and ${endpointNames[endpointNames.length - 1]} in ${slice.schemeName} (${slice.period}), `
      + `${focus?.shortName ?? 'this office'} shows ${focus?.receivedCrore ?? ''} received on this ledger. `
      + slice.standing.inspectorSummary
      + ' Answer grounded in synthetic demonstration data only.';
  } else {
    answer = `${focus?.shortName ?? 'This node'} received ${focus?.receivedCrore ?? ''} in this scenario. `
      + slice.standing.inspectorSummary
      + ' Answer grounded in synthetic demonstration data only.';
  }

  return { answer, citedNodeIds: answerCitedIds, followUps, source: 'template' };
}

export function formatCitationLabels(
  slice: IGroundedExplainSlice,
  citedNodeIds: readonly string[]
): readonly string[] {
  const lookup = new Map<string, string>();
  for (const step of slice.path) {
    lookup.set(step.id, step.shortName);
  }
  for (const step of slice.related ?? []) {
    lookup.set(step.id, step.shortName);
  }
  for (const step of slice.children) {
    lookup.set(step.id, step.shortName);
  }

  return citedNodeIds.map((nodeId) => lookup.get(nodeId) ?? nodeId);
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

  public buildAskSlice(
    scenario: ISchemeScenario,
    selectedNodeId: string,
    question: string,
    locale: ExplainLocale,
    options?: { readonly relatedNodes?: readonly IFundingNode[] }
  ): IGroundedExplainSlice {
    const corridor = buildQuestionCorridor(scenario, question, selectedNodeId);
    const focusNode = this.ledger.findNode(scenario, corridor.focusNodeId);
    if (!focusNode) {
      throw new Error(`Node ${corridor.focusNodeId} not found`);
    }

    const focusPath = pathFor(scenario, focusNode);
    const pathIds = new Set(focusPath.map((step) => step.id));
    const corridorRelated = corridor.mentionedNodeIds
      .map((nodeId) => this.ledger.findNode(scenario, nodeId))
      .filter((node): node is IFundingNode => node !== undefined && !pathIds.has(node.id));
    const extraRelated = (options?.relatedNodes ?? []).filter((node) => !pathIds.has(node.id));
    const relatedById = new Map<string, IFundingNode>();
    for (const node of [...corridorRelated, ...extraRelated]) {
      relatedById.set(node.id, node);
    }
    const relatedNodes = [...relatedById.values()];

    const corridorTransfers = corridor.mentionedNodeIds.length >= 2
      ? transfersAlongCorridor(scenario, corridor)
      : this.ledger.transfersFor(scenario, focusNode.id);

    return buildGroundedSlice(this.ledger, {
      scenario,
      node: focusNode,
      standing: citizenStanding(scenario, focusNode),
      reconciliation: this.ledger.reconciliationFor(scenario, focusNode.id),
      transfers: corridorTransfers,
      locale
    }, {
      pathNodes: corridor.corridorNodes,
      mentionedNodeIds: corridor.mentionedNodeIds.length > 0 ? corridor.mentionedNodeIds : undefined,
      relatedNodes,
      transfers: corridorTransfers
    });
  }

  public async narrate(slice: IGroundedExplainSlice): Promise<INarrateResponse> {
    try {
      const result = await postJson<{ narration?: string; source?: INarrateResponse['source'] }>(
        '/api/narrate',
        { slice }
      );
      const narration = result.narration?.trim();
      if (!narration) {
        return { narration: templateNarration(slice), source: 'template' };
      }
      return { narration, source: result.source ?? 'model' };
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
