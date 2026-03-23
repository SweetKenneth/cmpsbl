/**
 * CMPSBL® VISION — Anomaly-Driven Authentication Bridge
 * Signals DEFENSE for step-up auth when behavioral anomaly score > threshold.
 * Cross-node signaling without direct node coupling.
 */

export interface DefenseBridgeEvent {
  id: string;
  userId: string;
  anomalyScore: number;
  threshold: number;
  action: 'step_up_auth' | 'session_review' | 'rate_limit' | 'no_action';
  factors: Record<string, number>;
  emittedAt: string;
  acknowledged: boolean;
}

// Bounded event log
const MAX_EVENTS = 500;
const bridgeEvents: DefenseBridgeEvent[] = [];
const cooldowns = new Map<string, number>(); // userId → last trigger timestamp
const COOLDOWN_MS = 10 * 60 * 1000; // 10 min cooldown per user

// Thresholds
const STEP_UP_THRESHOLD = 70;
const REVIEW_THRESHOLD = 50;
const RATE_LIMIT_THRESHOLD = 85;

/**
 * Evaluate anomaly score and emit defense signal if needed
 */
export function evaluateAndSignal(
  userId: string,
  anomalyScore: number,
  factors: Record<string, number>
): DefenseBridgeEvent {
  const now = Date.now();

  // Check cooldown
  const lastTrigger = cooldowns.get(userId) || 0;
  const onCooldown = (now - lastTrigger) < COOLDOWN_MS;

  let action: DefenseBridgeEvent['action'] = 'no_action';

  if (!onCooldown) {
    if (anomalyScore >= RATE_LIMIT_THRESHOLD) {
      action = 'rate_limit';
    } else if (anomalyScore >= STEP_UP_THRESHOLD) {
      action = 'step_up_auth';
    } else if (anomalyScore >= REVIEW_THRESHOLD) {
      action = 'session_review';
    }
  }

  const event: DefenseBridgeEvent = {
    id: `bridge_${now.toString(36)}_${Math.random().toString(36).slice(2, 5)}`,
    userId,
    anomalyScore,
    threshold: STEP_UP_THRESHOLD,
    action,
    factors,
    emittedAt: new Date().toISOString(),
    acknowledged: false,
  };

  if (action !== 'no_action') {
    cooldowns.set(userId, now);
    // Evict old cooldowns
    if (cooldowns.size > 1000) {
      for (const [k, v] of cooldowns) {
        if (now - v > COOLDOWN_MS * 2) cooldowns.delete(k);
      }
    }
  }

  bridgeEvents.push(event);
  if (bridgeEvents.length > MAX_EVENTS) bridgeEvents.shift();

  return event;
}

/**
 * Acknowledge a defense bridge event
 */
export function acknowledgeEvent(eventId: string): boolean {
  const event = bridgeEvents.find(e => e.id === eventId);
  if (!event) return false;
  event.acknowledged = true;
  return true;
}

/**
 * Get recent bridge events
 */
export function getBridgeEvents(options?: {
  userId?: string;
  actionFilter?: DefenseBridgeEvent['action'];
  limit?: number;
}): DefenseBridgeEvent[] {
  let events = [...bridgeEvents];

  if (options?.userId) events = events.filter(e => e.userId === options.userId);
  if (options?.actionFilter) events = events.filter(e => e.action === options.actionFilter);

  return events.slice(-(options?.limit || 20)).reverse();
}

/**
 * Get bridge stats
 */
export function getBridgeStats(): {
  totalEvents: number;
  stepUpCount: number;
  rateLimitCount: number;
  reviewCount: number;
  acknowledgedRate: number;
} {
  const total = bridgeEvents.length;
  const stepUp = bridgeEvents.filter(e => e.action === 'step_up_auth').length;
  const rateLimit = bridgeEvents.filter(e => e.action === 'rate_limit').length;
  const review = bridgeEvents.filter(e => e.action === 'session_review').length;
  const acked = bridgeEvents.filter(e => e.acknowledged).length;

  return {
    totalEvents: total,
    stepUpCount: stepUp,
    rateLimitCount: rateLimit,
    reviewCount: review,
    acknowledgedRate: total > 0 ? Math.round((acked / total) * 100) : 100,
  };
}
