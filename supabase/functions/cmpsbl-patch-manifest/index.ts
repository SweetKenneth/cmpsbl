/**
 * cmpsbl-patch-manifest — SUSPENDED
 * LNCHBL distribution is suspended pending licensing.
 * All manifest requests return 503.
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-distribution-id, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  return new Response(
    JSON.stringify({
      error: 'Distribution suspended',
      reason: 'LNCHBL distribution is currently suspended. Patch manifests are unavailable.',
      suspended: true,
      contact: 'licensing@cmpsbl.com',
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
