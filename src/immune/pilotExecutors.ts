/**
 * Executor Immune Pilot — Pilot Executor List & Registration (v4.0)
 * 
 * Phase 1 Shadow Scale: Expanded from 20 to 35 executors across 6 substrate categories:
 * 
 * INCLUSIVE (7):
 *   1. adaptive-ui
 *   2. cognitive-load-optimization
 *   3. comprehensive-accessibility-audit
 *   4. personalized-accessibility-engine
 *   5. inclusive-content
 *   6. contrast-ratio-analyzer
 *   7. focus-management-engine
 * 
 * COGNITIVE (5):
 *   8. reasoning-engine
 *   9. learning-engine
 *  10. imagination-engine
 *  11. semantic-analysis-engine
 *  12. context-window-manager
 * 
 * OPERATIONAL (5):
 *  13. relay-event-dispatcher
 *  14. economy-cost-tracker
 *  15. audit-compliance-check
 *  16. rate-limiter-engine
 *  17. telemetry-aggregator
 * 
 * ORCHESTRATOR (4):
 *  18. mesh-pipeline-resolver
 *  19. seba-proposal-evaluator
 *  20. workflow-orchestrator
 *  21. dependency-resolver
 * 
 * INFRASTRUCTURE (7):
 *  22. memory-consolidation-engine
 *  23. identity-verification-engine
 *  24. sandbox-isolation-guard
 *  25. encode-task-scheduler
 *  26. cache-invalidation-engine
 *  27. config-propagation-engine
 *  28. health-check-coordinator
 * 
 * INTELLIGENCE (7):
 *  29. dream-pattern-synthesizer
 *  30. decode-intent-classifier
 *  31. vision-anomaly-detector
 *  32. sentiment-drift-analyzer
 *  33. temporal-pattern-engine
 *  34. correlation-discovery-engine
 *  35. signal-noise-separator
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
 * The 35 pilot executor IDs across 6 substrate categories (Phase 1 Shadow Scale)
 */
export const PILOT_EXECUTORS = [
  // INCLUSIVE (7)
  'adaptive-ui',
  'cognitive-load-optimization',
  'comprehensive-accessibility-audit',
  'personalized-accessibility-engine',
  'inclusive-content',
  'contrast-ratio-analyzer',
  'focus-management-engine',
  // COGNITIVE (5)
  'reasoning-engine',
  'learning-engine',
  'imagination-engine',
  'semantic-analysis-engine',
  'context-window-manager',
  // OPERATIONAL (5)
  'relay-event-dispatcher',
  'economy-cost-tracker',
  'audit-compliance-check',
  'rate-limiter-engine',
  'telemetry-aggregator',
  // ORCHESTRATOR (4)
  'mesh-pipeline-resolver',
  'seba-proposal-evaluator',
  'workflow-orchestrator',
  'dependency-resolver',
  // INFRASTRUCTURE (7)
  'memory-consolidation-engine',
  'identity-verification-engine',
  'sandbox-isolation-guard',
  'encode-task-scheduler',
  'cache-invalidation-engine',
  'config-propagation-engine',
  'health-check-coordinator',
  // INTELLIGENCE (7)
  'dream-pattern-synthesizer',
  'decode-intent-classifier',
  'vision-anomaly-detector',
  'sentiment-drift-analyzer',
  'temporal-pattern-engine',
  'correlation-discovery-engine',
  'signal-noise-separator',
] as const;

export type PilotExecutorId = typeof PILOT_EXECUTORS[number];

/**
 * Module metadata registry — maps executor → module + scope + category
 */
