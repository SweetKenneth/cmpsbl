/**
 * User Role Detection Hook
 * Determines Observer / Operator / Governor access level
 * 
 * Observer: Any authenticated user (read-only telemetry)
 * Operator: Users with 'operator' or higher role (can trigger safe actions)
 * Governor: Admin users only (full system access)
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type SubstrateRole = 'observer' | 'operator' | 'governor';

interface UserRoleState {
  role: SubstrateRole;
  loading: boolean;
  isObserver: boolean;
  isOperator: boolean;
  isGovernor: boolean;
  refresh: () => Promise<void>;
}

export function useUserRole(): UserRoleState {
  const { user } = useAuth();
  const [role, setRole] = useState<SubstrateRole>('observer');
  const [loading, setLoading] = useState(true);

  const detectRole = useCallback(async () => {
    if (!user) {
      setRole('observer');
      setLoading(false);
      return;
    }

    try {
      // Check for admin/governor role first
      const { data: isAdmin } = await supabase.rpc('has_role', {
        _user_id: user.id,
        _role: 'admin'
      });

      if (isAdmin) {
        setRole('governor');
        setLoading(false);
        return;
      }

      // Check for operator role
      const { data: isOperator } = await supabase.rpc('has_role', {
        _user_id: user.id,
        _role: 'operator'
      });

      if (isOperator) {
        setRole('operator');
        setLoading(false);
        return;
      }

      // Check for moderator role (treat as operator)
      const { data: isModerator } = await supabase.rpc('has_role', {
        _user_id: user.id,
        _role: 'moderator'
      });

      if (isModerator) {
        setRole('operator');
        setLoading(false);
        return;
      }

      // Default to observer for authenticated users
      setRole('observer');
    } catch (error) {
      console.error('Role detection error:', error);
      // Default to observer on error
      setRole('observer');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    detectRole();
  }, [detectRole]);

  return {
    role,
    loading,
    isObserver: true, // Everyone can observe
    isOperator: role === 'operator' || role === 'governor',
    isGovernor: role === 'governor',
    refresh: detectRole,
  };
}
