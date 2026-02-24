/**
 * Hook for managing substrate changes in the Patch Governance Console.
 * Provides CRUD + approve/decline/dispatch for the approve/decline stream.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

export interface SubstrateChange {
  id: string;
  change_type: string;
  title: string;
  description: string | null;
  files_changed: string[];
  diff_summary: Record<string, unknown>;
  source: string;
  commit_hash: string | null;
  author: string | null;
  lnchbl_status: 'pending' | 'approved' | 'declined' | 'dispatched';
  declined_reason: string | null;
  approved_at: string | null;
  approved_by: string | null;
  dispatched_at: string | null;
  patch_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

const QUERY_KEY = ['substrate-changes'];

export function useSubstrateChanges(statusFilter?: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [...QUERY_KEY, statusFilter],
    queryFn: async () => {
      let q = (supabase as any)
        .from('substrate_changes')
        .select('*')
        .order('created_at', { ascending: false });

      if (statusFilter && statusFilter !== 'all') {
        q = q.eq('lnchbl_status', statusFilter);
      }

      const { data, error } = await q.limit(200);
      if (error) throw error;
      return (data || []) as SubstrateChange[];
    },
  });

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('substrate-changes-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'substrate_changes' },
        () => {
          queryClient.invalidateQueries({ queryKey: QUERY_KEY });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  const approveMutation = useMutation({
    mutationFn: async (changeId: string) => {
      const { error } = await (supabase as any)
        .from('substrate_changes')
        .update({
          lnchbl_status: 'approved',
          approved_at: new Date().toISOString(),
        })
        .eq('id', changeId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });

  const declineMutation = useMutation({
    mutationFn: async ({ changeId, reason }: { changeId: string; reason?: string }) => {
      const { error } = await (supabase as any)
        .from('substrate_changes')
        .update({
          lnchbl_status: 'declined',
          declined_reason: reason || 'CMPSBL-only change',
        })
        .eq('id', changeId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });

  const batchDispatchMutation = useMutation({
    mutationFn: async (changeIds: string[]) => {
      // Mark as dispatched
      const { error } = await (supabase as any)
        .from('substrate_changes')
        .update({
          lnchbl_status: 'dispatched',
          dispatched_at: new Date().toISOString(),
        })
        .in('id', changeIds);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });

  return {
    changes: query.data || [],
    isLoading: query.isLoading,
    approve: approveMutation,
    decline: declineMutation,
    batchDispatch: batchDispatchMutation,
  };
}
