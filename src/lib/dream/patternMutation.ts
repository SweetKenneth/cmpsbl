/**
 * DREAM Pattern Mutation Engine
 * Novel idea generation through pattern combination
 */
 
 import { supabase } from '@/integrations/supabase/client';
 
 // Pattern types
 export interface Pattern {
   id: string;
   content: string;
   domain: string;
   frequency: number;
   success_rate: number;
   last_used: string;
 }
 
 export interface MutatedPattern {
   id: string;
   original_patterns: string[];
   mutation_type: 'combination' | 'inversion' | 'analogy' | 'abstraction';
   result: string;
   novelty_score: number;
   confidence: number;
   created_at: string;
 }
 
 export interface MutationConfig {
   max_combinations: number;
   min_novelty_threshold: number;
   include_inversions: boolean;
   cross_domain_enabled: boolean;
 }
 
 // Default configuration
 const DEFAULT_MUTATION_CONFIG: MutationConfig = {
   max_combinations: 10,
   min_novelty_threshold: 0.5,
   include_inversions: true,
   cross_domain_enabled: true,
 };
 
 // Pattern cache
  const patternCache = new Map<string, Pattern>();
  const MAX_PATTERN_CACHE = 500;
  const mutationHistory: MutatedPattern[] = [];
  const MAX_MUTATION_HISTORY = 200;
 
 /**
  * Mutate patterns to generate novel ideas
  */
 export async function mutatePatterns(
   config?: Partial<MutationConfig>
 ): Promise<MutatedPattern[]> {
   const mergedConfig = { ...DEFAULT_MUTATION_CONFIG, ...config };
   const mutations: MutatedPattern[] = [];
   
   // Load patterns from memory
   const patterns = await loadPatterns();
   
   if (patterns.length < 2) {
     return mutations;
   }
   
   // Generate combinations
   for (let i = 0; i < Math.min(mergedConfig.max_combinations, patterns.length - 1); i++) {
     const p1 = patterns[Math.floor(Math.random() * patterns.length)];
     const p2 = patterns[Math.floor(Math.random() * patterns.length)];
     
     if (p1.id === p2.id) continue;
     
     // Check domain compatibility
     if (!mergedConfig.cross_domain_enabled && p1.domain !== p2.domain) continue;
     
     // Generate combination mutation
     const combined = combinePatternsContent(p1.content, p2.content);
     const novelty = calculateNovelty(combined, patterns);
     
     if (novelty >= mergedConfig.min_novelty_threshold) {
       mutations.push({
         id: `mut_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
         original_patterns: [p1.id, p2.id],
         mutation_type: 'combination',
         result: combined,
         novelty_score: novelty,
         confidence: (p1.success_rate + p2.success_rate) / 2,
         created_at: new Date().toISOString(),
       });
     }
     
     // Generate inversion if enabled
     if (mergedConfig.include_inversions && Math.random() > 0.7) {
       const inverted = invertPattern(p1.content);
       const invNovelty = calculateNovelty(inverted, patterns);
       
       if (invNovelty >= mergedConfig.min_novelty_threshold) {
         mutations.push({
           id: `mut_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
           original_patterns: [p1.id],
           mutation_type: 'inversion',
           result: inverted,
           novelty_score: invNovelty,
           confidence: p1.success_rate * 0.7, // Lower confidence for inversions
           created_at: new Date().toISOString(),
         });
       }
     }
   }
   
    // Store mutations (capped)
    mutationHistory.push(...mutations);
    if (mutationHistory.length > MAX_MUTATION_HISTORY) {
      mutationHistory.splice(0, mutationHistory.length - MAX_MUTATION_HISTORY);
    }
   
   // Log mutation event (fire-and-forget)
   if (mutations.length > 0) {
     supabase.from('brain_events').insert({
       module: 'dream',
       event_type: 'patterns.mutated',
       data: {
         count: mutations.length,
         avg_novelty: mutations.reduce((sum, m) => sum + m.novelty_score, 0) / mutations.length,
       } as unknown as Record<string, never>,
       outcome: 'success',
     }).then(({ error }) => {
       if (error) console.error('Failed to log mutation event:', error);
     });
   }
   
   return mutations;
 }
 
 /**
  * Load patterns from brain memory
  */
 async function loadPatterns(): Promise<Pattern[]> {
   // Check cache
   if (patternCache.size > 10) {
     return Array.from(patternCache.values());
   }
   
   // Load from warm memory
   const { data: memories } = await supabase
     .from('brain_memory_warm')
     .select('id, content, context, value_score, access_count')
     .order('value_score', { ascending: false })
     .limit(100);
   
   const patterns: Pattern[] = [];
   
   for (const memory of memories || []) {
     // Extract patterns from content
     const sentences = memory.content.split(/[.!?]+/).filter((s: string) => s.trim().length > 20);
     
     for (const sentence of sentences) {
       const pattern: Pattern = {
         id: `pat_${memory.id}_${patterns.length}`,
         content: sentence.trim(),
         domain: memory.context,
         frequency: memory.access_count || 1,
         success_rate: memory.value_score || 0.5,
         last_used: new Date().toISOString(),
       };
       
        patterns.push(pattern);
        if (patternCache.size >= MAX_PATTERN_CACHE) {
          const oldest = patternCache.keys().next().value;
          if (oldest) patternCache.delete(oldest);
        }
        patternCache.set(pattern.id, pattern);
      }
    }
    
    return patterns;
  }
 
 /**
  * Combine two pattern contents
  */
 function combinePatternsContent(content1: string, content2: string): string {
   // Extract key concepts from each pattern
   const words1 = content1.split(/\s+/).filter(w => w.length > 4);
   const words2 = content2.split(/\s+/).filter(w => w.length > 4);
   
   // Take unique significant words from each
   const combined = [
     ...words1.slice(0, 3),
     'combined with',
     ...words2.slice(0, 3),
   ].join(' ');
   
   return `${combined}: ${content1.split(' ').slice(0, 5).join(' ')} meets ${content2.split(' ').slice(0, 5).join(' ')}`;
 }
 
 /**
  * Invert a pattern (opposite meaning)
  */
 function invertPattern(content: string): string {
   // Simple inversion: negate key verbs/adjectives
   const inversions: Record<string, string> = {
     'always': 'never',
     'never': 'always',
     'increase': 'decrease',
     'decrease': 'increase',
     'faster': 'slower',
     'slower': 'faster',
     'more': 'less',
     'less': 'more',
     'better': 'different',
     'best': 'alternative',
   };
   
   let inverted = content;
   for (const [original, replacement] of Object.entries(inversions)) {
     inverted = inverted.replace(new RegExp(`\\b${original}\\b`, 'gi'), replacement);
   }
   
   return `[Inverted] ${inverted}`;
 }
 
 /**
  * Calculate novelty score for a mutation
  */
  function calculateNovelty(mutation: string, existingPatterns: Pattern[]): number {
    // Calculate how different this is from existing patterns
    const mutationWords = new Set(mutation.toLowerCase().split(/\s+/));
    
    let maxSimilarity = 0;
    
    for (const pattern of existingPatterns) {
      const patternWords = new Set(pattern.content.toLowerCase().split(/\s+/));
      
      // Jaccard similarity
      const intersection = new Set([...mutationWords].filter(w => patternWords.has(w)));
      const union = new Set([...mutationWords, ...patternWords]);
      const similarity = union.size > 0 ? intersection.size / union.size : 0;
      
      if (similarity > maxSimilarity) maxSimilarity = similarity;
    }
    
    // Novelty is inverse of max similarity (most similar = least novel)
    return 1 - maxSimilarity;
  }
 
 /**
  * Get mutation history
  */
 export function getMutationHistory(limit?: number): MutatedPattern[] {
   return mutationHistory.slice(-(limit || 50));
 }
 
 /**
  * Get top mutations by novelty
  */
 export function getTopMutations(limit: number = 10): MutatedPattern[] {
   return [...mutationHistory]
     .sort((a, b) => b.novelty_score - a.novelty_score)
     .slice(0, limit);
 }
 
 /**
  * Clear mutation cache
  */
 export function clearMutationCache(): void {
   patternCache.clear();
   mutationHistory.length = 0;
 }