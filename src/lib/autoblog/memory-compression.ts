/**
 * AutoBlog Memory Compression v1.0
 * Monthly self-reflection cycle ported from RCRDBL.
 *
 * Analyzes the past 30 days of autoblog output and generates:
 *  - Lessons learned
 *  - Wrong assumptions
 *  - Patterns to abandon
 *  - Confidence adjustments
 *
 * All AI calls go through the NEXUS router.
 */

import { supabase } from '@/integrations/supabase/client';
import { getEffectiveWeights, updateWeights, type ConfidenceWeights } from './confidence-governor';

export interface MemoryReport {
  lessonsLearned: string[];
  assumptionsWrong: string[];
  patternsAbandoned: string[];
  confidenceAdjustments: Record<string, number>;
  postCount: number;
  contradictionCount: number;
  qualityTrend: 'improving' | 'stable' | 'declining';
}

/**
 * Check if a memory compression run is due (every 30 days).
 */
export async function shouldRunMemoryCompression(): Promise<boolean> {
  const { data: lastReport } = await supabase
    .from('autoblog_memory_reports' as any)
    .select('created_at')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!lastReport) return true;

  const daysSince = Math.floor(
    (Date.now() - new Date((lastReport as any).created_at).getTime()) / (86_400_000),
  );

  return daysSince >= 30;
}

/**
 * Run monthly memory compression — self-reflection on autoblog output.
 */
