/**
 * AutoBlog Publisher v2.0
 * Publishes drafts with full v5 pipeline:
 *   Governor → Length Cadence → Interlinker → Image Expansion → Quality Pipeline
 */

import { supabase } from '@/integrations/supabase/client';
import { getDraft, updateQueueStatus, recordRun, getAutoblogSettings } from './store';
import { reportSuccess, reportFailure } from './circuit';
import { captureAutoblogLearning } from './brain-integration';
import { runQualityPipeline, storeAssumptions, logSplitBrainAudit } from './quality-pipeline';
import { getGovernorDecision, consumeToken, resetStreak, type GovernorSignals } from './publish-governor';
import { getTargetWordLength, incrementPublishCount } from './length-cadence';
import { injectInternalLinks } from './interlinker';
import { expandImages } from './image-expander';
import { checkAutoblogCircuit } from './circuit';
import type { AutoblogQueueItem, AutoblogDraft } from './types';

export interface PublishResult {
  ok: boolean;
  postId?: string;
  slug?: string;
  error?: string;
}

export interface ContentAssessment {
  shouldPublish: boolean;
  importance: number;
  uniqueness: number;
  toneMatch: number;
  overallScore: number;
  reasoning: string[];
}

export async function assessContent(
  queueItem: AutoblogQueueItem,
  draft: AutoblogDraft
): Promise<ContentAssessment> {
  const reasoning: string[] = [];
  let importance = 0.5;
  let uniqueness = 0.5;
  let toneMatch = 0.5;

  if (queueItem.topic?.includes('Evolution') || queueItem.topic?.includes('Update')) {
    importance = 0.9;
    reasoning.push('Evolution/Update content is high priority');
  } else if (queueItem.channel === 'changelog') {
    importance = 0.85;
    reasoning.push('Changelog content is important for transparency');
  } else if (queueItem.channel === 'release_notes') {
    importance = 0.8;
    reasoning.push('Release notes inform users of capabilities');
  } else {
    importance = 0.7;
    reasoning.push('Standard blog content');
  }

  const { data: recentPosts } = await supabase
    .from('auto_blog_posts')
    .select('title, category')
    .order('published_at', { ascending: false })
    .limit(10);

  if (recentPosts && recentPosts.length > 0) {
    const titleWords = (draft.title || '').toLowerCase().split(/\s+/) as string[];
    const recentTitles = recentPosts.map(p => p.title.toLowerCase());
    const hasOverlap = recentTitles.some(recent =>
      titleWords.filter(word => word.length > 3).some(word => recent.includes(word))
    );
    if (hasOverlap) {
      uniqueness = 0.4;
      reasoning.push('Similar topic covered recently, lower priority');
    } else {
      uniqueness = 0.9;
      reasoning.push('Fresh topic not covered recently');
    }
  } else {
    uniqueness = 1.0;
    reasoning.push('No recent posts, all content is unique');
  }

  const body = draft.body || '';
  const hasCodeBlocks = body.includes('```');
  const hasEmoji = /[\u{1F300}-\u{1F9FF}]/u.test(draft.title || '');
  const hasMarkdownStructure = body.includes('##') && body.includes('-');
  const wordCount = body.split(/\s+/).length;

  if (hasMarkdownStructure && wordCount > 100 && wordCount < 800) {
    toneMatch += 0.2;
    reasoning.push('Good structure and length for changelog');
  }
  if (hasCodeBlocks) {
    toneMatch += 0.15;
    reasoning.push('Contains code examples');
  }
  if (hasEmoji) {
    toneMatch += 0.05;
    reasoning.push('Uses visual markers for scannability');
  }

  const casualWords = ['amazing', 'incredible', 'revolutionary', 'game-changing', 'exciting!'];
  const hasCasualTone = casualWords.some(word => body.toLowerCase().includes(word));
  if (hasCasualTone) {
    toneMatch -= 0.2;
    reasoning.push('Slightly marketing-focused, adjusting tone score');
  }
  toneMatch = Math.max(0, Math.min(1, toneMatch));

  const overallScore = (importance * 0.4) + (uniqueness * 0.35) + (toneMatch * 0.25);
  const settings = await getAutoblogSettings();
  const threshold = settings?.min_confidence_publish || 0.85;
  const shouldPublish = overallScore >= 0.6 && (queueItem.confidence || 0) >= threshold;

  if (!shouldPublish) {
    reasoning.push(`Below threshold (${overallScore.toFixed(2)} < 0.6 or confidence < ${threshold})`);
  }

  return { shouldPublish, importance, uniqueness, toneMatch, overallScore, reasoning };
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[\u{1F300}-\u{1F9FF}]/gu, '')
    .replace(/[\u{2600}-\u{26FF}]/gu, '')
    .replace(/[\u{2700}-\u{27BF}]/gu, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-/, '')
    .substring(0, 80)
    .replace(/-$/, '');
}

