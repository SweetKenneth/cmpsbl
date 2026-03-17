/**
 * CMPSBL® Brain Learning Bridge (Ascension ↔ BRAIN)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Feeds structured learning signals from accepted primitives,
 * delta reports, and node performance into BRAIN.
 *
 * Learns from accepted primitives only (post quality gate).
 * Accumulates structured pattern intelligence, not raw events.
 *
 * Non-blocking. Telemetry must never interrupt execution.
 *
 * © CMPSBL® — All rights reserved.
 */

import { supabase } from '@/integrations/supabase/client';
import type {
  AscensionNode,
  ExtractionResult,
  DeltaReport,
  LearningEvent,
  LearningEventType,
  PatternFrequency,
  LearningInsights,
} from './types';

// Re-export types
export type { LearningEvent, PatternFrequency, LearningInsights };

// ═══════════════════════════════════════════════════════════════════════════════
// §1 — PATTERN MEMORY (in-memory accumulator)
// ═══════════════════════════════════════════════════════════════════════════════

const patternMemory = new Map<string, PatternFrequency>();
const languageStats = new Map<string, { totalQuality: number; count: number }>();
const categoryImpact = new Map<string, { totalImpact: number; count: number }>();
const nodeScores = new Map<string, { totalScore: number; count: number; name: string }>();

function trackAcceptedPrimitive(
  primitive: { category: string; language: string; extractionMethod: string; confidence: number; qualityScore: number },
): void {
  const key = `${primitive.category}:${primitive.extractionMethod}:${primitive.language}`;
  const existing = patternMemory.get(key) || {
    pattern: key,
    category: primitive.category,
    language: primitive.language,
    frequency: 0,
    avgConfidence: 0,
    avgQuality: 0,
    successRate: 1,
    chainImpact: 0,
  };

  existing.frequency += 1;
  existing.avgConfidence += (primitive.confidence - existing.avgConfidence) / existing.frequency;
  existing.avgQuality += (primitive.qualityScore - existing.avgQuality) / existing.frequency;
  patternMemory.set(key, existing);

  // Language stats
  const langStat = languageStats.get(primitive.language) || { totalQuality: 0, count: 0 };
  langStat.totalQuality += primitive.qualityScore;
  langStat.count += 1;
  languageStats.set(primitive.language, langStat);
}

function trackRejectedSignal(category: string, language: string): void {
  const key = `${category}:rejected:${language}`;
  const existing = patternMemory.get(key) || {
    pattern: key, category, language, frequency: 0,
    avgConfidence: 0, avgQuality: 0, successRate: 0, chainImpact: 0,
  };
  existing.frequency += 1;
  existing.successRate = 0;
  patternMemory.set(key, existing);
}

function trackDeltaImpact(category: string, impactScore: number): void {
  const stat = categoryImpact.get(category) || { totalImpact: 0, count: 0 };
  stat.totalImpact += impactScore;
  stat.count += 1;
  categoryImpact.set(category, stat);
}

function trackNodePerformance(nodeId: string, nodeName: string, cjpiScore: number): void {
  const stat = nodeScores.get(nodeId) || { totalScore: 0, count: 0, name: nodeName };
  stat.totalScore += cjpiScore;
  stat.count += 1;
  nodeScores.set(nodeId, stat);
}

// ═══════════════════════════════════════════════════════════════════════════════
// §2 — LEARNING EVENTS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Record extraction learning — learns from ACCEPTED primitives only.
 * Also records rejected primitive signals at lower weight.
 */
export async function recordExtractionLearning(
  node: AscensionNode,
  result: ExtractionResult
): Promise<void> {
  try {
    // Learn from accepted primitives (high weight)
    for (const p of result.quality.accepted) {
      trackAcceptedPrimitive(p);
    }

    // Learn from rejected primitives (signal only)
    for (const r of result.quality.rejected) {
      trackRejectedSignal(r.primitive.category, r.primitive.language);
    }

    await persistLearningEvent({
      type: 'primitive_accepted',
      nodeId: node.id,
      nodeName: node.name,
      weight: 1.0,
      correlationId: result.correlationId,
      data: {
        accepted_count: result.quality.summary.totalAccepted,
        rejected_count: result.quality.summary.totalRejected,
        avg_quality: result.quality.summary.avgQualityScore,
        avg_confidence: result.quality.summary.avgConfidence,
        top_categories: result.quality.summary.topCategories,
        language: node.language,
        duration_ms: result.durationMs,
      },
      timestamp: new Date().toISOString(),
    });
  } catch {
    // Non-blocking
  }
}

/**
 * Record chain participation learning with CJPI score.
 */
export async function recordChainLearning(
  node: AscensionNode,
  chainModules: string[],
  cjpiScore: number,
  primitivesExecuted: number
): Promise<void> {
  try {
    trackNodePerformance(node.id, node.name, cjpiScore);

    // Track category impact from chain participation
    if (node.extractionStats?.byCategory) {
      const dominantCategory = Object.entries(node.extractionStats.byCategory)
        .sort(([, a], [, b]) => b - a)[0]?.[0];
      if (dominantCategory) {
        trackDeltaImpact(dominantCategory, cjpiScore >= 68 ? 1 : -0.5);
      }
    }

    await persistLearningEvent({
      type: 'chain_participation',
      nodeId: node.id,
      nodeName: node.name,
      weight: cjpiScore >= 68 ? 2.0 : 0.5,
      correlationId: '',
      data: {
        chain_modules: chainModules,
        chain_length: chainModules.length,
        cjpi_score: cjpiScore,
        primitives_executed: primitivesExecuted,
        language: node.language,
        sector: node.surface?.sector,
      },
      timestamp: new Date().toISOString(),
    });
  } catch {
    // Non-blocking
  }
}

