/**
 * CMPSBL® Feedback Loop Engine
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * The flywheel: every confirmed scan match extracts surrounding context
 * (variable naming, import aliases, adjacent functions, comment patterns)
 * and feeds them back as weighted search terms for future scans.
 *
 * Confirmed matches grow the glossary from evidence, not assumption.
 *
 * © CMPSBL® — All rights reserved.
 */

// ═══════════════════════════════════════════════════════════════════════════════
// §1 — TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface LearnedSignal {
  /** The signal term itself */
  term: string;
  /** Which primitive this signal was confirmed for */
  primitive: string;
  /** Which archetype confirmed it */
  archetypeId: string;
  /** How many times this signal has been confirmed across scans */
  confirmations: number;
  /** Confidence weight (0–1), grows with confirmations */
  weight: number;
  /** First seen timestamp */
  firstSeen: number;
  /** Last confirmed timestamp */
  lastConfirmed: number;
}

export interface FeedbackExtraction {
  /** Variable/function names found near the match site */
  identifiers: string[];
  /** Import/require paths found in the file */
  imports: string[];
  /** Comment fragments near the match */
  commentFragments: string[];
  /** Which primitive matched */
  primitive: string;
  /** Which archetype triggered */
  archetypeId: string;
}

export interface FeedbackStats {
  totalSignals: number;
  totalConfirmations: number;
  uniquePrimitives: number;
  topSignals: Array<{ term: string; primitive: string; confirmations: number }>;
}

// ═══════════════════════════════════════════════════════════════════════════════
// §2 — SIGNAL STORE (in-memory, bounded)
// ═══════════════════════════════════════════════════════════════════════════════

const MAX_LEARNED_SIGNALS = 2000;
const _learned = new Map<string, LearnedSignal>();

