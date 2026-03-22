/**
 * usePhantom Hook — PHANTOM module operations
 * Full capability surface: privacy, anonymization, synthetic data,
 * covert operations, noise injection, CLM, hardening, resilience.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { debugMode } from '@/lib/debug-mode';
import {
  getPhantomState,
  getPhantomHealth,
  getPhantomResilience,
  getPhantomHardening,
  upgradePhantomEngine,
  initPhantom,
  generateSynthetic,
  anonymize,
  addNoise,
  setPrivacyBudget,
  requestCovertOperation,
  approveCovertOperation,
  executeCovertOperation,
  type PrivacyMechanism,
  type AnonymizationMethod,
  type CovertOperation,
} from '@/lib/substrate/phantom-module';
import { runPhantomCLMCycle } from '@/lib/substrate/phantom/clm';
import { phantomHardeningReport, validatePhantomInput } from '@/lib/substrate/phantom/hardening';

export interface UsePhantomReturn {
  // Queries
  state: ReturnType<typeof useQuery>;
  health: ReturnType<typeof useQuery>;
  resilience: ReturnType<typeof useQuery>;
  hardening: ReturnType<typeof useQuery>;

  // Core mutations
  init: ReturnType<typeof useMutation>;
  generateSynthetic: ReturnType<typeof useMutation>;
  anonymize: ReturnType<typeof useMutation>;

  // Privacy budget & noise
  setPrivacyBudget: ReturnType<typeof useMutation>;
  addNoise: ReturnType<typeof useMutation>;

  // Covert operations (governance-gated)
  requestOperation: ReturnType<typeof useMutation>;
  approveOperation: ReturnType<typeof useMutation>;
  executeOperation: ReturnType<typeof useMutation>;

  // Maintenance
  runCLM: ReturnType<typeof useMutation>;
  validateInput: ReturnType<typeof useMutation>;
  upgradeEngine: ReturnType<typeof useMutation>;
}

export function usePhantom(): UsePhantomReturn {
  const queryClient = useQueryClient();
  const pollingEnabled = debugMode.allowModulePolling();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['substrate', 'phantom'] });

  // ── Queries ──
  const state = useQuery({
    queryKey: ['substrate', 'phantom', 'state'],
    queryFn: () => getPhantomState(),
    refetchInterval: pollingEnabled ? 30000 : false,
    staleTime: 10000,
    enabled: pollingEnabled,
  });

  const health = useQuery({
    queryKey: ['substrate', 'phantom', 'health'],
    queryFn: () => ({ score: getPhantomHealth() }),
    refetchInterval: pollingEnabled ? 30000 : false,
    staleTime: 10000,
    enabled: pollingEnabled,
  });

  const resilience = useQuery({
    queryKey: ['substrate', 'phantom', 'resilience'],
    queryFn: () => getPhantomResilience(),
    refetchInterval: pollingEnabled ? 60000 : false,
    staleTime: 30000,
    enabled: pollingEnabled,
  });

  const hardeningQuery = useQuery({
    queryKey: ['substrate', 'phantom', 'hardening'],
    queryFn: () => phantomHardeningReport(),
    refetchInterval: pollingEnabled ? 60000 : false,
    staleTime: 30000,
    enabled: pollingEnabled,
  });

  // ── Core Mutations ──
  const init = useMutation({
    mutationFn: () => Promise.resolve(initPhantom()),
    onSuccess: invalidate,
  });

  const generateSyntheticMut = useMutation({
    mutationFn: (params: { name: string; columns: string[]; rowCount: number; mechanism?: PrivacyMechanism }) =>
      Promise.resolve(generateSynthetic(params.name, params.columns, params.rowCount, params.mechanism)),
    onSuccess: invalidate,
  });

  const anonymizeMut = useMutation({
    mutationFn: (params: { data: Record<string, unknown>; method?: AnonymizationMethod }) =>
      Promise.resolve(anonymize(params.data, params.method)),
    onSuccess: invalidate,
  });

  // ── Privacy & Noise ──
  const setBudget = useMutation({
    mutationFn: (params: { epsilon: number; delta?: number }) =>
      Promise.resolve(setPrivacyBudget(params.epsilon, params.delta)),
    onSuccess: invalidate,
  });

  const noiseMut = useMutation({
    mutationFn: (params: { value: number; sensitivity: number; mechanism?: PrivacyMechanism }) =>
      Promise.resolve(addNoise(params.value, params.sensitivity, params.mechanism)),
    onSuccess: invalidate,
  });

  // ── Covert Operations ──
  const requestOp = useMutation({
    mutationFn: (params: { type: CovertOperation['type']; constraints?: Partial<CovertOperation['constraints']>; ttlMs?: number }) =>
      Promise.resolve(requestCovertOperation(params.type, params.constraints, params.ttlMs)),
    onSuccess: invalidate,
  });

  const approveOp = useMutation({
    mutationFn: (params: { operationId: string; approverId: string }) =>
      Promise.resolve(approveCovertOperation(params.operationId, params.approverId)),
    onSuccess: invalidate,
  });

  const executeOp = useMutation({
    mutationFn: (params: { operationId: string }) =>
      Promise.resolve(executeCovertOperation(params.operationId)),
    onSuccess: invalidate,
  });

  // ── Maintenance ──
  const runCLM = useMutation({
    mutationFn: () => Promise.resolve(runPhantomCLMCycle()),
    onSuccess: invalidate,
  });

  const validateInputMut = useMutation({
    mutationFn: (params: { name?: string; columns?: string[]; rowCount?: number }) =>
      Promise.resolve(validatePhantomInput(params)),
  });

  const upgradeEngineMut = useMutation({
    mutationFn: (params: { version: string }) =>
      Promise.resolve(upgradePhantomEngine(params.version)),
    onSuccess: invalidate,
  });

  return {
    state,
    health,
    resilience,
    hardening: hardeningQuery,
    init,
    generateSynthetic: generateSyntheticMut,
    anonymize: anonymizeMut,
    setPrivacyBudget: setBudget,
    addNoise: noiseMut,
    requestOperation: requestOp,
    approveOperation: approveOp,
    executeOperation: executeOp,
    runCLM,
    validateInput: validateInputMut,
    upgradeEngine: upgradeEngineMut,
  };
}
