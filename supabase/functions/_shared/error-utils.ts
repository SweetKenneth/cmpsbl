/**
 * Shared error handling utilities for edge functions
 */

/**
 * Safely extract error message from unknown error type
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'Unknown error occurred';
}

/**
 * Create a standardized error response
 */
export function createErrorResponse(
  error: unknown,
  status = 500,
  corsHeaders: Record<string, string> = {}
): Response {
  const message = getErrorMessage(error);
  console.error('Error:', message);
  return new Response(
    JSON.stringify({ error: message }),
    { 
      status, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}

/**
 * Type-safe null check - returns value or throws
 */
export function assertExists<T>(value: T | null | undefined, message = 'Value is required'): T {
  if (value === null || value === undefined) {
    throw new Error(message);
  }
  return value;
}
