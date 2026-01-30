/**
 * AutoBlog Posting Rules
 * Cadence, dedupe, topic selection
 */

import type { AutoblogSettings, AutoblogChannel, AutoblogPlanDecision } from './types';
import { getAutoblogQueue, countPostsToday } from './store';

/**
 * Determine if we should post now
 */
export async function shouldPostNow(settings: AutoblogSettings): Promise<AutoblogPlanDecision> {
  // Check daily limit
  const postsToday = await countPostsToday();
  if (postsToday >= settings.max_posts_per_day) {
    return {
      allowed: false,
      reason: `Daily limit reached (${postsToday}/${settings.max_posts_per_day})`
    };
  }

  // Check if there's a pending queue item
  const pending = await getAutoblogQueue('queued', 1);
  if (pending.length > 0) {
    return {
      allowed: false,
      reason: 'Pending item in queue, process existing items first'
    };
  }

  // Check cadence (last published time)
  const published = await getAutoblogQueue('published', 1);
  if (published.length > 0 && published[0].completed_at) {
    const lastPublished = new Date(published[0].completed_at).getTime();
    const cadenceMs = settings.cadence_minutes * 60 * 1000;
    const nextAllowed = lastPublished + cadenceMs;
    
    if (Date.now() < nextAllowed) {
      const waitMinutes = Math.ceil((nextAllowed - Date.now()) / 60000);
      return {
        allowed: false,
        reason: `Cadence not met, wait ${waitMinutes} minutes`
      };
    }
  }

  // Select channel (rotate through allowed channels)
  const channel = selectChannel(settings.allowed_channels, published);
  
  // Determine topic based on system state
  const topic = await selectTopic(channel);

  return {
    allowed: true,
    reason: 'System state changed; publishing narrative update',
    channel,
    topic,
    plannedAt: new Date().toISOString()
  };
}

/**
 * Select which channel to post to
 */
function selectChannel(
  allowedChannels: AutoblogChannel[],
  recentPosts: Array<{ channel: string }>
): AutoblogChannel {
  if (allowedChannels.length === 0) {
    return 'changelog';
  }

  if (allowedChannels.length === 1) {
    return allowedChannels[0];
  }

  // Rotate: find least recently used channel
  const recentChannels = recentPosts.map(p => p.channel);
  for (const channel of allowedChannels) {
    if (!recentChannels.includes(channel)) {
      return channel;
    }
  }

  return allowedChannels[0];
}

/**
 * Select topic based on system state
 */
async function selectTopic(channel: AutoblogChannel): Promise<string> {
  // Topic selection is deterministic based on channel
  // No trade secrets exposed here
  switch (channel) {
    case 'changelog':
      return 'system_evolution_update';
    case 'release_notes':
      return 'capability_release';
    case 'blog':
      return 'insight_publication';
    default:
      return 'general_update';
  }
}

/**
 * Compute dedupe key to prevent duplicate posts
 */
export function computeDedupeKey(channel: string, topic?: string): string {
  const day = new Date().toISOString().slice(0, 10);
  return `${day}:${channel}:${topic || 'general'}`;
}

/**
 * Check if topic should be skipped (already covered recently)
 */
export async function isTopicCovered(dedupeKey: string): Promise<boolean> {
  const queue = await getAutoblogQueue();
  return queue.some(item => 
    item.dedupe_key === dedupeKey && 
    item.status !== 'aborted' && 
    item.status !== 'failed'
  );
}
