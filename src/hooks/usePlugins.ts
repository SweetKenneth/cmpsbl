import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Type assertions needed until Supabase types sync
const db = supabase as any;

export interface Plugin {
  id: string;
  name: string;
  slug: string;
  description: string;
  author: string;
  version: string;
  category: string;
  hook_points: string[];
  is_verified: boolean;
  is_official: boolean;
  install_count: number;
  rating: number;
  icon_url: string | null;
  repository_url: string | null;
  documentation_url: string | null;
  config_schema: Record<string, unknown> | null;
  created_at: string;
}

export function usePlugins(category?: string) {
  return useQuery({
    queryKey: ["plugins", category],
    queryFn: async () => {
      let query = db.from("substrate_plugins")
        .select("*")
        .eq("is_active", true)
        .order("is_official", { ascending: false })
        .order("install_count", { ascending: false });

      if (category && category !== "all") {
        query = query.eq("category", category);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as Plugin[];
    },
  });
}

export function useMyPlugins(developerId?: string) {
  return useQuery({
    queryKey: ["my-plugins", developerId],
    enabled: !!developerId,
    queryFn: async () => {
      const { data, error } = await db.from("plugin_installations")
        .select(`*, plugin:substrate_plugins(*)`)
        .eq("developer_id", developerId!);

      if (error) throw error;
      return data as any[];
    },
  });
}

export function useInstallPlugin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ pluginId, developerId }: { pluginId: string; developerId: string }) => {
      const { data, error } = await db.from("plugin_installations")
        .insert({ plugin_id: pluginId, developer_id: developerId, is_enabled: true })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plugins"] });
      queryClient.invalidateQueries({ queryKey: ["my-plugins"] });
    },
  });
}

export function useUninstallPlugin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (installationId: string) => {
      const { error } = await db.from("plugin_installations")
        .delete()
        .eq("id", installationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-plugins"] });
    },
  });
}

export function useTogglePlugin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ installationId, enabled }: { installationId: string; enabled: boolean }) => {
      const { error } = await db.from("plugin_installations")
        .update({ is_enabled: enabled })
        .eq("id", installationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-plugins"] });
    },
  });
}
