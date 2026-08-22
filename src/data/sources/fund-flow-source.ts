import type { ISchemeScenario, ISchemeSummary } from '../../domain/fund-flow';

export interface IFundFlowSource {
  loadCatalog(): Promise<readonly ISchemeSummary[]>;
  loadScenario(schemeId: string): Promise<ISchemeScenario>;
}
