/**
 * AutoBlog Publisher
 * Actually publishes drafts to auto_blog_posts table
 */

import { supabase } from '@/integrations/supabase/client';
import { getDraft, updateQueueStatus, recordRun, getAutoblogSettings } from './store';
import { reportSuccess, reportFailure } from './circuit';
import { captureAutoblogLearning } from './brain-integration';
import type { AutoblogQueueItem, AutoblogDraft } from './types';

export interface PublishResult {
  ok: boolean;
  postId?: string;
  slug?: string;
  error?: string;
}

/**
 * Content quality assessment for intelligent publishing decisions
 */
export interface ContentAssessment {
  shouldPublish: boolean;
  importance: number;        // 0-1: How important is this content?
  uniqueness: number;        // 0-1: How unique vs recent posts?
  toneMatch: number;         // 0-1: How well does it match changelog tone?
  overallScore: number;      // Weighted combination
  reasoning: string[];
}

/**
 * Assess content before publishing
 */
export async function assessContent(
  queueItem: AutoblogQueueItem,
  draft: AutoblogDraft
): Promise<ContentAssessment> {
  const reasoning: string[] = [];
  let importance = 0.5;
  let uniqueness = 0.5;
  let toneMatch = 0.5;

  // 1. Importance assessment
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

  // 2. Uniqueness check - compare against recent posts
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

  // 3. Tone match assessment (changelog style: technical, concise, informative)
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
  
  // Penalize overly casual or marketing-style content
  const casualWords = ['amazing', 'incredible', 'revolutionary', 'game-changing', 'exciting!'];
  const hasCasualTone = casualWords.some(word => body.toLowerCase().includes(word));
  if (hasCasualTone) {
    toneMatch -= 0.2;
    reasoning.push('Slightly marketing-focused, adjusting tone score');
  }
  
  toneMatch = Math.max(0, Math.min(1, toneMatch));

  // 4. Calculate overall score
  const overallScore = (importance * 0.4) + (uniqueness * 0.35) + (toneMatch * 0.25);
  
  // Settings-based threshold
  const settings = await getAutoblogSettings();
  const threshold = settings?.min_confidence_publish || 0.85;
  
  const shouldPublish = overallScore >= 0.6 && (queueItem.confidence || 0) >= threshold;

  if (!shouldPublish) {
    reasoning.push(`Below threshold (${overallScore.toFixed(2)} < 0.6 or confidence < ${threshold})`);
  }

  return {
    shouldPublish,
    importance,
    uniqueness,
    toneMatch,
    overallScore,
    reasoning,
  };
}

/**
 * Generate a URL-safe slug from title
 */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    // Remove emojis and other unicode symbols
    .replace(/[\u{1F300}-\u{1F9FF}]/gu, '')
    .replace(/[\u{2600}-\u{26FF}]/gu, '')
    .replace(/[\u{2700}-\u{27BF}]/gu, '')
    .replace(/[^\w\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-')      // Spaces to hyphens
    .replace(/-+/g, '-')       // Multiple hyphens to single
    .replace(/^-/, '')         // Remove leading hyphen
    .substring(0, 80)          // Limit length
    .replace(/-$/, '');        // Remove trailing hyphen
}

/**
 * Map queue channel to blog category
 */
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

/**
 * Extract excerpt from body
 */
function extractExcerpt(body: string): string {
  // Remove markdown headers and get first paragraph
  const cleaned = body
    .replace(/^#+\s+.+$/gm, '') // Remove headers
    .replace(/```[\s\S]*?```/g, '') // Remove code blocks
    .replace(/\n+/g, ' ')
    .trim();
  
  // Get first 200 chars
  return cleaned.substring(0, 200) + (cleaned.length > 200 ? '...' : '');
}

/**
 * Actually publish a draft to auto_blog_posts
 */
export async function publishDraft(queueId: string): Promise<PublishResult> {
  const draft = await getDraft(queueId);
  
  if (!draft || !draft.body) {
    return { ok: false, error: 'No draft content found' };
  }

  // Get queue item for metadata
  const { data: queueItem } = await supabase
    .from('autoblog_queue')
    .select('*')
    .eq('id', queueId)
    .single();

  if (!queueItem) {
    return { ok: false, error: 'Queue item not found' };
  }

  // Assess content before publishing (cast to proper type)
  const typedQueueItem = queueItem as AutoblogQueueItem;
  const assessment = await assessContent(typedQueueItem, draft);
  
  if (!assessment.shouldPublish) {
    await updateQueueStatus(queueId, 'aborted', { 
      error: `Assessment failed: ${assessment.reasoning.join('; ')}` 
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
    const slug = generateSlug(draft.title || 'untitled-' + Date.now());
    const category = mapChannelToCategory(queueItem.channel);
    const excerpt = extractExcerpt(draft.body);
    const now = new Date().toISOString();

    // Insert into auto_blog_posts
    const { data: post, error } = await supabase
      .from('auto_blog_posts')
      .insert({
        title: draft.title || 'Untitled Post',
        slug: slug + '-' + Date.now().toString(36),
        content: draft.body,
        excerpt,
        category,
        status: 'published',
        published_at: now,
        topic_seed: queueItem.topic,
      })
      .select()
      .single();

    if (error) {
      await updateQueueStatus(queueId, 'failed', { error: error.message });
      await reportFailure(error.message);
      return { ok: false, error: error.message };
    }

    // Update queue status
    await updateQueueStatus(queueId, 'published');
    
    // Record successful run
    await recordRun({
      queueId,
      phase: 'publish',
      outcome: 'success',
      reason: `Published with score ${assessment.overallScore.toFixed(2)}`,
    });

    // Report success to circuit breaker
    await reportSuccess();

    // Capture learning from successful publish
    await captureAutoblogLearning({
      topic: 'successful_publish',
      insights: [
        `Published: ${draft.title}`,
        `Category: ${category}`,
        `Assessment: importance=${assessment.importance.toFixed(2)}, uniqueness=${assessment.uniqueness.toFixed(2)}, tone=${assessment.toneMatch.toFixed(2)}`,
        ...assessment.reasoning,
      ],
      source: 'publisher',
      confidence: assessment.overallScore,
    });

    // Log brain event
    await supabase.from('brain_events').insert({
      module: 'autoblog',
      event_type: 'post_published',
      data: {
        post_id: post.id,
        slug: post.slug,
        category,
        assessment_score: assessment.overallScore,
        queue_id: queueId,
      },
      outcome: 'completed',
    });

    return { ok: true, postId: post.id, slug: post.slug };

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown publish error';
    await updateQueueStatus(queueId, 'failed', { error: message });
    await reportFailure(message);
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
    if (result.ok) {
      published++;
    } else {
      failed++;
    }
  }

  return { published, failed, results };
}
