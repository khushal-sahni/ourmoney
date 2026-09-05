import type { ReactElement, ReactNode } from 'react';

export type PaneRailPlacement = 'top' | 'bottom' | 'left' | 'right';

export function PaneRail({
  placement,
  label,
  onExpand,
  icon
}: {
  placement: PaneRailPlacement;
  label: string;
  onExpand: () => void;
  icon: ReactNode;
}): ReactElement {
  return (
    <div className={`pane-rail pane-rail-${placement}`}>
      <button
        type="button"
        className="pane-rail-toggle"
        title={label}
        aria-label={label}
        onClick={onExpand}
      >
        {icon}
      </button>
    </div>
  );
}
