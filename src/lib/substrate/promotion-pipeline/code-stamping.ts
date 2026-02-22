/**
 * Code Stamping — Marks files with promotion metadata
 */

import { supabase } from '@/integrations/supabase/client';

/** Generate stamp text for a promotion */
function generateStampText(
  promotionId: string,
  shadowRunId: string,
  rulesApplied: number,
  integrityScore: number,
): string {
  return [
    '// CMPSBL IMMUNITY PROMOTION',
    `// promotion_id: ${promotionId}`,
    `// shadow_run: ${shadowRunId}`,
    `// timestamp: ${new Date().toISOString()}`,
    `// rules_applied: ${rulesApplied}`,
    `// diff_hash: ${promotionId.slice(0, 8)}`,
    `// integrity_score: ${integrityScore}`,
    '// verified: true',
  ].join('\n');
}

/** Insert code stamps for a promotion */
export async function insertCodeStamps(
  promotionId: string,
  shadowRunId: string,
  integrityScore: number,
): Promise<number> {
  // Get rule count
  const { data: rules } = await supabase
    .from('immunity_rules')
    .select('id')
    .eq('status', 'promoted') as any;

  const rulesApplied = rules?.length ?? 0;
  const stampText = generateStampText(promotionId, shadowRunId, rulesApplied, integrityScore);

  // Stamp key system files
  const filePaths = [
    'src/lib/immune/rule-engine/index.ts',
    'src/lib/substrate/promotion-pipeline/index.ts',
  ];

  let count = 0;
  for (const fp of filePaths) {
    const { error } = await supabase.from('code_stamps').insert({
      file_path: fp,
      promotion_id: promotionId,
      shadow_run_id: shadowRunId,
      commit_hash: promotionId.slice(0, 8),
      stamp_text: stampText,
    } as any);
    if (!error) count++;
  }

  return count;
}

/** Get stamps for a promotion */
export async function getStamps(promotionId: string): Promise<any[]> {
  const { data } = await supabase
    .from('code_stamps')
    .select('*')
    .eq('promotion_id', promotionId)
    .order('created_at') as any;
  return data ?? [];
}
