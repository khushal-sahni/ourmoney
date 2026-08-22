import type { ISchemeScenario, ISchemeSummary } from '../../domain/fund-flow';
import type { IFundFlowSource } from '../sources/fund-flow-source';
import { ALL_SCENARIOS, DEFAULT_SCHEME_ID, SCHEME_CATALOG } from './catalog';

export class SyntheticScenarioSource implements IFundFlowSource {
  public async loadCatalog(): Promise<readonly ISchemeSummary[]> {
    return SCHEME_CATALOG;
  }

  public async loadScenario(schemeId: string): Promise<ISchemeScenario> {
    const match = ALL_SCENARIOS.find((scenario) => scenario.id === schemeId);
    if (match) {
      return match;
    }
    const fallback = ALL_SCENARIOS.find((scenario) => scenario.id === DEFAULT_SCHEME_ID);
    if (!fallback) {
      throw new Error('Synthetic scenario catalog is empty.');
    }
    return fallback;
  }
}
