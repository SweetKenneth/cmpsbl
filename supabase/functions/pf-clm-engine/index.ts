/**
 * pf-clm-engine — Adaptive Constant Learning Engine
 * v6.0.0 — Full 40-Node Coverage + Auto-Maintenance
 * 
 * Runs in adaptive burst mode. Respects free-tier provider capacity by tracking
 * recent failure rates and backing off when providers are saturated.
 * 
 * v6.0 changes:
 * - All 40 substrate nodes covered (was 20)
 * - Raised daily cap to 600 (was 200) — NEXUS budget allows 98k/hour
 * - Cold tier auto-pruning when at capacity
 * - Node-priority-aware topic selection
 * - Per-node health-driven learning intensity
 * - Smarter memory tier overflow handling
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const CLM_VERSION = "6.0.0";
const MAX_CYCLES_PER_HOUR = 30;        // Raised from 12
const MAX_CYCLES_PER_DAY = 600;        // Raised from 200 — NEXUS budget allows far more
const DEFAULT_BURST_SIZE = 3;          // 3 cycles per burst (was 2)
const MAX_BURST_SIZE = 5;             // Hard cap per invocation (was 3)
const CYCLE_TIMEOUT_MS = 45_000;
const BURST_DEADLINE_MS = 55_000;
const FAILURE_RATE_BACKOFF_THRESHOLD = 0.5;
const FAILURE_RATE_HALT_THRESHOLD = 0.8;

// All 40 substrate nodes
const CLM_MODULES = [
  // Core + System
  'core', 'system',
  // CCR Zone
  'brain', 'memory', 'dream',
  // OCG Zone
  'ripple', 'access', 'identity', 'relay', 'audit', 'nerve',
  // Execution Sector
  'decode', 'encode', 'vision', 'cortex', 'nexus', 'economy',
  'sandbox', 'inclusive', 'medic', 'integration', 'evolution',
  // ESZ — Expansion Sovereignty Zone
  'sovereign', 'oracle', 'conscience', 'treaty',
  // EPZ — Expansion Perception Zone
  'compass', 'echo', 'reflex',
  // EMZ — Expansion Manufacturing Zone
  'forge', 'lingua', 'harvest',
  // CSZ — Cognitive Shadow Zone
  'shadow', 'phantom',
  // Fields
  'immunity', 'intent',
  // Plane
  'governance',
  // Shell
  'defense',
  // Auxiliary
  'atlas', 'observer',
];

// Module transfer configs — relevance signals for brain→module knowledge routing
const MODULE_RELEVANCE: Record<string, string[]> = {
  core:         ['memory', 'storage', 'persistence', 'state', 'cache', 'retrieve'],
  system:       ['health', 'audit', 'configuration', 'settings', 'admin', 'governance'],
  brain:        ['reasoning', 'knowledge', 'graph', 'memory', 'consolidation', 'tiering'],
  memory:       ['vector', 'embedding', 'semantic', 'rag', 'retrieval', 'recall', 'tiering'],
  dream:        ['dream', 'synthesis', 'creative', 'imagination', 'insight', 'hypothesis'],
  ripple:       ['event', 'propagation', 'broadcast', 'publish', 'subscribe', 'cascade'],
  access:       ['permission', 'role', 'authorization', 'api key', 'token', 'quota'],
  identity:     ['actor', 'attribution', 'signature', 'webauthn', 'session', 'credential'],
  relay:        ['webhook', 'outbound', 'delivery', 'retry', 'queue', 'notification'],
  audit:        ['compliance', 'audit trail', 'immutable', 'chain', 'retention', 'regulatory'],
  nerve:        ['signal', 'propagation', 'consensus', 'quorum', 'split-brain'],
  decode:       ['response', 'conversation', 'chat', 'personality', 'tone', 'user', 'context'],
  encode:       ['code generation', 'task packet', 'code review', 'refactor', 'implementation'],
  vision:       ['trace', 'diagnostic', 'observability', 'metric', 'monitor', 'alert', 'latency'],
  cortex:       ['architecture', 'design', 'pattern', 'proposal', 'refactor', 'structure'],
  nexus:        ['routing', 'provider', 'model', 'fallback', 'latency', 'cost', 'health'],
  economy:      ['cost', 'budget', 'pricing', 'billing', 'usage', 'metering', 'roi'],
  sandbox:      ['isolation', 'sandbox', 'speculative', 'safe execution', 'containment'],
  inclusive:    ['accessibility', 'a11y', 'wcag', 'aria', 'screen reader', 'keyboard'],
  medic:        ['diagnostics', 'health', 'recovery', 'self-heal', 'repair'],
  integration:  ['webhook', 'api', 'endpoint', 'transform', 'pipeline', 'data sync'],
  evolution:    ['upgrade', 'evolution', 'modernize', 'refactor', 'migrate', 'diff'],
  sovereign:    ['compliance', 'jurisdiction', 'residency', 'gdpr', 'ccpa', 'consent'],
  oracle:       ['prediction', 'forecast', 'bayesian', 'monte carlo', 'confidence'],
  conscience:   ['bias', 'ethics', 'fairness', 'impact', 'transparency'],
  treaty:       ['sla', 'contract', 'agreement', 'penalty', 'compliance'],
  compass:      ['geospatial', 'routing', 'optimization', 'decomposition', 'trend'],
  echo:         ['digital twin', 'replay', 'simulation', 'fidelity', 'drift'],
  reflex:       ['edge', 'latency', 'decision', 'pre-computed', 'critical-path'],
  forge:        ['artifact', 'template', 'synthesis', 'generation', 'quality'],
  lingua:       ['translation', 'localization', 'language', 'glossary', 'locale'],
  harvest:      ['data', 'acquisition', 'etl', 'ingestion', 'source', 'pipeline'],
  shadow:       ['shadow', 'execution', 'divergence', 'a/b test', 'comparison'],
  phantom:      ['privacy', 'pii', 'masking', 'differential', 'anonymization'],
  immunity:     ['cascade', 'circuit breaker', 'auto-heal', 'isolation', 'resilience'],
  intent:       ['goal', 'decomposition', 'capability', 'mesh', 'routing'],
  governance:   ['veto', 'policy', 'rule', 'constraint', 'approval'],
  defense:      ['security', 'threat', 'attack', 'vulnerability', 'injection', 'bot', 'anomaly'],
  atlas:        ['navigation', 'discovery', 'capability', 'map', 'topology'],
  observer:     ['telemetry', 'watchdog', 'anomaly', 'z-score', 'alert'],
};

// Learning topics — expanded with node-specific focus areas
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
  { domain: 'governance', prompt: 'Assess policy enforcement effectiveness. Are there gaps in governance coverage or false vetoes?' },
  { domain: 'privacy', prompt: 'Review PII handling and data anonymization. Are there privacy risks or masking gaps?' },
  { domain: 'prediction', prompt: 'Evaluate prediction accuracy and Bayesian model calibration. Where can forecasting improve?' },
  { domain: 'integration', prompt: 'Review external API integration health, retry patterns, and webhook delivery reliability.' },
  { domain: 'observability', prompt: 'Assess telemetry coverage, alert quality, and anomaly detection effectiveness across all 40 nodes.' },
];

interface BudgetState {
  todayCycles: number;
  hourCycles: number;
  remainingDaily: number;
  remainingHourly: number;
}

type MemoryTier = 'hot' | 'warm' | 'cold';

interface MemoryTierState {
  hot: number;
  warm: number;
  cold: number;
  hotLimit: number;
  warmLimit: number;
  coldLimit: number;
}

async function getMemoryTierState(supabase: any): Promise<MemoryTierState> {
  const [hotRes, warmRes, coldRes, configRes] = await Promise.all([
    supabase.from('brain_memory_hot').select('id', { count: 'exact', head: true }),
    supabase.from('brain_memory_warm').select('id', { count: 'exact', head: true }),
    supabase.from('brain_memory_cold').select('id', { count: 'exact', head: true }),
    supabase.from('brain_tiering_config').select('tier_name, max_entries').in('tier_name', ['hot', 'warm', 'cold']),
  ]);

  const configRows: Array<{ tier_name: string; max_entries: number | null }> = configRes.data || [];
  const hotLimit = configRows.find((r) => r.tier_name === 'hot')?.max_entries || 500;
  const warmLimit = configRows.find((r) => r.tier_name === 'warm')?.max_entries || 10000;
  const coldLimit = configRows.find((r) => r.tier_name === 'cold')?.max_entries || 10000;

  return {
    hot: hotRes.count || 0,
    warm: warmRes.count || 0,
    cold: coldRes.count || 0,
    hotLimit,
    warmLimit,
    coldLimit,
  };
}

/**
 * Auto-prune cold tier when at capacity — evict lowest-value entries
 */
