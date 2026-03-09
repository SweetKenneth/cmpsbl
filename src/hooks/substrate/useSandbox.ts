/**
 * useSandbox Hook v11.0.0 — SANDBOX module full-spectrum operations
 * Exposes 18 queries/mutations covering creation, execution, snapshots,
 * diagnostics, reaper, purge, resource limits, and audit trail.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { debugMode } from '@/lib/debug-mode';
import * as sandboxModule from '@/lib/substrate/sandbox-module';

const QK = ['substrate', 'sandbox'] as const;
const invalidate = (qc: ReturnType<typeof useQueryClient>) =>
  qc.invalidateQueries({ queryKey: [...QK] });

export interface UseSandboxReturn {
  // Queries
  state: ReturnType<typeof useQuery>;
  diagnostics: ReturnType<typeof useQuery>;
  list: ReturnType<typeof useQuery>;
  auditTrail: ReturnType<typeof useQuery>;
  replayBuffer: ReturnType<typeof useQuery>;
  // Mutations
  create: ReturnType<typeof useMutation>;
  execute: ReturnType<typeof useMutation>;
  teardown: ReturnType<typeof useMutation>;
  snapshot: ReturnType<typeof useMutation>;
  restore: ReturnType<typeof useMutation>;
  setLimits: ReturnType<typeof useMutation>;
  reapExpired: ReturnType<typeof useMutation>;
  purgeDestroyed: ReturnType<typeof useMutation>;
}

export function useSandbox(): UseSandboxReturn {
  const qc = useQueryClient();
  const polling = debugMode.allowModulePolling();

  const state = useQuery({
    queryKey: [...QK, 'state'],
    queryFn: () => sandboxModule.getSandboxState(),
    refetchInterval: polling ? 30000 : false,
    staleTime: 10000,
    enabled: polling,
  });

  const diagnostics = useQuery({
    queryKey: [...QK, 'diagnostics'],
    queryFn: () => sandboxModule.getSandboxDiagnostics(),
    refetchInterval: polling ? 45000 : false,
    staleTime: 15000,
    enabled: polling,
  });

  const list = useQuery({
    queryKey: [...QK, 'list'],
    queryFn: () => sandboxModule.listSandboxes(),
    refetchInterval: polling ? 30000 : false,
    staleTime: 10000,
    enabled: polling,
  });

  const auditTrail = useQuery({
    queryKey: [...QK, 'audit'],
    queryFn: () => sandboxModule.getSandboxAuditTrail(100),
    staleTime: 15000,
    enabled: polling,
  });

  const replayBuffer = useQuery({
    queryKey: [...QK, 'replay'],
    queryFn: () => sandboxModule.getSandboxReplayBuffer(50),
    staleTime: 15000,
    enabled: polling,
  });

  const create = useMutation({
    mutationFn: (params?: { ttl?: string; isolation?: 'standard' | 'strict' | 'hermetic'; resourceLimits?: Partial<sandboxModule.ResourceLimits> }) =>
      Promise.resolve(sandboxModule.createSandbox(params)),
    onSuccess: () => invalidate(qc),
  });

  const execute = useMutation({
    mutationFn: (params: { sandboxId: string; code: string }) =>
      Promise.resolve(sandboxModule.execute(params.sandboxId, params.code)),
    onSuccess: () => invalidate(qc),
  });

  const teardown = useMutation({
    mutationFn: (params: { sandboxId: string }) => {
      sandboxModule.teardown(params.sandboxId);
      return Promise.resolve();
    },
    onSuccess: () => invalidate(qc),
  });

  const snapshot = useMutation({
    mutationFn: (params: { sandboxId: string }) =>
      Promise.resolve(sandboxModule.createSnapshot(params.sandboxId)),
    onSuccess: () => invalidate(qc),
  });

  const restore = useMutation({
    mutationFn: (params: { sandboxId: string; snapshotId?: string }) =>
      Promise.resolve(sandboxModule.restoreSnapshot(params.sandboxId, params.snapshotId)),
    onSuccess: () => invalidate(qc),
  });

  const setLimits = useMutation({
    mutationFn: (params: { sandboxId: string; limits: Partial<sandboxModule.ResourceLimits> }) =>
      Promise.resolve(sandboxModule.setResourceLimits(params.sandboxId, params.limits)),
    onSuccess: () => invalidate(qc),
  });

  const reapExpired = useMutation({
    mutationFn: () => Promise.resolve(sandboxModule.reapExpired()),
    onSuccess: () => invalidate(qc),
  });

  const purgeDestroyed = useMutation({
    mutationFn: () => Promise.resolve(sandboxModule.purgeDestroyed()),
    onSuccess: () => invalidate(qc),
  });

  return {
    state, diagnostics, list, auditTrail, replayBuffer,
    create, execute, teardown, snapshot, restore, setLimits, reapExpired, purgeDestroyed,
  };
}
