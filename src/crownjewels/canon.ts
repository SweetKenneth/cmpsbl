/**
 * Crown Jewel Canon — Module Whitelist & Drift Enforcement
 * Prevents non-canonical module references in S-tier artifacts.
 */

/** All 26 canonical substrate modules + known execution-layer entities */
export const CANONICAL_MODULES = [
  'CORE', 'SYSTEM', 'BRAIN', 'DREAM', 'RIPPLE', 'ACCESS', 'DEFENSE',
  'NEXUS', 'DECODE', 'VISION', 'CORTEX', 'INCLUSIVE', 'INTEGRATION',
  'EVOLUTION', 'MEDIC', 'NERVE', 'GOVERNANCE', 'OBSERVABILITY',
  'ANALYTICS', 'IMMUNITY', 'INTENT', 'MESH', 'AUDIT',
  'MEMORY', 'ECONOMY', 'RELAY', 'IDENTITY', 'ATLAS', 'ENCODE',
  'SOVEREIGN', 'ORACLE', 'CONSCIENCE', 'PHANTOM', 'FORGE',
  'LINGUA', 'COMPASS', 'ECHO', 'TREATY', 'HARVEST', 'REFLEX',
] as const;

export type CanonicalModule = typeof CANONICAL_MODULES[number];

/** Cross-module compound references (e.g. CORTEX×BRAIN) */
export function parseModuleRef(ref: string): string[] {
  return ref.split(/[×x×]/i).map(s => s.trim());
}

export function isCanonicalModule(mod: string): boolean {
  const parts = parseModuleRef(mod);
  return parts.every(p => (CANONICAL_MODULES as readonly string[]).includes(p));
}

/** Drift log — in-memory for client-side, could be persisted */
export interface DriftAttempt {
  timestamp: string;
  artifactId: string;
  invalidModule: string;
  reason: string;
}

const driftLog: DriftAttempt[] = [];

export function logDrift(artifactId: string, invalidModule: string, reason: string): void {
  driftLog.push({
    timestamp: new Date().toISOString(),
    artifactId,
    invalidModule,
    reason,
  });
  console.warn(`[CJ-DRIFT] ${reason}: "${invalidModule}" in artifact ${artifactId}`);
}

export function getDriftLog(): DriftAttempt[] {
  return [...driftLog];
}

export function clearDriftLog(): void {
  driftLog.length = 0;
}

/**
 * Validate an artifact's module reference against the canon.
 * Returns true if valid, false + logs drift if invalid.
 */
export function validateArtifactModule(artifactId: string, moduleRef: string): boolean {
  if (isCanonicalModule(moduleRef)) return true;
  logDrift(artifactId, moduleRef, 'Non-whitelisted module reference');
  return false;
}
