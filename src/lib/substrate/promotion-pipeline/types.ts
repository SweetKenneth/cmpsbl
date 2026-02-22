/**
 * Promotion Pipeline — Types
 */

export type SnapshotType = 'shadow_baseline' | 'production_baseline' | 'pre_promote' | 'post_promote' | 'rollback_state';
export type PromotionStatus = 'pending' | 'canary' | 'success' | 'failed' | 'rolled_back';
export type ReceiptStage = 'preflight' | 'integrity' | 'canary' | 'verify' | 'rollback';
export type ScanMode = 'quick' | 'deep' | 'pre_promote' | 'scheduled';
export type FindingSeverity = 'critical' | 'error' | 'warning' | 'info';

export interface SystemSnapshot {
  id: string;
  type: SnapshotType;
  commit_hash: string | null;
  executor_hash: string | null;
  rule_hash: string | null;
  file_manifest_hash: string | null;
  metrics_json: Record<string, any>;
  created_at: string;
}

export interface SystemDiff {
  id: string;
  shadow_run_id: string | null;
  from_snapshot_id: string | null;
  to_snapshot_id: string | null;
  diff_summary_json: DiffSummary;
  diff_patch_text: string | null;
  created_at: string;
}

export interface DiffSummary {
  rules_added: number;
  rules_removed: number;
  rules_modified: number;
  executor_health_delta: number;
  success_rate_delta: number;
  escalation_delta: number;
  latency_delta: number;
  cost_delta: number;
}

export interface ProductionPromotion {
  id: string;
  shadow_run_id: string | null;
  pre_snapshot_id: string | null;
  post_snapshot_id: string | null;
  integrity_scan_id: string | null;
  status: PromotionStatus;
  verification_passed: boolean;
  rollback_triggered: boolean;
  failure_reason: string | null;
  created_at: string;
  completed_at: string | null;
}

export interface MutationReceipt {
  id: string;
  promotion_id: string | null;
  stage: ReceiptStage;
  outcome: string;
  details_json: Record<string, any>;
  created_at: string;
}

export interface CodeStamp {
  id: string;
  file_path: string;
  promotion_id: string | null;
  shadow_run_id: string | null;
  commit_hash: string | null;
  stamp_text: string;
  created_at: string;
}

export interface IntegrityScanRun {
  id: string;
  mode: ScanMode;
  errors_found: number;
  warnings_found: number;
  health_score: number;
  duration_ms: number | null;
  created_at: string;
}

export interface IntegrityFinding {
  id: string;
  scan_id: string;
  category: string;
  severity: FindingSeverity;
  file_path: string | null;
  message: string;
  suggested_fix: string | null;
}

export interface SystemMetricsPoint {
  id: string;
  recorded_at: string;
  success_rate: number | null;
  escalation_rate: number | null;
  encode_assist_rate: number | null;
  avg_executor_health: number | null;
  rule_count: number | null;
  promoted_rule_count: number | null;
  retired_rule_count: number | null;
  rollback_count: number | null;
  latency_p95: number | null;
  cost_index: number | null;
  integrity_health_score: number | null;
}

export interface PreflightResult {
  passed: boolean;
  checks: Array<{
    name: string;
    passed: boolean;
    actual: number;
    threshold: number;
    message: string;
  }>;
}

export interface PromotionResult {
  success: boolean;
  promotion_id: string;
  status: PromotionStatus;
  diff?: DiffSummary;
  integrity_score?: number;
  failure_reason?: string;
  rollback_triggered?: boolean;
}
