/**
 * DEFENSE Guardrail Types — Phase 1: Proposal Gate
 * All anomaly-driven adjustments flow through proposals, never direct mutation.
 */

export type ProposalStatus =
  | 'proposed'
  | 'shadow_testing'
  | 'approved'
  | 'rejected'
  | 'expired';

export type ProposalCategory =
  | 'threshold_adjustment'
  | 'rule_creation'
  | 'rule_modification'
  | 'ip_action'
  | 'rate_limit_change';

export interface ProposedAdjustment {
  id: string;
  category: ProposalCategory;
  status: ProposalStatus;
  /** What the anomaly engine wants to change */
  target: string;
  /** Value before proposed change */
  previous_value: unknown;
  /** Value the anomaly engine proposes */
  proposed_value: unknown;
  /** Reason from the anomaly/learning engine */
  reason: string;
  /** Confidence score 0–1 from detection */
  confidence: number;
  /** How many consecutive anomaly confirmations */
  confirmation_count: number;
  /** Minimum confirmations required for promotion */
  min_confirmations: number;
  /** Sample size backing this proposal */
  sample_size: number;
  /** Minimum sample size required for promotion */
  min_sample_size: number;
  /** When the proposal was created */
  created_at: string;
  /** When the evaluation window ends (auto-expire) */
  expires_at: string;
  /** When status last changed */
  updated_at: string;
  /** Originating signal IDs */
  source_signal_ids: string[];
  /** Shadow mode metrics (populated during shadow_testing) */
  shadow_metrics?: ShadowMetrics;
  /** Who/what approved or rejected */
  resolved_by?: string;
  resolved_at?: string;
}

export interface ShadowMetrics {
  simulated_block_rate: number;
  simulated_challenge_rate: number;
  estimated_false_positive_rate: number;
  baseline_block_rate: number;
  baseline_challenge_rate: number;
  baseline_false_positive_rate: number;
  sample_count: number;
}

export interface PromotionGateResult {
  can_promote: boolean;
  reasons: string[];
}

export interface GuardrailLogEntry {
  event: string;
  proposal_id?: string;
  previous_value?: unknown;
  proposed_value?: unknown;
  final_value?: unknown;
  reason: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}
