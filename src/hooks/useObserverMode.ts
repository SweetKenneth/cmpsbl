/**
 * Observer Mode Hook
 * Provides view-only restrictions for observer role users
 * Observers can see dashboard components but cannot interact with them
 */

import { useUserRole } from './useUserRole';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useCallback } from 'react';

interface ObserverModeState {
  /** Whether user is in observer-only mode */
  isObserverOnly: boolean;
  /** Whether user can interact with controls */
  canInteract: boolean;
  /** Whether user can execute commands */
  canExecute: boolean;
  /** Whether user can modify settings */
  canModify: boolean;
  /** Show restricted action toast */
  showRestrictionToast: () => void;
  /** Wrap an action with permission check */
  guardAction: <T extends (...args: any[]) => any>(
    action: T,
    requiredLevel?: 'operator' | 'governor'
  ) => (...args: Parameters<T>) => ReturnType<T> | undefined;
}

export function useObserverMode(): ObserverModeState {
  const { user } = useAuth();
  const { role, isOperator, isGovernor } = useUserRole();

  // Observer-only: authenticated but only observer role
  const isObserverOnly = !!user && role === 'observer';

  // Interaction permissions
  const canInteract = isOperator || isGovernor;
  const canExecute = isOperator || isGovernor;
  const canModify = isGovernor;

  const showRestrictionToast = useCallback(() => {
    toast.error('Observer Mode', {
      description: 'Your account is in observer mode. Upgrade to operator or governor access to interact with controls.',
      duration: 4000,
    });
  }, []);

  const guardAction = useCallback(<T extends (...args: any[]) => any>(
    action: T,
    requiredLevel: 'operator' | 'governor' = 'operator'
  ) => {
    return (...args: Parameters<T>): ReturnType<T> | undefined => {
      const hasPermission = requiredLevel === 'governor' ? isGovernor : isOperator;
      
      if (!hasPermission) {
        showRestrictionToast();
        return undefined;
      }
      
      return action(...args);
    };
  }, [isOperator, isGovernor, showRestrictionToast]);

  return {
    isObserverOnly,
    canInteract,
    canExecute,
    canModify,
    showRestrictionToast,
    guardAction,
  };
}
