/**
 * CMPSBL® Chain Executor
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Layer 1 — Universal Playback Engine
 * 
 * Executes discovered primitive chains through a deterministic pipeline:
 *   1. Load manifest
 *   2. Resolve primitive chain
 *   3. Build context
 *   4. Run stages sequentially (with effect handlers)
 *   5. Return output + full trace
 *
 * Every chain execution produces:
 *   - success / failure
 *   - output data
 *   - ordered trace
 *   - primitive effect log
 *   - timing
 *   - transformation notes
 *
 * Zero dependencies. Pure TypeScript.
 * © CMPSBL® — All rights reserved.
 */

import {
  resolveModuleEffect,
  hasDeepEffect,
  createPipelineContext,
  type PipelineContext,
  type StageTrace,
  type RecoveryRecord,
} from './module-effects';

// ═══════════════════════════════════════════════════════════════════════════════
// §1 — TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface ChainManifest {
  /** Unique ID for this discovery */
  id: string;
  /** Human-readable name */
  name: string;
  /** Description of the discovered capability */
  description: string;
  /** Ordered primitive chain (e.g. ['BRAIN', 'ORACLE', 'MEMORY', 'ECHO']) */
  modules: string[];
  /** CJPI score */
  cjpiScore: number;
  /** Discovery tier */
  tier: string;
  /** Discovery category */
  category: string;
  /** Source language (if from Ascension) */
  sourceLanguage?: string;
  /** Original software metadata */
  originalSoftware?: {
    name?: string;
    description?: string;
    entrypoint?: string;
  };
  /** Timestamp of discovery */
  discoveredAt: string;
}

export interface ChainExecutionResult {
  /** Whether the chain completed successfully */
  success: boolean;
  /** The chain manifest that was executed */
  manifest: ChainManifest;
  /** Final output data */
  output: Record<string, unknown>;
  /** Ordered execution trace — one entry per module */
  trace: StageTrace[];
  /** Primitive effect log — what each module did */
  effectLog: EffectLogEntry[];
  /** Total execution time in ms */
  totalDurationMs: number;
  /** Final confidence score (0–1) */
  confidence: number;
  /** Transformation notes — human-readable narrative */
  transformationNotes: string[];
  /** Error recoveries that occurred */
  recoveries: RecoveryRecord[];
  /** Annotations accumulated across the chain */
  annotations: Record<string, unknown>;
  /** Module depth report */
  depthReport: DepthReportEntry[];
  /** Chain fingerprint for deduplication */
  fingerprint: string;
  /** Execution timestamp */
  executedAt: string;
}

export interface EffectLogEntry {
  module: string;
  verb: string;
  description: string;
  depth: 'deep' | 'standard' | 'fallback';
  status: 'applied' | 'recovered' | 'failed';
  durationMs: number;
}

export interface DepthReportEntry {
  module: string;
  depth: 'deep' | 'standard' | 'fallback';
  hasDeepImplementation: boolean;
}

export interface ChainExecutorOptions {
  /** Timeout per stage in ms (default: 5000) */
  stageTimeoutMs?: number;
  /** Whether to continue on stage failure (default: true) */
  continueOnFailure?: boolean;
  /** Pre-execution hook */
  onStageStart?: (module: string, index: number) => void;
  /** Post-execution hook */
  onStageComplete?: (module: string, index: number, trace: StageTrace) => void;
  /** Error hook */
  onStageError?: (module: string, index: number, error: string) => void;
}

// ═══════════════════════════════════════════════════════════════════════════════
// §2 — UTILITY
// ═══════════════════════════════════════════════════════════════════════════════

function perf(): number {
  return typeof performance !== 'undefined' ? performance.now() : Date.now();
}

function quickHash(input: string): string {
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = ((hash << 5) + hash) + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}

function cloneData(data: Record<string, unknown>): Record<string, unknown> {
  try { return JSON.parse(JSON.stringify(data)); } catch { return { ...data }; }
}

// ═══════════════════════════════════════════════════════════════════════════════
// §3 — CHAIN EXECUTOR
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Execute a discovered primitive chain.
 * This is the primary entry point for runtime playback.
 *
 * @param manifest - The chain manifest (from discovery)
 * @param input - The input data to process through the chain
 * @param options - Execution options
 */