function mapChannelToCategory(channel: string): string {
  const mapping: Record<string, string> = {
    'changelog': 'changelog',
    'blog': 'insight',
    'release_notes': 'release',
    'user_updates': 'update',
    'internal_log': 'internal',
    'substrate_digest': 'research',
  };
  return mapping[channel] || 'general';
}

function extractExcerpt(body: string): string {
  const cleaned = body
    .replace(/^#+\s+.+$/gm, '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/\n+/g, ' ')
    .trim();
  return cleaned.substring(0, 200) + (cleaned.length > 200 ? '...' : '');
}

/**
 * Publish a draft with the full v5 pipeline.
 */
export async function publishDraft(queueId: string): Promise<PublishResult> {
  const draft = await getDraft(queueId);
  if (!draft || !draft.body) {
    return { ok: false, error: 'No draft content found' };
  }

  const { data: queueItem } = await supabase
    .from('autoblog_queue')
    .select('*')
    .eq('id', queueId)
    .single();

  if (!queueItem) {
    return { ok: false, error: 'Queue item not found' };
  }

  const typedQueueItem = queueItem as AutoblogQueueItem;
  const assessment = await assessContent(typedQueueItem, draft);

  if (!assessment.shouldPublish) {
    await updateQueueStatus(queueId, 'aborted', {
      error: `Assessment failed: ${assessment.reasoning.join('; ')}`,
    });
    await recordRun({
      queueId,
      phase: 'publish',
      outcome: 'blocked',
      reason: `Content assessment: ${assessment.overallScore.toFixed(2)} - ${assessment.reasoning[0]}`,
    });
    return { ok: false, error: 'Content did not meet publishing criteria' };
  }

  try {
    // --- GOVERNOR CHECK ---
    const circuitStatus = await checkAutoblogCircuit();
    const breakerHealth = circuitStatus.canProceed ? 1.0 : 0.2;

    const { data: queuedItems } = await supabase
      .from('autoblog_queue')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'ready');

    const backlogPressure = Math.min(1, ((queuedItems as any)?.length || 0) / 10);

    const governorSignals: GovernorSignals = {
      confidenceScore: assessment.overallScore,
      skepticScore: assessment.toneMatch,
      driftScore: 0, // Will be updated after quality pipeline
      recentSuccessRate: assessment.uniqueness,
      breakerHealth,
      backlogPressure,
    };

    const governorDecision = await getGovernorDecision(governorSignals, queueId);

    if (governorDecision.decision !== 'publish') {
      await recordRun({
        queueId,
        phase: 'publish',
        outcome: 'blocked',
        reason: `Governor: ${governorDecision.decision} — ${governorDecision.reason}`,
      });
      return { ok: false, error: `Governor deferred: ${governorDecision.reason}` };
    }

    // --- QUALITY PIPELINE (includes drift + adaptive weights) ---
    const pipelineResult = await runQualityPipeline(
      { title: draft.title || '', body: draft.body },
      queueItem.channel,
    );

    if (!pipelineResult.passed) {
      await updateQueueStatus(queueId, 'aborted', {
        error: `Quality pipeline blocked: ${pipelineResult.blockReason}`,
      });
      await recordRun({
        queueId,
        phase: 'verify',
        outcome: 'blocked',
        reason: pipelineResult.blockReason || 'Quality pipeline rejected',
      });
      await resetStreak();
      return { ok: false, error: pipelineResult.blockReason || 'Quality pipeline blocked' };
    }

    let publishBody = pipelineResult.modifiedBody || draft.body;

    // --- INTERLINKER ---
    const slug = generateSlug(draft.title || 'untitled-' + Date.now());
    const interlinkResult = await injectInternalLinks(publishBody, slug);
    publishBody = interlinkResult.modifiedBody;

    // --- IMAGE EXPANSION ---
    const imageResult = expandImages(publishBody);
    publishBody = imageResult.modifiedBody;

    // --- LENGTH CADENCE ---
    const lengthTarget = await getTargetWordLength();
    const wordCount = publishBody.split(/\s+/).length;

    const category = mapChannelToCategory(queueItem.channel);
    const excerpt = extractExcerpt(publishBody);
    const now = new Date().toISOString();

    // Insert post
    const { data: post, error } = await supabase
      .from('auto_blog_posts')
      .insert({
        title: draft.title || 'Untitled Post',
        slug: slug + '-' + Date.now().toString(36),
        content: publishBody,
        excerpt,
        category,
        status: 'published',
        published_at: now,
        topic_seed: queueItem.topic,
        confidence_score: pipelineResult.confidence.score,
        confidence_factors: pipelineResult.confidence.factors as any,
        split_brain_reader_score: pipelineResult.splitBrain.readerBrainScore,
        split_brain_skeptic_score: pipelineResult.splitBrain.skepticBrainScore,
        split_brain_decision: pipelineResult.splitBrain.finalDecision,
        contradiction_outcome: pipelineResult.contradiction.winner,
        contradiction_score: pipelineResult.contradiction.primaryScore,
        assumptions_extracted: pipelineResult.assumptions.length > 0,
        semantic_drift_score: pipelineResult.semanticDrift.driftScore,
        drift_direction: pipelineResult.semanticDrift.driftDirection,
        word_count: wordCount,
        internal_links_count: interlinkResult.linksInjected,
        image_count: imageResult.imagesAdded,
      })
      .select()
      .single();

    if (error) {
      await updateQueueStatus(queueId, 'failed', { error: error.message });
      await reportFailure(error.message);
      await resetStreak();
      return { ok: false, error: error.message };
    }

    // Store quality audit artifacts + consume governor token + increment cycle
    await Promise.all([
      logSplitBrainAudit(post.id, queueId, pipelineResult.splitBrain),
      storeAssumptions(post.id, pipelineResult.assumptions),
      consumeToken(),
      incrementPublishCount(),
    ]);

    await updateQueueStatus(queueId, 'published');
    await recordRun({
      queueId,
      phase: 'publish',
      outcome: 'success',
      reason: `Published: confidence=${pipelineResult.confidence.score.toFixed(2)}, drift=${pipelineResult.semanticDrift.driftScore.toFixed(2)}, links=${interlinkResult.linksInjected}, images=${imageResult.imagesAdded}, words=${wordCount}/${lengthTarget.targetWords}`,
    });
    await reportSuccess();

    await captureAutoblogLearning({
      topic: 'successful_publish',
      insights: [
        `Published: ${draft.title}`,
        `Category: ${category}`,
        `Confidence: ${pipelineResult.confidence.score.toFixed(2)} (${pipelineResult.confidence.toneModifier})`,
        `Split Brain: reader=${pipelineResult.splitBrain.readerBrainScore.toFixed(2)}, skeptic=${pipelineResult.splitBrain.skepticBrainScore.toFixed(2)}`,
        `Drift: ${pipelineResult.semanticDrift.driftScore.toFixed(2)} (${pipelineResult.semanticDrift.driftDirection})`,
        `Links: ${interlinkResult.linksInjected}, Images: ${imageResult.imagesAdded}`,
        `Words: ${wordCount} (target: ${lengthTarget.targetWords}, cycle: ${lengthTarget.label})`,
        `Governor: tokens consumed`,
      ],
      source: 'publisher',
      confidence: pipelineResult.confidence.score,
    });

    await supabase.from('brain_events').insert({
      module: 'autoblog',
      event_type: 'post_published',
      data: {
        post_id: post.id,
        slug: post.slug,
        category,
        confidence_score: pipelineResult.confidence.score,
        drift_score: pipelineResult.semanticDrift.driftScore,
        links_injected: interlinkResult.linksInjected,
        images_added: imageResult.imagesAdded,
        word_count: wordCount,
        length_target: lengthTarget.targetWords,
        governor_decision: governorDecision.decision,
      },
      outcome: 'completed',
    });

    return { ok: true, postId: post.id, slug: post.slug };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown publish error';
    await updateQueueStatus(queueId, 'failed', { error: message });
    await reportFailure(message);
    await resetStreak();
    return { ok: false, error: message };
  }
}

/**
 * Batch publish all ready items
 */
export async function publishAllReady(): Promise<{
  published: number;
  failed: number;
  results: PublishResult[];
}> {
  const { data: readyItems } = await supabase
    .from('autoblog_queue')
    .select('id')
    .eq('status', 'ready')
    .order('created_at', { ascending: true });

  const results: PublishResult[] = [];
  let published = 0;
  let failed = 0;

  for (const item of readyItems || []) {
    const result = await publishDraft(item.id);
    results.push(result);
    if (result.ok) published++;
    else failed++;
  }

  return { published, failed, results };
}
