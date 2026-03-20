/**
 * CMPSBL® Universal Effect Injection (v2)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Upgrades ANY uploaded code into a CMPSBL capability with REAL
 * execution binding, traceability, and runtime compatibility.
 *
 * v2 changes over v1:
 *  - Real execution binding (local/bridge/fallback) replaces synthetic handler
 *  - Truthful executed/degraded flags — no silent downgrades
 *  - Normalized ExecutionBindingResult as canonical record
 *  - Extended PrimaryExecutionUnit with executable hints
 *  - Strategy-aware annotations and transformation notes
 *
 * © CMPSBL® — All rights reserved.
 */

import type { PipelineContext } from '@/lib/export/module-effects';
import type { ExtractedPrimitive, AscensionNode, ExtractionResult } from './types';
import { buildAscensionModuleName } from './types';
import {
  bindAndExecute,
  buildExecutableUnit,
  resolveExecutionStrategy,
  type ExecutableUnit,
  type ExecutionBindingResult,
  type ExecutionStrategy,
  type StrategyResolution,
} from './execution-binding';

// ═══════════════════════════════════════════════════════════════════════════════
// §1 — TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface EffectSignal {
  type: 'execution' | 'fallback' | 'passthrough';
  source: string;
  duration_ms: number;
  status: 'success' | 'failed';
  error?: string;
  ts: number;
}

export interface IntelligenceMetrics {
  input_size: number;
  output_size: number;
  execution_density: number;
  primary_unit: string;
  primary_category: string;
}

export interface EffectContext {
  _data: Record<string, unknown>;
  _input: Record<string, unknown>;
  _signals: EffectSignal[];
  _errors: Array<{ type: string; message: string }>;
}

