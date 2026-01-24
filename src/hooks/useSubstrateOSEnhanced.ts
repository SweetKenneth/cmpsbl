/**
 * Enhanced Substrate OS Hooks — Advanced brain operations
 * Mutations for cognitive intelligence features
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { brain, system, dream, vision } from '@/lib/substrate';
import { toast } from 'sonner';

// ═══════════════════════════════════════════════════════════════
// BRAIN INTELLIGENCE MUTATIONS
// ═══════════════════════════════════════════════════════════════

export function useBrainOptimize() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => brain.optimize(),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['substrate', 'brain'] });
      queryClient.invalidateQueries({ queryKey: ['live', 'brain'] });
      if (data.success) {
        toast.success('Memory optimization complete');
      }
    },
    onError: () => {
      toast.error('Memory optimization failed');
    },
  });
}

export function useBrainTiering() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (batchSize?: number) => {
      const { data, error } = await import('@/integrations/supabase/client').then(m => 
        m.supabase.functions.invoke('pf-brain-memory-tiering', {
          body: { batch_size: batchSize || 500 }
        })
      );
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['substrate', 'brain'] });
      queryClient.invalidateQueries({ queryKey: ['live', 'brain'] });
      const stats = data?.stats || {};
      const promoted = stats.promoted_to_hot || 0;
      const demoted = stats.demoted_to_warm || 0;
      const pruned = stats.pruned || 0;
      toast.success(`Tiering complete: ${demoted} demoted, ${promoted} promoted, ${pruned} pruned`);
    },
    onError: (error) => {
      toast.error(`Memory tiering failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    },
  });
}

export function useBrainPrune() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (options?: { dry_run?: boolean }) => {
      const { data, error } = await import('@/integrations/supabase/client').then(m => 
        m.supabase.functions.invoke('pf-brain-memory-prune', {
          body: options || {}
        })
      );
      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['substrate', 'brain'] });
      queryClient.invalidateQueries({ queryKey: ['live', 'brain'] });
      const stats = data?.stats || data?.summary || {};
      const totalPruned = stats.total_pruned || stats.pruned_noise + stats.pruned_duplicates + stats.pruned_low_value || 0;
      if (variables?.dry_run) {
        toast.info(`Prune preview: ${totalPruned} memories would be removed`);
      } else {
        toast.success(`Pruning complete: ${totalPruned} low-value memories removed`);
      }
    },
    onError: (error) => {
      toast.error(`Memory pruning failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    },
  });
}

export function useBrainBatchTiering() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (options?: { batch_size?: number; max_batches?: number }) => {
      const { data, error } = await import('@/integrations/supabase/client').then(m => 
        m.supabase.functions.invoke('pf-brain-batch-tiering', {
          body: options || { batch_size: 500, max_batches: 10 }
        })
      );
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['substrate', 'brain'] });
      queryClient.invalidateQueries({ queryKey: ['live', 'brain'] });
      const stats = data?.stats || {};
      const processed = stats.scored || stats.demoted_to_warm || 0;
      const demoted = stats.demoted_to_warm || 0;
      toast.success(`Batch tiering complete: ${demoted} demoted, ${processed} scored`);
    },
    onError: (error) => {
      toast.error(`Batch tiering failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    },
  });
}

export function useBrainDeepThink() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (query: string, depth?: number) => brain.deepThink(query, depth),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['substrate', 'brain'] });
      if (data.success) {
        toast.success('Deep thinking complete');
      }
    },
    onError: () => {
      toast.error('Deep thinking failed');
    },
  });
}

export function useBrainCognitiveCycle() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => brain.cognitiveCycle(),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['substrate', 'brain'] });
      queryClient.invalidateQueries({ queryKey: ['live'] });
      if (data.success) {
        toast.success('Cognitive cycle complete');
      }
    },
    onError: () => {
      toast.error('Cognitive cycle failed');
    },
  });
}

export function useBrainExplore() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (query: string) => brain.explore(query),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['live', 'curiosity'] });
      if (data.success) {
        toast.success('Exploration initiated');
      }
    },
    onError: () => {
      toast.error('Exploration failed');
    },
  });
}

export function useBrainGraphBuild() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => brain.graphBuild(),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['substrate', 'brain'] });
      if (data.success) {
        toast.success('Knowledge graph updated');
      }
    },
    onError: () => {
      toast.error('Graph build failed');
    },
  });
}

export function useBrainHypothesisTest() {
  return useMutation({
    mutationFn: (hypothesis: string) => brain.hypothesisTest(hypothesis),
    onSuccess: (data) => {
      if (data.success) {
        toast.success('Hypothesis tested');
      }
    },
  });
}

export function useBrainContinuousLearn() {
  return useMutation({
    mutationFn: (enabled: boolean) => brain.continuousLearn(enabled),
    onSuccess: (data, enabled) => {
      if (data.success) {
        toast.success(enabled ? 'Continuous learning enabled' : 'Continuous learning disabled');
      }
    },
  });
}

// ═══════════════════════════════════════════════════════════════
// SYSTEM ADMINISTRATION MUTATIONS
// ═══════════════════════════════════════════════════════════════

export function useSystemHeal() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (target?: string) => system.heal(target),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['substrate'] });
      queryClient.invalidateQueries({ queryKey: ['live'] });
      if (data.success) {
        toast.success('Self-healing initiated');
      }
    },
    onError: () => {
      toast.error('Self-healing failed');
    },
  });
}

export function useSystemRestart() {
  return useMutation({
    mutationFn: (service?: string) => system.restart(service),
    onSuccess: (data, service) => {
      if (data.success) {
        toast.success(`${service || 'All services'} restart initiated`);
      }
    },
    onError: () => {
      toast.error('Restart failed');
    },
  });
}

export function useSystemBackup() {
  return useMutation({
    mutationFn: () => system.backup(),
    onSuccess: (data) => {
      if (data.success) {
        toast.success('Backup created');
      }
    },
    onError: () => {
      toast.error('Backup failed');
    },
  });
}

// ═══════════════════════════════════════════════════════════════
// DREAM OPERATIONS MUTATIONS
// ═══════════════════════════════════════════════════════════════

export function useDreamMutate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => dream.mutate(),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['substrate', 'dream'] });
      queryClient.invalidateQueries({ queryKey: ['live', 'dream-eater'] });
      if (data.success) {
        toast.success('Mutation cycle triggered');
      }
    },
  });
}

export function useDreamInterpret() {
  return useMutation({
    mutationFn: (dream_text: string) => dream.interpret(dream_text),
    onSuccess: (data) => {
      if (data.success) {
        toast.success('Dream interpreted');
      }
    },
  });
}

export function useDreamReflect() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => dream.reflect(),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['substrate', 'dream'] });
      if (data.success) {
        toast.success('Dream reflection complete');
      }
    },
  });
}

// ═══════════════════════════════════════════════════════════════
// VISION ALERT MUTATION
// ═══════════════════════════════════════════════════════════════

export function useVisionAlert() {
  return useMutation({
    mutationFn: ({ severity, message, metadata }: { 
      severity: 'info' | 'warn' | 'error' | 'critical';
      message: string;
      metadata?: Record<string, unknown>;
    }) => vision.alert(severity, message, metadata),
    onSuccess: (data) => {
      if (data.success) {
        toast.success('Alert logged');
      }
    },
  });
}
