import { describe, expect, it } from 'vitest';
import { buildExploreHash, parseExploreParams, routeFromHash } from './routing';

describe('routing', () => {
  it('reads static routes from the hash', () => {
    expect(routeFromHash('#compare')).toBe('compare');
    expect(routeFromHash('#features')).toBe('features');
    expect(routeFromHash('#scale')).toBe('scale');
    expect(routeFromHash('#about')).toBe('about');
  });

  it('defaults to ask and recognises explore with params', () => {
    expect(routeFromHash('')).toBe('ask');
    expect(routeFromHash('#')).toBe('ask');
    expect(routeFromHash('#explore?scheme=rural-works&node=n1')).toBe('explore');
    expect(parseExploreParams('#explore?scheme=rural-works&node=n1')).toEqual({
      schemeId: 'rural-works',
      nodeId: 'n1'
    });
  });

  it('builds explore hashes', () => {
    expect(buildExploreHash()).toBe('#explore');
    expect(buildExploreHash({ schemeId: 'water', nodeId: 'x' })).toBe('#explore?scheme=water&node=x');
  });
});
