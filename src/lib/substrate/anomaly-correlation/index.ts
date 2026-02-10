/**
 * Cross-Module Anomaly Correlation v1.0.0
 * When one module detects an anomaly, auto-correlate with signals
 * from related modules to identify systemic issues
 */

import { supabase } from '@/integrations/supabase/client';
import { moduleBus } from '../module-bus';

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

// Module correlation groups — anomalies in one should check the others
const CORRELATION_GROUPS: Record<string, string[]> = {
  defense: ['access', 'system', 'nexus'],
  nexus: ['brain', 'decode', 'cortex'],
  vision: ['defense', 'system', 'nexus'],
  brain: ['nexus', 'dream', 'cortex'],
  system: ['defense', 'access', 'modernizer'],
  access: ['defense', 'system'],
  dream: ['brain', 'cortex'],
  integration: ['nexus', 'system'],
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
  const windowStart = new Date(now.getTime() - 30 * 60 * 1000); // 30-min window
  
  const relatedModules = CORRELATION_GROUPS[sourceModule] || [];
  
  // Fetch recent failure/warning events from related modules
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
  
  // Determine severity based on correlation density
  const uniqueModules = new Set(correlations.map(c => c.module));
  let severity: CorrelatedAnomaly['severity'] = 'low';
  if (uniqueModules.size >= 3) severity = 'critical';
  else if (uniqueModules.size >= 2) severity = 'high';
  else if (correlations.length >= 3) severity = 'medium';
  
  const systemic = uniqueModules.size >= 2;
  
  // Generate recommendation
  let recommendation = 'Monitor — isolated anomaly.';
  if (systemic) {
    const affected = Array.from(uniqueModules).join(', ');
    recommendation = `Systemic issue detected across ${affected}. Check shared dependencies (Nexus providers, DB connections). Consider circuit-breaking affected modules.`;
  } else if (correlations.length > 0) {
    recommendation = `Related failures found in ${correlations[0].module}. Investigate causal chain.`;
  }
  
  const result: CorrelatedAnomaly = {
    primary: {
      module: sourceModule,
      type: anomalyType,
      detail,
      timestamp: now.toISOString(),
    },
    correlations,
    severity,
    systemic,
    recommendation,
  };
  
  // Log correlation result
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
  
  // Broadcast if systemic
  if (systemic) {
    moduleBus.emit('ANOMALY_DETECTED', {
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
  moduleBus.on('THREAT_DETECTED', (data: any) => {
    correlateAnomaly('defense', 'threat', JSON.stringify(data).slice(0, 300));
  });
  
  moduleBus.on('PROVIDER_DOWN', (data: any) => {
    correlateAnomaly('nexus', 'provider_failure', JSON.stringify(data).slice(0, 300));
  });
  
  moduleBus.on('MODULE_DEGRADED', (data: any) => {
    correlateAnomaly(data?.module || 'system', 'degradation', JSON.stringify(data).slice(0, 300));
  });
  
  console.log('[Anomaly-Correlation] Auto-correlation enabled on bus signals');
}
