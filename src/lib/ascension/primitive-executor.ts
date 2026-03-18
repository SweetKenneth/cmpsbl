/**
 * CMPSBL® Primitive Executor
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Executes registered primitives with handler → fallback resolution,
 * structured error reporting, and timing telemetry.
 *
 * © CMPSBL® — All rights reserved.
 */

import { getPrimitive } from './primitive-registry';

export interface PrimitiveExecutionResult {
  success: boolean;
  name: string;
  output: unknown;
  source?: string;
  usedFallback: boolean;
  durationMs: number;
  error?: string;
}

/**
 * Execute a named primitive with input and optional context.
 * Resolves handler → fallback → error in that order.
 */
export async function executePrimitive(
  name: string,
  input: unknown,
  context?: unknown
): Promise<PrimitiveExecutionResult> {
  const start = performance.now();
  const primitive = getPrimitive(name);

  if (!primitive) {
    return {
      success: false,
      name,
      output: null,
      usedFallback: false,
      durationMs: performance.now() - start,
      error: 'primitive_not_found',
    };
  }

  // Try primary handler
  if (primitive.handler) {
    try {
      const output = await primitive.handler(input, context);
      return {
        success: true,
        name,
        output,
        source: primitive.source,
        usedFallback: false,
        durationMs: performance.now() - start,
      };
    } catch (err: unknown) {
      // Primary failed — try fallback
      if (primitive.fallback) {
        try {
          const output = await primitive.fallback(input, context);
          return {
            success: true,
            name,
            output,
            source: primitive.source,
            usedFallback: true,
            durationMs: performance.now() - start,
          };
        } catch (fbErr: unknown) {
          return {
            success: false,
            name,
            output: null,
            source: primitive.source,
            usedFallback: true,
            durationMs: performance.now() - start,
            error: `handler_and_fallback_failed: ${(err as Error)?.message ?? err}; fallback: ${(fbErr as Error)?.message ?? fbErr}`,
          };
        }
      }

      return {
        success: false,
        name,
        output: null,
        source: primitive.source,
        usedFallback: false,
        durationMs: performance.now() - start,
        error: `execution_failed: ${(err as Error)?.message ?? err}`,
      };
    }
  }

  // No primary handler — try fallback only
  if (primitive.fallback) {
    try {
      const output = await primitive.fallback(input, context);
      return {
        success: true,
        name,
        output,
        source: primitive.source,
        usedFallback: true,
        durationMs: performance.now() - start,
      };
    } catch (err: unknown) {
      return {
        success: false,
        name,
        output: null,
        source: primitive.source,
        usedFallback: true,
        durationMs: performance.now() - start,
        error: `fallback_failed: ${(err as Error)?.message ?? err}`,
      };
    }
  }

  return {
    success: false,
    name,
    output: null,
    source: primitive.source,
    usedFallback: false,
    durationMs: performance.now() - start,
    error: 'no_handler',
  };
}

/**
 * Execute multiple primitives in sequence, collecting all results.
 */
export async function executePrimitiveBatch(
  names: string[],
  input: unknown,
  context?: unknown
): Promise<PrimitiveExecutionResult[]> {
  const results: PrimitiveExecutionResult[] = [];
  for (const name of names) {
    results.push(await executePrimitive(name, input, context));
  }
  return results;
}