/**
 * Record delta measurement learning.
 */
export async function recordDeltaLearning(
  node: AscensionNode,
  delta: DeltaReport
): Promise<void> {
  try {
    const dominantCategory = Object.entries(node.extractionStats?.byCategory || {})
      .sort(([, a], [, b]) => b - a)[0]?.[0] || 'unknown';

    trackDeltaImpact(dominantCategory, delta.deltas.impactScore);

    await persistLearningEvent({
      type: 'delta_measured',
      nodeId: node.id,
      nodeName: node.name,
      weight: Math.abs(delta.deltas.impactScore) > 5 ? 2.0 : 1.0,
      correlationId: delta.id,
      data: {
        verdict: delta.deltas.verdict,
        impact_score: delta.deltas.impactScore,
        confidence_delta: delta.deltas.confidenceDelta,
        outputs_added: delta.deltas.outputKeysAdded.length,
        primitives_contributed: delta.deltas.primitivesContributed,
        language: node.language,
      },
      timestamp: new Date().toISOString(),
    });
  } catch {
    // Non-blocking
  }
}

/**
 * Record node lifecycle events.
 */
export async function recordLifecycleEvent(
  node: AscensionNode,
  eventType: 'node_promotion' | 'node_archival'
): Promise<void> {
  try {
    await persistLearningEvent({
      type: eventType,
      nodeId: node.id,
      nodeName: node.name,
      weight: eventType === 'node_promotion' ? 1.5 : 0.5,
      correlationId: '',
      data: {
        previous_status: node.status,
        mode: node.mode,
        total_runs: node.totalRuns,
        avg_cjpi: node.performance.avgCjpi,
        best_cjpi: node.performance.bestCjpi,
        primitives_count: node.primitives.length,
        language: node.language,
      },
      timestamp: new Date().toISOString(),
    });
  } catch {
    // Non-blocking
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// §3 — PERSISTENCE
// ═══════════════════════════════════════════════════════════════════════════════

async function persistLearningEvent(event: LearningEvent): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any)
    .from('audit_logs')
    .insert({
      action: `ascension.${event.type}`,
      entity_type: 'ascension_node',
      entity_id: event.nodeId,
      details: {
        node_name: event.nodeName,
        weight: event.weight,
        correlation_id: event.correlationId,
        ...event.data,
      },
    })
    .then(() => {})
    .catch(() => {});
}

// ═══════════════════════════════════════════════════════════════════════════════
// §4 — PATTERN INSIGHTS (structured intelligence)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Get accumulated pattern frequency data.
 */
export function getPatternInsights(): PatternFrequency[] {
  return Array.from(patternMemory.values())
    .sort((a, b) => b.frequency - a.frequency);
}

/**
 * Get structured learning insights for governor dashboard.
 */
export function getLearningInsights(): LearningInsights {
  // Top primitive families
  const families = Array.from(patternMemory.values())
    .filter(p => p.successRate > 0)
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 10)
    .map(p => ({ family: p.pattern, count: p.frequency, avgImpact: p.chainImpact }));

  // Strongest languages
  const languages = Array.from(languageStats.entries())
    .map(([language, stat]) => ({
      language,
      avgQuality: stat.count > 0 ? Math.round((stat.totalQuality / stat.count) * 1000) / 1000 : 0,
      count: stat.count,
    }))
    .sort((a, b) => b.avgQuality - a.avgQuality);

  // High-impact categories
  const categories = Array.from(categoryImpact.entries())
    .map(([category, stat]) => ({
      category,
      avgChainImpact: stat.count > 0 ? Math.round((stat.totalImpact / stat.count) * 100) / 100 : 0,
    }))
    .sort((a, b) => b.avgChainImpact - a.avgChainImpact);

  // Promotion candidates (top performing nodes)
  const candidates = Array.from(nodeScores.entries())
    .map(([nodeId, stat]) => ({
      nodeId,
      nodeName: stat.name,
      score: stat.count > 0 ? Math.round((stat.totalScore / stat.count) * 100) / 100 : 0,
    }))
    .filter(n => n.score >= 60)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  return { topPrimitiveFamilies: families, strongestLanguages: languages, highImpactCategories: categories, promotionCandidates: candidates };
}

/**
 * Get learning event history from audit_logs.
 */
export async function getLearningHistory(limit = 50): Promise<LearningEvent[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('audit_logs')
    .select('*')
    .like('action', 'ascension.%')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error || !data) return [];

  return (data as Array<Record<string, unknown>>).map(row => {
    const details = (row.details || {}) as Record<string, unknown>;
    return {
      type: String(row.action || '').replace('ascension.', '') as LearningEventType,
      nodeId: String(row.entity_id || ''),
      nodeName: (details.node_name as string) || '',
      data: details,
      weight: (details.weight as number) || 1,
      correlationId: (details.correlation_id as string) || '',
      timestamp: String(row.created_at || ''),
    };
  });
}
