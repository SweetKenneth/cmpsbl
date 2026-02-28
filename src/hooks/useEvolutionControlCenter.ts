/**
 * useEvolutionControlCenter — data hook for the Evolution Control Center
 * Powers: dry-run preview, rollback, scan trends, false positive feedback
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { previewDryRun, type DryRunConfig, type DryRunResult } from '@/lib/evolve/dry-run-preview';
import { evolutionSnapshots, type EvolutionSnapshot } from '@/lib/evolve/evolution-snapshots';
import type { EvolutionMetrics } from '@/lib/evolve/evolution-delta';
import { toast } from 'sonner';

// ── Evolution Runs ──────────────────────────────────────────

export function useEvolutionRuns(limit = 30) {
  return useQuery({
    queryKey: ['evolution-cc', 'runs', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('evolution_runs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 15_000,
  });
}

// ── Evolution Receipts (for trend data) ─────────────────────

export function useEvolutionReceipts(limit = 50) {
  return useQuery({
    queryKey: ['evolution-cc', 'receipts', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('evolution_receipts')
        .select('*')
        .order('timestamp', { ascending: true })
        .limit(limit);
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 30_000,
  });
}

// ── Snapshots ───────────────────────────────────────────────

export function useEvolutionSnapshots(tenantId = 'global', limit = 20) {
  return useQuery({
    queryKey: ['evolution-cc', 'snapshots', tenantId, limit],
    queryFn: () => evolutionSnapshots.listSnapshots(tenantId, limit),
    staleTime: 30_000,
  });
}

export function useRestoreSnapshot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ snapshotId, restoredBy }: { snapshotId: string; restoredBy: string }) => {
      const result = await evolutionSnapshots.markRestored(snapshotId, restoredBy);
      if (!result.success) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      toast.success('Snapshot restored successfully');
      qc.invalidateQueries({ queryKey: ['evolution-cc'] });
    },
    onError: (err: Error) => toast.error(`Restore failed: ${err.message}`),
  });
}

// ── Dry-Run Preview ─────────────────────────────────────────

export function useDryRunPreview() {
  return useMutation({
    mutationFn: async (config: DryRunConfig): Promise<DryRunResult> => {
      return previewDryRun(config);
    },
  });
}

// ── False Positive Feedback ─────────────────────────────────

export interface FindingFeedback {
  finding_fingerprint: string;
  finding_title: string;
  verdict: 'true_positive' | 'false_positive' | 'needs_review';
  reason?: string;
  submitted_at: string;
}

// In-memory store (persists via scan-run-identity suppression system)
const feedbackStore = new Map<string, FindingFeedback>();

export function useSubmitFindingFeedback() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (feedback: Omit<FindingFeedback, 'submitted_at'>) => {
      const entry: FindingFeedback = {
        ...feedback,
        submitted_at: new Date().toISOString(),
      };
      feedbackStore.set(feedback.finding_fingerprint, entry);
      return entry;
    },
    onSuccess: (entry) => {
      const label = entry.verdict === 'false_positive' ? 'marked as false positive' : 
                    entry.verdict === 'true_positive' ? 'confirmed' : 'flagged for review';
      toast.success(`Finding ${label}`);
      qc.invalidateQueries({ queryKey: ['evolution-cc', 'feedback'] });
    },
  });
}

export function useFindingFeedback() {
  return useQuery({
    queryKey: ['evolution-cc', 'feedback'],
    queryFn: () => Array.from(feedbackStore.values()),
    staleTime: 5_000,
  });
}

// ── Scan History (from analytics_snapshots) ─────────────────

export function useScanHistory(limit = 30) {
  return useQuery({
    queryKey: ['evolution-cc', 'scan-history', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('analytics_snapshots')
        .select('*')
        .eq('snapshot_type', 'system')
        .order('created_at', { ascending: true })
        .limit(limit);
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 60_000,
  });
}
