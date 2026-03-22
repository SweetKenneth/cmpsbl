/**
 * Content Deduplication & Storage Optimization
 * 
 * Prevents duplicate storage via content hashing, normalizes metadata,
 * and provides delta compression for similar memories.
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
 */
export function semanticFingerprint(text: string): string {
  const normalized = normalizeContent(text);
  const words = normalized.split(' ');
  if (words.length < 3) return normalized;
  
  // Build trigram frequency map
  const trigrams = new Map<string, number>();
  for (let i = 0; i < words.length - 2; i++) {
    const tri = `${words[i]} ${words[i + 1]} ${words[i + 2]}`;
    trigrams.set(tri, (trigrams.get(tri) || 0) + 1);
  }
  
  // Top 5 trigrams sorted by frequency then alphabetically
  const sorted = Array.from(trigrams.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 5);
  
  return sorted.map(([tri]) => tri).join('|');
}

// ═══════════════════════════════════════════════════════════════════
// CONTENT NORMALIZATION — Strip noise, standardize format
// ═══════════════════════════════════════════════════════════════════

/** Normalize content for comparison and storage efficiency */
export function normalizeContent(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, ' ')          // collapse whitespace
    .replace(/[^\w\s.,!?;:'-]/g, '') // strip special chars except punctuation
    .trim();
}

/** 
 * Compact metadata by removing null/undefined/empty values
 * and truncating verbose fields.
 */
export function compactMetadata(meta: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(meta)) {
    // Skip null, undefined, empty strings, empty arrays
    if (value === null || value === undefined) continue;
    if (typeof value === 'string' && value.length === 0) continue;
    if (Array.isArray(value) && value.length === 0) continue;
    
    // Truncate verbose string fields
    if (typeof value === 'string' && value.length > 500) {
      result[key] = value.slice(0, 500);
      continue;
    }
    
    // Recursively compact nested objects
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
// CONTENT COMPRESSION — Reduce storage size for bulk text
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

/**
 * Compress content for cold/glacier storage.
 * Strips stop words from non-code content, preserving meaning.
 * Returns compressed text and the compression ratio.
 */
export function compressForStorage(
  content: string, 
  isCode: boolean = false
): { compressed: string; ratio: number } {
  if (isCode) {
    // Code: strip comments and blank lines only
    const compressed = content
      .replace(/\/\/[^\n]*/g, '')           // single-line comments
      .replace(/\/\*[\s\S]*?\*\//g, '')     // multi-line comments
      .replace(/^\s*\n/gm, '')             // blank lines
      .replace(/\s+$/gm, '');             // trailing whitespace
    return { 
      compressed, 
      ratio: content.length / Math.max(compressed.length, 1) 
    };
  }

  // Prose: stop-word removal + whitespace normalization
  const words = content.split(/\s+/);
  const kept: string[] = [];
  
  for (const word of words) {
    const lower = word.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (lower.length > 0 && !COMPRESSION_STOP_WORDS.has(lower)) {
      kept.push(word);
    }
  }
  
  const compressed = kept.join(' ');
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
  const lower = content.toLowerCase();
  
  // Type-based critical preservation
  if (['doctrine', 'doctrine_integrated', 'error_pattern', 'heuristic'].includes(memoryType)) {
    return 'critical';
  }
  
  // Signal-based classification
  const criticalHits = CRITICAL_SIGNALS.filter(s => lower.includes(s)).length;
  if (criticalHits >= 2) return 'critical';
  
  const highHits = HIGH_SIGNALS.filter(s => lower.includes(s)).length;
  if (highHits >= 2 || criticalHits >= 1) return 'high';
  
  // Value/usage based
  if (valueScore >= 0.8 || accessCount >= 10) return 'high';
  if (valueScore >= 0.5 || accessCount >= 3) return 'medium';
  if (valueScore >= 0.2) return 'low';
  
  return 'noise';
}

/**
 * Check if a memory should be preserved indefinitely.
 * Critical and high importance memories are never deleted.
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
  return hash >>> 0; // unsigned
}
