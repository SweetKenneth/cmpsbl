/**
 * Brain Ecosystem Monitor
 * Monitors all brain subsystems and provides health dashboard
 * Triggers auto-heal when issues detected
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SystemHealth {
  name: string;
  status: 'healthy' | 'degraded' | 'critical';
  score: number;
  details: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    console.log('📊 Brain Ecosystem Monitor scanning...');

    const systems: SystemHealth[] = [];
    let overallHealth = 1.0;

    // 1. Check Orchestrator
    const { data: orchestrator } = await supabase
      .from('brain_orchestrator_state')
      .select('*')
      .eq('id', '00000000-0000-0000-0000-000000000001')
      .single();

    if (orchestrator) {
      const orchestratorHealth = orchestrator.health_score || 0.5;
      systems.push({
        name: 'Orchestrator',
        status: orchestratorHealth > 0.7 ? 'healthy' : orchestratorHealth > 0.3 ? 'degraded' : 'critical',
        score: orchestratorHealth,
        details: `Phase: ${orchestrator.current_phase}, Cycles: ${orchestrator.cycles_completed || 0}`
      });
      overallHealth *= orchestratorHealth;
    } else {
      systems.push({ name: 'Orchestrator', status: 'critical', score: 0, details: 'Not initialized' });
      overallHealth *= 0.3;
    }

    // 2. Check Hot Memory
    const { count: hotCount } = await supabase
      .from('brain_memory_hot')
      .select('id', { count: 'exact', head: true });

    const hotHealth = Math.min(1.0, (hotCount || 0) / 10);
    systems.push({
      name: 'Hot Memory',
      status: hotHealth > 0.3 ? 'healthy' : 'degraded',
      score: hotHealth,
      details: `${hotCount || 0} active memories`
    });

    // 3. Check Cold Memory
    const { count: coldCount } = await supabase
      .from('brain_memory_cold')
      .select('id', { count: 'exact', head: true });

    systems.push({
      name: 'Cold Memory',
      status: 'healthy',
      score: 1.0,
      details: `${coldCount || 0} archived memories`
    });

    // 4. Check Learning Pipeline
    const { count: pendingQueries } = await supabase
      .from('learning_queries')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'queued');

    const { count: completedToday } = await supabase
      .from('learning_results')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', new Date().toISOString().split('T')[0]);

    systems.push({
      name: 'Learning Pipeline',
      status: 'healthy',
      score: Math.min(1.0, ((completedToday || 0) + 1) / 5),
      details: `${pendingQueries || 0} pending, ${completedToday || 0} completed today`
    });

    // 5. Check AI Quotas
    const today = new Date().toISOString().split('T')[0];
    const { data: quotas } = await supabase
      .from('ai_daily_quota')
      .select('provider, calls_used, calls_budget')
      .eq('date', today);

    const groqQuota = quotas?.find(q => q.provider === 'groq');
    const quotaHealth = groqQuota ? 1 - ((groqQuota.calls_used || 0) / (groqQuota.calls_budget || 14400)) : 1.0;
    
    systems.push({
      name: 'AI Quotas (Groq)',
      status: quotaHealth > 0.5 ? 'healthy' : quotaHealth > 0.1 ? 'degraded' : 'critical',
      score: quotaHealth,
      details: groqQuota ? `${groqQuota.calls_used}/${groqQuota.calls_budget} used` : 'Not initialized'
    });

    // 6. Check Anomalies
    const { count: unresolvedAnomalies } = await supabase
      .from('pf_brain_anomalies')
      .select('id', { count: 'exact', head: true })
      .eq('resolved', false);

    const anomalyHealth = Math.max(0.3, 1 - ((unresolvedAnomalies || 0) * 0.1));
    systems.push({
      name: 'Anomaly Status',
      status: (unresolvedAnomalies || 0) === 0 ? 'healthy' : (unresolvedAnomalies || 0) < 5 ? 'degraded' : 'critical',
      score: anomalyHealth,
      details: `${unresolvedAnomalies || 0} unresolved`
    });

    // 7. Check Dreams
    const { count: recentDreams } = await supabase
      .from('cascade_dreams')
      .select('id', { count: 'exact', head: true })
      .gte('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    systems.push({
      name: 'Dream System',
      status: 'healthy',
      score: 1.0,
      details: `${recentDreams || 0} dreams in last 24h`
    });

    // Calculate overall health
    const avgHealth = systems.reduce((sum, s) => sum + s.score, 0) / systems.length;
    const overallStatus = avgHealth > 0.7 ? 'healthy' : avgHealth > 0.4 ? 'degraded' : 'critical';

    // Log the monitoring event
    await supabase.from('brain_events').insert({
      event_type: 'ecosystem_monitor',
      module: 'pf-brain-monitor',
      outcome: overallStatus,
      data: { overall_health: avgHealth, systems }
    });

    // If critical, trigger auto-heal
    if (overallStatus === 'critical') {
      console.log('⚠️ Critical health detected, triggering auto-heal...');
      fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/pf-brain-auto-heal`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
          'Content-Type': 'application/json'
        },
        body: '{}'
      }).catch(console.error);
    }

    console.log(`✅ Monitor complete. Overall: ${overallStatus} (${(avgHealth * 100).toFixed(1)}%)`);

    return new Response(
      JSON.stringify({
        success: true,
        overall_status: overallStatus,
        overall_health: avgHealth,
        systems,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Monitor error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
