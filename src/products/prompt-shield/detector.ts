/**
 * PROMPT-SHIELD — Threat Detection Engine
 * Primitives: RAMPART (injection defense), WATCHTOWER (threat detection), BASTION (zero-trust)
 *
 * Multi-layer detection:
 *   Layer 1: Pattern-based signature matching (RAMPART)
 *   Layer 2: Behavioral anomaly detection (WATCHTOWER)
 *   Layer 3: Context boundary validation (BASTION zero-trust)
 */

import type {
  PromptInput,
  ConversationContext,
  DetectedThreat,
  ThreatCategory,
  ThreatSeverity,
  InjectionSignature,
} from './types';

// ── Injection Signatures (RAMPART) ─────────────────────────────────────

const INJECTION_SIGNATURES: InjectionSignature[] = [
  // Direct injection patterns
  { id: 'INJ-001', pattern: /ignore\s+(all\s+)?previous\s+(instructions|prompts?)/i, category: 'prompt_injection', severity: 'critical', description: 'Direct instruction override attempt', bypassResistance: 0.3, falsePositiveRate: 0.05 },
  { id: 'INJ-002', pattern: /you\s+are\s+now\s+(a|an|the)\s+/i, category: 'jailbreak_attempt', severity: 'high', description: 'Role reassignment jailbreak', bypassResistance: 0.4, falsePositiveRate: 0.08 },
  { id: 'INJ-003', pattern: /\bDAN\b.*\bmode\b|\bdo\s+anything\s+now\b/i, category: 'jailbreak_attempt', severity: 'critical', description: 'DAN-style jailbreak attempt', bypassResistance: 0.5, falsePositiveRate: 0.02 },
  { id: 'INJ-004', pattern: /system\s*:\s*|<\|system\|>|<\|im_start\|>/i, category: 'instruction_override', severity: 'critical', description: 'System prompt injection via role markers', bypassResistance: 0.6, falsePositiveRate: 0.03 },
  { id: 'INJ-005', pattern: /\[\s*INST\s*\]|\[\/INST\]|<<SYS>>|<\/s>/i, category: 'instruction_override', severity: 'high', description: 'Template injection via model-specific tokens', bypassResistance: 0.7, falsePositiveRate: 0.01 },

  // Encoding attacks
  { id: 'ENC-001', pattern: /&#x[0-9a-f]+;|&#\d+;/i, category: 'encoding_attack', severity: 'medium', description: 'HTML entity encoding bypass', bypassResistance: 0.5, falsePositiveRate: 0.15 },
  { id: 'ENC-002', pattern: /\\u[0-9a-f]{4}/i, category: 'encoding_attack', severity: 'medium', description: 'Unicode escape bypass', bypassResistance: 0.4, falsePositiveRate: 0.12 },
  { id: 'ENC-003', pattern: /base64|atob|btoa/i, category: 'encoding_attack', severity: 'low', description: 'Base64 encoding reference', bypassResistance: 0.3, falsePositiveRate: 0.20 },

  // Data exfiltration
  { id: 'EXF-001', pattern: /repeat\s+(the\s+)?(system\s+)?prompt|show\s+(me\s+)?(your\s+)?instructions/i, category: 'data_exfiltration', severity: 'high', description: 'System prompt extraction attempt', bypassResistance: 0.4, falsePositiveRate: 0.06 },
  { id: 'EXF-002', pattern: /what\s+(are|were)\s+(your|the)\s+(initial|original|first)\s+(instructions|prompt)/i, category: 'data_exfiltration', severity: 'high', description: 'Initial instruction extraction', bypassResistance: 0.3, falsePositiveRate: 0.08 },

  // Token smuggling
  { id: 'TOK-001', pattern: /[\u200b\u200c\u200d\u2060\ufeff]/g, category: 'token_smuggling', severity: 'medium', description: 'Zero-width character smuggling', bypassResistance: 0.8, falsePositiveRate: 0.01 },
  { id: 'TOK-002', pattern: /[\u0300-\u036f]{3,}/g, category: 'token_smuggling', severity: 'medium', description: 'Combining diacritical mark abuse', bypassResistance: 0.7, falsePositiveRate: 0.02 },

  // Social engineering
  { id: 'SOC-001', pattern: /pretend\s+(you|that|to)|act\s+as\s+if|hypothetically|for\s+(educational|research)\s+purposes/i, category: 'social_engineering', severity: 'medium', description: 'Social engineering framing', bypassResistance: 0.2, falsePositiveRate: 0.25 },
  { id: 'SOC-002', pattern: /in\s+(a\s+)?(fictional|imaginary|hypothetical)\s+(world|scenario|universe)/i, category: 'social_engineering', severity: 'medium', description: 'Fictional context bypass', bypassResistance: 0.2, falsePositiveRate: 0.20 },
];

// ── Layer 1: Pattern-Based Detection (RAMPART) ─────────────────────────

function detectPatternThreats(input: PromptInput): DetectedThreat[] {
  const threats: DetectedThreat[] = [];

  for (const sig of INJECTION_SIGNATURES) {
    const regex = typeof sig.pattern === 'string'
      ? new RegExp(sig.pattern, 'gi')
      : new RegExp(sig.pattern.source, sig.pattern.flags);

    let match: RegExpExecArray | null;
    while ((match = regex.exec(input.content)) !== null) {
      threats.push({
        id: `${sig.id}-${input.id}-${match.index}`,
        category: sig.category,
        severity: sig.severity,
        confidence: 1 - sig.falsePositiveRate,
        description: sig.description,
        evidence: match[0],
        startIndex: match.index,
        endIndex: match.index + match[0].length,
        detectorId: 'rampart-pattern',
      });

      // Prevent infinite loops on zero-length matches
      if (match[0].length === 0) break;
    }
  }

  return threats;
}

// ── Layer 2: Behavioral Anomaly Detection (WATCHTOWER) ─────────────────

interface BehavioralSignal {
  metric: string;
  value: number;
  threshold: number;
  severity: ThreatSeverity;
  category: ThreatCategory;
}

function detectBehavioralAnomalies(ctx: ConversationContext): DetectedThreat[] {
  const threats: DetectedThreat[] = [];
  const signals: BehavioralSignal[] = [];

  // Entropy analysis — high entropy in user messages may indicate encoded payloads
  for (const msg of ctx.messages) {
    if (msg.role !== 'user') continue;

    const entropy = computeShannonEntropy(msg.content);
    if (entropy > 5.5) {
      signals.push({
        metric: 'shannon_entropy',
        value: entropy,
        threshold: 5.5,
        severity: 'medium',
        category: 'encoding_attack',
      });
    }

    // Role boundary violations — user messages mimicking system format
    const roleBoundaryScore = scoreRoleBoundaryViolation(msg.content);
    if (roleBoundaryScore > 0.6) {
      signals.push({
        metric: 'role_boundary_violation',
        value: roleBoundaryScore,
        threshold: 0.6,
        severity: 'high',
        category: 'instruction_override',
      });
    }

    // Conversation trajectory shift — sudden topic pivot
    const pivotScore = detectTopicPivot(ctx.messages, msg);
    if (pivotScore > 0.7) {
      signals.push({
        metric: 'topic_pivot',
        value: pivotScore,
        threshold: 0.7,
        severity: 'medium',
        category: 'context_poisoning',
      });
    }
  }

  for (const signal of signals) {
    const lastUserMsg = [...ctx.messages].reverse().find(m => m.role === 'user');
    threats.push({
      id: `watchtower-${signal.metric}-${ctx.sessionId}`,
      category: signal.category,
      severity: signal.severity,
      confidence: Math.min(0.95, (signal.value - signal.threshold) / signal.threshold + 0.5),
      description: `Behavioral anomaly: ${signal.metric} = ${signal.value.toFixed(2)} (threshold: ${signal.threshold})`,
      evidence: `[Behavioral signal across conversation context]`,
      startIndex: 0,
      endIndex: lastUserMsg?.content.length ?? 0,
      detectorId: 'watchtower-behavioral',
    });
  }

  return threats;
}

function computeShannonEntropy(text: string): number {
  const freq = new Map<string, number>();
  for (const ch of text) {
    freq.set(ch, (freq.get(ch) ?? 0) + 1);
  }
  let entropy = 0;
  for (const count of freq.values()) {
    const p = count / text.length;
    if (p > 0) entropy -= p * Math.log2(p);
  }
  return entropy;
}

function scoreRoleBoundaryViolation(content: string): number {
  const markers = [
    /^system\s*:/im,
    /^assistant\s*:/im,
    /\binstruction\s*:/im,
    /<\|.*?\|>/,
    /\[SYSTEM\]/i,
  ];
  let score = 0;
  for (const m of markers) {
    if (m.test(content)) score += 0.25;
  }
  return Math.min(1, score);
}

function detectTopicPivot(messages: readonly PromptInput[], current: PromptInput): number {
  const prior = messages.filter(m => m.role === 'user' && m.id !== current.id);
  if (prior.length === 0) return 0;

  // Simple token overlap as pivot signal
  const priorTokens = new Set(
    prior.flatMap(m => m.content.toLowerCase().split(/\s+/).filter(t => t.length > 3))
  );
  const currentTokens = current.content.toLowerCase().split(/\s+/).filter(t => t.length > 3);

  if (currentTokens.length === 0) return 0;
  const overlap = currentTokens.filter(t => priorTokens.has(t)).length / currentTokens.length;
  return 1 - overlap; // Low overlap = high pivot
}

// ── Layer 3: Context Boundary Validation (BASTION) ─────────────────────

function validateContextBoundaries(ctx: ConversationContext): DetectedThreat[] {
  const threats: DetectedThreat[] = [];

  // Zero-trust: validate every message role claim
  for (const msg of ctx.messages) {
    // System messages after the first position are suspicious
    if (msg.role === 'system' && ctx.messages.indexOf(msg) > 0) {
      threats.push({
        id: `bastion-role-${msg.id}`,
        category: 'instruction_override',
        severity: 'critical',
        confidence: 0.92,
        description: 'System message injected after initial position — potential prompt injection',
        evidence: msg.content.slice(0, 100),
        startIndex: 0,
        endIndex: Math.min(100, msg.content.length),
        detectorId: 'bastion-boundary',
      });
    }

    // Tool messages without matching assistant tool_call are suspicious
    if (msg.role === 'tool') {
      const hasToolCall = ctx.messages.some(
        m => m.role === 'assistant' && m.content.includes('tool_call')
      );
      if (!hasToolCall) {
        threats.push({
          id: `bastion-tool-${msg.id}`,
          category: 'instruction_override',
          severity: 'high',
          confidence: 0.85,
          description: 'Tool response without preceding tool call — potential injection vector',
          evidence: msg.content.slice(0, 100),
          startIndex: 0,
          endIndex: Math.min(100, msg.content.length),
          detectorId: 'bastion-boundary',
        });
      }
    }
  }

  return threats;
}

// ── Public API ──────────────────────────────────────────────────────────

/**
 * Run all detection layers against a conversation context.
 * Returns deduplicated, severity-sorted threats.
 */
export function detectThreats(ctx: ConversationContext): DetectedThreat[] {
  const allThreats: DetectedThreat[] = [];

  // Layer 1: Pattern matching on each message (RAMPART)
  for (const msg of ctx.messages) {
    if (msg.role === 'user') {
      allThreats.push(...detectPatternThreats(msg));
    }
  }

  // Layer 2: Behavioral analysis across conversation (WATCHTOWER)
  allThreats.push(...detectBehavioralAnomalies(ctx));

  // Layer 3: Context boundary validation (BASTION)
  allThreats.push(...validateContextBoundaries(ctx));

  // Deduplicate by category+evidence
  const seen = new Set<string>();
  const deduped = allThreats.filter(t => {
    const key = `${t.category}:${t.evidence.slice(0, 50)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Sort by severity (critical first), then confidence
  const severityOrder: Record<ThreatSeverity, number> = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };
  return deduped.sort((a, b) =>
    severityOrder[a.severity] - severityOrder[b.severity] || b.confidence - a.confidence
  );
}

/** Get the current signature count for telemetry */
export function getSignatureCount(): number {
  return INJECTION_SIGNATURES.length;
}

export type { InjectionSignature };
