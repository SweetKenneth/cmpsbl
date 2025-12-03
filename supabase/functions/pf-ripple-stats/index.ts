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

    console.log('📊 Fetching Ripple statistics');

    const { data: jobs, error } = await supabaseClient
      .from('learning_logs')
      .select('*')
      .like('event_type', 'ripple_%')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;

    const stats = {
      total_jobs: jobs?.length || 0,
      by_status: jobs?.reduce((acc, job) => {
        const status = job.payload?.status || 'unknown';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {},
      by_type: jobs?.reduce((acc, job) => {
        const type = job.event_type.replace('ripple_', '');
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {},
      recent_jobs: jobs?.slice(0, 10).map(job => ({
        id: job.id,
        type: job.event_type.replace('ripple_', ''),
        status: job.payload?.status,
        created_at: job.created_at,
      })) || [],
    };

    return new Response(
      JSON.stringify({ success: true, stats }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Ripple stats error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
