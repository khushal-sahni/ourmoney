import type { ICitizenStanding } from './citizen-standing';
import type {
  BodyKind,
  IFundingNode,
  IReconciliation,
  ISchemeScenario,
  ITransfer,
  NodeLevel
} from './fund-flow';
import { bodyKindLabel } from './fund-flow';
import { formatCrore } from '../utils/money';

export type RtiJurisdiction = 'central' | 'state';
export type RtiFilingChannel = 'rtionline' | 'state-portal' | 'physical';

export interface IRtiAuthority {
  readonly publicAuthority: string;
  readonly pioDesignation: string;
  readonly appellateDesignation: string;
  readonly jurisdiction: RtiJurisdiction;
  readonly filingChannel: RtiFilingChannel;
  readonly filingUrl?: string;
}

export interface IRtiPoint {
  readonly id: string;
  readonly text: string;
  readonly source: 'standing' | 'reconciliation' | 'transfer' | 'base';
}

export interface IRtiStatutoryInfo {
  readonly feeRupees: number;
  readonly bplExempt: true;
  readonly replyDays: number;
  readonly lifeLibertyHours: number;
  readonly firstAppealDays: number;
  readonly secondAppealDays: number;
  readonly deemedRefusalNote: string;
}

export const RTI_STATUTORY: IRtiStatutoryInfo = {
  feeRupees: 10,
  bplExempt: true,
  replyDays: 30,
  lifeLibertyHours: 48,
  firstAppealDays: 30,
  secondAppealDays: 90,
  deemedRefusalNote:
    'If no reply is received within the statutory period, the application is treated as a deemed refusal and you may file a first appeal.'
};

/** rtionline.gov.in "Text of Application" field limit. */
export const RTI_TEXT_OF_APPLICATION_LIMIT = 3000;

export interface IRtiApplicationParts {
  readonly subject: string;
  readonly textOfApplication: string;
  readonly annexure?: string;
  readonly fullText: string;
  readonly charCount: number;
  readonly exceedsLimit: boolean;
}

function placeLabel(node: IFundingNode): string {
  return node.shortName || node.name;
}

function authorityNameForBody(bodyKind: BodyKind | undefined, node: IFundingNode): string {
  const label = bodyKindLabel(bodyKind);
  if (label) return `${label}, ${placeLabel(node)}`;
  return node.name;
}

function channelForLevel(level: NodeLevel, schemeKind: ISchemeScenario['schemeKind']): {
  jurisdiction: RtiJurisdiction;
  filingChannel: RtiFilingChannel;
  filingUrl?: string;
} {
  if (level === 'national' || schemeKind === 'central-dbt') {
    return {
      jurisdiction: 'central',
      filingChannel: 'rtionline',
      filingUrl: 'https://rtionline.gov.in/'
    };
  }
  if (level === 'state') {
    return {
      jurisdiction: 'state',
      filingChannel: 'state-portal'
    };
  }
  return {
    jurisdiction: 'state',
    filingChannel: 'physical'
  };
}

export function resolveRtiAuthority(
  scenario: ISchemeScenario,
  node: IFundingNode
): IRtiAuthority {
  const channel = channelForLevel(node.level, scenario.schemeKind);
  const authority = authorityNameForBody(node.bodyKind, node);
  const body = bodyKindLabel(node.bodyKind) ?? node.name;

  return {
    publicAuthority: authority,
    pioDesignation: `Public Information Officer, ${body}`,
    appellateDesignation: `First Appellate Authority, ${body}`,
    jurisdiction: channel.jurisdiction,
    filingChannel: channel.filingChannel,
    filingUrl: channel.filingUrl
  };
}

function parentNode(scenario: ISchemeScenario, node: IFundingNode): IFundingNode | undefined {
  if (!node.parentId) return undefined;
  return scenario.nodes.find((candidate) => candidate.id === node.parentId);
}

function inboundTransfers(scenario: ISchemeScenario, nodeId: string): readonly ITransfer[] {
  return scenario.transfers.filter((transfer) => transfer.toNodeId === nodeId);
}

