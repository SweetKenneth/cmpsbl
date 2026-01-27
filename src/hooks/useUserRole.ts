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
      // Primary: Direct role check from user_roles table (most reliable)
      const { data: isAdmin } = await supabase.rpc('has_role_text', {
        _user_id: user.id,
        _role: 'admin'
      });

      if (isAdmin === true) {
        setRole('governor');
        // Try to get display name from developer profile
        const { data: dev } = await supabase
          .from('access_developers')
          .select('id, display_name')
          .eq('user_id', user.id)
          .maybeSingle();
        if (dev) {
          setDisplayName(dev.display_name);
          setDeveloperId(dev.id);
        } else {
          setDisplayName(user.email?.split('@')[0] || 'Governor');
        }
        setLoading(false);
        return;
      }

      const { data: isOperatorRole } = await supabase.rpc('has_role_text', {
        _user_id: user.id,
        _role: 'operator'
      });

      if (isOperatorRole === true) {
        setRole('operator');
        setLoading(false);
        return;
      }

      const { data: isModerator } = await supabase.rpc('has_role_text', {
        _user_id: user.id,
        _role: 'moderator'
      });

      if (isModerator === true) {
        setRole('operator');
        setLoading(false);
        return;
      }

      // Fallback: Try Access module identity endpoint
      try {
        const { data: identityResult, error: identityError } = await supabase.functions.invoke('pf-substrate', {
          body: { module: 'access', action: 'identity' }
        });

        if (!identityError && identityResult?.success) {
          const substrateRole = identityResult.substrate_role as SubstrateRole;
          setRole(substrateRole);
          setDisplayName(identityResult.developer?.display_name || null);
          setDeveloperId(identityResult.developer?.id || null);
          setLoading(false);
          return;
        }
      } catch {
        // Continue to default
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
