/**
 * Escape Detection & Containment
 * 
 * Detects and prevents sandbox escape attempts — boundary probes,
 * privilege escalation, memory breaches. Auto-freezes on detection.
 * 
 * @module sandbox/ultimate/escapeDetection
 * @version 9.0.0 — Terrarium
 */

// ── Types ──────────────────────────────────────────────────────

export type EscapeAttemptType = 'boundary_probe' | 'privilege_escalation' | 'memory_breach' | 'namespace_access' | 'resource_hijack';

export interface EscapeAttempt {
  id: string;
  sandboxId: string;
  attemptType: EscapeAttemptType;
  detail: string;
  threatLevel: number; // 1–10
  timestamp: number;
  contained: boolean;
  forensicSnapshotId: string | null;
}

export interface ContainmentAction {
  sandboxId: string;
  action: 'freeze' | 'terminate' | 'alert_defense' | 'log_forensic';
  triggeredAt: number;
  attemptId: string;
}

// ── State ──────────────────────────────────────────────────────

const escapeAttempts: EscapeAttempt[] = [];
const containmentActions: ContainmentAction[] = [];
const frozenSandboxes = new Set<string>();
let attemptCounter = 0;

// ── Scoring ────────────────────────────────────────────────────

const THREAT_SCORES: Record<EscapeAttemptType, number> = {
  boundary_probe: 5,
  privilege_escalation: 8,
  memory_breach: 9,
  namespace_access: 7,
  resource_hijack: 6,
};

// ── Core ───────────────────────────────────────────────────────

/** Report a detected escape attempt */
export function reportEscapeAttempt(
  sandboxId: string,
  attemptType: EscapeAttemptType,
  detail: string,
  threatLevelOverride?: number,
): EscapeAttempt {
  const attempt: EscapeAttempt = {
    id: `esc-${++attemptCounter}`,
    sandboxId,
    attemptType,
    detail,
    threatLevel: threatLevelOverride ?? THREAT_SCORES[attemptType],
    timestamp: Date.now(),
    contained: false,
    forensicSnapshotId: null,
  };
  escapeAttempts.push(attempt);

  // Auto-contain based on threat level
  if (attempt.threatLevel >= 7) {
    freezeSandbox(sandboxId, attempt.id);
    attempt.contained = true;
  }

  return attempt;
}

/** Freeze a sandbox (stop all execution) */
export function freezeSandbox(sandboxId: string, attemptId: string): void {
  frozenSandboxes.add(sandboxId);
  containmentActions.push({
    sandboxId, action: 'freeze', triggeredAt: Date.now(), attemptId,
  });
  containmentActions.push({
    sandboxId, action: 'alert_defense', triggeredAt: Date.now(), attemptId,
  });
  containmentActions.push({
    sandboxId, action: 'log_forensic', triggeredAt: Date.now(), attemptId,
  });
}

/** Check if a sandbox is frozen */
export function isFrozen(sandboxId: string): boolean {
  return frozenSandboxes.has(sandboxId);
}

/** Unfreeze a sandbox (requires governance approval in production) */
export function unfreeze(sandboxId: string): boolean {
  return frozenSandboxes.delete(sandboxId);
}

/** Attach forensic snapshot ID to an attempt */
export function attachForensicSnapshot(attemptId: string, snapshotId: string): void {
  const attempt = escapeAttempts.find(a => a.id === attemptId);
  if (attempt) attempt.forensicSnapshotId = snapshotId;
}

export function getEscapeAttempts(sandboxId?: string): EscapeAttempt[] {
  if (sandboxId) return escapeAttempts.filter(a => a.sandboxId === sandboxId);
  return [...escapeAttempts];
}

export function getContainmentActions(sandboxId?: string): ContainmentAction[] {
  if (sandboxId) return containmentActions.filter(a => a.sandboxId === sandboxId);
  return [...containmentActions];
}

export function getEscapeDetectionHealth() {
  return {
    totalAttempts: escapeAttempts.length,
    containedAttempts: escapeAttempts.filter(a => a.contained).length,
    frozenSandboxes: frozenSandboxes.size,
    highThreatAttempts: escapeAttempts.filter(a => a.threatLevel >= 7).length,
  };
}

export function resetEscapeDetection(): void {
  escapeAttempts.length = 0;
  containmentActions.length = 0;
  frozenSandboxes.clear();
  attemptCounter = 0;
}
