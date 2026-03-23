/**
 * RIPPLE Topic Topology Optimizer — v9.0.0 "Tsunami"
 * 
 * Learns actual fan-out patterns and restructures routing for hot topics.
 * Identifies dead topics, orphan topics, and suggests consolidation.
 */

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface TopicProfile {
  topic: string;
  publishCount: number;
  subscriberCount: number;
  lastPublishAt: string | null;
  lastSubscribeAt: string | null;
  avgFanOut: number;
  isHot: boolean;
  isDead: boolean;      // Subscribed but never published
  isOrphan: boolean;    // Published but no subscribers
  overlapScore: number; // 0-1, how much it overlaps with other topics
  overlappingTopics: string[];
}

export interface TopologyReport {
  totalTopics: number;
  hotTopics: TopicProfile[];
  deadTopics: TopicProfile[];
  orphanTopics: TopicProfile[];
  consolidationSuggestions: ConsolidationSuggestion[];
  healthScore: number; // 0-100
}

export interface ConsolidationSuggestion {
  topics: string[];
  reason: string;
  overlapScore: number;
  suggestedMergedTopic: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

const HOT_THRESHOLD = 100;           // publishes to be considered hot
const DEAD_TIMEOUT_MS = 30 * 60000;  // 30 min no publishes
const OVERLAP_THRESHOLD = 0.8;
const EMA_ALPHA = 0.15;

// ═══════════════════════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════════════════════

const topicProfiles = new Map<string, TopicProfile>();
const publisherRegistry = new Map<string, Set<string>>();  // topic → publishers
const subscriberRegistry = new Map<string, Set<string>>(); // topic → subscribers

// ═══════════════════════════════════════════════════════════════════════════════
// CORE ENGINE
// ═══════════════════════════════════════════════════════════════════════════════

/** Record a publish event for a topic. */
export function recordPublish(topic: string, source: string): void {
  const profile = getOrCreateProfile(topic);
  profile.publishCount++;
  profile.lastPublishAt = new Date().toISOString();

  const publishers = publisherRegistry.get(topic) ?? new Set();
  publishers.add(source);
  publisherRegistry.set(topic, publishers);

  recalculate(profile);
}

/** Record a subscription registration for a topic. */
export function recordSubscription(topic: string, subscriberId: string): void {
  const profile = getOrCreateProfile(topic);
  profile.subscriberCount++;
  profile.lastSubscribeAt = new Date().toISOString();

  const subscribers = subscriberRegistry.get(topic) ?? new Set();
  subscribers.add(subscriberId);
  subscriberRegistry.set(topic, subscribers);

  recalculate(profile);
}

/** Record a subscription removal. */
export function recordUnsubscription(topic: string, subscriberId: string): void {
  const profile = topicProfiles.get(topic);
  if (!profile) return;

  const subscribers = subscriberRegistry.get(topic);
  if (subscribers) {
    subscribers.delete(subscriberId);
    profile.subscriberCount = subscribers.size;
  }

  recalculate(profile);
}

/** Record actual fan-out count for a publish. */
export function recordFanOut(topic: string, fanOutCount: number): void {
  const profile = topicProfiles.get(topic);
  if (!profile) return;

  if (profile.avgFanOut === 0) {
    profile.avgFanOut = fanOutCount;
  } else {
    profile.avgFanOut = EMA_ALPHA * fanOutCount + (1 - EMA_ALPHA) * profile.avgFanOut;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ANALYSIS
// ═══════════════════════════════════════════════════════════════════════════════

function getOrCreateProfile(topic: string): TopicProfile {
  let profile = topicProfiles.get(topic);
  if (!profile) {
    profile = {
      topic,
      publishCount: 0,
      subscriberCount: 0,
      lastPublishAt: null,
      lastSubscribeAt: null,
      avgFanOut: 0,
      isHot: false,
      isDead: false,
      isOrphan: false,
      overlapScore: 0,
      overlappingTopics: [],
    };
    topicProfiles.set(topic, profile);
  }
  return profile;
}

function recalculate(profile: TopicProfile): void {
  const now = Date.now();

  // Hot detection
  profile.isHot = profile.publishCount >= HOT_THRESHOLD;

  // Dead detection (subscribed but no publish in timeout window)
  if (profile.subscriberCount > 0 && profile.publishCount === 0) {
    profile.isDead = true;
  } else if (profile.lastPublishAt) {
    const elapsed = now - new Date(profile.lastPublishAt).getTime();
    profile.isDead = elapsed > DEAD_TIMEOUT_MS && profile.subscriberCount > 0;
  }

  // Orphan detection (published but no subscribers)
  profile.isOrphan = profile.publishCount > 0 && profile.subscriberCount === 0;
}

/** Calculate overlap between topics based on shared subscribers. */
export function calculateOverlaps(): void {
  const topics = Array.from(subscriberRegistry.entries());

  for (let i = 0; i < topics.length; i++) {
    const [topicA, subsA] = topics[i];
    const profileA = topicProfiles.get(topicA);
    if (!profileA) continue;

    profileA.overlappingTopics = [];
    profileA.overlapScore = 0;

    for (let j = 0; j < topics.length; j++) {
      if (i === j) continue;
      const [topicB, subsB] = topics[j];

      const intersection = new Set([...subsA].filter(s => subsB.has(s)));
      const union = new Set([...subsA, ...subsB]);

      if (union.size > 0) {
        const jaccard = intersection.size / union.size;
        if (jaccard >= OVERLAP_THRESHOLD) {
          profileA.overlappingTopics.push(topicB);
          profileA.overlapScore = Math.max(profileA.overlapScore, jaccard);
        }
      }
    }
  }
}

/** Generate consolidation suggestions. */
export function getConsolidationSuggestions(): ConsolidationSuggestion[] {
  calculateOverlaps();
  const suggestions: ConsolidationSuggestion[] = [];
  const processed = new Set<string>();

  for (const [topic, profile] of topicProfiles.entries()) {
    if (processed.has(topic) || profile.overlappingTopics.length === 0) continue;

    const group = [topic, ...profile.overlappingTopics.filter(t => !processed.has(t))];
    if (group.length < 2) continue;

    group.forEach(t => processed.add(t));

    // Find common prefix for suggested merge
    const parts = group.map(t => t.split('.'));
    const commonParts: string[] = [];
    for (let i = 0; i < Math.min(...parts.map(p => p.length)); i++) {
      if (parts.every(p => p[i] === parts[0][i])) {
        commonParts.push(parts[0][i]);
      } else break;
    }

    suggestions.push({
      topics: group,
      reason: `${Math.round(profile.overlapScore * 100)}% subscriber overlap`,
      overlapScore: profile.overlapScore,
      suggestedMergedTopic: commonParts.length > 0 ? `${commonParts.join('.')}.*` : group[0],
    });
  }

  return suggestions;
}

// ═══════════════════════════════════════════════════════════════════════════════
// REPORTING
// ═══════════════════════════════════════════════════════════════════════════════

/** Get profile for a specific topic. */
export function getTopicProfile(topic: string): TopicProfile | null {
  return topicProfiles.get(topic) ?? null;
}

/** Get all topic profiles. */
export function getAllTopicProfiles(): TopicProfile[] {
  return Array.from(topicProfiles.values());
}

/** Generate a full topology report. */
export function getTopologyReport(): TopologyReport {
  const all = Array.from(topicProfiles.values());
  const hot = all.filter(p => p.isHot).sort((a, b) => b.publishCount - a.publishCount);
  const dead = all.filter(p => p.isDead);
  const orphan = all.filter(p => p.isOrphan);
  const suggestions = getConsolidationSuggestions();

  // Health score: penalize dead, orphan, and low-overlap topics
  const issues = dead.length + orphan.length + suggestions.length;
  const healthScore = all.length > 0
    ? Math.max(0, Math.round(100 - (issues / all.length) * 100))
    : 100;

  return {
    totalTopics: all.length,
    hotTopics: hot.slice(0, 10),
    deadTopics: dead,
    orphanTopics: orphan,
    consolidationSuggestions: suggestions,
    healthScore,
  };
}

/** Reset all topology tracking. */
export function resetTopologyState(): void {
  topicProfiles.clear();
  publisherRegistry.clear();
  subscriberRegistry.clear();
}
