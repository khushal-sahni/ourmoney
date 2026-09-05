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
  MobileStackLayout,
  PaneChrome,
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
      placement={isMobile ? 'bottom' : 'right'}
      label="Show node details"
      onExpand={inspector.expand}
      icon={<DetailsIcon />}
    />
  );

  const chatRail = (
    <PaneRail
      placement={isMobile ? 'bottom' : 'right'}
      label="Show chat"
      onExpand={chat.expand}
      icon={<ChatIcon />}
    />
  );

  const metricsPane = (
    <>
      <PaneChrome
        onCollapse={metrics.collapse}
        collapseLabel="Collapse scheme totals"
        collapseIcon={<ChevronUpIcon />}
      />
      <div className="metrics-pane-body">{metricsContent}</div>
    </>
  );

  const workspacePane = (
    <>
      <PaneChrome
        className="workspace-pane-chrome"
        onCollapse={workspace.collapse}
        collapseLabel={view === 'flow' ? 'Collapse flow map' : 'Collapse ledger table'}
        collapseIcon={isMobile ? <ChevronDownIcon /> : <ChevronLeftIcon />}
      />
      <div className="workspace-pane-body">{workspaceContent}</div>
    </>
  );

  const inspectorPane = (
    <>
      <PaneChrome
        className="inspector-pane-chrome"
        onCollapse={inspector.collapse}
        collapseLabel="Collapse node details"
        collapseIcon={isMobile ? <ChevronDownIcon /> : <ChevronRightIcon />}
      />
      <div className="inspector-pane-body">{inspectorContent}</div>
    </>
  );

  const chatPane = (
    <>
      <PaneChrome
        className="chat-pane-chrome"
        onCollapse={chat.collapse}
        collapseLabel="Collapse chat"
        collapseIcon={isMobile ? <ChevronDownIcon /> : <ChevronRightIcon />}
      />
      <div className="chat-pane-body">{chatContent}</div>
    </>
  );

  if (isMobile) {
    return (
      <ShellLayout
        key="mobile-shell"
        layoutId="om-shell-mobile"
        metrics={metrics}
        metricsDefaultSize={40}
        metricsContent={metricsPane}
        metricsRail={metricsRail}
      >
        <MobileStackLayout
          layoutId="om-mobile-stack"
          workspace={workspace}
          workspaceContent={workspacePane}
          workspaceRail={workspaceRail}
          inspector={inspector}
          inspectorContent={inspectorPane}
          inspectorRail={inspectorRail}
          chat={chatOpen ? chat : undefined}
          chatContent={chatOpen ? chatPane : undefined}
          chatRail={chatOpen ? chatRail : undefined}
        />
      </ShellLayout>
    );
  }

  return (
    <ShellLayout
      key="desktop-shell"
      layoutId="om-shell"
      metrics={metrics}
      metricsContent={metricsPane}
      metricsRail={metricsRail}
    >
      <WorkbenchLayout
        layoutId="om-workbench"
        workspace={workspace}
        workspaceContent={workspacePane}
        workspaceRail={workspaceRail}
        detail={
          <DetailSplit
            layoutId="om-detail"
            inspector={inspector}
            inspectorContent={inspectorPane}
            inspectorRail={inspectorRail}
            chat={chatOpen ? chat : undefined}
            chatContent={chatOpen ? chatPane : undefined}
            chatRail={chatOpen ? chatRail : undefined}
          />
        }
      />
    </ShellLayout>
  );
}
