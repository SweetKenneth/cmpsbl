/**
 * Memory Deduplication Engine
 * Merges semantically duplicate entries in brain_memories
 * 
 * Uses n-gram similarity scoring to find and merge near-duplicate
 * memories, preserving the highest-value version.
 */

import { supabase } from '@/integrations/supabase/client';

export interface DedupCandidate {
  idA: string;
  idB: string;
  contentA: string;
  contentB: string;
  similarity: number;
  merged: boolean;
  survivorId: string | null;
}

export interface DedupResult {
  scanned: number;
  duplicatesFound: number;
  merged: number;
  bytesRecovered: number;
  duration: number;
  candidates: DedupCandidate[];
}

export interface DedupConfig {
  similarityThreshold: number;  // 0-1, default 0.85
  maxScanBatch: number;
  dryRun: boolean;
  protectPinned: boolean;
}

const DEFAULT_CONFIG: DedupConfig = {
  similarityThreshold: 0.85,
  maxScanBatch: 200,
  dryRun: true,
  protectPinned: true,
};

/** Generate character n-grams */
function ngrams(text: string, n: number = 3): Set<string> {
  const normalized = text.toLowerCase().replace(/\s+/g, ' ').trim();
  const result = new Set<string>();
  for (let i = 0; i <= normalized.length - n; i++) {
    result.add(normalized.slice(i, i + n));
  }
  return result;
}

/** Jaccard similarity between two n-gram sets */
function similarity(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 1;
  let intersection = 0;
  for (const gram of a) {
    if (b.has(gram)) intersection++;
  }
  return intersection / (a.size + b.size - intersection);
}

/** Scan and identify duplicate memories in the hot tier */
export async function scanDuplicates(
  config: Partial<DedupConfig> = {}
): Promise<DedupResult> {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const start = Date.now();

  // FIX: Query actual tier table (brain_memory_hot) instead of non-existent brain_memories
  const { data: memories, error } = await supabase
    .from('brain_memory_hot')
    .select('id, content, value_score, metadata')
    .order('created_at', { ascending: false })
    .limit(cfg.maxScanBatch);

  if (error || !memories) {
    return { scanned: 0, duplicatesFound: 0, merged: 0, bytesRecovered: 0, duration: Date.now() - start, candidates: [] };
  }

  // Build n-gram index
  const indexed = memories.map(m => ({
    id: m.id,
    content: (m as any).content || '',
    confidence: (m as any).value_score ?? 0,
    grams: ngrams((m as any).content || '', 3),
  }));

  const candidates: DedupCandidate[] = [];
  const merged = new Set<string>();

  for (let i = 0; i < indexed.length; i++) {
    if (merged.has(indexed[i].id)) continue;
    
    for (let j = i + 1; j < indexed.length; j++) {
      if (merged.has(indexed[j].id)) continue;

      const sim = similarity(indexed[i].grams, indexed[j].grams);
      if (sim >= cfg.similarityThreshold) {
        // Keep the one with higher confidence
        const keepI = indexed[i].confidence >= indexed[j].confidence;
        const survivorId = keepI ? indexed[i].id : indexed[j].id;
        const victimId = keepI ? indexed[j].id : indexed[i].id;

        candidates.push({
          idA: indexed[i].id,
          idB: indexed[j].id,
          contentA: (indexed[i].content || '').slice(0, 100),
          contentB: (indexed[j].content || '').slice(0, 100),
          similarity: Math.round(sim * 1000) / 1000,
          merged: false,
          survivorId,
        });

        merged.add(victimId);
      }
    }
  }

  let mergedCount = 0;
  let bytesRecovered = 0;

  if (!cfg.dryRun && candidates.length > 0) {
    // Batch delete all victims in one call instead of sequential deletes
    const victimIds = candidates.map(c => 
      c.survivorId === c.idA ? c.idB : c.idA
    );

    const { error: delError } = await supabase
      .from('brain_memory_hot')
      .delete()
      .in('id', victimIds);

    if (!delError) {
      mergedCount = candidates.length;
      for (const c of candidates) {
        c.merged = true;
        const victimContent = c.survivorId === c.idA ? c.contentB : c.contentA;
        bytesRecovered += new TextEncoder().encode(victimContent).length;
      }
    }
  }

  return {
    scanned: memories.length,
    duplicatesFound: candidates.length,
    merged: mergedCount,
    bytesRecovered,
    duration: Date.now() - start,
    candidates,
  };
}

/** Quick similarity check between two strings */
export function checkSimilarity(textA: string, textB: string): number {
  return similarity(ngrams(textA), ngrams(textB));
}

/** Get dedup summary stats */
export function getDedupSummary(result: DedupResult) {
  return {
    scanned: result.scanned,
    duplicates: result.duplicatesFound,
    dupRate: result.scanned > 0 ? `${((result.duplicatesFound / result.scanned) * 100).toFixed(1)}%` : '0%',
    merged: result.merged,
    bytesRecovered: `${(result.bytesRecovered / 1024).toFixed(1)} KB`,
    duration: `${result.duration}ms`,
    avgSimilarity: result.candidates.length > 0
      ? (result.candidates.reduce((s, c) => s + c.similarity, 0) / result.candidates.length).toFixed(3)
      : 'N/A',
  };
}