async function autoRelieveColdPressure(supabase: any, tiers: MemoryTierState): Promise<number> {
  if (tiers.cold < tiers.coldLimit * 0.95) return 0;
  
  const pruneTarget = Math.min(200, Math.max(50, Math.floor(tiers.coldLimit * 0.05)));
  
  try {
    // Delete lowest value_score entries that are old
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 3600000).toISOString();
    const { data: candidates } = await supabase
      .from('brain_memory_cold')
      .select('id')
      .lt('value_score', 0.3)
      .lt('created_at', thirtyDaysAgo)
      .order('value_score', { ascending: true })
      .limit(pruneTarget);

    if (candidates?.length) {
      await supabase.from('brain_memory_cold').delete().in('id', candidates.map((m: any) => m.id));
      tiers.cold -= candidates.length;
      return candidates.length;
    }

    // Fallback: prune oldest low-confidence regardless of age
    const { data: fallback } = await supabase
      .from('brain_memory_cold')
      .select('id')
      .lt('value_score', 0.25)
      .order('created_at', { ascending: true })
      .limit(pruneTarget);

    if (fallback?.length) {
      await supabase.from('brain_memory_cold').delete().in('id', fallback.map((m: any) => m.id));
      tiers.cold -= fallback.length;
      return fallback.length;
    }
  } catch { /* non-fatal */ }
  return 0;
}