export async function runMemoryCompression(): Promise<MemoryReport | null> {
  const shouldRun = await shouldRunMemoryCompression();
  if (!shouldRun) {
    console.log('[AutoBlog Memory] Compression not due yet.');
    return null;
  }

  console.log('[AutoBlog Memory] Running monthly compression...');

  const thirtyDaysAgo = new Date(Date.now() - 30 * 86_400_000);

  // Gather data
  const [postsResult, runsResult, assumptionsResult] = await Promise.all([
    supabase
      .from('auto_blog_posts')
      .select('title, category, confidence_score, contradiction_outcome')
      .gte('published_at', thirtyDaysAgo.toISOString())
      .eq('status', 'published'),
    supabase
      .from('autoblog_runs')
      .select('outcome, reason')
      .gte('created_at', thirtyDaysAgo.toISOString()),
    supabase
      .from('autoblog_assumptions' as any)
      .select('assumption_text, is_broken')
      .gte('created_at', thirtyDaysAgo.toISOString()),
  ]);

  const posts = postsResult.data || [];
  const runs = runsResult.data || [];
  const assumptions = assumptionsResult.data || [];

  const contradictionCount = posts.filter((p: any) => p.contradiction_outcome === 'merged').length;
  const brokenAssumptions = (assumptions as any[]).filter((a: any) => a.is_broken);
  const failedRuns = runs.filter((r: any) => r.outcome === 'failed');

  // Determine quality trend
  const avgConfidence = posts.length > 0
    ? posts.reduce((sum: number, p: any) => sum + (p.confidence_score || 0.5), 0) / posts.length
    : 0.5;

  let qualityTrend: MemoryReport['qualityTrend'] = 'stable';
  if (avgConfidence > 0.7) qualityTrend = 'improving';
  else if (avgConfidence < 0.4 || failedRuns.length > posts.length) qualityTrend = 'declining';

  // Try AI-powered reflection via NEXUS
  let aiReport: Partial<MemoryReport> | null = null;

  try {
    const { substrate } = await import('../substrate');

    if (substrate.nexus?.text) {
      const postSummaries = posts.slice(0, 20).map((p: any) =>
        `- ${p.title} (confidence: ${(p.confidence_score || 0).toFixed(2)}, category: ${p.category})`,
      ).join('\n');

      const prompt = `You are an autonomous blog system performing monthly self-reflection.

POSTS FROM PAST 30 DAYS:
${postSummaries || 'No posts generated.'}

STATS:
- Posts published: ${posts.length}
- Failed runs: ${failedRuns.length}
- Contradictions merged: ${contradictionCount}
- Assumptions broken: ${brokenAssumptions.length}
- Avg confidence: ${avgConfidence.toFixed(2)}

Analyze honestly:
1. What patterns or insights emerged?
2. What assumptions were proven wrong?
3. What content patterns should be abandoned?
4. How should confidence scoring be adjusted?

Respond ONLY in JSON:
{
  "lessonsLearned": ["lesson 1", "lesson 2"],
  "assumptionsWrong": ["assumption"],
  "patternsAbandoned": ["pattern"],
  "confidenceAdjustments": {"category": delta_number}
}`;

      const response = await substrate.nexus.text(prompt);
      const text = typeof response === 'string' ? response : (response as any)?.content || '';
      const jsonMatch = text.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        aiReport = JSON.parse(jsonMatch[0]);
      }
    }
  } catch (err) {
    console.warn('[AutoBlog Memory] NEXUS unavailable for reflection:', err);
  }

  // Build final report (AI-augmented or heuristic)
  const report: MemoryReport = {
    lessonsLearned: aiReport?.lessonsLearned || buildHeuristicLessons(posts, failedRuns),
    assumptionsWrong: aiReport?.assumptionsWrong || brokenAssumptions.map((a: any) => a.assumption_text),
    patternsAbandoned: aiReport?.patternsAbandoned || [],
    confidenceAdjustments: aiReport?.confidenceAdjustments || {},
    postCount: posts.length,
    contradictionCount,
    qualityTrend,
  };

  // --- ADAPTIVE WEIGHT GOVERNANCE ---
  try {
    const currentWeights = await getEffectiveWeights();
    const newWeights: ConfidenceWeights = { ...currentWeights };
    const reasons: string[] = [];

    // If contradictionCount > 30% of posts: reduce contentDensity weight
    if (posts.length > 0 && contradictionCount / posts.length > 0.3) {
      newWeights.contentDensity = Math.max(0.05, newWeights.contentDensity - 0.05);
      reasons.push('High contradiction rate: reduced contentDensity weight');
    }

    // If broken assumptions exceed threshold: reduce sourceStability
    if (brokenAssumptions.length > 3) {
      newWeights.sourceStability = Math.max(0.05, newWeights.sourceStability - 0.05);
      reasons.push('Many broken assumptions: reduced sourceStability weight');
    }

    // If high confidence but low skeptic scores: widen assertive threshold
    const avgSkeptic = posts.length > 0
      ? posts.reduce((s: number, p: any) => s + (p.split_brain_skeptic_score || 0.5), 0) / posts.length
      : 0.5;

    if (avgConfidence > 0.7 && avgSkeptic < 0.4) {
      newWeights.uniqueness = Math.max(0.05, newWeights.uniqueness - 0.03);
      reasons.push('High confidence / low skeptic: adjusted uniqueness weight');
    }

    if (reasons.length > 0) {
      await updateWeights(newWeights, `Memory compression cycle: ${reasons.join('; ')}`);
      console.log('[AutoBlog Memory] Adjusted confidence weights:', reasons);
    }
  } catch (err) {
    console.warn('[AutoBlog Memory] Weight adjustment failed:', err);
  }

  // Store the report
  await supabase.from('autoblog_memory_reports' as any).insert({
    report_period_start: thirtyDaysAgo.toISOString().split('T')[0],
    report_period_end: new Date().toISOString().split('T')[0],
    lessons_learned: report.lessonsLearned,
    assumptions_wrong: report.assumptionsWrong,
    patterns_abandoned: report.patternsAbandoned,
    confidence_adjustments: report.confidenceAdjustments,
    post_count: report.postCount,
    contradiction_count: report.contradictionCount,
    quality_trend: report.qualityTrend,
    is_published: false,
  });

  // Log brain event
  await supabase.from('brain_events').insert({
    module: 'autoblog',
    event_type: 'memory_compression',
    data: {
      postCount: report.postCount,
      lessonsCount: report.lessonsLearned.length,
      qualityTrend: report.qualityTrend,
    },
    outcome: 'completed',
  });

  console.log('[AutoBlog Memory] Compression complete:', {
    posts: report.postCount,
    lessons: report.lessonsLearned.length,
    trend: report.qualityTrend,
  });

  return report;
}

function buildHeuristicLessons(posts: any[], failedRuns: any[]): string[] {
  const lessons: string[] = [];

  if (posts.length === 0) {
    lessons.push('No posts published this period — review content pipeline health');
  }

  if (failedRuns.length > 3) {
    lessons.push(`High failure rate (${failedRuns.length} failures) — investigate circuit breaker triggers`);
  }

  const categories = posts.reduce((acc: Record<string, number>, p: any) => {
    acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {});

  const topCategory = Object.entries(categories).sort(([, a], [, b]) => (b as number) - (a as number))[0];
  if (topCategory) {
    lessons.push(`Most active category: ${topCategory[0]} (${topCategory[1]} posts) — consider diversifying`);
  }

  return lessons;
}

/**
 * Get the most recent memory report.
 */
export async function getLatestMemoryReport(): Promise<MemoryReport | null> {
  const { data, error } = await supabase
    .from('autoblog_memory_reports' as any)
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;

  const d = data as any;
  return {
    lessonsLearned: d.lessons_learned || [],
    assumptionsWrong: d.assumptions_wrong || [],
    patternsAbandoned: d.patterns_abandoned || [],
    confidenceAdjustments: d.confidence_adjustments || {},
    postCount: d.post_count || 0,
    contradictionCount: d.contradiction_count || 0,
    qualityTrend: d.quality_trend || 'stable',
  };
}
