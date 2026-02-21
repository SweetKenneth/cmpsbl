/**
 * Executor Immune Pilot — Pilot Executor List & Registration (v2.0)
 * 
 * Expanded from 5 INCLUSIVE-only executors to 13 across 4 substrate modules:
 * 
 * INCLUSIVE (5):
 *   1. adaptive-ui
 *   2. cognitive-load-optimization
 *   3. comprehensive-accessibility-audit
 *   4. personalized-accessibility-engine
 *   5. inclusive-content
 * 
 * COGNITIVE (3):
 *   6. reasoning-engine
 *   7. learning-engine
 *   8. imagination-engine
 * 
 * OPERATIONAL (3):
 *   9. relay-event-dispatcher
 *  10. economy-cost-tracker
 *  11. audit-compliance-check
 * 
 * ORCHESTRATOR (2):
 *  12. mesh-pipeline-resolver
 *  13. seba-proposal-evaluator
 */

import type { SynergyExecutor } from '@/lib/capabilities/synergies/types';
import { wrapExecutor } from './wrapExecutor';

/**
 * Module metadata for each executor — used for scoping, stub creation, and learning
 */
export interface ExecutorModuleMeta {
  module: string;
  scope: string;
  /** Functional category for cross-executor learning grouping */
  category: 'ui_adaptation' | 'content_analysis' | 'content_validation' | 'cognitive_processing' | 'event_routing' | 'governance' | 'orchestration';
}

/**
 * The 13 pilot executor IDs across 4 substrate modules
 */
export const PILOT_EXECUTORS = [
  // INCLUSIVE
  'adaptive-ui',
  'cognitive-load-optimization',
  'comprehensive-accessibility-audit',
  'personalized-accessibility-engine',
  'inclusive-content',
  // COGNITIVE
  'reasoning-engine',
  'learning-engine',
  'imagination-engine',
  // OPERATIONAL
  'relay-event-dispatcher',
  'economy-cost-tracker',
  'audit-compliance-check',
  // ORCHESTRATOR
  'mesh-pipeline-resolver',
  'seba-proposal-evaluator',
] as const;

export type PilotExecutorId = typeof PILOT_EXECUTORS[number];

/**
 * Module metadata registry — maps executor → module + scope + category
 */
export const EXECUTOR_MODULE_META: Record<PilotExecutorId, ExecutorModuleMeta> = {
  'adaptive-ui':                       { module: 'INCLUSIVE',     scope: 'adaptive-ui',                    category: 'ui_adaptation' },
  'cognitive-load-optimization':       { module: 'INCLUSIVE',     scope: 'cognitive-load-optimization',    category: 'content_analysis' },
  'comprehensive-accessibility-audit': { module: 'INCLUSIVE',     scope: 'comprehensive-accessibility-audit', category: 'content_validation' },
  'personalized-accessibility-engine': { module: 'INCLUSIVE',     scope: 'personalized-accessibility-engine', category: 'ui_adaptation' },
  'inclusive-content':                 { module: 'INCLUSIVE',     scope: 'inclusive-content',              category: 'content_validation' },
  'reasoning-engine':                  { module: 'COGNITIVE',    scope: 'reasoning-engine',               category: 'cognitive_processing' },
  'learning-engine':                   { module: 'COGNITIVE',    scope: 'learning-engine',                category: 'cognitive_processing' },
  'imagination-engine':                { module: 'COGNITIVE',    scope: 'imagination-engine',             category: 'cognitive_processing' },
  'relay-event-dispatcher':            { module: 'OPERATIONAL',  scope: 'relay-event-dispatcher',         category: 'event_routing' },
  'economy-cost-tracker':              { module: 'OPERATIONAL',  scope: 'economy-cost-tracker',           category: 'governance' },
  'audit-compliance-check':            { module: 'OPERATIONAL',  scope: 'audit-compliance-check',         category: 'content_validation' },
  'mesh-pipeline-resolver':            { module: 'ORCHESTRATOR', scope: 'mesh-pipeline-resolver',         category: 'orchestration' },
  'seba-proposal-evaluator':           { module: 'ORCHESTRATOR', scope: 'seba-proposal-evaluator',        category: 'governance' },
};

/** Check if an executor is in the pilot set */
export function isPilotExecutor(id: string): id is PilotExecutorId {
  return (PILOT_EXECUTORS as readonly string[]).includes(id);
}

/** Get module metadata for an executor */
export function getExecutorMeta(id: string): ExecutorModuleMeta | undefined {
  return EXECUTOR_MODULE_META[id as PilotExecutorId];
}

/** Get all executors in a given category (for cross-learning) */
export function getExecutorsByCategory(category: ExecutorModuleMeta['category']): PilotExecutorId[] {
  return (Object.entries(EXECUTOR_MODULE_META) as [PilotExecutorId, ExecutorModuleMeta][])
    .filter(([, meta]) => meta.category === category)
    .map(([id]) => id);
}

/** Wrapped executor cache for probe access */
const wrappedCache = new Map<string, SynergyExecutor>();

/**
 * Intercept registration: if executor is a pilot, wrap it with immune layer.
 * Uses module-specific metadata for proper scoping.
 */
export function createImmuneAwareRegister(
  originalRegisterFn: (id: string, executor: SynergyExecutor) => void,
): (id: string, executor: SynergyExecutor) => void {
  return (id: string, executor: SynergyExecutor) => {
    if (isPilotExecutor(id)) {
      const meta = EXECUTOR_MODULE_META[id];
      const wrapped = wrapExecutor(executor, id, {
        module: meta.module,
        scope: meta.scope,
      });
      wrappedCache.set(id, wrapped);
      originalRegisterFn(id, wrapped);
    } else {
      originalRegisterFn(id, executor);
    }
  };
}

/** Get a wrapped executor by name (for probeMini) */
export function getWrappedExecutor(id: string): SynergyExecutor | undefined {
  return wrappedCache.get(id);
}
