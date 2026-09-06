import { useMemo, type ReactElement } from 'react';
import { ALL_SCENARIOS } from '../data/fixtures/catalog';
import { RtiComposer } from './rti-composer';

export function RtiComposerHost({
  schemeId,
  nodeId,
  onClose
}: {
  schemeId: string;
  nodeId: string;
  onClose: () => void;
}): ReactElement | null {
  const scenario = useMemo(
    () => ALL_SCENARIOS.find((entry) => entry.id === schemeId),
    [schemeId]
  );
  const node = useMemo(
    () => scenario?.nodes.find((candidate) => candidate.id === nodeId),
    [scenario, nodeId]
  );

  if (!scenario || !node) return null;

  return <RtiComposer scenario={scenario} node={node} onClose={onClose} />;
}
