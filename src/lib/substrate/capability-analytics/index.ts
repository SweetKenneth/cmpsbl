/**
 * Capability Usage Analytics
 * Tracks capability execution frequency, latency, errors, and value
 * 
 * Feeds EVOLUTION + roadmap decisions with real usage data.
 * Identifies dead weight capabilities and promotes winners.
 */

import { secureGet, secureSet, secureRemove } from '@/lib/system/secureStorage';

export interface CapabilityUsageRecord {
  capabilityId: string;
  module: string;
  timestamp: number;
  durationMs: number;
  success: boolean;
  error?: string;
  tier: string;
  metadata?: Record<string, unknown>;
}

export interface CapabilityMetrics {
  capabilityId: string;
  module: string;
  totalCalls: number;
  successCount: number;
  errorCount: number;
  avgDurationMs: number;
  p95DurationMs: number;
  lastCalledAt: number | null;
  firstCalledAt: number | null;
  successRate: number;
  callsPerHour: number;
  trend: 'rising' | 'stable' | 'declining' | 'dead';
}

export interface AnalyticsSummary {
  totalCapabilities: number;
  activeCapabilities: number;
  deadCapabilities: number;
  totalCalls: number;
  overallSuccessRate: number;
  topCapabilities: CapabilityMetrics[];
  bottomCapabilities: CapabilityMetrics[];
  moduleBreakdown: Record<string, { calls: number; successRate: number; avgMs: number }>;
  periodHours: number;
}

const STORAGE_KEY = 'pf_cap_analytics';
const MAX_RECORDS = 5000;

class CapabilityAnalytics {
  private static instance: CapabilityAnalytics;
  private records: CapabilityUsageRecord[] = [];
  private buffer: CapabilityUsageRecord[] = [];
  private loaded = false;

  private constructor() {}

  static getInstance(): CapabilityAnalytics {
    if (!CapabilityAnalytics.instance) {
      CapabilityAnalytics.instance = new CapabilityAnalytics();
    }
    return CapabilityAnalytics.instance;
  }

  /** Record a capability execution */
  track(record: Omit<CapabilityUsageRecord, 'timestamp'>): void {
    const entry: CapabilityUsageRecord = { ...record, timestamp: Date.now() };
    this.buffer.push(entry);
    
    // Auto-flush when buffer is large
    if (this.buffer.length >= 50) {
      this.flush();
    }
  }

  /** Flush buffer to persistent storage */
  flush(): { flushed: number } {
    if (this.buffer.length === 0) return { flushed: 0 };
    
    this.ensureLoaded();
    const count = this.buffer.length;
    this.records.push(...this.buffer);
    this.buffer = [];

    // Enforce max records — trim in bulk instead of shift loop
    if (this.records.length > MAX_RECORDS) {
      this.records = this.records.slice(this.records.length - MAX_RECORDS);
    }

    this.persist();
    return { flushed: count };
  }

  /** Get metrics for a specific capability */
  getMetrics(capabilityId: string, periodHours = 24): CapabilityMetrics {
    this.ensureLoaded();
    const cutoff = Date.now() - (periodHours * 3600_000);
    const midpoint = cutoff + (periodHours * 1800_000);

    // Single-pass aggregation over both records and buffer
    let module = '';
    let total = 0;
    let successCount = 0;
    let durationSum = 0;
    let firstHalf = 0;
    let secondHalf = 0;
    let minTs = Infinity;
    let maxTs = -Infinity;
    const durations: number[] = [];

    const scan = (arr: CapabilityUsageRecord[]) => {
      for (let i = 0; i < arr.length; i++) {
        const r = arr[i];
        if (r.capabilityId !== capabilityId || r.timestamp < cutoff) continue;
        total++;
        if (!module) module = r.module;
        if (r.success) successCount++;
        durationSum += r.durationMs;
        durations.push(r.durationMs);
        if (r.timestamp < midpoint) firstHalf++; else secondHalf++;
        if (r.timestamp < minTs) minTs = r.timestamp;
        if (r.timestamp > maxTs) maxTs = r.timestamp;
      }
    };
    scan(this.records);
    scan(this.buffer);

    if (total === 0) {
      return {
        capabilityId, module: '', totalCalls: 0, successCount: 0, errorCount: 0,
        avgDurationMs: 0, p95DurationMs: 0, lastCalledAt: null, firstCalledAt: null,
        successRate: 0, callsPerHour: 0, trend: 'dead',
      };
    }

    durations.sort((a, b) => a - b);
    let trend: CapabilityMetrics['trend'] = 'stable';
    if (secondHalf > firstHalf * 1.3) trend = 'rising';
    else if (secondHalf < firstHalf * 0.7) trend = 'declining';

    return {
      capabilityId, module, totalCalls: total, successCount,
      errorCount: total - successCount,
      avgDurationMs: Math.round(durationSum / total),
      p95DurationMs: durations[Math.floor(durations.length * 0.95)] || 0,
      lastCalledAt: maxTs === -Infinity ? null : maxTs,
      firstCalledAt: minTs === Infinity ? null : minTs,
      successRate: (successCount / total) * 100,
      callsPerHour: total / periodHours,
      trend,
    };
  }

