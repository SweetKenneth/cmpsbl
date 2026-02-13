/**
 * Self-Evolving Bounded Agent (SEBA) Types
 * v2.1.0 — Full Cognitive × Evolution × Governance
 * v9.1.0 ARCHITECT Epoch Integration
 * 
 * The Holy Grail: A complete cognitive pipeline that proposes its own
 * improvements, governance-gates them for safety/coherence, and applies
 * approved evolutions. Genuine bounded autonomy with shadow-to-production
 * execution pipeline.
 */

// ═══════════════════════════════════════════════════════════════════════════════
// VERSION & METADATA
// ═══════════════════════════════════════════════════════════════════════════════

export const SEBA_VERSION = '2.1.0';
export const SEBA_CODENAME = 'Full Spectrum Autonomy';

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
  | 'failed'
  | 'cooling_down';

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
  | 'architecture_evolution'
  | 'security_hardening'
  | 'resource_optimization';

export type RiskLevel = 'minimal' | 'low' | 'medium' | 'high' | 'critical';

export type ProposalStatus = 
  | 'draft'
  | 'pending_review'
  | 'approved'
  | 'approved_with_conditions'
  | 'rejected'
  | 'executed'
  | 'rolled_back'
  | 'expired';

// ═══════════════════════════════════════════════════════════════════════════════
// IMPROVEMENT PROPOSAL
// ═══════════════════════════════════════════════════════════════════════════════

export interface ImprovementProposal {
  id: string;
  short_id: string;
  created_at: string;
  expires_at?: string;
  status: ProposalStatus;
  
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
  priority: number; // 1-10
  
  // Proposed changes
  proposed_actions: ProposedAction[];
  rollback_strategy: string;
  estimated_duration_ms?: number;
  
  // Governance
  governance_decision?: GovernanceDecision;
  requires_human_approval: boolean;
  approval_deadline?: string;
  
  // Execution tracking
  execution?: EvolutionExecution;
  
  // Lineage
  source_insight_id?: string;
  source_pattern_id?: string;
  parent_proposal_id?: string;
  child_proposal_ids?: string[];
}

