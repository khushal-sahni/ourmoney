import type { ReactNode } from 'react';
import {
  Group,
  Panel,
  Separator,
  useDefaultLayout
} from 'react-resizable-panels';

import type { PaneCollapseControls } from './use-pane-collapse';

const INSPECTOR_DEFAULT = '58%';
const INSPECTOR_MIN_PX = 200;
const INSPECTOR_COLLAPSED_PX = 40;
const CHAT_DEFAULT = '42%';
const CHAT_MIN_PX = 160;
const CHAT_COLLAPSED_PX = 40;

interface DetailSplitProps {
  readonly layoutId: string;
  readonly inspector: PaneCollapseControls;
  readonly inspectorContent: ReactNode;
  readonly inspectorRail: ReactNode;
  readonly chat?: PaneCollapseControls;
  readonly chatContent?: ReactNode;
  readonly chatRail?: ReactNode;
}

/**
 * Vertical detail split: collapsible inspector over optional collapsible chat.
 */
export function DetailSplit({
  layoutId,
  inspector,
  inspectorContent,
  inspectorRail,
  chat,
  chatContent,
  chatRail
}: DetailSplitProps): ReactNode {
  const { defaultLayout, onLayoutChanged } = useDefaultLayout({
    id: layoutId,
    storage: localStorage
  });

  const chatOpen = Boolean(chat && chatContent && chatRail);

  if (!chatOpen) {
    return (
      <Group
        id={layoutId}
        className="detail-split"
        orientation="vertical"
        defaultLayout={defaultLayout}
        onLayoutChanged={onLayoutChanged}
      >
        <Panel
          id="inspector"
          className="detail-inspector-panel"
          panelRef={inspector.panelRef}
          defaultSize="100%"
          minSize={INSPECTOR_MIN_PX}
          collapsedSize={INSPECTOR_COLLAPSED_PX}
          collapsible
          onResize={inspector.onResize}
        >
          <div className="pane-fill detail-scroll">
            {inspector.collapsed ? inspectorRail : inspectorContent}
          </div>
        </Panel>
      </Group>
    );
  }

  return (
    <Group
      id={layoutId}
      className="detail-split"
      orientation="vertical"
      defaultLayout={defaultLayout}
      onLayoutChanged={onLayoutChanged}
    >
      <Panel
        id="inspector"
        className="detail-inspector-panel"
        panelRef={inspector.panelRef}
        defaultSize={INSPECTOR_DEFAULT}
        minSize={INSPECTOR_MIN_PX}
        collapsedSize={INSPECTOR_COLLAPSED_PX}
        collapsible
        onResize={inspector.onResize}
      >
        <div className="pane-fill detail-scroll">
          {inspector.collapsed ? inspectorRail : inspectorContent}
        </div>
      </Panel>
      <Separator className="pane-separator pane-separator-horizontal" />
      <Panel
        id="chat"
        className="detail-chat-panel"
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
    </Group>
  );
}
