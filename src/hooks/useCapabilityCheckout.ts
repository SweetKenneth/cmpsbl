/**
 * useCapabilityCheckout Hook
 * Handles Stripe checkout for capability purchases
 * v1.0.0
 */

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { hasStripeConfig, getStripeConfig } from '@/lib/capabilities/depot/stripe-config';

interface CheckoutState {
  loading: boolean;
  error: string | null;
}

export function useCapabilityCheckout() {
  const [state, setState] = useState<CheckoutState>({
    loading: false,
    error: null,
  });

  const checkout = useCallback(async (capabilityId: string) => {
    if (!hasStripeConfig(capabilityId)) {
      toast.error('Checkout not available for this capability');
      return;
    }

    setState({ loading: true, error: null });

    try {
      const { data, error } = await supabase.functions.invoke('capability-checkout', {
        body: { capability_id: capabilityId },
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

      setState({ loading: false, error: null });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Checkout failed';
      setState({ loading: false, error: errorMessage });
      toast.error(errorMessage);
    }
  }, []);

  const getPrice = useCallback((capabilityId: string): number | undefined => {
    return getStripeConfig(capabilityId)?.priceUsd;
  }, []);

  const isAvailable = useCallback((capabilityId: string): boolean => {
    return hasStripeConfig(capabilityId);
  }, []);

  return {
    checkout,
    getPrice,
    isAvailable,
    loading: state.loading,
    error: state.error,
  };
}

export default useCapabilityCheckout;
