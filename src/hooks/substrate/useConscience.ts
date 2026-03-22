/**
 * useConscience Hook — CONSCIENCE module operations
 * Full capability surface: ethical evaluation, alignment, bias detection,
 * health, resilience, hardening, CLM, engine upgrade.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { debugMode } from '@/lib/debug-mode';
import {
  getConscienceState,
  getConscienceHealth,
  getConscienceResilience,
  getConscienceHardening,
  upgradeConscienceEngine,
  initConscience,
  evaluate,
  checkAlignment,
} from '@/lib/substrate/conscience-module';
import { runConscienceCLMCycle } from '@/lib/substrate/conscience/clm';
import { conscienceHardeningReport, validateConscienceInput } from '@/lib/substrate/conscience/hardening';

export interface UseConscienceReturn {
  // Queries
  state: ReturnType<typeof useQuery>;
  health: ReturnType<typeof useQuery>;
  resilience: ReturnType<typeof useQuery>;
  hardening: ReturnType<typeof useQuery>;

  // Core mutations
  init: ReturnType<typeof useMutation>;
  evaluate: ReturnType<typeof useMutation>;
  checkAlignment: ReturnType<typeof useMutation>;

  // Maintenance
  runCLM: ReturnType<typeof useMutation>;
  validateInput: ReturnType<typeof useMutation>;
  upgradeEngine: ReturnType<typeof useMutation>;
}

export function useConscience(): UseConscienceReturn {
  const queryClient = useQueryClient();
  const pollingEnabled = debugMode.allowModulePolling();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['substrate', 'conscience'] });

  // ── Queries ──
  const state = useQuery({
    queryKey: ['substrate', 'conscience', 'state'],
    queryFn: () => getConscienceState(),
    refetchInterval: pollingEnabled ? 30000 : false,
    staleTime: 10000,
    enabled: pollingEnabled,
  });

  const health = useQuery({
    queryKey: ['substrate', 'conscience', 'health'],
    queryFn: () => ({ score: getConscienceHealth() }),
    refetchInterval: pollingEnabled ? 30000 : false,
    staleTime: 10000,
    enabled: pollingEnabled,
  });

  const resilience = useQuery({
    queryKey: ['substrate', 'conscience', 'resilience'],
    queryFn: () => getConscienceResilience(),
    refetchInterval: pollingEnabled ? 60000 : false,
    staleTime: 30000,
    enabled: pollingEnabled,
  });

  const hardeningQuery = useQuery({
    queryKey: ['substrate', 'conscience', 'hardening'],
    queryFn: () => conscienceHardeningReport(),
    refetchInterval: pollingEnabled ? 60000 : false,
    staleTime: 30000,
    enabled: pollingEnabled,
  });

  // ── Core Mutations ──
  const init = useMutation({
    mutationFn: () => Promise.resolve(initConscience()),
    onSuccess: invalidate,
  });

  const evaluateMut = useMutation({
    mutationFn: (params: { action: string; context?: Record<string, unknown> }) =>
      Promise.resolve(evaluate(params.action, params.context)),
    onSuccess: invalidate,
  });

  const checkAlignmentMut = useMutation({
    mutationFn: (params: { entity: string; values: Record<string, number> }) =>
      Promise.resolve(checkAlignment(params.entity, params.values)),
    onSuccess: invalidate,
  });

  // ── Maintenance ──
  const runCLM = useMutation({
    mutationFn: () => Promise.resolve(runConscienceCLMCycle()),
    onSuccess: invalidate,
  });

  const validateInputMut = useMutation({
    mutationFn: (params: { action?: string; entity?: string; values?: Record<string, number> }) =>
      Promise.resolve(validateConscienceInput(params)),
  });

  const upgradeEngineMut = useMutation({
    mutationFn: (params: { version: string }) =>
      Promise.resolve(upgradeConscienceEngine(params.version)),
    onSuccess: invalidate,
  });

  return {
    state,
    health,
    resilience,
    hardening: hardeningQuery,
    init,
    evaluate: evaluateMut,
    checkAlignment: checkAlignmentMut,
    runCLM,
    validateInput: validateInputMut,
    upgradeEngine: upgradeEngineMut,
  };
}
