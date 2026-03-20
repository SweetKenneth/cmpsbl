/**
 * CMPSBL® Execution Binding Layer (v2)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Resolves detected primary units to real execution paths:
 *   local → bridge → fallback
 *
 * Sits between primitive detection and effect injection.
 * Reuses existing runtime bridge infrastructure.
 *
 * © CMPSBL® — All rights reserved.
 */

import { primitiveExecutorSync, getRuntimeMode } from './primitive-executor-bridge';
import { getPrimitive } from './primitive-registry';

// ═══════════════════════════════════════════════════════════════════════════════
// §1 — TYPES
// ═══════════════════════════════════════════════════════════════════════════════

/** The three execution strategies — no more, no less. */
export type ExecutionStrategy = 'local' | 'bridge' | 'fallback';

/** Extended primary unit with executable hints (v2). */
export interface ExecutableUnit {
  /** Original detection fields */
  name: string;
  category: string;
  confidence: number;
  complexity: number;

  /** v2 executable hints */
  executionKind: 'function' | 'class' | 'module' | 'entry' | 'unknown';
  callableSymbol: string | null;
  sourceLanguage: string;
  directlyExecutable: boolean;
  requiresBridge: boolean;
  fallbackOnly: boolean;
}

/** Strategy resolution result */
export interface StrategyResolution {
  strategy: ExecutionStrategy;
  reason: string;
  bridgeAvailable: boolean;
  localHandlerAvailable: boolean;
}

