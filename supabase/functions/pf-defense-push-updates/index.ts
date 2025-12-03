/**
 * PromptFluid Defense - Push Updates
 * Push updates to specific installations or all installations
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

    const { update_id, installation_ids, push_all = false } = await req.json();

    if (!update_id) {
      return new Response(JSON.stringify({ error: 'update_id required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get target installations
    let installations;
    if (push_all) {
      const { data } = await supabase
        .from('pfdef_installations')
        .select('id, site_url, auto_update')
        .eq('status', 'active');
      installations = data;
    } else {
      const { data } = await supabase
        .from('pfdef_installations')
        .select('id, site_url, auto_update')
        .in('id', installation_ids);
      installations = data;
    }

    if (!installations || installations.length === 0) {
      return new Response(JSON.stringify({ 
        error: 'No installations found',
        pushed: 0 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Queue updates for each installation
    const queueItems = installations.map(inst => ({
      update_id,
      installation_id: inst.id,
      priority: inst.auto_update ? 5 : 3,
      scheduled_for: new Date().toISOString(),
      status: 'queued'
    }));

    const { data: queued, error: queueError } = await supabase
      .from('pfdef_update_queue')
      .insert(queueItems)
      .select();

    if (queueError) {
      console.error('Queue error:', queueError);
      throw queueError;
    }

    // Create deployment records
    const deployments = installations.map(inst => ({
      update_id,
      installation_id: inst.id,
      status: 'pending',
      started_at: new Date().toISOString()
    }));

    const { error: deployError } = await supabase
      .from('pfdef_update_deployments')
      .insert(deployments);

    if (deployError) {
      console.error('Deployment error:', deployError);
    }

    // In production, trigger webhook/notification to each installation
    // For MVP, installations will poll for updates

    return new Response(JSON.stringify({
      success: true,
      pushed: installations.length,
      queued: queued?.length || 0,
      installations: installations.map(i => i.site_url)
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
