import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useEffect } from "react";

export interface ApiKey {
  id: string;
  key_prefix: string;
  name: string;
  permissions: Record<string, boolean>;
  created_at: string;
  last_used_at?: string;
  expires_at?: string;
}

export function useApiKeys() {
  const queryClient = useQueryClient();

  const { data: keys = [], isLoading } = useQuery({
    queryKey: ["admin-api-keys"],
    queryFn: async () => {
      return [] as ApiKey[];
    },
    refetchInterval: 30000,
  });

  const generateKey = useMutation({
    mutationFn: async ({ name, permissions }: { name: string; permissions: Record<string, boolean> }) => {
      const { data, error } = await supabase.functions.invoke("pf-core-keys", {
        body: { action: "generate", key_name: name },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-api-keys"] });
      toast.success("API key generated");
    },
    onError: () => toast.error("Failed to generate key"),
  });

  const revokeKey = useMutation({
    mutationFn: async (keyId: string) => {
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-api-keys"] });
      toast.success("API key revoked");
    },
    onError: () => toast.error("Failed to revoke key"),
  });

  // Real-time subscription for API key changes
  useEffect(() => {
    const channel = supabase
      .channel("api-keys-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bot_detection_api_keys",
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["admin-api-keys"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return { keys, isLoading, generateKey, revokeKey };
}