/** Composite key for dedup */
function signalKey(term: string, primitive: string): string {
  return `${primitive}::${term}`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// §3 — CONTEXT EXTRACTION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Extract contextual signals from code around a confirmed match.
 * Pulls identifiers, imports, and nearby comment fragments that
 * can serve as new search terms for future scans.
 */
export function extractContext(
  codeContent: string,
  primitive: string,
  archetypeId: string,
  matchTerms: string[],
): FeedbackExtraction {
  const lower = codeContent.toLowerCase();

  // Find identifiers near match sites (within 200 chars)
  const identifiers = new Set<string>();
  const imports = new Set<string>();
  const commentFragments = new Set<string>();

  for (const term of matchTerms) {
    const idx = lower.indexOf(term.toLowerCase());
    if (idx === -1) continue;

    // Extract surrounding context window (400 chars centered on match)
    const start = Math.max(0, idx - 200);
    const end = Math.min(codeContent.length, idx + term.length + 200);
    const window = codeContent.slice(start, end);

    // Pull identifiers (camelCase, snake_case, PascalCase — 4+ chars to filter noise)
    const idMatches = window.match(/\b[a-zA-Z_][a-zA-Z0-9_]{3,}\b/g);
    if (idMatches) {
      for (const id of idMatches) {
        // Skip common noise words
        if (!NOISE_WORDS.has(id.toLowerCase())) {
          identifiers.add(id.toLowerCase());
        }
      }
    }

    // Pull import paths
    const importMatches = window.match(
      /(?:import|from|require)\s*\(?['"]([^'"]+)['"]\)?/g
    );
    if (importMatches) {
      for (const imp of importMatches) {
        const path = imp.replace(/.*['"]([^'"]+)['"].*/, '$1');
        imports.add(path);
      }
    }

    // Pull comment fragments
    const commentMatches = window.match(
      /(?:\/\/|#)\s*(.{10,80})/g
    );
    if (commentMatches) {
      for (const c of commentMatches) {
        const clean = c.replace(/^(?:\/\/|#)\s*/, '').trim().toLowerCase();
        if (clean.length >= 10) commentFragments.add(clean);
      }
    }
  }

  return {
    identifiers: [...identifiers].slice(0, 30),
    imports: [...imports].slice(0, 15),
    commentFragments: [...commentFragments].slice(0, 10),
    primitive,
    archetypeId,
  };
}

/** Common words that don't carry signal value */
const NOISE_WORDS = new Set([
  'function', 'return', 'const', 'let', 'var', 'this', 'self', 'true',
  'false', 'null', 'undefined', 'none', 'class', 'interface', 'type',
  'export', 'import', 'from', 'require', 'module', 'default', 'async',
  'await', 'void', 'string', 'number', 'boolean', 'object', 'array',
  'else', 'elif', 'then', 'case', 'switch', 'break', 'continue',
  'while', 'each', 'map', 'filter', 'reduce', 'push', 'length',
  'value', 'data', 'result', 'error', 'message', 'name', 'index',
  'item', 'list', 'args', 'kwargs', 'params', 'options', 'config',
]);

// ═══════════════════════════════════════════════════════════════════════════════
// §4 — LEARNING ENGINE
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Record a confirmed match — extracts context and grows the glossary.
 * Call this after a scan confirms a primitive match with HIGH or MEDIUM band.
 */
export function recordConfirmedMatch(
  extraction: FeedbackExtraction,
): LearnedSignal[] {
  const now = Date.now();
  const added: LearnedSignal[] = [];

  // Learn from identifiers (strongest signal — these are actual code patterns)
  for (const id of extraction.identifiers) {
    const key = signalKey(id, extraction.primitive);
    const existing = _learned.get(key);

    if (existing) {
      existing.confirmations++;
      existing.weight = Math.min(1, existing.weight + 0.1);
      existing.lastConfirmed = now;
    } else {
      if (_learned.size >= MAX_LEARNED_SIGNALS) evictWeakest();
      const signal: LearnedSignal = {
        term: id,
        primitive: extraction.primitive,
        archetypeId: extraction.archetypeId,
        confirmations: 1,
        weight: 0.3, // New identifiers start at moderate confidence
        firstSeen: now,
        lastConfirmed: now,
      };
      _learned.set(key, signal);
      added.push(signal);
    }
  }

  // Learn from comment fragments (weaker — intent signals)
  for (const frag of extraction.commentFragments) {
    // Extract meaningful phrases (3+ word fragments)
    const words = frag.split(/\s+/).filter(w => w.length > 3);
    for (const word of words.slice(0, 5)) {
      if (NOISE_WORDS.has(word)) continue;
      const key = signalKey(word, extraction.primitive);
      if (_learned.has(key)) {
        const existing = _learned.get(key)!;
        existing.confirmations++;
        existing.weight = Math.min(1, existing.weight + 0.05);
        existing.lastConfirmed = now;
      } else {
        if (_learned.size >= MAX_LEARNED_SIGNALS) evictWeakest();
        const signal: LearnedSignal = {
          term: word,
          primitive: extraction.primitive,
          archetypeId: extraction.archetypeId,
          confirmations: 1,
          weight: 0.15, // Comments start at low confidence
          firstSeen: now,
          lastConfirmed: now,
        };
        _learned.set(key, signal);
        added.push(signal);
      }
    }
  }

  return added;
}

/** Evict the lowest-weight signal to make room */
function evictWeakest(): void {
  let weakestKey = '';
  let weakestWeight = Infinity;
  for (const [key, sig] of _learned) {
    if (sig.weight < weakestWeight) {
      weakestWeight = sig.weight;
      weakestKey = key;
    }
  }
  if (weakestKey) _learned.delete(weakestKey);
}

// ═══════════════════════════════════════════════════════════════════════════════
// §5 — QUERY API
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Get learned signals for a specific primitive.
 * Returns signals sorted by weight (strongest first).
 */
export function getLearnedSignals(primitive: string): LearnedSignal[] {
  const results: LearnedSignal[] = [];
  for (const sig of _learned.values()) {
    if (sig.primitive === primitive.toUpperCase()) results.push(sig);
  }
  return results.sort((a, b) => b.weight - a.weight);
}

/**
 * Get all learned signals above a weight threshold.
 * Use this to augment the scanner's signal vocabulary.
 */
export function getHighConfidenceSignals(minWeight = 0.5): Map<string, string[]> {
  const byPrimitive = new Map<string, string[]>();
  for (const sig of _learned.values()) {
    if (sig.weight >= minWeight) {
      const existing = byPrimitive.get(sig.primitive) ?? [];
      existing.push(sig.term);
      byPrimitive.set(sig.primitive, existing);
    }
  }
  return byPrimitive;
}

/** Get feedback loop statistics */
export function getFeedbackStats(): FeedbackStats {
  const primitives = new Set<string>();
  let totalConfirmations = 0;
  const signalList: Array<{ term: string; primitive: string; confirmations: number }> = [];

  for (const sig of _learned.values()) {
    primitives.add(sig.primitive);
    totalConfirmations += sig.confirmations;
    signalList.push({ term: sig.term, primitive: sig.primitive, confirmations: sig.confirmations });
  }

  return {
    totalSignals: _learned.size,
    totalConfirmations,
    uniquePrimitives: primitives.size,
    topSignals: signalList.sort((a, b) => b.confirmations - a.confirmations).slice(0, 20),
  };
}

/** Reset learned signals (for testing) */
export function resetFeedbackLoop(): void {
  _learned.clear();
}
