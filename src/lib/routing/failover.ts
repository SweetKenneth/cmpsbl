/**
 * Failover Ladder — Structured retry + provider switch + degradation
 */

export type FailoverStep = 'retry_same' | 'switch_provider' | 'degrade_task';

export interface FailoverResult {
  step: FailoverStep;
  provider_id: string | null;
  degradation?: DegradationAction;
  attempt: number;
}

export type DegradationAction = 'summarize_context' | 'reduce_context' | 'lower_cost_model' | 'skip_tools';

export interface FailoverConfig {
  max_retries_same: number;
  fallback_providers: string[];
  degradation_order: DegradationAction[];
}

const DEFAULT_CONFIG: FailoverConfig = {
  max_retries_same: 1,
  fallback_providers: [],
  degradation_order: ['reduce_context', 'lower_cost_model', 'skip_tools'],
};

/** Walk the failover ladder for a given attempt number */
export function getFailoverAction(
  attempt: number,
  currentProvider: string,
  config: FailoverConfig = DEFAULT_CONFIG
): FailoverResult {
  // Step 1: Retry same provider (if transient)
  if (attempt <= config.max_retries_same) {
    return { step: 'retry_same', provider_id: currentProvider, attempt };
  }

  // Step 2: Switch provider
  const switchAttempt = attempt - config.max_retries_same - 1;
  if (switchAttempt < config.fallback_providers.length) {
    return {
      step: 'switch_provider',
      provider_id: config.fallback_providers[switchAttempt],
      attempt,
    };
  }

  // Step 3: Degrade task
  const degradeIndex = switchAttempt - config.fallback_providers.length;
  const degradation = config.degradation_order[Math.min(degradeIndex, config.degradation_order.length - 1)];
  return {
    step: 'degrade_task',
    provider_id: currentProvider,
    degradation,
    attempt,
  };
}

/** Check if we've exhausted all failover options */
export function isExhausted(attempt: number, config: FailoverConfig = DEFAULT_CONFIG): boolean {
  const totalSteps = config.max_retries_same + config.fallback_providers.length + config.degradation_order.length;
  return attempt > totalSteps;
}
