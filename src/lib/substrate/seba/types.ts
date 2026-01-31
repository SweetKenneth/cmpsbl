/**
 * Self-Evolving Bounded Agent (SEBA) Types
 * v1.0.0 — Full Cognitive × Evolution × Governance
 * 
 * The Holy Grail: A complete cognitive pipeline that proposes its own
 * improvements, governance-gates them for safety/coherence, and applies
 * approved evolutions. Genuine bounded autonomy.
 */

// ═══════════════════════════════════════════════════════════════════════════════
// CORE TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type SEBAPhase = 
  | 'idle'
  | 'cognizing'
  | 'proposing'
  | 'evaluating'
  | 'gating'
  | 'applying'
  | 'verifying'
  | 'complete'
  | 'blocked'
  | 'failed';

export type SEBAMode = 
  | 'off'           // SEBA is disabled
  | 'observe'       // Only observes and logs proposals (no execution)
  | 'advisory'      // Proposes improvements, requires human approval
  | 'governed'      // Auto-executes if governance approves AND confidence >= threshold
  | 'autonomous';   // Full autonomy within governance bounds (requires explicit unlock)

export type ImprovementCategory = 
  | 'memory_optimization'
  | 'learning_enhancement'
  | 'reasoning_upgrade'
  | 'governance_refinement'
  | 'performance_boost'
  | 'error_recovery'
  | 'pattern_discovery'
  | 'architecture_evolution';

export type RiskLevel = 'minimal' | 'low' | 'medium' | 'high' | 'critical';

// ═══════════════════════════════════════════════════════════════════════════════
// IMPROVEMENT PROPOSAL
// ═══════════════════════════════════════════════════════════════════════════════

export interface ImprovementProposal {
  id: string;
  short_id: string;
  created_at: string;
  
  // Classification
  category: ImprovementCategory;
  title: string;
  description: string;
  rationale: string;
  
  // Impact assessment
  target_modules: string[];
  estimated_impact: 'low' | 'medium' | 'high';
  risk_level: RiskLevel;
  confidence_score: number; // 0-1
  
  // Proposed changes
  proposed_actions: ProposedAction[];
  rollback_strategy: string;
  
  // Governance
  governance_decision?: GovernanceDecision;
  requires_human_approval: boolean;
  
  // Lineage
  source_insight_id?: string;
  source_pattern_id?: string;
  parent_proposal_id?: string;
}

export interface ProposedAction {
  id: string;
  type: 'config_update' | 'threshold_adjust' | 'pattern_add' | 'rule_modify' | 'memory_prune' | 'module_tune';
  target: string;
  current_value?: unknown;
  proposed_value: unknown;
  reversible: boolean;
  risk_factor: number; // 0-1
}

// ═══════════════════════════════════════════════════════════════════════════════
// GOVERNANCE DECISION
// ═══════════════════════════════════════════════════════════════════════════════

export interface GovernanceDecision {
  decision: 'approve' | 'approve_with_conditions' | 'defer' | 'reject' | 'escalate';
  decided_at: string;
  decided_by: 'governance_guard' | 'human' | 'consensus';
  
  // Assessment
  coherence_score: number;
  ethical_score: number;
  risk_assessment: RiskLevel;
  
  // Conditions (if approve_with_conditions)
  conditions?: string[];
  
  // Rejection reasons
  rejection_reasons?: string[];
  
  // Metadata
  governance_signal_id: string;
  audit_trail_id: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// EVOLUTION EXECUTION
// ═══════════════════════════════════════════════════════════════════════════════

export interface EvolutionExecution {
  id: string;
  proposal_id: string;
  started_at: string;
  completed_at?: string;
  
  phase: 'shadow' | 'production' | 'verified' | 'rolled_back';
  
  // Results
  actions_executed: number;
  actions_succeeded: number;
  actions_failed: number;
  
  // Metrics
  health_before: number;
  health_after?: number;
  health_delta?: number;
  
  // Rollback
  rollback_available: boolean;
  rollback_executed?: boolean;
  rollback_reason?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SEBA STATE
// ═══════════════════════════════════════════════════════════════════════════════

export interface SEBAState {
  // Mode & Phase
  mode: SEBAMode;
  current_phase: SEBAPhase;
  initialized_at: string;
  last_cycle_at?: string;
  