export interface EffectInjectionResult {
  ctx: EffectContext;
  normalized: {
    result: unknown;
    success: boolean;
    signals: number;
  };
  intelligence: IntelligenceMetrics;
  degraded: boolean;
  /** v2: Full execution binding record */
  binding: ExecutionBindingResult | null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// §1b — EFFECT SUMMARY (v2 Visibility Patch)
// ═══════════════════════════════════════════════════════════════════════════════

export type EffectStatus = 'executed' | 'fallback' | 'degraded';

/** Minimal UI contract — what frontend/dashboard/Radio consumes */
export interface EffectUIContract {
  module: string;
  status: EffectStatus;
  strategy: ExecutionStrategy;
  executed: boolean;
  degraded: boolean;
  signals: number;
  errors: number;
  timing: number;
  score: number;
}

/** Human-readable summary for demo + investor surfaces */
export interface EffectSummary {
  status: EffectStatus;
  strategy: ExecutionStrategy;
  primary: string;
  category: string;
  confidenceScore: number;
  shortSummary: string;
  badge: string;
  score: number;
  uiContract: EffectUIContract;
}

/** Global trace entry for runtime story layer */
export interface EffectTraceEntry {
  nodeId: string;
  module: string;
  strategy: ExecutionStrategy;
  executed: boolean;
  degraded: boolean;
  timing: number;
}

/**
 * Generate a human-readable effect summary from a binding result.
 * Non-technical person should understand in <5 seconds.
 */
export function generateEffectSummary(
  effectRecord: ExecutionBindingResult,
  moduleName: string
): EffectSummary {
  // Determine status
  let status: EffectStatus;
  if (effectRecord.executed && !effectRecord.degraded) {
    status = 'executed';
  } else if (effectRecord.degraded) {
    status = 'degraded';
  } else {
    status = 'fallback';
  }

  // Confidence score: base from signals vs errors ratio
  const signalCount = effectRecord.signals.length;
  const errorCount = effectRecord.errors.length;
  const confidenceScore = signalCount > 0
    ? Math.round(((signalCount - errorCount) / signalCount) * 100)
    : 0;

  // Effect score: (executed ? 1 : 0) * 0.6 + (degraded ? 0 : 0.4)
  const score = (effectRecord.executed ? 1 : 0) * 0.6 + (effectRecord.degraded ? 0 : 0.4);

  // Badge + short summary
  let badge: string;
  let shortSummary: string;
  switch (status) {
    case 'executed':
      badge = '✅ Healthy';
      shortSummary = `${effectRecord.primaryUnit} executed via ${effectRecord.strategy} in ${effectRecord.timingMs.toFixed(1)}ms`;
      break;
    case 'degraded':
      badge = '⚠️ Degraded';
      shortSummary = `${effectRecord.primaryUnit} execution failed safely — input preserved`;
      break;
    case 'fallback':
      badge = '🔄 Fallback';
      shortSummary = `${effectRecord.primaryUnit} has no execution path — passthrough only`;
      break;
  }

  const uiContract: EffectUIContract = {
    module: moduleName,
    status,
    strategy: effectRecord.strategy,
    executed: effectRecord.executed,
    degraded: effectRecord.degraded,
    signals: signalCount,
    errors: errorCount,
    timing: effectRecord.timingMs,
    score,
  };

  return {
    status,
    strategy: effectRecord.strategy,
    primary: effectRecord.primaryUnit,
    category: effectRecord.primaryCategory,
    confidenceScore,
    shortSummary,
    badge,
    score,
    uiContract,
  };
}

/**
 * Primary Execution Unit (v2) — backward-compatible extension.
 * v1 consumers still see name/category/confidence/complexity/handler.
 * v2 consumers also get executable hints for the binding layer.
 */
export interface PrimaryExecutionUnit {
  name: string;
  category: string;
  confidence: number;
  complexity: number;
  handler: (input: Record<string, unknown>) => Record<string, unknown>;
  /** v2 executable hints */
  executableUnit: ExecutableUnit;
}

// Re-export execution-binding types for barrel
export type { ExecutableUnit, ExecutionBindingResult, ExecutionStrategy, StrategyResolution };

// Default chain applied when no explicit chain exists
const DEFAULT_EFFECT_CHAIN = ['PRIMARY', 'MEDIC', 'BRAIN', 'ORACLE', 'CONSCIENCE'] as const;

// ═══════════════════════════════════════════════════════════════════════════════
// §2 — PRIMARY EXECUTION UNIT DETECTION (v2)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Detect the Primary Execution Unit from extracted primitives.
 * Priority: main class → primary exported function → first callable public method.
 * v2: now includes executable hints for downstream binding.
 */
export function detectPrimaryUnit(
  primitives: ExtractedPrimitive[],
  sourceFileName?: string,
  sourceLanguage?: string
): PrimaryExecutionUnit | null {
  if (primitives.length === 0) return null;

  const lang = sourceLanguage || primitives[0]?.language || 'unknown';

  // Priority 1: Class matching filename
  if (sourceFileName) {
    const baseName = sourceFileName.replace(/\.[^.]+$/, '').toLowerCase();
    const classMatch = primitives.find(
      (p) => p.extractionMethod === 'class' && p.name.toLowerCase() === baseName
    );
    if (classMatch) return buildUnit(classMatch, lang);
  }

  // Priority 2: Main/entry point function
  const entryNames = ['main', 'run', 'execute', 'handle', 'process', 'start', 'init'];
  const entryMatch = primitives.find(
    (p) =>
      p.extractionMethod === 'function' &&
      entryNames.some((e) => p.name.toLowerCase() === e || p.name.toLowerCase().startsWith(e))
  );
  if (entryMatch) return buildUnit(entryMatch, lang);

  // Priority 3: Highest-confidence class
  const classHigh = primitives
    .filter((p) => p.extractionMethod === 'class')
    .sort((a, b) => b.confidence - a.confidence)[0];
  if (classHigh) return buildUnit(classHigh, lang);

  // Priority 4: Highest-confidence function
  const funcHigh = primitives
    .filter((p) => p.extractionMethod === 'function')
    .sort((a, b) => b.confidence - a.confidence)[0];
  if (funcHigh) return buildUnit(funcHigh, lang);

  // Priority 5: First module
  const moduleMatch = primitives.find((p) => p.extractionMethod === 'module');
  if (moduleMatch) return buildUnit(moduleMatch, lang);

  // Fallback: first primitive
  return buildUnit(primitives[0], lang);
}

function buildUnit(primitive: ExtractedPrimitive, sourceLanguage: string): PrimaryExecutionUnit {
  const execUnit = buildExecutableUnit(primitive, sourceLanguage);

  return {
    name: primitive.name,
    category: primitive.category,
    confidence: primitive.confidence,
    complexity: primitive.complexity,
    executableUnit: execUnit,
    // Legacy handler retained for backward compat — v2 prefers bindAndExecute
    handler: (input: Record<string, unknown>) => {
      const key = `_${primitive.category}_${primitive.canonicalName || primitive.name}`;
      return {
        ...input,
        [key]: {
          executed: true,
          category: primitive.category,
          confidence: primitive.confidence,
          quality: primitive.qualityScore,
          inputs: primitive.inputs,
          complexity: primitive.complexity,
          timestamp: Date.now(),
        },
      };
    },
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// §3 — UNIVERSAL EFFECT WRAPPER (v2 — real execution binding)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Core effect wrapper v2 — binds primary unit to real execution,
 * then wraps with signals, metrics, and truthful degradation.
 */
export function effectWrapper(
  ctx: EffectContext,
  unit: PrimaryExecutionUnit
): EffectInjectionResult {
  const input = { ...ctx._data };

  // v2: Real execution binding — local/bridge/fallback
  const binding = bindAndExecute(unit.executableUnit, input);

  // Merge binding signals into effect context
  for (const sig of binding.signals) {
    ctx._signals.push(sig as EffectSignal);
  }
  for (const err of binding.errors) {
    ctx._errors.push(err);
  }

  // Merge result into context data
  if (binding.executed && binding.rawResult && typeof binding.rawResult === 'object') {
    ctx._data = { ...ctx._data, _result: binding.rawResult };
  } else {
    // Passthrough — input preserved, no synthetic "execution"
    ctx._data = { ...ctx._data, _result: input };
  }

  // Normalization
  const normalized = {
    result: ctx._data._result ?? null,
    success: binding.success,
    signals: ctx._signals.length,
  };

  // Intelligence metrics
  const intelligence: IntelligenceMetrics = {
    ...binding.intelligence,
    primary_unit: unit.name,
    primary_category: unit.category,
  };

  return {
    ctx,
    normalized,
    intelligence,
    degraded: binding.degraded,
    binding,
  };
}

function safeStringify(val: unknown): string {
  try { return JSON.stringify(val ?? {}); }
  catch { return '{}'; }
}

// ═══════════════════════════════════════════════════════════════════════════════
// §4 — MODULE NAME AUTO-MAPPING
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Extract module name from source filename.
 * TradeMatcher.php → TRADEMATCHER
 * my_analysis_tool.py → MY_ANALYSIS_TOOL
 */
export function autoMapModuleName(fileName: string): string {
  const base = fileName
    .replace(/\.[^.]+$/, '')
    .replace(/[^A-Za-z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .toUpperCase();

  return base || 'UPLOADED';
}

// ═══════════════════════════════════════════════════════════════════════════════
// §5 — DEFAULT CHAIN GENERATION
// ═══════════════════════════════════════════════════════════════════════════════

export function generateDefaultChain(primaryModuleName: string): string[] {
  return [primaryModuleName, ...DEFAULT_EFFECT_CHAIN.slice(1)];
}

export function ensureChain(
  existingChain: string[] | null | undefined,
  node: AscensionNode
): string[] {
  if (existingChain && existingChain.length > 0) {
    const moduleName = buildAscensionModuleName(node.surface?.nodeName || node.name);
    if (existingChain[0] !== moduleName) {
      return [moduleName, ...existingChain];
    }
    return existingChain;
  }

  const moduleName = buildAscensionModuleName(node.surface?.nodeName || node.name);
  return generateDefaultChain(moduleName);
}

// ═══════════════════════════════════════════════════════════════════════════════
// §6 — PIPELINE CONTEXT EFFECT APPLICATOR (v2)
// ═══════════════════════════════════════════════════════════════════════════════

/** Transformation note labels by strategy */
const STRATEGY_LABELS: Record<ExecutionStrategy, string> = {
  local: 'executed via local',
  bridge: 'executed via bridge',
  fallback: 'fallback passthrough',
};

/**
 * Apply Universal Effect Injection v2 to a PipelineContext.
 * Uses execution binding — not synthetic wrapping.
 */
export function applyEffectInjection(
  ctx: PipelineContext,
  node: AscensionNode
): PipelineContext {
  const primaryUnit = detectPrimaryUnit(
    node.primitives,
    node.source,
    node.language
  );

  const moduleName = buildAscensionModuleName(node.surface?.nodeName || node.name);
  const effectKey = `_effect_${moduleName}`;

  if (primaryUnit) {
    // Build effect context from pipeline context
    const effectCtx: EffectContext = {
      _data: { ...ctx.data },
      _input: { ...ctx.data },
      _signals: [],
      _errors: [],
    };

    // v2: Execute with real binding
    const result = effectWrapper(effectCtx, primaryUnit);
    const binding = result.binding!;

    // Merge back into pipeline context
    ctx.data = {
      ...ctx.data,
      ...(binding.executed ? (typeof binding.rawResult === 'object' && binding.rawResult ? binding.rawResult as Record<string, unknown> : {}) : {}),
      [effectKey]: {
        primary_unit: binding.primaryUnit,
        primary_category: binding.primaryCategory,
        execution_strategy: binding.strategy,
        executed: binding.executed,
        degraded: binding.degraded,
        signals: binding.signals.length,
        errors: binding.errors.length,
        fallback_reason: binding.fallbackReason,
        timing_ms: binding.timingMs,
        intelligence: binding.intelligence,
        normalized: binding.normalizedResult,
      },
    };

    // Annotations
    ctx.annotations[`effect.${node.id}.primary`] = primaryUnit.name;
    ctx.annotations[`effect.${node.id}.strategy`] = binding.strategy;
    ctx.annotations[`effect.${node.id}.executed`] = binding.executed;
    ctx.annotations[`effect.${node.id}.signals`] = binding.signals.length;
    ctx.annotations[`effect.${node.id}.degraded`] = binding.degraded;
    ctx.annotations[`effect.${node.id}.fallback`] = binding.fallbackReason ?? false;
    ctx.annotations[`effect.${node.id}.errors`] = binding.errors.length;

    // Transformation note — honest label
    const label = binding.degraded
      ? 'degraded execution'
      : STRATEGY_LABELS[binding.strategy];

    ctx.transformationNotes.push(
      `[EFFECT] ${moduleName} — ${label} — primary: ${primaryUnit.name} ` +
      `(${primaryUnit.category}), ${binding.signals.length} signals, ` +
      `${binding.timingMs.toFixed(1)}ms`
    );
  } else {
    // No callable unit — safe passthrough with trace
    ctx.data[effectKey] = {
      primary_unit: null,
      primary_category: null,
      execution_strategy: 'fallback' as ExecutionStrategy,
      executed: false,
      degraded: false,
      signals: 1,
      errors: 0,
      fallback_reason: 'No callable unit detected in extracted primitives',
      timing_ms: 0,
      intelligence: null,
      normalized: null,
    };

    ctx.annotations[`effect.${node.id}.primary`] = null;
    ctx.annotations[`effect.${node.id}.strategy`] = 'fallback';
    ctx.annotations[`effect.${node.id}.executed`] = false;
    ctx.annotations[`effect.${node.id}.signals`] = 0;
    ctx.annotations[`effect.${node.id}.degraded`] = false;
    ctx.annotations[`effect.${node.id}.fallback`] = 'No callable unit detected';
    ctx.annotations[`effect.${node.id}.errors`] = 0;

    ctx.transformationNotes.push(
      `[EFFECT] ${moduleName} — fallback passthrough — no callable unit detected, input preserved`
    );
  }

  return ctx;
}

// ═══════════════════════════════════════════════════════════════════════════════
// §7 — BATCH INJECTION FOR EXTRACTION RESULTS
// ═══════════════════════════════════════════════════════════════════════════════

export function enrichExtractionWithEffects(
  extraction: ExtractionResult,
  sourceFileName?: string,
  sourceLanguage?: string
): ExtractionResult & { effectMeta: EffectExtractionMeta } {
  const primary = detectPrimaryUnit(extraction.primitives, sourceFileName, sourceLanguage);
  const moduleName = sourceFileName ? autoMapModuleName(sourceFileName) : 'UPLOADED';
  const chain = generateDefaultChain(buildAscensionModuleName(moduleName));

  const execUnit = primary?.executableUnit ?? null;
  const resolution = execUnit ? resolveExecutionStrategy(execUnit) : null;

  return {
    ...extraction,
    effectMeta: {
      primaryUnit: primary
        ? {
            name: primary.name,
            category: primary.category,
            confidence: primary.confidence,
            executionKind: execUnit?.executionKind ?? 'unknown',
            sourceLanguage: execUnit?.sourceLanguage ?? 'unknown',
            directlyExecutable: execUnit?.directlyExecutable ?? false,
            requiresBridge: execUnit?.requiresBridge ?? false,
            fallbackOnly: execUnit?.fallbackOnly ?? true,
          }
        : null,
      autoMappedModule: moduleName,
      defaultChain: chain,
      effectReady: primary !== null,
      resolvedStrategy: resolution?.strategy ?? 'fallback',
      strategyReason: resolution?.reason ?? 'No primary unit detected',
      injectionVersion: 2,
    },
  };
}

export interface EffectExtractionMeta {
  primaryUnit: {
    name: string;
    category: string;
    confidence: number;
    executionKind: string;
    sourceLanguage: string;
    directlyExecutable: boolean;
    requiresBridge: boolean;
    fallbackOnly: boolean;
  } | null;
  autoMappedModule: string;
  defaultChain: string[];
  effectReady: boolean;
  resolvedStrategy: ExecutionStrategy;
  strategyReason: string;
  injectionVersion: number;
}
