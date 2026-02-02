/**
 * useCapabilityCheckout Hook
 * Handles Stripe checkout for capability purchases including S-tier
 * v1.1.0 — S-Tier & Self-Improvement Support
 */

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  hasStripeConfig, 
  getStripeConfig,
  hasSTierStripeConfig,
  getSTierStripeConfig,
  isSelfImprovementCapability,
} from '@/lib/capabilities/depot';

interface CheckoutState {
  loading: boolean;
  error: string | null;
  capabilityId: string | null;
}

export function useCapabilityCheckout() {
  const [state, setState] = useState<CheckoutState>({
    loading: false,
    error: null,
    capabilityId: null,
  });

  const checkout = useCallback(async (capabilityId: string) => {
    // Check S-tier first, then regular
    const isSTier = hasSTierStripeConfig(capabilityId);
    const hasConfig = isSTier || hasStripeConfig(capabilityId);
    
    if (!hasConfig) {
      toast.error('Checkout not available for this capability');
      return;
    }

    setState({ loading: true, error: null, capabilityId });

    try {
      const config = isSTier 
        ? getSTierStripeConfig(capabilityId)
        : getStripeConfig(capabilityId);

      if (!config) {
        throw new Error('No Stripe configuration found');
      }

      const { data, error } = await supabase.functions.invoke('marketplace-checkout', {
        body: { 
          product_type: isSTier ? 'stier' : 'capability',
          price_id: config.priceId,
          product_id: config.productId,
          capability_id: capabilityId,
        },
      });

      if (error) {
        throw new Error(error.message || 'Checkout failed');
      }

      if (data?.url) {
        // Open checkout in new tab
        window.open(data.url, '_blank');
        toast.success('Opening checkout...');
      } else {
        throw new Error('No checkout URL received');
      }

      setState({ loading: false, error: null, capabilityId: null });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Checkout failed';
      setState({ loading: false, error: errorMessage, capabilityId: null });
      toast.error(errorMessage);
    }
  }, []);

  const getPrice = useCallback((capabilityId: string): number | undefined => {
    // Check S-tier first
    const stierConfig = getSTierStripeConfig(capabilityId);
    if (stierConfig) return stierConfig.priceUsd;
    
    return getStripeConfig(capabilityId)?.priceUsd;
  }, []);

  const isAvailable = useCallback((capabilityId: string): boolean => {
    return hasSTierStripeConfig(capabilityId) || hasStripeConfig(capabilityId);
  }, []);

  const isSTier = useCallback((capabilityId: string): boolean => {
    return hasSTierStripeConfig(capabilityId);
  }, []);

  const isSelfImprovement = useCallback((capabilityId: string): boolean => {
    return isSelfImprovementCapability(capabilityId);
  }, []);

  return {
    checkout,
    getPrice,
    isAvailable,
    isSTier,
    isSelfImprovement,
    loading: state.loading,
    loadingCapability: state.capabilityId,
    error: state.error,
  };
}

export default useCapabilityCheckout;
