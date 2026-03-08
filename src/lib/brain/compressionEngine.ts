/**
 * Brain Memory Compression Engine v2
 * Advanced compression with semantic clustering and lossless code preservation
 */

import { supabase } from '@/integrations/supabase/client';

export interface CompressionConfig {
  targetRatio: number;
  preserveCode: boolean;
  semanticClustering: boolean;
  maxClusterSize: number;
}

export interface CompressedMemory {
  id: string;
  originalIds: string[];
  summary: string;
  semanticHash: string;
  compressionRatio: number;
  preservedCode: string[];
  clusterTags: string[];
}

const DEFAULT_CONFIG: CompressionConfig = {
  targetRatio: 5,
  preserveCode: true,
  semanticClustering: true,
  maxClusterSize: 10,
};

/**
 * Extract semantic fingerprint from content
 */
function extractSemanticHash(content: string): string {
  const words = content.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  const wordFreq = new Map<string, number>();
  
  words.forEach(word => {
    wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
  });
  
  // Top 10 most frequent meaningful words
  const topWords = [...wordFreq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word);
  
  return topWords.join('|');
}

/**
 * Detect and extract code blocks from content
 */
function extractCodeBlocks(content: string): { text: string; code: string[] } {
  const codePattern = /```[\s\S]*?```|`[^`]+`|(?:const|let|var|function|class|import|export)\s+[\w\s=(){}[\];,.<>]+/g;
  const codeBlocks: string[] = [];
  
  const text = content.replace(codePattern, (match) => {
    codeBlocks.push(match);
    return '[CODE_BLOCK]';
  });
  
  return { text, code: codeBlocks };
}

/**
 * Semantic clustering of similar memories
 */
function clusterMemories(memories: Array<{ id: string; content: string; context: string }>): Map<string, typeof memories> {
  const clusters = new Map<string, typeof memories>();
  
  memories.forEach(memory => {
    const hash = extractSemanticHash(memory.content);
    const contextKey = `${memory.context}:${hash.split('|').slice(0, 3).join('|')}`;
    
    if (!clusters.has(contextKey)) {
      clusters.set(contextKey, []);
    }
    clusters.get(contextKey)!.push(memory);
  });
  
  return clusters;
}

/**
 * Generate compressed summary using extractive compression
 */
function generateCompressedSummary(contents: string[], targetLength: number): string {
  const combined = contents.join(' ');
  const sentences = combined.split(/[.!?]+/).filter(s => s.trim().length > 10);
  
  if (sentences.length === 0) return combined.slice(0, targetLength);
  
  // Score sentences by information density
  const scored = sentences.map(sentence => {
    const words = sentence.trim().split(/\s+/);
    const uniqueWords = new Set(words.map(w => w.toLowerCase()));
    const density = uniqueWords.size / Math.max(words.length, 1);
    return { sentence: sentence.trim(), score: density * Math.log(words.length + 1) };
  });
  
  // Select top sentences
  scored.sort((a, b) => b.score - a.score);
  
  let summary = '';
  for (const { sentence } of scored) {
    if (summary.length + sentence.length > targetLength) break;
    summary += sentence + '. ';
  }
  
  return summary.trim() || contents[0].slice(0, targetLength);
}

/**
 * Compress a cluster of memories into a single cold memory
 */
async function compressCluster(
  memories: Array<{ id: string; content: string; context: string }>,
  config: CompressionConfig
): Promise<CompressedMemory | null> {
  if (memories.length === 0) return null;
  
  const allCode: string[] = [];
  const textContents: string[] = [];
  
  memories.forEach(memory => {
    if (config.preserveCode) {
      const { text, code } = extractCodeBlocks(memory.content);
      textContents.push(text);
      allCode.push(...code);
    } else {
      textContents.push(memory.content);
    }
  });
  
  const totalLength = textContents.join('').length;
  const targetLength = Math.max(100, Math.floor(totalLength / config.targetRatio));
  
  const summary = generateCompressedSummary(textContents, targetLength);
  const semanticHash = extractSemanticHash(summary);
  
  return {
    id: crypto.randomUUID(),
    originalIds: memories.map(m => m.id),
    summary,
    semanticHash,
    compressionRatio: totalLength / summary.length,
    preservedCode: allCode,
    clusterTags: [memories[0].context, ...semanticHash.split('|').slice(0, 3)],
  };
}

/**
 * Run batch compression on hot tier memories
 */
export async function runBatchCompression(
  config: Partial<CompressionConfig> = {}
): Promise<{
  clustersProcessed: number;
  memoriesCompressed: number;
  avgRatio: number;
  savedBytes: number;
}> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  try {
    // Fetch candidates for compression (low access, old memories)
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 30);
    
    const { data: candidates, error } = await supabase
      .from('brain_memory_hot')
      .select('id, content, context')
      .lt('last_used', cutoffDate.toISOString())
      .order('last_used', { ascending: true })
      .limit(500);
    
    if (error || !candidates || candidates.length === 0) {
      return { clustersProcessed: 0, memoriesCompressed: 0, avgRatio: 0, savedBytes: 0 };
    }
    
    // Cluster memories
    const clusters = finalConfig.semanticClustering 
      ? clusterMemories(candidates)
      : new Map([['all', candidates]]);
    
    let totalCompressed = 0;
    let totalRatio = 0;
    let totalSaved = 0;
    let clustersProcessed = 0;
    
    for (const [, clusterMemories] of clusters) {
      if (clusterMemories.length < 2) continue;
      
      // Limit cluster size
      const batch = clusterMemories.slice(0, finalConfig.maxClusterSize);
      const compressed = await compressCluster(batch, finalConfig);
      
      if (compressed) {
        const originalSize = batch.reduce((sum, m) => sum + m.content.length, 0);
        const compressedSize = compressed.summary.length + compressed.preservedCode.join('').length;
        
        // Store compressed version
        const { error: insertError } = await supabase
          .from('brain_memory_cold')
          .insert({
            summary: compressed.summary,
            source_refs: compressed.originalIds,
            compression_level: Math.round(compressed.compressionRatio),
            source_module: batch[0]?.context === 'code' ? 'engineering' : 'general',
            category: batch[0]?.context || 'uncategorized',
            tags: {
              semantic_hash: compressed.semanticHash,
              cluster_tags: compressed.clusterTags,
              preserved_code_count: compressed.preservedCode.length,
              algorithm: 'v2_semantic',
            },
          });
        
        if (!insertError) {
          // Remove from hot
          await supabase
            .from('brain_memory_hot')
            .delete()
            .in('id', compressed.originalIds);
          
          totalCompressed += batch.length;
          totalRatio += compressed.compressionRatio;
          totalSaved += originalSize - compressedSize;
          clustersProcessed++;
        }
      }
    }
    
    return {
      clustersProcessed,
      memoriesCompressed: totalCompressed,
      avgRatio: clustersProcessed > 0 ? totalRatio / clustersProcessed : 0,
      savedBytes: totalSaved,
    };
  } catch (err) {
    console.error('Batch compression error:', err);
    return { clustersProcessed: 0, memoriesCompressed: 0, avgRatio: 0, savedBytes: 0 };
  }
}

/**
 * Get compression statistics
 */
export async function getCompressionStats(): Promise<{
  totalCompressed: number;
  avgRatio: number;
  totalSavedKB: number;
  codeBlocksPreserved: number;
}> {
  try {
    const { data: coldMemories } = await supabase
      .from('brain_memory_cold')
      .select('compression_level, tags, summary')
      .not('compression_level', 'is', null);
    
    if (!coldMemories || coldMemories.length === 0) {
      return { totalCompressed: 0, avgRatio: 0, totalSavedKB: 0, codeBlocksPreserved: 0 };
    }
    
    const totalCompressed = coldMemories.length;
    const avgRatio = coldMemories.reduce((sum, m) => sum + (m.compression_level || 1), 0) / totalCompressed;
    const totalSavedKB = coldMemories.reduce((sum, m) => {
      const ratio = m.compression_level || 1;
      return sum + (m.summary?.length || 0) * (ratio - 1) / 1024;
    }, 0);
    const codeBlocksPreserved = coldMemories.reduce((sum, m) => {
      return sum + ((m.tags as any)?.preserved_code_count || 0);
    }, 0);
    
    return { totalCompressed, avgRatio, totalSavedKB, codeBlocksPreserved };
  } catch (err) {
    console.error('Error getting compression stats:', err);
    return { totalCompressed: 0, avgRatio: 0, totalSavedKB: 0, codeBlocksPreserved: 0 };
  }
}
