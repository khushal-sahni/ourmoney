import { useCallback, useEffect, useState, type ReactElement } from 'react';
import {
  applyTheme,
  persistTheme,
  readStoredTheme,
  resolveInitialTheme,
  type ThemeMode
} from '../utils/theme';

export function ThemeToggle(): ReactElement {
  const [theme, setTheme] = useState<ThemeMode>(() => resolveInitialTheme());

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: light)');
    const onChange = (): void => {
      if (readStoredTheme()) return;
      setTheme(media.matches ? 'light' : 'dark');
    };
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  const toggle = useCallback((): void => {
    setTheme((current) => {
      const next: ThemeMode = current === 'dark' ? 'light' : 'dark';
      persistTheme(next);
      return next;
    });
  }, []);

  const nextLabel = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggle}
      aria-label={nextLabel}
      title={nextLabel}
    >
      <span className="theme-toggle-track" aria-hidden="true">
        <span className={`theme-toggle-thumb ${theme}`}>
          {theme === 'dark' ? '☾' : '☀'}
        </span>
      </span>
    </button>
  );
}
