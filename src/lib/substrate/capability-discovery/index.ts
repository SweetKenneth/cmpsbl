/**
 * Module Capability Discovery
 * Auto-detects module functionality via endpoint probing (40-node / 12-sector architecture)
 * 
 * Enterprise Resilience:
 * - Circuit breaker on probe path
 * - Parallel probing within batches
 * - Correct avgResponseTime calculation (FIX #18)
 * - Error isolation per-module
 * - Cache TTL for discovery results
 */

import { supabase } from '@/integrations/supabase/client';

export interface DiscoveredCapability {
  module: string;
  operation: string;
  available: boolean;
  responseTime: number | null;
  lastProbed: number;
  metadata: Record<string, unknown>;
}

export interface ModuleDiscoveryResult {
  module: string;
  capabilities: DiscoveredCapability[];
  healthScore: number;     // 0-100
  coverage: number;        // % of expected ops available
  lastDiscovery: number;
  errors: string[];
}

export interface DiscoveryConfig {
  modules: string[];
  timeout: number;
  includeEdgeFunctions: boolean;
}

// ═══════════════════════════════════════════════════════════════
// CIRCUIT BREAKER — protects probe DB calls
// ═══════════════════════════════════════════════════════════════

interface ProbeCircuitBreaker {
  state: 'closed' | 'half_open' | 'open';
  failures: number;
  lastFailure: number;
  totalFailures: number;
}

const PROBE_BREAKER_THRESHOLD = 8;
const PROBE_BREAKER_RECOVERY_MS = 45_000;

const probeBreaker: ProbeCircuitBreaker = {
  state: 'closed',
  failures: 0,
  lastFailure: 0,
  totalFailures: 0,
};

function probeRecordFailure(): void {
  probeBreaker.failures++;
  probeBreaker.totalFailures++;
  probeBreaker.lastFailure = Date.now();
  if (probeBreaker.failures >= PROBE_BREAKER_THRESHOLD) {
    probeBreaker.state = 'open';
  }
}

function probeRecordSuccess(): void {
  if (probeBreaker.state === 'half_open') {
    probeBreaker.state = 'closed';
    probeBreaker.failures = 0;
  }
}

function shouldAllowProbe(): boolean {
  if (probeBreaker.state === 'closed') return true;
  if (probeBreaker.state === 'open') {
    if (Date.now() - probeBreaker.lastFailure >= PROBE_BREAKER_RECOVERY_MS) {
      probeBreaker.state = 'half_open';
      return true;
    }
    return false;
  }
  return true;
}

/** Get probe breaker state for diagnostics */
export function getProbeBreakerState(): Readonly<ProbeCircuitBreaker> {
  if (probeBreaker.state === 'open' && Date.now() - probeBreaker.lastFailure >= PROBE_BREAKER_RECOVERY_MS) {
    probeBreaker.state = 'half_open';
  }
  return { ...probeBreaker };
}

/** Reset probe breaker for healing */
export function resetProbeBreaker(): void {
  probeBreaker.state = 'closed';
  probeBreaker.failures = 0;
  probeBreaker.lastFailure = 0;
  probeBreaker.totalFailures = 0;
}

