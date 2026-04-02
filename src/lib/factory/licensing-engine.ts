/**
 * CMPSBL® Licensing Engine (Model 17)
 * 
 * Developer 70/30 revenue split for discovered patterns reused in exports.
 * Upload once. Earn forever.
 * 
 * Flow:
 *   Developer submits discovery → CJPI scored → listed in Showroom →
 *   Customer purchases → 70% to developer, 30% to CMPSBL →
 *   Royalty tracked per transaction
 */

export interface LicensingSubmission {
  developerId: string;
  discoveryId: string;
  title: string;
  description: string;
  cjpiScore: number;
  primitiveChain: string[];
  submittedAt: string;
}

export interface RoyaltyRecord {
  id: string;
  discoveryId: string;
  developerId: string;
  purchaseId: string;
  totalPriceCents: number;
  developerShareCents: number;
  platformShareCents: number;
  paidOut: boolean;
  createdAt: string;
}

export interface DeveloperEarnings {
  developerId: string;
  totalEarnedCents: number;
  totalPaidOutCents: number;
  pendingCents: number;
  discoveryCount: number;
  salesCount: number;
}

/** Revenue split constants */
const DEVELOPER_SHARE = 0.70;
const PLATFORM_SHARE = 0.30;

/** Minimum payout threshold in cents */
export const MIN_PAYOUT_THRESHOLD_CENTS = 2500; // $25.00

/**
 * Calculate revenue split for a discovery purchase
 */
export function calculateRoyaltySplit(totalPriceCents: number): {
  developerShareCents: number;
  platformShareCents: number;
} {
  const developerShareCents = Math.round(totalPriceCents * DEVELOPER_SHARE);
  const platformShareCents = totalPriceCents - developerShareCents;
  return { developerShareCents, platformShareCents };
}

/**
 * Validate a licensing submission meets quality requirements
 */
export function validateSubmission(submission: LicensingSubmission): {
  valid: boolean;
  reason?: string;
} {
  if (submission.cjpiScore < 68) {
    return { valid: false, reason: 'Discovery must score 68+ CJPI to be listed in the Showroom. Raw-tier discoveries belong in the Junkyard.' };
  }

  if (submission.primitiveChain.length === 0) {
    return { valid: false, reason: 'Discovery must have at least one primitive in its chain.' };
  }

  if (submission.primitiveChain.length > 20) {
    return { valid: false, reason: 'Primitive chain cannot exceed 20 primitives.' };
  }

  if (!submission.title.trim() || !submission.description.trim()) {
    return { valid: false, reason: 'Title and description are required.' };
  }

  return { valid: true };
}

/**
 * Calculate earnings summary for a developer
 */
export function summarizeEarnings(royalties: RoyaltyRecord[]): DeveloperEarnings {
  const developerId = royalties[0]?.developerId ?? '';
  const discoveryIds = new Set(royalties.map(r => r.discoveryId));

  const totalEarnedCents = royalties.reduce((sum, r) => sum + r.developerShareCents, 0);
  const totalPaidOutCents = royalties.filter(r => r.paidOut).reduce((sum, r) => sum + r.developerShareCents, 0);

  return {
    developerId,
    totalEarnedCents,
    totalPaidOutCents,
    pendingCents: totalEarnedCents - totalPaidOutCents,
    discoveryCount: discoveryIds.size,
    salesCount: royalties.length,
  };
}

/**
 * Check if developer meets minimum payout threshold
 */
export function isPayoutEligible(earnings: DeveloperEarnings): boolean {
  return earnings.pendingCents >= MIN_PAYOUT_THRESHOLD_CENTS;
}
