/**
 * Edge Function Health Monitor — v1.0.0
 * 
 * Heartbeat + circuit breaker for all deployed edge functions.
 * Detects silent failures before users do.
 * 
 * Each function gets:
 * - Periodic heartbeat pings (configurable interval)
 * - Response time tracking (p50, p95, p99)
 * - Circuit breaker (open/half-open/closed)
 * - Auto-alert on degradation
 */

import { supabase } from '@/integrations/supabase/client';
import { secureGet, secureSet } from '@/lib/system/secureStorage';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface EdgeFunctionHealth {
  functionName: string;
  status: 'healthy' | 'degraded' | 'down' | 'unknown';
  circuitState: 'closed' | 'half-open' | 'open';
  lastPingAt: string | null;
  lastSuccessAt: string | null;
  lastErrorAt: string | null;
  lastError: string | null;
  consecutiveFailures: number;
  totalPings: number;
  totalSuccesses: number;
  totalFailures: number;
  avgResponseMs: number;
  p95ResponseMs: number;
  uptimePct: number;
  recentLatencies: number[];
}

export interface HealthMonitorConfig {
  heartbeatIntervalMs: number;      // Default: 5 minutes
  circuitOpenThreshold: number;     // Consecutive failures to open circuit (default: 3)
  circuitHalfOpenAfterMs: number;   // Try again after this long (default: 60s)
  timeoutMs: number;                // Request timeout (default: 10s)
  degradedThresholdMs: number;      // Response time > this = degraded (default: 3000)
  maxLatencyHistory: number;        // Keep N recent latency measurements (default: 50)
}

export interface HealthDashboard {
  timestamp: string;
  totalFunctions: number;
  healthy: number;
  degraded: number;
  down: number;
  unknown: number;
  overallUptime: number;
  functions: EdgeFunctionHealth[];
}

// ═══════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════

const STORAGE_KEY = 'edge_function_health';
const DEFAULT_CONFIG: HealthMonitorConfig = {
  heartbeatIntervalMs: 5 * 60 * 1000, // 5 minutes
  circuitOpenThreshold: 3,
  circuitHalfOpenAfterMs: 60_000,
  timeoutMs: 10_000,
  degradedThresholdMs: 3_000,
  maxLatencyHistory: 50,
};

// Known edge functions in the substrate
const MONITORED_FUNCTIONS = [
  'pf-substrate',
  'pf-brain',
  'pf-brain-status',
  'pf-nexus-router',
  'pf-nexus-text',
  'pf-bot-detection',
  'pf-defense-event',
  'pf-cascade-operative',
];

// ═══════════════════════════════════════════════════════════════
// HEALTH MONITOR
// ═══════════════════════════════════════════════════════════════

class EdgeHealthMonitor {
  private static instance: EdgeHealthMonitor;
  private healthMap: Map<string, EdgeFunctionHealth> = new Map();
  private config: HealthMonitorConfig;
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private loaded = false;

  private constructor(config?: Partial<HealthMonitorConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  static getInstance(): EdgeHealthMonitor {
    if (!EdgeHealthMonitor.instance) {
      EdgeHealthMonitor.instance = new EdgeHealthMonitor();
    }
    return EdgeHealthMonitor.instance;
  }

  // ─── LIFECYCLE ──────────────────────────────────────────────

  /**
   * Start monitoring all registered functions
   */
  start(): void {
    if (this.intervalId) return;
    this.ensureLoaded();

    // Initialize health entries for known functions
    for (const fn of MONITORED_FUNCTIONS) {
      if (!this.healthMap.has(fn)) {
        this.healthMap.set(fn, this.createHealthEntry(fn));
      }
    }

    console.log(`[Edge Health] 🏥 Starting monitor for ${MONITORED_FUNCTIONS.length} functions`);

    // First ping after short delay
    setTimeout(() => this.pingAll(), 5000);

    // Then at interval (skip when tab is hidden)
    this.intervalId = setInterval(() => {
      if (document.visibilityState === 'hidden') return;
      this.pingAll();
    }, this.config.heartbeatIntervalMs);
  }

  /**
   * Stop monitoring
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    console.log('[Edge Health] ⏹️ Monitor stopped');
  }

  /**
   * Add a function to monitor
   */
  register(functionName: string): void {
    this.ensureLoaded();
    if (!this.healthMap.has(functionName)) {
      this.healthMap.set(functionName, this.createHealthEntry(functionName));
      this.persist();
    }
  }

  // ─── PING ───────────────────────────────────────────────────

  /**
   * Ping all monitored functions
   */
  async pingAll(): Promise<HealthDashboard> {
    this.ensureLoaded();
    const promises = Array.from(this.healthMap.keys()).map(fn => this.ping(fn));
    await Promise.allSettled(promises);
    this.persist();
    return this.getDashboard();
  }

  /**
   * Ping a single function
   */
  async ping(functionName: string): Promise<EdgeFunctionHealth> {
    this.ensureLoaded();
    const health = this.healthMap.get(functionName) || this.createHealthEntry(functionName);

    // Circuit breaker check
    if (health.circuitState === 'open') {
      const lastErr = health.lastErrorAt ? new Date(health.lastErrorAt).getTime() : 0;
      if (Date.now() - lastErr < this.config.circuitHalfOpenAfterMs) {
        return health; // Skip, circuit is open
      }
      health.circuitState = 'half-open';
    }

    const start = Date.now();
    health.totalPings++;
    health.lastPingAt = new Date().toISOString();

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), this.config.timeoutMs);