function selectLearningTier(
  tiers: MemoryTierState,
  options?: { preferWarm?: boolean; forceCold?: boolean }
): MemoryTier {
  if (options?.forceCold) return 'cold';

  const hotPressure = tiers.hot / Math.max(1, tiers.hotLimit);
  const warmPressure = tiers.warm / Math.max(1, tiers.warmLimit);
  const coldPressure = tiers.cold / Math.max(1, tiers.coldLimit);

  if (options?.preferWarm || hotPressure >= 0.9) {
    if (warmPressure >= 0.95) {
      return coldPressure >= 0.95 ? 'warm' : 'cold'; // Warm over overflow if cold also full
    }
    return 'warm';
  }

  if (hotPressure >= 1) {
    return warmPressure >= 0.95 ? 'cold' : 'warm';
  }

  return 'hot';
}

async function writeLearningMemory(
  supabase: any,
  tiers: MemoryTierState,
  input: {
    content: string;
    context: string;
    priority?: number;
    valueScore?: number;
    metadata?: Record<string, unknown>;
    preferWarm?: boolean;
  }
): Promise<MemoryTier> {
  const content = input.content.trim().substring(0, 1000);
  const coreSummary = content.substring(0, 220);
  const tier = selectLearningTier(tiers, { preferWarm: input.preferWarm });
  const valueScore = Math.max(0.15, Math.min(0.95, input.valueScore ?? 0.62));

  const sourceModule = String(input.metadata?.source_module || input.metadata?.module || 'CLM');
  const category = String(input.metadata?.domain || input.metadata?.category || input.context?.split(':')?.[1] || 'uncategorized');

  if (tier === 'hot') {
    await supabase.from('brain_memory_hot').insert({
      content,
      context: input.context,
      priority: input.priority ?? 7,
      access_count: 0,
      value_score: valueScore,
      importance_score: valueScore,
      source_module: sourceModule,
      category,
      metadata: { ...(input.metadata || {}), clm_tiered_write: true, stored_tier: 'hot' },
    });
    tiers.hot += 1;
    return 'hot';
  }

  if (tier === 'warm') {
    await supabase.from('brain_memory_warm').insert({
      content,
      core_summary: coreSummary,
      context: input.context,
      priority: input.priority ?? 6,
      access_count: 0,
      value_score: valueScore,
      decay_rate: 0.01,
      source_module: sourceModule,
      category,
      metadata: { ...(input.metadata || {}), clm_tiered_write: true, stored_tier: 'warm' },
      demoted_at: new Date().toISOString(),
    });
    tiers.warm += 1;
    return 'warm';
  }

  // Cold — auto-prune first if at capacity
  if (tiers.cold >= tiers.coldLimit * 0.95) {
    await autoRelieveColdPressure(supabase, tiers);
  }

  await supabase.from('brain_memory_cold').insert({
    summary: content,
    core_summary: coreSummary,
    value_score: Math.min(0.45, valueScore),
    memory_type: 'clm_learning',
    source_module: sourceModule,
    category,
    tags: { context: input.context, source: 'clm_engine', clm_tiered_write: true, stored_tier: 'cold' },
    archived_at: new Date().toISOString(),
  });
  tiers.cold += 1;
  return 'cold';
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

async function getRealAICallCounts(supabase: any): Promise<{ today: number; hour: number; failureRate: number }> {
  const now = new Date();
  const todayKey = now.toISOString().split('T')[0];
  const hourStart = new Date(now);
  hourStart.setMinutes(0, 0, 0);

  const [dailyRes, hourlyRes, recentFailRes, recentTotalRes] = await Promise.all([
    supabase
      .from('ai_usage_log')
      .select('id', { count: 'exact', head: true })
      .eq('success', true)
      .gte('created_at', `${todayKey}T00:00:00Z`),
    supabase
      .from('ai_usage_log')
      .select('id', { count: 'exact', head: true })
      .eq('success', true)
      .gte('created_at', hourStart.toISOString()),
    supabase
      .from('ai_usage_log')
      .select('id', { count: 'exact', head: true })
      .eq('success', false)
      .gte('created_at', new Date(Date.now() - 30 * 60_000).toISOString()),
    supabase
      .from('ai_usage_log')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', new Date(Date.now() - 30 * 60_000).toISOString()),
  ]);

  const recentFails = recentFailRes.count || 0;
  const recentTotal = recentTotalRes.count || 0;
  const failureRate = recentTotal > 0 ? recentFails / recentTotal : 0;

  return {
    today: dailyRes.count || 0,
    hour: hourlyRes.count || 0,
    failureRate,
  };
}

/**
 * Get node health scores — prioritize degraded nodes for more learning
 */
async function getNodeHealthScores(supabase: any): Promise<Map<string, number>> {
  const scores = new Map<string, number>();
  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  try {
    const { data: events } = await supabase
      .from('brain_events')
      .select('module, outcome')
      .in('module', CLM_MODULES)
      .gte('created_at', since24h)
      .limit(1000);

    if (events) {
      const moduleCounts = new Map<string, { success: number; total: number }>();
      for (const e of events) {
        const m = e.module as string;
        const entry = moduleCounts.get(m) || { success: 0, total: 0 };
        entry.total++;
        if (e.outcome === 'success') entry.success++;
        moduleCounts.set(m, entry);
      }
      for (const [mod, counts] of moduleCounts) {
        scores.set(mod, counts.total > 0 ? (counts.success / counts.total) * 100 : 50);
      }
    }
  } catch { /* non-fatal */ }

  // Default score for untracked modules
  for (const mod of CLM_MODULES) {
    if (!scores.has(mod)) scores.set(mod, 50);
  }

  return scores;
}

/**
 * Select modules for this cycle — prioritize degraded nodes
 */
function selectModulesForCycle(cycleNumber: number, healthScores: Map<string, number>, modulesPerCycle: number): string[] {
  // Always include 1 degraded module if any exist
  const degraded = CLM_MODULES.filter(m => (healthScores.get(m) || 50) < 70);
  const selected: string[] = [];

  if (degraded.length > 0) {
    selected.push(degraded[cycleNumber % degraded.length]);
  }

  // Fill remaining slots with rotating selection
  const remaining = modulesPerCycle - selected.length;
  for (let i = 0; i < remaining; i++) {
    const idx = (cycleNumber * modulesPerCycle + i) % CLM_MODULES.length;
    const mod = CLM_MODULES[idx];
    if (!selected.includes(mod)) selected.push(mod);
  }

  return selected.slice(0, modulesPerCycle);
}

/**
 * Execute a single CLM cycle
 */
async function executeCycle(supabase: any, cycleNumber: number, healthScores: Map<string, number>): Promise<{ aiCalls: number; success: boolean; durationMs: number; coldPruned: number }> {
  const cycleStart = Date.now();
  let aiCalls = 0;
  let coldPruned = 0;

  let tierState = await getMemoryTierState(supabase);
  const hotPressureAtStart = tierState.hot / Math.max(1, tierState.hotLimit);
  const preferWarmForLearning = hotPressureAtStart >= 0.85;

  // Auto-prune cold tier if at capacity before we start writing
  if (tierState.cold >= tierState.coldLimit * 0.95) {
    coldPruned = await autoRelieveColdPressure(supabase, tierState);
    if (coldPruned > 0) {
      console.log(`🧹 Auto-pruned ${coldPruned} low-value cold entries`);
    }
  }

  // PHASE 1: Module Self-Analysis (4 modules per cycle, health-prioritized)
  const modulesPerCycle = 4;
  const selectedModules = selectModulesForCycle(cycleNumber, healthScores, modulesPerCycle);

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
      const healthScore = healthScores.get(moduleName) || 50;

      await supabase.from('brain_events').insert({
        event_type: 'module_learning_insight',
        module: moduleName,
        outcome: 'success',
        data: {
          title: `${moduleName.toUpperCase()} Self-Analysis`,
          content: `Module ${moduleName}: ${totalCount} events, ${(successRate * 100).toFixed(0)}% success, health=${healthScore.toFixed(0)}.`,
          health_trend: healthScore > 80 ? 'healthy' : healthScore > 50 ? 'degraded' : 'critical',
          source: 'clm_burst_engine',
          version: CLM_VERSION,
        },
      });
    } catch { /* non-fatal */ }
  });

  // PHASE 2: Learning Topic Study — 3 topics per cycle
  const topicsPerCycle = 3;
  const topicOffset = cycleNumber % LEARNING_TOPICS.length;
  const selectedTopics: typeof LEARNING_TOPICS = [];
  for (let i = 0; i < topicsPerCycle; i++) {
    selectedTopics.push(LEARNING_TOPICS[(topicOffset + i) % LEARNING_TOPICS.length]);
  }

  const topicPromises = selectedTopics.map(async (topic) => {
    try {
      const { data: studyResult, error: studyError } = await supabase.functions.invoke('pf-substrate', {
        body: { module: 'brain', action: 'deep_think', data: { query: topic.prompt, depth: 2 } },
      });

      const usedRealProvider =
        !studyError &&
        studyResult?.success &&
        typeof studyResult?.analysis === 'string' &&
        studyResult?.ai_provider &&
        studyResult.ai_provider !== 'local';

      if (usedRealProvider) {
        aiCalls++;

        const analysisText = studyResult.analysis as string;
        const memoryContent = `[CLM Learning: ${topic.domain}] ${analysisText.substring(0, 500)}`;
        const storedTier = await writeLearningMemory(supabase, tierState, {
          content: memoryContent,
          context: `clm_study:${topic.domain}`,
          priority: 8,
          valueScore: 0.64,
          preferWarm: preferWarmForLearning,
          metadata: {
            domain: topic.domain,
            source: 'clm_adaptive_engine',
            cycle: cycleNumber,
            ai_provider: studyResult.ai_provider,
          },
        });

        await supabase.from('brain_events').insert({
          event_type: 'technical_learning_cycle',
          module: 'brain',
          outcome: 'success',
          data: {
            title: `CLM Study: ${topic.domain}`,
            domain: topic.domain,
            result: analysisText.substring(0, 800),
            source: 'clm_adaptive_engine',
            version: CLM_VERSION,
            cycle: cycleNumber,
            stored_tier: storedTier,
            hot_pressure_start: Number(hotPressureAtStart.toFixed(2)),
            ai_provider: studyResult.ai_provider,
            tokens_used: studyResult.tokens_used ?? null,
            latency_ms: studyResult.latency_ms ?? null,
          },
        });

        return true;
      }
      return false;
    } catch {
      return false;
    }
  });

  // Fire modules + topics in parallel
  await Promise.allSettled([...modulePromises, ...topicPromises]);

  // PHASE 3: Brain Transfer (2 modules per cycle, fast rotation)
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
              writeLearningMemory(supabase, tierState, {
                content: `[${targetModule.toUpperCase()}_TRANSFER] ${mem.content.substring(0, 400)}`,
                context: `${targetModule}_transfer:auto`,
                priority: Math.min(10, Math.round((mem.confidence || 0.7) * 10)),
                valueScore: Math.max(0.45, Math.min(0.9, mem.confidence || 0.7)),
                preferWarm: true,
                metadata: {
                  source_memory_id: mem.id,
                  target_module: targetModule,
                  signal,
                  source: 'clm_burst_transfer',
                },
              }).catch(() => { /* non-fatal */ })
            )
          );
        }
      }
    }
  } catch { /* non-fatal */ }

  // PHASE 4: Memory Consolidation (every 10th cycle)
  if (cycleNumber % 10 === 0) {
    try {
      tierState = await getMemoryTierState(supabase);
      const safeHotTarget = Math.max(100, Math.floor(tierState.hotLimit * 0.85));
      const promoteBudget = Math.max(0, safeHotTarget - tierState.hot);

      if (promoteBudget > 0) {
        const { data: warmHighAccess } = await supabase
          .from('brain_memory_warm')
          .select('id, content, value_score, access_count, memory_type, metadata, source_module, category')
          .gte('access_count', 3)
          .gte('value_score', 0.7)
          .order('access_count', { ascending: false })
          .limit(Math.min(5, promoteBudget));

        for (const mem of warmHighAccess || []) {
          try {
            const promotedScore = Math.max(0.7, Math.min(0.95, mem.value_score || 0.75));
            await supabase.from('brain_memory_hot').insert({
              content: mem.content,
              context: `promoted:${mem.memory_type || 'general'}`,
              priority: Math.min(10, Math.round(promotedScore * 10)),
              access_count: mem.access_count || 0,
              value_score: promotedScore,
              importance_score: promotedScore,
              source_module: mem.source_module || 'CLM',
              category: mem.category || 'uncategorized',
              metadata: { ...((mem.metadata as any) || {}), promoted_from: 'warm', promoted_at: new Date().toISOString() },
            });
            await supabase.from('brain_memory_warm').delete().eq('id', mem.id);
            tierState.hot += 1;
            tierState.warm = Math.max(0, tierState.warm - 1);
          } catch { /* already exists or non-fatal */ }
        }
      }

      // Auto-prune cold
      if (tierState.cold >= tierState.coldLimit * 0.9) {
        coldPruned += await autoRelieveColdPressure(supabase, tierState);
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
      modules_selected: selectedModules,
      topics_studied: selectedTopics.length,
      duration_ms: Date.now() - cycleStart,
      mode: 'adaptive',
      cold_pruned: coldPruned,
      memory_tiers: {
        hot: tierState.hot,
        warm: tierState.warm,
        cold: tierState.cold,
        hot_limit: tierState.hotLimit,
        warm_limit: tierState.warmLimit,
        cold_limit: tierState.coldLimit,
        prefer_warm_for_learning: preferWarmForLearning,
      },
    },
  });

  return {
    aiCalls,
    success: true,
    durationMs: Date.now() - cycleStart,
    coldPruned,
  };
}

