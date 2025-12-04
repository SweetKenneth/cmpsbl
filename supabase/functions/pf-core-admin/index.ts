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

    console.log(`👑 Core Admin: ${action}`);

    switch (action) {
      case 'get_system_overview': {
        const { count: memoryCount } = await supabaseClient
          .from('brain_memories')
          .select('id', { count: 'exact', head: true });

        const { count: logsCount } = await supabaseClient
          .from('learning_logs')
          .select('id', { count: 'exact', head: true });

        const overview = {
          total_memories: memoryCount || 0,
          total_logs: logsCount || 0,
          system_version: '1.0.0',
          uptime: '100%',
          active_modules: ['brain', 'defense', 'nexus', 'marketing', 'access'],
        };

        return new Response(
          JSON.stringify({ success: true, overview }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'clear_logs': {
        const { older_than_days = 30 } = data;
        const cutoffDate = new Date(Date.now() - older_than_days * 24 * 60 * 60 * 1000);

        const { error } = await supabaseClient
          .from('learning_logs')
          .delete()
          .lt('created_at', cutoffDate.toISOString());

        if (error) throw error;

        return new Response(
          JSON.stringify({ success: true, message: 'Logs cleared' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    console.error('❌ Core admin error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
