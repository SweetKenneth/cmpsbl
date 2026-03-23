/**
 * ORACLE Ultimate #4 — Prescriptive Recommendation Engine
 * Goes beyond prediction → tells the substrate WHAT TO DO.
 * Generates ranked action recommendations with expected ROI.
 */

// ── Types ──

export type RecommendationPriority = 'critical' | 'high' | 'medium' | 'low';
export type RecommendationStatus = 'pending' | 'accepted' | 'rejected' | 'executed' | 'expired';

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  priority: RecommendationPriority;
  status: RecommendationStatus;
  sourceNode: string;
  targetNodes: string[];
  expectedROI: number;          // 0-1 scale
  confidence: number;           // 0-1 scale
  risk: number;                 // 0-1 scale
  compositeScore: number;       // Weighted ranking
  action: string;               // Machine-readable action key
  parameters: Record<string, unknown>;
  expiresAt: number;
  createdAt: number;
  resolvedAt: number | null;
}

export interface RecommendationOutcome {
  recommendationId: string;
  wasAccepted: boolean;
  actualOutcome: 'positive' | 'neutral' | 'negative' | null;
  outcomeScore: number | null;
  recordedAt: number;
}

// ── State ──

const recommendations = new Map<string, Recommendation>();
const outcomes: RecommendationOutcome[] = [];
let totalGenerated = 0;
let totalAccepted = 0;
let totalExecuted = 0;

const PRIORITY_WEIGHTS: Record<RecommendationPriority, number> = {
  critical: 1.0, high: 0.75, medium: 0.5, low: 0.25,
};

// ── Core ──

let idCounter = 0;

export function generateRecommendation(input: {
  title: string;
  description: string;
  priority: RecommendationPriority;
  sourceNode: string;
  targetNodes: string[];
  expectedROI: number;
  confidence: number;
  risk: number;
  action: string;
  parameters?: Record<string, unknown>;
  ttlMs?: number;
}): Recommendation {
  const compositeScore = (
    input.expectedROI * 0.4 +
    input.confidence * 0.35 +
    (1 - input.risk) * 0.15 +
    PRIORITY_WEIGHTS[input.priority] * 0.10
  );

  const rec: Recommendation = {
    id: `rec-${++idCounter}-${Date.now().toString(36)}`,
    title: input.title,
    description: input.description,
    priority: input.priority,
    status: 'pending',
    sourceNode: input.sourceNode,
    targetNodes: input.targetNodes,
    expectedROI: input.expectedROI,
    confidence: input.confidence,
    risk: input.risk,
    compositeScore: Math.round(compositeScore * 1000) / 1000,
    action: input.action,
    parameters: input.parameters ?? {},
    expiresAt: Date.now() + (input.ttlMs ?? 30 * 60_000), // Default 30min
    createdAt: Date.now(),
    resolvedAt: null,
  };

  recommendations.set(rec.id, rec);
  totalGenerated++;
  return rec;
}

export function resolveRecommendation(id: string, status: 'accepted' | 'rejected'): boolean {
  const rec = recommendations.get(id);
  if (!rec || rec.status !== 'pending') return false;
  rec.status = status;
  rec.resolvedAt = Date.now();
  if (status === 'accepted') totalAccepted++;
  return true;
}

export function markExecuted(id: string): boolean {
  const rec = recommendations.get(id);
  if (!rec || rec.status !== 'accepted') return false;
  rec.status = 'executed';
  totalExecuted++;
  return true;
}

export function recordOutcome(id: string, actualOutcome: 'positive' | 'neutral' | 'negative', outcomeScore: number): void {
  outcomes.push({
    recommendationId: id,
    wasAccepted: recommendations.get(id)?.status === 'executed',
    actualOutcome,
    outcomeScore,
    recordedAt: Date.now(),
  });
}

/** Get top N recommendations ranked by composite score. */
export function getTopRecommendations(n: number = 10, statusFilter?: RecommendationStatus): Recommendation[] {
  return Array.from(recommendations.values())
    .filter(r => !statusFilter || r.status === statusFilter)
    .filter(r => r.expiresAt > Date.now())
    .sort((a, b) => b.compositeScore - a.compositeScore)
    .slice(0, n);
}

/** Expire stale recommendations. Returns count expired. */
export function expireStale(): number {
  let count = 0;
  const now = Date.now();
  for (const rec of recommendations.values()) {
    if (rec.status === 'pending' && rec.expiresAt < now) {
      rec.status = 'expired';
      count++;
    }
  }
  return count;
}

/** Adoption rate = accepted / total resolved. */
export function getAdoptionRate(): number {
  const resolved = Array.from(recommendations.values()).filter(r => r.status !== 'pending');
  if (resolved.length === 0) return 0;
  return totalAccepted / resolved.length;
}

export function getPrescriptiveStats(): {
  totalGenerated: number; totalAccepted: number; totalExecuted: number;
  adoptionRate: number; pendingCount: number; outcomeAccuracy: number;
} {
  const positiveOutcomes = outcomes.filter(o => o.actualOutcome === 'positive').length;
  return {
    totalGenerated, totalAccepted, totalExecuted,
    adoptionRate: getAdoptionRate(),
    pendingCount: Array.from(recommendations.values()).filter(r => r.status === 'pending').length,
    outcomeAccuracy: outcomes.length > 0 ? positiveOutcomes / outcomes.length : 0,
  };
}

export function resetPrescriptiveState(): void {
  recommendations.clear();
  outcomes.length = 0;
  totalGenerated = 0;
  totalAccepted = 0;
  totalExecuted = 0;
  idCounter = 0;
}
