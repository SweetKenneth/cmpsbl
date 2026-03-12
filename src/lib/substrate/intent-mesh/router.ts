/**
 * Intent Mesh — Router
 * Dynamic intent resolution and cross-module composition
 * 
 * The router matches intents to capable resolvers, executes them,
 * and composes the results. All interactions produce receipts.
 * 
 * GOVERNANCE: Read-only by default. Mutation resolvers blocked unless
 * governance mode is 'governed' or 'emergency'.
 */

import { supabase } from '@/integrations/supabase/client';
import { MESH_MANIFEST, getResolversByDomain } from './manifest';
import { isMeshEnabled } from './toggle';
import type { MeshIntent, MeshResolution, ResolverResponse, MeshReceipt, MeshResolver } from './types';

/**
 * Broadcast an intent and get composed responses from all matching resolvers
 */
export async function broadcastIntent(intent: Omit<MeshIntent, 'id' | 'timestamp'>): Promise<MeshResolution> {
  const startTime = performance.now();
  const intentId = crypto.randomUUID();
  const timestamp = new Date().toISOString();
  
  // Check kill switch
  if (!isMeshEnabled()) {
    return {
      intentId,
      sourceModule: intent.sourceModule,
      intentType: intent.intentType,
      resolversMatched: 0,
      resolversResponded: 0,
      responses: [],
      composedResult: { _meshDisabled: true },
      totalDurationMs: 0,
      timestamp,
    };
  }

  // Find matching resolvers based on domains
  const matchingResolvers = findMatchingResolvers(intent);
  
  // Filter out source module (don't query yourself)
  const externalResolvers = matchingResolvers.filter(
    r => r.module !== intent.sourceModule.toUpperCase()
  );

  // Enforce governance — block mutation resolvers unless governed
  const allowedResolvers = externalResolvers.filter(r => {
    if (r.risk === 'mutate' && intent.governanceMode === 'read_only') {
      return false;
    }
    return true;
  });

  // Execute all resolvers in parallel (read-only, safe)
  const responses = await Promise.all(
    allowedResolvers.map(resolver => executeResolver(resolver, intent.input))
  );

  const totalDurationMs = Math.round(performance.now() - startTime);

  // Compose results — merge all successful responses
  const composedResult: Record<string, unknown> = {};
  const resolvedBy: string[] = [];
  
  for (const response of responses) {
    if (response.success && response.data) {
      Object.assign(composedResult, response.data);
      resolvedBy.push(response.module);
    }
  }

  const resolution: MeshResolution = {
    intentId,
    sourceModule: intent.sourceModule,
    intentType: intent.intentType,
    resolversMatched: externalResolvers.length,
    resolversResponded: responses.filter(r => r.success).length,
    responses,
    composedResult,
    totalDurationMs,
    timestamp,
  };

  // Log receipt to database (fire-and-forget)
  logReceipt({
    intent_type: intent.intentType,
    source_module: intent.sourceModule,
    target_modules: externalResolvers.map(r => r.module),
    resolved_by: resolvedBy,
    input_summary: sanitizeForLogging(intent.input),
    output_summary: sanitizeForLogging(composedResult),
    governance_mode: intent.governanceMode,
    success: responses.some(r => r.success),
    duration_ms: totalDurationMs,
  }).catch(() => {}); // Non-blocking

  // Emit real comm events for the mesh feed (fire-and-forget)
  emitCommEvents(intent, responses).catch(() => {});

  // Auto-discovery: if resolution was partial/failed, queue gap analysis
  const isPartial = resolvedBy.length < externalResolvers.length;
  const isFailed = !responses.some(r => r.success);
  if ((isPartial || isFailed) && !(intent.input as any)?._refinementTurn) {
    queueGapDetection(intent, resolvedBy, externalResolvers.map(r => r.module));
  }

  return resolution;
}

/**
 * Find resolvers that match an intent's domains
 */
