/**
 * @cmpsbl/react — React Hooks for the CMPSBL® Substrate
 *
 * © CMPSBL® — All rights reserved.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { broadcastIntent, registerResolver, type IntentResolution, type ResolverHandler } from '@cmpsbl/intent';
import { subscribe, emit, getEventLog, createSignal, type MeshEventHandler, type MeshFilter } from '@cmpsbl/mesh';
import { createRuntime, computeCJPI, type MiniRuntime } from '@cmpsbl/runtime';
import type { MeshCommEvent, CJPIInput, CJPIScoreBreakdown, MeshIntent } from '@cmpsbl/types';

// ═══════════════════════════════════════════════════════════════
// useIntent
// ═══════════════════════════════════════════════════════════════

export interface UseIntentReturn {
  broadcast: (intent: Omit<MeshIntent, 'id' | 'timestamp'>) => Promise<IntentResolution>;
  lastResolution: IntentResolution | null;
  isProcessing: boolean;
  error: Error | null;
}

export function useIntent(): UseIntentReturn {
  const [lastResolution, setLastResolution] = useState<IntentResolution | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const broadcast = useCallback(async (intent: Omit<MeshIntent, 'id' | 'timestamp'>) => {
    setIsProcessing(true);
    setError(null);
    try {
      const resolution = await broadcastIntent(intent);
      setLastResolution(resolution);
      return resolution;
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      throw e;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  return { broadcast, lastResolution, isProcessing, error };
}

// ═══════════════════════════════════════════════════════════════
// useResolver
// ═══════════════════════════════════════════════════════════════

export function useResolver(intentType: string, handler: ResolverHandler): void {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    return registerResolver(intentType, (input) => handlerRef.current(input));
  }, [intentType]);
}

// ═══════════════════════════════════════════════════════════════
// useMesh
// ═══════════════════════════════════════════════════════════════

export interface UseMeshReturn {
  events: MeshCommEvent[];
  emit: typeof emit;
  createSignal: typeof createSignal;
}

export function useMesh(filter?: MeshFilter, maxEvents = 100): UseMeshReturn {
  const [events, setEvents] = useState<MeshCommEvent[]>([]);

  useEffect(() => {
    setEvents(getEventLog(filter).slice(-maxEvents));
    return subscribe((event) => {
      setEvents(prev => [...prev.slice(-(maxEvents - 1)), event]);
    }, filter);
  }, [filter?.source, filter?.target, filter?.category, maxEvents]);

  return { events, emit, createSignal };
}

// ═══════════════════════════════════════════════════════════════
// useRuntime
// ═══════════════════════════════════════════════════════════════

export function useRuntime(): MiniRuntime {
  const [runtime] = useState(() => createRuntime());
  return runtime;
}

// ═══════════════════════════════════════════════════════════════
// useCJPI
// ═══════════════════════════════════════════════════════════════

export function useCJPI(input: CJPIInput): CJPIScoreBreakdown {
  return computeCJPI(input);
}
