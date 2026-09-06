interface IOpenRouterMessage {
  readonly role: 'system' | 'user' | 'assistant';
  readonly content: string;
}

interface IEnv {
  readonly OPENROUTER_API_KEY?: string;
}

const PRIMARY_MODEL = 'openai/gpt-4o-mini';
const BACKUP_MODEL = 'openrouter/free';
const REQUEST_TIMEOUT_MS = 8000;

const SYSTEM_RULES = `You explain Indian public-scheme fund flows to citizens using ONLY the JSON ledger slice provided.
Rules:
- All data is synthetic demonstration data; say so briefly when relevant.
- Never allege corruption, theft, fraud, or misconduct.
- Use precise terms: unreconciled, late report, needs explanation, reported balance.
- When mentionedNodeIds are present, cite those exact node ids in order. Do not substitute a parent for a more specific child named in the question.
- Otherwise cite node ids from the slice path when explaining.
- When ranking or comparing places, use ONLY nodes present in the slice (path, children, related). Never invent unnamed villages or offices.
- Keep answers under 120 words unless asked for detail.
- Respond in the locale requested (en or hi).`;

async function callOpenRouter(
  apiKey: string,
  model: string,
  messages: readonly IOpenRouterMessage[]
): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://ourmoney.fyi',
        'X-Title': 'ourmoney'
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.2,
        max_tokens: 320
      }),
      signal: controller.signal
    });
    if (!response.ok) {
      throw new Error(`OpenRouter ${response.status}`);
    }
    const payload = await response.json() as {
      choices?: readonly { message?: { content?: string } }[];
    };
    const content = payload.choices?.[0]?.message?.content?.trim();
    if (!content) throw new Error('Empty model response');
    return content;
  } finally {
    clearTimeout(timeout);
  }
}

async function withModelLadder(
  apiKey: string,
  messages: readonly IOpenRouterMessage[]
): Promise<{ text: string; source: 'model' | 'backup' }> {
  try {
    return { text: await callOpenRouter(apiKey, PRIMARY_MODEL, messages), source: 'model' };
  } catch {
    return { text: await callOpenRouter(apiKey, BACKUP_MODEL, messages), source: 'backup' };
  }
}

export async function runNarration(
  env: IEnv,
  slice: unknown
): Promise<{ narration: string; source: 'model' | 'backup' }> {
  const apiKey = env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('OPENROUTER_API_KEY not configured');

  const locale = (slice as { locale?: string }).locale === 'hi' ? 'hi' : 'en';
  const messages: IOpenRouterMessage[] = [
    { role: 'system', content: SYSTEM_RULES },
    {
      role: 'user',
      content: `Write one plain-language paragraph (${locale}) narrating this ledger slice for a citizen. JSON:\n${JSON.stringify(slice)}`
    }
  ];
  const { text, source } = await withModelLadder(apiKey, messages);
  return { narration: text, source };
}

export async function runAsk(
  env: IEnv,
  slice: unknown,
  question: string
): Promise<{ answer: string; citedNodeIds: string[]; followUps: string[]; source: 'model' | 'backup' }> {
  const apiKey = env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('OPENROUTER_API_KEY not configured');

  const locale = (slice as { locale?: string }).locale === 'hi' ? 'hi' : 'en';
  const pathIds = ((slice as { path?: { id: string }[] }).path ?? []).map((step) => step.id);
  const mentionedIds = (slice as { mentionedNodeIds?: string[] }).mentionedNodeIds ?? [];
  const defaultCitedIds = mentionedIds.length > 0 ? mentionedIds : pathIds;
  const messages: IOpenRouterMessage[] = [
    {
      role: 'system',
      content: `${SYSTEM_RULES}\nReturn JSON only: {"answer":"...","citedNodeIds":["id"],"followUps":["..."]}`
    },
    {
      role: 'user',
      content: `Locale: ${locale}\nQuestion: ${question}\nLedger slice:\n${JSON.stringify(slice)}`
    }
  ];

  const { text, source } = await withModelLadder(apiKey, messages);
  try {
    const parsed = JSON.parse(text) as {
      answer?: string;
      citedNodeIds?: string[];
      followUps?: string[];
    };
    return {
      answer: parsed.answer ?? text,
      citedNodeIds: parsed.citedNodeIds?.length ? parsed.citedNodeIds : defaultCitedIds,
      followUps: parsed.followUps ?? [],
      source
    };
  } catch {
    return { answer: text, citedNodeIds: defaultCitedIds, followUps: [], source };
  }
}

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store'
    }
  });
}

export function corsHeaders(): HeadersInit {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };
}
