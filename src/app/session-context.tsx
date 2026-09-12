import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactElement,
  type ReactNode
} from 'react';
import type { IChatMessage } from '../components/chat-panel';
import type { ExplainLocale } from '../domain/explain-types';
import { navigateTo, parseExploreParams, readRouteFromHash, type AppRoute } from './routing';
import { defaultPersistedSession, persistSession, readStoredSession } from './session-persist';
import {
  applyDataMode,
  persistDataMode,
  resolveInitialDataMode,
  type DataMode
} from '../utils/data-mode';
import { defaultFocusForMode } from '../data/sources/source-for-mode';

export interface IRtiTarget {
  readonly schemeId: string;
  readonly nodeId: string;
}

export interface ISessionState {
  readonly route: AppRoute;
  readonly dataMode: DataMode;
  readonly schemeId: string;
  readonly selectedId: string;
  readonly highlightPathIds: readonly string[];
  readonly chatMessages: readonly IChatMessage[];
  readonly chatLocale: ExplainLocale;
  readonly pendingQuestion: string | null;
  readonly rtiTarget: IRtiTarget | null;
}

export interface ISessionActions {
  readonly setRoute: (route: AppRoute) => void;
  readonly setDataMode: (mode: DataMode) => void;
  readonly setSchemeId: (id: string) => void;
  readonly setSelectedId: (id: string) => void;
  readonly setHighlightPathIds: (ids: readonly string[]) => void;
  readonly setChatMessages: React.Dispatch<React.SetStateAction<readonly IChatMessage[]>>;
  readonly setChatLocale: (locale: ExplainLocale) => void;
  readonly openExplore: (params?: { readonly schemeId?: string; readonly nodeId?: string }) => void;
  readonly openAsk: (question?: string) => void;
  readonly focusNode: (schemeId: string, nodeId: string, highlightIds?: readonly string[]) => void;
  readonly consumePendingQuestion: () => string | null;
  readonly openRti: (schemeId: string, nodeId: string) => void;
  readonly closeRti: () => void;
}

type SessionContextValue = ISessionState & ISessionActions;

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

const STATIC_BACK_ROUTES: readonly AppRoute[] = ['about', 'compare', 'features', 'scale'];

