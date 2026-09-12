import { useCallback, useEffect, useState, type ReactElement } from 'react';
import {
  applyDataMode,
  persistDataMode,
  resolveInitialDataMode,
  type DataMode
} from '../utils/data-mode';

export function DataModeToggle({
  mode,
  onChange
}: {
  mode: DataMode;
  onChange: (mode: DataMode) => void;
}): ReactElement {
  const [localMode, setLocalMode] = useState<DataMode>(mode);

  useEffect(() => {
    setLocalMode(mode);
    applyDataMode(mode);
  }, [mode]);

  const toggle = useCallback((): void => {
    const next: DataMode = localMode === 'mock' ? 'live' : 'mock';
    persistDataMode(next);
    applyDataMode(next);
    setLocalMode(next);
    onChange(next);
  }, [localMode, onChange]);

  const nextLabel = localMode === 'mock' ? 'Switch to live public-record view' : 'Switch to mock demo view';

  return (
    <button
      type="button"
      className="data-mode-toggle"
      onClick={toggle}
      aria-label={nextLabel}
      title={nextLabel}
      aria-pressed={localMode === 'live'}
    >
      <span className="data-mode-toggle-track" aria-hidden="true">
        <span className={`data-mode-toggle-thumb ${localMode}`}>
          {localMode === 'mock' ? 'Mock' : 'Live'}
        </span>
      </span>
    </button>
  );
}

/** Boot helper for main.tsx — mirrors theme. */
export function bootDataMode(): DataMode {
  const mode = resolveInitialDataMode();
  applyDataMode(mode);
  return mode;
}
