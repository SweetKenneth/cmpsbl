/**
 * useEngineer Hook — ENGINEER node operations
 * Engine & Meta-Engine Maintenance Intelligence (Node 39)
 * Part of the Plane sector — 40-Node / 12-Sector Architecture
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
  runMaintenanceCycle,
  type EngineerProposal,
  type EngineHealthSnapshot,
  type CLMStudyFocus,
} from '@/lib/substrate/engineer/engineer-core';

export interface UseEngineerReturn {
  state: ReturnType<typeof useQuery>;
  stats: ReturnType<typeof useQuery>;
  proposals: ReturnType<typeof useQuery>;
  degradedEngines: ReturnType<typeof useQuery>;
  allEngines: ReturnType<typeof useQuery>;
  studyQueue: ReturnType<typeof useQuery>;
  runCycle: ReturnType<typeof useMutation>;
}

export function useEngineer(): UseEngineerReturn {
  const queryClient = useQueryClient();
  const pollingEnabled = debugMode.allowModulePolling();

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

  const runCycle = useMutation({
    mutationFn: () => runMaintenanceCycle(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['substrate', 'engineer'] });
    },
  });

  return {
    state,
    stats,
    proposals,
    degradedEngines,
    allEngines,
    studyQueue,
    runCycle,
  };
}

export default useEngineer;
