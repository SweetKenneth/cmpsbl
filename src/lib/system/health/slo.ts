/**
 * SLO Spec Management — Per-module SLO definitions
 */

import type { SloSpec } from './types';
import { DEFAULT_SLO } from './types';

const sloSpecs = new Map<string, SloSpec>();

/** Register an SLO spec for a module */
export function registerSlo(module: string, spec?: Partial<Omit<SloSpec, 'module'>>): void {
  sloSpecs.set(module, { module, ...DEFAULT_SLO, ...spec });
}

/** Get SLO spec for a module (returns default if not registered) */
export function getSlo(module: string): SloSpec {
  return sloSpecs.get(module) ?? { module, ...DEFAULT_SLO };
}

/** Get all registered SLO specs */
export function getAllSlos(): SloSpec[] {
  return Array.from(sloSpecs.values());
}

/** Check if a module is within its SLO */
export function checkSloCompliance(
  module: string,
  metrics: { uptime: number; error_rate: number; p95_ms: number; p99_ms: number }
): { compliant: boolean; violations: string[] } {
  const slo = getSlo(module);
  const violations: string[] = [];

  if (metrics.uptime < slo.uptime_target) {
    violations.push(`uptime ${(metrics.uptime * 100).toFixed(2)}% < ${(slo.uptime_target * 100).toFixed(2)}%`);
  }
  if (metrics.error_rate > slo.error_rate_target) {
    violations.push(`error_rate ${(metrics.error_rate * 100).toFixed(2)}% > ${(slo.error_rate_target * 100).toFixed(2)}%`);
  }
  if (metrics.p95_ms > slo.p95_latency_target_ms) {
    violations.push(`p95 ${metrics.p95_ms}ms > ${slo.p95_latency_target_ms}ms`);
  }
  if (metrics.p99_ms > slo.p99_latency_target_ms) {
    violations.push(`p99 ${metrics.p99_ms}ms > ${slo.p99_latency_target_ms}ms`);
  }

  return { compliant: violations.length === 0, violations };
}
