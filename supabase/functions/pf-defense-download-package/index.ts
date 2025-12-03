/**
 * PromptFluid Reflex - Download Plugin Package
 * Generate and serve plugin packages for distribution
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const url = new URL(req.url);
    const version = url.searchParams.get('version');
    const api_key = url.searchParams.get('api_key');

    if (!version || !api_key) {
      return new Response(JSON.stringify({ error: 'version and api_key required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Verify API key
    const { data: installation } = await supabase
      .from('pfdef_installations')
      .select('*')
      .eq('api_key', api_key)
      .single();

    if (!installation) {
      return new Response(JSON.stringify({ error: 'Invalid API key' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get update info
    const { data: update } = await supabase
      .from('pfdef_updates')
      .select('*')
      .eq('version', version)
      .single();

    if (!update) {
      return new Response(JSON.stringify({ error: 'Update not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Log download attempt
    await supabase
      .from('pfdef_update_deployments')
      .update({ status: 'downloading' })
      .match({ 
        update_id: update.id, 
        installation_id: installation.id 
      });

    // In production, this would:
    // 1. Generate ZIP package from storage/repo
    // 2. Sign package for verification
    // 3. Stream package download
    // 4. Log download completion

    // Return download metadata with Bot Sniper branding
    return new Response(JSON.stringify({
      version: update.version,
      plugin_name: 'PromptFluid Reflex – Bot Sniper',
      download_url: `https://hxgbibtkftocyrnuzxwd.supabase.co/functions/v1/pf-wordpress-generate-zip`,
      checksum: 'sha256:placeholder',
      size_mb: update.package_size_mb,
      changelog: update.changelog,
      installation_instructions: 'Extract and replace plugin files. Backup recommended. Rebranded as PromptFluid Reflex with Bot Sniper technology.'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
