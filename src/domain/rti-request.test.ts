import { describe, expect, it } from 'vitest';
import { citizenStanding } from './citizen-standing';
import {
  assembleRtiApplication,
  buildRtiPoints,
  resolveRtiAuthority,
  replyDueDate,
  RTI_TEXT_OF_APPLICATION_LIMIT
} from './rti-request';
import { ALL_SCENARIOS } from '../data/fixtures/catalog';

const rural = ALL_SCENARIOS.find((scenario) => scenario.id === 'rural-works-guarantee')
  ?? ALL_SCENARIOS[0];
const water = ALL_SCENARIOS.find((scenario) => scenario.id === 'water-access')
  ?? ALL_SCENARIOS[0];

describe('resolveRtiAuthority', () => {
  it('maps district programme coordinator to a state physical channel', () => {
    const node = rural.nodes.find((candidate) => candidate.bodyKind === 'district-programme-coordinator');
    expect(node).toBeDefined();
    if (!node) return;
    const authority = resolveRtiAuthority(rural, node);
    expect(authority.publicAuthority).toContain('District Programme Coordinator');
    expect(authority.pioDesignation).toContain('Public Information Officer');
    expect(authority.appellateDesignation).toContain('First Appellate Authority');
    expect(authority.jurisdiction).toBe('state');
    expect(authority.filingChannel).toBe('physical');
  });

  it('maps national / central-dbt nodes to rtionline', () => {
    const landholder = ALL_SCENARIOS.find((scenario) => scenario.schemeKind === 'central-dbt');
    expect(landholder).toBeDefined();
    if (!landholder) return;
    const national = landholder.nodes.find((candidate) => candidate.level === 'national');
    expect(national).toBeDefined();
    if (!national) return;
    const authority = resolveRtiAuthority(landholder, national);
    expect(authority.filingChannel).toBe('rtionline');
    expect(authority.filingUrl).toContain('rtionline.gov.in');
  });

  it('maps SWSM state nodes to state-portal', () => {
    const swsm = water.nodes.find((candidate) => candidate.bodyKind === 'swsm');
    expect(swsm).toBeDefined();
    if (!swsm) return;
    const authority = resolveRtiAuthority(water, swsm);
    expect(authority.filingChannel).toBe('state-portal');
    expect(authority.publicAuthority).toContain('State Water and Sanitation Mission');
  });
});

describe('buildRtiPoints', () => {
  it('generates record requests for a needs-explanation reconciliation', () => {
    const recon = rural.reconciliations.find((item) => item.status === 'needs-explanation')
      ?? rural.reconciliations[0];
    expect(recon).toBeDefined();
    if (!recon) return;
    const node = rural.nodes.find((candidate) => candidate.id === recon.nodeId);
    expect(node).toBeDefined();
    if (!node) return;
    const standing = citizenStanding(rural, node);
    const points = buildRtiPoints(rural, node, standing, recon);
    expect(points.length).toBeGreaterThanOrEqual(2);
    expect(points.some((point) => /utilisation certificate/i.test(point.text))).toBe(true);
    expect(points.every((point) => !/corrupt|theft|misconduct|stolen/i.test(point.text))).toBe(true);
  });
});

describe('assembleRtiApplication', () => {
  it('splits overflow past the 3000-character portal limit into an annexure', () => {
    const node = rural.nodes.find((candidate) => candidate.id === rural.defaultFocusNodeId)
      ?? rural.nodes[0];
    const standing = citizenStanding(rural, node);
    const recon = rural.reconciliations.find((item) => item.nodeId === node.id);
    const points = buildRtiPoints(rural, node, standing, recon).map((point) => point.text);
    const padded = [
      ...points,
      'A'.repeat(2800)
    ];
    const authority = resolveRtiAuthority(rural, node);
    const assembled = assembleRtiApplication({
      authority,
      scenario: rural,
      node,
      points: padded,
      applicantName: 'Demo Citizen',
      applicantAddress: 'Demo address'
    });
    expect(assembled.exceedsLimit).toBe(true);
    expect(assembled.annexure).toBeDefined();
    expect(assembled.textOfApplication.length).toBeLessThanOrEqual(RTI_TEXT_OF_APPLICATION_LIMIT);
    expect(assembled.fullText).toContain('Annexure A');
  });

  it('computes a reply due date 30 days out', () => {
    const from = new Date('2026-09-06T00:00:00Z');
    const due = replyDueDate(from);
    expect(due.toISOString().slice(0, 10)).toBe('2026-10-06');
  });
});
