import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

interface DecodeStatus {
  neuralHealth: number;
  dreamCycleActive: boolean;
  lastDreamCycle: string;
  memoryHot: number;
  memoryCold: number;
  learningRate: number;
  decisionsPending: number;
  insightsGenerated: number;
  modules: {
    name: string;
    status: "active" | "idle" | "error";
    lastSync: string;
  }[];
}

export function useDecodeStatus() {
  const queryClient = useQueryClient();
  
  const query = useQuery({
    queryKey: ["decode-status"],
    queryFn: async (): Promise<DecodeStatus> => {
      // Get memory counts
      const { count: memoryHot } = await supabase
        .from("brain_memory_hot")
        .select("*", { count: "exact", head: true });

      const { count: memoryCold } = await supabase
        .from("brain_memory_cold")
        .select("*", { count: "exact", head: true });

      // Get pending decisions
      const { count: decisionsPending } = await supabase
        .from("brain_actions_queue")
        .select("*", { count: "exact", head: true })
        .eq("status", "proposed");

      // Get recent insights
      const { count: insightsGenerated } = await supabase
        .from("brain_cross_insights")
        .select("*", { count: "exact", head: true });

      // Calculate learning rate from feedback
      const { data: feedback } = await supabase
        .from("brain_feedback")
        .select("success_rating")
        .not("success_rating", "is", null)
        .limit(10);
      
      const learningRate = feedback && feedback.length > 0
        ? feedback.reduce((sum, f) => sum + (f.success_rating || 0), 0) / (feedback.length * 5)
        : 0;

      // Get real module health
      const { data: healthData } = await supabase.functions.invoke('pf-health-check');
      
      const modules = healthData?.modules?.map((m: any) => ({
        name: m.module,
        status: m.status === 'healthy' ? 'active' as const : m.status === 'degraded' ? 'idle' as const : 'error' as const,
        lastSync: new Date(m.last_checked || Date.now()).toLocaleTimeString(),
      })) || [];

      // Calculate neural health based on real metrics
      const neuralHealth = modules.length > 0 
        ? (modules.filter(m => m.status === 'active').length / modules.length) * 100
        : 0;

      return {
        neuralHealth: Math.round(neuralHealth * 10) / 10,
        dreamCycleActive: false,
        lastDreamCycle: 'No data',
        memoryHot: memoryHot || 0,
        memoryCold: memoryCold || 0,
        learningRate: learningRate || 0,
        decisionsPending: decisionsPending || 0,
        insightsGenerated: insightsGenerated || 0,
        modules,
      };
    },
    refetchInterval: 15000,
  });

  // Real-time subscriptions for decode status changes
  useEffect(() => {
    const channel = supabase
      .channel("decode-status-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "brain_memory_hot" },
        () => queryClient.invalidateQueries({ queryKey: ["decode-status"] })
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "brain_actions_queue" },
        () => queryClient.invalidateQueries({ queryKey: ["decode-status"] })
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "brain_cross_insights" },
        () => queryClient.invalidateQueries({ queryKey: ["decode-status"] })
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return query;
}
