/**
 * CMPSBL® Production Provider — Phase 8: Productization Layer
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Developer-facing API that makes the Ascension pipeline
 * approachable in 3 calls: configure → init → execute.
 *
 * Design goals:
 *   - A developer understands value in minutes
 *   - Behavior is visible, not implied
 *   - System feels like a tool, not a concept
 *
 * Constraint: Single active session per process.
 * Running multiple concurrent sessions will cause cross-contamination
 * in the verification ledger. Scoped ledgers are a future enhancement.
 *
 * © CMPSBL® — All rights reserved.
 */

import type { AscensionArtifact, AscensionOptions } from './ascension-loop';
import { ascend, renderPipelineSummary } from './ascension-loop';
import type { HealthCheckResponse } from './portable-artifact';
import { getHealthCheck, detectEnvironment, generateDeploymentManifest } from './portable-artifact';
import { renderVerificationReport, resetVerificationLedger } from './engines/verification-ledger';
import { resolveHealthFromSummary } from './engines/unified-health';
import type { HealthStatus } from './engines/unified-health';

// ═══════════════════════════════════════════════════════════════════════════════
// §1 — CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

/** High-level configuration — developer-legible, no engine jargon */
export interface AscensionConfig {
  /** Human-readable project name */
  readonly name: string;
  /** Semantic version of the artifact */
  readonly version?: string;
  /** Optional CJPI override (auto-computed if omitted) */
  readonly cjpi?: number;
  /** Category tag for organization */
  readonly category?: string;
  /** Source language hint */
  readonly sourceLanguage?: string;
  /** AbortSignal for graceful cancellation */
  readonly signal?: AbortSignal;
}

// ═══════════════════════════════════════════════════════════════════════════════
// §2 — STATUS SNAPSHOT
// ═══════════════════════════════════════════════════════════════════════════════

/** Quick-glance status — one call instead of three */
export interface SessionStatus {
  readonly health: HealthStatus;
  readonly coverage: number;
  readonly fingerprint: string | null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// §3 — SESSION (stateful wrapper around an Ascension artifact)
// ═══════════════════════════════════════════════════════════════════════════════

/** Lightweight handle returned after initialization */
export interface AscensionSession<T extends Record<string, unknown> = Record<string, unknown>> {
  /** The wrapped module — drop-in replacement */
  readonly exports: T;
  /** Current health status (unified: activation + runtime) */
  health(): HealthStatus;
  /** Quick-glance status snapshot */
  status(): SessionStatus;
  /** Full health check (for /health endpoint) */
  healthCheck(): HealthCheckResponse;
  /** Human-readable pipeline summary */
  summary(): string;
  /** Human-readable verification report */
  verificationReport(): string;
  /** Raw artifact (for advanced use) */
  readonly artifact: AscensionArtifact<T>;
  /**
   * Tear down — release latches and clear ledger.
   * ⚠ Resets global verification state. Single active session per process.
   */
  destroy(): void;
}

// ═══════════════════════════════════════════════════════════════════════════════
// §4 — INIT (the developer entry point)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Initialize an Ascension session.
 *
 * ```ts
 * import { init } from '@cmpsbl/runtime';
 * import * as myLib from './my-lib';
 *
 * const session = init(myLib, sourceCode, { name: 'my-lib' });
 * // session.exports is a drop-in replacement for myLib
 * // session.health() returns 'healthy' | 'partial' | 'degraded'
 * // session.status() returns { health, coverage, fingerprint }
 * ```
 */
export function init<T extends Record<string, unknown>>(
  moduleExports: T,
  sourceCode: string,
  config: AscensionConfig,
): AscensionSession<T> {
  // Respect cancellation
  if (config.signal?.aborted) {
    throw new Error('Ascension cancelled before init');
  }

  const options: AscensionOptions = {
    name: config.name,
    version: config.version,
    cjpi: config.cjpi,
    category: config.category,
    sourceLanguage: config.sourceLanguage,
  };

  const artifact = ascend(sourceCode, moduleExports, options);

  /** Resolve unified health from the artifact's real signals */
  function resolveHealth(): HealthStatus {
    return resolveHealthFromSummary(
      artifact.pipeline.coverageRatio,
      artifact.verification,
    ).status;
  }

  return {
    exports: artifact.exports,

    health(): HealthStatus {
      return resolveHealth();
    },

    status(): SessionStatus {
      return {
        health: resolveHealth(),
        coverage: artifact.pipeline.coverageRatio,
        fingerprint: artifact.fingerprint?.hash ?? null,
      };
    },

    healthCheck(): HealthCheckResponse {
      return getHealthCheck();
    },

    summary(): string {
      return renderPipelineSummary(artifact);
    },

    verificationReport(): string {
      return renderVerificationReport();
    },

    artifact,

    destroy(): void {
      // ⚠ Global state — single active session per process
      resetVerificationLedger();
    },
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// §5 — QUICK-START HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * One-shot: ascend + return wrapped exports (no session management).
 * For scripts and CLIs that don't need ongoing health checks.
 */
export function ascendQuick<T extends Record<string, unknown>>(
  moduleExports: T,
  sourceCode: string,
  name: string,
): T {
  const artifact = ascend(sourceCode, moduleExports, { name });
  return artifact.exports;
}

/** Re-export detectEnvironment for developer convenience */
export { detectEnvironment } from './portable-artifact';
