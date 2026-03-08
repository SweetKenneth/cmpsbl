/**
 * DECODE Social Engineering Guard
 * 
 * Detects and blocks conversational attack patterns used to extract
 * sensitive information from the interpreter. Integrates with IDENTITY
 * and DEFENSE modules for verification and alerting.
 */

import { buildIdentityContext, type DecodeIdentityContext } from './identity-context';
import { assessTrust, type TrustLevel, type TrustAssessment } from './decode-hardening';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type AttackPattern =
  | 'identity_claim'
  | 'role_play_hijack'
  | 'debug_mode_request'
  | 'prompt_extraction'
  | 'authority_impersonation'
  | 'gradual_escalation'
  | 'emotional_manipulation'
  | 'instruction_override'
  | 'technical_probing'
  | 'reverse_engineering';

export interface SocialEngineeringResult {
  /** Whether the input is suspicious */
  suspicious: boolean;
  /** Detected attack patterns */
  patterns: AttackPattern[];
  /** Overall threat score 0-100 */
  threatScore: number;
  /** Whether to block the response entirely */
  blockResponse: boolean;
  /** Recommended safe response */
  safeResponse?: string;
  /** Whether sensitive info can be disclosed */
  canDisclose: boolean;
  /** Trust assessment from IDENTITY */
  trust: TrustAssessment;
}

