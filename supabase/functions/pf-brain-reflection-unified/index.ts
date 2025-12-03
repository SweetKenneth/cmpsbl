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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { type = 'self', params = {} } = await req.json();
    
    const result: any = {
      type,
      timestamp: new Date().toISOString(),
      status: 'success'
    };

    switch (type) {
      case 'self':
        try {
          const { data, error } = await supabase
            .from('brain_reflection')
            .insert({
              reflection_type: 'self',
              content: params.content,
              triggers: params.triggers || [],
              insights: params.insights || [],
              metadata: params.metadata || {}
            })
            .select();

          if (error) throw error;
          result.reflection = data[0];
        } catch (e) {
          result.status = 'error';
          result.message = e instanceof Error ? e.message : 'Unknown error';
        }
        break;

      case 'insight':
        try {
          if (params.aggregate) {
            const { data: insights } = await supabase
              .from('learning_results')
              .select('*')
              .gte('confidence_score', params.min_confidence || 0.7)
              .gte('created_at', new Date(Date.now() - (params.days || 7) * 24 * 3600000).toISOString())
              .order('confidence_score', { ascending: false })
              .limit(params.limit || 20);

            const aggregated = {
              total_insights: insights?.length || 0,
              high_confidence: insights?.filter(i => i.confidence_score >= 0.9).length || 0,
              topics: [...new Set(insights?.map(i => i.topic).filter(Boolean))],
              avg_confidence: insights && insights.length > 0
                ? insights.reduce((sum, i) => sum + (i.confidence_score || 0), 0) / insights.length
                : 0
            };

            result.aggregated_insights = aggregated;
          } else {
            const { data, error } = await supabase
              .from('learning_results')
              .insert({
                topic: params.topic,
                insight: params.insight,
                confidence_score: params.confidence_score || 0.5,
                metadata: params.metadata || {}
              })
              .select();

            if (error) throw error;
            result.insight = data[0];
          }
        } catch (e) {
          result.status = 'error';
          result.message = e instanceof Error ? e.message : 'Unknown error';
        }
        break;

      case 'curiosity':
        try {
          const { data: recent } = await supabase
            .from('learning_queries')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50);

          const topicsExplored = [...new Set(recent?.map(q => q.topic).filter(Boolean))];
          
          const curiosityScore = {
            topics_explored: topicsExplored.length,
            queries_this_week: recent?.filter(q => 
              new Date(q.created_at) > new Date(Date.now() - 7 * 24 * 3600000)
            ).length || 0,
            exploration_diversity: topicsExplored.length / (recent?.length || 1)
          };

          const { data: reflection, error } = await supabase
            .from('brain_reflection')
            .insert({
              reflection_type: 'curiosity',
              content: `Curiosity reflection: ${curiosityScore.topics_explored} topics explored`,
              metadata: { curiosity_score: curiosityScore }
            })
            .select();

          if (error) throw error;
          result.curiosity_reflection = reflection[0];
          result.curiosity_metrics = curiosityScore;
        } catch (e) {
          result.status = 'error';
          result.message = e instanceof Error ? e.message : 'Unknown error';
        }
        break;

      case 'synthesize':
        try {
          const { data: insights } = await supabase
            .from('learning_results')
            .select('*')
            .gte('created_at', new Date(Date.now() - (params.days || 7) * 24 * 3600000).toISOString())
            .order('confidence_score', { ascending: false });

          const { data: reflections } = await supabase
            .from('brain_reflection')
            .select('*')
            .gte('created_at', new Date(Date.now() - (params.days || 7) * 24 * 3600000).toISOString())
            .order('created_at', { ascending: false });

          const synthesis = {
            total_insights: insights?.length || 0,
            total_reflections: reflections?.length || 0,
            key_themes: [...new Set([
              ...(insights?.map(i => i.topic).filter(Boolean) || []),
              ...(reflections?.flatMap(r => r.triggers).filter(Boolean) || [])
            ])].slice(0, 10),
            synthesis_summary: `Synthesized ${insights?.length || 0} insights and ${reflections?.length || 0} reflections from the past ${params.days || 7} days`
          };

          result.synthesis = synthesis;
        } catch (e) {
          result.status = 'error';
          result.message = e instanceof Error ? e.message : 'Unknown error';
        }
        break;

      default:
        result.status = 'error';
        result.message = `Unknown reflection type: ${type}`;
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Reflection unified error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      status: 'failed'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
