/**
 * useGovernance Hook — GOVERNANCE GUARD operations
 * Coherence validation, ethical constraints, governance signals
 * Full capability surface for the Governance Guard singleton
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { debugMode } from '@/lib/debug-mode';
import {
  governanceGuard,
  type GovernanceInput,
  type GovernanceSignal,
} from '@/lib/substrate/governance-guard';

export interface UseGovernanceReturn {
  state: ReturnType<typeof useQuery>;
  coherenceValidation: ReturnType<typeof useMutation>;
  ethicalCheck: ReturnType<typeof useMutation>;
  emitSignal: ReturnType<typeof useMutation>;
  runCycle: ReturnType<typeof useMutation>;
}

export function useGovernance(): UseGovernanceReturn {
  const queryClient = useQueryClient();
  const pollingEnabled = debugMode.allowModulePolling();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['substrate', 'governance'] });

  const state = useQuery({
    queryKey: ['substrate', 'governance', 'state'],
    queryFn: () => governanceGuard.getState(),
    refetchInterval: pollingEnabled ? 30000 : false,
    staleTime: 15000,
    enabled: pollingEnabled,
  });

  const coherenceValidation = useMutation({
    mutationFn: (input: GovernanceInput) => governanceGuard.coherenceValidation(input),
    onSuccess: invalidate,
  });

  const ethicalCheck = useMutation({
    mutationFn: (input: GovernanceInput) => governanceGuard.ethicalConstraintCheck(input),
    onSuccess: invalidate,
  });

  const emitSignal = useMutation({
    mutationFn: (params: { type: GovernanceSignal['type']; reason: string; metadata?: Record<string, unknown> }) =>
      governanceGuard.emitGovernanceSignal(params.type, params.reason, params.metadata),
    onSuccess: invalidate,
  });

  const runCycle = useMutation({
    mutationFn: (input: GovernanceInput) => governanceGuard.runCycle(input),
    onSuccess: invalidate,
  });

  return { state, coherenceValidation, ethicalCheck, emitSignal, runCycle };
}

export default useGovernance;
