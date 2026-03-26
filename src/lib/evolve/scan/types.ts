/**
 * Scan Types — Type definitions for cognitive systems scan
 * Intelligent Multi-Source Analysis with Enriched Metadata
 * 
 * - Added affected_modules, reversible, metadata_version to ScanProposal
 * - All proposals now carry complete traceability metadata
 */

// ═══════════════════════════════════════════════════════════════
// EDGE ANALYSIS (Phase A)
// ═══════════════════════════════════════════════════════════════

export interface EdgeAnalysis {
  live_functions_count: number;
  archived_overlap_count: number;
  repurpose_candidates: RepurposeCandidate[];
  risk_flags: RiskFlag[];
  scan_timestamp: string;
  capability_scan?: import('@/lib/capabilities').ScanAdaptResult;
}

export interface RepurposeCandidate {
  function_name: string;
  archived_name: string;
  overlap_type: 'duplicate' | 'deprecated' | 'orphaned' | 'should_be_active';
  confidence: number;
  reason: string;
}

export interface RiskFlag {
  function_name: string;
  risk_type: 'security' | 'performance' | 'stability' | 'deprecated';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
}

// ═══════════════════════════════════════════════════════════════
// SYSTEM STATE (Phase B)
// ═══════════════════════════════════════════════════════════════

export interface ModuleHealthEntry {
  module: string;
  layer: string;
  reachable: boolean;
  table_accessible: boolean;
  last_activity?: string;
  anomalies: string[];
}

export interface SystemState {
  evolution_state: EvolutionStateSnapshot;
  circuit_states: CircuitStateSnapshot;
  orchestration_phase: string;
  detected_anomalies: DetectedAnomaly[];
  module_health_map: ModuleHealthEntry[];
  modules_scanned: number;
  modules_healthy: number;
  scan_timestamp: string;
}

export interface EvolutionStateSnapshot {
  has_active_run: boolean;
  active_run_id?: string;
  active_phase?: string;
  stuck_in_shadow: boolean;
  last_successful_at?: string;
  failed_runs_24h: number;
}

export interface CircuitStateSnapshot {
  evolution_circuit: 'open' | 'closed';
  last_trip_reason?: string;
  can_evolve: boolean;
}

export interface DetectedAnomaly {
  anomaly_type: 'state_mismatch' | 'shadow_loop' | 'cognitive_starvation' | 'quota_misuse' | 'resilience_gap' | 'module_unreachable' | 'layer_degraded' | 'stale_module';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affected_components: string[];
  evidence: Record<string, unknown>;
}

// ═══════════════════════════════════════════════════════════════
// CODE HEALTH (Phase C)
// ═══════════════════════════════════════════════════════════════

export interface CodeHealth {
  stability_score: number; // 0-100
  upgrade_pressure: 'low' | 'medium' | 'high';
  security_posture: 'weak' | 'moderate' | 'strong';
  missing_capabilities: MissingCapability[];
  scan_timestamp: string;
}

export interface MissingCapability {
  capability: string;
  category: 'security' | 'resilience' | 'performance' | 'observability';
  impact: 'low' | 'medium' | 'high';
  recommendation: string;
}

// ═══════════════════════════════════════════════════════════════
// LLM RECOMMENDATIONS (Phase D)
// ═══════════════════════════════════════════════════════════════

export interface LLMRecommendation {
  title: string;
  category: 'security' | 'hardening' | 'resilience' | 'capability' | 'cleanup';
  rationale: string;
  expected_impact: string;
  risk_level: 'low' | 'medium' | 'high';
  confidence_score: number;
  requires_human: boolean;
  supporting_evidence: string[];
}

// ═══════════════════════════════════════════════════════════════
// SCAN RESULT
// ═══════════════════════════════════════════════════════════════

export interface ScanProposal {
  proposal_id: string;
  title: string;
  category: LLMRecommendation['category'];
  description: string;
  rationale: string;
  risk_level: 'low' | 'medium' | 'high';
  confidence_score: number;
  requires_human: boolean;
  source_phases: ('edge' | 'system' | 'health' | 'llm')[];
  validation_sources: number; // How many phases support this
  action_type: 'code_change' | 'config_change' | 'cleanup' | 'monitoring' | 'manual_review';
  // v6.3.1 Enriched Metadata (Read-Only, Non-Executable)
  affected_modules: string[];      // Modules impacted by this proposal
  reversible: boolean;             // Whether the change can be rolled back
  metadata_version: '6.3.1';       // Metadata schema version
}

export interface ScanResult {
  scan_id: string;
  system_snapshot: {
    timestamp: string;
    substrate_version: string;
    modules_active: number;
    health_overall: number;
  };
  edge_analysis: EdgeAnalysis;
  system_state: SystemState;
  code_health: CodeHealth;
  llm_recommendations: LLMRecommendation[];
  proposals: ScanProposal[];
  plan_ready: boolean;
  plan_id?: string;
  blocked_reasons: string[];
  recommended_next_action: string;
  scan_duration_ms: number;
}

export interface ScanOptions {
  explain?: boolean;
  llm_report?: boolean;
  dry_run?: boolean;
}

// ═══════════════════════════════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════════════════════════════

export interface ScanConfig {
  min_confidence_for_plan: number;
  allowed_risk_levels: ('low' | 'medium' | 'high')[];
  min_validation_sources: number;
  llm_model: string;
  max_proposals: number;
}

export const DEFAULT_SCAN_CONFIG: ScanConfig = {
  min_confidence_for_plan: 0.7,
  allowed_risk_levels: ['low', 'medium'],
  min_validation_sources: 2,
  llm_model: 'gpt-4o-mini',
  max_proposals: 15,
};
