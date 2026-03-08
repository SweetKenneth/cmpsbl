/**
 * Failure Classifier — Determines which failures count toward breaker trips
 */

export type FailureClass = 'countable' | 'ignorable';

export interface ClassifiedFailure {
  class: FailureClass;
  category: 'timeout' | 'server_error' | 'network' | 'bad_input' | 'validation' | 'unknown';
  message: string;
  status_code?: number;
}

/** Classify a failure for circuit breaker accounting */
export function classifyFailure(error: unknown): ClassifiedFailure {
  const msg = error instanceof Error ? error.message : String(error);
  const lower = msg.toLowerCase();

  // Timeouts → countable
  if (lower.includes('timeout') || lower.includes('timed out')) {
    return { class: 'countable', category: 'timeout', message: msg };
  }

  // Network errors → countable
  if (lower.includes('network') || lower.includes('fetch failed') || lower.includes('econnrefused') || lower.includes('dns')) {
    return { class: 'countable', category: 'network', message: msg };
  }

  // Extract status code if present
  const statusMatch = msg.match(/(\d{3})/);
  const status = statusMatch ? parseInt(statusMatch[1]) : undefined;

  // 5xx → countable
  if (status && status >= 500) {
    return { class: 'countable', category: 'server_error', message: msg, status_code: status };
  }

  // 4xx → ignorable (bad input, not service failure)
  if (status && status >= 400 && status < 500) {
    return { class: 'ignorable', category: 'bad_input', message: msg, status_code: status };
  }

  // Validation errors → ignorable
  if (lower.includes('validation') || lower.includes('invalid') || lower.includes('required field')) {
    return { class: 'ignorable', category: 'validation', message: msg };
  }

  // Default: countable (fail safe)
  return { class: 'countable', category: 'unknown', message: msg };
}
