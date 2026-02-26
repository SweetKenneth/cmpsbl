/**
 * pf-clm-engine — High-Velocity Continuous Learning Engine
 * v4.0.0 SPARTA Epoch — Burst Orchestrator Pattern
 * 
 * Supports burst mode: runs N cycles per invocation for maximum throughput.
 * Target: 25,000+ AI calls/day via 2,500 cycles × 10 topics each.
 * 
 * Actions:
 *   cycle       — Single cycle (backward compat, cron default)
 *   burst       — Run multiple cycles in one invocation (orchestrator pattern)
 *   status      — Return current budget/velocity stats
 * 
 * No new cron jobs needed — the substrate orchestrator dispatches bursts.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const CLM_VERSION = "4.0.0";
const MAX_CYCLES_PER_HOUR = 200;
const MAX_CYCLES_PER_DAY = 2500;
const DEFAULT_BURST_SIZE = 10;     // Cycles per burst invocation
const MAX_BURST_SIZE = 25;         // Hard cap per single invocation
const CYCLE_TIMEOUT_MS = 45_000;   // Per-cycle timeout (edge fn has ~60s)
const BURST_DEADLINE_MS = 50_000;  // Total burst deadline

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

// Learning topics — expanded for deeper coverage
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

interface BudgetState {
  todayCycles: number;
  hourCycles: number;
  remainingDaily: number;
  remainingHourly: number;
}

async function getBudgetState(supabase: any): Promise<BudgetState> {
  const now = new Date();
  const todayKey = now.toISOString().split('T')[0];
  const hourStart = new Date(now);
  hourStart.setMinutes(0, 0, 0);

  const [dailyRes, hourlyRes] = await Promise.all([
    supabase
      .from('brain_events')
      .select('id', { count: 'exact', head: true })
      .eq('event_type', 'clm_server_cycle')
      .gte('created_at', `${todayKey}T00:00:00Z`),
    supabase
      .from('brain_events')
      .select('id', { count: 'exact', head: true })
      .eq('event_type', 'clm_server_cycle')
      .gte('created_at', hourStart.toISOString()),
  ]);

  const todayCycles = dailyRes.count || 0;
  const hourCycles = hourlyRes.count || 0;

  return {
    todayCycles,
    hourCycles,
    remainingDaily: MAX_CYCLES_PER_DAY - todayCycles,
    remainingHourly: MAX_CYCLES_PER_HOUR - hourCycles,
  };
}

/**
 * Execute a single CLM cycle — lean and fast
 * Returns the number of AI calls made
 */
