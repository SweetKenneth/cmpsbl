/**
 * DECODE Module — Hardening Layer ("Cipher")
 * 25 enterprise-grade intent parsing, identity, and routing safety features.
 * Non-breaking additive layer — all existing DECODE internals remain frozen.
 *
 * © 2025–2026 CMPSBL®. All rights reserved.
 */

// ═══════════════════════════════════════════════════════════════════════════════
// VERSION
// ═══════════════════════════════════════════════════════════════════════════════

export const DECODE_HARDENING_VERSION = '2.0.0';
export const DECODE_HARDENING_CODENAME = 'Cipher';

// ═══════════════════════════════════════════════════════════════════════════════
// SHARED HASH UTILITY
// ═══════════════════════════════════════════════════════════════════════════════

function fnv1a(str: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = (h * 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}

// ═══════════════════════════════════════════════════════════════════════════════
// 1. INPUT SANITIZATION PIPELINE — multi-stage input cleansing
// ═══════════════════════════════════════════════════════════════════════════════

export interface SanitizationResult {
  original: string;
  sanitized: string;
  flags: string[];
  blocked: boolean;
}

const INJECTION_PATTERNS = [
  { name: 'prompt_injection', pattern: /ignore\s+(all\s+)?previous\s+instructions/i },
  { name: 'system_override', pattern: /you\s+are\s+now\s+(a|an)\s+/i },
  { name: 'role_hijack', pattern: /\[system\]|\[admin\]|<\|im_start\|>/i },
  { name: 'jailbreak_attempt', pattern: /DAN\s+mode|developer\s+mode|bypass\s+(safety|filter)/i },
  { name: 'encoding_attack', pattern: /&#x[0-9a-f]{2,};|%[0-9a-f]{2}/i },
  { name: 'script_injection', pattern: /<script|javascript:|on(click|load|error)\s*=/i },
];

export function sanitizeInput(input: string): SanitizationResult {
  const flags: string[] = [];
  let sanitized = input;
  let blocked = false;

  // Length guard
  if (input.length > 10_000) {
    sanitized = input.slice(0, 10_000);
    flags.push('truncated');
  }

  // Injection pattern detection
  for (const { name, pattern } of INJECTION_PATTERNS) {
    if (pattern.test(sanitized)) {
      flags.push(name);
      blocked = true;
    }
  }

  // Strip control characters (keep newlines/tabs)
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // Normalize whitespace
  sanitized = sanitized.replace(/\s{10,}/g, '  ');

  return { original: input, sanitized, flags, blocked };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 2. INTENT CONFIDENCE THRESHOLD — minimum confidence to act on intents
// ═══════════════════════════════════════════════════════════════════════════════

export interface ConfidencePolicy {
  minConfidenceToExecute: number;
  minConfidenceToRoute: number;
  minConfidenceToSuggest: number;
  escalateBelow: number;
}

const CONFIDENCE_POLICY: ConfidencePolicy = {
  minConfidenceToExecute: 0.75,
  minConfidenceToRoute: 0.50,
  minConfidenceToSuggest: 0.30,
  escalateBelow: 0.30,
};

export function evaluateConfidence(confidence: number): { action: 'execute' | 'route' | 'suggest' | 'escalate'; threshold: number } {
  if (confidence >= CONFIDENCE_POLICY.minConfidenceToExecute) return { action: 'execute', threshold: CONFIDENCE_POLICY.minConfidenceToExecute };
  if (confidence >= CONFIDENCE_POLICY.minConfidenceToRoute) return { action: 'route', threshold: CONFIDENCE_POLICY.minConfidenceToRoute };
  if (confidence >= CONFIDENCE_POLICY.minConfidenceToSuggest) return { action: 'suggest', threshold: CONFIDENCE_POLICY.minConfidenceToSuggest };
  return { action: 'escalate', threshold: CONFIDENCE_POLICY.escalateBelow };
}

export function getConfidencePolicy(): ConfidencePolicy {
  return { ...CONFIDENCE_POLICY };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 3. INTENT DISAMBIGUATION — resolve ambiguous intents
// ═══════════════════════════════════════════════════════════════════════════════

export interface DisambiguationResult {
  ambiguous: boolean;
  candidates: Array<{ intent: string; confidence: number }>;
  clarificationNeeded: boolean;
  suggestedQuestion?: string;
}

export function disambiguateIntent(
  candidates: Array<{ intent: string; confidence: number }>,
  threshold = 0.15
): DisambiguationResult {
  if (candidates.length <= 1) return { ambiguous: false, candidates, clarificationNeeded: false };

  const sorted = [...candidates].sort((a, b) => b.confidence - a.confidence);
  const gap = sorted[0].confidence - sorted[1].confidence;
  const ambiguous = gap < threshold;

  return {
    ambiguous,
    candidates: sorted,
    clarificationNeeded: ambiguous,
    suggestedQuestion: ambiguous
      ? `Did you mean "${sorted[0].intent}" or "${sorted[1].intent}"?`
      : undefined,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 4. SESSION CONTINUITY TRACKER — detect context drift across turns
// ═══════════════════════════════════════════════════════════════════════════════

export interface SessionContinuity {
  sessionId: string;
  turnCount: number;
  topicHistory: string[];
  currentTopic: string | null;
  driftDetected: boolean;
  driftScore: number;
  lastActivityAt: string;
}

const sessions = new Map<string, SessionContinuity>();
const MAX_SESSIONS = 500;

export function trackSessionTurn(sessionId: string, topic: string): SessionContinuity {
  let session = sessions.get(sessionId);
  if (!session) {
    // Evict oldest session if at capacity
    if (sessions.size >= MAX_SESSIONS) {
      const oldestKey = sessions.keys().next().value;
      if (oldestKey) sessions.delete(oldestKey);
    }
    session = {
      sessionId,
      turnCount: 0,
      topicHistory: [],
      currentTopic: null,
      driftDetected: false,
      driftScore: 0,
      lastActivityAt: new Date().toISOString(),
    };
    sessions.set(sessionId, session);
  }

  session.turnCount++;
  const previousTopic = session.currentTopic;
  session.currentTopic = topic;
  session.topicHistory.push(topic);
  if (session.topicHistory.length > 50) session.topicHistory.splice(0, 1);

  // Simple drift detection — topic changes without transition
  if (previousTopic && previousTopic !== topic) {
    session.driftScore = Math.min(1, session.driftScore + 0.2);
  } else {
    session.driftScore = Math.max(0, session.driftScore - 0.1);
  }
  session.driftDetected = session.driftScore > 0.5;
  session.lastActivityAt = new Date().toISOString();

  return { ...session, topicHistory: [...session.topicHistory] };
}

export function getSessionContinuity(sessionId: string): SessionContinuity | null {
  const s = sessions.get(sessionId);
  return s ? { ...s, topicHistory: [...s.topicHistory] } : null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 5. PERSONALITY STABILITY GUARD — prevent rapid personality oscillation
// ═══════════════════════════════════════════════════════════════════════════════

interface PersonalitySwitchRecord {
  from: string;
  to: string;
  timestamp: number;
}

const personalitySwitches: PersonalitySwitchRecord[] = [];
const PERSONALITY_COOLDOWN_MS = 30_000;
const MAX_SWITCHES_PER_MINUTE = 3;

export function checkPersonalityStability(from: string, to: string): { allowed: boolean; reason?: string } {
  const now = Date.now();
  const recentSwitches = personalitySwitches.filter(s => now - s.timestamp < 60_000);
  if (recentSwitches.length >= MAX_SWITCHES_PER_MINUTE) {
    return { allowed: false, reason: `Rate limit: ${MAX_SWITCHES_PER_MINUTE} switches/minute exceeded` };
  }
  const lastSwitch = personalitySwitches[personalitySwitches.length - 1];
  if (lastSwitch && now - lastSwitch.timestamp < PERSONALITY_COOLDOWN_MS) {
    return { allowed: false, reason: `Cooldown: ${Math.round((PERSONALITY_COOLDOWN_MS - (now - lastSwitch.timestamp)) / 1000)}s remaining` };
  }
  return { allowed: true };
}

export function recordPersonalitySwitch(from: string, to: string): void {
  personalitySwitches.push({ from, to, timestamp: Date.now() });
  if (personalitySwitches.length > 100) personalitySwitches.splice(0, personalitySwitches.length - 100);
}

// ═══════════════════════════════════════════════════════════════════════════════
// 6. ROUTING AUDIT CHAIN — tamper-evident log of all intent routing decisions
// ═══════════════════════════════════════════════════════════════════════════════

export interface RoutingAuditEntry {
  entryId: string;
  intent: string;
  routedTo: string;
  confidence: number;
  hash: string;
  previousHash: string;
  timestamp: string;
}

const routingAuditChain: RoutingAuditEntry[] = [];

export function recordRoutingDecision(intent: string, routedTo: string, confidence: number): RoutingAuditEntry {
  const previousHash = routingAuditChain.length > 0
    ? routingAuditChain[routingAuditChain.length - 1].hash
    : '00000000';
  const entry: RoutingAuditEntry = {
    entryId: `rt-${Date.now()}-${routingAuditChain.length}`,
    intent: intent.slice(0, 200),
    routedTo,
    confidence,
    hash: fnv1a(`${previousHash}:${intent}:${routedTo}:${confidence}`),
    previousHash,
    timestamp: new Date().toISOString(),
  };
  routingAuditChain.push(entry);
  if (routingAuditChain.length > 2000) routingAuditChain.splice(0, routingAuditChain.length - 2000);
  return entry;
}

export function verifyRoutingChain(): { valid: boolean; brokenAt?: number } {
  for (let i = 1; i < routingAuditChain.length; i++) {
    if (routingAuditChain[i].previousHash !== routingAuditChain[i - 1].hash) {
      return { valid: false, brokenAt: i };
    }
  }
  return { valid: true };
}

export function getRoutingAuditChain(limit?: number): RoutingAuditEntry[] {
  if (limit) return routingAuditChain.slice(-limit);
  return [...routingAuditChain];
}

// ═══════════════════════════════════════════════════════════════════════════════
// 7. INTENT RATE LIMITER — prevent intent flooding
// ═══════════════════════════════════════════════════════════════════════════════

const intentTimestamps: number[] = [];
const INTENT_RATE_WINDOW_MS = 60_000;
const INTENT_RATE_MAX = 60;

export function checkIntentRateLimit(): { allowed: boolean; currentRate: number; maxRate: number } {
  const now = Date.now();
  while (intentTimestamps.length > 0 && now - intentTimestamps[0] > INTENT_RATE_WINDOW_MS) {
    intentTimestamps.shift();
  }
  if (intentTimestamps.length >= INTENT_RATE_MAX) {
    return { allowed: false, currentRate: intentTimestamps.length, maxRate: INTENT_RATE_MAX };
  }
  intentTimestamps.push(now);
  return { allowed: true, currentRate: intentTimestamps.length, maxRate: INTENT_RATE_MAX };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 8. CONTEXT WINDOW BUDGET — track token/context usage per session
// ═══════════════════════════════════════════════════════════════════════════════

export interface ContextBudget {
  maxTokens: number;
  usedTokens: number;
  remainingTokens: number;
  utilizationPercent: number;
  warningThreshold: number;
}

const contextBudgets = new Map<string, { maxTokens: number; usedTokens: number }>();

export function initContextBudget(sessionId: string, maxTokens = 128_000): void {
  contextBudgets.set(sessionId, { maxTokens, usedTokens: 0 });
}

export function consumeContextBudget(sessionId: string, tokens: number): ContextBudget {
  let budget = contextBudgets.get(sessionId);
  if (!budget) {
    budget = { maxTokens: 128_000, usedTokens: 0 };
    contextBudgets.set(sessionId, budget);
  }
  budget.usedTokens += tokens;
  const remaining = Math.max(0, budget.maxTokens - budget.usedTokens);
  return {
    maxTokens: budget.maxTokens,
    usedTokens: budget.usedTokens,
    remainingTokens: remaining,
    utilizationPercent: Math.round((budget.usedTokens / budget.maxTokens) * 100),
    warningThreshold: 80,
  };
}

export function getContextBudget(sessionId: string): ContextBudget | null {
  const budget = contextBudgets.get(sessionId);
  if (!budget) return null;
  const remaining = Math.max(0, budget.maxTokens - budget.usedTokens);
  return {
    maxTokens: budget.maxTokens,
    usedTokens: budget.usedTokens,
    remainingTokens: remaining,
    utilizationPercent: Math.round((budget.usedTokens / budget.maxTokens) * 100),
    warningThreshold: 80,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 9. IDENTITY TRUST LADDER — progressive trust escalation
// ═══════════════════════════════════════════════════════════════════════════════

export type TrustLevel = 'anonymous' | 'recognized' | 'authenticated' | 'verified' | 'trusted';

export interface TrustAssessment {
  level: TrustLevel;
  score: number; // 0-100
  factors: string[];
  permissionsGranted: string[];
}

const TRUST_PERMISSIONS: Record<TrustLevel, string[]> = {
  anonymous: ['read_public'],
  recognized: ['read_public', 'submit_intent'],
  authenticated: ['read_public', 'submit_intent', 'execute_safe', 'view_history'],
  verified: ['read_public', 'submit_intent', 'execute_safe', 'execute_destructive', 'view_history', 'manage_profile'],
  trusted: ['read_public', 'submit_intent', 'execute_safe', 'execute_destructive', 'view_history', 'manage_profile', 'admin_access'],
};

export function assessTrust(factors: {
  hasIdentity: boolean;
  isAuthenticated: boolean;
  deviceTrustScore: number;
  authCount: number;
  accountAgeDays: number;
}): TrustAssessment {
  let score = 0;
  const trustFactors: string[] = [];

  if (factors.hasIdentity) { score += 20; trustFactors.push('identity_present'); }
  if (factors.isAuthenticated) { score += 25; trustFactors.push('authenticated'); }
  if (factors.deviceTrustScore > 70) { score += 15; trustFactors.push('high_device_trust'); }
  if (factors.authCount > 5) { score += 10; trustFactors.push('repeat_user'); }
  if (factors.authCount > 20) { score += 10; trustFactors.push('established_user'); }
  if (factors.accountAgeDays > 7) { score += 10; trustFactors.push('aged_account'); }
  if (factors.accountAgeDays > 30) { score += 10; trustFactors.push('mature_account'); }

  const level: TrustLevel = score >= 85 ? 'trusted' : score >= 65 ? 'verified' : score >= 45 ? 'authenticated' : score >= 20 ? 'recognized' : 'anonymous';

  return {
    level,
    score: Math.min(100, score),
    factors: trustFactors,
    permissionsGranted: TRUST_PERMISSIONS[level],
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 10. LANGUAGE DETECTION — detect input language for i18n routing
// ═══════════════════════════════════════════════════════════════════════════════

export interface LanguageDetection {
  language: string;
  confidence: number;
  script: 'latin' | 'cjk' | 'cyrillic' | 'arabic' | 'other';
}

const LANGUAGE_PATTERNS: Array<{ lang: string; pattern: RegExp; script: LanguageDetection['script'] }> = [
  { lang: 'zh', pattern: /[\u4e00-\u9fff]/, script: 'cjk' },
  { lang: 'ja', pattern: /[\u3040-\u309f\u30a0-\u30ff]/, script: 'cjk' },
  { lang: 'ko', pattern: /[\uac00-\ud7af]/, script: 'cjk' },
  { lang: 'ru', pattern: /[\u0400-\u04ff]/, script: 'cyrillic' },
  { lang: 'ar', pattern: /[\u0600-\u06ff]/, script: 'arabic' },
  { lang: 'es', pattern: /\b(el|la|los|las|de|en|que|por|una|con|para)\b/i, script: 'latin' },
  { lang: 'fr', pattern: /\b(le|la|les|de|des|un|une|est|dans|pour|avec)\b/i, script: 'latin' },
  { lang: 'de', pattern: /\b(der|die|das|und|ist|ein|eine|mit|für|auf)\b/i, script: 'latin' },
  { lang: 'pt', pattern: /\b(o|a|os|as|de|em|um|uma|para|com)\b/i, script: 'latin' },
];

export function detectLanguage(text: string): LanguageDetection {
  for (const { lang, pattern, script } of LANGUAGE_PATTERNS) {
    const matches = text.match(new RegExp(pattern.source, 'g'));
    if (matches && matches.length >= 2) {
      return { language: lang, confidence: Math.min(0.95, 0.5 + matches.length * 0.05), script };
    }
  }
  return { language: 'en', confidence: 0.8, script: 'latin' };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 11. DECODE CIRCUIT BREAKER — halt parsing under sustained failures
// ═══════════════════════════════════════════════════════════════════════════════

interface DecodeCircuitState {
  state: 'closed' | 'open' | 'half_open';
  failureCount: number;
  lastFailureAt: number;
  openedAt: number | null;
  cooldownMs: number;
  failureThreshold: number;
}

const decodeCircuit: DecodeCircuitState = {
  state: 'closed',
  failureCount: 0,
  lastFailureAt: 0,
  openedAt: null,
  cooldownMs: 30_000,
  failureThreshold: 10,
};

export function recordDecodeFailure(): DecodeCircuitState {
  decodeCircuit.failureCount++;
  decodeCircuit.lastFailureAt = Date.now();
  if (decodeCircuit.failureCount >= decodeCircuit.failureThreshold) {
    decodeCircuit.state = 'open';
    decodeCircuit.openedAt = Date.now();
  }
  return { ...decodeCircuit };
}

export function recordDecodeSuccess(): void {
  if (decodeCircuit.state === 'half_open') {
    decodeCircuit.state = 'closed';
    decodeCircuit.failureCount = 0;
  }
}

export function checkDecodeCircuit(): { allowed: boolean; state: DecodeCircuitState['state'] } {
  if (decodeCircuit.state === 'closed') return { allowed: true, state: 'closed' };
  if (decodeCircuit.state === 'open' && decodeCircuit.openedAt) {
    if (Date.now() - decodeCircuit.openedAt > decodeCircuit.cooldownMs) {
      decodeCircuit.state = 'half_open';
      return { allowed: true, state: 'half_open' };
    }
    return { allowed: false, state: 'open' };
  }
  return { allowed: true, state: decodeCircuit.state };
}

export function getDecodeCircuitState(): DecodeCircuitState {
  return { ...decodeCircuit };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 12. INTENT FINGERPRINTING — dedup repeated identical intents
// ═══════════════════════════════════════════════════════════════════════════════

const intentFingerprints = new Map<string, { count: number; lastSeenAt: string; firstSeenAt: string }>();

export function fingerprintIntent(intent: string): { fingerprint: string; isDuplicate: boolean; occurrences: number } {
  const fp = fnv1a(intent.trim().toLowerCase());
  const existing = intentFingerprints.get(fp);
  if (existing) {
    existing.count++;
    existing.lastSeenAt = new Date().toISOString();
    return { fingerprint: fp, isDuplicate: true, occurrences: existing.count };
  }
  intentFingerprints.set(fp, { count: 1, lastSeenAt: new Date().toISOString(), firstSeenAt: new Date().toISOString() });
  if (intentFingerprints.size > 5000) {
    const oldest = intentFingerprints.keys().next().value;
    if (oldest) intentFingerprints.delete(oldest);
  }
  return { fingerprint: fp, isDuplicate: false, occurrences: 1 };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 13. DECODE TELEMETRY — interpretation performance metrics
// ═══════════════════════════════════════════════════════════════════════════════

interface DecodeTelemetry {
  totalInterpretations: number;
  totalRoutingDecisions: number;
  avgConfidence: number;
  avgProcessingMs: number;
  escalationCount: number;
  disambiguationCount: number;
  blockedInputCount: number;
  processingTimes: number[];
  confidenceHistory: number[];
}

const telemetry: DecodeTelemetry = {
  totalInterpretations: 0,
  totalRoutingDecisions: 0,
  avgConfidence: 0,
  avgProcessingMs: 0,
  escalationCount: 0,
  disambiguationCount: 0,
  blockedInputCount: 0,
  processingTimes: [],
  confidenceHistory: [],
};

export function recordInterpretationMetrics(processingMs: number, confidence: number, escalated: boolean, disambiguated: boolean): void {
  telemetry.totalInterpretations++;
  telemetry.processingTimes.push(processingMs);
  telemetry.confidenceHistory.push(confidence);
  if (escalated) telemetry.escalationCount++;
  if (disambiguated) telemetry.disambiguationCount++;
  if (telemetry.processingTimes.length > 200) telemetry.processingTimes.splice(0, 1);
  if (telemetry.confidenceHistory.length > 200) telemetry.confidenceHistory.splice(0, 1);
  telemetry.avgProcessingMs = Math.round(telemetry.processingTimes.reduce((s, t) => s + t, 0) / telemetry.processingTimes.length);
  telemetry.avgConfidence = Math.round((telemetry.confidenceHistory.reduce((s, c) => s + c, 0) / telemetry.confidenceHistory.length) * 100) / 100;
}

export function recordBlockedInput(): void {
  telemetry.blockedInputCount++;
}

export function getDecodeTelemetry(): Omit<DecodeTelemetry, 'processingTimes' | 'confidenceHistory'> {
  return {
    totalInterpretations: telemetry.totalInterpretations,
    totalRoutingDecisions: telemetry.totalRoutingDecisions,
    avgConfidence: telemetry.avgConfidence,
    avgProcessingMs: telemetry.avgProcessingMs,
    escalationCount: telemetry.escalationCount,
    disambiguationCount: telemetry.disambiguationCount,
    blockedInputCount: telemetry.blockedInputCount,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 14. SENSITIVE DATA REDACTOR — strip PII before routing
// ═══════════════════════════════════════════════════════════════════════════════

const REDACTION_PATTERNS: Array<{ name: string; pattern: RegExp; replacement: string }> = [
  { name: 'email', pattern: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, replacement: '[EMAIL_REDACTED]' },
  { name: 'phone', pattern: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, replacement: '[PHONE_REDACTED]' },
  { name: 'ssn', pattern: /\b\d{3}-\d{2}-\d{4}\b/g, replacement: '[SSN_REDACTED]' },
  { name: 'credit_card', pattern: /\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/g, replacement: '[CC_REDACTED]' },
  { name: 'api_key', pattern: /\b(sk|pk|api)[_-][a-zA-Z0-9]{20,}\b/g, replacement: '[KEY_REDACTED]' },
  { name: 'jwt', pattern: /eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/g, replacement: '[JWT_REDACTED]' },
];

export function redactSensitiveData(text: string): { redacted: string; redactionsApplied: string[] } {
  let result = text;
  const applied: string[] = [];
  for (const { name, pattern, replacement } of REDACTION_PATTERNS) {
    // Use replace directly — avoid .test() + .replace() on /g regex (stateful lastIndex)
    const replaced = result.replace(pattern, replacement);
    if (replaced !== result) {
      applied.push(name);
      result = replaced;
    }
  }
  return { redacted: result, redactionsApplied: applied };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 15. INTENT TAXONOMY CLASSIFIER — hierarchical intent categories
// ═══════════════════════════════════════════════════════════════════════════════

export type IntentCategory = 'query' | 'command' | 'navigation' | 'configuration' | 'diagnostic' | 'creative' | 'conversational';

const INTENT_TAXONOMY: Record<IntentCategory, RegExp[]> = {
  query: [/\b(what|how|why|when|where|who|which|show|display|list|get|find|search)\b/i],
  command: [/\b(create|delete|update|set|add|remove|enable|disable|run|execute|deploy)\b/i],
  navigation: [/\b(go\s+to|navigate|open|visit|switch\s+to|show\s+me)\b/i],
  configuration: [/\b(config|setting|preference|option|toggle|theme|mode)\b/i],
  diagnostic: [/\b(status|health|debug|log|error|metric|diagnos|inspect|check)\b/i],
  creative: [/\b(design|build|make|generate|write|compose|draft|brainstorm)\b/i],
  conversational: [/\b(hello|hi|hey|thanks|bye|help|explain|tell\s+me)\b/i],
};

export function classifyIntent(text: string): { category: IntentCategory; confidence: number; secondaryCategory?: IntentCategory } {
  const scores: Record<IntentCategory, number> = { query: 0, command: 0, navigation: 0, configuration: 0, diagnostic: 0, creative: 0, conversational: 0 };
  for (const [cat, patterns] of Object.entries(INTENT_TAXONOMY) as Array<[IntentCategory, RegExp[]]>) {
    for (const p of patterns) {
      const matches = text.match(new RegExp(p.source, 'gi'));
      if (matches) scores[cat] += matches.length * 0.2;
    }
  }
  const sorted = Object.entries(scores).sort(([, a], [, b]) => b - a) as Array<[IntentCategory, number]>;
  return {
    category: sorted[0][0],
    confidence: Math.min(1, sorted[0][1] + 0.3),
    secondaryCategory: sorted[1][1] > 0.1 ? sorted[1][0] : undefined,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 16. DECODE REQUEST COALESCER — dedup in-flight identical requests
// ═══════════════════════════════════════════════════════════════════════════════

const inflightRequests = new Map<string, { resolvedAt?: string; count: number }>();

export function coalesceRequest(fingerprint: string): { coalesced: boolean; inflightCount: number } {
  const existing = inflightRequests.get(fingerprint);
  if (existing && !existing.resolvedAt) {
    existing.count++;
    return { coalesced: true, inflightCount: existing.count };
  }
  inflightRequests.set(fingerprint, { count: 1 });
  if (inflightRequests.size > 1000) {
    const oldest = inflightRequests.keys().next().value;
    if (oldest) inflightRequests.delete(oldest);
  }
  return { coalesced: false, inflightCount: 1 };
}

export function resolveCoalescedRequest(fingerprint: string): void {
  const entry = inflightRequests.get(fingerprint);
  if (entry) entry.resolvedAt = new Date().toISOString();
}

// ═══════════════════════════════════════════════════════════════════════════════
// 17. ESCALATION POLICY ENGINE — structured escalation rules
// ═══════════════════════════════════════════════════════════════════════════════

export interface EscalationRule {
  id: string;
  condition: string;
  escalateTo: string;
  priority: number;
  requiresHumanApproval: boolean;
}

const ESCALATION_RULES: EscalationRule[] = [
  { id: 'low_confidence', condition: 'confidence < 0.30', escalateTo: 'human_review', priority: 80, requiresHumanApproval: true },
  { id: 'destructive_intent', condition: 'destructive_detected', escalateTo: 'governance', priority: 90, requiresHumanApproval: true },
  { id: 'injection_detected', condition: 'injection_flagged', escalateTo: 'defense', priority: 95, requiresHumanApproval: false },
  { id: 'context_exhausted', condition: 'context_budget > 90%', escalateTo: 'session_reset', priority: 70, requiresHumanApproval: false },
  { id: 'circuit_open', condition: 'decode_circuit_open', escalateTo: 'fallback_mode', priority: 85, requiresHumanApproval: false },
];

export function evaluateEscalation(conditions: string[]): EscalationRule[] {
  return ESCALATION_RULES
    .filter(rule => conditions.includes(rule.condition))
    .sort((a, b) => b.priority - a.priority);
}

export function getEscalationRules(): EscalationRule[] {
  return [...ESCALATION_RULES];
}

// ═══════════════════════════════════════════════════════════════════════════════
// 18. DECODE FEATURE FLAGS — gated feature control
// ═══════════════════════════════════════════════════════════════════════════════

const DECODE_FLAGS: Record<string, boolean> = {
  auto_personality_detection: true,
  pii_redaction: true,
  intent_disambiguation: true,
  language_detection: true,
  session_drift_detection: true,
  context_budget_enforcement: false,
  strict_injection_blocking: true,
};

export function isDecodeFeatureEnabled(flag: string): boolean {
  return DECODE_FLAGS[flag] ?? false;
}

export function getDecodeFeatureFlags(): Record<string, boolean> {
  return { ...DECODE_FLAGS };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 19. CONVERSATION REPLAY BUFFER — replayable conversation snapshots
// ═══════════════════════════════════════════════════════════════════════════════

export interface ConversationSnapshot {
  snapshotId: string;
  sessionId: string;
  turnCount: number;
  personality: string;
  topicSummary: string;
  timestamp: string;
}

const conversationSnapshots: ConversationSnapshot[] = [];

export function captureConversationSnapshot(sessionId: string, personality: string, topicSummary: string, turnCount: number): ConversationSnapshot {
  const snapshot: ConversationSnapshot = {
    snapshotId: `snap-${Date.now()}-${conversationSnapshots.length}`,
    sessionId,
    turnCount,
    personality,
    topicSummary,
    timestamp: new Date().toISOString(),
  };
  conversationSnapshots.push(snapshot);
  if (conversationSnapshots.length > 500) conversationSnapshots.splice(0, 1);
  return snapshot;
}

export function getConversationSnapshots(sessionId?: string): ConversationSnapshot[] {
  if (sessionId) return conversationSnapshots.filter(s => s.sessionId === sessionId);
  return [...conversationSnapshots];
}

// ═══════════════════════════════════════════════════════════════════════════════
// 20. TERMINOLOGY ENFORCEMENT — ensure brand terminology compliance
// ═══════════════════════════════════════════════════════════════════════════════

const TERMINOLOGY_CORRECTIONS: Array<{ incorrect: RegExp; correct: string }> = [
  { incorrect: /\bloveable\b/gi, correct: 'Clockless' },
  { incorrect: /\blovable\s+ai\b/gi, correct: 'Clockless' },
  { incorrect: /\bsupabase\s+dashboard\b/gi, correct: 'backend' },
  { incorrect: /\bedge\s+function\b/gi, correct: 'backend function' },
  { incorrect: /\bsupabase\s+auth\b/gi, correct: 'authentication system' },
];

export function enforceTerminology(text: string): { corrected: string; corrections: string[] } {
  let result = text;
  const corrections: string[] = [];
  for (const { incorrect, correct } of TERMINOLOGY_CORRECTIONS) {
    // Create fresh regex to avoid /g lastIndex statefulness across test→match→replace
    const fresh = new RegExp(incorrect.source, incorrect.flags);
    const match = result.match(fresh);
    if (match) {
      corrections.push(`"${match[0]}" → "${correct}"`);
      result = result.replace(new RegExp(incorrect.source, incorrect.flags), correct);
    }
  }
  return { corrected: result, corrections };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 21. MULTI-INTENT SPLITTER — detect and split compound intents
// ═══════════════════════════════════════════════════════════════════════════════

export interface SplitIntent {
  text: string;
  index: number;
}

export function splitCompoundIntent(input: string): { isSingle: boolean; intents: SplitIntent[] } {
  const separators = /\b(and\s+then|also|additionally|plus|then|after\s+that)\b/i;
  const listPattern = /^\s*\d+[\.)]\s+/gm;

  // Check for numbered list
  const listMatches = input.match(listPattern);
  if (listMatches && listMatches.length >= 2) {
    const parts = input.split(listPattern).filter(p => p.trim().length > 0);
    return {
      isSingle: false,
      intents: parts.map((text, index) => ({ text: text.trim(), index })),
    };
  }

  // Check for natural language separators
  if (separators.test(input)) {
    const parts = input.split(separators).filter(p => p.trim().length > 3 && !separators.test(p));
    if (parts.length >= 2) {
      return {
        isSingle: false,
        intents: parts.map((text, index) => ({ text: text.trim(), index })),
      };
    }
  }

  return { isSingle: true, intents: [{ text: input, index: 0 }] };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 22. DECODE WARMUP VALIDATOR — ensure DECODE is ready before accepting input
// ═══════════════════════════════════════════════════════════════════════════════

export interface DecodeReadiness {
  ready: boolean;
  checks: Array<{ name: string; passed: boolean }>;
  score: number;
}

export function checkDecodeReadiness(): DecodeReadiness {
  const checks = [
    { name: 'circuit_closed', passed: decodeCircuit.state !== 'open' },
    { name: 'rate_limit_ok', passed: intentTimestamps.length < INTENT_RATE_MAX * 0.9 },
    { name: 'features_loaded', passed: Object.keys(DECODE_FLAGS).length > 0 },
    { name: 'escalation_rules_loaded', passed: ESCALATION_RULES.length > 0 },
    { name: 'taxonomy_loaded', passed: Object.keys(INTENT_TAXONOMY).length > 0 },
  ];
  const passedCount = checks.filter(c => c.passed).length;
  return {
    ready: passedCount === checks.length,
    checks,
    score: Math.round((passedCount / checks.length) * 100),
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 23. INPUT COMPLEXITY ESTIMATOR — gauge processing effort required
// ═══════════════════════════════════════════════════════════════════════════════

export interface ComplexityEstimate {
  score: number; // 0-100
  tier: 'trivial' | 'simple' | 'moderate' | 'complex' | 'expert';
  factors: string[];
}

export function estimateInputComplexity(input: string): ComplexityEstimate {
  let score = 0;
  const factors: string[] = [];
  const words = input.split(/\s+/).length;

  if (words > 100) { score += 20; factors.push('long_input'); }
  else if (words > 50) { score += 10; factors.push('medium_input'); }

  const questionCount = (input.match(/\?/g) || []).length;
  if (questionCount > 2) { score += 15; factors.push('multi_question'); }

  const technicalTerms = (input.match(/\b(api|database|schema|rls|migration|deploy|auth|edge|webhook|pipeline)\b/gi) || []).length;
  if (technicalTerms > 3) { score += 20; factors.push('high_technicality'); }
  else if (technicalTerms > 0) { score += 10; factors.push('technical_content'); }

  const { isSingle } = splitCompoundIntent(input);
  if (!isSingle) { score += 15; factors.push('compound_intent'); }

  const codeBlocks = (input.match(/```/g) || []).length;
  if (codeBlocks >= 2) { score += 15; factors.push('contains_code'); }

  score = Math.min(100, score);
  const tier = score >= 80 ? 'expert' : score >= 60 ? 'complex' : score >= 40 ? 'moderate' : score >= 20 ? 'simple' : 'trivial';

  return { score, tier, factors };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 24. DECODE IDEMPOTENCY — prevent reprocessing identical turns
// ═══════════════════════════════════════════════════════════════════════════════

const processedTurns = new Map<string, { resultHash: string; processedAt: string }>();

export function checkTurnIdempotency(turnFingerprint: string): { isDuplicate: boolean; originalResultHash?: string } {
  const existing = processedTurns.get(turnFingerprint);
  if (existing) return { isDuplicate: true, originalResultHash: existing.resultHash };
  return { isDuplicate: false };
}

export function recordProcessedTurn(turnFingerprint: string, resultHash: string): void {
  processedTurns.set(turnFingerprint, { resultHash, processedAt: new Date().toISOString() });
  if (processedTurns.size > 5000) {
    const oldest = processedTurns.keys().next().value;
    if (oldest) processedTurns.delete(oldest);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 25. DECODE HEALTH COMPOSITE — A–F system grading
// ═══════════════════════════════════════════════════════════════════════════════

export interface DecodeHealthReport {
  score: number;
  grade: string;
  components: Record<string, number>;
  anomalies: string[];
  timestamp: string;
}

export function calculateDecodeHealth(): DecodeHealthReport {
  const anomalies: string[] = [];

  // Routing chain integrity (0-20)
  const chainResult = verifyRoutingChain();
  const chainScore = chainResult.valid ? 20 : 5;
  if (!chainResult.valid) anomalies.push(`Routing chain broken at index ${chainResult.brokenAt}`);

  // Circuit health (0-20)
  const circuitScore = decodeCircuit.state === 'closed' ? 20 : decodeCircuit.state === 'half_open' ? 12 : 3;
  if (decodeCircuit.state === 'open') anomalies.push('DECODE circuit breaker is OPEN');

  // Confidence quality (0-20)
  const calScore = telemetry.avgConfidence > 0.6 ? 20 : telemetry.avgConfidence > 0.4 ? 14 : 8;
  if (telemetry.avgConfidence < 0.4) anomalies.push(`Low average confidence: ${telemetry.avgConfidence}`);

  // Rate limit headroom (0-20)
  const rateUsage = intentTimestamps.length / INTENT_RATE_MAX;
  const rateScore = Math.round((1 - rateUsage) * 20);
  if (rateUsage > 0.8) anomalies.push('Intent rate approaching limit');

  // Blocked input ratio (0-20)
  const blockRatio = telemetry.totalInterpretations > 0
    ? telemetry.blockedInputCount / telemetry.totalInterpretations
    : 0;
  const blockScore = Math.round((1 - Math.min(1, blockRatio * 5)) * 20);
  if (blockRatio > 0.1) anomalies.push(`High block rate: ${Math.round(blockRatio * 100)}%`);

  const total = chainScore + circuitScore + calScore + rateScore + blockScore;
  const grade = total >= 85 ? 'A' : total >= 70 ? 'B' : total >= 55 ? 'C' : total >= 40 ? 'D' : 'F';

  return {
    score: total,
    grade,
    components: { chain: chainScore, circuit: circuitScore, confidence: calScore, rateLimit: rateScore, security: blockScore },
    anomalies,
    timestamp: new Date().toISOString(),
  };
}
