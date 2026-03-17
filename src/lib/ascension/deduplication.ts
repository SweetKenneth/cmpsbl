/**
 * CMPSBL® Primitive Deduplication + Canonicalization
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Merges semantically equivalent primitives, preserving provenance.
 * Conservative: only merges with clear evidence.
 *
 * © CMPSBL® — All rights reserved.
 */

import type { ExtractedPrimitive } from './types';
import { normalizeName } from './language-postprocessor';

// ═══════════════════════════════════════════════════════════════════════════════
// §1 — SIMILARITY HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Compute name similarity between two normalized names (0–1).
 * Uses token overlap (Jaccard coefficient).
 */
function nameSimilarity(a: string, b: string): number {
  if (a === b) return 1;

  const tokensA = new Set(a.split('_').filter(t => t.length > 1));
  const tokensB = new Set(b.split('_').filter(t => t.length > 1));

  if (tokensA.size === 0 || tokensB.size === 0) return 0;

  let intersection = 0;
  for (const t of tokensA) {
    if (tokensB.has(t)) intersection++;
  }

  const union = tokensA.size + tokensB.size - intersection;
  return union > 0 ? intersection / union : 0;
}

// ═══════════════════════════════════════════════════════════════════════════════
// §2 — DEDUPLICATION ENGINE
// ═══════════════════════════════════════════════════════════════════════════════

export interface DeduplicationResult {
  canonical: ExtractedPrimitive[];
  mergedCount: number;
  mergeLog: Array<{ canonical: string; merged: string[]; reason: string }>;
}

/**
 * Deduplicate primitives using conservative semantic matching.
 *
 * Rules:
 * 1. Exact canonical name match → always merge
 * 2. High Jaccard similarity (>= 0.75) + same category → merge
 * 3. Keep the highest-quality version as canonical
 * 4. Preserve aliases and provenance
 */
export function deduplicatePrimitives(
  primitives: ExtractedPrimitive[],
  similarityThreshold = 0.75
): DeduplicationResult {
  if (primitives.length === 0) {
    return { canonical: [], mergedCount: 0, mergeLog: [] };
  }

  // Group by canonical name first (exact matches)
  const groups = new Map<string, ExtractedPrimitive[]>();
  for (const p of primitives) {
    const key = p.canonicalName || normalizeName(p.name);
    const group = groups.get(key) || [];
    group.push(p);
    groups.set(key, group);
  }

  // Merge exact-name groups
  const merged: ExtractedPrimitive[] = [];
  const mergeLog: DeduplicationResult['mergeLog'] = [];

  for (const [key, group] of groups) {
    if (group.length === 1) {
      merged.push(group[0]);
    } else {
      // Keep highest quality version
      group.sort((a, b) => (b.qualityScore || 0) - (a.qualityScore || 0));
      const best = { ...group[0] };
      const aliases = new Set(best.aliases || []);
      const files = new Set<string>();

      for (const p of group) {
        if (p.name !== best.name) aliases.add(p.name);
        if (p.sourceFile) files.add(p.sourceFile);
        // Merge keywords
        for (const kw of p.keywords) {
          if (!best.keywords.includes(kw)) best.keywords.push(kw);
        }
        // Take best confidence
        if (p.confidence > best.confidence) best.confidence = p.confidence;
      }

      best.aliases = Array.from(aliases);
      merged.push(best);

      if (group.length > 1) {
        mergeLog.push({
          canonical: key,
          merged: group.map(p => p.name),
          reason: 'exact canonical name match',
        });
      }
    }
  }

  // Second pass: fuzzy similarity merge (conservative)
  const final: ExtractedPrimitive[] = [];
  const consumed = new Set<number>();

  for (let i = 0; i < merged.length; i++) {
    if (consumed.has(i)) continue;

    let current = { ...merged[i] };
    const currentKey = current.canonicalName || normalizeName(current.name);

    for (let j = i + 1; j < merged.length; j++) {
      if (consumed.has(j)) continue;

      const other = merged[j];
      const otherKey = other.canonicalName || normalizeName(other.name);
      const sim = nameSimilarity(currentKey, otherKey);

      if (sim >= similarityThreshold && current.category === other.category) {
        // Merge other into current
        const aliases = new Set(current.aliases || []);
        aliases.add(other.name);
        if (other.aliases) other.aliases.forEach(a => aliases.add(a));
        current.aliases = Array.from(aliases);

        if (other.confidence > current.confidence) {
          current.confidence = other.confidence;
        }
        if ((other.qualityScore || 0) > (current.qualityScore || 0)) {
          current.qualityScore = other.qualityScore;
          current.sourceSnippet = other.sourceSnippet;
        }

        for (const kw of other.keywords) {
          if (!current.keywords.includes(kw)) current.keywords.push(kw);
        }

        consumed.add(j);
        mergeLog.push({
          canonical: currentKey,
          merged: [current.name, other.name],
          reason: `similarity ${sim.toFixed(2)} + same category \"${current.category}\"`,
        });
      }
    }

    final.push(current);
  }

  return {
    canonical: final,
    mergedCount: primitives.length - final.length,
    mergeLog,
  };
}
