/**
 * SOVEREIGN Ultimate — Data Classification Automator
 * Pattern-based auto-classification with confidence scoring and inheritance.
 * v9.0.0 "Crown Prime"
 */

// ─── Types ────────────────────────────────────────────────────────

export type ClassificationLevel = 'public' | 'internal' | 'confidential' | 'restricted' | 'top_secret';

export interface ClassificationResult {
  id: string;
  dataId: string;
  level: ClassificationLevel;
  confidence: number;            // 0–100
  patternMatches: number;
  contextSignals: number;
  metadataHints: number;
  autoClassified: boolean;
  parentClassification: ClassificationLevel | null;
  overridden: boolean;
  classifiedAt: string;
  triggers: string[];            // Which patterns matched
}

export interface ClassificationPattern {
  id: string;
  name: string;
  category: 'pii' | 'phi' | 'financial' | 'credentials' | 'legal' | 'general';
  regex: RegExp;
  level: ClassificationLevel;
  weight: number;                // 0–1
}

// ─── Default Patterns ─────────────────────────────────────────────

const DEFAULT_PATTERNS: ClassificationPattern[] = [
  // PII
  { id: 'pat_ssn', name: 'SSN Pattern', category: 'pii', regex: /\b\d{3}-\d{2}-\d{4}\b/, level: 'restricted', weight: 0.95 },
  { id: 'pat_email', name: 'Email Address', category: 'pii', regex: /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/, level: 'confidential', weight: 0.7 },
  { id: 'pat_phone', name: 'Phone Number', category: 'pii', regex: /\b\+?\d{1,3}[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/, level: 'confidential', weight: 0.65 },
  { id: 'pat_dob', name: 'Date of Birth', category: 'pii', regex: /\b(date.?of.?birth|dob|born.?on)\b/i, level: 'confidential', weight: 0.75 },
  // PHI
  { id: 'pat_mrn', name: 'Medical Record Number', category: 'phi', regex: /\b(MRN|medical.?record)\s*#?\s*\d+/i, level: 'restricted', weight: 0.9 },
  { id: 'pat_diagnosis', name: 'Diagnosis Code', category: 'phi', regex: /\b[A-Z]\d{2}(\.\d{1,4})?\b/, level: 'restricted', weight: 0.6 },
  // Financial
  { id: 'pat_cc', name: 'Credit Card', category: 'financial', regex: /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/, level: 'restricted', weight: 0.95 },
  { id: 'pat_iban', name: 'IBAN', category: 'financial', regex: /\b[A-Z]{2}\d{2}[A-Z0-9]{4,30}\b/, level: 'confidential', weight: 0.8 },
  // Credentials
  { id: 'pat_apikey', name: 'API Key Pattern', category: 'credentials', regex: /\b(api[_-]?key|secret[_-]?key|access[_-]?token)\s*[:=]\s*\S+/i, level: 'top_secret', weight: 0.98 },
  { id: 'pat_password', name: 'Password Field', category: 'credentials', regex: /\b(password|passwd|pwd)\s*[:=]\s*\S+/i, level: 'top_secret', weight: 0.98 },
  // Legal
  { id: 'pat_nda', name: 'NDA Reference', category: 'legal', regex: /\b(non.?disclosure|NDA|confidential.?agreement)\b/i, level: 'confidential', weight: 0.7 },
];

// ─── Storage ──────────────────────────────────────────────────────

const classificationLog: ClassificationResult[] = [];
const customPatterns: ClassificationPattern[] = [];
const MAX_LOG = 5000;

const LEVEL_HIERARCHY: Record<ClassificationLevel, number> = {
  public: 0, internal: 1, confidential: 2, restricted: 3, top_secret: 4,
};

// ─── Classification ───────────────────────────────────────────────

/**
 * Auto-classify data content.
 * confidence = (pattern_matches × 0.5) + (context_signals × 0.3) + (metadata_hints × 0.2)
 */
export function autoClassify(
  dataId: string,
  content: string,
  contextSignals: number = 50,
  metadataHints: number = 50,
  parentClassification?: ClassificationLevel
): ClassificationResult {
  const allPatterns = [...DEFAULT_PATTERNS, ...customPatterns];
  const matches: { pattern: ClassificationPattern; matched: boolean }[] = [];

  for (const pattern of allPatterns) {
    matches.push({ pattern, matched: pattern.regex.test(content) });
  }

  const triggered = matches.filter(m => m.matched);
  const triggers = triggered.map(m => m.pattern.name);

  // Determine level from highest-severity match
  let detectedLevel: ClassificationLevel = 'public';
  for (const t of triggered) {
    if (LEVEL_HIERARCHY[t.pattern.level] > LEVEL_HIERARCHY[detectedLevel]) {
      detectedLevel = t.pattern.level;
    }
  }

  // Classification inheritance: child inherits parent if parent is higher
  if (parentClassification && LEVEL_HIERARCHY[parentClassification] > LEVEL_HIERARCHY[detectedLevel]) {
    detectedLevel = parentClassification;
  }

  // Confidence scoring
  const patternScore = triggered.length > 0
    ? Math.min(100, triggered.reduce((sum, t) => sum + t.pattern.weight * 100, 0) / triggered.length)
    : 0;
  const confidence = Math.round(patternScore * 0.5 + contextSignals * 0.3 + metadataHints * 0.2);

  const result: ClassificationResult = {
    id: `cls_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    dataId,
    level: detectedLevel,
    confidence,
    patternMatches: triggered.length,
    contextSignals,
    metadataHints,
    autoClassified: true,
    parentClassification: parentClassification || null,
    overridden: false,
    classifiedAt: new Date().toISOString(),
    triggers,
  };

  classificationLog.push(result);
  if (classificationLog.length > MAX_LOG) classificationLog.splice(0, classificationLog.length - MAX_LOG);
  return result;
}

export function addClassificationPattern(pattern: Omit<ClassificationPattern, 'id'>): ClassificationPattern {
  const full = { ...pattern, id: `cpat_${Date.now()}` };
  customPatterns.push(full);
  return full;
}

// ─── Queries ──────────────────────────────────────────────────────

export function getClassificationLog(): ClassificationResult[] { return [...classificationLog]; }
export function getPatterns(): ClassificationPattern[] { return [...DEFAULT_PATTERNS, ...customPatterns]; }
export function getClassificationHealth(): number {
  if (classificationLog.length === 0) return 100;
  const avgConfidence = classificationLog.reduce((s, c) => s + c.confidence, 0) / classificationLog.length;
  return Math.round(avgConfidence);
}
