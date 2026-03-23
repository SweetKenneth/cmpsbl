/**
 * GOVERNANCE Ultimate — System 4: Governance State Machine
 * 
 * Formal state machine for governance modes with deterministic
 * transitions, approval-gated mode changes, and policy behavior
 * modifiers per mode.
 * 
 * @module governance/ultimate/governanceStateMachine
 */

// ── Types ────────────────────────────────────────────────────────

export type GovernanceMode = 'PERMISSIVE' | 'STANDARD' | 'STRICT' | 'LOCKDOWN' | 'EMERGENCY';

export interface ModeConfig {
  mode: GovernanceMode;
  defaultDecision: 'allow' | 'deny';
  requiresApproval: boolean;
  maxPendingActions: number;
  autoEscalateAfterMs: number;
  policyStrictnessMultiplier: number;  // 0.5 (lenient) to 2.0 (strict)
}

export interface ModeTransition {
  id: string;
  fromMode: GovernanceMode;
  toMode: GovernanceMode;
  reason: string;
  initiatedBy: string;
  approvedBy: string | null;
  status: 'pending' | 'approved' | 'denied' | 'executed';
  timestamp: number;
  executedAt: number | null;
}

export interface GovernanceStateMachineStats {
  currentMode: GovernanceMode;
  modeHistory: Array<{ mode: GovernanceMode; duration: number }>;
  totalTransitions: number;
  pendingTransitions: number;
  avgModeDurationMs: number;
  strictnessMultiplier: number;
}

// ── Constants ────────────────────────────────────────────────────

const MODE_CONFIGS: Record<GovernanceMode, ModeConfig> = {
  PERMISSIVE: { mode: 'PERMISSIVE', defaultDecision: 'allow', requiresApproval: false, maxPendingActions: 100, autoEscalateAfterMs: 0, policyStrictnessMultiplier: 0.5 },
  STANDARD: { mode: 'STANDARD', defaultDecision: 'allow', requiresApproval: false, maxPendingActions: 50, autoEscalateAfterMs: 3_600_000, policyStrictnessMultiplier: 1.0 },
  STRICT: { mode: 'STRICT', defaultDecision: 'deny', requiresApproval: true, maxPendingActions: 20, autoEscalateAfterMs: 1_800_000, policyStrictnessMultiplier: 1.5 },
  LOCKDOWN: { mode: 'LOCKDOWN', defaultDecision: 'deny', requiresApproval: true, maxPendingActions: 5, autoEscalateAfterMs: 900_000, policyStrictnessMultiplier: 2.0 },
  EMERGENCY: { mode: 'EMERGENCY', defaultDecision: 'deny', requiresApproval: true, maxPendingActions: 1, autoEscalateAfterMs: 300_000, policyStrictnessMultiplier: 2.5 },
};

/** Valid transitions (from → allowed to[]) */
const VALID_TRANSITIONS: Record<GovernanceMode, GovernanceMode[]> = {
  PERMISSIVE: ['STANDARD'],
  STANDARD: ['PERMISSIVE', 'STRICT'],
  STRICT: ['STANDARD', 'LOCKDOWN'],
  LOCKDOWN: ['STRICT', 'EMERGENCY'],
  EMERGENCY: ['LOCKDOWN'],
};

// ── State ────────────────────────────────────────────────────────

let currentMode: GovernanceMode = 'STANDARD';
let modeEnteredAt: number = Date.now();
const transitions: ModeTransition[] = [];
const modeHistory: Array<{ mode: GovernanceMode; enteredAt: number; exitedAt: number | null }> = [
  { mode: 'STANDARD', enteredAt: Date.now(), exitedAt: null },
];
const MAX_TRANSITIONS = 500;

function genId(): string { return `mt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`; }

// ── Core API ────────────────────────────────────────────────────

/** Get current mode config */
export function getCurrentModeConfig(): ModeConfig { return MODE_CONFIGS[currentMode]; }
export function getCurrentMode(): GovernanceMode { return currentMode; }

