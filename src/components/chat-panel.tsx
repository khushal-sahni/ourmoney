import { useCallback, useEffect, useRef, useState, type FormEvent, type ReactElement } from 'react';
import type { IAskResponse } from '../domain/explain-types';
import { ChatIcon, CloseIcon, SendIcon } from './ui-icons';

export interface IChatMessage {
  readonly role: 'user' | 'assistant';
  readonly text: string;
  readonly citedNodeIds?: readonly string[];
  readonly source?: IAskResponse['source'];
}

export function ChatPanel({
  locale,
  onLocaleChange,
  messages,
  loading,
  suggestedQuestion,
  onAsk,
  onClose
}: {
  locale: 'en' | 'hi';
  onLocaleChange: (locale: 'en' | 'hi') => void;
  messages: readonly IChatMessage[];
  loading: boolean;
  suggestedQuestion?: string;
  onAsk: (question: string) => void;
  onClose: () => void;
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
          <span>Ask</span>
        </div>
        <div className="chat-header-actions">
          <div className="locale-toggle" role="group" aria-label="Answer language">
            <button type="button" className={locale === 'en' ? 'active' : ''} onClick={() => onLocaleChange('en')}>EN</button>
            <button type="button" className={locale === 'hi' ? 'active' : ''} onClick={() => onLocaleChange('hi')}>हि</button>
          </div>
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
            {message.source === 'backup' && <small>Answered via backup model</small>}
            {message.source === 'template' && <small>Offline explanation (API unavailable)</small>}
            {message.citedNodeIds && message.citedNodeIds.length > 0 && (
              <small>Cites: {message.citedNodeIds.join(' → ')}</small>
            )}
          </div>
        ))}
        {loading && <p className="chat-loading">Reading the ledger…</p>}
      </div>

      <form className="chat-form" onSubmit={submit}>
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={locale === 'hi' ? 'अपना प्रश्न लिखें…' : 'Ask a question…'}
          disabled={loading}
          aria-label="Question"
        />
        <button type="submit" className="icon-btn chat-send" disabled={loading || !draft.trim()} aria-label="Send" title="Send">
          <SendIcon />
        </button>
      </form>
    </div>
  );
}
