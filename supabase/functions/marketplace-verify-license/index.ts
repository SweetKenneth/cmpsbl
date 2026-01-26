/**
 * Marketplace License Verification — Validate and activate licenses
 * Prevents piracy by enforcing single-install domain binding
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Hash for verification
async function hashKey(key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const body = await req.json();
    const { action, license_key, domain, fingerprint } = body;

    if (!license_key) {
      return new Response(
        JSON.stringify({ valid: false, error: "License key required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Validate license key format: PF-XXXXX-XXXXX-XXXXX-XXXXX (24 chars)
    if (!license_key.startsWith('PF-') || license_key.length !== 24) {
      return new Response(
        JSON.stringify({ valid: false, error: "Invalid license key format" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const keyHash = await hashKey(license_key);

    // Look up the license
    const { data: license, error: licenseError } = await supabase
      .from('marketplace_licenses')
      .select('*')
      .eq('license_key_hash', keyHash)
      .single();

    if (licenseError || !license) {
      console.log(`License not found: ${license_key.substring(0, 8)}...`);
      return new Response(
        JSON.stringify({ valid: false, error: "License key not found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }

    // VALIDATE action - just check if license is valid
    if (action === 'validate') {
      return new Response(
        JSON.stringify({
          valid: true,
          activated: license.activated,
          product_type: license.product_type,
          product_id: license.product_id,
          activated_domain: license.activated_domain || null,
          activated_at: license.activated_at || null,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // ACTIVATE action - bind license to domain/fingerprint
    if (action === 'activate') {
      // Check if already activated
      if (license.activated) {
        // If already activated to a different domain, reject
        if (license.activated_domain && license.activated_domain !== domain) {
          console.log(`License ${license_key.substring(0, 8)} already activated to ${license.activated_domain}, rejecting ${domain}`);
          return new Response(
            JSON.stringify({
              valid: false,
              error: "License has already been activated on another installation",
              activated_domain: license.activated_domain,
              activated_at: license.activated_at,
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 403 }
          );
        }

        // Same domain - allow (re-validation)
        return new Response(
          JSON.stringify({
            valid: true,
            activated: true,
            product_type: license.product_type,
            message: "License already activated for this domain",
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
        );
      }

      // Not yet activated - activate now
      const { error: updateError } = await supabase
        .from('marketplace_licenses')
        .update({
          activated: true,
          activated_at: new Date().toISOString(),
          activated_domain: domain || null,
          activation_fingerprint: fingerprint || null,
        })
        .eq('license_key_hash', keyHash);

      if (updateError) {
        console.error("Activation error:", updateError);
        return new Response(
          JSON.stringify({ valid: false, error: "Failed to activate license" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }

      // Log the activation
      await supabase.from('audit_logs').insert({
        action: 'license_activated',
        entity_type: 'marketplace_license',
        entity_id: license.id,
        details: { domain, fingerprint, product_type: license.product_type },
      });

      console.log(`License ${license_key.substring(0, 8)} activated for ${domain}`);

      return new Response(
        JSON.stringify({
          valid: true,
          activated: true,
          product_type: license.product_type,
          message: "License successfully activated",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // DOWNLOAD action - return download URL if license is valid
    if (action === 'download') {
      // Only allow download for OS licenses
      if (license.product_type !== 'os') {
        return new Response(
          JSON.stringify({ error: "Download only available for OS licenses" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }

      // Generate a time-limited download token
      const downloadToken = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      await supabase.from('marketplace_downloads').insert({
        license_id: license.id,
        download_token: downloadToken,
        expires_at: expiresAt.toISOString(),
        ip_address: req.headers.get('x-forwarded-for') || 'unknown',
      });

      return new Response(
        JSON.stringify({
          valid: true,
          download_token: downloadToken,
          expires_at: expiresAt.toISOString(),
          download_url: `${Deno.env.get("SUPABASE_URL")}/functions/v1/marketplace-download?token=${downloadToken}`,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action. Use: validate, activate, or download" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );

  } catch (error) {
    console.error("License verification error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});