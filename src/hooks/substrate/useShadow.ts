/**
 * useShadow Hook — SHADOW module operations
 * Full capability surface: shadow runs, mesh config, A/B testing,
 * health, resilience, hardening, engine upgrade.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { debugMode } from '@/lib/debug-mode';
import {
  getShadowState,
  getShadowHealth,
  getShadowResilience,
  getShadowHardening,
  upgradeShadowEngine,
  initShadow,
  executeShadowRun,
  configureMesh,
  getMeshState,
  type ShadowRunMode,
  type ShadowMeshConfig,
} from '@/lib/substrate/shadow-module';
import {
  createShadowAB,
  evaluateShadowAB,
  cancelShadowAB,
  getWinningTemplate,
  getExperiment,
  listExperiments,
  getActiveExperiments,
} from '@/lib/substrate/shadow-ab-engine';

export interface UseShadowReturn {
  // Queries
  state: ReturnType<typeof useQuery>;
  health: ReturnType<typeof useQuery>;
  resilience: ReturnType<typeof useQuery>;
  hardening: ReturnType<typeof useQuery>;
  meshConfig: ReturnType<typeof useQuery>;
  experiments: ReturnType<typeof useQuery>;

  // Core mutations
  init: ReturnType<typeof useMutation>;
  executeRun: ReturnType<typeof useMutation>;
  configureMesh: ReturnType<typeof useMutation>;

  // Shadow A/B testing
  createExperiment: ReturnType<typeof useMutation>;
  evaluateExperiment: ReturnType<typeof useMutation>;
  cancelExperiment: ReturnType<typeof useMutation>;
  getWinningTemplate: ReturnType<typeof useMutation>;

  // Maintenance
  upgradeEngine: ReturnType<typeof useMutation>;
}

export function useShadow(): UseShadowReturn {
  const queryClient = useQueryClient();
  const pollingEnabled = debugMode.allowModulePolling();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['substrate', 'shadow'] });

  const state = useQuery({
    queryKey: ['substrate', 'shadow', 'state'],
    queryFn: () => getShadowState(),
    refetchInterval: pollingEnabled ? 30000 : false,
    staleTime: 10000,
    enabled: pollingEnabled,
  });

  const health = useQuery({
    queryKey: ['substrate', 'shadow', 'health'],
    queryFn: () => ({ score: getShadowHealth() }),
    refetchInterval: pollingEnabled ? 30000 : false,
    staleTime: 10000,
    enabled: pollingEnabled,
  });

  const resilience = useQuery({
    queryKey: ['substrate', 'shadow', 'resilience'],
    queryFn: () => getShadowResilience(),
    refetchInterval: pollingEnabled ? 60000 : false,
    staleTime: 30000,
    enabled: pollingEnabled,
  });

  const hardeningQuery = useQuery({
    queryKey: ['substrate', 'shadow', 'hardening'],
    queryFn: () => getShadowHardening(),
    refetchInterval: pollingEnabled ? 60000 : false,
    staleTime: 30000,
    enabled: pollingEnabled,
  });

  const meshConfigQuery = useQuery({
    queryKey: ['substrate', 'shadow', 'meshConfig'],
    queryFn: () => getMeshState(),
    staleTime: 15000,
    enabled: pollingEnabled,
  });

  const experimentsQuery = useQuery({
    queryKey: ['substrate', 'shadow', 'experiments'],
    queryFn: () => listExperiments(),
    refetchInterval: pollingEnabled ? 30000 : false,
    staleTime: 10000,
    enabled: pollingEnabled,
  });

  const init = useMutation({
    mutationFn: () => Promise.resolve(initShadow()),
    onSuccess: invalidate,
  });

  const executeRunMut = useMutation({
    mutationFn: (params: { proposalId: string; mode?: ShadowRunMode }) =>
      Promise.resolve(executeShadowRun(params.proposalId, params.mode)),
    onSuccess: invalidate,
  });

  const configureMeshMut = useMutation({
    mutationFn: (config: Partial<ShadowMeshConfig>) =>
      Promise.resolve(configureMesh(config)),
    onSuccess: invalidate,
  });

  // Shadow A/B
  const createExperiment = useMutation({
    mutationFn: (params: { planId: string; name: string; module: string; approachA: { approach: string; description: string }; approachB: { approach: string; description: string } }) =>
      Promise.resolve(createShadowAB(params.planId, params.name, params.module, params.approachA, params.approachB)),
    onSuccess: invalidate,
  });

  const evaluateExperiment = useMutation({
    mutationFn: (params: { experimentId: string; manualWinner?: 'A' | 'B' }) =>
      Promise.resolve(evaluateShadowAB(params.experimentId, params.manualWinner)),
    onSuccess: invalidate,
  });

  const cancelExperimentMut = useMutation({
    mutationFn: (params: { experimentId: string }) =>
      Promise.resolve(cancelShadowAB(params.experimentId)),
    onSuccess: invalidate,
  });

  const getWinningTemplateMut = useMutation({
    mutationFn: (params: { experimentId: string }) =>
      Promise.resolve(getWinningTemplate(params.experimentId)),
  });

  const upgradeEngine = useMutation({
    mutationFn: (params: { version: string }) =>
      Promise.resolve(upgradeShadowEngine(params.version)),
    onSuccess: invalidate,
  });

  return {
    state,
    health,
    resilience,
    hardening: hardeningQuery,
    meshConfig: meshConfigQuery,
    experiments: experimentsQuery,
    init,
    executeRun: executeRunMut,
    configureMesh: configureMeshMut,
    createExperiment,
    evaluateExperiment,
    cancelExperiment: cancelExperimentMut,
    getWinningTemplate: getWinningTemplateMut,
    upgradeEngine,
  };
}
