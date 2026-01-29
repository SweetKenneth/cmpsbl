/**
 * Modernizer Scan — Cognitive Systems Scan
 * v0.7.8 — Intelligent Multi-Source Analysis + Normalization
 * 
 * SCAN = 4 PARALLEL PHASES → MERGE → NORMALIZE → PLAN
 * 
 * Phase A: Edge Function Introspection
 * Phase B: System State Scan
 * Phase C: Code Health Snapshot
 * Phase D: LLM-Governed Reasoning
 * 
 * NORMALIZATION LAYER (v0.7.8):
 * - Converts raw proposals to typed, executable actions
 * - Only normalized actions can become plans
 * - Deterministic, no silent failures
 */

import { phaseAEdge } from './phase-a-edge';
import { phaseBSystem } from './phase-b-system';
import { phaseCHealth } from './phase-c-health';
import { phaseDLLM } from './phase-d-llm';
import { scanMerger } from './merger';
import { normalizeProposals, type NormalizationResult } from './normalizer';
import { createPlanFromNormalized, type PlanCreationResult } from './plan-constructor';
import type { ScanResult, ScanOptions } from './types';
import { evolutionRuns } from '../evolution-runs';
import { circuitBreaker } from '../circuit-breaker';
import { emitEvolveEvent } from '../telemetry';

// Re-export types
export * from './types';
export * from './normalizer';
export * from './plan-constructor';

// ═══════════════════════════════════════════════════════════════
// EXTENDED SCAN RESULT (v0.7.8)
// ═══════════════════════════════════════════════════════════════

export interface ScanResultExtended extends ScanResult {
  normalization?: NormalizationResult;
  normalized_actions_count?: number;
}

// ═══════════════════════════════════════════════════════════════
// MODERNIZER SCAN
// ═══════════════════════════════════════════════════════════════

/**
 * Execute cognitive systems scan
 * Returns real, actionable evolution proposals
 */
