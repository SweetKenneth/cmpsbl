/**
 * pf-clm-engine — Server-Side Continuous Learning Engine
 * Runs autonomously via pg_cron — NO browser required
 * 
 * Executes the full CLM pipeline every cycle:
 * 1. Check budget/rate limits
 * 2. Run brain/cognitive_cycle (learn → reflect → synthesize → dream)
 * 3. Run module self-analysis for each active module
 * 4. Log learning telemetry
 * 
 * @version 1.0.0
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const CLM_VERSION = "1.0.0";
const MAX_CYCLES_PER_HOUR = 12; // Max 12 cognitive cycles per hour
const MAX_CYCLES_PER_DAY = 200; // 80% of 250 theoretical max

// Modules that participate in CLM self-analysis
const CLM_MODULES = [
  'brain', 'decode', 'defense', 'nexus', 'vision', 'dream',
  'cortex', 'ripple', 'modernizer', 'encode', 'access',
  'system', 'inclusive', 'integration', 'memory', 'relay',
  'audit', 'identity', 'economy', 'sandbox'
];

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

    // Parse request — cron sends minimal body
    let action = 'cycle';
    try {
      const body = await req.json();
      action = body.action || 'cycle';
    } catch {
      // Default to cycle for cron invocations
    }

    console.log(`⚡ CLM Engine v${CLM_VERSION} | action=${action}`);

    // ═══════════════════════════════════════════════════════════
    // BUDGET CHECK — Enforce daily/hourly limits
    // ═══════════════════════════════════════════════════════════
    const now = new Date();
    const todayKey = now.toISOString().split('T')[0];
    const currentHour = now.getUTCHours();

    // Count today's cycles
    const { count: todayCycles } = await supabase
      .from('brain_events')
      .select('id', { count: 'exact', head: true })
      .eq('event_type', 'clm_server_cycle')
      .gte('created_at', `${todayKey}T00:00:00Z`);

    if ((todayCycles || 0) >= MAX_CYCLES_PER_DAY) {
      console.log(`⏸️ Daily budget exhausted: ${todayCycles}/${MAX_CYCLES_PER_DAY}`);
      return new Response(JSON.stringify({
        success: true,
        skipped: true,
        reason: 'daily_budget_exhausted',
        cycles_today: todayCycles,
        max_daily: MAX_CYCLES_PER_DAY,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Count this hour's cycles
    const hourStart = new Date(now);
    hourStart.setMinutes(0, 0, 0);
    const { count: hourCycles } = await supabase
      .from('brain_events')
      .select('id', { count: 'exact', head: true })
      .eq('event_type', 'clm_server_cycle')
      .gte('created_at', hourStart.toISOString());

    if ((hourCycles || 0) >= MAX_CYCLES_PER_HOUR) {
      console.log(`⏸️ Hourly budget exhausted: ${hourCycles}/${MAX_CYCLES_PER_HOUR}`);
      return new Response(JSON.stringify({
        success: true,
        skipped: true,
        reason: 'hourly_budget_exhausted',
        cycles_this_hour: hourCycles,
        max_hourly: MAX_CYCLES_PER_HOUR,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ═══════════════════════════════════════════════════════════
    // QUIET HOURS — Reduce intensity during off-peak (2am-6am UTC)
    // ═══════════════════════════════════════════════════════════
    const isQuietHours = currentHour >= 2 && currentHour <= 6;
    const cycleIntensity = isQuietHours ? 'low' : 'full';

    // ═══════════════════════════════════════════════════════════
    // PHASE 1: Run Cognitive Cycle via pf-substrate
    // ═══════════════════════════════════════════════════════════
    const cycleResults: Record<string, any> = {
      cognitive_cycle: null,
      module_analysis: [],
      learning_topic: null,
      telemetry: null,
    };

    try {
      const { data: cycleData, error: cycleError } = await supabase.functions.invoke('pf-substrate', {
        body: {
          module: 'brain',
          action: 'cognitive_cycle',
        },
      });

      if (cycleError) {
        console.error('Cognitive cycle error:', cycleError);
        cycleResults.cognitive_cycle = { success: false, error: String(cycleError) };
      } else {
        cycleResults.cognitive_cycle = { success: true, phases: cycleData?.phases || {} };
        console.log('✅ Cognitive cycle complete');
      }
    } catch (err) {
      console.error('Cognitive cycle exception:', err);
      cycleResults.cognitive_cycle = { success: false, error: String(err) };
    }

    // ═══════════════════════════════════════════════════════════
    // PHASE 2: Module Self-Analysis (rotate through modules)
    // ═══════════════════════════════════════════════════════════
    // Pick 2-3 modules per cycle to avoid overload
    const modulesPerCycle = isQuietHours ? 1 : 3;
    const cycleIndex = (todayCycles || 0) % CLM_MODULES.length;
    const selectedModules = [];
    for (let i = 0; i < modulesPerCycle; i++) {
      selectedModules.push(CLM_MODULES[(cycleIndex + i) % CLM_MODULES.length]);
    }

    for (const moduleName of selectedModules) {
      try {
        // Fetch recent events for this module
        const { data: moduleEvents } = await supabase
          .from('brain_events')
          .select('event_type, outcome, data, created_at')
          .eq('module', moduleName)
          .order('created_at', { ascending: false })
          .limit(10);

        const successCount = moduleEvents?.filter((e: any) => e.outcome === 'success').length || 0;
        const totalCount = moduleEvents?.length || 0;
        const successRate = totalCount > 0 ? successCount / totalCount : 0;

        // Generate a learning insight
        const insight = {
          module: moduleName,
          events_analyzed: totalCount,
          success_rate: successRate,
          health_trend: successRate > 0.8 ? 'healthy' : successRate > 0.5 ? 'degraded' : 'critical',
          recent_patterns: moduleEvents?.slice(0, 3).map((e: any) => e.event_type) || [],
        };

        // Store as brain event
        await supabase.from('brain_events').insert({
          event_type: 'module_learning_insight',
          module: moduleName,
          outcome: 'success',
          data: {
            title: `${moduleName.toUpperCase()} Self-Analysis`,
            content: `Module ${moduleName} analyzed: ${totalCount} recent events, ${(successRate * 100).toFixed(0)}% success rate. Health: ${insight.health_trend}.`,
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
    // PHASE 3: Learning Topic Study (pick one topic per cycle)
    // ═══════════════════════════════════════════════════════════
    if (!isQuietHours) {
      const topicIndex = (todayCycles || 0) % LEARNING_TOPICS.length;
      const topic = LEARNING_TOPICS[topicIndex];

      try {
        // Use Nexus router to study this topic
        const { data: studyResult, error: studyError } = await supabase.functions.invoke('pf-substrate', {
          body: {
            module: 'brain',
            action: 'deep_think',
            data: {
              question: topic.prompt,
              depth: 'medium',
            },
          },
        });

        if (!studyError && studyResult?.success) {
          // Store learning as memory
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

          cycleResults.learning_topic = { domain: topic.domain, success: true };
          console.log(`📚 Studied: ${topic.domain}`);
        } else {
          cycleResults.learning_topic = { domain: topic.domain, success: false, error: String(studyError) };
        }
      } catch (err) {
        console.warn('Learning topic study failed:', err);
        cycleResults.learning_topic = { domain: topic.domain, success: false };
      }
    }

    // ═══════════════════════════════════════════════════════════
    // PHASE 4: Telemetry & Cycle Record
    // ═══════════════════════════════════════════════════════════
    const durationMs = Date.now() - startTime;
    const cycleRecord = {
      event_type: 'clm_server_cycle',
      module: 'clm_engine',
      outcome: cycleResults.cognitive_cycle?.success ? 'success' : 'partial',
      data: {
        version: CLM_VERSION,
        cycle_number: (todayCycles || 0) + 1,
        intensity: cycleIntensity,
        duration_ms: durationMs,
        phases: {
          cognitive_cycle: cycleResults.cognitive_cycle?.success || false,
          modules_analyzed: cycleResults.module_analysis.length,
          learning_topic: cycleResults.learning_topic?.domain || null,
        },
        budget: {
          daily_used: (todayCycles || 0) + 1,
          daily_max: MAX_CYCLES_PER_DAY,
          hourly_used: (hourCycles || 0) + 1,
          hourly_max: MAX_CYCLES_PER_HOUR,
        },
      },
    };

    await supabase.from('brain_events').insert(cycleRecord);

    console.log(`✅ CLM cycle #${(todayCycles || 0) + 1} complete in ${durationMs}ms`);

    return new Response(JSON.stringify({
      success: true,
      version: CLM_VERSION,
      cycle_number: (todayCycles || 0) + 1,
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
