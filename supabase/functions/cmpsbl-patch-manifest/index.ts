import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-distribution-id, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'GET') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed. GET only.' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const url = new URL(req.url);
    const distributionId = url.searchParams.get('distribution_id') || req.headers.get('x-distribution-id');

    if (distributionId !== 'LNCHBL') {
      return new Response(
        JSON.stringify({ error: 'Unauthorized distribution. Only LNCHBL may request patch manifests.' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !supabaseKey) {
      return new Response(
        JSON.stringify({ error: 'Service unavailable' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: patches, error } = await supabase
      .from('cmpsbl_patches')
      .select('id, version, required_tier, engines_unlocked, capabilities_unlocked, changelog, status, published_at')
      .eq('status', 'published')
      .eq('target_distribution', 'LNCHBL')
      .order('version', { ascending: false });

    if (error) {
      console.error('Patch manifest query error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to retrieve patches' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const patchEntries = (patches || []).map((p: any) => ({
      id: p.id,
      version: p.version,
      requiredTier: p.required_tier,
      enginesUnlocked: p.engines_unlocked || [],
      capabilitiesUnlocked: p.capabilities_unlocked || [],
      changelog: p.changelog || '',
      status: p.status,
      publishedAt: p.published_at,
    }));

    const manifest = {
      distributionId: 'CMPSBL',
      generatedAt: new Date().toISOString(),
      latestVersion: patchEntries[0]?.version ?? '0.0.0',
      patches: patchEntries,
      critical: patchEntries.some((p: any) => p.changelog?.toLowerCase().includes('[critical]')),
    };

    const encoder = new TextEncoder();
    const data = encoder.encode(JSON.stringify(manifest));
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const signature = hashArray.map((b: number) => b.toString(16).padStart(2, '0')).join('');

    const signedManifest = { ...manifest, signature };

    return new Response(
      JSON.stringify(signedManifest),
      { 
        status: 200, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=300',
          'X-CMPSBL-Signature': signature,
        } 
      }
    );
  } catch (err) {
    console.error('Manifest endpoint error:', err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
