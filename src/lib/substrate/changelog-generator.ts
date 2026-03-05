/**
 * Changelog Auto-Generation Utility
 * Generates changelog entries from applied evolution patches
 *
 * Queries evolution_runs and substrate_upgrade_plans to auto-generate
 * structured changelog entries for the /changelog page.
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
 * Fetch recent evolution runs and format as changelog entries
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
      const diff = run.diff_summary || {};

      return {
        id: run.run_id,
        date: run.completed_at || run.created_at,
        version: summary.version ? `Evolution cycle` : 'Substrate adaptation',
        pressures: summary.pressures || ['Evolution cycle triggered by SEBA analysis'],
        responses: summary.responses || [
          diff.files_changed ? `Modified ${diff.files_changed} files` : 'Applied substrate patch',
          diff.lines_added ? `+${diff.lines_added} lines` : null,
        ].filter(Boolean) as string[],
        capabilities: summary.capabilities || ['Substrate integrity improved'],
        source: 'evolution_run' as const,
      };
    });
  } catch {
    return [];
  }
}

/**
 * Format a changelog entry for display
 */
export function formatChangelogDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
