import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactElement
} from 'react';
import { useSession } from '../../app/session-context';
import { AppChrome } from '../../components/app-chrome';
import type { IChatMessage } from '../../components/chat-panel';
import { PathArtifact } from '../../components/path-artifact';
import { SendIcon } from '../../components/ui-icons';
import { buildPlaceIndex, searchPlaces, type IPlaceEntry } from '../../data/place-index';
import { buildQuestionCorridor } from '../../domain/resolve-question-nodes';
import {
  resolveQuestionIntent,
  unknownPlaceMessage,
  type IResolvedIntent
} from '../../domain/resolve-question-intent';
import type { ISchemeScenario } from '../../domain/fund-flow';
import { ExplainService, formatCitationLabels, templateAsk } from '../../services/explain.service';
import { LedgerService } from '../../services/ledger.service';
import { SyntheticScenarioSource } from '../../data/fixtures/synthetic-scenario.source';

const ledgerService = new LedgerService(new SyntheticScenarioSource());
const explainService = new ExplainService(ledgerService);

const STARTER_QUESTIONS = [
  { en: 'Why is the utilisation report late at Piprahi?', hi: 'पिपराही में उपयोग रिपोर्ट देर से क्यों है?' },
  { en: 'Where is the money going for roads at Uttar Raital?', hi: 'उत्तर रैतल में सड़कों के लिए पैसा कहाँ जा रहा है?' },
  { en: 'What is still on the ledger at Kharonda block?', hi: 'खरोंडा ब्लॉक पर कितना अभी भी लेजर में है?' },
  { en: 'Explain the health mission standing at Raital district', hi: 'रैतल जिले में स्वास्थ्य मिशन की स्थिति समझाइए' }
] as const;