/** Request a mode transition */
export function requestModeTransition(
  toMode: GovernanceMode, reason: string, initiatedBy: string,
): { success: boolean; transition?: ModeTransition; error?: string } {
  if (!VALID_TRANSITIONS[currentMode]?.includes(toMode)) {
    return { success: false, error: `Invalid transition: ${currentMode} → ${toMode}` };
  }

  const transition: ModeTransition = {
    id: genId(), fromMode: currentMode, toMode, reason, initiatedBy,
    approvedBy: null, status: 'pending',
    timestamp: Date.now(), executedAt: null,
  };

  transitions.push(transition);
  if (transitions.length > MAX_TRANSITIONS) transitions.splice(0, transitions.length - MAX_TRANSITIONS);

  // PERMISSIVE doesn't require approval for transitions
  if (!MODE_CONFIGS[currentMode].requiresApproval) {
    return executeModeTransition(transition.id, initiatedBy);
  }

  return { success: true, transition };
}

/** Approve and execute a pending transition */
export function executeModeTransition(
  transitionId: string, approvedBy: string,
): { success: boolean; transition?: ModeTransition; error?: string } {
  const transition = transitions.find(t => t.id === transitionId);
  if (!transition) return { success: false, error: 'transition_not_found' };
  if (transition.status !== 'pending') return { success: false, error: 'transition_not_pending' };

  // Record exit from current mode
  const currentEntry = modeHistory[modeHistory.length - 1];
  if (currentEntry) currentEntry.exitedAt = Date.now();

  transition.approvedBy = approvedBy;
  transition.status = 'executed';
  transition.executedAt = Date.now();

  currentMode = transition.toMode;
  modeEnteredAt = Date.now();

  modeHistory.push({ mode: currentMode, enteredAt: Date.now(), exitedAt: null });

  return { success: true, transition };
}

/** Deny a pending transition */
export function denyModeTransition(transitionId: string): boolean {
  const transition = transitions.find(t => t.id === transitionId);
  if (!transition || transition.status !== 'pending') return false;
  transition.status = 'denied';
  return true;
}

/** Get default decision for current mode */
export function getDefaultDecision(): 'allow' | 'deny' {
  return MODE_CONFIGS[currentMode].defaultDecision;
}

/** Get strictness multiplier for current mode */
export function getStrictnessMultiplier(): number {
  return MODE_CONFIGS[currentMode].policyStrictnessMultiplier;
}

/** Check if current mode requires approval for actions */
export function requiresApproval(): boolean {
  return MODE_CONFIGS[currentMode].requiresApproval;
}

// ── Query ────────────────────────────────────────────────────────

export function getModeHistory(): Array<{ mode: GovernanceMode; duration: number }> {
  return modeHistory.map(h => ({
    mode: h.mode,
    duration: (h.exitedAt ?? Date.now()) - h.enteredAt,
  }));
}

export function getPendingModeTransitions(): ModeTransition[] {
  return transitions.filter(t => t.status === 'pending');
}

export function getGovernanceStateMachineStats(): GovernanceStateMachineStats {
  const history = getModeHistory();
  return {
    currentMode,
    modeHistory: history,
    totalTransitions: transitions.filter(t => t.status === 'executed').length,
    pendingTransitions: transitions.filter(t => t.status === 'pending').length,
    avgModeDurationMs: history.length > 0
      ? Math.round(history.reduce((s, h) => s + h.duration, 0) / history.length)
      : 0,
    strictnessMultiplier: MODE_CONFIGS[currentMode].policyStrictnessMultiplier,
  };
}

export function resetGovernanceStateMachine(): void {
  currentMode = 'STANDARD';
  modeEnteredAt = Date.now();
  transitions.length = 0;
  modeHistory.length = 0;
  modeHistory.push({ mode: 'STANDARD', enteredAt: Date.now(), exitedAt: null });
}
