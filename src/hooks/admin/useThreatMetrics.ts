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
      // Query defense data directly from database (pf-reflex-core may not be deployed)
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

      // Get today's security events
      const { data: secEvents } = await supabase
        .from('pf_security_events')
        .select('*')
        .gte('created_at', todayStart)
        .order('created_at', { ascending: false })
        .limit(100);

      // Get active defense rules
      const { data: rules } = await supabase
        .from('defense_rules')
        .select('id')
        .eq('is_active', true);

      // Get IP reputation stats
      const { data: blockedIps } = await supabase
        .from('ip_reputation')
        .select('score')
        .lt('score', 30);

      const eventList = secEvents || [];
      const statsData = { stats: {} };
      const eventsData = { events: eventList.slice(0, 20) };
      const threatFeed = { events: eventList };

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

      const blockedCount = eventList.filter((e: any) => e.action === 'block').length;
      const threatLevel = blockedCount > 20 ? 'critical' : blockedCount > 10 ? 'high' : blockedCount > 3 ? 'medium' : 'low';
      
      return {
        threatLevel: threatLevel as ThreatMetrics['threatLevel'],
        eventsToday: eventList.length,
        eventsBlocked: blockedCount,
        activeRules: rules?.length || 0,
        topThreats,
        ipReputation: { blocked: blockedIps?.length || 0, suspicious: 0, trusted: 0 },
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
