import type { IChatMessage } from '../components/chat-panel';
import { ALL_SCENARIOS, DEFAULT_SCHEME_ID } from '../data/fixtures/catalog';
import type { ExplainLocale } from '../domain/explain-types';
import { GOLDEN_PATH } from '../constants/golden-path';

export const SESSION_STORAGE_KEY = 'ourmoney-session';
export const SESSION_STORAGE_VERSION = 1;
const MAX_STORED_MESSAGES = 40;

export interface IPersistedSession {
  readonly schemeId: string;
  readonly selectedId: string;
  readonly highlightPathIds: readonly string[];
  readonly chatLocale: ExplainLocale;
  readonly chatMessages: readonly IChatMessage[];
}

interface IStoredMessage {
  readonly role: 'user' | 'assistant';
  readonly text: string;
  readonly citedNodeIds?: readonly string[];
  readonly citedNodeLabels?: readonly string[];
  readonly source?: IChatMessage['source'];
  readonly schemeId?: string;
}

interface IStoredSessionBlob {
  readonly v: number;
  readonly schemeId: string;
  readonly selectedId: string;
  readonly highlightPathIds: readonly string[];
  readonly chatLocale: ExplainLocale;
  readonly chatMessages: readonly IStoredMessage[];
}

function knownSchemeIds(): ReadonlySet<string> {
  return new Set(ALL_SCENARIOS.map((scenario) => scenario.id));
}

function rehydrateMessage(raw: IStoredMessage): IChatMessage | null {
  if (raw.role !== 'user' && raw.role !== 'assistant') return null;
  if (typeof raw.text !== 'string') return null;

  const schemeId = typeof raw.schemeId === 'string' ? raw.schemeId : undefined;
  const scenario = schemeId
    ? ALL_SCENARIOS.find((entry) => entry.id === schemeId)
    : undefined;

  return {
    role: raw.role,
    text: raw.text,
    citedNodeIds: Array.isArray(raw.citedNodeIds)
      ? raw.citedNodeIds.filter((id): id is string => typeof id === 'string')
      : undefined,
    citedNodeLabels: Array.isArray(raw.citedNodeLabels)
      ? raw.citedNodeLabels.filter((label): label is string => typeof label === 'string')
      : undefined,
    source: raw.source === 'model' || raw.source === 'template' || raw.source === 'backup'
      ? raw.source
      : undefined,
    schemeId,
    scenario
  };
}

function stripMessage(message: IChatMessage): IStoredMessage {
  return {
    role: message.role,
    text: message.text,
    citedNodeIds: message.citedNodeIds,
    citedNodeLabels: message.citedNodeLabels,
    source: message.source,
    schemeId: message.schemeId
  };
}

export function defaultPersistedSession(): IPersistedSession {
  return {
    schemeId: DEFAULT_SCHEME_ID,
    selectedId: GOLDEN_PATH.nodeId,
    highlightPathIds: [],
    chatLocale: 'en',
    chatMessages: []
  };
}

export function readStoredSession(): IPersistedSession {
  const fallback = defaultPersistedSession();
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return fallback;

    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return fallback;

    const blob = parsed as Partial<IStoredSessionBlob>;
    if (blob.v !== SESSION_STORAGE_VERSION) return fallback;

    const schemes = knownSchemeIds();
    const schemeId = typeof blob.schemeId === 'string' && schemes.has(blob.schemeId)
      ? blob.schemeId
      : fallback.schemeId;
    const selectedId = typeof blob.selectedId === 'string' && blob.selectedId.length > 0
      ? blob.selectedId
      : fallback.selectedId;
    const highlightPathIds = Array.isArray(blob.highlightPathIds)
      ? blob.highlightPathIds.filter((id): id is string => typeof id === 'string')
      : fallback.highlightPathIds;
    const chatLocale = blob.chatLocale === 'hi' || blob.chatLocale === 'en'
      ? blob.chatLocale
      : fallback.chatLocale;
    const chatMessages = Array.isArray(blob.chatMessages)
      ? blob.chatMessages
        .map(rehydrateMessage)
        .filter((message): message is IChatMessage => message !== null)
        .slice(-MAX_STORED_MESSAGES)
      : fallback.chatMessages;

    return {
      schemeId,
      selectedId,
      highlightPathIds,
      chatLocale,
      chatMessages
    };
  } catch {
    return fallback;
  }
}

export function persistSession(session: IPersistedSession): void {
  try {
    const blob: IStoredSessionBlob = {
      v: SESSION_STORAGE_VERSION,
      schemeId: session.schemeId,
      selectedId: session.selectedId,
      highlightPathIds: session.highlightPathIds,
      chatLocale: session.chatLocale,
      chatMessages: session.chatMessages.slice(-MAX_STORED_MESSAGES).map(stripMessage)
    };
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(blob));
  } catch {
    // Ignore storage access errors (private mode, quota, etc.).
  }
}
