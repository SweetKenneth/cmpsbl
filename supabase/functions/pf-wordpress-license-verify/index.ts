/**
 * PromptFluid Defense WordPress License Verification
 * Validates API keys for WordPress Defense plugin installations
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  console.log(`[WP-LICENSE-VERIFY] ${step}${details ? ` - ${JSON.stringify(details)}` : ''}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("License verification started");
    
    const { apiKey, siteUrl, pluginVersion } = await req.json();
    
    if (!apiKey) {
      return new Response(JSON.stringify({ 
        valid: false, 
        error: "API key is required" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Hash the API key for secure lookup
    const encoder = new TextEncoder();
    const data = encoder.encode(apiKey);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const keyHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Verify API key exists and is active
    const { data: apiKeyData, error: keyError } = await supabaseClient
      .from('website_api_keys')
      .select('user_id, site_url, is_active, created_at')
      .eq('api_key', keyHash)
      .single();

    if (keyError || !apiKeyData) {
      logStep("Invalid API key");
      return new Response(JSON.stringify({ 
        valid: false, 
        error: "Invalid API key",
        message: "Please check your API key and try again."
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    // Check if key is active
    if (!apiKeyData.is_active) {
      return new Response(JSON.stringify({ 
        valid: false,
        error: "API key is inactive",
        message: "This API key has been deactivated. Please contact support."
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    // Update last used timestamp
    await supabaseClient
      .from('website_api_keys')
      .update({ 
        last_used_at: new Date().toISOString(),
        plugin_version: pluginVersion 
      })
      .eq('api_key', keyHash);

    // Log successful verification
    await supabaseClient.from('security_events').insert({
      event_type: 'wordpress_license_verified',
      severity: 'info',
      description: `WordPress plugin verified for ${siteUrl}`,
      metadata: {
        site_url: siteUrl,
        plugin_version: pluginVersion,
        user_id: apiKeyData.user_id
      }
    });

    logStep("License verified successfully", { siteUrl });

    return new Response(JSON.stringify({ 
      valid: true,
      message: "License verified successfully",
      features: {
        bot_detection: true,
        behavioral_analysis: true,
        device_fingerprinting: true,
        captcha_challenges: true,
        real_time_monitoring: true
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: any) {
    console.error('[WP-LICENSE-VERIFY] Error:', error);
    return new Response(JSON.stringify({ 
      valid: false,
      error: error.message || "Verification failed" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
