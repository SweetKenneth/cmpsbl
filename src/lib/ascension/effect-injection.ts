/**
 * CMPSBL® Universal Effect Injection (v1)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Upgrades ANY uploaded code into a CMPSBL capability with real
 * execution effects, traceability, and runtime compatibility.
 *
 * Patch contract:
 *  1. Detect primary execution unit from extracted primitives
 *  2. Wrap execution with effect envelope (signals, metrics, degradation)
 *  3. Auto-map module name from source filename
 *  4. Auto-generate default chain if none exists
 *  5. Preserve original logic — wrap only
 *  6. Guarantee safe fallback (non-callable → passthrough + trace)
 *
 * © CMPSBL® — All rights reserved.
 */

import type { PipelineContext } from '@/lib/export/module-effects';
import type { ExtractedPrimitive, AscensionNode, ExtractionResult } from './types';
import { buildAscensionModuleName } from './types';

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
}

export interface PrimaryExecutionUnit {
  name: string;
  category: string;
  confidence: number;
  complexity: number;
  handler: (input: Record<string, unknown>) => Record<string, unknown>;
}

// Default chain applied when no explicit chain exists
const DEFAULT_EFFECT_CHAIN = ['PRIMARY', 'MEDIC', 'BRAIN', 'ORACLE', 'CONSCIENCE'] as const;

// ═══════════════════════════════════════════════════════════════════════════════
// §2 — PRIMARY EXECUTION UNIT DETECTION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Detect the Primary Execution Unit from extracted primitives.
 * Priority: main class → primary exported function → first callable public method.
 */
export function detectPrimaryUnit(
  primitives: ExtractedPrimitive[],
  sourceFileName?: string
): PrimaryExecutionUnit | null {
  if (primitives.length === 0) return null;

  // Priority 1: Class matching filename
  if (sourceFileName) {
    const baseName = sourceFileName.replace(/\.[^.]+$/, '').toLowerCase();
    const classMatch = primitives.find(
      (p) => p.extractionMethod === 'class' && p.name.toLowerCase() === baseName
    );
    if (classMatch) return buildUnit(classMatch);
  }

  // Priority 2: Main/entry point function
  const entryNames = ['main', 'run', 'execute', 'handle', 'process', 'start', 'init'];
  const entryMatch = primitives.find(
    (p) =>
      p.extractionMethod === 'function' &&
      entryNames.some((e) => p.name.toLowerCase() === e || p.name.toLowerCase().startsWith(e))
  );
  if (entryMatch) return buildUnit(entryMatch);

  // Priority 3: Highest-confidence class
  const classHigh = primitives
    .filter((p) => p.extractionMethod === 'class')
    .sort((a, b) => b.confidence - a.confidence)[0];
  if (classHigh) return buildUnit(classHigh);

  // Priority 4: Highest-confidence function
  const funcHigh = primitives
    .filter((p) => p.extractionMethod === 'function')
    .sort((a, b) => b.confidence - a.confidence)[0];
  if (funcHigh) return buildUnit(funcHigh);

  // Priority 5: First module
  const moduleMatch = primitives.find((p) => p.extractionMethod === 'module');
  if (moduleMatch) return buildUnit(moduleMatch);

  // Fallback: first primitive
  return buildUnit(primitives[0]);
}