      const { error } = await supabase.functions.invoke(functionName, {
        body: { action: 'health_check' },
        signal: controller.signal as any,
      });

      clearTimeout(timeout);
      const latency = Date.now() - start;

      if (error) throw error;

      // Success
      health.totalSuccesses++;
      health.consecutiveFailures = 0;
      health.lastSuccessAt = new Date().toISOString();
      health.circuitState = 'closed';

      // Track latency
      health.recentLatencies.push(latency);
      if (health.recentLatencies.length > this.config.maxLatencyHistory) {
        health.recentLatencies.shift();
      }
      this.updateLatencyStats(health);

      // Set status
      health.status = latency > this.config.degradedThresholdMs ? 'degraded' : 'healthy';

    } catch (err: any) {
      const latency = Date.now() - start;
      health.totalFailures++;
      health.consecutiveFailures++;
      health.lastErrorAt = new Date().toISOString();
      health.lastError = err?.message || 'Unknown error';
      health.recentLatencies.push(latency);

      // Circuit breaker
      if (health.consecutiveFailures >= this.config.circuitOpenThreshold) {
        health.circuitState = 'open';
        health.status = 'down';
        console.warn(`[Edge Health] 🔴 Circuit OPEN for ${functionName} (${health.consecutiveFailures} failures)`);
      } else {
        health.status = 'degraded';
      }
    }

    // Update uptime
    health.uptimePct = health.totalPings > 0
      ? Math.round((health.totalSuccesses / health.totalPings) * 10000) / 100
      : 0;

    this.healthMap.set(functionName, health);
    return health;
  }

  // ─── DASHBOARD ──────────────────────────────────────────────

  getDashboard(): HealthDashboard {
    this.ensureLoaded();
    const functions = Array.from(this.healthMap.values());
    return {
      timestamp: new Date().toISOString(),
      totalFunctions: functions.length,
      healthy: functions.filter(f => f.status === 'healthy').length,
      degraded: functions.filter(f => f.status === 'degraded').length,
      down: functions.filter(f => f.status === 'down').length,
      unknown: functions.filter(f => f.status === 'unknown').length,
      overallUptime: functions.length > 0
        ? Math.round(functions.reduce((s, f) => s + f.uptimePct, 0) / functions.length * 100) / 100
        : 100,
      functions,
    };
  }

  getHealth(functionName: string): EdgeFunctionHealth | null {
    this.ensureLoaded();
    return this.healthMap.get(functionName) || null;
  }

  /**
   * Force-reset circuit breaker for a function
   */
  resetCircuit(functionName: string): void {
    this.ensureLoaded();
    const health = this.healthMap.get(functionName);
    if (health) {
      health.circuitState = 'closed';
      health.consecutiveFailures = 0;
      health.status = 'unknown';
      this.persist();
    }
  }

  // ─── INTERNALS ──────────────────────────────────────────────

  private createHealthEntry(fn: string): EdgeFunctionHealth {
    return {
      functionName: fn,
      status: 'unknown',
      circuitState: 'closed',
      lastPingAt: null,
      lastSuccessAt: null,
      lastErrorAt: null,
      lastError: null,
      consecutiveFailures: 0,
      totalPings: 0,
      totalSuccesses: 0,
      totalFailures: 0,
      avgResponseMs: 0,
      p95ResponseMs: 0,
      uptimePct: 100,
      recentLatencies: [],
    };
  }

  private updateLatencyStats(health: EdgeFunctionHealth): void {
    const sorted = [...health.recentLatencies].sort((a, b) => a - b);
    health.avgResponseMs = Math.round(sorted.reduce((s, v) => s + v, 0) / sorted.length);
    health.p95ResponseMs = sorted[Math.floor(sorted.length * 0.95)] || 0;
  }

  private ensureLoaded(): void {
    if (this.loaded) return;
    this.loaded = true;
    try {
      const entries = secureGet<[string, EdgeFunctionHealth][]>(STORAGE_KEY);
      if (entries) this.healthMap = new Map(entries);
    } catch { /* Storage unavailable — start fresh */ this.healthMap = new Map(); }
  }

  private persist(): void {
    try {
      secureSet(STORAGE_KEY, Array.from(this.healthMap.entries()));
    } catch { /* Storage pressure — non-critical telemetry */ }
  }
}

export const edgeHealthMonitor = EdgeHealthMonitor.getInstance();
