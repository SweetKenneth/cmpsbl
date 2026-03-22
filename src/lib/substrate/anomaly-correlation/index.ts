/**
 * Cross-Module Anomaly Correlation v2.0.0
 * When one module detects an anomaly, auto-correlate with signals
 * from related modules to identify systemic issues.
 *
 * v2 optimizations:
 *  - Parallel correlation event fetch + persistence
 *  - Pre-computed module sets from CORRELATION_GROUPS
 *  - Debounced auto-correlation to prevent storm cascades
 *  - Single-pass severity + recommendation computation
 */

import { supabase } from '@/integrations/supabase/client';
import { subscribe, publish, type ModuleName } from '../module-bus';

export interface CorrelatedAnomaly {
  primary: AnomalySignal;
  correlations: AnomalySignal[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  systemic: boolean;
  recommendation: string;
}

interface AnomalySignal {
  module: string;
  type: string;
  detail: string;
  timestamp: string;
}

const CORRELATION_GROUPS: Record<string, string[]> = {
  core: ['ripple', 'access', 'system'],
  ripple: ['core', 'cortex', 'integration', 'relay'],
  access: ['defense', 'system', 'identity', 'economy'],
  brain: ['nexus', 'dream', 'cortex', 'memory'],
  decode: ['brain', 'nexus', 'encode', 'inclusive'],
  dream: ['brain', 'cortex', 'memory'],
  defense: ['access', 'system', 'nexus', 'audit'],
  nexus: ['brain', 'decode', 'cortex', 'relay'],
  vision: ['defense', 'system', 'nexus', 'audit'],
  encode: ['decode', 'brain', 'sandbox'],
  system: ['defense', 'access', 'evolution', 'audit'],
  evolution: ['system', 'cortex', 'vision'],
  integration: ['nexus', 'system', 'relay'],
  inclusive: ['decode', 'evolution', 'vision'],
  cortex: ['brain', 'nexus', 'evolution'],
  atlas: ['cortex', 'brain', 'vision'],
  memory: ['brain', 'core', 'dream'],
  relay: ['ripple', 'integration', 'nexus'],
  audit: ['system', 'defense', 'identity'],
  identity: ['access', 'audit', 'economy'],
  economy: ['access', 'nexus', 'identity'],
  sandbox: ['encode', 'defense', 'system'],
};

// Debounce: track recent correlations to prevent storm cascades
const recentCorrelations = new Map<string, number>();
const DEBOUNCE_MS = 10_000; // 10s debounce per module

/**
 * Correlate a detected anomaly with recent events from related modules
 */
export async function correlateAnomaly(
  sourceModule: string,
  anomalyType: string,
  detail: string,
): Promise<CorrelatedAnomaly | null> {
  // Debounce check
  const key = `${sourceModule}:${anomalyType}`;
  const now = Date.now();
  const lastRun = recentCorrelations.get(key);
  if (lastRun && now - lastRun < DEBOUNCE_MS) return null;
  recentCorrelations.set(key, now);

  const relatedModules = CORRELATION_GROUPS[sourceModule] || [];
  if (relatedModules.length === 0) return null;

  const windowStart = new Date(now - 30 * 60 * 1000).toISOString();

  const { data: relatedEvents } = await supabase
    .from('brain_events')
    .select('module, event_type, data, created_at')
    .in('module', relatedModules)
    .eq('outcome', 'failure')
    .gte('created_at', windowStart)
    .order('created_at', { ascending: false })
    .limit(50);

  // Single-pass: build correlations + count unique modules
  const uniqueModules = new Set<string>();
  const correlations: AnomalySignal[] = [];

  if (relatedEvents) {
    for (const e of relatedEvents) {
      uniqueModules.add(e.module);
      correlations.push({
        module: e.module,
        type: e.event_type,
        detail: typeof e.data === 'string' ? e.data.slice(0, 200) : JSON.stringify(e.data).slice(0, 200),
        timestamp: e.created_at,
      });
    }
  }

  const systemic = uniqueModules.size >= 2;
  const severity: CorrelatedAnomaly['severity'] =
    uniqueModules.size >= 3 ? 'critical' :
    uniqueModules.size >= 2 ? 'high' :
    correlations.length >= 3 ? 'medium' : 'low';

  const recommendation = systemic
    ? `Systemic issue detected across ${Array.from(uniqueModules).join(', ')}. Check shared dependencies (Nexus providers, DB connections). Consider circuit-breaking affected modules.`
    : correlations.length > 0
      ? `Related failures found in ${correlations[0].module}. Investigate causal chain.`
      : 'Monitor — isolated anomaly.';

  const result: CorrelatedAnomaly = {
    primary: { module: sourceModule, type: anomalyType, detail, timestamp: new Date(now).toISOString() },
    correlations,
    severity,
    systemic,
    recommendation,
  };

  // Fire-and-forget persistence + mesh publish in parallel
  const persistPromise = supabase.from('brain_events').insert({
    module: sourceModule,
    event_type: 'anomaly_correlated',
    data: {
      anomaly_type: anomalyType,
      correlation_count: correlations.length,
      unique_modules: Array.from(uniqueModules),
      severity,
      systemic,
    } as any,
    outcome: systemic ? 'failure' : 'success',
  });

  if (systemic) {
    publish(sourceModule as ModuleName, 'anomaly.detected', {
      source: sourceModule,
      severity,
      affectedModules: Array.from(uniqueModules),
      recommendation,
    });
  }

  // Non-blocking persistence
  persistPromise.then(null, () => {});

  return result;
}

/**
 * Enable automatic anomaly correlation on bus signals
 */
export function enableAutoCorrelation(): void {
  subscribe('defense' as ModuleName, 'threat.detected', (signal) => {
    correlateAnomaly('defense', 'threat', JSON.stringify(signal.payload).slice(0, 300));
  });

  subscribe('nexus' as ModuleName, 'health.degraded', (signal) => {
    correlateAnomaly('nexus', 'provider_failure', JSON.stringify(signal.payload).slice(0, 300));
  });

  subscribe('system' as ModuleName, 'health.degraded', (signal) => {
    correlateAnomaly(signal.from || 'system', 'degradation', JSON.stringify(signal.payload).slice(0, 300));
  });

  console.log('[Anomaly-Correlation] Auto-correlation v2 enabled');
}
