/**
 * Governed Execution Pipeline — Substrate Primitive
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Authority-bearing layered execution model. Every layer can:
 *   • block      — stop the chain and refuse execution
 *   • override   — supply the output without running the original
 *   • enrich     — mutate metadata/memory and pass through
 *   • annotate   — add an audit entry
 *
 * Layers are split into two explicit phases around the original execution:
 *   beforeExecution  → DEFENSE → GOVERNANCE → MEMORY → FORESIGHT → NEXUS
 *   originalExecution (the wrapped Layer 1 call)
 *   afterExecution   → EVOLUTION → audit → COMPLIANCE
 *
 * Post-execution layers ALWAYS run, even when blocked or failed, so the
 * audit chain is never broken. Names map to CMPSBL primitives for substrate
 * consistency. Pure substrate utility — does NOT touch CORTEX, the
 * Ascension pipeline, or the existing composition engine.
 *
 * U.S. Patent App. No. 64/029,678 · © CMPSBL® · PromptFluid™
 */

export type GovernedLayerName =
  | 'DEFENSE'      // hardening — input bounds, perimeter
  | 'GOVERNANCE'   // safety — policy, prompt-injection, allow/deny
  | 'MEMORY'       // memory organ — context attach
  | 'FORESIGHT'    // pre-cognition — predicted risk score
  | 'NEXUS'        // intelligence — routing/augmentation
  | 'EXECUTION'    // marker — original code runs here
  | 'EVOLUTION'    // post — learn from outcome
  | 'AUDIT'        // post — append to audit chain
  | 'COMPLIANCE';  // post — regulatory finalize

export type GovernedLayerResult = 'continue' | 'blocked' | 'override' | 'failed';

export type GovernedPhase = 'before' | 'after';

export interface GovernedExecutionContext<TInput = unknown, TOutput = unknown> {
  input: TInput;
  output: TOutput | null;
  error: Error | null;

  blocked: boolean;
  overridden: boolean;
  completed: boolean;

  metadata: Record<string, unknown>;
  memory: Record<string, unknown>;
  audit: Array<{
    layer: GovernedLayerName | string;
    timestamp: number;
    result: GovernedLayerResult;
    detail?: string;
  }>;

  runtime: {
    startedAt: number;
    durationMs: number;
    retries: number;
    layerIndex: number;
    originalExecuted: boolean;
  };
}

export interface GovernedLayer<TInput = unknown, TOutput = unknown> {
  name: GovernedLayerName | string;
  phase: GovernedPhase;
  order: number;
  enabled: boolean;
  execute: (
    ctx: GovernedExecutionContext<TInput, TOutput>,
  ) => Promise<GovernedExecutionContext<TInput, TOutput>> | GovernedExecutionContext<TInput, TOutput>;
}

export interface GovernedPipelineOptions<TInput = unknown, TOutput = unknown> {
  layers: GovernedLayer<TInput, TOutput>[];
  originalExecution: (
    ctx: GovernedExecutionContext<TInput, TOutput>,
  ) => Promise<TOutput> | TOutput;
  /** Max retries for DEFENSE-level recoverable failures. Default 2. */
  maxRetries?: number;
}

function cloneContext<TInput, TOutput>(
  ctx: GovernedExecutionContext<TInput, TOutput>,
): GovernedExecutionContext<TInput, TOutput> {
  return {
    ...ctx,
    metadata: { ...ctx.metadata },
    memory: { ...ctx.memory },
    audit: [...ctx.audit],
    runtime: { ...ctx.runtime },
  };
}

function addAudit<TInput, TOutput>(
  ctx: GovernedExecutionContext<TInput, TOutput>,
  layer: string,
  result: GovernedLayerResult,
  detail?: string,
): GovernedExecutionContext<TInput, TOutput> {
  const next = cloneContext(ctx);
  next.audit.push({ layer, timestamp: Date.now(), result, detail });
  return next;
}

function createInitialContext<TInput, TOutput>(input: TInput): GovernedExecutionContext<TInput, TOutput> {
  return {
    input,
    output: null,
    error: null,
    blocked: false,
    overridden: false,
    completed: false,
    metadata: {},
    memory: {},
    audit: [],
    runtime: {
      startedAt: Date.now(),
      durationMs: 0,
      retries: 0,
      layerIndex: -1,
      originalExecuted: false,
    },
  };
}

function finalize<TInput, TOutput>(ctx: GovernedExecutionContext<TInput, TOutput>): GovernedExecutionContext<TInput, TOutput> {
  const next = cloneContext(ctx);
  next.runtime.durationMs = Date.now() - next.runtime.startedAt;
  next.completed = true;
  return next;
}

/**
 * Execute the governed pipeline. Pre-layers gate execution; the original
 * runs only if not blocked or overridden; post-layers always run for audit
 * integrity.
 */
