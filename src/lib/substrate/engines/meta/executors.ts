/**
 * Meta-Engine Executors
 * v7.8.0 — Compound Engine Orchestration
 * 
 * Executors manage the orchestration of multiple engines
 * into unified execution pipelines with compound synergy.
 */

import type {
  MetaEngineId,
  MetaEngineExecutionContext,
  MetaEngineExecutionResult,
  MetaEngineStageResult,
  MetaEngineExecutor,
} from './types';
import { META_ENGINE_REGISTRY } from './registry';
import { runEngine } from '../executors';
import type { EngineId } from '../types';

// ============================================================================
// EXECUTION UTILITIES
// ============================================================================

function generateTraceId(): string {
  return `meta-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

// ============================================================================
// GENERIC META-ENGINE EXECUTOR
// ============================================================================

async function executeMetaEngine<T = unknown>(
  context: MetaEngineExecutionContext
): Promise<MetaEngineExecutionResult<T>> {
  const startTime = performance.now();
  const metaEngine = META_ENGINE_REGISTRY[context.metaEngineId];
  
  if (!metaEngine) {
    return {
      metaEngineId: context.metaEngineId,
      success: false,
      error: `Meta-engine not found: ${context.metaEngineId}`,
      totalDurationMs: 0,
      enginesExecuted: 0,
      capabilitiesOrchestrated: 0,
      stageResults: [],
      compoundSynergyGain: 0,
      confidenceScore: 0,
      traceId: context.traceId,
      timestamp: new Date().toISOString(),
    };
  }
  
  const skipEngines = context.options?.skipEngines || [];
  const enginesToExecute = metaEngine.engines.filter(e => !skipEngines.includes(e));
  const stageResults: MetaEngineStageResult[] = [];
  
  // Execute engines based on orchestration mode
  if (metaEngine.orchestrationMode === 'parallel') {
    // Execute all engines in parallel
    const promises = enginesToExecute.map((engineId, index) =>
      runEngine(engineId, context.input, { caller: context.caller }).then(result => ({
        engineId,
        result,
        stageIndex: index,
      }))
    );
    stageResults.push(...await Promise.all(promises));
    
  } else if (metaEngine.orchestrationMode === 'cascade') {
    // Execute engines sequentially, passing output to next
    let cascadeInput = { ...context.input };
    for (let i = 0; i < enginesToExecute.length; i++) {
      const engineId = enginesToExecute[i];
      const result = await runEngine(engineId, cascadeInput, { caller: context.caller });
      stageResults.push({ engineId, result, stageIndex: i });
      
      // Pass output to next stage
      if (result.success && result.data) {
        cascadeInput = { ...cascadeInput, previousStage: result.data };
      }
      
      // Stop on failure if configured
      if (!result.success && context.options?.stopOnFailure) {
        break;
      }
    }
    
  } else if (metaEngine.orchestrationMode === 'staged') {
    // Execute in stages: first half parallel, second half sequential
    const midPoint = Math.ceil(enginesToExecute.length / 2);
    const firstStage = enginesToExecute.slice(0, midPoint);
    const secondStage = enginesToExecute.slice(midPoint);
    
    // First stage: parallel
    const firstPromises = firstStage.map((engineId, index) =>
      runEngine(engineId, context.input, { caller: context.caller }).then(result => ({
        engineId,
        result,
        stageIndex: index,
      }))
    );
    stageResults.push(...await Promise.all(firstPromises));
    
    // Second stage: sequential with aggregated context
    const aggregatedData = stageResults
      .filter(r => r.result.success)
      .map(r => r.result.data);
    
    for (let i = 0; i < secondStage.length; i++) {
      const engineId = secondStage[i];
      const result = await runEngine(
        engineId,
        { ...context.input, aggregatedContext: aggregatedData },
        { caller: context.caller }
      );
      stageResults.push({ engineId, result, stageIndex: midPoint + i });
    }
    
  } else {
    // Adaptive: parallel first, retry failures sequentially
    const promises = enginesToExecute.map((engineId, index) =>
      runEngine(engineId, context.input, { caller: context.caller }).then(result => ({
        engineId,
        result,
        stageIndex: index,
      }))
    );
    const initialResults = await Promise.all(promises);
    
    // Retry failures sequentially
    for (const result of initialResults) {
      if (!result.result.success) {
        const retryResult = await runEngine(
          result.engineId,
          { ...context.input, retryAttempt: true },
          { caller: context.caller }
        );
        stageResults.push({ ...result, result: retryResult });
      } else {
        stageResults.push(result);
      }
    }
  }
  
  // Calculate metrics
  const successCount = stageResults.filter(r => r.result.success).length;
  const totalDuration = performance.now() - startTime;
  const totalCapabilities = stageResults.reduce(
    (sum, r) => sum + (r.result.capabilitiesExecuted || 0),
    0
  );
  
  // Calculate compound synergy
  const baseSynergy = stageResults.reduce(
    (sum, r) => sum + (r.result.synergyGain || 1),
    0
  );
  const compoundSynergyGain = baseSynergy * (metaEngine.compoundSynergyMultiplier / stageResults.length);
  
  // Calculate confidence
  const avgConfidence = stageResults.reduce(
    (sum, r) => sum + (r.result.confidenceScore || 0),
    0
  ) / stageResults.length;
  const successRate = successCount / stageResults.length;
  const confidenceScore = avgConfidence * successRate;
  
  return {
    metaEngineId: context.metaEngineId,
    success: successRate >= 0.75,
    data: {
      metaEngineName: metaEngine.name,
      category: metaEngine.category,
      enginesOrchestrated: enginesToExecute,
      orchestrationMode: metaEngine.orchestrationMode,
      stageCount: stageResults.length,
      successRate,
    } as T,
    totalDurationMs: Math.round(totalDuration),
    enginesExecuted: stageResults.length,
    capabilitiesOrchestrated: totalCapabilities,
    stageResults,
    compoundSynergyGain,
    confidenceScore,
    traceId: context.traceId,
    timestamp: new Date().toISOString(),
  };
}

// ============================================================================
// SPECIALIZED META-ENGINE EXECUTORS
// ============================================================================

export const executeCognitiveMesh: MetaEngineExecutor = (ctx) => executeMetaEngine(ctx);
export const executeSystemGuardian: MetaEngineExecutor = (ctx) => executeMetaEngine(ctx);
export const executeAutonomousOperator: MetaEngineExecutor = (ctx) => executeMetaEngine(ctx);
export const executeQualityFabric: MetaEngineExecutor = (ctx) => executeMetaEngine(ctx);
export const executeIntelligencePipeline: MetaEngineExecutor = (ctx) => executeMetaEngine(ctx);
export const executeAdaptationSuite: MetaEngineExecutor = (ctx) => executeMetaEngine(ctx);
export const executeSecurityFortress: MetaEngineExecutor = (ctx) => executeMetaEngine(ctx);
export const executePerformanceOptimizer: MetaEngineExecutor = (ctx) => executeMetaEngine(ctx);

// ============================================================================
// EXECUTOR REGISTRY
// ============================================================================

export const META_ENGINE_EXECUTORS: Record<MetaEngineId, MetaEngineExecutor> = {
  cognitive_mesh: executeCognitiveMesh,
  system_guardian: executeSystemGuardian,
  autonomous_operator: executeAutonomousOperator,
  quality_fabric: executeQualityFabric,
  intelligence_pipeline: executeIntelligencePipeline,
  adaptation_suite: executeAdaptationSuite,
  security_fortress: executeSecurityFortress,
  performance_optimizer: executePerformanceOptimizer,
};

// ============================================================================
// PUBLIC EXECUTION API
// ============================================================================

export async function runMetaEngine<T = unknown>(
  metaEngineId: MetaEngineId,
  input: Record<string, unknown>,
  options?: {
    caller?: string;
    dryRun?: boolean;
    timeout?: number;
    stopOnFailure?: boolean;
  }
): Promise<MetaEngineExecutionResult<T>> {
  const executor = META_ENGINE_EXECUTORS[metaEngineId];
  
  if (!executor) {
    throw new Error(`No executor found for meta-engine: ${metaEngineId}`);
  }
  
  const context: MetaEngineExecutionContext = {
    metaEngineId,
    input,
    caller: options?.caller || 'SYSTEM',
    traceId: generateTraceId(),
    options: {
      dryRun: options?.dryRun,
      timeout: options?.timeout,
      stopOnFailure: options?.stopOnFailure,
    },
  };
  
  return executor(context) as Promise<MetaEngineExecutionResult<T>>;
}

export async function runMetaEnginesBatch(
  metaEngineIds: MetaEngineId[],
  input: Record<string, unknown>,
  options?: {
    caller?: string;
    parallel?: boolean;
  }
): Promise<MetaEngineExecutionResult[]> {
  if (options?.parallel) {
    return Promise.all(
      metaEngineIds.map(id => runMetaEngine(id, input, { caller: options.caller }))
    );
  }
  
  const results: MetaEngineExecutionResult[] = [];
  for (const id of metaEngineIds) {
    results.push(await runMetaEngine(id, input, { caller: options?.caller }));
  }
  return results;
}
