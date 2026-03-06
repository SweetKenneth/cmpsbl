/**
 * pf-brain-sync-dispatch — SUSPENDED
 * LNCHBL distribution is suspended pending licensing.
 * Brain sync dispatch is halted. No learnings are packaged for downstream.
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('[brain-sync-dispatch] SUSPENDED — LNCHBL distribution halted pending licensing');

  return new Response(
    JSON.stringify({
      status: 'suspended',
      reason: 'LNCHBL distribution is currently suspended. Brain sync is halted.',
      suspended: true,
      items_synced: 0,
    }),
    {
      status: 503,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Retry-After': '86400',
      },
    }
  );
});
