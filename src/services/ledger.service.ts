import type { IFundingNode, IReconciliation, ISchemeScenario, ITransfer } from '../domain/fund-flow';
import type { IFundFlowSource } from '../data/sources/fund-flow-source';

export class LedgerService {
  public constructor(private readonly source: IFundFlowSource) {}

  public async load(): Promise<ISchemeScenario> {
    return this.source.loadScenario();
  }

  public findNode(scenario: ISchemeScenario, nodeId: string): IFundingNode | undefined {
    return scenario.nodes.find((node) => node.id === nodeId);
  }

  public transfersFor(scenario: ISchemeScenario, nodeId: string): readonly ITransfer[] {
    return scenario.transfers.filter((transfer) => transfer.fromNodeId === nodeId || transfer.toNodeId === nodeId);
  }

  public reconciliationFor(scenario: ISchemeScenario, nodeId: string): IReconciliation | undefined {
    return scenario.reconciliations.find((reconciliation) => reconciliation.nodeId === nodeId);
  }
}
