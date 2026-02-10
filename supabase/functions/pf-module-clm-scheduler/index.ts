/**
 * Module CLM Scheduler
 * v6.8.0 — Backend cron job for 24/7 module self-learning
 * 
 * Called by pg_cron every hour to run module-specific CLM cycles
 * Budget-aware: respects daily Nexus budget limits
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MODULE_IDS = [
  'brain', 'cortex', 'defense', 'nexus', 'vision', 'ripple',
  'access', 'inclusive', 'modernizer', 'system', 'decode', 'autoblog', 'encoded'
];

const MODULE_CONFIGS: Record<string, { displayName: string; selfReflectionPrompt: string }> = {
  brain: {
    displayName: 'BRAIN',
    selfReflectionPrompt: `As the BRAIN module, analyze my recent performance: memory consolidation efficiency, knowledge graph coherence, retrieval accuracy patterns. What specific improvements would make me a better memory system?`,
  },
  cortex: {
    displayName: 'CORTEX',
    selfReflectionPrompt: `As the CORTEX orchestrator, evaluate my coordination: request routing, pipeline bottlenecks, module chain performance. How can I reduce latency while maintaining quality?`,
  },
  defense: {
    displayName: 'DEFENSE',
    selfReflectionPrompt: `As the DEFENSE module, assess my security posture: attack patterns I'm missing, false positive rates, response times, new threat vectors to learn.`,
  },
  nexus: {
    displayName: 'NEXUS',
    selfReflectionPrompt: `As the NEXUS gateway, review my resource management: API cost optimization, caching improvements, rate limit appropriateness, provider routing decisions.`,
  },
  vision: {
    displayName: 'VISION',
    selfReflectionPrompt: `As the VISION module, evaluate my observability: dashboard insight quality, real-time update efficiency, user engagement with visualizations.`,
  },
  ripple: {
    displayName: 'RIPPLE',
    selfReflectionPrompt: `As the RIPPLE integration layer, analyze my connectivity: integration reliability, webhook delivery success, sync latency, event propagation.`,
  },
  access: {
    displayName: 'ACCESS',
    selfReflectionPrompt: `As the ACCESS control layer, review my identity management: authentication flow smoothness, permission check efficiency, billing accuracy, session experience.`,
  },
  inclusive: {
    displayName: 'INCLUSIVE',
    selfReflectionPrompt: `As the INCLUSIVE accessibility engine, assess my compliance checking: accessibility issue detection, auto-fix success, WCAG coverage, false positive reduction.`,
  },
  modernizer: {
    displayName: 'MODERNIZER',
    selfReflectionPrompt: `As the MODERNIZER evolution engine, evaluate my upgrade capabilities: evolution cycle success, shadow mode regression detection, upgrade path optimization.`,
  },
  system: {
    displayName: 'SYSTEM',
    selfReflectionPrompt: `As the SYSTEM health monitor, review my reliability: issue detection accuracy, incident identification speed, self-healing effectiveness, resource optimization.`,
  },
  decode: {
    displayName: 'DECODE',
    selfReflectionPrompt: `As the DECODE analysis engine, assess my interpretation: code pattern understanding, suggestion acceptance rates, pattern recognition improvements.`,
  },
  autoblog: {
    displayName: 'AUTOBLOG',
    selfReflectionPrompt: `As the AUTOBLOG content engine, evaluate my writing: content quality improvements, tone consistency, topic resonance, content uniqueness.`,
  },
  encoded: {
    displayName: 'ENCODED',
    selfReflectionPrompt: `As the ENCODED implementation agent, analyze my code generation mastery using expert pattern categories:

EXPERT PATTERNS I MUST MASTER:
- TypeScript: Discriminated unions, branded types, type-safe builders, exhaustive guards, mapped/conditional types
- React: Compound components, hook+render separation, optimistic updates, error boundaries, suspense data fetching, RHF+Zod forms
- Edge Functions: Structured handlers (CORS→Auth→Validate→Execute), action routers, rate limiting
- Error Handling: Domain error hierarchies, retry with exponential backoff
- Security: Schema-first validation (Zod), RLS policies, safe error responses
- Performance: Memoized selectors, virtualized lists, debounced search with AbortController
- State: Zustand slices, TanStack Query as server state (never copy server data to useState)
- Database: Atomic upserts, multi-table transactions via RPC, cursor-based pagination
- Testing: AAA structure, Supabase mocking
- Refactoring: Extract hooks (3+ useState = extract), early return guard clauses

Self-assess: Which patterns do I consistently apply well? Which do I struggle with? 
What anti-patterns do I still fall into? Rate my mastery per category (0-100).
Provide 3 specific code examples showing patterns I should practice.

Format as JSON: { title, masteryScores: Record<string, number>, weaknesses: string[], practiceExamples: string[], overallMastery: number, confidence: number }`,
  },
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Check daily budget — with 14.4K RPD on groq (llama-3.1-8b-instant), we can be much more aggressive
    // v1.5.0: Raised threshold to 80% since we now have 14.4K+ RPD capacity
    const { data: quotaData } = await supabase
      .from('ai_daily_quota')
      .select('calls_used, calls_budget')
      .eq('provider', 'nexus')
      .eq('date', new Date().toISOString().split('T')[0])
      .single();

    const usedPercent = quotaData 
      ? (quotaData.calls_used / (quotaData.calls_budget || 14400)) * 100 
      : 0;

    if (usedPercent > 80) {
      console.log('[ModuleCLM] Budget exceeded 80%, skipping cycle');
      return new Response(JSON.stringify({ 
        success: true, 
        skipped: true, 
        reason: 'budget_limit',
        usedPercent 
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // v3.0.0: Pick 4 modules per cycle — parallel curriculum strategy
    // Ensure Encoded + Brain always get a slot for knowledge transfer
    const priorityModules = ['encoded', 'brain'];
    const otherModules = MODULE_IDS.filter(m => !priorityModules.includes(m)).sort(() => Math.random() - 0.5);
    const selectedModules = [...priorityModules, ...otherModules.slice(0, 2)];
    const results: any[] = [];

    for (const moduleId of selectedModules) {
      const config = MODULE_CONFIGS[moduleId];
      if (!config) continue;

      // Gather metrics
      const { data: events } = await supabase
        .from('brain_events')
        .select('event_type, outcome, data, created_at')
        .eq('module', moduleId)
        .gte('created_at', new Date(Date.now() - 24 * 3600000).toISOString())
        .order('created_at', { ascending: false })
        .limit(100);

      const successCount = events?.filter(e => e.outcome === 'success').length || 0;
      const failureCount = events?.filter(e => e.outcome === 'failure').length || 0;
      const totalEvents = events?.length || 0;
      const successRate = totalEvents > 0 ? (successCount / totalEvents) * 100 : 50;

      // Generate self-analysis via Nexus
      const { data: analysisData, error: analysisError } = await supabase.functions.invoke('pf-nexus-router', {
        body: {
          prompt: `${config.selfReflectionPrompt}

Recent Performance Data:
- Total events (24h): ${totalEvents}
- Success rate: ${successRate.toFixed(1)}%
- Failures: ${failureCount}

Provide:
1. A brief title for this analysis (max 10 words)
2. Your assessment (2-3 paragraphs)
3. Specific improvement requests (bullet points)
4. Priority level (low/medium/high/critical)
5. Confidence in this analysis (0-1)

Format as JSON: { title, content, requests, priority, confidence }`,
          systemPrompt: `You are the ${config.displayName} module performing self-analysis for continuous improvement. Be specific, actionable, and honest about limitations.`,
          maxTokens: 800,
          temperature: 0.7,
          metadata: { routeKey: 'module-clm-scheduler', moduleId },
        },
      });

      if (analysisError) {
        console.error(`[ModuleCLM] Analysis failed for ${moduleId}:`, analysisError);
        continue;
      }

      const response = analysisData?.content || analysisData?.response || '';
      
      // Parse JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      let parsed = {
        title: `${config.displayName} Self-Analysis`,
        content: response,
        requests: [],
        priority: 'medium',
        confidence: 0.7,
      };

      if (jsonMatch) {
        try {
          const jsonParsed = JSON.parse(jsonMatch[0]);
          parsed = { ...parsed, ...jsonParsed };
        } catch {
          // Use defaults
        }
      }

      // Determine analysis type
      const lower = parsed.content.toLowerCase();
      let analysisType = 'performance';
      if (lower.includes('request') || lower.includes('need') || lower.includes('require')) {
        analysisType = 'request';
      } else if (lower.includes('improve') || lower.includes('optimize') || lower.includes('enhance')) {
        analysisType = 'improvement';
      } else if (lower.includes('insight') || lower.includes('discover') || lower.includes('pattern')) {
        analysisType = 'insight';
      }

      // Store in brain_reflection_log
      const { error: storeError } = await supabase.from('brain_reflection_log').insert({
        content: `[${moduleId.toUpperCase()}] ${parsed.title}\n\n${parsed.content}`,
        reflection_type: `module_clm_${moduleId}_${analysisType}`,
        insights: {
          moduleId,
          analysisType,
          priority: parsed.priority,
          confidence: parsed.confidence,
          requests: parsed.requests,
          metrics: { totalEvents, successRate, failureCount },
        },
        created_at: new Date().toISOString(),
      });

      if (storeError) {
        console.error(`[ModuleCLM] Storage failed for ${moduleId}:`, storeError);
      } else {
        results.push({
          moduleId,
          title: parsed.title,
          analysisType,
          priority: parsed.priority,
        });
      }

      // Small delay between modules
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log(`[ModuleCLM] Scheduled cycle complete: ${results.length} analyses generated`);

    return new Response(JSON.stringify({ 
      success: true, 
      count: results.length,
      modules: results.map(r => r.moduleId),
      results 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[ModuleCLM] Scheduler error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: errorMessage 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
