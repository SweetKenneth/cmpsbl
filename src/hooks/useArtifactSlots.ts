/**
 * useArtifactSlots — Runtime slot enforcement for equal-slot artifact capacity model
 * Uses atomic server-side RPCs (activate_pack / deactivate_pack) to prevent race conditions.
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
  nearCapacity: boolean;
  isPackActive: (packId: string) => boolean;
}

function resolveProductTier(subscriptionTier?: string): ProductTier {
  if (!subscriptionTier) return 'builder';
  if (['enterprise', 'architect'].includes(subscriptionTier)) return 'architect';
  if (subscriptionTier === 'studio') return 'studio';
  if (['pro', 'operator', 'creator'].includes(subscriptionTier)) return 'operator';
  if (['starter', 'builder', 'free'].includes(subscriptionTier)) return 'builder';
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

  const activate = useMutation({
    mutationFn: async (packId: string) => {
      if (!user?.id) throw new Error('Not authenticated');

      // Atomic server-side enforcement via RPC
      const { data, error } = await supabase.rpc('activate_pack', {
        p_user_id: user.id,
        p_pack_id: packId,
        p_capacity: capacity,
      });

      if (error) throw error;

      const result = data as { ok: boolean; reason: string | null; activeCount: number };
      if (!result.ok) {
        if (result.reason === 'SLOT_LIMIT_REACHED') {
          throw new Error('SLOT_LIMIT_REACHED');
        }
        throw new Error(result.reason || 'Activation failed');
      }

      return result;
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

      const { data, error } = await supabase.rpc('deactivate_pack', {
        p_user_id: user.id,
        p_pack_id: packId,
      });

      if (error) throw error;
      return data as { ok: boolean; activeCount: number };
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
