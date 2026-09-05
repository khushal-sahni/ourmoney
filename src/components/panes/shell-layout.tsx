import type { ReactNode } from 'react';
import {
  Group,
  Panel,
  Separator,
  useDefaultLayout
} from 'react-resizable-panels';

import type { PaneCollapseControls } from './use-pane-collapse';

const METRICS_DEFAULT_PX = 115;
const METRICS_MIN_PX = 72;
const METRICS_COLLAPSED_PX = 40;

interface ShellLayoutProps {
  readonly layoutId: string;
  readonly metrics: PaneCollapseControls;
  readonly metricsContent: ReactNode;
  readonly metricsRail: ReactNode;
  readonly metricsDefaultSize?: number;
  readonly children: ReactNode;
}

/**
 * Vertical shell: collapsible metrics over the main work area.
 */
export function ShellLayout({
  layoutId,
  metrics,
  metricsContent,
  metricsRail,
  metricsDefaultSize = METRICS_DEFAULT_PX,
  children
}: ShellLayoutProps): ReactNode {
  const { defaultLayout, onLayoutChanged } = useDefaultLayout({
    id: layoutId,
    storage: localStorage
  });

  return (
    <Group
      id={layoutId}
      className="explorer-shell"
      orientation="vertical"
      defaultLayout={defaultLayout}
      onLayoutChanged={onLayoutChanged}
    >
      <Panel
        id="metrics"
        className="shell-metrics-panel"
        panelRef={metrics.panelRef}
        defaultSize={metricsDefaultSize}
        minSize={METRICS_MIN_PX}
        collapsedSize={METRICS_COLLAPSED_PX}
        collapsible
        onResize={metrics.onResize}
      >
        <div className="pane-fill">
          {metrics.collapsed ? metricsRail : metricsContent}
        </div>
      </Panel>
      <Separator className="pane-separator pane-separator-horizontal" />
      <Panel id="work" className="shell-work-panel" minSize="30%">
        <div className="pane-fill">{children}</div>
      </Panel>
    </Group>
  );
}