export interface ProposedAction {
  id: string;
  type: 'config_update' | 'threshold_adjust' | 'pattern_add' | 'rule_modify' | 'memory_prune' | 'module_tune' | 'cache_invalidate' | 'index_rebuild';
  target: string;
  current_value?: unknown;
  proposed_value: unknown;
  reversible: boolean;
  risk_factor: number; // 0-1
  estimated_duration_ms?: number;
  dependencies?: string[]; // Other action IDs this depends on
  validation_rules?: string[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// GOVERNANCE DECISION
// ═══════════════════════════════════════════════════════════════════════════════

export interface GovernanceDecision {
  decision: 'approve' | 'approve_with_conditions' | 'defer' | 'reject' | 'escalate';
  decided_at: string;
  decided_by: 'governance_guard' | 'human' | 'consensus' | 'timeout';
  
  // Assessment
  coherence_score: number;
  ethical_score: number;
  risk_assessment: RiskLevel;
  safety_score?: number;
  
  // Conditions (if approve_with_conditions)
  conditions?: string[];
  monitoring_required?: boolean;
  review_after_ms?: number;
  
  // Rejection reasons
  rejection_reasons?: string[];
  suggested_modifications?: string[];
  
  // Metadata
  governance_signal_id: string;
  audit_trail_id: string;
  evaluation_duration_ms?: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// EVOLUTION EXECUTION
// ═══════════════════════════════════════════════════════════════════════════════

export interface EvolutionExecution {
  id: string;
  proposal_id: string;
  started_at: string;
  completed_at?: string;
  
  phase: 'shadow' | 'production' | 'verified' | 'rolled_back' | 'partial';
  
  // Results
  actions_executed: number;
  actions_succeeded: number;
  actions_failed: number;
  action_results?: ActionResult[];
  
  // Metrics
  health_before: number;
  health_after?: number;
  health_delta?: number;
  performance_impact?: number;
  
  // Rollback
  rollback_available: boolean;
  rollback_executed?: boolean;
  rollback_reason?: string;
  rollback_at?: string;
  
  // Verification
  verification_passed?: boolean;
  verification_notes?: string[];
}

export interface ActionResult {
  action_id: string;
  success: boolean;
  error?: string;
  duration_ms: number;
  changes_applied?: Record<string, unknown>;
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
  next_cycle_at?: string;
  
  // Cycle tracking
  total_cycles: number;
  successful_cycles: number;
  failed_cycles: number;
  blocked_cycles: number;
  cycles_today: number;
  
  // Active work
  active_proposal?: ImprovementProposal;
  active_execution?: EvolutionExecution;
  
  // Queue
  pending_proposals: number;
  approved_proposals: number;
  rejected_proposals: number;
  executed_proposals: number;
  
  // Thresholds
  auto_approve_threshold: number; // Minimum confidence for auto-approval
  risk_tolerance: RiskLevel;      // Maximum risk level for auto-execution
  
  // Health & Performance
  agent_health: number;
  cognitive_utilization: number;
  governance_compliance: number;
  avg_cycle_duration_ms?: number;
  
  // Cooldown
  cooldown_until?: string;
  cooldown_reason?: string;
  
  // Learning stats
  insights_processed: number;
  evolutions_applied: number;
  rollbacks_executed: number;
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
  
  // Insights processed
  insights_analyzed?: number;
  
  // Errors
  error?: string;
  error_phase?: SEBAPhase;
  error_details?: Record<string, unknown>;
  
  // Audit
  audit_log: SEBAAuditEntry[];
  
  // Next cycle
  next_cycle_scheduled?: string;
}

export interface SEBAAuditEntry {
  timestamp: string;
  phase: SEBAPhase;
  action: string;
  details: Record<string, unknown>;
  outcome: 'success' | 'warning' | 'error' | 'blocked' | 'skipped';
  duration_ms?: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// COGNITIVE INSIGHT
// ═══════════════════════════════════════════════════════════════════════════════

export interface CognitiveInsight {
  id: string;
  type: 'pattern' | 'anomaly' | 'opportunity' | 'degradation' | 'optimization' | 'correlation' | 'vulnerability' | 'bottleneck' | 'drift';
  source_engine: 'memory' | 'learning' | 'imagination' | 'reasoning' | 'telemetry' | 'security' | 'governance' | 'resources' | 'architecture';
  
  title: string;
  description: string;
  evidence: string[];
  
  confidence: number;
  actionability: number; // How actionable is this insight (0-1)
  urgency: 'low' | 'medium' | 'high' | 'critical';
  
  // Enhanced metadata
  affected_modules?: string[];
  potential_impact?: 'low' | 'medium' | 'high';
  suggested_actions?: string[];
  related_insights?: string[];
  
  created_at: string;
  expires_at?: string;
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
  cycle_interval_ms?: number;        // Default: 3600000 (1 hour)
  
  // Governance
  require_human_approval_for_high_risk: boolean; // Default: true
  log_all_proposals: boolean;                    // Default: true
  proposal_expiry_hours: number;                 // Default: 24
  
  // Safety
  max_health_degradation: number;    // Default: 20 (triggers rollback)
  shadow_test_enabled: boolean;      // Default: true
  verification_enabled: boolean;     // Default: true
  
  // Modules
  enabled_categories: ImprovementCategory[];
  excluded_modules: string[];
  priority_modules?: string[];
}

/**
 * SEBA v2.1.0 Safety Controls
 * ALL proposals require human approval by default
 */
export const SEBA_SAFETY_CONTROLS = {
  AUTO_APPROVE_ENABLED: false,       // All proposals go to pending status
  MAX_CYCLES_PER_DAY: 12,            // Prevents runaway scanning
  MAX_PROPOSALS_PER_DAY: 20,         // Limits proposal generation
  COOLDOWN_HOURS: 2,                 // Enforces gap between cycles
  NEXUS_BUDGET_THRESHOLD: 0.5,       // Halts if AI budget exceeded (50%)
  
  // Free tier limits (conservative estimates)
  FREE_TIER_DAILY_CALLS: 50,
  FREE_TIER_MONTHLY_CALLS: 1000,
  CALLS_PER_CYCLE: 2.5,              // Each cycle uses ~2-3 LLM calls
} as const;

export const DEFAULT_SEBA_CONFIG: SEBAConfig = {
  // ═══ CRITICAL: Advisory mode with NO auto-approval ═══
  mode: 'advisory',
  enabled: true,
  
  // Threshold set to 1.0 = effectively disables auto-approve
  // ALL proposals require human review
  auto_approve_threshold: 1.0,
  risk_tolerance: 'low',
  min_confidence_for_proposal: 0.6,
  
  // Budget-aware limits for free tier
  // ~50 calls/day ÷ 2.5 calls/cycle = ~20 cycles/day max
  // Actual limit set lower for safety margin
  max_proposals_per_cycle: 3,
  max_executions_per_day: 8,          // Conservative for free tier
  cooldown_after_failure_ms: 300000,  // 5 min
  cycle_interval_ms: 7200000,         // 2 hours between auto-cycles
  
  // ═══ MANDATORY: Human approval for everything ═══
  require_human_approval_for_high_risk: true,
  log_all_proposals: true,
  proposal_expiry_hours: 24,
  
  // Safety
  max_health_degradation: 20,
  shadow_test_enabled: true,
  verification_enabled: true,
  
  enabled_categories: [
    'memory_optimization',
    'learning_enhancement',
    'performance_boost',
    'error_recovery',
    'resource_optimization',
    'security_hardening',
    'governance_refinement',
    'architecture_evolution',
    'pattern_discovery',
    'reasoning_upgrade',
  ],
  excluded_modules: [],
  priority_modules: ['memory', 'learning', 'governance', 'security'],
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
  | 'thresholds'
  | 'health'
  | 'metrics'
  | 'queue'
  | 'pause'
  | 'resume';

export interface SEBACommandResult {
  success: boolean;
  command: SEBACommand;
  data?: unknown;
  message: string;
  suggestions?: string[];
  warnings?: string[];
  duration_ms?: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// METRICS & TELEMETRY
// ═══════════════════════════════════════════════════════════════════════════════

export interface SEBAMetrics {
  // Cycle performance
  total_cycles: number;
  success_rate: number;
  avg_cycle_duration_ms: number;
  
  // Proposal stats
  proposals_generated: number;
  proposals_approved: number;
  proposals_rejected: number;
  proposals_expired: number;
  
  // Execution stats
  evolutions_applied: number;
  rollbacks_executed: number;
  health_improvements: number;
  
  // Time-based
  cycles_last_24h: number;
  proposals_last_24h: number;
  evolutions_last_24h: number;
  
  // Category breakdown
  category_distribution: Record<ImprovementCategory, number>;
  
  // Timestamps
  last_updated: string;
  period_start: string;
}

export interface SEBAHealth {
  overall: number; // 0-100
  components: {
    cognitive_analyzer: number;
    proposal_generator: number;
    governance_gate: number;
    evolution_executor: number;
  };
  last_check: string;
  issues?: string[];
}
