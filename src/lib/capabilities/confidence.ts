/**
 * Capability Confidence Tracker
 * v10.5.4 — ARCHITECT Epoch Feedback + Scoring System (400+ capabilities)
 */

interface ConfidenceRecord {
  capabilityId: string;
  scores: number[];
  errors: string[];
  lastUpdated: string;
  avgConfidence: number;
}

const confidenceStore = new Map<string, ConfidenceRecord>();

const MAX_HISTORY = 100;

/**
 * Record a confidence score for a capability
 */
export function recordConfidence(
  capabilityId: string,
  score: number,
  error?: string
): void {
  const existing = confidenceStore.get(capabilityId) ?? {
    capabilityId,
    scores: [],
    errors: [],
    lastUpdated: new Date().toISOString(),
    avgConfidence: 1.0,
  };
  
  // Add score
  existing.scores.push(score);
  if (existing.scores.length > MAX_HISTORY) {
    existing.scores.shift();
  }
  
  // Add error if present
  if (error) {
    existing.errors.push(error);
    if (existing.errors.length > 10) {
      existing.errors.shift();
    }
  }
  
  // Recalculate average
  existing.avgConfidence = existing.scores.reduce((a, b) => a + b, 0) / existing.scores.length;
  existing.lastUpdated = new Date().toISOString();
  
  confidenceStore.set(capabilityId, existing);
}

/**
 * Get confidence stats for a capability
 */
export function getConfidence(capabilityId: string): ConfidenceRecord | undefined {
  return confidenceStore.get(capabilityId);
}

/**
 * Get overall confidence for a capability
 */
export function getAvgConfidence(capabilityId: string): number {
  return confidenceStore.get(capabilityId)?.avgConfidence ?? 1.0;
}

/**
 * Check if a capability is reliable (confidence > threshold)
 */
export function isReliable(capabilityId: string, threshold = 0.8): boolean {
  const record = confidenceStore.get(capabilityId);
  if (!record || record.scores.length < 5) {
    // Not enough data, assume reliable
    return true;
  }
  return record.avgConfidence >= threshold;
}

/**
 * Get all capabilities with low confidence
 */
export function getLowConfidenceCapabilities(threshold = 0.5): ConfidenceRecord[] {
  return Array.from(confidenceStore.values())
    .filter(r => r.avgConfidence < threshold && r.scores.length >= 5);
}

/**
 * Get confidence summary
 */
export function getConfidenceSummary(): {
  total: number;
  reliable: number;
  degraded: number;
  failing: number;
} {
  const all = Array.from(confidenceStore.values());
  
  return {
    total: all.length,
    reliable: all.filter(r => r.avgConfidence >= 0.8).length,
    degraded: all.filter(r => r.avgConfidence >= 0.5 && r.avgConfidence < 0.8).length,
    failing: all.filter(r => r.avgConfidence < 0.5).length,
  };
}

/**
 * Reset confidence for a capability
 */
export function resetConfidence(capabilityId: string): void {
  confidenceStore.delete(capabilityId);
}

/**
 * Clear all confidence data
 */
export function clearConfidence(): void {
  confidenceStore.clear();
}
