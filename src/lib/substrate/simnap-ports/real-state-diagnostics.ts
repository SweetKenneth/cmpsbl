/**
 * Real-State Diagnostics Engine — Ported from SimNap
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Queries real system state for health assessment,
 * tier distribution analysis, and anomaly detection.
 * 
 * Consumers: VISION, MEDIC, ANALYTICS
 * Origin: diagnostics.ts
 */

import { supabase } from '@/integrations/supabase/client';

// ── Types ─────────────────────────────────────────────────────────

export interface DiagnosticProbe {
  id: string;
  name: string;
  category: 'health' | 'performance' | 'capacity' | 'integrity' | 'connectivity';
  /** Execute the probe — returns a score 0-100 and details */
  execute: () => Promise<ProbeResult>;
}

export interface ProbeResult {
  probeId: string;
  score: number;           // 0-100
  status: 'healthy' | 'degraded' | 'critical' | 'unknown';
  details: Record<string, unknown>;
  timestamp: number;
  durationMs: number;
}

export interface DiagnosticReport {
  overallScore: number;
  status: 'healthy' | 'degraded' | 'critical';
  probes: ProbeResult[];
  anomalies: DiagnosticAnomaly[];
  generatedAt: number;
  totalDurationMs: number;
}

export interface DiagnosticAnomaly {
  probe: string;
  type: 'threshold_breach' | 'trend_deviation' | 'missing_data' | 'inconsistency';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  value: number;
  expected: number;
}

// ── Built-in Probes ───────────────────────────────────────────────

/**
 * Brain events health — checks recent event volume and error rate
 */
const brainEventsProbe: DiagnosticProbe = {
  id: 'brain_events_health',
  name: 'Brain Events Health',
  category: 'health',
  execute: async () => {
    const start = performance.now();
    try {
      const { data, error } = await supabase
        .from('brain_events')
        .select('outcome', { count: 'exact' })
        .gte('created_at', new Date(Date.now() - 3600000).toISOString())
        .limit(500);

      if (error) throw error;

      const total = data?.length ?? 0;
      const failures = data?.filter(e => e.outcome === 'failure').length ?? 0;
      const errorRate = total > 0 ? failures / total : 0;
      const score = Math.max(0, 100 - errorRate * 200);

      return {
        probeId: 'brain_events_health',
        score,
        status: score > 80 ? 'healthy' : score > 50 ? 'degraded' : 'critical',
        details: { totalEvents: total, failures, errorRate },
        timestamp: Date.now(),
        durationMs: performance.now() - start,
      };
    } catch (err) {
      return {
        probeId: 'brain_events_health',
        score: 0,
        status: 'unknown',
        details: { error: String(err) },
        timestamp: Date.now(),
        durationMs: performance.now() - start,
      };
    }
  },
};

/**
 * Evolution proposals health — checks pending/stuck proposals
 */
const evolutionProbe: DiagnosticProbe = {
  id: 'evolution_proposals_health',
  name: 'Evolution Proposals Health',
  category: 'integrity',
  execute: async () => {
    const start = performance.now();
    try {
      const { data, error } = await supabase
        .from('evolution_proposals')
        .select('status, created_at')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      const pending = data?.filter(p => p.status === 'pending').length ?? 0;
      const stale = data?.filter(p => {
        if (p.status !== 'pending') return false;
        const age = Date.now() - new Date(p.created_at).getTime();
        return age > 24 * 60 * 60 * 1000; // 24 hours
      }).length ?? 0;

      const score = Math.max(0, 100 - stale * 10 - (pending > 20 ? 20 : 0));

      return {
        probeId: 'evolution_proposals_health',
        score,
        status: score > 80 ? 'healthy' : score > 50 ? 'degraded' : 'critical',
        details: { total: data?.length ?? 0, pending, stale },
        timestamp: Date.now(),
        durationMs: performance.now() - start,
      };
    } catch (err) {
      return {
        probeId: 'evolution_proposals_health',
        score: 0,
        status: 'unknown',
        details: { error: String(err) },
        timestamp: Date.now(),
        durationMs: performance.now() - start,
      };
    }
  },
};

/**
 * Memory tier distribution — checks for tier imbalance
 */
