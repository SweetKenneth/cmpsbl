/**
 * Plan Verification Layer
 * Validates that plans target known modules and safe paths before execution.
 * Hardened path safety: rejects .., //, leading /, and blocked path prefixes.
 */

import type { PatchPlan } from './types';

/** Canonical list of valid substrate modules */
const VALID_MODULES = [
  'BRAIN', 'DECODE', 'ENCODE', 'SYSTEM', 'NEXUS', 'CORTEX',
  'VISION', 'RIPPLE', 'DEFENSE', 'INCLUSIVE', 'EVOLUTION',
  'MEMORY', 'RELAY', 'AUDIT', 'IDENTITY', 'ECONOMY', 'SANDBOX',
  'DREAM', 'ACCESS', 'INTEGRATION',
  'NERVE', 'MEDIC', 'GOVERNANCE', 'IMMUNITY', 'INTENT',
  'SOVEREIGN', 'ORACLE', 'CONSCIENCE', 'TREATY',
  'COMPASS', 'ECHO', 'REFLEX', 'FORGE', 'LINGUA', 'HARVEST',
  'SHADOW', 'PHANTOM', 'CORE',
] as const;

/** Paths that patches are allowed to target */
const SAFE_PATH_PREFIXES = [
  'src/',
  'supabase/functions/',
  'docs/',
  'public/',
] as const;

/** Paths explicitly blocked from patching (prefix match) */
const BLOCKED_PATHS = [
  'src/integrations/supabase/client.ts',
  'src/integrations/supabase/types.ts',
  '.env',
  'supabase/config.toml',
  'node_modules/',
  'bun.lock',
  'package-lock.json',
] as const;

/** Dangerous path patterns */
const DANGEROUS_PATTERNS = [
  '..', // directory traversal
  '//', // double-slash injection
] as const;

export interface VerificationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Verify a PatchPlan is structurally sound and targets valid modules/paths.
 */
export function verifyPlan(plan: PatchPlan): VerificationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. Validate plan_id format
  if (!plan.plan_id || typeof plan.plan_id !== 'string') {
    errors.push('Missing or invalid plan_id');
  }

  // 2. Validate modules
  for (const mod of plan.modules) {
    const normalized = mod.toUpperCase();
    if (!VALID_MODULES.includes(normalized as any)) {
      errors.push(`Invalid module: "${mod}". Known modules: ${VALID_MODULES.join(', ')}`);
    }
  }

  // 3. Validate change paths
  for (const change of plan.changes) {
    const p = change.path;

    // 3a. Reject absolute paths
    if (p.startsWith('/')) {
      errors.push(`Absolute path rejected: "${p}" — paths must be relative`);
      continue;
    }

    // 3b. Reject dangerous patterns
    for (const pattern of DANGEROUS_PATTERNS) {
      if (p.includes(pattern)) {
        errors.push(`Dangerous pattern "${pattern}" in path: "${p}"`);
      }
    }

    // 3c. Must start with a safe prefix
    const isSafe = SAFE_PATH_PREFIXES.some(prefix => p.startsWith(prefix));
    if (!isSafe) {
      errors.push(`Unsafe patch path: "${p}" — must start with one of: ${SAFE_PATH_PREFIXES.join(', ')}`);
    }

    // 3d. Must not match any blocked path prefix
    const isBlocked = BLOCKED_PATHS.some(blocked => p.startsWith(blocked));
    if (isBlocked) {
      errors.push(`Blocked patch path: "${p}" — this path is read-only`);
    }

    // Warn on delete operations
    if (change.type === 'delete') {
      warnings.push(`Destructive change: DELETE on "${p}" — requires explicit approval`);
    }
  }

  // 4. Validate status
  if (plan.status === 'executed') {
    errors.push('Plan already executed — cannot re-verify');
  }

  // 5. Require at least one module
  if (plan.modules.length === 0) {
    warnings.push('Plan has no target modules — consider specifying affected modules');
  }

  // 6. Require intent
  if (!plan.intent || plan.intent.trim().length === 0) {
    errors.push('Plan must include an intent description');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

export { VALID_MODULES, SAFE_PATH_PREFIXES, BLOCKED_PATHS };