export function SessionProvider({ children }: { children: ReactNode }): ReactElement {
  const initialMode = useMemo(() => resolveInitialDataMode(), []);
  const stored = useMemo(() => readStoredSession(initialMode), [initialMode]);
  const [dataMode, setDataModeState] = useState<DataMode>(initialMode);
  const [route, setRouteState] = useState<AppRoute>(readRouteFromHash);
  const [schemeId, setSchemeId] = useState(stored.schemeId);
  const [selectedId, setSelectedId] = useState(stored.selectedId);
  const [highlightPathIds, setHighlightPathIds] = useState<readonly string[]>(stored.highlightPathIds);
  const [chatMessages, setChatMessages] = useState<readonly IChatMessage[]>(stored.chatMessages);
  const [chatLocale, setChatLocale] = useState<ExplainLocale>(stored.chatLocale);
  const [pendingQuestion, setPendingQuestion] = useState<string | null>(null);
  const [rtiTarget, setRtiTarget] = useState<IRtiTarget | null>(null);
  const exploreBootRef = useRef(false);

  useEffect(() => {
    applyDataMode(dataMode);
  }, [dataMode]);

  useEffect(() => {
    persistSession(dataMode, {
      schemeId,
      selectedId,
      highlightPathIds,
      chatLocale,
      chatMessages
    });
  }, [dataMode, schemeId, selectedId, highlightPathIds, chatLocale, chatMessages]);

  useEffect(() => {
    document.documentElement.lang = chatLocale === 'hi' ? 'hi' : 'en';
  }, [chatLocale]);

  useEffect(() => {
    const onHashChange = (): void => {
      const nextRoute = readRouteFromHash();
      setRouteState(nextRoute);

      if (nextRoute === 'explore') {
        const params = parseExploreParams(window.location.hash);
        if (params.schemeId) setSchemeId(params.schemeId);
        if (params.nodeId) {
          setSelectedId(params.nodeId);
          setHighlightPathIds(params.nodeId ? [params.nodeId] : []);
        }
      }
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    if (exploreBootRef.current) return;
    if (readRouteFromHash() !== 'explore') return;
    exploreBootRef.current = true;
    const params = parseExploreParams(window.location.hash);
    if (params.schemeId) setSchemeId(params.schemeId);
    if (params.nodeId) {
      setSelectedId(params.nodeId);
      setHighlightPathIds([params.nodeId]);
    }
  }, []);

  const setDataMode = useCallback((next: DataMode): void => {
    if (next === dataMode) return;
    persistSession(dataMode, {
      schemeId,
      selectedId,
      highlightPathIds,
      chatLocale,
      chatMessages
    });
    persistDataMode(next);
    applyDataMode(next);
    const nextSession = readStoredSession(next);
    const focus = defaultFocusForMode(next);
    const restored = nextSession.schemeId
      ? nextSession
      : defaultPersistedSession(next);
    setDataModeState(next);
    setSchemeId(restored.schemeId || focus.schemeId);
    setSelectedId(restored.selectedId || focus.nodeId);
    setHighlightPathIds(restored.highlightPathIds);
    setChatMessages(restored.chatMessages);
    setChatLocale(restored.chatLocale);
    setPendingQuestion(null);
    setRtiTarget(null);
    if (route === 'explore') {
      navigateTo('explore', {
        schemeId: restored.schemeId || focus.schemeId,
        nodeId: restored.selectedId || focus.nodeId
      });
    }
  }, [chatLocale, chatMessages, dataMode, highlightPathIds, route, schemeId, selectedId]);

  const setRoute = useCallback((next: AppRoute): void => {
    if (STATIC_BACK_ROUTES.includes(next)) {
      sessionStorage.setItem('ourmoney-back-route', route);
    }
    if (next === 'explore') {
      navigateTo('explore', { schemeId, nodeId: selectedId });
    } else {
      navigateTo(next);
    }
    setRouteState(next);
  }, [route, schemeId, selectedId]);

  const openExplore = useCallback((params?: { readonly schemeId?: string; readonly nodeId?: string }): void => {
    if (params?.schemeId) setSchemeId(params.schemeId);
    if (params?.nodeId) {
      setSelectedId(params.nodeId);
      setHighlightPathIds(params.nodeId ? [params.nodeId] : []);
    }
    navigateTo('explore', params);
    setRouteState('explore');
  }, []);

  const openAsk = useCallback((question?: string): void => {
    if (question?.trim()) setPendingQuestion(question.trim());
    navigateTo('ask');
    setRouteState('ask');
  }, []);

  const focusNode = useCallback((
    nextSchemeId: string,
    nodeId: string,
    highlightIds?: readonly string[]
  ): void => {
    setSchemeId(nextSchemeId);
    setSelectedId(nodeId);
    setHighlightPathIds(highlightIds ?? [nodeId]);
  }, []);

  const consumePendingQuestion = useCallback((): string | null => {
    const q = pendingQuestion;
    setPendingQuestion(null);
    return q;
  }, [pendingQuestion]);

  const openRti = useCallback((nextSchemeId: string, nodeId: string): void => {
    setRtiTarget({ schemeId: nextSchemeId, nodeId });
  }, []);

  const closeRti = useCallback((): void => {
    setRtiTarget(null);
  }, []);

  const value = useMemo<SessionContextValue>(() => ({
    route,
    dataMode,
    schemeId,
    selectedId,
    highlightPathIds,
    chatMessages,
    chatLocale,
    pendingQuestion,
    rtiTarget,
    setRoute,
    setDataMode,
    setSchemeId,
    setSelectedId,
    setHighlightPathIds,
    setChatMessages,
    setChatLocale,
    openExplore,
    openAsk,
    focusNode,
    consumePendingQuestion,
    openRti,
    closeRti
  }), [
    route,
    dataMode,
    schemeId,
    selectedId,
    highlightPathIds,
    chatMessages,
    chatLocale,
    pendingQuestion,
    rtiTarget,
    setRoute,
    setDataMode,
    openExplore,
    openAsk,
    focusNode,
    consumePendingQuestion,
    openRti,
    closeRti
  ]);

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession(): SessionContextValue {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within SessionProvider');
  }
  return context;
}
