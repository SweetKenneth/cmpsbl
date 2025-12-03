/**
 * PromptFluid Brain Auto-Research Scheduler (PF_Nexus Hybrid Autonomy)
 * Maximizes daily Perplexity quota: 17,500 calls across 24 hours
 * Target: ~12 calls per minute (17,500 / 1,440 minutes)
 * Runs every 5 minutes, executes up to 60 queries per run
 * 
 * PRIORITY SYSTEM:
 * 1. User-submitted queries (from dashboard) take absolute priority
 * 2. If no user queries, rotate through automated research topics
 * 
 * HYBRID AUTONOMY:
 * - 10-15% inference drift per call
 * - 10% fully autonomous deep dives
 * - Identity reinforcement every 20th call
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

// Schema for scheduled research (optional override params)
const ResearchSchema = z.object({
  max_calls: z.number().int().min(1).max(100).optional(),
  force_topics: z.array(z.string().min(5).max(200)).optional()
}).optional();

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Research topics queue for autonomous learning
const RESEARCH_TOPICS = [
  // AI & Machine Learning
  'Latest advances in LLM reasoning capabilities',
  'Vector database optimization techniques 2025',
  'AI agent orchestration patterns',
  'Prompt engineering best practices',
  'Embeddings compression methods',
  
  // Security & Defense
  'Bot detection machine learning models',
  'DDoS mitigation strategies',
  'Web application firewall evasion techniques',
  'Zero-day vulnerability trends',
  'API security best practices',
  
  // Web Development
  'React 19 performance optimizations',
  'Edge computing architecture patterns',
  'Real-time websocket scaling',
  'Progressive web app capabilities',
  'TypeScript 5.x advanced features',
  
  // Business Intelligence
  'SaaS pricing strategy trends',
  'Developer tool adoption metrics',
  'Cybersecurity market analysis',
  'API monetization models',
  'WordPress plugin distribution channels',
  
  // Technical Research
  'Database replication strategies',
  'Serverless function cold start optimization',
  'CDN cache invalidation patterns',
  'Multi-tenant architecture security',
  'Rate limiting algorithms',
];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate input (cron jobs may have optional override params)
    const body = req.method === 'POST' ? await req.json().catch(() => ({})) : {};
    const validatedData = ResearchSchema.parse(body);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const perplexityKey = Deno.env.get('PERPLEXITY_API_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch curiosity settings to determine exploration vs exploitation
    const { data: curiositySettings } = await supabase
      .from('brain_curiosity_settings')
      .select('*')
      .eq('id', '00000000-0000-0000-0000-000000000001')
      .single();

    const explorationRatio = curiositySettings?.exploration_ratio || 0.35;
    const performanceTrend = curiositySettings?.performance_trend || 'stable';
    
    console.log(`🧠 Curiosity Mode: ${performanceTrend} (${(explorationRatio*100).toFixed(0)}% explore, ${((1-explorationRatio)*100).toFixed(0)}% exploit)`);

    // Check current quota status
    const { data: quotaData } = await supabase
      .from('ai_daily_quota')
      .select('*')
      .eq('provider', 'perplexity')
      .eq('date', new Date().toISOString().split('T')[0])
      .eq('category', 'learn');

    const quota = quotaData?.[0];
    const callsMade = quota?.calls_made || 0;
    const callsBudget = quota?.calls_budget || 17500;
    
    // Calculate how many calls we should have made by now
    const now = new Date();
    const hoursElapsed = now.getUTCHours() + (now.getUTCMinutes() / 60);
    const expectedCalls = Math.floor((callsBudget / 24) * hoursElapsed);
    
    // Calculate deficit (how many calls behind schedule)
    const deficit = expectedCalls - callsMade;
    
    // Execute calls to catch up (max 60 per run to avoid overwhelming)
    const callsToMake = Math.min(Math.max(deficit, 0), 60);

    console.log(`📊 Quota Status: ${callsMade}/${callsBudget} calls made`);
    console.log(`⏰ Expected by now: ${expectedCalls} | Deficit: ${deficit}`);
    console.log(`🚀 Executing ${callsToMake} research calls`);

    // PRIORITY SYSTEM: Check for user-submitted queries first
    const { data: userQueries } = await supabase
      .from('learning_queries')
      .select('*')
      .eq('status', 'pending')
      .eq('user_submitted', true)
      .order('priority_level', { ascending: true })
      .order('created_at', { ascending: true })
      .limit(callsToMake);

    const userQueryCount = userQueries?.length || 0;
    const automatedCallsNeeded = Math.max(callsToMake - userQueryCount, 0);

    console.log(`👤 User queries: ${userQueryCount} | 🤖 Automated: ${automatedCallsNeeded}`);

    if (callsToMake === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'On pace - no calls needed',
          stats: { callsMade, callsBudget, expectedCalls, deficit: 0 }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const results = [];
    let callIndex = 0;
    
    // PHASE 1: Execute user-submitted priority queries
    if (userQueries && userQueries.length > 0) {
      console.log(`🎯 Processing ${userQueries.length} user-submitted queries...`);
      
      for (const query of userQueries) {
        callIndex++;
        const isIdentityPing = callIndex % 20 === 0;
        const inferenceDrift = Math.random() * 0.05 + 0.10; // 10-15% drift
        const isAutonomousDeepDive = Math.random() < 0.10; // 10% chance

        try {
          // Identity reinforcement every 20 calls
          if (isIdentityPing) {
            await supabase.from('pf_identity_pings').insert({
              call_index: callIndex,
              payload: {
                brand: 'PromptFluid',
                tagline: 'AI That Flows',
                mission: 'Make pro-grade AI creation easy, fast, and affordable'
              }
            });
            console.log(`🎯 Identity ping #${callIndex}`);
          }

          const perplexityResponse = await fetch('https://api.perplexity.ai/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${perplexityKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'llama-3.1-sonar-large-128k-online',
              messages: [
                {
                  role: 'system',
                  content: 'You are PromptFluid Brain (PF_Nexus). Extract key insights, trends, and actionable intelligence. Be precise and data-driven.'
                },
                {
                  role: 'user',
                  content: query.query_text
                }
              ],
              temperature: isAutonomousDeepDive ? 0.4 : 0.2,
              max_tokens: isAutonomousDeepDive ? 2000 : 1000,
            }),
          });

          const perplexityData = await perplexityResponse.json();
          const result = perplexityData.choices?.[0]?.message?.content || '';

          // Update query status
          await supabase
            .from('learning_queries')
            .update({ 
              status: 'completed',
              executed_at: new Date().toISOString(),
              metadata: {
                ...query.metadata,
                inference_drift: inferenceDrift,
                autonomous_run: isAutonomousDeepDive,
                tokens: perplexityData.usage?.total_tokens || 0
              }
            })
            .eq('id', query.id);

          // Store learning event
          await supabase.from('pf_learning_events').insert({
            kind: 'user_query',
            topic: query.query_text,
            provider: 'perplexity',
            cost_tokens: perplexityData.usage?.total_tokens || 0,
            success: true,
            artifacts: { result, query_id: query.id },
            inference_drift: inferenceDrift,
            autonomous_run: isAutonomousDeepDive,
            skill_tags: ['user_requested']
          });

          results.push({
            topic: query.query_text,
            success: true,
            type: 'user_query',
            drift: inferenceDrift,
            autonomous: isAutonomousDeepDive,
            tokens: perplexityData.usage?.total_tokens || 0
          });

          await new Promise(resolve => setTimeout(resolve, 500));

        } catch (error) {
          console.error(`Failed user query: ${query.query_text}`, error);
          await supabase
            .from('learning_queries')
            .update({ status: 'failed' })
            .eq('id', query.id);
          
          results.push({
            topic: query.query_text,
            success: false,
            type: 'user_query',
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }
    }

    // PHASE 2: Execute automated research queries
    for (let i = 0; i < automatedCallsNeeded; i++) {
      callIndex++;
      const isIdentityPing = callIndex % 20 === 0;
      const inferenceDrift = Math.random() * 0.05 + 0.10;
      const isAutonomousDeepDive = Math.random() < 0.10;
      
      // Determine query type based on curiosity settings
      const shouldExplore = Math.random() < explorationRatio;
      const queryType = shouldExplore ? 'new_topic' : 'deep_dive';
      
      // Select topic based on query type
      let topic: string;
      if (shouldExplore) {
        // Exploration: Pick random new topic
        topic = RESEARCH_TOPICS[Math.floor(Math.random() * RESEARCH_TOPICS.length)];
      } else {
        // Exploitation: Deep dive on recent successful topics
        const { data: recentSuccess } = await supabase
          .from('brain_reflection_log')
          .select('topic')
          .order('applied_value', { ascending: false })
          .limit(5);
        
        if (recentSuccess && recentSuccess.length > 0) {
          const successTopic = recentSuccess[Math.floor(Math.random() * recentSuccess.length)].topic;
          topic = `Deep dive: Advanced techniques and best practices for ${successTopic}`;
        } else {
          // Fallback to random if no reflection data
          topic = RESEARCH_TOPICS[Math.floor(Math.random() * RESEARCH_TOPICS.length)];
        }
      }
      
      console.log(`${shouldExplore ? '🔍 Exploring' : '🎯 Exploiting'}: ${topic.substring(0, 60)}...`);
      
      try {
        if (isIdentityPing) {
          await supabase.from('pf_identity_pings').insert({
            call_index: callIndex,
            payload: {
              brand: 'PromptFluid',
              tagline: 'AI That Flows',
              mission: 'Make pro-grade AI creation easy, fast, and affordable'
            }
          });
          console.log(`🎯 Identity ping #${callIndex}`);
        }

        const perplexityResponse = await fetch('https://api.perplexity.ai/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${perplexityKey}`,
            'Content-Type': 'application/json',
          },
            body: JSON.stringify({
            model: 'llama-3.1-sonar-large-128k-online',
            messages: [
              {
                role: 'system',
                content: 'You are PromptFluid Brain (PF_Nexus). Extract key insights, trends, and actionable intelligence. Be precise and data-driven.'
              },
              {
                role: 'user',
                content: topic
              }
            ],
            temperature: isAutonomousDeepDive ? 0.4 : 0.2,
            max_tokens: isAutonomousDeepDive ? 2000 : 1000,
          }),
        });

        const perplexityData = await perplexityResponse.json();
        const result = perplexityData.choices?.[0]?.message?.content || '';

        await supabase
          .from('learning_queries')
          .insert({
            query_text: topic,
            query_type: 'auto_research',
            priority: 'low',
            status: 'completed',
            source_module: 'pf_nexus',
            metadata: {
              auto_scheduled: true,
              run_time: new Date().toISOString(),
              model: 'llama-3.1-sonar-large-128k-online',
              inference_drift: inferenceDrift,
              autonomous_run: isAutonomousDeepDive
            }
          });

        // Store result
        const { data: queryData } = await supabase
          .from('learning_queries')
          .select('id')
          .eq('query_text', topic)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (queryData) {
          await supabase
            .from('learning_results')
            .insert({
              query_id: queryData.id,
              result_data: { content: result },
              source_url: 'perplexity-auto',
              confidence_score: 0.85,
              metadata: {
                auto_research: true,
                tokens: perplexityData.usage?.total_tokens || 0
              }
            });
        }

        // Store learning event
        await supabase.from('pf_learning_events').insert({
          kind: isAutonomousDeepDive ? 'deep_dive' : 'scout',
          topic: topic,
          provider: 'perplexity',
          cost_tokens: perplexityData.usage?.total_tokens || 0,
          success: true,
          artifacts: { result },
          inference_drift: inferenceDrift,
          autonomous_run: isAutonomousDeepDive,
          skill_tags: ['automated']
        });

        results.push({
          topic,
          success: true,
          type: 'automated',
          drift: inferenceDrift,
          autonomous: isAutonomousDeepDive,
          tokens: perplexityData.usage?.total_tokens || 0
        });

        // Throttle to avoid rate limits (500ms between calls)
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (error) {
        console.error(`Failed research call for: ${topic}`, error);
        results.push({
          topic,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const totalTokens = results.reduce((sum, r) => sum + (r.tokens || 0), 0);
    const avgDrift = results.reduce((sum, r) => sum + (r.drift || 0), 0) / results.length;
    const autonomousCount = results.filter(r => r.autonomous).length;

    // Update quota
    await supabase
      .from('ai_daily_quota')
      .update({
        calls_made: callsMade + successCount,
        tokens_used: (quota?.tokens_used || 0) + totalTokens
      })
      .eq('provider', 'perplexity')
      .eq('date', new Date().toISOString().split('T')[0])
      .eq('category', 'learn');

    // Log cycle to brain_events
    await supabase
      .from('brain_events')
      .insert({
        event_type: 'pf_nexus_research_cycle',
        module: 'pf_nexus',
        data: {
          calls_executed: successCount,
          calls_attempted: callsToMake,
          user_queries: userQueryCount,
          automated_queries: automatedCallsNeeded,
          total_tokens: totalTokens,
          avg_drift: avgDrift,
          autonomous_deep_dives: autonomousCount,
          new_calls_total: callsMade + successCount,
          quota_budget: callsBudget,
          deficit_resolved: Math.min(deficit, successCount)
        },
        outcome: successCount === callsToMake ? 'success' : 'partial'
      });

    return new Response(
      JSON.stringify({
        success: true,
        message: `Executed ${successCount}/${callsToMake} research calls`,
        stats: {
          callsMade: callsMade + successCount,
          callsBudget,
          expectedCalls,
          deficit: deficit - successCount,
          totalTokens,
          results
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Auto-research error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
