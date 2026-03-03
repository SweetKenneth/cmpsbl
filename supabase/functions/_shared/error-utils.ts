/**
 * Shared Error Utilities for Edge Functions
 * ──────────────────────────────────────────
 * Consolidated from error-handler.ts, error-utils.ts, and fix-catch-blocks.ts.
 * Single canonical source for error helpers across all edge functions.
 */

/** Safely extract error message from unknown error type */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'Unknown error occurred';
}

/** Log error with context prefix */
export function logError(context: string, error: unknown): void {
  console.error(`[${context}]`, getErrorMessage(error), error);
}

/** Create a standardized JSON error response */
export function createErrorResponse(
  error: unknown,
  corsHeaders: Record<string, string> = {},
  status = 500,
): Response {
  const message = getErrorMessage(error);
  console.error('Error:', message);
  return new Response(
    JSON.stringify({ error: message }),
    { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
  );
}

/** Type-safe null check — returns value or throws */
export function assertExists<T>(value: T | null | undefined, message = 'Value is required'): T {
  if (value === null || value === undefined) throw new Error(message);
  return value;
}
