import type { ISchemeScenario } from '../../domain/fund-flow';
import { CRORE } from './gazetteer';

/**
 * CSS works / SNA-float archetype.
 * Centre → State Water & Sanitation Mission (SNA) → DWSM → block resource centre
 * → Paani Samiti (in-village) / PHED division (bulk).
 * Dense drill-down under Raital; gap: unpublished onward + late utilisation at Piprahi Paani Samiti.
 */
export const WATER_ACCESS_SCENARIO: ISchemeScenario = {
  id: 'water-access',
  schemeName: 'Community Water Access Mission',
  schemeCode: 'CWAM–26',
  schemeKind: 'works-sna',
  lastMileLabel: 'Implementing unit',
  period: 'FY 2026–27 · Quarter 1',
  sourceLabel: 'Synthetic demonstration scenario · no live government data',
  defaultFocusNodeId: 'piprahi-paani',
  nodes: [
    {
      id: 'india',
      name: 'National Community Water Access Mission account',
      shortName: 'Central release',
      level: 'national',
      bodyKind: 'national-account',
      workLabel: 'Programme account',
      receivedPaise: 140 * CRORE,
      reportedPaise: 140 * CRORE,
      reportedAt: '12 Jul 2026',
      unpublishedPaise: 5 * CRORE
    },
    {
      id: 'kanak',
      name: 'Kanak Pradesh State Water and Sanitation Mission (SNA)',
      shortName: 'Kanak Pradesh',
      level: 'state',
      bodyKind: 'swsm',
      workLabel: 'SWSM · SNA',
      receivedPaise: 78 * CRORE,
      reportedPaise: 78 * CRORE,
      reportedAt: '19 Jul 2026',
      parentId: 'india',
      unpublishedPaise: 8 * CRORE
    },
    {
      id: 'girikhand',
      name: 'Girikhand State Water and Sanitation Mission (SNA)',
      shortName: 'Girikhand',
      level: 'state',
      bodyKind: 'swsm',
      workLabel: 'SWSM · SNA',
      receivedPaise: 36 * CRORE,
      reportedPaise: 36 * CRORE,
      reportedAt: '20 Jul 2026',
      parentId: 'india'
    },
    {
      id: 'meera',
      name: 'Meera Coast State Water and Sanitation Mission (SNA)',
      shortName: 'Meera Coast',
      level: 'state',
      bodyKind: 'swsm',
      workLabel: 'SWSM · SNA',
      receivedPaise: 21 * CRORE,
      reportedPaise: 21 * CRORE,
      reportedAt: '21 Jul 2026',
      parentId: 'india'
    },
    // Kanak districts
    {
      id: 'raital',
      name: 'Raital District Water and Sanitation Mission',
      shortName: 'Raital',
      level: 'district',
      bodyKind: 'dwsm',
      workLabel: 'DWSM',
      receivedPaise: 28 * CRORE,
      reportedPaise: 24.2 * CRORE,
      reportedAt: '02 Aug 2026',
      parentId: 'kanak'
    },
    {
      id: 'chandanpur',
      name: 'Chandanpur Kalan District Water and Sanitation Mission',
      shortName: 'Chandanpur Kalan',
      level: 'district',
      bodyKind: 'dwsm',
      workLabel: 'DWSM',
      receivedPaise: 22 * CRORE,
      reportedPaise: 22 * CRORE,
      reportedAt: '04 Aug 2026',
      parentId: 'kanak'
    },
    {
      id: 'morwa',
      name: 'Morwa East District Water and Sanitation Mission',
      shortName: 'Morwa East',
      level: 'district',
      bodyKind: 'dwsm',
      workLabel: 'DWSM',
      receivedPaise: 20 * CRORE,
      reportedPaise: 19.4 * CRORE,
      reportedAt: '01 Aug 2026',
      parentId: 'kanak'
    },
    // Girikhand / Meera districts (shallow)
    {
      id: 'patharwadi',
      name: 'Patharwadi District Water and Sanitation Mission',
      shortName: 'Patharwadi',
      level: 'district',
      bodyKind: 'dwsm',
      workLabel: 'DWSM',
      receivedPaise: 19 * CRORE,
      reportedPaise: 18.1 * CRORE,
      reportedAt: '03 Aug 2026',
      parentId: 'girikhand'
    },
    {
      id: 'sitabari',
      name: 'Sitabari District Water and Sanitation Mission',
      shortName: 'Sitabari',
      level: 'district',
      bodyKind: 'dwsm',
      workLabel: 'DWSM',
      receivedPaise: 17 * CRORE,
      reportedPaise: 16.5 * CRORE,
      reportedAt: '05 Aug 2026',
      parentId: 'girikhand'
    },
    {
      id: 'dhowli',
      name: 'Dhowli District Water and Sanitation Mission',
      shortName: 'Dhowli',
      level: 'district',
      bodyKind: 'dwsm',
      workLabel: 'DWSM',
      receivedPaise: 14 * CRORE,
      reportedPaise: 13.2 * CRORE,
      reportedAt: '06 Aug 2026',
      parentId: 'meera'
    },
    {
      id: 'nirmalbandh',
      name: 'Nirmalbandh District Water and Sanitation Mission',
      shortName: 'Nirmalbandh',
      level: 'district',
      bodyKind: 'dwsm',
      workLabel: 'DWSM',
      receivedPaise: 7 * CRORE,
      reportedPaise: 6.4 * CRORE,
      reportedAt: '07 Aug 2026',
      parentId: 'meera'
    },
    // Raital blocks (dense)
    {
      id: 'raital-sadar',
      name: 'Raital Sadar block resource centre',
      shortName: 'Raital Sadar',
      level: 'block',
      bodyKind: 'block-resource-centre',
      workLabel: 'Block resource centre',
      receivedPaise: 9.5 * CRORE,
      reportedPaise: 9.1 * CRORE,
      reportedAt: '28 Jul 2026',
      parentId: 'raital'
    },
    {
      id: 'kharonda',
      name: 'Kharonda block resource centre',
      shortName: 'Kharonda',
      level: 'block',
      bodyKind: 'block-resource-centre',
      workLabel: 'Block resource centre',
      receivedPaise: 12.2 * CRORE,
      reportedPaise: 8.8 * CRORE,
      reportedAt: '29 Jul 2026',
      parentId: 'raital',
      unpublishedPaise: 0.5 * CRORE
    },
    {
      id: 'uttar-raital',
      name: 'Uttar Raital block resource centre',
      shortName: 'Uttar Raital',
      level: 'block',
      bodyKind: 'block-resource-centre',
      workLabel: 'Block resource centre',
      receivedPaise: 6.3 * CRORE,
      reportedPaise: 6.0 * CRORE,
      reportedAt: '30 Jul 2026',
      parentId: 'raital'
    },
    // Last mile under Kharonda
    {
      id: 'piprahi-paani',
      name: 'Piprahi Paani Samiti — in-village piped scheme',
      shortName: 'Piprahi Paani Samiti',
      level: 'agency',
      bodyKind: 'paani-samiti',
      workLabel: 'Paani Samiti',
      receivedPaise: 5.4 * CRORE,
      reportedPaise: 4.1 * CRORE,
      reportedAt: '26 Jul 2026',
      parentId: 'kharonda',
      unpublishedPaise: 1.3 * CRORE
    },
    {
      id: 'tengra-paani',
      name: 'Tengrahat Paani Samiti — in-village piped scheme',
      shortName: 'Tengrahat Paani Samiti',
      level: 'agency',
      bodyKind: 'paani-samiti',
      workLabel: 'Paani Samiti',
      receivedPaise: 3.8 * CRORE,
      reportedPaise: 3.6 * CRORE,
      reportedAt: '31 Jul 2026',
      parentId: 'kharonda'
    },
    {
      id: 'raital-phed',
      name: 'Raital PHED division — multi-village bulk supply',
      shortName: 'Raital PHED division',
      level: 'agency',
      bodyKind: 'phed-division',
      workLabel: 'PHED bulk supply',
      receivedPaise: 2.5 * CRORE,
      reportedPaise: 2.4 * CRORE,
      reportedAt: '01 Aug 2026',
      parentId: 'kharonda'
    },
    // One last-mile under Raital Sadar for texture
    {
      id: 'neemkhera-paani',
      name: 'Neemkhera Paani Samiti — in-village piped scheme',
      shortName: 'Neemkhera Paani Samiti',
      level: 'agency',
      bodyKind: 'paani-samiti',
      workLabel: 'Paani Samiti',
      receivedPaise: 4.2 * CRORE,
      reportedPaise: 4.0 * CRORE,
      reportedAt: '02 Aug 2026',
      parentId: 'raital-sadar'
    }
  ],
  transfers: [
    { id: 't1', fromNodeId: 'india', toNodeId: 'kanak', amountPaise: 78 * CRORE, date: '18 Jul 2026', reference: 'SNA/KANAK/CWAM/26-27/TR-0718', component: 'centre-share' },
    { id: 't2', fromNodeId: 'india', toNodeId: 'girikhand', amountPaise: 36 * CRORE, date: '19 Jul 2026', reference: 'SNA/GIRI/CWAM/26-27/TR-0719', component: 'centre-share' },
    { id: 't3', fromNodeId: 'india', toNodeId: 'meera', amountPaise: 21 * CRORE, date: '19 Jul 2026', reference: 'SNA/MEERA/CWAM/26-27/TR-0719', component: 'centre-share' },
    { id: 't4', fromNodeId: 'kanak', toNodeId: 'raital', amountPaise: 28 * CRORE, date: '23 Jul 2026', reference: 'ZBSA/RAI/DWSM/0723', component: 'works' },
    { id: 't5', fromNodeId: 'kanak', toNodeId: 'chandanpur', amountPaise: 22 * CRORE, date: '24 Jul 2026', reference: 'ZBSA/CHK/DWSM/0724', component: 'works' },
    { id: 't6', fromNodeId: 'kanak', toNodeId: 'morwa', amountPaise: 20 * CRORE, date: '24 Jul 2026', reference: 'ZBSA/MOR/DWSM/0724', component: 'works' },
    { id: 't7', fromNodeId: 'girikhand', toNodeId: 'patharwadi', amountPaise: 19 * CRORE, date: '25 Jul 2026', reference: 'ZBSA/PAT/DWSM/0725', component: 'works' },
    { id: 't8', fromNodeId: 'girikhand', toNodeId: 'sitabari', amountPaise: 17 * CRORE, date: '25 Jul 2026', reference: 'ZBSA/SIT/DWSM/0725', component: 'works' },
    { id: 't9', fromNodeId: 'meera', toNodeId: 'dhowli', amountPaise: 14 * CRORE, date: '26 Jul 2026', reference: 'ZBSA/DHO/DWSM/0726', component: 'works' },
    { id: 't10', fromNodeId: 'meera', toNodeId: 'nirmalbandh', amountPaise: 7 * CRORE, date: '26 Jul 2026', reference: 'ZBSA/NIR/DWSM/0726', component: 'works' },
    { id: 't11', fromNodeId: 'raital', toNodeId: 'raital-sadar', amountPaise: 9.5 * CRORE, date: '27 Jul 2026', reference: 'BRC/RSAD/0727', component: 'works' },
    { id: 't12', fromNodeId: 'raital', toNodeId: 'kharonda', amountPaise: 12.2 * CRORE, date: '27 Jul 2026', reference: 'BRC/KHR/0727', component: 'works' },
    { id: 't13', fromNodeId: 'raital', toNodeId: 'uttar-raital', amountPaise: 6.3 * CRORE, date: '28 Jul 2026', reference: 'BRC/URAI/0728', component: 'works' },
    { id: 't14', fromNodeId: 'kharonda', toNodeId: 'piprahi-paani', amountPaise: 5.4 * CRORE, date: '28 Jul 2026', reference: 'IA/PIPRAHI/IV/0728', component: 'in-village' },
    { id: 't15', fromNodeId: 'kharonda', toNodeId: 'tengra-paani', amountPaise: 3.8 * CRORE, date: '29 Jul 2026', reference: 'IA/TENGRA/IV/0729', component: 'in-village' },
    { id: 't16', fromNodeId: 'kharonda', toNodeId: 'raital-phed', amountPaise: 2.5 * CRORE, date: '29 Jul 2026', reference: 'IA/RAI-PHED/BULK/0729', component: 'bulk-supply' },
    { id: 't17', fromNodeId: 'raital-sadar', toNodeId: 'neemkhera-paani', amountPaise: 4.2 * CRORE, date: '30 Jul 2026', reference: 'IA/NEEM/IV/0730', component: 'in-village' }
  ],
  reconciliations: [
    {
      nodeId: 'piprahi-paani',
      status: 'needs-explanation',
      items: [
        { label: 'Reported in-village works', amountPaise: 4.1 * CRORE, description: 'FHTC and source works recorded by the Paani Samiti.' },
        { label: 'Awaiting utilisation update', amountPaise: 1.3 * CRORE, description: 'ZBSA drawing limit utilised; utilisation certificate not yet filed in this scenario.' }
      ]
    },
    {
      nodeId: 'raital',
      status: 'needs-explanation',
      items: [
        { label: 'Reported programme spend', amountPaise: 20.1 * CRORE, description: 'Works and supplies recorded by the district mission.' },
        { label: 'Reported unspent balance', amountPaise: 4.1 * CRORE, description: 'Balance recorded as held for planned in-village and bulk works.' },
        { label: 'Late agency utilisation report', amountPaise: 2.0 * CRORE, description: 'Expected Paani Samiti utilisation has not yet been filed in this scenario.' },
        { label: 'Unmatched record', amountPaise: 1.8 * CRORE, description: 'A reported transfer has no matching downstream ZBSA reference yet.' }
      ]
    },
    {
      nodeId: 'kanak',
      status: 'watch',
      items: [
        { label: 'Traced to districts', amountPaise: 70 * CRORE, description: 'Published onward splits to district water missions.' },
        { label: 'Awaiting onward details', amountPaise: 8 * CRORE, description: 'SNA report lists a balance whose district split is not yet published.' }
      ]
    }
  ]
};
