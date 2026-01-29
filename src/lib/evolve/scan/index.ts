/**
 * Modernizer Scan — Cognitive Systems Scan
 * v0.7.7 — Intelligent Multi-Source Analysis
 * 
 * SCAN = 4 PARALLEL PHASES → MERGE → PLAN
 * 
 * Phase A: Edge Function Introspection
 * Phase B: System State Scan
 * Phase C: Code Health Snapshot
 * Phase D: LLM-Governed Reasoning
 */

import { phaseAEdge } from './phase-a-edge';
import { phaseBSystem } from './phase-b-system';
import { phaseCHealth } from './phase-c-health';
import { phaseDLLM } from './phase-d-llm';
import { scanMerger } from './merger';
import type { ScanResult, ScanOptions, ScanConfig, DEFAULT_SCAN_CONFIG } from './types';
import { evolutionRuns } from '../evolution-runs';
import { circuitBreaker } from '../circuit-breaker';
import { emitEvolveEvent } from '../telemetry';

// Re-export types
export * from './types';

// ═══════════════════════════════════════════════════════════════
// MODERNIZER SCAN
// ═══════════════════════════════════════════════════════════════

/**
 * Execute cognitive systems scan
 * Returns real, actionable evolution proposals
 */
export async function modernizerScan(options: ScanOptions = {}): Promise<ScanResult> {
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
    // PLAN GENERATION (if ready)
    // ═══════════════════════════════════════════════════════════════
    
    let planId: string | undefined;
    const planReady = mergeResult.proposals.length > 0 && 
                      mergeResult.blocked_reasons.length === 0;
    
    if (planReady && !options.dry_run) {
      // Auto-create evolution plan
      const planResult = await createPlanFromProposals(scanId, mergeResult.proposals);
      if (planResult.success) {
        planId = planResult.plan_id;
      } else {
        mergeResult.blocked_reasons.push(`Plan creation failed: ${planResult.error}`);
      }
    }
    
    // Determine recommended action
    const recommendedAction = determineNextAction(mergeResult, planId);
    
    const scanDuration = Date.now() - startTime;
    
    const result: ScanResult = {
      scan_id: scanId,
      system_snapshot: {
        timestamp: new Date().toISOString(),
        substrate_version: '6.0.0',
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
      blocked_reasons: mergeResult.blocked_reasons,
      recommended_next_action: recommendedAction,
      scan_duration_ms: scanDuration,
    };
    
    emitEvolveEvent('scan_completed', {
      scan_id: scanId,
      proposals_count: mergeResult.proposals.length,
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
        substrate_version: '6.0.0',
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
 * Create evolution plan from proposals
 */
async function createPlanFromProposals(
  scanId: string, 
  proposals: ScanResult['proposals']
): Promise<{ success: boolean; plan_id?: string; error?: string }> {
  try {
    // Check for existing active run
    const activeRun = await evolutionRuns.getActiveRun();
    if (activeRun) {
      return {
        success: false,
        error: `Active evolution ${activeRun.run_id.substring(0, 8)} must complete first`,
      };
    }
    
    // Create new evolution run linked to scan
    const result = await evolutionRuns.createRun({
      plan_id: scanId,
      initiated_by: 'system',
      confidence_score: Math.max(...proposals.map(p => p.confidence_score)),
      risk_level: proposals.some(p => p.risk_level === 'high') ? 'high' : 
                  proposals.some(p => p.risk_level === 'medium') ? 'medium' : 'low',
    });
    
    if (!result.success || !result.run) {
      return { success: false, error: result.error };
    }
    
    return { success: true, plan_id: result.run.run_id };
    
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Plan creation failed',
    };
  }
}

/**
 * Determine recommended next action
 */
function determineNextAction(
  mergeResult: Awaited<ReturnType<typeof scanMerger.merge>>,
  planId?: string
): string {
  if (mergeResult.blocked_reasons.length > 0) {
    return `Resolve blockers: ${mergeResult.blocked_reasons[0]}`;
  }
  
  if (planId) {
    return `Plan ${planId.substring(0, 8)} ready. Run 'modernizer.evolve shadow' to apply.`;
  }
  
  if (mergeResult.proposals.length === 0) {
    return 'System healthy — no changes recommended';
  }
  
  return 'Review proposals and create evolution plan when ready';
}

/**
 * Format scan result for terminal display
 */
export function formatScanResult(result: ScanResult, options: ScanOptions = {}): string {
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
  
  // Status
  lines.push('╠══════════════════════════════════════════════════════════════╣');
  if (result.plan_ready) {
    lines.push(`║  ✅ PLAN READY: ${(result.plan_id || '').substring(0, 20).padEnd(20)}                   ║`);
  } else if (result.blocked_reasons.length > 0) {
    lines.push(`║  ❌ BLOCKED: ${result.blocked_reasons[0].substring(0, 40).padEnd(40)}  ║`);
  } else {
    lines.push('║  ⏳ NO PLAN — no actionable proposals                        ║');
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
  }
  
  return lines.join('\n');
}

export const scan = {
  execute: modernizerScan,
  format: formatScanResult,
};