/** Canonical normalized execution result — the single truth record. */
export interface ExecutionBindingResult {
  success: boolean;
  executed: boolean;
  degraded: boolean;
  strategy: ExecutionStrategy;
  primaryUnit: string;
  primaryCategory: string;
  rawResult: unknown;
  normalizedResult: Record<string, unknown>;
  signals: Array<{ type: string; source: string; duration_ms: number; status: string; ts: number; error?: string }>;
  errors: Array<{ type: string; message: string }>;
  timingMs: number;
  intelligence: {
    input_size: number;
    output_size: number;
    execution_density: number;
  };
  fallbackReason: string | null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// §2 — LANGUAGE → STRATEGY RESOLVER
// ═══════════════════════════════════════════════════════════════════════════════

/** Languages the TypeScript runtime can execute directly */
const LOCAL_LANGUAGES = new Set([
  'typescript', 'javascript', 'ts', 'js', 'tsx', 'jsx',
]);

/** Languages with a known runtime bridge path */
const BRIDGE_LANGUAGES = new Set([
  'php', 'python', 'ruby', 'go', 'rust', 'java', 'kotlin',
  'swift', 'csharp', 'c#', 'cpp', 'c++', 'c',
]);

/**
 * Single resolver: language + unit traits → execution strategy.
 * No scattered business logic — one place, one decision.
 */
export function resolveExecutionStrategy(unit: ExecutableUnit): StrategyResolution {
  const lang = unit.sourceLanguage.toLowerCase();
  const hasLocalHandler = getPrimitive(unit.name) !== undefined;
  const hasBridge = BRIDGE_LANGUAGES.has(lang) || getRuntimeMode() !== 'offline';

  // Rule 1: If we have a registered local handler, always prefer local
  if (hasLocalHandler && unit.directlyExecutable) {
    return {
      strategy: 'local',
      reason: `Local handler registered for "${unit.name}"`,
      bridgeAvailable: hasBridge,
      localHandlerAvailable: true,
    };
  }

  // Rule 2: TypeScript/JavaScript units are local-capable
  if (LOCAL_LANGUAGES.has(lang) && unit.directlyExecutable) {
    return {
      strategy: 'local',
      reason: `Source language "${lang}" is natively executable`,
      bridgeAvailable: hasBridge,
      localHandlerAvailable: hasLocalHandler,
    };
  }

  // Rule 3: Bridge languages with a live runtime bridge
  if (BRIDGE_LANGUAGES.has(lang) && hasBridge && !unit.fallbackOnly) {
    return {
      strategy: 'bridge',
      reason: `Bridge available for "${lang}" via runtime`,
      bridgeAvailable: true,
      localHandlerAvailable: hasLocalHandler,
    };
  }

  // Rule 4: Fallback — honest about it
  return {
    strategy: 'fallback',
    reason: unit.fallbackOnly
      ? `Unit "${unit.name}" marked fallback-only (no safe invocation path)`
      : `No local handler or bridge for "${lang}"`,
    bridgeAvailable: false,
    localHandlerAvailable: hasLocalHandler,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// §3 — EXECUTION BINDING
// ═══════════════════════════════════════════════════════════════════════════════

function safeStringify(val: unknown): string {
  try { return JSON.stringify(val ?? {}); }
  catch { return '{}'; }
}

/**
 * Bind and execute a detected primary unit through the resolved strategy.
 * Returns a fully normalized, truthful execution record.
 */
export function bindAndExecute(
  unit: ExecutableUnit,
  inputData: Record<string, unknown>
): ExecutionBindingResult {
  const start = performance.now();
  const resolution = resolveExecutionStrategy(unit);
  const signals: ExecutionBindingResult['signals'] = [];
  const errors: ExecutionBindingResult['errors'] = [];
  let rawResult: unknown = null;
  let executed = false;
  let degraded = false;
  let success = false;

  // ── LOCAL EXECUTION ──
  if (resolution.strategy === 'local') {
    try {
      const localResult = primitiveExecutorSync(unit.name, inputData, unit.confidence);
      // Check signal for truthfulness — executor's own fallback is not real execution
      const wasTrulyExecuted = !localResult.signal.endsWith('_fallback') && localResult.signal !== 'fallback';
      rawResult = localResult.data;
      executed = wasTrulyExecuted;
      success = true;
      degraded = !wasTrulyExecuted;
      signals.push({
        type: wasTrulyExecuted ? 'execution' : 'fallback',
        source: unit.name,
        duration_ms: round3(performance.now() - start),
        status: 'success',
        ts: Date.now(),
      });
      if (!wasTrulyExecuted) {
        errors.push({ type: 'local_executor_fallback', message: `Local executor used internal fallback for "${unit.name}"` });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push({ type: 'local_execution_error', message: msg });
      signals.push({
        type: 'execution',
        source: unit.name,
        duration_ms: round3(performance.now() - start),
        status: 'failed',
        error: msg,
        ts: Date.now(),
      });
      degraded = true;
      executed = false;
    }
  }

  // ── BRIDGE EXECUTION ──
  if (resolution.strategy === 'bridge') {
    try {
      // Use the existing sync bridge path which delegates to registry
      const bridgeResult = primitiveExecutorSync(unit.name, inputData, unit.confidence);
      rawResult = bridgeResult.data;
      executed = true;
      success = true;
      signals.push({
        type: 'execution',
        source: unit.name,
        duration_ms: round3(performance.now() - start),
        status: 'success',
        ts: Date.now(),
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push({ type: 'bridge_execution_error', message: msg });
      signals.push({
        type: 'execution',
        source: unit.name,
        duration_ms: round3(performance.now() - start),
        status: 'failed',
        error: msg,
        ts: Date.now(),
      });
      degraded = true;
      executed = false;
    }
  }

  // ── FALLBACK PASSTHROUGH ──
  if (resolution.strategy === 'fallback' || (degraded && !executed)) {
    rawResult = inputData;
    executed = false;
    success = true; // passthrough always "succeeds" in the pipeline sense
    degraded = resolution.strategy !== 'fallback' ? true : false;
    signals.push({
      type: 'passthrough',
      source: unit.name,
      duration_ms: round3(performance.now() - start),
      status: 'success',
      ts: Date.now(),
    });
  }

  const timingMs = round3(performance.now() - start);
  const inputStr = safeStringify(inputData);
  const outputStr = safeStringify(rawResult);

  const normalizedResult: Record<string, unknown> = {
    result: rawResult,
    success: errors.length === 0,
    executed,
    strategy: resolution.strategy,
  };

  return {
    success,
    executed,
    degraded,
    strategy: resolution.strategy,
    primaryUnit: unit.name,
    primaryCategory: unit.category,
    rawResult,
    normalizedResult,
    signals,
    errors,
    timingMs,
    intelligence: {
      input_size: inputStr.length,
      output_size: outputStr.length,
      execution_density: signals.length,
    },
    fallbackReason: !executed ? resolution.reason : null,
  };
}

function round3(n: number): number {
  return Math.round(n * 1000) / 1000;
}

// ═══════════════════════════════════════════════════════════════════════════════
// §4 — EXECUTABLE UNIT BUILDER
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Build an ExecutableUnit from an ExtractedPrimitive with execution hints.
 * Compatible extension of v1 PrimaryExecutionUnit — adds fields, breaks nothing.
 */
export function buildExecutableUnit(
  primitive: {
    name: string;
    category: string;
    confidence: number;
    complexity: number;
    extractionMethod: string;
    canonicalName?: string;
    language?: string;
  },
  sourceLanguage: string
): ExecutableUnit {
  const lang = sourceLanguage.toLowerCase();
  const isLocal = LOCAL_LANGUAGES.has(lang);
  const isBridge = BRIDGE_LANGUAGES.has(lang);
  const hasHandler = getPrimitive(primitive.name) !== undefined;

  const executionKind = mapExtractionKind(primitive.extractionMethod);
  const directlyExecutable = isLocal || hasHandler;
  const requiresBridge = isBridge && !hasHandler;
  const fallbackOnly = !directlyExecutable && !requiresBridge;

  return {
    name: primitive.name,
    category: primitive.category,
    confidence: primitive.confidence,
    complexity: primitive.complexity,
    executionKind,
    callableSymbol: primitive.canonicalName || primitive.name,
    sourceLanguage,
    directlyExecutable,
    requiresBridge,
    fallbackOnly,
  };
}

function mapExtractionKind(method: string): ExecutableUnit['executionKind'] {
  switch (method) {
    case 'function': return 'function';
    case 'class': return 'class';
    case 'module': return 'module';
    default: return 'unknown';
  }
}
