/**
 * Governance Mode Transition Validator
 * SPARTA Epoch — Prevents unsafe governance mode transitions
 * 
 * GAP: The governance control plane allowed arbitrary mode switching
 * without validating whether the transition is safe or requires quorum.
 * 
 * Rules:
 * - LOCKDOWN → EVOLVE is blocked (must pass through ACTIVE first)
 * - EVOLVE requires zero critical alerts
 * - Any → LOCKDOWN is always allowed (emergency path)
 * - Repeated rapid transitions trigger cooldown
 */

import { getActiveAlerts } from '@/lib/system/healthMonitoring';
import { recordAudit } from '@/lib/substrate/audit-trail';
import { log } from '@/lib/system/log';
import type { GovernanceMode } from '@/lib/system/governance';

export interface TransitionValidation {
  allowed: boolean;
  reason: string;
  requiresQuorum: boolean;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

/** Transitions that are explicitly blocked */
const BLOCKED_TRANSITIONS: Array<{ from: GovernanceMode; to: GovernanceMode; reason: string }> = [
  { from: 'LOCKDOWN', to: 'EVOLVE', reason: 'Cannot jump from LOCKDOWN to EVOLVE — must stabilize through ACTIVE first' },
];

/** Transitions that require multi-approval (quorum) */
const QUORUM_TRANSITIONS: Array<{ from: GovernanceMode; to: GovernanceMode }> = [
  { from: 'ACTIVE', to: 'EVOLVE' },
  { from: 'LOCKDOWN', to: 'ACTIVE' },
];

/** Rapid transition cooldown tracking */
let transitionHistory: Array<{ from: GovernanceMode; to: GovernanceMode; at: number }> = [];
const RAPID_TRANSITION_WINDOW = 300_000; // 5 minutes
const MAX_TRANSITIONS_IN_WINDOW = 3;

/**
 * Validate whether a governance mode transition is safe.
 */
export function validateTransition(
  from: GovernanceMode,
  to: GovernanceMode,
  actor: string
): TransitionValidation {
  // Same-mode is a no-op
  if (from === to) {
    return { allowed: true, reason: 'No transition needed', requiresQuorum: false, riskLevel: 'low' };
  }

  // Emergency: any → LOCKDOWN is always allowed
  if (to === 'LOCKDOWN') {
    return { allowed: true, reason: 'Emergency lockdown always permitted', requiresQuorum: false, riskLevel: 'critical' };
  }

  // Check blocked transitions
  const blocked = BLOCKED_TRANSITIONS.find(b => b.from === from && b.to === to);
  if (blocked) {
    log.warn('governance', `Blocked transition: ${from} → ${to}: ${blocked.reason}`);
    return { allowed: false, reason: blocked.reason, requiresQuorum: false, riskLevel: 'critical' };
  }

  // Check rapid transition flood
  const now = Date.now();
  transitionHistory = transitionHistory.filter(t => now - t.at < RAPID_TRANSITION_WINDOW);
  if (transitionHistory.length >= MAX_TRANSITIONS_IN_WINDOW) {
    return {
      allowed: false,
      reason: `Rate limited: ${MAX_TRANSITIONS_IN_WINDOW} transitions in ${RAPID_TRANSITION_WINDOW / 1000}s window exceeded`,
      requiresQuorum: false,
      riskLevel: 'high',
    };
  }

  // EVOLVE requires zero critical alerts
  if (to === 'EVOLVE') {
    const alerts = getActiveAlerts();
    const criticals = alerts.filter(a => a.severity === 'critical' && a.status === 'active');
    if (criticals.length > 0) {
      return {
        allowed: false,
        reason: `Cannot enter EVOLVE with ${criticals.length} active critical alerts`,
        requiresQuorum: false,
        riskLevel: 'high',
      };
    }
  }

  // Check quorum requirement
  const needsQuorum = QUORUM_TRANSITIONS.some(q => q.from === from && q.to === to);

  // Record transition
  transitionHistory.push({ from, to, at: now });

  recordAudit(
    actor,
    'governance.transition.validated',
    'governance_mode',
    from,
    from,
    to,
    { requiresQuorum: String(needsQuorum), actor }
  );

  return {
    allowed: true,
    reason: `Transition ${from} → ${to} validated`,
    requiresQuorum: needsQuorum,
    riskLevel: needsQuorum ? 'high' : 'medium',
  };
}

/**
 * Get the safe transition path between two modes
 * (e.g., LOCKDOWN → EVOLVE returns [LOCKDOWN, ACTIVE, EVOLVE])
 */
export function getTransitionPath(from: GovernanceMode, to: GovernanceMode): GovernanceMode[] {
  if (from === to) return [from];

  // Direct transitions
  const direct = validateTransition(from, to, 'path-resolver');
  if (direct.allowed) return [from, to];

  // Try via ACTIVE
  const toActive = validateTransition(from, 'ACTIVE', 'path-resolver');
  const fromActive = validateTransition('ACTIVE', to, 'path-resolver');
  if (toActive.allowed && fromActive.allowed) return [from, 'ACTIVE', to];

  // Try via OBSERVE
  const toObserve = validateTransition(from, 'OBSERVE', 'path-resolver');
  const fromObserve = validateTransition('OBSERVE', to, 'path-resolver');
  if (toObserve.allowed && fromObserve.allowed) return [from, 'OBSERVE', to];

  return []; // No safe path
}

/** Reset transition history (testing) */
export function resetTransitionHistory(): void {
  transitionHistory = [];
}
