/**
 * BRAIN Attention Mechanism v9.1.0 ARCHITECT
 * Priority-weighted memory retrieval with decay and salience scoring
 */
 
 import { supabase } from '@/integrations/supabase/client';
 
 export interface AttentionFocus {
   context: string;
   weight: number;
   decay_rate: number;
   created_at: string;
   expires_at: string;
 }
 
 export interface SalienceScore {
   memory_id: string;
   relevance: number;
   recency: number;
   importance: number;
   access_frequency: number;
   combined_score: number;
 }
 
 export interface AttentionWindow {
   focuses: AttentionFocus[];
   active_memories: number;
   avg_salience: number;
   peak_attention: string | null;
 }
 
 // In-memory attention state
 let attentionFocuses: AttentionFocus[] = [];
 const ATTENTION_WEIGHTS = {
   relevance: 0.35,
   recency: 0.25,
   importance: 0.25,
   frequency: 0.15,
 };
 
 /**
  * Calculate salience score for a memory
  */
 export function calculateSalience(
   memory: {
     id: string;
     content: string;
     value_score?: number;
     access_count?: number;
     created_at: string;
   },
   context: string
 ): SalienceScore {
   // Calculate relevance using keyword overlap
   const contextWords = new Set(context.toLowerCase().split(/\s+/));
   const contentWords = memory.content.toLowerCase().split(/\s+/);
   const overlap = contentWords.filter(w => contextWords.has(w)).length;
   const relevance = Math.min(1, overlap / Math.max(1, contextWords.size));
 
   // Calculate recency (exponential decay over 30 days)
   const ageMs = Date.now() - new Date(memory.created_at).getTime();
   const ageDays = ageMs / (1000 * 60 * 60 * 24);
   const recency = Math.exp(-ageDays / 30);
 
   // Importance from value score
   const importance = memory.value_score ?? 0.5;
 
   // Access frequency normalized
   const frequency = Math.min(1, (memory.access_count ?? 1) / 100);
 
   // Combined weighted score
   const combined_score =
     relevance * ATTENTION_WEIGHTS.relevance +
     recency * ATTENTION_WEIGHTS.recency +
     importance * ATTENTION_WEIGHTS.importance +
     frequency * ATTENTION_WEIGHTS.frequency;
 
   return {
     memory_id: memory.id,
     relevance,
     recency,
     importance,
     access_frequency: frequency,
     combined_score,
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
     // Fetch from hot tier (most recent/important)
     const { data: hotMemories } = await supabase
       .from('brain_memory_hot')
       .select('id, content, value_score, access_count, created_at')
       .order('value_score', { ascending: false })
       .limit(50);
 
     // Calculate salience for each memory
     const scored = (hotMemories || []).map(m => ({
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