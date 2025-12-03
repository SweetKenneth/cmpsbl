import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

// Schema for monitoring (optional override params)
const MonitorSchema = z.object({
  time_window_hours: z.number().min(0.5).max(24).optional(),
  alert_threshold: z.number().min(0).max(1).optional()
}).optional();

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DetectionAlert {
  success_rate: number;
  total_events: number;
  failed_events: number;
  time_window: string;
  action_breakdown: Record<string, number>;
  severity: 'low' | 'medium' | 'high' | 'critical';
  recommendations: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate input (cron jobs may have optional override params)
    const body = req.method === 'POST' ? await req.json().catch(() => ({})) : {};
    const validatedData = MonitorSchema.parse(body);
    const timeWindowHours = validatedData?.time_window_hours || 1;
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('📊 [MONITOR] Starting detection rate analysis...');

    // Analyze configurable time window
    const timeWindowMs = timeWindowHours * 3600000;
    const timeWindowAgo = new Date(Date.now() - timeWindowMs).toISOString();
    
    const { data: events, error } = await supabase
      .from('defense_events')
      .select('action, risk_score, created_at')
      .gte('created_at', timeWindowAgo)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch events: ${error.message}`);

    if (!events || events.length === 0) {
      console.log(`ℹ️ [MONITOR] No events in the last ${timeWindowHours} hour(s)`);
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `No activity in the last ${timeWindowHours} hour(s)`,
          alert_triggered: false
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate metrics
    const totalEvents = events.length;
    const allowedEvents = events.filter(e => e.action === 'allow').length;
    const blockedEvents = events.filter(e => e.action === 'block').length;
    const challengedEvents = events.filter(e => e.action === 'challenge').length;
    const successRate = allowedEvents / totalEvents;

    // Action breakdown
    const actionBreakdown: Record<string, number> = {
      allow: allowedEvents / totalEvents,
      block: blockedEvents / totalEvents,
      challenge: challengedEvents / totalEvents
    };

    console.log(`📈 [MONITOR] Success Rate: ${(successRate * 100).toFixed(2)}%`);
    console.log(`📊 [MONITOR] Total Events: ${totalEvents}`);

    // Determine severity
    let severity: 'low' | 'medium' | 'high' | 'critical';
    let recommendations: string[] = [];
    let alertTriggered = false;

    const blockRate = blockedEvents / totalEvents;

    if (blockRate > 0.30) {
      // Critical: Over 30% blocked
      severity = 'critical';
      alertTriggered = true;
      recommendations = [
        'URGENT: Review blocking rules - may be too aggressive',
        'Check for false positives',
        'Review recent rule changes',
        'Consider adjusting risk thresholds'
      ];
      console.error('🚨 [MONITOR] CRITICAL: Block rate over 30%!');
    } else if (blockRate > 0.20) {
      severity = 'high';
      alertTriggered = true;
      recommendations = [
        'High block rate detected',
        'Review bot detection patterns',
        'Verify legitimate traffic not being blocked'
      ];
      console.warn('⚠️ [MONITOR] HIGH: Block rate over 20%');
    } else if (blockRate > 0.10) {
      severity = 'medium';
      alertTriggered = true;
      recommendations = [
        'Monitor for continued increase',
        'Review recent threat patterns'
      ];
      console.log('🟡 [MONITOR] MEDIUM: Block rate over 10%');
    } else {
      severity = 'low';
      recommendations = ['System operating normally'];
      console.log('✅ [MONITOR] System operating normally');
    }

    const alert: DetectionAlert = {
      success_rate: successRate,
      total_events: totalEvents,
      failed_events: blockedEvents,
      time_window: `${timeWindowHours} hour(s)`,
      action_breakdown: actionBreakdown,
      severity,
      recommendations
    };

    // Log alert if triggered
    if (alertTriggered) {
      await supabase.from('learning_logs').insert({
        event_type: 'detection_monitor_alert',
        project_id: 'defense_system',
        payload: alert,
        success: true
      });

      if (severity === 'critical') {
        console.error('🚨 [MONITOR] CRITICAL ALERT - Manual intervention required');
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        alert_triggered: alertTriggered,
        alert,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error('❌ [MONITOR] Error:', err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});