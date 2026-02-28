/**
 * CONTROL PLANE — Core Primitives
 * 
 * The Control Plane is the human interface for understanding CMPSBL
 * and the internal maintenance + insight loop for the machine.
 * 
 * Members: INTEL, ENGINEER, DECODE, AUDIT
 * 
 * INTEL    → User-facing aggregation + explanation (Founder-only)
 * ENGINEER → Internal maintenance node (no user UI surface)
 * DECODE   → Conversational interpretation service
 * AUDIT    → Compliance + trail service
 */

// ═══════════════════════════════════════════════════════════════════════════════
// CONTROL PLANE MEMBERSHIP
// ═══════════════════════════════════════════════════════════════════════════════

export const CONTROL_PLANE_NODES = ['INTEL', 'ENGINEER', 'DECODE', 'AUDIT'] as const;
export type ControlPlaneNode = typeof CONTROL_PLANE_NODES[number];

/** Whether a node is user-facing */
export const CONTROL_PLANE_VISIBILITY: Record<ControlPlaneNode, 'founder' | 'internal'> = {
  INTEL: 'founder',
  ENGINEER: 'internal',
  DECODE: 'internal',
  AUDIT: 'internal',
};

// ═══════════════════════════════════════════════════════════════════════════════
// INTEL SIGNAL — Normalized event/metric/anomaly/insight payload
// ═══════════════════════════════════════════════════════════════════════════════

export type IntelCategory =
  | 'health'
  | 'stability'
  | 'performance'
  | 'reliability'
  | 'resilience'
  | 'governance'
  | 'cost'
  | 'learning'
  | 'packs'
  | 'crown-jewels'
  | 'security'
  | 'diligence';

export type IntelSeverity = 'info' | 'warn' | 'critical';

export interface IntelSignal {
  id: string;
  source: string;           // node/mesh/service name
  category: IntelCategory;
  severity: IntelSeverity;
  headline: string;
  detail: string;
  timestamp: string;
  trace_id?: string;
  correlation_id?: string;
  suggested_action?: string;
  data?: Record<string, unknown>;
  /** Dedupe fingerprint — signals with same fingerprint collapse */
  fingerprint?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// INTEL CARD — UI-ready digest block
// ═══════════════════════════════════════════════════════════════════════════════

export interface IntelCard {
  id: string;
  signal_ids: string[];
  category: IntelCategory;
  severity: IntelSeverity;
  headline: string;
  what_changed: string;
  why_it_matters: string;
  suggested_next_step: string;
  details_json: Record<string, unknown>;
  first_seen: string;
  last_seen: string;
  occurrence_count: number;
  source: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ENGINEER FINDING — engine/breaker/test finding
// ═══════════════════════════════════════════════════════════════════════════════

export type FindingSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface EngineerFinding {
  id: string;
  category: 'engine' | 'breaker' | 'fallback' | 'health' | 'regression' | 'error-pattern' | 'dependency';
  severity: FindingSeverity;
  title: string;
  description: string;
  source_node: string;
  evidence: Record<string, unknown>;
  timestamp: string;
  resolved: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ENGINEER PROPOSAL — structured proposal with risk, scope, rollback plan
// ═══════════════════════════════════════════════════════════════════════════════

export type ProposalStatus = 'draft' | 'reviewed' | 'accepted' | 'rejected' | 'applied';

export interface EngineerProposal {
  id: string;
  finding_id: string;
  title: string;
  description: string;
  risk_level: 'low' | 'medium' | 'high';
  scope: string;
  rollback_plan: string;
  status: ProposalStatus;
  created_at: string;
  reviewed_at?: string;
  applied_at?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// INTEL EXPORT REPORT — stable JSON schema for investor diligence
// ═══════════════════════════════════════════════════════════════════════════════

export interface IntelExportReport {
  schema_version: '1.0';
  generated_at: string;
  system_id: 'cmpsbl-substrate';
  summary: {
    total_signals: number;
    critical_count: number;
    warn_count: number;
    info_count: number;
    top_categories: Array<{ category: IntelCategory; count: number }>;
  };
  top_cards: IntelCard[];
  recent_criticals: IntelCard[];
  topic_mastery: TopicMasteryHighlight[];
  crown_jewels: {
    released: number;
    reserved: number;
    total_packs: number;
  };
  diligence: {
    last_run?: string;
    passed: number;
    minor: number;
    critical: number;
    total: number;
  };
  engineer: {
    active_findings: number;
    pending_proposals: number;
    resolved_this_period: number;
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// CLM TOPIC PIPELINE — Global + Node Solo + Dynamic Solo
// ═══════════════════════════════════════════════════════════════════════════════

export type TopicScope = 'global' | 'node-solo' | 'dynamic-solo';

export interface CLMTopic {
  id: string;
  scope: TopicScope;
  node?: string;              // only for node-solo / dynamic-solo
  title: string;
  description: string;
  category: string;
  mastery_score: number;      // 0..1
  mastery_threshold: number;  // once score >= threshold, reduce repetition
  call_count: number;
  novelty_score: number;      // 0..1 — decays if outputs repeat
  last_called: string | null;
  fingerprints: string[];     // dedup hashes of prior outputs
  active: boolean;
}

export interface TopicMasteryHighlight {
  node: string;
  topic_title: string;
  mastery_score: number;
  status: 'mastered' | 'progressing' | 'stale' | 'new';
}

export interface DynamicTopicProposal {
  id: string;
  node: string;
  proposed_title: string;
  proposed_description: string;
  rationale: string;
  scope_valid: boolean;
  weight: number;             // max 0.3 (30% allocation)
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONTROL PLANE FEATURE FLAG
// ═══════════════════════════════════════════════════════════════════════════════

export interface ControlPlaneConfig {
  enabled: boolean;
  intel_panel_enabled: boolean;
  engineer_scheduler_enabled: boolean;
  clm_topic_pipeline_enabled: boolean;
}

export const DEFAULT_CONTROL_PLANE_CONFIG: ControlPlaneConfig = {
  enabled: true,
  intel_panel_enabled: true,
  engineer_scheduler_enabled: true,
  clm_topic_pipeline_enabled: true,
};
