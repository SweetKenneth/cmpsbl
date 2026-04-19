/**
 * useDreamUnseen — Governor-only hook that polls dream_intent_syntheses
 * for syntheses the current user hasn't acknowledged yet (decode_dream_seen).
 * Drives the orb notification pulse and DECODE auto-greet.
 */
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface UnseenSynthesis {
  id: string;
  insight_text: string;
  synthesis_kind: string;
  confidence: number;
  tags: string[] | null;
  created_at: string;
  cycle_id: string;
  source_intent_ids: string[] | null;
}

interface State {
  unseen: UnseenSynthesis[];
  count: number;
  latest: UnseenSynthesis | null;
}

const EMPTY: State = { unseen: [], count: 0, latest: null };
const POLL_MS = 60_000;

export function useDreamUnseen(userId: string | undefined, isGovernor: boolean) {
  const [state, setState] = useState<State>(EMPTY);

  const fetchUnseen = useCallback(async () => {
    if (!userId || !isGovernor) { setState(EMPTY); return; }
    try {
      // Pull recent active syntheses
      const { data: syntheses } = await supabase
        .from('dream_intent_syntheses')
        .select('id, insight_text, synthesis_kind, confidence, tags, created_at, cycle_id, source_intent_ids')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(20);

      if (!syntheses || syntheses.length === 0) { setState(EMPTY); return; }

      const ids = syntheses.map((s) => s.id);
      const { data: seen } = await supabase
        .from('decode_dream_seen')
        .select('synthesis_id')
        .eq('user_id', userId)
        .in('synthesis_id', ids);

      const seenSet = new Set((seen || []).map((r) => r.synthesis_id));
      const unseen = (syntheses as UnseenSynthesis[]).filter((s) => !seenSet.has(s.id));
      setState({ unseen, count: unseen.length, latest: unseen[0] || null });
    } catch {
      setState(EMPTY);
    }
  }, [userId, isGovernor]);

  useEffect(() => {
    fetchUnseen();
    if (!userId || !isGovernor) return;
    const id = setInterval(fetchUnseen, POLL_MS);
    return () => clearInterval(id);
  }, [userId, isGovernor, fetchUnseen]);

  const acknowledge = useCallback(async (ids: string[]) => {
    if (!userId || ids.length === 0) return;
    try {
      await supabase.from('decode_dream_seen').upsert(
        ids.map((synthesis_id) => ({ user_id: userId, synthesis_id })),
        { onConflict: 'user_id,synthesis_id' }
      );
      setState((prev) => {
        const remaining = prev.unseen.filter((s) => !ids.includes(s.id));
        return { unseen: remaining, count: remaining.length, latest: remaining[0] || null };
      });
    } catch { /* silent */ }
  }, [userId]);

  return { ...state, refresh: fetchUnseen, acknowledge };
}
