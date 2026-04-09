/**
 * useTrialAccess — Manages 7-day trial activation and status
 * Allows free users to experience Studio/Creator/Architect for 7 days.
 */
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { SubstrateRole } from '@/hooks/useUserRole';

interface TrialState {
  /** Currently active trial tier, or null */
  trialTier: SubstrateRole | null;
  /** When the trial expires */
  trialExpiresAt: Date | null;
  /** Days remaining in trial */
  daysRemaining: number;
  /** Whether a trial is currently active */
  isTrialActive: boolean;
  /** Whether the user has already used a trial (expired or active) */
  hasUsedTrial: boolean;
  /** Loading state */
  isLoading: boolean;
  /** Start a trial for a given tier */
  startTrial: (tier: SubstrateRole) => Promise<boolean>;
}

const TRIAL_DURATION_DAYS = 7;

export function useTrialAccess(): TrialState {
  const { user } = useAuth();
  const [trialTier, setTrialTier] = useState<SubstrateRole | null>(null);
  const [trialExpiresAt, setTrialExpiresAt] = useState<Date | null>(null);
  const [hasUsedTrial, setHasUsedTrial] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load trial state
  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const loadTrial = async () => {
      try {
        // Get the user's developer record
        const { data: dev } = await supabase
          .from('access_developers')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (!dev) {
          setIsLoading(false);
          return;
        }

        const { data: sub } = await supabase
          .from('access_subscriptions')
          .select('trial_tier, trial_started_at, trial_expires_at')
          .eq('developer_id', dev.id)
          .maybeSingle();

        if (sub?.trial_tier) {
          const expires = new Date(sub.trial_expires_at!);
          const now = new Date();
          setHasUsedTrial(true);

          if (expires > now) {
            setTrialTier(sub.trial_tier as SubstrateRole);
            setTrialExpiresAt(expires);
          } else {
            // Trial expired
            setTrialTier(null);
            setTrialExpiresAt(null);
          }
        }
      } catch {
        // Silent fail — trial is a bonus feature
      } finally {
        setIsLoading(false);
      }
    };

    loadTrial();
  }, [user]);

  const isTrialActive = trialTier !== null && trialExpiresAt !== null && trialExpiresAt > new Date();

  const daysRemaining = trialExpiresAt
    ? Math.max(0, Math.ceil((trialExpiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  const startTrial = useCallback(async (tier: SubstrateRole): Promise<boolean> => {
    if (!user) {
      toast.error('Sign in to start a trial');
      return false;
    }

    if (hasUsedTrial) {
      toast.error('Trial Already Used', {
        description: 'You can only trial once. Subscribe to unlock full access.',
        duration: 5000,
      });
      return false;
    }

    try {
      const { data: dev } = await supabase
        .from('access_developers')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!dev) {
        toast.error('Account not found. Please sign in again.');
        return false;
      }

      const now = new Date();
      const expiresAt = new Date(now.getTime() + TRIAL_DURATION_DAYS * 24 * 60 * 60 * 1000);

      const { error } = await supabase
        .from('access_subscriptions')
        .update({
          trial_tier: tier,
          trial_started_at: now.toISOString(),
          trial_expires_at: expiresAt.toISOString(),
        })
        .eq('developer_id', dev.id);

      if (error) {
        // If no subscription row exists, insert one
        const { error: insertError } = await supabase
          .from('access_subscriptions')
          .insert({
            developer_id: dev.id,
            trial_tier: tier,
            trial_started_at: now.toISOString(),
            trial_expires_at: expiresAt.toISOString(),
            status: 'trial',
          });

        if (insertError) throw insertError;
      }

      setTrialTier(tier as SubstrateRole);
      setTrialExpiresAt(expiresAt);
      setHasUsedTrial(true);

      const tierLabel = tier.charAt(0).toUpperCase() + tier.slice(1);
      toast.success(`${tierLabel} Trial Activated!`, {
        description: `You have ${TRIAL_DURATION_DAYS} days of full ${tierLabel} access. Enjoy!`,
        duration: 6000,
      });

      return true;
    } catch (err) {
      toast.error('Failed to start trial. Please try again.');
      return false;
    }
  }, [user, hasUsedTrial]);

  return {
    trialTier,
    trialExpiresAt,
    daysRemaining,
    isTrialActive,
    hasUsedTrial,
    isLoading,
    startTrial,
  };
}
