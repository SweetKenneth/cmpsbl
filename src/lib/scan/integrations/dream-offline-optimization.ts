/**
 * DREAM — Offline Optimization Patterns (#35)
 * Uses dream cycle data to discover optimization patterns
 * that are invisible during live scanning (e.g. refactoring
 * opportunities that only emerge from cross-session replay).
 */

export interface DreamInsight {
  insightId: string;
  type: 'refactor_opportunity' | 'pattern_consolidation' | 'dead_path' | 'optimization_template';
  title: string;
  description: string;
  affectedPaths: string[];
  estimatedImpact: number; // 0-1
  confidence: number;
  dreamCycleSource: string;
  actionable: boolean;
}

export interface DreamOptimizationReport {
  insights: DreamInsight[];
  totalDreamCycles: number;
  actionableInsights: number;
  highImpactCount: number;
  categories: Record<DreamInsight['type'], number>;
  generatedAt: string;
}

interface DreamCycleData {
  cycleId: string;
  timestamp: string;
  consolidatedPatterns: Array<{
    pattern: string;
    frequency: number;
    modules: string[];
  }>;
  anomalies: Array<{
    description: string;
    severity: number;
    path?: string;
  }>;
  optimizationHints: string[];
}

/**
 * Mine dream cycle data for scanner-relevant optimization patterns
 */
export function mineDreamOptimizations(
  dreamCycles: DreamCycleData[],
  scanHistory?: Array<{ category: string; filePath?: string }>,
): DreamOptimizationReport {
  const insights: DreamInsight[] = [];

  for (const cycle of dreamCycles) {
    // Pattern consolidation: recurring patterns across modules
    for (const pattern of cycle.consolidatedPatterns) {
      if (pattern.frequency >= 3 && pattern.modules.length >= 2) {
        insights.push({
          insightId: `dream_${insights.length + 1}`,
          type: 'pattern_consolidation',
          title: `Consolidate "${pattern.pattern}" pattern`,
          description: `Pattern "${pattern.pattern}" repeats ${pattern.frequency}x across ${pattern.modules.length} modules — candidate for shared utility extraction`,
          affectedPaths: pattern.modules,
          estimatedImpact: Math.min(1, pattern.frequency * 0.1),
          confidence: Math.min(1, pattern.frequency * 0.15),
          dreamCycleSource: cycle.cycleId,
          actionable: true,
        });
      }
    }

    // Anomaly-to-dead-path detection
    for (const anomaly of cycle.anomalies) {
      if (anomaly.severity >= 5 && anomaly.path) {
        insights.push({
          insightId: `dream_${insights.length + 1}`,
          type: anomaly.severity >= 8 ? 'refactor_opportunity' : 'dead_path',
          title: `Dream anomaly: ${anomaly.description.slice(0, 60)}`,
          description: anomaly.description,
          affectedPaths: anomaly.path ? [anomaly.path] : [],
          estimatedImpact: anomaly.severity / 10,
          confidence: 0.6,
          dreamCycleSource: cycle.cycleId,
          actionable: anomaly.severity >= 6,
        });
      }
    }

    // Optimization hints from dream replay
    for (const hint of cycle.optimizationHints) {
      insights.push({
        insightId: `dream_${insights.length + 1}`,
        type: 'optimization_template',
        title: hint.slice(0, 80),
        description: hint,
        affectedPaths: [],
        estimatedImpact: 0.5,
        confidence: 0.4,
        dreamCycleSource: cycle.cycleId,
        actionable: false,
      });
    }
  }

  // Deduplicate similar insights
  const dedupedInsights = deduplicateInsights(insights);
  const categories: Record<DreamInsight['type'], number> = {
    refactor_opportunity: 0, pattern_consolidation: 0, dead_path: 0, optimization_template: 0,
  };
  for (const i of dedupedInsights) categories[i.type]++;

  return {
    insights: dedupedInsights.sort((a, b) => b.estimatedImpact - a.estimatedImpact),
    totalDreamCycles: dreamCycles.length,
    actionableInsights: dedupedInsights.filter(i => i.actionable).length,
    highImpactCount: dedupedInsights.filter(i => i.estimatedImpact >= 0.7).length,
    categories,
    generatedAt: new Date().toISOString(),
  };
}

function deduplicateInsights(insights: DreamInsight[]): DreamInsight[] {
  const seen = new Set<string>();
  return insights.filter(i => {
    const key = `${i.type}::${i.title.toLowerCase().slice(0, 40)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