// Expected operations per module (canonical)
const MODULE_OPERATIONS: Record<string, string[]> = {
  CORE: ['status', 'ping', 'version', 'health', 'metrics'],
  BRAIN: ['status', 'recall', 'store', 'forget', 'consolidate', 'search'],
  MEMORY: ['status', 'store', 'recall', 'prune', 'consolidate', 'snapshot'],
  DECODE: ['status', 'interpret', 'detect_personality', 'profile'],
  DEFENSE: ['status', 'scan', 'threat_assess', 'quarantine', 'audit'],
  NEXUS: ['status', 'route', 'providers', 'health', 'fallback'],
  VISION: ['status', 'trace', 'anomaly', 'dashboard', 'metrics'],
  DREAM: ['status', 'generate', 'explore', 'synthesize', 'pool'],
  RIPPLE: ['status', 'propagate', 'subscribe', 'broadcast', 'history'],
  ACCESS: ['status', 'register', 'create_key', 'validate', 'entitlements', 'usage'],
  SYSTEM: ['status', 'boot', 'shutdown', 'config', 'capabilities', 'scan_adapt'],
  EVOLUTION: ['status', 'scan', 'evolve', 'diff', 'review', 'receipts', 'mutate', 'select', 'crossover', 'fitness'],
  INTEGRATION: ['status', 'connect', 'disconnect', 'list', 'health'],
  INCLUSIVE: ['status', 'scan', 'fix', 'report', 'guidelines'],
  CORTEX: ['status', 'propose', 'evaluate', 'apply', 'audit', 'learn'],
  NERVE: ['status', 'signal', 'relay', 'throttle', 'priority'],
  ANALYTICS: ['status', 'aggregate', 'trend', 'forecast', 'report'],
  GOVERNANCE: ['status', 'enforce', 'audit', 'policy', 'delegate'],
  IDENTITY: ['status', 'verify', 'provision', 'revoke', 'federate'],
  AUDIT: ['status', 'log', 'query', 'export', 'retain'],
  MEDIC: ['status', 'diagnose', 'heal', 'quarantine', 'report'],
  RELAY: ['status', 'send', 'deliver', 'queue', 'retry'],
  ECONOMY: ['status', 'budget', 'cost', 'forecast', 'optimize', 'price', 'reprice', 'pricing_anomaly'],
  SOVEREIGN: ['status', 'classify_jurisdiction', 'enforce_regulation', 'attest', 'audit_compliance'],
  ORACLE: ['status', 'forecast', 'model', 'simulate', 'calibrate'],
  CONSCIENCE: ['status', 'assess_impact', 'detect_bias', 'score_fairness', 'audit_ethics'],
  PHANTOM: ['status', 'anonymize', 'minimize', 'encrypt', 'audit_privacy'],
  FORGE: ['status', 'synthesize', 'recombine', 'validate', 'deploy'],
  LINGUA: ['status', 'translate', 'detect_language', 'localize', 'glossary'],
  COMPASS: ['status', 'geolocate', 'map_risk', 'route', 'fence'],
  ECHO: ['status', 'create_twin', 'simulate', 'sync', 'diff'],
  TREATY: ['status', 'negotiate', 'sign', 'enforce', 'audit_contract'],
  HARVEST: ['status', 'discover', 'ingest', 'deduplicate', 'score_quality'],
  REFLEX: ['status', 'dispatch', 'decide', 'coordinate', 'sync'],
  SHADOW: ['status', 'execute_run', 'configure_mesh', 'divergence_report', 'stealth_validate'],
  ENCODE: ['status', 'generate', 'refactor', 'validate', 'plan'],
  SANDBOX: ['status', 'execute', 'validate', 'isolate', 'report'],
};

const DEFAULT_CONFIG: DiscoveryConfig = {
  modules: Object.keys(MODULE_OPERATIONS),
  timeout: 5000,
  includeEdgeFunctions: true,
};

const discoveryCache = new Map<string, { result: ModuleDiscoveryResult; timestamp: number }>();
const CACHE_TTL_MS = 60_000; // 1 minute cache

