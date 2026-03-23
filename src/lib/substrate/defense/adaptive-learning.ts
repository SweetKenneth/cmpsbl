/**
 * DEFENSE — Adaptive Threat Learning v1.0.0
 * Feedback loop where blocked threats automatically improve detection thresholds.
 *
 * Learns from:
 *  - Blocked threats → strengthen matching patterns
 *  - False positives → raise thresholds
 *  - New vectors → generate dynamic signatures
 */

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface ThreatFeedbackEntry {
  readonly id: string;
  readonly timestamp: number;
  readonly category: string;
  readonly severity: string;
  readonly wasBlocked: boolean;
  readonly wasFalsePositive: boolean;
  readonly vector: string;
  readonly confidence: number;
}

export interface AdaptiveThresholds {
  readonly categoryThresholds: ReadonlyMap<string, number>;
  readonly globalSensitivity: number; // 0.0 - 1.0
  readonly dynamicSignatures: readonly DynamicSignature[];
  readonly learningCycles: number;
  readonly lastUpdated: number;
}

export interface DynamicSignature {
  readonly id: string;
  readonly pattern: string;
  readonly category: string;
  readonly learnedFrom: number; // count of observations
  readonly confidence: number;
  readonly createdAt: number;
  readonly lastSeen: number;
}

