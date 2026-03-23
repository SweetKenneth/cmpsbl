/**
 * RIPPLE Event Enrichment Pipeline — v9.0.0 "Tsunami"
 * 
 * Pre-delivery hooks that enrich event payloads (timestamps, context, trace IDs).
 * Post-delivery hooks for telemetry emission.
 * Transform chains — sequential payload mutations before fan-out.
 */

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type HookPhase = 'pre-delivery' | 'post-delivery';

export interface EnrichmentHook {
  id: string;
  name: string;
  phase: HookPhase;
  topicPattern: string;
  priority: number;          // Lower = runs first
  enabled: boolean;
  transform: (payload: Record<string, unknown>, context: EnrichmentContext) => Record<string, unknown>;
  registeredAt: string;
  executionCount: number;
  avgDurationMs: number;
  errorCount: number;
}

export interface EnrichmentContext {
  eventId: string;
  eventType: string;
  source: string;
  subscriberId?: string;
  timestamp: number;
  traceId: string;
  correlationId?: string;
  metadata: Record<string, unknown>;
}

export interface EnrichmentResult {
  originalPayload: Record<string, unknown>;
  enrichedPayload: Record<string, unknown>;
  hooksApplied: string[];
  totalDurationMs: number;
  errors: Array<{ hookId: string; error: string }>;
}

export interface EnrichmentStats {
  totalHooks: number;
  preDeliveryHooks: number;
  postDeliveryHooks: number;
  totalExecutions: number;
  totalErrors: number;
  avgPipelineDurationMs: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════════════════════

const hooks = new Map<string, EnrichmentHook>();
let totalPipelineExecutions = 0;
let totalPipelineDurationMs = 0;
const EMA_ALPHA = 0.2;

// ═══════════════════════════════════════════════════════════════════════════════
// BUILT-IN ENRICHMENT HOOKS
// ═══════════════════════════════════════════════════════════════════════════════

/** Register the standard system enrichment hooks. */
export function registerSystemHooks(): void {
  // Timestamp enrichment
  registerHook(
    'system-timestamp',
    'Timestamp Enrichment',
    'pre-delivery',
    '*',
    0,
    (payload, ctx) => ({
      ...payload,
      _enrichedAt: new Date(ctx.timestamp).toISOString(),
      _traceId: ctx.traceId,
    })
  );

  // Source context enrichment
  registerHook(
    'system-source-ctx',
    'Source Context',
    'pre-delivery',
    '*',
    1,
    (payload, ctx) => ({
      ...payload,
      _source: ctx.source,
      _eventType: ctx.eventType,
    })
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CORE ENGINE
// ═══════════════════════════════════════════════════════════════════════════════

/** Register a new enrichment hook. */
export function registerHook(
  id: string,
  name: string,
  phase: HookPhase,
  topicPattern: string,
  priority: number,
  transform: EnrichmentHook['transform']
): EnrichmentHook {
  const hook: EnrichmentHook = {
    id,
    name,
    phase,
    topicPattern,
    priority,
    enabled: true,
    transform,
    registeredAt: new Date().toISOString(),
    executionCount: 0,
    avgDurationMs: 0,
    errorCount: 0,
  };
  hooks.set(id, hook);
  return hook;
}

/** Unregister a hook. */
export function unregisterHook(id: string): boolean {
  return hooks.delete(id);
}

/** Enable/disable a hook. */
export function setHookEnabled(id: string, enabled: boolean): boolean {
  const hook = hooks.get(id);
  if (!hook) return false;
  hook.enabled = enabled;
  return true;
}

/** Run all pre-delivery hooks against a payload. */
export function runPreDeliveryPipeline(
  payload: Record<string, unknown>,
  context: EnrichmentContext
): EnrichmentResult {
  return runPipeline('pre-delivery', payload, context);
}

/** Run all post-delivery hooks against a payload. */
export function runPostDeliveryPipeline(
  payload: Record<string, unknown>,
  context: EnrichmentContext
): EnrichmentResult {
  return runPipeline('post-delivery', payload, context);
}

function runPipeline(
  phase: HookPhase,
  payload: Record<string, unknown>,
  context: EnrichmentContext
): EnrichmentResult {
  const start = performance.now();
  const originalPayload = { ...payload };
  let enriched = { ...payload };
  const hooksApplied: string[] = [];
  const errors: Array<{ hookId: string; error: string }> = [];

  // Get matching hooks sorted by priority
  const matchingHooks = Array.from(hooks.values())
    .filter(h => h.enabled && h.phase === phase && matchesPattern(context.eventType, h.topicPattern))
    .sort((a, b) => a.priority - b.priority);

  for (const hook of matchingHooks) {
    const hookStart = performance.now();
    try {
      enriched = hook.transform(enriched, context);
      hooksApplied.push(hook.id);
      hook.executionCount++;

      const hookDuration = performance.now() - hookStart;
      hook.avgDurationMs = EMA_ALPHA * hookDuration + (1 - EMA_ALPHA) * hook.avgDurationMs;
    } catch (error) {
      hook.errorCount++;
      errors.push({
        hookId: hook.id,
        error: error instanceof Error ? error.message : String(error),
      });
      // Non-blocking: continue with next hook
    }
  }

  const totalDuration = performance.now() - start;
  totalPipelineExecutions++;
  totalPipelineDurationMs += totalDuration;

  return {
    originalPayload,
    enrichedPayload: enriched,
    hooksApplied,
    totalDurationMs: Math.round(totalDuration * 100) / 100,
    errors,
  };
}

function matchesPattern(eventType: string, pattern: string): boolean {
  if (pattern === '*') return true;
  if (pattern.endsWith('.*')) {
    return eventType.startsWith(pattern.slice(0, -2));
  }
  return eventType === pattern;
}

// ═══════════════════════════════════════════════════════════════════════════════
// REPORTING
// ═══════════════════════════════════════════════════════════════════════════════

/** Get a specific hook. */
export function getHook(id: string): EnrichmentHook | null {
  return hooks.get(id) ?? null;
}

/** Get all hooks. */
export function getAllHooks(): EnrichmentHook[] {
  return Array.from(hooks.values()).sort((a, b) => a.priority - b.priority);
}

/** Get enrichment pipeline stats. */
export function getEnrichmentStats(): EnrichmentStats {
  const allHooks = Array.from(hooks.values());
  return {
    totalHooks: allHooks.length,
    preDeliveryHooks: allHooks.filter(h => h.phase === 'pre-delivery').length,
    postDeliveryHooks: allHooks.filter(h => h.phase === 'post-delivery').length,
    totalExecutions: totalPipelineExecutions,
    totalErrors: allHooks.reduce((s, h) => s + h.errorCount, 0),
    avgPipelineDurationMs: totalPipelineExecutions > 0
      ? Math.round((totalPipelineDurationMs / totalPipelineExecutions) * 100) / 100
      : 0,
  };
}

/** Reset all enrichment state. */
export function resetEnrichmentState(): void {
  hooks.clear();
  totalPipelineExecutions = 0;
  totalPipelineDurationMs = 0;
}
