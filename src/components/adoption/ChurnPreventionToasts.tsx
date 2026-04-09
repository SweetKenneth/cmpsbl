/**
 * ChurnPreventionToasts — Shows toast warnings about subscription value
 * Fires on login when the user has accumulated value at risk.
 * Also warns trial users when their trial is about to expire.
 */
import { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useFoundryState } from '@/hooks/useFoundryState';
import { useTrialAccess } from '@/hooks/useTrialAccess';
import { useUserRole } from '@/hooks/useUserRole';
import { toast } from 'sonner';

/** Show at most once per session */
const SESSION_KEY = 'cmpsbl_churn_toast_shown';

export function ChurnPreventionToasts() {
  const { user } = useAuth();
  const { inventory } = useFoundryState();
  const { isTrialActive, daysRemaining, trialTier } = useTrialAccess();
  const { role, isGovernor } = useUserRole();
  const hasFired = useRef(false);

  useEffect(() => {
    if (!user || isGovernor || hasFired.current) return;
    if (sessionStorage.getItem(SESSION_KEY)) return;

    // Wait for data to load
    const timer = setTimeout(() => {
      if (hasFired.current) return;
      hasFired.current = true;
      sessionStorage.setItem(SESSION_KEY, '1');

      // Trial expiration warning (≤2 days left)
      if (isTrialActive && daysRemaining <= 2 && trialTier) {
        const tierLabel = trialTier.charAt(0).toUpperCase() + trialTier.slice(1);
        const inventoryCount = inventory.length;

        if (inventoryCount > 0) {
          toast.warning(`Your ${tierLabel} trial expires in ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}`, {
            description: `You've crystallized ${inventoryCount} memories. Subscribe now to keep full access — your inventory goes read-only when the trial ends.`,
            duration: 10000,
            action: {
              label: 'Subscribe',
              onClick: () => window.location.href = '/plans',
            },
          });
        } else {
          toast.warning(`${tierLabel} trial ending in ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}`, {
            description: 'Subscribe to keep your expanded access.',
            duration: 8000,
            action: {
              label: 'View Plans',
              onClick: () => window.location.href = '/plans',
            },
          });
        }
        return;
      }

      // Free user with significant inventory — remind them of value at risk
      if (role === 'free' && inventory.length >= 10) {
        const totalValue = inventory.reduce((sum, i) => sum + (i.valuationDisplay || 0), 0);
        const displayValue = (totalValue / 100).toLocaleString();

        toast.info('Your Memory Stream is growing', {
          description: `${inventory.length} crystallized memories worth $${displayValue}. Upgrade to unlock deeper crystallization depth and protect your compounding value.`,
          duration: 8000,
          action: {
            label: 'Upgrade',
            onClick: () => window.location.href = '/plans',
          },
        });
        return;
      }

      // Trial user with active trial but >3 days left — show value summary
      if (isTrialActive && daysRemaining > 2 && inventory.length > 0) {
        toast.success(`${inventory.length} memories crystallized during your trial`, {
          description: 'Your substrate is building compounding value. Keep going!',
          duration: 6000,
        });
      }
    }, 3000); // 3s delay so it doesn't clash with page load

    return () => clearTimeout(timer);
  }, [user, isGovernor, isTrialActive, daysRemaining, trialTier, inventory, role]);

  return null; // Renderless component
}
