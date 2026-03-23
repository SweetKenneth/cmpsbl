/**
 * ENCODE Governance Compliance Gate — v1.0.0
 * Pre-execution validation that patches comply with active governance mode.
 * 
 * Governance Modes:
 *   ACTIVE   — normal operations, all patches allowed
 *   OBSERVE  — read-only, mutations blocked
 *   LOCKDOWN — critical ops only, evolution frozen
 *   EVOLVE   — experimental mode, increased mutation velocity
 */

import type { PatchPlan } from './patchPlanValidator';

// ═══ Types ════════════════════════════════════════════════════════

export type GovernanceMode = 'ACTIVE' | 'OBSERVE' | 'LOCKDOWN' | 'EVOLVE';

export interface ComplianceResult {
  allowed: boolean;
  mode: GovernanceMode;
  violations: ComplianceViolation[];
  overrideAvailable: boolean;
  reason?: string;
}

export interface ComplianceViolation {
  code: string;
  message: string;
  severity: 'warning' | 'block';
  override: boolean; // can a governor override?
}

export interface GovernancePolicy {
  mode: GovernanceMode;
  allowCreate: boolean;
  allowModify: boolean;
  allowDelete: boolean;
  allowExperimental: boolean;
  requireApproval: boolean;
  maxArtifacts: number;
  restrictedSurfaces: string[];
  description: string;
}

// ═══ Policy Definitions ═══════════════════════════════════════════

const POLICIES: Record<GovernanceMode, GovernancePolicy> = {
  ACTIVE: {
    mode: 'ACTIVE',
    allowCreate: true,
    allowModify: true,
    allowDelete: true,
    allowExperimental: false,
    requireApproval: true,
    maxArtifacts: 50,
    restrictedSurfaces: [],
    description: 'Normal operation — all patches allowed with standard approval',
  },
  OBSERVE: {
    mode: 'OBSERVE',
    allowCreate: false,
    allowModify: false,
    allowDelete: false,
    allowExperimental: false,
    requireApproval: true,
    maxArtifacts: 0,
    restrictedSurfaces: ['code', 'ui', 'db', 'edge', 'tests', 'docs'],
    description: 'Read-only mode — no mutations permitted',
  },
  LOCKDOWN: {
    mode: 'LOCKDOWN',
    allowCreate: false,
    allowModify: true, // only critical fixes
    allowDelete: false,
    allowExperimental: false,
    requireApproval: true,
    maxArtifacts: 5,
    restrictedSurfaces: ['db', 'edge'],
    description: 'Critical ops only — evolution frozen, minimal patches',
  },
  EVOLVE: {
    mode: 'EVOLVE',
    allowCreate: true,
    allowModify: true,
    allowDelete: true,
    allowExperimental: true,
    requireApproval: false, // fast-track in evolve mode
    maxArtifacts: 100,
    restrictedSurfaces: [],
    description: 'Experimental mode — increased mutation velocity',
  },
};

// ═══ State ═════════════════════════════════════════════════════════

let currentMode: GovernanceMode = 'ACTIVE';
const overrideLog: Array<{
  planId: string;
  mode: GovernanceMode;
  overriddenBy: string;
  timestamp: string;
}> = [];
const MAX_OVERRIDE_LOG = 50;

// ═══ Core API ═════════════════════════════════════════════════════

/**
 * Set the active governance mode
 */
export function setGovernanceMode(mode: GovernanceMode): void {
  currentMode = mode;
}

/**
 * Get the active governance mode
 */
export function getGovernanceMode(): GovernanceMode {
  return currentMode;
}

/**
 * Get the policy for the active mode
 */
export function getActivePolicy(): GovernancePolicy {
  return POLICIES[currentMode];
}

/**
 * Check if a patch plan complies with the active governance mode
 */
export function checkCompliance(plan: PatchPlan): ComplianceResult {
  const policy = POLICIES[currentMode];
  const violations: ComplianceViolation[] = [];

  // Check operation types
  for (const art of plan.artifacts) {
    switch (art.operation) {
      case 'create':
        if (!policy.allowCreate) {
          violations.push({
            code: 'GOV_001',
            message: `Create operations blocked in ${currentMode} mode (file: ${art.filePath || 'unknown'})`,
            severity: 'block',
            override: currentMode !== 'OBSERVE',
          });
        }
        break;

      case 'modify':
        if (!policy.allowModify) {
          violations.push({
            code: 'GOV_002',
            message: `Modify operations blocked in ${currentMode} mode (file: ${art.filePath || 'unknown'})`,
            severity: 'block',
            override: false,
          });
        }
        break;

      case 'delete':
        if (!policy.allowDelete) {
          violations.push({
            code: 'GOV_003',
            message: `Delete operations blocked in ${currentMode} mode`,
            severity: 'block',
            override: currentMode === 'LOCKDOWN',
          });
        }
        break;
    }
  }

  // Check surface restrictions
  if (policy.restrictedSurfaces.includes(plan.targetSurface)) {
    violations.push({
      code: 'GOV_004',
      message: `Surface "${plan.targetSurface}" is restricted in ${currentMode} mode`,
      severity: 'block',
      override: currentMode !== 'OBSERVE',
    });
  }

  // Check artifact count
  if (plan.artifacts.length > policy.maxArtifacts) {
    violations.push({
      code: 'GOV_005',
      message: `Too many artifacts: ${plan.artifacts.length} exceeds ${currentMode} limit of ${policy.maxArtifacts}`,
      severity: 'block',
      override: true,
    });
  }

  // Destructive check in non-EVOLVE modes
  if (plan.destructive && currentMode !== 'EVOLVE' && currentMode !== 'ACTIVE') {
    violations.push({
      code: 'GOV_006',
      message: `Destructive patches require ACTIVE or EVOLVE mode (current: ${currentMode})`,
      severity: 'block',
      override: currentMode === 'LOCKDOWN',
    });
  }

  // LOCKDOWN: only critical-path files allowed
  if (currentMode === 'LOCKDOWN') {
    const nonCritical = plan.artifacts.filter(a => {
      const path = a.filePath || '';
      return !path.startsWith('src/core/') && !path.startsWith('src/lib/substrate/');
    });
    if (nonCritical.length > 0) {
      violations.push({
        code: 'GOV_007',
        message: `LOCKDOWN: only critical-path files (core/substrate) are allowed — ${nonCritical.length} non-critical file(s)`,
        severity: 'warning',
        override: true,
      });
    }
  }

  const blockingViolations = violations.filter(v => v.severity === 'block');
  const overrideAvailable = blockingViolations.length > 0 && blockingViolations.every(v => v.override);

  return {
    allowed: blockingViolations.length === 0,
    mode: currentMode,
    violations,
    overrideAvailable,
    reason: blockingViolations.length > 0
      ? blockingViolations.map(v => v.message).join('; ')
      : undefined,
  };
}

/**
 * Override a compliance block (governor only)
 */
export function overrideCompliance(planId: string, governorId: string): boolean {
  overrideLog.push({
    planId,
    mode: currentMode,
    overriddenBy: governorId,
    timestamp: new Date().toISOString(),
  });

  if (overrideLog.length > MAX_OVERRIDE_LOG) overrideLog.shift();
  return true;
}

/**
 * Get override audit log
 */
export function getOverrideLog(): typeof overrideLog {
  return [...overrideLog];
}

/**
 * Quick compliance check — returns boolean only
 */
export function isCompliant(plan: PatchPlan): boolean {
  return checkCompliance(plan).allowed;
}
