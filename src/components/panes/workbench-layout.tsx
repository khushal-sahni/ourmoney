import type { ReactNode } from 'react';
import {
  Group,
  Panel,
  Separator,
  useDefaultLayout
} from 'react-resizable-panels';

import type { PaneCollapseControls } from './use-pane-collapse';

const WORKSPACE_COLLAPSED_PX = 40;
const WORKSPACE_MIN_PERCENT = '40%';
const DETAIL_DEFAULT_PX = 340;
const DETAIL_MIN_PX = 240;
const DETAIL_COLLAPSED_PX = 44;

interface WorkbenchLayoutProps {
  readonly layoutId: string;
  readonly workspace: PaneCollapseControls;
  readonly workspaceContent: ReactNode;
  readonly workspaceRail: ReactNode;
  readonly inspector: PaneCollapseControls;
  readonly inspectorRail: ReactNode;
  readonly detail: ReactNode;
}

/**
 * Horizontal workbench: collapsible workspace + collapsible detail column (inspector/chat).
 */
export function WorkbenchLayout({
  layoutId,
  workspace,
  workspaceContent,
  workspaceRail,
  inspector,
  inspectorRail,
  detail
}: WorkbenchLayoutProps): ReactNode {
  const { defaultLayout, onLayoutChanged } = useDefaultLayout({
    id: layoutId,
    storage: localStorage
  });

  return (
    <Group
      id={layoutId}
      className="workbench-layout"
      orientation="horizontal"
      defaultLayout={defaultLayout}
      onLayoutChanged={onLayoutChanged}
    >
      <Panel
        id="workspace"
        className="workbench-workspace-panel"
        panelRef={workspace.panelRef}
        minSize={WORKSPACE_MIN_PERCENT}
        collapsedSize={WORKSPACE_COLLAPSED_PX}
        collapsible
        onResize={workspace.onResize}
      >
        <div className="pane-fill">
          {workspace.collapsed ? workspaceRail : workspaceContent}
        </div>
      </Panel>
      <Separator className="pane-separator pane-separator-vertical" />
      <Panel
        id="detail"
        className="workbench-detail-panel"
        panelRef={inspector.panelRef}
        defaultSize={DETAIL_DEFAULT_PX}
        minSize={DETAIL_MIN_PX}
        collapsedSize={DETAIL_COLLAPSED_PX}
        collapsible
        onResize={inspector.onResize}
      >
        <div className="pane-fill">
          {inspector.collapsed ? inspectorRail : detail}
        </div>
      </Panel>
    </Group>
  );
}
