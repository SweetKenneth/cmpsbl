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
    // Service role authentication - only internal systems can call this
    const authHeader = req.headers.get('Authorization');
    const providedKey = authHeader?.replace('Bearer ', '');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (providedKey !== SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(
        JSON.stringify({ error: 'Forbidden - Service role required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      SUPABASE_SERVICE_ROLE_KEY ?? ''
    );

    const { operation = 'status', params = {} } = await req.json();
    
    const result: any = {
      operation,
      timestamp: new Date().toISOString(),
      status: 'success'
    };

    switch (operation) {
      case 'status':
        // Check autonomous system status
        try {
          const [learningQueries, researchCron, reinforcement] = await Promise.all([
            supabase.from('learning_queries').select('status').eq('status', 'pending').limit(10),
            supabase.from('learning_queries').select('*').eq('priority', 'auto').gte('created_at', new Date(Date.now() - 3600000).toISOString()),
            supabase.from('brain_reinforcement_events').select('*').gte('created_at', new Date(Date.now() - 3600000).toISOString())
          ]);

          result.autonomous = {
            learning: {
              pending_queries: learningQueries.data?.length || 0,
              status: learningQueries.error ? 'error' : 'ok'
            },
            research: {
              recent_auto_queries: researchCron.data?.length || 0,
              status: researchCron.error ? 'error' : 'ok'
            },
            reinforcement: {
              recent_events: reinforcement.data?.length || 0,
              status: reinforcement.error ? 'error' : 'ok'
            }
          };
        } catch (e) {
          result.status = 'error';
          result.message = e instanceof Error ? e.message : 'Unknown error';
        }
        break;

      case 'trigger_learning':
        // Manually trigger learning cycle
        try {
          const { topic = 'make PromptFluid profitable' } = params;
          
          const { data, error } = await supabase
            .from('learning_queries')
            .insert({
              topic,
              priority: 'auto',
              status: 'pending',
              metadata: { triggered_by: 'autonomous_system', manual: true }
            })
            .select();

          if (error) throw error;
          result.learning_query = data[0];
        } catch (e) {
          result.status = 'error';
          result.message = e instanceof Error ? e.message : 'Unknown error';
        }
        break;

      case 'trigger_reinforcement':
        // Process pending reinforcement
        try {
          const lookbackHours = params.lookbackHours || 1;
          const cutoffTime = new Date(Date.now() - lookbackHours * 3600000);

          const { data: events, error } = await supabase
            .from('brain_reinforcement_events')
            .select('*')
            .gte('created_at', cutoffTime.toISOString())
            .gte('outcome_score', params.minOutcomeScore || 0.5);

          if (error) throw error;

          let reinforced = 0;
          for (const event of events || []) {
            try {
              const delta = event.outcome_score * 0.1;
              await supabase.rpc('increment_reinforcement_score', {
                mid: event.memory_id,
                delta
              });
              reinforced++;
            } catch (e) {
              console.error('Reinforcement error for', event.memory_id, e);
            }
          }

          result.reinforcement = {
            processed: events?.length || 0,
            reinforced,
            lookback_hours: lookbackHours
          };
        } catch (e) {
          result.status = 'error';
          result.message = e instanceof Error ? e.message : 'Unknown error';
        }
        break;

      case 'process_research_queue':
        // Process pending research queries
        try {
          const { data: pending, error } = await supabase
            .from('learning_queries')
            .select('*')
            .eq('status', 'pending')
            .eq('priority', 'auto')
            .order('created_at', { ascending: true })
            .limit(params.limit || 5);

          if (error) throw error;

          const processed = [];
          for (const query of pending || []) {
            try {
              // Mark as processing
              await supabase
                .from('learning_queries')
                .update({ status: 'processing' })
                .eq('id', query.id);

              processed.push(query.id);
            } catch (e) {
              console.error('Research queue error for', query.id, e);
            }
          }

          result.research = {
            total_pending: pending?.length || 0,
            processed: processed.length,
            query_ids: processed
          };
        } catch (e) {
          result.status = 'error';
          result.message = e instanceof Error ? e.message : 'Unknown error';
        }
        break;

      default:
        result.status = 'error';
        result.message = `Unknown operation: ${operation}`;
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Brain autonomous error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      status: 'failed'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
