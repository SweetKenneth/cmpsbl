/**
 * CMPSBL® Brain Learning Bridge (Ascension ↔ BRAIN)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Feeds extracted primitives and chain participation data into BRAIN
 * for long-term learning. Over time, BRAIN should:
 *   - Recognize code patterns faster
 *   - Generate better primitives
 *   - Improve CJPI scoring accuracy
 *
 * Non-blocking. Telemetry must never interrupt execution.
 *
 * © CMPSBL® — All rights reserved.
 */

import { supabase } from '@/integrations/supabase/client';
import type { ExtractedPrimitive, ExtractionResult } from './primitive-extractor';
import type { AscensionNode } from './node-registry';

// ═══════════════════════════════════════════════════════════════════════════════
// §1 — TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface LearningEvent {
  type: 'primitive_extraction' | 'chain_participation' | 'node_promotion' | 'node_archival' | 'pattern_recognition';
  nodeId: string;
  nodeName: string;
  data: Record<string, unknown>;
  timestamp: string;
}

export interface PatternFrequency {
  pattern: string;
  category: string;
  frequency: number;
  avgConfidence: number;
  successRate: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// §2 — IN-MEMORY PATTERN TRACKER
// ═══════════════════════════════════════════════════════════════════════════════

const patternMemory = new Map<string, PatternFrequency>();

function trackPattern(primitive: ExtractedPrimitive, success: boolean): void {
  const key = `${primitive.category}:${primitive.extractionMethod}`;
  const existing = patternMemory.get(key) || {
    pattern: key,
    category: primitive.category,
    frequency: 0,
    avgConfidence: 0,
    successRate: 0,
  };

  existing.frequency += 1;
  existing.avgConfidence += (primitive.confidence - existing.avgConfidence) / existing.frequency;
  const successDelta = success ? 1 : 0;
  existing.successRate += (successDelta - existing.successRate) / existing.frequency;

  patternMemory.set(key, existing);
}

// ═══════════════════════════════════════════════════════════════════════════════
// §3 — LEARNING EVENTS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Record primitive extraction results for BRAIN learning.
 * Non-blocking — failures are silently logged.
 */
export async function recordExtractionLearning(
  node: AscensionNode,
  result: ExtractionResult
): Promise<void> {
  try {
    // Track each primitive pattern
    for (const p of result.primitives) {
      trackPattern(p, true);
    }

    const event: LearningEvent = {
      type: 'primitive_extraction',
      nodeId: node.id,
      nodeName: node.name,
      data: {
        totalPrimitives: result.primitives.length,
        byCategory: result.stats.byCategory,
        byMethod: result.stats.byMethod,
        avgConfidence: result.stats.avgConfidence,
        avgComplexity: result.stats.avgComplexity,
        languages: result.stats.languagesDetected,
        linesAnalyzed: result.stats.totalLinesAnalyzed,
        durationMs: result.durationMs,
        warningCount: result.warnings.length,
      },
      timestamp: new Date().toISOString(),
    };

    await persistLearningEvent(event);
  } catch {
    // Non-blocking — swallow errors
  }
}

/**
 * Record chain participation for BRAIN learning.
 */
export async function recordChainLearning(
  node: AscensionNode,
  chainModules: string[],
  cjpiScore: number,
  primitivesExecuted: number
): Promise<void> {
  try {
    const event: LearningEvent = {
      type: 'chain_participation',
      nodeId: node.id,
      nodeName: node.name,
      data: {
        chainModules,
        chainLength: chainModules.length,
        cjpiScore,
        primitivesExecuted,
        totalPrimitives: node.primitives.length,
        dominantCategory: node.extractionStats?.byCategory
          ? Object.entries(node.extractionStats.byCategory)
              .sort(([, a], [, b]) => (b as number) - (a as number))[0]?.[0]
          : 'unknown',
        nodeLanguage: node.language,
        nodeSector: node.surface?.sector,
      },
      timestamp: new Date().toISOString(),
    };

    await persistLearningEvent(event);
  } catch {
    // Non-blocking
  }
}

/**
 * Record node lifecycle events (promotion, archival, etc.)
 */
export async function recordLifecycleEvent(
  node: AscensionNode,
  eventType: 'node_promotion' | 'node_archival'
): Promise<void> {
  try {
    const event: LearningEvent = {
      type: eventType,
      nodeId: node.id,
      nodeName: node.name,
      data: {
        previousStatus: node.status,
        mode: node.mode,
        totalRuns: node.totalRuns,
        avgCjpi: node.performance.avgCjpi,
        bestCjpi: node.performance.bestCjpi,
        primitivesCount: node.primitives.length,
        language: node.language,
      },
      timestamp: new Date().toISOString(),
    };

    await persistLearningEvent(event);
  } catch {
    // Non-blocking
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// §4 — PERSISTENCE (audit_logs)
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
        ...event.data,
      },
    })
    .then(() => {})
    .catch(() => {});
}

// ═══════════════════════════════════════════════════════════════════════════════
// §5 — PATTERN INSIGHTS (for Governor dashboard)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Get accumulated pattern frequency data from in-memory tracker.
 * Used by Governor dashboard for extraction quality insights.
 */
export function getPatternInsights(): PatternFrequency[] {
  return Array.from(patternMemory.values())
    .sort((a, b) => b.frequency - a.frequency);
}

/**
 * Get learning event history from audit_logs
 */
export async function getLearningHistory(
  limit = 50
): Promise<LearningEvent[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('audit_logs')
    .select('*')
    .like('action', 'ascension.%')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error || !data) return [];

  return (data as Array<Record<string, unknown>>).map(row => ({
    type: String(row.action || '').replace('ascension.', '') as LearningEvent['type'],
    nodeId: String(row.entity_id || ''),
    nodeName: ((row.details as Record<string, unknown>)?.node_name as string) || '',
    data: (row.details || {}) as Record<string, unknown>,
    timestamp: String(row.created_at || ''),
  }));
}