export function buildRtiPoints(
  scenario: ISchemeScenario,
  node: IFundingNode,
  standing: ICitizenStanding,
  reconciliation?: IReconciliation
): readonly IRtiPoint[] {
  const points: IRtiPoint[] = [];
  const period = scenario.period;
  const parent = parentNode(scenario, node);
  const transfersIn = inboundTransfers(scenario, node.id);

  points.push({
    id: 'uc',
    source: 'base',
    text:
      `Certified copies of the utilisation certificates / expenditure statements submitted by `
      + `${node.name} for the period ${period}, showing amounts received and amounts reported as utilised.`
  });

  if (parent) {
    points.push({
      id: 'releases',
      source: 'transfer',
      text:
        `Date-wise list of releases from ${parent.name} to ${node.name} during ${period}, `
        + `including sanction / transfer reference numbers and amounts.`
    });
  } else if (transfersIn.length > 0) {
    points.push({
      id: 'releases',
      source: 'transfer',
      text:
        `Date-wise list of releases credited to ${node.name} during ${period}, `
        + `including sanction / transfer reference numbers and amounts.`
    });
  }

  if (standing.ledgerOpenPaise > 0) {
    points.push({
      id: 'unspent',
      source: 'standing',
      text:
        `The amount lying unspent / still on the books of ${node.name} as on the latest available `
        + `reporting date (${node.reportedAt}), with the ledger balance recorded as `
        + `${formatCrore(standing.ledgerOpenPaise)} in the published reports.`
    });
  }

  if (standing.unnamedNextPaise > 0) {
    points.push({
      id: 'unnamed',
      source: 'standing',
      text:
        `Particulars of any onward offices or implementing units that received funds from `
        + `${node.name} during ${period} but are not named in the published reports, `
        + `including amounts and sanction references (reported unnamed share: `
        + `${formatCrore(standing.unnamedNextPaise)}).`
    });
  }

  if (reconciliation) {
    for (const [index, item] of reconciliation.items.entries()) {
      const pendingLanguage = /pending|late|unmatched|signatory|FTO|returned|unreleased/i.test(
        `${item.label} ${item.description}`
      );
      if (!pendingLanguage && reconciliation.status === 'clear') continue;
      points.push({
        id: `recon-${index}`,
        source: 'reconciliation',
        text:
          `Current status, file notings, and supporting records relating to `
          + `"${item.label}" (${formatCrore(item.amountPaise)}) at ${node.name}: ${item.description}`
      });
    }
  }

  const ftoTransfers = transfersIn.filter((transfer) => /FTO|fto|APBS|credit/i.test(transfer.reference));
  for (const [index, transfer] of ftoTransfers.slice(0, 2).entries()) {
    points.push({
      id: `fto-${index}`,
      source: 'transfer',
      text:
        `Current status and file notings on transfer / FTO reference ${transfer.reference} `
        + `(${formatCrore(transfer.amountPaise)}, dated ${transfer.date}), including any pending `
        + `second-signatory or credit-file action.`
    });
  }

  if (points.length < 2) {
    points.push({
      id: 'standing-summary',
      source: 'standing',
      text:
        `A certified extract of the reported fund standing of ${node.name} for ${period}, `
        + `showing received, sent onward, used here, and amounts still on the ledger.`
    });
  }

  return points;
}

