/**
 * BRAIN Memory Consolidation Engine
 * Pattern Extraction & Deduplication
 * 
 * Memory consolidation and pattern extraction during low-activity
 * periods to improve recall efficiency.
 */

import { supabase } from '@/integrations/supabase/client';
import type { Memory } from './memoryTiering';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface ConsolidationResult {
  duplicatesFound: number;
  duplicatesRemoved: number;
  patternsExtracted: number;
  memoriesConsolidated: number;
  spaceReclaimed: number;
  duration: number;
}

export interface MemoryPattern {
  id: string;
  pattern: string;
  frequency: number;
  contexts: string[];
  firstSeen: string;
  lastSeen: string;
  strength: number;
}

export interface DuplicateCluster {
  canonical: Memory;
  duplicates: Memory[];
  similarity: number;
}

export interface ConsolidationConfig {
  similarityThreshold: number;
  minPatternFrequency: number;
  maxPatternsPerRun: number;
  preserveHighValue: boolean;
  dryRun: boolean;
}

const DEFAULT_CONFIG: ConsolidationConfig = {
  similarityThreshold: 0.85,
  minPatternFrequency: 3,
  maxPatternsPerRun: 100,
  preserveHighValue: true,
  dryRun: false,
};

// In-memory pattern cache
const patternCache = new Map<string, MemoryPattern>();

// ═══════════════════════════════════════════════════════════════════════════════
// CONSOLIDATION ENGINE
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Run full memory consolidation cycle
 */
export async function runConsolidation(
  config: Partial<ConsolidationConfig> = {}
): Promise<ConsolidationResult> {
  const startTime = Date.now();
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  
  const result: ConsolidationResult = {
    duplicatesFound: 0,
    duplicatesRemoved: 0,
    patternsExtracted: 0,
    memoriesConsolidated: 0,
    spaceReclaimed: 0,
    duration: 0,
  };

  try {
    // Step 1: Find duplicate clusters
    const duplicates = await findDuplicateClusters(mergedConfig.similarityThreshold);
    result.duplicatesFound = duplicates.reduce((sum, c) => sum + c.duplicates.length, 0);

    // Step 2: Remove duplicates (keep canonical)
    if (!mergedConfig.dryRun) {
      for (const cluster of duplicates) {
        const removed = await removeDuplicates(cluster, mergedConfig.preserveHighValue);
        result.duplicatesRemoved += removed;
        result.spaceReclaimed += removed * 500; // Estimate 500 bytes per memory
      }
    }

    // Step 3: Extract patterns
    const patterns = await extractPatterns(mergedConfig.minPatternFrequency);
    result.patternsExtracted = patterns.length;

    // Step 4: Store patterns
    if (!mergedConfig.dryRun && patterns.length > 0) {
      await storePatterns(patterns.slice(0, mergedConfig.maxPatternsPerRun));
    }

    // Step 5: Consolidate related memories
    const consolidated = await consolidateRelatedMemories(mergedConfig.similarityThreshold);
    result.memoriesConsolidated = consolidated;

  } catch (error) {
    console.error('[Consolidation] Error during consolidation:', error);
  }

  result.duration = Date.now() - startTime;
  
  // Log consolidation event
  await supabase.from('brain_events').insert({
    module: 'brain',
    event_type: 'consolidation.completed',
    data: result as unknown as Record<string, never>,
    outcome: 'success',
  });

  return result;
}

/**
 * Find clusters of duplicate or near-duplicate memories
 */
export async function findDuplicateClusters(
  threshold: number = 0.85
): Promise<DuplicateCluster[]> {
  const clusters: DuplicateCluster[] = [];
  
  // Fetch recent memories from hot and warm tiers (only needed columns)
  const { data: hotMemories } = await supabase
    .from('brain_memory_hot')
    .select('id, content, context, value_score, created_at')
    .order('created_at', { ascending: false })
    .limit(500);

  const { data: warmMemories } = await supabase
    .from('brain_memory_warm')
    .select('id, content, context, value_score, created_at')
    .order('created_at', { ascending: false })
    .limit(500);

  const allMemories = [
    ...(hotMemories || []).map(m => ({ ...m, tier: 'hot' as const })),
    ...(warmMemories || []).map(m => ({ ...m, tier: 'warm' as const })),
  ];

  // Simple content-based similarity clustering
  const processed = new Set<string>();
  
  for (const memory of allMemories) {
    if (processed.has(memory.id)) continue;
    
    const similar = allMemories.filter(m => {
      if (m.id === memory.id || processed.has(m.id)) return false;
      const sim = calculateContentSimilarity(memory.content, m.content);
      return sim >= threshold;
    });

    if (similar.length > 0) {
      // Pick highest value score as canonical
      const allInCluster = [memory, ...similar];
      allInCluster.sort((a, b) => (b.value_score ?? 0) - (a.value_score ?? 0));
      
      clusters.push({
        canonical: allInCluster[0] as unknown as Memory,
        duplicates: allInCluster.slice(1) as unknown as Memory[],
        similarity: threshold,
      });

      allInCluster.forEach(m => processed.add(m.id));
    }
  }

  return clusters;
}

