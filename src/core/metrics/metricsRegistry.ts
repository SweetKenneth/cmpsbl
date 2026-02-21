/**
 * GOAL — Global Metrics Registry
 * Central registry for all module adapters.
 * DECODE accesses system-wide numeric state through this registry only.
 * vX.STRUCTURE.2
 */

import type { ModuleAdapter, ModuleLiveMetrics, NumericMetric, MetricUnit } from './metricsSchema';
import { createMetric } from './metricsSchema';

// ═══ Registry State ═══════════════════════════════════════════════

const adapters = new Map<string, ModuleAdapter>();

// ═══ Registration ═════════════════════════════════════════════════

export function registerModuleAdapter(adapter: ModuleAdapter): void {
  adapters.set(adapter.moduleId, adapter);
}

export function unregisterModuleAdapter(moduleId: string): void {
  adapters.delete(moduleId);
}

export function getRegisteredModuleIds(): string[] {
  return Array.from(adapters.keys());
}

export function getAdapter(moduleId: string): ModuleAdapter | undefined {
  return adapters.get(moduleId);
}

// ═══ Aggregate Queries ════════════════════════════════════════════

/**
 * Pull live metrics from ALL registered adapters in parallel.
 * Returns a map of moduleId → metrics.
 */
export async function getAllLiveMetrics(): Promise<Map<string, ModuleLiveMetrics>> {
  const results = new Map<string, ModuleLiveMetrics>();
  const entries = Array.from(adapters.entries());

  const settled = await Promise.allSettled(
    entries.map(async ([id, adapter]) => {
      const metrics = await adapter.getLiveMetrics();
      return { id, metrics };
    })
  );

  for (const result of settled) {
    if (result.status === 'fulfilled') {
      results.set(result.value.id, result.value.metrics);
    }
  }

  return results;
}

/**
 * Flatten all module metrics into a single NumericMetric array.
 */
export async function flattenAllMetrics(snapshotId: string): Promise<NumericMetric[]> {
  const allMetrics = await getAllLiveMetrics();
  const flat: NumericMetric[] = [];

  for (const [moduleId, metrics] of allMetrics) {
    // Counters
    for (const [name, value] of Object.entries(metrics.counters)) {
      flat.push(createMetric(name, value, 'count', moduleId, snapshotId));
    }
    // Rates
    for (const [name, value] of Object.entries(metrics.rates)) {
      flat.push(createMetric(name, value, 'rate', moduleId, snapshotId));
    }
    // Health score
    flat.push(createMetric('healthScore', metrics.healthScore, 'score', moduleId, snapshotId));
  }

  return flat;
}

/**
 * Validate all adapters return consistent data.
 * Returns discrepancies found.
 */
export async function validateAll(): Promise<Array<{
  moduleId: string;
  issue: string;
}>> {
  const issues: Array<{ moduleId: string; issue: string }> = [];
  const allMetrics = await getAllLiveMetrics();

  for (const [moduleId, metrics] of allMetrics) {
    if (metrics.healthScore < 0 || metrics.healthScore > 100) {
      issues.push({ moduleId, issue: `healthScore out of range: ${metrics.healthScore}` });
    }
    if (!metrics.lastUpdated || isNaN(Date.parse(metrics.lastUpdated))) {
      issues.push({ moduleId, issue: `Invalid lastUpdated timestamp` });
    }
    // Check for NaN values in counters
    for (const [key, val] of Object.entries(metrics.counters)) {
      if (isNaN(val) || !isFinite(val)) {
        issues.push({ moduleId, issue: `Counter "${key}" has invalid value: ${val}` });
      }
    }
    for (const [key, val] of Object.entries(metrics.rates)) {
      if (isNaN(val) || !isFinite(val)) {
        issues.push({ moduleId, issue: `Rate "${key}" has invalid value: ${val}` });
      }
    }
  }

  return issues;
}
