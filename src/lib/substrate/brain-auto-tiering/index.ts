/**
 * BRAIN Auto-Tiering Enforcement Engine
 * 
 * Enforces tier capacity limits via DB-level bulk RPCs.
 * Hot(500) → Warm(10K) → Cold(10K) → Pruned → Expired
 * 
 * Runs automatically on a 15-minute interval when started.
 */

import { supabase } from '@/integrations/supabase/client';
import { emit } from '../events';

// ─── Configuration ───────────────────────────────────────────────────────────

export interface AutoTieringConfig {
  hotLimit: number;
  warmLimit: number;
  coldLimit: number;
  batchSize: number;
  intervalMs: number;
  enforceOnCycle: boolean;
  watermarkPercent: number;
}

const DEFAULT_CONFIG: AutoTieringConfig = {
  hotLimit: 500,
  warmLimit: 10_000,
  coldLimit: 10_000,
  batchSize: 2000,
  intervalMs: 15 * 60 * 1000, // 15 minutes
  enforceOnCycle: true,
  watermarkPercent: 80,
};

let config = { ...DEFAULT_CONFIG };

// ─── State ───────────────────────────────────────────────────────────────────

export interface TieringReport {
  timestamp: string;
  hotBefore: number;
  hotAfter: number;
  warmBefore: number;
  warmAfter: number;
  coldBefore: number;
  coldAfter: number;
  demotedHotToWarm: number;
  demotedWarmToCold: number;
  prunedCold: number;
  expiredPruned: number;
  enforcement: 'none' | 'soft' | 'hard' | 'emergency';
  durationMs: number;
}

const history: TieringReport[] = [];
let schedulerInterval: ReturnType<typeof setInterval> | null = null;
let isRunning = false;

// ─── Tier Counts (uses DB RPC) ──────────────────────────────────────────────

interface TierCounts {
  hot: number;
  warm: number;
  cold: number;
  flat: number;
  pruned: number;
}

async function getTierCounts(): Promise<TierCounts> {
  const { data, error } = await supabase.rpc('brain_get_tier_counts');
  if (error || !data) {
    console.warn('[AutoTiering] Failed to get tier counts, falling back to queries');
    const [h, w, c] = await Promise.all([
      supabase.from('brain_memory_hot').select('id', { count: 'exact', head: true }),
      supabase.from('brain_memory_warm').select('id', { count: 'exact', head: true }),
      supabase.from('brain_memory_cold').select('id', { count: 'exact', head: true }),
    ]);
    return { hot: h.count ?? 0, warm: w.count ?? 0, cold: c.count ?? 0, flat: 0, pruned: 0 };
  }
  const counts: TierCounts = { hot: 0, warm: 0, cold: 0, flat: 0, pruned: 0 };
  for (const row of data as any[]) {
    counts[row.tier as keyof TierCounts] = Number(row.cnt);
  }
  return counts;
}

// ─── Bulk Operations (DB RPCs) ──────────────────────────────────────────────

async function bulkDemoteHotToWarm(batchSize: number): Promise<number> {
  let totalMoved = 0;
  let remaining = batchSize;
  
  while (remaining > 0) {
    const batch = Math.min(remaining, 2000);
    const { data, error } = await supabase.rpc('brain_bulk_demote_hot_to_warm', { batch_size: batch });
    const moved = error ? 0 : (data as number) || 0;
    totalMoved += moved;
    remaining -= batch;
    if (moved === 0) break; // nothing left to demote
  }
  return totalMoved;
}

async function bulkDemoteWarmToCold(batchSize: number): Promise<number> {
  let totalMoved = 0;
  let remaining = batchSize;

  while (remaining > 0) {
    const batch = Math.min(remaining, 2000);
    const { data, error } = await supabase.rpc('brain_bulk_demote_warm_to_cold', { batch_size: batch });
    const moved = error ? 0 : (data as number) || 0;
    totalMoved += moved;
    remaining -= batch;
    if (moved === 0) break;
  }
  return totalMoved;
}

async function bulkPruneCold(batchSize: number, keepCount: number): Promise<number> {
  const { data, error } = await supabase.rpc('brain_bulk_prune_cold', { 
    batch_size: batchSize, 
    keep_count: keepCount 
  });
  return error ? 0 : (data as number) || 0;
}

async function cleanupExpiredPruned(): Promise<number> {
  const { data, error } = await supabase.rpc('brain_cleanup_expired_pruned');
  return error ? 0 : (data as number) || 0;
}

// ─── Core Engine ─────────────────────────────────────────────────────────────

