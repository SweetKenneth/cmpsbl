/**
 * Curiosity Scoring Utility
 * Calculates novelty and usefulness scores for learned topics
 */

import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

// Type definitions for database records
interface ReflectionRecord {
  accuracy?: number;
  applied_value?: number;
}

interface MemoryRecord {
  context_tags?: string[];
}

interface CuriosityEntry {
  id: string;
  topic: string;
  curiosity_score?: number;
  novelty_score?: number;
  usefulness_score?: number;
}

/**
 * Score a topic based on novelty and usefulness
 * Novelty: How rare the tags are in existing knowledge
 * Usefulness: How often similar topics have been referenced
 */
export async function scoreCuriosity(
  topic: string,
  tags: string[],
  supabaseClient?: SupabaseClient
) {
  const supabase = supabaseClient || createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  // Adaptive weighting based on reflection outcomes
  let noveltyWeight = 0.6;
  let usefulnessWeight = 0.4;

  try {
    const { data: recentReflections } = await supabase
      .from('brain_reflection_log')
      .select('accuracy, applied_value')
      .order('reflection_date', { ascending: false })
      .limit(50);

    const reflections = (recentReflections || []) as ReflectionRecord[];
    if (reflections.length > 0) {
      const avgAccuracy = reflections.reduce((s, r) => s + (r.accuracy || 0), 0) / reflections.length;
      const avgValue = reflections.reduce((s, r) => s + (r.applied_value || 0), 0) / reflections.length;
      
      // Adjust weights: if accuracy is low, explore more (increase novelty weight)
      // If value is high, focus on usefulness
      noveltyWeight = 0.6 + (0.15 * (1 - avgAccuracy));
      usefulnessWeight = 0.4 + (0.15 * avgValue);
      
      // Normalize to sum to 1.0
      const total = noveltyWeight + usefulnessWeight;
      noveltyWeight /= total;
      usefulnessWeight /= total;
    }
  } catch (err) {
    console.warn('Could not fetch reflections for adaptive scoring:', err);
  }

  // Calculate novelty based on tag rarity
  const { data: allMemories } = await supabase
    .from('brain_memory_hot')
    .select('context_tags');

  const memories = (allMemories || []) as MemoryRecord[];
  const tagFrequency: Record<string, number> = {};
  
  for (const row of memories) {
    const memoryTags = row.context_tags || [];
    memoryTags.forEach((t: string) => {
      tagFrequency[t] = (tagFrequency[t] || 0) + 1;
    });
  }

  // Novelty: inverse frequency (rare tags = high novelty)
  const totalTagOccurrences = tags.reduce(
    (sum, t) => sum + (tagFrequency[t] || 0),
    0
  );
  const novelty = 1 - Math.min(1, totalTagOccurrences / 1000);

  // Usefulness: derived from prior system usage
  const { data: usageLogs } = await supabase
    .from('learning_logs')
    .select('id')
    .ilike('event_type', `%${topic.substring(0, 20)}%`)
    .limit(50);

  const usefulness = Math.min(1, (usageLogs?.length || 0) / 50);

  // Calculate weighted curiosity score using adaptive weights
  const curiosityScore = (novelty * noveltyWeight) + (usefulness * usefulnessWeight);

  // Store the curiosity score with adaptive weights
  const { data: curiosityEntry } = await supabase
    .from('brain_curiosity_log')
    .insert({
      topic,
      context_tags: tags,
      novelty_score: novelty,
      usefulness_score: usefulness
    } as Record<string, unknown>)
    .select()
    .single();

  const entry = curiosityEntry as CuriosityEntry | null;
  return entry?.curiosity_score || curiosityScore;
}

/**
 * Get top curious topics
 */
export async function getTopCuriousTopics(limit = 10) {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  const { data } = await supabase
    .from('brain_curiosity_log')
    .select('*')
    .order('curiosity_score', { ascending: false })
    .limit(limit);

  return data || [];
}
