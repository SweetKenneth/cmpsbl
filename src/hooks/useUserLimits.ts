/**
 * useUserLimits — React hook for tier depth caps.
 * Returns the current user's product limits based on their subscription tier.
 */
import { useMemo } from 'react';
import { useEngineSubscription } from '@/hooks/useEngineSubscription';
import { getUserLimits, resolveToProductTier, type ProductLimits } from '@/lib/substrate/product-limits';

export interface UserLimitsState extends ProductLimits {
  tier: string;
  productTier: string;
  isLoading: boolean;
}

export function useUserLimits(): UserLimitsState {
  const { tier, isLoading } = useEngineSubscription();

  return useMemo(() => {
    const limits = getUserLimits(tier);
    const productTier = resolveToProductTier(tier);
    return {
      ...limits,
      tier,
      productTier,
      isLoading,
    };
  }, [tier, isLoading]);
}
