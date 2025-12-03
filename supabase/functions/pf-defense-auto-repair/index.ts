import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RepairSchema = z.object({
  diagnostics: z.array(z.object({
    check: z.string().max(200),
    status: z.enum(['pass', 'warning', 'fail']),
    message: z.string().max(500).optional()
  })).max(50)
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔧 Auto-repair initiated');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const body = await req.json();
    const result = RepairSchema.safeParse(body);
    
    if (!result.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid input', details: result.error.errors }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const { diagnostics } = result.data;
    const repairActions: any[] = [];

    // Analyze each diagnostic and attempt repairs
    for (const diagnostic of diagnostics || []) {
      console.log(`Analyzing: ${diagnostic.check} - Status: ${diagnostic.status}`);

      if (diagnostic.status === 'pass') continue;

      switch (diagnostic.check) {
        case 'High Risk Activity':
          if (diagnostic.status === 'warning' || diagnostic.status === 'fail') {
            // Check if rate limiting is active
            const { data: rateLimitConfig } = await supabase
              .from('defense_rules')
              .select('*')
              .eq('rule_type', 'rate_limit')
              .eq('is_active', true)
              .maybeSingle();

            if (!rateLimitConfig) {
              // Enable rate limiting
              await supabase.from('defense_rules').insert({
                rule_type: 'rate_limit',
                name: 'Auto-enabled Rate Limit',
                conditions: { requests_per_minute: 60 },
                action: 'challenge',
                priority: 100,
                is_active: true
              });

              repairActions.push({
                check: 'High Risk Activity',
                action: 'enable_rate_limit',
                status: 'success',
                details: 'Rate limiting enabled automatically'
              });
            }
          }
          break;

        case 'Database Connection':
          if (diagnostic.status === 'fail') {
            // Attempt connection refresh
            try {
              const { error } = await supabase
                .from('defense_events')
                .select('id')
                .limit(1);

              repairActions.push({
                check: 'Database Connection',
                action: 'refresh_connection',
                status: error ? 'failed' : 'success',
                details: error ? 'Connection test failed' : 'Connection restored'
              });
            } catch (error) {
              repairActions.push({
                check: 'Database Connection',
                action: 'refresh_connection',
                status: 'failed',
                details: error instanceof Error ? error.message : 'Unknown error'
              });
            }
          }
          break;

        case 'Detection Accuracy':
          if (diagnostic.status === 'warning') {
            repairActions.push({
              check: 'Detection Accuracy',
              action: 'retrain_recommended',
              status: 'info',
              details: 'Consider retraining Brain with recent patterns'
            });
          }
          break;

        default:
          console.log(`No auto-repair action for: ${diagnostic.check}`);
      }
    }

    // Log repair actions
    if (repairActions.length > 0) {
      await supabase.from('learning_logs').insert({
        event_type: 'auto_repair',
        project_id: 'defense_system',
        payload: {
          diagnostics_summary: diagnostics,
          repair_actions: repairActions,
          timestamp: new Date().toISOString()
        },
        success: true
      });
    }

    console.log(`✅ Auto-repair complete: ${repairActions.length} actions taken`);

    return new Response(
      JSON.stringify({
        success: true,
        repair_actions: repairActions,
        summary: {
          total_actions: repairActions.length,
          successful: repairActions.filter(a => a.status === 'success').length,
          failed: repairActions.filter(a => a.status === 'failed').length,
        },
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Auto-repair error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});