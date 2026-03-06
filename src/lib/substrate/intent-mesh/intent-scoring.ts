/**
 * Intent Quality Scoring System
 * Modules learn which intents get the best responses
 * 
 * Scores intents on:
 * 1. Resolution rate — how often resolvers successfully respond
 * 2. Response richness — how many data keys are returned
 * 3. Latency efficiency — how fast resolvers respond
 * 4. Cross-module coverage — how many modules contribute
 * 5. Refinement depth — how many turns were needed (fewer = better phrased)
 * 
 * Scores feed back into CLM topics so modules learn to ask better questions
 * and provide richer answers.
 */

import { supabase } from '@/integrations/supabase/client';
import type { MeshReceipt, MeshResolution } from './types';

// ─── Types ───

export interface IntentQualityScore {
  intentType: string;
  sourceModule: string;
  overallScore: number; // 0-100
  resolutionRate: number; // 0-1
  responseRichness: number; // 0-1
  latencyScore: number; // 0-1 (inverted — lower latency = higher score)
  crossModuleCoverage: number; // 0-1
  refinementEfficiency: number; // 0-1 (1 = resolved in 1 turn)
  sampleSize: number;
  trend: 'improving' | 'stable' | 'declining';
  lastUpdated: string;
}

export interface IntentLeaderboard {
  topIntents: IntentQualityScore[];
  worstIntents: IntentQualityScore[];
  mostImproved: IntentQualityScore[];
  moduleRankings: Array<{
    module: string;
    avgIntentQuality: number;
    avgResponseQuality: number;
    totalIntents: number;
  }>;
}

// ─── Scoring Engine ───

/**
 * Score a single mesh resolution
 */
export function scoreResolution(resolution: MeshResolution): number {
  const resolutionRate = resolution.resolversMatched > 0 
    ? resolution.resolversResponded / resolution.resolversMatched 
    : 0;
  
  const responseKeys = Object.keys(resolution.composedResult).filter(k => !k.startsWith('_'));
  const richness = Math.min(1, responseKeys.length / 10); // 10+ keys = perfect richness
  
  const latencyScore = Math.max(0, 1 - (resolution.totalDurationMs / 5000)); // 5s = 0 score
  
  const uniqueModules = new Set(resolution.responses.filter(r => r.success).map(r => r.module));
  const coverage = Math.min(1, uniqueModules.size / 5); // 5+ modules = perfect coverage
  
  // Weighted composite
  const score = (
    resolutionRate * 0.30 +
    richness * 0.25 +
    latencyScore * 0.15 +
    coverage * 0.30
  ) * 100;
  
  return Math.round(Math.max(0, Math.min(100, score)));
}

/**
 * Calculate quality scores for all intent types from recent receipts
 */
