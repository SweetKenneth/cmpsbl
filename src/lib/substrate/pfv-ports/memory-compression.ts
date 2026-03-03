/**
 * PFV Port → Memory Compression with Code Preservation
 * Extractive summarization that keeps code blocks raw
 * Benefits: MEMORY, DREAM
 * Source: PromptFluid-Vision brain/compressMemory.ts
 */

import { supabase } from '@/integrations/supabase/client';

export interface CompressionResult {
  summary: string;
  sourceRefs: string[];
  compressionLevel: number;
}

/**
 * Compress memories — code is preserved raw, text is summarized
 */
export async function compressMemories(memoryIds: string[]): Promise<CompressionResult | null> {
  try {
    const { data: memories, error } = await supabase
      .from('brain_memory_hot')
      .select('*')
      .in('id', memoryIds);

    if (error || !memories?.length) {
      console.error('[MEMORY-COMPRESSION] Fetch failed:', error);
      return null;
    }

    const codeMemories = memories.filter(m => m.context === 'code');
    const otherMemories = memories.filter(m => m.context !== 'code');

    // Code is NEVER compressed — preserved raw
    if (codeMemories.length > 0 && otherMemories.length === 0) {
      return {
        summary: codeMemories.map(m => m.content).join('\n\n---\n\n'),
        sourceRefs: codeMemories.map(m => m.id),
        compressionLevel: 0,
      };
    }

    // Text content gets extractive summarization
    const combinedContent = otherMemories.map(m => m.content).join(' ');
    const summary = generateExtractSummary(combinedContent, otherMemories[0]?.context || 'general');

    // If mixed, prepend code blocks
    const codePart = codeMemories.length > 0
      ? codeMemories.map(m => m.content).join('\n\n---\n\n') + '\n\n===\n\n'
      : '';

    return {
      summary: codePart + summary,
      sourceRefs: memories.map(m => m.id),
      compressionLevel: combinedContent.length > 0
        ? Math.ceil(combinedContent.length / summary.length)
        : 0,
    };
  } catch (err) {
    console.error('[MEMORY-COMPRESSION] Error:', err);
    return null;
  }
}

/**
 * Extractive summary — picks key sentences by position
 */
function generateExtractSummary(content: string, context: string): string {
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
  if (sentences.length === 0) return content.slice(0, 200);

  const keyIndices = [
    0,
    Math.floor(sentences.length * 0.25),
    Math.floor(sentences.length * 0.5),
    Math.floor(sentences.length * 0.75),
    sentences.length - 1,
  ];

  const keySentences = [...new Set(keyIndices)]
    .filter(i => i < sentences.length)
    .map(i => sentences[i].trim());

  return `[${context}] ${keySentences.join('. ')}.`;
}

/**
 * Find duplicate memories by Jaccard similarity
 */
export async function findDuplicateMemories(threshold: number = 0.95): Promise<string[][]> {
  try {
    const { data: memories, error } = await supabase
      .from('brain_memory_hot')
      .select('id, content')
      .order('created_at', { ascending: false })
      .limit(1000);

    if (error || !memories) return [];

    const groups: string[][] = [];
    const processed = new Set<string>();

    for (let i = 0; i < memories.length; i++) {
      if (processed.has(memories[i].id)) continue;
      const group = [memories[i].id];

      for (let j = i + 1; j < memories.length; j++) {
        if (processed.has(memories[j].id)) continue;
        if (jaccardSimilarity(memories[i].content, memories[j].content) >= threshold) {
          group.push(memories[j].id);
          processed.add(memories[j].id);
        }
      }

      if (group.length > 1) groups.push(group);
      processed.add(memories[i].id);
    }

    return groups;
  } catch (err) {
    console.error('[MEMORY-COMPRESSION] Duplicate scan error:', err);
    return [];
  }
}

function jaccardSimilarity(a: string, b: string): number {
  const setA = new Set(a.toLowerCase().split(/\s+/));
  const setB = new Set(b.toLowerCase().split(/\s+/));
  const intersection = new Set([...setA].filter(w => setB.has(w)));
  const union = new Set([...setA, ...setB]);
  return intersection.size / union.size;
}

/**
 * Merge duplicates → cold storage
 */
export async function mergeDuplicates(groups: string[][]): Promise<number> {
  let mergedCount = 0;

  for (const group of groups) {
    const compressed = await compressMemories(group);
    if (!compressed) continue;

    const { error } = await supabase.from('brain_memory_cold').insert({
      summary: compressed.summary,
      source_refs: compressed.sourceRefs as any,
      compression_level: compressed.compressionLevel,
      tags: { merged: true, original_count: group.length } as any,
    });

    if (!error) {
      await supabase.from('brain_memory_hot').delete().in('id', group);
      mergedCount += group.length;
    }
  }

  return mergedCount;
}
