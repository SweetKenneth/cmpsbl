/**
 * Capability Gate Middleware
 * Enforces tier-based access control for substrate capabilities
 * 
 * Checks the user's subscription tier before allowing capability execution.
 * Integrated with the LNCHBL tier map for runtime enforcement.
 */

import { isCapabilityAvailable, type DistributionTier } from '@/config/lnchbl-tier-map';

export interface GateCheckResult {
  allowed: boolean;
  reason: string;
  requiredTier: DistributionTier | null;
  currentTier: DistributionTier;
  capabilityId: string;
}

export interface CapabilityGateConfig {
  enforcementMode: 'strict' | 'warn' | 'off';
  logDenials: boolean;
  gracePeriodMs: number;
}

const DEFAULT_GATE_CONFIG: CapabilityGateConfig = {
  enforcementMode: 'strict',
  logDenials: true,
  gracePeriodMs: 0,
};

let currentConfig = { ...DEFAULT_GATE_CONFIG };
const MAX_DENIAL_LOG = 500;
const denialLog: Array<{ capabilityId: string; tier: DistributionTier; timestamp: number }> = [];

/**
 * Check if a capability is gated for the given tier
 */
export function checkGate(capabilityId: string, userTier: DistributionTier): GateCheckResult {
  const allowed = isCapabilityAvailable(capabilityId, userTier);

  if (!allowed && currentConfig.logDenials) {
    denialLog.push({ capabilityId, tier: userTier, timestamp: Date.now() });
    if (denialLog.length > MAX_DENIAL_LOG) {
      denialLog.splice(0, Math.floor(MAX_DENIAL_LOG * 0.3));
    }
  }

  // Determine required tier by checking each level
  let requiredTier: DistributionTier | null = null;
  if (!allowed) {
    const tiers: DistributionTier[] = ['free', 'builder', 'pro', 'enterprise'];
    for (const t of tiers) {
      if (isCapabilityAvailable(capabilityId, t)) {
        requiredTier = t;
        break;
      }
    }
  }

  return {
    allowed: currentConfig.enforcementMode === 'off' ? true : allowed,
    reason: allowed
      ? 'Capability available at current tier'
      : `Requires ${requiredTier ?? 'unknown'} tier (current: ${userTier})`,
    requiredTier: allowed ? null : requiredTier,
    currentTier: userTier,
    capabilityId,
  };
}

/**
 * Middleware wrapper — wraps a capability executor with tier enforcement
 */
export function withGate<T>(
  capabilityId: string,
  userTier: DistributionTier,
  executor: () => T
): T | GateCheckResult {
  const check = checkGate(capabilityId, userTier);

  if (!check.allowed && currentConfig.enforcementMode === 'strict') {
    return check;
  }

  if (!check.allowed && currentConfig.enforcementMode === 'warn') {
    console.warn(`[CapabilityGate] ${check.reason} — executing anyway (warn mode)`);
  }

  return executor();
}

/**
 * Batch-check multiple capabilities
 */
export function checkGateBatch(
  capabilityIds: string[],
  userTier: DistributionTier
): Map<string, GateCheckResult> {
  const results = new Map<string, GateCheckResult>();
  for (const id of capabilityIds) {
    results.set(id, checkGate(id, userTier));
  }
  return results;
}

/** Get denied capability attempts */
export function getDenialLog() {
  return [...denialLog];
}

/** Clear denial log */
export function clearDenialLog() {
  denialLog.length = 0;
}

/** Update gate config */
export function configureGate(updates: Partial<CapabilityGateConfig>) {
  currentConfig = { ...currentConfig, ...updates };
}

/** Get current gate config */
export function getGateConfig(): CapabilityGateConfig {
  return { ...currentConfig };
}
