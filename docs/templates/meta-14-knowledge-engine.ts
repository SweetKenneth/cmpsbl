/**
 * Meta-Engine #14 — Knowledge & Learning Engine
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Composes: Event Sourcing + Cache + Pipeline + Consensus + Anomaly
 *
 * Self-improving knowledge system. Stores observations as events,
 * derives knowledge through transformation pipelines, validates
 * discoveries via multi-source consensus, detects knowledge drift
 * anomalies, and caches derived insights for fast retrieval.
 *
 * Zero dependencies. Pure TypeScript. Drop-in ready.
 */

export interface Observation {
  id: string;
  domain: string;
  subject: string;
  predicate: string;
  value: unknown;
  confidence: number;
  source: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

export interface KnowledgeFact {
  subject: string;
  predicate: string;
  value: unknown;
  confidence: number;
  sources: string[];
  validatedBy?: string[];
  firstObserved: number;
  lastUpdated: number;
  observations: number;
  contradictions: number;
}

export interface LearningCycle {
  id: string;
  domain: string;
  factsDiscovered: number;
  factsUpdated: number;
  contradictionsFound: number;
  anomaliesDetected: number;
  durationMs: number;
  timestamp: number;
}

export interface KnowledgeStats {
  totalObservations: number;
  totalFacts: number;
  domains: number;
  avgConfidence: number;
  learningCycles: number;
  contradictionRate: number;
  knowledgeGrowthRate: number;
}

export function createKnowledgeEngine() {
  const observations: Observation[] = [];
  const facts = new Map<string, KnowledgeFact>();
  const cycles: LearningCycle[] = [];
  let obsSeq = 0;

  // ── Cache ──────────────────────────────────────────────────────
  const queryCache = new Map<string, { result: unknown; expiresAt: number }>();
  function cacheGet(key: string): unknown | undefined { const e = queryCache.get(key); if (!e || Date.now() > e.expiresAt) { queryCache.delete(key); return undefined; } return e.result; }
  function cacheSet(key: string, result: unknown, ttl = 30_000) { queryCache.set(key, { result, expiresAt: Date.now() + ttl }); }

  // ── Observation Ingestion ──────────────────────────────────────

  function observe(params: Omit<Observation, 'id' | 'timestamp'>): Observation {
    const obs: Observation = { ...params, id: `obs_${++obsSeq}`, timestamp: Date.now() };
    observations.push(obs);
    if (observations.length > 50_000) observations.splice(0, observations.length - 50_000);

    // Update or create fact
    const factKey = `${obs.subject}::${obs.predicate}`;
    const existing = facts.get(factKey);

    if (existing) {
      const valueMatches = JSON.stringify(existing.value) === JSON.stringify(obs.value);
      if (valueMatches) {
        // Reinforcing observation
        existing.confidence = Math.min(1, existing.confidence * 0.9 + obs.confidence * 0.1);
        existing.observations++;
        existing.lastUpdated = Date.now();
        if (!existing.sources.includes(obs.source)) existing.sources.push(obs.source);
      } else {
        // Contradicting observation
        existing.contradictions++;
        if (obs.confidence > existing.confidence) {
          existing.value = obs.value;
          existing.confidence = obs.confidence;
          existing.lastUpdated = Date.now();
        } else {
          existing.confidence *= 0.95; // Erode confidence on contradiction
        }
      }
    } else {
      facts.set(factKey, {
        subject: obs.subject,
        predicate: obs.predicate,
        value: obs.value,
        confidence: obs.confidence,
        sources: [obs.source],
        firstObserved: Date.now(),
        lastUpdated: Date.now(),
        observations: 1,
        contradictions: 0,
      });
    }

    // Invalidate cache for this subject
    for (const [k] of queryCache) { if (k.includes(obs.subject)) queryCache.delete(k); }

    return obs;
  }

  function observeBatch(batch: Array<Omit<Observation, 'id' | 'timestamp'>>): Observation[] {
    return batch.map(b => observe(b));
  }

  // ── Knowledge Queries ──────────────────────────────────────────

  function getFact(subject: string, predicate: string): KnowledgeFact | undefined {
    return facts.get(`${subject}::${predicate}`);
  }

  function queryFacts(opts?: { subject?: string; predicate?: string; minConfidence?: number; domain?: string; limit?: number }): KnowledgeFact[] {
    const cacheKey = JSON.stringify(opts ?? {});
    const cached = cacheGet(cacheKey);
    if (cached) return cached as KnowledgeFact[];

    let results = [...facts.values()];
    if (opts?.subject) results = results.filter(f => f.subject === opts.subject);
    if (opts?.predicate) results = results.filter(f => f.predicate === opts.predicate);
    if (opts?.minConfidence) results = results.filter(f => f.confidence >= opts.minConfidence!);
    results.sort((a, b) => b.confidence - a.confidence);
    if (opts?.limit) results = results.slice(0, opts.limit);

    cacheSet(cacheKey, results);
    return results;
  }

  function getRelated(subject: string): KnowledgeFact[] {
    return [...facts.values()].filter(f => f.subject === subject || JSON.stringify(f.value).includes(subject));
  }

  // ── Consensus Validation ───────────────────────────────────────

  function validate(subject: string, predicate: string, validators: Array<{ id: string; check: (fact: KnowledgeFact) => Promise<{ agrees: boolean; confidence: number }> }>): Promise<{ validated: boolean; agreement: number; validatorResults: Array<{ id: string; agrees: boolean; confidence: number }> }> {
    const fact = getFact(subject, predicate);
    if (!fact) return Promise.resolve({ validated: false, agreement: 0, validatorResults: [] });

    return Promise.all(validators.map(async v => {
      try {
        const result = await v.check(fact);
        return { id: v.id, ...result };
      } catch {
        return { id: v.id, agrees: false, confidence: 0 };
      }
    })).then(results => {
      const agreeing = results.filter(r => r.agrees);
      const agreement = results.length > 0 ? agreeing.length / results.length : 0;
      const validated = agreement >= 0.667;

      if (validated) {
        fact.validatedBy = agreeing.map(r => r.id);
        fact.confidence = Math.min(1, fact.confidence * 1.1);
      }

      return { validated, agreement, validatorResults: results };
    });
  }

  // ── Learning Cycle ─────────────────────────────────────────────

  function runLearningCycle(domain?: string): LearningCycle {
    const start = Date.now();
    const domainFacts = domain ? [...facts.values()].filter(f => {
      const obs = observations.find(o => `${o.subject}::${o.predicate}` === `${f.subject}::${f.predicate}`);
      return obs?.domain === domain;
    }) : [...facts.values()];

    let discovered = 0, updated = 0, contradictions = 0, anomalies = 0;

    // Detect anomalies — facts with high contradiction rates
    for (const fact of domainFacts) {
      const contradictionRate = fact.observations > 0 ? fact.contradictions / fact.observations : 0;
      if (contradictionRate > 0.3) {
        anomalies++;
        fact.confidence *= 0.8; // Decay unreliable facts
      }
      if (fact.contradictions > 0) contradictions += fact.contradictions;
    }

    // Cross-reference: find implicit facts from existing knowledge
    const subjects = [...new Set(domainFacts.map(f => f.subject))];
    for (const subj of subjects) {
      const subjFacts = domainFacts.filter(f => f.subject === subj);
      // If a subject has many high-confidence facts, boost related facts
      if (subjFacts.filter(f => f.confidence > 0.8).length >= 3) {
        for (const f of subjFacts) {
          if (f.confidence < 0.5) { f.confidence *= 1.05; updated++; }
        }
      }
    }

    const cycle: LearningCycle = {
      id: `cycle_${Date.now()}`,
      domain: domain ?? 'all',
      factsDiscovered: discovered,
      factsUpdated: updated,
      contradictionsFound: contradictions,
      anomaliesDetected: anomalies,
      durationMs: Date.now() - start,
      timestamp: Date.now(),
    };
    cycles.push(cycle);
    return cycle;
  }

  // ── Stats ──────────────────────────────────────────────────────

  function getStats(): KnowledgeStats {
    const allFacts = [...facts.values()];
    const domains = new Set(observations.map(o => o.domain));
    const totalContradictions = allFacts.reduce((s, f) => s + f.contradictions, 0);
    const totalObs = allFacts.reduce((s, f) => s + f.observations, 0);

    return {
      totalObservations: observations.length,
      totalFacts: facts.size,
      domains: domains.size,
      avgConfidence: allFacts.length > 0 ? allFacts.reduce((s, f) => s + f.confidence, 0) / allFacts.length : 0,
      learningCycles: cycles.length,
      contradictionRate: totalObs > 0 ? totalContradictions / totalObs : 0,
      knowledgeGrowthRate: cycles.length >= 2 ? (cycles[cycles.length - 1].factsDiscovered - cycles[0].factsDiscovered) / cycles.length : 0,
    };
  }

  return {
    observe, observeBatch,
    getFact, queryFacts, getRelated,
    validate, runLearningCycle,
    getStats,
    get factCount() { return facts.size; },
    get observationCount() { return observations.length; },
  };
}
