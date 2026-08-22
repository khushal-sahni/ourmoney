export type NodeLevel = 'national' | 'state' | 'district' | 'agency';
export type ReconciliationStatus = 'clear' | 'watch' | 'needs-explanation';

export interface IFundingNode {
  readonly id: string;
  readonly name: string;
  readonly shortName: string;
  readonly level: NodeLevel;
  readonly receivedPaise: number;
  readonly reportedPaise: number;
  readonly reportedAt: string;
  readonly parentId?: string;
  readonly unpublishedPaise?: number;
}

export interface ITransfer {
  readonly id: string;
  readonly fromNodeId: string;
  readonly toNodeId: string;
  readonly amountPaise: number;
  readonly date: string;
  readonly reference: string;
}

export interface IReconciliationItem {
  readonly label: string;
  readonly amountPaise: number;
  readonly description: string;
}

export interface IReconciliation {
  readonly nodeId: string;
  readonly status: ReconciliationStatus;
  readonly items: readonly IReconciliationItem[];
}

export interface ISchemeScenario {
  readonly schemeName: string;
  readonly schemeCode: string;
  readonly period: string;
  readonly sourceLabel: string;
  readonly nodes: readonly IFundingNode[];
  readonly transfers: readonly ITransfer[];
  readonly reconciliations: readonly IReconciliation[];
}
