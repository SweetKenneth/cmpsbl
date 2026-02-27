/**
 * CMPSBL® VISION "Vee" — Anomaly Detection Engine
 * Detect and track system anomalies with severity classification
 */

import { supabase } from '@/integrations/supabase/client';

export interface Anomaly {
  id: string;
  module: string;
  anomaly_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: Record<string, unknown>;
  baseline_value?: number;
  detected_value?: number;
  deviation_percent?: number;
  detected_at: string;
  resolved: boolean;
  resolved_at?: string;
  auto_action_taken?: string;
}

export interface AnomalyAnalysisResult {
  anomalies_detected: Anomaly[];
  window: string;
  analyzed_at: string;
}

/**
 * Analyze a time window for anomalies
 */
export async function analyzeWindow(
  window: '5m' | '1h' | '24h' = '1h'
): Promise<AnomalyAnalysisResult> {
  const windowMs: Record<string, number> = {
    '5m': 5 * 60 * 1000,
    '1h': 60 * 60 * 1000,
    '24h': 24 * 60 * 60 * 1000,
  };

  const since = new Date(Date.now() - windowMs[window]).toISOString();
  const baselineSince = new Date(Date.now() - windowMs[window] * 4).toISOString();
  const detectedAnomalies: Anomaly[] = [];

  try {
    // 1. Check for error rate spikes
    const { data: recentErrors } = await supabase
      .from('brain_events')
      .select('module, outcome')
      .eq('outcome', 'error')
      .gte('created_at', since);

    const { data: baselineErrors } = await supabase
      .from('brain_events')
      .select('module, outcome')
      .eq('outcome', 'error')
      .gte('created_at', baselineSince)
      .lt('created_at', since);

    // Group errors by module
    const recentByModule: Record<string, number> = {};
    const baselineByModule: Record<string, number> = {};

    (recentErrors || []).forEach((e) => {
      recentByModule[e.module] = (recentByModule[e.module] || 0) + 1;
    });

    (baselineErrors || []).forEach((e) => {
      baselineByModule[e.module] = (baselineByModule[e.module] || 0) + 1;
    });

    // Detect error spikes (2x baseline)
    for (const [module, count] of Object.entries(recentByModule)) {
      const baseline = baselineByModule[module] || 0;
      if (count > 5 && (baseline === 0 || count > baseline * 2)) {
        const deviation = baseline > 0 ? ((count - baseline) / baseline) * 100 : 100;
        detectedAnomalies.push({
          id: crypto.randomUUID(),
          module,
          anomaly_type: 'error_spike',
          severity: count > 20 ? 'critical' : count > 10 ? 'high' : 'medium',
          details: { error_count: count, baseline_count: baseline },
          baseline_value: baseline,
          detected_value: count,
          deviation_percent: Math.round(deviation),
          detected_at: new Date().toISOString(),
          resolved: false,
        });
      }
    }

    // 2. Check for latency spikes in AI providers
    const { data: recentUsage } = await supabase
      .from('ai_usage_log')
      .select('provider, response_time_ms')
      .gte('created_at', since);

    const latencyByProvider: Record<string, number[]> = {};
    (recentUsage || []).forEach((u) => {
      if (u.response_time_ms) {
        if (!latencyByProvider[u.provider]) latencyByProvider[u.provider] = [];
        latencyByProvider[u.provider].push(u.response_time_ms);
      }
    });

    for (const [provider, latencies] of Object.entries(latencyByProvider)) {
      if (latencies.length > 3) {
        const avg = latencies.reduce((a, b) => a + b, 0) / latencies.length;
        const p95 = latencies.sort((a, b) => a - b)[Math.floor(latencies.length * 0.95)];
        
        if (p95 > 5000) {
          detectedAnomalies.push({
            id: crypto.randomUUID(),
            module: 'nexus',
            anomaly_type: 'latency_spike',
            severity: p95 > 15000 ? 'critical' : p95 > 10000 ? 'high' : 'medium',
            details: { provider, avg_ms: Math.round(avg), p95_ms: p95 },
            baseline_value: 2000,
            detected_value: p95,
            deviation_percent: Math.round(((p95 - 2000) / 2000) * 100),
            detected_at: new Date().toISOString(),
            resolved: false,
          });
        }
      }
    }

    // 3. Check for health score drops
    const { data: healthEvents } = await supabase
      .from('brain_events')
      .select('data, module')
      .eq('event_type', 'health_check')
      .gte('created_at', since)
      .order('created_at', { ascending: false })
      .limit(20);

    const lowHealthModules = (healthEvents || []).filter((e) => {
      const health = (e.data as any)?.health_score;
      return typeof health === 'number' && health < 50;
    });

    for (const event of lowHealthModules) {
      const health = (event.data as any)?.health_score;
      detectedAnomalies.push({
        id: crypto.randomUUID(),
        module: event.module || 'unknown',
        anomaly_type: 'health_drop',
        severity: health < 20 ? 'critical' : health < 35 ? 'high' : 'medium',
        details: { health_score: health },
        baseline_value: 80,
        detected_value: health,
        deviation_percent: Math.round(((80 - health) / 80) * 100),
        detected_at: new Date().toISOString(),
        resolved: false,
      });
    }

    // Persist detected anomalies
    if (detectedAnomalies.length > 0) {
      for (const a of detectedAnomalies) {
        await supabase.from('vision_anomalies').insert([{
          module: a.module,
          anomaly_type: a.anomaly_type,
          severity: a.severity,
          details: JSON.parse(JSON.stringify(a.details)),
          baseline_value: a.baseline_value,
          detected_value: a.detected_value,
          deviation_percent: a.deviation_percent,
          detected_at: a.detected_at,
        }]);
      }
    }
  } catch (error) {
    console.error('Error analyzing anomalies:', error);
  }

  return {
    anomalies_detected: detectedAnomalies,
    window,
    analyzed_at: new Date().toISOString(),
  };
}

