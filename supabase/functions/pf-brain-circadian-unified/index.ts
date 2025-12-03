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

    const { operation, params = {} } = await req.json();
    const result: any = { operation, timestamp: new Date().toISOString(), status: 'success' };

    switch (operation) {
      case 'schedule':
        try {
          const hour = new Date().getHours();
          const phase = hour >= 22 || hour < 6 ? 'sleep' : hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
          
          const { data } = await supabase.from('brain_circadian_schedule').insert({
            phase,
            scheduled_at: new Date().toISOString(),
            metadata: params
          }).select();
          
          result.schedule = data?.[0];
        } catch (e) {
          result.status = 'error';
          result.message = e instanceof Error ? e.message : 'Unknown error';
        }
        break;

      case 'phase_analyze':
        try {
          const { data: recentActivity } = await supabase.from('learning_queries').select('created_at, status').gte('created_at', new Date(Date.now() - 24 * 3600000).toISOString());
          
          const hourlyActivity = new Array(24).fill(0);
          recentActivity?.forEach((a: { created_at: string }) => {
            const hour = new Date(a.created_at).getHours();
            hourlyActivity[hour]++;
          });
          
          result.phase_analysis = {
            hourly_distribution: hourlyActivity,
            peak_hour: hourlyActivity.indexOf(Math.max(...hourlyActivity)),
            total_activity: recentActivity?.length || 0
          };
        } catch (e) {
          result.status = 'error';
          result.message = e instanceof Error ? e.message : 'Unknown error';
        }
        break;

      case 'rest_mode':
        try {
          const { data } = await supabase.from('brain_rest_mode').insert({
            started_at: new Date().toISOString(),
            duration_minutes: params.duration || 60,
            reason: params.reason || 'scheduled'
          }).select();
          
          result.rest_mode = data?.[0];
        } catch (e) {
          result.status = 'error';
          result.message = e instanceof Error ? e.message : 'Unknown error';
        }
        break;

      case 'orchestrate':
        try {
          const hour = new Date().getHours();
          const actions: string[] = [];
          
          if (hour >= 22 || hour < 6) {
            actions.push('initiate_dream_mode', 'pause_active_learning');
          } else if (hour >= 6 && hour < 9) {
            actions.push('morning_reflection', 'priority_queue_processing');
          }
          
          result.orchestration = { current_phase: hour >= 22 || hour < 6 ? 'rest' : 'active', actions };
        } catch (e) {
          result.status = 'error';
          result.message = e instanceof Error ? e.message : 'Unknown error';
        }
        break;

      default:
        result.status = 'error';
        result.message = `Unknown circadian operation: ${operation}`;
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
