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

    const { action, job_id, status } = await req.json();

    console.log(`🌊 Ripple queue: ${action}`);

    switch (action) {
      case 'get_next': {
        const { data: jobs, error } = await supabaseClient
          .from('learning_logs')
          .select('*')
          .like('event_type', 'ripple_%')
          .order('created_at', { ascending: true })
          .limit(1);

        if (error) throw error;

        return new Response(
          JSON.stringify({ success: true, job: jobs?.[0] || null }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'get_status': {
        const { data: job, error } = await supabaseClient
          .from('learning_logs')
          .select('*')
          .eq('id', job_id)
          .single();

        if (error) throw error;

        return new Response(
          JSON.stringify({ 
            success: true, 
            status: job.payload?.status,
            job,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    console.error('❌ Ripple queue error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
