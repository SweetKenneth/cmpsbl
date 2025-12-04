/**
 * Shared error handling utilities for edge functions
 */

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'Unknown error';
}

export function createErrorResponse(error: unknown, corsHeaders: Record<string, string>, status = 500): Response {
  return new Response(
    JSON.stringify({ error: getErrorMessage(error) }),
    { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