/**
 * Run the full auto-tiering enforcement cycle using DB-level bulk operations.
 */
export async function enforceAutoTiering(overrideConfig?: Partial<AutoTieringConfig>): Promise<TieringReport> {
  if (isRunning) {
    console.warn('[AutoTiering] Enforcement already in progress, skipping');
    return history[history.length - 1] || createEmptyReport('none');
  }

  isRunning = true;
  const start = performance.now();
  const cfg = { ...config, ...overrideConfig };

  try {
    const counts = await getTierCounts();
    const report: TieringReport = {
      timestamp: new Date().toISOString(),
      hotBefore: counts.hot,
      hotAfter: counts.hot,
      warmBefore: counts.warm,
      warmAfter: counts.warm,
      coldBefore: counts.cold,
      coldAfter: counts.cold,
      demotedHotToWarm: 0,
      demotedWarmToCold: 0,
      prunedCold: 0,
      expiredPruned: 0,
      enforcement: 'none',
      durationMs: 0,
    };

    const hotUtil = counts.hot / cfg.hotLimit;

    // ── Hot tier enforcement ──
    if (hotUtil >= 2.0) {
      // EMERGENCY — more than 2x over limit
      report.enforcement = 'emergency';
      const excess = counts.hot - Math.floor(cfg.hotLimit * 0.7);
      report.demotedHotToWarm = await bulkDemoteHotToWarm(excess);
      console.log(`[AutoTiering] 🚨 EMERGENCY: Demoted ${report.demotedHotToWarm} hot→warm`);
    } else if (hotUtil >= 1.0) {
      // HARD enforcement
      report.enforcement = 'hard';
      const excess = counts.hot - Math.floor(cfg.hotLimit * (cfg.watermarkPercent / 100));
      report.demotedHotToWarm = await bulkDemoteHotToWarm(excess);
      console.log(`[AutoTiering] ⚠️ HARD: Demoted ${report.demotedHotToWarm} hot→warm`);
    } else if (hotUtil >= cfg.watermarkPercent / 100) {
      // SOFT enforcement
      report.enforcement = 'soft';
      const target = counts.hot - Math.floor(cfg.hotLimit * 0.7);
      report.demotedHotToWarm = await bulkDemoteHotToWarm(Math.max(0, target));
    }

    // ── Warm tier enforcement ──
    const warmAfterDemotion = counts.warm + report.demotedHotToWarm;
    if (warmAfterDemotion > cfg.warmLimit * 0.9) {
      const excess = warmAfterDemotion - Math.floor(cfg.warmLimit * 0.7);
      report.demotedWarmToCold = await bulkDemoteWarmToCold(Math.max(0, excess));
      console.log(`[AutoTiering] Demoted ${report.demotedWarmToCold} warm→cold`);
    }

    // ── Cold tier pruning ──
    const coldAfterDemotion = counts.cold + report.demotedWarmToCold;
    if (coldAfterDemotion > cfg.coldLimit) {
      report.prunedCold = await bulkPruneCold(cfg.batchSize, cfg.coldLimit);
      console.log(`[AutoTiering] Pruned ${report.prunedCold} cold entries`);
    }

    // ── Cleanup expired pruned records ──
    report.expiredPruned = await cleanupExpiredPruned();

    // ── Recalculate ──
    const final = await getTierCounts();
    report.hotAfter = final.hot;
    report.warmAfter = final.warm;
    report.coldAfter = final.cold;
    report.durationMs = Math.round(performance.now() - start);

    // History
    history.push(report);
    if (history.length > 50) history.shift();

    // Emit
    emit({
      module: 'brain',
      event_type: 'auto_tiering_enforced',
      outcome: 'succeeded',
      data: {
        enforcement: report.enforcement,
        demotedHotToWarm: report.demotedHotToWarm,
        demotedWarmToCold: report.demotedWarmToCold,
        prunedCold: report.prunedCold,
        hotAfter: report.hotAfter,
        warmAfter: report.warmAfter,
        coldAfter: report.coldAfter,
        durationMs: report.durationMs,
      },
    });

    if (report.enforcement !== 'none') {
      console.log(`[AutoTiering] ✅ Complete in ${report.durationMs}ms — Hot: ${report.hotBefore}→${report.hotAfter}, Warm: ${report.warmBefore}→${report.warmAfter}, Cold: ${report.coldBefore}→${report.coldAfter}`);
    }

    return report;
  } finally {
    isRunning = false;
  }
}

/**
 * Emergency bulk demotion — fast-path for critically overloaded tiers
 */
