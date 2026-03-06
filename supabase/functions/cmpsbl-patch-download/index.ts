/**
 * cmpsbl-patch-download — SUSPENDED
 * LNCHBL distribution is suspended pending licensing.
 * All download requests return 503.
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  return new Response(
    JSON.stringify({
      error: 'Distribution suspended',
      reason: 'LNCHBL distribution is currently suspended. Patch downloads are unavailable.',
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
