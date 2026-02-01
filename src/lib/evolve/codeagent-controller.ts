/**
 * CodeAgent Controller — Phase-Based Execution with Write Guarantees
 * v1.0.0 — Forces write, verifies TS, prevents loops
 */

import { 
  CodeAgentPhase,
  type CodeAgentState,
  type CodeAgentResult,
  type FileWriteRecord,
  MAX_PLAN_TURNS,
  MAX_TS_FIX_ATTEMPTS,
  ErrorCodes,
} from './codeagent-types';
import { writeGuard } from './write-guard';
import { runTSVerificationLoop, type TSVerifyResult } from './ts-verify';
import { shadowStore } from './shadow-store';
import { type EvolveContext, isShadowMode } from './context';
import { emitEvolveEvent } from './telemetry';
import { shadowGenerate } from '@/lib/codeagent/shadow-mode';

// ═══════════════════════════════════════════════════════════════
// STATE MANAGEMENT
// ═══════════════════════════════════════════════════════════════

let currentState: CodeAgentState | null = null;

function getState(): CodeAgentState | null {
  return currentState;
}

function setState(state: CodeAgentState): void {
  currentState = state;
}

function clearState(): void {
  currentState = null;
}

// ═══════════════════════════════════════════════════════════════
// PHASE TRANSITIONS
// ═══════════════════════════════════════════════════════════════

function transitionTo(state: CodeAgentState, phase: CodeAgentPhase): CodeAgentState {
  const now = new Date();
  
  if (phase === CodeAgentPhase.WRITE) {
    return { ...state, phase, write_started_at: now };
  }
  
  return { ...state, phase };
}

// ═══════════════════════════════════════════════════════════════
// MAIN EXECUTION
// ═══════════════════════════════════════════════════════════════

/**
 * Execute CodeAgent with phase system and write guarantees
 */
export async function executeCodeAgent(
  context: EvolveContext,
  request: {
    description: string;
    module: string;
    changeType: string;
    filePath?: string;
  }
): Promise<CodeAgentResult> {
  const startTime = Date.now();
  
  // Initialize state
  let state = writeGuard.createInitialState(context.evolution_id);
  setState(state);
  
  emitEvolveEvent('codeagent_started', {
    evolution_id: context.evolution_id,
    mode: context.mode,
    module: request.module,
  });

  try {
    // Phase 1: PLAN (max 3 turns)
    state = transitionTo(state, CodeAgentPhase.PLAN);
    setState(state);
    
    // Simulate planning phase - in real implementation this would call LLM
    while (state.plan_turns < MAX_PLAN_TURNS) {
      state = writeGuard.incrementPlanTurns(state);
      
      // Check for forced write
      const guard = writeGuard.check(state);
      if (guard.should_force_write) {
        state.forced_write = true;
        state.loop_detected = guard.is_loop_detected;
        
        emitEvolveEvent('codeagent_forced_write', {
          evolution_id: context.evolution_id,
          reason: guard.reason,
          plan_turns: state.plan_turns,
        });
        
        if (guard.is_loop_detected) {
          emitEvolveEvent('codeagent_loop_detected', {
            evolution_id: context.evolution_id,
          });
        }
        
        break;
      }
      
      // Would normally wait for LLM response here
      // For now, we break after first turn to proceed to write
      break;
    }

    // Phase 2: WRITE (mandatory output)
    state = transitionTo(state, CodeAgentPhase.WRITE);
    setState(state);
    
    // Generate code using shadow mode
    const generated = await shadowGenerate({
      module: request.module,
      changeType: request.changeType,
      description: request.description,
      filePath: request.filePath,
    });
    
    if (!generated.success || !generated.code) {
      throw new Error(ErrorCodes.NO_WRITE_OCCURRED);
    }
    
    // Record the file
    const fileRecord: FileWriteRecord = {
      id: crypto.randomUUID(),
      file_path: generated.filePath,
      content: generated.code,
      operation: generated.operation,
      written_at: new Date(),
      ts_verified: false,
    };
    
    state.files_written.push(fileRecord);
    setState(state);
    
    // Write to shadow store if in shadow mode
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
      });
    }
    
    // Validate write output
    const writeValidation = writeGuard.validateWriteOutput(state);
    if (!writeValidation.valid) {
      throw new Error(writeValidation.error);
    }

    // Phase 3: VERIFY
    state = transitionTo(state, CodeAgentPhase.VERIFY);
    setState(state);
    
    const tsResult = runTSVerificationLoop(state.files_written);
    state.ts_errors = tsResult.errors;
    state.ts_fix_attempts = tsResult.fix_attempts;
    
    if (tsResult.passed) {
      emitEvolveEvent('codeagent_ts_verified', {
        evolution_id: context.evolution_id,
        files: state.files_written.length,
      });
      
      // Mark files as verified
      state.files_written = state.files_written.map(f => ({ ...f, ts_verified: true }));
    } else if (tsResult.partial_fail) {
      emitEvolveEvent('codeagent_ts_failed', {
        evolution_id: context.evolution_id,
        errors: tsResult.errors.length,
        fix_attempts: tsResult.fix_attempts,
      });
    }

    // Phase 4: FINALIZE
    state = transitionTo(state, CodeAgentPhase.FINALIZE);
    state.finalized = true;
    setState(state);
    
    emitEvolveEvent('codeagent_finalized', {
      evolution_id: context.evolution_id,
      files_written: state.files_written.length,
      ts_verified: tsResult.passed,
      forced_write: state.forced_write,
    });

    return {
      success: true,
      phase: CodeAgentPhase.FINALIZE,
      files_written: state.files_written,
      ts_verified: tsResult.passed,
      ts_errors: state.ts_errors,
      forced_write: state.forced_write,
      loop_detected: state.loop_detected,
      metadata: {
        plan_turns: state.plan_turns,
        ts_fix_attempts: state.ts_fix_attempts,
        duration_ms: Date.now() - startTime,
      },
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    state.phase = CodeAgentPhase.FAILED;
    state.error = errorMessage;
    setState(state);
    
    emitEvolveEvent('codeagent_failed', {
      evolution_id: context.evolution_id,
      error: errorMessage,
      phase: state.phase,
    });

    return {
      success: false,
      phase: CodeAgentPhase.FAILED,
      files_written: state.files_written,
      ts_verified: false,
      ts_errors: state.ts_errors,
      forced_write: state.forced_write,
      loop_detected: state.loop_detected,
      error: errorMessage,
      metadata: {
        plan_turns: state.plan_turns,
        ts_fix_attempts: state.ts_fix_attempts,
        duration_ms: Date.now() - startTime,
      },
    };
  } finally {
    clearState();
  }
}

/**
 * Get current CodeAgent state (for debugging)
 */
export function getCodeAgentState(): CodeAgentState | null {
  return getState();
}