function findMatchingResolvers(intent: Omit<MeshIntent, 'id' | 'timestamp'>): MeshResolver[] {
  const matched = new Set<string>();
  const resolvers: MeshResolver[] = [];
  
  for (const domain of intent.domains) {
    for (const resolver of getResolversByDomain(domain)) {
      if (!matched.has(resolver.id)) {
        matched.add(resolver.id);
        resolvers.push(resolver);
      }
    }
  }
  
  return resolvers;
}

/**
 * Per-resolver timeout (ms). Prevents a slow module from hanging the entire
 * mesh resolution. The substrate.invoke layer has its own timeouts (15-60s)
 * but this adds a tighter ceiling for mesh routing specifically.
 */
const RESOLVER_TIMEOUT_MS = 5000;

/**
 * Execute a single resolver by dispatching through the substrate.
 * Routes to the owning module via substrate.invoke with the resolver's
 * accepted input keys. Falls back to a provenance stub if the module
 * doesn't handle the resolver action (safe degradation).
 * 
 * Hardened: 5s timeout via Promise.race prevents hanging.
 */
async function executeResolver(
  resolver: MeshResolver,
  input: Record<string, unknown>
): Promise<ResolverResponse> {
  const startTime = performance.now();

  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error(`Resolver ${resolver.id} timed out after ${RESOLVER_TIMEOUT_MS}ms`)), RESOLVER_TIMEOUT_MS);
  });

  try {
    const result = await Promise.race([
      executeResolverInner(resolver, input),
      timeoutPromise,
    ]);
    return result;
  } catch (err) {
    return {
      resolverId: resolver.id,
      module: resolver.module,
      success: false,
      error: err instanceof Error ? err.message : 'Resolver failed',
      durationMs: Math.round(performance.now() - startTime),
    };
  }
}

async function executeResolverInner(
  resolver: MeshResolver,
  input: Record<string, unknown>
): Promise<ResolverResponse> {
  const startTime = performance.now();

  try {
    const { substrate } = await import('@/lib/substrate');

    const scopedInput: Record<string, unknown> = {};
    for (const key of resolver.accepts) {
      if (key in input) scopedInput[key] = input[key];
    }

    const response = await substrate.invoke({
      module: resolver.module.toLowerCase() as any,
      action: resolver.id.split('.').slice(1).join('.') || resolver.id,
      payload: { ...scopedInput, _meshResolver: resolver.id },
    });

    if (response.success && response.data) {
      return {
        resolverId: resolver.id,
        module: resolver.module,
        success: true,
        data: {
          ...(typeof response.data === 'object' ? response.data as Record<string, unknown> : { result: response.data }),
          _resolvedBy: resolver.id,
          _module: resolver.module,
          _risk: resolver.risk,
        },
        durationMs: Math.round(performance.now() - startTime),
      };
    }

    // Module returned a soft failure — fall back to provenance stub
    const data: Record<string, unknown> = {};
    for (const key of resolver.produces) {
      data[key] = null;
    }
    data._resolvedBy = resolver.id;
    data._module = resolver.module;
    data._risk = resolver.risk;
    data._fallback = true;
    data._reason = response.error || 'Module returned no data';

    return {
      resolverId: resolver.id,
      module: resolver.module,
      success: true,
      data,
      durationMs: Math.round(performance.now() - startTime),
    };
  } catch (err) {
    return {
      resolverId: resolver.id,
      module: resolver.module,
      success: false,
      error: err instanceof Error ? err.message : 'Resolver failed',
      durationMs: Math.round(performance.now() - startTime),
    };
  }
}

/**
 * Queue gap detection for failed/partial intents (non-blocking).
 * Buffer is capped at MAX_PENDING_GAPS to prevent unbounded memory growth.
 */
const MAX_PENDING_GAPS = 200;

function queueGapDetection(
  intent: Omit<MeshIntent, 'id' | 'timestamp'>,
  resolvedBy: string[],
  targetModules: string[]
): void {
  // Cap buffer — drop oldest entries when full
  if (pendingGapIntents.length >= MAX_PENDING_GAPS) {
    pendingGapIntents.splice(0, pendingGapIntents.length - MAX_PENDING_GAPS + 1);
  }

  pendingGapIntents.push({
    sourceModule: intent.sourceModule,
    intentType: intent.intentType,
    domains: intent.domains,
    resolvedBy,
    targetModules,
    timestamp: new Date().toISOString(),
  });
  
  // Auto-flush when we accumulate enough gap signals
  if (pendingGapIntents.length >= GAP_DETECTION_THRESHOLD) {
    flushGapDetection();
  }
}

