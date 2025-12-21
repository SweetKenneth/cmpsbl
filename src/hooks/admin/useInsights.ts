import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CascadeInsight {
  learned_today: string;
  emerging_pattern: string;
  recommended_action: string;
  ecosystem_health: {
    ptchbl: { status: string; score: number };
    splcbl: { status: string; score: number };
    rckbl: { status: string; score: number };
    studio: { status: string; score: number };
    nexus: { status: string; score: number };
    defense: { status: string; score: number };
  };
}

export function useInsights() {
  return useQuery({
    queryKey: ["cascade-insights"],
    queryFn: async () => {
      // Get recent brain events for analysis
      const { data: events } = await supabase
        .from('brain_events')
        .select('*')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false });

      // Get component health from events
      const modules = ['ptchbl', 'splcbl', 'rckbl', 'studio', 'nexus', 'defense'];
      const ecosystemHealth = modules.reduce((acc, module) => {
        const moduleEvents = events?.filter(e => e.module === module) || [];
        const successRate = moduleEvents.length > 0 
          ? (moduleEvents.filter(e => e.outcome === 'success').length / moduleEvents.length) * 100 
          : 100;
        
        acc[module] = {
          status: successRate >= 80 ? 'healthy' : successRate >= 60 ? 'degraded' : 'warning',
          score: Math.round(successRate)
        };
        return acc;
      }, {} as any);

      // Analyze learning events
      const learningEvents = events?.filter(e => 
        e.event_type?.includes('learn') || 
        e.event_type?.includes('train') ||
        e.event_type?.includes('insight')
      ) || [];

      // Find patterns
      const eventTypes = events?.map(e => e.event_type) || [];
      const typeCounts = eventTypes.reduce((acc, type) => {
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      const topPattern = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0];

      const insight: CascadeInsight = {
        learned_today: learningEvents.length > 0 
          ? `Processed ${learningEvents.length} learning events across ${new Set(learningEvents.map(e => e.module)).size} modules`
          : "Observing system patterns and preparing for next learning cycle",
        emerging_pattern: topPattern 
          ? `${topPattern[0]} occurring frequently (${topPattern[1]} times in 24h)`
          : "System operating within normal parameters",
        recommended_action: ecosystemHealth.defense?.score < 80 
          ? "Review Defense module performance and threat detection accuracy"
          : ecosystemHealth.ptchbl?.score < 80
          ? "Optimize PTCHBL scanning efficiency"
          : "All systems performing optimally - continue monitoring",
        ecosystem_health: ecosystemHealth
      };

      return insight;
    },
    refetchInterval: 60000, // Refresh every minute
  });
}
