/**
 * useEcho Hook — ECHO module operations
 * Digital Twin Simulation & What-If Scenarios
 * Full capability surface: twins, scenarios, CLM, hardening
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { debugMode } from '@/lib/debug-mode';
import {
  initEcho,
  createTwin,
  syncTwin,
  runScenario,
  getEchoState,
  getEchoHealth,
  getEchoResilience,
  getEchoHardening,
  upgradeEchoEngine,
  type Intervention,
} from '@/lib/substrate/echo-module';
import { runEchoCLMCycle } from '@/lib/substrate/echo/clm';

export interface UseEchoReturn {
  state: ReturnType<typeof useQuery>;
  health: ReturnType<typeof useQuery>;
  resilience: ReturnType<typeof useQuery>;
  hardening: ReturnType<typeof useQuery>;
  init: ReturnType<typeof useMutation>;
  upgradeEngine: ReturnType<typeof useMutation>;
  runCLM: ReturnType<typeof useMutation>;
  createTwin: ReturnType<typeof useMutation>;
  runScenario: ReturnType<typeof useMutation>;
  syncTwin: ReturnType<typeof useMutation>;
}

export function useEcho(): UseEchoReturn {
  const queryClient = useQueryClient();
  const pollingEnabled = debugMode.allowModulePolling();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['substrate', 'echo'] });

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
    init, upgradeEngine, runCLM,
    createTwin: createTwinMut, runScenario: runScenarioMut, syncTwin: syncTwinMut,
  };
}

export default useEcho;
