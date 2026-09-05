import type { ReactNode } from 'react';
import {
  Group,
  Panel,
  Separator,
  useDefaultLayout
} from 'react-resizable-panels';

import type { PaneCollapseControls } from './use-pane-collapse';

const WORKSPACE_MIN_PERCENT = '30%';
const WORKSPACE_COLLAPSED_PX = 40;
const INSPECTOR_DEFAULT_PX = 40;
const INSPECTOR_MIN_PX = 120;
const INSPECTOR_COLLAPSED_PX = 40;
const CHAT_DEFAULT = '40%';
const CHAT_MIN_PX = 120;
const CHAT_COLLAPSED_PX = 40;

interface MobileStackLayoutProps {
  readonly layoutId: string;
  readonly workspace: PaneCollapseControls;
  readonly workspaceContent: ReactNode;
  readonly workspaceRail: ReactNode;
  readonly inspector: PaneCollapseControls;
  readonly inspectorContent: ReactNode;
  readonly inspectorRail: ReactNode;
  readonly chat?: PaneCollapseControls;
  readonly chatContent?: ReactNode;
  readonly chatRail?: ReactNode;
}

/**
 * Vertical mobile stack: workspace, inspector, and optional chat.
 */
export function MobileStackLayout({
  layoutId,
  workspace,
  workspaceContent,
  workspaceRail,
  inspector,
  inspectorContent,
  inspectorRail,
  chat,
  chatContent,
  chatRail
}: MobileStackLayoutProps): ReactNode {
  const { defaultLayout, onLayoutChanged } = useDefaultLayout({
    id: layoutId,
    storage: localStorage
  });

  const chatOpen = Boolean(chat && chatContent && chatRail);

  return (
    <Group
      id={layoutId}
      className="mobile-stack"
      orientation="vertical"
      defaultLayout={defaultLayout}
      onLayoutChanged={onLayoutChanged}
    >
      <Panel
        id="workspace"
        className="mobile-workspace-panel"
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
      <Separator className="pane-separator pane-separator-horizontal" />
      <Panel
        id="inspector"
        className="mobile-inspector-panel"
        panelRef={inspector.panelRef}
        defaultSize={INSPECTOR_DEFAULT_PX}
        minSize={INSPECTOR_MIN_PX}
        collapsedSize={INSPECTOR_COLLAPSED_PX}
        collapsible
        onResize={inspector.onResize}
      >
        <div className="pane-fill detail-scroll">
          {inspector.collapsed ? inspectorRail : inspectorContent}
        </div>
      </Panel>
      {chatOpen && (
        <>
          <Separator className="pane-separator pane-separator-horizontal" />
          <Panel
            id="chat"
            className="mobile-chat-panel"
            panelRef={chat!.panelRef}
            defaultSize={CHAT_DEFAULT}
            minSize={CHAT_MIN_PX}
            collapsedSize={CHAT_COLLAPSED_PX}
            collapsible
            onResize={chat!.onResize}
          >
            <div className="pane-fill">
              {chat!.collapsed ? chatRail : chatContent}
            </div>
          </Panel>
        </>
      )}
    </Group>
  );
}
