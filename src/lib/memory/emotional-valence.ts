/**
 * CMPSBL® MEMORY — Emotional Valence Tagging
 * Tags memories with emotional weight for preferential recall.
 *
 * High-emotion events (failures, breakthroughs, conflicts) are recalled
 * more readily, mirroring biological flashbulb memory.
 *
 * Valence dimensions:
 * - Arousal: intensity of the emotional response (0-1)
 * - Polarity: positive (+1) to negative (-1)
 * - Significance: personal/system importance (0-1)
 */

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface EmotionalValence {
  arousal: number;        // 0-1 intensity
  polarity: number;       // -1 to +1
  significance: number;   // 0-1 importance
  composite: number;      // derived overall emotional weight
  tags: EmotionTag[];
  detectedAt: number;
}

export type EmotionTag =
  | 'breakthrough' | 'failure' | 'conflict' | 'resolution'
  | 'surprise' | 'frustration' | 'satisfaction' | 'urgency'
  | 'curiosity' | 'confusion' | 'confidence' | 'neutral';

export interface ValenceStats {
  totalTagged: number;
  avgArousal: number;
  avgPolarity: number;
  dominantEmotion: EmotionTag;
  flashbulbCount: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// DETECTION PATTERNS
// ═══════════════════════════════════════════════════════════════════════════════

const EMOTION_LEXICON: Record<EmotionTag, { words: string[]; arousal: number; polarity: number }> = {
  breakthrough:  { words: ['breakthrough', 'discovered', 'eureka', 'solved', 'innovation', 'novel', 'first', 'unprecedented'], arousal: 0.9, polarity: 0.9 },
  failure:       { words: ['failed', 'error', 'crash', 'broken', 'bug', 'regression', 'downtime', 'outage', 'incident'], arousal: 0.8, polarity: -0.7 },
  conflict:      { words: ['conflict', 'contradiction', 'disagreement', 'incompatible', 'mismatch', 'collision'], arousal: 0.7, polarity: -0.5 },
  resolution:    { words: ['resolved', 'fixed', 'patched', 'restored', 'recovered', 'healed', 'repaired'], arousal: 0.6, polarity: 0.8 },
  surprise:      { words: ['unexpected', 'surprising', 'anomaly', 'unusual', 'rare', 'outlier', 'spike'], arousal: 0.8, polarity: 0.1 },
  frustration:   { words: ['stuck', 'blocked', 'impossible', 'workaround', 'hack', 'retry', 'timeout', 'slow'], arousal: 0.6, polarity: -0.6 },
  satisfaction:  { words: ['optimized', 'improved', 'faster', 'efficient', 'clean', 'elegant', 'perfect', 'complete'], arousal: 0.5, polarity: 0.7 },
  urgency:       { words: ['critical', 'urgent', 'immediate', 'emergency', 'asap', 'deadline', 'blocker', 'severe'], arousal: 0.9, polarity: -0.3 },
  curiosity:     { words: ['interesting', 'explore', 'investigate', 'hypothesis', 'experiment', 'wonder', 'pattern'], arousal: 0.5, polarity: 0.4 },
  confusion:     { words: ['unclear', 'ambiguous', 'confusing', 'inconsistent', 'unexpected', 'strange', 'weird'], arousal: 0.4, polarity: -0.3 },
  confidence:    { words: ['confirmed', 'validated', 'proven', 'stable', 'reliable', 'consistent', 'verified'], arousal: 0.3, polarity: 0.6 },
  neutral:       { words: [], arousal: 0.1, polarity: 0 },
};

/** Flashbulb threshold: memories above this composite score get permanent retention boost */
const FLASHBULB_THRESHOLD = 0.75;

// ═══════════════════════════════════════════════════════════════════════════════
// ENGINE
// ═══════════════════════════════════════════════════════════════════════════════

class ValenceEngine {
  private valenceMap = new Map<string, EmotionalValence>();
  private maxEntries = 5000;

