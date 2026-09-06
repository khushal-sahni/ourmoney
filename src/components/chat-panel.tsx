import { useCallback, useEffect, useRef, useState, type FormEvent, type ReactElement, type ReactNode } from 'react';
import type { IAskResponse } from '../domain/explain-types';
import type { ISchemeScenario } from '../domain/fund-flow';
import { t } from '../i18n/strings';
import { ChatIcon, ChevronDownIcon, CloseIcon, SendIcon } from './ui-icons';
import { VoiceInputButton } from './voice-input';

export interface IChatMessage {
  readonly role: 'user' | 'assistant';
  readonly text: string;
  readonly citedNodeIds?: readonly string[];
  readonly citedNodeLabels?: readonly string[];
  readonly source?: IAskResponse['source'];
  readonly schemeId?: string;
  readonly scenario?: ISchemeScenario;
}

export function ChatPanel({
  locale,
  onLocaleChange,
  messages,
  loading,
  suggestedQuestion,
  followUps,
  onAsk,
  onClose,
  onCollapse,
  collapseIcon,
  onRequestRecords,
  activeSchemeId
}: {
  locale: 'en' | 'hi';
  onLocaleChange: (locale: 'en' | 'hi') => void;
  messages: readonly IChatMessage[];
  loading: boolean;
  suggestedQuestion?: string;
  followUps?: readonly string[];
  onAsk: (question: string) => void;
  onClose: () => void;
  onCollapse?: () => void;
  collapseIcon?: ReactNode;
  onRequestRecords?: (schemeId: string, nodeId: string) => void;
  activeSchemeId?: string;
}): ReactElement {
  const [draft, setDraft] = useState('');
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  const submit = useCallback((event?: FormEvent): void => {
    event?.preventDefault();
    const q = draft.trim();
    if (!q || loading) return;
    setDraft('');
    onAsk(q);
  }, [draft, loading, onAsk]);

  return (
    <div className="chat-panel" aria-label="Ask about this ledger">
      <header className="chat-header">
        <div className="chat-header-title">
          <ChatIcon />
          <span>{t('ask', locale)}</span>
        </div>
        <div className="chat-header-actions">
          <div className="locale-toggle" role="group" aria-label={t('language', locale)}>
            <button type="button" className={locale === 'en' ? 'active' : ''} onClick={() => onLocaleChange('en')}>EN</button>
            <button type="button" className={locale === 'hi' ? 'active' : ''} onClick={() => onLocaleChange('hi')}>हि</button>
          </div>
          {onCollapse && collapseIcon ? (
            <button
              type="button"
              className="pane-edge-toggle chat-collapse-btn"
              onClick={onCollapse}
              aria-label="Collapse chat"
              title="Collapse chat"
            >
              {collapseIcon}
            </button>
          ) : null}
          <button type="button" className="icon-btn chat-close" onClick={onClose} aria-label="Close chat" title="Close chat">
            <CloseIcon />
          </button>
        </div>
      </header>

      {suggestedQuestion && messages.length === 0 && (
        <button type="button" className="chat-suggested" onClick={() => onAsk(suggestedQuestion)}>
          {suggestedQuestion}
        </button>
      )}

      <div className="chat-messages" ref={listRef}>
        {messages.length === 0 && !loading && (
          <p className="chat-empty">Ask where money went, why a report is late, or what is still on this ledger.</p>
        )}
        {messages.map((message, index) => (
          <div key={index} className={`chat-bubble chat-${message.role}`}>
            <p>{message.text}</p>
            {message.source === 'backup' && <small>{t('backupAnswer', locale)}</small>}
            {message.source === 'template' && <small>{t('offlineExplanation', locale)}</small>}
            {message.citedNodeIds && message.citedNodeIds.length > 0 && (
              <small>
                {t('citePrefix', locale)} {(message.citedNodeLabels ?? message.citedNodeIds).join(' → ')}
              </small>
            )}
            {message.role === 'assistant'
              && onRequestRecords
              && message.citedNodeIds
              && message.citedNodeIds.length > 0 ? (
              (() => {
                const schemeId = message.schemeId ?? activeSchemeId;
                const nodeId = message.citedNodeIds[0];
                if (!schemeId || !nodeId) return null;
                return (
                  <button
                    type="button"
                    className="chat-rti-btn"
                    onClick={() => onRequestRecords(schemeId, nodeId)}
                  >
                    {t('requestRecords', locale)}
                  </button>
                );
              })()
            ) : null}
          </div>
        ))}
        {loading && <p className="chat-loading">{t('readingLedger', locale)}</p>}
      </div>

      {followUps && followUps.length > 0 && !loading && (
        <div className="chat-followups" role="group" aria-label="Follow-up questions">
          {followUps.map((followUp) => (
            <button key={followUp} type="button" onClick={() => onAsk(followUp)}>
              {followUp}
            </button>
          ))}
        </div>
      )}

      <form className="chat-form" onSubmit={submit}>
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={locale === 'hi' ? 'अपना प्रश्न लिखें…' : 'Ask a question…'}
          disabled={loading}
          aria-label="Question"
        />
        <VoiceInputButton
          locale={locale}
          disabled={loading}
          onTranscript={(text) => {
            setDraft(text);
            onAsk(text);
          }}
        />
        <button type="submit" className="icon-btn chat-send" disabled={loading || !draft.trim()} aria-label={t('send', locale)} title={t('send', locale)}>
          <SendIcon />
        </button>
      </form>
    </div>
  );
}
