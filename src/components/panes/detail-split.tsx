import type { ReactNode } from 'react';
import {
  Group,
  Panel,
  Separator,
  useDefaultLayout
} from 'react-resizable-panels';

import type { PaneCollapseControls } from './use-pane-collapse';

const INSPECTOR_DEFAULT = '58%';
const INSPECTOR_MIN_PX = 160;
const CHAT_DEFAULT = '42%';
const CHAT_MIN_PX = 120;
const CHAT_COLLAPSED_PX = 40;

interface DetailSplitProps {
  readonly layoutId: string;
  readonly inspectorContent: ReactNode;
  readonly chat?: PaneCollapseControls;
  readonly chatContent?: ReactNode;
  readonly chatRail?: ReactNode;
}

/**
 * Vertical split inside the expanded detail column: inspector body over optional chat.
 */
export function DetailSplit({
  layoutId,
  inspectorContent,
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
      <div className="detail-split detail-split-single pane-fill detail-scroll">
        {inspectorContent}
      </div>
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
        id="inspector-body"
        className="detail-inspector-panel"
        defaultSize={INSPECTOR_DEFAULT}
        minSize={INSPECTOR_MIN_PX}
      >
        <div className="pane-fill detail-scroll">{inspectorContent}</div>
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
