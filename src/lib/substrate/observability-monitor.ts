/**
 * Observability Monitor
 * Hardened telemetry, accurate percentiles, DLQ-aware health
 * 
 * Gaps filled:
 * 1. Bridge Invocation Tracking — Every inter-primitive bridge call is metered
 * 2. Cross-Node Latency — Measures handoff time between modules
 * 3. DLQ Visibility — Surfaces dead letter queue depth and oldest entries
 * 4. Telemetry Summary — Aggregated view of engine health across the matrix
 * 5. Error Hotspot Detection — Identifies which nodes produce the most errors
 * 
 * Hardening:
 * - Sanitized telemetry payloads (no raw data leakage)
 * - Edge-safe p95 indexing
 * - True lastMeasured timestamps on latency entries
 * - Hotspot computation cache (5s TTL)
 * - DLQ depth wired into health score
 */

import { telemetryEngine } from './telemetry-engine';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface BridgeInvocation {
  bridge: string;
  direction: string;
  timestamp: string;
  durationMs: number;
  success: boolean;
  payload?: Record<string, unknown>;
}

export interface CrossNodeLatency {
  sourceNode: string;
  targetNode: string;
  avgLatencyMs: number;
  p95LatencyMs: number;
  sampleCount: number;
  lastMeasured: string;
}

export interface ErrorHotspot {
  node: string;
  errorCount: number;
  lastError: string;
  errorRate: number; // errors per total events
  topErrorTypes: string[];
}

export interface ObservabilitySummary {
  totalTelemetryEvents: number;
  errorRate: number;
  bridgeInvocations: number;
  avgBridgeLatencyMs: number;
  activeBridges: string[];
  errorHotspots: ErrorHotspot[];
  crossNodeLatencies: CrossNodeLatency[];
  dlqDepth: number;
  healthScore: number; // 0-100
}

/** Structured latency entry with true last-measured timestamp */
interface LatencyEntry {
  samples: number[];
  lastMeasured: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// OBSERVABILITY MONITOR
// ═══════════════════════════════════════════════════════════════════════════════

class ObservabilityMonitor {
  private static instance: ObservabilityMonitor;
  private bridgeLog: BridgeInvocation[] = [];
  private latencyMap: Map<string, LatencyEntry> = new Map();
  private hotspotCache: { data: ErrorHotspot[]; ts: number } | null = null;
  private readonly MAX_BRIDGE_LOG = 500;
  private readonly MAX_LATENCY_SAMPLES = 100;
  private readonly HOTSPOT_CACHE_TTL = 5000;

  private constructor() {}

