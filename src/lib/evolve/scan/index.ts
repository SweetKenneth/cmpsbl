/**
 * Evolution Scan — Cognitive Systems Scan
 * Always Produces Valid Plans + Mobile-First Output
 * 
 * SCAN = 3-SOURCE SYNTHESIS → NORMALIZE → PLAN (always valid)
 * 
 * Source A: Archived Edge Function Analysis
 * Source B: System State Inspection  
 * Source C: LLM Improvement Synthesis
 * 
 * CRITICAL FIX (v0.7.9):
 * - Plans are ALWAYS created, even when blocked
 * - Blocked plans have status='blocked' and are inspectable
 * - No more "INTERNAL_ERROR - invalid input" failures
 */

import { phaseAEdge } from './phase-a-edge';
import { phaseBSystem } from './phase-b-system';
import { phaseCHealth } from './phase-c-health';
import { phaseDLLM } from './phase-d-llm';
import { scanMerger } from './merger';
import { normalizeProposals, type NormalizationResult } from './normalizer';
import { createPlanFromNormalized, type PlanCreationResult, type NormalizedPlan } from './plan-constructor';
import { formatScanResultMobile } from './terminal-formatter';
import type { ScanResult, ScanOptions } from './types';
import { evolutionRuns } from '../evolution-runs';
import { emitEvolveEvent } from '../telemetry';
import { SUBSTRATE_VERSION } from '@/lib/substrate/versions';

// Re-export types
export * from './types';
export * from './normalizer';
export * from './plan-constructor';
export * from './terminal-formatter';

// ═══════════════════════════════════════════════════════════════
// EXTENDED SCAN RESULT (v0.7.9)
// ═══════════════════════════════════════════════════════════════

export interface ScanResultExtended extends ScanResult {
  normalization?: NormalizationResult;
  normalized_actions_count?: number;
  plan?: NormalizedPlan;  // v0.7.9: Always includes plan object
}

// ═══════════════════════════════════════════════════════════════
// EVOLUTION SCAN — v0.7.9
// ═══════════════════════════════════════════════════════════════

/**
 * Execute cognitive systems scan
 * ALWAYS returns a valid, inspectable plan
 */
