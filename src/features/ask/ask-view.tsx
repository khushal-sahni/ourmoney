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
import { SiteFooter } from '../../components/site-footer';
import { SendIcon } from '../../components/ui-icons';
import { VoiceInputButton } from '../../components/voice-input';
import { SCHEME_CATALOG, ALL_SCENARIOS } from '../../data/fixtures/catalog';
import { buildPlaceIndex, searchPlaces, type IPlaceEntry } from '../../data/place-index';
import { rankNamedPlaces } from '../../domain/rank-named-places';
import {
  resolveQuestionIntent,
  unknownPlaceMessage,
  type IResolvedIntent
} from '../../domain/resolve-question-intent';
import type { ISchemeScenario } from '../../domain/fund-flow';
import { ExplainService, formatCitationLabels, templateAsk } from '../../services/explain.service';
import { LedgerService } from '../../services/ledger.service';
import { SyntheticScenarioSource } from '../../data/fixtures/synthetic-scenario.source';
import { useT } from '../../i18n/strings';

const ledgerService = new LedgerService(new SyntheticScenarioSource());
const explainService = new ExplainService(ledgerService);

const STARTER_QUESTIONS = [
  { en: 'Why is the utilisation report late at Piprahi?', hi: 'पिपराही में उपयोग रिपोर्ट देर से क्यों है?' },
  { en: 'Where is the money going for roads at Uttar Raital?', hi: 'उत्तर रैतल में सड़कों के लिए पैसा कहाँ जा रहा है?' },
  { en: 'What is still on the ledger at Kharonda block?', hi: 'खरोंडा ब्लॉक पर कितना अभी भी लेजर में है?' },
  { en: 'Explain the health mission standing at Raital district', hi: 'रैतल जिले में स्वास्थ्य मिशन की स्थिति समझाइए' }
] as const;

function inheritFollowUpIntent(
  activeScenario: ISchemeScenario | undefined,
  activeIntent: IResolvedIntent | undefined,
  chatMessages: readonly IChatMessage[],
  selectedId: string
): IResolvedIntent | undefined {
  const scenario = activeScenario
    ?? [...chatMessages].reverse().find((message) => message.scenario)?.scenario;
  if (!scenario) return undefined;

  const focusNodeId = activeIntent?.focusNodeId
    ?? [...chatMessages].reverse().find((message) => message.citedNodeIds?.[0])?.citedNodeIds?.[0]
    ?? selectedId;
  const node = scenario.nodes.find((candidate) => candidate.id === focusNodeId)
    ?? scenario.nodes.find((candidate) => candidate.id === scenario.defaultFocusNodeId);
  if (!node) return undefined;

  return {
    kind: 'resolved',
    schemeId: scenario.id,
    schemeName: scenario.schemeName,
    focusNodeId: node.id,
    placeLabel: activeIntent?.placeLabel ?? node.shortName,
    mentionedNodeIds: activeIntent?.mentionedNodeIds?.length
      ? activeIntent.mentionedNodeIds
      : [node.id],
    scenario
  };
}

function shouldPromoteRti(scenario: ISchemeScenario, nodeIds: readonly string[]): boolean {
  return nodeIds.some((nodeId) => {
    const recon = scenario.reconciliations.find((item) => item.nodeId === nodeId);
    return recon?.status === 'watch' || recon?.status === 'needs-explanation';
  });
}

