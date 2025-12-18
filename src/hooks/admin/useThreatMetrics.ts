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
    threat_score: number;
  }[];
}

export function useThreatMetrics() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["threat-metrics"],
    queryFn: async (): Promise<ThreatMetrics> => {
      // Call the unified Reflex core for stats
      const { data: statsData, error: statsError } = await supabase.functions.invoke('pf-reflex-core', {
        body: { action: 'stats' }
      });

      // Get recent events
      const { data: eventsData } = await supabase.functions.invoke('pf-reflex-core', {
        body: { action: 'recent_events', limit: 20 }
      });

      // Get top threats from recent events
      const { data: threatFeed } = await supabase.functions.invoke('pf-reflex-core', {
        body: { action: 'threat_feed', limit: 100 }
      });

      // Aggregate top threats by type
      const threatCounts: Record<string, { count: number; severity: string }> = {};
      (threatFeed?.events || []).forEach((e: any) => {
        const type = e.event_type || 'unknown';
        if (!threatCounts[type]) {
          threatCounts[type] = { count: 0, severity: e.threat_score >= 70 ? 'high' : e.threat_score >= 40 ? 'medium' : 'low' };
        }
        threatCounts[type].count++;
      });

      const topThreats = Object.entries(threatCounts)
        .map(([type, data]) => ({ type, count: data.count, severity: data.severity }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      const stats = statsData?.stats || {};
      
      return {
        threatLevel: stats.threat_level || 'low',
        eventsToday: stats.events_today || 0,
        eventsBlocked: stats.blocked_today || 0,
        activeRules: stats.active_rules || 0,
        topThreats,
        ipReputation: stats.ip_reputation || { blocked: 0, suspicious: 0, trusted: 0 },
        recentEvents: (eventsData?.events || []).map((e: any) => ({
          id: e.id,
          timestamp: e.timestamp,
          type: e.type,
          ip: e.ip || 'N/A',
          action: e.action,
          threat_score: e.threat_score || 0
        }))
      };
    },
    refetchInterval: 10000,
  });

  // Real-time subscription for security events
  useEffect(() => {
    const channel = supabase
      .channel("defense-events-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "pf_security_events",
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["threat-metrics"] });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "defense_rules",
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
