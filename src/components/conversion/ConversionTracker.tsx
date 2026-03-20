/**
 * Conversion Funnel Tracker — Item #4
 * Lightweight conversion event tracker using analytics_events table.
 */

import { useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

// Funnel stages — ordered
const FUNNEL_STAGES: Record<string, string> = {
  '/': 'landing',
  '/scanner': 'engagement',
  '/codelab': 'engagement',
  '/foundry': 'engagement',
  '/workspace': 'engagement',
  '/start-here': 'onboarding',
  '/auth': 'signup',
  '/register': 'signup',
  '/store': 'conversion',
  '/persistent-memory': 'deep_engagement',
  '/academy': 'deep_engagement',
  '/ai-operating-system': 'deep_engagement',
};

function getSessionId(): string {
  let sid = sessionStorage.getItem('cmpsbl_sid');
  if (!sid) {
    sid = crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    sessionStorage.setItem('cmpsbl_sid', sid);
  }
  return sid;
}

export function useConversionTracking() {
  const location = useLocation();

  const trackEvent = useCallback(async (eventType: string, label?: string, value?: number) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      await supabase.from('analytics_events').insert({
        event_type: eventType,
        category: 'conversion',
        page: location.pathname,
        label,
        value,
        session_id: getSessionId(),
        user_id: userData?.user?.id ?? null,
      });
    } catch {
      // Silent fail
    }
  }, [location.pathname]);

  // Auto-track page views with funnel stage
  useEffect(() => {
    const stage = FUNNEL_STAGES[location.pathname];
    if (stage) {
      trackEvent('funnel_pageview', stage);
    }
  }, [location.pathname, trackEvent]);

  return { trackEvent };
}

/**
 * Drop-in component that auto-tracks funnel progression.
 * Mount once in the app root.
 */
export function ConversionTracker() {
  useConversionTracking();
  return null;
}
