/**
 * PromptFluid Brain - Memory Pruning Engine
 * Intelligently removes low-value, duplicate, and noise memories
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Patterns that indicate low-value/noise content
const NOISE_PATTERNS = [
  'diagnostic', 'diagnostics', 'test cycle', 'health check', 'heartbeat',
  'status check', 'ping', 'keepalive', 'monitoring', 'telemetry log',
  'connection test', 'system check', 'api test', 'debug output',
];

// Contexts that should be preserved regardless of value score
const PROTECTED_CONTEXTS = [
  'core_identity', 'code', 'architecture', 'security', 'critical',
];

// High-value keywords that boost memory importance
const VALUE_KEYWORDS = [
  'insight', 'discovery', 'pattern', 'strategy', 'solution', 'optimization',
  'breakthrough', 'learning', 'improvement', 'synthesis', 'correlation',
];

interface PruneStats {
  scanned: number;
  pruned_noise: number;
  pruned_duplicates: number;
  pruned_low_value: number;
  preserved: number;
  errors: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const body = await req.json().catch(() => ({}));
    const tier = body.tier || 'all'; // 'hot', 'warm', 'cold', or 'all'
    const dryRun = body.dry_run ?? false;
    const aggressive = body.aggressive ?? false;

    console.log(`🧹 Memory Pruning: tier=${tier}, dryRun=${dryRun}, aggressive=${aggressive}`);

    const stats: PruneStats = {
      scanned: 0,
      pruned_noise: 0,
      pruned_duplicates: 0,
      pruned_low_value: 0,
      preserved: 0,
      errors: 0,
    };

    const pruneCandidate = async (
      memory: any,
      tierName: string,
      reason: string
    ) => {
      if (dryRun) {
        console.log(`[DRY RUN] Would prune: ${memory.id} - ${reason}`);
        return true;
      }

      try {
        // Archive to pruned table
        await supabase.from('brain_memory_pruned').insert({
          original_memory_id: memory.id,
          original_tier: tierName,
          content_preview: (memory.content || memory.summary || '').substring(0, 200),
          context: memory.context || (memory.tags as any)?.context || 'unknown',
          value_score: memory.value_score || 0,
          prune_reason: reason,
        });

        // Delete from source tier
        const table = tierName === 'hot' ? 'brain_memory_hot' 
          : tierName === 'warm' ? 'brain_memory_warm' 
          : 'brain_memory_cold';

        await supabase.from(table).delete().eq('id', memory.id);
        return true;
      } catch (err) {
        console.error(`Prune error for ${memory.id}:`, err);
        stats.errors++;
        return false;
      }
    };

    const isNoisy = (content: string): boolean => {
      const lower = content.toLowerCase();
      return NOISE_PATTERNS.some(pattern => lower.includes(pattern));
    };

    const isProtected = (context: string): boolean => {
      return PROTECTED_CONTEXTS.includes(context);
    };

    const hasValue = (content: string): boolean => {
      const lower = content.toLowerCase();
      return VALUE_KEYWORDS.some(keyword => lower.includes(keyword));
    };

    const calculateTextSimilarity = (a: string, b: string): number => {
      const wordsA = new Set(a.toLowerCase().split(/\s+/).filter(w => w.length > 3));
      const wordsB = new Set(b.toLowerCase().split(/\s+/).filter(w => w.length > 3));
      
      if (wordsA.size === 0 || wordsB.size === 0) return 0;
      
      const intersection = [...wordsA].filter(w => wordsB.has(w)).length;
      const union = new Set([...wordsA, ...wordsB]).size;
      
      return intersection / union; // Jaccard similarity
    };

    // ==================================
    // PRUNE HOT TIER
    // ==================================
    if (tier === 'hot' || tier === 'all') {
      const { data: hotMemories } = await supabase
        .from('brain_memory_hot')
        .select('id, content, context, value_score, created_at')
        .order('value_score', { ascending: true })
        .limit(2000);

      const threshold = aggressive ? 0.3 : 0.15;
      const contentMap = new Map<string, any[]>();

      for (const memory of hotMemories || []) {
        stats.scanned++;
        const content = memory.content || '';
        
        // Skip protected contexts
        if (isProtected(memory.context)) {
          stats.preserved++;
          continue;
        }

        // Check for noise
        if (isNoisy(content)) {
          if (await pruneCandidate(memory, 'hot', 'noise_pattern')) {
            stats.pruned_noise++;
          }
          continue;
        }

        // Check for low value (unless has value keywords)
        if ((memory.value_score || 0) < threshold && !hasValue(content)) {
          if (await pruneCandidate(memory, 'hot', 'low_value')) {
            stats.pruned_low_value++;
          }
          continue;
        }

        // Group by context for duplicate detection
        const key = memory.context || 'default';
        if (!contentMap.has(key)) {
          contentMap.set(key, []);
        }
        contentMap.get(key)!.push(memory);
      }

      // Check for duplicates within context groups
      for (const [context, memories] of contentMap) {
        const pruned = new Set<string>();
        
        for (let i = 0; i < memories.length; i++) {
          if (pruned.has(memories[i].id)) continue;
          
          for (let j = i + 1; j < memories.length; j++) {
            if (pruned.has(memories[j].id)) continue;
            
            const similarity = calculateTextSimilarity(
              memories[i].content,
              memories[j].content
            );
            
            // High similarity = duplicate
            if (similarity > 0.85) {
              // Keep the one with higher value score
              const toRemove = (memories[i].value_score || 0) >= (memories[j].value_score || 0)
                ? memories[j]
                : memories[i];
              
              if (await pruneCandidate(toRemove, 'hot', `duplicate_${similarity.toFixed(2)}`)) {
                stats.pruned_duplicates++;
                pruned.add(toRemove.id);
              }
            }
          }
        }
      }
    }

    // ==================================
    // PRUNE WARM TIER
    // ==================================
    if (tier === 'warm' || tier === 'all') {
      const { data: warmMemories } = await supabase
        .from('brain_memory_warm')
        .select('id, content, context, value_score')
        .order('value_score', { ascending: true })
        .limit(1000);

      const threshold = aggressive ? 0.25 : 0.1;

      for (const memory of warmMemories || []) {
        stats.scanned++;
        const content = memory.content || '';

        if (isProtected(memory.context)) {
          stats.preserved++;
          continue;
        }

        if (isNoisy(content)) {
          if (await pruneCandidate(memory, 'warm', 'noise_pattern')) {
            stats.pruned_noise++;
          }
          continue;
        }

        if ((memory.value_score || 0) < threshold && !hasValue(content)) {
          if (await pruneCandidate(memory, 'warm', 'low_value')) {
            stats.pruned_low_value++;
          }
        }
      }
    }

    // ==================================
    // PRUNE COLD TIER
    // ==================================
    if (tier === 'cold' || tier === 'all') {
      const { data: coldMemories } = await supabase
        .from('brain_memory_cold')
        .select('id, summary, tags, value_score')
        .lt('value_score', aggressive ? 0.15 : 0.05)
        .limit(500);

      for (const memory of coldMemories || []) {
        stats.scanned++;
        const content = memory.summary || '';
        const context = (memory.tags as any)?.context || '';

        if (isProtected(context)) {
          stats.preserved++;
          continue;
        }

        if (isNoisy(content)) {
          if (await pruneCandidate(memory, 'cold', 'noise_pattern')) {
            stats.pruned_noise++;
          }
          continue;
        }

        if (await pruneCandidate(memory, 'cold', 'low_value')) {
          stats.pruned_low_value++;
        }
      }
    }

    const totalPruned = stats.pruned_noise + stats.pruned_duplicates + stats.pruned_low_value;

    // Log event
    if (!dryRun) {
      await supabase.from('brain_events').insert({
        module: 'brain',
        event_type: 'memory_prune',
        data: {
          tier,
          aggressive,
          stats,
          duration_ms: Date.now() - startTime,
        },
        outcome: stats.errors === 0 ? 'success' : 'partial',
      });
    }

    console.log(`✅ Pruning complete: ${totalPruned} removed, ${stats.preserved} preserved`);

    return new Response(JSON.stringify({
      success: true,
      dry_run: dryRun,
      tier,
      aggressive,
      stats,
      summary: {
        total_pruned: totalPruned,
        preserved: stats.preserved,
        errors: stats.errors,
      },
      duration_ms: Date.now() - startTime,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Memory prune error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
