/**
 * useRadioTimer — Enforces tier-based radio listening limits
 * Tracks cumulative listening time per 24h window using localStorage
 * Governor tier gets unlimited access
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { useUserRole } from '@/hooks/useUserRole';
import { getUserLimits, resolveToProductTier } from '@/lib/substrate/product-limits';
import { toast } from 'sonner';

const STORAGE_KEY = 'cmpsbl_radio_timer';

interface RadioTimerData {
  /** Epoch ms when the 24h window started */
  windowStart: number;
  /** Seconds listened in this window */
  secondsUsed: number;
}

function getTimerData(): RadioTimerData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw) as RadioTimerData;
      // Reset if window has expired (24h)
      if (Date.now() - data.windowStart > 24 * 60 * 60 * 1000) {
        return { windowStart: Date.now(), secondsUsed: 0 };
      }
      return data;
    }
  } catch { /* ignore */ }
  return { windowStart: Date.now(), secondsUsed: 0 };
}

function saveTimerData(data: RadioTimerData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export interface RadioTimerState {
  /** Minutes remaining in the current 24h window. -1 = unlimited */
  minutesRemaining: number;
  /** Total allowed minutes. -1 = unlimited */
  totalMinutes: number;
  /** Whether the limit has been reached */
  limitReached: boolean;
  /** Call every second while radio is playing to tick the timer */
  tick: () => boolean; // returns false if limit hit
  /** Reset (for testing) */
  reset: () => void;
}

export function useRadioTimer(): RadioTimerState {
  const { role } = useUserRole();
  const [timerData, setTimerData] = useState<RadioTimerData>(getTimerData);
  const hasWarnedRef = useRef(false);

  // Governor = unlimited
  const isGovernor = role === 'governor';
  const limits = getUserLimits(role);
  const totalMinutes = isGovernor ? -1 : limits.radioMinutesPerDay;
  const totalSeconds = totalMinutes * 60;

  const secondsUsed = timerData.secondsUsed;
  const minutesRemaining = isGovernor ? -1 : Math.max(0, totalMinutes - Math.floor(secondsUsed / 60));
  const limitReached = !isGovernor && secondsUsed >= totalSeconds;

  const tick = useCallback((): boolean => {
    if (isGovernor) return true;

    const data = getTimerData();
    data.secondsUsed += 1;
    saveTimerData(data);
    setTimerData({ ...data });

    const remaining = totalSeconds - data.secondsUsed;

    // Warning at 1 minute left
    if (remaining === 60 && !hasWarnedRef.current) {
      hasWarnedRef.current = true;
      toast.warning('Composable Radio', {
        description: `1 minute remaining on your ${totalMinutes}-minute daily radio limit. Upgrade for more listening time.`,
        duration: 8000,
      });
    }

    // Limit reached
    if (remaining <= 0) {
      toast.error('Radio Limit Reached', {
        description: `You've used your ${totalMinutes} minutes of daily radio. Upgrade your plan for more listening time or come back in ${Math.ceil((24 * 60 * 60 * 1000 - (Date.now() - data.windowStart)) / 3600000)} hours.`,
        duration: 10000,
      });
      return false;
    }

    return true;
  }, [isGovernor, totalMinutes, totalSeconds]);

  const reset = useCallback(() => {
    const fresh = { windowStart: Date.now(), secondsUsed: 0 };
    saveTimerData(fresh);
    setTimerData(fresh);
    hasWarnedRef.current = false;
  }, []);

  return {
    minutesRemaining,
    totalMinutes,
    limitReached,
    tick,
    reset,
  };
}
