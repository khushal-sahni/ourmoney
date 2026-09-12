import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  persistSession,
  readStoredSession,
  SESSION_STORAGE_KEY,
  defaultPersistedSession
} from './session-persist';
import { ALL_SCENARIOS } from '../data/fixtures/catalog';
import { LIVE_DEFAULT_SCHEME_ID, MGNREGA_HP_SCENARIO } from '../data/live/mgnrega-hp-2025-26/build-scenario';

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
    localStorage.clear();
  });

  it('round-trips chat without embedding scenario trees', () => {
    const scenario = ALL_SCENARIOS[0];
    persistSession('mock', {
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

    const raw = JSON.parse(localStorage.getItem(`${SESSION_STORAGE_KEY}:mock`) ?? '{}') as {
      chatMessages: readonly { scenario?: unknown; schemeId?: string }[];
    };
    expect(raw.chatMessages[1]?.scenario).toBeUndefined();
    expect(raw.chatMessages[1]?.schemeId).toBe(scenario.id);

    const restored = readStoredSession('mock');
    expect(restored.chatLocale).toBe('hi');
    expect(restored.schemeId).toBe(scenario.id);
    expect(restored.chatMessages).toHaveLength(2);
    expect(restored.chatMessages[1]?.scenario?.id).toBe(scenario.id);
    expect(restored.chatMessages[1]?.citedNodeIds).toEqual([scenario.defaultFocusNodeId]);
  });

  it('keeps mock and live sessions separate', () => {
    persistSession('mock', {
      ...defaultPersistedSession('mock'),
      schemeId: ALL_SCENARIOS[0].id,
      chatMessages: [{ role: 'user', text: 'mock thread' }]
    });
    persistSession('live', {
      ...defaultPersistedSession('live'),
      schemeId: LIVE_DEFAULT_SCHEME_ID,
      selectedId: MGNREGA_HP_SCENARIO.defaultFocusNodeId,
      chatMessages: [{ role: 'user', text: 'live thread' }]
    });

    expect(readStoredSession('mock').chatMessages[0]?.text).toBe('mock thread');
    expect(readStoredSession('live').chatMessages[0]?.text).toBe('live thread');
    expect(readStoredSession('live').schemeId).toBe(LIVE_DEFAULT_SCHEME_ID);
  });

  it('falls back on unknown version', () => {
    localStorage.setItem(
      `${SESSION_STORAGE_KEY}:mock`,
      JSON.stringify({ v: 99, chatMessages: [{ role: 'user', text: 'x' }] })
    );
    expect(readStoredSession('mock')).toEqual(defaultPersistedSession('mock'));
  });

  it('round-trips guidance messages that omit source', () => {
    persistSession('mock', {
      ...defaultPersistedSession('mock'),
      chatMessages: [
        { role: 'user', text: 'Hey?' },
        {
          role: 'assistant',
          text: 'This demo only covers fictional places in our gazetteer. Try a demo place such as Piprahi.'
        }
      ]
    });

    const restored = readStoredSession('mock');
    expect(restored.chatMessages).toHaveLength(2);
    expect(restored.chatMessages[1]?.source).toBeUndefined();
    expect(restored.chatMessages[1]?.text).toContain('gazetteer');
  });
});
