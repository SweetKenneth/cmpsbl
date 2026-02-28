/**
 * Persistence Scheduler (v2 — Leader-Gated)
 * Acquires lease before running periodic snapshots.
 * Only the leader instance performs scheduled commits.
 */

import { supabase } from '@/integrations/supabase/client';
import { isEnabled } from '@/lib/substrate/feature-flags';
import { getAllFlags } from '@/lib/substrate/feature-flags';
import { getBudgetStats } from '@/lib/substrate/retry-budget';
import { getAllSchemas } from '@/lib/substrate/schema-registry';
import { getMetricValue } from '@/lib/substrate/metric-exporter';
import { getInstanceId, getEnv, getTenantId } from './identity';
import {
  saveFlags,
  saveRetryBudgets,
  saveSchemas,
  saveMetricsSnapshot,
} from './persistence';

let intervalId: ReturnType<typeof setInterval> | null = null;
let renewalId: ReturnType<typeof setInterval> | null = null;
let _isLeader = false;

const SNAPSHOT_INTERVAL_MS = 30_000; // 30 seconds
const LEASE_KEY = 'substrate_control_plane';
const LEASE_TTL_S = 60;

export function isLeader(): boolean {
  return _isLeader;
}

async function acquireLease(): Promise<boolean> {
  if (!isEnabled('substrate.cp_leader_lease')) {
    // No lease required — act as leader
    return true;
  }

  try {
    const { data, error } = await supabase.rpc('cp_acquire_lease', {
      p_lease_key: LEASE_KEY,
      p_owner_id: getInstanceId(),
      p_ttl_seconds: LEASE_TTL_S,
      p_env: getEnv(),
      p_tenant_id: getTenantId(),
    });
    if (error) {
      console.warn('[cp-scheduler] Lease acquire failed:', error.message);
      return false;
    }
    return data === true;
  } catch (err) {
    console.warn('[cp-scheduler] Lease acquire error:', err);
    return false;
  }
}

async function renewLease(): Promise<boolean> {
  if (!isEnabled('substrate.cp_leader_lease')) return true;

  try {
    const { data, error } = await supabase.rpc('cp_renew_lease', {
      p_lease_key: LEASE_KEY,
      p_owner_id: getInstanceId(),
      p_ttl_seconds: LEASE_TTL_S,
    });
    if (error) return false;
    return data === true;
  } catch {
    return false;
  }
}

async function releaseLease(): Promise<void> {
  if (!isEnabled('substrate.cp_leader_lease')) return;

  try {
    await supabase.rpc('cp_release_lease', {
      p_lease_key: LEASE_KEY,
      p_owner_id: getInstanceId(),
    });
  } catch { /* best effort */ }
}

function doSnapshot(): void {
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

    // Compact metrics snapshot
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
}

export async function startPersistenceScheduler(): Promise<void> {
  if (intervalId) return;
  if (!isEnabled('substrate.persistent_control_plane')) return;

  // Try to become leader
  _isLeader = await acquireLease();
  if (!_isLeader) {
    console.log('[cp-scheduler] Another instance is leader, standby mode');
    // Retry lease acquisition periodically
    renewalId = setInterval(async () => {
      _isLeader = await acquireLease();
      if (_isLeader && !intervalId) {
        startSnapshotInterval();
      }
    }, LEASE_TTL_S * 1000);
    return;
  }

  startSnapshotInterval();

  // Renew lease periodically (half TTL)
  renewalId = setInterval(async () => {
    const renewed = await renewLease();
    if (!renewed) {
      console.warn('[cp-scheduler] Lease renewal failed, stopping scheduler');
      _isLeader = false;
      stopPersistenceScheduler();
    }
  }, (LEASE_TTL_S / 2) * 1000);

  console.log(`[cp-scheduler] Leader scheduler started (instance=${getInstanceId().slice(0, 8)})`);
}

function startSnapshotInterval(): void {
  if (intervalId) return;
  intervalId = setInterval(doSnapshot, SNAPSHOT_INTERVAL_MS);
  console.log('[cp-scheduler] Snapshot interval active (30s)');
}

export async function stopPersistenceScheduler(): Promise<void> {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
  if (renewalId) {
    clearInterval(renewalId);
    renewalId = null;
  }
  if (_isLeader) {
    await releaseLease();
    _isLeader = false;
  }
}
