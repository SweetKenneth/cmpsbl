/**
 * AutoBlog Length Cadence v1.0
 * Cyclical word-length targeting: 850+, 850+, 1200+ repeating.
 */

import { supabase } from '@/integrations/supabase/client';

export interface LengthTarget {
  targetWords: number;
  cyclePosition: number; // 0, 1, or 2
  label: string;
}

const CYCLE: { target: number; label: string }[] = [
  { target: 850, label: 'standard' },
  { target: 850, label: 'standard' },
  { target: 1200, label: 'extended' },
];

/**
 * Get the current target word length based on publish cycle position.
 */
export async function getTargetWordLength(): Promise<LengthTarget> {
  try {
    const { data } = await supabase
      .from('autoblog_publish_cycle' as any)
      .select('publish_count')
      .limit(1)
      .maybeSingle();

    const count = (data as any)?.publish_count ?? 0;
    const position = count % 3;
    const cycle = CYCLE[position];

    return {
      targetWords: cycle.target,
      cyclePosition: position,
      label: cycle.label,
    };
  } catch {
    return { targetWords: 850, cyclePosition: 0, label: 'standard' };
  }
}

/**
 * Increment the publish count after a successful publish.
 */
export async function incrementPublishCount(): Promise<void> {
  try {
    const { data } = await supabase
      .from('autoblog_publish_cycle' as any)
      .select('id, publish_count')
      .limit(1)
      .maybeSingle();

    if (data) {
      const record = data as any;
      await supabase
        .from('autoblog_publish_cycle' as any)
        .update({
          publish_count: (record.publish_count || 0) + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('id', record.id);
    }
  } catch (err) {
    console.warn('[AutoBlog LengthCadence] Failed to increment publish count:', err);
  }
}

/**
 * Build a length instruction string for the generation prompt.
 */
export function buildLengthInstruction(target: LengthTarget): string {
  if (target.label === 'extended') {
    return `TARGET LENGTH: ${target.targetWords}+ words. This is an extended-format post. Include deeper analysis, additional examples, and expanded reasoning sections. Aim for comprehensive coverage.`;
  }
  return `TARGET LENGTH: ${target.targetWords}+ words. Ensure thorough coverage with clear structure, examples, and actionable insights.`;
}
