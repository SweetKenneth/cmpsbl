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

    // Check detection threshold from config
    const { data: config } = await supabase
      .from('system_config')
      .select('value')
      .eq('key', 'detection_threshold')
      .single();

    const detectionThreshold = config?.value?.threshold || 85;

    // Check recent sessions
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
    
    const { data: recentSessions } = await supabase
      .from('detection_sessions')
      .select('detection_score')
      .gte('created_at', thirtyMinutesAgo);

    if (!recentSessions || recentSessions.length === 0) {
      return new Response(JSON.stringify({ 
        action: 'none',
        message: 'No recent sessions to analyze'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const avgScore = recentSessions.reduce((sum, s) => sum + s.detection_score, 0) / recentSessions.length;
    const maxScore = Math.max(...recentSessions.map(s => s.detection_score));

    const shouldShutdown = avgScore >= detectionThreshold || maxScore >= 95;

    if (shouldShutdown) {
      // Update system config to enable emergency shutdown
      await supabase.from('system_config').upsert({
        key: 'EMERGENCY_SHUTDOWN',
        value: { enabled: true, triggered_at: new Date().toISOString() }
      });

      // Log security event
      await supabase.from('security_events').insert({
        event_type: 'emergency_shutdown',
        severity: 'critical',
        description: `Emergency shutdown triggered. Avg score: ${avgScore.toFixed(2)}, Max: ${maxScore}`,
        metadata: { avgScore, maxScore, threshold: detectionThreshold }
      });

      console.log('Emergency shutdown triggered:', { avgScore, maxScore });

      return new Response(JSON.stringify({ 
        action: 'shutdown',
        message: 'Emergency shutdown activated',
        details: { avgScore, maxScore, threshold: detectionThreshold }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ 
      action: 'monitor',
      message: 'System within normal parameters',
      details: { avgScore, maxScore, threshold: detectionThreshold }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in emergency shutdown:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
