/**
 * Global Error Recovery UX Layer
 * Intercepts fetch/supabase errors and provides actionable recovery paths.
 * Emits rate-limit events to the UI layer.
 */

import { emitRateLimitEvent } from '@/components/ui/RateLimitFeedback';
import { toast } from 'sonner';

// ═══════════════════════════════════════════════════════════════════════════════
// §1 — Fetch Interceptor (patches global fetch for 429/5xx detection)
// ═══════════════════════════════════════════════════════════════════════════════

let installed = false;

export function installGlobalErrorRecovery(): () => void {
  if (installed) return () => {};
  installed = true;

  const originalFetch = window.fetch.bind(window);

  window.fetch = async (...args: Parameters<typeof fetch>): Promise<Response> => {
    try {
      const response = await originalFetch(...args);

      // Rate limit detection
      if (response.status === 429) {
        const retryAfter = parseInt(response.headers.get('retry-after') || '30', 10);
        const url = typeof args[0] === 'string' ? args[0] : (args[0] as Request).url;
        const endpoint = extractEndpointName(url);
        emitRateLimitEvent({ endpoint, retryAfter });
      }

      // Server error with recovery suggestion
      if (response.status >= 500 && response.status < 600) {
        const url = typeof args[0] === 'string' ? args[0] : (args[0] as Request).url;
        const endpoint = extractEndpointName(url);
        toast.error('Server Error', {
          description: `${endpoint} returned ${response.status}. The system will retry automatically.`,
          duration: 5000,
        });
      }

      return response;
    } catch (error) {
      // Network failure recovery
      if (error instanceof TypeError && error.message.includes('fetch')) {
        toast.error('Connection Lost', {
          description: 'Unable to reach the server. Check your internet connection.',
          duration: 6000,
        });
      }
      throw error;
    }
  };

  return () => {
    window.fetch = originalFetch;
    installed = false;
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// §2 — Endpoint Name Extraction (human-readable)
// ═══════════════════════════════════════════════════════════════════════════════

function extractEndpointName(url: string): string {
  try {
    const parsed = new URL(url, window.location.origin);
    const path = parsed.pathname;

    // Supabase edge functions
    const fnMatch = path.match(/\/functions\/v1\/([^/?]+)/);
    if (fnMatch) return fnMatch[1];

    // Supabase REST
    if (path.includes('/rest/v1/')) {
      const table = path.split('/rest/v1/')[1]?.split('?')[0];
      if (table) return table;
    }

    // Last path segment
    const segments = path.split('/').filter(Boolean);
    return segments[segments.length - 1] || 'API';
  } catch {
    return 'API';
  }
}
