/**
 * useEncode Hook
 * v10.5.4 ARCHITECT — Dedicated hook for ENCODE module operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { debugMode } from '@/lib/debug-mode';
import {
  getEncodeState,
  getEncodeHealth,
  getTaskQueue,
  getReceipts,
  initEncode,
  type EncodeModuleState,
  type EncodeTaskPacket,
  type EncodeTaskResult,
} from '@/lib/substrate/encode-module/index';
import {
  routeFromDecode,
  completeAndWriteback,
} from '@/lib/substrate/encode-module/pipeline';
import { runEncodeCLMCycle } from '@/lib/substrate/encode-module/clm';

export interface UseEncodeReturn {
  state: ReturnType<typeof useQuery>;
  health: number;
  queue: EncodeTaskPacket[];
  receipts: EncodeTaskResult[];
  
  init: ReturnType<typeof useMutation>;
  routeIntent: ReturnType<typeof useMutation>;
  complete: ReturnType<typeof useMutation>;
  runCLM: ReturnType<typeof useMutation>;
}

export function useEncode(): UseEncodeReturn {
  const queryClient = useQueryClient();
  const pollingEnabled = debugMode.allowModulePolling();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['substrate', 'encode'] });
  };

  const state = useQuery({
    queryKey: ['substrate', 'encode', 'state'],
    queryFn: () => getEncodeState(),
    refetchInterval: pollingEnabled ? 30000 : false,
    staleTime: 15000,
    enabled: pollingEnabled,
  });

  const encodeState = state.data;
  const health = encodeState ? getEncodeHealth() : 0;
  const queue = encodeState?.taskQueue || [];
  const receipts = encodeState?.receipts || [];

  const init = useMutation({
    mutationFn: () => Promise.resolve(initEncode()),
    onSuccess: invalidate,
  });

  const routeIntent = useMutation({
    mutationFn: (params: { intent: string; surface?: EncodeTaskPacket['targetSurface']; brainKeys?: string[] }) =>
      routeFromDecode(params.intent, {
        targetSurface: params.surface,
        brainKeys: params.brainKeys,
      }),
    onSuccess: invalidate,
  });

  const complete = useMutation({
    mutationFn: (params: { taskId: string; success: boolean; artifacts: any[]; learnings: string[]; executionMs: number }) =>
      completeAndWriteback(params.taskId, params),
    onSuccess: invalidate,
  });

  const runCLM = useMutation({
    mutationFn: () => runEncodeCLMCycle(),
    onSuccess: invalidate,
  });

  return {
    state,
    health,
    queue,
    receipts,
    init,
    routeIntent,
    complete,
    runCLM,
  };
}

export default useEncode;
