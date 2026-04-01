/**
 * useForgeAgents — CRUD hook for user's custom forged agents
 * Tier-gated, globally unique names, one active at a time
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useUserLimits } from '@/hooks/useUserLimits';
import { toast } from 'sonner';

export interface ForgeAgent {
  id: string;
  user_id: string;
  agent_name: string;
  agency_name: string | null;
  display_name: string | null;
  agent_type: string;
  specialization: string | null;
  is_active: boolean;
  loadout_id: string | null;
  primitive_chain: string[];
  cjpi_score: number | null;
  ascension_stage: number;
  personality: Record<string, unknown>;
  capabilities: Record<string, unknown>;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface CreateForgeAgentInput {
  agent_name: string;
  agency_name?: string;
  display_name?: string;
  specialization?: string;
  loadout_id?: string;
  primitive_chain?: string[];
  personality?: Record<string, unknown>;
}

export function useForgeAgents() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { forgeAgentSlots } = useUserLimits();

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['forge-agents'] });

  const agents = useQuery({
    queryKey: ['forge-agents', user?.id],
    queryFn: async (): Promise<ForgeAgent[]> => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('forge_agents')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[ForgeAgents] fetch error:', error.message);
        return [];
      }
      return (data ?? []) as unknown as ForgeAgent[];
    },
    enabled: !!user?.id,
    staleTime: 30_000,
  });

  const reservedNames = useQuery({
    queryKey: ['forge-reserved-names'],
    queryFn: async () => {
      const { data } = await supabase
        .from('forge_reserved_names')
        .select('reserved_name');
      return (data ?? []).map((r: { reserved_name: string }) => r.reserved_name.toLowerCase());
    },
    enabled: !!user?.id,
    staleTime: 300_000,
  });

  const createAgent = useMutation({
    mutationFn: async (input: CreateForgeAgentInput) => {
      if (!user?.id) throw new Error('Not authenticated');
      const currentCount = agents.data?.length ?? 0;
      if (currentCount >= forgeAgentSlots) {
        throw new Error(`Forge slot limit reached (${forgeAgentSlots}). Upgrade your tier for more slots.`);
      }

      const { data, error } = await supabase
        .from('forge_agents')
        .insert({
          user_id: user.id,
          agent_name: input.agent_name.toUpperCase(),
          agency_name: input.agency_name || null,
          display_name: input.display_name || null,
          specialization: input.specialization || null,
          loadout_id: input.loadout_id || null,
          primitive_chain: input.primitive_chain || [],
          personality: input.personality || {},
        } as Record<string, unknown>)
        .select()
        .single();

      if (error) {
        if (error.message.includes('idx_forge_agents_name_unique')) {
          throw new Error(`Agent name "${input.agent_name}" is already taken`);
        }
        if (error.message.includes('idx_forge_agents_agency_unique')) {
          throw new Error(`Agency name "${input.agency_name}" is already taken`);
        }
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      invalidate();
      toast.success('Agent forged successfully');
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const activateAgent = useMutation({
    mutationFn: async (agentId: string) => {
      if (!user?.id) throw new Error('Not authenticated');

      // Deactivate current active agent first
      await supabase
        .from('forge_agents')
        .update({ is_active: false })
        .eq('user_id', user.id)
        .eq('is_active', true);

      // Activate the chosen one
      const { error } = await supabase
        .from('forge_agents')
        .update({ is_active: true })
        .eq('id', agentId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      invalidate();
      toast.success('Agent activated');
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const deactivateAgent = useMutation({
    mutationFn: async (agentId: string) => {
      if (!user?.id) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('forge_agents')
        .update({ is_active: false })
        .eq('id', agentId)
        .eq('user_id', user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate();
      toast.success('Agent deactivated');
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const deleteAgent = useMutation({
    mutationFn: async (agentId: string) => {
      if (!user?.id) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('forge_agents')
        .delete()
        .eq('id', agentId)
        .eq('user_id', user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate();
      toast.success('Agent decommissioned');
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const activeAgent = agents.data?.find(a => a.is_active) ?? null;
  const slotsUsed = agents.data?.length ?? 0;
  const slotsRemaining = Math.max(0, forgeAgentSlots - slotsUsed);

  return {
    agents,
    reservedNames,
    activeAgent,
    slotsUsed,
    slotsRemaining,
    slotsTotal: forgeAgentSlots,
    createAgent,
    activateAgent,
    deactivateAgent,
    deleteAgent,
  };
}
