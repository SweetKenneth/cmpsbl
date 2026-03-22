/**
 * useReflex Hook — REFLEX module operations
 * Real-Time Edge Computing & Sub-10ms Decision Loops
 * Full capability surface: nodes, rules, decisions, heartbeat, CLM
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { debugMode } from '@/lib/debug-mode';
import {
  initReflex,
  registerNode,
  addRule,
  decide,
  heartbeat,
  getReflexState,
  getReflexHealth,
  getReflexResilience,
  getReflexHardening,
  upgradeReflexEngine,
  type DecisionPriority,
} from '@/lib/substrate/reflex-module';
import { runReflexCLMCycle } from '@/lib/substrate/reflex/clm';

export interface UseReflexReturn {
  state: ReturnType<typeof useQuery>;
  health: ReturnType<typeof useQuery>;
  resilience: ReturnType<typeof useQuery>;
  hardening: ReturnType<typeof useQuery>;
  init: ReturnType<typeof useMutation>;
  upgradeEngine: ReturnType<typeof useMutation>;
  runCLM: ReturnType<typeof useMutation>;
  registerNode: ReturnType<typeof useMutation>;
  decide: ReturnType<typeof useMutation>;
  addRule: ReturnType<typeof useMutation>;
  heartbeat: ReturnType<typeof useMutation>;
}

export function useReflex(): UseReflexReturn {
  const queryClient = useQueryClient();
  const pollingEnabled = debugMode.allowModulePolling();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['substrate', 'reflex'] });

  const state = useQuery({
    queryKey: ['substrate', 'reflex', 'state'],
    queryFn: () => Promise.resolve(getReflexState()),
    refetchInterval: pollingEnabled ? 30000 : false,
    staleTime: 10000,
    enabled: pollingEnabled,
  });

  const health = useQuery({
    queryKey: ['substrate', 'reflex', 'health'],
    queryFn: () => Promise.resolve(getReflexHealth()),
    refetchInterval: pollingEnabled ? 30000 : false,
    staleTime: 15000,
    enabled: pollingEnabled,
  });

  const resilience = useQuery({
    queryKey: ['substrate', 'reflex', 'resilience'],
    queryFn: () => Promise.resolve(getReflexResilience()),
    refetchInterval: pollingEnabled ? 60000 : false,
    staleTime: 30000,
    enabled: pollingEnabled,
  });

  const hardeningQuery = useQuery({
    queryKey: ['substrate', 'reflex', 'hardening'],
    queryFn: () => Promise.resolve(getReflexHardening()),
    refetchInterval: pollingEnabled ? 60000 : false,
    staleTime: 30000,
    enabled: pollingEnabled,
  });

  const init = useMutation({
    mutationFn: () => Promise.resolve(initReflex()),
    onSuccess: invalidate,
  });

  const upgradeEngine = useMutation({
    mutationFn: (params: { version: string }) => Promise.resolve(upgradeReflexEngine(params.version)),
    onSuccess: invalidate,
  });

  const runCLM = useMutation({
    mutationFn: () => Promise.resolve(runReflexCLMCycle()),
  });

  const registerNodeMut = useMutation({
    mutationFn: (params: { name: string; region: string }) =>
      Promise.resolve(registerNode(params.name, params.region)),
    onSuccess: invalidate,
  });

  const decideMut = useMutation({
    mutationFn: (params: { trigger: string; context?: Record<string, unknown> }) =>
      Promise.resolve(decide(params.trigger, params.context)),
    onSuccess: invalidate,
  });

  const addRuleMut = useMutation({
    mutationFn: (params: { name: string; condition: string; action: string; priority?: DecisionPriority; maxLatencyMs?: number }) =>
      Promise.resolve(addRule(params.name, params.condition, params.action, params.priority, params.maxLatencyMs)),
    onSuccess: invalidate,
  });

  const heartbeatMut = useMutation({
    mutationFn: (params: { nodeId: string; metrics?: { latencyMs?: number; capacityPercent?: number } }) =>
      Promise.resolve(heartbeat(params.nodeId, params.metrics)),
    onSuccess: invalidate,
  });

  return {
    state, health, resilience, hardening: hardeningQuery,
    init, upgradeEngine, runCLM,
    registerNode: registerNodeMut, decide: decideMut, addRule: addRuleMut, heartbeat: heartbeatMut,
  };
}

export default useReflex;
