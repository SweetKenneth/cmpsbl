/**
 * AutoBlog Type Definitions v2.0
 * Extended for autonomous, self-learning operation
 */

// Database-compatible channel types (must match schema)
export type AutoblogChannel = 'changelog' | 'blog' | 'release_notes';

export type AutoblogMode = 'autonomous' | 'governed' | 'shadow' | 'off';
export type AutoblogQueueStatus = 'queued' | 'drafting' | 'ready' | 'published' | 'aborted' | 'failed';
export type AutoblogPhase = 'plan' | 'draft' | 'verify' | 'publish' | 'heal' | 'reflect';
export type AutoblogOutcome = 'success' | 'blocked' | 'failed';
export type CircuitState = 'closed' | 'open' | 'half_open';
export type RiskLevel = 'low' | 'medium' | 'high';

export type ContentSourceType = 
  | 'evolution_cycle'
  | 'brain_reflection'
  | 'external_research'
  | 'knowledge_synthesis'
  | 'self_audit'
  | 'operator_trigger';

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

export interface EvolutionDigest {
  run_id: string;
  phase: string;
  improvements: string[];
  health_delta: number;
  summary: string;
  completed_at: string;
}

export interface ResearchInsight {
  source: string;
  title: string;
  summary: string;
  relevance: number;
  topics: string[];
  discovered_at: string;
}

export interface AutonomousState {
  is_running: boolean;
  last_cycle_at: string | null;
  next_cycle_at: string | null;
  cycles_completed: number;
  posts_generated: number;
  research_insights_captured: number;
  evolution_updates_posted: number;
  current_focus: AutoblogChannel | null;
}
