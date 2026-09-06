import { describe, expect, it } from 'vitest';
import { WATER_ACCESS_SCENARIO } from '../data/fixtures/water-access.scenario';
import { buildQuestionCorridor, resolveQuestionNodes } from './resolve-question-nodes';
import { resolveQuestionIntent } from './resolve-question-intent';

describe('resolveQuestionNodes', () => {
  it('prefers longest overlapping place span', () => {
    const ids = resolveQuestionNodes(WATER_ACCESS_SCENARIO, 'Kanak Pradesh and Uttar Raital');
    expect(ids).toContain('uttar-raital');
    expect(ids).not.toContain('raital');
  });
});

describe('buildQuestionCorridor', () => {
  it('builds a corridor through multiple mentions', () => {
    const corridor = buildQuestionCorridor(
      WATER_ACCESS_SCENARIO,
      'Kanak Pradesh and Piprahi Paani Samiti',
      'piprahi-paani'
    );
    expect(corridor.mentionedNodeIds.length).toBeGreaterThan(0);
    expect(corridor.corridorNodes.some((node) => node.id === 'piprahi-paani')).toBe(true);
  });
});

describe('resolveQuestionIntent', () => {
  it('resolves roads question to rural works and Uttar Raital analogue', () => {
    const intent = resolveQuestionIntent('Where is the money going for roads at Uttar Raital?');
    expect(intent?.kind).toBe('resolved');
    expect(intent?.schemeId).toBe('rural-works-guarantee');
  });

  it('redirects real Orai to demo analogue without inventing data', () => {
    const intent = resolveQuestionIntent('roads for Orai');
    expect(intent?.kind).toBe('unknown_place');
    expect(intent?.placeLabel).toBe('Uttar Raital');
  });
});