export async function executeChain(
  manifest: ChainManifest,
  input: Record<string, unknown> = {},
  options: ChainExecutorOptions = {},
): Promise<ChainExecutionResult> {
  const {
    stageTimeoutMs = 5000,
    continueOnFailure = true,
    onStageStart,
    onStageComplete,
    onStageError,
  } = options;

  const executionStart = perf();
  const ctx = createPipelineContext(manifest.id, manifest.modules, input);
  const effectLog: EffectLogEntry[] = [];
  const depthReport: DepthReportEntry[] = [];

  // Add manifest metadata to context
  ctx.data['_manifest'] = {
    id: manifest.id,
    name: manifest.name,
    category: manifest.category,
    tier: manifest.tier,
    cjpiScore: manifest.cjpiScore,
    moduleCount: manifest.modules.length,
  };

  ctx.transformationNotes.push(
    `[CHAIN] Executing "${manifest.name}" — ${manifest.modules.length} modules, CJPI: ${manifest.cjpiScore}, tier: ${manifest.tier}`
  );

  // ── Execute each module stage ──
  for (let i = 0; i < manifest.modules.length; i++) {
    const moduleName = manifest.modules[i];
    ctx.stageIndex = i;
    const stageStart = perf();
    const inputSnapshot = cloneData(ctx.data);

    onStageStart?.(moduleName, i);

    // Resolve the effect (deep, standard, or fallback)
    const effect = resolveModuleEffect(moduleName);
    const isDeep = hasDeepEffect(moduleName);

    depthReport.push({
      module: moduleName,
      depth: effect.depth,
      hasDeepImplementation: isDeep,
    });

    try {
      // Apply the effect with timeout
      const effectPromise = effect.apply(ctx);
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`Stage timeout: ${moduleName} exceeded ${stageTimeoutMs}ms`)), stageTimeoutMs)
      );

      await Promise.race([effectPromise, timeoutPromise]);

      const stageDuration = perf() - stageStart;

      // Record trace
      const traceEntry: StageTrace = {
        module: moduleName,
        effect: effect.verb,
        status: 'success',
        durationMs: Math.round(stageDuration * 100) / 100,
        inputSnapshot,
        outputSnapshot: cloneData(ctx.data),
        annotations: { ...ctx.annotations },
        notes: [...ctx.transformationNotes.slice(-1)],
        timestamp: Date.now(),
      };
      ctx.trace.push(traceEntry);
      onStageComplete?.(moduleName, i, traceEntry);

      effectLog.push({
        module: moduleName,
        verb: effect.verb,
        description: effect.description,
        depth: effect.depth,
        status: 'applied',
        durationMs: Math.round(stageDuration * 100) / 100,
      });

    } catch (err) {
      const stageDuration = perf() - stageStart;
      const errorMessage = err instanceof Error ? err.message : String(err);

      onStageError?.(moduleName, i, errorMessage);

      // Record recovery attempt
      const recovery: RecoveryRecord = {
        module: moduleName,
        error: errorMessage,
        strategy: 'fallback',
        recovered: continueOnFailure,
        timestamp: Date.now(),
      };
      ctx.recoveries.push(recovery);

      if (continueOnFailure) {
        // Apply minimal fallback annotation even on error
        ctx.data[`_${moduleName.toLowerCase()}`] = {
          participated: true,
          depth: 'error_recovery',
          error: errorMessage,
          recovered: true,
          stageIndex: i,
          timestamp: Date.now(),
        };
        ctx.annotations[`${moduleName.toLowerCase()}.error_recovered`] = true;
        ctx.transformationNotes.push(
          `[${moduleName}] Error recovered — "${errorMessage}" — continuing chain`
        );

        const traceEntry: StageTrace = {
          module: moduleName,
          effect: effect.verb,
          status: 'recovered',
          durationMs: Math.round(stageDuration * 100) / 100,
          inputSnapshot,
          outputSnapshot: cloneData(ctx.data),
          annotations: { ...ctx.annotations },
          notes: [`Error: ${errorMessage}`, 'Recovered via fallback'],
          timestamp: Date.now(),
        };
        ctx.trace.push(traceEntry);

        effectLog.push({
          module: moduleName,
          verb: effect.verb,
          description: effect.description,
          depth: effect.depth,
          status: 'recovered',
          durationMs: Math.round(stageDuration * 100) / 100,
        });
      } else {
        // Abort chain
        const traceEntry: StageTrace = {
          module: moduleName,
          effect: effect.verb,
          status: 'fallback',
          durationMs: Math.round(stageDuration * 100) / 100,
          inputSnapshot,
          outputSnapshot: cloneData(ctx.data),
          annotations: { ...ctx.annotations },
          notes: [`Fatal error: ${errorMessage}`, 'Chain aborted'],
          timestamp: Date.now(),
        };
        ctx.trace.push(traceEntry);

        effectLog.push({
          module: moduleName,
          verb: effect.verb,
          description: effect.description,
          depth: effect.depth,
          status: 'failed',
          durationMs: Math.round(stageDuration * 100) / 100,
        });

        return buildResult(manifest, ctx, effectLog, depthReport, perf() - executionStart, false);
      }
    }
  }

  ctx.transformationNotes.push(
    `[CHAIN] Complete — ${ctx.trace.filter(t => t.status === 'success').length}/${manifest.modules.length} stages succeeded, confidence: ${(ctx.confidence * 100).toFixed(1)}%`
  );

  return buildResult(manifest, ctx, effectLog, depthReport, perf() - executionStart, true);
}

/**
 * Build the final execution result
 */
