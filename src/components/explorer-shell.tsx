import type { ReactElement, ReactNode } from 'react';
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  ChatIcon,
  DetailsIcon,
  MapIcon,
  MetricsIcon,
  TableIcon
} from './ui-icons';
import {
  DetailSplit,
  PaneEdgeToggle,
  PaneRail,
  ShellLayout,
  usePaneCollapse,
  WorkbenchLayout,
  type PaneCollapseControls
} from './panes';

export interface ExplorerPaneControls {
  readonly metrics: PaneCollapseControls;
  readonly workspace: PaneCollapseControls;
  readonly inspector: PaneCollapseControls;
  readonly chat: PaneCollapseControls;
}

export function useExplorerPanes(): ExplorerPaneControls {
  return {
    metrics: usePaneCollapse(),
    workspace: usePaneCollapse(),
    inspector: usePaneCollapse(),
    chat: usePaneCollapse()
  };
}

export function ExplorerShell({
  isMobile,
  view,
  chatOpen,
  panes,
  metricsContent,
  workspaceContent,
  inspectorContent,
  chatContent
}: {
  isMobile: boolean;
  view: 'flow' | 'ledger';
  chatOpen: boolean;
  panes: ExplorerPaneControls;
  metricsContent: ReactNode;
  workspaceContent: ReactNode;
  inspectorContent: ReactNode;
  chatContent: ReactNode;
}): ReactElement {
  const { metrics, workspace, inspector, chat } = panes;

  const metricsRail = (
    <PaneRail
      placement="top"
      label="Show scheme totals"
      onExpand={metrics.expand}
      icon={<MetricsIcon />}
    />
  );

  const workspaceRail = (
    <PaneRail
      placement={isMobile ? 'top' : 'left'}
      label={view === 'flow' ? 'Show flow map' : 'Show ledger table'}
      onExpand={workspace.expand}
      icon={view === 'flow' ? <MapIcon /> : <TableIcon />}
    />
  );

  const inspectorRail = (
    <PaneRail
      placement="right"
      label="Show node details"
      onExpand={inspector.expand}
      icon={<DetailsIcon />}
    />
  );

  const chatRail = (
    <PaneRail
      placement="right"
      label="Show chat"
      onExpand={chat.expand}
      icon={<ChatIcon />}
    />
  );

  const metricsPane = (
    <div className="metrics-pane-wrap">
      <div className="metrics-pane-body">{metricsContent}</div>
      <PaneEdgeToggle
        className="metrics-edge-toggle"
        onCollapse={metrics.collapse}
        collapseLabel="Collapse scheme totals"
        collapseIcon={<ChevronUpIcon />}
      />
    </div>
  );

  const workspacePane = (
    <div className="workspace-pane-wrap">
      <PaneEdgeToggle
        className="workspace-edge-toggle"
        onCollapse={workspace.collapse}
        collapseLabel={view === 'flow' ? 'Collapse flow map' : 'Collapse ledger table'}
        collapseIcon={isMobile ? <ChevronDownIcon /> : <ChevronLeftIcon />}
      />
      <div className="workspace-pane-body">{workspaceContent}</div>
    </div>
  );

  const inspectorBody = (
    <div className="inspector-pane-wrap">
      <PaneEdgeToggle
        className="inspector-edge-toggle"
        onCollapse={inspector.collapse}
        collapseLabel="Collapse node details"
        collapseIcon={<ChevronRightIcon />}
      />
      <div className="inspector-pane-body">{inspectorContent}</div>
    </div>
  );

  const chatBody = chatContent;

  // Mobile: map/workspace fills the work region. Inspector + chat open as sheets
  // from ExploreView — not as stacked resizable panes over the graph.
  if (isMobile) {
    return (
      <ShellLayout
        key="mobile-shell"
        layoutId="om-shell-mobile-v3"
        metrics={metrics}
        metricsDefaultSize={40}
        metricsContent={metricsPane}
        metricsRail={metricsRail}
      >
        <div className="mobile-workspace-fill pane-fill">
          {workspace.collapsed ? workspaceRail : workspacePane}
        </div>
      </ShellLayout>
    );
  }

  return (
    <ShellLayout
      key="desktop-shell"
      layoutId="om-shell-v2"
      metrics={metrics}
      metricsContent={metricsPane}
      metricsRail={metricsRail}
    >
      <WorkbenchLayout
        layoutId="om-workbench-v2"
        workspace={workspace}
        workspaceContent={workspacePane}
        workspaceRail={workspaceRail}
        inspector={inspector}
        inspectorRail={inspectorRail}
        detail={
          <DetailSplit
            layoutId="om-detail-v2"
            inspectorContent={inspectorBody}
            chat={chatOpen ? chat : undefined}
            chatContent={chatOpen ? chatBody : undefined}
            chatRail={chatOpen ? chatRail : undefined}
          />
        }
      />
    </ShellLayout>
  );
}
