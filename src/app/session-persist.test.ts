import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  persistSession,
  readStoredSession,
  SESSION_STORAGE_KEY,
  defaultPersistedSession
} from './session-persist';
import { ALL_SCENARIOS } from '../data/fixtures/catalog';

function installMemoryStorage(): void {
  const store = new Map<string, string>();
  const memory: Storage = {
    get length() {
      return store.size;
    },
    clear: () => {
      store.clear();
    },
    getItem: (key: string) => store.get(key) ?? null,
    key: (index: number) => [...store.keys()][index] ?? null,
    removeItem: (key: string) => {
      store.delete(key);
    },
    setItem: (key: string, value: string) => {
      store.set(key, value);
    }
  };
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: memory
  });
}

describe('session-persist', () => {
  beforeEach(() => {
    installMemoryStorage();
  });

  afterEach(() => {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  });

  it('round-trips chat without embedding scenario trees', () => {
    const scenario = ALL_SCENARIOS[0];
    persistSession({
      schemeId: scenario.id,
      selectedId: scenario.defaultFocusNodeId,
      highlightPathIds: [scenario.defaultFocusNodeId],
      chatLocale: 'hi',
      chatMessages: [
        { role: 'user', text: 'Where did the money go?' },
        {
          role: 'assistant',
          text: 'Here is the path.',
          citedNodeIds: [scenario.defaultFocusNodeId],
          citedNodeLabels: ['Focus'],
          source: 'template',
          schemeId: scenario.id,
          scenario
        }
      ]
    });

    const raw = JSON.parse(localStorage.getItem(SESSION_STORAGE_KEY) ?? '{}') as {
      chatMessages: readonly { scenario?: unknown; schemeId?: string }[];
    };
    expect(raw.chatMessages[1]?.scenario).toBeUndefined();
    expect(raw.chatMessages[1]?.schemeId).toBe(scenario.id);

    const restored = readStoredSession();
    expect(restored.chatLocale).toBe('hi');
    expect(restored.schemeId).toBe(scenario.id);
    expect(restored.chatMessages).toHaveLength(2);
    expect(restored.chatMessages[1]?.scenario?.id).toBe(scenario.id);
    expect(restored.chatMessages[1]?.citedNodeIds).toEqual([scenario.defaultFocusNodeId]);
  });

  it('falls back on unknown version', () => {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({ v: 99, chatMessages: [{ role: 'user', text: 'x' }] }));
    expect(readStoredSession()).toEqual(defaultPersistedSession());
  });

  it('round-trips guidance messages that omit source', () => {
    persistSession({
      ...defaultPersistedSession(),
      chatMessages: [
        { role: 'user', text: 'Hey?' },
        {
          role: 'assistant',
          text: 'This demo only covers fictional places in our gazetteer. Try a demo place such as Piprahi.'
        }
      ]
    });

    const restored = readStoredSession();
    expect(restored.chatMessages).toHaveLength(2);
    expect(restored.chatMessages[1]?.source).toBeUndefined();
    expect(restored.chatMessages[1]?.text).toContain('gazetteer');
  });
});
