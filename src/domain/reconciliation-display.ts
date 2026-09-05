import type { IReconciliation, ReconciliationStatus } from './fund-flow';

export function reconciliationStatusLabel(status: ReconciliationStatus): string {
  switch (status) {
    case 'clear':
      return 'Records match';
    case 'watch':
      return 'Worth watching';
    case 'needs-explanation':
      return 'Needs explanation';
    default: {
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
}

export function reconciliationFlagSummary(reconciliation: IReconciliation): string {
  const primary = reconciliation.items[0];
  if (!primary) return reconciliationStatusLabel(reconciliation.status);
  if (reconciliation.status === 'needs-explanation') {
    return primary.description;
  }
  return primary.label;
}

export function reconciliationChipClass(status: ReconciliationStatus): string {
  switch (status) {
    case 'clear':
      return 'flag-clear';
    case 'watch':
      return 'flag-watch';
    case 'needs-explanation':
      return 'flag-needs';
    default: {
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
}
