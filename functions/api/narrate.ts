import { corsHeaders, jsonResponse, runNarration } from '../_shared/openrouter';

interface IEnv {
  OPENROUTER_API_KEY?: string;
}

export const onRequestOptions = async (): Promise<Response> =>
  new Response(null, { status: 204, headers: corsHeaders() });

export const onRequestPost = async (context: { request: Request; env: IEnv }): Promise<Response> => {
  try {
    const body = await context.request.json() as { slice?: unknown };
    if (!body.slice) {
      return jsonResponse({ error: 'slice required' }, 400);
    }
    const result = await runNarration(context.env, body.slice);
    return jsonResponse(result, 200);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'narrate failed';
    return jsonResponse({ error: message }, 502);
  }
};
