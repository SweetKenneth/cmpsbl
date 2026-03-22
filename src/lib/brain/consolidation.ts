/**
 * BRAIN Memory Consolidation Engine v3
 * Pattern Extraction & Deduplication
 * 
 * OPTIMIZED: Parallel phases, pre-tokenized similarity, batched cluster ops,
 * single-pass phrase extraction.
 */

import { supabase } from '@/integrations/supabase/client';
import type { Memory } from './memoryTiering';
import { tokenizeToSet, jaccardSimilarity } from './shared';
import { classifyImportance, shouldPreserveIndefinitely, compressForStorage, compactMetadata } from '@/lib/memory/content-dedup';

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

const MAX_PATTERN_CACHE = 500;
const patternCache = new Map<string, MemoryPattern>();

function evictPatternCache(): void {
  if (patternCache.size <= MAX_PATTERN_CACHE) return;
  const excess = patternCache.size - MAX_PATTERN_CACHE;
  const keys = patternCache.keys();
  for (let i = 0; i < excess; i++) {
    const { value } = keys.next();
    if (value) patternCache.delete(value);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONSOLIDATION ENGINE
// ═══════════════════════════════════════════════════════════════════════════════

export async function runConsolidation(
  config: Partial<ConsolidationConfig> = {}
): Promise<ConsolidationResult> {
  const startTime = Date.now();
  const cfg = { ...DEFAULT_CONFIG, ...config };
  
  const result: ConsolidationResult = {
    duplicatesFound: 0, duplicatesRemoved: 0, patternsExtracted: 0,
    memoriesConsolidated: 0, spaceReclaimed: 0, duration: 0,
  };

  try {
    // Phase 1 & 2 can run in parallel: dedup detection + pattern extraction
    const [duplicates, patterns] = await Promise.all([
      findDuplicateClusters(cfg.similarityThreshold),
      extractPatterns(cfg.minPatternFrequency),
    ]);

    result.duplicatesFound = duplicates.reduce((sum, c) => sum + c.duplicates.length, 0);
    result.patternsExtracted = patterns.length;

    if (!cfg.dryRun) {
      // Remove duplicates + store patterns in parallel
      const [dupResults] = await Promise.allSettled([
        Promise.all(duplicates.map(cluster => removeDuplicates(cluster, cfg.preserveHighValue))),
        patterns.length > 0 ? storePatterns(patterns.slice(0, cfg.maxPatternsPerRun)) : Promise.resolve(),
      ]);

      if (dupResults.status === 'fulfilled') {
        for (const removed of dupResults.value) {
          result.duplicatesRemoved += removed;
          result.spaceReclaimed += removed * 500;
        }
      }
    }

    // Phase 3: Consolidate related memories (depends on dedup completing)
    result.memoriesConsolidated = await consolidateRelatedMemories(cfg.similarityThreshold);
  } catch (error) {
    console.error('[Consolidation] Error during consolidation:', error);
  }

  result.duration = Date.now() - startTime;
  
  Promise.resolve(supabase.from('brain_events').insert({
    module: 'brain', event_type: 'consolidation.completed',
    data: result as unknown as Record<string, never>, outcome: 'success',
  })).catch(() => {});

  return result;
}

/**
 * Find clusters of duplicate or near-duplicate memories
 */
export async function findDuplicateClusters(
  threshold: number = 0.85
): Promise<DuplicateCluster[]> {
  const clusters: DuplicateCluster[] = [];
  
  const [{ data: hotMemories }, { data: warmMemories }] = await Promise.all([
    supabase.from('brain_memory_hot')
      .select('id, content, context, value_score, created_at')
      .order('created_at', { ascending: false }).limit(200),
    supabase.from('brain_memory_warm')
      .select('id, content, context, value_score, created_at')
      .order('created_at', { ascending: false }).limit(200),
  ]);

  const allMemories = [
    ...(hotMemories || []).map(m => ({ ...m, tier: 'hot' as const })),
    ...(warmMemories || []).map(m => ({ ...m, tier: 'warm' as const })),
  ];

  // Pre-tokenize all memories once
  const tokenized = allMemories.map(m => ({
    ...m,
    tokens: tokenizeToSet(m.content),
  }));

  const processed = new Set<string>();
  
  for (let i = 0; i < tokenized.length; i++) {
    const memory = tokenized[i];
    if (processed.has(memory.id) || memory.tokens.size === 0) continue;
    
    const similar = [];
    for (let j = i + 1; j < tokenized.length; j++) {
      const other = tokenized[j];
      if (processed.has(other.id) || other.tokens.size === 0) continue;
      
      if (jaccardSimilarity(memory.tokens, other.tokens) >= threshold) {
        similar.push(other);
      }
    }

    if (similar.length > 0) {
      const allInCluster = [memory, ...similar];
      allInCluster.sort((a, b) => (b.value_score ?? 0) - (a.value_score ?? 0));
      
      clusters.push({
        canonical: allInCluster[0] as unknown as Memory,
        duplicates: allInCluster.slice(1) as unknown as Memory[],
        similarity: threshold,
      });
      for (const m of allInCluster) processed.add(m.id);
    }
  }

  return clusters;
}

async function removeDuplicates(cluster: DuplicateCluster, preserveHighValue: boolean): Promise<number> {
  const toRemove = cluster.duplicates.filter(dup => {
    if (preserveHighValue && (dup as any).value_score >= 0.8) return false;
    return true;
  });
  if (toRemove.length === 0) return 0;

  const hotIds = toRemove.filter(d => (d as any).tier === 'hot').map(d => d.id);
  const warmIds = toRemove.filter(d => (d as any).tier !== 'hot').map(d => d.id);
  let removed = 0;

  const deletes: Promise<any>[] = [];
  if (hotIds.length > 0) deletes.push(Promise.resolve(supabase.from('brain_memory_hot').delete().in('id', hotIds)).then(({ error }) => { if (!error) removed += hotIds.length; }));
  if (warmIds.length > 0) deletes.push(Promise.resolve(supabase.from('brain_memory_warm').delete().in('id', warmIds)).then(({ error }) => { if (!error) removed += warmIds.length; }));
  await Promise.all(deletes);

  return removed;
}

/**
 * Extract patterns — optimized phrase extraction
 */
export async function extractPatterns(minFrequency: number = 3): Promise<MemoryPattern[]> {
  const patterns: Map<string, MemoryPattern> = new Map();
  
  const { data: memories } = await supabase
    .from('brain_memory_warm')
    .select('content, context, created_at')
    .order('created_at', { ascending: false })
    .limit(500);

  if (!memories) return [];

  for (const memory of memories) {
    const phrases = extractPhrases(memory.content);
    
    for (const phrase of phrases) {
      const normalizedPhrase = phrase.toLowerCase().trim();
      if (normalizedPhrase.length < 10) continue;

      const existing = patterns.get(normalizedPhrase);
      if (existing) {
        existing.frequency++;
        existing.lastSeen = memory.created_at;
        if (!existing.contexts.includes(memory.context)) existing.contexts.push(memory.context);
        existing.strength = Math.min(1, existing.frequency / 10);
      } else {
        patterns.set(normalizedPhrase, {
          id: crypto.randomUUID(), pattern: normalizedPhrase, frequency: 1,
          contexts: [memory.context], firstSeen: memory.created_at,
          lastSeen: memory.created_at, strength: 0.1,
        });
      }
    }
  }

  return Array.from(patterns.values())
    .filter(p => p.frequency >= minFrequency)
    .sort((a, b) => b.frequency - a.frequency);
}

async function storePatterns(patterns: MemoryPattern[]): Promise<void> {
  for (const pattern of patterns) patternCache.set(pattern.id, pattern);
  evictPatternCache();

  if (patterns.length === 0) return;

  const patternSummary = patterns.slice(0, 10).map(p =>
    `[${p.frequency}x] ${p.pattern.substring(0, 100)}`
  ).join('\n');

  try {
    const { data: existing } = await supabase
      .from('brain_memory_warm')
      .select('id')
      .eq('context', 'pattern_extraction')
      .eq('memory_type', 'pattern')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const content = `[Extracted Patterns]\n${patternSummary}`;
    const meta = { pc: patterns.length, tf: patterns[0]?.frequency };

    if (existing) {
      await supabase.from('brain_memory_warm').update({
        content, value_score: 0.6, metadata: meta,
      }).eq('id', existing.id);
    } else {
      await supabase.from('brain_memory_warm').insert({
        content, context: 'pattern_extraction', value_score: 0.6,
        memory_type: 'pattern', source_module: 'consolidation',
        category: 'patterns', tags: ['auto_extracted', 'consolidation'],
        metadata: meta,
      });
    }
  } catch {
    // Non-critical
  }

  Promise.resolve(supabase.from('brain_events').insert({
    module: 'brain', event_type: 'patterns.extracted',
    data: { count: patterns.length, top: patterns.slice(0, 5).map(p => ({ p: p.pattern.substring(0, 50), f: p.frequency })) } as unknown as Record<string, never>,
    outcome: 'success',
  })).catch(() => {});
}

/**
 * Consolidate related memories — batched cluster operations
 */
async function consolidateRelatedMemories(threshold: number): Promise<number> {
  let consolidated = 0;
  
  try {
    const { data: memories } = await supabase
      .from('brain_memory_warm')
      .select('id, content, context, value_score, created_at')
      .order('context').limit(300);
    
    if (!memories || memories.length === 0) return 0;
    
    // Group by context
    const contextGroups = new Map<string, typeof memories>();
    for (const memory of memories) {
      const group = contextGroups.get(memory.context);
      if (group) group.push(memory);
      else contextGroups.set(memory.context, [memory]);
    }
    
    // Process all context groups in parallel
    const groupResults = await Promise.allSettled(
      Array.from(contextGroups.values())
        .filter(group => group.length >= 3)
        .map(group => consolidateGroup(group, threshold))
    );

    for (const result of groupResults) {
      if (result.status === 'fulfilled') consolidated += result.value;
    }
  } catch (error) {
    console.error('[Consolidation] Error consolidating memories:', error);
  }
  
  return consolidated;
}

/**
 * Consolidate a single context group — finds clusters and merges
 */
async function consolidateGroup(
  group: Array<{ id: string; content: string; context: string; value_score: number | null; created_at: string }>,
  threshold: number
): Promise<number> {
  let consolidated = 0;

  // Pre-tokenize group
  const tokenized = group.map(m => ({ ...m, tokens: tokenizeToSet(m.content) }));
  const processed = new Set<string>();
  const clusters: (typeof tokenized)[] = [];
  
  for (const memory of tokenized) {
    if (processed.has(memory.id)) continue;
    
    const cluster = [memory];
    for (const m of tokenized) {
      if (processed.has(m.id) || m.id === memory.id) continue;
      if (jaccardSimilarity(memory.tokens, m.tokens) >= threshold) {
        cluster.push(m);
        processed.add(m.id);
      }
    }
    
    if (cluster.length >= 2) {
      clusters.push(cluster);
      processed.add(memory.id);
    }
  }

  // Process clusters in parallel
  const clusterResults = await Promise.allSettled(
    clusters.map(async (cluster) => {
      const sortedByValue = [...cluster].sort((a, b) => (b.value_score ?? 0) - (a.value_score ?? 0));
      const primary = sortedByValue[0];
      const secondaryIds = sortedByValue.slice(1).map(m => m.id);
      
      const importance = classifyImportance(
        primary.content, primary.context || 'general',
        primary.value_score ?? 0.5, 0
      );

      if (shouldPreserveIndefinitely(importance)) {
        // Important: keep primary, delete duplicates
        await Promise.resolve(supabase.from('brain_memory_warm').delete().in('id', secondaryIds));
        return secondaryIds.length;
      }

      const relatedSnippets = sortedByValue.slice(1, 3).map(m => m.content.substring(0, 40)).join(' | ');
      const { compressed } = compressForStorage(`${primary.content}\n---\nRelated: ${relatedSnippets}`, primary.context === 'code');
      
      const { error } = await supabase.from('brain_memory_warm')
        .update({ 
          content: compressed, 
          value_score: Math.min(1, (primary.value_score ?? 0.5) + 0.1),
          metadata: compactMetadata({ cf: cluster.length, imp: importance }) as unknown as import('@/integrations/supabase/types').Json,
        })
        .eq('id', primary.id);
      
      if (!error) {
        await supabase.from('brain_memory_warm').update({ value_score: 0.1 }).in('id', secondaryIds);
        return cluster.length;
      }
      return 0;
    })
  );

  for (const r of clusterResults) {
    if (r.status === 'fulfilled') consolidated += r.value;
  }

  return consolidated;
}

export function getCachedPatterns(): MemoryPattern[] { return Array.from(patternCache.values()); }
export function getPattern(id: string): MemoryPattern | undefined { return patternCache.get(id); }
export function clearPatternCache(): void { patternCache.clear(); }

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS — Single-pass phrase extraction
// ═══════════════════════════════════════════════════════════════════════════════

function extractPhrases(text: string): string[] {
  const phrases: string[] = [];
  
  // Single pass: extract sentences (split on .!?) and track word boundaries for trigrams
  let sentStart = 0;
  const words: string[] = [];
  let wordStart = -1;
  const len = text.length;

  for (let i = 0; i <= len; i++) {
    const ch = i < len ? text.charCodeAt(i) : 32;
    
    // Sentence boundary
    if (ch === 46 || ch === 33 || ch === 63) { // . ! ?
      const sent = text.slice(sentStart, i).trim();
      if (sent.length > 10) phrases.push(sent);
      sentStart = i + 1;
    }
    
    // Word boundary tracking for trigrams
    const isSpace = ch === 32 || ch === 9 || ch === 10 || ch === 13;
    if (!isSpace && wordStart === -1) {
      wordStart = i;
    } else if (isSpace && wordStart !== -1) {
      words.push(text.slice(wordStart, i));
      wordStart = -1;
    }
  }

  // Generate trigrams
  for (let i = 0, end = words.length - 2; i < end; i++) {
    const trigram = words[i] + ' ' + words[i + 1] + ' ' + words[i + 2];
    if (trigram.length >= 10) phrases.push(trigram);
  }
  
  return phrases;
}
