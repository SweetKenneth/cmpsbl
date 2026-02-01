/**
 * Atlas Control Plane Types
 * v7.0.0 — Single-source-of-truth substrate interface
 */

export type AtlasOp = 
  | 'dialogue'
  | 'registry'
  | 'run_action'
  | 'seba'
  | 'autoblog'
  | 'tests'
  | 'intel'
  | 'capabilities'
  | 'audit';

export type AtlasMode = 'observe' | 'advisory' | 'governed';

export type AtlasStatus = 'success' | 'fail' | 'blocked' | 'dry_run';

export interface AtlasRequest {
  op: AtlasOp;
  payload?: Record<string, unknown>;
  dry_run?: boolean;
  trace_id?: string;
}

export interface AtlasResponse<T = unknown> {
  ok: boolean;
  op: AtlasOp;
  target?: string;
  dry_run: boolean;
  output?: T;
  warnings?: string[];
  error?: string;
  trace_id: string;
  execution_ms: number;
}

export interface AtlasCapability {
  key: string;
  enabled: boolean;
  updated_at: string;
  updated_by?: string;
  notes?: string;
}

export interface AtlasAuditEntry {
  id: string;
  ts: string;
  actor?: string;
  actor_role?: string;
  op: string;
  target?: string;
  payload_redacted?: Record<string, unknown>;
  result_summary?: string;
  status: AtlasStatus;
  trace_id: string;
  execution_ms?: number;
  dry_run?: boolean;
}

export interface ModuleRegistryEntry {
  id: string;
  name: string;
  layer: 'kernel' | 'cognitive' | 'operational' | 'administrative' | 'orchestrator';
  status: 'healthy' | 'degraded' | 'offline';
  actions: ModuleAction[];
  capabilities: string[];
}

export interface ModuleAction {
  id: string;
  name: string;
  description?: string;
  risk: 'low' | 'medium' | 'high';
  reversible: boolean;
  requiresConfirmation: boolean;
}

// SEBA Commands
export type SEBACmd = 
  | 'status' | 'enable' | 'disable' | 'mode' 
  | 'cycle' | 'propose' | 'review' | 'approve' 
  | 'reject' | 'execute' | 'rollback' | 'history';

// Autoblog Commands
export type AutoblogCmd = 
  | 'status' | 'draft' | 'publish' | 'schedule' 
  | 'pause' | 'resume' | 'queue' | 'history';

// Test Commands
export type TestCmd = 'smoke' | 'module' | 'full';
export type TestDepth = 'quick' | 'standard' | 'deep';

export interface TestResult {
  cmd: TestCmd;
  target?: string;
  depth: TestDepth;
  passed: number;
  failed: number;
  skipped: number;
  duration_ms: number;
  summary: string;
  details: TestDetail[];
}

export interface TestDetail {
  name: string;
  status: 'pass' | 'fail' | 'skip';
  message?: string;
  duration_ms: number;
}

export interface IntelSummary {
  module: string;
  type: 'clm' | 'learning' | 'memory' | 'pattern';
  title: string;
  summary: string;
  confidence: number;
  timestamp: string;
  data?: Record<string, unknown>;
}

// Dialogue types
export interface DialogueMessage {
  role: 'user' | 'atlas' | 'system';
  content: string;
  timestamp: string;
  trace_id?: string;
  action_card?: ActionCard;
}

export interface ActionCard {
  id: string;
  title: string;
  description: string;
  module: string;
  action: string;
  args?: Record<string, unknown>;
  risk: 'low' | 'medium' | 'high';
  requires_approval: boolean;
  dry_run_result?: Record<string, unknown>;
}

// Secret patterns to redact
export const SECRET_PATTERNS = [
  /sk_[a-zA-Z0-9_-]{20,}/gi,
  /pk_[a-zA-Z0-9_-]{20,}/gi,
  /api[_-]?key[=:\s]["']?[a-zA-Z0-9_-]+["']?/gi,
  /bearer\s+[a-zA-Z0-9_.-]+/gi,
  /token[=:\s]["']?[a-zA-Z0-9_.-]+["']?/gi,
  /password[=:\s]["']?[^\s"']+["']?/gi,
  /secret[=:\s]["']?[^\s"']+["']?/gi,
  /supabase_service_role_key/gi,
  /[a-zA-Z0-9_]+_KEY=[^\s]+/gi,
];
