/**
 * IMMUNITY — Type Definitions
 * Immune wrapper types for executor defense, repair, and escalation
 */

export type ImmuneSeverity = 'low' | 'medium' | 'high' | 'critical';

export type ImmuneStage =
  | 'preflight'
  | 'action'
  | 'postcheck'
  | 'repair'
  | 'escalate';

export type ImmuneOutcome =
  | 'success'
  | 'repaired_success'
  | 'escalated'
  | 'failed_safe';

export interface ImmuneEvent {
  id: string;
  ts: string;
  module: string;
  executor: string;
  scope: string;
  stage: ImmuneStage;
  severity: ImmuneSeverity;
  inputHash: string;
  context: Record<string, unknown>;
  error?: string;
  repairAttempted: boolean;
  outcome: ImmuneOutcome;
}

export interface EscalationPayload {
  eventId: string;
  module: string;
  executor: string;
  scope: string;
  failingInput: Record<string, unknown>;
  context: Record<string, unknown>;
  errorSummary: string;
  suggestedFixHint: string;
  createdAt: string;
}

/**
 * Executor contract that the immune wrapper understands
 */
export interface ExecutorMeta {
  name: string;
  scope: string;
  moduleTags?: string[];
}

export interface WrappableExecutor {
  meta: ExecutorMeta;
  run: (input: Record<string, unknown>, ctx: Record<string, unknown>) => Promise<unknown>;
}

/**
 * Repair result from the repair registry
 */
export interface RepairResult {
  repairedInput: Record<string, unknown>;
  note: string;
}
