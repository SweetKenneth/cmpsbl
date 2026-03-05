/**
 * useEncode Hook
 * Dedicated hook for ENCODE module operations
 * Includes planning layer, escalation processing, discussion channel,
 * and orchestration layer integration.
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
  planFromIntent,
  routeFromDecode,
  completeAndWriteback,
} from '@/lib/substrate/encode-module/pipeline';
import { runEncodeCLMCycle } from '@/lib/substrate/encode-module/clm';
import { processEscalations } from '@/lib/substrate/encode-module/escalation-processor';
import { getEscalationTelemetry, type EscalationTelemetrySnapshot } from '@/lib/substrate/encode-module/escalation-telemetry';
import {
  askQuestion,
  raiseRisk,
  requestClarification,
  respondToDiscussion,
  signalReady,
  getDiscussion,
  allQuestionsResolved,
  unresolvedCount,
  type DiscussionMessage,
} from '@/lib/substrate/encode-module/discussion';
import {
  approvePlan,
  rejectPlan,
  listPlans,
  loadPlan,
  type PatchPlan,
  type PlanStatus,
} from '@/lib/substrate/plans';

export interface UseEncodeReturn {
  state: ReturnType<typeof useQuery>;
  health: number;
  queue: EncodeTaskPacket[];
  receipts: EncodeTaskResult[];
  escalationTelemetry: EscalationTelemetrySnapshot | null;
  
  // Plan lifecycle
  generatePlan: ReturnType<typeof useMutation>;
  approvePlanMutation: ReturnType<typeof useMutation>;
  rejectPlanMutation: ReturnType<typeof useMutation>;
  plans: PatchPlan[];
  
  // Discussion channel
  discussion: {
    ask: ReturnType<typeof useMutation>;
    risk: ReturnType<typeof useMutation>;
    clarify: ReturnType<typeof useMutation>;
    respond: ReturnType<typeof useMutation>;
    ready: ReturnType<typeof useMutation>;
    getThread: (planId: string) => Promise<DiscussionMessage[]>;
    allResolved: (planId: string) => Promise<boolean>;
    unresolvedCount: (planId: string) => Promise<number>;
  };

  // Existing mutations
  init: ReturnType<typeof useMutation>;
  routeIntent: ReturnType<typeof useMutation>;
  complete: ReturnType<typeof useMutation>;
  runCLM: ReturnType<typeof useMutation>;
  processEscalationQueue: ReturnType<typeof useMutation>;
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

  // Escalation telemetry snapshot
  let escalationTelemetry: EscalationTelemetrySnapshot | null = null;
  try {
    escalationTelemetry = getEscalationTelemetry();
  } catch { /* not loaded */ }

  const init = useMutation({
    mutationFn: () => Promise.resolve(initEncode()),
    onSuccess: invalidate,
  });

  // ── PLAN STAGE ──
  const generatePlan = useMutation({
    mutationFn: (params: { intent: string; modules?: string[]; targetSurface?: EncodeTaskPacket['targetSurface'] }) =>
      planFromIntent(params.intent, {
        modules: params.modules,
        targetSurface: params.targetSurface,
      }),
    onSuccess: invalidate,
  });

  const approvePlanMutation = useMutation({
    mutationFn: (params: { planId: string; approver?: string }) =>
      Promise.resolve(approvePlan(params.planId, params.approver)),
    onSuccess: invalidate,
  });

  const rejectPlanMutation = useMutation({
    mutationFn: (params: { planId: string; reason: string }) =>
      Promise.resolve(rejectPlan(params.planId, params.reason)),
    onSuccess: invalidate,
  });

  // ── ROUTE (now requires plan_id) ──
  const routeIntent = useMutation({
    mutationFn: (params: { intent: string; plan_id: string; surface?: EncodeTaskPacket['targetSurface']; brainKeys?: string[] }) =>
      routeFromDecode(params.intent, {
        plan_id: params.plan_id,
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

  const processEscalationQueue = useMutation({
    mutationFn: (params?: { limit?: number }) => processEscalations(params?.limit ?? 10),
    onSuccess: invalidate,
  });

  // ── DISCUSSION CHANNEL ──
  const discussionAsk = useMutation({
    mutationFn: (params: { planId: string; message: string }) =>
      askQuestion(params.planId, params.message),
  });

  const discussionRisk = useMutation({
    mutationFn: (params: { planId: string; risk: string }) =>
      raiseRisk(params.planId, params.risk),
  });

  const discussionClarify = useMutation({
    mutationFn: (params: { planId: string; question: string }) =>
      requestClarification(params.planId, params.question),
  });

  const discussionRespond = useMutation({
    mutationFn: (params: { planId: string; discussionId: string; response: string; from?: 'DECODE' | 'USER' }) =>
      respondToDiscussion(params.planId, params.discussionId, params.response, params.from),
  });

  const discussionReady = useMutation({
    mutationFn: (params: { planId: string }) =>
      signalReady(params.planId),
  });

  return {
    state,
    health,
    queue,
    receipts,
    escalationTelemetry,
    plans: listPlans(),
    generatePlan,
    approvePlanMutation,
    rejectPlanMutation,
    discussion: {
      ask: discussionAsk,
      risk: discussionRisk,
      clarify: discussionClarify,
      respond: discussionRespond,
      ready: discussionReady,
      getThread: getDiscussion,
      allResolved: allQuestionsResolved,
      unresolvedCount: unresolvedCount,
    },
    init,
    routeIntent,
    complete,
    runCLM,
    processEscalationQueue,
  };
}

// Re-export orchestration hook for convenience
export { useEncodeOrchestration } from './useEncodeOrchestration';

export default useEncode;
