import type { ISchemeScenario } from '../../domain/fund-flow';

/** 1 crore rupees expressed in paise. */
const CRORE = 1_000_000_000;

/**
 * Central Sector DBT cash archetype.
 * Three equal installment waves; district variation tracks enrollment, not projects.
 * ~2% returned credits; almost no unpublished float.
 * Highlight: returned credit / awaiting re-issue at Maidan.
 */
export const LANDHOLDER_INCOME_SCENARIO: ISchemeScenario = {
  id: 'landholder-income',
  schemeName: 'Landholder Income Support',
  schemeCode: 'LIS–26',
  schemeKind: 'central-dbt',
  lastMileLabel: 'Credit batch',
  period: 'FY 2026–27 · Installment 2 of 3',
  sourceLabel: 'Synthetic demonstration scenario · no live government data',
  defaultFocusNodeId: 'maidan-credits',
  nodes: [
    {
      id: 'india',
      name: 'National direct-credit programme account',
      shortName: 'Central release',
      level: 'national',
      receivedPaise: 95 * CRORE,
      reportedPaise: 93.1 * CRORE,
      reportedAt: '10 Aug 2026',
      unpublishedPaise: 1.9 * CRORE
    },
    // State nodes are thin DBT cells — almost no treasury float.
    {
      id: 'sundar',
      name: 'Sundar Pradesh DBT cell',
      shortName: 'Sundar Pradesh',
      level: 'state',
      receivedPaise: 48 * CRORE,
      reportedPaise: 47.1 * CRORE,
      reportedAt: '11 Aug 2026',
      parentId: 'india',
      unpublishedPaise: 0.9 * CRORE
    },
    {
      id: 'aravali',
      name: 'Aravali DBT cell',
      shortName: 'Aravali',
      level: 'state',
      receivedPaise: 28 * CRORE,
      reportedPaise: 27.5 * CRORE,
      reportedAt: '11 Aug 2026',
      parentId: 'india',
      unpublishedPaise: 0.5 * CRORE
    },
    {
      id: 'malwa',
      name: 'Malwa DBT cell',
      shortName: 'Malwa',
      level: 'state',
      receivedPaise: 17.1 * CRORE,
      reportedPaise: 16.6 * CRORE,
      reportedAt: '11 Aug 2026',
      parentId: 'india',
      unpublishedPaise: 0.5 * CRORE
    },
    // Districts — enrollment-weighted (Maidan highest in Sundar)
    {
      id: 'nadi',
      name: 'Nadi district enrollment ledger',
      shortName: 'Nadi',
      level: 'district',
      receivedPaise: 14 * CRORE,
      reportedPaise: 13.7 * CRORE,
      reportedAt: '12 Aug 2026',
      parentId: 'sundar'
    },
    {
      id: 'pahar',
      name: 'Pahar district enrollment ledger',
      shortName: 'Pahar',
      level: 'district',
      receivedPaise: 12 * CRORE,
      reportedPaise: 11.8 * CRORE,
      reportedAt: '12 Aug 2026',
      parentId: 'sundar'
    },
    {
      id: 'maidan',
      name: 'Maidan district enrollment ledger',
      shortName: 'Maidan',
      level: 'district',
      receivedPaise: 22 * CRORE,
      reportedPaise: 20.6 * CRORE,
      reportedAt: '12 Aug 2026',
      parentId: 'sundar',
      unpublishedPaise: 0.9 * CRORE
    },
    {
      id: 'teer',
      name: 'Teer district enrollment ledger',
      shortName: 'Teer',
      level: 'district',
      receivedPaise: 15 * CRORE,
      reportedPaise: 14.7 * CRORE,
      reportedAt: '12 Aug 2026',
      parentId: 'aravali'
    },
    {
      id: 'khet',
      name: 'Khet district enrollment ledger',
      shortName: 'Khet',
      level: 'district',
      receivedPaise: 13 * CRORE,
      reportedPaise: 12.8 * CRORE,
      reportedAt: '12 Aug 2026',
      parentId: 'aravali'
    },
    {
      id: 'ghat',
      name: 'Ghat district enrollment ledger',
      shortName: 'Ghat',
      level: 'district',
      receivedPaise: 10 * CRORE,
      reportedPaise: 9.7 * CRORE,
      reportedAt: '12 Aug 2026',
      parentId: 'malwa'
    },
    {
      id: 'ridge',
      name: 'Ridge district enrollment ledger',
      shortName: 'Ridge',
      level: 'district',
      receivedPaise: 7.1 * CRORE,
      reportedPaise: 6.9 * CRORE,
      reportedAt: '12 Aug 2026',
      parentId: 'malwa'
    },
    // Last mile: credit batches (agency column)
    {
      id: 'nadi-credits',
      name: 'Nadi installment credit batch',
      shortName: 'Nadi credits',
      level: 'agency',
      receivedPaise: 13.7 * CRORE,
      reportedPaise: 13.7 * CRORE,
      reportedAt: '14 Aug 2026',
      parentId: 'nadi'
    },
    {
      id: 'maidan-credits',
      name: 'Maidan installment credit batch',
      shortName: 'Maidan credits',
      level: 'agency',
      receivedPaise: 21.1 * CRORE,
      reportedPaise: 20.2 * CRORE,
      reportedAt: '14 Aug 2026',
      parentId: 'maidan',
      unpublishedPaise: 0.9 * CRORE
    },
    {
      id: 'teer-credits',
      name: 'Teer installment credit batch',
      shortName: 'Teer credits',
      level: 'agency',
      receivedPaise: 14.7 * CRORE,
      reportedPaise: 14.7 * CRORE,
      reportedAt: '14 Aug 2026',
      parentId: 'teer'
    }
  ],
  transfers: [
    // Three installment waves (equal thirds of each state envelope), shown as cumulative mid-year.
    { id: 'lis-t1', fromNodeId: 'india', toNodeId: 'sundar', amountPaise: 16 * CRORE, date: '15 Apr 2026', reference: 'LIS/SUN/I1', component: 'installment' },
    { id: 'lis-t2', fromNodeId: 'india', toNodeId: 'sundar', amountPaise: 16 * CRORE, date: '15 Jul 2026', reference: 'LIS/SUN/I2', component: 'installment' },
    { id: 'lis-t3', fromNodeId: 'india', toNodeId: 'sundar', amountPaise: 16 * CRORE, date: '10 Aug 2026', reference: 'LIS/SUN/I2b', component: 'installment' },
    { id: 'lis-t4', fromNodeId: 'india', toNodeId: 'aravali', amountPaise: 9.3 * CRORE, date: '15 Apr 2026', reference: 'LIS/ARA/I1', component: 'installment' },
    { id: 'lis-t5', fromNodeId: 'india', toNodeId: 'aravali', amountPaise: 9.3 * CRORE, date: '15 Jul 2026', reference: 'LIS/ARA/I2', component: 'installment' },
    { id: 'lis-t6', fromNodeId: 'india', toNodeId: 'aravali', amountPaise: 9.4 * CRORE, date: '10 Aug 2026', reference: 'LIS/ARA/I2b', component: 'installment' },
    { id: 'lis-t7', fromNodeId: 'india', toNodeId: 'malwa', amountPaise: 5.7 * CRORE, date: '15 Apr 2026', reference: 'LIS/MAL/I1', component: 'installment' },
    { id: 'lis-t8', fromNodeId: 'india', toNodeId: 'malwa', amountPaise: 5.7 * CRORE, date: '15 Jul 2026', reference: 'LIS/MAL/I2', component: 'installment' },
    { id: 'lis-t9', fromNodeId: 'india', toNodeId: 'malwa', amountPaise: 5.7 * CRORE, date: '10 Aug 2026', reference: 'LIS/MAL/I2b', component: 'installment' },
    { id: 'lis-t10', fromNodeId: 'sundar', toNodeId: 'nadi', amountPaise: 14 * CRORE, date: '11 Aug 2026', reference: 'SUN/NAD/BATCH', component: 'installment' },
    { id: 'lis-t11', fromNodeId: 'sundar', toNodeId: 'pahar', amountPaise: 12 * CRORE, date: '11 Aug 2026', reference: 'SUN/PAH/BATCH', component: 'installment' },
    { id: 'lis-t12', fromNodeId: 'sundar', toNodeId: 'maidan', amountPaise: 22 * CRORE, date: '11 Aug 2026', reference: 'SUN/MAI/BATCH', component: 'installment' },
    { id: 'lis-t13', fromNodeId: 'aravali', toNodeId: 'teer', amountPaise: 15 * CRORE, date: '11 Aug 2026', reference: 'ARA/TEE/BATCH', component: 'installment' },
    { id: 'lis-t14', fromNodeId: 'aravali', toNodeId: 'khet', amountPaise: 13 * CRORE, date: '11 Aug 2026', reference: 'ARA/KHE/BATCH', component: 'installment' },
    { id: 'lis-t15', fromNodeId: 'malwa', toNodeId: 'ghat', amountPaise: 10 * CRORE, date: '11 Aug 2026', reference: 'MAL/GHA/BATCH', component: 'installment' },
    { id: 'lis-t16', fromNodeId: 'malwa', toNodeId: 'ridge', amountPaise: 7.1 * CRORE, date: '11 Aug 2026', reference: 'MAL/RID/BATCH', component: 'installment' },
    { id: 'lis-t17', fromNodeId: 'nadi', toNodeId: 'nadi-credits', amountPaise: 13.7 * CRORE, date: '14 Aug 2026', reference: 'NAD/CR/0814', component: 'installment' },
    { id: 'lis-t18', fromNodeId: 'maidan', toNodeId: 'maidan-credits', amountPaise: 21.1 * CRORE, date: '14 Aug 2026', reference: 'MAI/CR/0814', component: 'installment' },
    { id: 'lis-t19', fromNodeId: 'teer', toNodeId: 'teer-credits', amountPaise: 14.7 * CRORE, date: '14 Aug 2026', reference: 'TEE/CR/0814', component: 'installment' }
  ],
  reconciliations: [
    {
      nodeId: 'maidan-credits',
      status: 'needs-explanation',
      items: [
        { label: 'Credits settled', amountPaise: 20.2 * CRORE, description: 'Installment amounts credited to enrolled accounts in this batch.' },
        { label: 'Returned credit', amountPaise: 0.6 * CRORE, description: 'Credits returned due to account mismatch in this synthetic scenario.' },
        { label: 'Awaiting re-issue', amountPaise: 0.3 * CRORE, description: 'Returned amounts queued for corrected account re-issue.' }
      ]
    },
    {
      nodeId: 'maidan',
      status: 'watch',
      items: [
        { label: 'Batch credited onward', amountPaise: 21.1 * CRORE, description: 'District ledger pushed to the installment credit batch.' },
        { label: 'Returned / pending re-issue', amountPaise: 0.9 * CRORE, description: 'Enrollment-linked returns not yet re-issued.' }
      ]
    },
    {
      nodeId: 'india',
      status: 'watch',
      items: [
        { label: 'Traced through DBT cells', amountPaise: 93.1 * CRORE, description: 'Installment releases matched to state DBT cells.' },
        { label: 'Returned credits across scheme', amountPaise: 1.9 * CRORE, description: 'Scheme-wide returned credits awaiting corrected re-issue.' }
      ]
    }
  ]
};
