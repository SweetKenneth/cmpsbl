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

    // Read from request body (how supabase.functions.invoke sends data)
    const body = await req.json().catch(() => ({}));
    const project_id = body.project_id;
    const user_id = body.user_id;

    console.log('Status request:', { project_id, user_id });

    if (!project_id && !user_id) {
      return new Response(
        JSON.stringify({ error: 'project_id or user_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch specific project
    if (project_id) {
      const { data, error } = await supabase
        .from('pf_mvp_projects')
        .select(`
          *,
          pf_merger_fusions (
            *,
            pf_merger_intents (*)
          ),
          pf_merger_metrics (*)
        `)
        .eq('id', project_id)
        .single();

      if (error) {
        throw new Error(`Failed to fetch status: ${error.message}`);
      }

      const project = data;
      
      return new Response(
        JSON.stringify({
          success: true,
          project: {
            id: project.id,
            name: project.project_name,
            status: project.build_status,
            phase: project.current_phase,
            progress: project.progress_percentage,
            deploy_url: project.deploy_url,
            preview_url: project.preview_url,
            github_repo: project.github_repo,
            logs: project.build_logs,
            created_at: project.created_at,
            completed_at: project.completed_at,
            deployed_at: project.deployed_at,
            error: project.error_message,
            feedback_score: project.feedback_score,
            intent: project.pf_merger_fusions?.pf_merger_intents,
            fusion: {
              model_used: project.pf_merger_fusions?.model_used,
              blueprint: project.pf_merger_fusions?.blueprint_ref,
              cost: project.pf_merger_fusions?.actual_cost || project.pf_merger_fusions?.estimated_cost
            },
            metrics: project.pf_merger_metrics?.[0] || null
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch all projects for user
    if (user_id) {
      const { data, error } = await supabase
        .from('pf_mvp_projects')
        .select(`
          *,
          pf_merger_fusions (
            *,
            pf_merger_intents (*)
          ),
          pf_merger_metrics (*)
        `)
        .eq('user_id', user_id)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch projects: ${error.message}`);
      }

      return new Response(
        JSON.stringify({
          success: true,
          projects: data.map((p: any) => ({
            id: p.id,
            name: p.project_name,
            status: p.build_status,
            progress: p.progress_percentage,
            created_at: p.created_at,
            completed_at: p.completed_at
          })),
          total: data.length
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    throw new Error('Invalid request parameters');

  } catch (error) {
    console.error('Error in status:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
