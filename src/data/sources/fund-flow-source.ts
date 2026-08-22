import type { ISchemeScenario } from '../../domain/fund-flow';

export interface IFundFlowSource {
  loadScenario(): Promise<ISchemeScenario>;
}
