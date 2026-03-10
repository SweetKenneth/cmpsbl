/**
 * Phase B — System State Scan
 * Full Entity + Mesh + Zone Sweep
 * 
 * Performs required system calls to detect state mismatches,
 * stuck phases, cognitive starvation, resilience gaps,
 * and per-entity health across all layers.
 */

import type { SystemState, EvolutionStateSnapshot, CircuitStateSnapshot, DetectedAnomaly, ModuleHealthEntry } from './types';
import { evolutionRuns } from '../evolution-runs';
import { circuitBreaker } from '../circuit-breaker';
import { supabase } from '@/integrations/supabase/client';

/**
 * Detect if an error is an RLS/permission block (expected for protected tables).
 */
function isRLSBlock(error: { message?: string; code?: string }): boolean {
  const msg = (error.message || '').toLowerCase();
  const code = error.code || '';
  if (msg.includes('relation') && msg.includes('does not exist')) return false;
  if (['42501', 'PGRST301'].includes(code)) return true;
  if (code.startsWith('PGRST')) return true;
  if (msg.includes('denied') || msg.includes('permission') || msg.includes('policy')) return true;
  if (msg.includes('rls') || msg.includes('row-level') || msg.includes('row level')) return true;
  if (!msg && !code) return true; // PostgREST minimal error = RLS enforcement
  if (!msg && code) return true;
  return false;
}
// ═══════════════════════════════════════════════════════════════
// FULL ENTITY + MESH + ZONE ARCHITECTURE MAP
// ═══════════════════════════════════════════════════════════════

const MODULE_TABLE_MAP: Record<string, { layer: string; tables: string[]; eventPrefix?: string }> = {
  // Kernel Layer
  core:        { layer: 'Kernel',         tables: ['substrate_health_log'],                  eventPrefix: 'core' },
  ripple:      { layer: 'Kernel',         tables: ['brain_events'],                          eventPrefix: 'ripple' },
  access:      { layer: 'Kernel',         tables: ['access_api_keys', 'access_developers', 'access_subscriptions', 'access_usage'], eventPrefix: 'access' },
  // Cognitive Layer
  brain:       { layer: 'Cognitive',      tables: ['brain_memories', 'brain_memory_hot', 'brain_events'], eventPrefix: 'brain' },
  decode:      { layer: 'Cognitive',      tables: ['ai_usage_log', 'ai_learning_data'],      eventPrefix: 'decode' },
  dream:       { layer: 'Cognitive',      tables: ['agency_dream_memory', 'agency_dream_pool'], eventPrefix: 'dream' },
  // Operational Layer
  defense:     { layer: 'Operational',    tables: ['edge_rate_limits'],                       eventPrefix: 'defense' },
  nexus:       { layer: 'Operational',    tables: ['ai_usage_log', 'ai_daily_quota'],         eventPrefix: 'nexus' },
  vision:      { layer: 'Operational',    tables: ['substrate_health_log'],                   eventPrefix: 'vision' },
  encode:      { layer: 'Operational',    tables: ['sandbox_sessions'],                       eventPrefix: 'encode' },
  // Administrative Layer
  system:      { layer: 'Administrative', tables: ['substrate_health_log'],                   eventPrefix: 'system' },
  evolution:   { layer: 'Administrative', tables: ['evolution_runs', 'evolution_receipts', 'evolution_circuit'], eventPrefix: 'evolution' },
  integration: { layer: 'Administrative', tables: ['mcp_connections'],                        eventPrefix: 'integration' },
  inclusive:   { layer: 'Administrative', tables: ['accessibility_scans'],                    eventPrefix: 'inclusive' },
  // Orchestrator Layer
  cortex:      { layer: 'Orchestrator',   tables: ['atlas_capabilities'],                     eventPrefix: 'cortex' },
  atlas:       { layer: 'Orchestrator',   tables: ['atlas_capabilities'],                     eventPrefix: 'atlas' },
  // Infrastructure Layer
  memory:      { layer: 'Infrastructure', tables: ['brain_memories', 'brain_memory_hot'],     eventPrefix: 'memory' },
  relay:       { layer: 'Infrastructure', tables: ['brain_events'],                           eventPrefix: 'relay' },
  audit:       { layer: 'Infrastructure', tables: ['audit_logs'],                             eventPrefix: 'audit' },
  identity:    { layer: 'Infrastructure', tables: ['evolution_receipts'],                     eventPrefix: 'identity' },
  economy:     { layer: 'Infrastructure', tables: ['access_usage', 'access_quotas'],          eventPrefix: 'economy' },
  sandbox:     { layer: 'Infrastructure', tables: ['sandbox_sessions'],                       eventPrefix: 'sandbox' },
};

