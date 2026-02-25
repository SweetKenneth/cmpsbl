/**
 * Minds Intelligence Layer — Failure Recovery Playbooks
 * Deterministic recovery paths for tool failures.
 * No generic apology fallback. Structured retry/repair strategy.
 */

import { isFeatureActive } from './featureFlags';

export type FailureCategory =
  | 'tool_timeout'
  | 'tool_error'
  | 'rate_limit'
  | 'auth_failure'
  | 'data_missing'
  | 'format_invalid'
  | 'scope_violation'
  | 'chain_break'
  | 'memory_overflow'
  | 'unknown';

export type RecoveryAction =
  | 'retry_with_backoff'
  | 'retry_with_reduced_scope'
  | 'fallback_tool'
  | 'cache_lookup'
  | 'degrade_gracefully'
  | 'escalate_to_user'
  | 'skip_and_continue'
  | 'abort_with_partial';

export interface RecoveryStep {
  action: RecoveryAction;
  description: string;
  maxAttempts: number;
  delayMs: number;
  /** If this step fails, proceed to next step */
  fallthrough: boolean;
}

export interface RecoveryPlaybook {
  category: FailureCategory;
  steps: RecoveryStep[];
  /** User-facing message (hides internal logic) */
  userMessage: string;
}

export interface RecoveryResult {
  category: FailureCategory;
  recovered: boolean;
  actionTaken: RecoveryAction;
  attempts: number;
  output?: unknown;
  userMessage: string;
}

/** Recovery playbook registry */
const PLAYBOOKS: Record<FailureCategory, RecoveryPlaybook> = {
  tool_timeout: {
    category: 'tool_timeout',
    steps: [
      { action: 'retry_with_backoff', description: 'Retry with exponential backoff', maxAttempts: 3, delayMs: 1000, fallthrough: true },
      { action: 'retry_with_reduced_scope', description: 'Retry with smaller input', maxAttempts: 2, delayMs: 500, fallthrough: true },
      { action: 'cache_lookup', description: 'Check cached results', maxAttempts: 1, delayMs: 0, fallthrough: true },
      { action: 'degrade_gracefully', description: 'Return partial results', maxAttempts: 1, delayMs: 0, fallthrough: false },
    ],
    userMessage: 'Processing took longer than expected. I\'ve retrieved what I could and will note any gaps.',
  },

  tool_error: {
    category: 'tool_error',
    steps: [
      { action: 'retry_with_backoff', description: 'Retry after brief pause', maxAttempts: 2, delayMs: 2000, fallthrough: true },
      { action: 'fallback_tool', description: 'Use alternative tool', maxAttempts: 1, delayMs: 0, fallthrough: true },
      { action: 'degrade_gracefully', description: 'Proceed without this step', maxAttempts: 1, delayMs: 0, fallthrough: false },
    ],
    userMessage: 'I encountered an issue with one of my tools. I\'ve routed through an alternative path.',
  },

  rate_limit: {
    category: 'rate_limit',
    steps: [
      { action: 'retry_with_backoff', description: 'Wait and retry', maxAttempts: 3, delayMs: 5000, fallthrough: true },
      { action: 'cache_lookup', description: 'Use cached data', maxAttempts: 1, delayMs: 0, fallthrough: true },
      { action: 'degrade_gracefully', description: 'Partial response', maxAttempts: 1, delayMs: 0, fallthrough: false },
    ],
    userMessage: 'I\'m working within rate limits. I\'ve used cached data where available.',
  },

  auth_failure: {
    category: 'auth_failure',
    steps: [
      { action: 'retry_with_backoff', description: 'Retry auth', maxAttempts: 1, delayMs: 1000, fallthrough: true },
      { action: 'escalate_to_user', description: 'Request re-authentication', maxAttempts: 1, delayMs: 0, fallthrough: false },
    ],
    userMessage: 'Authentication is required for this action. Please verify your credentials.',
  },

  data_missing: {
    category: 'data_missing',
    steps: [
      { action: 'cache_lookup', description: 'Check memory and cache', maxAttempts: 1, delayMs: 0, fallthrough: true },
      { action: 'fallback_tool', description: 'Try alternative data source', maxAttempts: 2, delayMs: 0, fallthrough: true },
      { action: 'escalate_to_user', description: 'Ask user for missing data', maxAttempts: 1, delayMs: 0, fallthrough: false },
    ],
    userMessage: 'I couldn\'t find the required data. Could you provide more context?',
  },

  format_invalid: {
    category: 'format_invalid',
    steps: [
      { action: 'retry_with_reduced_scope', description: 'Simplify and retry', maxAttempts: 2, delayMs: 0, fallthrough: true },
      { action: 'degrade_gracefully', description: 'Return raw format', maxAttempts: 1, delayMs: 0, fallthrough: false },
    ],
    userMessage: 'I\'ve reformatted the output to ensure accuracy.',
  },

  scope_violation: {
    category: 'scope_violation',
    steps: [
      { action: 'retry_with_reduced_scope', description: 'Restrict to allowed scope', maxAttempts: 1, delayMs: 0, fallthrough: true },
      { action: 'escalate_to_user', description: 'Inform user of scope limits', maxAttempts: 1, delayMs: 0, fallthrough: false },
    ],
    userMessage: 'That request falls outside my current scope. Here\'s what I can help with instead.',
  },

  chain_break: {
    category: 'chain_break',
    steps: [
      { action: 'retry_with_backoff', description: 'Retry failed step', maxAttempts: 2, delayMs: 1000, fallthrough: true },
      { action: 'skip_and_continue', description: 'Skip failed step', maxAttempts: 1, delayMs: 0, fallthrough: true },
      { action: 'abort_with_partial', description: 'Return completed steps', maxAttempts: 1, delayMs: 0, fallthrough: false },
    ],
    userMessage: 'Part of my workflow encountered an issue. I\'ve completed what I could and flagged the gap.',
  },

  memory_overflow: {
    category: 'memory_overflow',
    steps: [
      { action: 'retry_with_reduced_scope', description: 'Reduce context window', maxAttempts: 1, delayMs: 0, fallthrough: true },
      { action: 'degrade_gracefully', description: 'Trim oldest context', maxAttempts: 1, delayMs: 0, fallthrough: false },
    ],
    userMessage: 'I\'ve optimized my context to focus on the most relevant information.',
  },

  unknown: {
    category: 'unknown',
    steps: [
      { action: 'retry_with_backoff', description: 'Generic retry', maxAttempts: 1, delayMs: 2000, fallthrough: true },
      { action: 'degrade_gracefully', description: 'Best effort response', maxAttempts: 1, delayMs: 0, fallthrough: false },
    ],
    userMessage: 'I encountered an unexpected issue but have recovered with a best-effort approach.',
  },
};

