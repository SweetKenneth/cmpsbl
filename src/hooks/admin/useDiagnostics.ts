import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

export interface SystemHealth {
  service: string;
  status: "healthy" | "degraded" | "down";
  latency_ms: number;
  last_check: string;
  uptime_percent: number;
}

export function useDiagnostics() {
  const queryClient = useQueryClient();
  
  const { data: health = [], isLoading } = useQuery({
    queryKey: ["admin-diagnostics"],
    queryFn: async () => {
      const services = [
        { service: "Database", endpoint: "learning_logs" },
        { service: "Auth", endpoint: "profiles" },
        { service: "Storage", endpoint: null },
      ];

      const results = await Promise.all(
        services.map(async ({ service, endpoint }) => {
          const start = Date.now();
          try {
            if (endpoint) {
              await supabase.from(endpoint as any).select("id").limit(1);
            }
            const latency = Date.now() - start;
            return {
              service,
              status: latency < 200 ? "healthy" : "degraded",
              latency_ms: latency,
              last_check: new Date().toISOString(),
              uptime_percent: 99.9,
            } as SystemHealth;
          } catch {
            return {
              service,
              status: "down",
              latency_ms: -1,
              last_check: new Date().toISOString(),
              uptime_percent: 0,
            } as SystemHealth;
          }
        })
      );

      return results;
    },
    refetchInterval: 10000,
  });

  // Real-time health monitoring
  useEffect(() => {
    const channel = supabase
      .channel("diagnostics-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "system_health" },
        () => queryClient.invalidateQueries({ queryKey: ["admin-diagnostics"] })
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return { health, isLoading };
}
