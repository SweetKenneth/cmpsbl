/**
 * CodeAgent Types — Phase System and Write Guarantees
 * v1.0.0 — Prevents conversation loops, guarantees artifact output
 */

// ═══════════════════════════════════════════════════════════════
// PHASE ENUM
// ═══════════════════════════════════════════════════════════════

export enum CodeAgentPhase {
  IDLE = 'IDLE',
  READ = 'READ',           // Gather context, read related files
  PLAN = 'PLAN',           // Analyze and plan changes
  WRITE = 'WRITE',         // Generate code
  READ_VERIFY = 'READ_VERIFY', // Re-read to check output
  FIX_ERRORS = 'FIX_ERRORS',   // Fix any issues found
  VERIFY = 'VERIFY',       // Final validation
  FINALIZE = 'FINALIZE',   // Apply and record
  FAILED = 'FAILED',
}

// ═══════════════════════════════════════════════════════════════
// STATE TYPES
// ═══════════════════════════════════════════════════════════════

export interface CodeAgentState {
  phase: CodeAgentPhase;
  evolution_id: string | null;
  plan_turns: number;
  max_plan_turns: number;
  write_started_at: Date | null;
  files_written: FileWriteRecord[];
  ts_errors: TSError[];
  ts_fix_attempts: number;
  max_ts_fix_attempts: number;
  forced_write: boolean;
  loop_detected: boolean;
  last_response_hash: string | null;
  response_hashes: string[];
  finalized: boolean;
  error: string | null;
}

export interface FileWriteRecord {
  id: string;
  file_path: string;
  content: string;
  diff?: string;
  operation: 'create' | 'modify' | 'delete';
  written_at: Date;
  ts_verified: boolean;
}

export interface TSError {
  file: string;
  line: number;
  column: number;
  message: string;
  code: string;
}

// ═══════════════════════════════════════════════════════════════
// RESULT TYPES
// ═══════════════════════════════════════════════════════════════

export interface CodeAgentResult {
  success: boolean;
  phase: CodeAgentPhase;
  files_written: FileWriteRecord[];
  ts_verified: boolean;
  ts_errors: TSError[];
  forced_write: boolean;
  loop_detected: boolean;
  error?: string;
  metadata?: {
    plan_turns: number;
    ts_fix_attempts: number;
    duration_ms: number;
  };
}

export interface WriteGuardResult {
  should_force_write: boolean;
  is_loop_detected: boolean;
  reason: string;
}

// ═══════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════

export const MAX_PLAN_TURNS = 3;
export const MAX_TS_FIX_ATTEMPTS = 2;
export const WRITE_TIMEOUT_MS = 60000; // 1 minute
export const LOOP_DETECTION_THRESHOLD = 2; // Same response hash seen twice = loop

// ═══════════════════════════════════════════════════════════════
// ERROR CODES
// ═══════════════════════════════════════════════════════════════

export const ErrorCodes = {
  NO_WRITE_OCCURRED: 'NO_WRITE_OCCURRED',
  WRITE_TIMEOUT: 'WRITE_TIMEOUT',
  LOOP_DETECTED: 'LOOP_DETECTED',
  TS_VERIFICATION_FAILED: 'TS_VERIFICATION_FAILED',
  FORCED_WRITE_FAILED: 'FORCED_WRITE_FAILED',
  CONTEXT_INVALID: 'CONTEXT_INVALID',
} as const;

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];
