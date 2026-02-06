/**
 * useSynergies Hook
 * v7.5.2 — React hook for cross-module synergy execution (135 pipelines, 22 S-tier + 15 discoveries)
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
  stierOnly?: boolean;
}

interface SynergyStats {
  total: number;
  byCategory: Record<string, number>;
  withExecutors: number;
  avgEstimatedMs: number;
  stierCount: number;
}

export function useSynergies(options: UseSynergiesOptions = {}) {
  const queryClient = useQueryClient();
  const [lastResult, setLastResult] = useState<SynergyResult | null>(null);
  const [executionHistory, setExecutionHistory] = useState<SynergyResult[]>([]);
  
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
  
  // Calculate stats including S-tier count
  const stats = useMemo((): SynergyStats => {
    const synergies = synergiesQuery.data ?? [];
    const categories = categoriesQuery.data ?? [];
    
    const byCategory: Record<string, number> = {};
    categories.forEach(c => {
      byCategory[c.category] = c.count;
    });
    
    const avgMs = synergies.length > 0
      ? synergies.reduce((sum, s) => sum + s.estimatedMs, 0) / synergies.length
      : 0;
    
    // Count S-tier pipelines
    const stierCount = synergies.filter(s => 
      s.id.includes('engine') || 
      s.id.includes('kernel') || 
      s.id.includes('governor') ||
      s.id.includes('compiler') ||
      s.id.includes('steward') ||
      s.id.includes('authority') ||
      s.id.includes('anticipator') ||
      s.id.includes('scoring') ||
      s.id.includes('arbitrage') ||
      s.id.includes('router') ||
      s.id.includes('tracker') ||
      s.id.includes('fabric') ||
      s.id.includes('switcher') ||
      s.id.includes('ledger') ||
      s.id.includes('forecaster')
    ).length;
    
    return {
      total: synergies.length,
      byCategory,
      withExecutors: 113, // 113 custom executors (76 core + 22 S-tier + 15 v7.5.2)
      avgEstimatedMs: Math.round(avgMs),
      stierCount,
    };
  }, [synergiesQuery.data, categoriesQuery.data]);
  
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
      setExecutionHistory(prev => [result, ...prev].slice(0, 50)); // Keep last 50
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
  
  // Execute multiple synergies in sequence
  const executePipeline = useCallback(async (
    synergyIds: string[],
    input: Record<string, unknown> = {}
  ): Promise<SynergyResult[]> => {
    const results: SynergyResult[] = [];
    let currentInput = input;
    
    for (const synergyId of synergyIds) {
      const result = await execute(synergyId, currentInput);
      results.push(result);
      
      if (!result.success) break;
      
      // Pass output as input to next synergy
      if (result.data && typeof result.data === 'object') {
        currentInput = { ...currentInput, ...(result.data as Record<string, unknown>) };
      }
    }
    
    return results;
  }, [execute]);
  
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
  
  // Get synergies by category
  const byCategory = useCallback((category: SynergyCategory): SynergyDefinition[] => {
    return listSynergies(category);
  }, []);
  
  // Clear execution history
  const clearHistory = useCallback(() => {
    setExecutionHistory([]);
    setLastResult(null);
  }, []);
  
  return {
    // Data
    synergies: synergiesQuery.data ?? [],
    categories: categoriesQuery.data ?? [],
    recommendations,
    lastResult,
    executionHistory,
    stats,
    
    // State
    loading: synergiesQuery.isLoading || categoriesQuery.isLoading,
    executing: executeMutation.isPending,
    previewing: previewMutation.isPending,
    error: synergiesQuery.error || executeMutation.error,
    
    // Actions
    execute,
    executePipeline,
    preview,
    get,
    byModule,
    byCategory,
    clearHistory,
    
    // Preview data
    previewResult: previewMutation.data,
  };
}

export default useSynergies;
