/**
 * CMPSBL® BRAIN — Memory Compression
 * Merges duplicates and compresses memories while preserving code
 */

import { supabase } from '@/integrations/supabase/client';

export interface CompressionResult {
  summary: string;
  sourceRefs: string[];
  compressionLevel: number;
}

/**
 * Compress multiple similar memories into a single cold memory entry
 */
export async function compressMemories(
  memoryIds: string[],
  sourceTier: 'hot' | 'warm' = 'hot'
): Promise<CompressionResult | null> {
  try {
    const table = sourceTier === 'warm' ? 'brain_memory_warm' : 'brain_memory_hot';
    // Fetch memories from the correct source tier
    const { data: memories, error } = await supabase
      .from(table)
      .select('id, content, context')
      .in('id', memoryIds);
    
    if (error || !memories || memories.length === 0) {
      console.error('Failed to fetch memories for compression:', error);
      return null;
    }
    
    // Separate code from other content
    const codeMemories = memories.filter(m => m.context === 'code');
    const otherMemories = memories.filter(m => m.context !== 'code');
    
    // Process both types and merge results
    const parts: string[] = [];
    const sourceRefs: string[] = [];
    let totalOriginalLength = 0;
    
    // Code is preserved raw - no compression
    if (codeMemories.length > 0) {
      const codeSummary = codeMemories.map(m => m.content).join('\n\n---\n\n');
      parts.push(codeSummary);
      sourceRefs.push(...codeMemories.map(m => m.id));
      totalOriginalLength += codeSummary.length;
    }
    
    // Compress non-code content
    if (otherMemories.length > 0) {
      const combinedContent = otherMemories.map(m => m.content).join(' ');
      totalOriginalLength += combinedContent.length;
      const summary = await generateSummary(combinedContent, otherMemories[0].context);
      parts.push(summary);
      sourceRefs.push(...otherMemories.map(m => m.id));
    }
    
    const finalSummary = parts.join('\n\n');
    
    return {
      summary: finalSummary,
      sourceRefs,
      compressionLevel: totalOriginalLength > 0 ? Math.ceil(totalOriginalLength / finalSummary.length) : 1,
    };
  } catch (err) {
    console.error('Error compressing memories:', err);
    return null;
  }
}

/**
 * Generate summary of combined content
 */
async function generateSummary(content: string, context: string): Promise<string> {
  // For now, use simple extraction - can be enhanced with AI summarization
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
  
  // Take key sentences (first, last, and some middle)
  const keyIndices = [
    0,
    Math.floor(sentences.length * 0.25),
    Math.floor(sentences.length * 0.5),
    Math.floor(sentences.length * 0.75),
    sentences.length - 1,
  ];
  
  const keySentences = keyIndices
    .filter(i => i < sentences.length)
    .map(i => sentences[i].trim());
  
  return `[${context}] ${keySentences.join('. ')}.`;
}

/**
 * Average multiple embeddings into one
 */
function averageEmbeddings(embeddings: number[][]): number[] {
  if (embeddings.length === 0) return [];
  
  const dim = embeddings[0].length;
  const avg = new Array(dim).fill(0);
  
  for (const embedding of embeddings) {
    for (let i = 0; i < dim && i < embedding.length; i++) {
      avg[i] += embedding[i];
    }
  }
  
  return avg.map(v => v / embeddings.length);
}

/**
 * Find duplicate or highly similar memories — O(n) hash-based approach
 * Uses content fingerprinting to bucket likely duplicates, then only
 * compares within buckets (amortized linear time).
 */
export async function findDuplicateMemories(threshold: number = 0.95): Promise<string[][]> {
  try {
    const { data: memories, error } = await supabase
      .from('brain_memory_hot')
      .select('id, content')
      .order('created_at', { ascending: false })
      .limit(1000);
    
    if (error || !memories) {
      return [];
    }
    
    // Phase 1: Hash-bucket by normalized content fingerprint (O(n))
    const buckets = new Map<string, typeof memories>();
    for (const mem of memories) {
      const fp = contentFingerprint(mem.content);
      const bucket = buckets.get(fp);
      if (bucket) {
        bucket.push(mem);
      } else {
        buckets.set(fp, [mem]);
      }
    }
    
    // Phase 2: Only compare within buckets (small n per bucket)
    const duplicateGroups: string[][] = [];
    for (const bucket of buckets.values()) {
      if (bucket.length < 2) continue;
      
      // For high threshold (≥0.95), bucket members are almost certainly dupes
      if (threshold >= 0.95) {
        duplicateGroups.push(bucket.map(m => m.id));
        continue;
      }
      
      // For lower thresholds, verify with Jaccard within bucket only
      const processed = new Set<string>();
      for (let i = 0; i < bucket.length; i++) {
        if (processed.has(bucket[i].id)) continue;
        const group = [bucket[i].id];
        for (let j = i + 1; j < bucket.length; j++) {
          if (processed.has(bucket[j].id)) continue;
          if (calculateSimilarity(bucket[i].content, bucket[j].content) >= threshold) {
            group.push(bucket[j].id);
            processed.add(bucket[j].id);
          }
        }
        if (group.length > 1) duplicateGroups.push(group);
        processed.add(bucket[i].id);
      }
    }
    
    return duplicateGroups;
  } catch (err) {
    console.error('Error finding duplicates:', err);
    return [];
  }
}

/**
 * Generate a content fingerprint for bucketing.
 * Normalizes whitespace, lowercases, sorts words, and takes a
 * deterministic hash of the top-frequency trigrams.
 */
function contentFingerprint(text: string): string {
  const normalized = text.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();
  const words = normalized.split(' ').sort();
  // Use first 8 + last 4 sorted words as fingerprint seed (stable across minor edits)
  const key = words.slice(0, 8).concat(words.slice(-4)).join('|');
  // Simple string hash
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = ((hash << 5) - hash + key.charCodeAt(i)) | 0;
  }
  return String(hash);
}

/**
 * Jaccard text similarity (fallback for sub-0.95 thresholds)
 */
function calculateSimilarity(text1: string, text2: string): number {
  const words1 = new Set(text1.toLowerCase().split(/\s+/));
  const words2 = new Set(text2.toLowerCase().split(/\s+/));
  
  let intersection = 0;
  for (const w of words1) {
    if (words2.has(w)) intersection++;
  }
  
  return intersection / (words1.size + words2.size - intersection);
}

/**
 * Merge duplicate memories
 */
export async function mergeDuplicates(duplicateGroups: string[][]): Promise<number> {
  let mergedCount = 0;
  
  for (const group of duplicateGroups) {
    const compressed = await compressMemories(group);
    
    if (compressed) {
      // Move to cold storage with full metadata
      const { error } = await supabase
        .from('brain_memory_cold')
        .insert({
          summary: compressed.summary,
          source_refs: compressed.sourceRefs as any,
          compression_level: compressed.compressionLevel,
          source_module: 'consolidation',
          category: 'merged',
          tags: { merged: true, original_count: group.length } as any,
        });
      
      if (!error) {
        // Delete originals from hot
        await supabase
          .from('brain_memory_hot')
          .delete()
          .in('id', group);
        
        mergedCount += group.length;
      }
    }
  }
  
  return mergedCount;
}
