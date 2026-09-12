import type {
  IFundingNode,
  IReconciliation,
  ISchemeScenario,
  ISchemeSummary,
  ITransfer
} from '../../../domain/fund-flow';
import {
  MGNREGA_HP_EXTRACT,
  type IBlockRow,
  type IDistrictRow,
  type IGpRow,
  type IStateExtract
} from './raw/extract';

/** ₹1 lakh = 10_000_000 paise. */
const LAKH_PAISE = 10_000_000;

function lakhToPaise(lakh: number): number {
  return Math.round(lakh * LAKH_PAISE);
}

function utilisationLakh(row: { readonly wageLakh: number; readonly materialLakh: number }): number {
  return row.wageLakh + row.materialLakh;
}

function buildGpNode(gp: IGpRow, parentId: string, asOn: string): IFundingNode {
  const used = utilisationLakh(gp);
  return {
    id: gp.id,
    name: `${gp.name} Gram Panchayat`,
    shortName: gp.name,
    level: 'agency',
    bodyKind: 'gram-panchayat',
    workLabel: 'Gram Panchayat',
    receivedPaise: lakhToPaise(gp.availabilityLakh),
    reportedPaise: lakhToPaise(used),
    reportedAt: asOn,
    parentId,
    usedHereLabel: 'Wages & material'
  };
}

function buildBlockNode(
  block: IBlockRow,
  parentId: string,
  asOn: string
): { readonly node: IFundingNode; readonly childNodes: readonly IFundingNode[] } {
  const gps = block.gps ?? [];
  if (gps.length > 0) {
    const childNodes = gps.map((gp) => buildGpNode(gp, block.id, asOn));
    const childSum = childNodes.reduce((sum, child) => sum + child.receivedPaise, 0);
    const adminPaise = lakhToPaise(block.adminLakh);
    const availabilityPaise = lakhToPaise(block.availabilityLakh);
    // Raise received when MIS availability equals child sum so admin still fits the citizen equation.
    const received = Math.max(availabilityPaise, childSum + adminPaise);
    const unpublished = Math.max(0, received - childSum - adminPaise);
    return {
      node: {
        id: block.id,
        name: `${block.name} Block Programme Officer`,
        shortName: block.name,
        level: 'block',
        bodyKind: 'programme-officer',
        workLabel: 'Programme Officer',
        receivedPaise: received,
        reportedPaise: childSum,
        reportedAt: asOn,
        parentId,
        usedHerePaise: adminPaise,
        usedHereLabel: 'Admin',
        unpublishedPaise: unpublished
      },
      childNodes
    };
  }

  const used = utilisationLakh(block) + block.adminLakh;
  return {
    node: {
      id: block.id,
      name: `${block.name} Block Programme Officer`,
      shortName: block.name,
      level: 'block',
      bodyKind: 'programme-officer',
      workLabel: 'Programme Officer',
      receivedPaise: lakhToPaise(block.availabilityLakh),
      reportedPaise: lakhToPaise(used),
      reportedAt: asOn,
      parentId,
      usedHereLabel: 'Wages, material & admin'
    },
    childNodes: []
  };
}

function buildDistrict(
  district: IDistrictRow,
  parentId: string,
  asOn: string
): { readonly node: IFundingNode; readonly descendants: readonly IFundingNode[] } {
  const blockBuilds = district.blocks.map((block) => buildBlockNode(block, district.id, asOn));
  const blockNodes = blockBuilds.map((entry) => entry.node);
  const gpNodes = blockBuilds.flatMap((entry) => entry.childNodes);
  const childSum = blockNodes.reduce((sum, child) => sum + child.receivedPaise, 0);
  const adminPaise = lakhToPaise(district.adminLakh);
  const availabilityPaise = lakhToPaise(district.availabilityLakh);
  const received = Math.max(availabilityPaise, childSum + adminPaise);
  const unpublished = Math.max(0, received - childSum - adminPaise);

  return {
    node: {
      id: district.id,
      name: district.name,
      shortName: district.name.replace(/ District Programme Coordinator$/, ''),
      level: 'district',
      bodyKind: 'district-programme-coordinator',
      workLabel: 'DPC',
      receivedPaise: received,
      reportedPaise: childSum,
      reportedAt: asOn,
      parentId,
      usedHerePaise: adminPaise,
      usedHereLabel: 'Admin',
      unpublishedPaise: unpublished
    },
    descendants: [...blockNodes, ...gpNodes]
  };
}

function buildTransfers(
  extract: IStateExtract,
  nodes: readonly IFundingNode[],
  asOn: string
): readonly ITransfer[] {
  const transfers: ITransfer[] = [];
  let index = 1;
  for (const node of nodes) {
    if (!node.parentId) continue;
    transfers.push({
      id: `hp-t${index}`,
      fromNodeId: node.parentId,
      toNodeId: node.id,
      amountPaise: node.receivedPaise,
      date: asOn,
      reference: `MIS/funddisreport/${node.id.toUpperCase()}/FY2025-26`,
      component: node.level === 'agency' ? 'wage' : node.level === 'state' ? 'wage' : 'wage'
    });
    index += 1;
  }
  return transfers;
}

