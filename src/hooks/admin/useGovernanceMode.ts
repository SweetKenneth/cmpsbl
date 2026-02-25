/**
 * useGovernanceMode — Admin-only hook for the Clockless Governance Control Plane.
 * Reads current mode, switches modes, handles TTL auto-revert checks, and fetches audit log.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  GovernanceMode,
  GovernanceModeRecord,
  GovernanceAuditEntry,
  getAffectedSubsystems,
} from '@/lib/system/governance';

const QUERY_KEY = ['governance-mode'];
const AUDIT_KEY = ['governance-audit-log'];

export function useGovernanceMode() {
  const qc = useQueryClient();

  // ── Current mode ──
  const { data: currentMode, isLoading } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: async (): Promise<GovernanceModeRecord | null> => {
      // Check TTL auto-revert first
      try { await supabase.rpc('governance_auto_revert'); } catch { /* ignore */ }

      const { data, error } = await supabase
        .from('governance_mode')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as GovernanceModeRecord | null;
    },
    refetchInterval: 15_000, // poll every 15s for TTL checks
    staleTime: 5_000,
  });

  // ── Audit log ──
  const { data: auditLog = [], isLoading: auditLoading } = useQuery({
    queryKey: AUDIT_KEY,
    queryFn: async (): Promise<GovernanceAuditEntry[]> => {
      const { data, error } = await supabase
        .from('governance_audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return (data ?? []) as GovernanceAuditEntry[];
    },
  });

  // ── Switch mode ──
  const switchMode = useMutation({
    mutationFn: async ({
      newMode,
      reason,
      ttlMinutes,
    }: {
      newMode: GovernanceMode;
      reason: string;
      ttlMinutes?: number;
    }) => {
      const previousMode = currentMode?.mode ?? 'ACTIVE';
      if (previousMode === newMode) throw new Error('Already in this mode');

      const affected = getAffectedSubsystems(previousMode as GovernanceMode, newMode);
      const expiresAt = ttlMinutes
        ? new Date(Date.now() + ttlMinutes * 60_000).toISOString()
        : null;

      // Insert audit log
      const { error: auditErr } = await supabase
        .from('governance_audit_log')
        .insert({
          previous_mode: previousMode,
          new_mode: newMode,
          reason,
          ttl_minutes: ttlMinutes ?? null,
          affected_subsystems: affected,
        });
      if (auditErr) throw auditErr;

      // Update singleton
      const { error } = await supabase
        .from('governance_mode')
        .update({
          mode: newMode,
          reason,
          ttl_minutes: ttlMinutes ?? null,
          expires_at: expiresAt,
          changed_at: new Date().toISOString(),
        })
        .eq('id', currentMode!.id);

      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
      qc.invalidateQueries({ queryKey: AUDIT_KEY });
      toast.success(`Governance mode → ${vars.newMode}`);
    },
    onError: (err) => {
      toast.error(`Mode switch failed: ${(err as Error).message}`);
    },
  });

  // ── Panic revert ──
  const panicRevert = useMutation({
    mutationFn: async () => {
      const previousMode = currentMode?.mode ?? 'ACTIVE';
      if (previousMode === 'ACTIVE') throw new Error('Already ACTIVE');

      await supabase.from('governance_audit_log').insert({
        previous_mode: previousMode,
        new_mode: 'ACTIVE',
        reason: 'PANIC REVERT — emergency failsafe',
        affected_subsystems: getAffectedSubsystems(previousMode as GovernanceMode, 'ACTIVE'),
      });

      const { error } = await supabase
        .from('governance_mode')
        .update({
          mode: 'ACTIVE',
          reason: 'PANIC REVERT — emergency failsafe',
          ttl_minutes: null,
          expires_at: null,
          changed_at: new Date().toISOString(),
        })
        .eq('id', currentMode!.id);

      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
      qc.invalidateQueries({ queryKey: AUDIT_KEY });
      toast.success('🚨 PANIC REVERT — Governance mode restored to ACTIVE');
    },
    onError: (err) => {
      toast.error(`Panic revert failed: ${(err as Error).message}`);
    },
  });

  return {
    currentMode,
    isLoading,
    auditLog,
    auditLoading,
    switchMode,
    panicRevert,
  };
}
