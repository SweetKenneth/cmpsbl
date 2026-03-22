/**
 * useTreaty Hook — TREATY module operations
 * Inter-Node Contracts, Bilateral SLA Enforcement, Penalty Escalation
 * Full capability surface: contracts, SLA, expiry, CLM, hardening
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { debugMode } from '@/lib/debug-mode';
import {
  initTreaty,
  createContract,
  activateContract,
  evaluateSLA,
  checkExpiringContracts,
  getTreatyState,
  getTreatyHealth,
  getTreatyResilience,
  getTreatyHardening,
  upgradeTreatyEngine,
  type SLAMetric,
  type ContractTerm,
  type SLADefinition,
} from '@/lib/substrate/treaty-module';
import { runTreatyCLMCycle } from '@/lib/substrate/treaty/clm';

export interface UseTreatyReturn {
  state: ReturnType<typeof useQuery>;
  health: ReturnType<typeof useQuery>;
  resilience: ReturnType<typeof useQuery>;
  hardening: ReturnType<typeof useQuery>;
  init: ReturnType<typeof useMutation>;
  upgradeEngine: ReturnType<typeof useMutation>;
  runCLM: ReturnType<typeof useMutation>;
  createContract: ReturnType<typeof useMutation>;
  activateContract: ReturnType<typeof useMutation>;
  evaluateSLA: ReturnType<typeof useMutation>;
  checkExpiring: ReturnType<typeof useMutation>;
}

export function useTreaty(): UseTreatyReturn {
  const queryClient = useQueryClient();
  const pollingEnabled = debugMode.allowModulePolling();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['substrate', 'treaty'] });

  const state = useQuery({
    queryKey: ['substrate', 'treaty', 'state'],
    queryFn: () => Promise.resolve(getTreatyState()),
    refetchInterval: pollingEnabled ? 30000 : false,
    staleTime: 10000,
    enabled: pollingEnabled,
  });

  const health = useQuery({
    queryKey: ['substrate', 'treaty', 'health'],
    queryFn: () => Promise.resolve(getTreatyHealth()),
    refetchInterval: pollingEnabled ? 30000 : false,
    staleTime: 15000,
    enabled: pollingEnabled,
  });

  const resilience = useQuery({
    queryKey: ['substrate', 'treaty', 'resilience'],
    queryFn: () => Promise.resolve(getTreatyResilience()),
    refetchInterval: pollingEnabled ? 60000 : false,
    staleTime: 30000,
    enabled: pollingEnabled,
  });

  const hardeningQuery = useQuery({
    queryKey: ['substrate', 'treaty', 'hardening'],
    queryFn: () => Promise.resolve(getTreatyHardening()),
    refetchInterval: pollingEnabled ? 60000 : false,
    staleTime: 30000,
    enabled: pollingEnabled,
  });

  const init = useMutation({
    mutationFn: () => Promise.resolve(initTreaty()),
    onSuccess: invalidate,
  });

  const upgradeEngine = useMutation({
    mutationFn: (params: { version: string }) => Promise.resolve(upgradeTreatyEngine(params.version)),
    onSuccess: invalidate,
  });

  const runCLM = useMutation({
    mutationFn: () => Promise.resolve(runTreatyCLMCycle()),
  });

  const createContractMut = useMutation({
    mutationFn: (params: { name: string; parties: string[]; terms: Omit<ContractTerm, 'id'>[]; slas: Omit<SLADefinition, 'id' | 'currentValue' | 'compliant'>[]; durationDays?: number }) =>
      Promise.resolve(createContract(params.name, params.parties, params.terms, params.slas, params.durationDays)),
    onSuccess: invalidate,
  });

  const activateContractMut = useMutation({
    mutationFn: (params: { contractId: string }) =>
      Promise.resolve(activateContract(params.contractId)),
    onSuccess: invalidate,
  });

  const evaluateSLAMut = useMutation({
    mutationFn: (params: { contractId: string; metrics: Partial<Record<SLAMetric, number>> }) =>
      Promise.resolve(evaluateSLA(params.contractId, params.metrics)),
    onSuccess: invalidate,
  });

  const checkExpiringMut = useMutation({
    mutationFn: (params?: { withinDays?: number }) =>
      Promise.resolve(checkExpiringContracts(params?.withinDays)),
    onSuccess: invalidate,
  });

  return {
    state, health, resilience, hardening: hardeningQuery,
    init, upgradeEngine, runCLM,
    createContract: createContractMut, activateContract: activateContractMut,
    evaluateSLA: evaluateSLAMut, checkExpiring: checkExpiringMut,
  };
}

export default useTreaty;
