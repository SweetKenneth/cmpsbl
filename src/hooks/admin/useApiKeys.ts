import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useEffect } from "react";

export interface ApiKey {
  id: string;
  key_prefix: string;
  name: string;
  scopes: string[];
  is_active: boolean;
  created_at: string;
  last_used_at?: string;
}

export function useApiKeys() {
  const queryClient = useQueryClient();

  const { data: keys = [], isLoading } = useQuery({
    queryKey: ["admin-api-keys"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("pf-substrate", {
        body: { module: "access", action: "list_keys" },
      });

      if (error) throw error;
      return (data?.keys ?? []) as ApiKey[];
    },
    refetchInterval: 30000,
  });

  const generateKey = useMutation({
    mutationFn: async ({ name, permissions }: { name: string; permissions: Record<string, boolean> }) => {
      const scopes = Object.entries(permissions)
        .filter(([, v]) => v)
        .map(([k]) => k);

      const { data, error } = await supabase.functions.invoke("pf-substrate", {
        body: { module: "access", action: "create_key", name, scopes },
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || "Key generation failed");
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-api-keys"] });
      if (data?.api_key) {
        toast.warning("⚠️ This API key will NOT be shown again. Store it securely now.", {
          description: data.api_key,
          duration: 30000,
        });
      } else {
        toast.success("API key generated");
      }
    },
    onError: (e: Error) => toast.error(e.message || "Failed to generate key"),
  });

  const revokeKey = useMutation({
    mutationFn: async (keyId: string) => {
      const { data, error } = await supabase.functions.invoke("pf-substrate", {
        body: { module: "access", action: "revoke_key", key_id: keyId },
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || "Revoke failed");
      return data;
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
          table: "access_api_keys",
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
