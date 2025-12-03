import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      throw new Error('Unauthorized');
    }

    const { previewId, mode } = await req.json();

    if (!previewId || !mode) {
      throw new Error('Preview ID and mode required');
    }

    // Verify preview ownership
    const { data: preview } = await supabaseClient
      .from('studio_previews')
      .select('*, studio_scans!inner(*, studio_connections!inner(*))')
      .eq('id', previewId)
      .single();

    if (!preview || preview.studio_scans.studio_connections.user_id !== user.id) {
      throw new Error('Preview not found or unauthorized');
    }

    // Create apply record
    const { data: apply, error: applyError } = await supabaseClient
      .from('studio_applies')
      .insert({
        preview_id: previewId,
        mode,
        status: 'running'
      })
      .select()
      .single();

    if (applyError) throw applyError;

    // Simulate apply process based on mode
    let result: any = { status: 'completed' };

    switch (mode) {
      case 'github':
        result.pr_url = `https://github.com/user/repo/pull/${Math.floor(Math.random() * 1000)}`;
        break;
      case 'wordpress':
        result.wp_task_id = `wp_${Date.now()}`;
        break;
      case 'zip':
        result.artifact_url = `/downloads/patch_${apply.id}.zip`;
        break;
    }

    // Update apply with results
    await supabaseClient
      .from('studio_applies')
      .update({
        status: 'completed',
        ...result,
        completed_at: new Date().toISOString()
      })
      .eq('id', apply.id);

    // Create audit log
    await supabaseClient.from('studio_audit').insert({
      entity: 'apply',
      entity_id: apply.id,
      action: 'complete',
      actor_id: user.id,
      details: { mode, ...result }
    });

    console.log(`Apply completed: ${apply.id} (${mode})`);

    return new Response(
      JSON.stringify({
        success: true,
        apply: {
          id: apply.id,
          status: 'completed',
          mode,
          ...result
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in pf-studio-apply:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
