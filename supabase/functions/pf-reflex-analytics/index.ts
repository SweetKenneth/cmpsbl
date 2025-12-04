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

    const { action, site_url } = await req.json();

    if (action === 'get_stats') {
      // Get 24h stats from defense_events
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      const { data: events, error } = await supabaseClient
        .from('defense_events')
        .select('*')
        .gte('detected_at', yesterday.toISOString())
        .order('detected_at', { ascending: false });

      if (error) throw error;

      const blocked = events?.filter(e => e.action === 'block').length || 0;
      const challenged = events?.filter(e => e.action === 'challenge').length || 0;
      const total = events?.length || 0;

      const recentEvents = events?.slice(0, 10).map(e => ({
        timestamp: e.detected_at,
        action: e.action,
        ip_address: e.ip || 'unknown',
        reason: e.reason || 'security check',
        risk_score: e.risk_score || 0
      })) || [];

      return new Response(
        JSON.stringify({
          threats_blocked_24h: blocked,
          bot_detection_accuracy: total > 0 ? Math.round((blocked / total) * 100) : 0,
          active_protection_modules: 5,
          avg_response_time: 120,
          recent_events: recentEvents,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});