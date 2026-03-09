/**
 * useEcho Hook — ECHO module operations
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { debugMode } from '@/lib/debug-mode';
import * as echoModule from '@/lib/substrate/echo';

export interface UseEchoReturn {
  state: ReturnType<typeof useQuery>;
  createTwin: ReturnType<typeof useMutation>;
  runScenario: ReturnType<typeof useMutation>;
  syncTwin: ReturnType<typeof useMutation>;
}

export function useEcho(): UseEchoReturn {
  const queryClient = useQueryClient();
  const pollingEnabled = debugMode.allowModulePolling();

  const state = useQuery({
    queryKey: ['substrate', 'echo', 'state'],
    queryFn: () => echoModule.getEchoState(),
    refetchInterval: pollingEnabled ? 30000 : false,
    staleTime: 10000,
    enabled: pollingEnabled,
  });

  const createTwin = useMutation({
    mutationFn: (params: { name: string; entityType: string; initialState: Record<string, number>; parameters?: Record<string, number> }) =>
      Promise.resolve(echoModule.createTwin(params.name, params.entityType, params.initialState, params.parameters)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['substrate', 'echo'] }),
  });

  const runScenario = useMutation({
    mutationFn: (params: { twinId: string; name: string; interventions: echoModule.Intervention[]; steps?: number }) =>
      Promise.resolve(echoModule.runScenario(params.twinId, params.name, params.interventions, params.steps)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['substrate', 'echo'] }),
  });

  const syncTwin = useMutation({
    mutationFn: (params: { twinId: string; realWorldState: Record<string, number> }) =>
      Promise.resolve(echoModule.syncTwin(params.twinId, params.realWorldState)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['substrate', 'echo'] }),
  });

  return { state, createTwin, runScenario, syncTwin };
}
