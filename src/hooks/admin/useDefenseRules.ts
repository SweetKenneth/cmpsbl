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
      const { data, error } = await supabase
        .from('defense_rules')
        .select('*')
        .order('priority', { ascending: false });
      
      if (error) throw error;
      return (data || []) as DefenseRule[];
    },
  });

  const createRule = useMutation({
    mutationFn: async (rule: Partial<DefenseRule>) => {
      const { data, error } = await supabase
        .from('defense_rules')
        .insert([rule as any])
        .select()
        .single();
      if (error) throw error;
      return data;
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
      const { data, error } = await supabase
        .from('defense_rules')
        .update({ is_active })
        .eq('id', rule_id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["defense-rules"] });
      queryClient.invalidateQueries({ queryKey: ["threat-metrics"] });
    }
  });

  const blockIp = useMutation({
    mutationFn: async ({ ip, reason }: { ip: string; reason?: string }) => {
      const { error } = await supabase.rpc('update_ip_reputation', {
        p_ip: ip,
        p_action: 'block',
      });
      if (error) throw error;
      return { blocked: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["threat-metrics"] });
      toast.success("IP blocked successfully");
    }
  });

  const unblockIp = useMutation({
    mutationFn: async ({ ip }: { ip: string }) => {
      const { error } = await supabase.rpc('update_ip_reputation', {
        p_ip: ip,
        p_action: 'allow',
      });
      if (error) throw error;
      return { unblocked: true };
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