  static getInstance(): ObservabilityMonitor {
    if (!ObservabilityMonitor.instance) {
      ObservabilityMonitor.instance = new ObservabilityMonitor();
    }
    return ObservabilityMonitor.instance;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // BRIDGE TRACKING
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Record a bridge invocation (call from any inter-primitive bridge)
   */
  recordBridgeInvocation(
    bridge: string,
    direction: string,
    durationMs: number,
    success: boolean,
    payload?: Record<string, unknown>
  ): void {
    const invocation: BridgeInvocation = {
      bridge,
      direction,
      timestamp: new Date().toISOString(),
      durationMs,
      success,
      payload,
    };

    this.bridgeLog.push(invocation);
    if (this.bridgeLog.length > this.MAX_BRIDGE_LOG) {
      this.bridgeLog = this.bridgeLog.slice(-this.MAX_BRIDGE_LOG);
    }

    // Sanitize payload before emitting to telemetry — no raw data leakage
    const sanitizedMetadata = {
      direction,
      payloadKeys: payload ? Object.keys(payload).slice(0, 10) : [],
      payloadSize: payload ? JSON.stringify(payload).length : 0,
    };

    telemetryEngine.emit(
      'custom',
      success ? 'info' : 'warn',
      { module: 'bridge', action: bridge },
      { durationMs, success, metadata: sanitizedMetadata }
    );
  }

  /**
   * Get bridge activity summary
   */
  getBridgeActivity(limit: number = 20): {
    recent: BridgeInvocation[];
    summary: Record<string, { count: number; avgMs: number; successRate: number }>;
  } {
    const recent = this.bridgeLog.slice(-limit);
    const summary: Record<string, { count: number; totalMs: number; successes: number }> = {};

    for (const inv of this.bridgeLog) {
      if (!summary[inv.bridge]) {
        summary[inv.bridge] = { count: 0, totalMs: 0, successes: 0 };
      }
      summary[inv.bridge].count++;
      summary[inv.bridge].totalMs += inv.durationMs;
      if (inv.success) summary[inv.bridge].successes++;
    }

    const result: Record<string, { count: number; avgMs: number; successRate: number }> = {};
    for (const [bridge, stats] of Object.entries(summary)) {
      result[bridge] = {
        count: stats.count,
        avgMs: Math.round(stats.totalMs / stats.count),
        successRate: Math.round((stats.successes / stats.count) * 100),
      };
    }

    return { recent, summary: result };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CROSS-NODE LATENCY
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Record a cross-primitive handoff latency
   */
  recordLatency(sourceNode: string, targetNode: string, latencyMs: number): void {
    const key = `${sourceNode}→${targetNode}`;
    const now = new Date().toISOString();

    if (!this.latencyMap.has(key)) {
      this.latencyMap.set(key, { samples: [], lastMeasured: now });
    }

    const entry = this.latencyMap.get(key)!;
    entry.samples.push(latencyMs);
    entry.lastMeasured = now;

    if (entry.samples.length > this.MAX_LATENCY_SAMPLES) {
      entry.samples.shift();
    }
  }

  /**
   * Get all cross-primitive latency metrics
   */
  getLatencies(): CrossNodeLatency[] {
    const results: CrossNodeLatency[] = [];

    for (const [key, entry] of this.latencyMap.entries()) {
      const [source, target] = key.split('→');
      const { samples, lastMeasured } = entry;
      if (samples.length === 0) continue;

      const sorted = [...samples].sort((a, b) => a - b);
      const avg = samples.reduce((s, v) => s + v, 0) / samples.length;

      // Edge-safe p95 indexing — accurate for small sample sets
      const p95Index = Math.max(
        0,
        Math.min(
          sorted.length - 1,
          Math.ceil(sorted.length * 0.95) - 1
        )
      );

      results.push({
        sourceNode: source,
        targetNode: target,
        avgLatencyMs: Math.round(avg * 100) / 100,
        p95LatencyMs: sorted[p95Index],
        sampleCount: samples.length,
        lastMeasured,
      });
    }

    return results.sort((a, b) => b.p95LatencyMs - a.p95LatencyMs);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ERROR HOTSPOT DETECTION
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Identify nodes generating the most errors (cached, 5s TTL)
   */
  getErrorHotspots(limit: number = 10): ErrorHotspot[] {
    const now = Date.now();
    if (this.hotspotCache && now - this.hotspotCache.ts < this.HOTSPOT_CACHE_TTL) {
      return this.hotspotCache.data.slice(0, limit);
    }

    const state = telemetryEngine.getState();
    const errors = telemetryEngine.getErrors(200);

    // Group errors by module/engine
    const nodeErrors: Map<string, { count: number; types: Set<string>; lastError: string }> = new Map();

    for (const event of errors) {
      const node = event.source.module || event.source.engine || 'unknown';
      if (!nodeErrors.has(node)) {
        nodeErrors.set(node, { count: 0, types: new Set(), lastError: '' });
      }
      const entry = nodeErrors.get(node)!;
      entry.count++;
      if (event.payload.errorCode) entry.types.add(event.payload.errorCode);
      if (event.payload.errorMessage) entry.types.add(event.payload.errorMessage.slice(0, 50));
      entry.lastError = event.timestamp;
    }

    const totalEvents = Math.max(1, state.totalEvents);

    const result = Array.from(nodeErrors.entries())
      .map(([node, data]) => ({
        node,
        errorCount: data.count,
        lastError: data.lastError,
        errorRate: Math.round((data.count / totalEvents) * 10000) / 100,
        topErrorTypes: Array.from(data.types).slice(0, 5),
      }))
      .sort((a, b) => b.errorCount - a.errorCount)
      .slice(0, limit);

    this.hotspotCache = { data: result, ts: now };
    return result;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // UNIFIED SUMMARY
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Get a full observability summary (async for ESM-safe DLQ import)
   */
  async getSummary(): Promise<ObservabilitySummary> {
    const telState = telemetryEngine.getState();
    const bridgeActivity = this.getBridgeActivity();
    const latencies = this.getLatencies();
    const hotspots = this.getErrorHotspots(5);

    const totalErrors = (telState.eventsBySeverity.error || 0) + (telState.eventsBySeverity.critical || 0);
    const errorRate = telState.totalEvents > 0
      ? Math.round((totalErrors / telState.totalEvents) * 10000) / 100
      : 0;

    const bridgeAvgMs = this.bridgeLog.length > 0
      ? Math.round(this.bridgeLog.reduce((s, b) => s + b.durationMs, 0) / this.bridgeLog.length)
      : 0;

    // Wire real DLQ depth via ESM-safe dynamic import
    let dlqDepth = 0;
    try {
      const dlqModule = await import('@/lib/substrate/ripple-dlq');
      const stats = (dlqModule as any).getDLQStats?.();
      dlqDepth = stats?.total || 0;
    } catch {
      // DLQ module not available — safe fallback
    }

    // Health score: 100 minus penalties
    let healthScore = 100;
    if (errorRate > 10) healthScore -= 30;
    else if (errorRate > 5) healthScore -= 15;
    else if (errorRate > 1) healthScore -= 5;

    const failedBridges = Object.values(bridgeActivity.summary).filter(s => s.successRate < 80).length;
    healthScore -= failedBridges * 10;

    const slowLatencies = latencies.filter(l => l.p95LatencyMs > 500).length;
    healthScore -= slowLatencies * 5;

    // DLQ depth penalty (capped at -20)
    if (dlqDepth > 0) {
      healthScore -= Math.min(20, dlqDepth * 2);
    }

    return {
      totalTelemetryEvents: telState.totalEvents,
      errorRate,
      bridgeInvocations: this.bridgeLog.length,
      avgBridgeLatencyMs: bridgeAvgMs,
      activeBridges: Object.keys(bridgeActivity.summary),
      errorHotspots: hotspots,
      crossNodeLatencies: latencies,
      dlqDepth,
      healthScore: Math.max(0, Math.min(100, healthScore)),
    };
  }

  /**
   * Reset all metrics (for testing)
   */
  reset(): void {
    this.bridgeLog = [];
    this.latencyMap.clear();
    this.hotspotCache = null;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export const observabilityMonitor = ObservabilityMonitor.getInstance();
export { ObservabilityMonitor };
