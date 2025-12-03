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

    const { event_type, project_id, payload, success = true, error_message } = await req.json();

    console.log(`📊 Logging learning event: ${event_type}`);

    const { data: log, error } = await supabaseClient
      .from('learning_logs')
      .insert({
        event_type,
        project_id: project_id || 'unknown',
        payload: payload || {},
        success,
        error_message,
      })
      .select()
      .single();

    if (error) throw error;

    console.log('✅ Learning event logged:', log.id);

    return new Response(
      JSON.stringify({ success: true, log }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Error logging learning event:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
