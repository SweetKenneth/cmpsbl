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

      // Rate limit detection — only surface for user-initiated requests
      if (response.status === 429) {
        const url = typeof args[0] === 'string' ? args[0] : (args[0] as Request).url;
        if (!isBackgroundRequest(url)) {
          const retryAfter = parseInt(response.headers.get('retry-after') || '30', 10);
          const endpoint = extractEndpointName(url);
          emitRateLimitEvent({ endpoint, retryAfter });
        }
      }

      // Server error — only surface to user for non-background requests
      if (response.status >= 500 && response.status < 600) {
        const url = typeof args[0] === 'string' ? args[0] : (args[0] as Request).url;
        if (!isBackgroundRequest(url)) {
          const endpoint = extractEndpointName(url);
          toast.error('Server Error', {
            description: `${endpoint} returned ${response.status}. The system will retry automatically.`,
            duration: 5000,
          });
        }
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

/**
 * Detect background/polling requests that should never surface errors to users.
 * Only user-initiated actions (explicit button clicks, form submissions) should show toasts.
 */
function isBackgroundRequest(url: string): boolean {
  const backgroundPatterns = [
    '/functions/v1/pf-substrate',       // Substrate status polling
    '/functions/v1/pf-radio-broadcast', // Radio broadcast generation
    '/functions/v1/radio-dj-tts',       // Radio TTS
    '/rest/v1/brain_maintenance_log',   // Neural maintenance
    '/rest/v1/brain_embeddings',        // Embedding sync
    '/rest/v1/brain_knowledge_crystals',// Crystal sync
    '/rest/v1/brain_classifier_models', // Classifier polling
    '/rest/v1/brain_reasoning_traces',  // Trace polling
    '/rest/v1/defense_events',          // Defense telemetry
    '/rest/v1/site_page_views',         // Analytics
    '/rest/v1/site_sessions',           // Session tracking
    '/rest/v1/analytics_events',        // Analytics events
    '/rest/v1/rpc/brain_',              // Brain RPCs
    '/rest/v1/rpc/run_memory_tiering',  // Memory tiering
    '/rest/v1/rpc/apply_confidence_decay', // Confidence decay
  ];
  return backgroundPatterns.some(p => url.includes(p));
}

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
