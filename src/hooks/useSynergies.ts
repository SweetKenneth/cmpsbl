/**
 * useSynergies Hook
 * v7.2.0 — React hook for cross-module synergy execution
 */

import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  executeSynergy,
  dryRunSynergy,
  getRecommendedSynergies,
  listSynergies,
  getSynergy,
  getSynergiesByModule,
  getSynergyCategories,
  type SynergyResult,
  type SynergyDefinition,
  type SynergyCategory,
} from '@/lib/capabilities/synergies';

interface UseSynergiesOptions {
  category?: SynergyCategory;
  module?: string;
  autoRecommend?: boolean;
}

export function useSynergies(options: UseSynergiesOptions = {}) {
  const queryClient = useQueryClient();
  const [lastResult, setLastResult] = useState<SynergyResult | null>(null);
  
  // Get all synergies (optionally filtered)
  const synergiesQuery = useQuery({
    queryKey: ['synergies', options.category, options.module],
    queryFn: () => {
      if (options.module) {
        return getSynergiesByModule(options.module);
      }
      if (options.category) {
        return listSynergies(options.category);
      }
      return listSynergies();
    },
    staleTime: 60000, // 1 minute
  });
  
  // Get synergy categories with counts
  const categoriesQuery = useQuery({
    queryKey: ['synergy-categories'],
    queryFn: getSynergyCategories,
    staleTime: 60000,
  });
  
  // Get recommended synergies based on context
  const recommendations = useMemo(() => {
    if (!options.autoRecommend) return [];
    return getRecommendedSynergies({});
  }, [options.autoRecommend]);
  
  // Execute synergy mutation
  const executeMutation = useMutation({
    mutationFn: async ({ 
      synergyId, 
      input = {}, 
      dryRun = false 
    }: { 
      synergyId: string; 
      input?: Record<string, unknown>; 
      dryRun?: boolean;
    }) => {
      const result = await executeSynergy(synergyId, input, { dryRun });
      return result;
    },
    onSuccess: (result) => {
      setLastResult(result);
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['brain-events'] });
    },
  });
  
  // Dry-run preview
  const previewMutation = useMutation({
    mutationFn: async ({ synergyId, input = {} }: { synergyId: string; input?: Record<string, unknown> }) => {
      return dryRunSynergy(synergyId, input);
    },
  });
  
  // Execute a synergy
  const execute = useCallback(async (
    synergyId: string,
    input: Record<string, unknown> = {},
    dryRun = false
  ) => {
    return executeMutation.mutateAsync({ synergyId, input, dryRun });
  }, [executeMutation]);
  
  // Preview a synergy execution plan
  const preview = useCallback(async (synergyId: string, input: Record<string, unknown> = {}) => {
    return previewMutation.mutateAsync({ synergyId, input });
  }, [previewMutation]);
  
  // Get a specific synergy by ID
  const get = useCallback((synergyId: string): SynergyDefinition | undefined => {
    return getSynergy(synergyId);
  }, []);
  
  // Get synergies by module
  const byModule = useCallback((moduleName: string): SynergyDefinition[] => {
    return getSynergiesByModule(moduleName);
  }, []);
  
  return {
    // Data
    synergies: synergiesQuery.data ?? [],
    categories: categoriesQuery.data ?? [],
    recommendations,
    lastResult,
    
    // State
    loading: synergiesQuery.isLoading || categoriesQuery.isLoading,
    executing: executeMutation.isPending,
    previewing: previewMutation.isPending,
    error: synergiesQuery.error || executeMutation.error,
    
    // Actions
    execute,
    preview,
    get,
    byModule,
    
    // Preview data
    previewResult: previewMutation.data,
  };
}

export default useSynergies;
