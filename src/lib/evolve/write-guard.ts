/**
 * Write Guard — Kill Conversation Loops
 * Detects repeated responses and forces write or failure
 */

import { 
  CodeAgentPhase,
  type CodeAgentState, 
  type WriteGuardResult,
  LOOP_DETECTION_THRESHOLD,
  MAX_PLAN_TURNS,
} from './codeagent-types';

// ═══════════════════════════════════════════════════════════════
// HASH UTILITIES
// ═══════════════════════════════════════════════════════════════

/**
 * Simple hash function for response content
 */
function hashResponse(response: string): string {
  // Simple djb2 hash for quick comparison
  let hash = 5381;
  for (let i = 0; i < response.length; i++) {
    hash = ((hash << 5) + hash) + response.charCodeAt(i);
  }
  return (hash >>> 0).toString(16);
}

// ═══════════════════════════════════════════════════════════════
// WRITE GUARD CLASS
// ═══════════════════════════════════════════════════════════════

class WriteGuardClient {
  /**
   * Check if we should force write or abort
   */
  check(state: CodeAgentState, newResponse?: string): WriteGuardResult {
    const result: WriteGuardResult = {
      should_force_write: false,
      is_loop_detected: false,
      reason: '',
    };

    // Check 1: Max plan turns exceeded
    if (state.plan_turns >= MAX_PLAN_TURNS) {
      result.should_force_write = true;
      result.reason = `Max plan turns (${MAX_PLAN_TURNS}) exceeded. Forcing WRITE phase.`;
      return result;
    }

    // Check 2: Loop detection via response hash
    if (newResponse) {
      const hash = hashResponse(newResponse);
      const occurrences = state.response_hashes.filter(h => h === hash).length;
      
      if (occurrences >= LOOP_DETECTION_THRESHOLD) {
        result.is_loop_detected = true;
        result.should_force_write = true;
        result.reason = `Loop detected: same response seen ${occurrences + 1} times.`;
        return result;
      }
    }

    // Check 3: Repeated exact responses
    if (state.last_response_hash && newResponse) {
      const newHash = hashResponse(newResponse);
      if (newHash === state.last_response_hash) {
        result.is_loop_detected = true;
        result.should_force_write = true;
        result.reason = 'Consecutive identical responses detected.';
        return result;
      }
    }

    // Check 4: Write timeout
    if (state.write_started_at) {
      const elapsed = Date.now() - state.write_started_at.getTime();
      if (elapsed > 60000) { // 1 minute timeout
        result.should_force_write = false; // Can't force, need to fail
        result.reason = 'Write timeout exceeded. Aborting.';
        return result;
      }
    }

    result.reason = 'No issues detected.';
    return result;
  }

  /**
   * Record a response for loop detection
   */
  recordResponse(state: CodeAgentState, response: string): CodeAgentState {
    const hash = hashResponse(response);
    return {
      ...state,
      last_response_hash: hash,
      response_hashes: [...state.response_hashes, hash],
    };
  }

  /**
   * Increment plan turns
   */
  incrementPlanTurns(state: CodeAgentState): CodeAgentState {
    return {
      ...state,
      plan_turns: state.plan_turns + 1,
    };
  }

  /**
   * Check if write is required (no files written yet)
   */
  isWriteRequired(state: CodeAgentState): boolean {
    return state.files_written.length === 0;
  }

  /**
   * Validate that write phase produced output
   */
  validateWriteOutput(state: CodeAgentState): { valid: boolean; error?: string } {
    if (state.files_written.length === 0) {
      return {
        valid: false,
        error: 'NO_WRITE_OCCURRED: WRITE phase completed but no files were written.',
      };
    }

    // Check all files have content
    const emptyFiles = state.files_written.filter(f => !f.content || f.content.trim().length === 0);
    if (emptyFiles.length > 0) {
      return {
        valid: false,
        error: `Empty content in files: ${emptyFiles.map(f => f.file_path).join(', ')}`,
      };
    }

    return { valid: true };
  }

  /**
   * Create a clean initial state
   */
  createInitialState(evolution_id: string): CodeAgentState {
    return {
      phase: CodeAgentPhase.IDLE,
      evolution_id,
      plan_turns: 0,
      max_plan_turns: MAX_PLAN_TURNS,
      write_started_at: null,
      files_written: [],
      ts_errors: [],
      ts_fix_attempts: 0,
      max_ts_fix_attempts: 2,
      forced_write: false,
      loop_detected: false,
      last_response_hash: null,
      response_hashes: [],
      finalized: false,
      error: null,
    };
  }
}

// ═══════════════════════════════════════════════════════════════
// SINGLETON EXPORT
// ═══════════════════════════════════════════════════════════════

export const writeGuard = new WriteGuardClient();
export { WriteGuardClient };
