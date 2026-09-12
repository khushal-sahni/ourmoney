import type { ISchemeScenario, ISchemeSummary } from '../../domain/fund-flow';
import type { IFundFlowSource } from '../sources/fund-flow-source';
import { findStandingInconsistencies } from '../../domain/citizen-standing';
import {
  LIVE_CATALOG,
  LIVE_DEFAULT_SCHEME_ID,
  LIVE_SCENARIOS
} from '../live/mgnrega-hp-2025-26/build-scenario';

export class PublicRecordSource implements IFundFlowSource {
  public async loadCatalog(): Promise<readonly ISchemeSummary[]> {
    return LIVE_CATALOG;
  }

  public async loadScenario(schemeId: string): Promise<ISchemeScenario> {
    const match = LIVE_SCENARIOS.find((scenario) => scenario.id === schemeId);
    const scenario = match
      ?? LIVE_SCENARIOS.find((entry) => entry.id === LIVE_DEFAULT_SCHEME_ID);
    if (!scenario) {
      throw new Error('Public-record catalog is empty.');
    }

    const issues = findStandingInconsistencies(scenario);
    if (issues.length > 0) {
      throw new Error(`Public-record coherence failed for ${scenario.id}: ${issues[0]}`);
    }

    return scenario;
  }
}