export interface LearningStats {
  readonly totalFeedback: number;
  readonly truePositives: number;
  readonly falsePositives: number;
  readonly adaptationEvents: number;
  readonly dynamicSignatureCount: number;
  readonly avgConfidenceShift: number;
  readonly learningCycles: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════════════════════

const MAX_FEEDBACK = 1000;
const MAX_DYNAMIC_SIGS = 100;
const MIN_OBSERVATIONS_TO_LEARN = 3;
const SENSITIVITY_FLOOR = 0.3;
const SENSITIVITY_CEILING = 0.95;

const feedbackBuffer: ThreatFeedbackEntry[] = [];
const categoryConfidence = new Map<string, { hits: number; falsePositives: number; adjusted: number }>();
const dynamicSignatures: DynamicSignature[] = [];
let feedbackSeq = 0;
let learningCycles = 0;
let totalAdaptations = 0;

// ═══════════════════════════════════════════════════════════════════════════════
// FEEDBACK INGESTION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Record a detection event as feedback for the learning system.
 */
export function recordFeedback(
  category: string,
  severity: string,
  vector: string,
  wasBlocked: boolean,
  wasFalsePositive = false,
  confidence = 0.8,
): ThreatFeedbackEntry {
  const entry: ThreatFeedbackEntry = Object.freeze({
    id: `LRN-${(++feedbackSeq).toString(36)}`,
    timestamp: Date.now(),
    category,
    severity,
    wasBlocked,
    wasFalsePositive,
    vector,
    confidence,
  });

  feedbackBuffer.push(entry);
  if (feedbackBuffer.length > MAX_FEEDBACK) {
    feedbackBuffer.splice(0, feedbackBuffer.length - MAX_FEEDBACK);
  }

  // Update category confidence
  let cat = categoryConfidence.get(category);
  if (!cat) {
    cat = { hits: 0, falsePositives: 0, adjusted: 0.5 };
    categoryConfidence.set(category, cat);
  }

  if (wasFalsePositive) {
    cat.falsePositives++;
    // Lower sensitivity for this category
    cat.adjusted = Math.max(SENSITIVITY_FLOOR, cat.adjusted - 0.05);
    totalAdaptations++;
  } else if (wasBlocked) {
    cat.hits++;
    // Raise sensitivity for this category
    cat.adjusted = Math.min(SENSITIVITY_CEILING, cat.adjusted + 0.02);
    totalAdaptations++;
  }

  return entry;
}

/**
 * Record multiple detections from a scan result.
 */
export function recordScanFeedback(
  threats: Array<{ category: string; severity: string; description: string }>,
  verdict: string,
): void {
  const wasBlocked = verdict === 'blocked' || verdict === 'malicious';
  for (const t of threats) {
    recordFeedback(t.category, t.severity, t.description, wasBlocked, false, 0.8);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// LEARNING CYCLE
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Run a learning cycle to update thresholds and generate dynamic signatures.
 */
export function runLearningCycle(): AdaptiveThresholds {
  learningCycles++;
  const now = Date.now();

  // Analyze feedback for emerging patterns
  const vectorFrequency = new Map<string, { count: number; lastSeen: number; category: string }>();
  const recentWindow = now - 60 * 60_000; // Last hour

  for (const entry of feedbackBuffer) {
    if (entry.timestamp < recentWindow) continue;
    if (entry.wasFalsePositive) continue;

    const key = entry.vector.slice(0, 60);
    const existing = vectorFrequency.get(key);
    if (existing) {
      existing.count++;
      existing.lastSeen = Math.max(existing.lastSeen, entry.timestamp);
    } else {
      vectorFrequency.set(key, { count: 1, lastSeen: entry.timestamp, category: entry.category });
    }
  }

  // Generate dynamic signatures from frequent new vectors
  for (const [vector, freq] of vectorFrequency) {
    if (freq.count < MIN_OBSERVATIONS_TO_LEARN) continue;

    // Check if already exists
    const exists = dynamicSignatures.some(s => s.pattern === vector);
    if (exists) {
      const sig = dynamicSignatures.find(s => s.pattern === vector);
      if (sig) {
        // Update existing (mutate in-place since it's our own array)
        const idx = dynamicSignatures.indexOf(sig);
        dynamicSignatures[idx] = {
          ...sig,
          learnedFrom: sig.learnedFrom + freq.count,
          confidence: Math.min(0.95, sig.confidence + 0.05),
          lastSeen: freq.lastSeen,
        };
      }
      continue;
    }

    // Create new dynamic signature
    dynamicSignatures.push({
      id: `DSIG-${dynamicSignatures.length + 1}`,
      pattern: vector,
      category: freq.category,
      learnedFrom: freq.count,
      confidence: 0.6 + (freq.count * 0.05),
      createdAt: now,
      lastSeen: freq.lastSeen,
    });

    if (dynamicSignatures.length > MAX_DYNAMIC_SIGS) {
      // Evict lowest-confidence signature
      let minIdx = 0;
      for (let i = 1; i < dynamicSignatures.length; i++) {
        if (dynamicSignatures[i].confidence < dynamicSignatures[minIdx].confidence) minIdx = i;
      }
      dynamicSignatures.splice(minIdx, 1);
    }
  }

  // Calculate global sensitivity from category mix
  let totalAdjusted = 0;
  let count = 0;
  for (const cat of categoryConfidence.values()) {
    totalAdjusted += cat.adjusted;
    count++;
  }

  const globalSensitivity = count > 0
    ? Math.max(SENSITIVITY_FLOOR, Math.min(SENSITIVITY_CEILING, totalAdjusted / count))
    : 0.5;

  return Object.freeze({
    categoryThresholds: new Map(
      Array.from(categoryConfidence.entries()).map(([k, v]) => [k, v.adjusted]),
    ),
    globalSensitivity,
    dynamicSignatures: Object.freeze([...dynamicSignatures]),
    learningCycles,
    lastUpdated: now,
  });
}

/**
 * Get the current confidence threshold for a category.
 */
export function getCategoryThreshold(category: string): number {
  return categoryConfidence.get(category)?.adjusted ?? 0.5;
}

/**
 * Mark a detection as a false positive to lower future sensitivity.
 */
export function markFalsePositive(category: string, vector: string): void {
  recordFeedback(category, 'low', vector, false, true, 0);
}

/**
 * Get learning statistics.
 */
export function getLearningStats(): LearningStats {
  let truePositives = 0;
  let falsePositives = 0;
  for (const entry of feedbackBuffer) {
    if (entry.wasFalsePositive) falsePositives++;
    else if (entry.wasBlocked) truePositives++;
  }

  let totalShift = 0;
  let catCount = 0;
  for (const cat of categoryConfidence.values()) {
    totalShift += Math.abs(cat.adjusted - 0.5);
    catCount++;
  }

  return {
    totalFeedback: feedbackBuffer.length,
    truePositives,
    falsePositives,
    adaptationEvents: totalAdaptations,
    dynamicSignatureCount: dynamicSignatures.length,
    avgConfidenceShift: catCount > 0 ? totalShift / catCount : 0,
    learningCycles,
  };
}

/**
 * Clear all learning state.
 */
export function clearLearningState(): void {
  feedbackBuffer.length = 0;
  categoryConfidence.clear();
  dynamicSignatures.length = 0;
  learningCycles = 0;
  totalAdaptations = 0;
}