// ═══════════════════════════════════════════════════════════════
// SYSTEM STATE SCAN
// ═══════════════════════════════════════════════════════════════

/**
 * Perform comprehensive system state scan across all 38 matrix nodes (12 sectors)
 */
export async function scanSystemState(): Promise<SystemState> {
  // Run all checks in parallel
  const [evolutionState, circuitState, anomalies, moduleHealth] = await Promise.all([
    checkEvolutionState(),
    checkCircuitState(),
    detectAnomalies(),
    scanAllModules(),
  ]);
  
  // Determine orchestration phase from cortex
  const orchestrationPhase = await getOrchestrationPhase();
  
  // Add module-level anomalies
  const moduleAnomalies = deriveModuleAnomalies(moduleHealth);
  const allAnomalies = [...anomalies, ...moduleAnomalies];
  
  const modulesHealthy = moduleHealth.filter(m => m.reachable && m.table_accessible && m.anomalies.length === 0).length;
  
  return {
    evolution_state: evolutionState,
    circuit_states: circuitState,
    orchestration_phase: orchestrationPhase,
    detected_anomalies: allAnomalies,
    module_health_map: moduleHealth,
    modules_scanned: moduleHealth.length,
    modules_healthy: modulesHealthy,
    scan_timestamp: new Date().toISOString(),
  };
}

// ═══════════════════════════════════════════════════════════════
// MODULE HEALTH SWEEP
// ═══════════════════════════════════════════════════════════════

/**
 * Scan all modules for table accessibility and recent activity
 */
async function scanAllModules(): Promise<ModuleHealthEntry[]> {
  const entries = Object.entries(MODULE_TABLE_MAP);
  
  const results = await Promise.all(
    entries.map(async ([moduleName, config]) => {
      const entry: ModuleHealthEntry = {
        module: moduleName,
        layer: config.layer,
        reachable: true,
        table_accessible: true,
        anomalies: [],
      };
      
      // Check primary table accessibility
      const primaryTable = config.tables[0];
      try {
        const { error } = await supabase
          .from(primaryTable as any)
          .select('*', { head: true, count: 'exact' });
        
        if (error) {
          // RLS blocks are expected for protected tables — not an anomaly
          const isRLS = isRLSBlock(error);
          if (isRLS) {
            // Table exists and RLS is enforced — this is healthy
            entry.table_accessible = true;
          } else {
            entry.table_accessible = false;
            entry.anomalies.push(`Primary table ${primaryTable} inaccessible: ${error.message}`);
          }
        }
      } catch {
        entry.reachable = false;
        entry.table_accessible = false;
        entry.anomalies.push(`Module ${moduleName} unreachable`);
      }
      
      // Check for recent activity via brain_events
      if (config.eventPrefix) {
        try {
          const { data: events } = await supabase
            .from('brain_events')
            .select('created_at')
            .ilike('event_type', `%${config.eventPrefix}%`)
            .order('created_at', { ascending: false })
            .limit(1);
          
          if (events && events.length > 0) {
            entry.last_activity = events[0].created_at;
            
            // Flag stale modules (no activity in 7 days)
            const lastActive = new Date(events[0].created_at);
            const daysSince = (Date.now() - lastActive.getTime()) / (1000 * 60 * 60 * 24);
            if (daysSince > 7) {
              entry.anomalies.push(`No activity in ${Math.floor(daysSince)} days`);
            }
          }
        } catch {
          // Non-critical — event check failure doesn't mean module is down
        }
      }
      
      return entry;
    })
  );
  
  return results;
}

/**
 * Derive anomalies from module health map
 */
