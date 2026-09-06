import type { ReactElement } from 'react';
import type { IFundingNode, ISchemeScenario } from '../domain/fund-flow';
import { pathFor } from '../domain/flow-hierarchy';
import { MapIcon } from './ui-icons';

export function PathArtifact({
  scenario,
  nodeIds,
  onOpenExplore
}: {
  scenario: ISchemeScenario;
  nodeIds: readonly string[];
  onOpenExplore: (node: IFundingNode) => void;
}): ReactElement | null {
  if (nodeIds.length === 0) return null;

  const nodes = nodeIds
    .map((nodeId) => scenario.nodes.find((node) => node.id === nodeId))
    .filter((node): node is IFundingNode => node !== undefined);

  if (nodes.length === 0) return null;

  const deepest = nodes.reduce((current, candidate) =>
    pathFor(scenario, candidate).length > pathFor(scenario, current).length ? candidate : current
  );
  const path = pathFor(scenario, deepest);

  return (
    <div className="path-artifact">
      <p className="path-artifact-label">Fund-flow path · {scenario.schemeName}</p>
      <div className="path-artifact-strip" role="list">
        {path.map((node, index) => (
          <button
            key={node.id}
            type="button"
            className={`path-artifact-node ${nodeIds.includes(node.id) ? 'cited' : ''}`}
            role="listitem"
            onClick={() => onOpenExplore(node)}
          >
            <span>{node.shortName}</span>
            {index < path.length - 1 ? <i aria-hidden="true">→</i> : null}
          </button>
        ))}
      </div>
      <button type="button" className="path-artifact-explore" onClick={() => onOpenExplore(deepest)}>
        <MapIcon />
        <span>Open in Explore</span>
      </button>
    </div>
  );
}
