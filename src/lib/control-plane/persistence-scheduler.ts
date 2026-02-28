/**
 * Persistence Scheduler
 * Periodic metrics snapshot + automatic persistence hooks.
 * Runs every 30s to capture durable metric snapshots.
 */

import { isEnabled } from '@/lib/substrate/feature-flags';
import { getAllFlags } from '@/lib/substrate/feature-flags';
import { getBudgetStats } from '@/lib/substrate/retry-budget';
import { getAllSchemas } from '@/lib/substrate/schema-registry';
import { getMetricValue } from '@/lib/substrate/metric-exporter';
import {
  saveFlags,
  saveRetryBudgets,
  saveSchemas,
  saveMetricsSnapshot,
} from './persistence';

let intervalId: ReturnType<typeof setInterval> | null = null;

const SNAPSHOT_INTERVAL_MS = 30_000; // 30 seconds

export function startPersistenceScheduler(): void {
  if (intervalId) return;
  if (!isEnabled('substrate.persistent_control_plane')) return;

  intervalId = setInterval(() => {
    try {
      // Snapshot flags
      const flags = getAllFlags();
      if (flags.length > 0) {
        saveFlags(flags.map(f => ({
          key: f.key,
          enabled: f.enabled,
          rolloutPercent: f.rolloutPercent,
        })));
      }

      // Snapshot retry budgets
      const budgets = getBudgetStats();
      if (budgets.length > 0) {
        saveRetryBudgets(budgets.map(b => ({
          module: b.module,
          tokens: b.remaining,
          maxTokens: 10,
          refillRate: 0.5,
          totalRetries: b.total,
          totalExhausted: b.exhausted,
        })));
      }

      // Snapshot schemas
      const schemas = getAllSchemas();
      if (schemas.length > 0) {
        saveSchemas(schemas.map(s => ({
          entity: s.entity,
          version: s.version,
          fields: s.fields,
          migrations: s.migrations,
        })));
      }

      // Compact metrics snapshot (counters + gauges only)
      const metricNames = [
        'substrate_invocations_total',
        'substrate_errors_total',
        'substrate_active_modules',
      ];
      const metricsToSave = metricNames
        .map(name => {
          const value = getMetricValue(name);
          return value !== null ? { name, value, labels: {} } : null;
        })
        .filter((m): m is { name: string; value: number; labels: Record<string, string> } => m !== null);

      if (metricsToSave.length > 0) {
        saveMetricsSnapshot(metricsToSave);
      }
    } catch (err) {
      console.warn('[cp-scheduler] Periodic snapshot failed:', err);
    }
  }, SNAPSHOT_INTERVAL_MS);

  console.log('[cp-scheduler] Persistence scheduler started (30s interval)');
}

export function stopPersistenceScheduler(): void {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}
