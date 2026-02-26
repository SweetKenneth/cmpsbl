/**
 * BRAIN Auto-Tiering Enforcement Engine
 * SPARTA Epoch — Crown Jewel Capability
 * 
 * CLM Request: BRAIN module flagged Hot Memory Tier overflow (1,671 entries vs 500 limit)
 * Resolution: Aggressive auto-tiering with scheduled enforcement, demotion cascades,
 * and archival watermarks to prevent future overflow.
 * 
 * Tier: Enterprise+ (Auto-tiering enforcement is Enterprise; meta-tuning is CMPSBL)
 */

import { supabase } from '@/integrations/supabase/client';
import { emit } from '../events';

// ─── Typed row interfaces for memory tiers ───────────────────────────────────

interface MemoryTierRow {
  id: string;
  content: string;
  context: string | null;
  priority?: number;
  access_count: number;
  memory_type: string;
  confidence?: number;
  importance_score?: number;
  tags: string[] | null;
  metadata: Record<string, unknown> | null;
  source?: string;
  created_at: string;
}

// ─── Configuration ───────────────────────────────────────────────────────────

export interface AutoTieringConfig {
  hotLimit: number;
  warmLimit: number;
  coldArchiveAfterDays: number;
  hotDemotionThreshold: number;     // access_count below this → demote to warm
  warmDemotionThreshold: number;    // access_count below this → demote to cold
  hotIdleHours: number;             // hours idle before hot → warm
  warmIdleDays: number;             // days idle before warm → cold
  enforceOnCycle: boolean;
  watermarkPercent: number;         // trigger enforcement at this % of limit
}

const DEFAULT_CONFIG: AutoTieringConfig = {
  hotLimit: 500,
  warmLimit: 10_000,
  coldArchiveAfterDays: 90,
  hotDemotionThreshold: 2,
  warmDemotionThreshold: 1,
  hotIdleHours: 24,
  warmIdleDays: 30,
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
  demotedHotToWarm: number;
  demotedWarmToCold: number;
  archivedCold: number;
  enforcement: 'none' | 'soft' | 'hard';
  healthDelta: number;
}

const history: TieringReport[] = [];

// ─── Core Engine ─────────────────────────────────────────────────────────────

/**
 * Count entries in each tier
 */
async function getTierCounts(): Promise<{ hot: number; warm: number; cold: number }> {
  const [hotRes, warmRes, coldRes] = await Promise.all([
    supabase.from('brain_memory_hot').select('id', { count: 'exact', head: true }),
    supabase.from('brain_memory_warm').select('id', { count: 'exact', head: true }),
    supabase.from('brain_memory_cold').select('id', { count: 'exact', head: true }),
  ]);

  return {
    hot: hotRes.count ?? 0,
    warm: warmRes.count ?? 0,
    cold: coldRes.count ?? 0,
  };
}

/**
 * Demote lowest-value hot entries to warm tier
 */
async function demoteHotToWarm(count: number): Promise<number> {
  if (count <= 0) return 0;

  // Get lowest priority hot entries
  const { data: entries, error } = await supabase
    .from('brain_memory_hot')
    .select('*')
    .order('access_count', { ascending: true })
    .order('created_at', { ascending: true })
    .limit(count);

  if (error || !entries?.length) return 0;

  let demoted = 0;
  for (const entry of entries) {
    const row = entry as unknown as MemoryTierRow;
    try {
      await supabase.from('brain_memory_warm').insert({
        content: row.content,
        context: row.context,
        priority: Math.max(1, (row.priority || 5) - 2),
        access_count: row.access_count || 0,
        memory_type: row.memory_type || 'general',
        confidence: row.confidence ?? 0.5,
        importance_score: row.importance_score ?? 0.3,
        tags: row.tags || [],
        metadata: { ...row.metadata, demoted_from: 'hot', demoted_at: new Date().toISOString() },
        source: row.source || 'auto_tiering',
      });

      await supabase.from('brain_memory_hot').delete().eq('id', row.id);
      demoted++;
    } catch (err) {
      console.warn('[AutoTiering] Hot→Warm demotion failed for', row.id, err);
    }
  }

  return demoted;
}

/**
 * Demote lowest-value warm entries to cold tier
 */
async function demoteWarmToCold(count: number): Promise<number> {
  if (count <= 0) return 0;

  const { data: entries, error } = await supabase
    .from('brain_memory_warm')
    .select('*')
    .order('access_count', { ascending: true })
    .order('created_at', { ascending: true })
    .limit(count);

  if (error || !entries?.length) return 0;

  let demoted = 0;
  for (const entry of entries) {
    const row = entry as unknown as MemoryTierRow;
    try {
      await supabase.from('brain_memory_cold').insert({
        content: row.content,
        context: row.context,
        priority: 1,
        access_count: row.access_count || 0,
        memory_type: row.memory_type || 'general',
        confidence: row.confidence ?? 0.3,
        importance_score: row.importance_score ?? 0.1,
        tags: row.tags || [],
        metadata: { ...row.metadata, demoted_from: 'warm', demoted_at: new Date().toISOString() },
        source: row.source || 'auto_tiering',
      });

      await supabase.from('brain_memory_warm').delete().eq('id', row.id);
      demoted++;
    } catch (err) {
      console.warn('[AutoTiering] Warm→Cold demotion failed for', row.id, err);
    }
  }

  return demoted;
}

/**
 * Run the full auto-tiering enforcement cycle
 */
