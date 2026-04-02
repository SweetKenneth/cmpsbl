/**
 * CMPSBL® Bounty Board (Model 16)
 * 
 * Customer-driven discovery requests.
 * Post what you need. The substrate builds it.
 * Rejected candidates become catalog inventory.
 * 
 * Platform fee: 15% of bounty value
 */

export type BountyStatus = 'open' | 'in_progress' | 'review' | 'fulfilled' | 'expired' | 'cancelled';
export type BountyPriority = 'standard' | 'priority' | 'urgent';

export interface Bounty {
  id: string;
  posterId: string;
  title: string;
  description: string;
  requirements: string[];
  targetLanguages: string[];
  budgetCents: number;
  platformFeeCents: number;
  developerPayoutCents: number;
  status: BountyStatus;
  priority: BountyPriority;
  candidateCount: number;
  fulfilledBy?: string;
  fulfilledDiscoveryId?: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface BountyCandidate {
  id: string;
  bountyId: string;
  discoveryId: string;
  cjpiScore: number;
  matchScore: number;
  submittedBy: string;
  status: 'pending' | 'accepted' | 'rejected';
  rejectionReason?: string;
  createdAt: string;
}

/** Platform fee percentage */
const PLATFORM_FEE_RATE = 0.15;

/** Minimum bounty value in cents */
export const MIN_BOUNTY_CENTS = 5000; // $50.00

/** Maximum bounty duration in days */
export const MAX_BOUNTY_DAYS = 90;

/**
 * Calculate bounty fee split
 */
export function calculateBountyFees(budgetCents: number): {
  platformFeeCents: number;
  developerPayoutCents: number;
} {
  const platformFeeCents = Math.round(budgetCents * PLATFORM_FEE_RATE);
  const developerPayoutCents = budgetCents - platformFeeCents;
  return { platformFeeCents, developerPayoutCents };
}

/**
 * Validate bounty meets minimum requirements
 */
export function validateBounty(bounty: Pick<Bounty, 'title' | 'description' | 'requirements' | 'budgetCents'>): {
  valid: boolean;
  reason?: string;
} {
  if (!bounty.title.trim()) {
    return { valid: false, reason: 'Bounty title is required.' };
  }

  if (!bounty.description.trim() || bounty.description.length < 50) {
    return { valid: false, reason: 'Bounty description must be at least 50 characters.' };
  }

  if (bounty.requirements.length === 0) {
    return { valid: false, reason: 'At least one requirement must be specified.' };
  }

  if (bounty.budgetCents < MIN_BOUNTY_CENTS) {
    return { valid: false, reason: `Minimum bounty value is $${(MIN_BOUNTY_CENTS / 100).toFixed(2)}.` };
  }

  return { valid: true };
}

/**
 * Score how well a candidate matches bounty requirements
 * Returns 0-100 match percentage
 */
export function scoreCandidateMatch(
  bountyRequirements: string[],
  candidateCapabilities: string[]
): number {
  if (bountyRequirements.length === 0) return 0;

  const normalizedReqs = bountyRequirements.map(r => r.toLowerCase().trim());
  const normalizedCaps = candidateCapabilities.map(c => c.toLowerCase().trim());

  let matches = 0;
  for (const req of normalizedReqs) {
    const found = normalizedCaps.some(cap =>
      cap.includes(req) || req.includes(cap)
    );
    if (found) matches++;
  }

  return Math.round((matches / normalizedReqs.length) * 100);
}

/**
 * Determine what happens to rejected bounty candidates
 * Rejected candidates with CJPI >= 68 go to the Showroom
 * Rejected candidates with CJPI < 68 go to the Junkyard
 */
export function routeRejectedCandidate(cjpiScore: number): 'showroom' | 'junkyard' {
  return cjpiScore >= 68 ? 'showroom' : 'junkyard';
}

/**
 * Calculate priority multiplier for bounty queue position
 */
export function getPriorityMultiplier(priority: BountyPriority): number {
  const multipliers: Record<BountyPriority, number> = {
    standard: 1.0,
    priority: 1.5,
    urgent: 2.0,
  };
  return multipliers[priority];
}