/**
 * Remove duplicate memories, keeping the canonical version
 */
async function removeDuplicates(
  cluster: DuplicateCluster,
  preserveHighValue: boolean
): Promise<number> {
  let removed = 0;
  
  for (const dup of cluster.duplicates) {
    // Skip high-value memories if preservation enabled
    if (preserveHighValue && (dup as any).value_score >= 0.8) {
      continue;
    }

    const tier = (dup as any).tier || 'warm';
    const table = tier === 'hot' ? 'brain_memory_hot' : 'brain_memory_warm';
    
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', dup.id);

    if (!error) {
      removed++;
    }
  }

  return removed;
}

/**
 * Extract recurring patterns from memory content
 */
export async function extractPatterns(
  minFrequency: number = 3
): Promise<MemoryPattern[]> {
  const patterns: Map<string, MemoryPattern> = new Map();
  
  // Get recent memories for pattern extraction
  const { data: memories } = await supabase
    .from('brain_memory_warm')
    .select('content, context, created_at')
    .order('created_at', { ascending: false })
    .limit(1000);

  if (!memories) return [];

  // Extract n-grams and phrases
  for (const memory of memories) {
    const phrases = extractPhrases(memory.content);
    
    for (const phrase of phrases) {
      const normalizedPhrase = phrase.toLowerCase().trim();
      if (normalizedPhrase.length < 10) continue;

      if (patterns.has(normalizedPhrase)) {
        const existing = patterns.get(normalizedPhrase)!;
        existing.frequency++;
        existing.lastSeen = memory.created_at;
        if (!existing.contexts.includes(memory.context)) {
          existing.contexts.push(memory.context);
        }
        existing.strength = Math.min(1, existing.frequency / 10);
      } else {
        patterns.set(normalizedPhrase, {
          id: crypto.randomUUID(),
          pattern: normalizedPhrase,
          frequency: 1,
          contexts: [memory.context],
          firstSeen: memory.created_at,
          lastSeen: memory.created_at,
          strength: 0.1,
        });
      }
    }
  }

  // Filter by minimum frequency
  return Array.from(patterns.values())
    .filter(p => p.frequency >= minFrequency)
    .sort((a, b) => b.frequency - a.frequency);
}

/**
 * Store extracted patterns for future use
 */
async function storePatterns(patterns: MemoryPattern[]): Promise<void> {
  for (const pattern of patterns) {
    patternCache.set(pattern.id, pattern);
  }

  // Persist patterns — update existing pattern memory or create new one
  if (patterns.length > 0) {
    const patternSummary = patterns.slice(0, 10).map(p =>
      `[${p.frequency}x] ${p.pattern.substring(0, 100)}`
    ).join('\n');

    try {
      // Check for existing pattern extraction memory to avoid duplicates
      const { data: existing } = await supabase
        .from('brain_memory_warm')
        .select('id')
        .eq('context', 'pattern_extraction')
        .eq('memory_type', 'pattern')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existing) {
        // Update existing pattern memory instead of creating duplicates
        await supabase.from('brain_memory_warm').update({
          content: `[Extracted Patterns]\n${patternSummary}`,
          value_score: 0.6,
          metadata: {
            pattern_count: patterns.length,
            top_frequency: patterns[0]?.frequency,
            extracted_at: new Date().toISOString(),
          },
        }).eq('id', existing.id);
      } else {
        await supabase.from('brain_memory_warm').insert({
          content: `[Extracted Patterns]\n${patternSummary}`,
          context: 'pattern_extraction',
          value_score: 0.6,
          memory_type: 'pattern',
          source_module: 'consolidation',
          category: 'patterns',
          tags: ['auto_extracted', 'consolidation'],
          metadata: {
            pattern_count: patterns.length,
            top_frequency: patterns[0]?.frequency,
            extracted_at: new Date().toISOString(),
          },
        });
      }
    } catch {
      // Non-critical — in-memory cache is still populated
    }
  }

  // Log pattern extraction
  await supabase.from('brain_events').insert({
    module: 'brain',
    event_type: 'patterns.extracted',
    data: {
      count: patterns.length,
      topPatterns: patterns.slice(0, 5).map(p => ({
        pattern: p.pattern.substring(0, 50),
        frequency: p.frequency,
      })),
    } as unknown as Record<string, never>,
    outcome: 'success',
  });
}

