import { useCallback, useEffect, useMemo, useRef, useState, type ReactElement } from 'react';
import { buildPlaceIndex, searchPlaces, type IPlaceEntry } from '../data/place-index';
import { GOLDEN_PATH } from '../constants/golden-path';

export function LandingOverlay({
  onSelectPlace,
  onOpenGoldenPath,
  onDismiss
}: {
  onSelectPlace: (entry: IPlaceEntry) => void;
  onOpenGoldenPath: () => void;
  onDismiss: () => void;
}): ReactElement {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const placeIndex = useMemo(() => buildPlaceIndex(), []);
  const results = useMemo(() => searchPlaces(placeIndex, query), [placeIndex, query]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const pick = useCallback((entry: IPlaceEntry): void => {
    onSelectPlace(entry);
    onDismiss();
  }, [onDismiss, onSelectPlace]);

  return (
    <div className="landing-overlay" role="dialog" aria-modal="true" aria-labelledby="landing-title">
      <div className="landing-card">
        <p className="landing-badge">Independent hackathon prototype · synthetic data</p>
        <h1 id="landing-title">Where did the reported rupee for your place go?</h1>
        <p className="landing-lead">
          Search a fictional village, block, or district in our demo gazetteer — then walk the fund-flow tree
          from centre release to the last implementing body.
        </p>

        <label className="landing-search">
          <span className="visually-hidden">Find your place</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Try Piprahi, Raital, Kharonda…"
            autoComplete="off"
          />
        </label>

        {results.length > 0 && (
          <ul className="landing-results" role="listbox" aria-label="Place matches">
            {results.map((entry) => (
              <li key={`${entry.schemeId}-${entry.nodeId}`}>
                <button type="button" role="option" onClick={() => pick(entry)}>
                  <strong>{entry.label}</strong>
                  <span>{entry.sublabel}</span>
                  <em>{entry.schemeName}</em>
                  {entry.prototypeCode ? <code>{entry.prototypeCode}</code> : null}
                </button>
              </li>
            ))}
          </ul>
        )}

        <button type="button" className="landing-golden" onClick={() => { onOpenGoldenPath(); onDismiss(); }}>
          Open {GOLDEN_PATH.placeLabel} — demo journey
        </button>

        <button type="button" className="landing-skip" onClick={onDismiss}>
          Browse from centre release instead
        </button>
      </div>
    </div>
  );
}
