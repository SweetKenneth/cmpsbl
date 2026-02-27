/**
 * Standardized Error System
 * Production-grade error handling with redaction
 */

import { generateTraceId } from './trace';
import { redactSecrets } from '@/lib/defense/redact';

export type ErrorCode = 
  | 'NETWORK_ERROR'
  | 'TIMEOUT_ERROR'
  | 'AUTH_ERROR'
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'RATE_LIMITED'
  | 'CIRCUIT_OPEN'
  | 'GOVERNANCE_BLOCKED'
  | 'MODULE_ERROR'
  | 'INTERNAL_ERROR'
  | 'UNKNOWN_ERROR';

export interface AppError {
  code: ErrorCode;
  message: string;
  safe_message: string;
  trace_id: string;
  meta_redacted: Record<string, unknown>;
  retryable: boolean;
  timestamp: string;
}

const SAFE_MESSAGES: Record<ErrorCode, string> = {
  NETWORK_ERROR: 'Network connection failed. Please check your connection.',
  TIMEOUT_ERROR: 'Request timed out. Please try again.',
  AUTH_ERROR: 'Authentication required. Please sign in.',
  VALIDATION_ERROR: 'Invalid input. Please check your data.',
  NOT_FOUND: 'Resource not found.',
  RATE_LIMITED: 'Too many requests. Please wait and try again.',
  CIRCUIT_OPEN: 'Service temporarily unavailable. Auto-recovery in progress.',
  GOVERNANCE_BLOCKED: 'Action blocked by governance policy.',
  MODULE_ERROR: 'Module operation failed.',
  INTERNAL_ERROR: 'An internal error occurred.',
  UNKNOWN_ERROR: 'An unexpected error occurred.',
};

const RETRYABLE_CODES: ErrorCode[] = [
  'NETWORK_ERROR',
  'TIMEOUT_ERROR',
  'RATE_LIMITED',
];

export function createAppError(
  code: ErrorCode,
  message: string,
  meta?: Record<string, unknown>,
  traceId?: string
): AppError {
  return {
    code,
    message,
    safe_message: SAFE_MESSAGES[code] || SAFE_MESSAGES.UNKNOWN_ERROR,
    trace_id: traceId || generateTraceId(),
    meta_redacted: redactSecrets(meta || {}),
    retryable: RETRYABLE_CODES.includes(code),
    timestamp: new Date().toISOString(),
  };
}

export function fromError(
  error: unknown,
  fallbackCode: ErrorCode = 'UNKNOWN_ERROR',
  traceId?: string
): AppError {
  if (isAppError(error)) {
    return error;
  }

  if (error instanceof Error) {
    const code = inferErrorCode(error);
    return createAppError(code, error.message, { stack: error.stack }, traceId);
  }

  return createAppError(fallbackCode, String(error), {}, traceId);
}

export function isAppError(value: unknown): value is AppError {
  return (
    typeof value === 'object' &&
    value !== null &&
    'code' in value &&
    'trace_id' in value &&
    'safe_message' in value
  );
}

function inferErrorCode(error: Error): ErrorCode {
  const message = error.message.toLowerCase();
  const name = error.name.toLowerCase();

  if (message.includes('network') || message.includes('fetch') || name.includes('network')) {
    return 'NETWORK_ERROR';
  }
  if (message.includes('timeout') || message.includes('timed out')) {
    return 'TIMEOUT_ERROR';
  }
  if (message.includes('401') || message.includes('unauthorized') || message.includes('auth')) {
    return 'AUTH_ERROR';
  }
  if (message.includes('404') || message.includes('not found')) {
    return 'NOT_FOUND';
  }
  if (message.includes('429') || message.includes('rate limit')) {
    return 'RATE_LIMITED';
  }
  if (message.includes('validation') || message.includes('invalid')) {
    return 'VALIDATION_ERROR';
  }
  if (message.includes('5') && /\b5\d{2}\b/.test(message)) {
    return 'INTERNAL_ERROR';
  }

  return 'UNKNOWN_ERROR';
}

export function isRetryableError(error: unknown): boolean {
  if (isAppError(error)) {
    return error.retryable;
  }
  if (error instanceof Error) {
    const code = inferErrorCode(error);
    return RETRYABLE_CODES.includes(code);
  }
  return false;
}

export function formatErrorForUI(error: AppError): { title: string; description: string; traceId: string } {
  return {
    title: error.safe_message,
    description: `Trace: ${error.trace_id}`,
    traceId: error.trace_id,
  };
}
