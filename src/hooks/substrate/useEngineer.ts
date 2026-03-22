/**
 * useEngineer Hook — ENGINEER node operations
 * Engine & Meta-Engine Maintenance Intelligence (Node 39)
 * Full capability surface: health monitoring, proposals, CLM study, maintenance
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { debugMode } from '@/lib/debug-mode';
import {
  getEngineerState,
  getEngineerStats,
  getProposals,
  getDegradedEngines,
  getAllEngineHealth,
  getStudyQueue,
  getActiveStudy,
  getNextStudyFocus,
  getPendingProposals,
  getEngineHealthByCategory,
  initializeEngineer,
  runMaintenanceCycle,
  createProposal,
  updateProposalStatus,
  recordEngineHealth,
  addStudyFocus,
  completeStudy,
  setActiveStudy,
  generateDynamicCLMTopics,
  type EngineerProposal,
  type CLMStudyFocus,
} from '@/lib/substrate/engineer/engineer-core';

export interface UseEngineerReturn {
  // Queries
  state: ReturnType<typeof useQuery>;
  stats: ReturnType<typeof useQuery>;
  proposals: ReturnType<typeof useQuery>;
  pendingProposals: ReturnType<typeof useQuery>;
  degradedEngines: ReturnType<typeof useQuery>;
  allEngines: ReturnType<typeof useQuery>;
  studyQueue: ReturnType<typeof useQuery>;
  activeStudy: ReturnType<typeof useQuery>;

  // Lifecycle
  init: ReturnType<typeof useMutation>;
  runCycle: ReturnType<typeof useMutation>;

  // Proposals
  createProposal: ReturnType<typeof useMutation>;
  updateProposalStatus: ReturnType<typeof useMutation>;

  // Engine health
  recordHealth: ReturnType<typeof useMutation>;

  // CLM study
  addStudyFocus: ReturnType<typeof useMutation>;
  completeStudy: ReturnType<typeof useMutation>;
  generateTopics: ReturnType<typeof useMutation>;
}

export function useEngineer(): UseEngineerReturn {
  const queryClient = useQueryClient();
  const pollingEnabled = debugMode.allowModulePolling();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['substrate', 'engineer'] });

  // ═══ QUERIES ═══

  const state = useQuery({
    queryKey: ['substrate', 'engineer', 'state'],
    queryFn: () => Promise.resolve(getEngineerState()),
    refetchInterval: pollingEnabled ? 30000 : false,
    staleTime: 10000,
    enabled: pollingEnabled,
  });

  const stats = useQuery({
    queryKey: ['substrate', 'engineer', 'stats'],
    queryFn: () => Promise.resolve(getEngineerStats()),
    refetchInterval: pollingEnabled ? 60000 : false,
    staleTime: 30000,
    enabled: pollingEnabled,
  });

  const proposals = useQuery({
    queryKey: ['substrate', 'engineer', 'proposals'],
    queryFn: () => Promise.resolve(getProposals()),
    refetchInterval: pollingEnabled ? 60000 : false,
    staleTime: 30000,
    enabled: pollingEnabled,
  });

  const pendingProposals = useQuery({
    queryKey: ['substrate', 'engineer', 'pending-proposals'],
    queryFn: () => Promise.resolve(getPendingProposals()),
    refetchInterval: pollingEnabled ? 30000 : false,
    staleTime: 15000,
    enabled: pollingEnabled,
  });

  const degradedEngines = useQuery({
    queryKey: ['substrate', 'engineer', 'degraded'],
    queryFn: () => Promise.resolve(getDegradedEngines()),
    refetchInterval: pollingEnabled ? 30000 : false,
    staleTime: 15000,
    enabled: pollingEnabled,
  });

  const allEngines = useQuery({
    queryKey: ['substrate', 'engineer', 'engines'],
    queryFn: () => Promise.resolve(getAllEngineHealth()),
    refetchInterval: pollingEnabled ? 60000 : false,
    staleTime: 30000,
    enabled: pollingEnabled,
  });

  const studyQueue = useQuery({
    queryKey: ['substrate', 'engineer', 'study-queue'],
    queryFn: () => Promise.resolve(getStudyQueue()),
    refetchInterval: pollingEnabled ? 60000 : false,
    staleTime: 30000,
    enabled: pollingEnabled,
  });

  const activeStudyQuery = useQuery({
    queryKey: ['substrate', 'engineer', 'active-study'],
    queryFn: () => Promise.resolve(getActiveStudy()),
    refetchInterval: pollingEnabled ? 30000 : false,
    staleTime: 15000,
    enabled: pollingEnabled,
  });

  // ═══ LIFECYCLE ═══

  const init = useMutation({
    mutationFn: () => Promise.resolve(initializeEngineer()),
    onSuccess: invalidate,
  });

  const runCycle = useMutation({
    mutationFn: () => runMaintenanceCycle(),
    onSuccess: invalidate,
  });

  // ═══ PROPOSALS ═══

  const createProposalMut = useMutation({
    mutationFn: (params: {
      type: EngineerProposal['type'];
      priority: EngineerProposal['priority'];
      targetEngine: string;
      targetCategory: string;
      title: string;
      description: string;
      technicalRationale: string;
      estimatedImpact: string;
      estimatedRisk: string;
      studyTopics?: string[];
    }) => Promise.resolve(createProposal(
      params.type, params.priority, params.targetEngine, params.targetCategory,
      params.title, params.description, params.technicalRationale,
      params.estimatedImpact, params.estimatedRisk, params.studyTopics,
    )),
    onSuccess: invalidate,
  });

  const updateProposalStatusMut = useMutation({
    mutationFn: (params: { id: string; status: EngineerProposal['status'] }) =>
      Promise.resolve(updateProposalStatus(params.id, params.status)),
    onSuccess: invalidate,
  });

  // ═══ ENGINE HEALTH ═══

  const recordHealthMut = useMutation({
    mutationFn: (params: { engineId: string; category: string; health: number; issues?: string[] }) =>
      Promise.resolve(recordEngineHealth(params.engineId, params.category, params.health, params.issues)),
    onSuccess: invalidate,
  });

  // ═══ CLM STUDY ═══

  const addStudyFocusMut = useMutation({
    mutationFn: (params: { topic: string; engineId: string; reason: string; priority: number }) =>
      Promise.resolve(addStudyFocus(params.topic, params.engineId, params.reason, params.priority)),
    onSuccess: invalidate,
  });

  const completeStudyMut = useMutation({
    mutationFn: (params: { topic: string; findings: string[] }) =>
      Promise.resolve(completeStudy(params.topic, params.findings)),
    onSuccess: invalidate,
  });

  const generateTopicsMut = useMutation({
    mutationFn: () => Promise.resolve(generateDynamicCLMTopics()),
  });

  return {
    state, stats, proposals, pendingProposals, degradedEngines, allEngines, studyQueue,
    activeStudy: activeStudyQuery,
    init, runCycle,
    createProposal: createProposalMut, updateProposalStatus: updateProposalStatusMut,
    recordHealth: recordHealthMut,
    addStudyFocus: addStudyFocusMut, completeStudy: completeStudyMut, generateTopics: generateTopicsMut,
  };
}

export default useEngineer;
