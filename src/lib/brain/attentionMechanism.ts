/**
 * BRAIN Attention Mechanism v9.1.0 ARCHITECT
 * Priority-weighted memory retrieval with decay and salience scoring
 * Now delegates salience calculation to the unified calculateSalience() in memory-core.
 */
 
import { supabase } from '@/integrations/supabase/client';
import { calculateSalience as coreCalculateSalience, type SalienceResult } from '@/lib/substrate/memory-core';
 export interface AttentionFocus {
   context: string;
   weight: number;
   decay_rate: number;
   created_at: string;
   expires_at: string;
  }
 
export interface AttentionWindow {
  focuses: AttentionFocus[];
  active_memories: number;
  avg_salience: number;
  peak_attention: string | null;
}

// In-memory attention state
let attentionFocuses: AttentionFocus[] = [];

export interface SalienceScore {
  memory_id: string;
  relevance: number;
  recency: number;
  importance: number;
  access_frequency: number;
  reinforcement: number;
  cross_module: number;
  combined_score: number;
}

/**
 * Calculate salience score for a memory — delegates to the unified calculator.
 */
export function calculateSalience(
  memory: {
    id: string;
    content: string;
    value_score?: number;
    access_count?: number;
    created_at: string;
    memory_type?: string;
    reinforcement_count?: number;
    cross_module_refs?: number;
  },
  context: string
): SalienceScore {
  const result = coreCalculateSalience({
    confidence: memory.value_score ?? 0.5,
    access_count: memory.access_count ?? 0,
    created_at: memory.created_at,
    memory_type: (memory.memory_type as any) ?? 'general',
    reinforcement_count: memory.reinforcement_count ?? 0,
    cross_module_refs: memory.cross_module_refs ?? 0,
    query_context: context,
    content: memory.content,
  });

  return {
    memory_id: memory.id,
    relevance: result.factors.relevance,
    recency: result.factors.recency,
    importance: result.factors.confidence,
    access_frequency: result.factors.frequency,
    reinforcement: result.factors.reinforcement,
    cross_module: result.factors.cross_module,
    combined_score: result.score,
  };
}
 
 /**
  * Add a focus context to the attention window
  */
 export function addAttentionFocus(
   context: string,
   options?: {
     weight?: number;
     decay_rate?: number;
     ttl_minutes?: number;
   }
 ): AttentionFocus {
   const now = new Date();
   const ttl = options?.ttl_minutes ?? 30;
   const expires = new Date(now.getTime() + ttl * 60 * 1000);
 
   const focus: AttentionFocus = {
     context,
     weight: options?.weight ?? 1.0,
     decay_rate: options?.decay_rate ?? 0.1,
     created_at: now.toISOString(),
     expires_at: expires.toISOString(),
   };
 
   // Remove expired focuses
   attentionFocuses = attentionFocuses.filter(
     f => new Date(f.expires_at) > now
   );
 
   // Add new focus (or update if context exists)
   const existingIdx = attentionFocuses.findIndex(f => f.context === context);
   if (existingIdx >= 0) {
     attentionFocuses[existingIdx] = focus;
   } else {
     attentionFocuses.push(focus);
   }
 
   return focus;
 }
 
 /**
  * Remove a focus from attention
  */
 export function removeAttentionFocus(context: string): boolean {
   const before = attentionFocuses.length;
   attentionFocuses = attentionFocuses.filter(f => f.context !== context);
   return attentionFocuses.length < before;
 }
 
 /**
  * Get current attention window
  */
 export function getAttentionWindow(): AttentionWindow {
   const now = new Date();
   
   // Apply decay to weights
   const activeFocuses = attentionFocuses
     .filter(f => new Date(f.expires_at) > now)
     .map(f => {
       const ageMinutes = (now.getTime() - new Date(f.created_at).getTime()) / 60000;
       const decayedWeight = f.weight * Math.exp(-f.decay_rate * ageMinutes);
       return { ...f, weight: decayedWeight };
     });
 
   return {
     focuses: activeFocuses,
     active_memories: activeFocuses.length * 10, // Estimated
     avg_salience: activeFocuses.length > 0
       ? activeFocuses.reduce((s, f) => s + f.weight, 0) / activeFocuses.length
       : 0,
     peak_attention: activeFocuses.length > 0
       ? activeFocuses.reduce((a, b) => a.weight > b.weight ? a : b).context
       : null,
   };
 }
 
 /**
  * Query memories with attention-weighted retrieval
  */
 export async function attendedRecall(
   query: string,
   options?: {
     limit?: number;
     min_salience?: number;
     include_context_boost?: boolean;
   }
 ): Promise<{ memories: Array<{ id: string; content: string; salience: SalienceScore }>; attention: AttentionWindow }> {
   const limit = options?.limit ?? 10;
   const minSalience = options?.min_salience ?? 0.1;
 
   // Get attention window
   const attention = getAttentionWindow();
 
   // Build combined context from query + attention focuses
   let combinedContext = query;
   if (options?.include_context_boost !== false) {
     const focusContexts = attention.focuses.map(f => f.context).join(' ');
     combinedContext = `${query} ${focusContexts}`;
   }
 
    try {
      // Fetch from hot and warm tiers in parallel
      const [{ data: hotMemories }, { data: warmMemories }] = await Promise.all([
        supabase
          .from('brain_memory_hot')
          .select('id, content, value_score, access_count, created_at')
          .order('value_score', { ascending: false })
          .limit(50),
        supabase
          .from('brain_memory_warm')
          .select('id, content, value_score, access_count, created_at')
          .order('value_score', { ascending: false })
          .limit(30),
      ]);

      const allMemories = [...(hotMemories || []), ...(warmMemories || [])];

      // Calculate salience for each memory
      const scored = allMemories.map(m => ({
        id: m.id,
        content: m.content,
        salience: calculateSalience(m, combinedContext),
      }));
 
     // Filter by min salience and sort
     const filtered = scored
       .filter(m => m.salience.combined_score >= minSalience)
       .sort((a, b) => b.salience.combined_score - a.salience.combined_score)
       .slice(0, limit);
 
     return { memories: filtered, attention };
   } catch (error) {
     console.error('Attended recall error:', error);
     return { memories: [], attention };
   }
 }
 
 /**
  * Reset all attention focuses
  */
 export function clearAttention(): void {
   attentionFocuses = [];
 }