function buildResult(
  manifest: ChainManifest,
  ctx: PipelineContext,
  effectLog: EffectLogEntry[],
  depthReport: DepthReportEntry[],
  totalDurationMs: number,
  success: boolean,
): ChainExecutionResult {
  return {
    success,
    manifest,
    output: { ...ctx.data },
    trace: ctx.trace,
    effectLog,
    totalDurationMs: Math.round(totalDurationMs * 100) / 100,
    confidence: Math.round(ctx.confidence * 1000) / 1000,
    transformationNotes: ctx.transformationNotes,
    recoveries: ctx.recoveries,
    annotations: ctx.annotations,
    depthReport,
    fingerprint: quickHash(`${manifest.id}|${manifest.modules.join(',')}|${Date.now()}`),
    executedAt: new Date().toISOString(),
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// §4 — BATCH EXECUTOR
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Execute multiple chains sequentially and aggregate results
 */
export async function executeChainBatch(
  manifests: ChainManifest[],
  input: Record<string, unknown> = {},
  options: ChainExecutorOptions = {},
): Promise<{
  results: ChainExecutionResult[];
  totalDurationMs: number;
  successCount: number;
  failureCount: number;
  aggregateConfidence: number;
}> {
  const start = perf();
  const results: ChainExecutionResult[] = [];

  for (const manifest of manifests) {
    results.push(await executeChain(manifest, input, options));
  }

  const successCount = results.filter(r => r.success).length;
  const totalConfidence = results.reduce((s, r) => s + r.confidence, 0);

  return {
    results,
    totalDurationMs: Math.round((perf() - start) * 100) / 100,
    successCount,
    failureCount: results.length - successCount,
    aggregateConfidence: results.length > 0 ? Math.round((totalConfidence / results.length) * 1000) / 1000 : 0,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// §5 — DRY RUN (trace-only, no side effects)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Dry-run a chain — produces a depth report and effect plan without execution
 */
export function dryRunChain(manifest: ChainManifest): {
  modules: string[];
  effectPlan: Array<{ module: string; verb: string; depth: string; description: string }>;
  depthReport: DepthReportEntry[];
  deepCount: number;
  standardCount: number;
  fallbackCount: number;
} {
  const effectPlan = manifest.modules.map(mod => {
    const effect = resolveModuleEffect(mod);
    return {
      module: mod,
      verb: effect.verb,
      depth: effect.depth,
      description: effect.description,
    };
  });

  const depthReport = manifest.modules.map(mod => ({
    module: mod,
    depth: resolveModuleEffect(mod).depth,
    hasDeepImplementation: hasDeepEffect(mod),
  }));

  return {
    modules: manifest.modules,
    effectPlan,
    depthReport,
    deepCount: depthReport.filter(d => d.depth === 'deep').length,
    standardCount: depthReport.filter(d => d.depth === 'standard').length,
    fallbackCount: depthReport.filter(d => d.depth === 'fallback').length,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// §6 — RESULT FORMATTERS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Format an execution result as a human-readable summary
 */
export function formatExecutionSummary(result: ChainExecutionResult): string {
  const lines: string[] = [
    `═══ CMPSBL® Chain Execution Report ═══`,
    ``,
    `Chain: ${result.manifest.name}`,
    `ID: ${result.manifest.id}`,
    `Tier: ${result.manifest.tier.toUpperCase()} | CJPI: ${result.manifest.cjpiScore}`,
    `Status: ${result.success ? '✓ SUCCESS' : '✗ FAILED'}`,
    `Duration: ${result.totalDurationMs.toFixed(1)}ms`,
    `Confidence: ${(result.confidence * 100).toFixed(1)}%`,
    ``,
    `── Module Chain ──`,
  ];

  for (const entry of result.effectLog) {
    const depthIcon = entry.depth === 'deep' ? '◆' : entry.depth === 'standard' ? '◇' : '○';
    const statusIcon = entry.status === 'applied' ? '✓' : entry.status === 'recovered' ? '⟳' : '✗';
    lines.push(`  ${depthIcon} ${entry.module} [${entry.verb}] ${statusIcon} ${entry.durationMs.toFixed(1)}ms`);
  }

  lines.push('');
  lines.push('── Depth Report ──');

  const deep = result.depthReport.filter(d => d.depth === 'deep').length;
  const standard = result.depthReport.filter(d => d.depth === 'standard').length;
  const fallback = result.depthReport.filter(d => d.depth === 'fallback').length;
  lines.push(`  Deep: ${deep} | Standard: ${standard} | Fallback: ${fallback}`);

  if (result.recoveries.length > 0) {
    lines.push('');
    lines.push('── Recoveries ──');
    for (const rec of result.recoveries) {
      lines.push(`  ${rec.module}: ${rec.error} [${rec.strategy}] ${rec.recovered ? '✓' : '✗'}`);
    }
  }

  lines.push('');
  lines.push('── Transformation Notes ──');
  for (const note of result.transformationNotes) {
    lines.push(`  ${note}`);
  }

  lines.push('');
  lines.push(`Fingerprint: ${result.fingerprint}`);
  lines.push(`Executed: ${result.executedAt}`);
  lines.push(`═══════════════════════════════════════`);

  return lines.join('\n');
}
