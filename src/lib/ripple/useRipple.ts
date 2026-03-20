/**
 * RIPPLE React Hook
 * React integration for RIPPLE Event Bus
 * 
 * Respects debugMode — when enabled, auto-refresh is skipped
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { ripple, type RippleState, type RippleEvent, type EventStatus, type DeliveryMode } from './index';
import { debugMode } from '@/lib/debug-mode';

export interface UseRippleReturn {
  state: RippleState;
  
  // Publishing
  publish: (type: string, source: string, payload: Record<string, unknown>) => Promise<string>;
  
  // Subscribing
  subscribe: (pattern: string, module: string, handler: (event: RippleEvent) => Promise<void>, mode?: DeliveryMode) => string;
  unsubscribe: (subscriptionId: string) => void;
  
  // Pull mode
  work: (module: string, limit?: number) => Promise<RippleEvent[]>;
  ack: (eventId: string) => Promise<void>;
  nack: (eventId: string, error: string) => Promise<void>;
  
  // Queue management
  replay: (eventId: string) => Promise<boolean>;
  drain: (module: string) => Promise<number>;
  
  // Viewing
  jobs: RippleEvent[];
  deadLetter: RippleEvent[];
  
  // Refresh
  refresh: () => void;
}

export function useRipple(autoRefresh: boolean = false, refreshInterval: number = 5000): UseRippleReturn {
  const [state, setState] = useState<RippleState>(ripple.getState());
  const [jobs, setJobs] = useState<RippleEvent[]>([]);
  const [deadLetter, setDeadLetter] = useState<RippleEvent[]>([]);
  const subscriptionIds = useRef<string[]>([]);

  const refresh = useCallback(() => {
    setState(ripple.getState());
    setJobs(ripple.getJobs(undefined, 50));
    setDeadLetter(ripple.getDeadLetterQueue(50));
  }, []);

  const publish = useCallback(async (type: string, source: string, payload: Record<string, unknown>): Promise<string> => {
    const result = await ripple.publish(type, source, payload);
    refresh();
    return result.eventId;
  }, [refresh]);

  const subscribe = useCallback((
    pattern: string,
    module: string,
    handler: (event: RippleEvent) => Promise<void>,
    mode: DeliveryMode = 'push'
  ): string => {
    const id = ripple.subscribe(pattern, module, handler, mode);
    subscriptionIds.current.push(id);
    refresh();
    return id;
  }, [refresh]);

  const unsubscribe = useCallback((subscriptionId: string) => {
    ripple.unsubscribe(subscriptionId);
    subscriptionIds.current = subscriptionIds.current.filter(id => id !== subscriptionId);
    refresh();
  }, [refresh]);

  const work = useCallback(async (module: string, limit?: number): Promise<RippleEvent[]> => {
    const events = await ripple.work(module, limit);
    refresh();
    return events;
  }, [refresh]);

  const ack = useCallback(async (eventId: string) => {
    await ripple.ack(eventId);
    refresh();
  }, [refresh]);

  const nack = useCallback(async (eventId: string, error: string) => {
    await ripple.nack(eventId, error);
    refresh();
  }, [refresh]);

  const replay = useCallback(async (eventId: string): Promise<boolean> => {
    const success = await ripple.replay(eventId);
    refresh();
    return success;
  }, [refresh]);

  const drain = useCallback(async (module: string): Promise<number> => {
    const count = await ripple.drain(module);
    refresh();
    return count;
  }, [refresh]);

  // Auto-refresh (respects debug mode)
  useEffect(() => {
    refresh();
    if (autoRefresh) {
      const interval = setInterval(() => {
        if (document.visibilityState === 'hidden') return;
        if (debugMode.allowAutoRefresh()) {
          refresh();
        }
      }, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, refresh]);

  // Cleanup subscriptions on unmount
  useEffect(() => {
    return () => {
      for (const id of subscriptionIds.current) {
        ripple.unsubscribe(id);
      }
    };
  }, []);

  return {
    state,
    publish,
    subscribe,
    unsubscribe,
    work,
    ack,
    nack,
    replay,
    drain,
    jobs,
    deadLetter,
    refresh,
  };
}
