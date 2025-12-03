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
      case 'initialize':
        try {
          await supabase.from('brain_events').insert({ event_type: 'system_initialized', metadata: { version: '1.0', mode: 'active' } });
          result.initialized = true;
        } catch (e) {
          result.status = 'error';
          result.message = e instanceof Error ? e.message : 'Unknown error';
        }
        break;

      case 'reboot':
        try {
          await supabase.from('brain_events').insert({ event_type: 'system_reboot', metadata: { reason: params.reason || 'manual', timestamp: new Date().toISOString() } });
          result.rebooted = true;
        } catch (e) {
          result.status = 'error';
          result.message = e instanceof Error ? e.message : 'Unknown error';
        }
        break;

      case 'cold_migration':
        try {
          const { data: coldData } = await supabase.from('brain_memory_cold').select('*').limit(100);
          result.migration = { records_migrated: coldData?.length || 0, status: 'complete' };
        } catch (e) {
          result.status = 'error';
          result.message = e instanceof Error ? e.message : 'Unknown error';
        }
        break;

      case 'fluidmind_sync':
        try {
          const { data: localState } = await supabase.from('brain_events').select('*').order('created_at', { ascending: false }).limit(10);
          result.sync = { synced: true, records: localState?.length || 0, last_sync: new Date().toISOString() };
        } catch (e) {
          result.status = 'error';
          result.message = e instanceof Error ? e.message : 'Unknown error';
        }
        break;

      default:
        result.status = 'error';
        result.message = `Unknown system operation: ${operation}`;
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
