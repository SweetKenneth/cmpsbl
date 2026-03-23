/**
 * useEcho Hook — ECHO v9.0.0 "Resonance" operations
 * Signal Reverberation, Pattern Amplification & Digital Twin Engine
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { debugMode } from '@/lib/debug-mode';
import {
  initEcho,
  getEchoState,
  getEchoHealth,
  getEchoResilience,
  getEchoHardening,
  upgradeEchoEngine,
  // Signal Processing
  emitSignal,
  recordSignalOutcome,
  // Temporal Replay
  replayTimeWindow,
  replayByNode,
  // Schema Registry
  registerSignalSchema,
  // Routing Rules
  addRoutingRule,
  removeRoutingRule,
  // Digital Twins
  createTwin,
  syncTwin,
  runScenario,
  // Telemetry
  getBusMetrics,
  getResonancePatterns,
  getCorrelations,
  getForecasts,
  getCompressedBursts,
  getRoutingRules,
  getAmplificationScores,
  type SignalPriority,
  type SignalDecayTier,
  type Intervention,
  type RoutingRule,
} from '@/lib/substrate/echo-module';
import { runEchoCLMCycle } from '@/lib/substrate/echo/clm';

export interface UseEchoReturn {
  // Queries
  state: ReturnType<typeof useQuery>;
  health: ReturnType<typeof useQuery>;
  resilience: ReturnType<typeof useQuery>;
  hardening: ReturnType<typeof useQuery>;
  busMetrics: ReturnType<typeof useQuery>;
  resonancePatterns: ReturnType<typeof useQuery>;
  correlations: ReturnType<typeof useQuery>;
  forecasts: ReturnType<typeof useQuery>;
  amplificationScores: ReturnType<typeof useQuery>;
  // Lifecycle
  init: ReturnType<typeof useMutation>;
  upgradeEngine: ReturnType<typeof useMutation>;
  runCLM: ReturnType<typeof useMutation>;
  // Signal Processing
  emitSignal: ReturnType<typeof useMutation>;
  recordOutcome: ReturnType<typeof useMutation>;
  // Replay
  replay: ReturnType<typeof useMutation>;
  replayNode: ReturnType<typeof useMutation>;
  // Schema
  registerSchema: ReturnType<typeof useMutation>;
  // Routing
  addRule: ReturnType<typeof useMutation>;
  removeRule: ReturnType<typeof useMutation>;
  // Digital Twins
  createTwin: ReturnType<typeof useMutation>;
  runScenario: ReturnType<typeof useMutation>;
  syncTwin: ReturnType<typeof useMutation>;
}

export function useEcho(): UseEchoReturn {
  const queryClient = useQueryClient();
  const pollingEnabled = debugMode.allowModulePolling();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['substrate', 'echo'] });

  // ═══ QUERIES ═══

  const state = useQuery({
    queryKey: ['substrate', 'echo', 'state'],
    queryFn: () => Promise.resolve(getEchoState()),
    refetchInterval: pollingEnabled ? 30000 : false,
    staleTime: 10000,
    enabled: pollingEnabled,
  });

  const health = useQuery({
    queryKey: ['substrate', 'echo', 'health'],
    queryFn: () => Promise.resolve(getEchoHealth()),
    refetchInterval: pollingEnabled ? 30000 : false,
    staleTime: 15000,
    enabled: pollingEnabled,
  });

  const resilience = useQuery({
    queryKey: ['substrate', 'echo', 'resilience'],
    queryFn: () => Promise.resolve(getEchoResilience()),
    refetchInterval: pollingEnabled ? 60000 : false,
    staleTime: 30000,
    enabled: pollingEnabled,
  });

  const hardeningQuery = useQuery({
    queryKey: ['substrate', 'echo', 'hardening'],
    queryFn: () => Promise.resolve(getEchoHardening()),
    refetchInterval: pollingEnabled ? 60000 : false,
    staleTime: 30000,
    enabled: pollingEnabled,
  });

  const busMetricsQuery = useQuery({
    queryKey: ['substrate', 'echo', 'bus-metrics'],
    queryFn: () => Promise.resolve(getBusMetrics()),
    refetchInterval: pollingEnabled ? 10000 : false,
    staleTime: 5000,
    enabled: pollingEnabled,
  });

  const resonancePatternsQuery = useQuery({
    queryKey: ['substrate', 'echo', 'resonance'],
    queryFn: () => Promise.resolve(getResonancePatterns()),
    refetchInterval: pollingEnabled ? 30000 : false,
    staleTime: 15000,
    enabled: pollingEnabled,
  });

  const correlationsQuery = useQuery({
    queryKey: ['substrate', 'echo', 'correlations'],
    queryFn: () => Promise.resolve(getCorrelations()),
    refetchInterval: pollingEnabled ? 30000 : false,
    staleTime: 15000,
    enabled: pollingEnabled,
  });

  const forecastsQuery = useQuery({
    queryKey: ['substrate', 'echo', 'forecasts'],
    queryFn: () => Promise.resolve(getForecasts()),
    refetchInterval: pollingEnabled ? 15000 : false,
    staleTime: 5000,
    enabled: pollingEnabled,
  });

  const amplificationQuery = useQuery({
    queryKey: ['substrate', 'echo', 'amplification'],
    queryFn: () => Promise.resolve(getAmplificationScores()),
    refetchInterval: pollingEnabled ? 60000 : false,
    staleTime: 30000,
    enabled: pollingEnabled,
  });

  // ═══ LIFECYCLE ═══

  const init = useMutation({
    mutationFn: () => Promise.resolve(initEcho()),
    onSuccess: invalidate,
  });

  const upgradeEngine = useMutation({
    mutationFn: (params: { version: string }) => Promise.resolve(upgradeEchoEngine(params.version)),
    onSuccess: invalidate,
  });

  const runCLM = useMutation({
    mutationFn: () => Promise.resolve(runEchoCLMCycle()),
  });

  // ═══ SIGNAL PROCESSING ═══

  const emitSignalMut = useMutation({
    mutationFn: (params: {
      sourceNode: string; targetNode: string; signalType: string;
      payload?: Record<string, unknown>; priority?: SignalPriority; decayTier?: SignalDecayTier;
    }) => Promise.resolve(emitSignal(
      params.sourceNode, params.targetNode, params.signalType,
      params.payload, params.priority, params.decayTier
    )),
    onSuccess: invalidate,
  });

  const recordOutcome = useMutation({
    mutationFn: (params: { signalType: string; hadImpact: boolean }) =>
      Promise.resolve(recordSignalOutcome(params.signalType, params.hadImpact)),
    onSuccess: invalidate,
  });

  // ═══ REPLAY ═══

  const replay = useMutation({
    mutationFn: (params: { startMs: number; endMs: number }) =>
      Promise.resolve(replayTimeWindow(params.startMs, params.endMs)),
  });

  const replayNodeMut = useMutation({
    mutationFn: (params: { nodeId: string; limit?: number }) =>
      Promise.resolve(replayByNode(params.nodeId, params.limit)),
  });

  // ═══ SCHEMA ═══

  const registerSchema = useMutation({
    mutationFn: (params: { signalType: string; fields: Array<{ name: string; type: string; required: boolean }>; version?: number }) =>
      Promise.resolve(registerSignalSchema(params.signalType, params.fields, params.version)),
    onSuccess: invalidate,
  });

  // ═══ ROUTING ═══

  const addRuleMut = useMutation({
    mutationFn: (params: Omit<RoutingRule, 'id'>) => Promise.resolve(addRoutingRule(params)),
    onSuccess: invalidate,
  });

  const removeRuleMut = useMutation({
    mutationFn: (params: { ruleId: string }) => Promise.resolve(removeRoutingRule(params.ruleId)),
    onSuccess: invalidate,
  });

  // ═══ DIGITAL TWINS ═══

  const createTwinMut = useMutation({
    mutationFn: (params: { name: string; entityType: string; initialState: Record<string, number>; parameters?: Record<string, number> }) =>
      Promise.resolve(createTwin(params.name, params.entityType, params.initialState, params.parameters)),
    onSuccess: invalidate,
  });

  const runScenarioMut = useMutation({
    mutationFn: (params: { twinId: string; name: string; interventions: Intervention[]; steps?: number }) =>
      Promise.resolve(runScenario(params.twinId, params.name, params.interventions, params.steps)),
    onSuccess: invalidate,
  });

  const syncTwinMut = useMutation({
    mutationFn: (params: { twinId: string; realWorldState: Record<string, number> }) =>
      Promise.resolve(syncTwin(params.twinId, params.realWorldState)),
    onSuccess: invalidate,
  });

  return {
    state, health, resilience, hardening: hardeningQuery,
    busMetrics: busMetricsQuery, resonancePatterns: resonancePatternsQuery,
    correlations: correlationsQuery, forecasts: forecastsQuery,
    amplificationScores: amplificationQuery,
    init, upgradeEngine, runCLM,
    emitSignal: emitSignalMut, recordOutcome,
    replay, replayNode: replayNodeMut,
    registerSchema,
    addRule: addRuleMut, removeRule: removeRuleMut,
    createTwin: createTwinMut, runScenario: runScenarioMut, syncTwin: syncTwinMut,
  };
}

export default useEcho;
