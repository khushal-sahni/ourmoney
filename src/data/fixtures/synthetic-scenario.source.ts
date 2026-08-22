import type { ISchemeScenario } from '../../domain/fund-flow';
import type { IFundFlowSource } from '../sources/fund-flow-source';

/** 1 crore rupees expressed in paise. */
const CRORE = 1_000_000_000;

export class SyntheticScenarioSource implements IFundFlowSource {
  public async loadScenario(): Promise<ISchemeScenario> {
    return SYNTHETIC_SCENARIO;
  }
}

const SYNTHETIC_SCENARIO: ISchemeScenario = {
  schemeName: 'Community Water Access Mission',
  schemeCode: 'CWAM–26',
  period: 'FY 2026–27 · Quarter 1',
  sourceLabel: 'Synthetic demonstration scenario · no live government data',
  nodes: [
    {
      id: 'india',
      name: 'National programme account',
      shortName: 'Central release',
      level: 'national',
      receivedPaise: 140 * CRORE,
      reportedPaise: 140 * CRORE,
      reportedAt: '12 Jul 2026',
      unpublishedPaise: 5 * CRORE
    },
    {
      id: 'sundar',
      name: 'Sundar Pradesh state account',
      shortName: 'Sundar Pradesh',
      level: 'state',
      receivedPaise: 78 * CRORE,
      reportedPaise: 78 * CRORE,
      reportedAt: '19 Jul 2026',
      parentId: 'india',
      unpublishedPaise: 8 * CRORE
    },
    {
      id: 'aravali',
      name: 'Aravali state account',
      shortName: 'Aravali',
      level: 'state',
      receivedPaise: 36 * CRORE,
      reportedPaise: 36 * CRORE,
      reportedAt: '20 Jul 2026',
      parentId: 'india'
    },
    {
      id: 'malwa',
      name: 'Malwa state account',
      shortName: 'Malwa',
      level: 'state',
      receivedPaise: 21 * CRORE,
      reportedPaise: 21 * CRORE,
      reportedAt: '21 Jul 2026',
      parentId: 'india'
    },
    {
      id: 'nadi',
      name: 'Nadi district programme unit',
      shortName: 'Nadi',
      level: 'district',
      receivedPaise: 28 * CRORE,
      reportedPaise: 24.2 * CRORE,
      reportedAt: '02 Aug 2026',
      parentId: 'sundar'
    },
    {
      id: 'pahar',
      name: 'Pahar district programme unit',
      shortName: 'Pahar',
      level: 'district',
      receivedPaise: 22 * CRORE,
      reportedPaise: 22 * CRORE,
      reportedAt: '04 Aug 2026',
      parentId: 'sundar'
    },
    {
      id: 'maidan',
      name: 'Maidan district programme unit',
      shortName: 'Maidan',
      level: 'district',
      receivedPaise: 20 * CRORE,
      reportedPaise: 19.4 * CRORE,
      reportedAt: '01 Aug 2026',
      parentId: 'sundar'
    },
    {
      id: 'teer',
      name: 'Teer district programme unit',
      shortName: 'Teer',
      level: 'district',
      receivedPaise: 19 * CRORE,
      reportedPaise: 18.1 * CRORE,
      reportedAt: '03 Aug 2026',
      parentId: 'aravali'
    },
    {
      id: 'khet',
      name: 'Khet district programme unit',
      shortName: 'Khet',
      level: 'district',
      receivedPaise: 17 * CRORE,
      reportedPaise: 16.5 * CRORE,
      reportedAt: '05 Aug 2026',
      parentId: 'aravali'
    },
    {
      id: 'ghat',
      name: 'Ghat district programme unit',
      shortName: 'Ghat',
      level: 'district',
      receivedPaise: 14 * CRORE,
      reportedPaise: 13.2 * CRORE,
      reportedAt: '06 Aug 2026',
      parentId: 'malwa'
    },
    {
      id: 'ridge',
      name: 'Ridge district programme unit',
      shortName: 'Ridge',
      level: 'district',
      receivedPaise: 7 * CRORE,
      reportedPaise: 6.4 * CRORE,
      reportedAt: '07 Aug 2026',
      parentId: 'malwa'
    },
    {
      id: 'neem',
      name: 'Neem watershed works agency',
      shortName: 'Neem agency',
      level: 'agency',
      receivedPaise: 13 * CRORE,
      reportedPaise: 12.4 * CRORE,
      reportedAt: '31 Jul 2026',
      parentId: 'nadi'
    },
    {
      id: 'savera',
      name: 'Savera village works agency',
      shortName: 'Savera agency',
      level: 'agency',
      receivedPaise: 15 * CRORE,
      reportedPaise: 11.6 * CRORE,
      reportedAt: '26 Jul 2026',
      parentId: 'nadi',
      unpublishedPaise: 3.4 * CRORE
    }
  ],
  transfers: [
    { id: 't1', fromNodeId: 'india', toNodeId: 'sundar', amountPaise: 78 * CRORE, date: '18 Jul 2026', reference: 'CWAM/SUN/0718' },
    { id: 't2', fromNodeId: 'india', toNodeId: 'aravali', amountPaise: 36 * CRORE, date: '19 Jul 2026', reference: 'CWAM/ARA/0719' },
    { id: 't3', fromNodeId: 'india', toNodeId: 'malwa', amountPaise: 21 * CRORE, date: '19 Jul 2026', reference: 'CWAM/MAL/0719' },
    { id: 't4', fromNodeId: 'sundar', toNodeId: 'nadi', amountPaise: 28 * CRORE, date: '23 Jul 2026', reference: 'SUN/NAD/0723' },
    { id: 't5', fromNodeId: 'sundar', toNodeId: 'pahar', amountPaise: 22 * CRORE, date: '24 Jul 2026', reference: 'SUN/PAH/0724' },
    { id: 't6', fromNodeId: 'sundar', toNodeId: 'maidan', amountPaise: 20 * CRORE, date: '24 Jul 2026', reference: 'SUN/MAI/0724' },
    { id: 't7', fromNodeId: 'aravali', toNodeId: 'teer', amountPaise: 19 * CRORE, date: '25 Jul 2026', reference: 'ARA/TEE/0725' },
    { id: 't8', fromNodeId: 'aravali', toNodeId: 'khet', amountPaise: 17 * CRORE, date: '25 Jul 2026', reference: 'ARA/KHE/0725' },
    { id: 't9', fromNodeId: 'malwa', toNodeId: 'ghat', amountPaise: 14 * CRORE, date: '26 Jul 2026', reference: 'MAL/GHA/0726' },
    { id: 't10', fromNodeId: 'malwa', toNodeId: 'ridge', amountPaise: 7 * CRORE, date: '26 Jul 2026', reference: 'MAL/RID/0726' },
    { id: 't11', fromNodeId: 'nadi', toNodeId: 'neem', amountPaise: 13 * CRORE, date: '28 Jul 2026', reference: 'NAD/NEE/0728' },
    { id: 't12', fromNodeId: 'nadi', toNodeId: 'savera', amountPaise: 15 * CRORE, date: '28 Jul 2026', reference: 'NAD/SAV/0728' }
  ],
  reconciliations: [
    {
      nodeId: 'nadi',
      status: 'needs-explanation',
      items: [
        { label: 'Reported programme spend', amountPaise: 20.1 * CRORE, description: 'Works and supplies recorded by the district unit.' },
        { label: 'Reported unspent balance', amountPaise: 4.1 * CRORE, description: 'Balance recorded as held for planned works.' },
        { label: 'Late agency utilisation report', amountPaise: 2.0 * CRORE, description: 'Expected agency report has not yet been filed in this scenario.' },
        { label: 'Unmatched record', amountPaise: 1.8 * CRORE, description: 'A reported transfer has no matching downstream reference yet.' }
      ]
    },
    {
      nodeId: 'savera',
      status: 'watch',
      items: [
        { label: 'Reported works', amountPaise: 11.6 * CRORE, description: 'Agency work record received.' },
        { label: 'Awaiting utilisation update', amountPaise: 3.4 * CRORE, description: 'Transfer is recent; a later report is expected.' }
      ]
    },
    {
      nodeId: 'sundar',
      status: 'watch',
      items: [
        { label: 'Traced to districts', amountPaise: 70 * CRORE, description: 'Published onward splits to district programme units.' },
        { label: 'Awaiting onward details', amountPaise: 8 * CRORE, description: 'State report lists a balance whose district split is not yet published.' }
      ]
    }
  ]
};
