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

    const { 
      event_name, 
      event_data = {}, 
      user_id,
      session_id,
      metadata = {} 
    } = await req.json();

    console.log(`📡 Telemetry event: ${event_name}`);

    const { data: log, error } = await supabaseClient
      .from('learning_logs')
      .insert({
        event_type: `telemetry_${event_name}`,
        project_id: user_id || 'anonymous',
        payload: {
          event_name,
          event_data,
          session_id,
          metadata,
          timestamp: new Date().toISOString(),
        },
        success: true,
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(
      JSON.stringify({ 
        success: true, 
        logged: true,
        event_id: log.id,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Error logging telemetry:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
