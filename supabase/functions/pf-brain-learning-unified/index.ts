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

    const { mode = 'status', params = {} } = await req.json();
    
    const result: any = {
      mode,
      timestamp: new Date().toISOString(),
      status: 'success'
    };

    switch (mode) {
      case 'learn':
        try {
          const { data, error } = await supabase
            .from('learning_queries')
            .insert({
              topic: params.topic,
              priority: params.priority || 'medium',
              status: 'pending',
              metadata: params.metadata || {}
            })
            .select();

          if (error) throw error;
          result.learning_query = data[0];
        } catch (e) {
          result.status = 'error';
          result.message = e instanceof Error ? e.message : 'Unknown error';
        }
        break;

      case 'analyze':
        try {
          const { data: queries } = await supabase
            .from('learning_queries')
            .select('*')
            .eq('status', 'completed')
            .gte('created_at', new Date(Date.now() - (params.days || 7) * 24 * 3600000).toISOString());

          const analysis = {
            total_queries: queries?.length || 0,
            avg_completion_time: 0,
            top_topics: [] as string[],
            success_rate: 0
          };

          if (queries && queries.length > 0) {
            const topics = queries.map((q: { topic?: string }) => q.topic).filter(Boolean) as string[];
            const topicCounts: Record<string, number> = {};
            for (const topic of topics) {
              topicCounts[topic] = (topicCounts[topic] || 0) + 1;
            }
            analysis.top_topics = Object.keys(topicCounts).sort((a, b) => (topicCounts[b] || 0) - (topicCounts[a] || 0)).slice(0, 5);
            analysis.success_rate = (queries.filter((q: { status?: string }) => q.status === 'completed').length / queries.length) * 100;
          }

          result.analysis = analysis;
        } catch (e) {
          result.status = 'error';
          result.message = e instanceof Error ? e.message : 'Unknown error';
        }
        break;

      case 'feedback':
        try {
          const { data, error } = await supabase
            .from('learning_feedback')
            .insert({
              query_id: params.query_id,
              rating: params.rating,
              comment: params.comment,
              metadata: params.metadata || {}
            })
            .select();

          if (error) throw error;
          result.feedback = data[0];
        } catch (e) {
          result.status = 'error';
          result.message = e instanceof Error ? e.message : 'Unknown error';
        }
        break;

      case 'log':
        try {
          const { data, error } = await supabase
            .from('learning_log')
            .insert({
              query_id: params.query_id,
              event_type: params.event_type,
              details: params.details,
              timestamp: new Date().toISOString()
            })
            .select();

          if (error) throw error;
          result.log_entry = data[0];
        } catch (e) {
          result.status = 'error';
          result.message = e instanceof Error ? e.message : 'Unknown error';
        }
        break;

      case 'auto_research':
        try {
          const topics = params.topics || ['make PromptFluid profitable'];
          const created: string[] = [];

          for (const topic of topics) {
            try {
              const { data } = await supabase
                .from('learning_queries')
                .insert({
                  topic,
                  priority: 'auto',
                  status: 'pending',
                  metadata: { auto_research: true, triggered_at: new Date().toISOString() }
                })
                .select();
              
              if (data && data[0]) created.push(data[0].id);
            } catch (innerErr) {
              console.error('Auto research error for topic', topic, innerErr);
            }
          }

          result.auto_research = {
            topics_queued: topics.length,
            queries_created: created.length,
            query_ids: created
          };
        } catch (e) {
          result.status = 'error';
          result.message = e instanceof Error ? e.message : 'Unknown error';
        }
        break;

      case 'cron':
        try {
          const { data: pending } = await supabase
            .from('learning_queries')
            .select('*')
            .eq('status', 'pending')
            .eq('priority', 'auto')
            .order('created_at', { ascending: true })
            .limit(params.batch_size || 3);

          const processed: string[] = [];
          for (const query of pending || []) {
            try {
              await supabase
                .from('learning_queries')
                .update({ status: 'processing', updated_at: new Date().toISOString() })
                .eq('id', query.id);
              processed.push(query.id);
            } catch (innerErr) {
              console.error('Cron processing error for query', query.id, innerErr);
            }
          }

          result.cron_run = {
            pending_found: pending?.length || 0,
            processed: processed.length,
            query_ids: processed
          };
        } catch (e) {
          result.status = 'error';
          result.message = e instanceof Error ? e.message : 'Unknown error';
        }
        break;

      case 'status':
        try {
          const [pending, processing, completed] = await Promise.all([
            supabase.from('learning_queries').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
            supabase.from('learning_queries').select('id', { count: 'exact', head: true }).eq('status', 'processing'),
            supabase.from('learning_queries').select('id', { count: 'exact', head: true }).eq('status', 'completed').gte('created_at', new Date(Date.now() - 24 * 3600000).toISOString())
          ]);

          result.status_info = {
            pending_queries: pending.count || 0,
            processing_queries: processing.count || 0,
            completed_today: completed.count || 0,
            system_status: 'operational'
          };
        } catch (e) {
          result.status = 'error';
          result.message = e instanceof Error ? e.message : 'Unknown error';
        }
        break;

      default:
        result.status = 'error';
        result.message = `Unknown learning mode: ${mode}`;
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Learning unified error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      status: 'failed'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
