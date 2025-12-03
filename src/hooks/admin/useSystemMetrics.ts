import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

interface SystemMetrics {
  totalUsers: number;
  activeUsers: number;
  totalRevenue: number;
  revenueChange: string;
  threatsBlocked: number;
  threatsChange: string;
  scansCompleted: number;
  scansChange: string;
  systemHealth: number;
  services: {
    name: string;
    status: "online" | "degraded" | "offline";
    uptime: number;
  }[];
}

export function useSystemMetrics() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["system-metrics"],
    queryFn: async (): Promise<SystemMetrics> => {
      // Use user_roles as proxy for user count
      const { count: totalUsers } = await supabase
        .from("user_roles")
        .select("user_id", { count: "exact", head: true });

      // Get active users estimate from recent brain activity
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const { count: activeUsers } = await supabase
        .from("brain_memory_hot")
        .select("*", { count: "exact", head: true })
        .gte("created_at", sevenDaysAgo);

      // Get threat metrics from AI usage
      const { count: threatsBlocked } = await supabase
        .from("ai_usage_log")
        .select("*", { count: "exact", head: true })
        .eq("category", "security");

      // Get scan metrics from learning queries
      const { count: scansCompleted } = await supabase
        .from("learning_queries")
        .select("*", { count: "exact", head: true })
        .eq("status", "completed");

      // Get real service health from edge function
      let services = [];
      let systemHealth = 0;
      
      try {
        const { data: healthData } = await supabase.functions.invoke('pf-health-check');
        if (healthData?.modules) {
          services = healthData.modules.map((m: any) => ({
            name: m.module,
            status: m.status === 'healthy' ? 'online' as const : m.status === 'degraded' ? 'degraded' as const : 'offline' as const,
            uptime: m.status === 'healthy' ? 100 : m.status === 'degraded' ? 75 : 0,
          }));
          systemHealth = services.reduce((acc: number, s: any) => acc + s.uptime, 0) / services.length;
        }
      } catch (error) {
        console.error('Health check failed:', error);
        services = [
          { name: "System", status: "degraded" as const, uptime: 50 },
        ];
        systemHealth = 50;
      }

      // Get revenue data from billing
      const { data: billingData } = await supabase.functions.invoke('pf-admin-revenue');
      const totalRevenue = billingData?.metrics?.mrr || 0;
      const revenueChange = billingData?.metrics?.mrr_growth ? `+${billingData.metrics.mrr_growth.toFixed(1)}%` : '0%';

      return {
        totalUsers: totalUsers || 0,
        activeUsers: activeUsers || 0,
        totalRevenue,
        revenueChange,
        threatsBlocked: threatsBlocked || 0,
        threatsChange: threatsBlocked > 0 ? `-${((threatsBlocked / (totalUsers || 1)) * 100).toFixed(1)}%` : '0%',
        scansCompleted: scansCompleted || 0,
        scansChange: scansCompleted > 0 ? `+${((scansCompleted / (totalUsers || 1)) * 100).toFixed(1)}%` : '0%',
        systemHealth: Math.round(systemHealth * 10) / 10,
        services,
      };
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Real-time subscription for critical metrics
  useEffect(() => {
    const channel = supabase
      .channel("system-metrics-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_roles",
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["system-metrics"] });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "ai_usage_log",
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["system-metrics"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return query;
}
