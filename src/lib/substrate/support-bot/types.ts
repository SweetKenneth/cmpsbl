/**
 * Support Bot Types
 * v1.0.0 — Governed Evolving Support System
 * 
 * Type definitions for the substrate-integrated support bot
 * that learns from verified resolutions without self-modification.
 */

// ============================================================================
// Core Types
// ============================================================================

export type SupportBotPhase = 
  | 'idle'
  | 'understanding'    // Decode intent + sentiment
  | 'recalling'        // Search memory for relevant knowledge
  | 'reasoning'        // Build response with confidence scoring
  | 'validating'       // Governance check on response
  | 'responding'       // Deliver answer
  | 'escalating'       // Confidence too low, hand off
  | 'learning';        // Reinforce from verified resolution

export type EscalationReason = 
  | 'low_confidence'
  | 'ambiguous_intent'
  | 'no_relevant_memory'
  | 'governance_block'
  | 'user_requested'
  | 'complex_issue'
  | 'sensitive_topic';

export type TicketStatus = 
  | 'open'
  | 'in_progress'
  | 'awaiting_user'
  | 'escalated'
  | 'resolved'
  | 'closed';

export type ResolutionVerification = 
  | 'pending'
  | 'verified'
  | 'rejected'
  | 'needs_review';

// ============================================================================
// Intent & Sentiment
// ============================================================================

export interface DetectedIntent {
  primary: string;
  secondary?: string;
  confidence: number;
  keywords: string[];
  category: IntentCategory;
}

export type IntentCategory = 
  | 'question'
  | 'bug_report'
  | 'feature_request'
  | 'how_to'
  | 'troubleshoot'
  | 'feedback'
  | 'account'
  | 'general';

export interface DetectedSentiment {
  polarity: 'positive' | 'neutral' | 'negative';
  intensity: number;    // 0-1
  frustration: number;  // 0-1, specifically tracks frustration
  urgency: number;      // 0-1
}

// ============================================================================
// Memory & Knowledge
// ============================================================================

export interface SupportMemory {
  id: string;
  question_pattern: string;
  answer: string;
  confidence: number;
  times_used: number;
  times_helpful: number;
  times_escalated: number;
  category: IntentCategory;
  keywords: string[];
  created_at: string;
  last_used_at: string;
  verified: boolean;
  source_resolution_id?: string;
}

export interface MemoryMatch {
  memory: SupportMemory;
  similarity: number;
  relevance_score: number;
  recency_boost: number;
}

export interface RecallResult {
  matches: MemoryMatch[];
  total_searched: number;
  search_time_ms: number;
  coverage_score: number;
}

// ============================================================================
// Tickets & Resolutions
// ============================================================================

export interface SupportTicket {
  id: string;
  user_id?: string;
  session_id: string;
  question: string;
  intent: DetectedIntent;
  sentiment: DetectedSentiment;
  status: TicketStatus;
  priority: 'low' | 'medium' | 'high' | 'critical';
  assigned_to?: 'bot' | 'human';
  escalation_reason?: EscalationReason;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  resolution_id?: string;
}

export interface Resolution {
  id: string;
  ticket_id: string;
  answer: string;
  explanation: string;
  confidence: number;
  sources: string[];
  resolved_by: 'bot' | 'human';
  verification: ResolutionVerification;
  user_feedback?: UserFeedback;
  learning_applied: boolean;
  created_at: string;
}

export interface UserFeedback {
  helpful: boolean;
  rating?: number;        // 1-5
  comment?: string;
  reported_issue?: string;
}

// ============================================================================
// Response Generation
// ============================================================================

export interface SupportResponse {
  answer: string;
  explanation?: string;
  confidence: number;
  sources: SupportMemory[];
  suggested_actions?: SuggestedAction[];
  follow_up_questions?: string[];
  escalation_available: boolean;
  governance_cleared: boolean;
}

export interface SuggestedAction {
  type: 'link' | 'command' | 'doc' | 'escalate';
  label: string;
  target: string;
  confidence: number;
}

// ============================================================================
// Pattern Detection (VISION integration)
// ============================================================================

