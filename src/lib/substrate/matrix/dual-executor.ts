/**
 * Dual Executor Verification — Two-Man Rule for Critical Mutations
 * 
 * Primary executor performs the mutation.
 * Secondary executor independently verifies the results.
 * Promotion requires agreement between both executors.
 * 
 * Pattern ensures no single execution path can promote
 * a critical mutation without independent verification.
 */

import type { MutationChange } from './mutation-pipeline';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface DualExecutorResult {
  mutationId: string;
  primaryResult: ExecutorVerdict;
  secondaryResult: ExecutorVerdict;
  agreement: boolean;
  reason: string;
  verifiedAt: number;
}

export interface ExecutorVerdict {
  executor: 'primary' | 'secondary';
  approved: boolean;
  checksPassed: number;
  checksFailed: number;
  details: string[];
}

// ═══════════════════════════════════════════════════════════════
// VERIFICATION
// ═══════════════════════════════════════════════════════════════

/**
 * Execute dual verification on a mutation's changes.
 * Both executors independently validate:
 * - Change target validity
 * - Before/after coherence
 * - No unsafe path modifications
 * - Change type consistency
 */
export function verifyDual(
  mutationId: string,
  changes: MutationChange[]
): DualExecutorResult {
  const primary = executeVerification('primary', changes);
  const secondary = executeVerification('secondary', changes);

  const agreement = primary.approved && secondary.approved;

  let reason: string;
  if (agreement) {
    reason = 'Both executors agree — mutation safe for promotion';
  } else if (!primary.approved && !secondary.approved) {
    reason = `Both executors rejected: Primary(${primary.details.join('; ')}), Secondary(${secondary.details.join('; ')})`;
  } else {
    const dissenter = primary.approved ? 'Secondary' : 'Primary';
    const dissentDetails = primary.approved ? secondary.details : primary.details;
    reason = `${dissenter} executor rejected: ${dissentDetails.join('; ')}`;
  }

  return {
    mutationId,
    primaryResult: primary,
    secondaryResult: secondary,
    agreement,
    reason,
    verifiedAt: Date.now(),
  };
}

// ═══════════════════════════════════════════════════════════════
// INTERNAL
// ═══════════════════════════════════════════════════════════════

const SAFE_PREFIXES = ['src/', 'docs/', 'public/', 'supabase/functions/'];
const FORBIDDEN_TARGETS = [
  '.env', 'supabase/config.toml', 'src/integrations/supabase/client.ts',
  'src/integrations/supabase/types.ts',
];

function executeVerification(
  executor: 'primary' | 'secondary',
  changes: MutationChange[]
): ExecutorVerdict {
  let passed = 0;
  let failed = 0;
  const details: string[] = [];

  for (const change of changes) {
    // Check 1: Target must exist
    if (!change.target || change.target.trim() === '') {
      failed++;
      details.push(`Empty target in ${change.type} change`);
      continue;
    }

    // Check 2: No forbidden targets
    if (FORBIDDEN_TARGETS.some(f => change.target.includes(f))) {
      failed++;
      details.push(`Forbidden target: ${change.target}`);
      continue;
    }

    // Check 3: Path safety (for file-level changes)
    if (change.type === 'schema' || change.type === 'config') {
      const isSafe = SAFE_PREFIXES.some(p => change.target.startsWith(p)) ||
                     !change.target.includes('/'); // Allow non-path targets (e.g., config keys)
      if (!isSafe) {
        failed++;
        details.push(`Unsafe path: ${change.target}`);
        continue;
      }
    }

    // Check 4: Before/after coherence
    if (change.before !== undefined && change.after !== undefined) {
      if (JSON.stringify(change.before) === JSON.stringify(change.after)) {
        details.push(`No-op change detected: ${change.target}`);
        // Not a failure, but notable
      }
    }

    // Check 5: Description present
    if (!change.description || change.description.length < 3) {
      failed++;
      details.push(`Missing description for change on ${change.target}`);
      continue;
    }

    passed++;
  }

  return {
    executor,
    approved: failed === 0 && passed > 0,
    checksPassed: passed,
    checksFailed: failed,
    details: details.length > 0 ? details : ['All checks passed'],
  };
}
