/**
 * useForge Hook — FORGE node operations
 * Artifact synthesis, blueprint management, build pipelines
 * Full capability surface including CLM, hardening, signal forge
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { debugMode } from '@/lib/debug-mode';
import {
  initForge,
  createBlueprint,
  generate,
  build,
  getForgeState,
  getForgeHealth,
  getForgeResilience,
  getForgeHardening,
  upgradeForgeEngine,
  type ForgeLanguage,
  type ForgeArtifactType,
} from '@/lib/substrate/forge-module';
import { runForgeCLMCycle } from '@/lib/substrate/forge/clm';
import {
  forgeSignalBatch,
  forgeRetireCombo,
  forgeGetRetired,
  forgeSignalStats,
  type ForgeSignalRequest,
} from '@/lib/substrate/forge/signal-forge';

export interface UseForgeReturn {
  // Queries
  state: ReturnType<typeof useQuery>;
  health: ReturnType<typeof useQuery>;
  resilience: ReturnType<typeof useQuery>;
  hardening: ReturnType<typeof useQuery>;
  retiredCombos: ReturnType<typeof useQuery>;
  signalStats: ReturnType<typeof useQuery>;

  // Lifecycle
  init: ReturnType<typeof useMutation>;
  upgradeEngine: ReturnType<typeof useMutation>;
  runCLM: ReturnType<typeof useMutation>;

  // Core pipeline
  createBlueprint: ReturnType<typeof useMutation>;
  generate: ReturnType<typeof useMutation>;
  build: ReturnType<typeof useMutation>;

  // Signal Forge
  signalBatch: ReturnType<typeof useMutation>;
  retireCombo: ReturnType<typeof useMutation>;
}

export function useForge(): UseForgeReturn {
  const queryClient = useQueryClient();
  const pollingEnabled = debugMode.allowModulePolling();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['substrate', 'forge'] });

  // ═══ QUERIES ═══

  const state = useQuery({
    queryKey: ['substrate', 'forge', 'state'],
    queryFn: () => Promise.resolve(getForgeState()),
    refetchInterval: pollingEnabled ? 30000 : false,
    staleTime: 10000,
    enabled: pollingEnabled,
  });

  const health = useQuery({
    queryKey: ['substrate', 'forge', 'health'],
    queryFn: () => Promise.resolve(getForgeHealth()),
    refetchInterval: pollingEnabled ? 30000 : false,
    staleTime: 15000,
    enabled: pollingEnabled,
  });

  const resilience = useQuery({
    queryKey: ['substrate', 'forge', 'resilience'],
    queryFn: () => Promise.resolve(getForgeResilience()),
    refetchInterval: pollingEnabled ? 60000 : false,
    staleTime: 30000,
    enabled: pollingEnabled,
  });

  const hardeningQuery = useQuery({
    queryKey: ['substrate', 'forge', 'hardening'],
    queryFn: () => Promise.resolve(getForgeHardening()),
    refetchInterval: pollingEnabled ? 60000 : false,
    staleTime: 30000,
    enabled: pollingEnabled,
  });

  const retiredCombos = useQuery({
    queryKey: ['substrate', 'forge', 'retiredCombos'],
    queryFn: () => Promise.resolve(forgeGetRetired()),
    staleTime: 30000,
    enabled: pollingEnabled,
  });

  const signalStatsQuery = useQuery({
    queryKey: ['substrate', 'forge', 'signalStats'],
    queryFn: () => Promise.resolve(forgeSignalStats()),
    refetchInterval: pollingEnabled ? 30000 : false,
    staleTime: 15000,
    enabled: pollingEnabled,
  });

  // ═══ LIFECYCLE ═══

  const init = useMutation({
    mutationFn: () => Promise.resolve(initForge()),
    onSuccess: invalidate,
  });

  const upgradeEngine = useMutation({
    mutationFn: (params: { version: string }) => Promise.resolve(upgradeForgeEngine(params.version)),
    onSuccess: invalidate,
  });

  const runCLM = useMutation({
    mutationFn: () => Promise.resolve(runForgeCLMCycle()),
  });

  // ═══ CORE PIPELINE ═══

  const createBlueprintMut = useMutation({
    mutationFn: (params: { name: string; language: ForgeLanguage; artifactType: ForgeArtifactType; specification: string }) =>
      Promise.resolve(createBlueprint(params.name, params.language, params.artifactType, params.specification)),
    onSuccess: invalidate,
  });

  const generateMut = useMutation({
    mutationFn: (params: { blueprintId: string }) => Promise.resolve(generate(params.blueprintId)),
    onSuccess: invalidate,
  });

  const buildMut = useMutation({
    mutationFn: (params: { artifactId: string; deployTarget?: string }) =>
      Promise.resolve(build(params.artifactId, params.deployTarget)),
    onSuccess: invalidate,
  });

  // ═══ SIGNAL FORGE ═══

  const signalBatch = useMutation({
    mutationFn: (params: ForgeSignalRequest) => Promise.resolve(forgeSignalBatch(params)),
    onSuccess: invalidate,
  });

  const retireCombo = useMutation({
    mutationFn: (params: { modules: string[]; category: string; totalRuns: number; totalDiscoveries: number }) =>
      Promise.resolve(forgeRetireCombo(params.modules, params.category, params.totalRuns, params.totalDiscoveries)),
    onSuccess: invalidate,
  });

  return {
    state, health, resilience, hardening: hardeningQuery, retiredCombos, signalStats: signalStatsQuery,
    init, upgradeEngine, runCLM,
    createBlueprint: createBlueprintMut, generate: generateMut, build: buildMut,
    signalBatch, retireCombo,
  };
}

export default useForge;
