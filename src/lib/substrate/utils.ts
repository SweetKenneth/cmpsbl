/**
 * Substrate Utilities
 * Helper Functions & Common Patterns
 * 
 * Provides utility functions for common substrate operations across the 40-primitive / 4-category architecture.
 */

import { substrate, type SubstrateModule, type SubstrateResponse } from '../substrate';
import { memoryCore } from './memory-core';
import { learningEngine } from './learning-engine';
import { imaginationEngine } from './imagination-engine';
import { reasoningEngine } from './reasoning-engine';
import { governanceGuard } from './governance-guard';
import { orchestratorEngine } from './orchestrator-engine';
import { telemetryEngine } from './telemetry-engine';
import { stateEngine } from './state-engine';
import { engineBus } from './engine-bus';

// ═══════════════════════════════════════════════════════════════════════════════
// QUICK ACTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Quick memory store
 */
export async function remember(content: string, tags?: string[]): Promise<string | undefined> {
  const result = await memoryCore.ingest(content, { tags, source: 'util' });
  return result.memory_id;
}

/**
 * Quick memory recall
 */
export async function recall(query: string, limit: number = 5): Promise<string[]> {
  const result = await memoryCore.retrieve({ query, limit, strategy: 'hybrid' });
  return (result.memories || []).map(m => m.content);
}

/**
 * Quick learn
 */
export async function learn(content: string, topic?: string): Promise<boolean> {
  const result = await learningEngine.input({ content, topic, source: 'util' });
  return result.success;
}

/**
 * Quick dream/synthesize
 */
export async function dream(): Promise<string | null> {
  const result = await imaginationEngine.dream({ force: false });
  return result.output?.content || null;
}

/**
 * Quick reasoning analysis
 */
export async function analyze(context: string): Promise<{ causes: string[]; effects: string[] }> {
  const result = await reasoningEngine.causalMapping({ context });
  const links = result.result?.causal_links || [];
  return {
    causes: links.map(l => l.cause),
    effects: links.map(l => l.effect),
  };
}

/**
 * Quick governance validation
 */
