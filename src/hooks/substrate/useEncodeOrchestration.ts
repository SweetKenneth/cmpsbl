/**
 * useEncodeOrchestration Hook
 * v11.0.0 — React interface for the ENCODE orchestration layer.
 * Manages conversation relay, execution lock, audit mode, surgical patches, and CLI.
 */

import { useState, useCallback } from 'react';
import {
  submitIntentForReview,
  approveExecution,
  clearSession,
  getConversationState,
  runAuditMode,
  buildAwarenessContract,
  setEncodeMode,
  getEncodeMode,
  createSurgicalPatch,
  applyPatch,
  getPatchHistory,
  getPatchDiff,
  executeEncodeCLI,
  validateResilienceBaseline,
  checkExecutionLock,
  ROLES,
  type ConversationState,
  type EncodeReviewResponse,
  type ArchitectureSnapshot,
  type ArchitecturalAwarenessContract,
  type SurgicalPatch,
  type CLICommand,
  type CLIResult,
  type EncodeMode,
} from '@/lib/substrate/encode-module/orchestration';

export interface UseEncodeOrchestrationReturn {
  // State
  conversation: ConversationState;
  lastReview: EncodeReviewResponse | null;
  snapshot: ArchitectureSnapshot | null;
  mode: EncodeMode;
  roles: typeof ROLES;

  // Conversation
  submitIntent: (intent: string) => EncodeReviewResponse;
  approve: () => { success: boolean; reason?: string };
  clear: () => void;
  refresh: () => void;

  // Audit
  runAudit: () => ArchitectureSnapshot;
  getContract: (module: string) => ArchitecturalAwarenessContract | { error: string };

  // Surgical
  switchMode: (mode: EncodeMode) => { success: boolean; error?: string };
  createPatch: (params: Parameters<typeof createSurgicalPatch>[0]) => SurgicalPatch | { error: string };
  applyPatch: (patchId: string) => { success: boolean; error?: string };
  patches: SurgicalPatch[];
  diffPatch: (patchId: string) => ReturnType<typeof getPatchDiff>;

  // CLI
  runCLI: (command: CLICommand, target?: string) => CLIResult;

  // Resilience
  checkResilience: (code: string) => { pass: boolean; missing: string[] };

  // Lock status
  isLocked: boolean;
  lockReason: string | null;
}

export function useEncodeOrchestration(): UseEncodeOrchestrationReturn {
  const [conversation, setConversation] = useState<ConversationState>(getConversationState());
  const [lastReview, setLastReview] = useState<EncodeReviewResponse | null>(null);
  const [snapshot, setSnapshot] = useState<ArchitectureSnapshot | null>(null);

  const refresh = useCallback(() => {
    setConversation(getConversationState());
  }, []);

  const submitIntent = useCallback((intent: string) => {
    const review = submitIntentForReview(intent);
    setLastReview(review);
    refresh();
    return review;
  }, [refresh]);

  const approve = useCallback(() => {
    const result = approveExecution();
    refresh();
    return result;
  }, [refresh]);

  const clear = useCallback(() => {
    clearSession();
    setLastReview(null);
    setSnapshot(null);
    refresh();
  }, [refresh]);

  const runAudit = useCallback(() => {
    const snap = runAuditMode();
    setSnapshot(snap);
    refresh();
    return snap;
  }, [refresh]);

  const getContract = useCallback((module: string) => {
    return buildAwarenessContract(module);
  }, []);

  const switchMode = useCallback((mode: EncodeMode) => {
    const result = setEncodeMode(mode);
    refresh();
    return result;
  }, [refresh]);

  const createPatchFn = useCallback((params: Parameters<typeof createSurgicalPatch>[0]) => {
    const result = createSurgicalPatch(params);
    refresh();
    return result;
  }, [refresh]);

  const applyPatchFn = useCallback((patchId: string) => {
    const result = applyPatch(patchId);
    refresh();
    return result;
  }, [refresh]);

  const runCLI = useCallback((command: CLICommand, target?: string) => {
    const result = executeEncodeCLI(command, target);
    refresh();
    return result;
  }, [refresh]);

  const lock = checkExecutionLock();

  return {
    conversation,
    lastReview,
    snapshot,
    mode: getEncodeMode(),
    roles: ROLES,
    submitIntent,
    approve,
    clear,
    refresh,
    runAudit,
    getContract,
    switchMode,
    createPatch: createPatchFn,
    applyPatch: applyPatchFn,
    patches: getPatchHistory(),
    diffPatch: getPatchDiff,
    runCLI,
    checkResilience: validateResilienceBaseline,
    isLocked: !lock.allowed,
    lockReason: lock.error ?? null,
  };
}

export default useEncodeOrchestration;
