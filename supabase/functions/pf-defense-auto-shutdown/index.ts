import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

// Schema for auto-shutdown monitoring (optional override params)
const ShutdownMonitorSchema = z.object({
  threshold: z.number().int().min(50).max(100).optional(),
  time_window_minutes: z.number().int().min(5).max(120).optional()
}).optional();

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate input (cron jobs may have optional override params)
    const body = req.method === 'POST' ? await req.json().catch(() => ({})) : {};
    const validatedData = ShutdownMonitorSchema.parse(body);
    const shutdownThreshold = validatedData?.threshold || 85;
    const timeWindowMinutes = validatedData?.time_window_minutes || 30;
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('🔍 [AUTO-SHUTDOWN] Checking threat levels...');

    // Check recent high-risk events (configurable time window)
    const timeWindowAgo = new Date(Date.now() - timeWindowMinutes * 60 * 1000).toISOString();

    const { data: recentEvents, error: eventsError } = await supabase
      .from('defense_events')
      .select('risk_score, action')
      .gte('created_at', timeWindowAgo)
      .order('created_at', { ascending: false });

    if (eventsError) throw eventsError;

    if (!recentEvents || recentEvents.length === 0) {
      console.log('✅ [AUTO-SHUTDOWN] No recent activity to monitor');
      return new Response(
        JSON.stringify({ 
          monitored: true, 
          action: 'none',
          message: 'No recent events'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const avgRiskScore = recentEvents.reduce((sum, e) => sum + e.risk_score, 0) / recentEvents.length;
    const maxRiskScore = Math.max(...recentEvents.map(e => e.risk_score));
    const blockedCount = recentEvents.filter(e => e.action === 'block').length;

    console.log(`📊 [AUTO-SHUTDOWN] Avg Risk: ${avgRiskScore.toFixed(1)}, Max: ${maxRiskScore}, Blocked: ${blockedCount}`);

    // Check if emergency shutdown needed
    const shouldShutdown = avgRiskScore >= shutdownThreshold || maxRiskScore >= 95 || blockedCount > recentEvents.length * 0.5;

    if (shouldShutdown) {
      console.error(`🚨 [AUTO-SHUTDOWN] TRIGGERING EMERGENCY SHUTDOWN!`);

      // Log security event
      await supabase.from('defense_events').insert({
        ip: 'system',
        user_agent: 'auto-shutdown-monitor',
        endpoint: '/auto-shutdown',
        risk_score: avgRiskScore,
        action: 'monitor',
        reason: 'Emergency shutdown triggered due to high threat levels',
        metadata: {
          avg_risk_score: avgRiskScore,
          max_risk_score: maxRiskScore,
          blocked_count: blockedCount,
          threshold: shutdownThreshold,
          auto_triggered: true
        }
      });

      return new Response(
        JSON.stringify({ 
          monitored: true,
          action: 'shutdown_triggered',
          avg_risk_score: avgRiskScore,
          max_risk_score: maxRiskScore,
          threshold: shutdownThreshold,
          message: 'Emergency shutdown activated'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ [AUTO-SHUTDOWN] Threat levels within acceptable range');
    return new Response(
      JSON.stringify({ 
        monitored: true,
        action: 'none',
        avg_risk_score: avgRiskScore,
        max_risk_score: maxRiskScore,
        threshold: shutdownThreshold,
        message: 'System operating normally'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ [AUTO-SHUTDOWN] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});