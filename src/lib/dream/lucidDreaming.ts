/**
 * CMPSBL® DREAM — Lucid Dreaming Mode
 * Steers dream synthesis toward specific problem domains when knowledge gaps are detected.
 */

export interface LucidDirective {
  id: string;
  targetDomain: string;
  knowledgeGap: string;
  priority: number; // 1-10
  requestedBy: string; // module that detected the gap
  createdAt: string;
  fulfilled: boolean;
  fulfilledAt: string | null;
  synthesisAttempts: number;
  maxAttempts: number;
}

// Bounded store
const MAX_DIRECTIVES = 100;
const directives = new Map<string, LucidDirective>();

/**
 * Request a lucid dream — steer synthesis toward a knowledge gap
 */
export function requestLucidDream(
  targetDomain: string,
  knowledgeGap: string,
  requestedBy: string,
  priority: number = 5
): LucidDirective {
  const id = `lucid_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 5)}`;

  const directive: LucidDirective = {
    id,
    targetDomain,
    knowledgeGap,
    priority: Math.max(1, Math.min(10, priority)),
    requestedBy,
    createdAt: new Date().toISOString(),
    fulfilled: false,
    fulfilledAt: null,
    synthesisAttempts: 0,
    maxAttempts: 5,
  };

  if (directives.size >= MAX_DIRECTIVES) {
    // Evict lowest-priority fulfilled directive
    let evictKey = '';
    let lowestPri = Infinity;
    for (const [k, d] of directives) {
      if (d.fulfilled && d.priority < lowestPri) {
        lowestPri = d.priority;
        evictKey = k;
      }
    }
    if (!evictKey) {
      const oldest = directives.keys().next().value;
      evictKey = oldest || '';
    }
    if (evictKey) directives.delete(evictKey);
  }

  directives.set(id, directive);
  return directive;
}

/**
 * Get active lucid directives sorted by priority
 */
export function getActiveDirectives(): LucidDirective[] {
  return Array.from(directives.values())
    .filter(d => !d.fulfilled && d.synthesisAttempts < d.maxAttempts)
    .sort((a, b) => b.priority - a.priority);
}

/**
 * Record a synthesis attempt for a directive
 */
export function recordAttempt(directiveId: string, success: boolean): boolean {
  const d = directives.get(directiveId);
  if (!d) return false;

  d.synthesisAttempts++;
  if (success) {
    d.fulfilled = true;
    d.fulfilledAt = new Date().toISOString();
  }
  return true;
}

/**
 * Get domain bias weights for dream candidate selection
 * Lucid directives boost priority for their target domains
 */
export function getDomainBiasWeights(): Record<string, number> {
  const weights: Record<string, number> = {};
  const active = getActiveDirectives();

  for (const d of active) {
    const boost = d.priority / 10; // 0.1 - 1.0
    weights[d.targetDomain] = Math.max(weights[d.targetDomain] || 0, boost);
  }

  return weights;
}

/**
 * Get lucid dream stats
 */
export function getLucidStats(): {
  activeDirectives: number;
  fulfilledDirectives: number;
  totalDirectives: number;
  fulfillmentRate: number;
  topGaps: Array<{ domain: string; gap: string; priority: number }>;
} {
  const all = Array.from(directives.values());
  const active = all.filter(d => !d.fulfilled && d.synthesisAttempts < d.maxAttempts);
  const fulfilled = all.filter(d => d.fulfilled);

  return {
    activeDirectives: active.length,
    fulfilledDirectives: fulfilled.length,
    totalDirectives: all.length,
    fulfillmentRate: all.length > 0 ? Math.round((fulfilled.length / all.length) * 100) : 0,
    topGaps: active.slice(0, 5).map(d => ({
      domain: d.targetDomain,
      gap: d.knowledgeGap,
      priority: d.priority,
    })),
  };
}
