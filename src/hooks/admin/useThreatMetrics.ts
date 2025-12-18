import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

interface ThreatMetrics {
  threatLevel: "low" | "medium" | "high" | "critical";
  eventsToday: number;
  eventsBlocked: number;
  activeRules: number;
  topThreats: {
    type: string;
    count: number;
    severity: string;
  }[];
  ipReputation: {
    blocked: number;
    suspicious: number;
    trusted: number;
  };
  recentEvents: {
    id: string;
    timestamp: string;
    type: string;
    ip: string;
    action: string;
  }[];
}

export function useThreatMetrics() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["threat-metrics"],
    queryFn: async (): Promise<ThreatMetrics> => {
      // Use real security events table
      const today = new Date().toISOString().split("T")[0];
      const { count: eventsToday, data: events } = await supabase
        .from("pf_security_events")
        .select("*", { count: "exact" })
        .gte("detected_at", today)
        .limit(100);
      
      const blocked = events?.filter(e => e.action_taken === 'block').length || 0;

      // Calculate threat level based on event count
      let threatLevel: "low" | "medium" | "high" | "critical" = "low";
      if (eventsToday && eventsToday > 100) threatLevel = "critical";
      else if (eventsToday && eventsToday > 50) threatLevel = "high";
      else if (eventsToday && eventsToday > 20) threatLevel = "medium";

      // Aggregate top threats
      const threatCounts = events?.reduce((acc, e) => {
        acc[e.event_type] = (acc[e.event_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};
      
      const topThreats = Object.entries(threatCounts)
        .map(([type, count]) => ({ type, count, severity: 'medium' }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Get active defense rules count
      const { count: activeRules } = await supabase
        .from("defense_rules")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true);

      // Get IP reputation stats
      const { data: ipStats } = await supabase
        .from("ip_reputation")
        .select("score");
      
      const ipReputation = {
        trusted: ipStats?.filter(ip => ip.score >= 70).length || 0,
        suspicious: ipStats?.filter(ip => ip.score >= 30 && ip.score < 70).length || 0,
        blocked: ipStats?.filter(ip => ip.score < 30).length || 0,
      };

      return {
        threatLevel,
        eventsToday: eventsToday || 0,
        eventsBlocked: blocked,
        activeRules: activeRules || 0,
        topThreats,
        ipReputation,
        recentEvents: events?.slice(0, 10).map(e => ({
          id: e.id,
          timestamp: e.detected_at,
          type: e.event_type,
          ip: e.ip_address || 'N/A',
          action: e.action_taken,
        })) || [],
      };
    },
    refetchInterval: 10000,
  });

  // Real-time subscription for threat events
  useEffect(() => {
    const channel = supabase
      .channel("threat-metrics-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "pf_security_events",
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["threat-metrics"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return query;
}
