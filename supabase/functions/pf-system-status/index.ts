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

    console.log('🔍 Running system status check...');

    const checks = await Promise.allSettled([
      supabaseClient.from('brain_memories').select('id', { count: 'exact', head: true }),
      supabaseClient.from('defense_analytics').select('id', { count: 'exact', head: true }),
      supabaseClient.from('learning_logs').select('id', { count: 'exact', head: true }),
      supabaseClient.from('nexus_models').select('status').eq('status', 'active'),
    ]);

    const systemStatus = {
      timestamp: new Date().toISOString(),
      overall_health: checks.every(c => c.status === 'fulfilled') ? 'healthy' : 'degraded',
      components: {
        brain: {
          status: checks[0].status === 'fulfilled' ? 'operational' : 'error',
          memory_count: checks[0].status === 'fulfilled' ? checks[0].value.count : 0,
        },
        defense: {
          status: checks[1].status === 'fulfilled' ? 'operational' : 'error',
          analytics_count: checks[1].status === 'fulfilled' ? checks[1].value.count : 0,
        },
        learning: {
          status: checks[2].status === 'fulfilled' ? 'operational' : 'error',
          log_count: checks[2].status === 'fulfilled' ? checks[2].value.count : 0,
        },
        nexus: {
          status: checks[3].status === 'fulfilled' ? 'operational' : 'error',
          active_models: checks[3].status === 'fulfilled' ? checks[3].value.data?.length : 0,
        },
      },
      environment: {
        supabase_url: Deno.env.get('SUPABASE_URL')?.includes('supabase') ? 'connected' : 'error',
        api_keys: {
          groq: !!Deno.env.get('GROQ_API_KEY'),
          openai: !!Deno.env.get('OPENAI_API_KEY'),
          anthropic: !!Deno.env.get('ANTHROPIC_API_KEY'),
          perplexity: !!Deno.env.get('PERPLEXITY_API_KEY'),
        }
      }
    };

    console.log('✅ System status check complete:', systemStatus.overall_health);

    return new Response(
      JSON.stringify({ success: true, status: systemStatus }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Error in system-status:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
