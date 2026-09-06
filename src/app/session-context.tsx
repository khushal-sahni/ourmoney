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
import { persistSession, readStoredSession } from './session-persist';

export interface IRtiTarget {
  readonly schemeId: string;
  readonly nodeId: string;
}

export interface ISessionState {
  readonly route: AppRoute;
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
  const stored = useMemo(() => readStoredSession(), []);
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
    persistSession({
      schemeId,
      selectedId,
      highlightPathIds,
      chatLocale,
      chatMessages
    });
  }, [schemeId, selectedId, highlightPathIds, chatLocale, chatMessages]);

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
    schemeId,
    selectedId,
    highlightPathIds,
    chatMessages,
    chatLocale,
    pendingQuestion,
    rtiTarget,
    setRoute,
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
    schemeId,
    selectedId,
    highlightPathIds,
    chatMessages,
    chatLocale,
    pendingQuestion,
    rtiTarget,
    setRoute,
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
