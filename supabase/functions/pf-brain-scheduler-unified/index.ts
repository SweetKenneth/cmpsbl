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

    const { operation, params = {} } = await req.json();
    const result: any = { operation, timestamp: new Date().toISOString(), status: 'success' };

    switch (operation) {
      case 'master_schedule':
        try {
          const tasks = [
            { name: 'memory_consolidation', priority: 'high', scheduled: new Date(Date.now() + 3600000).toISOString() },
            { name: 'pattern_analysis', priority: 'medium', scheduled: new Date(Date.now() + 7200000).toISOString() },
            { name: 'dream_generation', priority: 'low', scheduled: new Date(Date.now() + 86400000).toISOString() }
          ];
          result.schedule = tasks;
        } catch (e) {
          result.status = 'error';
          result.message = e instanceof Error ? e.message : 'Unknown error';
        }
        break;

      case 'autonomous_schedule':
        try {
          const { data: pendingTasks } = await supabase.from('brain_events').select('*').eq('event_type', 'task_pending').limit(10);
          const scheduled = pendingTasks?.map(t => ({ ...t, auto_scheduled: true, priority: 'autonomous' })) || [];
          result.autonomous_tasks = scheduled;
        } catch (e) {
          result.status = 'error';
          result.message = e instanceof Error ? e.message : 'Unknown error';
        }
        break;

      case 'cognitive_cycle':
        try {
          const cycle = {
            phase: 'processing',
            duration_ms: 5000,
            operations: ['sense', 'process', 'reflect', 'act'],
            next_cycle: new Date(Date.now() + 60000).toISOString()
          };
          await supabase.from('brain_events').insert({ event_type: 'cognitive_cycle', metadata: cycle });
          result.cycle = cycle;
        } catch (e) {
          result.status = 'error';
          result.message = e instanceof Error ? e.message : 'Unknown error';
        }
        break;

      case 'orchestrate':
        try {
          const hour = new Date().getHours();
          const phase = hour >= 22 || hour < 6 ? 'rest' : hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
          const actions = phase === 'rest' ? ['dream', 'consolidate'] : ['learn', 'analyze', 'respond'];
          result.orchestration = { phase, actions, priority: phase === 'morning' ? 'high' : 'medium' };
        } catch (e) {
          result.status = 'error';
          result.message = e instanceof Error ? e.message : 'Unknown error';
        }
        break;

      default:
        result.status = 'error';
        result.message = `Unknown scheduler operation: ${operation}`;
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error', status: 'failed' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