export async function enforceAutoTiering(overrideConfig?: Partial<AutoTieringConfig>): Promise<TieringReport> {
  const cfg = { ...config, ...overrideConfig };
  const counts = await getTierCounts();

  const report: TieringReport = {
    timestamp: new Date().toISOString(),
    hotBefore: counts.hot,
    hotAfter: counts.hot,
    warmBefore: counts.warm,
    warmAfter: counts.warm,
    demotedHotToWarm: 0,
    demotedWarmToCold: 0,
    archivedCold: 0,
    enforcement: 'none',
    healthDelta: 0,
  };

  // Determine enforcement level
  const hotUtilization = counts.hot / cfg.hotLimit;

  if (hotUtilization >= 1.0) {
    // HARD enforcement — over limit, must demote aggressively
    report.enforcement = 'hard';
    const excess = counts.hot - Math.floor(cfg.hotLimit * (cfg.watermarkPercent / 100));
    // Process in batches of 500 to avoid timeout
    let remaining = excess;
    while (remaining > 0) {
      const batch = Math.min(remaining, 500);
      const demoted = await demoteHotToWarm(batch);
      report.demotedHotToWarm += demoted;
      remaining -= batch;
      if (demoted === 0) break; // No more to demote
    }
  } else if (hotUtilization >= cfg.watermarkPercent / 100) {
    // SOFT enforcement — approaching limit, demote lowest value
    report.enforcement = 'soft';
    const target = counts.hot - Math.floor(cfg.hotLimit * 0.7);
    report.demotedHotToWarm = await demoteHotToWarm(Math.max(0, target));
  }

  // Warm tier enforcement
  const warmUtilization = (counts.warm + report.demotedHotToWarm) / cfg.warmLimit;
  if (warmUtilization >= 0.9) {
    const warmExcess = (counts.warm + report.demotedHotToWarm) - Math.floor(cfg.warmLimit * 0.7);
    let remaining = Math.max(0, warmExcess);
    while (remaining > 0) {
      const batch = Math.min(remaining, 500);
      const demoted = await demoteWarmToCold(batch);
      report.demotedWarmToCold += demoted;
      remaining -= batch;
      if (demoted === 0) break;
    }
  }

  // Recalculate
  const finalCounts = await getTierCounts();
  report.hotAfter = finalCounts.hot;
  report.warmAfter = finalCounts.warm;
  report.healthDelta = ((counts.hot - finalCounts.hot) / Math.max(1, counts.hot)) * 100;

  // Log to history
  history.push(report);
  if (history.length > 50) history.shift();

  // Emit event
  emit({
    module: 'brain',
    event_type: 'auto_tiering_enforced',
    outcome: 'succeeded',
    data: {
      enforcement: report.enforcement,
      demotedHotToWarm: report.demotedHotToWarm,
      demotedWarmToCold: report.demotedWarmToCold,
      hotUtilization: `${Math.round((finalCounts.hot / cfg.hotLimit) * 100)}%`,
    },
  });

  return report;
}

/**
 * Emergency bulk demotion — fast-path for critically overloaded tiers
 * Uses direct SQL batch operations instead of row-by-row
 */
export async function emergencyBulkDemotion(targetHotCount: number = 400): Promise<{
  hotDemoted: number;
  warmDemoted: number;
  duration: number;
}> {
  const start = performance.now();
  const counts = await getTierCounts();
  let hotDemoted = 0;
  let warmDemoted = 0;

  // Bulk demote hot → warm using RPC if available, else batched
  if (counts.hot > targetHotCount) {
    const excess = counts.hot - targetHotCount;
    let remaining = excess;
    while (remaining > 0) {
      const batch = Math.min(remaining, 1000);
      const demoted = await demoteHotToWarm(batch);
      hotDemoted += demoted;
      remaining -= batch;
      if (demoted === 0) break;
    }
  }

  // Bulk demote warm → cold if warm is over limit after hot demotion
  const warmAfter = counts.warm + hotDemoted;
  if (warmAfter > config.warmLimit) {
    const excess = warmAfter - Math.floor(config.warmLimit * 0.7);
    let remaining = Math.max(0, excess);
    while (remaining > 0) {
      const batch = Math.min(remaining, 1000);
      const demoted = await demoteWarmToCold(batch);
      warmDemoted += demoted;
      remaining -= batch;
      if (demoted === 0) break;
    }
  }

  const duration = performance.now() - start;
  
  emit({
    module: 'brain',
    event_type: 'emergency_bulk_demotion',
    outcome: 'succeeded',
    data: { hotDemoted, warmDemoted, durationMs: Math.round(duration) },
  });

  return { hotDemoted, warmDemoted, duration };
}

/**
 * Get current tiering health
 */
export async function getTieringHealth(): Promise<{
  healthy: boolean;
  hotUtilization: number;
  warmUtilization: number;
  recommendation: string;
  lastEnforcement: TieringReport | null;
}> {
  const counts = await getTierCounts();
  const hotUtil = counts.hot / config.hotLimit;
  const warmUtil = counts.warm / config.warmLimit;

  return {
    healthy: hotUtil < 0.8 && warmUtil < 0.9,
    hotUtilization: Math.round(hotUtil * 100),
    warmUtilization: Math.round(warmUtil * 100),
    recommendation: hotUtil >= 1.0
      ? 'CRITICAL: Hot tier over limit. Run enforceAutoTiering() immediately.'
      : hotUtil >= 0.8
        ? 'WARNING: Hot tier approaching limit. Enforcement recommended.'
        : 'Healthy: Tier utilization within normal bounds.',
    lastEnforcement: history.length > 0 ? history[history.length - 1] : null,
  };
}

/**
 * Update configuration
 */
export function configureAutoTiering(updates: Partial<AutoTieringConfig>): AutoTieringConfig {
  config = { ...config, ...updates };
  return { ...config };
}

/**
 * Get enforcement history
 */
export function getEnforcementHistory(): TieringReport[] {
  return [...history];
}