async function executeCycle(supabase: any, cycleNumber: number): Promise<{ aiCalls: number; success: boolean; durationMs: number }> {
  const cycleStart = Date.now();
  let aiCalls = 0;

  // PHASE 1: Module Self-Analysis (3 modules per cycle, fast rotation)
  const modulesPerCycle = 3;
  const cycleIndex = cycleNumber % CLM_MODULES.length;
  const selectedModules = [];
  for (let i = 0; i < modulesPerCycle; i++) {
    selectedModules.push(CLM_MODULES[(cycleIndex + i) % CLM_MODULES.length]);
  }

  const modulePromises = selectedModules.map(async (moduleName) => {
    try {
      const { data: moduleEvents } = await supabase
        .from('brain_events')
        .select('event_type, outcome')
        .eq('module', moduleName)
        .order('created_at', { ascending: false })
        .limit(10);

      const successCount = moduleEvents?.filter((e: any) => e.outcome === 'success').length || 0;
      const totalCount = moduleEvents?.length || 0;
      const successRate = totalCount > 0 ? successCount / totalCount : 0;

      await supabase.from('brain_events').insert({
        event_type: 'module_learning_insight',
        module: moduleName,
        outcome: 'success',
        data: {
          title: `${moduleName.toUpperCase()} Self-Analysis`,
          content: `Module ${moduleName}: ${totalCount} events, ${(successRate * 100).toFixed(0)}% success.`,
          health_trend: successRate > 0.8 ? 'healthy' : successRate > 0.5 ? 'degraded' : 'critical',
          source: 'clm_burst_engine',
          version: CLM_VERSION,
        },
      });
    } catch { /* non-fatal */ }
  });

  // PHASE 2: Learning Topic Study — ALL 10 topics in parallel (this is where the AI calls happen)
  const topicPromises = LEARNING_TOPICS.map(async (topic) => {
    try {
      const { data: studyResult, error: studyError } = await supabase.functions.invoke('pf-substrate', {
        body: { module: 'brain', action: 'deep_think', data: { question: topic.prompt, depth: 'medium' } },
      });

      if (!studyError && studyResult?.success) {
        aiCalls++;
        await Promise.allSettled([
          supabase.from('brain_events').insert({
            event_type: 'technical_learning_cycle',
            module: 'brain',
            outcome: 'success',
            data: {
              title: `CLM Study: ${topic.domain}`,
              domain: topic.domain,
              result: studyResult?.analysis?.substring?.(0, 800) || 'completed',
              source: 'clm_burst_engine',
              version: CLM_VERSION,
              cycle: cycleNumber,
            },
          }),
          supabase.from('brain_memory_hot').insert({
            content: `[CLM Learning: ${topic.domain}] ${studyResult?.analysis?.substring?.(0, 500) || topic.prompt}`,
            context: `clm_study:${topic.domain}`,
            priority: 8,
            access_count: 0,
            metadata: { domain: topic.domain, source: 'clm_burst_engine', cycle: cycleNumber },
          }),
        ]);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  });

  // Fire modules + topics in parallel
  await Promise.allSettled([...modulePromises, ...topicPromises]);

  // PHASE 3: Brain Transfer (every cycle — fast 2-module transfer)
  try {
    const transferModules = [
      CLM_MODULES[cycleNumber % CLM_MODULES.length],
      CLM_MODULES[(cycleNumber + 1) % CLM_MODULES.length],
    ];

    for (const targetModule of transferModules) {
      const signals = (MODULE_RELEVANCE[targetModule] || []).slice(0, 2);
      for (const signal of signals) {
        const { data: relevantMemories } = await supabase
          .from('brain_memories')
          .select('id, content, confidence')
          .ilike('content', `%${signal}%`)
          .gte('confidence', 0.6)
          .order('created_at', { ascending: false })
          .limit(2);

        if (relevantMemories?.length) {
          await Promise.allSettled(
            relevantMemories.map((mem: any) =>
              supabase.from('brain_memory_hot').insert({
                content: `[${targetModule.toUpperCase()}_TRANSFER] ${mem.content.substring(0, 400)}`,
                context: `${targetModule}_transfer:auto`,
                priority: Math.min(10, Math.round((mem.confidence || 0.7) * 10)),
                access_count: 0,
                metadata: { source_memory_id: mem.id, target_module: targetModule, signal, source: 'clm_burst_transfer' },
              }).catch(() => { /* dedup conflict */ })
            )
          );
        }
      }
    }
  } catch { /* non-fatal */ }

  // PHASE 4: Memory Consolidation (every 10th cycle)
  if (cycleNumber % 10 === 0) {
    try {
      // Quick promote high-access warm → hot
      const { data: warmHighAccess } = await supabase
        .from('brain_memory_warm')
        .select('id, content, confidence, access_count, memory_type, metadata')
        .gte('access_count', 3)
        .gte('confidence', 0.7)
        .order('access_count', { ascending: false })
        .limit(5);

      for (const mem of warmHighAccess || []) {
        try {
          await supabase.from('brain_memory_hot').insert({
            content: mem.content,
            context: `promoted:${mem.memory_type || 'general'}`,
            priority: Math.min(10, Math.round((mem.confidence || 0.7) * 10)),
            access_count: mem.access_count || 0,
            metadata: { ...((mem.metadata as any) || {}), promoted_from: 'warm', promoted_at: new Date().toISOString() },
          });
        } catch { /* already exists */ }
      }

      // Quick prune cold low-confidence
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 3600000).toISOString();
      const { data: coldLow } = await supabase
        .from('brain_memory_cold')
        .select('id')
        .lt('confidence', 0.3)
        .lt('created_at', thirtyDaysAgo)
        .limit(20);

      if (coldLow?.length) {
        await supabase.from('brain_memory_cold').delete().in('id', coldLow.map((m: any) => m.id));
      }
    } catch { /* non-fatal */ }
  }

  // Record cycle telemetry
  await supabase.from('brain_events').insert({
    event_type: 'clm_server_cycle',
    module: 'clm_engine',
    outcome: 'success',
    data: {
      version: CLM_VERSION,
      cycle_number: cycleNumber,
      ai_calls: aiCalls,
      modules_analyzed: selectedModules.length,
      topics_studied: LEARNING_TOPICS.length,
      duration_ms: Date.now() - cycleStart,
      mode: 'burst',
    },
  });

  return {
    aiCalls,
    success: true,
    durationMs: Date.now() - cycleStart,
  };
}

/**
 * Self-chain: dispatch the next burst via the substrate orchestrator
 */
async function chainNextBurst(supabase: any, burstSize: number, budget: BudgetState): Promise<void> {
  const remaining = Math.min(budget.remainingDaily - burstSize, budget.remainingHourly - burstSize);
  if (remaining <= 0) return;

  try {
    // Fire-and-forget — the orchestrator picks it up
    await supabase.functions.invoke('pf-clm-engine', {
      body: { action: 'burst', burst_size: Math.min(burstSize, MAX_BURST_SIZE) },
    });
  } catch {
    // Non-fatal — cron will catch up
  }
}

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
    let burstSize = DEFAULT_BURST_SIZE;
    let autoChain = true;

    try {
      const body = await req.json();
      action = body.action || 'cycle';
      burstSize = Math.min(body.burst_size || DEFAULT_BURST_SIZE, MAX_BURST_SIZE);
      autoChain = body.auto_chain !== false;
    } catch {
      // Default to cycle for cron invocations
    }

    console.log(`⚡ CLM Engine v${CLM_VERSION} | action=${action} burst_size=${burstSize}`);

    // ═══ STATUS ACTION ═══
    if (action === 'status') {
      const budget = await getBudgetState(supabase);
      const velocity = budget.todayCycles > 0
        ? Math.round((budget.todayCycles * 10) / Math.max(1, new Date().getUTCHours())) // est AI calls/hour
        : 0;

      return new Response(JSON.stringify({
        success: true,
        version: CLM_VERSION,
        budget: {
          daily: { used: budget.todayCycles, max: MAX_CYCLES_PER_DAY, remaining: budget.remainingDaily },
          hourly: { used: budget.hourCycles, max: MAX_CYCLES_PER_HOUR, remaining: budget.remainingHourly },
        },
        velocity: {
          est_ai_calls_today: budget.todayCycles * 10,
          est_ai_calls_per_hour: velocity,
          target_daily: 25000,
          pct_of_target: Math.round((budget.todayCycles * 10 / 25000) * 100),
        },
        config: {
          burst_size: DEFAULT_BURST_SIZE,
          max_burst_size: MAX_BURST_SIZE,
          modules: CLM_MODULES.length,
          topics_per_cycle: LEARNING_TOPICS.length,
        },
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ═══ BUDGET CHECK ═══
    const budget = await getBudgetState(supabase);

    if (budget.remainingDaily <= 0) {
      return new Response(JSON.stringify({ success: true, skipped: true, reason: 'daily_budget_exhausted', budget }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (budget.remainingHourly <= 0) {
      return new Response(JSON.stringify({ success: true, skipped: true, reason: 'hourly_budget_exhausted', budget }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ═══ BURST / CYCLE EXECUTION ═══
    const effectiveBurstSize = action === 'burst'
      ? Math.min(burstSize, budget.remainingDaily, budget.remainingHourly)
      : 1;

    const cycleResults: Array<{ cycle: number; aiCalls: number; durationMs: number }> = [];
    let totalAiCalls = 0;

    for (let i = 0; i < effectiveBurstSize; i++) {
      // Check deadline
      if (Date.now() - startTime > BURST_DEADLINE_MS) {
        console.log(`⏰ Burst deadline reached after ${i} cycles`);
        break;
      }

      const cycleNumber = budget.todayCycles + i + 1;
      try {
        const result = await executeCycle(supabase, cycleNumber);
        totalAiCalls += result.aiCalls;
        cycleResults.push({ cycle: cycleNumber, aiCalls: result.aiCalls, durationMs: result.durationMs });
        console.log(`✅ Cycle #${cycleNumber}: ${result.aiCalls} AI calls in ${result.durationMs}ms`);
      } catch (err) {
        console.warn(`❌ Cycle #${cycleNumber} failed:`, err);
        cycleResults.push({ cycle: cycleNumber, aiCalls: 0, durationMs: 0 });
      }
    }

    // ═══ SELF-CHAIN: dispatch next burst ═══
    if (autoChain && action === 'burst' && budget.remainingDaily > effectiveBurstSize) {
      await chainNextBurst(supabase, burstSize, {
        ...budget,
        remainingDaily: budget.remainingDaily - effectiveBurstSize,
        remainingHourly: budget.remainingHourly - effectiveBurstSize,
      });
    }

    const totalDuration = Date.now() - startTime;

    return new Response(JSON.stringify({
      success: true,
      version: CLM_VERSION,
      mode: action,
      cycles_completed: cycleResults.length,
      total_ai_calls: totalAiCalls,
      duration_ms: totalDuration,
      cycles: cycleResults,
      budget: {
        daily_used: budget.todayCycles + cycleResults.length,
        daily_max: MAX_CYCLES_PER_DAY,
        hourly_used: budget.hourCycles + cycleResults.length,
        hourly_max: MAX_CYCLES_PER_HOUR,
      },
      velocity: {
        est_daily_at_current_rate: Math.round((budget.todayCycles + cycleResults.length) * 10),
        target: 25000,
      },
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
