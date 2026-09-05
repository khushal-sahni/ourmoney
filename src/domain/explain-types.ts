import type { ICitizenStanding } from './citizen-standing';
import type { IFundingNode, IReconciliation, ISchemeScenario, ITransfer } from './fund-flow';

export type ExplainLocale = 'en' | 'hi';

export interface IGroundedNodeSlice {
  readonly id: string;
  readonly shortName: string;
  readonly level: string;
  readonly workLabel?: string;
  readonly receivedCrore: string;
  readonly sentOnwardCrore: string;
  readonly usedHereCrore: string;
  readonly leftCrore: string;
  readonly reportedAt: string;
}

export interface IGroundedReconciliationSlice {
  readonly status: string;
  readonly items: readonly { readonly label: string; readonly amountCrore: string; readonly description: string }[];
}

export interface IGroundedTransferSlice {
  readonly reference: string;
  readonly amountCrore: string;
  readonly date: string;
  readonly direction: 'in' | 'out';
}

export interface IGroundedExplainSlice {
  readonly schemeId: string;
  readonly schemeName: string;
  readonly schemeKind: string;
  readonly period: string;
  readonly sourceLabel: string;
  readonly locale: ExplainLocale;
  readonly focusNodeId: string;
  readonly path: readonly IGroundedNodeSlice[];
  readonly children: readonly IGroundedNodeSlice[];
  readonly standing: {
    readonly inspectorSummary: string;
    readonly ledgerHint: string;
  };
  readonly reconciliation?: IGroundedReconciliationSlice;
  readonly transfers: readonly IGroundedTransferSlice[];
  readonly syntheticDisclaimer: string;
}

export interface INarrateResponse {
  readonly narration: string;
  readonly source: 'model' | 'template' | 'backup';
}

export interface IAskResponse {
  readonly answer: string;
  readonly citedNodeIds: readonly string[];
  readonly followUps: readonly string[];
  readonly source: 'model' | 'template' | 'backup';
}

export interface IExplainContext {
  readonly scenario: ISchemeScenario;
  readonly node: IFundingNode;
  readonly standing: ICitizenStanding;
  readonly reconciliation?: IReconciliation;
  readonly transfers: readonly ITransfer[];
  readonly locale: ExplainLocale;
}
