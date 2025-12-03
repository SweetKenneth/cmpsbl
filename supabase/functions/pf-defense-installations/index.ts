/**
 * PromptFluid Defense - Installation Management
 * Handles registration, status updates, and monitoring of Defense installations
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RegisterSchema = z.object({
  site_url: z.string().url().max(500),
  site_name: z.string().min(1).max(200),
  current_version: z.string().max(20),
  php_version: z.string().max(20).optional(),
  wordpress_version: z.string().max(20).optional(),
});

const UpdateSchema = z.object({
  api_key: z.string().min(32).max(100),
  status: z.enum(['active', 'inactive', 'suspended', 'error']).optional(),
  last_check_in: z.string().datetime().optional(),
  error_message: z.string().max(500).optional(),
});

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
    const action = url.searchParams.get('action') || 'list';

    // LIST: Get all installations with stats
    if (action === 'list') {
      const { data: installations, error } = await supabase
        .from('pfdef_installations')
        .select(`
          *,
          deployments:pfdef_update_deployments(
            update_id,
            status,
            completed_at
          )
        `)
        .order('last_seen', { ascending: false });

      if (error) throw error;

      return new Response(JSON.stringify({ installations }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // REGISTER: New installation registration
    if (action === 'register' && req.method === 'POST') {
      const body = await req.json();
      const { site_url, site_name, current_version, php_version, wordpress_version } = RegisterSchema.parse(body);

      // Generate unique API key
      const { data: apiKeyData } = await supabase.rpc('generate_pfdef_api_key');
      const api_key = apiKeyData;

      const { data: installation, error } = await supabase
        .from('pfdef_installations')
        .insert({
          site_url,
          site_name,
          api_key,
          current_version,
          php_version,
          wordpress_version,
          status: 'active'
        })
        .select()
        .single();

      if (error) {
        console.error('Registration error:', error);
        throw error;
      }

      return new Response(JSON.stringify({ 
        success: true, 
        installation,
        api_key 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // STATUS: Update installation status (heartbeat)
    if (action === 'status' && req.method === 'POST') {
      const body = await req.json();
      const { api_key, status, last_check_in, error_message } = UpdateSchema.parse(body);
      const stats = body.stats; // Optional metadata field
      const current_version = body.current_version; // Optional version field

      const { data: installation, error } = await supabase
        .from('pfdef_installations')
        .update({
          last_seen: new Date().toISOString(),
          stats,
          current_version,
          status: status || 'active',
          ...(error_message && { error_message })
        })
        .eq('api_key', api_key)
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify({ success: true, installation }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // STATS: Get installation statistics
    if (action === 'stats') {
      const { count: totalInstalls } = await supabase
        .from('pfdef_installations')
        .select('*', { count: 'exact', head: true });

      const { count: activeInstalls } = await supabase
        .from('pfdef_installations')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      const { data: versionBreakdown } = await supabase
        .from('pfdef_installations')
        .select('current_version')
        .not('current_version', 'is', null);

      const versions: Record<string, number> = {};
      versionBreakdown?.forEach(item => {
        const ver = item.current_version || 'unknown';
        versions[ver] = (versions[ver] || 0) + 1;
      });

      return new Response(JSON.stringify({
        totalInstalls,
        activeInstalls,
        versionBreakdown: versions
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // DELETE: Remove installation
    if (action === 'delete' && req.method === 'POST') {
      const { installation_id } = await req.json();

      const { error } = await supabase
        .from('pfdef_installations')
        .delete()
        .eq('id', installation_id);

      if (error) throw error;

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
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
