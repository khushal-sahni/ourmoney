import type { ISchemeScenario } from '../../domain/fund-flow';

/** 1 crore rupees expressed in paise. */
const CRORE = 1_000_000_000;

/**
 * CSS 60:40 matching society-route archetype.
 * Centre and state shares merge at the state health society; last mile is the facility.
 * Highlight: Malwa state share not yet released (~12 cr).
 */
export const NEIGHBOURHOOD_HEALTH_SCENARIO: ISchemeScenario = {
  id: 'neighbourhood-health',
  schemeName: 'Neighbourhood Health Mission',
  schemeCode: 'NHM–26',
  schemeKind: 'matching-society',
  lastMileLabel: 'Facility',
  period: 'FY 2026–27 · Quarter 1',
  sourceLabel: 'Synthetic demonstration scenario · no live government data',
  defaultFocusNodeId: 'malwa',
  centreSharePaise: 108 * CRORE,
  stateSharePaise: 72 * CRORE,
  nodes: [
    {
      id: 'india',
      name: 'National health mission account (centre share)',
      shortName: 'Central release',
      level: 'national',
      receivedPaise: 108 * CRORE,
      reportedPaise: 108 * CRORE,
      reportedAt: '05 Jul 2026'
    },
    {
      id: 'sundar',
      name: 'Sundar Pradesh state health society',
      shortName: 'Sundar Pradesh',
      level: 'state',
      // Combined envelope: 54 centre + 36 state matching share.
      receivedPaise: 90 * CRORE,
      reportedPaise: 90 * CRORE,
      reportedAt: '18 Jul 2026',
      parentId: 'india'
    },
    {
      id: 'aravali',
      name: 'Aravali state health society',
      shortName: 'Aravali',
      level: 'state',
      // Combined envelope: 32.4 centre + 21.6 state matching share.
      receivedPaise: 54 * CRORE,
      reportedPaise: 54 * CRORE,
      reportedAt: '19 Jul 2026',
      parentId: 'india'
    },
    {
      id: 'malwa',
      name: 'Malwa state health society',
      shortName: 'Malwa',
      level: 'state',
      // Centre share only so far; matching state share (~12 cr) not yet released.
      receivedPaise: 21.6 * CRORE,
      reportedPaise: 21.6 * CRORE,
      reportedAt: '20 Jul 2026',
      parentId: 'india',
      unpublishedPaise: 12 * CRORE
    },
    // Even-ish districts (per facility planning)
    {
      id: 'nadi',
      name: 'Nadi district health society',
      shortName: 'Nadi',
      level: 'district',
      receivedPaise: 32 * CRORE,
      reportedPaise: 31.2 * CRORE,
      reportedAt: '28 Jul 2026',
      parentId: 'sundar'
    },
    {
      id: 'pahar',
      name: 'Pahar district health society',
      shortName: 'Pahar',
      level: 'district',
      receivedPaise: 30 * CRORE,
      reportedPaise: 29.4 * CRORE,
      reportedAt: '28 Jul 2026',
      parentId: 'sundar'
    },
    {
      id: 'maidan',
      name: 'Maidan district health society',
      shortName: 'Maidan',
      level: 'district',
      receivedPaise: 28 * CRORE,
      reportedPaise: 27.5 * CRORE,
      reportedAt: '29 Jul 2026',
      parentId: 'sundar'
    },
    {
      id: 'teer',
      name: 'Teer district health society',
      shortName: 'Teer',
      level: 'district',
      receivedPaise: 28 * CRORE,
      reportedPaise: 27.3 * CRORE,
      reportedAt: '29 Jul 2026',
      parentId: 'aravali'
    },
    {
      id: 'khet',
      name: 'Khet district health society',
      shortName: 'Khet',
      level: 'district',
      receivedPaise: 26 * CRORE,
      reportedPaise: 25.4 * CRORE,
      reportedAt: '30 Jul 2026',
      parentId: 'aravali'
    },
    {
      id: 'ghat',
      name: 'Ghat district health society',
      shortName: 'Ghat',
      level: 'district',
      receivedPaise: 12.6 * CRORE,
      reportedPaise: 12.2 * CRORE,
      reportedAt: '30 Jul 2026',
      parentId: 'malwa'
    },
    {
      id: 'ridge',
      name: 'Ridge district health society',
      shortName: 'Ridge',
      level: 'district',
      receivedPaise: 9 * CRORE,
      reportedPaise: 8.7 * CRORE,
      reportedAt: '31 Jul 2026',
      parentId: 'malwa'
    },
    // Facilities
    {
      id: 'nadi-phc',
      name: 'Nadi primary health centre',
      shortName: 'Nadi PHC',
      level: 'agency',
      receivedPaise: 16 * CRORE,
      reportedPaise: 15.6 * CRORE,
      reportedAt: '02 Aug 2026',
      parentId: 'nadi'
    },
    {
      id: 'nadi-chc',
      name: 'Nadi community health centre',
      shortName: 'Nadi CHC',
      level: 'agency',
      receivedPaise: 16 * CRORE,
      reportedPaise: 15.6 * CRORE,
      reportedAt: '02 Aug 2026',
      parentId: 'nadi'
    },
    {
      id: 'ghat-phc',
      name: 'Ghat primary health centre',
      shortName: 'Ghat PHC',
      level: 'agency',
      receivedPaise: 7 * CRORE,
      reportedPaise: 6.8 * CRORE,
      reportedAt: '03 Aug 2026',
      parentId: 'ghat'
    },
    {
      id: 'ridge-phc',
      name: 'Ridge primary health centre',
      shortName: 'Ridge PHC',
      level: 'agency',
      receivedPaise: 5.5 * CRORE,
      reportedPaise: 5.3 * CRORE,
      reportedAt: '03 Aug 2026',
      parentId: 'ridge'
    }
  ],
  transfers: [
    // Centre share into state societies (60% of total envelope per state).
    { id: 'nhm-t1', fromNodeId: 'india', toNodeId: 'sundar', amountPaise: 54 * CRORE, date: '10 Jul 2026', reference: 'NHM/SUN/C/0710', component: 'centre-share' },
    { id: 'nhm-t2', fromNodeId: 'india', toNodeId: 'aravali', amountPaise: 32.4 * CRORE, date: '11 Jul 2026', reference: 'NHM/ARA/C/0711', component: 'centre-share' },
    { id: 'nhm-t3', fromNodeId: 'india', toNodeId: 'malwa', amountPaise: 21.6 * CRORE, date: '11 Jul 2026', reference: 'NHM/MAL/C/0711', component: 'centre-share' },
    { id: 'nhm-t4', fromNodeId: 'sundar', toNodeId: 'nadi', amountPaise: 32 * CRORE, date: '22 Jul 2026', reference: 'SUN/NAD/0722', component: 'works' },
    { id: 'nhm-t5', fromNodeId: 'sundar', toNodeId: 'pahar', amountPaise: 30 * CRORE, date: '22 Jul 2026', reference: 'SUN/PAH/0722', component: 'works' },
    { id: 'nhm-t6', fromNodeId: 'sundar', toNodeId: 'maidan', amountPaise: 28 * CRORE, date: '23 Jul 2026', reference: 'SUN/MAI/0723', component: 'works' },
    { id: 'nhm-t7', fromNodeId: 'aravali', toNodeId: 'teer', amountPaise: 28 * CRORE, date: '23 Jul 2026', reference: 'ARA/TEE/0723', component: 'works' },
    { id: 'nhm-t8', fromNodeId: 'aravali', toNodeId: 'khet', amountPaise: 26 * CRORE, date: '24 Jul 2026', reference: 'ARA/KHE/0724', component: 'works' },
    { id: 'nhm-t9', fromNodeId: 'malwa', toNodeId: 'ghat', amountPaise: 12.6 * CRORE, date: '24 Jul 2026', reference: 'MAL/GHA/0724', component: 'centre-share' },
    { id: 'nhm-t10', fromNodeId: 'malwa', toNodeId: 'ridge', amountPaise: 9 * CRORE, date: '24 Jul 2026', reference: 'MAL/RID/0724', component: 'centre-share' },
    { id: 'nhm-t11', fromNodeId: 'nadi', toNodeId: 'nadi-phc', amountPaise: 16 * CRORE, date: '28 Jul 2026', reference: 'NAD/PHC/0728', component: 'works' },
    { id: 'nhm-t12', fromNodeId: 'nadi', toNodeId: 'nadi-chc', amountPaise: 16 * CRORE, date: '28 Jul 2026', reference: 'NAD/CHC/0728', component: 'works' },
    { id: 'nhm-t13', fromNodeId: 'ghat', toNodeId: 'ghat-phc', amountPaise: 7 * CRORE, date: '29 Jul 2026', reference: 'GHA/PHC/0729', component: 'works' },
    { id: 'nhm-t14', fromNodeId: 'ridge', toNodeId: 'ridge-phc', amountPaise: 5.5 * CRORE, date: '29 Jul 2026', reference: 'RID/PHC/0729', component: 'works' }
  ],
  reconciliations: [
    {
      nodeId: 'malwa',
      status: 'needs-explanation',
      items: [
        { label: 'Centre share received', amountPaise: 21.6 * CRORE, description: 'Central matching share credited to the state health society.' },
        { label: 'Traced with available funds', amountPaise: 21.6 * CRORE, description: 'Onward district releases from centre share currently held.' },
        { label: 'State share not yet released', amountPaise: 12 * CRORE, description: 'Matching state share for this tranche is not yet released in this scenario.' },
        { label: 'Awaiting society report', amountPaise: 1.4 * CRORE, description: 'A portion of the facility utilisation awaits the next society report.' }
      ]
    },
    {
      nodeId: 'sundar',
      status: 'clear',
      items: [
        { label: 'Centre share', amountPaise: 54 * CRORE, description: 'Central 60% share merged at the state society.' },
        { label: 'State share', amountPaise: 36 * CRORE, description: 'State 40% matching share released and merged.' },
        { label: 'Traced to districts', amountPaise: 90 * CRORE, description: 'Full combined envelope published onward to districts.' }
      ]
    },
    {
      nodeId: 'aravali',
      status: 'clear',
      items: [
        { label: 'Centre share', amountPaise: 32.4 * CRORE, description: 'Central 60% share merged at the state society.' },
        { label: 'State share', amountPaise: 21.6 * CRORE, description: 'State 40% matching share released and merged.' },
        { label: 'Traced to districts', amountPaise: 54 * CRORE, description: 'Full combined envelope published onward to districts.' }
      ]
    }
  ]
};
