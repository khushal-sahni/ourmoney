import { describe, expect, it } from 'vitest';
import { LANDHOLDER_INCOME_SCENARIO } from '../data/fixtures/landholder-income.scenario';
import { nationalRootNode, rankNamedPlaces } from './rank-named-places';

describe('rankNamedPlaces', () => {
  it('ranks Landholder districts by received with Raital first', () => {
    const ranked = rankNamedPlaces(LANDHOLDER_INCOME_SCENARIO, 'district', 3);
    expect(ranked[0]?.id).toBe('raital');
    expect(ranked[0]?.shortName).toBe('Raital');
    expect(ranked).toHaveLength(3);
    expect(ranked[0]!.receivedPaise).toBeGreaterThanOrEqual(ranked[1]!.receivedPaise);
    expect(ranked[1]!.receivedPaise).toBeGreaterThanOrEqual(ranked[2]!.receivedPaise);
  });
});

describe('nationalRootNode', () => {
  it('returns the national programme account', () => {
    const root = nationalRootNode(LANDHOLDER_INCOME_SCENARIO);
    expect(root?.id).toBe('india');
    expect(root?.level).toBe('national');
  });
});
