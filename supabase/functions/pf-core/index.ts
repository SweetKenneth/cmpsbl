import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, data } = await req.json();

    console.log(`⚙️ Core function: ${action}`);

    switch (action) {
      case 'get_config': {
        const config = {
          version: '1.0.0',
          environment: 'production',
          features: {
            brain: true,
            defense: true,
            marketing: true,
            access: true,
            nexus: true,
            ripple: true,
          },
          limits: {
            max_api_calls_per_day: 10000,
            max_memory_size_mb: 100,
          }
        };

        return new Response(
          JSON.stringify({ success: true, config }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'log_event': {
        const { event_type, project_id, payload } = data;
        
        const { error } = await supabaseClient
          .from('learning_logs')
          .insert({
            event_type,
            project_id: project_id || 'system',
            payload: payload || {},
            success: true,
          });

        if (error) throw error;

        return new Response(
          JSON.stringify({ success: true, message: 'Event logged' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'get_stats': {
        const { data: memoryCount } = await supabaseClient
          .from('brain_memories')
          .select('id', { count: 'exact', head: true });

        const { data: learningCount } = await supabaseClient
          .from('learning_logs')
          .select('id', { count: 'exact', head: true });

        const { data: defenseCount } = await supabaseClient
          .from('defense_analytics')
          .select('id', { count: 'exact', head: true });

        const stats = {
          total_memories: memoryCount?.count || 0,
          total_learning_events: learningCount?.count || 0,
          total_defense_events: defenseCount?.count || 0,
          timestamp: new Date().toISOString(),
        };

        return new Response(
          JSON.stringify({ success: true, stats }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

  } catch (error) {
    console.error('❌ Core error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
