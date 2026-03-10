/**
 * Cross-Module Anomaly Correlation v1.0.0
 * When one module detects an anomaly, auto-correlate with signals
 * from related modules to identify systemic issues
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
  // Kernel
  core: ['ripple', 'access', 'system'],
  ripple: ['core', 'cortex', 'integration', 'relay'],
  access: ['defense', 'system', 'identity', 'economy'],
  // Cognitive
  brain: ['nexus', 'dream', 'cortex', 'memory'],
  decode: ['brain', 'nexus', 'encode', 'inclusive'],
  dream: ['brain', 'cortex', 'memory'],
  // Operational
  defense: ['access', 'system', 'nexus', 'audit'],
  nexus: ['brain', 'decode', 'cortex', 'relay'],
  vision: ['defense', 'system', 'nexus', 'audit'],
  encode: ['decode', 'brain', 'sandbox'],
  // Administrative
  system: ['defense', 'access', 'evolution', 'audit'],
  evolution: ['system', 'cortex', 'vision'],
  integration: ['nexus', 'system', 'relay'],
  inclusive: ['decode', 'evolution', 'vision'],
  // Orchestrator
  cortex: ['brain', 'nexus', 'evolution'],
  atlas: ['cortex', 'brain', 'vision'],
  // Infrastructure
  memory: ['brain', 'core', 'dream'],
  relay: ['ripple', 'integration', 'nexus'],
  audit: ['system', 'defense', 'identity'],
  identity: ['access', 'audit', 'economy'],
  economy: ['access', 'nexus', 'identity'],
  sandbox: ['encode', 'defense', 'system'],
};

/**
 * Correlate a detected anomaly with recent events from related modules
 */
export async function correlateAnomaly(
  sourceModule: string,
  anomalyType: string,
  detail: string
): Promise<CorrelatedAnomaly> {
  const now = new Date();
  const windowStart = new Date(now.getTime() - 30 * 60 * 1000);
  
  const relatedModules = CORRELATION_GROUPS[sourceModule] || [];
  
  const { data: relatedEvents } = await supabase
    .from('brain_events')
    .select('*')
    .in('module', relatedModules)
    .eq('outcome', 'failure')
    .gte('created_at', windowStart.toISOString())
    .order('created_at', { ascending: false })
    .limit(50);
  
  const correlations: AnomalySignal[] = (relatedEvents || []).map(e => ({
    module: e.module,
    type: e.event_type,
    detail: JSON.stringify(e.data).slice(0, 200),
    timestamp: e.created_at,
  }));
  
  const uniqueModules = new Set(correlations.map(c => c.module));
  let severity: CorrelatedAnomaly['severity'] = 'low';
  if (uniqueModules.size >= 3) severity = 'critical';
  else if (uniqueModules.size >= 2) severity = 'high';
  else if (correlations.length >= 3) severity = 'medium';
  
  const systemic = uniqueModules.size >= 2;
  
  let recommendation = 'Monitor — isolated anomaly.';
  if (systemic) {
    const affected = Array.from(uniqueModules).join(', ');
    recommendation = `Systemic issue detected across ${affected}. Check shared dependencies (Nexus providers, DB connections). Consider circuit-breaking affected modules.`;
  } else if (correlations.length > 0) {
    recommendation = `Related failures found in ${correlations[0].module}. Investigate causal chain.`;
  }
  
  const result: CorrelatedAnomaly = {
    primary: { module: sourceModule, type: anomalyType, detail, timestamp: now.toISOString() },
    correlations,
    severity,
    systemic,
    recommendation,
  };
  
  await supabase.from('brain_events').insert({
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
  
  console.log('[Anomaly-Correlation] Auto-correlation enabled on bus signals');
}
