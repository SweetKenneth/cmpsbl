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
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    console.log('📊 Collecting free-stack usage metrics...');

    const services = ['clarity', 'verify', 'defense', 'studio'];
    const metrics = [];

    for (const service of services) {
      // Get usage from ai_usage_log for each service
      const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString();
      
      const { data: usageData, error } = await supabase
        .from('ai_usage_log')
        .select('id')
        .eq('category', service)
        .gte('created_at', fourHoursAgo);

      if (error) {
        console.error(`Error fetching ${service} usage:`, error);
        continue;
      }

      const calls = usageData?.length || 0;

      // Store metric
      const { error: insertError } = await supabase
        .from('usage_metrics')
        .insert({
          ts: new Date().toISOString(),
          source: service,
          calls,
          provider: 'free-stack',
          metadata: { period: '4h' }
        });

      if (insertError) {
        console.error(`Error storing ${service} metric:`, insertError);
      } else {
        metrics.push({ service, calls });
        console.log(`✅ ${service}: ${calls} calls`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        metrics,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Metrics collection error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
