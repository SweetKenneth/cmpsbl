/**
 * CMPSBL® Unified Health Resolver
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Merges activation health (coverage-based) and runtime health
 * (event-based) into a single authoritative status.
 *
 * This eliminates conflicting signals between the Ascension pipeline
 * and the deployment health check, making /health authoritative.
 *
 * © CMPSBL® — All rights reserved.
 */

import type { VerificationSummary } from './verification-ledger';

// ═══════════════════════════════════════════════════════════════════════════════
// §1 — TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type HealthStatus = 'healthy' | 'partial' | 'degraded';

export interface ActivationHealthInput {
  readonly coverageRatio: number;
}

export interface RuntimeHealthInput {
  readonly anomalies: number;
  readonly enforcements: number;
  readonly totalEvents: number;
}

export interface UnifiedHealthResult {
  readonly status: HealthStatus;
  readonly activation: HealthStatus;
  readonly runtime: HealthStatus;
  readonly detail: {
    readonly coverageRatio: number;
    readonly coveragePct: number;
    readonly anomalies: number;
    readonly enforcements: number;
    readonly totalEvents: number;
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// §2 — INDIVIDUAL RESOLVERS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Compute activation health from coverage ratio.
 * ≥0.8 = healthy, ≥0.5 = partial, <0.5 = degraded
 */
export function computeActivationHealth(input: ActivationHealthInput): HealthStatus {
  if (input.coverageRatio >= 0.8) return 'healthy';
  if (input.coverageRatio >= 0.5) return 'partial';
  return 'degraded';
}

/**
 * Compute runtime health from verification events.
 * Anomalies → degraded, enforcements/events → healthy, else partial
 */
export function computeRuntimeHealth(input: RuntimeHealthInput): HealthStatus {
  if (input.anomalies > 0) return 'degraded';
  if (input.enforcements > 0 || input.totalEvents > 0) return 'healthy';
  return 'partial';
}

// ═══════════════════════════════════════════════════════════════════════════════
// §3 — UNIFIED RESOLVER
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Merge activation + runtime health into a single authoritative status.
 * Worst-of-both-worlds: either degraded → degraded, either partial → partial.
 */
export function resolveUnifiedHealth(
  activation: ActivationHealthInput,
  runtime: RuntimeHealthInput,
): UnifiedHealthResult {
  const activationHealth = computeActivationHealth(activation);
  const runtimeHealth = computeRuntimeHealth(runtime);

  const status: HealthStatus =
    activationHealth === 'degraded' || runtimeHealth === 'degraded'
      ? 'degraded'
      : activationHealth === 'partial' || runtimeHealth === 'partial'
        ? 'partial'
        : 'healthy';

  return {
    status,
    activation: activationHealth,
    runtime: runtimeHealth,
    detail: {
      coverageRatio: activation.coverageRatio,
      coveragePct: Math.round(activation.coverageRatio * 100),
      anomalies: runtime.anomalies,
      enforcements: runtime.enforcements,
      totalEvents: runtime.totalEvents,
    },
  };
}

/**
 * Convenience: resolve health from a VerificationSummary + coverage ratio.
 * Bridges the Ascension pipeline output directly to unified health.
 */
export function resolveHealthFromSummary(
  coverageRatio: number,
  verification: VerificationSummary,
): UnifiedHealthResult {
  return resolveUnifiedHealth(
    { coverageRatio },
    {
      anomalies: verification.anomalies,
      enforcements: verification.enforcements,
      totalEvents: verification.totalEvents,
    },
  );
}
