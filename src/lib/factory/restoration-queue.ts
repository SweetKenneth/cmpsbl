/**
 * Restoration Queue — Adaptive Limited Rates Engine integration
 * Manages shop capacity, queue positions, and tier-based throughput.
 */

export type MembershipTier = 'builder' | 'studio' | 'creator' | 'architect';

export interface QueueEntry {
  id: string;
  userId: string;
  tier: MembershipTier;
  codeSnippetHash: string;
  selectedPrimitives: string[];
  position: number;
  status: 'queued' | 'processing' | 'complete' | 'failed';
  estimatedCompletionMs: number;
  createdAt: Date;
}

export interface TierConfig {
  label: string;
  price: number; // cents/month, 0 = free
  maxConcurrent: number;
  priorityWeight: number;
  description: string;
}

export const MEMBERSHIP_TIERS: Record<MembershipTier, TierConfig> = {
  builder: {
    label: 'Builder',
    price: 0,
    maxConcurrent: 1,
    priorityWeight: 1,
    description: 'Browse the Showroom. Access the Junkyard. View diagnostics. Limited Ascension cycles.',
  },
  studio: {
    label: 'Studio',
    price: 2900, // $29
    maxConcurrent: 2,
    priorityWeight: 2,
    description: 'Full Restoration Shop access. Rate-limited queue.',
  },
  creator: {
    label: 'Creator',
    price: 4900, // $49
    maxConcurrent: 4,
    priorityWeight: 3,
    description: 'Priority queue. More concurrent restorations.',
  },
  architect: {
    label: 'Architect',
    price: 7900, // $79
    maxConcurrent: 8,
    priorityWeight: 5,
    description: 'Maximum throughput. Full primitive catalog access.',
  },
};

/** In-memory queue (production: backed by DB) */
const queue: QueueEntry[] = [];
let nextPosition = 1;

export function getQueuePosition(entryId: string): number | null {
  const entry = queue.find(e => e.id === entryId);
  if (!entry) return null;
  // Count entries ahead with higher or equal priority
  const ahead = queue.filter(
    e => e.status === 'queued' && e.position < entry.position
  ).length;
  return ahead + 1;
}

export function estimateWaitTime(tier: MembershipTier): number {
  const config = MEMBERSHIP_TIERS[tier];
  const queuedCount = queue.filter(e => e.status === 'queued').length;
  // Average restoration takes ~45 seconds per primitive
  const avgPrimitivesPerRun = 8;
  const avgTimePerRunMs = avgPrimitivesPerRun * 45_000;
  return Math.ceil((queuedCount / Math.max(config.maxConcurrent, 1)) * avgTimePerRunMs);
}

export function addToQueue(
  userId: string,
  tier: MembershipTier,
  codeSnippetHash: string,
  selectedPrimitives: string[],
): QueueEntry {
  const entry: QueueEntry = {
    id: crypto.randomUUID(),
    userId,
    tier,
    codeSnippetHash,
    selectedPrimitives,
    position: nextPosition++,
    status: 'queued',
    estimatedCompletionMs: estimateWaitTime(tier),
    createdAt: new Date(),
  };
  queue.push(entry);
  return entry;
}

export function getQueueStats() {
  return {
    totalQueued: queue.filter(e => e.status === 'queued').length,
    processing: queue.filter(e => e.status === 'processing').length,
    completed: queue.filter(e => e.status === 'complete').length,
  };
}

export function formatPrice(cents: number): string {
  if (cents === 0) return 'Free';
  return `$${(cents / 100).toFixed(0)}/mo`;
}
