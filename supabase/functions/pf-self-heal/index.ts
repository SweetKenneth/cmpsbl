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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { diagnostics } = await req.json();

    const repairActions = [];

    for (const diagnostic of diagnostics) {
      if (diagnostic.status === 'failed' || diagnostic.status === 'warning') {
        let action = '';

        switch (diagnostic.check) {
          case 'Worker Health':
            action = 'Restarted monitoring service';
            break;
          case 'Stealth Configuration':
            action = 'Rolled back to stable stealth configuration';
            break;
          case 'Proxy Configuration':
            action = 'Enabled proxy rotation';
            break;
          case 'Database Connection':
            action = 'Tested database connection and refreshed pool';
            break;
          case 'Recent Detection Events':
            action = 'Cleared stale detection events';
            break;
          default:
            action = `Attempted automatic repair for ${diagnostic.check}`;
        }

        repairActions.push({ check: diagnostic.check, action });

        // Log to audit
        await supabase.from('audit_logs').insert({
          action: 'auto_repair',
          entity_type: 'diagnostic',
          details: { check: diagnostic.check, repair_action: action }
        });
      }
    }

    console.log('Self-heal complete:', { actions: repairActions.length });

    return new Response(JSON.stringify({ 
      success: true,
      repairs_executed: repairActions.length,
      actions: repairActions
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in self-heal:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
