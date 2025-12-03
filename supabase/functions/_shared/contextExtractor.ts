/**
 * Context Extraction Utility
 * Extracts key terms from text for knowledge linking
 */

const STOP_WORDS = new Set([
  'the', 'and', 'is', 'of', 'in', 'for', 'to', 'a', 'an', 'this', 'that',
  'with', 'on', 'at', 'by', 'from', 'as', 'or', 'be', 'are', 'was', 'were',
  'it', 'can', 'will', 'but', 'not', 'they', 'have', 'has', 'had'
]);

/**
 * Extract top contextual tags from text
 */
export function extractContextTags(text: string): string[] {
  if (!text || typeof text !== 'string') return [];
  
  // Normalize and tokenize
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 3 && !STOP_WORDS.has(w));
  
  // Count frequency
  const freq: Record<string, number> = {};
  words.forEach(w => {
    freq[w] = (freq[w] || 0) + 1;
  });
  
  // Return top 5 most frequent terms
  const tags = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word);
  
  return tags;
}

/**
 * Calculate overlap score between two tag arrays
 */
export function calculateTagOverlap(tags1: string[], tags2: string[]): number {
  if (!tags1?.length || !tags2?.length) return 0;
  
  const set1 = new Set(tags1);
  const overlap = tags2.filter(tag => set1.has(tag)).length;
  
  return overlap / Math.max(tags1.length, tags2.length);
}
