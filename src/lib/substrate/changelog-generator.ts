/**
 * Changelog Auto-Generation Utility
 * Generates changelog entries from applied evolution patches.
 *
 * Queries evolution_runs to auto-generate structured entries
 * for the /changelog page. Never exposes internal mechanisms.
 */

import { supabase } from '@/integrations/supabase/client';

export interface AutoChangelogEntry {
  id: string;
  date: string;
  version: string;
  pressures: string[];
  responses: string[];
  capabilities: string[];
  source: 'evolution_run' | 'manual';
}

/**
 * Fetch recent evolution runs and format as changelog entries.
 * All entries are sanitized — no internal details exposed.
 */
export async function fetchAutoChangelog(limit = 20): Promise<AutoChangelogEntry[]> {
  try {
    const { data: runs, error } = await supabase
      .from('evolution_runs' as any)
      .select('run_id, plan_id, phase, created_at, started_at, completed_at, result_summary, diff_summary')
      .eq('phase', 'verified')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error || !runs) return [];

    return (runs as any[]).map((run: any) => {
      const summary = run.result_summary || {};

      return {
        id: run.run_id,
        date: run.completed_at || run.created_at,
        version: '',
        pressures: summary.pressures || ['System stability milestone reached'],
        responses: summary.responses || ['Substrate integrity improved'],
        capabilities: summary.capabilities || ['System resilience enhanced'],
        source: 'evolution_run' as const,
      };
    });
  } catch {
    return [];
  }
}

/**
 * Format a changelog entry date for display
 */
export function formatChangelogDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