export async function calculateIntentScores(): Promise<IntentQualityScore[]> {
  const { data } = await supabase
    .from('mesh_intents')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(500);

  if (!data || data.length === 0) return [];

  // Group by intent_type + source_module
  const groups = new Map<string, any[]>();
  for (const row of data) {
    const key = `${row.source_module}:${row.intent_type}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(row);
  }

  const scores: IntentQualityScore[] = [];

  for (const [key, receipts] of groups) {
    const [sourceModule, intentType] = key.split(':');
    
    const resolutionRate = receipts.filter(r => r.success).length / receipts.length;
    
    const avgRichness = receipts.reduce((sum, r) => {
      const outputs = r.output_summary ? Object.keys(r.output_summary).length : 0;
      return sum + Math.min(1, outputs / 10);
    }, 0) / receipts.length;
    
    const avgLatency = receipts.reduce((sum, r) => sum + (r.duration_ms || 0), 0) / receipts.length;
    const latencyScore = Math.max(0, 1 - (avgLatency / 5000));
    
    const avgCoverage = receipts.reduce((sum, r) => {
      const resolvedBy = (r.resolved_by as string[]) || [];
      return sum + Math.min(1, resolvedBy.length / 5);
    }, 0) / receipts.length;
    
    const overallScore = Math.round(
      (resolutionRate * 0.30 + avgRichness * 0.25 + latencyScore * 0.15 + avgCoverage * 0.30) * 100
    );

    // Simple trend detection based on first half vs second half
    const half = Math.floor(receipts.length / 2);
    const recentSuccess = receipts.slice(0, half).filter(r => r.success).length / Math.max(1, half);
    const olderSuccess = receipts.slice(half).filter(r => r.success).length / Math.max(1, receipts.length - half);
    const trend = recentSuccess > olderSuccess + 0.1 ? 'improving' 
                : recentSuccess < olderSuccess - 0.1 ? 'declining' 
                : 'stable';

    // Refinement efficiency: receipts with _refinementTurn > 0 needed extra turns.
    // Efficiency = proportion that resolved in first turn (no refinement needed).
    const firstTurnCount = receipts.filter(r => {
      const turn = (r.input_summary as any)?._refinementTurn;
      return !turn || turn <= 1;
    }).length;
    const refinementEfficiency = firstTurnCount / receipts.length;

    scores.push({
      intentType,
      sourceModule,
      overallScore,
      resolutionRate,
      responseRichness: avgRichness,
      latencyScore,
      crossModuleCoverage: avgCoverage,
      refinementEfficiency,
      sampleSize: receipts.length,
      trend,
      lastUpdated: new Date().toISOString(),
    });
  }

  return scores.sort((a, b) => b.overallScore - a.overallScore);
}

/**
 * Get the intent leaderboard — best/worst intents and module rankings
 */
export async function getIntentLeaderboard(): Promise<IntentLeaderboard> {
  const scores = await calculateIntentScores();

  // Module rankings
  const moduleMap = new Map<string, { totalQuality: number; totalResponse: number; count: number }>();
  
  for (const score of scores) {
    // As intent sender
    if (!moduleMap.has(score.sourceModule)) {
      moduleMap.set(score.sourceModule, { totalQuality: 0, totalResponse: 0, count: 0 });
    }
    const entry = moduleMap.get(score.sourceModule)!;
    entry.totalQuality += score.overallScore;
    entry.count++;
  }

  const moduleRankings = [...moduleMap.entries()]
    .map(([module, stats]) => ({
      module,
      avgIntentQuality: Math.round(stats.totalQuality / Math.max(1, stats.count)),
      avgResponseQuality: Math.round(stats.totalResponse / Math.max(1, stats.count)),
      totalIntents: stats.count,
    }))
    .sort((a, b) => b.avgIntentQuality - a.avgIntentQuality);

  return {
    topIntents: scores.slice(0, 10),
    worstIntents: scores.filter(s => s.sampleSize >= 3).sort((a, b) => a.overallScore - b.overallScore).slice(0, 10),
    mostImproved: scores.filter(s => s.trend === 'improving').slice(0, 10),
    moduleRankings,
  };
}

/**
 * Get quality insights for a specific module — what intents does it ask well vs poorly?
 */
export async function getModuleIntentInsights(module: string): Promise<{
  bestIntents: IntentQualityScore[];
  worstIntents: IntentQualityScore[];
  suggestions: string[];
}> {
  const scores = await calculateIntentScores();
  const moduleScores = scores.filter(s => s.sourceModule === module.toUpperCase());

  const bestIntents = moduleScores.filter(s => s.overallScore >= 70).slice(0, 5);
  const worstIntents = moduleScores.filter(s => s.overallScore < 50).sort((a, b) => a.overallScore - b.overallScore).slice(0, 5);

  const suggestions: string[] = [];
  
  for (const worst of worstIntents) {
    if (worst.resolutionRate < 0.5) {
      suggestions.push(`Intent '${worst.intentType}' has low resolution (${(worst.resolutionRate * 100).toFixed(0)}%). Consider broadening domains or adding missing resolvers.`);
    }
    if (worst.responseRichness < 0.3) {
      suggestions.push(`Intent '${worst.intentType}' gets sparse responses. Resolvers may need richer output schemas.`);
    }
    if (worst.crossModuleCoverage < 0.2) {
      suggestions.push(`Intent '${worst.intentType}' only reaches 1-2 modules. Cross-pollinate with more domains.`);
    }
  }

  if (suggestions.length === 0) {
    suggestions.push(`${module} intents are performing well across the board.`);
  }

  return { bestIntents, worstIntents, suggestions };
}
