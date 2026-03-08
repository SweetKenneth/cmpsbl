/**
 * DREAM Insight Extraction Engine
 * Knowledge Synthesis & Recommendation Generation
 * 
 * Extracts actionable insights from dream cycles and synthesizes
 * cross-domain knowledge.
 */

import { supabase } from '@/integrations/supabase/client';

// Local DreamPattern interface for insight extraction
interface DreamPatternInput {
  id: string;
  name: string;
  type: 'recurring' | 'emerging' | 'declining';
  modules: string[];
  frequency?: number;
  confidence: number;
  metadata?: Record<string, unknown>;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface DreamInsight {
  id: string;
  type: 'optimization' | 'anomaly' | 'trend' | 'correlation' | 'prediction';
  title: string;
  description: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  evidence: InsightEvidence[];
  recommendations: Recommendation[];
  status: 'pending' | 'acknowledged' | 'applied' | 'dismissed';
  createdAt: string;
  expiresAt?: string;
}

export interface InsightEvidence {
  source: string;
  type: 'metric' | 'pattern' | 'event' | 'memory';
  data: Record<string, unknown>;
  weight: number;
}

export interface Recommendation {
  id: string;
  action: string;
  rationale: string;
  estimatedImpact: string;
  effort: 'low' | 'medium' | 'high';
  automated: boolean;
  dependencies?: string[];
}

export interface InsightSynthesis {
  dreamCycleId: string;
  insightsGenerated: number;
  topInsights: DreamInsight[];
  synthesisScore: number;
  processingTime: number;
}

export interface KnowledgeFragment {
  id: string;
  domain: string;
  content: string;
  connections: string[];
  strength: number;
  lastReinforced: string;
}

// In-memory insight store (capped to prevent unbounded growth)
const insightStore = new Map<string, DreamInsight>();
const MAX_INSIGHT_STORE = 500;
const knowledgeGraph = new Map<string, KnowledgeFragment>();
const MAX_KNOWLEDGE_GRAPH = 500;

// ═══════════════════════════════════════════════════════════════════════════════
// INSIGHT EXTRACTION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Extract insights from dream cycle patterns
 */
export async function extractInsights(
  patterns: DreamPatternInput[],
  dreamCycleId: string
): Promise<InsightSynthesis> {
  const startTime = Date.now();
  const insights: DreamInsight[] = [];

  // Extract optimization insights
  const optimizations = extractOptimizationInsights(patterns);
  insights.push(...optimizations);

  // Extract anomaly insights
  const anomalies = extractAnomalyInsights(patterns);
  insights.push(...anomalies);

  // Extract trend insights
  const trends = extractTrendInsights(patterns);
  insights.push(...trends);

  // Extract correlation insights
  const correlations = extractCorrelationInsights(patterns);
  insights.push(...correlations);

  // Store insights (with cap enforcement)
  for (const insight of insights) {
    if (insightStore.size >= MAX_INSIGHT_STORE) {
      const oldest = insightStore.keys().next().value;
      if (oldest) insightStore.delete(oldest);
    }
    insightStore.set(insight.id, insight);
  }

  // Calculate synthesis score based on quality and coverage
  const synthesisScore = calculateSynthesisScore(insights);

  // Log synthesis event (fire-and-forget)
  supabase.from('brain_events').insert({
    module: 'dream',
    event_type: 'insights.synthesized',
    data: {
      dreamCycleId,
      insightCount: insights.length,
      synthesisScore,
      types: insights.map(i => i.type),
    } as unknown as Record<string, never>,
    outcome: 'success',
  }).then(({ error }) => { if (error) console.error('Failed to log synthesis event:', error); });

  return {
    dreamCycleId,
    insightsGenerated: insights.length,
    topInsights: insights.slice(0, 10),
    synthesisScore,
    processingTime: Date.now() - startTime,
  };
}

/**
 * Extract optimization-related insights
 */
function extractOptimizationInsights(patterns: DreamPatternInput[]): DreamInsight[] {
  const insights: DreamInsight[] = [];

  // Look for performance patterns
  const performancePatterns = patterns.filter(p => 
    p.type === 'recurring' && p.metadata?.domain === 'performance'
  );

  for (const pattern of performancePatterns) {
    if ((pattern.frequency || 0) >= 3) {
      insights.push({
        id: `insight-opt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        type: 'optimization',
        title: `Performance pattern detected: ${pattern.name}`,
        description: `Recurring performance pattern observed ${pattern.frequency} times across ${pattern.modules.join(', ')}`,
        confidence: pattern.confidence,
        impact: pattern.confidence > 0.8 ? 'high' : 'medium',
        category: 'performance',
        evidence: [{
          source: 'pattern_recognition',
          type: 'pattern',
          data: { patternId: pattern.id, frequency: pattern.frequency },
          weight: 0.8,
        }],
        recommendations: [{
          id: `rec-${Date.now()}`,
          action: `Optimize ${pattern.modules[0]} based on pattern`,
          rationale: 'High-frequency pattern suggests optimization opportunity',
          estimatedImpact: 'Improved latency and resource usage',
          effort: 'medium',
          automated: false,
        }],
        status: 'pending',
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      });
    }
  }

  return insights;
}

/**
 * Extract anomaly-related insights
 */
function extractAnomalyInsights(patterns: DreamPatternInput[]): DreamInsight[] {
  const insights: DreamInsight[] = [];

  // Look for anomalous patterns
  const anomalyPatterns = patterns.filter(p => 
    p.type === 'emerging' || (p.confidence < 0.5 && (p.frequency || 0) > 1)
  );

  for (const pattern of anomalyPatterns) {
    insights.push({
      id: `insight-anom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type: 'anomaly',
      title: `Anomalous pattern: ${pattern.name}`,
      description: `Unusual pattern detected with low confidence (${(pattern.confidence * 100).toFixed(1)}%)`,
      confidence: 0.6,
      impact: 'medium',
      category: 'anomaly',
      evidence: [{
        source: 'pattern_recognition',
        type: 'pattern',
        data: { patternId: pattern.id, confidence: pattern.confidence },
        weight: 0.6,
      }],
      recommendations: [{
        id: `rec-${Date.now()}`,
        action: 'Investigate anomalous behavior',
        rationale: 'Low-confidence patterns may indicate system issues',
        estimatedImpact: 'Early detection of potential problems',
        effort: 'low',
        automated: false,
      }],
      status: 'pending',
      createdAt: new Date().toISOString(),
    });
  }

  return insights;
}

/**
 * Extract trend-related insights
 */
function extractTrendInsights(patterns: DreamPatternInput[]): DreamInsight[] {
  const insights: DreamInsight[] = [];

  // Group patterns by module and look for trends
  const moduleGroups = new Map<string, DreamPatternInput[]>();
  
  for (const pattern of patterns) {
    for (const module of pattern.modules) {
      if (!moduleGroups.has(module)) {
        moduleGroups.set(module, []);
      }
      moduleGroups.get(module)!.push(pattern);
    }
  }

  // Find modules with increasing pattern frequency
  for (const [module, modulePatterns] of moduleGroups) {
    if (modulePatterns.length >= 3) {
      const avgFrequency = modulePatterns.reduce((sum, p) => sum + (p.frequency || 0), 0) / modulePatterns.length;
      
      if (avgFrequency > 2) {
        insights.push({
          id: `insight-trend-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          type: 'trend',
          title: `Increasing activity in ${module} module`,
          description: `${modulePatterns.length} patterns detected with average frequency of ${avgFrequency.toFixed(1)}`,
          confidence: 0.7,
          impact: 'medium',
          category: 'usage',
          evidence: [{
            source: 'trend_analysis',
            type: 'pattern',
            data: { module, patternCount: modulePatterns.length, avgFrequency },
            weight: 0.7,
          }],
          recommendations: [{
            id: `rec-${Date.now()}`,
            action: `Review ${module} module capacity`,
            rationale: 'Increasing activity may require resource adjustment',
            estimatedImpact: 'Proactive capacity management',
            effort: 'low',
            automated: true,
          }],
          status: 'pending',
          createdAt: new Date().toISOString(),
        });
      }
    }
  }

  return insights;
}

/**
 * Extract correlation-related insights
 */
function extractCorrelationInsights(patterns: DreamPatternInput[]): DreamInsight[] {
  const insights: DreamInsight[] = [];

  // Look for patterns that share multiple modules (cross-module correlation)
  const crossModulePatterns = patterns.filter(p => p.modules.length >= 2);

  if (crossModulePatterns.length >= 2) {
    // Group by module pairs
    const pairCounts = new Map<string, number>();
    
    for (const pattern of crossModulePatterns) {
      for (let i = 0; i < pattern.modules.length - 1; i++) {
        for (let j = i + 1; j < pattern.modules.length; j++) {
          const pair = [pattern.modules[i], pattern.modules[j]].sort().join(':');
          pairCounts.set(pair, (pairCounts.get(pair) || 0) + 1);
        }
      }
    }

    // Find strong correlations
    for (const [pair, count] of pairCounts) {
      if (count >= 2) {
        const [module1, module2] = pair.split(':');
        
        insights.push({
          id: `insight-corr-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          type: 'correlation',
          title: `Strong correlation: ${module1} ↔ ${module2}`,
          description: `${count} patterns show correlation between these modules`,
          confidence: Math.min(0.9, 0.5 + count * 0.1),
          impact: 'medium',
          category: 'architecture',
          evidence: [{
            source: 'correlation_analysis',
            type: 'pattern',
            data: { module1, module2, correlationCount: count },
            weight: 0.75,
          }],
          recommendations: [{
            id: `rec-${Date.now()}`,
            action: 'Consider co-locating related functionality',
            rationale: 'Correlated modules may benefit from tighter integration',
            estimatedImpact: 'Reduced latency and improved coherence',
            effort: 'high',
            automated: false,
          }],
          status: 'pending',
          createdAt: new Date().toISOString(),
        });
      }
    }
  }

  return insights;
}

// ═══════════════════════════════════════════════════════════════════════════════
// KNOWLEDGE SYNTHESIS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Synthesize knowledge from insights
 */
export function synthesizeKnowledge(insights: DreamInsight[]): KnowledgeFragment[] {
  const fragments: KnowledgeFragment[] = [];

  for (const insight of insights) {
    if (insight.confidence >= 0.7 && insight.status !== 'dismissed') {
      const fragment: KnowledgeFragment = {
        id: `kf-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        domain: insight.category,
        content: `${insight.title}: ${insight.description}`,
        connections: insight.evidence.map(e => e.source),
        strength: insight.confidence,
        lastReinforced: new Date().toISOString(),
      };

      fragments.push(fragment);
      if (knowledgeGraph.size >= MAX_KNOWLEDGE_GRAPH) {
        const oldest = knowledgeGraph.keys().next().value;
        if (oldest) knowledgeGraph.delete(oldest);
      }
      knowledgeGraph.set(fragment.id, fragment);
    }
  }

  return fragments;
}

/**
 * Query knowledge graph
 */
export function queryKnowledge(query: {
  domain?: string;
  minStrength?: number;
  limit?: number;
}): KnowledgeFragment[] {
  let results = Array.from(knowledgeGraph.values());

  if (query.domain) {
    results = results.filter(f => f.domain === query.domain);
  }
  if (query.minStrength !== undefined) {
    results = results.filter(f => f.strength >= query.minStrength!);
  }

  results.sort((a, b) => b.strength - a.strength);

  return results.slice(0, query.limit ?? 50);
}

/**
 * Reinforce knowledge fragment
 */
export function reinforceKnowledge(fragmentId: string, boost: number = 0.1): boolean {
  const fragment = knowledgeGraph.get(fragmentId);
  if (!fragment) return false;

  fragment.strength = Math.min(1, fragment.strength + boost);
  fragment.lastReinforced = new Date().toISOString();
  knowledgeGraph.set(fragmentId, fragment);

  return true;
}

// ═══════════════════════════════════════════════════════════════════════════════
// INSIGHT MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Get insight by ID
 */
export function getInsight(id: string): DreamInsight | undefined {
  return insightStore.get(id);
}

/**
 * List insights with filtering
 */
export function listInsights(filter?: {
  type?: DreamInsight['type'];
  status?: DreamInsight['status'];
  minConfidence?: number;
  limit?: number;
}): DreamInsight[] {
  let results = Array.from(insightStore.values());

  if (filter?.type) {
    results = results.filter(i => i.type === filter.type);
  }
  if (filter?.status) {
    results = results.filter(i => i.status === filter.status);
  }
  if (filter?.minConfidence) {
    results = results.filter(i => i.confidence >= filter.minConfidence);
  }

  results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return results.slice(0, filter?.limit ?? 100);
}

/**
 * Acknowledge an insight
 */
export function acknowledgeInsight(id: string): boolean {
  const insight = insightStore.get(id);
  if (!insight) return false;

  insight.status = 'acknowledged';
  insightStore.set(id, insight);
  return true;
}

/**
 * Dismiss an insight
 */
export function dismissInsight(id: string, reason?: string): boolean {
  const insight = insightStore.get(id);
  if (!insight) return false;

  insight.status = 'dismissed';
  insightStore.set(id, insight);
  return true;
}

/**
 * Apply an insight (mark as acted upon)
 */
export function applyInsight(id: string): boolean {
  const insight = insightStore.get(id);
  if (!insight) return false;

  insight.status = 'applied';
  insightStore.set(id, insight);
  
  // Reinforce related knowledge
  for (const evidence of insight.evidence) {
    const related = Array.from(knowledgeGraph.values())
      .find(f => f.connections.includes(evidence.source));
    if (related) {
      reinforceKnowledge(related.id, 0.15);
    }
  }

  return true;
}

/**
 * Get insight statistics
 */
export function getInsightStats(): {
  total: number;
  byType: Record<string, number>;
  byStatus: Record<string, number>;
  avgConfidence: number;
  pendingCount: number;
} {
  const insights = Array.from(insightStore.values());
  
  const byType: Record<string, number> = {};
  const byStatus: Record<string, number> = {};
  let totalConfidence = 0;
  let pendingCount = 0;

  for (const insight of insights) {
    byType[insight.type] = (byType[insight.type] || 0) + 1;
    byStatus[insight.status] = (byStatus[insight.status] || 0) + 1;
    totalConfidence += insight.confidence;
    if (insight.status === 'pending') pendingCount++;
  }

  return {
    total: insights.length,
    byType,
    byStatus,
    avgConfidence: insights.length > 0 ? totalConfidence / insights.length : 0,
    pendingCount,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Calculate synthesis score
 */
function calculateSynthesisScore(insights: DreamInsight[]): number {
  if (insights.length === 0) return 0;

  const typeBonus = new Set(insights.map(i => i.type)).size * 0.1;
  const avgConfidence = insights.reduce((sum, i) => sum + i.confidence, 0) / insights.length;
  const highImpactRatio = insights.filter(i => i.impact === 'high' || i.impact === 'critical').length / insights.length;

  return Math.min(1, avgConfidence * 0.5 + typeBonus + highImpactRatio * 0.2);
}
