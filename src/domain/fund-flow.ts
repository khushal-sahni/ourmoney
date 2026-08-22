export type NodeLevel = 'national' | 'state' | 'district' | 'agency';
export type ReconciliationStatus = 'clear' | 'watch' | 'needs-explanation';

/** Cardinally different public-scheme fund-flow shapes used by synthetic fixtures. */
export type SchemeKind = 'works-sna' | 'demand-wage' | 'central-dbt' | 'matching-society';

export type TransferComponent =
  | 'wage'
  | 'material'
  | 'centre-share'
  | 'state-share'
  | 'installment'
  | 'works';

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
  readonly component?: TransferComponent;
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

export interface ISchemeSummary {
  readonly id: string;
  readonly schemeName: string;
  readonly schemeCode: string;
  readonly schemeKind: SchemeKind;
  readonly period: string;
  readonly kindLabel: string;
  readonly defaultFocusNodeId: string;
}

export interface ISchemeScenario {
  readonly id: string;
  readonly schemeName: string;
  readonly schemeCode: string;
  readonly schemeKind: SchemeKind;
  readonly lastMileLabel: string;
  readonly period: string;
  readonly sourceLabel: string;
  readonly defaultFocusNodeId: string;
  readonly centreSharePaise?: number;
  readonly stateSharePaise?: number;
  readonly nodes: readonly IFundingNode[];
  readonly transfers: readonly ITransfer[];
  readonly reconciliations: readonly IReconciliation[];
}

export function schemeKindDescription(kind: SchemeKind): string {
  switch (kind) {
    case 'works-sna':
      return 'Works scheme with Single Nodal Account float — funds move through state and district implementing units to works agencies.';
    case 'demand-wage':
      return 'Demand-driven wage and material scheme — last mile is the panchayat, with separate wage-credit and material streams.';
    case 'central-dbt':
      return 'Central direct-credit scheme — nearly all funds go as installment batches to district credit ledgers, not works agencies.';
    case 'matching-society':
      return 'Centre–state matching society scheme — centre and state shares merge at the state society before flowing to facilities.';
    default: {
      const _exhaustive: never = kind;
      return _exhaustive;
    }
  }
}
