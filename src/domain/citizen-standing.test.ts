import { describe, expect, it } from 'vitest';
import { ALL_SCENARIOS } from '../data/fixtures/catalog';
import { citizenStanding, findStandingInconsistencies } from './citizen-standing';

describe('citizenStanding', () => {
  for (const scenario of ALL_SCENARIOS) {
    it(`balances received for every node in ${scenario.id}`, () => {
      for (const node of scenario.nodes) {
        const standing = citizenStanding(scenario, node);
        const total = standing.sentOnwardPaise + standing.usedHerePaise + standing.ledgerOpenPaise;
        expect(Math.abs(total - standing.receivedPaise)).toBeLessThanOrEqual(1);
      }
    });
  }
});

describe('findStandingInconsistencies', () => {
  for (const scenario of ALL_SCENARIOS) {
    it(`is clean for ${scenario.id}`, () => {
      expect(findStandingInconsistencies(scenario)).toEqual([]);
    });
  }
});
