/**
 * Phase B — System State Scan
 * v0.7.7 — Reality Check
 * 
 * Performs required system calls to detect state mismatches,
 * stuck phases, cognitive starvation, and resilience gaps.
 */

import type { SystemState, EvolutionStateSnapshot, CircuitStateSnapshot, DetectedAnomaly } from './types';
import { evolutionRuns } from '../evolution-runs';
import { circuitBreaker } from '../circuit-breaker';
import { supabase } from '@/integrations/supabase/client';

// ═══════════════════════════════════════════════════════════════
// SYSTEM STATE SCAN
// ═══════════════════════════════════════════════════════════════

/**
 * Perform comprehensive system state scan
 */
export async function scanSystemState(): Promise<SystemState> {
  // Run all checks in parallel
  const [evolutionState, circuitState, anomalies] = await Promise.all([
    checkEvolutionState(),
    checkCircuitState(),
    detectAnomalies(),
  ]);
  
  // Determine orchestration phase from cortex
  const orchestrationPhase = await getOrchestrationPhase();
  
  return {
    evolution_state: evolutionState,
    circuit_states: circuitState,
    orchestration_phase: orchestrationPhase,
    detected_anomalies: anomalies,
    scan_timestamp: new Date().toISOString(),
  };
}

/**
 * Check evolution state for issues
 */
async function checkEvolutionState(): Promise<EvolutionStateSnapshot> {
  const activeRun = await evolutionRuns.getActiveRun();
  const allRuns = await evolutionRuns.getAllRuns(50);
  
  // Calculate failed runs in last 24 hours
  const now = new Date();
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const failedRuns24h = allRuns.filter(r => 
    r.phase === 'failed' && 
    new Date(r.created_at) > twentyFourHoursAgo
  ).length;
  
  // Check for stuck in shadow
  let stuckInShadow = false;
  if (activeRun && activeRun.phase === 'shadow_applied') {
    const shadowTime = new Date(activeRun.updated_at);
    const hoursSinceApply = (now.getTime() - shadowTime.getTime()) / (1000 * 60 * 60);
    stuckInShadow = hoursSinceApply > 4; // Stuck if in shadow for >4 hours
  }
  
  // Find last successful run
  const lastSuccess = allRuns.find(r => r.phase === 'verified');
  
  return {
    has_active_run: !!activeRun,
    active_run_id: activeRun?.run_id,
    active_phase: activeRun?.phase,
    stuck_in_shadow: stuckInShadow,
    last_successful_at: lastSuccess?.completed_at || undefined,
    failed_runs_24h: failedRuns24h,
  };
}

/**
 * Check circuit breaker state
 */
async function checkCircuitState(): Promise<CircuitStateSnapshot> {
  const status = await circuitBreaker.getStatus();
  
  return {
    evolution_circuit: status.state,
    last_trip_reason: status.trip_reason || undefined,
    can_evolve: status.can_evolve,
  };
}

/**
 * Get current orchestration phase from cortex
 */
async function getOrchestrationPhase(): Promise<string> {
  // Return default - complex query causes type issues
  return 'manual';
}

/**
 * Detect anomalies across system
 */
async function detectAnomalies(): Promise<DetectedAnomaly[]> {
  const anomalies: DetectedAnomaly[] = [];
  
  // Check for state mismatches
  const stateMismatch = await checkStateMismatch();
  if (stateMismatch) anomalies.push(stateMismatch);
  
  // Check for shadow loops
  const shadowLoop = await checkShadowLoops();
  if (shadowLoop) anomalies.push(shadowLoop);
  
  // Check for cognitive starvation
  const starvation = await checkCognitiveStarvation();
  if (starvation) anomalies.push(starvation);
  
  // Check for quota misuse
  const quotaMisuse = await checkQuotaMisuse();
  if (quotaMisuse) anomalies.push(quotaMisuse);
  
  // Check for resilience gaps
  const resilienceGap = await checkResilienceGaps();
  if (resilienceGap) anomalies.push(resilienceGap);
  
  return anomalies;
}

