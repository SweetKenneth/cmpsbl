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
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Verifying PromptFluid ecosystem tables...');

    const tablesToCheck = [
      'brain_memory_hot',
      'brain_memory_cold',
      'brain_events',
      'defense_events',
      'ip_reputation',
      'audit_logs',
      'profiles',
      'system_config',
      'ai_daily_quota',
      'ai_usage_log'
    ];

    const results: Record<string, any> = {};

    for (const table of tablesToCheck) {
      try {
        const { data, error, count } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
        
        results[table] = {
          exists: !error,
          count: count || 0,
          error: error?.message || null
        };
      } catch (err) {
        results[table] = {
          exists: false,
          error: err instanceof Error ? err.message : 'Unknown error'
        };
      }
    }

    const allTablesExist = Object.values(results).every((r: any) => r.exists);

    return new Response(JSON.stringify({
      success: allTablesExist,
      tables: results,
      message: allTablesExist 
        ? 'All PromptFluid tables verified successfully' 
        : 'Some tables are missing or inaccessible',
      timestamp: new Date().toISOString(),
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('System verification error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
