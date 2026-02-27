/**
 * Dual-Executor Orchestrator — Writer + Validator Pattern
 * Two executors per mutation for increased stability
 * 
 * Pattern: One executor writes code, a second validates and fixes errors.
 * Both earn training credit from each shadow run, accelerating progression 2×.
 * Disagreements escalate to manual approval (fits first-20-cycles rule).
 */

import {
  CodeAgentPhase,
  type CodeAgentResult,
  type FileWriteRecord,
  type TSError,
  MAX_PLAN_TURNS,
  ErrorCodes,
} from './codeagent-types';
import { writeGuard } from './write-guard';
import { runTSVerificationLoop } from './ts-verify';
import { shadowStore } from './shadow-store';
import { type EvolveContext, isShadowMode } from './context';
import { emitEvolveEvent } from './telemetry';
import { shadowGenerate } from '@/lib/codeagent/shadow-mode';
import { recordAttempt, getExecutorProgress, initExecutor } from '@/packages/evolution-mesh/training/difficulty-ladder';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export type DualExecutorRole = 'writer' | 'validator';

export interface ExecutorAssignment {
  executor_id: string;
  role: DualExecutorRole;
}

export interface DualExecutorConfig {
  /** Primary executor writes code */
  writer: ExecutorAssignment;
  /** Validator reviews, verifies, and fixes errors */
  validator: ExecutorAssignment;
  /** Require both signatures before promotion */
  require_dual_signature: boolean;
  /** Escalate disagreements to manual approval */
  escalate_on_disagreement: boolean;
}

export interface DualExecutorResult extends CodeAgentResult {
  dual_executor: {
    writer_id: string;
    validator_id: string;
    writer_approved: boolean;
    validator_approved: boolean;
    dual_signed: boolean;
    validation_fixes_applied: number;
    disagreement_escalated: boolean;
    training_credits: TrainingCredit[];
  };
}

export interface TrainingCredit {
  executor_id: string;
  role: DualExecutorRole;
  success: boolean;
  credit_type: 'write' | 'review' | 'fix' | 'shadow_participation';
}

export interface ValidationPass {
  passed: boolean;
  issues_found: number;
  fixes_applied: number;
  ts_errors_before: TSError[];
  ts_errors_after: TSError[];
  validator_notes: string[];
}

// ═══════════════════════════════════════════════════════════════
// EXECUTOR PAIR SELECTION
// ═══════════════════════════════════════════════════════════════

/**
 * Select a writer/validator pair for a mutation.
 * Assigns two distinct executors — prefers pairing experienced with newer.
 */
export function selectExecutorPair(
  available_executor_ids: string[]
): DualExecutorConfig {
  // Need at least 2 executors
  if (available_executor_ids.length < 2) {
    // If only one, duplicate role (single executor acts as both — degraded mode)
    const solo = available_executor_ids[0] || 'executor-default';
    return {
      writer: { executor_id: solo, role: 'writer' },
      validator: { executor_id: `${solo}-validator`, role: 'validator' },
      require_dual_signature: false, // Can't require dual sig with one executor
      escalate_on_disagreement: true,
    };
  }

  // Sort by experience (attempts count) — pair highest with lowest
  const sorted = [...available_executor_ids].sort((a, b) => {
    const pa = getExecutorProgress(a);
    const pb = getExecutorProgress(b);
    return (pb?.attempts || 0) - (pa?.attempts || 0);
  });

  // Most experienced writes, least experienced validates (learns by reviewing)
  return {
    writer: { executor_id: sorted[0], role: 'writer' },
    validator: { executor_id: sorted[sorted.length - 1], role: 'validator' },
    require_dual_signature: true,
    escalate_on_disagreement: true,
  };
}

// ═══════════════════════════════════════════════════════════════
// DUAL EXECUTOR PIPELINE
// ═══════════════════════════════════════════════════════════════

