/**
 * @cmpsbl/react — React Hooks for the CMPSBL® Substrate
 * Includes first-contact Memory Stream hooks.
 *
 * © CMPSBL® — All rights reserved.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { broadcastIntent, registerResolver, type IntentResolution, type ResolverHandler } from '@cmpsbl/intent';
import { subscribe, emit, getEventLog, createSignal, type MeshEventHandler, type MeshFilter } from '@cmpsbl/mesh';
import { createRuntime, computeCJPI, type MiniRuntime, initFirstContact, discoverMemory, captureMemory, applyMemory, exportMemory, getMemoryStream, getFirstContactSession } from '@cmpsbl/runtime';
import type { MeshCommEvent, CJPIInput, CJPIScoreBreakdown, MeshIntent, FirstContactConfig, MemoryChain, DiscoveryInput, DiscoveryResult } from '@cmpsbl/types';
import { DOMAIN_PATTERNS } from '@cmpsbl/types';

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
    return registerResolver(intentType, (input: Record<string, unknown>) => handlerRef.current(input));
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

// ═══════════════════════════════════════════════════════════════
// First Contact Hooks
// ═══════════════════════════════════════════════════════════════

export interface UseFirstContactReturn {
  initialized: boolean;
  chains: MemoryChain[];
  discover: (input: DiscoveryInput) => Promise<DiscoveryResult>;
  capture: (chainId: string) => Promise<void>;
  apply: (chainId: string) => Promise<void>;
  exportChain: (chainId: string) => Promise<Record<string, unknown>>;
  isDiscovering: boolean;
}

export function useFirstContact(apiKey?: string): UseFirstContactReturn {
  const [initialized, setInitialized] = useState(false);
  const [chains, setChains] = useState<MemoryChain[]>([]);
  const [isDiscovering, setIsDiscovering] = useState(false);

  const configRef = useRef<FirstContactConfig>({
    package: '@cmpsbl/react',
    domain: 'react',
    apiKey,
    endpoint: 'https://bxodolqqczjuahwdrswy.supabase.co/functions/v1/substrate-api',
    autoDiscover: true,
    onDiscovery: (chain) => {
      setChains(prev => [...prev, chain]);
    },
  });

  useEffect(() => {
    initFirstContact(configRef.current).then(() => {
      setInitialized(true);
    });
  }, []);

  const discover = useCallback(async (input: DiscoveryInput) => {
    setIsDiscovering(true);
    try {
      const result = await discoverMemory(input, configRef.current, DOMAIN_PATTERNS.react);
      setChains(getMemoryStream());
      return result;
    } finally {
      setIsDiscovering(false);
    }
  }, []);

  const capture = useCallback(async (chainId: string) => {
    await captureMemory(chainId, configRef.current);
    setChains(getMemoryStream());
  }, []);

  const applyChain = useCallback(async (chainId: string) => {
    await applyMemory(chainId, configRef.current);
    setChains(getMemoryStream());
  }, []);

  const exportChainFn = useCallback(async (chainId: string) => {
    const result = await exportMemory(chainId, configRef.current);
    setChains(getMemoryStream());
    return result.data;
  }, []);

  return {
    initialized,
    chains,
    discover,
    capture,
    apply: applyChain,
    exportChain: exportChainFn,
    isDiscovering,
  };
}
