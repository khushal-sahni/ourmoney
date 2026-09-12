export type NodeLevel = 'national' | 'state' | 'district' | 'block' | 'agency';
export type ReconciliationStatus = 'clear' | 'watch' | 'needs-explanation';

/** Cardinally different public-scheme fund-flow shapes used by synthetic fixtures. */
export type SchemeKind = 'works-sna' | 'demand-wage' | 'central-dbt' | 'matching-society';

/** Implementing-body kinds attached to place nodes (scheme-specific vocabulary). */
export type BodyKind =
  | 'national-account'
  | 'swsm'
  | 'dwsm'
  | 'block-resource-centre'
  | 'paani-samiti'
  | 'phed-division'
  | 'segf'
  | 'district-programme-coordinator'
  | 'programme-officer'
  | 'gram-panchayat'
  | 'dbt-cell'
  | 'district-agri-office'
  | 'block-enrollment'
  | 'apbs-credit-file'
  | 'shs'
  | 'dhs'
  | 'bpmu'
  | 'phc'
  | 'chc'
  | 'village-health-committee';

export type TransferComponent =
  | 'wage'
  | 'material'
  | 'admin'
  | 'centre-share'
  | 'state-share'
  | 'installment'
  | 'works'
  | 'in-village'
  | 'bulk-supply'
  | 'family-health'
  | 'disease-control'
  | 'infrastructure';

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
  /**
   * Allowed own spend at this office (admin / support / last-mile use).
   * Not leftover and not an unnamed next office.
   */
  readonly usedHerePaise?: number;
  /** Short chip label for used-here (e.g. Admin, Support, Credits). */
  readonly usedHereLabel?: string;
  /** Scheme-specific implementing body kind for inspector copy. */
  readonly bodyKind?: BodyKind;
  /** Short work-stream label shown under the place name (e.g. "Paani Samiti"). */
  readonly workLabel?: string;
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

/** Where the scenario figures come from — drives evidence badges and disclaimers. */
export type ScenarioProvenance = 'synthetic' | 'public-record';

export interface ISchemeScenario {
  readonly id: string;
  readonly schemeName: string;
  readonly schemeCode: string;
  readonly schemeKind: SchemeKind;
  readonly lastMileLabel: string;
  readonly period: string;
  readonly sourceLabel: string;
  /** Defaults to synthetic when omitted (legacy fixtures). */
  readonly provenance?: ScenarioProvenance;
  readonly defaultFocusNodeId: string;
  readonly centreSharePaise?: number;
  readonly stateSharePaise?: number;
  readonly nodes: readonly IFundingNode[];
  readonly transfers: readonly ITransfer[];
  readonly reconciliations: readonly IReconciliation[];
}

export function scenarioProvenance(scenario: ISchemeScenario): ScenarioProvenance {
  return scenario.provenance ?? 'synthetic';
}

export function schemeKindDescription(kind: SchemeKind): string {
  switch (kind) {
    case 'works-sna':
      return 'Works scheme with Single Nodal Account float — funds move through state and district missions to block centres and village / PHED implementing units.';
    case 'demand-wage':
      return 'Demand-driven wage and material scheme — last mile is the gram panchayat, with separate wage FTO and material streams via the block programme officer.';
    case 'central-dbt':
      return 'Central direct-credit scheme — installment files move through thin state DBT cells and district agriculture ledgers into block APBS credit batches.';
    case 'matching-society':
      return 'Centre–state matching society scheme — centre and state shares merge at the state health society before flowing to district societies, block units, and facilities.';
    default: {
      const _exhaustive: never = kind;
      return _exhaustive;
    }
  }
}

export function bodyKindLabel(kind: BodyKind | undefined): string | undefined {
  if (!kind) return undefined;
  switch (kind) {
    case 'national-account':
      return 'National programme account';
    case 'swsm':
      return 'State Water and Sanitation Mission (SNA)';
    case 'dwsm':
      return 'District Water and Sanitation Mission';
    case 'block-resource-centre':
      return 'Block resource centre';
    case 'paani-samiti':
      return 'Paani Samiti / village scheme';
    case 'phed-division':
      return 'PHED division (bulk supply)';
    case 'segf':
      return 'State Employment Guarantee Fund (SNA)';
    case 'district-programme-coordinator':
      return 'District Programme Coordinator';
    case 'programme-officer':
      return 'Block Programme Officer';
    case 'gram-panchayat':
      return 'Gram Panchayat';
    case 'dbt-cell':
      return 'State DBT cell';
    case 'district-agri-office':
      return 'District Agriculture Office';
    case 'block-enrollment':
      return 'Block enrollment file';
    case 'apbs-credit-file':
      return 'APBS installment credit file';
    case 'shs':
      return 'State Health Society';
    case 'dhs':
      return 'District Health Society';
    case 'bpmu':
      return 'Block Programme Management Unit';
    case 'phc':
      return 'Primary Health Centre';
    case 'chc':
      return 'Community Health Centre';
    case 'village-health-committee':
      return 'Village health committee';
    default: {
      const _exhaustive: never = kind;
      return _exhaustive;
    }
  }
}
