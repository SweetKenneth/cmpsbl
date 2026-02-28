/**
 * Onboarding State Persistence — Item #7
 * Syncs onboarding state to user profile for cross-device consistency
 */

import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const ONBOARDING_KEY = 'pf-onboarding-state';

interface OnboardingState {
  completed: boolean;
  step?: number;
  dismissedAt?: string;
}

/**
 * On mount, check if user has a stored onboarding state in their profile metadata.
 * If so, sync it to localStorage. On dismiss/complete, push to profile.
 */
export function useOnboardingPersistence() {
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Pull from server metadata if local is missing
      const local = localStorage.getItem(ONBOARDING_KEY);
      const serverState = (user.user_metadata?.onboarding_state as OnboardingState) || null;

      if (!local && serverState?.completed) {
        // User already completed onboarding on another device
        localStorage.setItem(ONBOARDING_KEY, JSON.stringify(serverState));
      }
    })();
  }, []);
}

/**
 * Push onboarding state to user metadata (call on dismiss/complete)
 */
export async function persistOnboardingState(state: OnboardingState): Promise<void> {
  localStorage.setItem(ONBOARDING_KEY, JSON.stringify(state));

  try {
    await supabase.auth.updateUser({
      data: { onboarding_state: state },
    });
  } catch {
    // Silent fail — localStorage is the primary store
  }
}
