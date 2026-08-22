import type { ISchemeScenario } from '../../domain/fund-flow';
import { CRORE } from './gazetteer';

/**
 * CSS 60:40 matching society-route archetype.
 * Centre → State Health Society (merge) → District Health Society → BPMU → PHC/CHC/VHC.
 * Dense under Raital; gap: Meera Coast state share not yet released.
 */
export const NEIGHBOURHOOD_HEALTH_SCENARIO: ISchemeScenario = {
  id: 'neighbourhood-health',
  schemeName: 'Neighbourhood Health Mission',
  schemeCode: 'NHM–26',
  schemeKind: 'matching-society',
  lastMileLabel: 'Facility',
  period: 'FY 2026–27 · Quarter 1',
  sourceLabel: 'Synthetic demonstration scenario · no live government data',
  defaultFocusNodeId: 'meera',
  centreSharePaise: 108 * CRORE,
  stateSharePaise: 72 * CRORE,
  nodes: [
    {
      id: 'india',
      name: 'National health mission account (centre share)',
      shortName: 'Central release',
      level: 'national',
      bodyKind: 'national-account',
      workLabel: 'Centre share account',
      receivedPaise: 108 * CRORE,
      reportedPaise: 108 * CRORE,
      reportedAt: '05 Jul 2026'
    },
    {
      id: 'kanak',
      name: 'Kanak Pradesh State Health Society',
      shortName: 'Kanak Pradesh',
      level: 'state',
      bodyKind: 'shs',
      workLabel: 'State Health Society',
      // Combined envelope: 54 centre + 36 state matching share.
      receivedPaise: 90 * CRORE,
      reportedPaise: 90 * CRORE,
      reportedAt: '18 Jul 2026',
      parentId: 'india'
    },
    {
      id: 'girikhand',
      name: 'Girikhand State Health Society',
      shortName: 'Girikhand',
      level: 'state',
      bodyKind: 'shs',
      workLabel: 'State Health Society',
      // Combined envelope: 32.4 centre + 21.6 state matching share.
      receivedPaise: 54 * CRORE,
      reportedPaise: 54 * CRORE,
      reportedAt: '19 Jul 2026',
      parentId: 'india'
    },
    {
      id: 'meera',
      name: 'Meera Coast State Health Society',
      shortName: 'Meera Coast',
      level: 'state',
      bodyKind: 'shs',
      workLabel: 'State Health Society',
      // Centre share only so far; matching state share (~12 cr) not yet released.
      receivedPaise: 21.6 * CRORE,
      reportedPaise: 21.6 * CRORE,
      reportedAt: '20 Jul 2026',
      parentId: 'india',
      unpublishedPaise: 12 * CRORE
    },
    // Districts
    {
      id: 'raital',
      name: 'Raital District Health Society',
      shortName: 'Raital',
      level: 'district',
      bodyKind: 'dhs',
      workLabel: 'District Health Society',
      receivedPaise: 32 * CRORE,
      reportedPaise: 31.2 * CRORE,
      reportedAt: '28 Jul 2026',
      parentId: 'kanak'
    },
    {
      id: 'chandanpur',
      name: 'Chandanpur Kalan District Health Society',
      shortName: 'Chandanpur Kalan',
      level: 'district',
      bodyKind: 'dhs',
      workLabel: 'District Health Society',
      receivedPaise: 30 * CRORE,
      reportedPaise: 29.4 * CRORE,
      reportedAt: '28 Jul 2026',
      parentId: 'kanak'
    },
    {
      id: 'morwa',
      name: 'Morwa East District Health Society',
      shortName: 'Morwa East',
      level: 'district',
      bodyKind: 'dhs',
      workLabel: 'District Health Society',
      receivedPaise: 28 * CRORE,
      reportedPaise: 27.5 * CRORE,
      reportedAt: '29 Jul 2026',
      parentId: 'kanak'
    },
    {
      id: 'patharwadi',
      name: 'Patharwadi District Health Society',
      shortName: 'Patharwadi',
      level: 'district',
      bodyKind: 'dhs',
      workLabel: 'District Health Society',
      receivedPaise: 28 * CRORE,
      reportedPaise: 27.3 * CRORE,
      reportedAt: '29 Jul 2026',
      parentId: 'girikhand'
    },
    {
      id: 'sitabari',
      name: 'Sitabari District Health Society',
      shortName: 'Sitabari',
      level: 'district',
      bodyKind: 'dhs',
      workLabel: 'District Health Society',
      receivedPaise: 26 * CRORE,
      reportedPaise: 25.4 * CRORE,
      reportedAt: '30 Jul 2026',
      parentId: 'girikhand'
    },
    {
      id: 'dhowli',
      name: 'Dhowli District Health Society',
      shortName: 'Dhowli',
      level: 'district',
      bodyKind: 'dhs',
      workLabel: 'District Health Society',
      receivedPaise: 12.6 * CRORE,
      reportedPaise: 12.2 * CRORE,
      reportedAt: '30 Jul 2026',
      parentId: 'meera'
    },
    {
      id: 'nirmalbandh',
      name: 'Nirmalbandh District Health Society',
      shortName: 'Nirmalbandh',
      level: 'district',
      bodyKind: 'dhs',
      workLabel: 'District Health Society',
      receivedPaise: 9 * CRORE,
      reportedPaise: 8.7 * CRORE,
      reportedAt: '31 Jul 2026',
      parentId: 'meera'
    },
    // Raital BPMUs (dense)
    {
      id: 'raital-sadar',
      name: 'Raital Sadar Block Programme Management Unit',
      shortName: 'Raital Sadar',
      level: 'block',
      bodyKind: 'bpmu',
      workLabel: 'BPMU',
      receivedPaise: 11 * CRORE,
      reportedPaise: 10.7 * CRORE,
      reportedAt: '01 Aug 2026',
      parentId: 'raital'
    },
    {
      id: 'kharonda',
      name: 'Kharonda Block Programme Management Unit',
      shortName: 'Kharonda',
      level: 'block',
      bodyKind: 'bpmu',
      workLabel: 'BPMU',
      receivedPaise: 13 * CRORE,
      reportedPaise: 12.6 * CRORE,
      reportedAt: '01 Aug 2026',
      parentId: 'raital'
    },
    {
      id: 'uttar-raital',
      name: 'Uttar Raital Block Programme Management Unit',
      shortName: 'Uttar Raital',
      level: 'block',
      bodyKind: 'bpmu',
      workLabel: 'BPMU',
      receivedPaise: 8 * CRORE,
      reportedPaise: 7.8 * CRORE,
      reportedAt: '02 Aug 2026',
      parentId: 'raital'
    },
    // Facilities under Kharonda + one Meera facility
    {
      id: 'kharonda-phc',
      name: 'Kharonda Primary Health Centre',
      shortName: 'Kharonda PHC',
      level: 'agency',
      bodyKind: 'phc',
      workLabel: 'PHC',
      receivedPaise: 5.5 * CRORE,
      reportedPaise: 5.3 * CRORE,
      reportedAt: '02 Aug 2026',
      parentId: 'kharonda'
    },
    {
      id: 'kharonda-chc',
      name: 'Kharonda Community Health Centre',
      shortName: 'Kharonda CHC',
      level: 'agency',
      bodyKind: 'chc',
      workLabel: 'CHC',
      receivedPaise: 5.0 * CRORE,
      reportedPaise: 4.9 * CRORE,
      reportedAt: '02 Aug 2026',
      parentId: 'kharonda'
    },
    {
      id: 'piprahi-vhc',
      name: 'Piprahi village health committee',
      shortName: 'Piprahi VHC',
      level: 'agency',
      bodyKind: 'village-health-committee',
      workLabel: 'Village health committee',
      receivedPaise: 2.5 * CRORE,
      reportedPaise: 2.4 * CRORE,
      reportedAt: '03 Aug 2026',
      parentId: 'kharonda'
    },
    {
      id: 'dhowli-phc',
      name: 'Dhowli Primary Health Centre',
      shortName: 'Dhowli PHC',
      level: 'agency',
      bodyKind: 'phc',
      workLabel: 'PHC',
      receivedPaise: 7 * CRORE,
      reportedPaise: 6.8 * CRORE,
      reportedAt: '03 Aug 2026',
      parentId: 'dhowli'
    },
    {
      id: 'nirmalbandh-phc',
      name: 'Nirmalbandh Primary Health Centre',
      shortName: 'Nirmalbandh PHC',
      level: 'agency',
      bodyKind: 'phc',
      workLabel: 'PHC',
      receivedPaise: 5.5 * CRORE,
      reportedPaise: 5.3 * CRORE,
      reportedAt: '03 Aug 2026',
      parentId: 'nirmalbandh'
    }
  ],
  transfers: [
    // Centre share into state societies (60% of total envelope per state).
    { id: 'nhm-t1', fromNodeId: 'india', toNodeId: 'kanak', amountPaise: 54 * CRORE, date: '10 Jul 2026', reference: 'SHS/KANAK/C-SHARE/0710', component: 'centre-share' },
    { id: 'nhm-t2', fromNodeId: 'india', toNodeId: 'girikhand', amountPaise: 32.4 * CRORE, date: '11 Jul 2026', reference: 'SHS/GIRI/C-SHARE/0711', component: 'centre-share' },
    { id: 'nhm-t3', fromNodeId: 'india', toNodeId: 'meera', amountPaise: 21.6 * CRORE, date: '11 Jul 2026', reference: 'SHS/MEERA/C-SHARE/0711', component: 'centre-share' },
    { id: 'nhm-t4', fromNodeId: 'kanak', toNodeId: 'raital', amountPaise: 32 * CRORE, date: '22 Jul 2026', reference: 'DHS/RAI/0722', component: 'family-health' },
    { id: 'nhm-t5', fromNodeId: 'kanak', toNodeId: 'chandanpur', amountPaise: 30 * CRORE, date: '22 Jul 2026', reference: 'DHS/CHK/0722', component: 'family-health' },
    { id: 'nhm-t6', fromNodeId: 'kanak', toNodeId: 'morwa', amountPaise: 28 * CRORE, date: '23 Jul 2026', reference: 'DHS/MOR/0723', component: 'disease-control' },
    { id: 'nhm-t7', fromNodeId: 'girikhand', toNodeId: 'patharwadi', amountPaise: 28 * CRORE, date: '23 Jul 2026', reference: 'DHS/PAT/0723', component: 'family-health' },
    { id: 'nhm-t8', fromNodeId: 'girikhand', toNodeId: 'sitabari', amountPaise: 26 * CRORE, date: '24 Jul 2026', reference: 'DHS/SIT/0724', component: 'disease-control' },
    { id: 'nhm-t9', fromNodeId: 'meera', toNodeId: 'dhowli', amountPaise: 12.6 * CRORE, date: '24 Jul 2026', reference: 'DHS/DHO/0724', component: 'centre-share' },
    { id: 'nhm-t10', fromNodeId: 'meera', toNodeId: 'nirmalbandh', amountPaise: 9 * CRORE, date: '24 Jul 2026', reference: 'DHS/NIR/0724', component: 'centre-share' },
    { id: 'nhm-t11', fromNodeId: 'raital', toNodeId: 'raital-sadar', amountPaise: 11 * CRORE, date: '28 Jul 2026', reference: 'BPMU/RSAD/0728', component: 'family-health' },
    { id: 'nhm-t12', fromNodeId: 'raital', toNodeId: 'kharonda', amountPaise: 13 * CRORE, date: '28 Jul 2026', reference: 'BPMU/KHR/0728', component: 'family-health' },
    { id: 'nhm-t13', fromNodeId: 'raital', toNodeId: 'uttar-raital', amountPaise: 8 * CRORE, date: '29 Jul 2026', reference: 'BPMU/URAI/0729', component: 'infrastructure' },
    { id: 'nhm-t14', fromNodeId: 'kharonda', toNodeId: 'kharonda-phc', amountPaise: 5.5 * CRORE, date: '30 Jul 2026', reference: 'FAC/KHR-PHC/0730', component: 'family-health' },
    { id: 'nhm-t15', fromNodeId: 'kharonda', toNodeId: 'kharonda-chc', amountPaise: 5.0 * CRORE, date: '30 Jul 2026', reference: 'FAC/KHR-CHC/0730', component: 'disease-control' },
    { id: 'nhm-t16', fromNodeId: 'kharonda', toNodeId: 'piprahi-vhc', amountPaise: 2.5 * CRORE, date: '31 Jul 2026', reference: 'FAC/PIP-VHC/0731', component: 'family-health' },
    { id: 'nhm-t17', fromNodeId: 'dhowli', toNodeId: 'dhowli-phc', amountPaise: 7 * CRORE, date: '29 Jul 2026', reference: 'FAC/DHO-PHC/0729', component: 'centre-share' },
    { id: 'nhm-t18', fromNodeId: 'nirmalbandh', toNodeId: 'nirmalbandh-phc', amountPaise: 5.5 * CRORE, date: '29 Jul 2026', reference: 'FAC/NIR-PHC/0729', component: 'centre-share' }
  ],
  reconciliations: [
    {
      nodeId: 'meera',
      status: 'needs-explanation',
      items: [
        { label: 'Centre share received', amountPaise: 21.6 * CRORE, description: 'Central matching share credited to the state health society.' },
        { label: 'Traced with available funds', amountPaise: 21.6 * CRORE, description: 'Onward district releases from centre share currently held.' },
        { label: 'State share not yet released', amountPaise: 12 * CRORE, description: 'Matching state share for this tranche is not yet released in this scenario.' },
        { label: 'Awaiting society report', amountPaise: 1.4 * CRORE, description: 'A portion of the facility utilisation awaits the next society report.' }
      ]
    },
    {
      nodeId: 'kanak',
      status: 'clear',
      items: [
        { label: 'Centre share', amountPaise: 54 * CRORE, description: 'Central 60% share merged at the state society.' },
        { label: 'State share', amountPaise: 36 * CRORE, description: 'State 40% matching share released and merged.' },
        { label: 'Traced to districts', amountPaise: 90 * CRORE, description: 'Full combined envelope published onward to districts.' }
      ]
    },
    {
      nodeId: 'girikhand',
      status: 'clear',
      items: [
        { label: 'Centre share', amountPaise: 32.4 * CRORE, description: 'Central 60% share merged at the state society.' },
        { label: 'State share', amountPaise: 21.6 * CRORE, description: 'State 40% matching share released and merged.' },
        { label: 'Traced to districts', amountPaise: 54 * CRORE, description: 'Full combined envelope published onward to districts.' }
      ]
    }
  ]
};
