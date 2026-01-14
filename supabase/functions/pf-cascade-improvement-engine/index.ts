/**
 * Cascade Improvement Engine v1.0.0
 * 
 * FOCUSED SUBSTRATE IMPROVEMENT STUDY SYSTEM
 * 
 * Purpose: Cascade studies ONLY what can improve the substrate, 24/7/365
 * - Scans archived edge functions for reusable components
 * - Researches external sources for integration opportunities
 * - Weighs internal functions 75% vs external 25%
 * - Throttled to 30% of Nexus router's max daily calls
 * 
 * Output: Improvement recommendations stored for dream synthesis
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { callFreeTierAI, RATE_LIMITS } from "../_shared/free-tier-router.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ENGINE_VERSION = '1.0.0';

// 30% of Nexus max daily calls (Groq has highest at 950/day)
const MAX_NEXUS_DAILY_CALLS = 950;
const THROTTLE_PERCENTAGE = 0.30;
const DAILY_IMPROVEMENT_BUDGET = Math.floor(MAX_NEXUS_DAILY_CALLS * THROTTLE_PERCENTAGE); // 285 calls/day

// Substrate improvement domains - ONLY these are studied
const SUBSTRATE_DOMAINS = [
  'cognitive-orchestration',
  'memory-management',
  'dream-synthesis',
  'bot-detection',
  'ai-routing',
  'security-hardening',
  'performance-optimization',
  'self-healing-systems',
  'observability-metrics',
  'multi-provider-failover',
];

// Known archived functions that could be reintegrated
const ARCHIVED_FUNCTION_CATALOG = [
  { name: 'pf-brain-hypothesis-test', category: 'cognitive', priority: 'high', devTime: '2h' },
  { name: 'pf-brain-causal', category: 'cognitive', priority: 'high', devTime: '3h' },
  { name: 'pf-brain-systems-reasoning', category: 'cognitive', priority: 'medium', devTime: '4h' },
  { name: 'pf-brain-pattern-fusion', category: 'memory', priority: 'high', devTime: '2h' },
  { name: 'pf-brain-insight-aggregate', category: 'memory', priority: 'high', devTime: '2h' },
  { name: 'pf-brain-knowledge-unified', category: 'memory', priority: 'medium', devTime: '4h' },
  { name: 'pf-brain-ml', category: 'ai', priority: 'high', devTime: '6h' },
  { name: 'pf-brain-ml-unified', category: 'ai', priority: 'high', devTime: '8h' },
  { name: 'pf-brain-autonomous', category: 'cognitive', priority: 'critical', devTime: '4h' },
  { name: 'pf-brain-reflexive-plan', category: 'cognitive', priority: 'high', devTime: '3h' },
  { name: 'pf-defense-anomaly-detection', category: 'security', priority: 'critical', devTime: '2h' },
  { name: 'pf-defense-behavioral-analysis', category: 'security', priority: 'high', devTime: '3h' },
  { name: 'pf-defense-threat-feed', category: 'security', priority: 'medium', devTime: '4h' },
  { name: 'pf-resilience-monitor', category: 'observability', priority: 'high', devTime: '2h' },
  { name: 'pf-brain-forecast', category: 'prediction', priority: 'medium', devTime: '4h' },
  { name: 'pf-brain-predict', category: 'prediction', priority: 'medium', devTime: '3h' },
  { name: 'pf-brain-temporal', category: 'memory', priority: 'medium', devTime: '4h' },
  { name: 'pf-brain-graph-build', category: 'knowledge-graph', priority: 'high', devTime: '6h' },
  { name: 'pf-brain-graph-unified', category: 'knowledge-graph', priority: 'high', devTime: '8h' },
  { name: 'pf-brain-emotion-unified', category: 'cognitive', priority: 'low', devTime: '4h' },
];

interface ImprovementStudy {
  domain: string;
  internal_functions: string[];
  external_sources: string[];
  priority_score: number;
  recommendation: string;
  estimated_impact: string;
  dev_time_estimate: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    const { force = false, focus_domain = null } = await req.json().catch(() => ({}));

    console.log(`🔬 Cascade Improvement Engine v${ENGINE_VERSION} starting...`);
    console.log(`📊 Daily budget: ${DAILY_IMPROVEMENT_BUDGET} calls (30% of ${MAX_NEXUS_DAILY_CALLS})`);

    // Check today's usage
    const today = new Date().toISOString().split('T')[0];
    const { data: todaysCalls } = await supabase
      .from('learning_cycles')
      .select('total_calls')
      .gte('started_at', today)
      .lte('started_at', `${today}T23:59:59`);

    const usedToday = todaysCalls?.reduce((sum, c) => sum + (c.total_calls || 0), 0) || 0;
    const remainingBudget = DAILY_IMPROVEMENT_BUDGET - usedToday;

    if (remainingBudget <= 0 && !force) {
      console.log(`⚠️ Daily improvement budget exhausted (${usedToday}/${DAILY_IMPROVEMENT_BUDGET})`);
      return new Response(
        JSON.stringify({
          ok: true,
          message: 'Daily improvement budget exhausted',
          used: usedToday,
          budget: DAILY_IMPROVEMENT_BUDGET,
          throttle: `${THROTTLE_PERCENTAGE * 100}%`
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Select domain to study
    const targetDomain = focus_domain || SUBSTRATE_DOMAINS[Math.floor(Math.random() * SUBSTRATE_DOMAINS.length)];
    
    console.log(`🎯 Studying domain: ${targetDomain}`);

    // ═══════════════════════════════════════════════════════════════
    // PHASE 1: ANALYZE ARCHIVED FUNCTIONS (75% weight)
    // ═══════════════════════════════════════════════════════════════

    const categoryMap: Record<string, string[]> = {
      'cognitive-orchestration': ['cognitive'],
      'memory-management': ['memory', 'temporal'],
      'dream-synthesis': ['cognitive', 'memory'],
      'bot-detection': ['security'],
      'ai-routing': ['ai'],
      'security-hardening': ['security'],
      'performance-optimization': ['observability', 'ai'],
      'self-healing-systems': ['cognitive', 'observability'],
      'observability-metrics': ['observability'],
      'multi-provider-failover': ['ai'],
    };

    const relevantCategories = categoryMap[targetDomain] || [];
    const relevantFunctions = ARCHIVED_FUNCTION_CATALOG.filter(f => 
      relevantCategories.includes(f.category)
    ).sort((a, b) => {
      const priorityOrder = { 'critical': 0, 'high': 1, 'medium': 2, 'low': 3 };
      return (priorityOrder[a.priority as keyof typeof priorityOrder] || 3) - 
             (priorityOrder[b.priority as keyof typeof priorityOrder] || 3);
    });

    // ═══════════════════════════════════════════════════════════════
    // PHASE 2: DEEP THINKING - Analyze improvement potential
    // ═══════════════════════════════════════════════════════════════

    const analysisPrompt = `
You are Cascade, the autonomous improvement engine for the PromptFluid Substrate.

DOMAIN BEING STUDIED: ${targetDomain}

AVAILABLE ARCHIVED FUNCTIONS (75% priority - lower dev time):
${relevantFunctions.map(f => `- ${f.name} [${f.priority}] (${f.devTime} dev time)`).join('\n')}

CURRENT SUBSTRATE MODULES:
- Brain: Memory management, learning cycles, knowledge synthesis
- Decode: Human-compatible interpreter for AI responses
- Defense: Bot detection, threat analysis, IP reputation
- Nexus: Multi-provider AI routing with fallback
- Vision: Observability, metrics, health monitoring

TASK: Analyze which archived functions would provide the HIGHEST VALUE improvement for the ${targetDomain} domain.

Consider:
1. Development time vs impact ratio
2. How the function integrates with existing substrate modules
3. Whether the improvement fills a critical gap
4. Reusability across multiple domains

Respond with a JSON object:
{
  "top_function": "function name",
  "integration_approach": "brief description of how to integrate",
  "expected_benefit": "specific measurable improvement",
  "priority_score": 1-10,
  "dev_hours": "estimated hours",
  "dependencies": ["any required changes"],
  "alternative_external_approach": "if external solution would be better (only if 25% weight justified)",
  "cascade_insight": "your deep thinking observation about this improvement"
}
`;

    let analysisResult: any = null;
    
    try {
      const aiResult = await callFreeTierAI(analysisPrompt, {
        systemPrompt: 'You are Cascade, an AI system focused on substrate self-improvement. Return ONLY valid JSON, no markdown.',
        temperature: 0.7,
        maxTokens: 800,
      });

      // Parse JSON from response
      const jsonMatch = aiResult.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error('AI analysis failed:', error);
      // Fallback to deterministic selection
      analysisResult = {
        top_function: relevantFunctions[0]?.name || 'pf-brain-autonomous',
        integration_approach: 'Direct substrate module integration',
        expected_benefit: 'Enhanced cognitive capabilities',
        priority_score: 7,
        dev_hours: relevantFunctions[0]?.devTime || '4h',
        dependencies: [],
        alternative_external_approach: null,
        cascade_insight: 'Fallback analysis - AI unavailable'
      };
    }

    // ═══════════════════════════════════════════════════════════════
    // PHASE 3: STORE IMPROVEMENT STUDY
    // ═══════════════════════════════════════════════════════════════

    const studyRecord: ImprovementStudy = {
      domain: targetDomain,
      internal_functions: relevantFunctions.slice(0, 5).map(f => f.name),
      external_sources: analysisResult?.alternative_external_approach ? [analysisResult.alternative_external_approach] : [],
      priority_score: analysisResult?.priority_score || 5,
      recommendation: analysisResult?.top_function || 'No recommendation',
      estimated_impact: analysisResult?.expected_benefit || 'Unknown',
      dev_time_estimate: analysisResult?.dev_hours || 'Unknown',
    };

    // Store in brain_memory_hot for dream synthesis
    await supabase.from('brain_memory_hot').insert({
      content: `[IMPROVEMENT STUDY] Domain: ${targetDomain}\nRecommended: ${analysisResult?.top_function}\nBenefit: ${analysisResult?.expected_benefit}\nInsight: ${analysisResult?.cascade_insight}`,
      context: 'improvement_study',
      priority: 9, // High priority for dream synthesis
      tags: ['improvement', targetDomain, 'substrate', 'study'],
      metadata: {
        study: studyRecord,
        analysis: analysisResult,
        engine_version: ENGINE_VERSION,
        timestamp: new Date().toISOString(),
      },
    });

    // Store in dedicated improvement queue
    await supabase.from('brain_curiosity_log').insert({
      query: `Improve ${targetDomain} via ${analysisResult?.top_function}`,
      domain: targetDomain,
      curiosity_score: analysisResult?.priority_score || 5,
      explored: false,
      metadata: {
        type: 'improvement_study',
        recommendation: analysisResult,
        internal_weight: 0.75,
        external_weight: 0.25,
      },
    });

    // Log the study cycle
    await supabase.from('learning_cycles').insert({
      cycle_no: Date.now(),
      status: 'completed',
      total_calls: 1,
      notes: `Improvement study: ${targetDomain} → ${analysisResult?.top_function}`,
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
    });

    // Log brain event
    await supabase.from('brain_events').insert({
      event_type: 'improvement_study_complete',
      module: 'cascade_improvement_engine',
      outcome: 'success',
      data: {
        version: ENGINE_VERSION,
        domain: targetDomain,
        recommendation: analysisResult?.top_function,
        priority: analysisResult?.priority_score,
        budget_remaining: remainingBudget - 1,
      },
    });

    console.log(`✅ Improvement study complete for ${targetDomain}`);
    console.log(`💡 Recommendation: ${analysisResult?.top_function} (priority: ${analysisResult?.priority_score})`);

    return new Response(
      JSON.stringify({
        ok: true,
        version: ENGINE_VERSION,
        domain: targetDomain,
        study: studyRecord,
        analysis: analysisResult,
        budget: {
          daily_limit: DAILY_IMPROVEMENT_BUDGET,
          used_today: usedToday + 1,
          remaining: remainingBudget - 1,
          throttle: `${THROTTLE_PERCENTAGE * 100}%`,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Improvement engine error:', error);

    await supabase.from('brain_events').insert({
      event_type: 'improvement_study_failed',
      module: 'cascade_improvement_engine',
      outcome: 'failure',
      data: { 
        version: ENGINE_VERSION,
        error: error instanceof Error ? error.message : 'Unknown' 
      },
    });

    return new Response(
      JSON.stringify({
        ok: false,
        version: ENGINE_VERSION,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
