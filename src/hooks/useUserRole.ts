/**
 * User Role Detection Hook — Centralized Access Identity
 * Determines Observer / Operator / Governor access level
 * 
 * Uses the Access module's identity endpoint for unified role resolution
 * across Dashboard, Terminal, Modernizer, and all substrate modules.
 * 
 * Role Hierarchy (governor ⊇ operator ⊇ observer):
 * - Observer: Any authenticated user (read-only telemetry)
 * - Operator: Users with 'operator' or higher role (can trigger safe actions)
 * - Governor: Admin users only (full system access, including backups/restores)
 * 
 * @version 2.1.0 — Unified with Access module identity
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
  displayName: string | null;
  developerId: string | null;
  refresh: () => Promise<void>;
}

export function useUserRole(): UserRoleState {
  const { user } = useAuth();
  const [role, setRole] = useState<SubstrateRole>('observer');
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [developerId, setDeveloperId] = useState<string | null>(null);

  const detectRole = useCallback(async () => {
    if (!user) {
      setRole('observer');
      setDisplayName(null);
      setDeveloperId(null);
      setLoading(false);
      return;
    }

    try {
      // Try to get identity from Access module first (unified source of truth)
      const { data: identityResult, error: identityError } = await supabase.functions.invoke('pf-substrate', {
        body: { module: 'access', action: 'identity' }
      });

      if (!identityError && identityResult?.success) {
        // Use Access module identity as source of truth
        const substrateRole = identityResult.substrate_role as SubstrateRole;
        setRole(substrateRole);
        setDisplayName(identityResult.developer?.display_name || null);
        setDeveloperId(identityResult.developer?.id || null);
        setLoading(false);
        return;
      }

      // Fallback: Direct role check from user_roles table
      const { data: isAdmin } = await supabase.rpc('has_role_text', {
        _user_id: user.id,
        _role: 'admin'
      });

      if (isAdmin) {
        setRole('governor');
        setLoading(false);
        return;
      }

      const { data: isOperator } = await supabase.rpc('has_role_text', {
        _user_id: user.id,
        _role: 'operator'
      });

      if (isOperator) {
        setRole('operator');
        setLoading(false);
        return;
      }

      const { data: isModerator } = await supabase.rpc('has_role_text', {
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
    displayName,
    developerId,
    refresh: detectRole,
  };
}
