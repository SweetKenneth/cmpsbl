/**
 * Content Deduplication & Storage Optimization
 * 
 * Prevents duplicate storage via content hashing, normalizes metadata,
 * and provides single-pass compression for similar memories.
 */

// ═══════════════════════════════════════════════════════════════════
// CONTENT HASHING — Fast fingerprint to detect exact & near duplicates
// ═══════════════════════════════════════════════════════════════════

/** 
 * Generate a deterministic content hash for deduplication.
 * Normalizes whitespace/casing, strips noise, and produces a 32-bit hash.
 */
export function contentHash(text: string): number {
  const normalized = normalizeContent(text);
  return fnv1a32(normalized);
}

/**
 * Generate a semantic fingerprint for near-duplicate detection.
 * Returns sorted top-frequency trigrams as a stable key.
 * OPTIMIZED: Partial selection sort (O(5n)) instead of full sort (O(n log n))
 */
export function semanticFingerprint(text: string): string {
  const normalized = normalizeContent(text);
  const words = normalized.split(' ');
  if (words.length < 3) return normalized;
  
  // Build trigram frequency map
  const trigrams = new Map<string, number>();
  for (let i = 0, end = words.length - 2; i < end; i++) {
    const tri = words[i] + ' ' + words[i + 1] + ' ' + words[i + 2];
    trigrams.set(tri, (trigrams.get(tri) || 0) + 1);
  }
  
  // Partial selection sort for top 5 — avoids full sort allocation
  const entries = Array.from(trigrams.entries());
  const k = Math.min(5, entries.length);
  for (let i = 0; i < k; i++) {
    let maxIdx = i;
    for (let j = i + 1; j < entries.length; j++) {
      if (entries[j][1] > entries[maxIdx][1] ||
          (entries[j][1] === entries[maxIdx][1] && entries[j][0] < entries[maxIdx][0])) {
        maxIdx = j;
      }
    }
    if (maxIdx !== i) { const tmp = entries[i]; entries[i] = entries[maxIdx]; entries[maxIdx] = tmp; }
  }
  
  let result = '';
  for (let i = 0; i < k; i++) {
    if (i > 0) result += '|';
    result += entries[i][0];
  }
  return result;
}

// ═══════════════════════════════════════════════════════════════════
// CONTENT NORMALIZATION — Strip noise, standardize format
// ═══════════════════════════════════════════════════════════════════

/** Pre-compiled regex for normalization */
const WHITESPACE_RE = /\s+/g;
const SPECIAL_CHARS_RE = /[^\w\s.,!?;:'-]/g;

/** Normalize content for comparison and storage efficiency */
export function normalizeContent(text: string): string {
  return text
    .toLowerCase()
    .replace(WHITESPACE_RE, ' ')
    .replace(SPECIAL_CHARS_RE, '')
    .trim();
}

/** 
 * Compact metadata by removing null/undefined/empty values
 * and truncating verbose fields.
 */
export function compactMetadata(meta: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(meta)) {
    if (value === null || value === undefined) continue;
    if (typeof value === 'string' && value.length === 0) continue;
    if (Array.isArray(value) && value.length === 0) continue;
    
    if (typeof value === 'string' && value.length > 500) {
      result[key] = value.slice(0, 500);
      continue;
    }
    
    if (typeof value === 'object' && !Array.isArray(value)) {
      const compacted = compactMetadata(value as Record<string, unknown>);
      if (Object.keys(compacted).length > 0) {
        result[key] = compacted;
      }
      continue;
    }
    
    result[key] = value;
  }
  
  return result;
}

// ═══════════════════════════════════════════════════════════════════
// CONTENT COMPRESSION — Single-pass stop-word removal for prose
// ═══════════════════════════════════════════════════════════════════

/** Stop words to strip during compression (saves ~20% storage on prose) */
const COMPRESSION_STOP_WORDS = new Set([
  'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
  'should', 'may', 'might', 'shall', 'can', 'to', 'of', 'in', 'for',
  'on', 'with', 'at', 'by', 'from', 'as', 'into', 'through', 'during',
  'before', 'after', 'above', 'below', 'between', 'out', 'off', 'up',
  'down', 'about', 'then', 'than', 'so', 'no', 'not', 'only', 'very',
  'just', 'also', 'and', 'but', 'or', 'if', 'while', 'because', 'that',
  'this', 'these', 'those', 'it', 'its',
]);

/** Pre-compiled regex for code comment stripping */
const SINGLE_LINE_COMMENT_RE = /\/\/[^\n]*/g;
const MULTI_LINE_COMMENT_RE = /\/\*[\s\S]*?\*\//g;
const BLANK_LINES_RE = /^\s*\n/gm;
const TRAILING_WS_RE = /\s+$/gm;
const NON_ALPHA_RE = /[^a-z0-9]/g;

/**
 * Compress content for cold/glacier storage.
 * OPTIMIZED: Single-pass word scanning for prose — no intermediate arrays.
 */