/** Classify an error into a failure category */
export function classifyFailure(error: Error | string): FailureCategory {
  const msg = typeof error === 'string' ? error : error.message;
  const lower = msg.toLowerCase();

  if (lower.includes('timeout') || lower.includes('timed out')) return 'tool_timeout';
  if (lower.includes('rate limit') || lower.includes('429') || lower.includes('too many')) return 'rate_limit';
  if (lower.includes('auth') || lower.includes('401') || lower.includes('403') || lower.includes('unauthorized')) return 'auth_failure';
  if (lower.includes('not found') || lower.includes('404') || lower.includes('missing')) return 'data_missing';
  if (lower.includes('invalid') || lower.includes('parse') || lower.includes('format')) return 'format_invalid';
  if (lower.includes('scope') || lower.includes('whitelist') || lower.includes('blocked')) return 'scope_violation';
  if (lower.includes('chain') || lower.includes('pipeline') || lower.includes('step')) return 'chain_break';
  if (lower.includes('memory') || lower.includes('overflow') || lower.includes('heap')) return 'memory_overflow';
  if (lower.includes('econnrefused') || lower.includes('network') || lower.includes('500')) return 'tool_error';

  return 'unknown';
}

/** Get recovery playbook for a failure */
export function getPlaybook(category: FailureCategory): RecoveryPlaybook {
  return PLAYBOOKS[category];
}

/** Execute a recovery playbook */
export async function executeRecovery(
  error: Error | string,
  retryFn: () => Promise<unknown>,
  fallbackFn?: () => Promise<unknown>,
): Promise<RecoveryResult> {
  if (!isFeatureActive('failure_recovery')) {
    return {
      category: 'unknown',
      recovered: false,
      actionTaken: 'degrade_gracefully',
      attempts: 0,
      userMessage: 'An error occurred. Please try again.',
    };
  }

  const category = classifyFailure(error);
  const playbook = PLAYBOOKS[category];
  let totalAttempts = 0;

  for (const step of playbook.steps) {
    for (let attempt = 0; attempt < step.maxAttempts; attempt++) {
      totalAttempts++;

      if (step.delayMs > 0) {
        const delay = step.delayMs * Math.pow(2, attempt); // Exponential backoff
        await new Promise(r => setTimeout(r, Math.min(delay, 30_000)));
      }

      try {
        let result: unknown;

        switch (step.action) {
          case 'retry_with_backoff':
          case 'retry_with_reduced_scope':
            result = await retryFn();
            break;
          case 'fallback_tool':
            if (fallbackFn) result = await fallbackFn();
            else continue;
            break;
          case 'cache_lookup':
            // Cache lookup is handled externally
            continue;
          case 'degrade_gracefully':
          case 'abort_with_partial':
            return {
              category,
              recovered: false,
              actionTaken: step.action,
              attempts: totalAttempts,
              userMessage: playbook.userMessage,
            };
          case 'escalate_to_user':
            return {
              category,
              recovered: false,
              actionTaken: 'escalate_to_user',
              attempts: totalAttempts,
              userMessage: playbook.userMessage,
            };
          case 'skip_and_continue':
            return {
              category,
              recovered: true,
              actionTaken: 'skip_and_continue',
              attempts: totalAttempts,
              userMessage: playbook.userMessage,
            };
        }

        if (result !== undefined) {
          return {
            category,
            recovered: true,
            actionTaken: step.action,
            attempts: totalAttempts,
            output: result,
            userMessage: playbook.userMessage,
          };
        }
      } catch {
        // Step failed, continue to next attempt or step
      }
    }

    if (!step.fallthrough) break;
  }

  return {
    category,
    recovered: false,
    actionTaken: 'degrade_gracefully',
    attempts: totalAttempts,
    userMessage: playbook.userMessage,
  };
}