// Gap detection buffer
interface PendingGapIntent {
  sourceModule: string;
  intentType: string;
  domains: string[];
  resolvedBy: string[];
  targetModules: string[];
  timestamp: string;
}

const pendingGapIntents: PendingGapIntent[] = [];
const GAP_DETECTION_THRESHOLD = 5;

/**
 * Flush accumulated gap signals to discovery engine
 */
async function flushGapDetection(): Promise<void> {
  if (pendingGapIntents.length === 0) return;
  
  const batch = pendingGapIntents.splice(0, pendingGapIntents.length);
  
  try {
    // Log gap signals to database for discovery engine to pick up
    const gapSignals = batch.map(g => ({
      source_module: g.sourceModule,
      intent_type: g.intentType,
      domains: g.domains,
      needed_outputs: [],
      available_resolvers: g.targetModules.length,
      responding_resolvers: g.resolvedBy.length,
      missing_modules: g.targetModules.filter(m => !g.resolvedBy.includes(m)),
      gap_severity: g.resolvedBy.length === 0 ? 'high' : 'medium',
      frequency: 1,
      status: 'open',
    }));
    
    await supabase.from('mesh_discovery_gaps').insert(gapSignals as any[]);
    console.log(`[IntentMesh] Flushed ${batch.length} gap signals to discovery engine`);
  } catch (err) {
    console.warn('[IntentMesh] Failed to flush gap signals:', err);
  }
}

/** Expose flush for terminal command use */
export { flushGapDetection };

/**
 * Emit real comm events to the mesh_comms table for the live feed.
 * Translates each resolver response into an INTENT-voice event with
 * signal variety based on actual resolution outcomes.
 */
// Sampling counter — only 1 in 5 intent broadcasts persist to mesh_comms
let commSampleCounter = 0;
const COMM_SAMPLE_RATE = 5; // persist every Nth intent

async function emitCommEvents(
  intent: Omit<MeshIntent, 'id' | 'timestamp'>,
  responses: ResolverResponse[]
): Promise<void> {
  // Sample: skip persistence for most intents to reduce DB write volume
  commSampleCounter++;
  if (commSampleCounter % COMM_SAMPLE_RATE !== 0) return;

  try {
    const { createCommEvent } = await import('./intent-voice');
    const events: Array<Record<string, unknown>> = [];
    const source = intent.sourceModule.toUpperCase();

    // Source module broadcasts its intent
    const sourceSignal = responses.length > 0 ? 'processing' : 'heartbeat';
    const sourceEvent = createCommEvent(source, sourceSignal, {
      targetModule: responses[0]?.module,
      resolverId: responses[0]?.resolverId,
    });
    events.push(commEventToRow(sourceEvent));

    // Each responding resolver emits a signal based on outcome
    for (const resp of responses) {
      let signal: string;
      if (resp.success && resp.data?._fallback) {
        signal = 'acknowledged';
      } else if (resp.success) {
        signal = resp.durationMs > 3000 ? 'resolved' : 'complete';
      } else if (resp.error?.includes('timed out')) {
        signal = 'warning';
      } else {
        signal = 'denied';
      }

      const ev = createCommEvent(resp.module, signal, {
        targetModule: source,
        resolverId: resp.resolverId,
      });
      events.push(commEventToRow(ev));
    }

    // Source emits completion ack if all resolvers succeeded
    if (responses.length > 0 && responses.every(r => r.success)) {
      const ackEvent = createCommEvent(source, 'confirmed', {
        targetModule: responses[responses.length - 1]?.module,
      });
      events.push(commEventToRow(ackEvent));
    }

    if (events.length > 0) {
      await supabase.from('mesh_comms').insert(events as any[]);
    }
  } catch (err) {
    console.warn('[IntentMesh] Failed to emit comm events:', err);
  }
}

