import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? ''
  );

  try {
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data } = await supabase.auth.getUser(token);
    const user = data.user;

    if (!user) {
      throw new Error('User not authenticated');
    }

    const { timeRange = '24h' } = await req.json().catch(() => ({ timeRange: '24h' }));

    // Calculate time window
    const now = new Date();
    let since = new Date();
    if (timeRange === '24h') {
      since.setHours(now.getHours() - 24);
    } else if (timeRange === '7d') {
      since.setDate(now.getDate() - 7);
    } else if (timeRange === '30d') {
      since.setDate(now.getDate() - 30);
    }

    // Get request stats
    const { data: requests, error: reqError } = await supabase
      .from('bot_sniper_requests')
      .select('*')
      .eq('user_id', user.id)
      .gte('created_at', since.toISOString());

    if (reqError) throw reqError;

    const totalRequests = requests?.length || 0;
    const botsDetected = requests?.filter(r => r.is_bot).length || 0;
    const avgThreatScore = totalRequests > 0
      ? requests.reduce((sum, r) => sum + r.threat_score, 0) / totalRequests
      : 0;

    // Threat type breakdown
    const threatTypes: Record<string, number> = {};
    requests?.forEach(r => {
      if (r.threat_type) {
        threatTypes[r.threat_type] = (threatTypes[r.threat_type] || 0) + 1;
      }
    });

    // Action breakdown
    const actions = {
      allow: 0,
      challenge: 0,
      block: 0
    };

    requests?.forEach(r => {
      const score = r.threat_score;
      if (score >= 70) actions.block++;
      else if (score >= 40) actions.challenge++;
      else actions.allow++;
    });

    // Get subscription info
    const { data: sub } = await supabase
      .from('bot_sniper_subscriptions')
      .select('requests_used, requests_limit')
      .eq('user_id', user.id)
      .single();

    // Timeline data (last 24 hours by hour)
    const hourlyData = Array(24).fill(0).map((_, i) => {
      const hour = new Date(now);
      hour.setHours(now.getHours() - (23 - i));
      return {
        hour: hour.toISOString(),
        requests: 0,
        bots: 0
      };
    });

    requests?.forEach(r => {
      const reqDate = new Date(r.created_at);
      const hourDiff = Math.floor((now.getTime() - reqDate.getTime()) / (1000 * 60 * 60));
      if (hourDiff >= 0 && hourDiff < 24) {
        const index = 23 - hourDiff;
        hourlyData[index].requests++;
        if (r.is_bot) hourlyData[index].bots++;
      }
    });

    return new Response(JSON.stringify({
      summary: {
        total_requests: totalRequests,
        bots_detected: botsDetected,
        bot_percentage: totalRequests > 0 ? ((botsDetected / totalRequests) * 100).toFixed(1) : '0',
        avg_threat_score: avgThreatScore.toFixed(1),
        requests_used: sub?.requests_used || 0,
        requests_limit: sub?.requests_limit || 0
      },
      threat_types: threatTypes,
      actions: actions,
      timeline: hourlyData,
      time_range: timeRange
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Stats error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
