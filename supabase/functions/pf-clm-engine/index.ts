/**
 * pf-clm-engine — Server-Side Continuous Learning Engine
 * Runs autonomously via pg_cron — NO browser required
 * 
 * Executes the full CLM pipeline every cycle:
 * 1. Budget/rate limit check
 * 2. Brain cognitive cycle (learn → reflect → synthesize → dream)
 * 3. Module self-analysis (rotating)
 * 4. Learning topic study via Nexus fleet
 * 5. Brain Transfer Pipeline (distribute learnings to all modules)
 * 6. Memory Consolidation (dedup, tier promotion/demotion, pruning)
 * 7. Telemetry recording
 * 
 * @version 2.0.0
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const CLM_VERSION = "2.1.0";
const MAX_CYCLES_PER_HOUR = 14;  // 5-min cadence = 12/hr + 2 buffer for retries
const MAX_CYCLES_PER_DAY = 300;  // 288 possible + headroom — never starve the engine

// All 20 modules that participate in CLM
const CLM_MODULES = [
  'brain', 'decode', 'defense', 'nexus', 'vision', 'dream',
  'cortex', 'ripple', 'modernizer', 'encode', 'access',
  'system', 'inclusive', 'integration', 'memory', 'relay',
  'audit', 'identity', 'economy', 'sandbox'
];

// Module transfer configs — relevance signals for brain→module knowledge routing
const MODULE_RELEVANCE: Record<string, string[]> = {
  decode:       ['response', 'conversation', 'chat', 'personality', 'tone', 'user', 'context'],
  defense:      ['security', 'threat', 'attack', 'vulnerability', 'injection', 'bot', 'anomaly'],
  nexus:        ['routing', 'provider', 'model', 'fallback', 'latency', 'cost', 'health'],
  vision:       ['trace', 'diagnostic', 'observability', 'metric', 'monitor', 'alert', 'latency'],
  dream:        ['dream', 'synthesis', 'creative', 'imagination', 'insight', 'hypothesis'],
  cortex:       ['architecture', 'design', 'pattern', 'proposal', 'refactor', 'structure'],
  encode:       ['code generation', 'task packet', 'code review', 'refactor', 'implementation'],
  memory:       ['vector', 'embedding', 'semantic', 'rag', 'retrieval', 'recall', 'tiering'],
  relay:        ['webhook', 'outbound', 'delivery', 'retry', 'queue', 'notification'],
  audit:        ['compliance', 'audit trail', 'immutable', 'chain', 'retention', 'regulatory'],
  identity:     ['actor', 'attribution', 'signature', 'webauthn', 'session', 'credential'],
  economy:      ['cost', 'budget', 'pricing', 'billing', 'usage', 'metering', 'roi'],
  sandbox:      ['isolation', 'sandbox', 'speculative', 'safe execution', 'containment'],
  access:       ['permission', 'role', 'authorization', 'api key', 'token', 'quota'],
  ripple:       ['event', 'propagation', 'broadcast', 'publish', 'subscribe', 'cascade'],
  system:       ['health', 'audit', 'configuration', 'settings', 'admin', 'governance'],
  modernizer:   ['upgrade', 'evolution', 'modernize', 'refactor', 'migrate', 'diff'],
  inclusive:    ['accessibility', 'a11y', 'wcag', 'aria', 'screen reader', 'keyboard'],
  integration:  ['webhook', 'api', 'endpoint', 'transform', 'pipeline', 'data sync'],
  core:         ['memory', 'storage', 'persistence', 'state', 'cache', 'retrieve'],
};

// Learning topics for autonomous study
const LEARNING_TOPICS = [
  { domain: 'security', prompt: 'Analyze recent defense events and identify emerging threat patterns. What new detection rules should be added?' },
  { domain: 'performance', prompt: 'Review system latency metrics and memory usage. Identify bottlenecks and propose optimizations.' },
  { domain: 'code_quality', prompt: 'Examine recent code generation patterns. What TypeScript best practices are being missed?' },
  { domain: 'architecture', prompt: 'Evaluate module coupling and communication patterns. Where are the architectural weak points?' },
  { domain: 'user_experience', prompt: 'Analyze recent user interactions and error patterns. What usability improvements would have the highest impact?' },
  { domain: 'resilience', prompt: 'Review circuit breaker activations and auto-heal events. How can system resilience be improved?' },
  { domain: 'data_quality', prompt: 'Assess memory tiering effectiveness and knowledge graph density. Where are the knowledge gaps?' },
  { domain: 'cost_optimization', prompt: 'Analyze AI provider usage patterns. How can we maximize free-tier utilization across the fleet?' },
  { domain: 'testing', prompt: 'Review recent failures and regressions. What test coverage gaps exist?' },
  { domain: 'accessibility', prompt: 'Evaluate WCAG compliance and inclusive design patterns. What accessibility improvements are needed?' },
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing Supabase configuration");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    let action = 'cycle';
    try {
      const body = await req.json();
      action = body.action || 'cycle';
    } catch {
      // Default to cycle for cron invocations
    }

    console.log(`⚡ CLM Engine v${CLM_VERSION} | action=${action}`);

    // ═══════════════════════════════════════════════════════════
    // BUDGET CHECK
    // ═══════════════════════════════════════════════════════════
    const now = new Date();
    const todayKey = now.toISOString().split('T')[0];
    const currentHour = now.getUTCHours();

    const { count: todayCycles } = await supabase
      .from('brain_events')
      .select('id', { count: 'exact', head: true })
      .eq('event_type', 'clm_server_cycle')
      .gte('created_at', `${todayKey}T00:00:00Z`);

    if ((todayCycles || 0) >= MAX_CYCLES_PER_DAY) {
      return new Response(JSON.stringify({ success: true, skipped: true, reason: 'daily_budget_exhausted' }), 
        { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const hourStart = new Date(now);
    hourStart.setMinutes(0, 0, 0);
    const { count: hourCycles } = await supabase
      .from('brain_events')
      .select('id', { count: 'exact', head: true })
      .eq('event_type', 'clm_server_cycle')
      .gte('created_at', hourStart.toISOString());

    if ((hourCycles || 0) >= MAX_CYCLES_PER_HOUR) {
      return new Response(JSON.stringify({ success: true, skipped: true, reason: 'hourly_budget_exhausted' }), 
        { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const isQuietHours = false; // v2.1.0: Quiet hours DISABLED — CLM runs at full intensity 24/7
    const cycleIntensity = 'full';
    const cycleNumber = (todayCycles || 0) + 1;

    const cycleResults: Record<string, any> = {
      cognitive_cycle: null,
      module_analysis: [],
      learning_topic: null,
      brain_transfer: null,
      memory_consolidation: null,
    };

    // ═══════════════════════════════════════════════════════════
    // PHASE 1: Cognitive Cycle via pf-substrate
    // ═══════════════════════════════════════════════════════════
    try {
      const { data: cycleData, error: cycleError } = await supabase.functions.invoke('pf-substrate', {
        body: { module: 'brain', action: 'cognitive_cycle' },
      });
      cycleResults.cognitive_cycle = cycleError 
        ? { success: false, error: String(cycleError) } 
        : { success: true, phases: cycleData?.phases || {} };
      console.log(cycleError ? '❌ Cognitive cycle failed' : '✅ Cognitive cycle complete');
    } catch (err) {
      cycleResults.cognitive_cycle = { success: false, error: String(err) };
    }

    // ═══════════════════════════════════════════════════════════
    // PHASE 2: Module Self-Analysis (rotating)
    // ═══════════════════════════════════════════════════════════
    const modulesPerCycle = isQuietHours ? 1 : 3;
    const cycleIndex = (todayCycles || 0) % CLM_MODULES.length;
    const selectedModules = [];
    for (let i = 0; i < modulesPerCycle; i++) {
      selectedModules.push(CLM_MODULES[(cycleIndex + i) % CLM_MODULES.length]);
    }

    for (const moduleName of selectedModules) {
      try {
        const { data: moduleEvents } = await supabase
          .from('brain_events')
          .select('event_type, outcome, data, created_at')
          .eq('module', moduleName)
          .order('created_at', { ascending: false })
          .limit(10);

        const successCount = moduleEvents?.filter((e: any) => e.outcome === 'success').length || 0;
        const totalCount = moduleEvents?.length || 0;
        const successRate = totalCount > 0 ? successCount / totalCount : 0;

        const insight = {
          module: moduleName,
          events_analyzed: totalCount,
          success_rate: successRate,
          health_trend: successRate > 0.8 ? 'healthy' : successRate > 0.5 ? 'degraded' : 'critical',
          recent_patterns: moduleEvents?.slice(0, 3).map((e: any) => e.event_type) || [],
        };

        await supabase.from('brain_events').insert({
          event_type: 'module_learning_insight',
          module: moduleName,
          outcome: 'success',
          data: {
            title: `${moduleName.toUpperCase()} Self-Analysis`,
            content: `Module ${moduleName}: ${totalCount} events, ${(successRate * 100).toFixed(0)}% success. Health: ${insight.health_trend}.`,
            insight,
            source: 'clm_server_engine',
            version: CLM_VERSION,
          },
        });

        cycleResults.module_analysis.push(insight);
        console.log(`📊 ${moduleName}: ${insight.health_trend} (${(successRate * 100).toFixed(0)}%)`);
      } catch (err) {
        console.warn(`Module analysis failed for ${moduleName}:`, err);
      }
    }

    // ═══════════════════════════════════════════════════════════
    // PHASE 3: Learning Topic Study
    // ═══════════════════════════════════════════════════════════
    if (!isQuietHours) {
      const topicIndex = cycleNumber % LEARNING_TOPICS.length;
      const topic = LEARNING_TOPICS[topicIndex];

      try {
        const { data: studyResult, error: studyError } = await supabase.functions.invoke('pf-substrate', {
          body: { module: 'brain', action: 'deep_think', data: { question: topic.prompt, depth: 'medium' } },
        });

        if (!studyError && studyResult?.success) {
          // Store learning as both brain_event AND as a hot memory for cross-module recall
          await supabase.from('brain_events').insert({
            event_type: 'technical_learning_cycle',
            module: 'brain',
            outcome: 'success',
            data: {
              title: `CLM Study: ${topic.domain}`,
              domain: topic.domain,
              prompt: topic.prompt,
              result: studyResult?.analysis?.substring?.(0, 1000) || 'completed',
              source: 'clm_server_engine',
            },
          });

          // Also persist as hot memory for immediate recall
          await supabase.from('brain_memory_hot').insert({
            content: `[CLM Learning: ${topic.domain}] ${studyResult?.analysis?.substring?.(0, 500) || topic.prompt}`,
            context: `clm_study:${topic.domain}`,
            priority: 7,
            access_count: 0,
            metadata: { domain: topic.domain, source: 'clm_server_engine', cycle: cycleNumber },
          });

          cycleResults.learning_topic = { domain: topic.domain, success: true };
          console.log(`📚 Studied: ${topic.domain}`);
        } else {
          cycleResults.learning_topic = { domain: topic.domain, success: false };
        }
      } catch (err) {
        cycleResults.learning_topic = { domain: topic.domain, success: false };
      }
    }

    // ═══════════════════════════════════════════════════════════
    // PHASE 4: Brain Transfer Pipeline (every 3rd cycle)
    // Distributes recent learnings from brain → all module hot caches
    // ═══════════════════════════════════════════════════════════
    if (cycleNumber % 3 === 0 && !isQuietHours) {
      try {
        const transferStartTime = Date.now();
        let transferred = 0;
        let enriched = 0;

        // Pick 2 modules to transfer knowledge to this cycle
        const transferModules = [
          CLM_MODULES[(cycleNumber / 3) % CLM_MODULES.length],
          CLM_MODULES[((cycleNumber / 3) + 1) % CLM_MODULES.length],
        ];

        for (const targetModule of transferModules) {
          const signals = MODULE_RELEVANCE[targetModule] || [];
          if (signals.length === 0) continue;

          // Find recent brain memories relevant to this module
          for (const signal of signals.slice(0, 3)) { // Top 3 signals per module
            const { data: relevantMemories } = await supabase
              .from('brain_memories')
              .select('id, content, confidence, metadata')
              .ilike('content', `%${signal}%`)
              .gte('confidence', 0.6)
              .order('created_at', { ascending: false })
              .limit(3);

            if (relevantMemories?.length) {
              for (const mem of relevantMemories) {
                try {
                  await supabase.from('brain_memory_hot').insert({
                    content: `[${targetModule.toUpperCase()}_TRANSFER] ${mem.content.substring(0, 400)}`,
                    context: `${targetModule}_transfer:auto`,
                    priority: Math.min(10, Math.max(1, Math.round((mem.confidence || 0.7) * 10))),
                    access_count: 0,
                    metadata: { 
                      source_memory_id: mem.id, 
                      target_module: targetModule,
                      signal,
                      transferred_at: new Date().toISOString(),
                      source: 'clm_brain_transfer',
                    },
                  });
                  transferred++;
                } catch {
                  // Dedup conflict — memory already transferred
                  enriched++;
                }
              }
            }
          }
        }

        const transferDuration = Date.now() - transferStartTime;
        cycleResults.brain_transfer = { 
          success: true, 
          modules: transferModules, 
          transferred, 
          enriched, 
          duration_ms: transferDuration 
        };

        // Log transfer event
        await supabase.from('brain_events').insert({
          event_type: 'brain_knowledge_transfer',
          module: 'brain',
          outcome: 'success',
          data: { modules: transferModules, transferred, enriched, duration_ms: transferDuration, source: 'clm_server_engine' },
        });

        console.log(`🔄 Brain Transfer: ${transferred} memories → [${transferModules.join(', ')}] in ${transferDuration}ms`);
      } catch (err) {
        console.warn('Brain transfer failed:', err);
        cycleResults.brain_transfer = { success: false, error: String(err) };
      }
    }

    // ═══════════════════════════════════════════════════════════
    // PHASE 5: Memory Consolidation (every 6th cycle)
    // Dedup, tier promotion, stale memory demotion, pruning
    // ═══════════════════════════════════════════════════════════
    if (cycleNumber % 6 === 0) {
      try {
        const consolidationStart = Date.now();
        let promoted = 0;
        let demoted = 0;
        let pruned = 0;

        // 5a: Promote high-access warm memories to hot
        const { data: warmHighAccess } = await supabase
          .from('brain_memory_warm')
          .select('id, content, confidence, access_count, memory_type, metadata, source')
          .gte('access_count', 3)
          .gte('confidence', 0.7)
          .order('access_count', { ascending: false })
          .limit(10);

        for (const mem of warmHighAccess || []) {
          try {
            await supabase.from('brain_memory_hot').insert({
              content: mem.content,
              context: `promoted:${mem.memory_type || 'general'}`,
              priority: Math.min(10, Math.max(1, Math.round((mem.confidence || 0.7) * 10))),
              access_count: mem.access_count || 0,
              metadata: { ...((mem.metadata as any) || {}), promoted_from: 'warm', promoted_at: new Date().toISOString() },
            });
            promoted++;
          } catch {
            // Already exists in hot — skip
          }
        }

        // 5b: Demote stale hot memories (no access in 7 days, low priority)
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 3600000).toISOString();
        const { data: staleHot } = await supabase
          .from('brain_memory_hot')
          .select('id, content, priority, access_count, metadata')
          .lte('priority', 3)
          .lt('created_at', sevenDaysAgo)
          .limit(20);

        for (const mem of staleHot || []) {
          if ((mem.access_count || 0) < 2) {
            try {
              // Move to warm
              await supabase.from('brain_memory_warm').insert({
                content: mem.content,
                memory_type: 'general',
                confidence: (mem.priority || 5) / 10,
                access_count: mem.access_count || 0,
                metadata: { ...((mem.metadata as any) || {}), demoted_from: 'hot', demoted_at: new Date().toISOString() },
              });
              await supabase.from('brain_memory_hot').delete().eq('id', mem.id);
              demoted++;
            } catch {
              // Non-fatal
            }
          }
        }

        // 5c: Prune cold memories with very low confidence (>30 days old, confidence <0.3)
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 3600000).toISOString();
        const { data: coldLow, count: prunedCount } = await supabase
          .from('brain_memory_cold')
          .select('id', { count: 'exact' })
          .lt('confidence', 0.3)
          .lt('created_at', thirtyDaysAgo)
          .limit(50);

        if (coldLow?.length) {
          const ids = coldLow.map((m: any) => m.id);
          await supabase.from('brain_memory_cold').delete().in('id', ids);
          pruned = ids.length;
        }

        const consolidationDuration = Date.now() - consolidationStart;
        cycleResults.memory_consolidation = { 
          success: true, 
          promoted, 
          demoted, 
          pruned, 
          duration_ms: consolidationDuration 
        };

        await supabase.from('brain_events').insert({
          event_type: 'memory_consolidation',
          module: 'brain',
          outcome: 'success',
          data: { promoted, demoted, pruned, duration_ms: consolidationDuration, source: 'clm_server_engine' },
        });

        console.log(`🧹 Consolidation: ↑${promoted} promoted, ↓${demoted} demoted, 🗑️${pruned} pruned (${consolidationDuration}ms)`);
      } catch (err) {
        console.warn('Memory consolidation failed:', err);
        cycleResults.memory_consolidation = { success: false, error: String(err) };
      }
    }

    // ═══════════════════════════════════════════════════════════
    // PHASE 6: Telemetry & Cycle Record
    // ═══════════════════════════════════════════════════════════
    const durationMs = Date.now() - startTime;
    const cycleRecord = {
      event_type: 'clm_server_cycle',
      module: 'clm_engine',
      outcome: cycleResults.cognitive_cycle?.success ? 'success' : 'partial',
      data: {
        version: CLM_VERSION,
        cycle_number: cycleNumber,
        intensity: cycleIntensity,
        duration_ms: durationMs,
        phases: {
          cognitive_cycle: cycleResults.cognitive_cycle?.success || false,
          modules_analyzed: cycleResults.module_analysis.length,
          learning_topic: cycleResults.learning_topic?.domain || null,
          brain_transfer: cycleResults.brain_transfer?.transferred || 0,
          memory_consolidation: cycleResults.memory_consolidation ? {
            promoted: cycleResults.memory_consolidation.promoted,
            demoted: cycleResults.memory_consolidation.demoted,
            pruned: cycleResults.memory_consolidation.pruned,
          } : null,
        },
        budget: {
          daily_used: cycleNumber,
          daily_max: MAX_CYCLES_PER_DAY,
          hourly_used: (hourCycles || 0) + 1,
          hourly_max: MAX_CYCLES_PER_HOUR,
        },
      },
    };

    await supabase.from('brain_events').insert(cycleRecord);

    console.log(`✅ CLM cycle #${cycleNumber} complete in ${durationMs}ms`);

    return new Response(JSON.stringify({
      success: true,
      version: CLM_VERSION,
      cycle_number: cycleNumber,
      intensity: cycleIntensity,
      duration_ms: durationMs,
      results: cycleResults,
      budget: cycleRecord.data.budget,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("CLM Engine error:", error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : "CLM Engine failed",
      version: CLM_VERSION,
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