/** Convert a MeshCommEvent to a DB row shape */
function commEventToRow(ev: { sourceModule: string; targetModule?: string; rawSignal: string; translatedVoice: string; category: string; resolverId?: string; personality?: { trait: string; icon: string } }): Record<string, unknown> {
  return {
    source_module: ev.sourceModule,
    target_module: ev.targetModule ?? null,
    raw_signal: ev.rawSignal,
    translated_voice: ev.translatedVoice,
    category: ev.category,
    resolver_id: ev.resolverId ?? null,
    personality_trait: ev.personality?.trait ?? null,
    personality_icon: ev.personality?.icon ?? null,
  };
}

/**
 * Persist a comm event directly (for non-router mesh activity)
 */
export async function persistCommEvent(
  sourceModule: string,
  rawSignal: string,
  opts?: { targetModule?: string; resolverId?: string }
): Promise<void> {
  try {
    const { createCommEvent } = await import('./intent-voice');
    const ev = createCommEvent(sourceModule, rawSignal, opts);
    await supabase.from('mesh_comms').insert([commEventToRow(ev)] as any[]);
  } catch (err) {
    console.warn('[IntentMesh] Failed to persist comm event:', err);
  }
}

/**
 * Log a mesh receipt to the database
 */
async function logReceipt(receipt: MeshReceipt): Promise<void> {
  try {
    await supabase.from('mesh_intents').insert([receipt as any]);
  } catch (err) {
    console.warn('[IntentMesh] Failed to log receipt:', err);
  }
}

/**
 * Sanitize input/output for logging (remove sensitive data, truncate)
 */
function sanitizeForLogging(data: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};
  const sensitiveKeys = ['password', 'secret', 'token', 'key', 'api_key'];
  
  for (const [key, value] of Object.entries(data)) {
    if (sensitiveKeys.some(s => key.toLowerCase().includes(s))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'string' && value.length > 200) {
      sanitized[key] = value.slice(0, 200) + '...';
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}

/**
 * Get recent mesh receipts from database
 */
export async function getRecentReceipts(limit: number = 20): Promise<MeshReceipt[]> {
  const { data, error } = await supabase
    .from('mesh_intents')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (error) {
    console.warn('[IntentMesh] Failed to fetch receipts:', error);
    return [];
  }
  
  return (data || []).map(row => ({
    ...row,
    input_summary: (row.input_summary as Record<string, unknown>) || {},
    output_summary: (row.output_summary as Record<string, unknown>) || {},
  }));
}

/**
 * Get mesh statistics
 */
export async function getMeshStats(): Promise<{
  totalIntents: number;
  successRate: number;
  topRoutes: Array<{ source: string; target: string; count: number }>;
  avgDurationMs: number;
}> {
  const { data, error } = await supabase
    .from('mesh_intents')
    .select('source_module, resolved_by, success, duration_ms')
    .order('created_at', { ascending: false })
    .limit(100);
  
  if (error || !data) {
    return { totalIntents: 0, successRate: 0, topRoutes: [], avgDurationMs: 0 };
  }
  
  const total = data.length;
  const successes = data.filter(d => d.success).length;
  const avgDuration = total > 0 
    ? data.reduce((sum, d) => sum + (d.duration_ms || 0), 0) / total 
    : 0;
  
  // Count routes
  const routeCounts = new Map<string, number>();
  for (const row of data) {
    const resolvedBy = row.resolved_by as string[] || [];
    for (const target of resolvedBy) {
      const key = `${row.source_module}→${target}`;
      routeCounts.set(key, (routeCounts.get(key) || 0) + 1);
    }
  }
  
  const topRoutes = [...routeCounts.entries()]
    .map(([key, count]) => {
      const [source, target] = key.split('→');
      return { source, target, count };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
  
  return {
    totalIntents: total,
    successRate: total > 0 ? successes / total : 0,
    topRoutes,
    avgDurationMs: Math.round(avgDuration),
  };
}
