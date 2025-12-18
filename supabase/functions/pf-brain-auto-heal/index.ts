/**
 * Brain Auto-Heal System
 * Monitors system health and automatically repairs issues
 * Runs on schedule to maintain cognitive stability
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface HealResult {
  component: string;
  issue: string;
  action: string;
  success: boolean;
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
    console.log('🔧 Brain Auto-Heal System activated...');
    
    const healResults: HealResult[] = [];

    // 1. Check and heal orchestrator state
    const { data: orchestratorState } = await supabase
      .from('brain_orchestrator_state')
      .select('*')
      .eq('id', '00000000-0000-0000-0000-000000000001')
      .single();

    if (!orchestratorState) {
      // Recreate orchestrator if missing
      await supabase.from('brain_orchestrator_state').insert({
        id: '00000000-0000-0000-0000-000000000001',
        status: 'running',
        current_phase: 'consumption',
        health_score: 1.0,
        cycles_completed: 0,
        metadata: { healed_at: new Date().toISOString(), reason: 'missing_state' }
      });
      healResults.push({
        component: 'orchestrator',
        issue: 'missing_state',
        action: 'recreated',
        success: true
      });
    } else if (orchestratorState.status === 'error' || orchestratorState.health_score < 0.3) {
      // Heal degraded orchestrator
      await supabase.from('brain_orchestrator_state').update({
        status: 'running',
        health_score: 0.7,
        current_phase: 'consumption',
        metadata: {
          ...orchestratorState.metadata,
          healed_at: new Date().toISOString(),
          previous_health: orchestratorState.health_score
        }
      }).eq('id', '00000000-0000-0000-0000-000000000001');
      
      healResults.push({
        component: 'orchestrator',
        issue: 'degraded_health',
        action: 'reset_to_healthy',
        success: true
      });
    }

    // 2. Check and heal stuck learning queries
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { data: stuckQueries } = await supabase
      .from('learning_queries')
      .select('id')
      .eq('status', 'processing')
      .lt('created_at', oneHourAgo);

    if (stuckQueries && stuckQueries.length > 0) {
      await supabase
        .from('learning_queries')
        .update({ status: 'queued', metadata: { requeued_at: new Date().toISOString() } })
        .eq('status', 'processing')
        .lt('created_at', oneHourAgo);
      
      healResults.push({
        component: 'learning_queries',
        issue: `${stuckQueries.length} stuck queries`,
        action: 'requeued',
        success: true
      });
    }

    // 3. Check and resolve unresolved anomalies older than 24h
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: oldAnomalies } = await supabase
      .from('pf_brain_anomalies')
      .select('id')
      .eq('resolved', false)
      .lt('created_at', oneDayAgo);

    if (oldAnomalies && oldAnomalies.length > 0) {
      await supabase
        .from('pf_brain_anomalies')
        .update({ resolved: true, metadata: { auto_resolved: true, resolved_at: new Date().toISOString() } })
        .eq('resolved', false)
        .lt('created_at', oneDayAgo);
      
      healResults.push({
        component: 'anomalies',
        issue: `${oldAnomalies.length} stale anomalies`,
        action: 'auto_resolved',
        success: true
      });
    }

    // 4. Cleanup old hot memories (90+ days) to cold storage
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
    const { data: oldHotMemories } = await supabase
      .from('brain_memory_hot')
      .select('*')
      .lt('created_at', ninetyDaysAgo)
      .limit(50);

    if (oldHotMemories && oldHotMemories.length > 0) {
      // Move to cold storage
      for (const mem of oldHotMemories) {
        await supabase.from('brain_memory_cold').insert({
          summary: mem.content,
          core_summary: mem.context || 'Archived hot memory',
          compression_level: 1,
          tags: mem.tags || [],
          source_refs: [mem.id]
        });
      }
      
      // Delete from hot
      await supabase.from('brain_memory_hot')
        .delete()
        .lt('created_at', ninetyDaysAgo)
        .limit(50);
      
      healResults.push({
        component: 'memory_migration',
        issue: `${oldHotMemories.length} old hot memories`,
        action: 'migrated_to_cold',
        success: true
      });
    }

    // 5. Verify AI quota health
    const today = new Date().toISOString().split('T')[0];
    const { data: quotas } = await supabase
      .from('ai_daily_quota')
      .select('*')
      .eq('date', today);

    if (!quotas || quotas.length === 0) {
      // Reset quotas for today
      const providers = [
        { provider: 'groq', calls_budget: 14400 },
        { provider: 'cerebras', calls_budget: 14400 },
        { provider: 'together', calls_budget: 14400 },
        { provider: 'hyperbolic', calls_budget: 86400 },
        { provider: 'deepseek', calls_budget: 5000 },
        { provider: 'google', calls_budget: 50 }
      ];
      
      for (const p of providers) {
        await supabase.from('ai_daily_quota').upsert({
          provider: p.provider,
          date: today,
          calls_budget: p.calls_budget,
          calls_used: 0,
          tokens_used: 0
        }, { onConflict: 'provider,date' });
      }
      
      healResults.push({
        component: 'ai_quotas',
        issue: 'missing_daily_quotas',
        action: 'initialized',
        success: true
      });
    }

    // 6. Health boost for successful heal cycle
    if (healResults.length > 0 && orchestratorState) {
      const newHealth = Math.min(1.0, (orchestratorState.health_score || 0.5) + 0.1);
      await supabase.from('brain_orchestrator_state').update({
        health_score: newHealth,
        auto_heal_attempts: (orchestratorState.auto_heal_attempts || 0) + 1,
        updated_at: new Date().toISOString()
      }).eq('id', '00000000-0000-0000-0000-000000000001');
    }

    // Log the heal event
    await supabase.from('brain_events').insert({
      event_type: 'auto_heal_cycle',
      module: 'pf-brain-auto-heal',
      outcome: 'success',
      data: { 
        heals_performed: healResults.length,
        results: healResults
      }
    });

    console.log(`✅ Auto-heal complete. ${healResults.length} issues addressed.`);

    return new Response(
      JSON.stringify({
        success: true,
        heals_performed: healResults.length,
        results: healResults,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Auto-heal error:', error);
    
    // Even on error, try to log
    try {
      await supabase.from('brain_events').insert({
        event_type: 'auto_heal_failed',
        module: 'pf-brain-auto-heal',
        outcome: 'failure',
        data: { error: error instanceof Error ? error.message : 'Unknown' }
      });
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }

    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
