/**
 * Evolution Execution Mode — Governance Barrier
 * 
 * Controls whether Evolution can apply changes internally or must export proposals
 * for external AI execution.
 * 
 * When execution_mode = "external-ai":
 *   - No executor or ENCODE mutation may run
 *   - Proposals cannot transition to "applied" internally
 *   - All apply attempts throw governance violation errors
 */

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export type EvolutionExecutionMode = 'internal' | 'external-ai';

export interface ExecutionModeConfig {
  mode: EvolutionExecutionMode;
  set_at: string;
  set_by: string;
}

export class GovernanceViolationError extends Error {
  public readonly code = 'GOVERNANCE_VIOLATION';
  public readonly execution_mode: EvolutionExecutionMode;

  constructor(action: string, mode: EvolutionExecutionMode) {
    super(
      `[GOVERNANCE VIOLATION] Action "${action}" is blocked. ` +
      `Execution mode is "${mode}". ` +
      `Internal mutation authority is revoked. ` +
      `Export proposals via generateEvolutionReport() instead.`
    );
    this.name = 'GovernanceViolationError';
    this.execution_mode = mode;
  }
}

// ═══════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════

const STORAGE_KEY = 'cmpsbl-evolution-execution-mode';

let _config: ExecutionModeConfig = {
  mode: 'external-ai', // DEFAULT: external-ai
  set_at: new Date().toISOString(),
  set_by: 'system',
};

// Load from localStorage if available
try {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    _config = { ..._config, ...JSON.parse(raw) };
  }
} catch { /* use defaults */ }

// ═══════════════════════════════════════════════════════════════
// PUBLIC API
// ═══════════════════════════════════════════════════════════════

export function getExecutionMode(): EvolutionExecutionMode {
  return _config.mode;
}

export function getExecutionModeConfig(): ExecutionModeConfig {
  return { ..._config };
}

// Hardening 8: Track mode transitions for tamper detection
const modeTransitionLog: Array<{ from: EvolutionExecutionMode; to: EvolutionExecutionMode; at: string; by: string }> = [];

export function setExecutionMode(mode: EvolutionExecutionMode, set_by = 'system'): void {
  // Hardening 9: Log every mode transition
  modeTransitionLog.push({
    from: _config.mode,
    to: mode,
    at: new Date().toISOString(),
    by: set_by,
  });
  // Cap transition log
  if (modeTransitionLog.length > 50) modeTransitionLog.shift();
  
  _config = {
    mode,
    set_at: new Date().toISOString(),
    set_by,
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(_config));
  } catch { /* silent */ }
}

export function getModeTransitionLog() {
  return [...modeTransitionLog];
}

export function isExternalAIMode(): boolean {
  return _config.mode === 'external-ai';
}

export function isInternalMode(): boolean {
  return _config.mode === 'internal';
}

/**
 * Governance enforcement gate.
 * Call this before any internal mutation attempt.
 * Throws GovernanceViolationError if execution_mode = external-ai.
 */
export function enforceExecutionBarrier(action: string): void {
  if (isExternalAIMode()) {
    throw new GovernanceViolationError(action, _config.mode);
  }
}

/**
 * Check if an action is allowed without throwing.
 */
export function isActionAllowed(action: string): { allowed: boolean; reason?: string } {
  if (isExternalAIMode()) {
    return {
      allowed: false,
      reason: `Action "${action}" blocked by external-ai execution mode. Use generateEvolutionReport() to export proposals.`,
    };
  }
  return { allowed: true };
}