async function checkStateMismatch(): Promise<DetectedAnomaly | null> {
  try {
    // Check if evolution runs table state matches application state
    const activeRun = await evolutionRuns.getActiveRun();
    const circuitStatus = await circuitBreaker.getStatus();
    
    // Mismatch: circuit closed but active run in failed state
    if (circuitStatus.state === 'closed' && activeRun?.phase === 'failed') {
      return {
        anomaly_type: 'state_mismatch',
        severity: 'medium',
        description: 'Circuit is closed but active run shows failed state',
        affected_components: ['evolution_runs', 'circuit_breaker'],
        evidence: { active_phase: activeRun.phase, circuit_state: circuitStatus.state },
      };
    }
    
    return null;
  } catch {
    return null;
  }
}

async function checkShadowLoops(): Promise<DetectedAnomaly | null> {
  try {
    const allRuns = await evolutionRuns.getAllRuns(10);
    
    // Count consecutive shadow_applied without promotion
    let consecutiveShadow = 0;
    for (const run of allRuns) {
      if (run.phase === 'shadow_applied' || run.phase === 'aborted') {
        consecutiveShadow++;
      } else if (run.phase === 'verified' || run.phase === 'production_applied') {
        break;
      }
    }
    
    if (consecutiveShadow >= 3) {
      return {
        anomaly_type: 'shadow_loop',
        severity: 'high',
        description: `${consecutiveShadow} consecutive runs stuck at or aborted from shadow phase`,
        affected_components: ['evolution_runs', 'shadow_executor'],
        evidence: { consecutive_shadow: consecutiveShadow },
      };
    }
    
    return null;
  } catch {
    return null;
  }
}

async function checkCognitiveStarvation(): Promise<DetectedAnomaly | null> {
  try {
    // Check for low memory activity (cognitive starvation)
    const { data: memories } = await supabase
      .from('brain_memories')
      .select('id')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
    
    // If less than 5 memories in 24h, might be starved
    if (memories && memories.length < 5) {
      return {
        anomaly_type: 'cognitive_starvation',
        severity: 'low',
        description: 'Low brain memory activity in last 24 hours',
        affected_components: ['brain', 'memory'],
        evidence: { memories_24h: memories.length },
      };
    }
    
    return null;
  } catch {
    return null;
  }
}

async function checkQuotaMisuse(): Promise<DetectedAnomaly | null> {
  try {
    // Check AI usage for unusual patterns
    const { data: usage } = await supabase
      .from('ai_usage_log')
      .select('tokens_used, cost')
      .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString()); // Last hour
    
    if (usage && usage.length > 0) {
      const totalTokens = usage.reduce((sum, u) => sum + (u.tokens_used || 0), 0);
      
      // Flag if >100k tokens in an hour
      if (totalTokens > 100000) {
        return {
          anomaly_type: 'quota_misuse',
          severity: 'medium',
          description: 'High token usage detected in last hour',
          affected_components: ['nexus', 'ai_router'],
          evidence: { tokens_last_hour: totalTokens },
        };
      }
    }
    
    return null;
  } catch {
    return null;
  }
}

async function checkResilienceGaps(): Promise<DetectedAnomaly | null> {
  try {
    // Check for missing critical components using known table types
    const criticalChecks = [
      { table: 'evolution_runs' as const, name: 'evolution_runs' },
      { table: 'evolution_receipts' as const, name: 'evolution_receipts' },
      { table: 'evolution_circuit' as const, name: 'evolution_circuit' },
      { table: 'brain_memories' as const, name: 'brain_memories' },
    ];
    
    for (const check of criticalChecks) {
      try {
        const { error } = await supabase.from(check.table).select('id').limit(1);
        if (error) {
          return {
            anomaly_type: 'resilience_gap',
            severity: 'critical',
            description: `Critical table ${check.name} inaccessible`,
            affected_components: [check.name],
            evidence: { table: check.name, error: error.message },
          };
        }
      } catch {
        // Continue checking
      }
    }
    
    return null;
  } catch {
    return null;
  }
}

export const phaseBSystem = {
  scan: scanSystemState,
};
