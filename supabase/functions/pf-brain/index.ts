import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Protected memory types that NEVER get demoted or pruned
const PROTECTED_MEMORY_TYPES = [
  'core_identity',
  'system_awareness', 
  'principles',
  'safety_laws',
  'doctrine_integrated'
];

interface MemoryResult {
  id: string;
  content: string;
  tier: 'hot' | 'warm' | 'cold';
  value_score?: number;
  access_count?: number;
  created_at?: string;
  metadata?: Record<string, unknown>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, data } = await req.json();

    console.log(`🧠 Brain orchestration: ${action}`);

    switch (action) {
      // ============================================
      // UNIFIED RECALL - Searches ALL tiers
      // ============================================
      case 'query':
      case 'recall': {
        const { query_text, limit = 10, tier = 'all' } = data;
        const results: MemoryResult[] = [];
        
        // Search strategy: Hot first (fastest), then Warm, then Cold
        // Boost access count on retrieved memories
        
        if (tier === 'all' || tier === 'hot') {
          const { data: hotMemories } = await supabase
            .from('brain_memory_hot')
            .select('id, content, value_score, access_count, created_at, metadata, context, priority')
            .textSearch('content', query_text, { type: 'websearch' })
            .order('value_score', { ascending: false })
            .limit(limit);
          
          for (const m of hotMemories || []) {
            results.push({ ...m, tier: 'hot' });
            // Boost access count (reinforcement learning)
            await supabase.from('brain_memory_hot')
              .update({ 
                access_count: (m.access_count || 0) + 1,
                last_used: new Date().toISOString()
              })
              .eq('id', m.id);
          }
        }
        
        // If not enough results, search warm tier
        if ((tier === 'all' || tier === 'warm') && results.length < limit) {
          const remaining = limit - results.length;
          const { data: warmMemories } = await supabase
            .from('brain_memory_warm')
            .select('id, content, value_score, access_count, created_at, metadata, context')
            .textSearch('content', query_text, { type: 'websearch' })
            .order('value_score', { ascending: false })
            .limit(remaining);
          
          for (const m of warmMemories || []) {
            results.push({ ...m, tier: 'warm' });
            // Boost warm memory - may trigger promotion
            await supabase.from('brain_memory_warm')
              .update({ 
                access_count: (m.access_count || 0) + 1,
                value_score: Math.min(1, (m.value_score || 0.4) + 0.05)
              })
              .eq('id', m.id);
          }
        }
        
        // If still not enough, search cold tier
        if ((tier === 'all' || tier === 'cold') && results.length < limit) {
          const remaining = limit - results.length;
          const { data: coldMemories } = await supabase
            .from('brain_memory_cold')
            .select('id, summary, value_score, created_at, tags')
            .textSearch('summary', query_text, { type: 'websearch' })
            .order('value_score', { ascending: false })
            .limit(remaining);
          
          for (const m of coldMemories || []) {
            results.push({ 
              id: m.id, 
              content: m.summary, 
              tier: 'cold',
              value_score: m.value_score,
              created_at: m.created_at
            });
          }
        }
        
        // Also search legacy brain_memories table for backward compatibility
        if (tier === 'all' && results.length < limit) {
          const remaining = limit - results.length;
          const { data: legacyMemories } = await supabase
            .from('brain_memories')
            .select('id, content, confidence, memory_type, created_at, metadata')
            .textSearch('content', query_text)
            .order('confidence', { ascending: false })
            .limit(remaining);
          
          for (const m of legacyMemories || []) {
            results.push({ 
              id: m.id, 
              content: m.content, 
              tier: 'hot', // Treat legacy as hot
              value_score: m.confidence,
              created_at: m.created_at,
              metadata: m.metadata
            });
          }
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            memories: results,
            tiers_searched: tier === 'all' ? ['hot', 'warm', 'cold'] : [tier],
            total_found: results.length
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // ============================================
      // REMEMBER - Store new memory in hot tier
      // ============================================
      case 'remember':
      case 'store': {
        const { 
          content, 
          memory_type = 'fact', 
          confidence = 0.8, 
          context = 'substrate',
          priority = 'medium',
          metadata = {} 
        } = data;
        
        // Check if this is a protected memory type
        const isProtected = PROTECTED_MEMORY_TYPES.includes(memory_type);
        
        // Store in hot tier
        const { data: memory, error } = await supabase
          .from('brain_memory_hot')
          .insert({
            content,
            context,
            priority,
            importance_score: confidence,
            value_score: isProtected ? 1.0 : confidence, // Protected always max value
            access_count: 1,
            decay_rate: isProtected ? 0 : 0.02, // Protected never decay
            memory_type,
            tags: { type: memory_type, protected: isProtected },
            metadata: { ...metadata, source: 'brain_orchestration' },
            last_used: new Date().toISOString(),
          })
          .select()
          .single();

        if (error) throw error;

        // Also store in legacy table for backward compatibility
        await supabase.from('brain_memories').insert({
          content,
          memory_type,
          confidence,
          metadata: { ...metadata, hot_memory_id: memory.id },
          source: 'brain_orchestration',
        });

        console.log('✅ Memory stored:', memory.id, isProtected ? '(PROTECTED)' : '');

        return new Response(
          JSON.stringify({ success: true, memory, tier: 'hot', protected: isProtected }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // ============================================
      // FORGET - Decay a memory's value
      // ============================================
      case 'forget': {
        const { memory_id, decay_amount = 0.1 } = data;
        
        // Try hot tier first
        const { data: hotMemory } = await supabase
          .from('brain_memory_hot')
          .select('value_score, tags')
          .eq('id', memory_id)
          .single();

        if (hotMemory) {
          // Check if protected
          const isProtected = (hotMemory.tags as any)?.protected === true;
          if (isProtected) {
            return new Response(
              JSON.stringify({ 
                success: false, 
                error: 'Cannot forget protected memory',
                memory_id,
                protected: true
              }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
          
          const newScore = Math.max(0, (hotMemory.value_score || 0.5) - decay_amount);
          await supabase
            .from('brain_memory_hot')
            .update({ value_score: newScore })
            .eq('id', memory_id);
          
          return new Response(
            JSON.stringify({ success: true, memory_id, new_value_score: newScore, tier: 'hot' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Try warm tier
        const { data: warmMemory } = await supabase
          .from('brain_memory_warm')
          .select('value_score')
          .eq('id', memory_id)
          .single();

        if (warmMemory) {
          const newScore = Math.max(0, (warmMemory.value_score || 0.4) - decay_amount);
          await supabase
            .from('brain_memory_warm')
            .update({ value_score: newScore })
            .eq('id', memory_id);
          
          return new Response(
            JSON.stringify({ success: true, memory_id, new_value_score: newScore, tier: 'warm' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Legacy table fallback
        const { data: legacyMemory } = await supabase
          .from('brain_memories')
          .select('confidence')
          .eq('id', memory_id)
          .single();

        if (legacyMemory) {
          const newConfidence = Math.max(0, (legacyMemory.confidence || 0) - decay_amount);
          await supabase
            .from('brain_memories')
            .update({ confidence: newConfidence })
            .eq('id', memory_id);
          
          return new Response(
            JSON.stringify({ success: true, memory_id, new_confidence: newConfidence, tier: 'legacy' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ success: false, error: 'Memory not found', memory_id }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // ============================================
      // REINFORCE - Boost a memory's value
      // ============================================
      case 'reinforce': {
        const { memory_id, boost_amount = 0.1 } = data;
        
        // Try hot tier first
        const { data: hotMemory } = await supabase
          .from('brain_memory_hot')
          .select('value_score, access_count')
          .eq('id', memory_id)
          .single();

        if (hotMemory) {
          const newScore = Math.min(1, (hotMemory.value_score || 0.5) + boost_amount);
          await supabase
            .from('brain_memory_hot')
            .update({ 
              value_score: newScore,
              access_count: (hotMemory.access_count || 0) + 1,
              last_used: new Date().toISOString()
            })
            .eq('id', memory_id);
          
          return new Response(
            JSON.stringify({ success: true, memory_id, new_value_score: newScore, tier: 'hot' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Try warm tier - reinforce may trigger promotion
        const { data: warmMemory } = await supabase
          .from('brain_memory_warm')
          .select('*')
          .eq('id', memory_id)
          .single();

        if (warmMemory) {
          const newScore = Math.min(1, (warmMemory.value_score || 0.4) + boost_amount);
          
          // If score is high enough, promote to hot
          if (newScore >= 0.7) {
            await supabase.from('brain_memory_hot').insert({
              content: warmMemory.content,
              context: warmMemory.context,
              priority: 'high',
              importance_score: newScore,
              value_score: newScore,
              access_count: (warmMemory.access_count || 0) + 1,
              decay_rate: 0.02,
              tags: warmMemory.tags,
              metadata: { ...warmMemory.metadata, promoted_from: 'warm' },
              last_used: new Date().toISOString(),
            });
            await supabase.from('brain_memory_warm').delete().eq('id', memory_id);
            
            return new Response(
              JSON.stringify({ 
                success: true, 
                memory_id, 
                new_value_score: newScore, 
                action: 'promoted_to_hot' 
              }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
          
          await supabase
            .from('brain_memory_warm')
            .update({ value_score: newScore, access_count: (warmMemory.access_count || 0) + 1 })
            .eq('id', memory_id);
          
          return new Response(
            JSON.stringify({ success: true, memory_id, new_value_score: newScore, tier: 'warm' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ success: false, error: 'Memory not found', memory_id }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // ============================================
      // STATUS - Get memory system health
      // ============================================
      case 'status': {
        const [hotResult, warmResult, coldResult, legacyResult] = await Promise.all([
          supabase.from('brain_memory_hot').select('id', { count: 'exact', head: true }),
          supabase.from('brain_memory_warm').select('id', { count: 'exact', head: true }),
          supabase.from('brain_memory_cold').select('id', { count: 'exact', head: true }),
          supabase.from('brain_memories').select('id', { count: 'exact', head: true }),
        ]);

        const limits = { hot: 500, warm: 2000, cold: 10000 };
        const counts = {
          hot: hotResult.count || 0,
          warm: warmResult.count || 0,
          cold: coldResult.count || 0,
          legacy: legacyResult.count || 0,
        };

        const health = {
          hot: counts.hot <= limits.hot ? 'healthy' : counts.hot <= limits.hot * 2 ? 'warning' : 'overloaded',
          warm: counts.warm <= limits.warm ? 'healthy' : counts.warm <= limits.warm * 2 ? 'warning' : 'overloaded',
          cold: counts.cold <= limits.cold ? 'healthy' : 'warning',
        };

        return new Response(
          JSON.stringify({ 
            success: true,
            counts,
            limits,
            health,
            total: counts.hot + counts.warm + counts.cold + counts.legacy,
            needs_rebalance: counts.hot > limits.hot || counts.warm > limits.warm
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

  } catch (error) {
    console.error('❌ Brain error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
