/**
 * CLM Feedback Loop — Scoring insights auto-feed into module learning topics
 * v10.3.0 — Modules learn to ask better questions and provide richer answers
 * 
 * Flow:
 * 1. Intent scoring calculates quality for each module's intents
 * 2. This engine extracts actionable insights from scores
 * 3. Insights are injected as dynamic learning topics into CLM configs
 * 4. Modules self-reflect on these insights during their next learning cycle
 */

import { calculateIntentScores, getModuleIntentInsights, type IntentQualityScore } from './intent-scoring';
import type { ModuleName } from '@/lib/substrate/module-clm';

// ─── Types ───

export interface CLMFeedbackInsight {
  module: ModuleName;
  topic: string;
  source: 'scoring' | 'gap' | 'discovery';
  priority: 'low' | 'medium' | 'high';
  score: number;
  createdAt: string;
}

export interface CLMFeedbackResult {
  modulesUpdated: number;
  insightsGenerated: number;
  insights: CLMFeedbackInsight[];
}

// ─── Dynamic Topic Store ───
// These are injected learning topics that supplement the static CLM configs

const dynamicTopics = new Map<ModuleName, CLMFeedbackInsight[]>();

/**
 * Get dynamic learning topics for a module (injected by feedback loops)
 */
export function getDynamicTopics(module: ModuleName): CLMFeedbackInsight[] {
  return dynamicTopics.get(module) || [];
}

/**
 * Get formatted dynamic topics as strings for CLM consumption
 */
export function getDynamicTopicStrings(module: ModuleName): string[] {
  const topics = getDynamicTopics(module);
  return topics.map(t => `[${t.source}|${t.priority}] ${t.topic}`);
}

/**
 * Run the CLM feedback loop — analyze scoring data and generate learning insights
 */
export async function runCLMFeedbackLoop(): Promise<CLMFeedbackResult> {
  const allInsights: CLMFeedbackInsight[] = [];
  const scores = await calculateIntentScores();
  
  if (scores.length === 0) {
    return { modulesUpdated: 0, insightsGenerated: 0, insights: [] };
  }

  // Group scores by source module
  const moduleScores = new Map<string, IntentQualityScore[]>();
  for (const score of scores) {
    const mod = score.sourceModule.toLowerCase() as ModuleName;
    if (!moduleScores.has(mod)) moduleScores.set(mod, []);
    moduleScores.get(mod)!.push(score);
  }

  const modulesUpdated = new Set<ModuleName>();

  for (const [mod, modScores] of moduleScores) {
    const module = mod as ModuleName;
    const insights: CLMFeedbackInsight[] = [];

    // 1. Low resolution rate intents → "learn to phrase intents better"
    const lowResolution = modScores.filter(s => s.resolutionRate < 0.5 && s.sampleSize >= 2);
    for (const score of lowResolution.slice(0, 3)) {
      insights.push({
        module,
        topic: `Intent '${score.intentType}' has ${(score.resolutionRate * 100).toFixed(0)}% resolution. Broaden domains or restructure input schema to help resolvers match.`,
        source: 'scoring',
        priority: 'high',
        score: score.overallScore,
        createdAt: new Date().toISOString(),
      });
    }

    // 2. Low response richness → "ask for richer outputs"
    const lowRichness = modScores.filter(s => s.responseRichness < 0.3 && s.sampleSize >= 2);
    for (const score of lowRichness.slice(0, 2)) {
      insights.push({
        module,
        topic: `Intent '${score.intentType}' gets sparse responses (${(score.responseRichness * 100).toFixed(0)}% richness). Add more output fields to resolver schemas or cross-pollinate with additional domains.`,
        source: 'scoring',
        priority: 'medium',
        score: score.overallScore,
        createdAt: new Date().toISOString(),
      });
    }

    // 3. Low cross-module coverage → "connect with more modules"
    const lowCoverage = modScores.filter(s => s.crossModuleCoverage < 0.2 && s.sampleSize >= 2);
    for (const score of lowCoverage.slice(0, 2)) {
      insights.push({
        module,
        topic: `Intent '${score.intentType}' only reaches 1-2 modules. Expanding domains (e.g., adding 'behavior', 'history', 'analytics') would increase cross-module enrichment.`,
        source: 'scoring',
        priority: 'medium',
        score: score.overallScore,
        createdAt: new Date().toISOString(),
      });
    }

    // 4. Declining intents → "investigate degradation"
    const declining = modScores.filter(s => s.trend === 'declining');
    for (const score of declining.slice(0, 2)) {
      insights.push({
        module,
        topic: `Intent '${score.intentType}' quality is declining (score: ${score.overallScore}). Investigate resolver changes, increased latency, or domain mismatches.`,
        source: 'scoring',
        priority: 'high',
        score: score.overallScore,
        createdAt: new Date().toISOString(),
      });
    }

    // 5. High-performing intents → "replicate success patterns"
    const bestIntents = modScores.filter(s => s.overallScore >= 80 && s.sampleSize >= 3);
    if (bestIntents.length > 0) {
      const domains = [...new Set(bestIntents.flatMap(s => s.intentType.split('_')))];
      insights.push({
        module,
        topic: `Strong intent patterns detected in domains [${domains.slice(0, 4).join(', ')}]. Replicate the input/output structure of top-scoring intents for new capabilities.`,
        source: 'scoring',
        priority: 'low',
        score: 85,
        createdAt: new Date().toISOString(),
      });
    }

    if (insights.length > 0) {
      // Keep max 8 dynamic topics per module
      dynamicTopics.set(module, insights.slice(0, 8));
      modulesUpdated.add(module);
      allInsights.push(...insights);
    }
  }

  return {
    modulesUpdated: modulesUpdated.size,
    insightsGenerated: allInsights.length,
    insights: allInsights,
  };
}

/**
 * Clear dynamic topics for a module (useful for reset/testing)
 */
export function clearDynamicTopics(module?: ModuleName): void {
  if (module) {
    dynamicTopics.delete(module);
  } else {
    dynamicTopics.clear();
  }
}

/**
 * Get a summary of all dynamic CLM feedback across modules
 */
export function getCLMFeedbackSummary(): {
  totalTopics: number;
  modulesWithFeedback: string[];
  priorityBreakdown: { high: number; medium: number; low: number };
} {
  let total = 0;
  const modules: string[] = [];
  const priorities = { high: 0, medium: 0, low: 0 };

  for (const [mod, insights] of dynamicTopics) {
    total += insights.length;
    modules.push(mod);
    for (const i of insights) {
      priorities[i.priority]++;
    }
  }

  return { totalTopics: total, modulesWithFeedback: modules, priorityBreakdown: priorities };
}