/**
 * Self-chain: dispatch the next burst immediately after this one completes.
 */
function chainNextBurst(supabaseUrl: string, serviceKey: string, burstSize: number, budget: BudgetState): void {
  const remaining = Math.min(budget.remainingDaily - burstSize, budget.remainingHourly - burstSize);
  if (remaining <= 0) return;

  const nextSize = Math.min(burstSize, MAX_BURST_SIZE, remaining);
  if (nextSize <= 0) return;

  const url = `${supabaseUrl}/functions/v1/pf-clm-engine`;
  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${serviceKey}`,
    },
    body: JSON.stringify({ action: 'burst', burst_size: nextSize, auto_chain: true }),
  }).catch(() => { /* non-fatal — cron will catch up */ });
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

    let action = 'burst';
    let burstSize = DEFAULT_BURST_SIZE;
    let autoChain = true;

    try {
      const body = await req.json();
      action = body.action || 'burst';
      burstSize = Math.min(body.burst_size || DEFAULT_BURST_SIZE, MAX_BURST_SIZE);
      autoChain = body.auto_chain !== false;
    } catch {
      // Default to burst for cron invocations (no body)
    }

    console.log(`⚡ CLM Engine v${CLM_VERSION} | action=${action} burst_size=${burstSize} auto_chain=${autoChain}`);

    // ═══ STATUS ACTION ═══
    if (action === 'status') {
      const [budget, memory, realCalls, healthScores] = await Promise.all([
        getBudgetState(supabase),
        getMemoryTierState(supabase),
        getRealAICallCounts(supabase),
        getNodeHealthScores(supabase),
      ]);

      const degradedNodes = CLM_MODULES.filter(m => (healthScores.get(m) || 50) < 70);

      return new Response(JSON.stringify({
        success: true,
        version: CLM_VERSION,
        budget: {
          daily: { used: budget.todayCycles, max: MAX_CYCLES_PER_DAY, remaining: budget.remainingDaily },
          hourly: { used: budget.hourCycles, max: MAX_CYCLES_PER_HOUR, remaining: budget.remainingHourly },
        },
        velocity: {
          est_ai_calls_today: realCalls.today,
          est_ai_calls_per_hour: realCalls.hour,
          failure_rate_30m: realCalls.failureRate,
          target_daily: 2000,
          pct_of_target: Math.round((realCalls.today / 2000) * 100),
        },
        memory: {
          hot: { count: memory.hot, limit: memory.hotLimit, pressure: Number((memory.hot / Math.max(1, memory.hotLimit)).toFixed(2)) },
          warm: { count: memory.warm, limit: memory.warmLimit, pressure: Number((memory.warm / Math.max(1, memory.warmLimit)).toFixed(2)) },
          cold: { count: memory.cold, limit: memory.coldLimit, pressure: Number((memory.cold / Math.max(1, memory.coldLimit)).toFixed(2)) },
          write_policy: memory.hot >= Math.floor(memory.hotLimit * 0.85) ? 'prefer_warm' : 'allow_hot',
        },
        nodes: {
          total: CLM_MODULES.length,
          degraded: degradedNodes,
          degraded_count: degradedNodes.length,
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

    // ═══ FAILURE-RATE GATE ═══
    const recentHealth = await getRealAICallCounts(supabase);
    if (recentHealth.failureRate >= FAILURE_RATE_HALT_THRESHOLD) {
      console.log(`🛑 CLM halted — provider failure rate ${(recentHealth.failureRate * 100).toFixed(0)}% exceeds ${FAILURE_RATE_HALT_THRESHOLD * 100}% threshold`);
      return new Response(JSON.stringify({
        success: true, skipped: true,
        reason: 'provider_saturation',
        failure_rate: recentHealth.failureRate,
        message: `Provider fleet failure rate is ${(recentHealth.failureRate * 100).toFixed(0)}%. Backing off to let rate limits recover.`,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    let adaptiveBurstSize = burstSize;
    if (recentHealth.failureRate >= FAILURE_RATE_BACKOFF_THRESHOLD) {
      adaptiveBurstSize = 1;
      console.log(`⚠️ CLM reduced to 1 cycle — failure rate ${(recentHealth.failureRate * 100).toFixed(0)}%`);
    }

    // ═══ FETCH NODE HEALTH FOR PRIORITIZED LEARNING ═══
    const healthScores = await getNodeHealthScores(supabase);

    // ═══ BURST / CYCLE EXECUTION ═══
    const effectiveBurstSize = Math.min(adaptiveBurstSize, budget.remainingDaily, budget.remainingHourly);

    const cycleResults: Array<{ cycle: number; aiCalls: number; durationMs: number; coldPruned: number }> = [];
    let totalAiCalls = 0;
    let totalColdPruned = 0;

    for (let i = 0; i < effectiveBurstSize; i++) {
      if (Date.now() - startTime > BURST_DEADLINE_MS) {
        console.log(`⏰ Burst deadline reached after ${i} cycles`);
        break;
      }

      const cycleNumber = budget.todayCycles + i + 1;
      try {
        const result = await executeCycle(supabase, cycleNumber, healthScores);
        totalAiCalls += result.aiCalls;
        totalColdPruned += result.coldPruned;
        cycleResults.push({ cycle: cycleNumber, aiCalls: result.aiCalls, durationMs: result.durationMs, coldPruned: result.coldPruned });
        console.log(`✅ Cycle #${cycleNumber}: ${result.aiCalls} AI calls in ${result.durationMs}ms`);
      } catch (err) {
        console.warn(`❌ Cycle #${cycleNumber} failed:`, err);
        cycleResults.push({ cycle: cycleNumber, aiCalls: 0, durationMs: 0, coldPruned: 0 });
      }
    }

    // ═══ SELF-CHAIN ═══
    const shouldChain = autoChain && totalAiCalls > 0 && recentHealth.failureRate < FAILURE_RATE_BACKOFF_THRESHOLD
      && budget.remainingDaily > effectiveBurstSize && budget.remainingHourly > effectiveBurstSize;
    if (shouldChain) {
      chainNextBurst(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, adaptiveBurstSize, {
        ...budget,
        todayCycles: budget.todayCycles + cycleResults.length,
        hourCycles: budget.hourCycles + cycleResults.length,
        remainingDaily: budget.remainingDaily - cycleResults.length,
        remainingHourly: budget.remainingHourly - cycleResults.length,
      });
    } else if (autoChain && totalAiCalls === 0) {
      console.log('⏸️ Auto-chain skipped — no real external AI calls completed');
    } else if (autoChain && recentHealth.failureRate >= FAILURE_RATE_BACKOFF_THRESHOLD) {
      console.log(`⏸️ Auto-chain skipped — failure rate ${(recentHealth.failureRate * 100).toFixed(0)}% too high`);
    }

    const totalDuration = Date.now() - startTime;

    const [memory, realCalls] = await Promise.all([
      getMemoryTierState(supabase),
      getRealAICallCounts(supabase),
    ]);
    const hotOverflow = Math.max(0, memory.hot - memory.hotLimit);
    const tierReliefQueued = hotOverflow > 0;

    if (tierReliefQueued) {
      supabase.functions.invoke('pf-substrate', {
        body: {
          module: 'brain',
          action: 'tier',
          payload: {
            mode: hotOverflow > 200 ? 'deep' : 'aggressive',
            trigger: 'clm_auto_relief',
          },
        },
      }).catch((error: unknown) => {
        console.warn('⚠️ CLM auto-relief tier trigger failed', error);
      });
    }

    return new Response(JSON.stringify({
      success: true,
      version: CLM_VERSION,
      mode: action,
      cycles_completed: cycleResults.length,
      total_ai_calls: totalAiCalls,
      total_cold_pruned: totalColdPruned,
      duration_ms: totalDuration,
      cycles: cycleResults,
      budget: {
        daily_used: budget.todayCycles + cycleResults.length,
        daily_max: MAX_CYCLES_PER_DAY,
        hourly_used: budget.hourCycles + cycleResults.length,
        hourly_max: MAX_CYCLES_PER_HOUR,
      },
      velocity: {
        est_daily_at_current_rate: realCalls.today,
        target: 2000,
      },
      memory: {
        hot: { count: memory.hot, limit: memory.hotLimit, overflow: hotOverflow },
        warm: { count: memory.warm, limit: memory.warmLimit },
        cold: { count: memory.cold, limit: memory.coldLimit },
      },
      nodes: {
        total: CLM_MODULES.length,
      },
      safeguards: {
        clm_write_policy: memory.hot >= Math.floor(memory.hotLimit * 0.85) ? 'prefer_warm' : 'allow_hot',
        tier_relief_queued: tierReliefQueued,
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
