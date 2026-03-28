/**
 * useConscience Hook — CONSCIENCE module operations
 * Full capability surface: ethical evaluation, alignment, bias detection,
 * health, resilience, hardening, CLM, engine upgrade, ethical memory,
 * explainability, post-action audit, gate, jurisdictional compliance.
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
import { getPrecedentStats, findPrecedents } from '@/lib/substrate/conscience-module/ethical-memory';
import { getCalibrationHealth } from '@/lib/substrate/conscience-module/post-action-audit';
import { getGateStats } from '@/lib/substrate/conscience-module/mandatory-gate';
import { getFlagStats } from '@/lib/substrate/conscience-module/cross-module-propagation';

export function useConscience() {
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

  const precedentStats = useQuery({
    queryKey: ['substrate', 'conscience', 'precedents'],
    queryFn: () => getPrecedentStats(),
    refetchInterval: pollingEnabled ? 60000 : false,
    staleTime: 30000,
    enabled: pollingEnabled,
  });

  const calibration = useQuery({
    queryKey: ['substrate', 'conscience', 'calibration'],
    queryFn: () => getCalibrationHealth(),
    refetchInterval: pollingEnabled ? 60000 : false,
    staleTime: 30000,
    enabled: pollingEnabled,
  });

  const gateStats = useQuery({
    queryKey: ['substrate', 'conscience', 'gate'],
    queryFn: () => getGateStats(),
    refetchInterval: pollingEnabled ? 60000 : false,
    staleTime: 30000,
    enabled: pollingEnabled,
  });

  const flagStats = useQuery({
    queryKey: ['substrate', 'conscience', 'flags'],
    queryFn: () => getFlagStats(),
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

  const findPrecedentsMut = useMutation({
    mutationFn: (params: { action: string; maxResults?: number }) =>
      Promise.resolve(findPrecedents(params.action, params.maxResults)),
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
    precedentStats,
    calibration,
    gateStats,
    flagStats,
    init,
    evaluate: evaluateMut,
    checkAlignment: checkAlignmentMut,
    findPrecedents: findPrecedentsMut,
    runCLM,
    validateInput: validateInputMut,
    upgradeEngine: upgradeEngineMut,
  };
}
