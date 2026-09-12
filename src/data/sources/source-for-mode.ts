import type { IFundFlowSource } from './fund-flow-source';
import { SyntheticScenarioSource } from '../fixtures/synthetic-scenario.source';
import { PublicRecordSource } from './public-record.source';
import type { DataMode } from '../../utils/data-mode';
import { ALL_SCENARIOS, DEFAULT_SCHEME_ID, SCHEME_CATALOG } from '../fixtures/catalog';
import {
  LIVE_CATALOG,
  LIVE_DEFAULT_SCHEME_ID,
  LIVE_SCENARIOS,
  MGNREGA_HP_SCENARIO
} from '../live/mgnrega-hp-2025-26/build-scenario';
import type { ISchemeScenario, ISchemeSummary } from '../../domain/fund-flow';
import { GOLDEN_PATH } from '../../constants/golden-path';

const mockSource = new SyntheticScenarioSource();
const liveSource = new PublicRecordSource();

export function sourceForMode(mode: DataMode): IFundFlowSource {
  return mode === 'live' ? liveSource : mockSource;
}

export function catalogForMode(mode: DataMode): readonly ISchemeSummary[] {
  return mode === 'live' ? LIVE_CATALOG : SCHEME_CATALOG;
}

export function scenariosForMode(mode: DataMode): readonly ISchemeScenario[] {
  return mode === 'live' ? LIVE_SCENARIOS : ALL_SCENARIOS;
}

export function defaultSchemeIdForMode(mode: DataMode): string {
  return mode === 'live' ? LIVE_DEFAULT_SCHEME_ID : DEFAULT_SCHEME_ID;
}

export function defaultFocusForMode(mode: DataMode): { readonly schemeId: string; readonly nodeId: string } {
  if (mode === 'live') {
    return {
      schemeId: LIVE_DEFAULT_SCHEME_ID,
      nodeId: MGNREGA_HP_SCENARIO.defaultFocusNodeId
    };
  }
  return {
    schemeId: GOLDEN_PATH.schemeId,
    nodeId: GOLDEN_PATH.nodeId
  };
}

export function findScenarioInMode(
  mode: DataMode,
  schemeId: string
): ISchemeScenario | undefined {
  return scenariosForMode(mode).find((scenario) => scenario.id === schemeId);
}