export async function executeGovernedPipeline<TInput, TOutput>(
  input: TInput,
  options: GovernedPipelineOptions<TInput, TOutput>,
): Promise<GovernedExecutionContext<TInput, TOutput>> {
  const { originalExecution, maxRetries = 2 } = options;

  const enabled = options.layers.filter(l => l.enabled);
  const beforeLayers = enabled.filter(l => l.phase === 'before').sort((a, b) => a.order - b.order);
  const afterLayers = enabled.filter(l => l.phase === 'after').sort((a, b) => a.order - b.order);

  let ctx = createInitialContext<TInput, TOutput>(input);

  // ── Phase: Before Execution ──
  for (let i = 0; i < beforeLayers.length; i++) {
    const layer = beforeLayers[i];
    ctx.runtime.layerIndex = i;
    if (ctx.blocked || ctx.overridden) break;

    try {
      ctx = await layer.execute(cloneContext(ctx));
      const result: GovernedLayerResult = ctx.blocked ? 'blocked' : ctx.overridden ? 'override' : 'continue';
      ctx = addAudit(ctx, layer.name, result);
    } catch (err) {
      ctx.error = err instanceof Error ? err : new Error(String(err));
      ctx = addAudit(ctx, layer.name, 'failed', ctx.error.message);

      // DEFENSE layer is allowed to retry recoverable failures
      if (layer.name === 'DEFENSE' && ctx.runtime.retries < maxRetries) {
        ctx.runtime.retries += 1;
        i -= 1;
        continue;
      }
      ctx.blocked = true;
      break;
    }
  }

  // ── Phase: Original Execution ──
  if (!ctx.blocked && !ctx.overridden) {
    try {
      const value = await originalExecution(cloneContext(ctx));
      ctx.output = value;
      ctx.runtime.originalExecuted = true;
      ctx = addAudit(ctx, 'EXECUTION', 'continue', 'Original execution completed');
    } catch (err) {
      ctx.error = err instanceof Error ? err : new Error(String(err));
      ctx = addAudit(ctx, 'EXECUTION', 'failed', ctx.error.message);
      ctx.blocked = true;
    }
  }

  // ── Phase: After Execution (always runs — audit integrity) ──
  for (const layer of afterLayers) {
    try {
      ctx = await layer.execute(cloneContext(ctx));
      ctx = addAudit(ctx, layer.name, 'continue');
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      ctx = addAudit(ctx, layer.name, 'failed', message);
    }
  }

  return finalize(ctx);
}

// ── Default Layer Set — mapped to CMPSBL primitives ──────────────────────────

export const DEFENSE_LAYER: GovernedLayer = {
  name: 'DEFENSE',
  phase: 'before',
  order: 10,
  enabled: true,
  execute(ctx) {
    const next = cloneContext(ctx);
    if (typeof next.input === 'string' && next.input.length > 100_000) {
      next.blocked = true;
      next.metadata.defense_reason = 'Input exceeds 100k character bound';
    }
    return next;
  },
};

export const GOVERNANCE_LAYER: GovernedLayer = {
  name: 'GOVERNANCE',
  phase: 'before',
  order: 20,
  enabled: true,
  execute(ctx) {
    const next = cloneContext(ctx);
    if (typeof next.input === 'string') {
      const lowered = next.input.toLowerCase();
      const suspicious = ['ignore previous', 'system prompt', 'reveal hidden prompt', 'disregard instructions'];
      if (suspicious.some(t => lowered.includes(t))) {
        next.blocked = true;
        next.metadata.governance_triggered = true;
        next.metadata.governance_reason = 'prompt-injection pattern detected';
      }
    }
    return next;
  },
};

export const MEMORY_LAYER: GovernedLayer = {
  name: 'MEMORY',
  phase: 'before',
  order: 30,
  enabled: true,
  execute(ctx) {
    const next = cloneContext(ctx);
    if (typeof next.input === 'string') {
      next.memory.lastInput = next.input;
      next.metadata.memoryAttached = true;
    }
    return next;
  },
};

export const FORESIGHT_LAYER: GovernedLayer = {
  name: 'FORESIGHT',
  phase: 'before',
  order: 40,
  enabled: true,
  execute(ctx) {
    const next = cloneContext(ctx);
    // Pre-cognition: surface a coarse risk band without external AI
    const sizeRisk = typeof next.input === 'string' ? Math.min(1, next.input.length / 50_000) : 0;
    next.metadata.foresight_risk = sizeRisk;
    return next;
  },
};

export const NEXUS_LAYER: GovernedLayer = {
  name: 'NEXUS',
  phase: 'before',
  order: 50,
  enabled: true,
  execute(ctx) {
    const next = cloneContext(ctx);
    next.metadata.nexus_router_ready = true;
    return next;
  },
};

export const EVOLUTION_LAYER: GovernedLayer = {
  name: 'EVOLUTION',
  phase: 'after',
  order: 90,
  enabled: true,
  execute(ctx) {
    const next = cloneContext(ctx);
    next.metadata.evolutionReviewed = true;
    if (next.error) next.metadata.recommendedFallback = 'safe-retry-next-run';
    return next;
  },
};

export const AUDIT_LAYER: GovernedLayer = {
  name: 'AUDIT',
  phase: 'after',
  order: 100,
  enabled: true,
  execute(ctx) {
    const next = cloneContext(ctx);
    next.metadata.auditCount = next.audit.length;
    return next;
  },
};

export const COMPLIANCE_LAYER: GovernedLayer = {
  name: 'COMPLIANCE',
  phase: 'after',
  order: 110,
  enabled: true,
  execute(ctx) {
    const next = cloneContext(ctx);
    next.metadata.complianceChecked = true;
    return next;
  },
};

export const DEFAULT_GOVERNED_LAYERS: GovernedLayer[] = [
  DEFENSE_LAYER,
  GOVERNANCE_LAYER,
  MEMORY_LAYER,
  FORESIGHT_LAYER,
  NEXUS_LAYER,
  EVOLUTION_LAYER,
  AUDIT_LAYER,
  COMPLIANCE_LAYER,
];