  // Cycle tracking
  total_cycles: number;
  successful_cycles: number;
  failed_cycles: number;
  blocked_cycles: number;
  
  // Active work
  active_proposal?: ImprovementProposal;
  active_execution?: EvolutionExecution;
  
  // Queue
  pending_proposals: number;
  approved_proposals: number;
  rejected_proposals: number;
  
  // Thresholds
  auto_approve_threshold: number; // Minimum confidence for auto-approval
  risk_tolerance: RiskLevel;      // Maximum risk level for auto-execution
  
  // Health
  agent_health: number;
  cognitive_utilization: number;
  governance_compliance: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CYCLE RESULT
// ═══════════════════════════════════════════════════════════════════════════════

export interface SEBACycleResult {
  success: boolean;
  cycle_id: string;
  started_at: string;
  completed_at: string;
  duration_ms: number;
  
  // Phases executed
  phases_completed: SEBAPhase[];
  final_phase: SEBAPhase;
  
  // Outcomes
  proposals_generated: number;
  proposals_approved: number;
  proposals_rejected: number;
  evolutions_applied: number;
  
  // Active proposal (if any)
  proposal?: ImprovementProposal;
  execution?: EvolutionExecution;
  
  // Errors
  error?: string;
  error_phase?: SEBAPhase;
  
  // Audit
  audit_log: SEBAAuditEntry[];
}

export interface SEBAAuditEntry {
  timestamp: string;
  phase: SEBAPhase;
  action: string;
  details: Record<string, unknown>;
  outcome: 'success' | 'warning' | 'error' | 'blocked';
}

// ═══════════════════════════════════════════════════════════════════════════════
// COGNITIVE INSIGHT
// ═══════════════════════════════════════════════════════════════════════════════

export interface CognitiveInsight {
  id: string;
  type: 'pattern' | 'anomaly' | 'opportunity' | 'degradation' | 'optimization';
  source_engine: 'memory' | 'learning' | 'imagination' | 'reasoning';
  
  title: string;
  description: string;
  evidence: string[];
  
  confidence: number;
  actionability: number; // How actionable is this insight (0-1)
  urgency: 'low' | 'medium' | 'high' | 'critical';
  
  suggested_actions?: string[];
  created_at: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

export interface SEBAConfig {
  // Mode settings
  mode: SEBAMode;
  enabled: boolean;
  
  // Thresholds
  auto_approve_threshold: number;  // Default: 0.85
  risk_tolerance: RiskLevel;       // Default: 'low'
  min_confidence_for_proposal: number; // Default: 0.6
  
  // Cycle settings
  max_proposals_per_cycle: number;  // Default: 3
  max_executions_per_day: number;   // Default: 10
  cooldown_after_failure_ms: number; // Default: 300000 (5 min)
  
  // Governance
  require_human_approval_for_high_risk: boolean; // Default: true
  log_all_proposals: boolean;                    // Default: true
  
  // Modules
  enabled_categories: ImprovementCategory[];
  excluded_modules: string[];
}

export const DEFAULT_SEBA_CONFIG: SEBAConfig = {
  mode: 'advisory',
  enabled: true,
  
  auto_approve_threshold: 0.85,
  risk_tolerance: 'low',
  min_confidence_for_proposal: 0.6,
  
  max_proposals_per_cycle: 3,
  max_executions_per_day: 10,
  cooldown_after_failure_ms: 300000,
  
  require_human_approval_for_high_risk: true,
  log_all_proposals: true,
  
  enabled_categories: [
    'memory_optimization',
    'learning_enhancement',
    'performance_boost',
    'error_recovery',
  ],
  excluded_modules: [],
};

// ═══════════════════════════════════════════════════════════════════════════════
// TERMINAL COMMANDS
// ═══════════════════════════════════════════════════════════════════════════════

export type SEBACommand = 
  | 'status'
  | 'enable'
  | 'disable'
  | 'mode'
  | 'cycle'
  | 'propose'
  | 'review'
  | 'approve'
  | 'reject'
  | 'execute'
  | 'rollback'
  | 'history'
  | 'config'
  | 'thresholds';

export interface SEBACommandResult {
  success: boolean;
  command: SEBACommand;
  data?: unknown;
  message: string;
  suggestions?: string[];
}
