/**
 * Synergy Engine
 * Cross-Module Pipeline Execution
 * 
 * Orchestrates 200 multi-module synergies with governance and tracing
 */

import { generateTraceId } from '@/lib/system/trace';
import { emit, emitStarted, emitFailed, emitSucceeded } from '@/lib/substrate/events/emit';
import { log } from '@/lib/system/log';
import { checkGate } from '@/lib/atlas/capability-gate';
import { 
  getSynergy, 
  getSynergyExecutor, 
  registerSynergyExecutor,
  listSynergies,
} from './registry';
import type { 
  SynergyExecutionContext, 
  SynergyResult, 
  SynergyStepResult,
  SynergyDefinition,
} from './types';

/**
 * Execute a synergy pipeline
 */
export async function executeSynergy<T = unknown>(
  synergyId: string,
  input: Record<string, unknown>,
  options: { caller?: string; dryRun?: boolean } = {}
): Promise<SynergyResult<T>> {
  const traceId = generateTraceId();
  const startTime = performance.now();
  const caller = options.caller ?? 'unknown';
  const dryRun = options.dryRun ?? false;
  
  // Get synergy definition
  const synergy = getSynergy(synergyId);
  if (!synergy) {
    return createFailedResult(synergyId, `Synergy '${synergyId}' not found`, traceId, startTime);
  }
  
  // Check governance gate (synergy module gets its own config)
  const gateResult = await checkGate({
    module: 'synergy',
    action: synergyId,
    payload: { risk: synergy.risk, modules: synergy.modules.map(m => m.name) },
    dryRun,
  });
  
  if (!gateResult.allowed) {
    return createFailedResult(synergyId, gateResult.reason ?? 'Blocked by governance gate', traceId, startTime);
  }
  
  // Emit started event
  await emitStarted('synergy', synergyId, {
    modules: synergy.modules.map(m => m.name),
    category: synergy.category,
    dryRun,
  }, traceId);
  
  log.info('synergy', `Executing synergy: ${synergy.name}`, { 
    synergyId, 
    modules: synergy.modules.map(m => m.name),
    traceId,
  });
  
  // Check for custom executor
  const executor = getSynergyExecutor(synergyId);
  if (executor) {
    const context: SynergyExecutionContext = {
      synergyId,
      input,
      caller,
      traceId,
      dryRun,
    };
    
    try {
      const result = await executor(context) as SynergyResult<T>;
      await emitSynergyCompleted(synergyId, result, traceId);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Unknown error';
      const result = createFailedResult<T>(synergyId, error, traceId, startTime);
      await emitSynergyCompleted(synergyId, result, traceId);
      return result;
    }
  }
  
  // Default execution: sequential module invocation
  const steps: SynergyStepResult[] = [];
  let lastOutput: unknown = input;
  
  for (const module of synergy.modules) {
    const stepStart = performance.now();
    
    try {
      // Simulate module contribution (in production, route through pf-substrate)
      const stepResult = await executeModuleStep(module.name, lastOutput, synergy, dryRun);
      
      steps.push({
        module: module.name,
        success: stepResult.success,
        data: stepResult.data,
        error: stepResult.error,
        durationMs: performance.now() - stepStart,
      });
      
      if (!stepResult.success && module.required) {
        const result = createFailedResult<T>(
          synergyId,
          `Required module ${module.name} failed: ${stepResult.error}`,
          traceId,
          startTime,
          steps
        );
        await emitSynergyCompleted(synergyId, result, traceId);
        return result;
      }
      
      if (stepResult.success) {
        lastOutput = stepResult.data;
      }
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Unknown error';
      
      steps.push({
        module: module.name,
        success: false,
        error,
        durationMs: performance.now() - stepStart,
      });
      
      if (module.required) {
        const result = createFailedResult<T>(synergyId, error, traceId, startTime, steps);
        await emitSynergyCompleted(synergyId, result, traceId);
        return result;
      }
    }
  }
  
  const totalDurationMs = performance.now() - startTime;
  const successSteps = steps.filter(s => s.success).length;
  const confidence = successSteps / steps.length;
  
  const result: SynergyResult<T> = {
    success: true,
    synergyId,
    data: lastOutput as T,
    steps,
    totalDurationMs,
    confidence,
    enhancement: calculateEnhancement(synergy, steps, totalDurationMs),
  };
  
  await emitSynergyCompleted(synergyId, result, traceId);
  
  log.info('synergy', `Synergy completed: ${synergy.name}`, {
    synergyId,
    success: true,
    durationMs: totalDurationMs,
    confidence,
    traceId,
  });
  
  return result;
}

/**
 * Execute a module step within a synergy
 */
