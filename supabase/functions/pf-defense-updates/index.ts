/**
 * PromptFluid Defense - Update Management
 * Create, publish, and manage Defense software updates
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
    const action = url.searchParams.get('action') || 'list';

    // LIST: Get all updates
    if (action === 'list') {
      const { data: updates, error } = await supabase
        .from('pfdef_updates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return new Response(JSON.stringify({ updates }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // CREATE: New update version
    if (action === 'create' && req.method === 'POST') {
      const updateData = await req.json();

      const { data: update, error } = await supabase
        .from('pfdef_updates')
        .insert({
          ...updateData,
          status: 'draft',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Create update error:', error);
        throw error;
      }

      return new Response(JSON.stringify({ success: true, update }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // PUBLISH: Make update ready for deployment
    if (action === 'publish' && req.method === 'POST') {
      const { update_id } = await req.json();

      const { data: update, error } = await supabase
        .from('pfdef_updates')
        .update({
          status: 'ready',
          published_at: new Date().toISOString()
        })
        .eq('id', update_id)
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify({ success: true, update }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // CHECK: Check for updates (called by WordPress plugin)
    if (action === 'check') {
      const current_version = url.searchParams.get('current_version');
      const api_key = url.searchParams.get('api_key');

      if (!api_key) {
        return new Response(JSON.stringify({ error: 'API key required' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Verify installation exists
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

      // Get latest ready update
      const { data: updates } = await supabase
        .from('pfdef_updates')
        .select('*')
        .eq('status', 'ready')
        .order('created_at', { ascending: false })
        .limit(1);

      const latestUpdate = updates?.[0];

      if (!latestUpdate) {
        return new Response(JSON.stringify({ 
          update_available: false,
          message: 'No updates available' 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Compare versions (simple string comparison for MVP)
      const updateAvailable = latestUpdate.version !== current_version;

      return new Response(JSON.stringify({
        update_available: updateAvailable,
        latest_version: latestUpdate.version,
        current_version,
        update: updateAvailable ? latestUpdate : null
      }), {
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
