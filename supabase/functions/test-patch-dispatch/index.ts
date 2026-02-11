import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const patchSecret = Deno.env.get('CMPSBL_PATCH_SECRET');

  if (!supabaseUrl || !patchSecret) {
    return new Response(JSON.stringify({ error: 'Missing config', hasUrl: !!supabaseUrl, hasSecret: !!patchSecret }), {
      status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Call cmpsbl-patch-dispatch with the patch secret as auth
  const dispatchUrl = `${supabaseUrl}/functions/v1/cmpsbl-patch-dispatch`;
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';

  const res = await fetch(dispatchUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${patchSecret}`,
      'apikey': anonKey,
    },
    body: JSON.stringify({
      target_distribution: 'LNCHBL',
      patch_version: '2.0.1',
      capabilities: ['test-capability'],
      engines: [],
      changelog: 'Test patch v2.0.1 from CMPSBL dispatch layer',
      config_overrides: {},
    }),
  });

  const body = await res.json().catch(() => ({}));

  return new Response(JSON.stringify({
    dispatch_status: res.status,
    dispatch_response: body,
  }), {
    status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