export interface PainPattern {
  id: string;
  pattern: string;
  frequency: number;
  affected_users: number;
  first_seen: string;
  last_seen: string;
  category: IntentCategory;
  severity: 'low' | 'medium' | 'high';
  trending: boolean;
  related_tickets: string[];
  suggested_solution?: string;
}

export interface PatternAnalysis {
  patterns: PainPattern[];
  emerging_issues: string[];
  resolved_patterns: string[];
  health_score: number;
}

// ============================================================================
// Learning & Reinforcement
// ============================================================================

export interface LearningEvent {
  id: string;
  resolution_id: string;
  memory_id: string;
  reinforcement_type: 'positive' | 'negative' | 'neutral';
  delta: number;
  reason: string;
  created_at: string;
}

export interface LearningState {
  total_memories: number;
  verified_memories: number;
  pending_verifications: number;
  learning_events_today: number;
  reinforcement_budget_remaining: number;
  last_learning_at?: string;
}

// ============================================================================
// Bot State & Configuration
// ============================================================================

export interface SupportBotConfig {
  // Confidence thresholds
  min_answer_confidence: number;     // Default: 0.7
  escalation_threshold: number;      // Default: 0.5
  learning_threshold: number;        // Default: 0.8
  
  // Memory management
  max_warm_memories: number;         // Default: 1000
  memory_decay_rate: number;         // Default: 0.01
  recall_limit: number;              // Default: 10
  
  // Learning governance
  daily_learning_cap: number;        // Default: 50
  verification_required: boolean;    // Default: true
  auto_reinforce: boolean;           // Default: false
  
  // Response behavior
  include_explanations: boolean;     // Default: true
  suggest_follow_ups: boolean;       // Default: true
  max_response_length: number;       // Default: 2000
  
  // Escalation
  auto_escalate_frustration: number; // Default: 0.8
  human_available: boolean;          // Default: true
}

export interface SupportBotState {
  enabled: boolean;
  phase: SupportBotPhase;
  config: SupportBotConfig;
  learning: LearningState;
  current_session?: SessionState;
  stats: BotStats;
}

export interface SessionState {
  session_id: string;
  started_at: string;
  messages: ConversationMessage[];
  active_ticket?: SupportTicket;
  context: Record<string, unknown>;
}

export interface ConversationMessage {
  id: string;
  role: 'user' | 'bot' | 'system';
  content: string;
  timestamp: string;
  metadata?: {
    intent?: DetectedIntent;
    sentiment?: DetectedSentiment;
    confidence?: number;
    sources?: string[];
  };
}

export interface BotStats {
  total_questions: number;
  answered_by_bot: number;
  escalated: number;
  avg_confidence: number;
  avg_satisfaction: number;
  memories_created: number;
  patterns_detected: number;
  uptime_hours: number;
}

// ============================================================================
// Command Types
// ============================================================================

export type SupportCommand = 
  | { type: 'ask'; question: string }
  | { type: 'explain'; issue_id: string }
  | { type: 'learn'; resolution_id: string }
  | { type: 'escalate'; reason?: EscalationReason }
  | { type: 'feedback'; ticket_id: string; feedback: UserFeedback }
  | { type: 'patterns'; lookback_days?: number }
  | { type: 'status' }
  | { type: 'history'; limit?: number }
  | { type: 'purge_session' }
  | { type: 'configure'; config: Partial<SupportBotConfig> };

export interface SupportCommandResult {
  success: boolean;
  command: SupportCommand['type'];
  data?: unknown;
  error?: string;
  duration_ms: number;
  phase_trace: SupportBotPhase[];
}

// ============================================================================
// Audit & Compliance
// ============================================================================

export interface AuditEntry {
  id: string;
  timestamp: string;
  action: string;
  phase: SupportBotPhase;
  input_hash: string;        // Hash of user input for privacy
  output_summary: string;    // Summary, not full response
  confidence: number;
  escalated: boolean;
  memory_ids: string[];
  governance_result: boolean;
  user_id?: string;
  session_id: string;
}

export interface ComplianceReport {
  period_start: string;
  period_end: string;
  total_interactions: number;
  escalation_rate: number;
  confidence_distribution: Record<string, number>;
  learning_events: number;
  governance_blocks: number;
  avg_response_time_ms: number;
  memory_growth: number;
  audit_entries: AuditEntry[];
}
