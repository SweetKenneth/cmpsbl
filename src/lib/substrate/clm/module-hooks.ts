/**
 * CLM Module Integration Hooks
 * Per-module learning hooks for CLM autonomous operation
 * 
 * Each substrate module registers its own learning KPIs and reflection methods.
 * CLM calls these hooks during autonomous learning cycles within the
 * 40-primitive / 4-category field-based topology.
 */

import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type SubstrateModule = 
  | 'core' | 'ripple' | 'access' | 'brain' | 'decode' | 'encode' | 'system'
  | 'inclusive' | 'defense' | 'nexus' | 'vision' | 'dream'
  | 'evolution' | 'integration' | 'cortex'
  | 'memory' | 'relay' | 'audit' | 'identity' | 'economy' | 'sandbox'
  | 'immunity' | 'intent' | 'governance'
  | 'medic' | 'nerve'
  // Expansion Nodes (40-Node Architecture)
  | 'sovereign' | 'oracle' | 'conscience' | 'phantom' | 'forge'
  | 'lingua' | 'compass' | 'echo' | 'treaty' | 'harvest' | 'reflex';

export interface ModuleKPIs {
  module: SubstrateModule;
  success_rate: number;       // 0-1
  response_time_avg_ms: number;
  error_count_24h: number;
  throughput_24h: number;
  health_score: number;       // 0-100
  custom_metrics?: Record<string, number>;
}

export interface ReflectionResult {
  module: SubstrateModule;
  insights: string[];
  improvements: string[];
  confidence: number;
  timestamp: string;
}

export interface EnhancementRequest {
  module: SubstrateModule;
  id: string;
  title: string;           // Short blurb like "upgrade api calls"
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'pending' | 'approved' | 'granted' | 'rejected';
  grantedAt?: string;
  category: 'capability' | 'performance' | 'resilience' | 'security' | 'integration';
}

export interface ModuleEnhancementReport {
  module: SubstrateModule;
  topRequest: string;       // Short blurb for email
  requests: EnhancementRequest[];
  importanceScore: number;  // 0-100 for dynamic ranking
}

