import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface SystemSettings {
  maintenance_mode: boolean;
  debug_logging: boolean;
  auto_backups: boolean;
  rate_limiting: boolean;
  api_rate_limit: number;
  max_file_size: number;
}

const DEFAULT_SETTINGS: SystemSettings = {
  maintenance_mode: false,
  debug_logging: false,
  auto_backups: true,
  rate_limiting: true,
  api_rate_limit: 100,
  max_file_size: 10,
};

export function useSystemSettings() {
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ["system-settings"],
    queryFn: async (): Promise<SystemSettings> => {
      const { data, error } = await supabase
        .from("pf_system_config")
        .select("key, value");
      
      if (error) throw error;
      
      const config = (data || []).reduce((acc, row) => {
        const value = row.value;
        acc[row.key] = typeof value === 'string' && (value === 'true' || value === 'false') 
          ? value === 'true' 
          : typeof value === 'string' && !isNaN(Number(value))
          ? Number(value)
          : value;
        return acc;
      }, {} as any);
      
      return { ...DEFAULT_SETTINGS, ...config };
    },
    refetchInterval: 30000,
  });

  const updateSettings = useMutation({
    mutationFn: async (newSettings: SystemSettings) => {
      const updates = Object.entries(newSettings).map(([key, value]) => ({
        key,
        value: typeof value === 'boolean' ? String(value) : value,
      }));
      
      const { error } = await supabase
        .from("pf_system_config")
        .upsert(updates, { onConflict: "key" });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["system-settings"] });
      toast.success("Settings saved successfully");
    },
    onError: (error) => {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
    },
  });

  const toggleSetting = useMutation({
    mutationFn: async ({ key, value }: { key: keyof SystemSettings; value: boolean | number }) => {
      const { error } = await supabase
        .from("pf_system_config")
        .upsert({ key, value: typeof value === 'boolean' ? String(value) : value }, { onConflict: "key" });
      
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["system-settings"] });
      toast.success(`${formatSettingName(variables.key)} ${typeof variables.value === 'boolean' ? (variables.value ? 'enabled' : 'disabled') : 'updated'}`);
    },
    onError: (error) => {
      console.error("Error toggling setting:", error);
      toast.error("Failed to update setting");
    },
  });

  return {
    settings: settings || DEFAULT_SETTINGS,
    isLoading,
    updateSettings,
    toggleSetting,
  };
}

function getSettingDescription(key: string): string {
  const descriptions: Record<string, string> = {
    maintenance_mode: "Temporarily disable public access to the system",
    debug_logging: "Enable verbose system logs for debugging",
    auto_backups: "Automatically backup data daily",
    rate_limiting: "Enable API rate limiting protection",
    api_rate_limit: "Maximum API requests per minute",
    max_file_size: "Maximum file upload size in MB",
  };
  return descriptions[key] || "";
}

function formatSettingName(key: string): string {
  return key
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
