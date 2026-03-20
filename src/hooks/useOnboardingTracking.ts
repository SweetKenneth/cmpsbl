/**
 * useOnboardingTracking — Persistent onboarding funnel analytics
 * Tracks: opened, step_viewed, completed, skipped for all 8 onboarding surfaces.
 * Writes to analytics_events table with category='onboarding'.
 */

import { useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

function getSessionId(): string {
  let sid = sessionStorage.getItem('cmpsbl_sid');
  if (!sid) {
    sid = crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    sessionStorage.setItem('cmpsbl_sid', sid);
  }
  return sid;
}

export type OnboardingSurface =
  | 'welcome'
  | 'store'
  | 'memory-stream'
  | 'academy'
  | 'codelab'
  | 'persistent-memory'
  | 'workspace'
  | 'upgrade';

/**
 * Lightweight hook for tracking onboarding funnel progression.
 * Non-blocking — all writes are fire-and-forget.
 */
export function useOnboardingTracking(surface: OnboardingSurface) {
  const tracked = useRef<Set<string>>(new Set());

  const track = useCallback(
    (eventType: string, label?: string, value?: number) => {
      // Dedupe within session to avoid noise
      const key = `${eventType}:${label ?? ''}:${value ?? ''}`;
      if (tracked.current.has(key)) return;
      tracked.current.add(key);

      supabase.auth.getUser().then(({ data }) => {
        supabase
          .from('analytics_events')
          .insert({
            event_type: eventType,
            category: 'onboarding',
            page: surface,
            label,
            value,
            session_id: getSessionId(),
            user_id: data?.user?.id ?? null,
          })
          .then(() => {})
          .catch(() => {});
      });
    },
    [surface]
  );

  /** Call when onboarding modal opens */
  const trackOpened = useCallback(() => {
    track('onboarding_opened', surface);
  }, [track, surface]);

  /** Call on each step transition */
  const trackStep = useCallback(
    (stepIndex: number, stepName?: string) => {
      track('onboarding_step', stepName ?? `step_${stepIndex}`, stepIndex);
    },
    [track]
  );

  /** Call when user completes all steps */
  const trackCompleted = useCallback(
    (totalSteps: number) => {
      track('onboarding_completed', surface, totalSteps);
    },
    [track, surface]
  );

  /** Call when user skips/dismisses early */
  const trackSkipped = useCallback(
    (atStep: number, totalSteps: number) => {
      track('onboarding_skipped', `${surface}:step_${atStep}/${totalSteps}`, atStep);
    },
    [track, surface]
  );

  return { trackOpened, trackStep, trackCompleted, trackSkipped };
}
