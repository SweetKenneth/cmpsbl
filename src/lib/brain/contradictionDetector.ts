/**
 * CMPSBL® BRAIN — Contradiction Detection & Resolution
 * Identifies when new knowledge conflicts with existing crystals.
 *
 * Three detection strategies:
 * 1. Semantic opposition — negation/antonym patterns
 * 2. Numeric contradiction — conflicting quantities/measurements
 * 3. Temporal contradiction — outdated facts superseded by newer data
 *
 * Resolution strategies: supersede, merge, flag-for-review.
 */

import { tokenize, STOP_WORDS } from './shared';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface Contradiction {
  id: string;
  memoryA: string;         // content of first memory
  memoryB: string;         // content of second memory
  memoryAId: string;
  memoryBId: string;
  type: 'semantic' | 'numeric' | 'temporal';
  confidence: number;      // 0-1 how certain this is a contradiction
  explanation: string;
  detectedAt: number;
  resolved: boolean;
  resolution?: ContradictionResolution;
}

export interface ContradictionResolution {
  strategy: 'supersede' | 'merge' | 'coexist' | 'flag';
  winnerId?: string;
  mergedContent?: string;
  resolvedAt: number;
  reason: string;
}

export interface DetectionResult {
  contradictions: Contradiction[];
  checkedPairs: number;
  duration: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// DETECTION PATTERNS
// ═══════════════════════════════════════════════════════════════════════════════

/** Negation patterns that flip meaning */
const NEGATION_WORDS = new Set([
  'not', 'never', 'no', 'none', 'neither', 'nor', 'cannot', "can't",
  "won't", "don't", "doesn't", "didn't", "isn't", "aren't", "wasn't",
  "weren't", "shouldn't", "wouldn't", "couldn't", 'without', 'lack',
  'absence', 'impossible', 'unable', 'fail', 'failed', 'false',
]);

/** Antonym pairs that indicate opposition */
const ANTONYM_PAIRS: Array<[string, string]> = [
  ['increase', 'decrease'], ['up', 'down'], ['high', 'low'],
  ['fast', 'slow'], ['good', 'bad'], ['success', 'failure'],
  ['enable', 'disable'], ['active', 'inactive'], ['true', 'false'],
  ['allow', 'block'], ['accept', 'reject'], ['open', 'close'],
  ['start', 'stop'], ['create', 'destroy'], ['add', 'remove'],
  ['safe', 'unsafe'], ['secure', 'insecure'], ['valid', 'invalid'],
  ['optimal', 'suboptimal'], ['efficient', 'inefficient'],
];

const ANTONYM_MAP = new Map<string, string>();
for (const [a, b] of ANTONYM_PAIRS) {
  ANTONYM_MAP.set(a, b);
  ANTONYM_MAP.set(b, a);
}

/** Numeric extraction pattern */
const NUMBER_RE = /(\d+(?:\.\d+)?)\s*(%|ms|mb|gb|kb|s|hz|fps|rpm|days?|hours?|minutes?)?/gi;

// ═══════════════════════════════════════════════════════════════════════════════
// ENGINE
// ═══════════════════════════════════════════════════════════════════════════════

let contradictionId = 0;

class ContradictionEngine {
  private contradictions = new Map<string, Contradiction>();
  private maxHistory = 500;

  /**
   * Check a new memory against a set of existing memories for contradictions.
   */
  detect(
    newContent: string,
    newId: string,
    existingMemories: Array<{ id: string; content: string; createdAt?: string }>,
  ): DetectionResult {
    const start = Date.now();
    const found: Contradiction[] = [];
    const newTokens = tokenize(newContent).filter(t => !STOP_WORDS.has(t));
    const newTokenSet = new Set(newTokens);

    for (const existing of existingMemories) {
      const existTokens = tokenize(existing.content).filter(t => !STOP_WORDS.has(t));
      const existTokenSet = new Set(existTokens);

      // Only check memories with significant overlap (otherwise they're about different topics)
      const overlap = this.tokenOverlap(newTokenSet, existTokenSet);
      if (overlap < 0.2) continue;

      // Strategy 1: Semantic negation
      const semantic = this.detectSemanticContradiction(newContent, newTokens, existing.content, existTokens);
      if (semantic) {
        found.push(this.createContradiction(newContent, newId, existing.content, existing.id, 'semantic', semantic.confidence, semantic.explanation));
      }

      // Strategy 2: Numeric contradiction
      const numeric = this.detectNumericContradiction(newContent, existing.content, overlap);
      if (numeric) {
        found.push(this.createContradiction(newContent, newId, existing.content, existing.id, 'numeric', numeric.confidence, numeric.explanation));
      }

      // Strategy 3: Temporal supersession
      if (existing.createdAt) {
        const temporal = this.detectTemporalContradiction(newContent, existing.content, overlap);
        if (temporal) {
          found.push(this.createContradiction(newContent, newId, existing.content, existing.id, 'temporal', temporal.confidence, temporal.explanation));
        }
      }
    }

    // Store contradictions
    for (const c of found) this.contradictions.set(c.id, c);
    this.enforceCapacity();

    return {
      contradictions: found,
      checkedPairs: existingMemories.length,
      duration: Date.now() - start,
    };
  }

