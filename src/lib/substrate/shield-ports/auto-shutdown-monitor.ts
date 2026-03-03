/**
 * Auto-Shutdown Monitor — Ported from aetherion-shield
 * Threat-reactive emergency shutdown trigger for the Autonomous Fortress
 * Target nodes: DEFENSE, NERVE, GOVERNANCE
 *
 * Polls the defense posture and triggers emergency lockdown
 * when threat scores exceed critical thresholds.
 */

import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { debugMode } from '@/lib/debug-mode';

export interface ShutdownEvent {
  action: 'nominal' | 'elevated' | 'shutdown_triggered';
  threatScore: number;
  timestamp: string;
  details?: string;
}

type ShutdownCallback = (event: ShutdownEvent) => void;

/**
 * React hook — periodically checks defense posture and triggers
 * emergency shutdown if threat levels are critical.
 *
 * Respects debugMode kill-switch.
 */
export function useAutoShutdownMonitor(
  enabled = true,
  intervalMs = 5 * 60_000,
  onEvent?: ShutdownCallback
) {
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const check = useCallback(async () => {
    if (!debugMode.allowModulePolling()) return;

    try {
      const { data, error } = await supabase.functions.invoke('auto-shutdown-monitor');

      if (error) {
        console.warn('[DEFENSE] Auto-shutdown monitor unavailable:', error.message);
        return;
      }

      const event = data as ShutdownEvent;

      if (event?.action === 'shutdown_triggered') {
        console.error('[DEFENSE] 🚨 Emergency shutdown auto-triggered', event);
      }

      onEvent?.(event);
    } catch (err) {
      console.warn('[DEFENSE] Shutdown monitor exception:', err);
    }
  }, [onEvent]);

  useEffect(() => {
    if (!enabled) return;

    // Check immediately on mount
    check();

    intervalRef.current = setInterval(check, intervalMs);
    return () => clearInterval(intervalRef.current);
  }, [enabled, intervalMs, check]);
}

/**
 * Imperative version — call directly from non-React code
 */
export async function checkShutdownStatus(): Promise<ShutdownEvent | null> {
  try {
    const { data, error } = await supabase.functions.invoke('auto-shutdown-monitor');
    if (error) return null;
    return data as ShutdownEvent;
  } catch {
    return null;
  }
}