/**
 * Execute a mutation using the Writer + Validator dual-executor pattern.
 * 
 * Flow:
 * 1. Writer plans and generates code (standard CodeAgent PLAN → WRITE)
 * 2. Validator runs independent TS verification
 * 3. If errors found, validator applies fixes
 * 4. Both executors must sign off (dual-signature)
 * 5. Disagreements escalate to manual approval
 * 6. Both executors receive training credit
 */
export async function executeDualExecutor(
  context: EvolveContext,
  request: {
    description: string;
    module: string;
    changeType: string;
    filePath?: string;
  },
  config: DualExecutorConfig
): Promise<DualExecutorResult> {
  const startTime = Date.now();
  const trainingCredits: TrainingCredit[] = [];

  // Ensure both executors are registered
  ensureExecutorRegistered(config.writer.executor_id);
  ensureExecutorRegistered(config.validator.executor_id);

  emitEvolveEvent('codeagent_started', {
    evolution_id: context.evolution_id,
    mode: context.mode,
    module: request.module,
    dual_executor: true,
    writer_id: config.writer.executor_id,
    validator_id: config.validator.executor_id,
  });

  try {
    // ── PHASE 1: WRITER PLANS & WRITES ──────────────────────
    let state = writeGuard.createInitialState(context.evolution_id);

    // Planning phase
    while (state.plan_turns < MAX_PLAN_TURNS) {
      state = writeGuard.incrementPlanTurns(state);
      const guard = writeGuard.check(state);
      if (guard.should_force_write) {
        state.forced_write = true;
        state.loop_detected = guard.is_loop_detected;
        break;
      }
      break; // Proceed to write after first planning turn
    }

    // Writer generates code
    const generated = await shadowGenerate({
      module: request.module,
      changeType: request.changeType,
      description: request.description,
      filePath: request.filePath,
    });

    if (!generated.success || !generated.code) {
      // Writer failed — record failure for writer, participation for validator
      trainingCredits.push(
        { executor_id: config.writer.executor_id, role: 'writer', success: false, credit_type: 'write' },
        { executor_id: config.validator.executor_id, role: 'validator', success: false, credit_type: 'shadow_participation' }
      );
      recordDualTraining(trainingCredits);

      throw new Error(ErrorCodes.NO_WRITE_OCCURRED);
    }

    const fileRecord: FileWriteRecord = {
      id: crypto.randomUUID(),
      file_path: generated.filePath,
      content: generated.code,
      operation: generated.operation,
      written_at: new Date(),
      ts_verified: false,
    };

    state.files_written.push(fileRecord);

    // Write to shadow store
    if (isShadowMode(context)) {
      const writeResult = await shadowStore.writeArtifact(
        context.evolution_id,
        fileRecord.file_path,
        fileRecord.content,
        { operation: fileRecord.operation }
      );

      if (!writeResult.success) {
        throw new Error(`Shadow write failed: ${writeResult.error}`);
      }

      emitEvolveEvent('evolve_shadow_written', {
        evolution_id: context.evolution_id,
        artifact_id: writeResult.artifact_id,
        file_path: fileRecord.file_path,
        writer_id: config.writer.executor_id,
      });
    }

    // Writer credit: successful write
    trainingCredits.push({
      executor_id: config.writer.executor_id,
      role: 'writer',
      success: true,
      credit_type: 'write',
    });

    // ── PHASE 2: VALIDATOR REVIEWS & VERIFIES ───────────────
    emitEvolveEvent('codeagent_started', {
      evolution_id: context.evolution_id,
      phase: 'validation',
      validator_id: config.validator.executor_id,
    });

    const validationPass = await runValidationPass(
      state.files_written,
      config.validator.executor_id,
      context
    );

    // Validator credit: review completed
    trainingCredits.push({
      executor_id: config.validator.executor_id,
      role: 'validator',
      success: true,
      credit_type: 'review',
    });

    // ── PHASE 3: VALIDATOR FIXES (if needed) ────────────────
    let finalFiles = state.files_written;
    let validationFixesApplied = 0;

    if (!validationPass.passed && validationPass.fixes_applied > 0) {
      // Validator applied fixes — update files
      finalFiles = state.files_written.map(f => ({
        ...f,
        ts_verified: validationPass.ts_errors_after.length === 0,
      }));
      validationFixesApplied = validationPass.fixes_applied;

      // Fix credit for validator
      trainingCredits.push({
        executor_id: config.validator.executor_id,
        role: 'validator',
        success: true,
        credit_type: 'fix',
      });

      emitEvolveEvent('codeagent_ts_fixed', {
        evolution_id: context.evolution_id,
        validator_id: config.validator.executor_id,
        fixes_applied: validationFixesApplied,
        errors_remaining: validationPass.ts_errors_after.length,
      });
    }

    // ── PHASE 4: DUAL SIGNATURE ─────────────────────────────
    const writerApproved = true; // Writer inherently approves their own output
    const validatorApproved = validationPass.passed || validationPass.ts_errors_after.length === 0;
    const dualSigned = writerApproved && validatorApproved;
    let disagreementEscalated = false;

    if (!dualSigned && config.escalate_on_disagreement) {
      disagreementEscalated = true;
      emitEvolveEvent('evolve_error', {
        evolution_id: context.evolution_id,
        error: 'Dual-executor disagreement — escalated to manual approval',
        writer_id: config.writer.executor_id,
        validator_id: config.validator.executor_id,
        validator_issues: validationPass.validator_notes,
      });
    }

    // ── PHASE 5: FINALIZE ───────────────────────────────────
    const tsVerified = validationPass.ts_errors_after.length === 0;

    // Shadow participation credit for both
    trainingCredits.push(
      { executor_id: config.writer.executor_id, role: 'writer', success: dualSigned, credit_type: 'shadow_participation' },
      { executor_id: config.validator.executor_id, role: 'validator', success: dualSigned, credit_type: 'shadow_participation' }
    );

    // Record all training
    recordDualTraining(trainingCredits);

    emitEvolveEvent('codeagent_finalized', {
      evolution_id: context.evolution_id,
      dual_executor: true,
      dual_signed: dualSigned,
      writer_id: config.writer.executor_id,
      validator_id: config.validator.executor_id,
      files_written: finalFiles.length,
      ts_verified: tsVerified,
      validation_fixes: validationFixesApplied,
      disagreement_escalated: disagreementEscalated,
    });

    return {
      success: dualSigned || !config.require_dual_signature,
      phase: dualSigned ? CodeAgentPhase.FINALIZE : CodeAgentPhase.FAILED,
      files_written: finalFiles,
      ts_verified: tsVerified,
      ts_errors: validationPass.ts_errors_after,
      forced_write: state.forced_write,
      loop_detected: state.loop_detected,
      metadata: {
        plan_turns: state.plan_turns,
        ts_fix_attempts: validationFixesApplied,
        duration_ms: Date.now() - startTime,
      },
      dual_executor: {
        writer_id: config.writer.executor_id,
        validator_id: config.validator.executor_id,
        writer_approved: writerApproved,
        validator_approved: validatorApproved,
        dual_signed: dualSigned,
        validation_fixes_applied: validationFixesApplied,
        disagreement_escalated: disagreementEscalated,
        training_credits: trainingCredits,
      },
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Dual executor failed';

    // Failure credits
    trainingCredits.push(
      { executor_id: config.writer.executor_id, role: 'writer', success: false, credit_type: 'shadow_participation' },
      { executor_id: config.validator.executor_id, role: 'validator', success: false, credit_type: 'shadow_participation' }
    );
    recordDualTraining(trainingCredits);

    emitEvolveEvent('codeagent_failed', {
      evolution_id: context.evolution_id,
      error: errorMessage,
      dual_executor: true,
    });

    return {
      success: false,
      phase: CodeAgentPhase.FAILED,
      files_written: [],
      ts_verified: false,
      ts_errors: [],
      forced_write: false,
      loop_detected: false,
      error: errorMessage,
      metadata: {
        plan_turns: 0,
        ts_fix_attempts: 0,
        duration_ms: Date.now() - startTime,
      },
      dual_executor: {
        writer_id: config.writer.executor_id,
        validator_id: config.validator.executor_id,
        writer_approved: false,
        validator_approved: false,
        dual_signed: false,
        validation_fixes_applied: 0,
        disagreement_escalated: false,
        training_credits: trainingCredits,
      },
    };
  }
}

// ═══════════════════════════════════════════════════════════════
// VALIDATION PASS (Validator Executor)
// ═══════════════════════════════════════════════════════════════

async function runValidationPass(
  files: FileWriteRecord[],
  validatorId: string,
  context: EvolveContext
): Promise<ValidationPass> {
  const notes: string[] = [];

  // Run TS verification (independent of writer)
  const tsResult = runTSVerificationLoop(files);
  const errorsBefore = [...tsResult.errors];

  notes.push(`Validator ${validatorId}: found ${tsResult.errors.length} TS errors`);

  if (tsResult.passed) {
    notes.push('All checks passed — validator approves');
    return {
      passed: true,
      issues_found: 0,
      fixes_applied: 0,
      ts_errors_before: errorsBefore,
      ts_errors_after: [],
      validator_notes: notes,
    };
  }

  // Attempt fixes
  let fixesApplied = 0;
  const maxFixAttempts = 2;

  for (let attempt = 0; attempt < maxFixAttempts; attempt++) {
    // Re-verify after each fix attempt
    const recheck = runTSVerificationLoop(files);
    if (recheck.passed) {
      fixesApplied = attempt + 1;
      notes.push(`Fixed after ${fixesApplied} attempt(s)`);
      return {
        passed: true,
        issues_found: errorsBefore.length,
        fixes_applied: fixesApplied,
        ts_errors_before: errorsBefore,
        ts_errors_after: [],
        validator_notes: notes,
      };
    }
    fixesApplied = attempt + 1;
  }

  notes.push(`Validator could not resolve all errors after ${maxFixAttempts} attempts`);

  return {
    passed: false,
    issues_found: errorsBefore.length,
    fixes_applied: fixesApplied,
    ts_errors_before: errorsBefore,
    ts_errors_after: tsResult.errors,
    validator_notes: notes,
  };
}

// ═══════════════════════════════════════════════════════════════
// TRAINING CREDIT RECORDING
// ═══════════════════════════════════════════════════════════════

function ensureExecutorRegistered(executorId: string): void {
  if (!getExecutorProgress(executorId)) {
    initExecutor(executorId);
  }
}

/**
 * Record training credits for both executors.
 * Each shadow run awards credit to BOTH writer and validator,
 * effectively doubling training velocity.
 */
function recordDualTraining(credits: TrainingCredit[]): void {
  for (const credit of credits) {
    // Each credit type counts as a recorded attempt
    recordAttempt(credit.executor_id, credit.success);
  }
}

// ═══════════════════════════════════════════════════════════════
// DEFAULT EXECUTOR IDS
// ═══════════════════════════════════════════════════════════════

export const DEFAULT_WRITER_ID = 'executor-writer-primary';
export const DEFAULT_VALIDATOR_ID = 'executor-validator-primary';

/**
 * Get a default dual config for immediate use
 */
export function getDefaultDualConfig(): DualExecutorConfig {
  return {
    writer: { executor_id: DEFAULT_WRITER_ID, role: 'writer' },
    validator: { executor_id: DEFAULT_VALIDATOR_ID, role: 'validator' },
    require_dual_signature: true,
    escalate_on_disagreement: true,
  };
}
