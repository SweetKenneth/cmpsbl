/**
 * useCapabilityCheckout Hook
 * Handles Stripe checkout for capability purchases
 * v2.0.0 — Unified Pricing ($19-$299 public, off-menu licensed on request)
 */

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  hasStripeConfig, 
  getStripeConfig,
  hasSTierStripeConfig,
  getSTierStripeConfig,
  hasRecursiveStripeConfig,
  getRecursiveStripeConfig,
  hasExpansionStripeConfig,
  getExpansionStripeConfig,
  hasUltraStripeConfig,
  getUltraStripeConfig,
  hasPremiumStripeConfig,
  getPremiumStripeConfig,
} from '@/lib/capabilities/depot';
import {
  isOffMenuCapability,
  getLicenseRequestMailto,
  PRICE_CONFIG,
} from '@/lib/capabilities/depot/pricing-normalization';

interface CheckoutState {
  loading: boolean;
  error: string | null;
  capabilityId: string | null;
}

/**
 * Get the unified Stripe config for a capability
 */
function getUnifiedStripeConfig(capabilityId: string) {
  // Check all config sources in order of priority
  const recursiveConfig = getRecursiveStripeConfig(capabilityId);
  if (recursiveConfig) return { config: recursiveConfig, tier: 'recursive' as const };

  const stierConfig = getSTierStripeConfig(capabilityId);
  if (stierConfig) return { config: stierConfig, tier: 'stier' as const };

  // Add Premium tier check
  const premiumConfig = getPremiumStripeConfig(capabilityId);
  if (premiumConfig) return { config: premiumConfig, tier: 'premium' as const };

  const coreConfig = getStripeConfig(capabilityId);
  if (coreConfig) return { config: coreConfig, tier: 'core' as const };

  const expansionConfig = getExpansionStripeConfig(capabilityId);
  if (expansionConfig) return { config: expansionConfig, tier: 'expansion' as const };

  const ultraConfig = getUltraStripeConfig(capabilityId);
  if (ultraConfig) return { config: ultraConfig, tier: 'ultra' as const };

  return null;
}

/**
 * Check if capability checkout is enabled
 * Off-menu items and items >$299 require license request
 */
function isCheckoutEnabledForCapability(capabilityId: string): boolean {
  const result = getUnifiedStripeConfig(capabilityId);
  if (!result) return false;
  
  // Check if explicitly marked as off-menu in config
  if (result.config.offMenu) return false;
  
  // Check if capability ID contains off-menu keywords (code compilation only)
  if (isOffMenuCapability(capabilityId)) return false;
  
  // Check if price is within public range ($19-$299)
  const price = result.config.priceUsd;
  if (price > PRICE_CONFIG.max) return false;
  if (price < PRICE_CONFIG.min) return false;
  
  return true;
}

export function useCapabilityCheckout() {
  const [state, setState] = useState<CheckoutState>({
    loading: false,
    error: null,
    capabilityId: null,
  });

  const checkout = useCallback(async (capabilityId: string, capabilityName?: string) => {
    const result = getUnifiedStripeConfig(capabilityId);

    if (!result) {
      toast.error('Checkout not available for this capability');
      return;
    }

    // Check if off-menu — redirect to license request
    if (result.config.offMenu || isOffMenuCapability(capabilityId) || result.config.priceUsd > PRICE_CONFIG.max) {
      const name = capabilityName || capabilityId;
      const mailto = getLicenseRequestMailto(capabilityId, name);
      window.location.href = mailto;
      toast.info('Opening license inquiry email...');
      return;
    }

    // Check price bounds
    if (result.config.priceUsd < PRICE_CONFIG.min) {
      toast.error('This capability requires a custom license. Please contact us.');
      return;
    }

    // Open the tab synchronously to avoid popup blockers (critical for "Buy" buttons)
    const checkoutWindow = window.open('about:blank', '_blank');

    setState({ loading: true, error: null, capabilityId });

    try {
      const { data, error } = await supabase.functions.invoke('marketplace-checkout', {
        body: {
          product_type: result.tier,
          price_id: result.config.priceId,
          product_id: result.config.productId,
          capability_id: capabilityId,
        },
      });

      if (error) {
        throw new Error(error.message || 'Checkout failed');
      }

      if (data?.url) {
        if (checkoutWindow) {
          checkoutWindow.opener = null;
          checkoutWindow.location.href = data.url;
        } else {
          // Fallback if blocked
          window.location.href = data.url;
        }
        toast.success('Opening checkout...');
      } else {
        throw new Error('No checkout URL received');
      }

      setState({ loading: false, error: null, capabilityId: null });
    } catch (err) {
      // If we opened a blank tab but checkout failed, close it
      if (checkoutWindow) checkoutWindow.close();

      const errorMessage = err instanceof Error ? err.message : 'Checkout failed';
      setState({ loading: false, error: errorMessage, capabilityId: null });
      toast.error(errorMessage);
    }
  }, []);

  const getPrice = useCallback((capabilityId: string): number | null => {
    const result = getUnifiedStripeConfig(capabilityId);
    if (!result) return null;
    
    // Return null for off-menu items (display as "Licensed on request")
    if (result.config.offMenu || isOffMenuCapability(capabilityId) || result.config.priceUsd > PRICE_CONFIG.max) {
      return null;
    }
    
    return result.config.priceUsd;
  }, []);

  const isAvailable = useCallback((capabilityId: string): boolean => {
    return getUnifiedStripeConfig(capabilityId) !== null;
  }, []);

  const isCheckoutEnabled = useCallback((capabilityId: string): boolean => {
    return isCheckoutEnabledForCapability(capabilityId);
  }, []);

  const isOffMenu = useCallback((capabilityId: string): boolean => {
    const result = getUnifiedStripeConfig(capabilityId);
    if (!result) return false;
    return result.config.offMenu === true || isOffMenuCapability(capabilityId) || result.config.priceUsd > PRICE_CONFIG.max;
  }, []);

  const isSTier = useCallback((capabilityId: string): boolean => {
    return hasSTierStripeConfig(capabilityId);
  }, []);

  const isRecursive = useCallback((capabilityId: string): boolean => {
    return hasRecursiveStripeConfig(capabilityId);
  }, []);

  const getTier = useCallback((capabilityId: string): string | null => {
    const result = getUnifiedStripeConfig(capabilityId);
    return result?.tier || null;
  }, []);

  return {
    checkout,
    getPrice,
    isAvailable,
    isCheckoutEnabled,
    isOffMenu,
    isSTier,
    isRecursive,
    getTier,
    loading: state.loading,
    loadingCapability: state.capabilityId,
    error: state.error,
  };
}

export default useCapabilityCheckout;
