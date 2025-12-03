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

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const { project_id, feedback_score, feedback_text, sections_to_refine } = await req.json();

    if (!project_id) {
      return new Response(
        JSON.stringify({ error: 'project_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Refining MVP project: ${project_id}`);

    // Fetch project data
    const { data: project, error: projectError } = await supabase
      .from('pf_mvp_projects')
      .select(`
        *,
        pf_merger_fusions (
          *,
          pf_merger_intents (*)
        )
      `)
      .eq('id', project_id)
      .single();

    if (projectError || !project) {
      throw new Error('Project not found');
    }

    // Update feedback if provided
    if (feedback_score !== undefined || feedback_text) {
      await supabase
        .from('pf_mvp_projects')
        .update({
          feedback_score,
          feedback_text
        })
        .eq('id', project_id);
    }

    // Determine what needs refinement
    const sectionsToRefine = sections_to_refine || ['code', 'copy', 'design'];
    const currentVersion = await supabase
      .from('pf_merger_history')
      .select('version')
      .eq('project_id', project_id)
      .order('version', { ascending: false })
      .limit(1);

    const nextVersion = (currentVersion.data?.[0]?.version || 0) + 1;

    // AI-powered analysis and refinement suggestions
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-4.5-sonnet',
        messages: [
          {
            role: 'system',
            content: `You are an expert MVP refinement analyzer for PromptFluid Merger.

Analyze the project and provide refinement suggestions for: ${sectionsToRefine.join(', ')}

Consider:
- User feedback score: ${feedback_score || 'not provided'}
- User feedback text: ${feedback_text || 'none'}
- Original intent: ${project.pf_merger_fusions?.pf_merger_intents?.intent}
- Current build status: ${project.build_status}

Return JSON with specific, actionable improvements.`
          },
          {
            role: 'user',
            content: `Analyze this project and suggest refinements:

Project: ${project.project_name}
Intent: ${project.pf_merger_fusions?.pf_merger_intents?.intent}
Target Type: ${project.pf_merger_fusions?.pf_merger_intents?.target_type}
Current Status: ${project.build_status}
Feedback Score: ${feedback_score || 'N/A'}
Feedback: ${feedback_text || 'None provided'}

Sections to refine: ${sectionsToRefine.join(', ')}`
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "suggest_refinements",
              description: "Suggest specific refinements for MVP sections",
              parameters: {
                type: "object",
                properties: {
                  refinements: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        section: { type: "string" },
                        issue: { type: "string" },
                        suggestion: { type: "string" },
                        priority: { type: "string", enum: ["high", "medium", "low"] },
                        estimated_impact: { type: "number", minimum: 0, maximum: 100 }
                      }
                    }
                  },
                  overall_quality_assessment: { type: "string" },
                  expected_improvement_score: { type: "number", minimum: 0, maximum: 100 }
                },
                required: ["refinements", "overall_quality_assessment"]
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "suggest_refinements" } }
      }),
    });

    if (!aiResponse.ok) {
      throw new Error(`AI refinement analysis failed: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall) {
      throw new Error('No refinement suggestions returned');
    }

    const refinements = JSON.parse(toolCall.function.arguments);

    // Store refinement history
    for (const section of sectionsToRefine) {
      await supabase
        .from('pf_merger_history')
        .insert({
          project_id,
          version: nextVersion,
          change_type: 'refinement',
          changed_section: section,
          before_snapshot: { status: project.build_status },
          after_snapshot: { refinements: refinements.refinements },
          improvement_score: refinements.expected_improvement_score || 0,
          brain_feedback: {
            analysis: refinements.overall_quality_assessment,
            feedback_score,
            feedback_text
          }
        });
    }

    // Update project metrics
    const { data: metrics } = await supabase
      .from('pf_merger_metrics')
      .select('*')
      .eq('project_id', project_id)
      .single();

    if (metrics) {
      await supabase
        .from('pf_merger_metrics')
        .update({
          iterations_count: (metrics.iterations_count || 1) + 1,
          user_satisfaction: feedback_score,
          updated_at: new Date().toISOString()
        })
        .eq('project_id', project_id);
    }

    // Feed results back to Brain for learning
    await supabase
      .from('brain_events')
      .insert({
        event_type: 'mvp_refinement',
        module: 'merger',
        data: {
          project_id,
          feedback_score,
          refinements: refinements.refinements,
          expected_improvement: refinements.expected_improvement_score
        },
        outcome: 'refinement_suggested'
      });

    console.log(`✓ Refinement analysis completed for project: ${project_id}`);

    return new Response(
      JSON.stringify({
        success: true,
        project_id,
        version: nextVersion,
        refinements: refinements.refinements,
        overall_assessment: refinements.overall_quality_assessment,
        expected_improvement: refinements.expected_improvement_score,
        message: 'Refinement analysis completed. Suggestions stored for implementation.'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in refine:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
