import type { IChatMessage } from '../components/chat-panel';
import type { ExplainLocale } from '../domain/explain-types';
import type { DataMode } from '../utils/data-mode';
import {
  defaultFocusForMode,
  defaultSchemeIdForMode,
  findScenarioInMode,
  scenariosForMode
} from '../data/sources/source-for-mode';

export const SESSION_STORAGE_KEY = 'ourmoney-session';
export const SESSION_STORAGE_VERSION = 2;
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

interface IModeSessionMap {
  readonly v: number;
  readonly modes: Partial<Record<DataMode, IStoredSessionBlob>>;
}

function sessionKeyForMode(mode: DataMode): string {
  return `${SESSION_STORAGE_KEY}:${mode}`;
}

function knownSchemeIds(mode: DataMode): ReadonlySet<string> {
  return new Set(scenariosForMode(mode).map((scenario) => scenario.id));
}

function rehydrateMessage(mode: DataMode, raw: IStoredMessage): IChatMessage | null {
  if (raw.role !== 'user' && raw.role !== 'assistant') return null;
  if (typeof raw.text !== 'string') return null;

  const schemeId = typeof raw.schemeId === 'string' ? raw.schemeId : undefined;
  const scenario = schemeId ? findScenarioInMode(mode, schemeId) : undefined;

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

export function defaultPersistedSession(mode: DataMode = 'mock'): IPersistedSession {
  const focus = defaultFocusForMode(mode);
  return {
    schemeId: focus.schemeId,
    selectedId: focus.nodeId,
    highlightPathIds: [],
    chatLocale: 'en',
    chatMessages: []
  };
}

function parseBlob(mode: DataMode, parsed: unknown): IPersistedSession {
  const fallback = defaultPersistedSession(mode);
  if (!parsed || typeof parsed !== 'object') return fallback;

  const blob = parsed as Partial<IStoredSessionBlob>;
  if (blob.v !== SESSION_STORAGE_VERSION && blob.v !== 1) return fallback;

  const schemes = knownSchemeIds(mode);
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
      .map((message) => rehydrateMessage(mode, message))
      .filter((message): message is IChatMessage => message !== null)
      .slice(-MAX_STORED_MESSAGES)
    : fallback.chatMessages;

  // Drop stale mock scheme ids when reading a live slot (and vice versa).
  if (!schemes.has(schemeId)) {
    return fallback;
  }

  return {
    schemeId,
    selectedId,
    highlightPathIds,
    chatLocale,
    chatMessages
  };
}

export function readStoredSession(mode: DataMode = 'mock'): IPersistedSession {
  const fallback = defaultPersistedSession(mode);
  try {
    const keyed = localStorage.getItem(sessionKeyForMode(mode));
    if (keyed) {
      return parseBlob(mode, JSON.parse(keyed));
    }

    // Migrate legacy single-key blob into the mock slot only.
    if (mode === 'mock') {
      const legacy = localStorage.getItem(SESSION_STORAGE_KEY);
      if (legacy) {
        const parsed: unknown = JSON.parse(legacy);
        if (parsed && typeof parsed === 'object' && 'modes' in (parsed as object)) {
          const map = parsed as IModeSessionMap;
          if (map.modes?.mock) return parseBlob(mode, map.modes.mock);
        }
        return parseBlob(mode, parsed);
      }
    }

    return fallback;
  } catch {
    return fallback;
  }
}

export function persistSession(mode: DataMode, session: IPersistedSession): void {
  try {
    const blob: IStoredSessionBlob = {
      v: SESSION_STORAGE_VERSION,
      schemeId: session.schemeId,
      selectedId: session.selectedId,
      highlightPathIds: session.highlightPathIds,
      chatLocale: session.chatLocale,
      chatMessages: session.chatMessages.slice(-MAX_STORED_MESSAGES).map(stripMessage)
    };
    localStorage.setItem(sessionKeyForMode(mode), JSON.stringify(blob));
  } catch {
    // Ignore storage access errors (private mode, quota, etc.).
  }
}

export function defaultSchemeId(mode: DataMode): string {
  return defaultSchemeIdForMode(mode);
}
