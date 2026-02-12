/**
 * CLM Module Integration Hooks
 * v8.0.0 SYNERGY+ — Per-module learning hooks for CLM autonomous operation
 * 
 * Each substrate module registers its own learning KPIs and reflection methods.
 * CLM calls these hooks during autonomous learning cycles within the 14-module architecture.
 */

import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type SubstrateModule = 
  | 'core' | 'ripple' | 'access' | 'brain' | 'decode' | 'encode' | 'system'
  | 'inclusive' | 'defense' | 'nexus' | 'vision' | 'dream'
  | 'modernizer' | 'integration' | 'cortex'
  | 'memory' | 'relay' | 'audit' | 'identity' | 'economy' | 'sandbox';

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

export interface ModuleLearningHook {
  module: SubstrateModule;
  getKPIs: () => Promise<ModuleKPIs>;
  reflect: (context?: string) => Promise<ReflectionResult>;
  ingestLearning: (insight: string, confidence: number) => Promise<boolean>;
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
// DEFAULT MODULE IMPLEMENTATIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Create a default KPI fetcher for a module
 */
async function getDefaultKPIs(module: SubstrateModule): Promise<ModuleKPIs> {
  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  
  try {
    const { data: events } = await supabase
      .from('brain_events')
      .select('outcome, created_at')
      .eq('module', module)
      .gte('created_at', since24h);

    const total = events?.length || 0;
    const successes = events?.filter(e => e.outcome === 'success').length || 0;
    const errors = events?.filter(e => e.outcome === 'error' || e.outcome === 'failure').length || 0;

    return {
      module,
      success_rate: total > 0 ? successes / total : 1.0,
      response_time_avg_ms: 0, // Would need timing data
      error_count_24h: errors,
      throughput_24h: total,
      health_score: Math.round(100 * (total > 0 ? successes / total : 1)),
    };
  } catch {
    return {
      module,
      success_rate: 0,
      response_time_avg_ms: 0,
      error_count_24h: 0,
      throughput_24h: 0,
      health_score: 50,
    };
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
// REGISTER ALL DEFAULT HOOKS
// ═══════════════════════════════════════════════════════════════════════════════

const ALL_MODULES: SubstrateModule[] = [
  'core', 'ripple', 'access', 'brain', 'decode', 'system',
  'inclusive', 'defense', 'nexus', 'vision', 'dream',
  'modernizer', 'integration', 'cortex'
];

// Register default hooks for all modules
for (const mod of ALL_MODULES) {
  registerModuleHooks({
    module: mod,
    getKPIs: () => getDefaultKPIs(mod),
    reflect: (context) => getDefaultReflection(mod, context),
    ingestLearning: (insight, confidence) => defaultIngestLearning(mod, insight, confidence),
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
  let totalInsights = 0;
  let totalHealth = 0;
  const modules = getRegisteredModules();

  for (const module of modules) {
    const hook = getModuleHook(module);
    if (!hook) continue;

    try {
      const kpis = await hook.getKPIs();
      totalHealth += kpis.health_score;

      const reflection = await hook.reflect();
      totalInsights += reflection.insights.length;

      // Ingest high-confidence insights
      for (const insight of reflection.insights) {
        if (reflection.confidence > 0.6) {
          await hook.ingestLearning(insight, reflection.confidence);
        }
      }

      // Log cycle completion
      await supabase.from('brain_events').insert({
        module: 'clm',
        event_type: 'module_cycle_complete',
        data: {
          targetModule: module,
          kpis,
          insightCount: reflection.insights.length,
        } as unknown as Json,
        outcome: 'success',
      });
    } catch {
      // Continue with other modules
    }
  }

  return {
    modulesProcessed: modules.length,
    totalInsights,
    averageHealth: modules.length > 0 ? Math.round(totalHealth / modules.length) : 0,
  };
}

/**
 * Get KPIs for all modules
 */
export async function getAllModuleKPIs(): Promise<ModuleKPIs[]> {
  const results: ModuleKPIs[] = [];
  
  for (const module of getRegisteredModules()) {
    const hook = getModuleHook(module);
    if (hook) {
      try {
        const kpis = await hook.getKPIs();
        results.push(kpis);
      } catch {
        results.push({
          module,
          success_rate: 0,
          response_time_avg_ms: 0,
          error_count_24h: 0,
          throughput_24h: 0,
          health_score: 0,
        });
      }
    }
  }

  return results;
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