export async function evolutionScan(options: ScanOptions = {}): Promise<ScanResultExtended> {
  const startTime = Date.now();
  const scanId = `scan_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
  
  emitEvolveEvent('scan_started', { scan_id: scanId, options });
  
  try {
    // ═══════════════════════════════════════════════════════════════
    // 3-SOURCE SYNTHESIS SCAN
    // ═══════════════════════════════════════════════════════════════
    
    // Source A & B & C: Run in parallel
    const [edgeAnalysis, systemState, codeHealth] = await Promise.all([
      phaseAEdge.scan(),
      phaseBSystem.scan(),
      phaseCHealth.scan(),
    ]);
    
    // Source D: LLM Improvement Synthesis (depends on A-C)
    const llmRecommendations = await phaseDLLM.execute({
      edge_analysis: edgeAnalysis,
      system_state: systemState,
      code_health: codeHealth,
      recent_failures: await getRecentFailures(),
      architecture_map: getArchitectureMap(),
    });
    
    // ═══════════════════════════════════════════════════════════════
    // MERGE & VALIDATE
    // ═══════════════════════════════════════════════════════════════
    
    const mergeResult = await scanMerger.merge({
      edge_analysis: edgeAnalysis,
      system_state: systemState,
      code_health: codeHealth,
      llm_recommendations: llmRecommendations,
    });
    
    // ═══════════════════════════════════════════════════════════════
    // NORMALIZATION LAYER
    // ═══════════════════════════════════════════════════════════════
    
    const normalizationResult = normalizeProposals(mergeResult.proposals);
    
    // ═══════════════════════════════════════════════════════════════
    // PLAN GENERATION — v0.7.9: ALWAYS PRODUCES A PLAN
    // ═══════════════════════════════════════════════════════════════
    
    let planResult: PlanCreationResult | null = null;
    const blockedReasons = [...mergeResult.blocked_reasons];
    
    if (!options.dry_run) {
      // Always create plan - it may be blocked but is always valid
      planResult = await createPlanFromNormalized(scanId, normalizationResult);
      
      // Add any plan blockers to reasons
      if (planResult.plan.blockers.length > 0) {
        for (const blocker of planResult.plan.blockers) {
          if (!blockedReasons.includes(blocker.message)) {
            blockedReasons.push(blocker.message);
          }
        }
      }
      
      emitEvolveEvent('plan_created', {
        scan_id: scanId,
        plan_id: planResult.plan.plan_id,
        status: planResult.plan.status,
        actions_count: planResult.plan.total_actions,
        blockers_count: planResult.plan.blockers.length,
        stored: planResult.stored,
      });
    }
    
    // Determine if plan is ready for evolution
    const planReady = planResult?.plan.status === 'ready' || planResult?.plan.status === 'pending_review';
    const planId = planResult?.stored ? planResult.run_id : planResult?.plan.plan_id;
    
    // Determine recommended action
    const recommendedAction = determineNextAction(
      { ...mergeResult, blocked_reasons: blockedReasons }, 
      planResult,
      normalizationResult
    );
    
    const scanDuration = Date.now() - startTime;
    
    const result: ScanResultExtended = {
      scan_id: scanId,
      system_snapshot: {
        timestamp: new Date().toISOString(),
        substrate_version: SUBSTRATE_VERSION,
        modules_active: 21,
        health_overall: codeHealth.stability_score,
      },
      edge_analysis: edgeAnalysis,
      system_state: systemState,
      code_health: codeHealth,
      llm_recommendations: options.llm_report ? llmRecommendations : [],
      proposals: mergeResult.proposals,
      plan_ready: planReady,
      plan_id: planId,
      blocked_reasons: blockedReasons,
      recommended_next_action: recommendedAction,
      scan_duration_ms: scanDuration,
      // v0.7.9 additions
      normalization: normalizationResult,
      normalized_actions_count: normalizationResult.normalized_actions.length,
      plan: planResult?.plan,
    };
    
    emitEvolveEvent('scan_completed', {
      scan_id: scanId,
      proposals_count: mergeResult.proposals.length,
      normalized_count: normalizationResult.normalized_actions.length,
      rejected_count: normalizationResult.rejected_proposals.length,
      plan_ready: planReady,
      plan_status: planResult?.plan.status,
      duration_ms: scanDuration,
    });
    
    return result;
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Scan failed';
    
    emitEvolveEvent('scan_failed', { scan_id: scanId, error: errorMessage });
    
    // Return valid result even on error
    return createErrorResult(scanId, errorMessage, Date.now() - startTime);
  }
}

/**
 * Create a valid result object for error cases
 */
function createErrorResult(scanId: string, errorMessage: string, duration: number): ScanResultExtended {
  return {
    scan_id: scanId,
    system_snapshot: {
      timestamp: new Date().toISOString(),
      substrate_version: SUBSTRATE_VERSION,
      modules_active: 21,
      health_overall: 0,
    },
    edge_analysis: {
      live_functions_count: 0,
      archived_overlap_count: 0,
      repurpose_candidates: [],
      risk_flags: [],
      scan_timestamp: new Date().toISOString(),
    },
    system_state: {
      evolution_state: {
        has_active_run: false,
        stuck_in_shadow: false,
        failed_runs_24h: 0,
      },
      circuit_states: {
        evolution_circuit: 'closed',
        can_evolve: false,
      },
      orchestration_phase: 'unknown',
      detected_anomalies: [],
      module_health_map: [],
      modules_scanned: 0,
      modules_healthy: 0,
      scan_timestamp: new Date().toISOString(),
    },
    code_health: {
      stability_score: 0,
      upgrade_pressure: 'high',
      security_posture: 'weak',
      missing_capabilities: [],
      scan_timestamp: new Date().toISOString(),
    },
    llm_recommendations: [],
    proposals: [],
    plan_ready: false,
    blocked_reasons: [errorMessage],
    recommended_next_action: 'Resolve scan errors before proceeding',
    scan_duration_ms: duration,
  };
}

/**
 * Get recent failure messages for LLM context
 */
async function getRecentFailures(): Promise<string[]> {
  try {
    const runs = await evolutionRuns.getAllRuns(10);
    return runs
      .filter(r => r.phase === 'failed')
      .slice(0, 3)
      .map(r => `Run ${r.run_id.substring(0, 8)} failed at ${r.updated_at}`);
  } catch {
    return [];
  }
}

/**
 * Get architecture map for LLM context
 */
function getArchitectureMap(): Record<string, string[]> {
  return {
    kernel: ['CORE', 'RIPPLE', 'ACCESS'],
    cognitive: ['BRAIN', 'DECODE', 'DREAM'],
    operational: ['DEFENSE', 'NEXUS', 'VISION'],
    administrative: ['SYSTEM', 'EVOLUTION', 'INTEGRATION', 'INCLUSIVE'],
    orchestrator: ['CORTEX', 'ENCODE'],
    infrastructure: ['MEMORY', 'RELAY', 'AUDIT', 'IDENTITY', 'ECONOMY', 'SANDBOX'],
  };
}

/**
 * Determine recommended next action
 */
function determineNextAction(
  mergeResult: { blocked_reasons: string[]; proposals: unknown[] },
  planResult: PlanCreationResult | null,
  normalization?: NormalizationResult
): string {
  // If plan is ready, recommend evolution
  if (planResult?.plan.status === 'ready') {
    const actionCount = planResult.plan.total_actions;
    return `Plan ${planResult.plan.plan_id.substring(0, 8)} ready — ${actionCount} actions. Run 'evolution.evolve shadow' to apply.`;
  }
  
  // If plan is pending review
  if (planResult?.plan.status === 'pending_review') {
    return `Plan ${planResult.plan.plan_id.substring(0, 8)} requires review. Run 'evolution.review ${planResult.plan.plan_id.substring(0, 8)}' to inspect.`;
  }
  
  // If plan is blocked, explain why
  if (planResult?.plan.status === 'blocked' && planResult.plan.blockers.length > 0) {
    const blocker = planResult.plan.blockers[0];
    return `Plan blocked: ${blocker.message}. Run 'modernizer.plans' to inspect.`;
  }
  
  // If circuit is blocked
  if (mergeResult.blocked_reasons.some(r => r.includes('circuit'))) {
    return 'Evolution circuit is OPEN. Run "modernizer.circuit reset" to re-enable.';
  }
  
  // If no proposals
  if (mergeResult.proposals.length === 0) {
    return 'System healthy — no changes recommended';
  }
  
  // If normalization failed
  if (normalization && !normalization.can_create_plan) {
    return `${normalization.rejected_proposals.length} proposals rejected — review with --explain flag`;
  }
  
  return 'Review proposals and create evolution plan when ready';
}

/**
 * Format scan result for terminal display
 * v0.7.9: Uses mobile-first responsive formatter
 */
export function formatScanResult(result: ScanResultExtended, options: ScanOptions = {}): string {
  return formatScanResultMobile(result, options);
}

/** @deprecated Use evolutionScan */
export const modernizerScan = evolutionScan;

export const scan = {
  execute: evolutionScan,
  format: formatScanResult,
};
