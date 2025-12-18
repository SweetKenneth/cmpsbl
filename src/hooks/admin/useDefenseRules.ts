import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DefenseRule {
  id: string;
  rule_name: string;
  pattern: string;
  action: string;
  threshold: number;
  priority: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useDefenseRules() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["defense-rules"],
    queryFn: async (): Promise<DefenseRule[]> => {
      const { data, error } = await supabase.functions.invoke('pf-reflex-core', {
        body: { action: 'get_rules' }
      });
      
      if (error) throw error;
      return data?.rules || [];
    },
  });

  const createRule = useMutation({
    mutationFn: async (rule: Partial<DefenseRule>) => {
      const { data, error } = await supabase.functions.invoke('pf-reflex-core', {
        body: { action: 'create_rule', ...rule }
      });
      if (error) throw error;
      return data?.rule;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["defense-rules"] });
      toast.success("Defense rule created");
    },
    onError: (error: Error) => {
      toast.error(`Failed to create rule: ${error.message}`);
    }
  });

  const toggleRule = useMutation({
    mutationFn: async ({ rule_id, is_active }: { rule_id: string; is_active: boolean }) => {
      const { data, error } = await supabase.functions.invoke('pf-reflex-core', {
        body: { action: 'toggle_rule', rule_id, is_active }
      });
      if (error) throw error;
      return data?.rule;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["defense-rules"] });
      queryClient.invalidateQueries({ queryKey: ["threat-metrics"] });
    }
  });

  const blockIp = useMutation({
    mutationFn: async ({ ip, reason }: { ip: string; reason?: string }) => {
      const { data, error } = await supabase.functions.invoke('pf-reflex-core', {
        body: { action: 'block_ip', ip, reason }
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["threat-metrics"] });
      toast.success("IP blocked successfully");
    }
  });

  const unblockIp = useMutation({
    mutationFn: async ({ ip }: { ip: string }) => {
      const { data, error } = await supabase.functions.invoke('pf-reflex-core', {
        body: { action: 'unblock_ip', ip }
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["threat-metrics"] });
      toast.success("IP unblocked");
    }
  });

  return {
    rules: query.data || [],
    isLoading: query.isLoading,
    createRule,
    toggleRule,
    blockIp,
    unblockIp
  };
}