  /**
   * Analyze content and assign emotional valence.
   */
  analyze(memoryId: string, content: string): EmotionalValence {
    const lower = content.toLowerCase();
    const words = lower.split(/\s+/);
    const wordSet = new Set(words);

    let totalArousal = 0;
    let totalPolarity = 0;
    let matchCount = 0;
    const detectedTags: EmotionTag[] = [];

    for (const [tag, lexicon] of Object.entries(EMOTION_LEXICON) as Array<[EmotionTag, typeof EMOTION_LEXICON[EmotionTag]]>) {
      if (tag === 'neutral') continue;
      let tagMatches = 0;
      for (const word of lexicon.words) {
        if (wordSet.has(word) || lower.includes(word)) tagMatches++;
      }
      if (tagMatches > 0) {
        const weight = Math.min(1, tagMatches / 3);
        totalArousal += lexicon.arousal * weight;
        totalPolarity += lexicon.polarity * weight;
        matchCount++;
        if (tagMatches >= 2) detectedTags.push(tag);
      }
    }

    if (detectedTags.length === 0) detectedTags.push('neutral');

    const arousal = matchCount > 0 ? Math.min(1, totalArousal / matchCount) : 0.1;
    const polarity = matchCount > 0 ? Math.max(-1, Math.min(1, totalPolarity / matchCount)) : 0;
    const significance = Math.min(1, arousal * 0.6 + Math.abs(polarity) * 0.4);
    const composite = Math.min(1, arousal * 0.4 + Math.abs(polarity) * 0.3 + significance * 0.3);

    const valence: EmotionalValence = {
      arousal,
      polarity,
      significance,
      composite,
      tags: detectedTags,
      detectedAt: Date.now(),
    };

    this.valenceMap.set(memoryId, valence);
    this.enforceCapacity();
    return valence;
  }

  /** Check if a memory qualifies as a flashbulb memory */
  isFlashbulb(memoryId: string): boolean {
    const v = this.valenceMap.get(memoryId);
    return !!v && v.composite >= FLASHBULB_THRESHOLD;
  }

  /** Get recall boost factor based on emotional weight (1.0 = no boost) */
  getRecallBoost(memoryId: string): number {
    const v = this.valenceMap.get(memoryId);
    if (!v) return 1.0;
    // Flashbulb memories get 1.5x boost, others proportional
    return 1.0 + v.composite * 0.5;
  }

  /** Get valence for a memory */
  getValence(memoryId: string): EmotionalValence | undefined {
    return this.valenceMap.get(memoryId);
  }

  /** Get memories by emotion tag */
  getByEmotion(tag: EmotionTag): string[] {
    const result: string[] = [];
    for (const [id, v] of this.valenceMap) {
      if (v.tags.includes(tag)) result.push(id);
    }
    return result;
  }

  /** Get stats */
  getStats(): ValenceStats {
    const all = [...this.valenceMap.values()];
    if (all.length === 0) {
      return { totalTagged: 0, avgArousal: 0, avgPolarity: 0, dominantEmotion: 'neutral', flashbulbCount: 0 };
    }

    const tagCounts = new Map<EmotionTag, number>();
    let totalArousal = 0, totalPolarity = 0, flashbulbs = 0;

    for (const v of all) {
      totalArousal += v.arousal;
      totalPolarity += v.polarity;
      if (v.composite >= FLASHBULB_THRESHOLD) flashbulbs++;
      for (const tag of v.tags) tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
    }

    let dominant: EmotionTag = 'neutral';
    let maxCount = 0;
    for (const [tag, count] of tagCounts) {
      if (count > maxCount) { dominant = tag; maxCount = count; }
    }

    return {
      totalTagged: all.length,
      avgArousal: totalArousal / all.length,
      avgPolarity: totalPolarity / all.length,
      dominantEmotion: dominant,
      flashbulbCount: flashbulbs,
    };
  }

  private enforceCapacity(): void {
    if (this.valenceMap.size <= this.maxEntries) return;
    // Remove oldest neutral entries first
    const entries = [...this.valenceMap.entries()]
      .filter(([, v]) => v.tags.includes('neutral'))
      .sort((a, b) => a[1].detectedAt - b[1].detectedAt);
    const excess = this.valenceMap.size - this.maxEntries;
    for (let i = 0; i < Math.min(excess, entries.length); i++) {
      this.valenceMap.delete(entries[i][0]);
    }
  }

  clear(): void { this.valenceMap.clear(); }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SINGLETON
// ═══════════════════════════════════════════════════════════════════════════════

let _engine: ValenceEngine | null = null;

export function getValenceEngine(): ValenceEngine {
  if (!_engine) _engine = new ValenceEngine();
  return _engine;
}

export function resetValenceEngine(): void {
  _engine = null;
}
