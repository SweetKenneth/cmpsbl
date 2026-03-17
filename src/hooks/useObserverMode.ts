/**
 * Tier Access Guard Hook
 * Provides tier-based restrictions for substrate controls
 * Free users can see dashboard but cannot interact with gated features
 */

import { useUserRole, type SubstrateRole } from './useUserRole';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useCallback } from 'react';

const TIER_LABELS: Record<SubstrateRole, string> = {
  free: 'Free',
  creator: 'Creator ($29/mo)',
  studio: 'Studio ($49/mo)',
  architect: 'Architect ($79/mo)',
  governor: 'Governor (Admin)',
};

interface ObserverModeState {
  /** Whether user is on free tier only */
  isObserverOnly: boolean;
  /** Whether user can interact with controls (creator+) */
  canInteract: boolean;
  /** Whether user can execute commands (creator+) */
  canExecute: boolean;
  /** Whether user can modify settings (architect+) */
  canModify: boolean;
  /** Show restricted action toast */
  showRestrictionToast: (requiredTier?: SubstrateRole) => void;
  /** Wrap an action with permission check */
  guardAction: <T extends (...args: any[]) => any>(
    action: T,
    requiredTier?: SubstrateRole
  ) => (...args: Parameters<T>) => ReturnType<T> | undefined;
}

export function useObserverMode(): ObserverModeState {
  const { user } = useAuth();
  const { role, isCreator, isArchitect, isGovernor } = useUserRole();

  // Free-only: authenticated but only free role
  const isObserverOnly = !!user && role === 'free';

  // Interaction permissions
  const canInteract = isCreator;
  const canExecute = isCreator;
  const canModify = isArchitect;

  const showRestrictionToast = useCallback((requiredTier: SubstrateRole = 'creator') => {
    toast.error('Access Restricted', {
      description: `This feature requires ${TIER_LABELS[requiredTier]} access. Your current tier: ${TIER_LABELS[role]}.`,
      duration: 4000,
    });
  }, [role]);

  const guardAction = useCallback(<T extends (...args: any[]) => any>(
    action: T,
    requiredTier: SubstrateRole = 'creator'
  ) => {
    return (...args: Parameters<T>): ReturnType<T> | undefined => {
      const tierOrder: SubstrateRole[] = ['free', 'creator', 'studio', 'architect', 'governor'];
      const requiredLevel = tierOrder.indexOf(requiredTier);
      const currentLevel = tierOrder.indexOf(role);
      
      if (currentLevel < requiredLevel) {
        showRestrictionToast(requiredTier);
        return undefined;
      }
      
      return action(...args);
    };
  }, [role, showRestrictionToast]);

  return {
    isObserverOnly,
    canInteract,
    canExecute,
    canModify,
    showRestrictionToast,
    guardAction,
  };
}
