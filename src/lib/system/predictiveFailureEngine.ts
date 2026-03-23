/**
 * Predictive Failure Engine — SYSTEM v9.0.0
 * ML-style pattern matching on historical audit findings
 * to predict subsystem degradation before alerts trigger.
 */

import { boundArray } from './hardening';

// --- Types ---

export interface FailurePattern {
  id: string;
  subsystem: string;
  signatureHash: number;
  symptoms: string[];
  precursorWindow: number; // ms before failure typically occurs
  confidence: number; // 0-1
  occurrences: number;
  lastSeen: number;
  avgLeadTime: number; // ms
}

export interface PredictionResult {
  subsystem: string;
  predictedFailureType: string;
  confidence: number;
  estimatedTimeToFailure: number; // ms
  matchedPatternId: string;
  recommendedAction: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface AuditFinding {
  subsystem: string;
  findingType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: number;
  details?: Record<string, unknown>;
}

interface SymptomWindow {
  subsystem: string;
  findings: AuditFinding[];
  windowStart: number;
}

// --- Constants ---

const MAX_PATTERNS = 200;
const MAX_HISTORY = 1000;
const SYMPTOM_WINDOW_MS = 5 * 60_000; // 5 min
const MIN_OCCURRENCES_FOR_PREDICTION = 3;
const CONFIDENCE_DECAY_RATE = 0.95;
const SEVERITY_WEIGHTS: Record<string, number> = {
  low: 0.2, medium: 0.4, high: 0.7, critical: 1.0,
};

// --- State ---

const patterns: Map<string, FailurePattern> = new Map();
const findingHistory: AuditFinding[] = [];
const activeWindows: Map<string, SymptomWindow> = new Map();

// --- Hash ---

function hashSymptoms(symptoms: string[]): number {
  let hash = 0x811c9dc5;
  const sorted = [...symptoms].sort();
  for (const s of sorted) {
    for (let i = 0; i < s.length; i++) {
      hash ^= s.charCodeAt(i);
      hash = (hash * 0x01000193) >>> 0;
    }
  }
  return hash;
}

// --- Core ---

export function ingestFinding(finding: AuditFinding): void {
  findingHistory.push(finding);
  if (findingHistory.length > MAX_HISTORY) {
    findingHistory.splice(0, findingHistory.length - MAX_HISTORY);
  }

  const key = finding.subsystem;
  let window = activeWindows.get(key);
  const now = finding.timestamp || Date.now();

  if (!window || now - window.windowStart > SYMPTOM_WINDOW_MS) {
    // Previous window closed — check if it formed a pattern
    if (window && window.findings.length >= 2) {
      learnPattern(window);
    }
    window = { subsystem: key, findings: [], windowStart: now };
    activeWindows.set(key, window);
  }

  window.findings.push(finding);
}

function learnPattern(window: SymptomWindow): void {
  const symptoms = window.findings.map(f => f.findingType);
  const hash = hashSymptoms(symptoms);
  const patternId = `${window.subsystem}:${hash}`;

  const existing = patterns.get(patternId);
  if (existing) {
    existing.occurrences++;
    existing.lastSeen = Date.now();
    existing.confidence = Math.min(1, existing.confidence + 0.05);
    const leadTime = window.findings[window.findings.length - 1].timestamp - window.windowStart;
    existing.avgLeadTime = (existing.avgLeadTime * (existing.occurrences - 1) + leadTime) / existing.occurrences;
  } else {
    const leadTime = window.findings[window.findings.length - 1].timestamp - window.windowStart;
    patterns.set(patternId, {
      id: patternId,
      subsystem: window.subsystem,
      signatureHash: hash,
      symptoms,
      precursorWindow: SYMPTOM_WINDOW_MS,
      confidence: 0.3,
      occurrences: 1,
      lastSeen: Date.now(),
      avgLeadTime: leadTime,
    });
  }

  // Bound patterns
  if (patterns.size > MAX_PATTERNS) {
    const sorted = [...patterns.entries()].sort((a, b) => a[1].occurrences - b[1].occurrences);
    patterns.delete(sorted[0][0]);
  }
}

export function predictFailures(currentFindings: AuditFinding[]): PredictionResult[] {
  const predictions: PredictionResult[] = [];
  const bySubsystem = new Map<string, AuditFinding[]>();

  for (const f of currentFindings) {
    const arr = bySubsystem.get(f.subsystem) || [];
    arr.push(f);
    bySubsystem.set(f.subsystem, arr);
  }

  for (const [subsystem, findings] of bySubsystem) {
    const currentSymptoms = findings.map(f => f.findingType);
    const currentHash = hashSymptoms(currentSymptoms);

    for (const pattern of patterns.values()) {
      if (pattern.subsystem !== subsystem) continue;
      if (pattern.occurrences < MIN_OCCURRENCES_FOR_PREDICTION) continue;

      const overlap = computeSymptomOverlap(currentSymptoms, pattern.symptoms);
      if (overlap < 0.5) continue;

      const confidence = pattern.confidence * overlap * CONFIDENCE_DECAY_RATE;
      const maxSeverity = findings.reduce(
        (max, f) => Math.max(max, SEVERITY_WEIGHTS[f.severity] || 0), 0
      );

      predictions.push({
        subsystem,
        predictedFailureType: pattern.symptoms.join(' → '),
        confidence: Math.round(confidence * 100) / 100,
        estimatedTimeToFailure: Math.round(pattern.avgLeadTime * (1 - overlap)),
        matchedPatternId: pattern.id,
        recommendedAction: selectRecommendation(maxSeverity, confidence),
        severity: maxSeverity >= 0.7 ? 'critical' : maxSeverity >= 0.4 ? 'high' : maxSeverity >= 0.2 ? 'medium' : 'low',
      });
    }
  }

  return predictions.sort((a, b) => b.confidence - a.confidence);
}

function computeSymptomOverlap(current: string[], pattern: string[]): number {
  if (pattern.length === 0) return 0;
  const patternSet = new Set(pattern);
  const matches = current.filter(s => patternSet.has(s)).length;
  return matches / pattern.length;
}

function selectRecommendation(severity: number, confidence: number): string {
  if (severity >= 0.7 && confidence >= 0.7) return 'IMMEDIATE_REPAIR';
  if (severity >= 0.4 && confidence >= 0.5) return 'SCHEDULE_REPAIR';
  if (confidence >= 0.3) return 'MONITOR_CLOSELY';
  return 'LOG_AND_OBSERVE';
}

export function getPatterns(): FailurePattern[] {
  return [...patterns.values()];
}

export function getPatternCount(): number {
  return patterns.size;
}

export function decayAllConfidence(): void {
  for (const p of patterns.values()) {
    p.confidence *= CONFIDENCE_DECAY_RATE;
    if (p.confidence < 0.05) {
      patterns.delete(p.id);
    }
  }
}

export function clearPredictiveState(): void {
  patterns.clear();
  findingHistory.length = 0;
  activeWindows.clear();
}
