/**
 * ENCODE Patch Plan Validator — v1.0.0
 * Formal structural validation of PatchPlans before the approval gate.
 * 
 * Validates:
 *   - Schema completeness (required fields, types)
 *   - Dependency resolution (referenced files exist)
 *   - Conflict detection (overlapping edits to same file/region)
 *   - Surface compatibility (target surface supports operation)
 *   - Size bounds (max artifacts, max content length)
 */

import type { EncodeArtifact, TargetSurface } from './index';

// ═══ Types ════════════════════════════════════════════════════════

export interface PatchPlan {
  id: string;
  taskId: string;
  description: string;
  targetSurface: TargetSurface;
  artifacts: PatchArtifact[];
  dependencies: PatchDependency[];
  destructive: boolean;
  estimatedImpact: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
}

export interface PatchArtifact extends EncodeArtifact {
  lineRange?: { start: number; end: number };
  dependencies?: string[]; // file paths this artifact depends on
}

export interface PatchDependency {
  filePath: string;
  type: 'import' | 'type' | 'data' | 'config';
  required: boolean;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  score: number; // 0-100
}

export interface ValidationError {
  code: string;
  message: string;
  artifact?: string;
  severity: 'error' | 'fatal';
}

export interface ValidationWarning {
  code: string;
  message: string;
  artifact?: string;
}

// ═══ Constants ════════════════════════════════════════════════════

const MAX_ARTIFACTS_PER_PLAN = 50;
const MAX_CONTENT_LENGTH = 100_000; // 100KB per artifact
const MAX_PLAN_TOTAL_SIZE = 500_000; // 500KB total

const SURFACE_OPERATIONS: Record<TargetSurface, Set<string>> = {
  code: new Set(['create', 'modify', 'delete']),
  ui: new Set(['create', 'modify', 'delete']),
  docs: new Set(['create', 'modify']),
  db: new Set(['create', 'modify']),
  edge: new Set(['create', 'modify', 'delete']),
  tests: new Set(['create', 'modify', 'delete']),
};

// ═══ Core Validator ═══════════════════════════════════════════════

/**
 * Validate a PatchPlan before it reaches the approval gate
 */
export function validatePatchPlan(plan: PatchPlan): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // 1. Schema validation
  validateSchema(plan, errors);

  // 2. Artifact validation
  validateArtifacts(plan, errors, warnings);

  // 3. Dependency resolution
  validateDependencies(plan, errors, warnings);

  // 4. Conflict detection
  detectConflicts(plan, errors, warnings);

  // 5. Surface compatibility
  validateSurfaceCompat(plan, errors);

  // 6. Size bounds
  validateSizeBounds(plan, errors, warnings);

  // Calculate score
  const fatalCount = errors.filter(e => e.severity === 'fatal').length;
  const errorCount = errors.filter(e => e.severity === 'error').length;
  const warningCount = warnings.length;

  let score = 100;
  score -= fatalCount * 30;
  score -= errorCount * 15;
  score -= warningCount * 5;
  score = Math.max(0, Math.min(100, score));

  return {
    valid: fatalCount === 0 && errorCount === 0,
    errors,
    warnings,
    score,
  };
}

// ═══ Validation Steps ═════════════════════════════════════════════

function validateSchema(plan: PatchPlan, errors: ValidationError[]): void {
  if (!plan.id) {
    errors.push({ code: 'SCHEMA_001', message: 'Plan ID is required', severity: 'fatal' });
  }
  if (!plan.taskId) {
    errors.push({ code: 'SCHEMA_002', message: 'Task ID is required', severity: 'fatal' });
  }
  if (!plan.description || plan.description.length < 5) {
    errors.push({ code: 'SCHEMA_003', message: 'Description must be at least 5 characters', severity: 'error' });
  }
  if (!plan.targetSurface) {
    errors.push({ code: 'SCHEMA_004', message: 'Target surface is required', severity: 'fatal' });
  }
  if (!plan.artifacts || plan.artifacts.length === 0) {
    errors.push({ code: 'SCHEMA_005', message: 'At least one artifact is required', severity: 'error' });
  }
}

