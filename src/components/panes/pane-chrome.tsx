import type { ReactElement, ReactNode } from 'react';

export function PaneEdgeToggle({
  onCollapse,
  collapseLabel,
  collapseIcon,
  className
}: {
  onCollapse: () => void;
  collapseLabel: string;
  collapseIcon: ReactNode;
  className?: string;
}): ReactElement {
  return (
    <button
      type="button"
      className={`pane-edge-toggle${className ? ` ${className}` : ''}`}
      title={collapseLabel}
      aria-label={collapseLabel}
      onClick={onCollapse}
    >
      {collapseIcon}
    </button>
  );
}
