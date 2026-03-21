/**
 * User Role Detection Hook — Centralized Access Identity
 * Determines Builder / Studio / Creator / Architect / Governor access level
 * 
 * Uses the Access module's identity endpoint for unified role resolution
 * across Dashboard, Terminal, EVOLUTION, and all substrate modules.
 * 
 * Role Hierarchy (governor ⊇ architect ⊇ creator ⊇ studio ⊇ builder):
 * - Builder (free): Any authenticated user (read-only dashboard, basic commands)
 * - Studio: Users with basic subscription (terminal, SDK templates)
 * - Creator: Users with 'operator' role (engines, analytics, agents)
 * - Architect: Users with 'moderator' role (evolution, mesh, ENCODE)
 * - Governor: Admin users only (full system access, cognitive forge, mints)
 * 
 * @version 4.0.0 — Corrected tier hierarchy
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type SubstrateRole = 'free' | 'creator' | 'studio' | 'architect' | 'governor';

interface UserRoleState {
  role: SubstrateRole;
  loading: boolean;
  isFree: boolean;
  isCreator: boolean;
  isArchitect: boolean;
  isGovernor: boolean;
  /** @deprecated Use isFree instead */
  isObserver: boolean;
  /** @deprecated Use isCreator instead */
  isOperator: boolean;
  displayName: string | null;
  developerId: string | null;
  refresh: () => Promise<void>;
}

export function useUserRole(): UserRoleState {
  const { user } = useAuth();
  const [role, setRole] = useState<SubstrateRole>('free');
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [developerId, setDeveloperId] = useState<string | null>(null);

  const detectRole = useCallback(async () => {
    if (!user) {
      setRole('free');
      setDisplayName(null);
      setDeveloperId(null);
      setLoading(false);
      return;
    }

    try {
      const checkRole = async (roleName: string): Promise<boolean> => {
        try {
          const { data, error } = await supabase.rpc('has_role_text', {
            _user_id: user.id,
            _role: roleName,
          });

          return !error && data === true;
        } catch {
          return false;
        }
      };

      const isAdmin = await checkRole('admin');
      if (isAdmin) {
        setRole('governor');

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

      const isModerator = await checkRole('moderator');
      if (isModerator) {
        setRole('architect');
        setLoading(false);
        return;
      }

      const isOperatorRole = await checkRole('operator');
      if (isOperatorRole) {
        setRole('creator');
        setLoading(false);
        return;
      }

      try {
        const { data: identityResult, error: identityError } = await supabase.functions.invoke('pf-substrate', {
          body: { module: 'access', action: 'identity' }
        });

        if (!identityError && identityResult?.success) {
          const legacyRole = identityResult.substrate_role;
          const mappedRole: SubstrateRole = 
            legacyRole === 'governor' ? 'governor' :
            legacyRole === 'operator' ? 'creator' :
            'free';

          setRole(mappedRole);
          setDisplayName(identityResult.developer?.display_name || null);
          setDeveloperId(identityResult.developer?.id || null);
          setLoading(false);
          return;
        }
      } catch {
        // Continue to subscription fallback
      }

      try {
        const { data: dev } = await supabase
          .from('access_developers')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (dev) {
          const { data: sub } = await supabase
            .from('access_subscriptions')
            .select('tier')
            .eq('developer_id', dev.id)
            .eq('status', 'active')
            .maybeSingle();
          
          if (sub?.tier) {
            const tierMap: Record<string, SubstrateRole> = {
              enterprise: 'governor',
              pro: 'architect',
              studio: 'studio',
              builder: 'creator',
              free: 'free',
            };
            setRole(tierMap[sub.tier] || 'free');
            setLoading(false);
            return;
          }
        }
      } catch {
        // Continue to default
      }

      setRole('free');
    } catch (error) {
      console.error('Role detection error:', error);
      setRole('free');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    detectRole();
  }, [detectRole]);

  // Tier hierarchy: governor > architect > creator > free
  const isGovernor = role === 'governor';
  const isArchitect = isGovernor || role === 'architect';
  const isCreator = isArchitect || role === 'creator';
  const isFree = true; // Everyone is at least free

  return {
    role,
    loading,
    isFree,
    isCreator,
    isArchitect,
    isGovernor,
    // Legacy compatibility
    isObserver: isFree,
    isOperator: isCreator,
    displayName,
    developerId,
    refresh: detectRole,
  };
}