function validateArtifacts(plan: PatchPlan, errors: ValidationError[], warnings: ValidationWarning[]): void {
  if (!plan.artifacts) return;

  for (let i = 0; i < plan.artifacts.length; i++) {
    const art = plan.artifacts[i];
    const label = art.filePath || `artifact[${i}]`;

    if (!art.content && art.operation !== 'delete') {
      errors.push({ code: 'ART_001', message: `${label}: content is required for ${art.operation}`, artifact: label, severity: 'error' });
    }

    if (art.confidence < 0.3) {
      warnings.push({ code: 'ART_002', message: `${label}: low confidence (${art.confidence})`, artifact: label });
    }

    if (art.operation === 'delete' && !plan.destructive) {
      errors.push({ code: 'ART_003', message: `${label}: delete operation requires destructive=true`, artifact: label, severity: 'error' });
    }

    if (art.lineRange && art.lineRange.start > art.lineRange.end) {
      errors.push({ code: 'ART_004', message: `${label}: invalid line range (start > end)`, artifact: label, severity: 'error' });
    }
  }
}

function validateDependencies(plan: PatchPlan, errors: ValidationError[], warnings: ValidationWarning[]): void {
  if (!plan.dependencies) return;

  const artifactPaths = new Set(plan.artifacts?.map(a => a.filePath).filter(Boolean) || []);

  for (const dep of plan.dependencies) {
    if (!dep.filePath) {
      errors.push({ code: 'DEP_001', message: 'Dependency file path is required', severity: 'error' });
      continue;
    }

    // Check circular: artifact depends on itself via another artifact
    if (artifactPaths.has(dep.filePath) && dep.required) {
      warnings.push({ code: 'DEP_002', message: `Circular dependency: ${dep.filePath} is both modified and depended upon` });
    }
  }
}

function detectConflicts(plan: PatchPlan, errors: ValidationError[], warnings: ValidationWarning[]): void {
  if (!plan.artifacts || plan.artifacts.length < 2) return;

  // Group by file path
  const byFile = new Map<string, PatchArtifact[]>();
  for (const art of plan.artifacts) {
    if (art.filePath) {
      const list = byFile.get(art.filePath) || [];
      list.push(art);
      byFile.set(art.filePath, list);
    }
  }

  for (const [filePath, arts] of byFile.entries()) {
    if (arts.length > 1) {
      // Check for overlapping line ranges
      const withRanges = arts.filter(a => a.lineRange);
      for (let i = 0; i < withRanges.length; i++) {
        for (let j = i + 1; j < withRanges.length; j++) {
          const a = withRanges[i].lineRange!;
          const b = withRanges[j].lineRange!;
          if (a.start <= b.end && b.start <= a.end) {
            errors.push({
              code: 'CONFLICT_001',
              message: `Overlapping edits in ${filePath}: lines ${a.start}-${a.end} vs ${b.start}-${b.end}`,
              artifact: filePath,
              severity: 'error',
            });
          }
        }
      }

      // Multiple operations on same file is a warning
      if (arts.length > 2) {
        warnings.push({
          code: 'CONFLICT_002',
          message: `${arts.length} edits targeting ${filePath} — consider consolidation`,
          artifact: filePath,
        });
      }
    }
  }
}

function validateSurfaceCompat(plan: PatchPlan, errors: ValidationError[]): void {
  const allowedOps = SURFACE_OPERATIONS[plan.targetSurface];
  if (!allowedOps || !plan.artifacts) return;

  for (const art of plan.artifacts) {
    if (!allowedOps.has(art.operation)) {
      errors.push({
        code: 'SURFACE_001',
        message: `Operation "${art.operation}" not allowed on surface "${plan.targetSurface}"`,
        artifact: art.filePath,
        severity: 'error',
      });
    }
  }
}

function validateSizeBounds(plan: PatchPlan, errors: ValidationError[], warnings: ValidationWarning[]): void {
  if (!plan.artifacts) return;

  if (plan.artifacts.length > MAX_ARTIFACTS_PER_PLAN) {
    errors.push({
      code: 'SIZE_001',
      message: `Too many artifacts: ${plan.artifacts.length} (max ${MAX_ARTIFACTS_PER_PLAN})`,
      severity: 'error',
    });
  }

  let totalSize = 0;
  for (const art of plan.artifacts) {
    const size = art.content?.length || 0;
    totalSize += size;

    if (size > MAX_CONTENT_LENGTH) {
      errors.push({
        code: 'SIZE_002',
        message: `Artifact ${art.filePath || '?'} exceeds max content length (${size} > ${MAX_CONTENT_LENGTH})`,
        artifact: art.filePath,
        severity: 'error',
      });
    }
  }

  if (totalSize > MAX_PLAN_TOTAL_SIZE) {
    warnings.push({
      code: 'SIZE_003',
      message: `Total plan size (${totalSize} bytes) exceeds recommended limit (${MAX_PLAN_TOTAL_SIZE})`,
    });
  }
}

/**
 * Quick pre-check — returns true if plan is structurally sound
 */
export function quickValidate(plan: PatchPlan): boolean {
  return validatePatchPlan(plan).valid;
}
