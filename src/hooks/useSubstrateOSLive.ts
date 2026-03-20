/**
 * Enhanced Clockless Cognitive Reality Hooks — Live data from database
 * Real-time telemetry with no mock data
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// ═══════════════════════════════════════════════════════════════
// LIVE DATABASE HOOKS — Real data from Supabase tables
// ═══════════════════════════════════════════════════════════════

export function useLiveBrainMemories() {
  return useQuery({
    queryKey: ['live', 'brain', 'memories'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('brain_memories')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      return { count: count ?? 0 };
    },
    refetchInterval: 30000,
  });
}

export function useLiveDecodeConversations() {
  return useQuery({
    queryKey: ['live', 'decode', 'conversations'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('cascade_conversations')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      return { count: count ?? 0 };
    },
    refetchInterval: 30000,
  });
}

export function useLiveDefenseEvents() {
  return useQuery({
    queryKey: ['live', 'defense', 'events'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('defense_events')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      return { count: count ?? 0 };
    },
    refetchInterval: 30000,
  });
}

export function useLiveNexusRoutes() {
  return useQuery({
    queryKey: ['live', 'nexus', 'routes'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('nexus_logs')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      return { count: count ?? 0 };
    },
    refetchInterval: 30000,
  });
}

export function useLiveDreamSubmissions() {
  return useQuery({
    queryKey: ['live', 'dream', 'submissions'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('dream_feeder_submissions')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      return { count: count ?? 0 };
    },
    refetchInterval: 30000,
  });
}

export function useLiveAIUsage() {
  return useQuery({
    queryKey: ['live', 'ai', 'usage'],
    queryFn: async () => {
      // Use count + small sample instead of fetching 100 full rows
      const [countRes, sampleRes] = await Promise.all([
        supabase
          .from('ai_usage_log')
          .select('id', { count: 'exact', head: true }),
        supabase
          .from('ai_usage_log')
          .select('tokens_used, cost, provider')
          .order('created_at', { ascending: false })
          .limit(30),
      ]);
      
      if (countRes.error) throw countRes.error;
      const data = sampleRes.data ?? [];
      
      const totalTokens = data.reduce((sum, r) => sum + (r.tokens_used ?? 0), 0);
      const totalCost = data.reduce((sum, r) => sum + (r.cost ?? 0), 0);
      const providerCounts = data.reduce((acc, r) => {
        acc[r.provider] = (acc[r.provider] ?? 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      return { totalTokens, totalCost, providerCounts, recentCount: countRes.count ?? 0 };
    },
    refetchInterval: 30000,
  });
}

export function useLiveBrainEvents() {
  return useQuery({
    queryKey: ['live', 'brain', 'events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('brain_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return { events: data ?? [], fetchedAt: Date.now() };
    },
    refetchInterval: 5000, // Poll every 5 seconds for live feed
    staleTime: 4000,
  });
}

export function useLiveAuditLogs() {
  return useQuery({
    queryKey: ['live', 'audit', 'logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return { entries: data ?? [] };
    },
    refetchInterval: 30000,
  });
}

export function useLiveOrchestratorState() {
  return useQuery({
    queryKey: ['live', 'orchestrator', 'state'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('brain_orchestrator_state')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      
      // Convert health_score from decimal (0-1) to percentage (0-100)
      if (data && typeof data.health_score === 'number') {
        return {
          ...data,
          health_score: data.health_score <= 1 ? Math.round(data.health_score * 100) : data.health_score
        };
      }
      return data;
    },
    refetchInterval: 30000,
  });
}

export function useLiveDreamEaterState() {
  return useQuery({
    queryKey: ['live', 'dream-eater', 'state'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dream_eater_state')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    refetchInterval: 30000,
  });
}

export function useLiveForecasts() {
  return useQuery({
    queryKey: ['live', 'forecasts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('brain_forecasts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return { forecasts: data ?? [] };
    },
    refetchInterval: 60000,
  });
}

export function useLiveReflections() {
  return useQuery({
    queryKey: ['live', 'reflections'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('brain_reflections')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return { reflections: data ?? [] };
    },
    refetchInterval: 60000,
  });
}

export function useLiveCuriosityLog() {
  return useQuery({
    queryKey: ['live', 'curiosity', 'log'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('brain_curiosity_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return { queries: data ?? [] };
    },
    refetchInterval: 30000,
  });
}

export function useLiveLearningPatterns() {
  return useQuery({
    queryKey: ['live', 'learning', 'patterns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('learning_patterns')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return { patterns: data ?? [] };
    },
    refetchInterval: 60000,
  });
}

// Combined dashboard metrics hook
export function useLiveDashboardMetrics() {
  const memories = useLiveBrainMemories();
  const conversations = useLiveDecodeConversations();
  const defenseEvents = useLiveDefenseEvents();
  const nexusRoutes = useLiveNexusRoutes();
  const dreamSubmissions = useLiveDreamSubmissions();
  const aiUsage = useLiveAIUsage();
  const orchestrator = useLiveOrchestratorState();
  const dreamEater = useLiveDreamEaterState();

  const isLoading = 
    memories.isLoading || 
    conversations.isLoading || 
    defenseEvents.isLoading || 
    nexusRoutes.isLoading ||
    dreamSubmissions.isLoading ||
    aiUsage.isLoading;

  return {
    isLoading,
    metrics: {
      brainMemories: memories.data?.count ?? 0,
      decodeConversations: conversations.data?.count ?? 0,
      defenseEvents: defenseEvents.data?.count ?? 0,
      nexusRoutes: nexusRoutes.data?.count ?? 0,
      dreamSubmissions: dreamSubmissions.data?.count ?? 0,
      aiTokensUsed: aiUsage.data?.totalTokens ?? 0,
      aiCostTotal: aiUsage.data?.totalCost ?? 0,
    },
    orchestrator: orchestrator.data,
    dreamEater: dreamEater.data,
    refetchAll: () => {
      memories.refetch();
      conversations.refetch();
      defenseEvents.refetch();
      nexusRoutes.refetch();
      dreamSubmissions.refetch();
      aiUsage.refetch();
      orchestrator.refetch();
      dreamEater.refetch();
    },
  };
}
