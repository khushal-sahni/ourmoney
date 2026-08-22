import type { ISchemeScenario } from '../../domain/fund-flow';
import { CRORE } from './gazetteer';

/**
 * Central Sector DBT cash archetype.
 * Centre → thin state DBT cell → District Agriculture Office → block enrollment file
 * → Installment 2 APBS credit file.
 * Dense under Raital; gap: returned credit / awaiting re-issue at Kharonda APBS file.
 */
export const LANDHOLDER_INCOME_SCENARIO: ISchemeScenario = {
  id: 'landholder-income',
  schemeName: 'Landholder Income Support',
  schemeCode: 'LIS–26',
  schemeKind: 'central-dbt',
  lastMileLabel: 'Credit file',
  period: 'FY 2026–27 · Installment 2 of 3',
  sourceLabel: 'Synthetic demonstration scenario · no live government data',
  defaultFocusNodeId: 'kharonda-i2',
  nodes: [
    {
      id: 'india',
      name: 'National direct-credit programme account',
      shortName: 'Central release',
      level: 'national',
      bodyKind: 'national-account',
      workLabel: 'Programme account',
      receivedPaise: 95 * CRORE,
      reportedPaise: 93.1 * CRORE,
      reportedAt: '10 Aug 2026',
      unpublishedPaise: 1.9 * CRORE
    },
    {
      id: 'kanak',
      name: 'Kanak Pradesh DBT cell',
      shortName: 'Kanak Pradesh',
      level: 'state',
      bodyKind: 'dbt-cell',
      workLabel: 'DBT cell',
      receivedPaise: 48 * CRORE,
      reportedPaise: 47.1 * CRORE,
      reportedAt: '11 Aug 2026',
      parentId: 'india',
      unpublishedPaise: 0.9 * CRORE
    },
    {
      id: 'girikhand',
      name: 'Girikhand DBT cell',
      shortName: 'Girikhand',
      level: 'state',
      bodyKind: 'dbt-cell',
      workLabel: 'DBT cell',
      receivedPaise: 28 * CRORE,
      reportedPaise: 27.5 * CRORE,
      reportedAt: '11 Aug 2026',
      parentId: 'india',
      unpublishedPaise: 0.5 * CRORE
    },
    {
      id: 'meera',
      name: 'Meera Coast DBT cell',
      shortName: 'Meera Coast',
      level: 'state',
      bodyKind: 'dbt-cell',
      workLabel: 'DBT cell',
      receivedPaise: 17.1 * CRORE,
      reportedPaise: 16.6 * CRORE,
      reportedAt: '11 Aug 2026',
      parentId: 'india',
      unpublishedPaise: 0.5 * CRORE
    },
    // Districts — enrollment-weighted (Raital highest in Kanak)
    {
      id: 'raital',
      name: 'Raital District Agriculture Office enrollment ledger',
      shortName: 'Raital',
      level: 'district',
      bodyKind: 'district-agri-office',
      workLabel: 'District Agriculture Office',
      receivedPaise: 22 * CRORE,
      reportedPaise: 20.6 * CRORE,
      reportedAt: '12 Aug 2026',
      parentId: 'kanak',
      unpublishedPaise: 0.9 * CRORE
    },
    {
      id: 'chandanpur',
      name: 'Chandanpur Kalan District Agriculture Office enrollment ledger',
      shortName: 'Chandanpur Kalan',
      level: 'district',
      bodyKind: 'district-agri-office',
      workLabel: 'District Agriculture Office',
      receivedPaise: 14 * CRORE,
      reportedPaise: 13.7 * CRORE,
      reportedAt: '12 Aug 2026',
      parentId: 'kanak'
    },
    {
      id: 'morwa',
      name: 'Morwa East District Agriculture Office enrollment ledger',
      shortName: 'Morwa East',
      level: 'district',
      bodyKind: 'district-agri-office',
      workLabel: 'District Agriculture Office',
      receivedPaise: 12 * CRORE,
      reportedPaise: 11.8 * CRORE,
      reportedAt: '12 Aug 2026',
      parentId: 'kanak'
    },
    {
      id: 'patharwadi',
      name: 'Patharwadi District Agriculture Office enrollment ledger',
      shortName: 'Patharwadi',
      level: 'district',
      bodyKind: 'district-agri-office',
      workLabel: 'District Agriculture Office',
      receivedPaise: 15 * CRORE,
      reportedPaise: 14.7 * CRORE,
      reportedAt: '12 Aug 2026',
      parentId: 'girikhand'
    },
    {
      id: 'sitabari',
      name: 'Sitabari District Agriculture Office enrollment ledger',
      shortName: 'Sitabari',
      level: 'district',
      bodyKind: 'district-agri-office',
      workLabel: 'District Agriculture Office',
      receivedPaise: 13 * CRORE,
      reportedPaise: 12.8 * CRORE,
      reportedAt: '12 Aug 2026',
      parentId: 'girikhand'
    },
    {
      id: 'dhowli',
      name: 'Dhowli District Agriculture Office enrollment ledger',
      shortName: 'Dhowli',
      level: 'district',
      bodyKind: 'district-agri-office',
      workLabel: 'District Agriculture Office',
      receivedPaise: 10 * CRORE,
      reportedPaise: 9.7 * CRORE,
      reportedAt: '12 Aug 2026',
      parentId: 'meera'
    },
    {
      id: 'nirmalbandh',
      name: 'Nirmalbandh District Agriculture Office enrollment ledger',
      shortName: 'Nirmalbandh',
      level: 'district',
      bodyKind: 'district-agri-office',
      workLabel: 'District Agriculture Office',
      receivedPaise: 7.1 * CRORE,
      reportedPaise: 6.9 * CRORE,
      reportedAt: '12 Aug 2026',
      parentId: 'meera'
    },
    // Raital blocks — enrollment files
    {
      id: 'raital-sadar',
      name: 'Raital Sadar block enrollment file',
      shortName: 'Raital Sadar',
      level: 'block',
      bodyKind: 'block-enrollment',
      workLabel: 'Block enrollment file',
      receivedPaise: 6.8 * CRORE,
      reportedPaise: 6.6 * CRORE,
      reportedAt: '13 Aug 2026',
      parentId: 'raital'
    },
    {
      id: 'kharonda',
      name: 'Kharonda block enrollment file',
      shortName: 'Kharonda',
      level: 'block',
      bodyKind: 'block-enrollment',
      workLabel: 'Block enrollment file',
      receivedPaise: 10.4 * CRORE,
      reportedPaise: 9.5 * CRORE,
      reportedAt: '13 Aug 2026',
      parentId: 'raital',
      unpublishedPaise: 0.9 * CRORE
    },
    {
      id: 'uttar-raital',
      name: 'Uttar Raital block enrollment file',
      shortName: 'Uttar Raital',
      level: 'block',
      bodyKind: 'block-enrollment',
      workLabel: 'Block enrollment file',
      receivedPaise: 4.8 * CRORE,
      reportedPaise: 4.7 * CRORE,
      reportedAt: '13 Aug 2026',
      parentId: 'raital'
    },
    // APBS credit files (last mile)
    {
      id: 'kharonda-i2',
      name: 'Kharonda Installment 2 APBS credit file',
      shortName: 'Kharonda I2 credit file',
      level: 'agency',
      bodyKind: 'apbs-credit-file',
      workLabel: 'APBS Installment 2',
      receivedPaise: 9.5 * CRORE,
      reportedPaise: 8.6 * CRORE,
      reportedAt: '14 Aug 2026',
      parentId: 'kharonda',
      unpublishedPaise: 0.9 * CRORE
    },
    {
      id: 'raital-sadar-i2',
      name: 'Raital Sadar Installment 2 APBS credit file',
      shortName: 'Raital Sadar I2 credit file',
      level: 'agency',
      bodyKind: 'apbs-credit-file',
      workLabel: 'APBS Installment 2',
      receivedPaise: 6.6 * CRORE,
      reportedPaise: 6.6 * CRORE,
      reportedAt: '14 Aug 2026',
      parentId: 'raital-sadar'
    },
    {
      id: 'patharwadi-i2',
      name: 'Patharwadi Installment 2 APBS credit file',
      shortName: 'Patharwadi I2 credit file',
      level: 'agency',
      bodyKind: 'apbs-credit-file',
      workLabel: 'APBS Installment 2',
      receivedPaise: 14.7 * CRORE,
      reportedPaise: 14.7 * CRORE,
      reportedAt: '14 Aug 2026',
      parentId: 'patharwadi'
    }
  ],
  transfers: [
    // Three installment waves (equal thirds of each state envelope), shown as cumulative mid-year.
    { id: 'lis-t1', fromNodeId: 'india', toNodeId: 'kanak', amountPaise: 16 * CRORE, date: '15 Apr 2026', reference: 'APBS/I1/KANAK-20260415', component: 'installment' },
    { id: 'lis-t2', fromNodeId: 'india', toNodeId: 'kanak', amountPaise: 16 * CRORE, date: '15 Jul 2026', reference: 'APBS/I2/KANAK-20260715', component: 'installment' },
    { id: 'lis-t3', fromNodeId: 'india', toNodeId: 'kanak', amountPaise: 16 * CRORE, date: '10 Aug 2026', reference: 'APBS/I2b/KANAK-20260810', component: 'installment' },
    { id: 'lis-t4', fromNodeId: 'india', toNodeId: 'girikhand', amountPaise: 9.3 * CRORE, date: '15 Apr 2026', reference: 'APBS/I1/GIRI-20260415', component: 'installment' },
    { id: 'lis-t5', fromNodeId: 'india', toNodeId: 'girikhand', amountPaise: 9.3 * CRORE, date: '15 Jul 2026', reference: 'APBS/I2/GIRI-20260715', component: 'installment' },
    { id: 'lis-t6', fromNodeId: 'india', toNodeId: 'girikhand', amountPaise: 9.4 * CRORE, date: '10 Aug 2026', reference: 'APBS/I2b/GIRI-20260810', component: 'installment' },
    { id: 'lis-t7', fromNodeId: 'india', toNodeId: 'meera', amountPaise: 5.7 * CRORE, date: '15 Apr 2026', reference: 'APBS/I1/MEERA-20260415', component: 'installment' },
    { id: 'lis-t8', fromNodeId: 'india', toNodeId: 'meera', amountPaise: 5.7 * CRORE, date: '15 Jul 2026', reference: 'APBS/I2/MEERA-20260715', component: 'installment' },
    { id: 'lis-t9', fromNodeId: 'india', toNodeId: 'meera', amountPaise: 5.7 * CRORE, date: '10 Aug 2026', reference: 'APBS/I2b/MEERA-20260810', component: 'installment' },
    { id: 'lis-t10', fromNodeId: 'kanak', toNodeId: 'raital', amountPaise: 22 * CRORE, date: '11 Aug 2026', reference: 'DAO/RAI/ENR-0811', component: 'installment' },
    { id: 'lis-t11', fromNodeId: 'kanak', toNodeId: 'chandanpur', amountPaise: 14 * CRORE, date: '11 Aug 2026', reference: 'DAO/CHK/ENR-0811', component: 'installment' },
    { id: 'lis-t12', fromNodeId: 'kanak', toNodeId: 'morwa', amountPaise: 12 * CRORE, date: '11 Aug 2026', reference: 'DAO/MOR/ENR-0811', component: 'installment' },
    { id: 'lis-t13', fromNodeId: 'girikhand', toNodeId: 'patharwadi', amountPaise: 15 * CRORE, date: '11 Aug 2026', reference: 'DAO/PAT/ENR-0811', component: 'installment' },
    { id: 'lis-t14', fromNodeId: 'girikhand', toNodeId: 'sitabari', amountPaise: 13 * CRORE, date: '11 Aug 2026', reference: 'DAO/SIT/ENR-0811', component: 'installment' },
    { id: 'lis-t15', fromNodeId: 'meera', toNodeId: 'dhowli', amountPaise: 10 * CRORE, date: '11 Aug 2026', reference: 'DAO/DHO/ENR-0811', component: 'installment' },
    { id: 'lis-t16', fromNodeId: 'meera', toNodeId: 'nirmalbandh', amountPaise: 7.1 * CRORE, date: '11 Aug 2026', reference: 'DAO/NIR/ENR-0811', component: 'installment' },
    { id: 'lis-t17', fromNodeId: 'raital', toNodeId: 'raital-sadar', amountPaise: 6.8 * CRORE, date: '13 Aug 2026', reference: 'BLK/RSAD/ENR-0813', component: 'installment' },
    { id: 'lis-t18', fromNodeId: 'raital', toNodeId: 'kharonda', amountPaise: 10.4 * CRORE, date: '13 Aug 2026', reference: 'BLK/KHR/ENR-0813', component: 'installment' },
    { id: 'lis-t19', fromNodeId: 'raital', toNodeId: 'uttar-raital', amountPaise: 4.8 * CRORE, date: '13 Aug 2026', reference: 'BLK/URAI/ENR-0813', component: 'installment' },
    { id: 'lis-t20', fromNodeId: 'kharonda', toNodeId: 'kharonda-i2', amountPaise: 9.5 * CRORE, date: '14 Aug 2026', reference: 'APBS/I2/KHR-20260814-07', component: 'installment' },
    { id: 'lis-t21', fromNodeId: 'raital-sadar', toNodeId: 'raital-sadar-i2', amountPaise: 6.6 * CRORE, date: '14 Aug 2026', reference: 'APBS/I2/RSAD-20260814-03', component: 'installment' },
    { id: 'lis-t22', fromNodeId: 'patharwadi', toNodeId: 'patharwadi-i2', amountPaise: 14.7 * CRORE, date: '14 Aug 2026', reference: 'APBS/I2/PAT-20260814-01', component: 'installment' }
  ],
  reconciliations: [
    {
      nodeId: 'kharonda-i2',
      status: 'needs-explanation',
      items: [
        { label: 'Credits settled', amountPaise: 8.6 * CRORE, description: 'Installment amounts credited to enrolled accounts in this APBS file.' },
        { label: 'Returned credit', amountPaise: 0.6 * CRORE, description: 'Credits returned due to account mismatch / NPCI seeding issue in this synthetic scenario.' },
        { label: 'Awaiting re-issue', amountPaise: 0.3 * CRORE, description: 'Returned amounts queued for corrected account re-issue.' }
      ]
    },
    {
      nodeId: 'kharonda',
      status: 'watch',
      items: [
        { label: 'File credited onward', amountPaise: 9.5 * CRORE, description: 'Block enrollment pushed to the Installment 2 APBS credit file.' },
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
