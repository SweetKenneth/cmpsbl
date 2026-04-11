/**
 * CMPSBL® Attachment Schema — Formal Behavior Contracts
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Phase 2: First-Class Attachments
 *
 * Provides validation, normalization, and introspection for
 * attachment entries. Every attachment is a behavior contract
 * that must be valid before it can bind to the runtime.
 *
 * Design constraints:
 *   - Validation is synchronous and deterministic
 *   - Invalid attachments are rejected with structured errors
 *   - Schema is portable (JSON-serializable)
 *   - Introspection supports audit/proof requirements
 *
 * © CMPSBL® — All rights reserved.
 */

import type { AttachmentEntry, AttachmentPolicy, OrchestrationAction, OrchestrationSignal } from './orchestration-engine';
import { getCapabilityDefinition, resolveCapabilityActions, resolveCapabilitySignal, isCapabilityRegistered } from './capability-registry';
import { resolveCondition } from './condition-resolver';

// ═══════════════════════════════════════════════════════════════════════════════
// §1 — TYPES
// ═══════════════════════════════════════════════════════════════════════════════

/** Validation result for an attachment entry */
export interface AttachmentValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
  readonly warnings: readonly string[];
  readonly normalizedEntry?: AttachmentEntry;
}

/** Resolved attachment — fully expanded with no ambiguity */
export interface ResolvedAttachment {
  readonly functionName: string;
  readonly capability: string;
  readonly primitive: string;
  readonly signal: OrchestrationSignal;
  readonly actions: readonly OrchestrationAction[];
  readonly conditionKey: string | undefined;
  readonly enforces: boolean;
  readonly source: 'policy' | 'capability-default';
}

/** Introspection summary for a set of attachments */
export interface AttachmentManifest {
  readonly totalAttachments: number;
  readonly enforcingCount: number;
  readonly observingCount: number;
  readonly primitives: readonly string[];
  readonly capabilities: readonly string[];
  readonly entries: readonly ResolvedAttachment[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// §2 — VALID VALUES
// ═══════════════════════════════════════════════════════════════════════════════

const VALID_SIGNALS: ReadonlySet<string> = new Set<OrchestrationSignal>([
  'anomaly_detected',
  'execution_failed',
  'execution_retried',
  'execution_started',
  'execution_succeeded',
  'rule_registered',
  'state_written',
  'validation_failed',
]);

const VALID_ACTIONS: ReadonlySet<string> = new Set<OrchestrationAction>([
  'validate_input',
  'persist_state',
  'block_execution',
  'tighten_interception',
  'trip_execution',
  'log_only',
]);

// ═══════════════════════════════════════════════════════════════════════════════
// §3 — VALIDATION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Validate an attachment entry against the schema.
 * Returns structured errors/warnings without throwing.
 */
export function validateAttachment(entry: unknown): AttachmentValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (typeof entry !== 'object' || entry === null) {
    return { valid: false, errors: ['Attachment must be a non-null object'], warnings: [] };
  }

  const e = entry as Record<string, unknown>;

  /* Required fields */
  if (typeof e.functionName !== 'string' || e.functionName.length === 0) {
    errors.push('functionName is required and must be a non-empty string');
  }

  if (typeof e.capability !== 'string' || e.capability.length === 0) {
    errors.push('capability is required and must be a non-empty string');
  }

  if (typeof e.primitive !== 'string' || e.primitive.length === 0) {
    errors.push('primitive is required and must be a non-empty string');
  }

  /* Capability must be registered — no silent fallbacks */
  if (typeof e.capability === 'string' && !isCapabilityRegistered(e.capability)) {
    errors.push(`capability '${e.capability}' is not registered — register before attaching`);
  }

  /* Policy validation */
  if (e.policy !== undefined) {
    if (typeof e.policy !== 'object' || e.policy === null) {
      errors.push('policy must be a non-null object if provided');
    } else {
      const policy = e.policy as Record<string, unknown>;

      if (typeof policy.on !== 'string' || !VALID_SIGNALS.has(policy.on)) {
        errors.push(`policy.on must be a valid signal (got '${String(policy.on)}')`);
      }

      if (policy.condition !== undefined && typeof policy.condition !== 'string') {
        errors.push('policy.condition must be a string if provided');
      }

      if (policy.condition !== undefined && typeof policy.condition === 'string') {
        const resolved = resolveCondition(policy.condition);
        if (!resolved) {
          errors.push(`policy.condition '${policy.condition}' is not a registered condition`);
        }
      }

      /* Validate 'then' — single action or array of actions */
      if (policy.then === undefined) {
        errors.push('policy.then is required when policy is provided');
      } else if (typeof policy.then === 'string') {
        if (!VALID_ACTIONS.has(policy.then)) {
          errors.push(`policy.then '${policy.then}' is not a valid action`);
        }
      } else if (Array.isArray(policy.then)) {
        if (policy.then.length === 0) {
          errors.push('policy.then array must not be empty');
        }
        for (const action of policy.then) {
          if (typeof action !== 'string' || !VALID_ACTIONS.has(action)) {
            errors.push(`policy.then contains invalid action '${String(action)}'`);
          }
        }
      } else {
        errors.push('policy.then must be a string or array of strings');
      }
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors, warnings };
  }

  return {
    valid: true,
    errors: [],
    warnings,
    normalizedEntry: entry as AttachmentEntry,
  };
}

/**
 * Validate an array of attachment entries.
 * Returns per-entry results.
 */
export function validateAttachments(
  entries: readonly unknown[],
): readonly AttachmentValidationResult[] {
  return entries.map(validateAttachment);
}

// ═══════════════════════════════════════════════════════════════════════════════
// §4 — RESOLUTION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Resolve an attachment entry into its fully-expanded form.
 * Merges policy overrides with capability defaults.
 */
export function resolveAttachment(entry: AttachmentEntry): ResolvedAttachment {
  if (entry.policy) {
    const thenActions = Array.isArray(entry.policy.then)
      ? entry.policy.then as readonly OrchestrationAction[]
      : [entry.policy.then as OrchestrationAction];

    return {
      functionName: entry.functionName,
      capability: entry.capability,
      primitive: entry.primitive,
      signal: entry.policy.on,
      actions: thenActions,
      conditionKey: entry.policy.condition,
      enforces: thenActions.includes('block_execution'),
      source: 'policy',
    };
  }

  const actions = resolveCapabilityActions(entry.capability);
  const signal = resolveCapabilitySignal(entry.capability);

  return {
    functionName: entry.functionName,
    capability: entry.capability,
    primitive: entry.primitive,
    signal,
    actions,
    conditionKey: undefined,
    enforces: actions.includes('block_execution'),
    source: 'capability-default',
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// §5 — MANIFEST GENERATION (for proof/audit/portability)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Generate an attachment manifest from a set of entries.
 * Used for introspection, audit trails, and portable export.
 */
export function generateAttachmentManifest(
  entries: readonly AttachmentEntry[],
): AttachmentManifest {
  const resolved = entries.map(resolveAttachment);
  const primitives = new Set(resolved.map(r => r.primitive));
  const capabilities = new Set(resolved.map(r => r.capability));

  return {
    totalAttachments: resolved.length,
    enforcingCount: resolved.filter(r => r.enforces).length,
    observingCount: resolved.filter(r => !r.enforces).length,
    primitives: Array.from(primitives).sort(),
    capabilities: Array.from(capabilities).sort(),
    entries: resolved,
  };
}
