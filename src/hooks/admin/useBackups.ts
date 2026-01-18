import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Backup {
  id: string;
  backup_id: string;
  backup_date: string;
  backup_path: string;
  substrate_version: string;
  restore_point_enabled: boolean;
  status: string;
  checksum: string;
  data_counts: Record<string, number>;
  created_at: string;
  expires_at: string;
}

export function useBackups() {
  const queryClient = useQueryClient();

  const { data: backups, isLoading } = useQuery({
    queryKey: ["backups"],
    queryFn: async (): Promise<Backup[]> => {
      const { data, error } = await supabase
        .from("daily_backups")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return (data || []) as Backup[];
    },
    refetchInterval: 60000,
  });

  const createManualBackup = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('pf-substrate', {
        body: {
          module: 'system',
          action: 'backup',
          payload: {
            backup_type: 'manual',
            include_data: true,
          }
        }
      });
      
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Backup failed');
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["backups"] });
      toast.success(`Manual backup created: ${data.backup_id}`, {
        description: `Saved to ${data.backup_path}`
      });
    },
    onError: (error) => {
      console.error("Backup error:", error);
      toast.error("Failed to create backup", {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    },
  });

  const restoreBackup = useMutation({
    mutationFn: async (backupId: string) => {
      const { data, error } = await supabase.functions.invoke('pf-substrate', {
        body: {
          module: 'system',
          action: 'restore',
          payload: { backup_id: backupId }
        }
      });
      
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Restore failed');
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["backups"] });
      toast.success(`Restored from backup: ${data.backup_id}`, {
        description: `${data.restored_modules?.length || 0} modules restored`
      });
    },
    onError: (error) => {
      console.error("Restore error:", error);
      toast.error("Failed to restore backup", {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    },
  });

  return {
    backups: backups || [],
    isLoading,
    createManualBackup,
    restoreBackup,
  };
}
