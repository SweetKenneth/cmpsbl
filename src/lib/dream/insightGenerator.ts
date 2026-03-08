/**
 * DREAM Insight Generator
 * Pattern-based insight generation from memories
 */
 
 import { supabase } from '@/integrations/supabase/client';
 
 export type InsightType = 
   | 'pattern_recognition'
   | 'anomaly_detection'
   | 'trend_analysis'
   | 'correlation'
   | 'prediction';
 
 export type InsightConfidence = 'low' | 'medium' | 'high' | 'very_high';
 
 export interface GeneratedInsight {
   id: string;
   type: InsightType;
   title: string;
   description: string;
   confidence: InsightConfidence;
   confidence_score: number;
   evidence: string[];
   implications: string[];
   source_memories: string[];
   generated_at: string;
   actionable: boolean;
   tags: string[];
 }
 
 export interface InsightGeneratorConfig {
   min_evidence_count: number;
   min_confidence: number;
   pattern_threshold: number;
   max_insights_per_run: number;
 }
 
 // Configuration
 let config: InsightGeneratorConfig = {
   min_evidence_count: 3,
   min_confidence: 0.6,
   pattern_threshold: 0.7,
   max_insights_per_run: 10,
 };
 
 // Generated insights cache
 const insightsCache: GeneratedInsight[] = [];
 
 /**
  * Generate insight ID
  */
 function generateInsightId(): string {
   return `insight_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
 }
 
 /**
  * Calculate confidence level
  */
 function getConfidenceLevel(score: number): InsightConfidence {
   if (score >= 0.9) return 'very_high';
   if (score >= 0.75) return 'high';
   if (score >= 0.5) return 'medium';
   return 'low';
 }
 
 /**
  * Find patterns in text content
  */
 function extractPatterns(texts: string[]): Map<string, number> {
   const patterns = new Map<string, number>();
   const stopWords = new Set(['the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'to', 'of', 'and', 'or', 'in', 'on', 'at', 'for', 'with']);
 
   for (const text of texts) {
     const words = text.toLowerCase().split(/\s+/).filter(w => w.length > 3 && !stopWords.has(w));
     const seen = new Set<string>();
 
     for (const word of words) {
       if (!seen.has(word)) {
         patterns.set(word, (patterns.get(word) ?? 0) + 1);
         seen.add(word);
       }
     }
 
     // Bigrams
     for (let i = 0; i < words.length - 1; i++) {
       const bigram = `${words[i]} ${words[i + 1]}`;
       if (!seen.has(bigram)) {
         patterns.set(bigram, (patterns.get(bigram) ?? 0) + 1);
         seen.add(bigram);
       }
     }
   }
 
   return patterns;
 }
 
 /**
  * Generate insights from recent memories
  */
 export async function generateInsights(options?: {
   memory_limit?: number;
   context_filter?: string;
 }): Promise<GeneratedInsight[]> {
   const insights: GeneratedInsight[] = [];
   const limit = options?.memory_limit ?? 100;
 
   try {
     // Fetch recent memories
     const { data: hotMemories } = await supabase
       .from('brain_memory_hot')
       .select('id, content, context, tags, value_score, created_at')
       .order('created_at', { ascending: false })
       .limit(limit);
 
     const memories = hotMemories ?? [];
     if (memories.length < config.min_evidence_count) {
       return insights;
     }
 
     // Extract patterns
     const contents = memories.map(m => m.content);
     const patterns = extractPatterns(contents);
 
     // Find significant patterns
     const significantPatterns: Array<{ pattern: string; count: number; ratio: number }> = [];
     const threshold = memories.length * config.pattern_threshold / 10;
 
     for (const [pattern, count] of patterns.entries()) {
       if (count >= threshold && count >= config.min_evidence_count) {
         significantPatterns.push({
           pattern,
           count,
           ratio: count / memories.length,
         });
       }
     }
 
     // Sort by frequency
     significantPatterns.sort((a, b) => b.count - a.count);
 
     // Generate pattern recognition insights
     for (const { pattern, count, ratio } of significantPatterns.slice(0, 5)) {
       const confidenceScore = Math.min(1, ratio * 1.5 + count / memories.length);
       
       if (confidenceScore >= config.min_confidence) {
         const matchingMemories = memories.filter(m => 
           m.content.toLowerCase().includes(pattern)
         );
 
         insights.push({
           id: generateInsightId(),
           type: 'pattern_recognition',
           title: `Recurring theme: "${pattern}"`,
           description: `Pattern "${pattern}" appears in ${count} of ${memories.length} recent memories (${(ratio * 100).toFixed(0)}%)`,
           confidence: getConfidenceLevel(confidenceScore),
           confidence_score: confidenceScore,
           evidence: matchingMemories.slice(0, 3).map(m => m.content.substring(0, 100)),
           implications: [
             'This topic may be significant to current context',
             'Consider consolidating related memories',
             'May indicate emerging priority',
           ],
           source_memories: matchingMemories.slice(0, 5).map(m => m.id),
           generated_at: new Date().toISOString(),
           actionable: true,
           tags: [pattern, 'pattern', 'auto-generated'],
         });
       }
     }
 
     // Analyze context distribution
     const contextCounts = new Map<string, number>();
     for (const m of memories) {
       const ctx = m.context || 'unknown';
       contextCounts.set(ctx, (contextCounts.get(ctx) ?? 0) + 1);
     }
 
     // Find dominant context
     let maxContext = '';
     let maxCount = 0;
     for (const [ctx, count] of contextCounts.entries()) {
       if (count > maxCount) {
         maxContext = ctx;
         maxCount = count;
       }
     }
 
     if (maxCount >= memories.length * 0.4 && maxCount >= config.min_evidence_count) {
       const ratio = maxCount / memories.length;
       const confidenceScore = ratio * 0.9;
 
       insights.push({
         id: generateInsightId(),
         type: 'trend_analysis',
         title: `Dominant context: ${maxContext}`,
         description: `${(ratio * 100).toFixed(0)}% of recent memories share context "${maxContext}"`,
         confidence: getConfidenceLevel(confidenceScore),
         confidence_score: confidenceScore,
         evidence: [`${maxCount} memories in context "${maxContext}"`, `${memories.length} total memories analyzed`],
         implications: [
           'Focus may be concentrated in this area',
           'Consider broadening context diversity',
           'May indicate current priority or project',
         ],
         source_memories: memories.filter(m => m.context === maxContext).slice(0, 5).map(m => m.id),
         generated_at: new Date().toISOString(),
         actionable: true,
         tags: [maxContext, 'trend', 'context', 'auto-generated'],
       });
     }
 
     // Store in cache
      const toStore = insights.slice(0, config.max_insights_per_run);
      insightsCache.push(...toStore);
      if (insightsCache.length > 100) {
        insightsCache.splice(0, insightsCache.length - 100);
      }

     return insights.slice(0, config.max_insights_per_run);
   } catch (error) {
     console.error('Insight generation error:', error);
     return insights;
   }
 }
 
 /**
  * Get cached insights
  */
 export function getCachedInsights(filter?: {
   type?: InsightType;
   min_confidence?: InsightConfidence;
   actionable_only?: boolean;
 }): GeneratedInsight[] {
   let results = [...insightsCache];
 
   if (filter?.type) {
     results = results.filter(i => i.type === filter.type);
   }
 
   if (filter?.min_confidence) {
     const confidenceOrder: Record<InsightConfidence, number> = {
       low: 0,
       medium: 1,
       high: 2,
       very_high: 3,
     };
     const minLevel = confidenceOrder[filter.min_confidence];
     results = results.filter(i => confidenceOrder[i.confidence] >= minLevel);
   }
 
   if (filter?.actionable_only) {
     results = results.filter(i => i.actionable);
   }
 
   return results.sort((a, b) => b.confidence_score - a.confidence_score);
 }
 
 /**
  * Mark insight as acted upon
  */
 export function acknowledgeInsight(insightId: string): boolean {
   const idx = insightsCache.findIndex(i => i.id === insightId);
   if (idx !== -1) {
     insightsCache[idx].actionable = false;
     return true;
   }
   return false;
 }
 
 /**
  * Get insight generator statistics
  */
 export function getInsightStats(): {
   total_generated: number;
   by_type: Record<InsightType, number>;
   avg_confidence: number;
   actionable_count: number;
 } {
   const byType: Record<InsightType, number> = {
     pattern_recognition: 0,
     anomaly_detection: 0,
     trend_analysis: 0,
     correlation: 0,
     prediction: 0,
   };
 
   let totalConfidence = 0;
   let actionableCount = 0;
 
   for (const insight of insightsCache) {
     byType[insight.type]++;
     totalConfidence += insight.confidence_score;
     if (insight.actionable) actionableCount++;
   }
 
   return {
     total_generated: insightsCache.length,
     by_type: byType,
     avg_confidence: insightsCache.length > 0 ? totalConfidence / insightsCache.length : 0,
     actionable_count: actionableCount,
   };
 }
 
 /**
  * Update generator configuration
  */
 export function updateInsightConfig(updates: Partial<InsightGeneratorConfig>): InsightGeneratorConfig {
   config = { ...config, ...updates };
   return { ...config };
 }
 
 /**
  * Clear insight cache
  */
 export function clearInsightCache(): void {
   insightsCache.length = 0;
 }