/**
 * useEngineSubscription Hook
 * Manages engine subscription state and checkout
 * Uses first-party redirect for reliable checkout
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { EngineSubscriptionTier } from '@/config/engine-stripe-products';

export type SubscriptionTier = 'free' | 'starter' | 'builder' | 'studio' | 'creator' | 'pro' | 'architect' | 'enterprise';

interface EngineSubscriptionState {
  subscribed: boolean;
  tier: SubscriptionTier;
  subscription_end: string | null;
  isLoading: boolean;
  error: string | null;
}

export function useEngineSubscription() {
  const [state, setState] = useState<EngineSubscriptionState>({
    subscribed: false,
    tier: 'free',
    subscription_end: null,
    isLoading: true,
    error: null,
  });

  const checkSubscription = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const { data, error } = await supabase.functions.invoke('check-engine-subscription');

      if (error) throw error;

      setState({
        subscribed: data?.subscribed ?? false,
        tier: data?.tier ?? 'free',
        subscription_end: data?.subscription_end ?? null,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to check subscription';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: message,
      }));
    }
  }, []);

  // Check on mount and auth changes
  useEffect(() => {
    checkSubscription();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkSubscription();
    });

    return () => subscription.unsubscribe();
  }, [checkSubscription]);

  // Check periodically (every 60 seconds)
  useEffect(() => {
    const interval = setInterval(checkSubscription, 60000);
    return () => clearInterval(interval);
  }, [checkSubscription]);

  const startCheckout = useCallback(async (
    tier: EngineSubscriptionTier, 
    interval: 'monthly' | 'annual' = 'monthly'
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('Please sign in to subscribe');
        return null;
      }

      toast.info('Opening checkout...');

      const { data, error } = await supabase.functions.invoke('engine-checkout', {
        body: { tier, interval },
      });

      if (error) throw error;

      if (data?.url) {
        // Navigate in same tab for reliable mobile experience
        window.location.assign(data.url);
        return data.url;
      }

      throw new Error('No checkout URL returned');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Checkout failed';
      toast.error(message);
      return null;
    }
  }, []);

  const canAccessTier = useCallback((requiredTier: SubscriptionTier): boolean => {
    // Governor role is checked separately via useUserRole — not a pricing tier
    const tierPriority: Record<SubscriptionTier, number> = {
      free: 0,
      starter: 0,
      builder: 1,
      studio: 2,
      creator: 3,
      pro: 3,
      architect: 4,
      enterprise: 5,
    };
    return (tierPriority[state.tier] ?? 0) >= (tierPriority[requiredTier] ?? 0);
  }, [state.tier]);

  return {
    ...state,
    refresh: checkSubscription,
    startCheckout,
    canAccessTier,
  };
}
