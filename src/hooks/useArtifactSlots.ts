/**
 * useArtifactSlots — Runtime slot enforcement for equal-slot artifact capacity model
 * Manages pack activation/deactivation with capacity enforcement
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { PRODUCT_TIERS, type ProductTier } from '@/lib/quarry/types';
import { toast } from 'sonner';

const SLOTS_KEY = ['artifact-slots'];

export interface PackActivation {
  id: string;
  user_id: string;
  pack_id: string;
  active: boolean;
  activated_at: string;
  deactivated_at: string | null;
}

export interface SlotState {
  activePacks: PackActivation[];
  activeCount: number;
  capacity: number;
  tier: ProductTier;
  remaining: number;
  atCapacity: boolean;
  nearCapacity: boolean; // >= 80%
  isPackActive: (packId: string) => boolean;
}

function resolveProductTier(subscriptionTier?: string): ProductTier {
  if (!subscriptionTier) return 'builder';
  if (subscriptionTier === 'enterprise') return 'architect';
  if (['architect', 'pro', 'creator'].includes(subscriptionTier)) return 'operator';
  return 'builder';
}

export function useArtifactSlots(subscriptionTier?: string) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const productTier = resolveProductTier(subscriptionTier);
  const capacity = PRODUCT_TIERS[productTier].slots;

  const query = useQuery({
    queryKey: [...SLOTS_KEY, user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('user_pack_activations')
        .select('*')
        .eq('user_id', user.id)
        .eq('active', true)
        .order('activated_at', { ascending: true });
      if (error) throw error;
      return (data ?? []) as PackActivation[];
    },
    enabled: !!user?.id,
  });

  const activePacks = query.data ?? [];
  const activeCount = activePacks.length;

  const slotState: SlotState = {
    activePacks,
    activeCount,
    capacity,
    tier: productTier,
    remaining: Math.max(0, capacity - activeCount),
    atCapacity: activeCount >= capacity,
    nearCapacity: activeCount >= capacity * 0.8,
    isPackActive: (packId: string) => activePacks.some(p => p.pack_id === packId),
  };

  const logAudit = async (packId: string, eventType: string, meta?: Record<string, unknown>) => {
    if (!user?.id) return;
    await supabase.from('activation_audit_log').insert({
      user_id: user.id,
      pack_id: packId,
      event_type: eventType,
      slot_capacity: capacity,
      active_count: activeCount,
      metadata: meta ?? {},
    } as any);
  };

  const activate = useMutation({
    mutationFn: async (packId: string) => {
      if (!user?.id) throw new Error('Not authenticated');

      // Enforce slot limit — deterministic, no partial activation
      if (activeCount >= capacity) {
        await logAudit(packId, 'slot_limit_reached');
        throw new Error('SLOT_LIMIT_REACHED');
      }

      const { data, error } = await supabase
        .from('user_pack_activations')
        .upsert({
          user_id: user.id,
          pack_id: packId,
          active: true,
          activated_at: new Date().toISOString(),
          deactivated_at: null,
        } as any, { onConflict: 'user_id,pack_id' })
        .select()
        .single();

      if (error) throw error;
      await logAudit(packId, 'activated');
      return data as PackActivation;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SLOTS_KEY });
    },
    onError: (e: Error) => {
      if (e.message !== 'SLOT_LIMIT_REACHED') {
        toast.error(e.message);
      }
    },
  });

  const deactivate = useMutation({
    mutationFn: async (packId: string) => {
      if (!user?.id) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('user_pack_activations')
        .update({
          active: false,
          deactivated_at: new Date().toISOString(),
        } as any)
        .eq('user_id', user.id)
        .eq('pack_id', packId);

      if (error) throw error;
      await logAudit(packId, 'deactivated');
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SLOTS_KEY });
      toast.success('Pack deactivated');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  /** Call after successful plan upgrade to immediately expand capacity */
  const refreshCapacity = () => {
    qc.invalidateQueries({ queryKey: SLOTS_KEY });
  };

  return {
    ...slotState,
    activate,
    deactivate,
    refreshCapacity,
    isLoading: query.isLoading,
  };
}