export function AskView(): ReactElement {
  const session = useSession();
  const t = useT();
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [dictating, setDictating] = useState(false);
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
    if (activeScenario) return;
    const fromMessage = [...session.chatMessages]
      .reverse()
      .find((message) => message.scenario)?.scenario;
    if (fromMessage) {
      setActiveScenario(fromMessage);
      return;
    }
    const fromScheme = ALL_SCENARIOS.find((entry) => entry.id === session.schemeId);
    if (fromScheme && session.chatMessages.length > 0) {
      setActiveScenario(fromScheme);
    }
  }, [activeScenario, session.chatMessages, session.schemeId]);

  useEffect(() => {
    const pending = session.consumePendingQuestion();
    if (pending) {
      void submitQuestion(pending);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const contextLabel = useMemo((): string | undefined => {
    if (activeIntent) {
      return `${activeIntent.schemeName}${activeIntent.placeLabel ? ` · ${activeIntent.placeLabel}` : ''}`;
    }
    if (session.chatMessages.length === 0) return undefined;
    const catalogName = SCHEME_CATALOG.find((entry) => entry.id === session.schemeId)?.schemeName;
    return catalogName ?? activeScenario?.schemeName;
  }, [activeIntent, activeScenario, session.chatMessages.length, session.schemeId]);

  const submitQuestion = useCallback(async (question: string): Promise<void> => {
    const trimmed = question.trim();
    if (!trimmed || loading) return;

    setLoading(true);
    setFollowUps([]);
    session.setChatMessages((prev) => [...prev, { role: 'user', text: trimmed }]);

    let intent = resolveQuestionIntent(trimmed);

    if (!intent || intent.kind === 'ambiguous') {
      const inherited = inheritFollowUpIntent(
        activeScenario,
        activeIntent,
        session.chatMessages,
        session.selectedId
      );
      if (inherited) {
        intent = inherited;
      } else {
        const suggestions = intent?.suggestions ?? searchPlaces(placeIndex, '', 3);
        const suggestionText = suggestions.map((entry) => entry.label).join(', ');
        const text = session.chatLocale === 'hi'
          ? `यह डेमो केवल काल्पनिक स्थानों का उपयोग करता है। कृपया एक डेमो स्थान आज़माएँ: ${suggestionText}।`
          : `This demo only covers fictional places in our gazetteer. Try a demo place such as ${suggestionText}.`;
        session.setChatMessages((prev) => [...prev, { role: 'assistant', text }]);
        setLoading(false);
        return;
      }
    }

    session.focusNode(intent.schemeId, intent.focusNodeId, intent.mentionedNodeIds);
    setActiveIntent(intent);
    setActiveScenario(intent.scenario);

    if (intent.kind === 'unknown_place') {
      const prefix = unknownPlaceMessage(intent, session.chatLocale);
      session.setChatMessages((prev) => [...prev, { role: 'assistant', text: prefix }]);
    }

    try {
      const relatedNodes = intent.kind === 'scheme_only'
        ? rankNamedPlaces(intent.scenario, 'district', 3)
        : undefined;
      const slice = explainService.buildAskSlice(
        intent.scenario,
        intent.focusNodeId,
        trimmed,
        session.chatLocale,
        relatedNodes ? { relatedNodes } : undefined
      );
      const template = templateAsk(slice, trimmed);
      session.setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: template.answer,
          citedNodeIds: template.citedNodeIds,
          citedNodeLabels: formatCitationLabels(slice, template.citedNodeIds),
          schemeId: intent.schemeId,
          scenario: intent.scenario
        }
      ]);
      session.setHighlightPathIds(template.citedNodeIds);
      setFollowUps(template.followUps);

      const result = await explainService.ask(slice, trimmed);
      session.setChatMessages((prev) => {
        const withoutOptimistic = prev.filter(
          (message, index) => !(
            index === prev.length - 1
            && message.role === 'assistant'
            && message.schemeId === intent.schemeId
            && (message.source === undefined || message.source === 'template')
          )
        );
        return [
          ...withoutOptimistic,
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
  }, [activeIntent, activeScenario, loading, placeIndex, session]);

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

  const openFromArtifact = useCallback((node: { readonly id: string }, schemeId?: string): void => {
    const resolvedSchemeId = schemeId ?? activeIntent?.schemeId ?? session.schemeId;
    session.openExplore({
      schemeId: resolvedSchemeId,
      nodeId: node.id
    });
  }, [activeIntent, session]);

  const placeholder = session.chatLocale === 'hi'
    ? t('askPlaceholder')
    : t('askPlaceholder');

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
        contextLabel={hasConversation ? contextLabel : undefined}
      />

      <div className={`ask-main ${showArtifactRail ? 'ask-main-with-rail' : ''}`}>
        <div className={`ask-body ${hasConversation ? 'ask-body-chat' : 'ask-body-empty'}`}>
        {!hasConversation ? (
          <section className="ask-hero">
            <p className="ask-badge">{t('heroBadge')}</p>
            <h1>{t('heroTitle')}</h1>
            <p className="ask-lead">{t('heroLead')}</p>

            <div className="ask-composer-wrap">
              <form className={`ask-composer ${dictating ? 'ask-composer-dictating' : ''}`} onSubmit={handleSubmit}>
                {!dictating ? (
                  <input
                    ref={inputRef}
                    value={draft}
                    onChange={(event) => {
                      setDraft(event.target.value);
                      setTypeaheadOpen(true);
                    }}
                    onFocus={() => setTypeaheadOpen(true)}
                    placeholder={placeholder}
                    aria-label={t('ask')}
                    autoComplete="off"
                  />
                ) : null}
                <VoiceInputButton
                  locale={session.chatLocale}
                  disabled={loading}
                  onActiveChange={(active) => {
                    setDictating(active);
                    if (active) setTypeaheadOpen(false);
                    else window.setTimeout(() => inputRef.current?.focus(), 0);
                  }}
                  onCommit={(text) => {
                    setDraft((current) => (current.trim() ? `${current.trim()} ${text}` : text));
                    setTypeaheadOpen(false);
                  }}
                />
                {!dictating ? (
                  <button type="submit" className="ask-send" disabled={!draft.trim() || loading} aria-label={t('send')}>
                    <SendIcon />
                  </button>
                ) : null}
              </form>

              {typeaheadOpen && typeaheadResults.length > 0 && (
                <ul className="ask-typeahead" role="listbox" aria-label={t('placeMatches')}>
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

            <div className="ask-starters" role="group" aria-label={t('suggestedQuestions')}>
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
          </section>
        ) : (
          <>
            <div className="ask-transcript" ref={listRef}>
              {session.chatMessages.map((message, index) => (
                <AskMessage
                  key={index}
                  message={message}
                  onOpenExplore={openFromArtifact}
                  onRequestRecords={(schemeId, nodeId) => session.openRti(schemeId, nodeId)}
                />
              ))}
              {loading ? <p className="ask-loading">{t('readingLedger')}</p> : null}
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

            <form className={`ask-composer ask-composer-docked ${dictating ? 'ask-composer-dictating' : ''}`} onSubmit={handleSubmit}>
              {!dictating ? (
                <input
                  ref={inputRef}
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder={t('followUpPlaceholder')}
                  disabled={loading}
                  aria-label={t('ask')}
                />
              ) : null}
              <VoiceInputButton
                locale={session.chatLocale}
                disabled={loading}
                onActiveChange={(active) => {
                  setDictating(active);
                  if (!active) window.setTimeout(() => inputRef.current?.focus(), 0);
                }}
                onCommit={(text) => {
                  setDraft((current) => (current.trim() ? `${current.trim()} ${text}` : text));
                }}
              />
              {!dictating ? (
                <button type="submit" className="ask-send" disabled={loading || !draft.trim()} aria-label={t('send')}>
                  <SendIcon />
                </button>
              ) : null}
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

      {!hasConversation ? (
        <SiteFooter
          onNavigate={session.setRoute}
          labels={{
            compare: t('compare'),
            features: t('features'),
            scale: t('scale'),
            about: t('about'),
            disclosure: t('footerDisclosure')
          }}
        />
      ) : null}
    </main>
  );
}

function AskMessage({
  message,
  onOpenExplore,
  onRequestRecords
}: {
  message: IChatMessage;
  onOpenExplore: (node: { readonly id: string }, schemeId?: string) => void;
  onRequestRecords: (schemeId: string, nodeId: string) => void;
}): ReactElement {
  const t = useT();
  const promote = Boolean(
    message.scenario
    && message.citedNodeIds
    && shouldPromoteRti(message.scenario, message.citedNodeIds)
  );

  return (
    <article className={`ask-message ask-message-${message.role}`}>
      <p>{message.text}</p>
      {message.source === 'template' ? <small>{t('offlineExplanation')}</small> : null}
      {message.source === 'backup' ? <small>{t('backupAnswer')}</small> : null}
      {message.citedNodeLabels && message.citedNodeLabels.length > 0 ? (
        <small>{t('citePrefix')} {message.citedNodeLabels.join(' → ')}</small>
      ) : null}
      {message.role === 'assistant' && message.scenario && message.citedNodeIds && message.citedNodeIds.length > 0 ? (
        <>
          <PathArtifact
            scenario={message.scenario}
            nodeIds={message.citedNodeIds}
            onOpenExplore={(node) => onOpenExplore(node, message.schemeId)}
          />
          {(() => {
            const schemeId = message.schemeId;
            const nodeId = message.citedNodeIds[0];
            if (!schemeId || !nodeId) return null;
            return (
              <button
                type="button"
                className={`ask-rti-btn ${promote ? 'ask-rti-btn-promote' : ''}`}
                onClick={() => onRequestRecords(schemeId, nodeId)}
                title={t('requestRecordsHint')}
              >
                {t('requestRecords')}
              </button>
            );
          })()}
        </>
      ) : null}
    </article>
  );
}
