/**
 * AutoBlog Type Definitions
 */

export type AutoblogMode = 'governed' | 'shadow' | 'off';
export type AutoblogChannel = 'changelog' | 'blog' | 'release_notes';
export type AutoblogQueueStatus = 'queued' | 'drafting' | 'ready' | 'published' | 'aborted' | 'failed';
export type AutoblogPhase = 'plan' | 'draft' | 'verify' | 'publish' | 'heal';
export type AutoblogOutcome = 'success' | 'blocked' | 'failed';
export type CircuitState = 'closed' | 'open' | 'half_open';
export type RiskLevel = 'low' | 'medium' | 'high';

export interface AutoblogSettings {
  id: string;
  enabled: boolean;
  mode: AutoblogMode;
  cadence_minutes: number;
  max_posts_per_day: number;
  max_failures_per_hour: number;
  min_confidence_publish: number;
  allowed_risk_levels: RiskLevel[];
  allowed_channels: AutoblogChannel[];
  dry_run: boolean;
  circuit_state: CircuitState;
  circuit_opened_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AutoblogQueueItem {
  id: string;
  status: AutoblogQueueStatus;
  channel: AutoblogChannel;
  topic: string | null;
  planned_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  confidence: number | null;
  risk: RiskLevel | null;
  provider_used: string | null;
  fallback_used: boolean;
  dedupe_key: string | null;
  error: string | null;
  created_at: string;
}

export interface AutoblogDraft {
  id: string;
  queue_id: string;
  title: string | null;
  body: string | null;
  format: string;
  preview_url: string | null;
  created_at: string;
}

export interface AutoblogRun {
  id: string;
  queue_id: string | null;
  phase: AutoblogPhase;
  outcome: AutoblogOutcome;
  reason: string | null;
  circuit_state: string;
  failures: number;
  heal_attempted: boolean;
  created_at: string;
}

export interface AutoblogGateResult {
  allowed: boolean;
  reason?: string;
}

export interface AutoblogPlanDecision {
  allowed: boolean;
  reason: string;
  channel?: AutoblogChannel;
  topic?: string;
  plannedAt?: string;
}
