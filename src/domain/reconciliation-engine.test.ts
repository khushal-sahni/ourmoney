import { describe, expect, it } from 'vitest';
import { ALL_SCENARIOS } from '../data/fixtures/catalog';
import { computeReconciliation } from './reconciliation-engine';

describe('reconciliation-engine', () => {
  it('flags Piprahi as needs-explanation in water scenario', () => {
    const water = ALL_SCENARIOS.find((scenario) => scenario.id === 'water-access');
    expect(water).toBeDefined();
    const computed = computeReconciliation(water!, 'piprahi-paani');
    expect(['needs-explanation', 'watch']).toContain(computed.status);
  });

  it('flags Bakul GP in rural works scenario', () => {
    const rural = ALL_SCENARIOS.find((scenario) => scenario.id === 'rural-works-guarantee');
    expect(rural).toBeDefined();
    const authored = rural!.reconciliations.find((entry) => entry.nodeId === 'bakul-gp');
    expect(authored).toBeDefined();
    const computed = computeReconciliation(rural!, 'bakul-gp');
    expect(computed.items.length).toBeGreaterThan(0);
  });
});