function buildReconciliations(extract: IStateExtract): readonly IReconciliation[] {
  const items: IReconciliation[] = [];

  if ((extract.state.paymentDueLakh ?? 0) > 0) {
    items.push({
      nodeId: extract.state.id,
      status: 'watch',
      items: [
        {
          label: 'Payment due on MIS',
          amountPaise: lakhToPaise(extract.state.paymentDueLakh ?? 0),
          description:
            'Muster rolls / bills entered on the Financial Statement whose payment date is not yet entered.'
        }
      ]
    });
  }

  for (const district of extract.districts) {
    if ((district.paymentDueLakh ?? 0) > 0) {
      items.push({
        nodeId: district.id,
        status: 'watch',
        items: [
          {
            label: 'Payment due on MIS',
            amountPaise: lakhToPaise(district.paymentDueLakh ?? 0),
            description:
              'District Financial Statement shows payment due — vouchers entered without a payment date.'
          }
        ]
      });
    }
  }

  const mashobra = extract.districts
    .flatMap((district) => district.blocks)
    .find((block) => block.id === 'mashobra');
  if (mashobra?.gps) {
    for (const gp of mashobra.gps) {
      if ((gp.paymentDueLakh ?? 0) <= 0) continue;
      items.push({
        nodeId: gp.id,
        status: gp.id === 'gp-mashobra' || gp.id === 'gp-dhalli' ? 'needs-explanation' : 'watch',
        items: [
          {
            label: 'Wage / material utilisation reported',
            amountPaise: lakhToPaise(utilisationLakh(gp)),
            description: 'Reported wage and material expenditure at this gram panchayat on the MIS extract.'
          },
          {
            label: 'Payment due on MIS',
            amountPaise: lakhToPaise(gp.paymentDueLakh ?? 0),
            description:
              'Financial Statement column: MR / bills entered but payment date not yet entered.'
          }
        ]
      });
    }
  }

  items.push({
    nodeId: 'india',
    status: 'clear',
    items: [
      {
        label: 'Other states not in this extract',
        amountPaise: lakhToPaise(
          extract.nationalAvailabilityLakh - extract.state.availabilityLakh
        ),
        description:
          'This live view names only Himachal Pradesh. Remaining national availability is not expanded here.'
      }
    ]
  });

  return items;
}

export function buildMgnregaHpScenario(
  extract: IStateExtract = MGNREGA_HP_EXTRACT
): ISchemeScenario {
  const asOn = extract.asOnLabel;
  const districtBuilds = extract.districts.map((district) =>
    buildDistrict(district, extract.state.id, asOn)
  );
  const districtNodes = districtBuilds.map((entry) => entry.node);
  const lowerNodes = districtBuilds.flatMap((entry) => entry.descendants);
  const districtSum = districtNodes.reduce((sum, child) => sum + child.receivedPaise, 0);
  const stateAdmin = lakhToPaise(extract.state.adminLakh);
  const stateAvailability = lakhToPaise(extract.state.availabilityLakh);
  const stateReceived = Math.max(stateAvailability, districtSum + stateAdmin);
  const stateUnpublished = Math.max(0, stateReceived - districtSum - stateAdmin);

  const stateNode: IFundingNode = {
    id: extract.state.id,
    name: extract.state.name,
    shortName: extract.state.shortName,
    level: 'state',
    bodyKind: 'segf',
    workLabel: 'SEGF · SNA',
    receivedPaise: stateReceived,
    reportedPaise: districtSum,
    reportedAt: asOn,
    parentId: 'india',
    usedHerePaise: stateAdmin,
    usedHereLabel: 'Admin',
    unpublishedPaise: stateUnpublished
  };

  const nationalReceived = lakhToPaise(extract.nationalAvailabilityLakh);
  const nationalUnpublished = Math.max(0, nationalReceived - stateReceived);

  const nationalNode: IFundingNode = {
    id: 'india',
    name: 'National Mahatma Gandhi NREGA programme account',
    shortName: 'Central release',
    level: 'national',
    bodyKind: 'national-account',
    workLabel: 'Programme account',
    receivedPaise: nationalReceived,
    reportedPaise: stateReceived,
    reportedAt: asOn,
    unpublishedPaise: nationalUnpublished
  };

  const nodes: IFundingNode[] = [nationalNode, stateNode, ...districtNodes, ...lowerNodes];
  const transfers = buildTransfers(extract, nodes, asOn);

  return {
    id: extract.schemeId,
    schemeName: extract.schemeName,
    schemeCode: extract.schemeCode,
    schemeKind: 'demand-wage',
    lastMileLabel: 'Gram Panchayat',
    period: extract.period,
    sourceLabel: extract.sourceLabel,
    provenance: 'public-record',
    defaultFocusNodeId: extract.defaultFocusNodeId,
    nodes,
    transfers,
    reconciliations: buildReconciliations(extract)
  };
}

export function buildMgnregaHpSummary(scenario: ISchemeScenario): ISchemeSummary {
  return {
    id: scenario.id,
    schemeName: scenario.schemeName,
    schemeCode: scenario.schemeCode,
    schemeKind: scenario.schemeKind,
    period: scenario.period,
    kindLabel: 'Demand · wage & material · public MIS',
    defaultFocusNodeId: scenario.defaultFocusNodeId
  };
}

export const MGNREGA_HP_SCENARIO = buildMgnregaHpScenario();
export const MGNREGA_HP_SUMMARY = buildMgnregaHpSummary(MGNREGA_HP_SCENARIO);
export const LIVE_DEFAULT_SCHEME_ID = MGNREGA_HP_SCENARIO.id;
export const LIVE_SCENARIOS = [MGNREGA_HP_SCENARIO] as const;
export const LIVE_CATALOG: readonly ISchemeSummary[] = [MGNREGA_HP_SUMMARY];
