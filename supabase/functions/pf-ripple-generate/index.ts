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

    const { task_type, input_data, priority = 'normal' } = await req.json();

    console.log(`🌊 Ripple: Queuing ${task_type} task (priority: ${priority})`);

    const { data: job, error } = await supabaseClient
      .from('learning_logs')
      .insert({
        event_type: `ripple_${task_type}`,
        project_id: 'ripple',
        payload: {
          task_type,
          input_data,
          priority,
          status: 'queued',
          queued_at: new Date().toISOString(),
        },
        success: true,
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(
      JSON.stringify({ 
        success: true, 
        job_id: job.id,
        status: 'queued',
        message: 'Task queued for processing',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Ripple generate error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
