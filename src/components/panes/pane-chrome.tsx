import type { ReactElement, ReactNode } from 'react';

export function PaneChrome({
  children,
  onCollapse,
  collapseLabel,
  collapseIcon,
  className
}: {
  children?: ReactNode;
  onCollapse: () => void;
  collapseLabel: string;
  collapseIcon: ReactNode;
  className?: string;
}): ReactElement {
  return (
    <div className={`pane-chrome${className ? ` ${className}` : ''}`}>
      {children}
      <button
        type="button"
        className="pane-collapse-btn"
        title={collapseLabel}
        aria-label={collapseLabel}
        onClick={onCollapse}
      >
        {collapseIcon}
      </button>
    </div>
  );
}
