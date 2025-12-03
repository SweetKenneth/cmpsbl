import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

export interface Deployment {
  id: string;
  status: "pending" | "building" | "success" | "failed";
  environment: "production" | "staging" | "development";
  commit_hash: string;
  deployed_at: string;
  deployed_by: string;
}

export function useDeployment() {
  const queryClient = useQueryClient();
  
  const { data: deployments = [], isLoading } = useQuery({
    queryKey: ["admin-deployments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pf_deployments")
        .select("*")
        .order("deployed_at", { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return (data || []) as Deployment[];
    },
    refetchInterval: 15000,
  });

  // Real-time subscription for deployment changes
  useEffect(() => {
    const channel = supabase
      .channel("deployments-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "pf_deployments" },
        () => queryClient.invalidateQueries({ queryKey: ["admin-deployments"] })
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return { deployments, isLoading };
}
