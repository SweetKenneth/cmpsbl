/**
 * Legacy Function Redirect Helper
 * Returns 410 Gone with migration instructions
 */

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export interface RedirectInfo {
  legacyEndpoint: string;
  targetModule: string;
  targetAction: string;
  migrationGuide: string;
}

export function createGoneResponse(info: RedirectInfo): Response {
  return new Response(
    JSON.stringify({
      error: 'Gone',
      status: 410,
      message: `This endpoint has been consolidated into pf-substrate.`,
      migration: {
        from: info.legacyEndpoint,
        to: `pf-substrate?module=${info.targetModule}&action=${info.targetAction}`,
        guide: info.migrationGuide,
        example: {
          old: `supabase.functions.invoke('${info.legacyEndpoint}', { body: data })`,
          new: `supabase.functions.invoke('pf-substrate', { body: { module: '${info.targetModule}', action: '${info.targetAction}', ...data } })`,
        },
      },
      documentation: 'https://promptfluid.ai/docs/substrate',
      timestamp: new Date().toISOString(),
    }),
    { 
      status: 410, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}

export function handleLegacyRequest(req: Request, info: RedirectInfo): Response {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  return createGoneResponse(info);
}
