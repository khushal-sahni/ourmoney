import type { ISchemeScenario } from '../../domain/fund-flow';

/** 1 crore rupees expressed in paise. */
const CRORE = 1_000_000_000;

/**
 * Demand-driven dual-stream (wage + material) archetype.
 * Steep power-law district demand; last mile is the panchayat.
 * Highlight: late wage-credit file + pending material bill at Bakul panchayat.
 */
export const RURAL_WORKS_GUARANTEE_SCENARIO: ISchemeScenario = {
  id: 'rural-works-guarantee',
  schemeName: 'Rural Works Guarantee',
  schemeCode: 'RWG–26',
  schemeKind: 'demand-wage',
  lastMileLabel: 'Panchayat',
  period: 'FY 2026–27 · Quarter 1',
  sourceLabel: 'Synthetic demonstration scenario · no live government data',
  defaultFocusNodeId: 'bakul',
  nodes: [
    {
      id: 'india',
      name: 'National employment guarantee account',
      shortName: 'Central release',
      level: 'national',
      receivedPaise: 420 * CRORE,
      reportedPaise: 420 * CRORE,
      reportedAt: '08 Jul 2026',
      unpublishedPaise: 12 * CRORE
    },
    {
      id: 'sundar',
      name: 'Sundar Pradesh employment guarantee society',
      shortName: 'Sundar Pradesh',
      level: 'state',
      receivedPaise: 248 * CRORE,
      reportedPaise: 248 * CRORE,
      reportedAt: '14 Jul 2026',
      parentId: 'india',
      unpublishedPaise: 6 * CRORE
    },
    {
      id: 'aravali',
      name: 'Aravali employment guarantee society',
      shortName: 'Aravali',
      level: 'state',
      receivedPaise: 112 * CRORE,
      reportedPaise: 112 * CRORE,
      reportedAt: '15 Jul 2026',
      parentId: 'india'
    },
    {
      id: 'malwa',
      name: 'Malwa employment guarantee society',
      shortName: 'Malwa',
      level: 'state',
      receivedPaise: 48 * CRORE,
      reportedPaise: 48 * CRORE,
      reportedAt: '16 Jul 2026',
      parentId: 'india'
    },
    // Sundar districts — Nadi is the drought/high-demand district (~40% of state).
    {
      id: 'nadi',
      name: 'Nadi district programme unit',
      shortName: 'Nadi',
      level: 'district',
      receivedPaise: 99 * CRORE,
      reportedPaise: 91 * CRORE,
      reportedAt: '28 Jul 2026',
      parentId: 'sundar',
      unpublishedPaise: 4.2 * CRORE
    },
    {
      id: 'pahar',
      name: 'Pahar district programme unit',
      shortName: 'Pahar',
      level: 'district',
      receivedPaise: 72 * CRORE,
      reportedPaise: 70.5 * CRORE,
      reportedAt: '29 Jul 2026',
      parentId: 'sundar'
    },
    {
      id: 'maidan',
      name: 'Maidan district programme unit',
      shortName: 'Maidan',
      level: 'district',
      receivedPaise: 71 * CRORE,
      reportedPaise: 69.8 * CRORE,
      reportedAt: '29 Jul 2026',
      parentId: 'sundar'
    },
    // Aravali — more even
    {
      id: 'teer',
      name: 'Teer district programme unit',
      shortName: 'Teer',
      level: 'district',
      receivedPaise: 64 * CRORE,
      reportedPaise: 62.2 * CRORE,
      reportedAt: '30 Jul 2026',
      parentId: 'aravali'
    },
    {
      id: 'khet',
      name: 'Khet district programme unit',
      shortName: 'Khet',
      level: 'district',
      receivedPaise: 48 * CRORE,
      reportedPaise: 47.1 * CRORE,
      reportedAt: '30 Jul 2026',
      parentId: 'aravali'
    },
    // Malwa — low demand (prosperous ~8% of a larger state would be tiny; here small absolute)
    {
      id: 'ghat',
      name: 'Ghat district programme unit',
      shortName: 'Ghat',
      level: 'district',
      receivedPaise: 31 * CRORE,
      reportedPaise: 30.4 * CRORE,
      reportedAt: '31 Jul 2026',
      parentId: 'malwa'
    },
    {
      id: 'ridge',
      name: 'Ridge district programme unit',
      shortName: 'Ridge',
      level: 'district',
      receivedPaise: 17 * CRORE,
      reportedPaise: 16.6 * CRORE,
      reportedAt: '31 Jul 2026',
      parentId: 'malwa'
    },
    // Last mile: panchayats under Nadi (drought focus)
    {
      id: 'bakul',
      name: 'Bakul gram panchayat wage cell',
      shortName: 'Bakul panchayat',
      level: 'agency',
      receivedPaise: 42 * CRORE,
      reportedPaise: 34.8 * CRORE,
      reportedAt: '02 Aug 2026',
      parentId: 'nadi',
      unpublishedPaise: 7.2 * CRORE
    },
    {
      id: 'talab',
      name: 'Talab gram panchayat wage cell',
      shortName: 'Talab panchayat',
      level: 'agency',
      receivedPaise: 38 * CRORE,
      reportedPaise: 37.1 * CRORE,
      reportedAt: '03 Aug 2026',
      parentId: 'nadi'
    },
    {
      id: 'neem',
      name: 'Neem gram panchayat wage cell',
      shortName: 'Neem panchayat',
      level: 'agency',
      receivedPaise: 19 * CRORE,
      reportedPaise: 18.4 * CRORE,
      reportedAt: '04 Aug 2026',
      parentId: 'nadi'
    }
  ],
  transfers: [
    { id: 'rwg-t1', fromNodeId: 'india', toNodeId: 'sundar', amountPaise: 248 * CRORE, date: '12 Jul 2026', reference: 'RWG/SUN/0712', component: 'wage' },
    { id: 'rwg-t2', fromNodeId: 'india', toNodeId: 'aravali', amountPaise: 112 * CRORE, date: '13 Jul 2026', reference: 'RWG/ARA/0713', component: 'wage' },
    { id: 'rwg-t3', fromNodeId: 'india', toNodeId: 'malwa', amountPaise: 48 * CRORE, date: '13 Jul 2026', reference: 'RWG/MAL/0713', component: 'wage' },
    { id: 'rwg-t4', fromNodeId: 'sundar', toNodeId: 'nadi', amountPaise: 99 * CRORE, date: '18 Jul 2026', reference: 'SUN/NAD/0718', component: 'wage' },
    { id: 'rwg-t5', fromNodeId: 'sundar', toNodeId: 'pahar', amountPaise: 72 * CRORE, date: '19 Jul 2026', reference: 'SUN/PAH/0719', component: 'wage' },
    { id: 'rwg-t6', fromNodeId: 'sundar', toNodeId: 'maidan', amountPaise: 71 * CRORE, date: '19 Jul 2026', reference: 'SUN/MAI/0719', component: 'wage' },
    { id: 'rwg-t7', fromNodeId: 'aravali', toNodeId: 'teer', amountPaise: 64 * CRORE, date: '20 Jul 2026', reference: 'ARA/TEE/0720', component: 'wage' },
    { id: 'rwg-t8', fromNodeId: 'aravali', toNodeId: 'khet', amountPaise: 48 * CRORE, date: '20 Jul 2026', reference: 'ARA/KHE/0720', component: 'wage' },
    { id: 'rwg-t9', fromNodeId: 'malwa', toNodeId: 'ghat', amountPaise: 31 * CRORE, date: '21 Jul 2026', reference: 'MAL/GHA/0721', component: 'wage' },
    { id: 'rwg-t10', fromNodeId: 'malwa', toNodeId: 'ridge', amountPaise: 17 * CRORE, date: '21 Jul 2026', reference: 'MAL/RID/0721', component: 'wage' },
    // Dual stream into Bakul: ~62% wage, ~38% material
    { id: 'rwg-t11', fromNodeId: 'nadi', toNodeId: 'bakul', amountPaise: 26 * CRORE, date: '25 Jul 2026', reference: 'NAD/BAK/W/0725', component: 'wage' },
    { id: 'rwg-t12', fromNodeId: 'nadi', toNodeId: 'bakul', amountPaise: 16 * CRORE, date: '25 Jul 2026', reference: 'NAD/BAK/M/0725', component: 'material' },
    { id: 'rwg-t13', fromNodeId: 'nadi', toNodeId: 'talab', amountPaise: 23.5 * CRORE, date: '26 Jul 2026', reference: 'NAD/TAL/W/0726', component: 'wage' },
    { id: 'rwg-t14', fromNodeId: 'nadi', toNodeId: 'talab', amountPaise: 14.5 * CRORE, date: '26 Jul 2026', reference: 'NAD/TAL/M/0726', component: 'material' },
    { id: 'rwg-t15', fromNodeId: 'nadi', toNodeId: 'neem', amountPaise: 11.8 * CRORE, date: '27 Jul 2026', reference: 'NAD/NEE/W/0727', component: 'wage' },
    { id: 'rwg-t16', fromNodeId: 'nadi', toNodeId: 'neem', amountPaise: 7.2 * CRORE, date: '27 Jul 2026', reference: 'NAD/NEE/M/0727', component: 'material' }
  ],
  reconciliations: [
    {
      nodeId: 'bakul',
      status: 'needs-explanation',
      items: [
        { label: 'Wage credits reported', amountPaise: 22.6 * CRORE, description: 'Muster-linked wage credits recorded for completed person-days.' },
        { label: 'Material bills settled', amountPaise: 12.2 * CRORE, description: 'Vendor bills matched to approved works.' },
        { label: 'Late wage-credit file', amountPaise: 4.8 * CRORE, description: 'A wage file is prepared but not yet credited in this scenario.' },
        { label: 'Pending material bill', amountPaise: 2.4 * CRORE, description: 'A material invoice awaits matching to the work order.' }
      ]
    },
    {
      nodeId: 'nadi',
      status: 'watch',
      items: [
        { label: 'Traced to panchayats', amountPaise: 94.8 * CRORE, description: 'Published wage and material splits to gram panchayats.' },
        { label: 'Awaiting onward details', amountPaise: 4.2 * CRORE, description: 'District balance whose panchayat split is not yet published.' }
      ]
    },
    {
      nodeId: 'sundar',
      status: 'watch',
      items: [
        { label: 'Traced to districts', amountPaise: 242 * CRORE, description: 'Onward demand-based releases to district units.' },
        { label: 'Awaiting labour-budget update', amountPaise: 6 * CRORE, description: 'State society lists a reserve not yet allotted to a district.' }
      ]
    }
  ]
};
