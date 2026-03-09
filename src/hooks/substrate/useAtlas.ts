/**
 * useAtlas Hook — ATLAS node operations
 * Governance Authority & System Control (Node 40)
 * Part of the Plane sector — 40-Node / 12-Sector Architecture
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { debugMode } from '@/lib/debug-mode';
import {
  getAtlasState,
  getPendingProposals,
  getProposalHistory,
  getSystemControls,
  submitProposal,
  decideProposal,
  setGovernanceMode,
  setSebaEnabled,
  setCLMThrottle,
  setEvolutionVelocity,
  type AtlasProposal,
  type GovernanceMode,
} from '@/lib/substrate/atlas';
import {
  getAtlasModuleState,
  getAtlasHealth,
  getAtlasResilience,
} from '@/lib/substrate/atlas/module';

export interface UseAtlasReturn {
  state: ReturnType<typeof useQuery>;
  moduleState: ReturnType<typeof useQuery>;
  pendingProposals: ReturnType<typeof useQuery>;
  history: ReturnType<typeof useQuery>;
  controls: ReturnType<typeof useQuery>;
  health: ReturnType<typeof useQuery>;
  resilience: ReturnType<typeof useQuery>;
  submit: ReturnType<typeof useMutation>;
  decide: ReturnType<typeof useMutation>;
  setMode: ReturnType<typeof useMutation>;
  setSeba: ReturnType<typeof useMutation>;
  setThrottle: ReturnType<typeof useMutation>;
  setVelocity: ReturnType<typeof useMutation>;
}

export function useAtlas(): UseAtlasReturn {
  const queryClient = useQueryClient();
  const pollingEnabled = debugMode.allowModulePolling();

  const invalidateAtlas = () => {
    queryClient.invalidateQueries({ queryKey: ['substrate', 'atlas'] });
  };

  const state = useQuery({
    queryKey: ['substrate', 'atlas', 'state'],
    queryFn: () => Promise.resolve(getAtlasState()),
    refetchInterval: pollingEnabled ? 30000 : false,
    staleTime: 10000,
    enabled: pollingEnabled,
  });

  const moduleState = useQuery({
    queryKey: ['substrate', 'atlas', 'module-state'],
    queryFn: () => Promise.resolve(getAtlasModuleState()),
    refetchInterval: pollingEnabled ? 30000 : false,
    staleTime: 15000,
    enabled: pollingEnabled,
  });

  const pendingProposals = useQuery({
    queryKey: ['substrate', 'atlas', 'pending'],
    queryFn: () => Promise.resolve(getPendingProposals()),
    refetchInterval: pollingEnabled ? 20000 : false,
    staleTime: 10000,
    enabled: pollingEnabled,
  });

  const history = useQuery({
    queryKey: ['substrate', 'atlas', 'history'],
    queryFn: () => Promise.resolve(getProposalHistory(50)),
    refetchInterval: pollingEnabled ? 60000 : false,
    staleTime: 30000,
    enabled: pollingEnabled,
  });

  const controls = useQuery({
    queryKey: ['substrate', 'atlas', 'controls'],
    queryFn: () => Promise.resolve(getSystemControls()),
    refetchInterval: pollingEnabled ? 60000 : false,
    staleTime: 30000,
    enabled: pollingEnabled,
  });

  const health = useQuery({
    queryKey: ['substrate', 'atlas', 'health'],
    queryFn: () => Promise.resolve(getAtlasHealth()),
    refetchInterval: pollingEnabled ? 30000 : false,
    staleTime: 15000,
    enabled: pollingEnabled,
  });

  const resilience = useQuery({
    queryKey: ['substrate', 'atlas', 'resilience'],
    queryFn: () => Promise.resolve(getAtlasResilience()),
    refetchInterval: pollingEnabled ? 60000 : false,
    staleTime: 30000,
    enabled: pollingEnabled,
  });

  const submit = useMutation({
    mutationFn: (params: { source: string; title: string; description: string; impact: string; risk?: 'low' | 'medium' | 'high' | 'critical' }) =>
      Promise.resolve(submitProposal(params.source, params.title, params.description, params.impact, params.risk)),
    onSuccess: invalidateAtlas,
  });

  const decide = useMutation({
    mutationFn: (params: { proposalId: string; decision: 'approve' | 'reject' | 'defer'; reason: string }) =>
      Promise.resolve(decideProposal(params.proposalId, params.decision, params.reason)),
    onSuccess: invalidateAtlas,
  });

  const setMode = useMutation({
    mutationFn: (mode: GovernanceMode) => Promise.resolve(setGovernanceMode(mode)),
    onSuccess: invalidateAtlas,
  });

  const setSeba = useMutation({
    mutationFn: (enabled: boolean) => Promise.resolve(setSebaEnabled(enabled)),
    onSuccess: invalidateAtlas,
  });

  const setThrottle = useMutation({
    mutationFn: (throttle: number) => Promise.resolve(setCLMThrottle(throttle)),
    onSuccess: invalidateAtlas,
  });

  const setVelocity = useMutation({
    mutationFn: (velocity: number) => Promise.resolve(setEvolutionVelocity(velocity)),
    onSuccess: invalidateAtlas,
  });

  return {
    state,
    moduleState,
    pendingProposals,
    history,
    controls,
    health,
    resilience,
    submit,
    decide,
    setMode,
    setSeba,
    setThrottle,
    setVelocity,
  };
}

export default useAtlas;
