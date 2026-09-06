import type { ISchemeScenario, ISchemeSummary } from '../../domain/fund-flow';
import type { IFundFlowSource } from '../sources/fund-flow-source';
import { ALL_SCENARIOS, DEFAULT_SCHEME_ID, SCHEME_CATALOG } from './catalog';
import { findStandingInconsistencies } from '../../domain/citizen-standing';

export class SyntheticScenarioSource implements IFundFlowSource {
  public async loadCatalog(): Promise<readonly ISchemeSummary[]> {
    return SCHEME_CATALOG;
  }

  public async loadScenario(schemeId: string): Promise<ISchemeScenario> {
    const match = ALL_SCENARIOS.find((scenario) => scenario.id === schemeId);
    const scenario = match ?? ALL_SCENARIOS.find((entry) => entry.id === DEFAULT_SCHEME_ID);
    if (!scenario) {
      throw new Error('Synthetic scenario catalog is empty.');
    }

    const issues = findStandingInconsistencies(scenario);
    if (issues.length > 0) {
      throw new Error(`Fixture coherence failed for ${scenario.id}: ${issues[0]}`);
    }

    return scenario;
  }
}
