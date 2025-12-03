/**
 * PromptFluid Brain System Initialization
 * Activates the Brain's learning, memory, and orchestration systems
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const sb = createClient(supabaseUrl, supabaseKey);

    console.log('🧠 Initializing PromptFluid Brain...');

    // 1. Set up daily AI quotas for free-tier providers
    const today = new Date().toISOString().split('T')[0];
    const providers = [
      { provider: 'groq', calls_budget: 14400 },      // 14.4k calls/day
      { provider: 'cerebras', calls_budget: 30 },     // 30 calls/day
      { provider: 'deepseek', calls_budget: 50 },     // 50 calls/day
      { provider: 'hyperbolic', calls_budget: 100 },  // 100 calls/day
    ];

    for (const prov of providers) {
      await sb.from('ai_daily_quota').upsert({
        provider: prov.provider,
        date: today,
        calls_budget: prov.calls_budget,
        calls_used: 0,
        tokens_used: 0,
      }, { onConflict: 'provider,date' });
    }

    console.log('✅ AI quotas initialized');

    // 2. Create initial learning queries
    const initialQueries = [
      'What are the latest trends in AI orchestration?',
      'How can machine learning optimize API routing costs?',
      'What are best practices for semantic memory systems?',
    ];

    for (const query of initialQueries) {
      await sb.from('learning_queries').insert({
        query,
        status: 'pending',
        metadata: { source: 'initialization', priority: 'low' }
      });
    }

    console.log('✅ Learning queries seeded');

    // 3. Initialize hot memory with system knowledge
    const initialMemories = [
      {
        content: 'PromptFluid Brain uses dual-tier memory: hot (90 days) and cold (infinite)',
        context: 'System architecture',
        goal_ref: 'make PromptFluid profitable',
        priority: 10,
        tags: { type: 'system', category: 'architecture' }
      },
      {
        content: 'Free-tier AI routing: Groq → Cerebras → DeepSeek → Hyperbolic',
        context: 'Cost optimization',
        goal_ref: 'minimize AI costs',
        priority: 10,
        tags: { type: 'routing', category: 'optimization' }
      },
      {
        content: 'Brain learns from every AI request to improve future routing decisions',
        context: 'Adaptive learning',
        goal_ref: 'improve system intelligence',
        priority: 9,
        tags: { type: 'learning', category: 'intelligence' }
      }
    ];

    for (const mem of initialMemories) {
      await sb.from('brain_memory_hot').insert(mem);
    }

    console.log('✅ Hot memory initialized');

    // 4. Create curiosity settings
    await sb.from('brain_curiosity_settings').upsert({
      id: '00000000-0000-0000-0000-000000000001',
      exploration_rate: 0.3,
      threshold: 0.5,
      settings: {
        domains: ['AI', 'machine learning', 'optimization', 'cost reduction'],
        max_queries_per_day: 10,
        enabled: true
      }
    }, { onConflict: 'id' });

    console.log('✅ Curiosity settings configured');

    // 5. Queue initial action for Brain reflection
    await sb.from('brain_actions_queue').insert({
      action_type: 'nightly_reflection',
      scheduled_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      priority: 5,
      payload: { trigger: 'initialization' }
    });

    console.log('✅ Reflection job queued');

    const status = {
      initialized: true,
      timestamp: new Date().toISOString(),
      components: {
        ai_quotas: 'active',
        learning_queries: 'seeded',
        hot_memory: 'initialized',
        curiosity: 'configured',
        reflection_queue: 'scheduled'
      },
      free_tier_routing: {
        groq: '14.4k calls/day',
        cerebras: '30 calls/day',
        deepseek: '50 calls/day',
        hyperbolic: '100 calls/day'
      },
      next_steps: [
        'Brain will start learning from AI requests',
        'Nightly reflections will optimize system parameters',
        'Memory will grow and consolidate automatically',
        'Cost-aware routing will adapt based on usage patterns'
      ]
    };

    console.log('🎉 Brain initialization complete!');

    return new Response(
      JSON.stringify({ success: true, status }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Brain initialization error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});