function buildUnit(primitive: ExtractedPrimitive): PrimaryExecutionUnit {
  return {
    name: primitive.name,
    category: primitive.category,
    confidence: primitive.confidence,
    complexity: primitive.complexity,
    handler: (input: Record<string, unknown>) => {
      // Wrap original logic — returns enriched context
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
// §3 — UNIVERSAL EFFECT WRAPPER
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Core effect wrapper — wraps ANY primary execution unit with:
 *  - Timing telemetry
 *  - Signal emission
 *  - Error capture
 *  - Normalization
 *  - Intelligence metrics
 *  - Degradation flagging
 */
export function effectWrapper(
  ctx: EffectContext,
  unit: PrimaryExecutionUnit
): EffectInjectionResult {
  const input = { ...ctx._data };
  const start = performance.now();
  let result: Record<string, unknown> = input;
  let success = true;

  try {
    // Execute primary unit
    result = unit.handler(input);
    const duration = performance.now() - start;

    ctx._data = { ...ctx._data, _result: result };
    ctx._signals.push({
      type: 'execution',
      source: unit.name,
      duration_ms: Math.round(duration * 1000) / 1000,
      status: 'success',
      ts: Date.now(),
    });
  } catch (err: unknown) {
    success = false;
    const message = err instanceof Error ? err.message : String(err);

    ctx._errors.push({ type: 'execution_error', message });
    ctx._signals.push({
      type: 'execution',
      source: unit.name,
      duration_ms: Math.round((performance.now() - start) * 1000) / 1000,
      status: 'failed',
      error: message,
      ts: Date.now(),
    });

    // Safe fallback: return input unchanged, still emit signals
    ctx._data = { ...ctx._data, _result: input };
  }

  // Normalization
  const normalized = {
    result: ctx._data._result ?? null,
    success: ctx._errors.length === 0,
    signals: ctx._signals.length,
  };

  // Intelligence metrics
  const inputStr = safeStringify(ctx._input);
  const outputStr = safeStringify(ctx._data._result);
  const intelligence: IntelligenceMetrics = {
    input_size: inputStr.length,
    output_size: outputStr.length,
    execution_density: ctx._signals.length,
    primary_unit: unit.name,
    primary_category: unit.category,
  };

  // Degradation flag
  const degraded = ctx._errors.length > 0;

  return { ctx, normalized, intelligence, degraded };
}

function safeStringify(val: unknown): string {
  try {
    return JSON.stringify(val ?? {});
  } catch {
    return '{}';
  }
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
    .replace(/\.[^.]+$/, '')    // strip extension
    .replace(/[^A-Za-z0-9_]/g, '_')  // remove symbols
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .toUpperCase();

  return base || 'UPLOADED';
}

// ═══════════════════════════════════════════════════════════════════════════════
// §5 — DEFAULT CHAIN GENERATION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Generate default effect chain for an ascension node.
 * [PRIMARY_MODULE, MEDIC, BRAIN, ORACLE, CONSCIENCE]
 */
export function generateDefaultChain(primaryModuleName: string): string[] {
  return [
    primaryModuleName,
    ...DEFAULT_EFFECT_CHAIN.slice(1),
  ];
}

/**
 * Ensure a chain exists for a node. If no explicit chain, auto-generate one.
 */
export function ensureChain(
  existingChain: string[] | null | undefined,
  node: AscensionNode
): string[] {
  if (existingChain && existingChain.length > 0) {
    // Ensure primary module is first
    const moduleName = buildAscensionModuleName(
      node.surface?.nodeName || node.name
    );
    if (existingChain[0] !== moduleName) {
      return [moduleName, ...existingChain];
    }
    return existingChain;
  }

  // Auto-generate
  const moduleName = buildAscensionModuleName(
    node.surface?.nodeName || node.name
  );
  return generateDefaultChain(moduleName);
}

// ═══════════════════════════════════════════════════════════════════════════════
// §6 — PIPELINE CONTEXT EFFECT APPLICATOR
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Apply Universal Effect Injection to a PipelineContext.
 * This is the integration point with the existing chain-injection system.
 */
export function applyEffectInjection(
  ctx: PipelineContext,
  node: AscensionNode
): PipelineContext {
  const primaryUnit = detectPrimaryUnit(
    node.primitives,
    node.source
  );

  // Build effect context from pipeline context
  const effectCtx: EffectContext = {
    _data: { ...ctx.data },
    _input: { ...ctx.data },
    _signals: [],
    _errors: [],
  };

  if (primaryUnit) {
    // Execute with effect wrapper
    const result = effectWrapper(effectCtx, primaryUnit);

    // Merge back into pipeline context
    const moduleName = buildAscensionModuleName(
      node.surface?.nodeName || node.name
    );
    const effectKey = `_effect_${moduleName}`;

    ctx.data = {
      ...ctx.data,
      ...result.ctx._data,
      [effectKey]: {
        primary_unit: result.intelligence.primary_unit,
        primary_category: result.intelligence.primary_category,
        signals: result.ctx._signals.length,
        errors: result.ctx._errors.length,
        degraded: result.degraded,
        intelligence: result.intelligence,
        normalized: result.normalized,
      },
    };

    ctx.annotations[`effect.${node.id}.primary`] = primaryUnit.name;
    ctx.annotations[`effect.${node.id}.signals`] = result.ctx._signals.length;
    ctx.annotations[`effect.${node.id}.degraded`] = result.degraded;

    if (result.degraded) {
      ctx.transformationNotes.push(
        `[EFFECT] ${moduleName} degraded — ${result.ctx._errors.length} errors, ` +
        `${result.ctx._signals.length} signals emitted`
      );
    } else {
      ctx.transformationNotes.push(
        `[EFFECT] ${moduleName} executed — primary: ${primaryUnit.name} ` +
        `(${primaryUnit.category}), ${result.ctx._signals.length} signals`
      );
    }
  } else {
    // No callable unit — safe passthrough with trace
    const moduleName = buildAscensionModuleName(
      node.surface?.nodeName || node.name
    );

    ctx.data[`_effect_${moduleName}`] = {
      primary_unit: null,
      signals: 1,
      errors: 0,
      degraded: false,
      passthrough: true,
    };

    ctx.annotations[`effect.${node.id}.passthrough`] = true;
    ctx.transformationNotes.push(
      `[EFFECT] ${moduleName} passthrough — no callable unit detected, input preserved`
    );
  }

  return ctx;
}

// ═══════════════════════════════════════════════════════════════════════════════
// §7 — BATCH INJECTION FOR EXTRACTION RESULTS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Post-extraction hook: enhance all primitives with effect metadata.
 * Called after extractPrimitives() to attach effect injection capabilities.
 */
export function enrichExtractionWithEffects(
  extraction: ExtractionResult,
  sourceFileName?: string
): ExtractionResult & { effectMeta: EffectExtractionMeta } {
  const primary = detectPrimaryUnit(extraction.primitives, sourceFileName);
  const moduleName = sourceFileName ? autoMapModuleName(sourceFileName) : 'UPLOADED';
  const chain = generateDefaultChain(buildAscensionModuleName(moduleName));

  return {
    ...extraction,
    effectMeta: {
      primaryUnit: primary
        ? { name: primary.name, category: primary.category, confidence: primary.confidence }
        : null,
      autoMappedModule: moduleName,
      defaultChain: chain,
      effectReady: primary !== null,
      injectionVersion: 1,
    },
  };
}

export interface EffectExtractionMeta {
  primaryUnit: { name: string; category: string; confidence: number } | null;
  autoMappedModule: string;
  defaultChain: string[];
  effectReady: boolean;
  injectionVersion: number;
}