export function compressForStorage(
  content: string, 
  isCode: boolean = false
): { compressed: string; ratio: number } {
  if (isCode) {
    const compressed = content
      .replace(SINGLE_LINE_COMMENT_RE, '')
      .replace(MULTI_LINE_COMMENT_RE, '')
      .replace(BLANK_LINES_RE, '')
      .replace(TRAILING_WS_RE, '');
    return { compressed, ratio: content.length / Math.max(compressed.length, 1) };
  }

  // Single-pass prose compression: scan words inline, skip stop words
  let compressed = '';
  let wordStart = -1;
  const len = content.length;

  for (let i = 0; i <= len; i++) {
    const ch = i < len ? content.charCodeAt(i) : 32;
    const isSpace = ch === 32 || ch === 9 || ch === 10 || ch === 13;

    if (!isSpace && wordStart === -1) {
      wordStart = i;
    } else if (isSpace && wordStart !== -1) {
      const word = content.slice(wordStart, i);
      const lower = word.toLowerCase().replace(NON_ALPHA_RE, '');
      if (lower.length > 0 && !COMPRESSION_STOP_WORDS.has(lower)) {
        if (compressed.length > 0) compressed += ' ';
        compressed += word;
      }
      wordStart = -1;
    }
  }

  return {
    compressed,
    ratio: content.length / Math.max(compressed.length, 1),
  };
}

// ═══════════════════════════════════════════════════════════════════
// IMPORTANCE CLASSIFICATION — Never forget critical memories
// ═══════════════════════════════════════════════════════════════════

export type ImportanceLevel = 'critical' | 'high' | 'medium' | 'low' | 'noise';

/** Keywords that signal critical/important content */
const CRITICAL_SIGNALS = [
  'error', 'fix', 'bug', 'security', 'vulnerability', 'breach', 'outage',
  'lesson', 'learned', 'never', 'always', 'critical', 'important',
  'breaking', 'migration', 'schema', 'deploy', 'rollback',
];

const HIGH_SIGNALS = [
  'pattern', 'architecture', 'design', 'decision', 'trade-off', 'tradeoff',
  'insight', 'discovery', 'optimization', 'performance', 'algorithm',
  'principle', 'rule', 'policy', 'standard', 'convention',
];

/** Pre-built critical type set for O(1) lookup */
const CRITICAL_TYPES = new Set(['doctrine', 'doctrine_integrated', 'error_pattern', 'heuristic']);

/**
 * Classify memory importance for retention decisions.
 * Critical & high importance memories are NEVER pruned.
 */
export function classifyImportance(
  content: string,
  memoryType: string,
  valueScore: number,
  accessCount: number
): ImportanceLevel {
  // Type-based critical preservation — O(1) Set lookup
  if (CRITICAL_TYPES.has(memoryType)) return 'critical';
  
  const lower = content.toLowerCase();
  
  // Signal-based classification — count matches inline
  let criticalHits = 0;
  for (let i = 0; i < CRITICAL_SIGNALS.length; i++) {
    if (lower.includes(CRITICAL_SIGNALS[i])) criticalHits++;
  }
  if (criticalHits >= 2) return 'critical';
  
  let highHits = 0;
  for (let i = 0; i < HIGH_SIGNALS.length; i++) {
    if (lower.includes(HIGH_SIGNALS[i])) highHits++;
  }
  if (highHits >= 2 || criticalHits >= 1) return 'high';
  
  // Value/usage based
  if (valueScore >= 0.8 || accessCount >= 10) return 'high';
  if (valueScore >= 0.5 || accessCount >= 3) return 'medium';
  if (valueScore >= 0.2) return 'low';
  
  return 'noise';
}

/**
 * Check if a memory should be preserved indefinitely.
 */
export function shouldPreserveIndefinitely(importance: ImportanceLevel): boolean {
  return importance === 'critical' || importance === 'high';
}

// ═══════════════════════════════════════════════════════════════════
// DEDUP CHECK — In-memory bloom-filter-like fast check
// ═══════════════════════════════════════════════════════════════════

const DEDUP_CACHE_MAX = 2000;
const recentHashes = new Set<number>();
const recentFingerprints = new Set<string>();

/**
 * Check if content is a duplicate of something recently stored.
 * Returns true if duplicate detected (should skip storage).
 */
export function isDuplicate(content: string): boolean {
  const hash = contentHash(content);
  if (recentHashes.has(hash)) return true;
  
  const fp = semanticFingerprint(content);
  if (fp.length > 10 && recentFingerprints.has(fp)) return true;
  
  // Register for future checks
  recentHashes.add(hash);
  recentFingerprints.add(fp);
  
  // Evict oldest if over capacity
  if (recentHashes.size > DEDUP_CACHE_MAX) {
    const first = recentHashes.values().next().value;
    if (first !== undefined) recentHashes.delete(first);
  }
  if (recentFingerprints.size > DEDUP_CACHE_MAX) {
    const first = recentFingerprints.values().next().value;
    if (first !== undefined) recentFingerprints.delete(first);
  }
  
  return false;
}

/** Clear dedup cache (for testing or memory pressure) */
export function clearDedupCache(): void {
  recentHashes.clear();
  recentFingerprints.clear();
}

// ═══════════════════════════════════════════════════════════════════
// FNV-1a 32-bit hash — fast, low-collision string hash
// ═══════════════════════════════════════════════════════════════════

function fnv1a32(str: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = (hash * 0x01000193) | 0;
  }
  return hash >>> 0;
}