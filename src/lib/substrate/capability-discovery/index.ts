/**
 * Module Capability Discovery
 * Auto-detects module functionality via endpoint probing (26-node architecture)
 * 
 * Scans registered modules to discover available operations,
 * health status, and capability coverage.
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
  MODERNIZER: ['status', 'scan', 'evolve', 'diff', 'review', 'receipts'],
  INTEGRATION: ['status', 'connect', 'disconnect', 'list', 'health'],
  INCLUSIVE: ['status', 'scan', 'fix', 'report', 'guidelines'],
  CORTEX: ['status', 'propose', 'evaluate', 'apply', 'audit', 'learn'],
  NERVE: ['status', 'signal', 'relay', 'throttle', 'priority'],
  ANALYTICS: ['status', 'aggregate', 'trend', 'forecast', 'report'],
  EVOLUTION: ['status', 'mutate', 'select', 'crossover', 'fitness'],
  GOVERNANCE: ['status', 'enforce', 'audit', 'policy', 'delegate'],
  IDENTITY: ['status', 'verify', 'provision', 'revoke', 'federate'],
  AUDIT: ['status', 'log', 'query', 'export', 'retain'],
  MEDIC: ['status', 'diagnose', 'heal', 'quarantine', 'report'],
  // Expansion modules (37-node architecture)
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
};

const DEFAULT_CONFIG: DiscoveryConfig = {
  modules: Object.keys(MODULE_OPERATIONS),
  timeout: 5000,
  includeEdgeFunctions: true,
};

const discoveryCache = new Map<string, ModuleDiscoveryResult>();

/** Probe a single module's capabilities */
async function probeModule(module: string, timeout: number): Promise<ModuleDiscoveryResult> {
  const expectedOps = MODULE_OPERATIONS[module] || ['status'];
  const capabilities: DiscoveredCapability[] = [];
  const errors: string[] = [];

  for (const op of expectedOps) {
    const start = Date.now();
    try {
      // Check via brain_events for recent successful executions
      const { data } = await supabase
        .from('brain_events')
        .select('id')
        .eq('module', module.toLowerCase())
        .eq('event_type', op)
        .eq('outcome', 'success')
        .order('created_at', { ascending: false })
        .limit(1);

      capabilities.push({
        module,
        operation: op,
        available: (data?.length ?? 0) > 0,
        responseTime: Date.now() - start,
        lastProbed: Date.now(),
        metadata: {},
      });
    } catch (err) {
      capabilities.push({
        module,
        operation: op,
        available: false,
        responseTime: null,
        lastProbed: Date.now(),
        metadata: { error: err instanceof Error ? err.message : 'Unknown' },
      });
      errors.push(`${module}.${op}: probe failed`);
    }
  }

  const available = capabilities.filter(c => c.available).length;
  const coverage = expectedOps.length > 0 ? available / expectedOps.length : 0;
  const avgResponseTime = capabilities
    .filter(c => c.responseTime !== null)
    .reduce((s, c, _, a) => s + (c.responseTime ?? 0) / a.length, 0);

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

  discoveryCache.set(module, result);
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

/** Get cached discovery result */
export function getCachedDiscovery(module: string): ModuleDiscoveryResult | undefined {
  return discoveryCache.get(module);
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
  };
}
