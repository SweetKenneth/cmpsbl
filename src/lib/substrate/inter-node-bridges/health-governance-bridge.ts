/**
 * Health → Governance Auto-Escalation Bridge
 * 
 * Monitors health alerts and automatically escalates governance mode
 * when critical thresholds are breached. Any good developer would
 * expect health monitoring to auto-trigger lockdown on cascading failures.
 *
 * CORE/SYSTEM → healthMonitoring → [THIS BRIDGE] → governance mode
 */

import { getActiveAlerts, type HealthAlert } from '@/lib/system/healthMonitoring';
import { getSubsystemState, type GovernanceMode } from '@/lib/system/governance';
import { recordAudit } from '@/lib/substrate/audit-trail';
import { emit } from '@/lib/substrate/events';
import { log } from '@/lib/system/log';

export interface EscalationRule {
  /** Minimum critical alerts to trigger escalation */
  criticalThreshold: number;
  /** Minimum warning alerts to trigger escalation */
  warningThreshold: number;
  /** Target governance mode when triggered */
  targetMode: GovernanceMode;
  /** Cooldown in ms before re-evaluating */
  cooldownMs: number;
}

const DEFAULT_RULES: EscalationRule[] = [
  { criticalThreshold: 3, warningThreshold: 0, targetMode: 'LOCKDOWN', cooldownMs: 300_000 },
  { criticalThreshold: 1, warningThreshold: 5, targetMode: 'OBSERVE', cooldownMs: 120_000 },
];

let lastEscalation = 0;
let currentEscalatedMode: GovernanceMode | null = null;

export type EscalationCallback = (from: GovernanceMode, to: GovernanceMode, reason: string) => void;
let onEscalate: EscalationCallback | null = null;

/** Register a callback that gets invoked when governance escalation fires */
export function onGovernanceEscalation(cb: EscalationCallback): void {
  onEscalate = cb;
}

/**
 * Evaluate current health alerts and decide if governance needs escalation.
 * Returns the recommended mode or null if no escalation is needed.
 */
export function evaluateEscalation(
  currentMode: GovernanceMode,
  rules: EscalationRule[] = DEFAULT_RULES
): { shouldEscalate: boolean; targetMode: GovernanceMode; reason: string } | null {
  const now = Date.now();
  if (now - lastEscalation < (rules[0]?.cooldownMs ?? 120_000)) {
    return null; // Still in cooldown
  }

  const alerts = getActiveAlerts();
  const criticalCount = alerts.filter(a => a.severity === 'critical' && a.status === 'active').length;
  const warningCount = alerts.filter(a => a.severity === 'warning' && a.status === 'active').length;

  // Check rules in priority order (most severe first)
  for (const rule of rules) {
    if (criticalCount >= rule.criticalThreshold || warningCount >= rule.warningThreshold) {
      if (currentMode !== rule.targetMode) {
        const reason = `Auto-escalation: ${criticalCount} critical, ${warningCount} warning alerts exceeded threshold`;
        return { shouldEscalate: true, targetMode: rule.targetMode, reason };
      }
    }
  }

  // Check de-escalation: if currently escalated and alerts have cleared
  if (currentEscalatedMode && criticalCount === 0 && warningCount <= 1) {
    return {
      shouldEscalate: true,
      targetMode: 'ACTIVE',
      reason: `Auto-de-escalation: alerts cleared (${criticalCount} critical, ${warningCount} warning)`,
    };
  }

  return null;
}

/**
 * Execute the escalation bridge — call this from the health monitoring loop.
 */
export function runEscalationBridge(currentMode: GovernanceMode): GovernanceMode {
  const result = evaluateEscalation(currentMode);
  if (!result || !result.shouldEscalate) return currentMode;

  lastEscalation = Date.now();
  currentEscalatedMode = result.targetMode === 'ACTIVE' ? null : result.targetMode;

  // Audit the transition
  recordAudit(
    'health-governance-bridge',
    'governance.auto_escalate',
    'governance_mode',
    currentMode,
    currentMode,
    result.targetMode,
    { reason: result.reason, criticalAlerts: String(getActiveAlerts().filter(a => a.severity === 'critical').length) }
  );

  // Emit event for telemetry
  emit({
    module: 'GOVERNANCE',
    event_type: 'mode.auto_escalated',
    outcome: 'succeeded',
    data: { from: currentMode, to: result.targetMode, reason: result.reason },
  });

  log.warn('governance', `Auto-escalation: ${currentMode} → ${result.targetMode} — ${result.reason}`);

  // Notify callback
  if (onEscalate) {
    onEscalate(currentMode, result.targetMode, result.reason);
  }

  return result.targetMode;
}

/** Reset escalation state (for testing or manual override) */
export function resetEscalation(): void {
  lastEscalation = 0;
  currentEscalatedMode = null;
}