export const EXECUTOR_MODULE_META: Record<PilotExecutorId, ExecutorModuleMeta> = {
  // INCLUSIVE
  'adaptive-ui':                       { module: 'INCLUSIVE',       scope: 'adaptive-ui',                    category: 'ui_adaptation' },
  'cognitive-load-optimization':       { module: 'INCLUSIVE',       scope: 'cognitive-load-optimization',    category: 'content_analysis' },
  'comprehensive-accessibility-audit': { module: 'INCLUSIVE',       scope: 'comprehensive-accessibility-audit', category: 'content_validation' },
  'personalized-accessibility-engine': { module: 'INCLUSIVE',       scope: 'personalized-accessibility-engine', category: 'ui_adaptation' },
  'inclusive-content':                 { module: 'INCLUSIVE',       scope: 'inclusive-content',              category: 'content_validation' },
  'contrast-ratio-analyzer':           { module: 'INCLUSIVE',       scope: 'contrast-ratio-analyzer',        category: 'content_analysis' },
  'focus-management-engine':           { module: 'INCLUSIVE',       scope: 'focus-management-engine',        category: 'ui_adaptation' },
  // COGNITIVE
  'reasoning-engine':                  { module: 'COGNITIVE',      scope: 'reasoning-engine',               category: 'cognitive_processing' },
  'learning-engine':                   { module: 'COGNITIVE',      scope: 'learning-engine',                category: 'cognitive_processing' },
  'imagination-engine':                { module: 'COGNITIVE',      scope: 'imagination-engine',             category: 'cognitive_processing' },
  'semantic-analysis-engine':          { module: 'COGNITIVE',      scope: 'semantic-analysis-engine',       category: 'cognitive_processing' },
  'context-window-manager':            { module: 'COGNITIVE',      scope: 'context-window-manager',         category: 'cognitive_processing' },
  // OPERATIONAL
  'relay-event-dispatcher':            { module: 'OPERATIONAL',    scope: 'relay-event-dispatcher',         category: 'event_routing' },
  'economy-cost-tracker':              { module: 'OPERATIONAL',    scope: 'economy-cost-tracker',           category: 'governance' },
  'audit-compliance-check':            { module: 'OPERATIONAL',    scope: 'audit-compliance-check',         category: 'content_validation' },
  'rate-limiter-engine':               { module: 'OPERATIONAL',    scope: 'rate-limiter-engine',            category: 'governance' },
  'telemetry-aggregator':              { module: 'OPERATIONAL',    scope: 'telemetry-aggregator',           category: 'event_routing' },
  // ORCHESTRATOR
  'mesh-pipeline-resolver':            { module: 'ORCHESTRATOR',   scope: 'mesh-pipeline-resolver',         category: 'orchestration' },
  'seba-proposal-evaluator':           { module: 'ORCHESTRATOR',   scope: 'seba-proposal-evaluator',        category: 'governance' },
  'workflow-orchestrator':             { module: 'ORCHESTRATOR',   scope: 'workflow-orchestrator',          category: 'orchestration' },
  'dependency-resolver':               { module: 'ORCHESTRATOR',   scope: 'dependency-resolver',            category: 'orchestration' },
  // INFRASTRUCTURE
  'memory-consolidation-engine':       { module: 'INFRASTRUCTURE', scope: 'memory-consolidation-engine',    category: 'infrastructure' },
  'identity-verification-engine':      { module: 'INFRASTRUCTURE', scope: 'identity-verification-engine',   category: 'infrastructure' },
  'sandbox-isolation-guard':           { module: 'INFRASTRUCTURE', scope: 'sandbox-isolation-guard',        category: 'infrastructure' },
  'encode-task-scheduler':             { module: 'INFRASTRUCTURE', scope: 'encode-task-scheduler',          category: 'infrastructure' },
  'cache-invalidation-engine':         { module: 'INFRASTRUCTURE', scope: 'cache-invalidation-engine',      category: 'infrastructure' },
  'config-propagation-engine':         { module: 'INFRASTRUCTURE', scope: 'config-propagation-engine',      category: 'infrastructure' },
  'health-check-coordinator':          { module: 'INFRASTRUCTURE', scope: 'health-check-coordinator',       category: 'infrastructure' },
  // INTELLIGENCE
  'dream-pattern-synthesizer':         { module: 'INTELLIGENCE',   scope: 'dream-pattern-synthesizer',      category: 'intelligence' },
  'decode-intent-classifier':          { module: 'INTELLIGENCE',   scope: 'decode-intent-classifier',       category: 'intelligence' },
  'vision-anomaly-detector':           { module: 'INTELLIGENCE',   scope: 'vision-anomaly-detector',        category: 'intelligence' },
  'sentiment-drift-analyzer':          { module: 'INTELLIGENCE',   scope: 'sentiment-drift-analyzer',       category: 'intelligence' },
  'temporal-pattern-engine':           { module: 'INTELLIGENCE',   scope: 'temporal-pattern-engine',        category: 'intelligence' },
  'correlation-discovery-engine':      { module: 'INTELLIGENCE',   scope: 'correlation-discovery-engine',   category: 'intelligence' },
  'signal-noise-separator':            { module: 'INTELLIGENCE',   scope: 'signal-noise-separator',         category: 'intelligence' },
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
