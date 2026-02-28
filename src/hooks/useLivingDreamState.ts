/**
 * Dream-Eater useLivingState hook v1.0.0
 * 
 * Real-time state management for the living Dream-Eater.
 * Handles state fetching, real-time subscriptions, and mutations.
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type DreamEaterMood = 'calm' | 'curious' | 'agitated' | 'fractured' | 'dormant' | 'feral' | 'dreaming';

/** Maps DB mood values to UI-compatible mood values */
const DB_MOOD_MAP: Record<string, DreamEaterMood> = {
  peaceful: 'calm',
  neutral: 'dormant',
  agitated: 'agitated',
  nightmare: 'fractured',
  dreaming: 'dreaming',
  synthesizing: 'curious',
  reflecting: 'calm',
  learning: 'curious',
  integrating: 'dreaming',
  mutating: 'feral',
  digesting: 'calm',
  // Direct matches
  calm: 'calm',
  curious: 'curious',
  fractured: 'fractured',
  dormant: 'dormant',
  feral: 'feral',
};

function normalizeDbMood(raw: string | null | undefined): DreamEaterMood {
  if (!raw) return 'calm';
  return DB_MOOD_MAP[raw] ?? 'calm';
}

export interface DreamEaterState {
  id: string;
  current_mood: DreamEaterMood;
  mutation_level: number;
  dreams_consumed_today: number;
  nightmares_consumed_today: number;
  last_fed_at: string | null;
  awaken_count: number;
}

export interface Milestone {
  id: string;
  milestone_level: number;
  milestone_name: string;
  description: string | null;
  unlocked_at: string | null;
}

export interface UseLivingStateReturn {
  state: DreamEaterState | null;
  milestones: Milestone[];
  loading: boolean;
  error: string | null;
  isLive: boolean;
  consume: (content: string, type: 'dream' | 'nightmare', optInExcerpt?: boolean) => Promise<ConsumeResult | null>;
}

interface ConsumeResult {
  success: boolean;
  state: DreamEaterState;
  mood_transition: { from: DreamEaterMood; to: DreamEaterMood };
  mutation_delta: number;
  intensity: number | null;
  echo: string | null;
  milestones_unlocked: Milestone[];
}

export function useLivingState(): UseLivingStateReturn {
  const [state, setState] = useState<DreamEaterState | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);

  // Initial fetch
  useEffect(() => {
    const fetchState = async () => {
      try {
        const [stateRes, milestonesRes] = await Promise.all([
          supabase.from('dream_eater_state').select('*').single(),
          supabase.from('dream_eater_milestones').select('*').order('milestone_level'),
        ]);

        if (stateRes.error) {
          console.error('Dream-Eater state fetch error:', stateRes.error.message);
        } else if (stateRes.data) {
          setState(stateRes.data as unknown as DreamEaterState);
        }
        if (milestonesRes.error) {
          console.error('Dream-Eater milestones fetch error:', milestonesRes.error.message);
        } else if (milestonesRes.data) {
          setMilestones(milestonesRes.data as Milestone[]);
        }
      } catch (e) {
        console.error('Dream-Eater connection error:', e);
        setError('Failed to connect to Dream-Eater');
      } finally {
        setLoading(false);
      }
    };

    fetchState();

    // Real-time subscription for state changes
    const channel = supabase
      .channel('dream_eater_state_live')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'dream_eater_state',
        },
        (payload) => {
          if (payload.new) {
            setState(payload.new as unknown as DreamEaterState);
          }
        }
      )
      .subscribe((status) => {
        setIsLive(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Generate session hash for rate limiting
  const getSessionHash = useCallback(() => {
    let hash = sessionStorage.getItem('dream_session_hash');
    if (!hash) {
      hash = Math.random().toString(36).substring(2) + Date.now().toString(36);
      sessionStorage.setItem('dream_session_hash', hash);
    }
    return hash;
  }, []);

  // Consume a dream/nightmare
  const consume = useCallback(async (
    content: string,
    type: 'dream' | 'nightmare',
    optInExcerpt = false
  ): Promise<ConsumeResult | null> => {
    try {
      const response = await supabase.functions.invoke('pf-dream-state-engine', {
        body: {
          action: 'consume',
          content,
          type,
          session_hash: getSessionHash(),
          opt_in_excerpt: optInExcerpt,
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const result = response.data as ConsumeResult;
      
      // Update local state immediately
      if (result.state) {
        setState(result.state);
      }

      // Update milestones if any were unlocked
      if (result.milestones_unlocked?.length > 0) {
        setMilestones(prev => prev.map(m => {
          const unlocked = result.milestones_unlocked.find(u => u.milestone_level === m.milestone_level);
          return unlocked ? { ...m, unlocked_at: unlocked.unlocked_at } : m;
        }));
      }

      return result;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to feed Dream-Eater');
      return null;
    }
  }, [getSessionHash]);

  return {
    state,
    milestones,
    loading,
    error,
    isLive,
    consume,
  };
}

export default useLivingState;
