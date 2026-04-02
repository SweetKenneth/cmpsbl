/**
 * CMPSBL® Auction House (Model 12)
 * 
 * Extension of Vault scarcity. Competitive bidding on rare discoveries.
 * Market-driven pricing for Mythic and Apex tier artifacts.
 */

export type AuctionStatus = 'upcoming' | 'active' | 'ended' | 'sold' | 'no_sale';

export interface Auction {
  id: string;
  discoveryId: string;
  title: string;
  cjpiScore: number;
  tier: string;
  reservePriceCents: number;
  currentBidCents: number;
  bidCount: number;
  highestBidderId?: string;
  status: AuctionStatus;
  startsAt: string;
  endsAt: string;
  createdAt: string;
}

export interface Bid {
  id: string;
  auctionId: string;
  bidderId: string;
  amountCents: number;
  createdAt: string;
}

/** Minimum bid increment percentage */
const MIN_BID_INCREMENT_PCT = 0.05;

/** Minimum reserve price in cents */
export const MIN_RESERVE_CENTS = 10000; // $100

/** Auction duration options in hours */
export const AUCTION_DURATIONS = [24, 48, 72] as const;

/**
 * Calculate minimum next bid
 */
export function getMinNextBid(currentBidCents: number): number {
  const increment = Math.max(
    Math.round(currentBidCents * MIN_BID_INCREMENT_PCT),
    500 // $5 minimum increment
  );
  return currentBidCents + increment;
}

/**
 * Validate a bid against auction rules
 */
export function validateBid(
  auction: Auction,
  bidAmountCents: number,
  bidderId: string
): { valid: boolean; reason?: string } {
  if (auction.status !== 'active') {
    return { valid: false, reason: 'Auction is not currently active.' };
  }

  if (bidderId === auction.highestBidderId) {
    return { valid: false, reason: 'You are already the highest bidder.' };
  }

  const minBid = auction.bidCount === 0
    ? auction.reservePriceCents
    : getMinNextBid(auction.currentBidCents);

  if (bidAmountCents < minBid) {
    return { valid: false, reason: `Minimum bid is $${(minBid / 100).toFixed(2)}.` };
  }

  return { valid: true };
}

/**
 * Determine auction outcome
 */
export function resolveAuction(auction: Auction): AuctionStatus {
  if (auction.bidCount === 0) return 'no_sale';
  if (auction.currentBidCents >= auction.reservePriceCents) return 'sold';
  return 'no_sale';
}

/**
 * Check if auction qualifies for rare discovery status
 */
export function isRareAuction(cjpiScore: number): boolean {
  return cjpiScore >= 94;
}
