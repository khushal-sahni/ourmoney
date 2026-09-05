import { corsHeaders, jsonResponse, runAsk } from '../_shared/openrouter';

interface IEnv {
  OPENROUTER_API_KEY?: string;
}

export const onRequestOptions = async (): Promise<Response> =>
  new Response(null, { status: 204, headers: corsHeaders() });

export const onRequestPost = async (context: { request: Request; env: IEnv }): Promise<Response> => {
  try {
    const body = await context.request.json() as { slice?: unknown; question?: string };
    if (!body.slice || !body.question?.trim()) {
      return jsonResponse({ error: 'slice and question required' }, 400);
    }
    const result = await runAsk(context.env, body.slice, body.question.trim());
    return jsonResponse(result, 200);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'ask failed';
    return jsonResponse({ error: message }, 502);
  }
};
