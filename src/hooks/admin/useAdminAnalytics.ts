/**
 * Admin Analytics Hook — v11.5.2
 * Enterprise-grade event tracking with DB persistence
 * Replaces console.log stubs with real analytics pipeline
 */

import { useEffect, useCallback, useRef } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface AnalyticsEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
}

// ═══ Event Buffer (batched writes) ════════════════════════════════

const eventBuffer: Array<{
  event_type: string;
  category: string;
  label?: string;
  value?: number;
  page?: string;
  session_id?: string;
  metadata?: Record<string, unknown>;
}> = [];

let flushTimer: ReturnType<typeof setTimeout> | null = null;
const FLUSH_INTERVAL = 5000;
const MAX_BUFFER = 50;

function getSessionId(): string {
  let sid = sessionStorage.getItem('analytics_session_id');
  if (!sid) {
    sid = crypto.randomUUID();
    sessionStorage.setItem('analytics_session_id', sid);
  }
  return sid;
}

async function flushEvents(): Promise<void> {
  if (eventBuffer.length === 0) return;

  const batch = eventBuffer.splice(0, eventBuffer.length);
  const sessionId = getSessionId();

  try {
    const rows = batch.map(e => ({
      event_type: e.event_type,
      category: e.category,
      label: e.label ?? null,
      value: e.value ?? null,
      page: e.page ?? null,
      session_id: sessionId,
      metadata: e.metadata ? (e.metadata as any) : null,
    }));

    await supabase.from('analytics_events').insert(rows);
  } catch {
    // Re-queue on failure (up to limit)
    if (eventBuffer.length < MAX_BUFFER * 2) {
      eventBuffer.push(...batch);
    }
  }
}

function scheduleFlush(): void {
  if (flushTimer) return;
  flushTimer = setTimeout(() => {
    flushTimer = null;
    flushEvents();
  }, FLUSH_INTERVAL);
}

function bufferEvent(event: typeof eventBuffer[0]): void {
  eventBuffer.push(event);
  if (eventBuffer.length >= MAX_BUFFER) {
    flushEvents();
  } else {
    scheduleFlush();
  }
}

// ═══ Hook ════════════════════════════════════════════════════════

export function useAdminAnalytics() {
  const location = useLocation();
  const lastPage = useRef<string>('');

  // Track page views (deduplicated)
  useEffect(() => {
    if (location.pathname === lastPage.current) return;
    lastPage.current = location.pathname;
    trackPageView(location.pathname);
  }, [location.pathname]);

  // Flush on unmount
  useEffect(() => {
    return () => { flushEvents(); };
  }, []);

  const trackPageView = useCallback((page: string) => {
    bufferEvent({
      event_type: 'page_view',
      category: 'navigation',
      page,
    });
  }, []);

  const trackEvent = useCallback(({ action, category, label, value }: AnalyticsEvent) => {
    bufferEvent({
      event_type: action,
      category,
      label,
      value,
    });
  }, []);

  const trackError = useCallback((error: Error, context?: string) => {
    bufferEvent({
      event_type: 'error',
      category: 'error',
      label: error.message.slice(0, 200),
      metadata: {
        stack: error.stack?.slice(0, 500),
        context,
      },
    });
  }, []);

  const trackUserAction = useCallback((action: string, metadata?: Record<string, unknown>) => {
    bufferEvent({
      event_type: action,
      category: 'user_interaction',
      metadata,
    });
  }, []);

  return {
    trackPageView,
    trackEvent,
    trackError,
    trackUserAction,
  };
}

// ═══ Analytics Query Helpers ════════════════════════════════════

/** Get aggregated analytics for a time window */
export async function getAnalyticsSummary(hours = 24): Promise<{
  pageViews: number;
  uniqueSessions: number;
  errors: number;
  topPages: Array<{ page: string; views: number }>;
  topActions: Array<{ action: string; count: number }>;
}> {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

  const { data } = await supabase
    .from('analytics_events')
    .select('event_type, category, page, session_id')
    .gte('created_at', since)
    .limit(1000);

  if (!data) return { pageViews: 0, uniqueSessions: 0, errors: 0, topPages: [], topActions: [] };

  const pageViews = data.filter(d => d.event_type === 'page_view').length;
  const uniqueSessions = new Set(data.map(d => d.session_id).filter(Boolean)).size;
  const errors = data.filter(d => d.category === 'error').length;

  // Top pages
  const pageCounts: Record<string, number> = {};
  data.filter(d => d.page).forEach(d => {
    pageCounts[d.page!] = (pageCounts[d.page!] || 0) + 1;
  });
  const topPages = Object.entries(pageCounts)
    .map(([page, views]) => ({ page, views }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 10);

  // Top actions
  const actionCounts: Record<string, number> = {};
  data.filter(d => d.category === 'user_interaction').forEach(d => {
    actionCounts[d.event_type] = (actionCounts[d.event_type] || 0) + 1;
  });
  const topActions = Object.entries(actionCounts)
    .map(([action, count]) => ({ action, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return { pageViews, uniqueSessions, errors, topPages, topActions };
}
