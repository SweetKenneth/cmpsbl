/**
 * Executor Immune Pilot — Pilot Executor List & Registration (v3.0)
 * 
 * Expanded from 13 to 20 executors across 6 substrate categories:
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
 * 
 * INFRASTRUCTURE (4):
 *  14. memory-consolidation-engine
 *  15. identity-verification-engine
 *  16. sandbox-isolation-guard
 *  17. encode-task-scheduler
 * 
 * INTELLIGENCE (3):
 *  18. dream-pattern-synthesizer
 *  19. decode-intent-classifier
 *  20. vision-anomaly-detector
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
  category: 'ui_adaptation' | 'content_analysis' | 'content_validation' | 'cognitive_processing' | 'event_routing' | 'governance' | 'orchestration' | 'infrastructure' | 'intelligence';
}

/**
 * The 20 pilot executor IDs across 6 substrate categories
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
  // INFRASTRUCTURE
  'memory-consolidation-engine',
  'identity-verification-engine',
  'sandbox-isolation-guard',
  'encode-task-scheduler',
  // INTELLIGENCE
  'dream-pattern-synthesizer',
  'decode-intent-classifier',
  'vision-anomaly-detector',
] as const;

export type PilotExecutorId = typeof PILOT_EXECUTORS[number];

/**
 * Module metadata registry — maps executor → module + scope + category
 */
export const EXECUTOR_MODULE_META: Record<PilotExecutorId, ExecutorModuleMeta> = {
  'adaptive-ui':                       { module: 'INCLUSIVE',       scope: 'adaptive-ui',                    category: 'ui_adaptation' },
  'cognitive-load-optimization':       { module: 'INCLUSIVE',       scope: 'cognitive-load-optimization',    category: 'content_analysis' },
  'comprehensive-accessibility-audit': { module: 'INCLUSIVE',       scope: 'comprehensive-accessibility-audit', category: 'content_validation' },
  'personalized-accessibility-engine': { module: 'INCLUSIVE',       scope: 'personalized-accessibility-engine', category: 'ui_adaptation' },
  'inclusive-content':                 { module: 'INCLUSIVE',       scope: 'inclusive-content',              category: 'content_validation' },
  'reasoning-engine':                  { module: 'COGNITIVE',      scope: 'reasoning-engine',               category: 'cognitive_processing' },
  'learning-engine':                   { module: 'COGNITIVE',      scope: 'learning-engine',                category: 'cognitive_processing' },
  'imagination-engine':                { module: 'COGNITIVE',      scope: 'imagination-engine',             category: 'cognitive_processing' },
  'relay-event-dispatcher':            { module: 'OPERATIONAL',    scope: 'relay-event-dispatcher',         category: 'event_routing' },
  'economy-cost-tracker':              { module: 'OPERATIONAL',    scope: 'economy-cost-tracker',           category: 'governance' },
  'audit-compliance-check':            { module: 'OPERATIONAL',    scope: 'audit-compliance-check',         category: 'content_validation' },
  'mesh-pipeline-resolver':            { module: 'ORCHESTRATOR',   scope: 'mesh-pipeline-resolver',         category: 'orchestration' },
  'seba-proposal-evaluator':           { module: 'ORCHESTRATOR',   scope: 'seba-proposal-evaluator',        category: 'governance' },
  // INFRASTRUCTURE
  'memory-consolidation-engine':       { module: 'INFRASTRUCTURE', scope: 'memory-consolidation-engine',    category: 'infrastructure' },
  'identity-verification-engine':      { module: 'INFRASTRUCTURE', scope: 'identity-verification-engine',   category: 'infrastructure' },
  'sandbox-isolation-guard':           { module: 'INFRASTRUCTURE', scope: 'sandbox-isolation-guard',        category: 'infrastructure' },
  'encode-task-scheduler':             { module: 'INFRASTRUCTURE', scope: 'encode-task-scheduler',          category: 'infrastructure' },
  // INTELLIGENCE
  'dream-pattern-synthesizer':         { module: 'INTELLIGENCE',   scope: 'dream-pattern-synthesizer',      category: 'intelligence' },
  'decode-intent-classifier':          { module: 'INTELLIGENCE',   scope: 'decode-intent-classifier',       category: 'intelligence' },
  'vision-anomaly-detector':           { module: 'INTELLIGENCE',   scope: 'vision-anomaly-detector',        category: 'intelligence' },
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