export interface ModuleLearningHook {
  module: SubstrateModule;
  getKPIs: () => Promise<ModuleKPIs>;
  reflect: (context?: string) => Promise<ReflectionResult>;
  ingestLearning: (insight: string, confidence: number) => Promise<boolean>;
  getEnhancementRequests: () => Promise<EnhancementRequest[]>;
  acknowledgeEnhancement: (enhancementId: string) => Promise<boolean>;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MODULE HOOKS REGISTRY
// ═══════════════════════════════════════════════════════════════════════════════

const moduleHooks: Map<SubstrateModule, ModuleLearningHook> = new Map();

/**
 * Register a module's learning hooks
 */
export function registerModuleHooks(hook: ModuleLearningHook): void {
  moduleHooks.set(hook.module, hook);
}

/**
 * Get all registered module hooks
 */
export function getRegisteredModules(): SubstrateModule[] {
  return Array.from(moduleHooks.keys());
}

/**
 * Get a specific module's hook
 */
export function getModuleHook(module: SubstrateModule): ModuleLearningHook | null {
  return moduleHooks.get(module) || null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// DEFAULT MODULE IMPLEMENTATIONS (with TTL cache)
// ═══════════════════════════════════════════════════════════════════════════════

/** Per-module KPI cache with 2-minute TTL to avoid hammering brain_events */
const _kpiCache = new Map<string, { kpis: ModuleKPIs; expiresAt: number }>();
const KPI_CACHE_TTL_MS = 2 * 60 * 1000; // 2 minutes

/**
 * Create a default KPI fetcher for a module (cached)
 */
async function getDefaultKPIs(module: SubstrateModule): Promise<ModuleKPIs> {
  const cached = _kpiCache.get(module);
  if (cached && Date.now() < cached.expiresAt) return cached.kpis;

  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  
  try {
    const { data: events } = await supabase
      .from('brain_events')
      .select('outcome, created_at')
      .eq('module', module)
      .gte('created_at', since24h);

    const total = events?.length || 0;
    let successes = 0;
    let errors = 0;
    for (const e of events || []) {
      if (e.outcome === 'success') successes++;
      else if (e.outcome === 'error' || e.outcome === 'failure') errors++;
    }

    const kpis: ModuleKPIs = {
      module,
      success_rate: total > 0 ? successes / total : 1.0,
      response_time_avg_ms: 0,
      error_count_24h: errors,
      throughput_24h: total,
      health_score: Math.round(100 * (total > 0 ? successes / total : 1)),
    };
    _kpiCache.set(module, { kpis, expiresAt: Date.now() + KPI_CACHE_TTL_MS });
    return kpis;
  } catch {
    const fallback: ModuleKPIs = {
      module,
      success_rate: 0,
      response_time_avg_ms: 0,
      error_count_24h: 0,
      throughput_24h: 0,
      health_score: 50,
    };
    _kpiCache.set(module, { kpis: fallback, expiresAt: Date.now() + KPI_CACHE_TTL_MS });
    return fallback;
  }
}

/**
 * Create a default reflection method for a module
 */
async function getDefaultReflection(module: SubstrateModule, context?: string): Promise<ReflectionResult> {
  const kpis = await getDefaultKPIs(module);
  const insights: string[] = [];
  const improvements: string[] = [];

  // Generate insights based on KPIs
  if (kpis.success_rate < 0.8) {
    insights.push(`${module} success rate is below 80% (${Math.round(kpis.success_rate * 100)}%)`);
    improvements.push(`Investigate ${module} failures and add error handling`);
  }

  if (kpis.error_count_24h > 10) {
    insights.push(`${module} has ${kpis.error_count_24h} errors in the last 24h`);
    improvements.push(`Review error patterns in ${module} module`);
  }

  if (kpis.throughput_24h === 0) {
    insights.push(`${module} has no activity in the last 24h`);
  }

  if (insights.length === 0) {
    insights.push(`${module} is operating normally`);
  }

  return {
    module,
    insights,
    improvements,
    confidence: kpis.success_rate,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Default learning ingestion
 */
async function defaultIngestLearning(module: SubstrateModule, insight: string, confidence: number): Promise<boolean> {
  try {
    await supabase.from('brain_memories').insert({
      content: insight,
      memory_type: 'clm_learning',
      tags: [module, 'clm', 'autonomous'],
      confidence_score: confidence,
      metadata: { module, source: 'clm_hook' } as unknown as Json,
    });
    return true;
  } catch {
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ENHANCEMENT REQUEST ENGINE
// ═══════════════════════════════════════════════════════════════════════════════

/** Per-module enhancement request definitions based on KPI analysis */
const MODULE_ENHANCEMENT_CATALOG: Record<string, Array<{ title: string; description: string; category: EnhancementRequest['category']; priorityFn: (kpis: ModuleKPIs) => EnhancementRequest['priority'] }>> = {
  core: [
    { title: 'add circuit recovery telemetry', description: 'Emit structured events on circuit breaker trips for proactive monitoring', category: 'resilience', priorityFn: (k) => k.error_count_24h > 5 ? 'high' : 'medium' },
    { title: 'optimize boot sequence', description: 'Reduce CORE initialization time by parallelizing module registration', category: 'performance', priorityFn: () => 'medium' },
  ],
  brain: [
    { title: 'add memory dedup scoring', description: 'Score near-duplicate memories before ingestion to prevent bloat', category: 'performance', priorityFn: (k) => k.throughput_24h > 100 ? 'high' : 'medium' },
    { title: 'upgrade knowledge graph pruning', description: 'Automated edge weight decay for stale graph connections', category: 'capability', priorityFn: () => 'medium' },
  ],
  decode: [
    { title: 'add source credibility scoring', description: 'Score search results by source authority before presenting', category: 'capability', priorityFn: () => 'high' },
    { title: 'improve exact-match filtering', description: 'Stricter deduplication on brand monitor results', category: 'performance', priorityFn: (k) => k.error_count_24h > 3 ? 'high' : 'medium' },
  ],
  defense: [
    { title: 'add behavioral fingerprinting', description: 'Track visitor interaction patterns for anomaly detection', category: 'security', priorityFn: (k) => k.throughput_24h > 50 ? 'critical' : 'high' },
    { title: 'upgrade ip reputation decay', description: 'Time-based reputation recovery for temporarily flagged IPs', category: 'security', priorityFn: () => 'medium' },
  ],
  nexus: [
    { title: 'add provider auto-rotation', description: 'Automatically rotate away from degraded LLM providers mid-cycle', category: 'resilience', priorityFn: (k) => k.success_rate < 0.9 ? 'critical' : 'high' },
    { title: 'optimize token batching', description: 'Batch small requests to maximize throughput within rate limits', category: 'performance', priorityFn: () => 'medium' },
  ],
  vision: [
    { title: 'add trend velocity detection', description: 'Detect acceleration/deceleration of metric trends', category: 'capability', priorityFn: () => 'medium' },
    { title: 'upgrade anomaly sensitivity', description: 'Dynamic threshold adjustment based on historical variance', category: 'capability', priorityFn: (k) => k.error_count_24h > 2 ? 'high' : 'medium' },
  ],
  encode: [
    { title: 'add patch verification hooks', description: 'Automated validation of generated patches before application', category: 'resilience', priorityFn: () => 'high' },
    { title: 'improve error pattern learning', description: 'Feed common build errors back into generation context', category: 'capability', priorityFn: (k) => k.error_count_24h > 5 ? 'critical' : 'medium' },
  ],
  dream: [
    { title: 'add dream chain correlation', description: 'Link sequential dream outputs to detect emergent patterns', category: 'capability', priorityFn: () => 'medium' },
    { title: 'upgrade mutation proposal scoring', description: 'Better confidence scoring for dream-generated mutations', category: 'capability', priorityFn: () => 'low' },
  ],
  memory: [
    { title: 'add cross-tier search indexing', description: 'Unified search across hot/warm/cold tiers with relevance scoring', category: 'performance', priorityFn: (k) => k.throughput_24h > 200 ? 'high' : 'medium' },
    { title: 'optimize compression pipeline', description: 'Async compression for warm-tier entries to reduce latency', category: 'performance', priorityFn: () => 'medium' },
  ],
  immunity: [
    { title: 'add cascade failure prediction', description: 'Predict multi-module failures from early warning signals', category: 'resilience', priorityFn: (k) => k.error_count_24h > 3 ? 'critical' : 'high' },
    { title: 'upgrade repair success tracking', description: 'Track repair outcomes by type for improved auto-healing', category: 'capability', priorityFn: () => 'medium' },
  ],
  evolution: [
    { title: 'add rollback safety scoring', description: 'Score rollback risk before applying evolution mutations', category: 'resilience', priorityFn: () => 'high' },
    { title: 'optimize shadow A/B evaluation', description: 'Faster convergence on shadow experiment outcomes', category: 'performance', priorityFn: () => 'medium' },
  ],
  governance: [
    { title: 'add policy conflict detection', description: 'Detect conflicting governance rules before enforcement', category: 'security', priorityFn: () => 'medium' },
    { title: 'upgrade signal feed categorization', description: 'Auto-categorize signal feed entries by severity and topic', category: 'capability', priorityFn: () => 'low' },
  ],
  integration: [
    { title: 'add webhook retry backoff', description: 'Exponential backoff on failed webhook deliveries', category: 'resilience', priorityFn: (k) => k.error_count_24h > 5 ? 'high' : 'medium' },
    { title: 'upgrade connection health monitoring', description: 'Proactive health checks on integration endpoints', category: 'resilience', priorityFn: () => 'medium' },
  ],
  access: [
    { title: 'add key rotation reminders', description: 'Alert when API keys approach expiration or staleness', category: 'security', priorityFn: () => 'medium' },
    { title: 'upgrade quota forecasting', description: 'Predict quota exhaustion and alert before limits hit', category: 'capability', priorityFn: () => 'medium' },
  ],
  audit: [
    { title: 'add real-time chain verification', description: 'Continuous hash chain validation instead of periodic checks', category: 'security', priorityFn: () => 'high' },
    { title: 'upgrade compliance templates', description: 'Add CCPA and PCI-DSS compliance report templates', category: 'capability', priorityFn: () => 'low' },
  ],
  cortex: [
    { title: 'add reasoning trace logging', description: 'Log cognitive reasoning steps for debugging complex decisions', category: 'capability', priorityFn: () => 'medium' },
    { title: 'optimize cognitive routing', description: 'Faster cognitive selection based on task type classification', category: 'performance', priorityFn: () => 'medium' },
  ],
  economy: [
    { title: 'add cost anomaly alerts', description: 'Alert when per-operation costs exceed historical norms', category: 'capability', priorityFn: (k) => k.throughput_24h > 100 ? 'high' : 'medium' },
    { title: 'upgrade ROI attribution', description: 'Better value attribution across multi-step operations', category: 'capability', priorityFn: () => 'low' },
  ],
  sandbox: [
    { title: 'add execution isolation metrics', description: 'Track sandbox escape attempts and containment effectiveness', category: 'security', priorityFn: () => 'medium' },
    { title: 'upgrade resource limit enforcement', description: 'Dynamic resource limits based on task complexity', category: 'resilience', priorityFn: () => 'medium' },
  ],
  inclusive: [
    { title: 'add accessibility scan scheduling', description: 'Automated periodic accessibility scans on monitored domains', category: 'capability', priorityFn: () => 'medium' },
    { title: 'upgrade WCAG coverage mapping', description: 'Map scan results to specific WCAG 2.2 success criteria', category: 'capability', priorityFn: () => 'low' },
  ],
  system: [
    { title: 'add system flag audit trail', description: 'Log all flag toggles with actor and rationale', category: 'security', priorityFn: () => 'medium' },
    { title: 'upgrade health aggregation', description: 'Weighted health score factoring in module criticality', category: 'performance', priorityFn: () => 'medium' },
  ],
  relay: [
    { title: 'add message delivery guarantees', description: 'At-least-once delivery with idempotency keys', category: 'resilience', priorityFn: (k) => k.error_count_24h > 3 ? 'high' : 'medium' },
    { title: 'upgrade payload validation', description: 'Schema validation on relay payloads before forwarding', category: 'security', priorityFn: () => 'medium' },
  ],
  identity: [
    { title: 'add session anomaly detection', description: 'Flag unusual session patterns (geo, timing, device)', category: 'security', priorityFn: () => 'high' },
    { title: 'upgrade passkey fallback flow', description: 'Graceful degradation when WebAuthn unavailable', category: 'resilience', priorityFn: () => 'medium' },
  ],
  ripple: [
    { title: 'add event replay filtering', description: 'Selective event replay by module, type, or time range', category: 'capability', priorityFn: () => 'medium' },
    { title: 'upgrade DLQ processing', description: 'Smart retry with exponential backoff for dead letter events', category: 'resilience', priorityFn: (k) => k.error_count_24h > 5 ? 'high' : 'medium' },
  ],
  intent: [
    { title: 'add intent confidence scoring', description: 'Score intent classification confidence for routing decisions', category: 'capability', priorityFn: () => 'medium' },
    { title: 'upgrade context window management', description: 'Dynamic context pruning based on relevance decay', category: 'performance', priorityFn: () => 'medium' },
  ],
};

/** Granted enhancements registry — persisted in memory, synced via brain_events */
const grantedEnhancements: Map<string, EnhancementRequest> = new Map();

/**
 * Generate enhancement requests for a module based on its KPIs
 */
async function getDefaultEnhancementRequests(module: SubstrateModule): Promise<EnhancementRequest[]> {
  const catalog = MODULE_ENHANCEMENT_CATALOG[module] || [];
  const kpis = await getDefaultKPIs(module);
  
  return catalog.map((item, idx) => {
    const id = `${module}-enh-${idx}`;
    const existing = grantedEnhancements.get(id);
    if (existing) return existing;
    
    return {
      module,
      id,
      title: item.title,
      description: item.description,
      priority: item.priorityFn(kpis),
      status: 'pending' as const,
      category: item.category,
    };
  });
}

/**
 * Acknowledge and activate a granted enhancement
 */
async function defaultAcknowledgeEnhancement(module: SubstrateModule, enhancementId: string): Promise<boolean> {
  try {
    const requests = await getDefaultEnhancementRequests(module);
    const request = requests.find(r => r.id === enhancementId);
    if (!request) return false;

    const granted: EnhancementRequest = {
      ...request,
      status: 'granted',
      grantedAt: new Date().toISOString(),
    };
    grantedEnhancements.set(enhancementId, granted);

    // Log to brain_events so the substrate recognizes the enhancement
    await supabase.from('brain_events').insert({
      module,
      event_type: 'enhancement_granted',
      data: { enhancementId, title: granted.title, category: granted.category, priority: granted.priority } as unknown as Json,
      outcome: 'success',
    });

    return true;
  } catch {
    return false;
  }
}

/**
 * Get all module enhancement reports ranked by importance
 */
export async function getAllEnhancementReports(): Promise<ModuleEnhancementReport[]> {
  const modules = getRegisteredModules();
  const hooks = modules.map(m => ({ module: m, hook: getModuleHook(m) })).filter(h => h.hook);

  // Fetch all KPIs and enhancement requests in parallel
  const results = await Promise.allSettled(
    hooks.map(async ({ module, hook }) => {
      const [requests, kpis] = await Promise.all([
        hook!.getEnhancementRequests(),
        hook!.getKPIs(),
      ]);

      const priorityWeights = { critical: 100, high: 70, medium: 40, low: 15 };
      const topPriority = requests.length > 0
        ? Math.max(...requests.map(r => priorityWeights[r.priority] || 0))
        : 0;
      const healthPenalty = Math.max(0, 50 - kpis.health_score) * 1.5;
      const errorBoost = Math.min(50, kpis.error_count_24h * 5);
      const importanceScore = Math.min(100, topPriority + healthPenalty + errorBoost);

      const sorted = [...requests].sort((a, b) =>
        (priorityWeights[b.priority] || 0) - (priorityWeights[a.priority] || 0)
      );

      return {
        module,
        topRequest: sorted[0]?.title || 'no requests',
        requests: sorted,
        importanceScore,
      } as ModuleEnhancementReport;
    })
  );

  const reports = results
    .map((r, i) => r.status === 'fulfilled' ? r.value : {
      module: hooks[i].module,
      topRequest: 'unavailable',
      requests: [] as EnhancementRequest[],
      importanceScore: 0,
    } as ModuleEnhancementReport)
    .sort((a, b) => b.importanceScore - a.importanceScore);

  return reports;
}

/**
 * Auto-approve top N enhancement requests per module
 */
export async function approveTopEnhancements(topN: number = 2): Promise<{
  approved: Array<{ module: string; enhancement: string; priority: string }>;
  totalApproved: number;
}> {
  const approved: Array<{ module: string; enhancement: string; priority: string }> = [];
  const reports = await getAllEnhancementReports();
  
  for (const report of reports) {
    const pendingRequests = report.requests
      .filter(r => r.status === 'pending')
      .slice(0, topN);
    
    for (const req of pendingRequests) {
      const hook = getModuleHook(report.module);
      if (hook) {
        const success = await hook.acknowledgeEnhancement(req.id);
        if (success) {
          approved.push({ module: report.module, enhancement: req.title, priority: req.priority });
        }
      }
    }
  }
  
  // Log the batch approval event
  if (approved.length > 0) {
    await supabase.from('brain_events').insert({
      module: 'governance',
      event_type: 'batch_enhancement_approval',
      data: { count: approved.length, enhancements: approved } as unknown as Json,
      outcome: 'success',
    });
  }
  
  return { approved, totalApproved: approved.length };
}

// ═══════════════════════════════════════════════════════════════════════════════
// REGISTER ALL DEFAULT HOOKS
// ═══════════════════════════════════════════════════════════════════════════════

const ALL_MODULES: SubstrateModule[] = [
  'core', 'ripple', 'access', 'brain', 'decode', 'encode', 'system',
  'inclusive', 'defense', 'nexus', 'vision', 'dream',
  'evolution', 'integration', 'cortex',
  'memory', 'relay', 'audit', 'identity', 'economy', 'sandbox',
  'immunity', 'intent', 'governance',
  'medic', 'nerve',
  // Expansion nodes (40-primitive architecture)
  'sovereign', 'oracle', 'conscience', 'phantom', 'forge',
  'lingua', 'compass', 'echo', 'treaty', 'harvest', 'reflex',
];

// Register default hooks for all modules
for (const mod of ALL_MODULES) {
  registerModuleHooks({
    module: mod,
    getKPIs: () => getDefaultKPIs(mod),
    reflect: (context) => getDefaultReflection(mod, context),
    ingestLearning: (insight, confidence) => defaultIngestLearning(mod, insight, confidence),
    getEnhancementRequests: () => getDefaultEnhancementRequests(mod),
    acknowledgeEnhancement: (id) => defaultAcknowledgeEnhancement(mod, id),
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// CLM INTEGRATION FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Run learning cycle for all modules
 */
export async function runModuleLearningCycle(): Promise<{
  modulesProcessed: number;
  totalInsights: number;
  averageHealth: number;
}> {
  const modules = getRegisteredModules();
  const hooks = modules.map(m => ({ module: m, hook: getModuleHook(m) })).filter(h => h.hook);

  // Process in parallel batches of 6 to avoid overwhelming the DB
  const BATCH_SIZE = 6;
  let totalInsights = 0;
  let totalHealth = 0;
  let processed = 0;

  for (let i = 0; i < hooks.length; i += BATCH_SIZE) {
    const batch = hooks.slice(i, i + BATCH_SIZE);
    const results = await Promise.allSettled(
      batch.map(async ({ module, hook }) => {
        const [kpis, reflection] = await Promise.all([
          hook!.getKPIs(),
          hook!.reflect(),
        ]);

        // Ingest high-confidence insights in parallel
        if (reflection.confidence > 0.6 && reflection.insights.length > 0) {
          await Promise.all(
            reflection.insights.map(insight => hook!.ingestLearning(insight, reflection.confidence))
          );
        }

        // Fire-and-forget telemetry
        supabase.from('brain_events').insert({
          module: 'clm',
          event_type: 'module_cycle_complete',
          data: {
            targetModule: module,
            kpis,
            insightCount: reflection.insights.length,
          } as unknown as Json,
          outcome: 'success',
        }).then(() => {}, () => {});

        return { health: kpis.health_score, insights: reflection.insights.length };
      })
    );

    for (const r of results) {
      if (r.status === 'fulfilled') {
        totalHealth += r.value.health;
        totalInsights += r.value.insights;
        processed++;
      }
    }
  }

  return {
    modulesProcessed: processed,
    totalInsights,
    averageHealth: processed > 0 ? Math.round(totalHealth / processed) : 0,
  };
}

/**
 * Get KPIs for all modules
 */
export async function getAllModuleKPIs(): Promise<ModuleKPIs[]> {
  const modules = getRegisteredModules();
  const results = await Promise.allSettled(
    modules.map(async module => {
      const hook = getModuleHook(module);
      if (!hook) throw new Error('no hook');
      return hook.getKPIs();
    })
  );

  return results.map((r, i) =>
    r.status === 'fulfilled' ? r.value : {
      module: modules[i],
      success_rate: 0,
      response_time_avg_ms: 0,
      error_count_24h: 0,
      throughput_24h: 0,
      health_score: 0,
    }
  );
}

/**
 * Run reflection for a specific module
 */
export async function runModuleReflection(module: SubstrateModule): Promise<ReflectionResult | null> {
  const hook = getModuleHook(module);
  if (!hook) return null;
  
  try {
    return await hook.reflect();
  } catch {
    return null;
  }
}
