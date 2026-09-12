import { describe, expect, it } from 'vitest';
import { findStandingInconsistencies } from '../../../domain/citizen-standing';
import { buildEvidenceBundle } from '../../../domain/evidence';
import { catalogForMode, scenariosForMode, sourceForMode } from '../../sources/source-for-mode';
import { MGNREGA_HP_SCENARIO } from './build-scenario';
import { PublicRecordSource } from '../../sources/public-record.source';

describe('live MGNREGA HP extract', () => {
  it('has coherent citizen standing', () => {
    expect(findStandingInconsistencies(MGNREGA_HP_SCENARIO)).toEqual([]);
  });

  it('is marked public-record and evidence is not synthetic', () => {
    expect(MGNREGA_HP_SCENARIO.provenance).toBe('public-record');
    const focus = MGNREGA_HP_SCENARIO.nodes.find(
      (node) => node.id === MGNREGA_HP_SCENARIO.defaultFocusNodeId
    );
    expect(focus).toBeDefined();
    if (!focus) return;
    const records = buildEvidenceBundle(MGNREGA_HP_SCENARIO, focus, [], undefined);
    expect(records.every((record) => record.synthetic === false)).toBe(true);
  });

  it('exposes one scheme via PublicRecordSource', async () => {
    const source = new PublicRecordSource();
    const catalog = await source.loadCatalog();
    expect(catalog).toHaveLength(1);
    expect(catalog[0]?.id).toBe('mgnrega-hp-2025-26');
    const scenario = await source.loadScenario('mgnrega-hp-2025-26');
    expect(scenario.nodes.some((node) => node.id === 'shimla')).toBe(true);
    expect(scenario.nodes.some((node) => node.id === 'gp-mashobra')).toBe(true);
  });
});

describe('sourceForMode', () => {
  it('swaps catalogs between mock and live', async () => {
    const mockCatalog = await sourceForMode('mock').loadCatalog();
    const liveCatalog = await sourceForMode('live').loadCatalog();
    expect(catalogForMode('mock')).toHaveLength(4);
    expect(catalogForMode('live')).toHaveLength(1);
    expect(mockCatalog).toHaveLength(4);
    expect(liveCatalog).toHaveLength(1);
    expect(scenariosForMode('live')[0]?.id).toBe('mgnrega-hp-2025-26');
  });
});
