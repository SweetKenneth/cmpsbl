/**
 * CMPSBL® Artifact Auto-Initializer
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Phase 3: Zero-glue artifact activation.
 *
 * When an artifact is loaded, this initializer:
 *   1. Reads the manifest (__MANA_MANIFEST__)
 *   2. Reads the attachment list (__MANA_ATTACHMENTS__)
 *   3. Auto-resolves engines for each primitive
 *   4. Registers rules from attachment policies
 *   5. Wraps exported functions with engine-appropriate behavior
 *   6. Emits activation proof
 *
 * Result: "Drop-in → behavior works" — Phase 3 exit criterion.
 *
 * © CMPSBL® — All rights reserved.
 */

import { wrapGeneric, wrapGenericAsync } from './generic-wrapper';
import type { AttachmentEntry } from './engines/orchestration-engine';
import { registerAttachmentRules } from './engines/orchestration-engine';
import { resolveEngine } from './engines/primitive-engine-map';
import { resolveIdentity, isAlreadyWrapped } from './engines/function-identity';
import { generateActivationReport, getActivationSummary } from './engines/activation-proof';
import type { ActivationReport } from './engines/activation-proof';

// ═══════════════════════════════════════════════════════════════════════════════
// §1 — TYPES
// ═══════════════════════════════════════════════════════════════════════════════

/** Manifest injected into artifact at build time */
export interface ArtifactManifest {
  readonly name: string;
  readonly tier: string;
  readonly cjpi: number;
  readonly modules: readonly string[];
  readonly version: string;
  readonly fingerprint?: string;
  readonly category?: string;
}

/** A function export discovered in the artifact */
export interface ExportedFunction {
  readonly name: string;
  readonly fn: (...args: unknown[]) => unknown;
  readonly primitive: string;
  readonly isAsync?: boolean;
}

/** Result of auto-initialization */
export interface InitializationResult {
  readonly success: boolean;
  readonly manifest: ArtifactManifest | null;
  readonly wrappedCount: number;
  readonly skippedCount: number;
  readonly activationReport: ActivationReport;
  readonly summary: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// §2 — AUTO-INITIALIZATION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Initialize an artifact with zero manual wiring.
 *
 * @param exports - The module's exported functions to wrap
 * @param manifest - Artifact manifest (or read from __MANA_MANIFEST__)
 * @param attachments - Attachment entries (or read from __MANA_ATTACHMENTS__)
 * @returns Wrapped exports object + activation proof
 */
export function initializeArtifact<T extends Record<string, unknown>>(
  exports: T,
  manifest?: ArtifactManifest,
  attachments?: readonly AttachmentEntry[],
): { wrapped: T; result: InitializationResult } {

  // Resolve manifest
  const resolvedManifest = manifest ?? readGlobalManifest();

  // Resolve attachments
  const resolvedAttachments = attachments ?? readGlobalAttachments();

  // Phase 1: Pre-register all attachment rules by primitive
  if (resolvedAttachments.length > 0) {
    const byPrimitive = groupByPrimitive(resolvedAttachments);
    for (const [primitive, entries] of byPrimitive) {
      registerAttachmentRules(primitive, entries);
    }
  }

  // Phase 2: Build attachment lookup for function → primitive mapping
  const fnToPrimitive = new Map<string, string>();
  for (const a of resolvedAttachments) {
    fnToPrimitive.set(a.functionName, a.primitive);
  }

  // Phase 3: Wrap all exported functions
  let wrappedCount = 0;
  let skippedCount = 0;
  const wrapped = { ...exports } as Record<string, unknown>;

  for (const [key, value] of Object.entries(exports)) {
    if (typeof value !== 'function') continue;

    // Resolve primitive: attachment mapping > manifest modules > CORE fallback
    const primitive = fnToPrimitive.get(key)
      ?? resolvedManifest?.modules[0]
      ?? 'CORE';

    // Skip if already wrapped (collision-free identity check)
    if (isAlreadyWrapped(primitive, key)) {
      skippedCount++;
      continue;
    }

    // Register identity
    resolveIdentity(primitive, value as (...args: unknown[]) => unknown, key);

    // Resolve engine
    const engine = resolveEngine(primitive);

    // Get relevant attachments for this function
    const fnAttachments = resolvedAttachments.filter(a => a.functionName === key);

    // Wrap with engine-appropriate behavior
    if (isAsyncFunction(value)) {
      wrapped[key] = wrapGenericAsync(
        primitive,
        value as (...args: unknown[]) => Promise<unknown>,
        fnAttachments.length > 0 ? fnAttachments : undefined,
        key,
      );
    } else {
      wrapped[key] = wrapGeneric(
        primitive,
        value as (...args: unknown[]) => unknown,
        fnAttachments.length > 0 ? fnAttachments : undefined,
        key,
      );
    }

    wrappedCount++;
  }

  // Phase 4: Generate activation proof
  const activationReport = generateActivationReport();
  const summary = getActivationSummary();

  return {
    wrapped: wrapped as T,
    result: {
      success: wrappedCount > 0,
      manifest: resolvedManifest,
      wrappedCount,
      skippedCount,
      activationReport,
      summary,
    },
  };
}

/**
 * Convenience: wrap a single module's exports with auto-initialization.
 * Returns the wrapped module directly (no result metadata).
 */
export function activate<T extends Record<string, unknown>>(
  exports: T,
  primitive?: string,
  attachments?: readonly AttachmentEntry[],
): T {
  const manifest: ArtifactManifest | undefined = primitive
    ? { name: 'auto', tier: 'Raw', cjpi: 0, modules: [primitive], version: '1.0.0' }
    : undefined;

  const { wrapped } = initializeArtifact(exports, manifest, attachments);
  return wrapped;
}

// ═══════════════════════════════════════════════════════════════════════════════
// §3 — HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

function groupByPrimitive(
  attachments: readonly AttachmentEntry[],
): Map<string, AttachmentEntry[]> {
  const map = new Map<string, AttachmentEntry[]>();
  for (const a of attachments) {
    const existing = map.get(a.primitive) ?? [];
    existing.push(a);
    map.set(a.primitive, existing);
  }
  return map;
}

function isAsyncFunction(fn: unknown): boolean {
  if (typeof fn !== 'function') return false;
  return fn.constructor?.name === 'AsyncFunction'
    || fn.toString().startsWith('async ');
}

/** Read manifest from global injection point (build-time injected) */
function readGlobalManifest(): ArtifactManifest | null {
  try {
    if (typeof (globalThis as Record<string, unknown>).__MANA_MANIFEST__ !== 'undefined') {
      return (globalThis as Record<string, unknown>).__MANA_MANIFEST__ as ArtifactManifest;
    }
  } catch { /* Not available */ }
  return null;
}

/** Read attachments from global injection point (build-time injected) */
function readGlobalAttachments(): readonly AttachmentEntry[] {
  try {
    if (typeof (globalThis as Record<string, unknown>).__MANA_ATTACHMENTS__ !== 'undefined') {
      return (globalThis as Record<string, unknown>).__MANA_ATTACHMENTS__ as readonly AttachmentEntry[];
    }
  } catch { /* Not available */ }
  return [];
}
