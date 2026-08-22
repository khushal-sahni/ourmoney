import type { ISchemeSummary } from '../../domain/fund-flow';
import { LANDHOLDER_INCOME_SCENARIO } from './landholder-income.scenario';
import { NEIGHBOURHOOD_HEALTH_SCENARIO } from './neighbourhood-health.scenario';
import { RURAL_WORKS_GUARANTEE_SCENARIO } from './rural-works-guarantee.scenario';
import { WATER_ACCESS_SCENARIO } from './water-access.scenario';

export const DEFAULT_SCHEME_ID = WATER_ACCESS_SCENARIO.id;

export const SCHEME_CATALOG: readonly ISchemeSummary[] = [
  {
    id: WATER_ACCESS_SCENARIO.id,
    schemeName: WATER_ACCESS_SCENARIO.schemeName,
    schemeCode: WATER_ACCESS_SCENARIO.schemeCode,
    schemeKind: WATER_ACCESS_SCENARIO.schemeKind,
    period: WATER_ACCESS_SCENARIO.period,
    kindLabel: 'Works · SNA float',
    defaultFocusNodeId: WATER_ACCESS_SCENARIO.defaultFocusNodeId
  },
  {
    id: RURAL_WORKS_GUARANTEE_SCENARIO.id,
    schemeName: RURAL_WORKS_GUARANTEE_SCENARIO.schemeName,
    schemeCode: RURAL_WORKS_GUARANTEE_SCENARIO.schemeCode,
    schemeKind: RURAL_WORKS_GUARANTEE_SCENARIO.schemeKind,
    period: RURAL_WORKS_GUARANTEE_SCENARIO.period,
    kindLabel: 'Demand · wage & material',
    defaultFocusNodeId: RURAL_WORKS_GUARANTEE_SCENARIO.defaultFocusNodeId
  },
  {
    id: LANDHOLDER_INCOME_SCENARIO.id,
    schemeName: LANDHOLDER_INCOME_SCENARIO.schemeName,
    schemeCode: LANDHOLDER_INCOME_SCENARIO.schemeCode,
    schemeKind: LANDHOLDER_INCOME_SCENARIO.schemeKind,
    period: LANDHOLDER_INCOME_SCENARIO.period,
    kindLabel: 'Central · direct credit',
    defaultFocusNodeId: LANDHOLDER_INCOME_SCENARIO.defaultFocusNodeId
  },
  {
    id: NEIGHBOURHOOD_HEALTH_SCENARIO.id,
    schemeName: NEIGHBOURHOOD_HEALTH_SCENARIO.schemeName,
    schemeCode: NEIGHBOURHOOD_HEALTH_SCENARIO.schemeCode,
    schemeKind: NEIGHBOURHOOD_HEALTH_SCENARIO.schemeKind,
    period: NEIGHBOURHOOD_HEALTH_SCENARIO.period,
    kindLabel: 'Matching · society route',
    defaultFocusNodeId: NEIGHBOURHOOD_HEALTH_SCENARIO.defaultFocusNodeId
  }
];

export const ALL_SCENARIOS = [
  WATER_ACCESS_SCENARIO,
  RURAL_WORKS_GUARANTEE_SCENARIO,
  LANDHOLDER_INCOME_SCENARIO,
  NEIGHBOURHOOD_HEALTH_SCENARIO
] as const;