export function AskView({ onAbout }: { onAbout: () => void }): ReactElement {
  const session = useSession();
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeScenario, setActiveScenario] = useState<ISchemeScenario>();
  const [activeIntent, setActiveIntent] = useState<IResolvedIntent>();
  const [followUps, setFollowUps] = useState<readonly string[]>([]);
  const [typeaheadOpen, setTypeaheadOpen] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const placeIndex = useMemo(() => buildPlaceIndex(), []);
  const typeaheadResults = useMemo(
    () => (draft.trim() ? searchPlaces(placeIndex, draft, 6) : []),
    [draft, placeIndex]
  );

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [session.chatMessages, loading]);

  useEffect(() => {
    const pending = session.consumePendingQuestion();
    if (pending) {
      void submitQuestion(pending);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const contextLabel = activeIntent
    ? `${activeIntent.schemeName}${activeIntent.placeLabel ? ` · ${activeIntent.placeLabel}` : ''}`
    : undefined;

  const submitQuestion = useCallback(async (question: string): Promise<void> => {
    const trimmed = question.trim();
    if (!trimmed || loading) return;

    setLoading(true);
    setFollowUps([]);
    session.setChatMessages((prev) => [...prev, { role: 'user', text: trimmed }]);

    const intent = resolveQuestionIntent(trimmed);

    if (!intent || intent.kind === 'ambiguous' || intent.kind === 'scheme_only') {
      const suggestions = intent?.suggestions ?? searchPlaces(placeIndex, '', 3);
      const locale = session.chatLocale;
      const suggestionText = suggestions.map((entry) => entry.label).join(', ');
      const text = locale === 'hi'
        ? `यह डेमो केवल काल्पनिक स्थानों का उपयोग करता है। कृपया एक डेमो स्थान आज़माएँ: ${suggestionText}।`
        : `This demo only covers fictional places in our gazetteer. Try a demo place such as ${suggestionText}.`;
      session.setChatMessages((prev) => [...prev, { role: 'assistant', text, source: 'template' }]);
      setLoading(false);
      return;
    }

    session.focusNode(intent.schemeId, intent.focusNodeId, intent.mentionedNodeIds);
    setActiveIntent(intent);
    setActiveScenario(intent.scenario);

    if (intent.kind === 'unknown_place') {
      const prefix = unknownPlaceMessage(intent, session.chatLocale);
      session.setChatMessages((prev) => [...prev, { role: 'assistant', text: prefix, source: 'template' }]);
    }

    try {
      const corridor = buildQuestionCorridor(intent.scenario, trimmed, intent.focusNodeId);
      const slice = explainService.buildAskSlice(
        intent.scenario,
        corridor.focusNodeId,
        trimmed,
        session.chatLocale
      );
      const template = templateAsk(slice, trimmed);
      session.setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: template.answer,
          citedNodeIds: template.citedNodeIds,
          citedNodeLabels: formatCitationLabels(slice, template.citedNodeIds),
          source: 'template',
          schemeId: intent.schemeId,
          scenario: intent.scenario
        }
      ]);
      session.setHighlightPathIds(template.citedNodeIds);
      setFollowUps(template.followUps);

      const result = await explainService.ask(slice, trimmed);
      session.setChatMessages((prev) => {
        const withoutTemplate = prev.filter(
          (message, index) => !(index === prev.length - 1 && message.role === 'assistant' && message.source === 'template')
        );
        return [
          ...withoutTemplate,
          {
            role: 'assistant',
            text: result.answer,
            citedNodeIds: result.citedNodeIds,
            citedNodeLabels: formatCitationLabels(slice, result.citedNodeIds),
            source: result.source,
            schemeId: intent.schemeId,
            scenario: intent.scenario
          }
        ];
      });
      session.setHighlightPathIds(result.citedNodeIds);
      setFollowUps(result.followUps);
    } finally {
      setLoading(false);
    }
  }, [loading, placeIndex, session]);

  const handleSubmit = useCallback((event?: FormEvent): void => {
    event?.preventDefault();
    const q = draft.trim();
    if (!q) return;
    setDraft('');
    setTypeaheadOpen(false);
    void submitQuestion(q);
  }, [draft, submitQuestion]);

  const pickPlace = useCallback((entry: IPlaceEntry): void => {
    const question = session.chatLocale === 'hi'
      ? `${entry.label} के लिए पैसा कहाँ गया?`
      : `Where did the reported money go for ${entry.label}?`;
    setDraft('');
    setTypeaheadOpen(false);
    void submitQuestion(question);
  }, [session.chatLocale, submitQuestion]);

  const openFromArtifact = useCallback((node: { readonly id: string }): void => {
    if (!activeIntent) return;
    session.openExplore({
      schemeId: activeIntent.schemeId,
      nodeId: node.id
    });
  }, [activeIntent, session]);

  const placeholder = session.chatLocale === 'hi'
    ? 'उदा. उत्तर रैतल में सड़कों के लिए पैसा कहाँ जा रहा है?'
    : 'e.g. Where is the money going for roads at Uttar Raital?';

  const hasConversation = session.chatMessages.length > 0;
  const showArtifactRail = Boolean(
    activeScenario && session.highlightPathIds.length > 0 && hasConversation
  );

  return (
    <main className={`ask-shell ${showArtifactRail ? 'ask-shell-with-rail' : ''}`}>
      <AppChrome
        route="ask"
        locale={session.chatLocale}
        onRouteChange={session.setRoute}
        onLocaleChange={session.setChatLocale}
        onAbout={onAbout}
        contextLabel={hasConversation ? contextLabel : undefined}
      />

      <div className={`ask-main ${showArtifactRail ? 'ask-main-with-rail' : ''}`}>
        <div className={`ask-body ${hasConversation ? 'ask-body-chat' : 'ask-body-empty'}`}>
        {!hasConversation ? (
          <section className="ask-hero">
            <p className="ask-badge">Independent hackathon prototype · synthetic data</p>
            <h1>Where did the reported rupee go?</h1>
            <p className="ask-lead">
              Ask in plain language. We answer only from fictional demo ledgers — not live government data.
            </p>

            <div className="ask-composer-wrap">
              <form className="ask-composer" onSubmit={handleSubmit}>
                <input
                  ref={inputRef}
                  value={draft}
                  onChange={(event) => {
                    setDraft(event.target.value);
                    setTypeaheadOpen(true);
                  }}
                  onFocus={() => setTypeaheadOpen(true)}
                  placeholder={placeholder}
                  aria-label="Ask a question"
                  autoComplete="off"
                />
                <button type="submit" className="ask-send" disabled={!draft.trim() || loading} aria-label="Send">
                  <SendIcon />
                </button>
              </form>

              {typeaheadOpen && typeaheadResults.length > 0 && (
                <ul className="ask-typeahead" role="listbox" aria-label="Place matches">
                  {typeaheadResults.map((entry) => (
                    <li key={`${entry.schemeId}-${entry.nodeId}`}>
                      <button type="button" role="option" onClick={() => pickPlace(entry)}>
                        <strong>{entry.label}</strong>
                        <span>{entry.sublabel}</span>
                        <em>{entry.schemeName}</em>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="ask-starters" role="group" aria-label="Suggested questions">
              {STARTER_QUESTIONS.map((starter) => (
                <button
                  key={starter.en}
                  type="button"
                  onClick={() => void submitQuestion(session.chatLocale === 'hi' ? starter.hi : starter.en)}
                >
                  {session.chatLocale === 'hi' ? starter.hi : starter.en}
                </button>
              ))}
            </div>

            <button type="button" className="ask-explore-link" onClick={() => session.openExplore()}>
              Or open the flow map →
            </button>
          </section>
        ) : (
          <>
            <div className="ask-transcript" ref={listRef}>
              {session.chatMessages.map((message, index) => (
                <AskMessage
                  key={index}
                  message={message}
                  onOpenExplore={openFromArtifact}
                />
              ))}
              {loading ? <p className="ask-loading">Reading the ledger…</p> : null}
            </div>

            {followUps.length > 0 && !loading ? (
              <div className="ask-followups" role="group" aria-label="Follow-up questions">
                {followUps.map((followUp) => (
                  <button key={followUp} type="button" onClick={() => void submitQuestion(followUp)}>
                    {followUp}
                  </button>
                ))}
              </div>
            ) : null}

            <form className="ask-composer ask-composer-docked" onSubmit={handleSubmit}>
              <input
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder={placeholder}
                disabled={loading}
                aria-label="Ask a follow-up"
              />
              <button type="submit" className="ask-send" disabled={loading || !draft.trim()} aria-label="Send">
                <SendIcon />
              </button>
            </form>
          </>
        )}
        </div>

        {showArtifactRail && activeScenario ? (
          <aside className="ask-artifact-rail" aria-label="Fund-flow path">
            <PathArtifact
              scenario={activeScenario}
              nodeIds={session.highlightPathIds}
              onOpenExplore={openFromArtifact}
            />
          </aside>
        ) : null}
      </div>
    </main>
  );
}

function AskMessage({
  message,
  onOpenExplore
}: {
  message: IChatMessage;
  onOpenExplore: (node: { readonly id: string }) => void;
}): ReactElement {
  return (
    <article className={`ask-message ask-message-${message.role}`}>
      <p>{message.text}</p>
      {message.source === 'template' ? <small>Offline explanation (API unavailable)</small> : null}
      {message.source === 'backup' ? <small>Answered via backup model</small> : null}
      {message.citedNodeLabels && message.citedNodeLabels.length > 0 ? (
        <small>Cites: {message.citedNodeLabels.join(' → ')}</small>
      ) : null}
      {message.role === 'assistant' && message.scenario && message.citedNodeIds && message.citedNodeIds.length > 0 ? (
        <PathArtifact
          scenario={message.scenario}
          nodeIds={message.citedNodeIds}
          onOpenExplore={onOpenExplore}
        />
      ) : null}
    </article>
  );
}
