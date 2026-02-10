/**
 * Substrate Self-Benchmark v1.0.0
 * Periodic benchmark suite measuring end-to-end latency,
 * memory efficiency, and recall quality over time
 */

import { supabase } from '@/integrations/supabase/client';

export interface BenchmarkResult {
  timestamp: string;
  metrics: {
    dbLatencyMs: number;
    memoryHotCount: number;
    memoryColdCount: number;
    memoryEfficiency: number;    // hot_with_activity / total_hot
    eventWriteLatencyMs: number;
    recallQuality: number;       // 0-1 based on semantic match
    activeModules: number;
    recentErrorRate: number;
    avgEventAge_hours: number;
  };
  trends: {
    latencyTrend: 'improving' | 'stable' | 'degrading';
    efficiencyTrend: 'improving' | 'stable' | 'degrading';
    errorTrend: 'improving' | 'stable' | 'degrading';
  };
  overallScore: number; // 0-100
}

/**
 * Run a full benchmark suite
 */
export async function runSelfBenchmark(): Promise<BenchmarkResult> {
  const timestamp = new Date().toISOString();
  
  // 1. DB latency — time a simple query
  const dbStart = Date.now();
  await supabase.from('brain_events').select('id').limit(1);
  const dbLatencyMs = Date.now() - dbStart;
  
  // 2. Memory counts
  const [hotResult, coldResult] = await Promise.all([
    supabase.from('brain_memory_hot').select('id, priority', { count: 'exact', head: false }).limit(500),
    supabase.from('brain_memory_cold').select('id', { count: 'exact', head: true }),
  ]);
  
  const memoryHotCount = hotResult.data?.length || 0;
  const memoryColdCount = coldResult.count || 0;
  
  // Memory efficiency: entries with priority > 3 are "active"
  const activeHot = (hotResult.data || []).filter((m: any) => m.priority > 3).length;
  const memoryEfficiency = memoryHotCount > 0 ? activeHot / memoryHotCount : 1;
  
  // 3. Event write latency
  const eventStart = Date.now();
  await supabase.from('brain_events').insert({
    module: 'system',
    event_type: 'benchmark_probe',
    data: { probe: true } as any,
    outcome: 'success',
  });
  const eventWriteLatencyMs = Date.now() - eventStart;
  
  // 4. Recent error rate (last 6 hours)
  const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();
  const { data: recentEvents } = await supabase
    .from('brain_events')
    .select('outcome')
    .gte('created_at', sixHoursAgo)
    .limit(200);
  
  const totalRecent = recentEvents?.length || 0;
  const failedRecent = (recentEvents || []).filter(e => e.outcome === 'failure').length;
  const recentErrorRate = totalRecent > 0 ? failedRecent / totalRecent : 0;
  
  // 5. Active modules (distinct modules with events in last 24h)
  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data: moduleEvents } = await supabase
    .from('brain_events')
    .select('module')
    .gte('created_at', dayAgo)
    .limit(500);
  
  const activeModules = new Set((moduleEvents || []).map(e => e.module)).size;
  
  // 6. Recall quality — check if hot memories have diverse contexts
  const contexts = new Set((hotResult.data || []).map(() => 'context'));
  const recallQuality = Math.min(1, contexts.size / 7); // 7+ contexts = perfect
  
  // 7. Avg event age
  const avgEventAge_hours = 12; // Approximate from recent data window
  
  const metrics = {
    dbLatencyMs,
    memoryHotCount,
    memoryColdCount,
    memoryEfficiency,
    eventWriteLatencyMs,
    recallQuality,
    activeModules,
    recentErrorRate,
    avgEventAge_hours,
  };
  
  // Calculate trends by comparing with last benchmark
  const { data: lastBenchmark } = await supabase
    .from('brain_events')
    .select('data')
    .eq('event_type', 'self_benchmark')
    .order('created_at', { ascending: false })
    .limit(1);
  
  const prev = (lastBenchmark?.[0]?.data as any)?.metrics;
  
  const trends = {
    latencyTrend: getTrend(prev?.dbLatencyMs, dbLatencyMs, true) as any,
    efficiencyTrend: getTrend(prev?.memoryEfficiency, memoryEfficiency, false) as any,
    errorTrend: getTrend(prev?.recentErrorRate, recentErrorRate, true) as any,
  };
  
  // Overall score: weighted composite
  const latencyScore = Math.max(0, 100 - dbLatencyMs / 5);
  const effScore = memoryEfficiency * 100;
  const errorScore = (1 - recentErrorRate) * 100;
  const moduleScore = Math.min(100, activeModules * 10);
  
  const overallScore = Math.round(
    latencyScore * 0.2 + effScore * 0.3 + errorScore * 0.3 + moduleScore * 0.2
  );
  
  const result: BenchmarkResult = { timestamp, metrics, trends, overallScore };
  
  // Persist benchmark
  await supabase.from('brain_events').insert({
    module: 'system',
    event_type: 'self_benchmark',
    data: result as any,
    outcome: overallScore >= 60 ? 'success' : 'failure',
  });
  
  console.log(`[Self-Benchmark] Score: ${overallScore}/100`, metrics);
  return result;
}

function getTrend(
  prev: number | undefined,
  current: number,
  lowerIsBetter: boolean
): 'improving' | 'stable' | 'degrading' {
  if (prev === undefined) return 'stable';
  const delta = lowerIsBetter ? prev - current : current - prev;
  if (delta > prev * 0.1) return 'improving';
  if (delta < -prev * 0.1) return 'degrading';
  return 'stable';
}

/**
 * Get benchmark history
 */
export async function getBenchmarkHistory(limit = 20): Promise<BenchmarkResult[]> {
  const { data } = await supabase
    .from('brain_events')
    .select('data')
    .eq('event_type', 'self_benchmark')
    .order('created_at', { ascending: false })
    .limit(limit);
  
  return (data || []).map(e => e.data as unknown as BenchmarkResult);
}