export async function validate(content: string): Promise<boolean> {
  const result = await governanceGuard.runCycle({ content });
  return result.final_decision === 'approve';
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPOSITE OPERATIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Remember and learn in one call
 */
export async function rememberAndLearn(content: string, topic?: string): Promise<boolean> {
  const memResult = await memoryCore.ingest(content, { source: 'util', tags: topic ? [topic] : [] });
  if (!memResult.success) return false;
  
  const learnResult = await learningEngine.input({ content, topic, source: 'util' });
  return learnResult.success;
}

/**
 * Analyze and synthesize
 */
export async function analyzeAndSynthesize(context: string): Promise<{
  analysis: { causes: string[]; effects: string[] };
  synthesis: string | null;
}> {
  const analysis = await analyze(context);
  
  // Store analysis for imagination
  await memoryCore.ingest(context, { type: 'insight', source: 'util' });
  
  const imagResult = await imaginationEngine.runCycle({ type: 'insight' });
  
  return {
    analysis,
    synthesis: imagResult.output?.content || null,
  };
}

/**
 * Full cognitive process
 */
export async function cognize(input: string, options?: { 
  learn?: boolean; 
  imagine?: boolean; 
  reason?: boolean; 
  govern?: boolean;
}): Promise<{
  success: boolean;
  memoryId?: string;
  insights?: string[];
  safe?: boolean;
}> {
  const result = await orchestratorEngine.cognitiveCycle({
    input,
    depth: options?.reason ? 'deep' : 'standard',
    governance: options?.govern ?? true,
    persist: true,
  });

  return {
    success: result.success,
    memoryId: result.phases.memory?.memory_id,
    insights: result.output?.insights,
    safe: result.output?.governanceStatus === 'approved',
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// HEALTH & DIAGNOSTICS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Check overall substrate health
 */
export async function checkHealth(): Promise<{
  healthy: boolean;
  score: number;
  engines: Record<string, number>;
  issues: string[];
}> {
  const issues: string[] = [];
  const engines: Record<string, number> = {};
  
  // Check each engine
  try {
    await memoryCore.getState();
    engines.memory = 100;
  } catch {
    engines.memory = 0;
    issues.push('Memory engine unavailable');
  }

  try {
    learningEngine.getState();
    engines.learning = 100;
  } catch {
    engines.learning = 0;
    issues.push('Learning engine unavailable');
  }

  try {
    imaginationEngine.getState();
    engines.imagination = 100;
  } catch {
    engines.imagination = 0;
    issues.push('Imagination engine unavailable');
  }

  try {
    await reasoningEngine.getState();
    engines.reasoning = 100;
  } catch {
    engines.reasoning = 0;
    issues.push('Reasoning engine unavailable');
  }

  try {
    await governanceGuard.getState();
    engines.governance = 100;
  } catch {
    engines.governance = 0;
    issues.push('Governance engine unavailable');
  }

  // Check bus health
  const busState = engineBus.getState();
  const failureRate = engineBus.getFailureRate();
  if (failureRate > 0.2) {
    issues.push(`High failure rate: ${(failureRate * 100).toFixed(1)}%`);
  }

  const healthValues = Object.values(engines);
  const score = healthValues.reduce((a, b) => a + b, 0) / healthValues.length;

  return {
    healthy: score >= 80 && issues.length === 0,
    score,
    engines,
    issues,
  };
}

/**
 * Get telemetry summary
 */
export function getTelemetrySummary(): {
  totalEvents: number;
  errors: number;
  warnings: number;
  lastHour: number;
} {
  const state = telemetryEngine.getState();
  const oneHourAgo = new Date(Date.now() - 3600000).toISOString();
  const recentEvents = telemetryEngine.query({ since: oneHourAgo });

  return {
    totalEvents: state.totalEvents,
    errors: state.eventsBySeverity.error || 0,
    warnings: state.eventsBySeverity.warn || 0,
    lastHour: recentEvents.length,
  };
}

/**
 * Get state snapshot
 */
export function getStateSnapshot(): Record<string, Record<string, unknown>> {
  return stateEngine.snapshot();
}

// ═══════════════════════════════════════════════════════════════════════════════
// PIPELINE SHORTCUTS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Run memory pipeline
 */
export async function runMemoryPipeline(input: string) {
  return orchestratorEngine.runPipeline('memory_pipeline', input);
}

/**
 * Run creative pipeline
 */
export async function runCreativePipeline(input: string) {
  return orchestratorEngine.runPipeline('creative_pipeline', input);
}

/**
 * Run analytical pipeline
 */
export async function runAnalyticalPipeline(input: string) {
  return orchestratorEngine.runPipeline('analytical_pipeline', input);
}

/**
 * Run full cognitive pipeline
 */
export async function runFullCognitive(input: string) {
  return orchestratorEngine.runPipeline('full_cognitive', input);
}

// ═══════════════════════════════════════════════════════════════════════════════
// FORMAT HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Format memory for display
 */
export function formatMemory(memory: { content: string; memory_type?: string; confidence?: number; created_at?: string }): string {
  const type = memory.memory_type || 'general';
  const confidence = memory.confidence ? `(${(memory.confidence * 100).toFixed(0)}%)` : '';
  const date = memory.created_at ? new Date(memory.created_at).toLocaleDateString() : '';
  
  return `[${type.toUpperCase()}] ${memory.content.substring(0, 100)}... ${confidence} ${date}`;
}

/**
 * Format telemetry event for logging
 */
export function formatTelemetryEvent(event: { type: string; severity: string; timestamp: string; source?: { module?: string } }): string {
  const time = new Date(event.timestamp).toLocaleTimeString();
  const source = event.source?.module || 'unknown';
  return `[${time}] [${event.severity.toUpperCase()}] ${source}: ${event.type}`;
}

/**
 * Format duration in human-readable form
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}m`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// BATCH OPERATIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Batch ingest multiple items
 */
export async function batchIngest(items: Array<{ content: string; type?: string; tags?: string[] }>): Promise<{
  success: number;
  failed: number;
  ids: string[];
}> {
  const results = await Promise.allSettled(
    items.map(item => memoryCore.ingest(item.content, { 
      type: item.type as any, 
      tags: item.tags,
      source: 'batch_util',
    }))
  );

  const ids: string[] = [];
  let success = 0;
  let failed = 0;

  for (const result of results) {
    if (result.status === 'fulfilled' && result.value.success) {
      success++;
      if (result.value.memory_id) ids.push(result.value.memory_id);
    } else {
      failed++;
    }
  }

  return { success, failed, ids };
}

/**
 * Batch dispatch commands
 */
export async function batchDispatch(commands: Array<{ command: string; payload?: Record<string, unknown> }>): Promise<{
  success: number;
  failed: number;
  results: Array<{ command: string; success: boolean; error?: string }>;
}> {
  const results = await Promise.allSettled(
    commands.map(({ command, payload }) => engineBus.dispatch(command, payload))
  );

  let success = 0;
  let failed = 0;
  const formattedResults: Array<{ command: string; success: boolean; error?: string }> = [];

  results.forEach((result, index) => {
    if (result.status === 'fulfilled' && result.value.success) {
      success++;
      formattedResults.push({ command: commands[index].command, success: true });
    } else {
      failed++;
      const error = result.status === 'rejected' 
        ? (result.reason as Error).message 
        : (result.value as any).error;
      formattedResults.push({ command: commands[index].command, success: false, error });
    }
  });

  return { success, failed, results: formattedResults };
}

// ═══════════════════════════════════════════════════════════════════════════════
// TYPE EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export type SubstrateHealthReport = Awaited<ReturnType<typeof checkHealth>>;
export type TelemetrySummary = ReturnType<typeof getTelemetrySummary>;
