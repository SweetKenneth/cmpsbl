/**
 * React hooks for Hybrid Dream Learning System
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  triggerLocalDreamCycle,
  triggerGlobalDreamCycle,
  getLocalImprovements,
  getGlobalImprovements,
  applyGlobalImprovement,
  getDreamCycleLogs,
  getDreamLearningMetrics,
  getDreamConsent,
  updateDreamConsent,
  exportDreamMemory,
  type DreamConsent,
} from '../dream/hybridDreamSystem';

/**
 * Hook for fetching local dream improvements
 */
export function useLocalImprovements(agencyId: string | undefined) {
  return useQuery({
    queryKey: ['agency-local-improvements', agencyId],
    queryFn: () => getLocalImprovements(agencyId!),
    enabled: !!agencyId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook for fetching global brain improvements
 */
export function useGlobalImprovements() {
  return useQuery({
    queryKey: ['global-brain-improvements'],
    queryFn: getGlobalImprovements,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook for dream cycle logs
 */
export function useDreamCycleLogs(agencyId: string | null) {
  return useQuery({
    queryKey: ['dream-cycle-logs', agencyId],
    queryFn: () => getDreamCycleLogs(agencyId),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook for dream learning metrics
 */
export function useDreamLearningMetrics(agencyId: string | null) {
  return useQuery({
    queryKey: ['dream-learning-metrics', agencyId],
    queryFn: () => getDreamLearningMetrics(agencyId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook for dream consent settings
 */
export function useDreamConsent(agencyId: string | undefined) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['dream-consent', agencyId],
    queryFn: () => getDreamConsent(agencyId!),
    enabled: !!agencyId,
  });

  const mutation = useMutation({
    mutationFn: (updates: Partial<DreamConsent>) =>
      updateDreamConsent(agencyId!, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dream-consent', agencyId] });
      toast.success('Dream consent settings updated');
    },
    onError: () => {
      toast.error('Failed to update dream consent');
    },
  });

  return {
    consent: query.data,
    isLoading: query.isLoading,
    updateConsent: mutation.mutate,
    isUpdating: mutation.isPending,
  };
}

/**
 * Hook for triggering local dream cycle
 */
export function useTriggerLocalDream(agencyId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => triggerLocalDreamCycle(agencyId!),
    onSuccess: (data) => {
      if (data.success) {
        toast.success('Local dream cycle started');
        queryClient.invalidateQueries({ queryKey: ['dream-cycle-logs', agencyId] });
        queryClient.invalidateQueries({ queryKey: ['agency-local-improvements', agencyId] });
      } else {
        toast.error('Failed to start local dream cycle');
      }
    },
    onError: () => {
      toast.error('Failed to trigger local dream cycle');
    },
  });
}

/**
 * Hook for triggering global dream cycle (admin)
 */
export function useTriggerGlobalDream() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: triggerGlobalDreamCycle,
    onSuccess: (data) => {
      if (data.success) {
        toast.success('Global dream cycle started');
        queryClient.invalidateQueries({ queryKey: ['dream-cycle-logs'] });
        queryClient.invalidateQueries({ queryKey: ['global-brain-improvements'] });
      } else {
        toast.error('Failed to start global dream cycle');
      }
    },
    onError: () => {
      toast.error('Failed to trigger global dream cycle');
    },
  });
}

/**
 * Hook for applying global improvements to local agency
 */
export function useApplyGlobalImprovement(agencyId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (improvementId: string) =>
      applyGlobalImprovement(agencyId!, improvementId),
    onSuccess: (success) => {
      if (success) {
        toast.success('Global improvement applied');
        queryClient.invalidateQueries({ queryKey: ['agency-local-improvements', agencyId] });
        queryClient.invalidateQueries({ queryKey: ['global-brain-improvements'] });
      } else {
        toast.error('Failed to apply improvement');
      }
    },
    onError: () => {
      toast.error('Failed to apply global improvement');
    },
  });
}

/**
 * Hook for exporting dream memory
 */
export function useExportDreamMemory(agencyId: string | undefined) {
  return useMutation({
    mutationFn: () => exportDreamMemory(agencyId!),
    onSuccess: (data) => {
      // Create download
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dream-memory-${agencyId}-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Dream memory exported');
    },
    onError: () => {
      toast.error('Failed to export dream memory');
    },
  });
}
