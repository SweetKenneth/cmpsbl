/**
 * Analytics Event Coverage — standardized event tracking
 * Item #25: Ensure all key user actions fire analytics events
 */

import { supabase } from '@/integrations/supabase/client';

type EventCategory = 'scan' | 'auth' | 'navigation' | 'conversion' | 'engagement' | 'error';

interface AnalyticsEvent {
  eventType: string;
  category: EventCategory;
  label?: string;
  value?: number;
  page?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Track an analytics event.
 * Batched: events are buffered and flushed every 10s or when buffer hits 20 events.
 */
const analyticsBuffer: Record<string, unknown>[] = [];
const ANALYTICS_FLUSH_INTERVAL = 10_000;
const ANALYTICS_MAX_BUFFER = 20;
let analyticsFlushTimer: ReturnType<typeof setTimeout> | null = null;

async function flushAnalyticsBuffer(): Promise<void> {
  if (analyticsBuffer.length === 0) return;
  const batch = analyticsBuffer.splice(0, analyticsBuffer.length);
  try {
    await supabase.from('analytics_events').insert(batch as any[]);
  } catch {
    // Silent fail
  }
}

function scheduleFlush(): void {
  if (analyticsFlushTimer) return;
  analyticsFlushTimer = setTimeout(() => {
    analyticsFlushTimer = null;
    flushAnalyticsBuffer().catch(() => {});
  }, ANALYTICS_FLUSH_INTERVAL);
}

export async function trackEvent(event: AnalyticsEvent): Promise<void> {
  analyticsBuffer.push({
    event_type: event.eventType,
    category: event.category,
    label: event.label,
    value: event.value,
    page: event.page ?? (typeof window !== 'undefined' ? window.location.pathname : null),
    metadata: event.metadata as any ?? null,
    session_id: typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('session_id') : null,
  });

  if (analyticsBuffer.length >= ANALYTICS_MAX_BUFFER) {
    await flushAnalyticsBuffer();
  } else {
    scheduleFlush();
  }
}

// ── Pre-built event helpers ──

export const analytics = {
  scanStarted: (domain: string, mode: string) =>
    trackEvent({ eventType: 'scan_started', category: 'scan', label: domain, metadata: { mode } }),

  scanCompleted: (domain: string, score: number, mode: string) =>
    trackEvent({ eventType: 'scan_completed', category: 'scan', label: domain, value: score, metadata: { mode } }),

  reportDownloaded: (domain: string, format: string) =>
    trackEvent({ eventType: 'report_downloaded', category: 'conversion', label: domain, metadata: { format } }),

  signupCompleted: () =>
    trackEvent({ eventType: 'signup_completed', category: 'auth' }),

  loginCompleted: () =>
    trackEvent({ eventType: 'login_completed', category: 'auth' }),

  pageView: (path: string) =>
    trackEvent({ eventType: 'page_view', category: 'navigation', page: path }),

  featureUsed: (feature: string) =>
    trackEvent({ eventType: 'feature_used', category: 'engagement', label: feature }),

  webhookRegistered: () =>
    trackEvent({ eventType: 'webhook_registered', category: 'conversion' }),

  scheduleCreated: (frequency: string) =>
    trackEvent({ eventType: 'schedule_created', category: 'conversion', metadata: { frequency } }),

  storeVisited: () =>
    trackEvent({ eventType: 'store_visited', category: 'engagement' }),

  moduleViewed: (moduleId: string) =>
    trackEvent({ eventType: 'module_viewed', category: 'engagement', label: moduleId }),

  errorOccurred: (errorName: string) =>
    trackEvent({ eventType: 'client_error', category: 'error', label: errorName }),
};
