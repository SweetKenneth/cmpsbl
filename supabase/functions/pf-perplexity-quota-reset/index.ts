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

    console.log('Running daily Perplexity quota reset at:', new Date().toISOString());

    // Call reset function
    const { error: resetError } = await supabase.rpc('reset_daily_quotas');

    if (resetError) {
      throw resetError;
    }

    // Queue high-priority learning queries for the day
    const { data: pendingQueries, error: queryError } = await supabase
      .from('learning_queries')
      .select('id, query_text, priority')
      .eq('status', 'pending')
      .eq('metadata->>category', 'learn')
      .order('priority', { ascending: false })
      .limit(50);

    if (queryError) throw queryError;

    console.log(`Found ${pendingQueries?.length || 0} pending learning queries to process`);

    // Log reset event
    await supabase.from('brain_events').insert({
      module: 'perplexity',
      event_type: 'quota_reset',
      data: {
        timestamp: new Date().toISOString(),
        pending_queries: pendingQueries?.length || 0,
        message: 'Daily quota reset completed'
      },
      outcome: 'completed'
    });

    return new Response(JSON.stringify({
      success: true,
      reset_at: new Date().toISOString(),
      pending_queries: pendingQueries?.length || 0,
      message: 'Daily quota reset completed successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Quota reset error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
