/**
 * CMPSBL® Marketplace (Model 9)
 * 
 * Two-sided marketplace. Developers list. Customers buy.
 * Platform fees on transactions.
 */

export type ListingStatus = 'draft' | 'review' | 'listed' | 'sold' | 'retired';

export interface MarketplaceListing {
  id: string;
  sellerId: string;
  discoveryId: string;
  title: string;
  description: string;
  category: string;
  cjpiScore: number;
  priceCents: number;
  platformFeeCents: number;
  sellerRevenueCents: number;
  status: ListingStatus;
  viewCount: number;
  createdAt: string;
  listedAt?: string;
  soldAt?: string;
}

/** Marketplace platform fee — same as licensing engine 70/30 */
const MARKETPLACE_FEE_RATE = 0.30;

/**
 * Calculate marketplace transaction fees
 */
export function calculateMarketplaceFees(priceCents: number): {
  platformFeeCents: number;
  sellerRevenueCents: number;
} {
  const platformFeeCents = Math.round(priceCents * MARKETPLACE_FEE_RATE);
  const sellerRevenueCents = priceCents - platformFeeCents;
  return { platformFeeCents, sellerRevenueCents };
}

/**
 * Validate a marketplace listing
 */
export function validateListing(listing: Pick<MarketplaceListing, 'title' | 'description' | 'cjpiScore' | 'priceCents'>): {
  valid: boolean;
  reason?: string;
} {
  if (!listing.title.trim()) {
    return { valid: false, reason: 'Listing title is required.' };
  }

  if (listing.cjpiScore < 68) {
    return { valid: false, reason: 'Only discoveries with CJPI 68+ can be listed in the Marketplace.' };
  }

  if (listing.priceCents < 100) {
    return { valid: false, reason: 'Minimum listing price is $1.00.' };
  }

  return { valid: true };
}
