/**
 * Governance Gate — Wraps subsystem flag checks behind the governance mode.
 * If governance mode != ACTIVE, the mode overrides individual system_flags.
 * In ACTIVE mode, individual flags remain authoritative.
 */

import { supabase } from '@/integrations/supabase/client';
import { GovernanceMode, getSubsystemState } from './governance';

/** In-memory cache of governance mode (short TTL) */
let cachedMode: { mode: GovernanceMode; expiresAt: number } | null = null;
const CACHE_TTL = 10_000; // 10s

type GatedSubsystem = 'clm' | 'dream' | 'evolution' | 'schedulers' | 'mutations';

/**
 * Fetch current governance mode (cached).
 * Returns 'ACTIVE' on any error (failsafe).
 */
async function fetchGovernanceMode(): Promise<GovernanceMode> {
  if (cachedMode && Date.now() < cachedMode.expiresAt) {
    return cachedMode.mode;
  }

  try {
    // Also trigger auto-revert check
    try { await supabase.rpc('governance_auto_revert'); } catch { /* ignore */ }

    const { data, error } = await supabase
      .from('governance_mode')
      .select('mode')
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      cachedMode = { mode: 'ACTIVE', expiresAt: Date.now() + CACHE_TTL };
      return 'ACTIVE';
    }

    const mode = data.mode as GovernanceMode;
    cachedMode = { mode, expiresAt: Date.now() + CACHE_TTL };
    return mode;
  } catch {
    return 'ACTIVE'; // failsafe
  }
}

/**
 * Check if a subsystem is allowed to run under current governance.
 * In ACTIVE mode, returns `null` (defer to individual flag).
 * In other modes, returns the governance-enforced state.
 */
export async function isSubsystemAllowed(subsystem: GatedSubsystem): Promise<boolean | null> {
  const mode = await fetchGovernanceMode();
  if (mode === 'ACTIVE') return null; // defer to individual flags
  const state = getSubsystemState(mode);
  return state[subsystem];
}

/**
 * Combined check: governance gate + individual flag.
 * Use this as the single entry point for subsystem checks.
 */
export async function isSubsystemEnabled(subsystem: GatedSubsystem, flagKey: string): Promise<boolean> {
  const governanceOverride = await isSubsystemAllowed(subsystem);
  if (governanceOverride !== null) return governanceOverride;

  // ACTIVE mode: defer to individual system_flags
  const { isSystemFlagEnabled } = await import('./flags');
  return isSystemFlagEnabled(flagKey);
}

/** Invalidate the cached governance mode */
export function invalidateGovernanceCache(): void {
  cachedMode = null;
}
