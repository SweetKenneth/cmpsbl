/**
 * Error Boundary Telemetry — ship client errors to the database
 * Item #21: Track real-user crash rates
 */

import { supabase } from '@/integrations/supabase/client';

interface ErrorTelemetry {
  errorName: string;
  errorMessage: string;
  componentStack?: string;
  url?: string;
}

let errorQueue: ErrorTelemetry[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Report a client-side error to the telemetry system.
 * Batches errors and flushes every 5 seconds to avoid flooding.
 */
export function reportClientError(error: Error, componentStack?: string): void {
  errorQueue.push({
    errorName: error.name,
    errorMessage: error.message,
    componentStack: componentStack?.slice(0, 2000),
    url: typeof window !== 'undefined' ? window.location.href : undefined,
  });

  if (!flushTimer) {
    flushTimer = setTimeout(flushErrors, 5000);
  }
}

async function flushErrors(): Promise<void> {
  flushTimer = null;
  if (errorQueue.length === 0) return;

  const batch = errorQueue.splice(0, 20); // Max 20 per flush

  try {
    const { data: userData } = await supabase.auth.getUser();
    
    await supabase.from('client_error_log').insert(
      batch.map(e => ({
        error_name: e.errorName,
        error_message: e.errorMessage,
        component_stack: e.componentStack,
        url: e.url,
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
        user_id: userData?.user?.id ?? null,
        session_id: typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('session_id') : null,
      }))
    );
  } catch {
    // Silently fail — don't crash on telemetry failure
  }
}

/**
 * Global error handler — attach to window.onerror
 */
export function installGlobalErrorHandler(): void {
  if (typeof window === 'undefined') return;

  window.addEventListener('error', (event) => {
    reportClientError(
      event.error || new Error(event.message),
      `at ${event.filename}:${event.lineno}:${event.colno}`
    );
  });

  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason instanceof Error
      ? event.reason
      : new Error(String(event.reason));
    reportClientError(error, 'unhandled promise rejection');
  });
}