  private detectSemanticContradiction(
    textA: string, tokensA: string[],
    textB: string, tokensB: string[],
  ): { confidence: number; explanation: string } | null {
    const lowerA = textA.toLowerCase();
    const lowerB = textB.toLowerCase();

    // Check negation asymmetry: one has negation, other doesn't, in similar context
    let negCountA = 0, negCountB = 0;
    for (const word of lowerA.split(/\s+/)) if (NEGATION_WORDS.has(word)) negCountA++;
    for (const word of lowerB.split(/\s+/)) if (NEGATION_WORDS.has(word)) negCountB++;

    const negationAsymmetry = Math.abs(negCountA - negCountB);

    // Check antonym presence
    let antonymScore = 0;
    for (const tokenA of tokensA) {
      const antonym = ANTONYM_MAP.get(tokenA);
      if (antonym && tokensB.includes(antonym)) {
        antonymScore += 0.3;
      }
    }

    const confidence = Math.min(1, negationAsymmetry * 0.25 + antonymScore);
    if (confidence < 0.3) return null;

    return {
      confidence,
      explanation: antonymScore > 0
        ? `Antonym detected with negation asymmetry (${negationAsymmetry})`
        : `Negation asymmetry detected (${negationAsymmetry} difference)`,
    };
  }

  private detectNumericContradiction(
    textA: string, textB: string, overlap: number,
  ): { confidence: number; explanation: string } | null {
    if (overlap < 0.3) return null; // Must be about the same topic

    const numsA = [...textA.matchAll(NUMBER_RE)].map(m => ({ value: parseFloat(m[1]), unit: m[2] || '' }));
    const numsB = [...textB.matchAll(NUMBER_RE)].map(m => ({ value: parseFloat(m[1]), unit: m[2] || '' }));

    for (const nA of numsA) {
      for (const nB of numsB) {
        if (nA.unit !== nB.unit) continue;
        if (nA.value === nB.value) continue;

        // Significant numeric difference (>20% divergence)
        const ratio = Math.abs(nA.value - nB.value) / Math.max(nA.value, nB.value, 1);
        if (ratio > 0.2) {
          return {
            confidence: Math.min(1, overlap + ratio * 0.5),
            explanation: `Conflicting values: ${nA.value}${nA.unit} vs ${nB.value}${nB.unit} (${(ratio * 100).toFixed(0)}% divergence)`,
          };
        }
      }
    }

    return null;
  }

  private detectTemporalContradiction(
    newText: string, oldText: string, overlap: number,
  ): { confidence: number; explanation: string } | null {
    if (overlap < 0.4) return null;

    // High topic overlap + different assertions = likely supersession
    const temporalMarkers = ['now', 'updated', 'changed', 'previously', 'was', 'used to', 'no longer', 'replaced'];
    let markerCount = 0;
    const lower = newText.toLowerCase();
    for (const marker of temporalMarkers) {
      if (lower.includes(marker)) markerCount++;
    }

    if (markerCount >= 2) {
      return {
        confidence: Math.min(1, 0.3 + markerCount * 0.15),
        explanation: `Temporal supersession detected (${markerCount} temporal markers, ${(overlap * 100).toFixed(0)}% topic overlap)`,
      };
    }

    return null;
  }

  private tokenOverlap(a: Set<string>, b: Set<string>): number {
    if (a.size === 0 || b.size === 0) return 0;
    const [smaller, larger] = a.size <= b.size ? [a, b] : [b, a];
    let count = 0;
    for (const t of smaller) if (larger.has(t)) count++;
    return count / Math.min(a.size, b.size);
  }

  private createContradiction(
    contentA: string, idA: string,
    contentB: string, idB: string,
    type: Contradiction['type'],
    confidence: number,
    explanation: string,
  ): Contradiction {
    return {
      id: `contradiction-${++contradictionId}`,
      memoryA: contentA.slice(0, 200),
      memoryB: contentB.slice(0, 200),
      memoryAId: idA,
      memoryBId: idB,
      type,
      confidence,
      explanation,
      detectedAt: Date.now(),
      resolved: false,
    };
  }

  /**
   * Resolve a contradiction with a strategy.
   */
  resolve(contradictionId: string, strategy: ContradictionResolution['strategy'], reason: string): boolean {
    const c = this.contradictions.get(contradictionId);
    if (!c) return false;

    c.resolved = true;
    c.resolution = {
      strategy,
      resolvedAt: Date.now(),
      reason,
      winnerId: strategy === 'supersede' ? c.memoryAId : undefined,
    };

    return true;
  }

  /** Get unresolved contradictions */
  getUnresolved(): Contradiction[] {
    return [...this.contradictions.values()]
      .filter(c => !c.resolved)
      .sort((a, b) => b.confidence - a.confidence);
  }

  /** Get all contradictions */
  getAll(): Contradiction[] {
    return [...this.contradictions.values()].sort((a, b) => b.detectedAt - a.detectedAt);
  }

  getStats() {
    const all = [...this.contradictions.values()];
    return {
      total: all.length,
      unresolved: all.filter(c => !c.resolved).length,
      byType: {
        semantic: all.filter(c => c.type === 'semantic').length,
        numeric: all.filter(c => c.type === 'numeric').length,
        temporal: all.filter(c => c.type === 'temporal').length,
      },
    };
  }

  private enforceCapacity(): void {
    if (this.contradictions.size <= this.maxHistory) return;
    const sorted = [...this.contradictions.entries()]
      .filter(([, c]) => c.resolved)
      .sort((a, b) => a[1].detectedAt - b[1].detectedAt);
    const excess = this.contradictions.size - this.maxHistory;
    for (let i = 0; i < Math.min(excess, sorted.length); i++) {
      this.contradictions.delete(sorted[i][0]);
    }
  }

  clear(): void {
    this.contradictions.clear();
    contradictionId = 0;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SINGLETON
// ═══════════════════════════════════════════════════════════════════════════════

let _engine: ContradictionEngine | null = null;

export function getContradictionDetector(): ContradictionEngine {
  if (!_engine) _engine = new ContradictionEngine();
  return _engine;
}

export function resetContradictionDetector(): void {
  _engine = null;
}
