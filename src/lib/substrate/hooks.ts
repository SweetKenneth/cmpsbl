/**
 * Substrate React Hooks
 * React Integration Layer
 * 
 * Provides React hooks for all substrate engines across the 40-primitive / 4-category architecture.
 * Enables seamless integration of cognitive capabilities (675+) into React components.
 * 
 * Respects debugMode — when enabled, auto-refresh intervals are skipped
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { memoryCore, type MemoryEntry, type MemoryQuery, type LifecycleResult } from './memory-core';
import { learningEngine, type LearningInput, type LearningResult } from './learning-engine';
import { imaginationEngine, type ImaginationResult, type SynthesisOutput } from './imagination-engine';
import { reasoningEngine, type ReasoningInput, type ReasoningResult } from './reasoning-engine';
import { governanceGuard, type GovernanceInput, type GovernanceResult } from './governance-guard';
import { orchestratorEngine, type PipelineResult, type CognitiveCycleResult, type CognitiveCycleOptions } from './orchestrator-engine';
import { telemetryEngine, type TelemetryEvent, type TelemetryQuery } from './telemetry-engine';
import { stateEngine, type StateSchemaName } from './state-engine';
import { engineBus, type DispatchResult, type BusState } from './engine-bus';
import { debugMode } from '@/lib/debug-mode';

// ═══════════════════════════════════════════════════════════════════════════════
// MEMORY HOOK
// ═══════════════════════════════════════════════════════════════════════════════

export interface UseMemoryOptions {
  autoLoad?: boolean;
  tier?: 'hot' | 'warm' | 'cold';
  limit?: number;
}

export interface UseMemoryReturn {
  memories: MemoryEntry[];
  loading: boolean;
  error: string | null;
  ingest: (content: string, options?: { type?: string; tags?: string[] }) => Promise<LifecycleResult>;
  retrieve: (query: string) => Promise<MemoryEntry[]>;
  refresh: () => Promise<void>;
  state: Awaited<ReturnType<typeof memoryCore.getState>> | null;
}

export function useMemory(options: UseMemoryOptions = {}): UseMemoryReturn {
  const { autoLoad = false, tier, limit = 20 } = options;
  const [memories, setMemories] = useState<MemoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<Awaited<ReturnType<typeof memoryCore.getState>> | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await memoryCore.retrieve({ query: '', tier, limit, strategy: 'pattern' });
      setMemories(result.memories || []);
      const currentState = await memoryCore.getState();
      setState(currentState);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load memories');
    } finally {
      setLoading(false);
    }
  }, [tier, limit]);

  const ingest = useCallback(async (content: string, opts?: { type?: string; tags?: string[] }) => {
    setLoading(true);
    try {
      const result = await memoryCore.ingest(content, {
        type: opts?.type as any || 'general',
        tags: opts?.tags,
      });
      await refresh();
      return result;
    } finally {
      setLoading(false);
    }
  }, [refresh]);

  const retrieve = useCallback(async (query: string): Promise<MemoryEntry[]> => {
    setLoading(true);
    try {
      const result = await memoryCore.retrieve({ query, tier, limit, strategy: 'hybrid' });
      return result.memories || [];
    } finally {
      setLoading(false);
    }
  }, [tier, limit]);

  useEffect(() => {
    if (autoLoad) {
      refresh();
    }
  }, [autoLoad, refresh]);

  return { memories, loading, error, ingest, retrieve, refresh, state };
}

// ═══════════════════════════════════════════════════════════════════════════════
// LEARNING HOOK
// ═══════════════════════════════════════════════════════════════════════════════

export interface UseLearningReturn {
  state: ReturnType<typeof learningEngine.getState>;
  loading: boolean;
  learn: (content: string, topic?: string) => Promise<LearningResult>;
  reinforce: () => Promise<LearningResult>;
  runCycle: (input?: LearningInput) => Promise<{ success: boolean; totalGain: number }>;
}

export function useLearning(): UseLearningReturn {
  const [state, setState] = useState(learningEngine.getState());
  const [loading, setLoading] = useState(false);

  const learn = useCallback(async (content: string, topic?: string) => {
    setLoading(true);
    try {
      const result = await learningEngine.input({ content, topic });
      setState(learningEngine.getState());
      return result;
    } finally {
      setLoading(false);
    }
  }, []);

  const reinforce = useCallback(async () => {
    setLoading(true);
    try {
      const result = await learningEngine.reinforcement();
      setState(learningEngine.getState());
      return result;
    } finally {
      setLoading(false);
    }
  }, []);

  const runCycle = useCallback(async (input?: LearningInput) => {
    setLoading(true);
    try {
      const result = await learningEngine.runCycle(input);
      setState(learningEngine.getState());
      return result;
    } finally {
      setLoading(false);
    }
  }, []);

  return { state, loading, learn, reinforce, runCycle };
}

// ═══════════════════════════════════════════════════════════════════════════════
// IMAGINATION HOOK
// ═══════════════════════════════════════════════════════════════════════════════

export interface UseImaginationReturn {
  state: ReturnType<typeof imaginationEngine.getState>;
  loading: boolean;
  lastSynthesis: SynthesisOutput | null;
  dream: (options?: { force?: boolean }) => Promise<ImaginationResult>;
  synthesize: (topic?: string) => Promise<SynthesisOutput | null>;
  patternFusion: (problem: string, domain1: string, domain2: string) => Promise<ImaginationResult>;
}

export function useImagination(): UseImaginationReturn {
  const [state, setState] = useState(imaginationEngine.getState());
  const [loading, setLoading] = useState(false);
  const [lastSynthesis, setLastSynthesis] = useState<SynthesisOutput | null>(null);

  const dream = useCallback(async (options?: { force?: boolean }) => {
    setLoading(true);
    try {
      const result = await imaginationEngine.dream(options);
      setState(imaginationEngine.getState());
      if (result.output) setLastSynthesis(result.output);
      return result;
    } finally {
      setLoading(false);
    }
  }, []);

  const synthesize = useCallback(async (topic?: string) => {
    setLoading(true);
    try {
      const result = await imaginationEngine.runCycle({ type: 'insight' });
      setState(imaginationEngine.getState());
      if (result.output) setLastSynthesis(result.output);
      return result.output || null;
    } finally {
      setLoading(false);
    }
  }, []);

  const patternFusion = useCallback(async (problem: string, domain1: string, domain2: string) => {
    setLoading(true);
    try {
      const result = await imaginationEngine.patternFusion(problem, domain1, domain2);
      setState(imaginationEngine.getState());
      if (result.output) setLastSynthesis(result.output);
      return result;
    } finally {
      setLoading(false);
    }
  }, []);

  return { state, loading, lastSynthesis, dream, synthesize, patternFusion };
}

// ═══════════════════════════════════════════════════════════════════════════════
// REASONING HOOK
// ═══════════════════════════════════════════════════════════════════════════════

export interface UseReasoningReturn {
  loading: boolean;
  lastResult: ReasoningResult | null;
  analyze: (context: string, domain?: string) => Promise<ReasoningResult>;
  hypothesize: (context: string) => Promise<ReasoningResult>;
  runCycle: (input: ReasoningInput) => Promise<{ success: boolean; stages: ReasoningResult[] }>;
}

export function useReasoning(): UseReasoningReturn {
  const [loading, setLoading] = useState(false);
  const [lastResult, setLastResult] = useState<ReasoningResult | null>(null);

  const analyze = useCallback(async (context: string, domain?: string) => {
    setLoading(true);
    try {
      const result = await reasoningEngine.causalMapping({ context, domain });
      setLastResult(result);
      return result;
    } finally {
      setLoading(false);
    }
  }, []);

  const hypothesize = useCallback(async (context: string) => {
    setLoading(true);
    try {
      const result = await reasoningEngine.hypothesisGeneration({ context });
      setLastResult(result);
      return result;
    } finally {
      setLoading(false);
    }
  }, []);

  const runCycle = useCallback(async (input: ReasoningInput) => {
    setLoading(true);
    try {
      return await reasoningEngine.runCycle(input);
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, lastResult, analyze, hypothesize, runCycle };
}

// ═══════════════════════════════════════════════════════════════════════════════
// GOVERNANCE HOOK
// ═══════════════════════════════════════════════════════════════════════════════

export interface UseGovernanceReturn {
  loading: boolean;
  lastDecision: 'approve' | 'warn' | 'block' | null;
  validate: (content: string, strict?: boolean) => Promise<{ safe: boolean; issues: string[] }>;
  checkCoherence: (content: string) => Promise<GovernanceResult>;
  checkEthics: (content: string) => Promise<GovernanceResult>;
}

export function useGovernance(): UseGovernanceReturn {
  const [loading, setLoading] = useState(false);
  const [lastDecision, setLastDecision] = useState<'approve' | 'warn' | 'block' | null>(null);

  const validate = useCallback(async (content: string, strict: boolean = false) => {
    setLoading(true);
    try {
      const result = await governanceGuard.runCycle({ content, strict_mode: strict });
      setLastDecision(result.final_decision);
      
      const issues: string[] = [];
      if (result.stages[0]?.result?.coherence?.issues) {
        issues.push(...result.stages[0].result.coherence.issues.map(i => i.description));
      }
      if (result.stages[1]?.result?.ethical?.constraints_violated) {
        issues.push(...result.stages[1].result.ethical.constraints_violated);
      }

      return { safe: result.final_decision === 'approve', issues };
    } finally {
      setLoading(false);
    }
  }, []);

  const checkCoherence = useCallback(async (content: string) => {
    setLoading(true);
    try {
      return await governanceGuard.coherenceValidation({ content });
    } finally {
      setLoading(false);
    }
  }, []);

  const checkEthics = useCallback(async (content: string) => {
    setLoading(true);
    try {
      return await governanceGuard.ethicalConstraintCheck({ content });
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, lastDecision, validate, checkCoherence, checkEthics };
}

// ═══════════════════════════════════════════════════════════════════════════════
// ORCHESTRATOR HOOK
// ═══════════════════════════════════════════════════════════════════════════════

export interface UseOrchestratorReturn {
  loading: boolean;
  state: ReturnType<typeof orchestratorEngine.getState>;
  runPipeline: (name: string, input: string) => Promise<PipelineResult>;
  cognitiveCycle: (options: CognitiveCycleOptions) => Promise<CognitiveCycleResult>;
  quickLearn: (content: string, topic?: string) => Promise<{ success: boolean; memoryId?: string }>;
  smartRecall: (query: string, limit?: number) => Promise<{ memories: MemoryEntry[]; insights: string[] }>;
  creativeSynthesize: (topic: string) => Promise<SynthesisOutput | null>;
  availablePipelines: Array<{ name: string; key: string; stages: string[] }>;
}

export function useOrchestrator(): UseOrchestratorReturn {
  const [loading, setLoading] = useState(false);
  const [state, setState] = useState(orchestratorEngine.getState());

  const runPipeline = useCallback(async (name: string, input: string) => {
    setLoading(true);
    try {
      const result = await orchestratorEngine.runPipeline(name as any, input);
      setState(orchestratorEngine.getState());
      return result;
    } finally {
      setLoading(false);
    }
  }, []);

  const cognitiveCycle = useCallback(async (options: CognitiveCycleOptions) => {
    setLoading(true);
    try {
      const result = await orchestratorEngine.cognitiveCycle(options);
      setState(orchestratorEngine.getState());
      return result;
    } finally {
      setLoading(false);
    }
  }, []);

  const quickLearn = useCallback(async (content: string, topic?: string) => {
    setLoading(true);
    try {
      return await orchestratorEngine.quickLearn(content, topic);
    } finally {
      setLoading(false);
    }
  }, []);

  const smartRecall = useCallback(async (query: string, limit: number = 5) => {
    setLoading(true);
    try {
      return await orchestratorEngine.smartRecall(query, limit);
    } finally {
      setLoading(false);
    }
  }, []);

  const creativeSynthesize = useCallback(async (topic: string) => {
    setLoading(true);
    try {
      return await orchestratorEngine.creativeSynthesize(topic);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    state,
    runPipeline,
    cognitiveCycle,
    quickLearn,
    smartRecall,
    creativeSynthesize,
    availablePipelines: orchestratorEngine.getAvailablePipelines(),
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// TELEMETRY HOOK
// ═══════════════════════════════════════════════════════════════════════════════

export interface UseTelemetryReturn {
  events: TelemetryEvent[];
  state: ReturnType<typeof telemetryEngine.getState>;
  query: (options: TelemetryQuery) => TelemetryEvent[];
  getErrors: (limit?: number) => TelemetryEvent[];
  refresh: () => void;
}

export function useTelemetry(autoRefresh: boolean = false, refreshInterval: number = 5000): UseTelemetryReturn {
  const [events, setEvents] = useState<TelemetryEvent[]>([]);
  const [state, setState] = useState(telemetryEngine.getState());

  const refresh = useCallback(() => {
    setEvents(telemetryEngine.query({ limit: 50 }));
    setState(telemetryEngine.getState());
  }, []);

  const query = useCallback((options: TelemetryQuery) => {
    return telemetryEngine.query(options);
  }, []);

  const getErrors = useCallback((limit: number = 20) => {
    return telemetryEngine.getErrors(limit);
  }, []);

  useEffect(() => {
    refresh();
    if (autoRefresh) {
      const interval = setInterval(() => {
        if (debugMode.allowAutoRefresh()) {
          refresh();
        }
      }, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, refresh]);

  return { events, state, query, getErrors, refresh };
}

// ═══════════════════════════════════════════════════════════════════════════════
// ENGINE BUS HOOK
// ═══════════════════════════════════════════════════════════════════════════════

export interface UseEngineBusReturn {
  state: BusState;
  dispatch: <T>(command: string, payload?: Record<string, unknown>) => Promise<DispatchResult<T>>;
  dispatchChain: (chain: Array<{ command: string; payload?: Record<string, unknown> }>) => Promise<DispatchResult<DispatchResult<unknown>[]>>;
  failureRate: number;
}

export function useEngineBus(): UseEngineBusReturn {
  const [state, setState] = useState(engineBus.getState());

  const dispatch = useCallback(async <T>(command: string, payload?: Record<string, unknown>) => {
    const result = await engineBus.dispatch<T>(command, payload);
    setState(engineBus.getState());
    return result;
  }, []);

  const dispatchChain = useCallback(async (chain: Array<{ command: string; payload?: Record<string, unknown> }>) => {
    const result = await engineBus.dispatchChain(chain);
    setState(engineBus.getState());
    return result;
  }, []);

  return {
    state,
    dispatch,
    dispatchChain,
    failureRate: engineBus.getFailureRate(),
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// STATE ENGINE HOOK
// ═══════════════════════════════════════════════════════════════════════════════

export function useSubstrateState<T = unknown>(schema: StateSchemaName): {
  state: T;
  set: (field: string, value: unknown) => void;
  reset: () => void;
} {
  const [state, setState] = useState<T>(() => stateEngine.get<T>(schema));

  const set = useCallback((field: string, value: unknown) => {
    stateEngine.set(schema, field, value);
    setState(stateEngine.get<T>(schema));
  }, [schema]);

  const reset = useCallback(() => {
    stateEngine.reset(schema);
    setState(stateEngine.get<T>(schema));
  }, [schema]);

  return { state, set, reset };
}
