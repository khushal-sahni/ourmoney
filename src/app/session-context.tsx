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
import { DEFAULT_SCHEME_ID } from '../data/fixtures/catalog';
import type { ExplainLocale } from '../domain/explain-types';
import { GOLDEN_PATH } from '../constants/golden-path';
import { navigateTo, parseExploreParams, readRouteFromHash, type AppRoute } from './routing';

export interface ISessionState {
  readonly route: AppRoute;
  readonly schemeId: string;
  readonly selectedId: string;
  readonly highlightPathIds: readonly string[];
  readonly chatMessages: readonly IChatMessage[];
  readonly chatLocale: ExplainLocale;
  readonly pendingQuestion: string | null;
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
}

type SessionContextValue = ISessionState & ISessionActions;

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }): ReactElement {
  const [route, setRouteState] = useState<AppRoute>(readRouteFromHash);
  const [schemeId, setSchemeId] = useState(DEFAULT_SCHEME_ID);
  const [selectedId, setSelectedId] = useState<string>(GOLDEN_PATH.nodeId);
  const [highlightPathIds, setHighlightPathIds] = useState<readonly string[]>([]);
  const [chatMessages, setChatMessages] = useState<readonly IChatMessage[]>([]);
  const [chatLocale, setChatLocale] = useState<ExplainLocale>('en');
  const [pendingQuestion, setPendingQuestion] = useState<string | null>(null);
  const exploreBootRef = useRef(false);

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
    if (next === 'about') {
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

  const value = useMemo<SessionContextValue>(() => ({
    route,
    schemeId,
    selectedId,
    highlightPathIds,
    chatMessages,
    chatLocale,
    pendingQuestion,
    setRoute,
    setSchemeId,
    setSelectedId,
    setHighlightPathIds,
    setChatMessages,
    setChatLocale,
    openExplore,
    openAsk,
    focusNode,
    consumePendingQuestion
  }), [
    route,
    schemeId,
    selectedId,
    highlightPathIds,
    chatMessages,
    chatLocale,
    pendingQuestion,
    setRoute,
    openExplore,
    openAsk,
    focusNode,
    consumePendingQuestion
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