/** Probe a single module's capabilities */
async function probeModule(module: string, timeout: number): Promise<ModuleDiscoveryResult> {
  const expectedOps = MODULE_OPERATIONS[module] || ['status'];
  const capabilities: DiscoveredCapability[] = [];
  const errors: string[] = [];

  // FIX #17: Check circuit breaker before any probing
  if (!shouldAllowProbe()) {
    return {
      module,
      capabilities: expectedOps.map(op => ({
        module, operation: op, available: false, responseTime: null,
        lastProbed: Date.now(), metadata: { error: 'Circuit breaker open' },
      })),
      healthScore: 0,
      coverage: 0,
      lastDiscovery: Date.now(),
      errors: ['Circuit breaker open — probing suspended'],
    };
  }

  // FIX #16: Probe all ops in parallel instead of serial
  const probeResults = await Promise.allSettled(
    expectedOps.map(async (op) => {
      const start = Date.now();
      try {
        const { data, error } = await supabase
          .from('brain_events')
          .select('id')
          .eq('module', module.toLowerCase())
          .eq('event_type', op)
          .eq('outcome', 'success')
          .order('created_at', { ascending: false })
          .limit(1);

        if (error) {
          probeRecordFailure();
          return {
            module, operation: op, available: false,
            responseTime: Date.now() - start, lastProbed: Date.now(),
            metadata: { error: error.message },
          } as DiscoveredCapability;
        }

        probeRecordSuccess();
        return {
          module, operation: op,
          available: (data?.length ?? 0) > 0,
          responseTime: Date.now() - start,
          lastProbed: Date.now(),
          metadata: {},
        } as DiscoveredCapability;
      } catch (err) {
        probeRecordFailure();
        return {
          module, operation: op, available: false,
          responseTime: null, lastProbed: Date.now(),
          metadata: { error: err instanceof Error ? err.message : 'Unknown' },
        } as DiscoveredCapability;
      }
    })
  );

  for (const r of probeResults) {
    if (r.status === 'fulfilled') {
      capabilities.push(r.value);
      if (r.value.metadata?.error) {
        errors.push(`${module}.${r.value.operation}: ${r.value.metadata.error}`);
      }
    } else {
      errors.push(`${module}: probe rejected`);
    }
  }

  const available = capabilities.filter(c => c.available).length;
  const coverage = expectedOps.length > 0 ? available / expectedOps.length : 0;

  // FIX #18: Correct avgResponseTime calculation
  const validTimes = capabilities.filter(c => c.responseTime !== null).map(c => c.responseTime!);
  const avgResponseTime = validTimes.length > 0
    ? validTimes.reduce((sum, t) => sum + t, 0) / validTimes.length
    : 0;

  const healthScore = Math.round(
    coverage * 70 +
    (avgResponseTime < 500 ? 30 : avgResponseTime < 2000 ? 15 : 0)
  );

  const result: ModuleDiscoveryResult = {
    module,
    capabilities,
    healthScore,
    coverage: Math.round(coverage * 100),
    lastDiscovery: Date.now(),
    errors,
  };

  discoveryCache.set(module, { result, timestamp: Date.now() });
  return result;
}

/** Run full discovery scan */
export async function discoverCapabilities(
  config: Partial<DiscoveryConfig> = {}
): Promise<ModuleDiscoveryResult[]> {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const results: ModuleDiscoveryResult[] = [];

  // Probe in batches of 4 for rate limiting
  for (let i = 0; i < cfg.modules.length; i += 4) {
    const batch = cfg.modules.slice(i, i + 4);
    const batchResults = await Promise.all(
      batch.map(m => probeModule(m, cfg.timeout))
    );
    results.push(...batchResults);
  }

  return results;
}

/** Get cached discovery result with TTL check */
export function getCachedDiscovery(module: string): ModuleDiscoveryResult | undefined {
  const cached = discoveryCache.get(module);
  if (!cached) return undefined;
  if (Date.now() - cached.timestamp > CACHE_TTL_MS) {
    discoveryCache.delete(module);
    return undefined;
  }
  return cached.result;
}

/** Get discovery summary */
export function getDiscoverySummary(results: ModuleDiscoveryResult[]) {
  const totalOps = results.reduce((s, r) => s + r.capabilities.length, 0);
  const availableOps = results.reduce((s, r) => s + r.capabilities.filter(c => c.available).length, 0);

  return {
    modulesScanned: results.length,
    totalOperations: totalOps,
    availableOperations: availableOps,
    overallCoverage: `${totalOps > 0 ? Math.round((availableOps / totalOps) * 100) : 0}%`,
    avgHealth: Math.round(results.reduce((s, r) => s + r.healthScore, 0) / Math.max(results.length, 1)),
    unhealthyModules: results.filter(r => r.healthScore < 50).map(r => r.module),
    fullyOperational: results.filter(r => r.coverage === 100).map(r => r.module),
    probeBreakerState: getProbeBreakerState().state,
  };
}
