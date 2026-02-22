/**
 * Evolution Mesh — Core Wrapper
 * The main primitive. Wraps any async function with immune defense.
 * 
 * Usage:
 *   const safe = wrap(myHandler, { schema: defineSchema({ ... }) });
 *   const result = await safe({ email: 'test@test.com' });
 */

import { getConfig } from '../config';
import { validateInput } from '../schema/validator';
import { isRepairable } from '../schema/archetypes';
import { deterministicRepair, getRepairStats as _getRepairStats } from '../repair/deterministic';
import { recordOutcome, getMetrics } from '../telemetry/tracker';
import { applyRule, findRulesForFunction } from '../learning/rules';
import type { ExecutorSchema } from '../schema/types';

export interface WrapConfig {
  /** Schema for input validation */
  schema?: ExecutorSchema;
  /** Function identifier (auto-generated if not provided) */
  name?: string;
  /** Category for cross-function learning grouping */
  category?: string;
  /** Custom safe-fail response */
  onSafeFail?: (error: string, input: Record<string, unknown>) => any;
}

export type WrappedFunction<TInput = Record<string, unknown>, TOutput = any> = 
  (input: TInput) => Promise<TOutput>;

let wrapCounter = 0;

/**
 * Wrap any async function with the Evolution Mesh immune layer.
 */
export function wrap<TInput extends Record<string, unknown> = Record<string, unknown>, TOutput = any>(
  fn: (input: TInput) => Promise<TOutput>,
  config?: WrapConfig,
): WrappedFunction<TInput, TOutput> {
  const meshConfig = getConfig();
  const fnName = config?.name ?? `fn_${++wrapCounter}`;
  const category = config?.category ?? 'general';
  const logger = meshConfig.logger ?? console;

  return async (input: TInput): Promise<TOutput> => {
    // If mesh disabled, passthrough
    if (!meshConfig.enabled) {
      return fn(input);
    }

    const startTime = performance.now();

    // ── PREFLIGHT: Validate input ──
    const report = validateInput(config?.schema, input as Record<string, unknown>);

    if (!report.valid) {
      // Check if archetype is repairable
      if (!isRepairable(report.archetype)) {
        // Garbage input — safe-fail immediately
        const errorMsg = `[evolution-mesh] Safe-fail (${report.archetype}): ${report.issues.map(i => `${i.field}: ${i.issue}`).join(', ')}`;
        logger.warn(errorMsg);
        recordOutcome(fnName, 'safe_fail', performance.now() - startTime, {
          archetype: report.archetype,
          repairAttempted: false,
        });

        if (config?.onSafeFail) {
          return config.onSafeFail(errorMsg, input as Record<string, unknown>) as TOutput;
        }
        throw new Error(errorMsg);
      }

      // Repairable — attempt deterministic repair
      const repairResult = deterministicRepair(input as Record<string, unknown>);
      
      if (repairResult.repaired) {
        // Check learned rules for additional fixes
        const rules = findRulesForFunction(fnName, category);
        let repairedInput = repairResult.repaired_input as TInput;
        
        for (const rule of rules) {
          const ruleResult = applyRule(rule, repairedInput as Record<string, unknown>);
          if (ruleResult.applied) {
            repairedInput = ruleResult.output as TInput;
          }
        }

        try {
          const result = await fn(repairedInput);
          recordOutcome(fnName, 'repaired_success', performance.now() - startTime, {
            archetype: report.archetype,
            repairType: repairResult.repair_type,
            repairAttempted: true,
          });
          return result;
        } catch (retryErr) {
          // Repair didn't help — safe-fail
          const errorMsg = retryErr instanceof Error ? retryErr.message : 'unknown';
          logger.warn(`[evolution-mesh] Repair failed for ${fnName}: ${errorMsg}`);
          recordOutcome(fnName, 'safe_fail', performance.now() - startTime, {
            archetype: report.archetype,
            repairAttempted: true,
            repairType: repairResult.repair_type,
          });

          if (config?.onSafeFail) {
            return config.onSafeFail(errorMsg, input as Record<string, unknown>) as TOutput;
          }
          throw new Error(`[evolution-mesh] Safe-fail after repair: ${errorMsg}`);
        }
      }

      // No repair strategy found — safe-fail
      const errorMsg = `[evolution-mesh] No repair for ${report.archetype}`;
      recordOutcome(fnName, 'safe_fail', performance.now() - startTime, {
        archetype: report.archetype,
        repairAttempted: false,
      });
      if (config?.onSafeFail) {
        return config.onSafeFail(errorMsg, input as Record<string, unknown>) as TOutput;
      }
      throw new Error(errorMsg);
    }

    // ── EXECUTE: Input is valid ──
    try {
      const result = await fn(input);
      recordOutcome(fnName, 'success', performance.now() - startTime, {
        archetype: 'well_formed',
        repairAttempted: false,
      });
      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'unknown execution error';

      // Re-validate to check if repair might help
      const reReport = validateInput(config?.schema, input as Record<string, unknown>);
      if (isRepairable(reReport.archetype)) {
        const repairResult = deterministicRepair(input as Record<string, unknown>);
        if (repairResult.repaired) {
          try {
            const result = await fn(repairResult.repaired_input as TInput);
            recordOutcome(fnName, 'repaired_success', performance.now() - startTime, {
              archetype: reReport.archetype,
              repairType: repairResult.repair_type,
              repairAttempted: true,
            });
            return result;
          } catch {
            // Fall through to escalation
          }
        }
      }

      // Escalate — log and throw
      logger.error(`[evolution-mesh] Escalation for ${fnName}: ${errorMsg}`);
      recordOutcome(fnName, 'escalated', performance.now() - startTime, {
        archetype: reReport.archetype,
        repairAttempted: true,
        error: errorMsg,
      });
      throw err;
    }
  };
}
