import type { ISchemeScenario } from '../../domain/fund-flow';
import { CRORE } from './gazetteer';

/**
 * Demand-driven dual-stream (wage + material) archetype.
 * Centre → SEGF (SNA) → District Programme Coordinator → Block PO → Gram Panchayat.
 * Dense under Raital/Kharonda; gap: FTO pending second signatory + unmatched material bill.
 */
export const RURAL_WORKS_GUARANTEE_SCENARIO: ISchemeScenario = {
  id: 'rural-works-guarantee',
  schemeName: 'Rural Works Guarantee',
  schemeCode: 'RWG–26',
  schemeKind: 'demand-wage',
  lastMileLabel: 'Gram Panchayat',
  period: 'FY 2026–27 · Quarter 1',
  sourceLabel: 'Synthetic demonstration scenario · no live government data',
  defaultFocusNodeId: 'bakul-gp',
  nodes: [
    {
      id: 'india',
      name: 'National Rural Works Guarantee account',
      shortName: 'Central release',
      level: 'national',
      bodyKind: 'national-account',
      workLabel: 'Programme account',
      receivedPaise: 420 * CRORE,
      reportedPaise: 420 * CRORE,
      reportedAt: '08 Jul 2026',
      unpublishedPaise: 12 * CRORE
    },
    {
      id: 'kanak',
      name: 'Kanak Pradesh State Employment Guarantee Fund (SNA)',
      shortName: 'Kanak Pradesh',
      level: 'state',
      bodyKind: 'segf',
      workLabel: 'SEGF · SNA',
      receivedPaise: 248 * CRORE,
      reportedPaise: 248 * CRORE,
      reportedAt: '14 Jul 2026',
      parentId: 'india',
      unpublishedPaise: 6 * CRORE
    },
    {
      id: 'girikhand',
      name: 'Girikhand State Employment Guarantee Fund (SNA)',
      shortName: 'Girikhand',
      level: 'state',
      bodyKind: 'segf',
      workLabel: 'SEGF · SNA',
      receivedPaise: 112 * CRORE,
      reportedPaise: 112 * CRORE,
      reportedAt: '15 Jul 2026',
      parentId: 'india'
    },
    {
      id: 'meera',
      name: 'Meera Coast State Employment Guarantee Fund (SNA)',
      shortName: 'Meera Coast',
      level: 'state',
      bodyKind: 'segf',
      workLabel: 'SEGF · SNA',
      receivedPaise: 48 * CRORE,
      reportedPaise: 48 * CRORE,
      reportedAt: '16 Jul 2026',
      parentId: 'india'
    },
    // Kanak — Raital is high-demand (~40% of state)
    {
      id: 'raital',
      name: 'Raital District Programme Coordinator',
      shortName: 'Raital',
      level: 'district',
      bodyKind: 'district-programme-coordinator',
      workLabel: 'District Programme Coordinator',
      receivedPaise: 99 * CRORE,
      reportedPaise: 91 * CRORE,
      reportedAt: '28 Jul 2026',
      parentId: 'kanak',
      unpublishedPaise: 4.2 * CRORE
    },
    {
      id: 'chandanpur',
      name: 'Chandanpur Kalan District Programme Coordinator',
      shortName: 'Chandanpur Kalan',
      level: 'district',
      bodyKind: 'district-programme-coordinator',
      workLabel: 'District Programme Coordinator',
      receivedPaise: 72 * CRORE,
      reportedPaise: 70.5 * CRORE,
      reportedAt: '29 Jul 2026',
      parentId: 'kanak'
    },
    {
      id: 'morwa',
      name: 'Morwa East District Programme Coordinator',
      shortName: 'Morwa East',
      level: 'district',
      bodyKind: 'district-programme-coordinator',
      workLabel: 'District Programme Coordinator',
      receivedPaise: 71 * CRORE,
      reportedPaise: 69.8 * CRORE,
      reportedAt: '29 Jul 2026',
      parentId: 'kanak'
    },
    {
      id: 'patharwadi',
      name: 'Patharwadi District Programme Coordinator',
      shortName: 'Patharwadi',
      level: 'district',
      bodyKind: 'district-programme-coordinator',
      workLabel: 'District Programme Coordinator',
      receivedPaise: 64 * CRORE,
      reportedPaise: 62.2 * CRORE,
      reportedAt: '30 Jul 2026',
      parentId: 'girikhand'
    },
    {
      id: 'sitabari',
      name: 'Sitabari District Programme Coordinator',
      shortName: 'Sitabari',
      level: 'district',
      bodyKind: 'district-programme-coordinator',
      workLabel: 'District Programme Coordinator',
      receivedPaise: 48 * CRORE,
      reportedPaise: 47.1 * CRORE,
      reportedAt: '30 Jul 2026',
      parentId: 'girikhand'
    },
    {
      id: 'dhowli',
      name: 'Dhowli District Programme Coordinator',
      shortName: 'Dhowli',
      level: 'district',
      bodyKind: 'district-programme-coordinator',
      workLabel: 'District Programme Coordinator',
      receivedPaise: 31 * CRORE,
      reportedPaise: 30.4 * CRORE,
      reportedAt: '31 Jul 2026',
      parentId: 'meera'
    },
    {
      id: 'nirmalbandh',
      name: 'Nirmalbandh District Programme Coordinator',
      shortName: 'Nirmalbandh',
      level: 'district',
      bodyKind: 'district-programme-coordinator',
      workLabel: 'District Programme Coordinator',
      receivedPaise: 17 * CRORE,
      reportedPaise: 16.6 * CRORE,
      reportedAt: '31 Jul 2026',
      parentId: 'meera'
    },
    // Raital blocks
    {
      id: 'raital-sadar',
      name: 'Raital Sadar Block Programme Officer',
      shortName: 'Raital Sadar',
      level: 'block',
      bodyKind: 'programme-officer',
      workLabel: 'Programme Officer',
      receivedPaise: 28 * CRORE,
      reportedPaise: 27.2 * CRORE,
      reportedAt: '01 Aug 2026',
      parentId: 'raital'
    },
    {
      id: 'kharonda',
      name: 'Kharonda Block Programme Officer',
      shortName: 'Kharonda',
      level: 'block',
      bodyKind: 'programme-officer',
      workLabel: 'Programme Officer',
      receivedPaise: 42 * CRORE,
      reportedPaise: 34.8 * CRORE,
      reportedAt: '02 Aug 2026',
      parentId: 'raital',
      unpublishedPaise: 2.0 * CRORE
    },
    {
      id: 'uttar-raital',
      name: 'Uttar Raital Block Programme Officer',
      shortName: 'Uttar Raital',
      level: 'block',
      bodyKind: 'programme-officer',
      workLabel: 'Programme Officer',
      receivedPaise: 24.8 * CRORE,
      reportedPaise: 24.0 * CRORE,
      reportedAt: '02 Aug 2026',
      parentId: 'raital'
    },
    // Gram panchayats under Kharonda
    {
      id: 'bakul-gp',
      name: 'Bakul Gram Panchayat',
      shortName: 'Bakul GP',
      level: 'agency',
      bodyKind: 'gram-panchayat',
      workLabel: 'Gram Panchayat',
      receivedPaise: 22 * CRORE,
      reportedPaise: 17.4 * CRORE,
      reportedAt: '02 Aug 2026',
      parentId: 'kharonda',
      unpublishedPaise: 4.6 * CRORE
    },
    {
      id: 'talab-gp',
      name: 'Talab Gram Panchayat',
      shortName: 'Talab GP',
      level: 'agency',
      bodyKind: 'gram-panchayat',
      workLabel: 'Gram Panchayat',
      receivedPaise: 12 * CRORE,
      reportedPaise: 11.6 * CRORE,
      reportedAt: '03 Aug 2026',
      parentId: 'kharonda'
    },
    {
      id: 'neem-gp',
      name: 'Neemkhera Gram Panchayat',
      shortName: 'Neemkhera GP',
      level: 'agency',
      bodyKind: 'gram-panchayat',
      workLabel: 'Gram Panchayat',
      receivedPaise: 6 * CRORE,
      reportedPaise: 5.8 * CRORE,
      reportedAt: '04 Aug 2026',
      parentId: 'kharonda'
    }
  ],
  transfers: [
    { id: 'rwg-t1', fromNodeId: 'india', toNodeId: 'kanak', amountPaise: 248 * CRORE, date: '12 Jul 2026', reference: 'SNA/KANAK/RWG/26-27/TR-0712', component: 'wage' },
    { id: 'rwg-t2', fromNodeId: 'india', toNodeId: 'girikhand', amountPaise: 112 * CRORE, date: '13 Jul 2026', reference: 'SNA/GIRI/RWG/26-27/TR-0713', component: 'wage' },
    { id: 'rwg-t3', fromNodeId: 'india', toNodeId: 'meera', amountPaise: 48 * CRORE, date: '13 Jul 2026', reference: 'SNA/MEERA/RWG/26-27/TR-0713', component: 'wage' },
    { id: 'rwg-t4', fromNodeId: 'kanak', toNodeId: 'raital', amountPaise: 99 * CRORE, date: '18 Jul 2026', reference: 'DPC/RAI/LB-0718', component: 'wage' },
    { id: 'rwg-t5', fromNodeId: 'kanak', toNodeId: 'chandanpur', amountPaise: 72 * CRORE, date: '19 Jul 2026', reference: 'DPC/CHK/LB-0719', component: 'wage' },
    { id: 'rwg-t6', fromNodeId: 'kanak', toNodeId: 'morwa', amountPaise: 71 * CRORE, date: '19 Jul 2026', reference: 'DPC/MOR/LB-0719', component: 'wage' },
    { id: 'rwg-t7', fromNodeId: 'girikhand', toNodeId: 'patharwadi', amountPaise: 64 * CRORE, date: '20 Jul 2026', reference: 'DPC/PAT/LB-0720', component: 'wage' },
    { id: 'rwg-t8', fromNodeId: 'girikhand', toNodeId: 'sitabari', amountPaise: 48 * CRORE, date: '20 Jul 2026', reference: 'DPC/SIT/LB-0720', component: 'wage' },
    { id: 'rwg-t9', fromNodeId: 'meera', toNodeId: 'dhowli', amountPaise: 31 * CRORE, date: '21 Jul 2026', reference: 'DPC/DHO/LB-0721', component: 'wage' },
    { id: 'rwg-t10', fromNodeId: 'meera', toNodeId: 'nirmalbandh', amountPaise: 17 * CRORE, date: '21 Jul 2026', reference: 'DPC/NIR/LB-0721', component: 'wage' },
    { id: 'rwg-t11', fromNodeId: 'raital', toNodeId: 'raital-sadar', amountPaise: 28 * CRORE, date: '24 Jul 2026', reference: 'PO/RSAD/0724', component: 'wage' },
    { id: 'rwg-t12', fromNodeId: 'raital', toNodeId: 'kharonda', amountPaise: 42 * CRORE, date: '24 Jul 2026', reference: 'PO/KHR/0724', component: 'wage' },
    { id: 'rwg-t13', fromNodeId: 'raital', toNodeId: 'uttar-raital', amountPaise: 24.8 * CRORE, date: '25 Jul 2026', reference: 'PO/URAI/0725', component: 'wage' },
    // Dual stream into Bakul GP: ~60% wage, ~38% material, small admin
    { id: 'rwg-t14', fromNodeId: 'kharonda', toNodeId: 'bakul-gp', amountPaise: 13.2 * CRORE, date: '25 Jul 2026', reference: 'FTO-W-240725-KHR-0142', component: 'wage' },
    { id: 'rwg-t15', fromNodeId: 'kharonda', toNodeId: 'bakul-gp', amountPaise: 8.2 * CRORE, date: '25 Jul 2026', reference: 'MAT-BILL-KHR-BAK-0725', component: 'material' },
    { id: 'rwg-t16', fromNodeId: 'kharonda', toNodeId: 'bakul-gp', amountPaise: 0.6 * CRORE, date: '26 Jul 2026', reference: 'ADM-KHR-BAK-0726', component: 'admin' },
    { id: 'rwg-t17', fromNodeId: 'kharonda', toNodeId: 'talab-gp', amountPaise: 7.2 * CRORE, date: '26 Jul 2026', reference: 'FTO-W-240726-KHR-0148', component: 'wage' },
    { id: 'rwg-t18', fromNodeId: 'kharonda', toNodeId: 'talab-gp', amountPaise: 4.8 * CRORE, date: '26 Jul 2026', reference: 'MAT-BILL-KHR-TAL-0726', component: 'material' },
    { id: 'rwg-t19', fromNodeId: 'kharonda', toNodeId: 'neem-gp', amountPaise: 3.6 * CRORE, date: '27 Jul 2026', reference: 'FTO-W-240727-KHR-0151', component: 'wage' },
    { id: 'rwg-t20', fromNodeId: 'kharonda', toNodeId: 'neem-gp', amountPaise: 2.4 * CRORE, date: '27 Jul 2026', reference: 'MAT-BILL-KHR-NEE-0727', component: 'material' }
  ],
  reconciliations: [
    {
      nodeId: 'bakul-gp',
      status: 'needs-explanation',
      items: [
        { label: 'Wage credits reported', amountPaise: 11.4 * CRORE, description: 'Muster-linked wage credits recorded for completed person-days.' },
        { label: 'Material bills settled', amountPaise: 6.0 * CRORE, description: 'Vendor bills matched to approved works.' },
        { label: 'FTO pending second signatory', amountPaise: 2.8 * CRORE, description: 'A wage Fund Transfer Order awaits the second digital signatory in this scenario.' },
        { label: 'Pending material bill', amountPaise: 1.8 * CRORE, description: 'A material invoice awaits matching to the work order.' }
      ]
    },
    {
      nodeId: 'raital',
      status: 'watch',
      items: [
        { label: 'Traced to blocks / GPs', amountPaise: 94.8 * CRORE, description: 'Published wage and material splits via block programme officers.' },
        { label: 'Awaiting onward details', amountPaise: 4.2 * CRORE, description: 'District balance whose block split is not yet published.' }
      ]
    },
    {
      nodeId: 'kanak',
      status: 'watch',
      items: [
        { label: 'Traced to districts', amountPaise: 242 * CRORE, description: 'Onward demand-based releases to district programme coordinators.' },
        { label: 'Awaiting labour-budget update', amountPaise: 6 * CRORE, description: 'SEGF lists a reserve not yet allotted to a district.' }
      ]
    }
  ]
};