export async function emergencyBulkDemotion(targetHotCount: number = 400): Promise<{
  hotDemoted: number;
  warmDemoted: number;
  coldPruned: number;
  duration: number;
}> {
  const start = performance.now();
  const counts = await getTierCounts();
  let hotDemoted = 0;
  let warmDemoted = 0;
  let coldPruned = 0;

  if (counts.hot > targetHotCount) {
    hotDemoted = await bulkDemoteHotToWarm(counts.hot - targetHotCount);
  }

  const warmAfter = counts.warm + hotDemoted;
  if (warmAfter > config.warmLimit) {
    warmDemoted = await bulkDemoteWarmToCold(warmAfter - Math.floor(config.warmLimit * 0.7));
  }

  const coldAfter = counts.cold + warmDemoted;
  if (coldAfter > config.coldLimit) {
    coldPruned = await bulkPruneCold(coldAfter - config.coldLimit, config.coldLimit);
  }

  const duration = Math.round(performance.now() - start);

  emit({
    module: 'brain',
    event_type: 'emergency_bulk_demotion',
    outcome: 'succeeded',
    data: { hotDemoted, warmDemoted, coldPruned, durationMs: duration },
  });

  console.log(`[AutoTiering] 🚨 Emergency complete in ${duration}ms — Hot demoted: ${hotDemoted}, Warm demoted: ${warmDemoted}, Cold pruned: ${coldPruned}`);

  return { hotDemoted, warmDemoted, coldPruned, duration };
}

// ─── Scheduler ───────────────────────────────────────────────────────────────

/**
 * Start automatic tiering enforcement on an interval.
 * Runs immediately on start, then every intervalMs.
 */
export function startAutoTiering(overrideConfig?: Partial<AutoTieringConfig>): void {
  if (schedulerInterval) {
    console.warn('[AutoTiering] Scheduler already running');
    return;
  }

  if (overrideConfig) {
    config = { ...config, ...overrideConfig };
  }

  console.log(`[AutoTiering] 🔄 Scheduler started (interval: ${config.intervalMs / 1000}s)`);

  // Run immediately
  enforceAutoTiering().catch(err => console.error('[AutoTiering] Initial enforcement failed:', err));

  // Schedule recurring
  schedulerInterval = setInterval(() => {
    enforceAutoTiering().catch(err => console.error('[AutoTiering] Scheduled enforcement failed:', err));
  }, config.intervalMs);
}

/**
 * Stop the auto-tiering scheduler
 */
export function stopAutoTiering(): void {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
    console.log('[AutoTiering] Scheduler stopped');
  }
}

// ─── Health & Config ─────────────────────────────────────────────────────────

export async function getTieringHealth(): Promise<{
  healthy: boolean;
  hotUtilization: number;
  warmUtilization: number;
  coldUtilization: number;
  recommendation: string;
  schedulerActive: boolean;
  lastEnforcement: TieringReport | null;
}> {
  const counts = await getTierCounts();
  const hotUtil = Math.round((counts.hot / config.hotLimit) * 100);
  const warmUtil = Math.round((counts.warm / config.warmLimit) * 100);
  const coldUtil = Math.round((counts.cold / config.coldLimit) * 100);

  return {
    healthy: hotUtil < 80 && warmUtil < 90,
    hotUtilization: hotUtil,
    warmUtilization: warmUtil,
    coldUtilization: coldUtil,
    recommendation: hotUtil >= 200
      ? 'CRITICAL: Hot tier severely overloaded. Emergency demotion required.'
      : hotUtil >= 100
        ? 'CRITICAL: Hot tier over limit. Run enforceAutoTiering() immediately.'
        : hotUtil >= 80
          ? 'WARNING: Hot tier approaching limit. Enforcement recommended.'
          : 'Healthy: Tier utilization within normal bounds.',
    schedulerActive: schedulerInterval !== null,
    lastEnforcement: history.length > 0 ? history[history.length - 1] : null,
  };
}

export function configureAutoTiering(updates: Partial<AutoTieringConfig>): AutoTieringConfig {
  config = { ...config, ...updates };
  return { ...config };
}

export function getEnforcementHistory(): TieringReport[] {
  return [...history];
}

function createEmptyReport(enforcement: TieringReport['enforcement']): TieringReport {
  return {
    timestamp: new Date().toISOString(),
    hotBefore: 0, hotAfter: 0,
    warmBefore: 0, warmAfter: 0,
    coldBefore: 0, coldAfter: 0,
    demotedHotToWarm: 0, demotedWarmToCold: 0,
    prunedCold: 0, expiredPruned: 0,
    enforcement, durationMs: 0,
  };
}
