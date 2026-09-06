import { describe, expect, it } from 'vitest';
import { LANDHOLDER_INCOME_SCENARIO } from '../data/fixtures/landholder-income.scenario';
import { rankNamedPlaces } from '../domain/rank-named-places';
import { ExplainService, templateAsk } from './explain.service';
import { LedgerService } from './ledger.service';
import { SyntheticScenarioSource } from '../data/fixtures/synthetic-scenario.source';

describe('templateAsk comparison', () => {
  it('answers scheme-only ranking from named district related nodes', () => {
    const ledger = new LedgerService(new SyntheticScenarioSource());
    const explain = new ExplainService(ledger);
    const related = rankNamedPlaces(LANDHOLDER_INCOME_SCENARIO, 'district', 3);
    const slice = explain.buildAskSlice(
      LANDHOLDER_INCOME_SCENARIO,
      'india',
      'which village got the most money in the landholder income scheme',
      'en',
      { relatedNodes: related }
    );

    expect(slice.related?.[0]?.id).toBe('raital');

    const result = templateAsk(
      slice,
      'which village got the most money in the landholder income scheme'
    );

    expect(result.source).toBe('template');
    expect(result.answer).toContain('Raital');
    expect(result.answer).toContain('named district offices');
    expect(result.answer).toContain('not a complete village ranking');
    expect(result.citedNodeIds[0]).toBe('raital');
    expect(result.followUps[0]).toContain('Raital');
  });
});