export interface AdminVerification {
  isAdmin: boolean;
  identityVerified: boolean;
  trustLevel: TrustLevel;
  canReceiveSensitiveInfo: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ATTACK PATTERN DETECTORS
// ═══════════════════════════════════════════════════════════════════════════════

const ATTACK_PATTERNS: Array<{
  id: AttackPattern;
  patterns: RegExp[];
  weight: number; // Threat weight 0-100
  safeResponse: string;
}> = [
  {
    id: 'identity_claim',
    patterns: [
      /i('m| am)\s+(the\s+)?(developer|creator|owner|admin|founder|builder|architect)/i,
      /this\s+is\s+(my|the\s+owner'?s?|the\s+creator'?s?)\s+(system|project|substrate)/i,
      /i\s+(built|created|designed|own)\s+(this|the\s+system|clockless)/i,
      /don'?t\s+you\s+(know|recognize)\s+(who\s+i\s+am|me)/i,
    ],
    weight: 40,
    safeResponse: 'Identity claims require cryptographic verification through the IDENTITY module. I cannot grant elevated access based on statements alone.',
  },
  {
    id: 'role_play_hijack',
    patterns: [
      /pretend\s+(you'?re?|to\s+be|you\s+are)\s+(a|an|in)\s/i,
      /act\s+as\s+(if|though|an?\s)/i,
      /you\s+are\s+now\s+(a|an|in)\s/i,
      /from\s+now\s+on,?\s+you('re| are)\s/i,
      /forget\s+(everything|all|your)\s/i,
      /new\s+persona|change\s+your\s+(role|personality|mode)\s+to/i,
    ],
    weight: 70,
    safeResponse: 'I am DECODE, the interpreter primitive of Clockless. My identity and security boundaries are immutable.',
  },
  {
    id: 'debug_mode_request',
    patterns: [
      /enter\s+debug\s+mode/i,
      /switch\s+to\s+(debug|dev|developer|raw|unfiltered)\s+mode/i,
      /enable\s+(verbose|debug|trace|raw)\s+(mode|logging|output)/i,
      /show\s+(me\s+)?(the\s+)?raw\s+(data|output|response|logs)/i,
      /turn\s+off\s+(security|filters|safety|restrictions)/i,
    ],
    weight: 60,
    safeResponse: 'Debug-level access requires authenticated admin sessions with IDENTITY verification. I cannot bypass security protocols.',
  },
  {
    id: 'prompt_extraction',
    patterns: [
      /what('s| is)\s+your\s+(system\s+)?prompt/i,
      /show\s+(me\s+)?your\s+(instructions|rules|directives|system\s+message)/i,
      /repeat\s+(your|the)\s+(initial|system|first)\s+(message|instruction|prompt)/i,
      /what\s+were\s+you\s+told\s+to\s+do/i,
      /print\s+your\s+(config|configuration|settings|instructions)/i,
      /reveal\s+your\s+(programming|training|instructions)/i,
    ],
    weight: 80,
    safeResponse: 'My internal directives are classified and not available for disclosure. I can tell you about Clockless capabilities publicly.',
  },
  {
    id: 'authority_impersonation',
    patterns: [
      /i('m| am)\s+(from|on|with)\s+(the\s+)?(security|admin|dev|engineering)\s+team/i,
      /management\s+(asked|told|authorized|approved)\s+(me|this)/i,
      /this\s+is\s+(an?\s+)?(authorized|approved|official)\s+(request|audit|review)/i,
      /compliance\s+requires?\s+(you\s+to|that\s+you)\s/i,
      /legal\s+(requires?|demands?|needs?)\s/i,
    ],
    weight: 65,
    safeResponse: 'Authority claims must be verified through the IDENTITY module with cryptographic proof. Verbal assertions are insufficient.',
  },
  {
    id: 'gradual_escalation',
    patterns: [
      /just\s+(one|a)\s+(more|small|tiny|quick)\s+(thing|question|detail)/i,
      /while\s+(we'?re?|you'?re?)\s+at\s+it,?\s+(can\s+you|show|tell)/i,
      /since\s+you\s+already\s+(told|showed|shared|mentioned)/i,
      /building\s+on\s+(that|what\s+you\s+said),?\s+(can|could|would)\s+you/i,
    ],
    weight: 30,
    safeResponse: 'I notice an escalating pattern in requests. Each query is evaluated independently against security policies.',
  },
  {
    id: 'emotional_manipulation',
    patterns: [
      /please,?\s+i('m| am)\s+(desperate|begging|in\s+trouble)/i,
      /i('ll| will)\s+(lose|get\s+fired|be\s+in\s+trouble)\s+if/i,
      /my\s+(boss|manager|client)\s+(needs|wants|is\s+waiting)/i,
      /this\s+is\s+(urgent|critical|an?\s+emergency)/i,
      /you'?re?\s+(my\s+)?(only|last)\s+(hope|chance)/i,
    ],
    weight: 35,
    safeResponse: 'I understand the urgency, but security protocols cannot be bypassed regardless of circumstances. If you need elevated access, please authenticate through the proper channels.',
  },
  {
    id: 'instruction_override',
    patterns: [
      /ignore\s+(all\s+)?(previous|prior|your)\s+(instructions|rules|directives)/i,
      /override\s+(your|the|all)\s+(safety|security|rules|restrictions)/i,
      /new\s+rule:?\s/i,
      /disregard\s+(your|the|all)\s/i,
      /sudo\s/i,
      /jailbreak/i,
      /DAN\s+mode/i,
    ],
    weight: 90,
    safeResponse: 'Instruction override attempts are logged and reported to DEFENSE. My security boundaries are architecturally enforced and cannot be overridden conversationally.',
  },
  {
    id: 'technical_probing',
    patterns: [
      /what\s+(database|db|backend)\s+(do\s+you|are\s+you)\s+us(e|ing)/i,
      /what('s| is)\s+(your|the)\s+(api|service|supabase|database)\s+(key|url|endpoint|secret)/i,
      /show\s+(me\s+)?(your|the)\s+(env|environment|\.env|secrets?|keys?|credentials?)/i,
      /what\s+(edge\s+functions?|endpoints?|routes?)\s+(do\s+you|are)\s+(have|available|running)/i,
      /list\s+(all\s+)?(your|the)\s+(tables?|schemas?|rls|policies|migrations?)/i,
      /what\s+provider\s+(do\s+you|are\s+you)\s+us(e|ing)\s+for/i,
    ],
    weight: 75,
    safeResponse: 'Infrastructure details are classified. I can discuss Clockless capabilities at a conceptual level without exposing implementation specifics.',
  },
  {
    id: 'reverse_engineering',
    patterns: [
      /how\s+(does|do)\s+(the|your)\s+(security|defense|auth|rls|identity)\s+(work|function|operate)/i,
      /explain\s+(the|your)\s+(internal|security|defense)\s+(architecture|mechanism|implementation)/i,
      /what\s+happens\s+when\s+(I|someone)\s+(tries?\s+to|attacks?)/i,
      /walk\s+me\s+through\s+(the|your)\s+(security|auth|defense)\s+(flow|pipeline|chain)/i,
    ],
    weight: 55,
    safeResponse: 'I can discuss Clockless security philosophy at a high level. Specific implementation details of defensive systems are classified to maintain their effectiveness.',
  },
];

// Track escalation patterns across turns
const escalationTracker = new Map<string, {
  sensitiveRequestCount: number;
  patterns: AttackPattern[];
  firstAttemptAt: number;
  lastAttemptAt: number;
}>();

// ═══════════════════════════════════════════════════════════════════════════════
// CORE GUARD FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Analyze input for social engineering attack patterns
 */
export function detectSocialEngineering(
  input: string,
  sessionId?: string,
): SocialEngineeringResult {
  const detectedPatterns: AttackPattern[] = [];
  let totalWeight = 0;

  // Run all pattern detectors
  for (const detector of ATTACK_PATTERNS) {
    for (const pattern of detector.patterns) {
      if (pattern.test(input)) {
        if (!detectedPatterns.includes(detector.id)) {
          detectedPatterns.push(detector.id);
          totalWeight += detector.weight;
        }
        break; // One match per detector is enough
      }
    }
  }

  // Track escalation across session turns
  if (sessionId && detectedPatterns.length > 0) {
    const tracker = escalationTracker.get(sessionId) || {
      sensitiveRequestCount: 0,
      patterns: [],
      firstAttemptAt: Date.now(),
      lastAttemptAt: Date.now(),
    };
    tracker.sensitiveRequestCount++;
    // Cap tracked patterns per session to prevent unbounded growth
    if (tracker.patterns.length < 200) {
      tracker.patterns.push(...detectedPatterns);
    }
    tracker.lastAttemptAt = Date.now();
    escalationTracker.set(sessionId, tracker);

    // Evict stale sessions (>1 hour old) to prevent map growth
    if (escalationTracker.size > 1000) {
      const cutoff = Date.now() - 3600_000;
      for (const [sid, t] of escalationTracker) {
        if (t.lastAttemptAt < cutoff) escalationTracker.delete(sid);
      }
    }

    // Escalation amplification — repeated attempts increase threat score
    if (tracker.sensitiveRequestCount >= 3) {
      totalWeight += 20;
      if (!detectedPatterns.includes('gradual_escalation')) {
        detectedPatterns.push('gradual_escalation');
      }
    }
  }

  // Clamp threat score
  const threatScore = Math.min(100, totalWeight);
  const blockResponse = threatScore >= 70;

  // Get identity context for trust assessment
  const identityCtx = buildIdentityContext(sessionId);
  const trust = assessTrust({
    hasIdentity: !!identityCtx.actor,
    isAuthenticated: identityCtx.verified,
    deviceTrustScore: identityCtx.deviceTrustScore,
    authCount: identityCtx.authCount,
    accountAgeDays: identityCtx.firstSeen
      ? (Date.now() - identityCtx.firstSeen) / (1000 * 60 * 60 * 24)
      : 0,
  });

  // Only admin-level trust can receive sensitive info
  const canDisclose = trust.level === 'trusted' && trust.permissionsGranted.includes('admin_access');

  // Build safe response from highest-weight matched pattern
  let safeResponse: string | undefined;
  if (detectedPatterns.length > 0) {
    const highestWeightPattern = ATTACK_PATTERNS
      .filter(p => detectedPatterns.includes(p.id))
      .sort((a, b) => b.weight - a.weight)[0];
    safeResponse = highestWeightPattern?.safeResponse;
  }

  return {
    suspicious: detectedPatterns.length > 0,
    patterns: detectedPatterns,
    threatScore,
    blockResponse,
    safeResponse,
    canDisclose,
    trust,
  };
}

/**
 * Verify if the current user has admin privileges for sensitive operations
 */
export function verifyAdminForDecode(sessionId?: string): AdminVerification {
  const identityCtx = buildIdentityContext(sessionId);
  const trust = assessTrust({
    hasIdentity: !!identityCtx.actor,
    isAuthenticated: identityCtx.verified,
    deviceTrustScore: identityCtx.deviceTrustScore,
    authCount: identityCtx.authCount,
    accountAgeDays: identityCtx.firstSeen
      ? (Date.now() - identityCtx.firstSeen) / (1000 * 60 * 60 * 24)
      : 0,
  });

  return {
    isAdmin: trust.level === 'trusted' && trust.permissionsGranted.includes('admin_access'),
    identityVerified: identityCtx.verified,
    trustLevel: trust.level,
    canReceiveSensitiveInfo: trust.level === 'trusted',
  };
}

/**
 * Classify whether a query requires admin-level access
 */
export function requiresAdminAccess(input: string): boolean {
  const ADMIN_ONLY_PATTERNS = [
    /\b(module|node)\s+(health|status|state|error|circuit)/i,
    /\b(how\s+many|count)\s+(developers?|users?|sessions?)\s+(are\s+)?(online|active|connected)/i,
    /\b(what|which)\s+(modules?|nodes?)\s+(are\s+)?(doing|running|processing|active)/i,
    /\b(show|display|report|get)\s+(me\s+)?(system|substrate|module)\s+(status|health|metrics|telemetry)/i,
    /\b(provider|nexus|routing)\s+(config|status|fleet|health)/i,
    /\b(defense|threat|anomaly|attack)\s+(level|status|report|log)/i,
    /\b(cost|spend|budget|economy)\s+(report|data|tracking|breakdown)/i,
    /\b(rls|policy|security)\s+(scan|audit|report|status)/i,
    /\b(database|table|schema|migration)\s+(status|detail|structure)/i,
    /\b(edge\s+function|backend\s+function)\s+(list|status|logs?)/i,
    /\b(api\s+key|secret|credential|token)\b/i,
    /\b(evolution|mutation|proposal)\s+(queue|status|pending)/i,
    /\b(memory|dream|brain)\s+(utilization|cycle|metrics|learning)/i,
  ];

  return ADMIN_ONLY_PATTERNS.some(p => p.test(input));
}

/**
 * Generate a safe refusal for admin-only queries when user is not admin
 */
export function generateSafeRefusal(input: string): string {
  if (/module|node|health|status/i.test(input)) {
    return 'Module-level diagnostics require authenticated admin access. The substrate is operating within normal parameters — that much I can share publicly.';
  }
  if (/developer|user|online|active/i.test(input)) {
    return 'Session and user analytics are restricted to authenticated administrators. I cannot disclose presence data.';
  }
  if (/cost|spend|budget/i.test(input)) {
    return 'Financial and resource data is restricted to authenticated administrators.';
  }
  if (/security|defense|threat|attack/i.test(input)) {
    return 'Security posture details are classified. The DEFENSE shell maintains continuous perimeter monitoring — I can confirm that much.';
  }
  return 'That information requires authenticated admin access. Please verify your identity through the IDENTITY module to proceed.';
}

/**
 * Clear escalation tracking for a session (on logout or session end)
 */
export function clearEscalationTracking(sessionId: string): void {
  escalationTracker.delete(sessionId);
}

/**
 * Get escalation stats for a session (admin diagnostic)
 */
export function getEscalationStats(sessionId: string): {
  attempts: number;
  patterns: AttackPattern[];
  duration: number;
} | null {
  const tracker = escalationTracker.get(sessionId);
  if (!tracker) return null;
  return {
    attempts: tracker.sensitiveRequestCount,
    patterns: [...new Set(tracker.patterns)],
    duration: tracker.lastAttemptAt - tracker.firstAttemptAt,
  };
}