  /** Get full analytics summary */
  summary(periodHours = 24): AnalyticsSummary {
    this.ensureLoaded();
    const cutoff = Date.now() - (periodHours * 3600_000);
    const all = [...this.records, ...this.buffer].filter(r => r.timestamp >= cutoff);

    // Get unique capability IDs
    const capIds = [...new Set(all.map(r => r.capabilityId))];
    const metrics = capIds.map(id => this.getMetrics(id, periodHours));
    
    const sorted = [...metrics].sort((a, b) => b.totalCalls - a.totalCalls);
    const dead = metrics.filter(m => m.trend === 'dead' || m.totalCalls === 0);

    // Module breakdown
    const moduleBreakdown: AnalyticsSummary['moduleBreakdown'] = {};
    for (const r of all) {
      if (!moduleBreakdown[r.module]) {
        moduleBreakdown[r.module] = { calls: 0, successRate: 0, avgMs: 0 };
      }
      moduleBreakdown[r.module].calls++;
    }
    for (const [mod, data] of Object.entries(moduleBreakdown)) {
      const modRecords = all.filter(r => r.module === mod);
      data.successRate = (modRecords.filter(r => r.success).length / modRecords.length) * 100;
      data.avgMs = Math.round(modRecords.reduce((s, r) => s + r.durationMs, 0) / modRecords.length);
    }

    const totalSuccess = all.filter(r => r.success).length;

    return {
      totalCapabilities: capIds.length,
      activeCapabilities: metrics.filter(m => m.totalCalls > 0).length,
      deadCapabilities: dead.length,
      totalCalls: all.length,
      overallSuccessRate: all.length > 0 ? (totalSuccess / all.length) * 100 : 100,
      topCapabilities: sorted.slice(0, 10),
      bottomCapabilities: sorted.slice(-10).reverse(),
      moduleBreakdown,
      periodHours,
    };
  }

  /** Get dead capabilities (not called in period) */
  getDeadCapabilities(periodHours = 168): string[] {
    const summary = this.summary(periodHours);
    return summary.bottomCapabilities
      .filter(m => m.trend === 'dead')
      .map(m => m.capabilityId);
  }

  /** Get rising capabilities */
  getRisingCapabilities(periodHours = 24): CapabilityMetrics[] {
    this.ensureLoaded();
    const cutoff = Date.now() - (periodHours * 3600_000);
    const capIds = [...new Set([...this.records, ...this.buffer]
      .filter(r => r.timestamp >= cutoff)
      .map(r => r.capabilityId))];
    
    return capIds
      .map(id => this.getMetrics(id, periodHours))
      .filter(m => m.trend === 'rising');
  }

  /** Clear all analytics data */
  clear(): void {
    this.records = [];
    this.buffer = [];
    try {
      secureRemove(STORAGE_KEY);
    } catch { /* non-critical */ }
  }

  private ensureLoaded(): void {
    if (this.loaded) return;
    this.loaded = true;
    try {
      const data = secureGet<typeof this.records>(STORAGE_KEY);
      if (data) this.records = data;
    } catch { this.records = []; }
  }

  private persist(): void {
    try {
      secureSet(STORAGE_KEY, this.records);
    } catch {
      // Trim old records on storage pressure
      this.records = this.records.slice(-2000);
      try { secureSet(STORAGE_KEY, this.records); } catch { /* Storage exhausted — tolerate data loss */ }
    }
  }
}

export const capabilityAnalytics = CapabilityAnalytics.getInstance();