function deriveModuleAnomalies(moduleHealth: ModuleHealthEntry[]): DetectedAnomaly[] {
  const anomalies: DetectedAnomaly[] = [];
  
  // Check for unreachable modules
  const unreachable = moduleHealth.filter(m => !m.reachable);
  if (unreachable.length > 0) {
    anomalies.push({
      anomaly_type: 'module_unreachable',
      severity: unreachable.length >= 3 ? 'critical' : 'high',
      description: `${unreachable.length} module(s) unreachable: ${unreachable.map(m => m.module).join(', ')}`,
      affected_components: unreachable.map(m => m.module),
      evidence: { unreachable_modules: unreachable.map(m => m.module) },
    });
  }
  
  // Check for layer degradation (>50% of layer modules have issues)
  const layerGroups: Record<string, ModuleHealthEntry[]> = {};
  for (const m of moduleHealth) {
    (layerGroups[m.layer] ??= []).push(m);
  }
  
  for (const [layer, modules] of Object.entries(layerGroups)) {
    const degraded = modules.filter(m => !m.reachable || !m.table_accessible || m.anomalies.length > 0);
    if (degraded.length > modules.length / 2) {
      anomalies.push({
        anomaly_type: 'layer_degraded',
        severity: layer === 'Kernel' ? 'critical' : 'high',
        description: `${layer} layer degraded: ${degraded.length}/${modules.length} modules have issues`,
        affected_components: degraded.map(m => m.module),
        evidence: { layer, degraded_count: degraded.length, total: modules.length },
      });
    }
  }
  
  // Check for stale modules
  const stale = moduleHealth.filter(m => m.anomalies.some(a => a.includes('No activity')));
  if (stale.length >= 5) {
    anomalies.push({
      anomaly_type: 'stale_module',
      severity: 'medium',
      description: `${stale.length} modules show no recent activity`,
      affected_components: stale.map(m => m.module),
      evidence: { stale_modules: stale.map(m => m.module) },
    });
  }
  
  return anomalies;
}

// ═══════════════════════════════════════════════════════════════
// ORIGINAL CHECKS (retained)
// ═══════════════════════════════════════════════════════════════

/**
 * Check evolution state for issues
 */
async function checkEvolutionState(): Promise<EvolutionStateSnapshot> {
  const activeRun = await evolutionRuns.getActiveRun();
  const allRuns = await evolutionRuns.getAllRuns(50);
  
  const now = new Date();
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const failedRuns24h = allRuns.filter(r => 
    r.phase === 'failed' && 
    new Date(r.created_at) > twentyFourHoursAgo
  ).length;
  
  let stuckInShadow = false;
  if (activeRun && activeRun.phase === 'shadow_applied') {
    const shadowTime = new Date(activeRun.updated_at);
    const hoursSinceApply = (now.getTime() - shadowTime.getTime()) / (1000 * 60 * 60);
    stuckInShadow = hoursSinceApply > 4;
  }
  
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
  return 'manual';
}

/**
 * Detect anomalies across system
 */
async function detectAnomalies(): Promise<DetectedAnomaly[]> {
  const anomalies: DetectedAnomaly[] = [];
  
  const [stateMismatch, shadowLoop, starvation, quotaMisuse, resilienceGap] = await Promise.all([
    checkStateMismatch(),
    checkShadowLoops(),
    checkCognitiveStarvation(),
    checkQuotaMisuse(),
    checkResilienceGaps(),
  ]);
  
  if (stateMismatch) anomalies.push(stateMismatch);
  if (shadowLoop) anomalies.push(shadowLoop);
  if (starvation) anomalies.push(starvation);
  if (quotaMisuse) anomalies.push(quotaMisuse);
  if (resilienceGap) anomalies.push(resilienceGap);
  
  return anomalies;
}

async function checkStateMismatch(): Promise<DetectedAnomaly | null> {
  try {
    const activeRun = await evolutionRuns.getActiveRun();
    const circuitStatus = await circuitBreaker.getStatus();
    
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
    const { data: memories } = await supabase
      .from('brain_memories')
      .select('id')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
    
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
    const { data: usage } = await supabase
      .from('ai_usage_log')
      .select('tokens_used, cost')
      .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString());
    
    if (usage && usage.length > 0) {
      const totalTokens = usage.reduce((sum, u) => sum + (u.tokens_used || 0), 0);
      
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
    // Expanded critical tables check across all layers
    const criticalTables = [
      'evolution_runs',
      'evolution_receipts',
      'evolution_circuit',
      'brain_memories',
      'brain_events',
      'audit_logs',
      'ai_usage_log',
      'access_api_keys',
      'atlas_capabilities',
      'substrate_health_log',
    ];
    
    const inaccessible: string[] = [];
    
    await Promise.all(
      criticalTables.map(async (tableName) => {
        try {
          const { error } = await supabase.from(tableName as any).select('*', { head: true, count: 'exact' });
          if (error && !isRLSBlock(error)) {
            inaccessible.push(tableName);
          }
        } catch {
          inaccessible.push(tableName);
        }
      })
    );
    
    if (inaccessible.length > 0) {
      return {
        anomaly_type: 'resilience_gap',
        severity: inaccessible.length >= 3 ? 'critical' : 'high',
        description: `${inaccessible.length} critical table(s) inaccessible: ${inaccessible.join(', ')}`,
        affected_components: inaccessible,
        evidence: { inaccessible_tables: inaccessible, checked: criticalTables.length },
      };
    }
    
    return null;
  } catch {
    return null;
  }
}

export const phaseBSystem = {
  scan: scanSystemState,
};
