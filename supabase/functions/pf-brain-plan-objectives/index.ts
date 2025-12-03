/**
 * PromptFluid Brain Executive Planner
 * Creates and updates 72-hour rolling objectives
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const sb = createClient(supabaseUrl, supabaseKey);

    console.log('📋 Starting executive planning cycle...');

    // Get recent knowledge with contradictions or low confidence
    const { data: knowledgeGaps } = await sb
      .from('cascade_knowledge_core')
      .select('*')
      .or('contradiction_flag.eq.true,confidence.lt.0.5')
      .order('updated_at', { ascending: false })
      .limit(10);

    // Get current active objectives
    const { data: activeObjectives } = await sb
      .from('cascade_objectives')
      .select('*')
      .eq('status', 'active');

    const now = new Date();
    const threeDaysLater = new Date(now.getTime() + 72 * 60 * 60 * 1000);

    // Complete expired objectives
    for (const obj of activeObjectives || []) {
      if (new Date(obj.end_time) < now) {
        await sb
          .from('cascade_objectives')
          .update({ status: 'completed' })
          .eq('id', obj.id);
      }
    }

    // Create new objectives based on gaps
    const newObjectives = [];
    const maxNewObjectives = Math.min(3, 3 - (activeObjectives?.length || 0));

    const safeKnowledgeGaps = knowledgeGaps ?? [];
    for (let i = 0; i < maxNewObjectives && i < safeKnowledgeGaps.length; i++) {
      const gap = safeKnowledgeGaps[i];
      
      const objective = gap.contradiction_flag
        ? `Resolve contradiction in ${gap.topic}: validate conflicting sources and establish ground truth`
        : `Strengthen understanding of ${gap.topic}: increase confidence from ${(gap.confidence * 100).toFixed(0)}% to >80%`;

      const { data: newObj } = await sb
        .from('cascade_objectives')
        .insert({
          objective,
          start_time: now.toISOString(),
          end_time: threeDaysLater.toISOString(),
          success_metric: 0,
          progress_notes: 'Automatically generated from knowledge gaps'
        })
        .select()
        .single();

      newObjectives.push(newObj);
    }

    // Update memory anchors
    const { data: allKnowledge } = await sb
      .from('cascade_knowledge_core')
      .select('*')
      .gte('confidence', 0.7)
      .order('confidence', { ascending: false })
      .limit(20);

    // Map knowledge to PromptFluid modules based on topic keywords
    const moduleMapping: Record<string, string[]> = {
      'vision': ['dashboard', 'analytics', 'monitoring'],
      'defense': ['security', 'bot', 'threat', 'protection'],
      'nexus': ['ai', 'model', 'routing', 'intelligence'],
      'ripple': ['api', 'integration', 'webhook', 'queue'],
      'studio': ['build', 'deploy', 'create', 'design'],
      'access': ['accessibility', 'wcag', 'screen reader', 'aria']
    };

    for (const knowledge of allKnowledge || []) {
      for (const [module, keywords] of Object.entries(moduleMapping)) {
        const topicLower = knowledge.topic.toLowerCase();
        const hasMatch = keywords.some(kw => topicLower.includes(kw));
        
        if (hasMatch) {
          // Check if anchor exists
          const { data: existingAnchor } = await sb
            .from('cascade_memory_anchors')
            .select('*')
            .eq('knowledge_id', knowledge.id)
            .eq('project_module', module)
            .single();

          if (!existingAnchor) {
            await sb
              .from('cascade_memory_anchors')
              .insert({
                knowledge_id: knowledge.id,
                project_module: module,
                relevance_score: knowledge.confidence,
                last_validated: now.toISOString()
              });
          } else if (existingAnchor.relevance_score < 0.6) {
            await sb
              .from('cascade_memory_anchors')
              .update({ needs_refresh: true })
              .eq('id', existingAnchor.id);
          }
        }
      }
    }

    console.log(`✅ Planning complete: ${newObjectives.length} new objectives`);

    return new Response(
      JSON.stringify({
        ok: true,
        new_objectives: newObjectives.length,
        active_total: (activeObjectives?.length || 0) + newObjectives.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Planning error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