export async function modernizerScan(options: ScanOptions = {}): Promise<ScanResultExtended> {
  const startTime = Date.now();
  const scanId = `scan_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
  
  emitEvolveEvent('scan_started', { scan_id: scanId, options });
  
  try {
    // ═══════════════════════════════════════════════════════════════
    // PHASE A-D: PARALLEL EXECUTION
    // ═══════════════════════════════════════════════════════════════
    
    const [edgeAnalysis, systemState, codeHealth] = await Promise.all([
      phaseAEdge.scan(),
      phaseBSystem.scan(),
      phaseCHealth.scan(),
    ]);
    
    // Phase D depends on A-C results
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
    // v0.7.8: NORMALIZATION LAYER
    // ═══════════════════════════════════════════════════════════════
    
    const normalizationResult = normalizeProposals(mergeResult.proposals);
    
    // ═══════════════════════════════════════════════════════════════
    // PLAN GENERATION (v0.7.8: Only from normalized actions)
    // ═══════════════════════════════════════════════════════════════
    
    let planId: string | undefined;
    let planReady = false;
    const blockedReasons = [...mergeResult.blocked_reasons];
    
    if (normalizationResult.can_create_plan && !options.dry_run) {
      // Create plan from normalized actions only
      const planResult = await createPlanFromNormalized(scanId, normalizationResult);
      
      if (planResult.success && planResult.run_id) {
        planId = planResult.run_id;
        planReady = true;
      } else if (planResult.error) {
        blockedReasons.push(`Plan creation failed: ${planResult.error.code} - ${planResult.error.message}`);
        emitEvolveEvent('plan_blocked', {
          scan_id: scanId,
          error_code: planResult.error.code,
          message: planResult.error.message,
        });
      }
    } else if (!normalizationResult.can_create_plan && mergeResult.proposals.length > 0) {
      // Proposals exist but normalization failed
      blockedReasons.push(normalizationResult.blocking_reason || 'Proposals could not be normalized');
      emitEvolveEvent('plan_blocked', {
        scan_id: scanId,
        reason: 'normalization_failed',
        normalized_count: normalizationResult.normalized_actions.length,
        rejected_count: normalizationResult.rejected_proposals.length,
      });
    }
    
    // Determine recommended action
    const recommendedAction = determineNextAction(
      { ...mergeResult, blocked_reasons: blockedReasons }, 
      planId,
      normalizationResult
    );
    
    const scanDuration = Date.now() - startTime;
    
    const result: ScanResultExtended = {
      scan_id: scanId,
      system_snapshot: {
        timestamp: new Date().toISOString(),
        substrate_version: '6.3.0',
        modules_active: 14,
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
      // v0.7.8 additions
      normalization: normalizationResult,
      normalized_actions_count: normalizationResult.normalized_actions.length,
    };
    
    emitEvolveEvent('scan_completed', {
      scan_id: scanId,
      proposals_count: mergeResult.proposals.length,
      normalized_count: normalizationResult.normalized_actions.length,
      rejected_count: normalizationResult.rejected_proposals.length,
      plan_ready: planReady,
      duration_ms: scanDuration,
    });
    
    return result;
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Scan failed';
    
    emitEvolveEvent('scan_failed', { scan_id: scanId, error: errorMessage });
    
    return {
      scan_id: scanId,
      system_snapshot: {
        timestamp: new Date().toISOString(),
        substrate_version: '6.3.0',
        modules_active: 14,
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
      scan_duration_ms: Date.now() - startTime,
    };
  }
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
    administrative: ['SYSTEM', 'MODERNIZER', 'INTEGRATION', 'INCLUSIVE'],
    orchestrator: ['CORTEX'],
  };
}

/**
 * Determine recommended next action
 */
function determineNextAction(
  mergeResult: { blocked_reasons: string[]; proposals: unknown[] },
  planId?: string,
  normalization?: NormalizationResult
): string {
  if (mergeResult.blocked_reasons.length > 0) {
    return `Resolve blockers: ${mergeResult.blocked_reasons[0]}`;
  }
  
  if (planId) {
    const actionCount = normalization?.normalized_actions.length || 0;
    return `Plan ${planId.substring(0, 8)} ready — ${actionCount} actions normalized. Run 'modernizer.evolve shadow' to apply.`;
  }
  
  if (mergeResult.proposals.length === 0) {
    return 'System healthy — no changes recommended';
  }
  
  if (normalization && !normalization.can_create_plan) {
    return `${normalization.rejected_proposals.length} proposals rejected — review with --explain flag`;
  }
  
  return 'Review proposals and create evolution plan when ready';
}

/**
 * Format scan result for terminal display
 * v0.7.8: Updated for truthful plan status
 */
export function formatScanResult(result: ScanResultExtended, options: ScanOptions = {}): string {
  const lines: string[] = [];
  
  lines.push('╔══════════════════════════════════════════════════════════════╗');
  lines.push('║  MODERNIZER SCAN RESULTS                                     ║');
  lines.push('╠══════════════════════════════════════════════════════════════╣');
  lines.push(`║  Scan ID: ${result.scan_id.substring(0, 20).padEnd(20)}                         ║`);
  lines.push(`║  Duration: ${(result.scan_duration_ms / 1000).toFixed(2)}s                                          ║`);
  lines.push('╠══════════════════════════════════════════════════════════════╣');
  
  // System Snapshot
  lines.push('║  📊 SYSTEM SNAPSHOT                                          ║');
  lines.push(`║    Health: ${result.system_snapshot.health_overall}% | Modules: ${result.system_snapshot.modules_active} | v${result.system_snapshot.substrate_version}      ║`);
  
  // Edge Analysis
  lines.push('╠══════════════════════════════════════════════════════════════╣');
  lines.push('║  🔌 EDGE ANALYSIS                                            ║');
  lines.push(`║    Live: ${result.edge_analysis.live_functions_count} | Archived Overlap: ${result.edge_analysis.archived_overlap_count} | Risks: ${result.edge_analysis.risk_flags.length}   ║`);
  
  // System State
  lines.push('╠══════════════════════════════════════════════════════════════╣');
  lines.push('║  ⚙️  SYSTEM STATE                                             ║');
  lines.push(`║    Circuit: ${result.system_state.circuit_states.evolution_circuit.padEnd(8)} | Anomalies: ${result.system_state.detected_anomalies.length}              ║`);
  lines.push(`║    Orchestration: ${result.system_state.orchestration_phase.padEnd(10)}                          ║`);
  
  // Code Health
  lines.push('╠══════════════════════════════════════════════════════════════╣');
  lines.push('║  🏥 CODE HEALTH                                              ║');
  lines.push(`║    Stability: ${result.code_health.stability_score}% | Security: ${result.code_health.security_posture.padEnd(8)}           ║`);
  lines.push(`║    Pressure: ${result.code_health.upgrade_pressure.padEnd(8)} | Missing: ${result.code_health.missing_capabilities.length}                    ║`);
  
  // Proposals
  lines.push('╠══════════════════════════════════════════════════════════════╣');
  lines.push(`║  📋 PROPOSALS (${result.proposals.length})                                           ║`);
  
  if (result.proposals.length === 0) {
    lines.push('║    ✨ No changes recommended — system healthy                ║');
  } else {
    for (const prop of result.proposals.slice(0, 5)) {
      const risk = prop.risk_level === 'high' ? '🔴' : prop.risk_level === 'medium' ? '🟡' : '🟢';
      lines.push(`║    ${risk} ${prop.title.substring(0, 45).padEnd(45)} ║`);
    }
    if (result.proposals.length > 5) {
      lines.push(`║    ... and ${result.proposals.length - 5} more                                       ║`);
    }
  }
  
  // v0.7.8: Normalization Summary
  if (result.normalization) {
    lines.push('╠══════════════════════════════════════════════════════════════╣');
    lines.push('║  🔄 NORMALIZATION                                            ║');
    lines.push(`║    Normalized: ${result.normalization.normalized_actions.length} | Rejected: ${result.normalization.rejected_proposals.length}                          ║`);
    
    if (result.normalization.rejected_proposals.length > 0) {
      const breakdown = result.normalization.summary.rejection_breakdown;
      const reasons = Object.entries(breakdown)
        .filter(([, count]) => count > 0)
        .map(([code, count]) => `${code}: ${count}`)
        .join(', ');
      if (reasons) {
        lines.push(`║    Rejections: ${reasons.substring(0, 42).padEnd(42)}  ║`);
      }
    }
  }
  
  // Status — v0.7.8: Truthful messaging
  lines.push('╠══════════════════════════════════════════════════════════════╣');
  if (result.plan_ready && result.plan_id) {
    const actionCount = result.normalized_actions_count || 0;
    lines.push(`║  ✅ PLAN READY — ${actionCount} actions normalized                    ║`);
    lines.push(`║     Plan ID: ${result.plan_id.substring(0, 20).padEnd(20)}                   ║`);
  } else if (result.blocked_reasons.length > 0) {
    lines.push(`║  ⚠️  PLAN BLOCKED — proposals could not be normalized        ║`);
    lines.push(`║     Reason: ${result.blocked_reasons[0].substring(0, 42).padEnd(42)}  ║`);
  } else if (result.proposals.length === 0) {
    lines.push('║  ✨ SYSTEM HEALTHY — no changes needed                       ║');
  } else {
    lines.push('║  ⏳ NO PLAN — review proposals with --explain                ║');
  }
  
  lines.push('╠══════════════════════════════════════════════════════════════╣');
  lines.push(`║  → ${result.recommended_next_action.substring(0, 55).padEnd(55)} ║`);
  lines.push('╚══════════════════════════════════════════════════════════════╝');
  
  // Add explain section if requested
  if (options.explain && result.proposals.length > 0) {
    lines.push('');
    lines.push('═══ DETAILED REASONING ═══');
    for (const prop of result.proposals) {
      lines.push(`\n[${prop.category.toUpperCase()}] ${prop.title}`);
      lines.push(`  Rationale: ${prop.description}`);
      lines.push(`  Impact: ${prop.rationale}`);
      lines.push(`  Confidence: ${(prop.confidence_score * 100).toFixed(0)}% | Risk: ${prop.risk_level} | Sources: ${prop.source_phases.join(', ')}`);
      lines.push(`  Requires Human: ${prop.requires_human ? 'Yes' : 'No'}`);
    }
    
    // Show rejection details if available
    if (result.normalization && result.normalization.rejected_proposals.length > 0) {
      lines.push('');
      lines.push('═══ REJECTED PROPOSALS ═══');
      for (const rej of result.normalization.rejected_proposals) {
        lines.push(`\n❌ ${rej.title}`);
        lines.push(`   Code: ${rej.rejection_code}`);
        lines.push(`   Reason: ${rej.reason}`);
      }
    }
  }
  
  return lines.join('\n');
}

export const scan = {
  execute: modernizerScan,
  format: formatScanResult,
};