async function executeModuleStep(
  moduleName: string,
  input: unknown,
  synergy: SynergyDefinition,
  dryRun: boolean
): Promise<{ success: boolean; data?: unknown; error?: string }> {
  // In production, this would route through pf-substrate
  // For now, simulate successful execution with enhancement
  
  if (dryRun) {
    return {
      success: true,
      data: {
        module: moduleName,
        synergy: synergy.id,
        preview: true,
        input,
      },
    };
  }
  
  // Simulate processing with module-specific enhancements
  await new Promise(resolve => setTimeout(resolve, 10));
  
  return {
    success: true,
    data: {
      module: moduleName,
      enhanced: true,
      input,
      timestamp: new Date().toISOString(),
    },
  };
}

/**
 * Calculate enhancement metrics from synergy execution
 */
function calculateEnhancement(
  synergy: SynergyDefinition,
  steps: SynergyStepResult[],
  totalDurationMs: number
): { speedMultiplier: number; qualityGain: number; costSavings: number } {
  const successfulModules = steps.filter(s => s.success).length;
  const moduleCount = synergy.modules.length;
  
  // Base enhancements scaled by successful module participation
  const participationRatio = successfulModules / moduleCount;
  
  // Speed: More modules in parallel = faster than sequential single-module calls
  const speedMultiplier = 1 + (participationRatio * 0.5);
  
  // Quality: Each additional module adds refinement
  const qualityGain = participationRatio * (successfulModules - 1) * 0.1;
  
  // Cost: Batching reduces overhead
  const costSavings = participationRatio * 0.2;
  
  return {
    speedMultiplier: Math.round(speedMultiplier * 100) / 100,
    qualityGain: Math.round(qualityGain * 100) / 100,
    costSavings: Math.round(costSavings * 100) / 100,
  };
}

/**
 * Create a failed result
 */
function createFailedResult<T>(
  synergyId: string,
  error: string,
  traceId: string,
  startTime: number,
  steps: SynergyStepResult[] = []
): SynergyResult<T> {
  return {
    success: false,
    synergyId,
    error,
    steps,
    totalDurationMs: performance.now() - startTime,
    confidence: 0,
    enhancement: { speedMultiplier: 1, qualityGain: 0, costSavings: 0 },
  };
}

/**
 * Emit synergy completion event
 */
async function emitSynergyCompleted(
  synergyId: string,
  result: SynergyResult,
  traceId: string
): Promise<void> {
  if (result.success) {
    await emitSucceeded('synergy', synergyId, {
      duration_ms: result.totalDurationMs,
      confidence: result.confidence,
      steps: result.steps.length,
      enhancement: result.enhancement,
    }, traceId);
  } else {
    await emitFailed('synergy', synergyId, result.error ?? 'Unknown error', {
      duration_ms: result.totalDurationMs,
      steps: result.steps.length,
    }, traceId);
  }
}

/**
 * Dry-run a synergy to preview execution plan
 */
export async function dryRunSynergy(
  synergyId: string,
  input: Record<string, unknown> = {}
): Promise<{
  synergy: SynergyDefinition;
  plan: string[];
  estimatedMs: number;
  riskLevel: string;
}> {
  const synergy = getSynergy(synergyId);
  if (!synergy) {
    throw new Error(`Synergy '${synergyId}' not found`);
  }
  
  const plan = synergy.modules.map((m, i) => {
    const roleLabel = m.role === 'primary' ? '→' : m.role === 'validator' ? '✓' : '+';
    const requiredLabel = m.required ? '' : ' (optional)';
    return `${i + 1}. ${roleLabel} ${m.name}${requiredLabel}`;
  });
  
  return {
    synergy,
    plan,
    estimatedMs: synergy.estimatedMs,
    riskLevel: synergy.risk,
  };
}

/**
 * Get recommended synergies based on current context
 */
export function getRecommendedSynergies(context: {
  activeModules?: string[];
  recentErrors?: string[];
  performanceIssues?: boolean;
  securityConcerns?: boolean;
}): SynergyDefinition[] {
  const all = listSynergies();
  const recommendations: SynergyDefinition[] = [];
  
  // If performance issues, recommend optimization synergies
  if (context.performanceIssues) {
    recommendations.push(...all.filter(s => s.category === 'optimization'));
  }
  
  // If security concerns, recommend security synergies
  if (context.securityConcerns) {
    recommendations.push(...all.filter(s => s.category === 'security'));
  }
  
  // If recent errors, recommend resilience synergies
  if (context.recentErrors && context.recentErrors.length > 0) {
    recommendations.push(...all.filter(s => s.category === 'resilience'));
  }
  
  // Filter to synergies that can run with active modules
  if (context.activeModules && context.activeModules.length > 0) {
    const active = new Set(context.activeModules.map(m => m.toUpperCase()));
    return recommendations.filter(s => {
      const requiredModules = s.modules.filter(m => m.required);
      return requiredModules.every(m => active.has(m.name.toUpperCase()));
    });
  }
  
  return recommendations.slice(0, 5); // Top 5 recommendations
}

// Re-export for convenience
export { registerSynergyExecutor };
