/**
 * IMMUNITY Ultimate — Adaptive Antibody Generator
 * 
 * When a novel threat is neutralized, automatically synthesizes detection rules
 * (antibodies) tuned to that threat's signature. Same attack never works twice.
 * 
 * - Signature extraction from resolved incidents
 * - Rule confidence scoring (deploys above 0.85 threshold)
 * - Generalization: broadens narrow signatures into family-level patterns
 * - Antibody decay: rules auto-expire if never triggered (180-day TTL)
 */

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface ThreatSignature {
  id: string;
  family: string;
  variant: string;
  pattern: string;
  extractedFrom: string; // incident ID
  extractedAt: number;
}

export interface Antibody {
  id: string;
  signature: ThreatSignature;
  confidence: number;       // 0–1
  generalized: boolean;     // broadened to family-level
  deployedAt: number;
  lastTriggeredAt: number | null;
  triggerCount: number;
  ttlMs: number;            // 180 days default
  active: boolean;
}

export interface AntibodyGeneratorHealth {
  totalAntibodies: number;
  activeAntibodies: number;
  expiredAntibodies: number;
  avgConfidence: number;
  familiesCovered: number;
  generationRate: number; // per hour EMA
}

// ═══════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════

const DEFAULT_TTL_MS = 180 * 24 * 60 * 60 * 1000; // 180 days
const DEPLOY_THRESHOLD = 0.85;
const MAX_ANTIBODIES = 2000;
const EMA_ALPHA = 0.2;

const antibodyRegistry = new Map<string, Antibody>();
const familyIndex = new Map<string, Set<string>>(); // family → antibody IDs
let generationCount = 0;
let generationRateEma = 0;
let lastGenerationAt = 0;

// ═══════════════════════════════════════════════════════════════
// CORE LOGIC
// ═══════════════════════════════════════════════════════════════

/** Extract signature from a resolved threat incident */
export function extractSignature(
  incidentId: string,
  family: string,
  variant: string,
  pattern: string,
): ThreatSignature {
  return {
    id: `sig_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    family,
    variant,
    pattern,
    extractedFrom: incidentId,
    extractedAt: Date.now(),
  };
}

/** Score confidence of a signature based on evidence quality */
export function scoreConfidence(
  signatureMatchCount: number,
  falsePositiveCount: number,
  sampleSize: number,
): number {
  if (sampleSize === 0) return 0;
  const precision = signatureMatchCount / Math.max(1, signatureMatchCount + falsePositiveCount);
  const coverage = Math.min(1, sampleSize / 10); // full confidence at 10+ samples
  return Math.round(precision * 0.7 + coverage * 0.3 * 100) / 100;
}

/** Generalize a narrow signature to family-level pattern */
export function generalize(sig: ThreatSignature): ThreatSignature {
  return {
    ...sig,
    id: `gen_${sig.id}`,
    variant: '*',
    pattern: sig.pattern.replace(/[0-9a-f]{8,}/gi, '*'), // wildcard hex sequences
  };
}

/** Synthesize and deploy an antibody from a signature */
export function synthesizeAntibody(
  signature: ThreatSignature,
  confidence: number,
  shouldGeneralize = false,
): Antibody | null {
  if (confidence < DEPLOY_THRESHOLD) return null;

  const effectiveSig = shouldGeneralize ? generalize(signature) : signature;
  const now = Date.now();

  const antibody: Antibody = {
    id: `ab_${now.toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    signature: effectiveSig,
    confidence,
    generalized: shouldGeneralize,
    deployedAt: now,
    lastTriggeredAt: null,
    triggerCount: 0,
    ttlMs: DEFAULT_TTL_MS,
    active: true,
  };

  // Register
  antibodyRegistry.set(antibody.id, antibody);
  const familySet = familyIndex.get(effectiveSig.family) ?? new Set();
  familySet.add(antibody.id);
  familyIndex.set(effectiveSig.family, familySet);

  // Track generation rate
  if (lastGenerationAt > 0) {
    const intervalHours = (now - lastGenerationAt) / 3_600_000;
    if (intervalHours > 0) {
      const instantRate = 1 / intervalHours;
      generationRateEma = generationRateEma === 0
        ? instantRate
        : EMA_ALPHA * instantRate + (1 - EMA_ALPHA) * generationRateEma;
    }
  }
  lastGenerationAt = now;
  generationCount++;

  // Evict oldest if over cap
  if (antibodyRegistry.size > MAX_ANTIBODIES) {
    evictOldest();
  }

  return antibody;
}

/** Record that an antibody was triggered (matched a threat) */
export function recordTrigger(antibodyId: string): boolean {
  const ab = antibodyRegistry.get(antibodyId);
  if (!ab || !ab.active) return false;
  ab.lastTriggeredAt = Date.now();
  ab.triggerCount++;
  return true;
}

/** Expire antibodies past their TTL that have never triggered */
export function expireStaleAntibodies(): number {
  const now = Date.now();
  let expired = 0;
  for (const ab of antibodyRegistry.values()) {
    if (!ab.active) continue;
    if (ab.lastTriggeredAt === null && (now - ab.deployedAt) > ab.ttlMs) {
      ab.active = false;
      expired++;
    }
  }
  return expired;
}

/** Get antibodies for a threat family */
export function getAntibodiesForFamily(family: string): Antibody[] {
  const ids = familyIndex.get(family);
  if (!ids) return [];
  return Array.from(ids)
    .map(id => antibodyRegistry.get(id))
    .filter((ab): ab is Antibody => ab !== undefined && ab.active);
}

/** Check if a pattern matches any active antibody */
export function matchPattern(pattern: string): Antibody | null {
  for (const ab of antibodyRegistry.values()) {
    if (!ab.active) continue;
    if (ab.signature.pattern === pattern) return ab;
    // Generalized match: wildcard comparison
    if (ab.generalized) {
      const regex = new RegExp('^' + ab.signature.pattern.replace(/\*/g, '.*') + '$');
      if (regex.test(pattern)) return ab;
    }
  }
  return null;
}

function evictOldest(): void {
  let oldest: Antibody | null = null;
  for (const ab of antibodyRegistry.values()) {
    if (!oldest || ab.deployedAt < oldest.deployedAt) oldest = ab;
  }
  if (oldest) {
    antibodyRegistry.delete(oldest.id);
    const familySet = familyIndex.get(oldest.signature.family);
    if (familySet) familySet.delete(oldest.id);
  }
}

/** Get health summary */
export function getAntibodyGeneratorHealth(): AntibodyGeneratorHealth {
  const all = Array.from(antibodyRegistry.values());
  const active = all.filter(a => a.active);
  const families = new Set(active.map(a => a.signature.family));
  const avgConf = active.length > 0
    ? active.reduce((s, a) => s + a.confidence, 0) / active.length
    : 0;

  return {
    totalAntibodies: all.length,
    activeAntibodies: active.length,
    expiredAntibodies: all.length - active.length,
    avgConfidence: Math.round(avgConf * 100) / 100,
    familiesCovered: families.size,
    generationRate: Math.round(generationRateEma * 100) / 100,
  };
}
