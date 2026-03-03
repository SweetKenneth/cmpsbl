/**
 * Domain-Focused Learning Engine — Ported from SimNap
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Allows modules to deepen knowledge in whitelisted domains
 * with quality scoring and mastery tracking.
 * 
 * Consumers: CLM, MEMORY, BRAIN
 * Origin: simnapDomainLearning.ts
 */

// ── Types ─────────────────────────────────────────────────────────

export interface LearningDomain {
  id: string;
  name: string;
  description: string;
  /** Priority 1-10 */
  priority: number;
  /** Quality threshold (1-10) — reject learning below this */
  minQuality: number;
  /** Mastery level 0-1 */
  mastery: number;
  /** Total learning events in this domain */
  totalEvents: number;
  /** Timestamp of last learning event */
  lastLearnedAt: number | null;
  /** Whether new learning requires novelty (mastery >= threshold) */
  requiresNovelty: boolean;
  /** Tags for cross-domain matching */
  tags: string[];
}

export interface LearningEvent {
  id: string;
  domainId: string;
  content: string;
  quality: number;         // 1-10
  novelty: number;         // 0-1
  source: string;
  timestamp: number;
  accepted: boolean;
  rejectionReason?: string;
}

export interface DomainLearningConfig {
  /** Mastery threshold above which novelty is required */
  masteryNoveltyThreshold: number;
  /** Minimum novelty score when novelty is required */
  minNoveltyScore: number;
  /** Mastery gain per accepted learning event */
  masteryGainRate: number;
  /** Mastery decay per hour of inactivity */
  masteryDecayRate: number;
  /** Maximum domains that can be active simultaneously */
  maxActiveDomains: number;
}

// ── Default Config ────────────────────────────────────────────────

export const DEFAULT_DOMAIN_CONFIG: DomainLearningConfig = {
  masteryNoveltyThreshold: 0.7,
  minNoveltyScore: 0.3,
  masteryGainRate: 0.02,
  masteryDecayRate: 0.001,
  maxActiveDomains: 10,
};

// ── Domain Registry ───────────────────────────────────────────────

const domains = new Map<string, LearningDomain>();
const eventLog: LearningEvent[] = [];

/**
 * Register a learning domain
 */
export function registerDomain(domain: Omit<LearningDomain, 'mastery' | 'totalEvents' | 'lastLearnedAt' | 'requiresNovelty'>): LearningDomain {
  const full: LearningDomain = {
    ...domain,
    mastery: 0,
    totalEvents: 0,
    lastLearnedAt: null,
    requiresNovelty: false,
  };
  domains.set(domain.id, full);
  return full;
}

/**
 * Get all registered domains
 */
export function getDomains(): LearningDomain[] {
  return [...domains.values()].sort((a, b) => b.priority - a.priority);
}

/**
 * Get a specific domain
 */
export function getDomain(id: string): LearningDomain | undefined {
  return domains.get(id);
}

/**
 * Apply mastery decay based on time since last learning
 */
export function applyMasteryDecay(config: DomainLearningConfig = DEFAULT_DOMAIN_CONFIG): void {
  const now = Date.now();
  for (const domain of domains.values()) {
    if (domain.lastLearnedAt) {
      const hoursSinceLast = (now - domain.lastLearnedAt) / (1000 * 60 * 60);
      const decay = hoursSinceLast * config.masteryDecayRate;
      domain.mastery = Math.max(0, domain.mastery - decay);
      domain.requiresNovelty = domain.mastery >= config.masteryNoveltyThreshold;
    }
  }
}

/**
 * Submit a learning event for evaluation
 * Returns acceptance/rejection with reason
 */
export function submitLearning(
  domainId: string,
  content: string,
  quality: number,
  novelty: number,
  source: string,
  config: DomainLearningConfig = DEFAULT_DOMAIN_CONFIG
): LearningEvent {
  const domain = domains.get(domainId);
  const event: LearningEvent = {
    id: crypto.randomUUID(),
    domainId,
    content,
    quality: Math.max(1, Math.min(10, quality)),
    novelty: Math.max(0, Math.min(1, novelty)),
    source,
    timestamp: Date.now(),
    accepted: false,
  };

  if (!domain) {
    event.rejectionReason = `Domain '${domainId}' not registered`;
    eventLog.push(event);
    return event;
  }

  // Quality gate
  if (quality < domain.minQuality) {
    event.rejectionReason = `Quality ${quality} below domain minimum ${domain.minQuality}`;
    eventLog.push(event);
    return event;
  }

  // Novelty gate (when mastery is high)
  if (domain.requiresNovelty && novelty < config.minNoveltyScore) {
    event.rejectionReason = `Domain mastered — novelty ${novelty.toFixed(2)} below minimum ${config.minNoveltyScore}`;
    eventLog.push(event);
    return event;
  }

  // Accept the learning
  event.accepted = true;
  domain.totalEvents++;
  domain.lastLearnedAt = event.timestamp;

  // Mastery gain (weighted by quality and novelty)
  const gain = config.masteryGainRate * (quality / 10) * (0.5 + novelty * 0.5);
  domain.mastery = Math.min(1, domain.mastery + gain);
  domain.requiresNovelty = domain.mastery >= config.masteryNoveltyThreshold;

  eventLog.push(event);

  // Prune log
  if (eventLog.length > 5000) {
    eventLog.splice(0, eventLog.length - 5000);
  }

  return event;
}

/**
 * Get the next priority domain that needs learning
 */
export function getNextLearningDomain(config: DomainLearningConfig = DEFAULT_DOMAIN_CONFIG): LearningDomain | null {
  applyMasteryDecay(config);

  const sorted = [...domains.values()]
    .filter(d => d.mastery < 1)
    .sort((a, b) => {
      // Prioritize: high priority + low mastery
      const scoreA = a.priority * (1 - a.mastery);
      const scoreB = b.priority * (1 - b.mastery);
      return scoreB - scoreA;
    });

  return sorted[0] ?? null;
}

/**
 * Get learning statistics
 */
export function getLearningStats(): {
  totalDomains: number;
  totalEvents: number;
  acceptanceRate: number;
  avgMastery: number;
  topDomains: Array<{ name: string; mastery: number }>;
} {
  const allDomains = [...domains.values()];
  const accepted = eventLog.filter(e => e.accepted).length;

  return {
    totalDomains: allDomains.length,
    totalEvents: eventLog.length,
    acceptanceRate: eventLog.length > 0 ? accepted / eventLog.length : 1,
    avgMastery: allDomains.length > 0
      ? allDomains.reduce((s, d) => s + d.mastery, 0) / allDomains.length
      : 0,
    topDomains: allDomains
      .sort((a, b) => b.mastery - a.mastery)
      .slice(0, 5)
      .map(d => ({ name: d.name, mastery: d.mastery })),
  };
}

/**
 * Clear all domains and events (for testing)
 */
export function clearDomainRegistry(): void {
  domains.clear();
  eventLog.length = 0;
}
