/**
 * Cross-Source Correlator — v11.5.2
 * Enterprise Analytics Gap-Filler
 *
 * Correlates signals across AI, Access, Brain, Immune, and ENCODE
 * to detect systemic patterns invisible to single-source analysis.
 */

import { supabase } from '@/integrations/supabase/client';

// ═══ Types ═══════════════════════════════════════════════════════

export interface CorrelationSignal {
  id: string;
  sources: string[];
  pattern: string;
  severity: 'info' | 'warn' | 'critical';
  confidence: number; // 0-1
  description: string;
  evidence: Record<string, unknown>;
  detectedAt: string;
}

export interface CorrelationReport {
  timestamp: string;
  windowHours: number;
  signals: CorrelationSignal[];
  sourceHealth: Record<string, { status: 'healthy' | 'degraded' | 'down'; metric: number }>;
  cascadeRisk: number; // 0-100
}

// ═══ Correlator ═════════════════════════════════════════════════

export async function runCorrelationAnalysis(windowHours = 6): Promise<CorrelationReport> {
  const since = new Date(Date.now() - windowHours * 60 * 60 * 1000).toISOString();
  const signals: CorrelationSignal[] = [];

  // Parallel fetch all sources
  const [aiRes, brainRes, immuneRes, accessRes] = await Promise.allSettled([
    supabase.from('ai_usage_log')
      .select('success, response_time_ms, provider, created_at')
      .gte('created_at', since)
      .limit(1000),
    supabase.from('brain_events')
      .select('outcome, module, created_at')
      .gte('created_at', since)
      .limit(1000),
    supabase.from('immune_metrics')
      .select('executor, escalations, repair_successes, safe_failures, total_runs')
      .gte('run_at', since),
    supabase.from('access_usage')
      .select('module, cost_millicents, created_at')
      .gte('created_at', since)
      .limit(1000),
  ]);

  const aiData = aiRes.status === 'fulfilled' ? (aiRes.value.data ?? []) : [];
  const brainData = brainRes.status === 'fulfilled' ? (brainRes.value.data ?? []) : [];
  const immuneData = immuneRes.status === 'fulfilled' ? (immuneRes.value.data ?? []) : [];
  const accessData = accessRes.status === 'fulfilled' ? (accessRes.value.data ?? []) : [];

  // ─── Correlation 1: AI failures → Brain failures (cascade detection) ───
  const aiFailRate = aiData.length > 0
    ? aiData.filter((d: any) => !d.success).length / aiData.length
    : 0;
  const brainFailRate = brainData.length > 0
    ? brainData.filter((d: any) => d.outcome !== 'succeeded').length / brainData.length
    : 0;

  if (aiFailRate > 0.1 && brainFailRate > 0.1) {
    signals.push({
      id: crypto.randomUUID(),
      sources: ['ai', 'brain'],
      pattern: 'cascade_failure',
      severity: aiFailRate > 0.3 || brainFailRate > 0.3 ? 'critical' : 'warn',
      confidence: Math.min(1, (aiFailRate + brainFailRate) / 0.4),
      description: `AI (${(aiFailRate * 100).toFixed(0)}%) and BRAIN (${(brainFailRate * 100).toFixed(0)}%) both degraded — likely cascade`,
      evidence: { aiFailRate, brainFailRate, aiSamples: aiData.length, brainSamples: brainData.length },
      detectedAt: new Date().toISOString(),
    });
  }

  // ─── Correlation 2: Escalation surge + high cost (resource drain) ───
  const totalEscalations = immuneData.reduce((s: number, d: any) => s + (d.escalations ?? 0), 0);
  const totalCost = accessData.reduce((s: number, d: any) => s + (d.cost_millicents ?? 0), 0);

  if (totalEscalations > 5 && totalCost > 50000) {
    signals.push({
      id: crypto.randomUUID(),
      sources: ['immune', 'access'],
      pattern: 'escalation_cost_drain',
      severity: 'warn',
      confidence: 0.7,
      description: `${totalEscalations} escalations correlated with $${(totalCost / 100000).toFixed(2)} in costs`,
      evidence: { totalEscalations, totalCostCents: totalCost / 100 },
      detectedAt: new Date().toISOString(),
    });
  }

  // ─── Correlation 3: Latency spike + failure spike (saturation) ───
  const avgLatency = aiData.length > 0
    ? aiData.reduce((s: number, d: any) => s + (d.response_time_ms ?? 0), 0) / aiData.length
    : 0;

  if (avgLatency > 5000 && aiFailRate > 0.05) {
    signals.push({
      id: crypto.randomUUID(),
      sources: ['ai'],
      pattern: 'saturation_detected',
      severity: avgLatency > 15000 ? 'critical' : 'warn',
      confidence: Math.min(1, avgLatency / 10000),
      description: `AI saturated: ${(avgLatency / 1000).toFixed(1)}s avg latency with ${(aiFailRate * 100).toFixed(1)}% failures`,
      evidence: { avgLatencyMs: avgLatency, failRate: aiFailRate },
      detectedAt: new Date().toISOString(),
    });
  }

  // ─── Correlation 4: Module concentration risk ───
  const moduleCounts: Record<string, number> = {};
  accessData.forEach((d: any) => { moduleCounts[d.module] = (moduleCounts[d.module] || 0) + 1; });
  const totalAccess = accessData.length;
  const topModuleEntry = Object.entries(moduleCounts).sort((a, b) => b[1] - a[1])[0];

  if (topModuleEntry && totalAccess > 20 && topModuleEntry[1] / totalAccess > 0.6) {
    signals.push({
      id: crypto.randomUUID(),
      sources: ['access'],
      pattern: 'module_concentration_risk',
      severity: 'info',
      confidence: topModuleEntry[1] / totalAccess,
      description: `Module '${topModuleEntry[0]}' accounts for ${((topModuleEntry[1] / totalAccess) * 100).toFixed(0)}% of all access — single point of failure risk`,
      evidence: { module: topModuleEntry[0], share: topModuleEntry[1] / totalAccess },
      detectedAt: new Date().toISOString(),
    });
  }

  // ─── Source Health Summary ───
  const sourceHealth: CorrelationReport['sourceHealth'] = {
    ai: {
      status: aiFailRate > 0.2 ? 'degraded' : aiFailRate > 0.5 ? 'down' : 'healthy',
      metric: (1 - aiFailRate) * 100,
    },
    brain: {
      status: brainFailRate > 0.2 ? 'degraded' : brainFailRate > 0.5 ? 'down' : 'healthy',
      metric: (1 - brainFailRate) * 100,
    },
    immune: {
      status: totalEscalations > 10 ? 'degraded' : 'healthy',
      metric: immuneData.length > 0 ? Math.max(0, 100 - totalEscalations * 5) : 100,
    },
    access: {
      status: totalCost > 100000 ? 'degraded' : 'healthy',
      metric: Math.max(0, 100 - Math.min(100, totalCost / 5000)),
    },
  };

  // Cascade risk: how likely is a multi-source failure
  const degradedCount = Object.values(sourceHealth).filter(s => s.status !== 'healthy').length;
  const cascadeRisk = Math.min(100, degradedCount * 25 + signals.filter(s => s.severity === 'critical').length * 20);

  return {
    timestamp: new Date().toISOString(),
    windowHours,
    signals,
    sourceHealth,
    cascadeRisk,
  };
}
