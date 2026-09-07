/**
 * Keep `--app-height` in sync with the visible viewport.
 * On iOS Chrome/Safari, `100vh` is the large viewport (behind the URL bar);
 * `visualViewport.height` tracks what the citizen actually sees.
 */
export function bindAppHeight(): () => void {
  const root = document.documentElement;

  const sync = (): void => {
    const height = window.visualViewport?.height ?? window.innerHeight;
    root.style.setProperty('--app-height', `${Math.round(height)}px`);
  };

  sync();

  window.addEventListener('resize', sync);
  const vv = window.visualViewport;
  vv?.addEventListener('resize', sync);
  vv?.addEventListener('scroll', sync);

  return () => {
    window.removeEventListener('resize', sync);
    vv?.removeEventListener('resize', sync);
    vv?.removeEventListener('scroll', sync);
  };
}
