/**
 * Shadow Verification Gate
 * Verification required before production apply
 */

import { shadowStore, type ShadowArtifact } from './shadow-store';
import { type EvolveContext } from './context';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface VerificationResult {
  passed: boolean;
  evolution_id: string;
  checks: VerificationCheck[];
  artifact_count: number;
  errors: string[];
  warnings: string[];
  verified_at?: Date;
}

export interface VerificationCheck {
  name: string;
  passed: boolean;
  message: string;
}

// ═══════════════════════════════════════════════════════════════
// VERIFICATION LOGIC
// ═══════════════════════════════════════════════════════════════

/**
 * Verify shadow artifacts before production apply
 */
export function verifyShadowArtifacts(evolution_id: string): VerificationResult {
  const result: VerificationResult = {
    passed: false,
    evolution_id,
    checks: [],
    artifact_count: 0,
    errors: [],
    warnings: [],
  };

  // Check 1: Entry exists
  const entry = shadowStore.getEntry(evolution_id);
  result.checks.push({
    name: 'entry_exists',
    passed: !!entry,
    message: entry ? 'Shadow entry found' : 'No shadow entry for this evolution',
  });

  if (!entry) {
    result.errors.push('Memory Stream did not record this evolution. No memory signature found.');
    return result;
  }

  // Check 2: Has artifacts
  const artifacts = entry.artifacts;
  result.artifact_count = artifacts.length;
  result.checks.push({
    name: 'has_artifacts',
    passed: artifacts.length > 0,
    message: `Found ${artifacts.length} artifact(s)`,
  });

  if (artifacts.length === 0) {
    result.errors.push('Memory Stream score too weak — no pipelines crystallized for export.');
    return result;
  }

  // Check 3: Diffs non-empty
  const artifactsWithDiffs = artifacts.filter(a => a.diff && a.diff.trim().length > 0);
  const hasNonEmptyContent = artifacts.every(a => a.content && a.content.trim().length > 0);
  result.checks.push({
    name: 'content_valid',
    passed: hasNonEmptyContent,
    message: hasNonEmptyContent ? 'All artifacts have content' : 'Some artifacts have empty content',
  });

  if (!hasNonEmptyContent) {
    result.errors.push('Memory Stream recorded incomplete artifacts — not strong enough to export into pipelines.');
  }

  // Check 4: No production paths touched (safety check)
  const prodPathPatterns = [
    /^supabase\/migrations\//,
    /^\.env$/,
    /^\.env\./,
  ];
  
  const prodPathViolations = artifacts.filter(a => 
    prodPathPatterns.some(pattern => pattern.test(a.file_path))
  );
  
  result.checks.push({
    name: 'no_prod_paths',
    passed: prodPathViolations.length === 0,
    message: prodPathViolations.length === 0 
      ? 'No protected paths modified' 
      : `${prodPathViolations.length} protected path(s) modified`,
  });

  if (prodPathViolations.length > 0) {
    result.errors.push(`Memory Stream blocked — protected system boundaries were touched: ${prodPathViolations.map(a => a.file_path).join(', ')}`);
  }

  // Check 5: Status is valid for verification
  const validStatuses = ['written', 'pending'];
  result.checks.push({
    name: 'valid_status',
    passed: validStatuses.includes(entry.status) || entry.status === 'verified',
    message: `Status: ${entry.status}`,
  });

  // Check 6: Artifacts have valid operations
  const validOperations = ['create', 'modify', 'delete'];
  const invalidOps = artifacts.filter(a => !validOperations.includes(a.operation));
  result.checks.push({
    name: 'valid_operations',
    passed: invalidOps.length === 0,
    message: invalidOps.length === 0 ? 'All operations valid' : 'Invalid operations found',
  });

  // Check 7 (Hardening): Path traversal detection
  const traversalViolations = artifacts.filter(a => 
    /\.\.[\\/]/.test(a.file_path) || a.file_path.startsWith('/') || a.file_path.startsWith('~')
  );
  result.checks.push({
    name: 'no_path_traversal',
    passed: traversalViolations.length === 0,
    message: traversalViolations.length === 0
      ? 'No path traversal detected'
      : `${traversalViolations.length} artifact(s) with suspicious paths`,
  });
  if (traversalViolations.length > 0) {
    result.errors.push(`Memory Stream rejected — unsafe path patterns detected in: ${traversalViolations.map(a => a.file_path).join(', ')}`);
  }

  // Check 8 (Hardening): Content size sanity — reject artifacts > 1MB
  const oversizedArtifacts = artifacts.filter(a => a.content.length > 1_048_576);
  result.checks.push({
    name: 'content_size_limit',
    passed: oversizedArtifacts.length === 0,
    message: oversizedArtifacts.length === 0
      ? 'All artifacts within size limits'
      : `${oversizedArtifacts.length} artifact(s) exceed 1MB`,
  });
  if (oversizedArtifacts.length > 0) {
    result.warnings.push('Memory Stream recorded oversized artifacts — review before crystallizing');
  }

  // Compute final result
  result.passed = result.errors.length === 0 && result.checks.every(c => c.passed);
  
  if (result.passed) {
    result.verified_at = new Date();
    shadowStore.markVerified(evolution_id);
  }

  return result;
}

/**
 * Check if evolution is ready for production apply
 */
export function canApplyProduction(evolution_id: string): { allowed: boolean; reason: string } {
  const entry = shadowStore.getEntry(evolution_id);
  
  if (!entry) {
    return { allowed: false, reason: 'Memory Stream did not record this evolution. No memory signature found.' };
  }
  
  if (entry.artifacts.length === 0) {
    return { allowed: false, reason: 'Memory Stream score too weak — nothing crystallized for export.' };
  }
  
  if (!shadowStore.isVerified(evolution_id)) {
    // Run verification
    const verification = verifyShadowArtifacts(evolution_id);
    if (!verification.passed) {
      return { 
        allowed: false, 
        reason: `Verification failed: ${verification.errors.join('; ')}` 
      };
    }
  }
  
  return { allowed: true, reason: 'Shadow verified and ready for production.' };
}

/**
 * Gate production apply on verified shadow
 */
export function requireVerifiedShadow(
  context: EvolveContext
): { allowed: boolean; reason: string; verification?: VerificationResult } {
  if (context.mode !== 'production') {
    return { allowed: true, reason: 'Not production mode' };
  }
  
  const verification = verifyShadowArtifacts(context.evolution_id);
  
  if (!verification.passed) {
    return {
      allowed: false,
      reason: `Cannot apply to production: ${verification.errors.join('; ')}`,
      verification,
    };
  }
  
  return {
    allowed: true,
    reason: 'Shadow verified',
    verification,
  };
}
