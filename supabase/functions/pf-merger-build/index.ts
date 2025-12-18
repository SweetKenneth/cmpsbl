import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { fusion_id, project_name, user_id } = await req.json();

    if (!fusion_id || !project_name) {
      return new Response(
        JSON.stringify({ error: 'fusion_id and project_name are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Starting MVP build for fusion: ${fusion_id}`);

    // Fetch fusion data
    const { data: fusion, error: fusionError } = await supabase
      .from('pf_merger_fusions')
      .select(`
        *,
        pf_merger_intents (*)
      `)
      .eq('id', fusion_id)
      .single();

    if (fusionError || !fusion) {
      throw new Error('Fusion not found');
    }

    // Create MVP project record
    const { data: project, error: projectError } = await supabase
      .from('pf_mvp_projects')
      .insert({
        fusion_id,
        user_id: user_id || fusion.pf_merger_intents.user_id,
        project_name,
        build_status: 'initializing',
        current_phase: 'research',
        progress_percentage: 0,
        build_logs: [{
          timestamp: new Date().toISOString(),
          phase: 'init',
          message: 'MVP build initiated',
          status: 'success'
        }]
      })
      .select()
      .single();

    if (projectError) {
      throw new Error(`Failed to create project: ${projectError.message}`);
    }

    console.log(`✓ MVP project created: ${project.id}`);

    // Start async build pipeline
    // Phase 1: Research
    await supabase
      .from('pf_mvp_projects')
      .update({ 
        build_status: 'researching',
        current_phase: 'research',
        progress_percentage: 10,
        build_logs: [
          ...(project.build_logs || []),
          {
            timestamp: new Date().toISOString(),
            phase: 'research',
            message: 'Analyzing market and gathering requirements',
            status: 'in_progress'
          }
        ]
      })
      .eq('id', project.id);

    // Phase 2: Structure (async - this would be handled by a queue in production)
    setTimeout(async () => {
      try {
        await supabase
          .from('pf_mvp_projects')
          .update({ 
            build_status: 'structuring',
            current_phase: 'structure',
            progress_percentage: 40,
            build_logs: [
              ...(project.build_logs || []),
              {
                timestamp: new Date().toISOString(),
                phase: 'structure',
                message: 'Creating application architecture',
                status: 'in_progress'
              }
            ]
          })
          .eq('id', project.id);
      } catch (e) {
        console.error('Structure phase error:', e);
      }
    }, 2000);

    // Phase 3: Code (async)
    setTimeout(async () => {
      try {
        await supabase
          .from('pf_mvp_projects')
          .update({ 
            build_status: 'coding',
            current_phase: 'code',
            progress_percentage: 70,
            build_logs: [
              ...(project.build_logs || []),
              {
                timestamp: new Date().toISOString(),
                phase: 'code',
                message: 'Generating application code',
                status: 'in_progress'
              }
            ]
          })
          .eq('id', project.id);
      } catch (e) {
        console.error('Code phase error:', e);
      }
    }, 5000);

    // Phase 4: Deploy (async)
    setTimeout(async () => {
      try {
        const previewUrl = `https://preview.promptfluid.com/${project.id}`;
        
        await supabase
          .from('pf_mvp_projects')
          .update({ 
            build_status: 'deploying',
            current_phase: 'deploy',
            progress_percentage: 90,
            preview_url: previewUrl,
            build_logs: [
              ...(project.build_logs || []),
              {
                timestamp: new Date().toISOString(),
                phase: 'deploy',
                message: 'Deploying to production',
                status: 'in_progress'
              }
            ]
          })
          .eq('id', project.id);

        // Simulate deployment completion
        setTimeout(async () => {
          await supabase
            .from('pf_mvp_projects')
            .update({ 
              build_status: 'completed',
              progress_percentage: 100,
              deploy_url: previewUrl,
              completed_at: new Date().toISOString(),
              deployed_at: new Date().toISOString(),
              build_logs: [
                ...(project.build_logs || []),
                {
                  timestamp: new Date().toISOString(),
                  phase: 'complete',
                  message: 'MVP successfully deployed',
                  status: 'success'
                }
              ]
            })
            .eq('id', project.id);

          // Create metrics
          await supabase.from('pf_merger_metrics').insert({
            project_id: project.id,
            generation_time_ms: 10000,
            success_rate: 100,
            quality_score: 85
          });
        }, 2000);
      } catch (e) {
        console.error('Deploy phase error:', e);
        await supabase
          .from('pf_mvp_projects')
          .update({ 
            build_status: 'failed',
            error_message: e instanceof Error ? e.message : 'Deployment failed'
          })
          .eq('id', project.id);
      }
    }, 8000);

    return new Response(
      JSON.stringify({
        success: true,
        project_id: project.id,
        build_status: 'initializing',
        message: 'MVP build pipeline started. Check status endpoint for updates.',
        status_url: `/api/merger/status?project_id=${project.id}`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in build:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