const memoryTierProbe: DiagnosticProbe = {
  id: 'memory_tier_distribution',
  name: 'Memory Tier Distribution',
  category: 'capacity',
  execute: async () => {
    const start = performance.now();
    try {
      const { data, error } = await supabase
        .from('neural_memory')
        .select('tier', { count: 'exact' })
        .limit(1000);

      if (error) throw error;

      const tiers: Record<string, number> = {};
      for (const row of data ?? []) {
        const tier = (row as any).tier ?? 'unknown';
        tiers[tier] = (tiers[tier] ?? 0) + 1;
      }

      const total = data?.length ?? 0;
      const hotRatio = (tiers['hot'] ?? 0) / Math.max(1, total);
      
      // Hot tier should be < 30% of total
      const hotPenalty = hotRatio > 0.3 ? (hotRatio - 0.3) * 100 : 0;
      const score = Math.max(0, 100 - hotPenalty);

      return {
        probeId: 'memory_tier_distribution',
        score,
        status: score > 80 ? 'healthy' : score > 50 ? 'degraded' : 'critical',
        details: { total, tiers, hotRatio },
        timestamp: Date.now(),
        durationMs: performance.now() - start,
      };
    } catch (err) {
      return {
        probeId: 'memory_tier_distribution',
        score: 0,
        status: 'unknown',
        details: { error: String(err) },
        timestamp: Date.now(),
        durationMs: performance.now() - start,
      };
    }
  },
};

/**
 * AI quota utilization — checks for budget exhaustion
 */
const aiQuotaProbe: DiagnosticProbe = {
  id: 'ai_quota_utilization',
  name: 'AI Quota Utilization',
  category: 'capacity',
  execute: async () => {
    const start = performance.now();
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('ai_daily_quota')
        .select('*')
        .eq('date', today);

      if (error) throw error;

      let worstUtilization = 0;
      for (const row of data ?? []) {
        const used = row.calls_used ?? 0;
        const budget = row.calls_budget ?? 1000;
        const util = used / budget;
        if (util > worstUtilization) worstUtilization = util;
      }

      const score = Math.max(0, 100 - worstUtilization * 100);

      return {
        probeId: 'ai_quota_utilization',
        score,
        status: score > 30 ? 'healthy' : score > 10 ? 'degraded' : 'critical',
        details: { providers: data?.length ?? 0, worstUtilization },
        timestamp: Date.now(),
        durationMs: performance.now() - start,
      };
    } catch (err) {
      return {
        probeId: 'ai_quota_utilization',
        score: 0,
        status: 'unknown',
        details: { error: String(err) },
        timestamp: Date.now(),
        durationMs: performance.now() - start,
      };
    }
  },
};

// ── Diagnostic Runner ─────────────────────────────────────────────

const DEFAULT_PROBES: DiagnosticProbe[] = [
  brainEventsProbe,
  evolutionProbe,
  memoryTierProbe,
  aiQuotaProbe,
];

/**
 * Run all diagnostic probes in parallel
 */
export async function runDiagnostics(
  probes: DiagnosticProbe[] = DEFAULT_PROBES
): Promise<DiagnosticReport> {
  const start = performance.now();

  const results = await Promise.allSettled(
    probes.map(p => p.execute())
  );

  const probeResults: ProbeResult[] = results.map((r, i) =>
    r.status === 'fulfilled'
      ? r.value
      : {
          probeId: probes[i].id,
          score: 0,
          status: 'unknown' as const,
          details: { error: 'Probe failed' },
          timestamp: Date.now(),
          durationMs: 0,
        }
  );

  // Detect anomalies
  const anomalies: DiagnosticAnomaly[] = [];
  for (const result of probeResults) {
    if (result.score < 30) {
      anomalies.push({
        probe: result.probeId,
        type: 'threshold_breach',
        severity: result.score < 10 ? 'critical' : 'high',
        description: `${result.probeId} scored ${result.score}/100`,
        value: result.score,
        expected: 80,
      });
    }
  }

  // Overall score (weighted average)
  const validProbes = probeResults.filter(r => r.status !== 'unknown');
  const overallScore = validProbes.length > 0
    ? validProbes.reduce((s, r) => s + r.score, 0) / validProbes.length
    : 0;

  return {
    overallScore,
    status: overallScore > 80 ? 'healthy' : overallScore > 50 ? 'degraded' : 'critical',
    probes: probeResults,
    anomalies,
    generatedAt: Date.now(),
    totalDurationMs: performance.now() - start,
  };
}

/**
 * Create a custom diagnostic probe
 */
export function createProbe(
  id: string,
  name: string,
  category: DiagnosticProbe['category'],
  execute: () => Promise<ProbeResult>
): DiagnosticProbe {
  return { id, name, category, execute };
}
