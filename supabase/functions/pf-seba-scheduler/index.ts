/**
 * SEBA Scheduler Edge Function
 * v1.0.0 — 24/7 Autonomous Evolution Cycles
 * 
 * Runs SEBA cycles on a schedule with budget governance.
 * Intended to be triggered by a cron job (e.g., hourly).
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Budget limits
const MAX_CYCLES_PER_DAY = 24;
const MAX_PROPOSALS_PER_DAY = 50;
const NEXUS_BUDGET_THRESHOLD = 0.7; // Stop if Nexus usage > 70%

interface SEBASchedulerResult {
  success: boolean;
  cycle_id?: string;
  phase?: string;
  proposals_generated?: number;
  evolutions_applied?: number;
  skipped_reason?: string;
  budget_status: {
    cycles_today: number;
    proposals_today: number;
    nexus_usage_pct: number;
  };
  timestamp: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration');
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { operation = 'cycle', force = false } = await req.json().catch(() => ({}));
    
    // Check if SEBA is enabled
    const { data: sebaCapability } = await supabase
      .from('atlas_capabilities')
      .select('enabled')
      .eq('key', 'seba.enabled')
      .single();
    
    if (!sebaCapability?.enabled && !force) {
      return createResponse({
        success: false,
        skipped_reason: 'SEBA is disabled in Atlas',
        budget_status: { cycles_today: 0, proposals_today: 0, nexus_usage_pct: 0 },
        timestamp: new Date().toISOString(),
      });
    }
    
    // Check budget
    const today = new Date().toISOString().split('T')[0];
    
    const { data: todayStats } = await supabase
      .from('brain_events')
      .select('id, event_type')
      .eq('module', 'seba')
      .gte('created_at', `${today}T00:00:00Z`)
      .lte('created_at', `${today}T23:59:59Z`);
    
    const cyclesToday = todayStats?.filter(e => e.event_type === 'cycle_complete').length || 0;
    const proposalsToday = todayStats?.filter(e => e.event_type === 'proposal_generated').length || 0;
    
    // Check Nexus budget
    const { data: nexusQuota } = await supabase
      .from('ai_daily_quota')
      .select('calls_used, calls_budget')
      .eq('date', today)
      .eq('provider', 'nexus')
      .single();
    
    const nexusUsagePct = nexusQuota 
      ? (nexusQuota.calls_used || 0) / (nexusQuota.calls_budget || 1000)
      : 0;
    
    const budgetStatus = {
      cycles_today: cyclesToday,
      proposals_today: proposalsToday,
      nexus_usage_pct: Math.round(nexusUsagePct * 100),
    };
    
    // Budget checks
    if (!force) {
      if (cyclesToday >= MAX_CYCLES_PER_DAY) {
        return createResponse({
          success: false,
          skipped_reason: `Daily cycle limit reached (${cyclesToday}/${MAX_CYCLES_PER_DAY})`,
          budget_status: budgetStatus,
          timestamp: new Date().toISOString(),
        });
      }
      
      if (proposalsToday >= MAX_PROPOSALS_PER_DAY) {
        return createResponse({
          success: false,
          skipped_reason: `Daily proposal limit reached (${proposalsToday}/${MAX_PROPOSALS_PER_DAY})`,
          budget_status: budgetStatus,
          timestamp: new Date().toISOString(),
        });
      }
      
      if (nexusUsagePct > NEXUS_BUDGET_THRESHOLD) {
        return createResponse({
          success: false,
          skipped_reason: `Nexus budget threshold exceeded (${Math.round(nexusUsagePct * 100)}% > ${NEXUS_BUDGET_THRESHOLD * 100}%)`,
          budget_status: budgetStatus,
          timestamp: new Date().toISOString(),
        });
      }
    }
    
    // Run SEBA cycle
    const cycleId = crypto.randomUUID();
    
    console.log(`🧠 SEBA Scheduler: Starting cycle ${cycleId.substring(0, 8)}...`);
    
    // Phase 1: Cognitive Analysis
    // Lightweight analysis via brain_events (no RPC dependency)
    let insightCount = 0;
    
    // Check for actionable patterns in recent events
    const { data: recentErrors } = await supabase
      .from('brain_events')
      .select('module, event_type, outcome')
      .eq('outcome', 'error')
      .gte('created_at', new Date(Date.now() - 3600000).toISOString())
      .limit(20);
    
    const { count: memoryCount } = await supabase
      .from('brain_memory_hot')
      .select('id', { count: 'exact', head: true });
    
    if ((recentErrors?.length || 0) > 5) insightCount++;
    if ((memoryCount || 0) > 500) insightCount++;
    
    // Log cycle start
    await supabase.from('brain_events').insert({
      module: 'seba',
      event_type: 'scheduler_cycle_start',
      data: {
        cycle_id: cycleId,
        insights_found: insightCount,
        trigger: 'scheduler',
        budget_status: budgetStatus,
      },
      outcome: 'success',
    });
    
    // Phase 2: Generate proposals if insights found
    let proposalsGenerated = 0;
    let evolutionsApplied = 0;
    
    if (insightCount > 0) {
      // For now, log that proposals would be generated
      // In production, this would invoke the full SEBA pipeline
      proposalsGenerated = Math.min(insightCount, 3);
      
      await supabase.from('brain_events').insert({
        module: 'seba',
        event_type: 'proposal_generated',
        data: {
          cycle_id: cycleId,
          count: proposalsGenerated,
          mode: 'advisory', // Scheduler always runs in advisory mode
        },
        outcome: 'success',
      });
    }
    
    // Phase 3: Log cycle completion
    await supabase.from('brain_events').insert({
      module: 'seba',
      event_type: 'cycle_complete',
      data: {
        cycle_id: cycleId,
        duration_ms: Date.now() - startTime,
        insights_found: insightCount,
        proposals_generated: proposalsGenerated,
        evolutions_applied: evolutionsApplied,
      },
      outcome: 'success',
    });
    
    console.log(`✅ SEBA Scheduler: Cycle ${cycleId.substring(0, 8)} complete. ${proposalsGenerated} proposals.`);
    
    return createResponse({
      success: true,
      cycle_id: cycleId,
      phase: 'complete',
      proposals_generated: proposalsGenerated,
      evolutions_applied: evolutionsApplied,
      budget_status: {
        ...budgetStatus,
        cycles_today: cyclesToday + 1,
        proposals_today: proposalsToday + proposalsGenerated,
      },
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error('SEBA Scheduler error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function createResponse(result: SEBASchedulerResult): Response {
  return new Response(
    JSON.stringify(result),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
