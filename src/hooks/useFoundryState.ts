/**
 * useFoundryState — Per-user Memory Stream workspace hook
 * Loads user state, vault, handles crystallization, enforces quality floor.
 */
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { executeMine, filterByQualityFloor, type MineResult, type MineResponse } from '@/lib/foundry/public-mining-engine';
import { MEMORY_STREAM_EVENT, MEMORY_STREAM_EMPTY } from '@/lib/branding/memory-stream';
import { recordPipelineLineage } from '@/substrate/memory-lineage';
import { recordOperation } from '@/substrate/substrate-metrics';
import { toast } from 'sonner';

interface FoundryUserState {
  totalMines: number;
  streakDays: number;
  lastMineAt: string | null;
  tutorialCompleted: boolean;
  preferredMode: string;
}

interface InventoryItem {
  id: string;
  artifactId: string;
  artifactName: string;
  score: number;
  publicTier: string;
  valuationDisplay: number;
  obtainedAt: string;
  source: string;
  category: string | null;
  systemChain: string[] | null;
}

export function useFoundryState() {
  const { user } = useAuth();
  const [userState, setUserState] = useState<FoundryUserState | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isMining, setIsMining] = useState(false);
  const [lastMineResult, setLastMineResult] = useState<MineResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user state + vault
  const loadState = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // Ensure user state exists (upsert)
      const { data: state } = await supabase
        .from('foundry_user_state')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!state) {
        await supabase.from('foundry_user_state').insert({ user_id: user.id });
        setUserState({
          totalMines: 0,
          streakDays: 0,
          lastMineAt: null,
          tutorialCompleted: false,
          preferredMode: 'simple',
        });
      } else {
        setUserState({
          totalMines: state.total_mines ?? 0,
          streakDays: state.streak_days ?? 0,
          lastMineAt: state.last_mine_at,
          tutorialCompleted: state.tutorial_completed ?? false,
          preferredMode: state.preferred_mode ?? 'simple',
        });
      }

      // Load vault
      const { data: inv } = await supabase
        .from('foundry_inventory')
        .select('*')
        .eq('user_id', user.id)
        .order('obtained_at', { ascending: false });

      setInventory(
        (inv ?? []).map((i: any) => ({
          id: i.id,
          artifactId: i.artifact_id,
          artifactName: i.artifact_name,
          score: i.score,
          publicTier: i.public_tier,
          valuationDisplay: i.valuation_display,
          obtainedAt: i.obtained_at,
          source: i.source,
          category: i.category,
          systemChain: i.system_chain,
        }))
      );
    } catch (err) {
      console.error('Failed to load Memory Stream state:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadState();
  }, [loadState]);

  // Execute crystallization
  const mine = useCallback(async () => {
    if (!user) {
      toast.error('Sign in to crystallize');
      return;
    }
    if (isMining) return;

    setIsMining(true);
    try {
      const result = await executeMine();
      
      if (!result.ok) {
        if (result.retryAfterMs) {
          toast.error(`Rate limited. Try again in ${Math.ceil(result.retryAfterMs / 1000)}s`);
        } else {
          toast.error(result.error || 'Crystallization failed');
        }
        setLastMineResult(result);
        return;
      }

      // Apply client-side quality floor (defensive)
      result.results = filterByQualityFloor(result.results);

      setLastMineResult(result);

      // Record lineage + substrate metrics for each crystallized pipeline
      for (const r of result.results) {
        recordPipelineLineage(r.name, r.systemChain ?? [], r.score);
        recordOperation('MEMORY', Date.now() - startTime);
      }
      if (result.results.length > 0) {
        recordOperation('FORGE', Date.now() - startTime);
      }

      if (result.results.length === 0) {
        toast.info(MEMORY_STREAM_EMPTY);
        if (result.rerollCredit) {
          toast.success('Reroll credit earned!');
        }
      } else {
        const best = result.results[0];
        toast.success(`${MEMORY_STREAM_EVENT} — ${best.publicTier} (${best.score})`);
      }

      // Reload state
      await loadState();
    } catch (err: any) {
      toast.error(err.message || 'Crystallization failed');
    } finally {
      setIsMining(false);
    }
  }, [user, isMining, loadState]);

  // Stats
  const bestPull = inventory.length > 0
    ? inventory.reduce((best, item) => item.score > best.score ? item : best, inventory[0])
    : null;

  const tierCounts = inventory.reduce((acc, item) => {
    acc[item.publicTier] = (acc[item.publicTier] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    user,
    userState,
    inventory,
    isMining,
    lastMineResult,
    isLoading,
    mine,
    bestPull,
    tierCounts,
    inventoryCount: inventory.length,
    reload: loadState,
  };
}
