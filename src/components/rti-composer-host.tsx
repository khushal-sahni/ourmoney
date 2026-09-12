import { useMemo, type ReactElement } from 'react';
import { useSession } from '../app/session-context';
import { findScenarioInMode } from '../data/sources/source-for-mode';
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
  const session = useSession();
  const scenario = useMemo(
    () => findScenarioInMode(session.dataMode, schemeId),
    [schemeId, session.dataMode]
  );
  const node = useMemo(
    () => scenario?.nodes.find((candidate) => candidate.id === nodeId),
    [scenario, nodeId]
  );

  if (!scenario || !node) return null;

  return <RtiComposer scenario={scenario} node={node} onClose={onClose} />;
}
