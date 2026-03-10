/**
 * S-Tier 032 — SM-2 Spaced Repetition Engine
 * CJPI: 94 | Node: MEMORY | ID: S-105
 *
 * Implements the SuperMemo SM-2 algorithm for optimal review scheduling.
 * Used by CLM to determine when knowledge should be revisited.
 */

export interface ReviewCard {
  id: string;
  topic: string;
  easiness: number;      // EF ≥ 1.3
  interval: number;      // days until next review
  repetition: number;    // successful repetitions
  nextReview: number;    // epoch ms
  lastReview: number;    // epoch ms
}

export type ReviewQuality = 0 | 1 | 2 | 3 | 4 | 5;

export interface ReviewResult {
  card: ReviewCard;
  previousInterval: number;
  newInterval: number;
  easinessChange: number;
}

/**
 * SM-2 core: computes next interval and easiness factor.
 */
export function sm2Review(card: ReviewCard, quality: ReviewQuality): ReviewResult {
  const prev = { ...card };
  const prevInterval = card.interval;

  // Update easiness factor
  card.easiness = Math.max(
    1.3,
    card.easiness + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  );

  if (quality < 3) {
    // Failed — reset
    card.repetition = 0;
    card.interval = 1;
  } else {
    card.repetition++;
    switch (card.repetition) {
      case 1: card.interval = 1; break;
      case 2: card.interval = 6; break;
      default: card.interval = Math.round(prevInterval * card.easiness);
    }
  }

  const now = Date.now();
  card.lastReview = now;
  card.nextReview = now + card.interval * 86_400_000;

  return {
    card,
    previousInterval: prevInterval,
    newInterval: card.interval,
    easinessChange: card.easiness - prev.easiness,
  };
}

/**
 * Create a new review card with default SM-2 parameters.
 */
export function createCard(id: string, topic: string): ReviewCard {
  return {
    id,
    topic,
    easiness: 2.5,
    interval: 0,
    repetition: 0,
    nextReview: Date.now(),
    lastReview: 0,
  };
}

/**
 * Get cards due for review, sorted by urgency.
 */
export function getDueCards(cards: ReviewCard[], now = Date.now()): ReviewCard[] {
  return cards
    .filter(c => c.nextReview <= now)
    .sort((a, b) => a.nextReview - b.nextReview);
}
