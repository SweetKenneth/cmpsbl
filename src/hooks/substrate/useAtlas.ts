/**
 * useAtlas Hook — ATLAS Primitive operations
 * Governance Authority & System Control (Primitive 40)
 * Part of the Plane sector — 40-Primitive / 12-Sector Architecture
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
  setCapabilityRegistryLocked,
  type AtlasProposal,
  type GovernanceMode,
} from '@/lib/substrate/atlas';
import {
  initAtlas,
  getAtlasModuleState,
  getAtlasHealth,
  getAtlasResilience,
  getAtlasHardening,
  upgradeAtlasEngine,
} from '@/lib/substrate/atlas/module';
import { runAtlasCLM } from '@/lib/substrate/atlas/clm';

export interface UseAtlasReturn {
  // Queries
  state: ReturnType<typeof useQuery>;
  moduleState: ReturnType<typeof useQuery>;
  pendingProposals: ReturnType<typeof useQuery>;
  history: ReturnType<typeof useQuery>;
  controls: ReturnType<typeof useQuery>;
  health: ReturnType<typeof useQuery>;
  resilience: ReturnType<typeof useQuery>;
  hardening: ReturnType<typeof useQuery>;

  // Lifecycle
  init: ReturnType<typeof useMutation>;
  upgradeEngine: ReturnType<typeof useMutation>;
  runCLM: ReturnType<typeof useMutation>;

  // Proposal lifecycle
  submit: ReturnType<typeof useMutation>;
  decide: ReturnType<typeof useMutation>;

  // System controls
  setMode: ReturnType<typeof useMutation>;
  setSeba: ReturnType<typeof useMutation>;
  setThrottle: ReturnType<typeof useMutation>;
  setVelocity: ReturnType<typeof useMutation>;
  setCapabilityLock: ReturnType<typeof useMutation>;
}

export function useAtlas(): UseAtlasReturn {
  const queryClient = useQueryClient();
  const pollingEnabled = debugMode.allowModulePolling();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['substrate', 'atlas'] });

  // ═══ QUERIES ═══

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

  const hardeningQuery = useQuery({
    queryKey: ['substrate', 'atlas', 'hardening'],
    queryFn: () => Promise.resolve(getAtlasHardening()),
    refetchInterval: pollingEnabled ? 60000 : false,
    staleTime: 30000,
    enabled: pollingEnabled,
  });

  // ═══ LIFECYCLE ═══

  const init = useMutation({
    mutationFn: () => Promise.resolve(initAtlas()),
    onSuccess: invalidate,
  });

  const upgradeEngine = useMutation({
    mutationFn: (params: { version: string }) => Promise.resolve(upgradeAtlasEngine(params.version)),
    onSuccess: invalidate,
  });

  const runCLM = useMutation({
    mutationFn: () => {
      const ms = getAtlasModuleState();
      return Promise.resolve(runAtlasCLM(ms));
    },
    onSuccess: invalidate,
  });

  // ═══ PROPOSAL LIFECYCLE ═══

  const submit = useMutation({
    mutationFn: (params: { source: string; title: string; description: string; impact: string; risk?: 'low' | 'medium' | 'high' | 'critical' }) =>
      Promise.resolve(submitProposal(params.source, params.title, params.description, params.impact, params.risk)),
    onSuccess: invalidate,
  });

  const decide = useMutation({
    mutationFn: (params: { proposalId: string; decision: 'approve' | 'reject' | 'defer'; reason: string }) =>
      Promise.resolve(decideProposal(params.proposalId, params.decision, params.reason)),
    onSuccess: invalidate,
  });

  // ═══ SYSTEM CONTROLS ═══

  const setMode = useMutation({
    mutationFn: (mode: GovernanceMode) => Promise.resolve(setGovernanceMode(mode)),
    onSuccess: invalidate,
  });

  const setSeba = useMutation({
    mutationFn: (enabled: boolean) => Promise.resolve(setSebaEnabled(enabled)),
    onSuccess: invalidate,
  });

  const setThrottle = useMutation({
    mutationFn: (throttle: number) => Promise.resolve(setCLMThrottle(throttle)),
    onSuccess: invalidate,
  });

  const setVelocity = useMutation({
    mutationFn: (velocity: number) => Promise.resolve(setEvolutionVelocity(velocity)),
    onSuccess: invalidate,
  });

  const setCapabilityLock = useMutation({
    mutationFn: (locked: boolean) => Promise.resolve(setCapabilityRegistryLocked(locked)),
    onSuccess: invalidate,
  });

  return {
    state, moduleState, pendingProposals, history, controls, health, resilience,
    hardening: hardeningQuery,
    init, upgradeEngine, runCLM,
    submit, decide,
    setMode, setSeba, setThrottle, setVelocity, setCapabilityLock,
  };
}

export default useAtlas;