/**
 * Get recent anomalies from database
 */
export async function getRecentAnomalies(
  limit: number = 20,
  includeResolved: boolean = false
): Promise<Anomaly[]> {
  try {
    let query = supabase
      .from('vision_anomalies')
      .select('*')
      .order('detected_at', { ascending: false })
      .limit(limit);

    if (!includeResolved) {
      query = query.eq('resolved', false);
    }

    const { data } = await query;
    return (data || []) as Anomaly[];
  } catch (error) {
    console.error('Error fetching anomalies:', error);
    return [];
  }
}

/**
 * Resolve an anomaly
 */
export async function resolveAnomaly(
  anomalyId: string,
  resolutionAction: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('vision_anomalies')
      .update({
        resolved: true,
        resolved_at: new Date().toISOString(),
        resolution_action: resolutionAction,
      })
      .eq('id', anomalyId);

    return !error;
  } catch {
    return false;
  }
}

/**
 * Get anomaly counts for analytics
 */
export async function getAnomalyCounts(): Promise<{
  anomaly_count_24h: number;
  critical_anomalies_24h: number;
  last_anomaly_at: string | null;
}> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  try {
    const { count: totalCount } = await supabase
      .from('vision_anomalies')
      .select('*', { count: 'exact', head: true })
      .gte('detected_at', since);

    const { count: criticalCount } = await supabase
      .from('vision_anomalies')
      .select('*', { count: 'exact', head: true })
      .eq('severity', 'critical')
      .gte('detected_at', since);

    const { data: latestAnomaly } = await supabase
      .from('vision_anomalies')
      .select('detected_at')
      .order('detected_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    return {
      anomaly_count_24h: totalCount || 0,
      critical_anomalies_24h: criticalCount || 0,
      last_anomaly_at: latestAnomaly?.detected_at || null,
    };
  } catch {
    return {
      anomaly_count_24h: 0,
      critical_anomalies_24h: 0,
      last_anomaly_at: null,
    };
  }
}
