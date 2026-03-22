/**
 * useHarvest Hook — HARVEST module operations
 * Full capability surface: data sources, ETL pipelines, jobs,
 * health, resilience, hardening, CLM, engine upgrade.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { debugMode } from '@/lib/debug-mode';
import {
  getHarvestState,
  getHarvestHealth,
  getHarvestResilience,
  getHarvestHardening,
  upgradeHarvestEngine,
  initHarvest,
  registerSource,
  runJob,
  createPipeline,
  type SourceType,
} from '@/lib/substrate/harvest-module';
import { runHarvestCLM } from '@/lib/substrate/harvest/clm';
import { validateSourceInput, validatePipelineInput } from '@/lib/substrate/harvest/hardening';

export interface UseHarvestReturn {
  // Queries
  state: ReturnType<typeof useQuery>;
  health: ReturnType<typeof useQuery>;
  resilience: ReturnType<typeof useQuery>;
  hardening: ReturnType<typeof useQuery>;

  // Core mutations
  init: ReturnType<typeof useMutation>;
  registerSource: ReturnType<typeof useMutation>;
  runJob: ReturnType<typeof useMutation>;
  createPipeline: ReturnType<typeof useMutation>;

  // Validation
  validateSource: ReturnType<typeof useMutation>;
  validatePipeline: ReturnType<typeof useMutation>;

  // Maintenance
  runCLM: ReturnType<typeof useMutation>;
  upgradeEngine: ReturnType<typeof useMutation>;
}

export function useHarvest(): UseHarvestReturn {
  const queryClient = useQueryClient();
  const pollingEnabled = debugMode.allowModulePolling();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['substrate', 'harvest'] });

  const state = useQuery({
    queryKey: ['substrate', 'harvest', 'state'],
    queryFn: () => getHarvestState(),
    refetchInterval: pollingEnabled ? 30000 : false,
    staleTime: 10000,
    enabled: pollingEnabled,
  });

  const health = useQuery({
    queryKey: ['substrate', 'harvest', 'health'],
    queryFn: () => ({ score: getHarvestHealth() }),
    refetchInterval: pollingEnabled ? 30000 : false,
    staleTime: 10000,
    enabled: pollingEnabled,
  });

  const resilience = useQuery({
    queryKey: ['substrate', 'harvest', 'resilience'],
    queryFn: () => getHarvestResilience(),
    refetchInterval: pollingEnabled ? 60000 : false,
    staleTime: 30000,
    enabled: pollingEnabled,
  });

  const hardeningQuery = useQuery({
    queryKey: ['substrate', 'harvest', 'hardening'],
    queryFn: () => getHarvestHardening(),
    refetchInterval: pollingEnabled ? 60000 : false,
    staleTime: 30000,
    enabled: pollingEnabled,
  });

  const init = useMutation({
    mutationFn: () => Promise.resolve(initHarvest()),
    onSuccess: invalidate,
  });

  const registerSourceMut = useMutation({
    mutationFn: (params: { name: string; type: SourceType; endpoint: string; pollIntervalMs?: number }) =>
      Promise.resolve(registerSource(params.name, params.type, params.endpoint, params.pollIntervalMs)),
    onSuccess: invalidate,
  });

  const runJobMut = useMutation({
    mutationFn: (params: { sourceId: string }) =>
      Promise.resolve(runJob(params.sourceId)),
    onSuccess: invalidate,
  });

  const createPipelineMut = useMutation({
    mutationFn: (params: { name: string; sourceIds: string[]; transformations: string[]; destination: string }) =>
      Promise.resolve(createPipeline(params.name, params.sourceIds, params.transformations, params.destination)),
    onSuccess: invalidate,
  });

  const validateSource = useMutation({
    mutationFn: (params: { name: unknown; type: unknown; endpoint: unknown; pollIntervalMs?: unknown }) =>
      Promise.resolve(validateSourceInput(params.name, params.type, params.endpoint, params.pollIntervalMs)),
  });

  const validatePipeline = useMutation({
    mutationFn: (params: { name: unknown; sourceIds: unknown; transformations: unknown; destination: unknown }) =>
      Promise.resolve(validatePipelineInput(params.name, params.sourceIds, params.transformations, params.destination)),
  });

  const runCLM = useMutation({
    mutationFn: () => {
      const currentState = state.data;
      if (!currentState) return Promise.resolve(null);
      return Promise.resolve(runHarvestCLM(currentState));
    },
    onSuccess: invalidate,
  });

  const upgradeEngine = useMutation({
    mutationFn: (params: { version: string }) =>
      Promise.resolve(upgradeHarvestEngine(params.version)),
    onSuccess: invalidate,
  });

  return {
    state,
    health,
    resilience,
    hardening: hardeningQuery,
    init,
    registerSource: registerSourceMut,
    runJob: runJobMut,
    createPipeline: createPipelineMut,
    validateSource,
    validatePipeline,
    runCLM,
    upgradeEngine,
  };
}
