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

  it('resolves landholder income scheme to scheme_only on the national root', () => {
    const intent = resolveQuestionIntent(
      'So which village got the most money in the landholder income scheme'
    );
    expect(intent?.kind).toBe('scheme_only');
    expect(intent?.schemeId).toBe('landholder-income');
    expect(intent?.focusNodeId).toBe('india');
    expect(intent?.mentionedNodeIds).toEqual(['india']);
  });

  it('treats a bare greeting as ambiguous', () => {
    const intent = resolveQuestionIntent('Hey?');
    expect(intent?.kind).toBe('ambiguous');
  });

  it('resolves Shimla in live mode and ignores Piprahi', () => {
    const shimla = resolveQuestionIntent('Where did reported money go in Shimla?', 'live');
    expect(shimla?.kind).toBe('resolved');
    expect(shimla?.schemeId).toBe('mgnrega-hp-2025-26');
    expect(shimla?.placeLabel.toLowerCase()).toContain('shimla');

    const piprahi = resolveQuestionIntent('Why is utilisation late at Piprahi?', 'live');
    expect(piprahi?.kind).not.toBe('resolved');
    expect(piprahi?.scenario.id).toBe('mgnrega-hp-2025-26');
  });
});
