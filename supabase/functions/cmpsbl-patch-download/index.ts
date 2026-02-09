import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const TIER_HIERARCHY: Record<string, number> = {
  'free': 0,
  'builder': 1,
  'pro': 2,
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // POST only
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed. POST only.' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const body = await req.json();
    const { patch_id, distribution_id, license_key } = body;

    // ─── Input Validation ────────────────────────────────────────────────
    if (!patch_id || typeof patch_id !== 'string') {
      return new Response(
        JSON.stringify({ error: 'patch_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!distribution_id || typeof distribution_id !== 'string') {
      return new Response(
        JSON.stringify({ error: 'distribution_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!license_key || typeof license_key !== 'string') {
      return new Response(
        JSON.stringify({ error: 'license_key is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ─── Distribution Check ──────────────────────────────────────────────
    if (distribution_id !== 'LNCHBL') {
      console.warn(`Download rejected: distribution_id="${distribution_id}"`);
      return new Response(
        JSON.stringify({ error: 'Unauthorized distribution. Only LNCHBL may download patches.' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ─── Supabase Init ───────────────────────────────────────────────────
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !supabaseKey) {
      return new Response(
        JSON.stringify({ error: 'Service unavailable' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // ─── License Validation (server-side, never trust client claims) ─────
    // Hash the license key for lookup
    const encoder = new TextEncoder();
    const keyData = encoder.encode(license_key);
    const hashBuffer = await crypto.subtle.digest('SHA-256', keyData);
    const keyHash = Array.from(new Uint8Array(hashBuffer))
      .map((b: number) => b.toString(16).padStart(2, '0')).join('');

    // Check pf_licenses table (or marketplace_licenses)
    let licenseTier = 'free';
    let licenseValid = false;

    // Try marketplace_licenses first
    const { data: license } = await supabase
      .from('marketplace_licenses')
      .select('*')
      .eq('license_key_hash', keyHash)
      .eq('activated', true)
      .maybeSingle();

    if (license) {
      licenseValid = true;
      // Determine tier from product_type or product metadata
      licenseTier = license.product_type === 'os' ? 'pro' : 'builder';
    } else {
      // Fallback: check if it's a prefix match (PF- format key)
      const keyPrefix = license_key.substring(0, 8);
      const { data: prefixLicense } = await supabase
        .from('marketplace_licenses')
        .select('*')
        .eq('license_key_prefix', keyPrefix)
        .eq('activated', true)
        .maybeSingle();

      if (prefixLicense) {
        // Verify full hash
        const { data: verifiedLicense } = await supabase
          .from('marketplace_licenses')
          .select('*')
          .eq('license_key_hash', keyHash)
          .maybeSingle();

        if (verifiedLicense) {
          licenseValid = true;
          licenseTier = verifiedLicense.product_type === 'os' ? 'pro' : 'builder';
        }
      }
    }

    if (!licenseValid) {
      return new Response(
        JSON.stringify({ error: 'Invalid or inactive license key' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ─── Fetch Patch ─────────────────────────────────────────────────────
    const { data: patch, error: patchError } = await supabase
      .from('cmpsbl_patches')
      .select('*')
      .eq('id', patch_id)
      .eq('status', 'published')
      .eq('target_distribution', 'LNCHBL')
      .single();

    if (patchError || !patch) {
      return new Response(
        JSON.stringify({ error: 'Patch not found or not published' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ─── Tier Entitlement Check ──────────────────────────────────────────
    const requiredLevel = TIER_HIERARCHY[patch.required_tier] ?? 0;
    const userLevel = TIER_HIERARCHY[licenseTier] ?? 0;

    if (userLevel < requiredLevel) {
      return new Response(
        JSON.stringify({ 
          error: `License tier "${licenseTier}" insufficient. Patch requires "${patch.required_tier}" or higher.`,
          required_tier: patch.required_tier,
          your_tier: licenseTier,
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ─── Audit Log ───────────────────────────────────────────────────────
    const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    await supabase.from('cmpsbl_patch_downloads').insert({
      patch_id: patch.id,
      distribution_id: 'LNCHBL',
      license_key_hash: keyHash,
      license_tier: licenseTier,
      ip_address: clientIp,
      user_agent: userAgent,
    });

    // Also log to audit_logs
    await supabase.from('audit_logs').insert({
      action: 'patch_download',
      entity_type: 'cmpsbl_patch',
      entity_id: patch.id,
      details: {
        version: patch.version,
        distribution_id: 'LNCHBL',
        license_tier: licenseTier,
        ip: clientIp,
      },
    });

    // ─── Return Patch Payload ────────────────────────────────────────────
    const payload = {
      id: patch.id,
      version: patch.version,
      targetDistribution: patch.target_distribution,
      requiredTier: patch.required_tier,
      enginesUnlocked: patch.engines_unlocked || [],
      capabilitiesUnlocked: patch.capabilities_unlocked || [],
      changelog: patch.changelog,
      manifest: patch.manifest_json,
      signature: patch.signature,
      publishedAt: patch.published_at,
    };

    return new Response(
      JSON.stringify(payload),
      { 
        status: 200, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'X-CMPSBL-Patch-Version': patch.version,
        } 
      }
    );
  } catch (err) {
    console.error('Patch download error:', err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