export function assembleRtiApplication(input: {
  readonly authority: IRtiAuthority;
  readonly scenario: ISchemeScenario;
  readonly node: IFundingNode;
  readonly points: readonly string[];
  readonly applicantName?: string;
  readonly applicantAddress?: string;
  readonly isBpl?: boolean;
}): IRtiApplicationParts {
  const { authority, scenario, node, points, applicantName, applicantAddress, isBpl } = input;
  const subject =
    `Request for information under the RTI Act, 2005 — reported fund standing of `
    + `${node.shortName} under ${scenario.schemeName} (${scenario.period})`;

  const bodyLines = [
    `To: ${authority.pioDesignation}`,
    `Public Authority: ${authority.publicAuthority}`,
    '',
    `Scheme: ${scenario.schemeName} (${scenario.schemeCode})`,
    `Period: ${scenario.period}`,
    `Office / place: ${node.name}`,
    '',
    'Under Section 6(1) of the Right to Information Act, 2005, I request certified copies / information on the following records:',
    '',
    ...points.map((point, index) => `${index + 1}. ${point}`),
    '',
    'I am an Indian citizen. Please provide the information in electronic form where available.',
    isBpl
      ? 'I claim exemption from the application fee as a person below the poverty line (BPL). Supporting proof will be attached at filing.'
      : `Application fee of Rs ${RTI_STATUTORY.feeRupees} will be paid as prescribed.`,
    '',
    applicantName ? `Name: ${applicantName}` : 'Name: [Your name]',
    applicantAddress ? `Address: ${applicantAddress}` : 'Address: [Your postal address]',
    '',
    'Note: This draft was generated by the ourmoney independent prototype. '
      + (scenario.provenance === 'public-record'
        ? 'Figures reflect a reconstructed public MIS extract, not a live government connection. '
        : 'Figures and place names reflect a synthetic demonstration scenario, not live government records. ')
      + 'It does not allege wrongdoing. Review and edit before filing. Nothing is filed automatically.',
    `Last reported in scenario: ${node.reportedAt}`
  ];

  const fullBody = bodyLines.join('\n');
  const preamble =
    `Subject: ${subject}\n\n`
    + `Public Authority: ${authority.publicAuthority}\n`
    + `PIO: ${authority.pioDesignation}\n\n`;

  if (fullBody.length <= RTI_TEXT_OF_APPLICATION_LIMIT) {
    return {
      subject,
      textOfApplication: fullBody,
      fullText: preamble + fullBody,
      charCount: fullBody.length,
      exceedsLimit: false
    };
  }

  const head =
    `To: ${authority.pioDesignation}\n`
    + `Public Authority: ${authority.publicAuthority}\n\n`
    + `Scheme: ${scenario.schemeName} (${scenario.schemeCode}) · Period: ${scenario.period}\n`
    + `Office: ${node.name}\n\n`
    + 'Under Section 6(1) of the RTI Act, 2005, I request the records listed in Annexure A '
    + '(attached / pasted below the character limit of this portal field).\n\n'
    + (applicantName ? `Name: ${applicantName}\n` : 'Name: [Your name]\n')
    + (applicantAddress ? `Address: ${applicantAddress}\n` : 'Address: [Your postal address]\n')
    + (isBpl
      ? 'BPL fee exemption claimed.\n'
      : `Fee: Rs ${RTI_STATUTORY.feeRupees}.\n`)
    + '\nSynthetic demo draft — review before filing. Does not allege wrongdoing.';

  const annexure =
    'Annexure A — Detailed information sought\n\n'
    + points.map((point, index) => `${index + 1}. ${point}`).join('\n\n')
    + `\n\nLast reported in scenario: ${node.reportedAt}`;

  const clipped = head.slice(0, RTI_TEXT_OF_APPLICATION_LIMIT);

  return {
    subject,
    textOfApplication: clipped,
    annexure,
    fullText: preamble + clipped + '\n\n' + annexure,
    charCount: clipped.length,
    exceedsLimit: true
  };
}

export function replyDueDate(from: Date = new Date()): Date {
  const due = new Date(from);
  due.setDate(due.getDate() + RTI_STATUTORY.replyDays);
  return due;
}

export function formatFilingChannelLabel(channel: RtiFilingChannel): string {
  switch (channel) {
    case 'rtionline':
      return 'Central portal — rtionline.gov.in';
    case 'state-portal':
      return 'State RTI online portal (or physical filing)';
    case 'physical':
      return 'Physical application to the PIO';
    default: {
      const _exhaustive: never = channel;
      return _exhaustive;
    }
  }
}