/**
 * Consolidate related memories into summary memories
 */
async function consolidateRelatedMemories(threshold: number): Promise<number> {
  let consolidated = 0;
  
  try {
    // Fetch memories grouped by context
    const { data: memories } = await supabase
      .from('brain_memory_warm')
      .select('id, content, context, value_score, created_at')
      .order('context')
      .limit(500);
    
    if (!memories || memories.length === 0) return 0;
    
    // Group by context
    const contextGroups = new Map<string, typeof memories>();
    for (const memory of memories) {
      const group = contextGroups.get(memory.context) || [];
      group.push(memory);
      contextGroups.set(memory.context, group);
    }
    
    // Process groups with multiple similar entries
    for (const [context, group] of contextGroups.entries()) {
      if (group.length < 3) continue;
      
      // Find clusters of similar content
      const clusters: typeof memories[] = [];
      const processed = new Set<string>();
      
      for (const memory of group) {
        if (processed.has(memory.id)) continue;
        
        const cluster = group.filter(m => {
          if (processed.has(m.id) || m.id === memory.id) return false;
          return calculateContentSimilarity(memory.content, m.content) >= threshold;
        });
        
        if (cluster.length > 0) {
          cluster.push(memory);
          clusters.push(cluster);
          cluster.forEach(m => processed.add(m.id));
        }
      }
      
      // Consolidate each cluster into a summary
      for (const cluster of clusters) {
        if (cluster.length < 2) continue;
        
        // Create consolidated summary
        const sortedByValue = [...cluster].sort((a, b) => 
          (b.value_score ?? 0) - (a.value_score ?? 0)
        );
        
        const primary = sortedByValue[0];
        const secondaryIds = sortedByValue.slice(1).map(m => m.id);
        
        // Update primary with consolidated content
        const consolidatedContent = `[Consolidated from ${cluster.length} memories]\n\n${primary.content}\n\n---\nRelated: ${sortedByValue.slice(1, 3).map(m => m.content.substring(0, 50)).join(' | ')}`;
        
        const { error: updateError } = await supabase
          .from('brain_memory_warm')
          .update({
            content: consolidatedContent,
            value_score: Math.min(1, (primary.value_score ?? 0.5) + 0.1),
          })
          .eq('id', primary.id);
        
        if (!updateError) {
          // Mark secondary memories as consolidated (lower value)
          await supabase
            .from('brain_memory_warm')
            .update({ value_score: 0.1 })
            .in('id', secondaryIds);
          
          consolidated += cluster.length;
        }
      }
    }
  } catch (error) {
    console.error('[Consolidation] Error consolidating memories:', error);
  }
  
  return consolidated;
}

/**
 * Get cached patterns
 */
export function getCachedPatterns(): MemoryPattern[] {
  return Array.from(patternCache.values());
}

/**
 * Get pattern by ID
 */
export function getPattern(id: string): MemoryPattern | undefined {
  return patternCache.get(id);
}

/**
 * Clear pattern cache
 */
export function clearPatternCache(): void {
  patternCache.clear();
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Calculate content similarity using Jaccard similarity on tokens
 */
function calculateContentSimilarity(a: string, b: string): number {
  const tokensA = new Set(tokenize(a));
  const tokensB = new Set(tokenize(b));
  
  if (tokensA.size === 0 || tokensB.size === 0) return 0;
  
  const intersection = new Set([...tokensA].filter(x => tokensB.has(x)));
  const union = new Set([...tokensA, ...tokensB]);
  
  return intersection.size / union.size;
}

/**
 * Tokenize text into words
 */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 2);
}

/**
 * Extract meaningful phrases from text
 */
function extractPhrases(text: string): string[] {
  const phrases: string[] = [];
  
  // Split by sentence boundaries
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
  phrases.push(...sentences.map(s => s.trim()));
  
  // Extract noun phrases (simplified)
  const words = text.split(/\s+/);
  for (let i = 0; i < words.length - 2; i++) {
    const trigram = words.slice(i, i + 3).join(' ');
    if (trigram.length >= 10) {
      phrases.push(trigram);
    }
  }
  
  return phrases;
}
