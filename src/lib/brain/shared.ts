/**
 * BRAIN Shared Utilities — Deduplicates similarity, tokenization, and stop-words
 * across semanticRecall, vectorSearch, compressMemory, consolidation, and memoryIndex.
 *
 * All BRAIN sub-modules MUST import from here instead of re-implementing.
 */

// ═══════════════════════════════════════════════════════════════════════════════
// STOP WORDS — Single source of truth for entire BRAIN module
// ═══════════════════════════════════════════════════════════════════════════════
export const STOP_WORDS = new Set([
  'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can',
  'had', 'her', 'was', 'one', 'our', 'out', 'has', 'have', 'been',
  'this', 'that', 'with', 'they', 'from', 'what', 'which', 'their',
  'about', 'would', 'could', 'should', 'there', 'these', 'those',
  'other', 'into', 'some', 'than', 'then', 'them', 'your',
]);

// ═══════════════════════════════════════════════════════════════════════════════
// TOKENIZATION — Zero-allocation word extraction
// ═══════════════════════════════════════════════════════════════════════════════

/** Pre-compiled cleanup regex */
const CLEAN_RE = /[^\w\s]/g;

/**
 * Tokenize text into lowercase words (length > 2).
 * Used by: consolidation, compressMemory, memoryIndex, semanticRecall
 */
export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(CLEAN_RE, ' ')
    .split(/\s+/)
    .filter(t => t.length > 2);
}

/**
 * Tokenize into a Set — avoids duplicate iteration in Jaccard calcs.
 */
export function tokenizeToSet(text: string): Set<string> {
  const result = new Set<string>();
  const lower = text.toLowerCase();
  let wordStart = -1;
  const len = lower.length;

  for (let i = 0; i <= len; i++) {
    const ch = i < len ? lower.charCodeAt(i) : 32;
    const isAlphaNum = (ch >= 97 && ch <= 122) || (ch >= 48 && ch <= 57) || ch === 95; // a-z, 0-9, _
    if (isAlphaNum && wordStart === -1) {
      wordStart = i;
    } else if (!isAlphaNum && wordStart !== -1) {
      if (i - wordStart > 2) {
        result.add(lower.slice(wordStart, i));
      }
      wordStart = -1;
    }
  }
  return result;
}

/**
 * Extract keywords (unique, non-stop-word, length > 2).
 * Used by: memoryIndex
 */
export function extractKeywords(text: string): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  const lower = text.toLowerCase();
  let wordStart = -1;
  const len = lower.length;

  for (let i = 0; i <= len; i++) {
    const ch = i < len ? lower.charCodeAt(i) : 32;
    const isAlphaNum = (ch >= 97 && ch <= 122) || (ch >= 48 && ch <= 57);
    if (isAlphaNum && wordStart === -1) {
      wordStart = i;
    } else if (!isAlphaNum && wordStart !== -1) {
      if (i - wordStart > 2) {
        const word = lower.slice(wordStart, i);
        if (!STOP_WORDS.has(word) && !seen.has(word)) {
          seen.add(word);
          result.push(word);
        }
      }
      wordStart = -1;
    }
  }
  return result;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SIMILARITY — Single implementation for all BRAIN sub-modules
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Jaccard similarity on token sets.
 * Iterates the smaller set for O(min(m,n)) intersection.
 */
export function jaccardSimilarity(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  const [smaller, larger] = a.size <= b.size ? [a, b] : [b, a];
  let intersection = 0;
  for (const t of smaller) {
    if (larger.has(t)) intersection++;
  }
  const union = a.size + b.size - intersection;
  return union > 0 ? intersection / union : 0;
}

/**
 * Word-frequency cosine similarity.
 * Used by: semanticRecall
 */
export function cosineSimilarity(text1: string, text2: string): number {
  const words1 = tokenize(text1);
  const words2 = tokenize(text2);
  if (words1.length === 0 || words2.length === 0) return 0;

  const freq1 = new Map<string, number>();
  for (const w of words1) freq1.set(w, (freq1.get(w) || 0) + 1);

  const freq2 = new Map<string, number>();
  for (const w of words2) freq2.set(w, (freq2.get(w) || 0) + 1);

  let dotProduct = 0;
  let mag1 = 0;
  for (const [word, count] of freq1) {
    mag1 += count * count;
    const f2 = freq2.get(word);
    if (f2) dotProduct += count * f2;
  }

  let mag2 = 0;
  for (const count of freq2.values()) mag2 += count * count;

  return dotProduct / (Math.sqrt(mag1) * Math.sqrt(mag2));
}

/**
 * N-gram Jaccard similarity (character-level).
 * Used by: semanticRecall
 */
export function ngramSimilarity(text1: string, text2: string, n: number = 3): number {
  const clean1 = text1.toLowerCase().replace(/\s+/g, ' ');
  const clean2 = text2.toLowerCase().replace(/\s+/g, ' ');

  if (clean1.length < n || clean2.length < n) return 0;

  const grams1 = new Set<string>();
  for (let i = 0; i <= clean1.length - n; i++) grams1.add(clean1.slice(i, i + n));

  let intersectionCount = 0;
  let grams2Count = 0;
  const seen2 = new Set<string>();
  for (let i = 0; i <= clean2.length - n; i++) {
    const g = clean2.slice(i, i + n);
    if (!seen2.has(g)) {
      seen2.add(g);
      grams2Count++;
      if (grams1.has(g)) intersectionCount++;
    }
  }

  const unionSize = grams1.size + grams2Count - intersectionCount;
  return unionSize > 0 ? intersectionCount / unionSize : 0;
}

/**
 * Combined word + n-gram similarity (weighted 40/60).
 * Used by: semanticRecall, detectMemoryClusters
 */
export function combinedSimilarity(query: string, content: string): number {
  return cosineSimilarity(query, content) * 0.4 + ngramSimilarity(query, content) * 0.6;
}

/**
 * Word-match relevance score (for vectorSearch, cold/glacier search).
 * Pre-tokenizes query once; returns 0-1.
 */
export function wordMatchRelevance(queryLower: string, queryWords: string[], contentLower: string): number {
  if (queryWords.length === 0) return 0;
  let matchCount = 0;
  for (const word of queryWords) {
    if (contentLower.includes(word)) matchCount++;
  }
  const baseRelevance = matchCount / queryWords.length;
  const exactMatchBonus = contentLower.includes(queryLower) ? 0.2 : 0;
  return Math.min(baseRelevance + exactMatchBonus, 1.0);
}

// ═══════════════════════════════════════════════════════════════════════════════
// SELECT CONSTANTS — Shared query field strings
// ═══════════════════════════════════════════════════════════════════════════════

/** Hot tier select fields used by multiple modules */
export const HOT_SELECT = 'id, content, context, value_score, access_count, created_at, last_used' as const;
/** Warm tier select fields */
export const WARM_SELECT = 'id, content, context, value_score, access_count, created_at, last_accessed' as const;
/** Cold tier select fields */
export const COLD_SELECT = 'id, summary, tags, value_score, access_count, created_at, last_accessed' as const;
/** Glacier tier select fields */
export const GLACIER_SELECT = 'id, content, context, tags, value_score, access_count, created_at' as const;
