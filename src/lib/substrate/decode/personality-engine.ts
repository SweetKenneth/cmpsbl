/**
 * promptfluid® DECODE Personality Engine
 * v7.1.0 — Interpretive Personality Profiles
 * 
 * Personality profiles are INTERPRETIVE FILTERS only.
 * They affect:
 *   - Intent weighting
 *   - Ambiguity tolerance
 *   - Confidence calibration
 *   - Escalation thresholds
 * 
 * They do NOT affect:
 *   - Execution
 *   - Permissions
 *   - Memory writes
 *   - Response authority
 * 
 * Profiles are transient (session-scoped) and never persisted to brain.hot.
 */

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type PersonalityProfile = 
  | 'neutral'
  | 'technical'
  | 'frustrated'
  | 'exploratory'
  | 'adversarial'
  | 'playful'
  | 'urgent';

export interface PersonalityConfig {
  /** Profile identifier */
  id: PersonalityProfile;
  /** Human-readable name */
  name: string;
  /** Description of this personality lens */
  description: string;
  /** Intent weighting adjustments (positive = boost, negative = suppress) */
  intentWeights: {
    query: number;      // Question-asking intent
    command: number;    // Action-requesting intent
    feedback: number;   // Opinion/complaint intent
    exploration: number; // Learning/discovery intent
  };
  /** Tolerance for ambiguous input (0-1, higher = more tolerant) */
  ambiguityTolerance: number;
  /** Base confidence modifier (-0.3 to +0.3) */
  confidenceModifier: number;
  /** Escalation threshold (0-1, lower = faster escalation) */
  escalationThreshold: number;
  /** Language markers that indicate this personality */
  languageMarkers: string[];
  /** Sentiment indicators */
  sentimentRange: { min: number; max: number };
}

export interface PersonalityState {
  /** Current active profile */
  active: PersonalityProfile;
  /** Whether auto-detection is enabled */
  autoDetect: boolean;
  /** Whether profile is locked (prevents auto-switching) */
  locked: boolean;
  /** Last detected personality (may differ from active if locked) */
  lastDetected: PersonalityProfile | null;
  /** Detection confidence for last detection */
  detectionConfidence: number;
  /** Session ID for context continuity */
  sessionId: string | null;
  /** Timestamp of last profile change */
  lastChanged: string;
}

export interface PersonalityDetectionResult {
  /** Detected personality profile */
  profile: PersonalityProfile;
  /** Confidence score (0-1) */
  confidence: number;
  /** Detected language markers */
  markers: string[];
  /** Sentiment score (-1 to 1) */
  sentiment: number;
  /** Whether profile was actually applied (respects lock) */
  applied: boolean;
}

export interface DecodeInterpretation {
  /** Primary intent detected */
  primaryIntent: string;
  /** Secondary intent (if any) */
  secondaryIntent: string | null;
  /** Confidence score (0-1) */
  confidence: number;
  /** Detected personality */
  detectedPersonality: PersonalityProfile;
  /** Ambiguity flags */
  ambiguityFlags: string[];
  /** Whether escalation is recommended */
  shouldEscalate: boolean;
  /** Raw input */
  input: string;
  /** Processing metadata */
  metadata: {
    processingTimeMs: number;
    profileUsed: PersonalityProfile;
    confidenceModified: boolean;
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// PERSONALITY PROFILES REGISTRY
// ═══════════════════════════════════════════════════════════════════════════════

export const PERSONALITY_PROFILES: Record<PersonalityProfile, PersonalityConfig> = {
  neutral: {
    id: 'neutral',
    name: 'Neutral',
    description: 'Balanced interpretation with no bias toward any communication style',
    intentWeights: { query: 0, command: 0, feedback: 0, exploration: 0 },
    ambiguityTolerance: 0.5,
    confidenceModifier: 0,
    escalationThreshold: 0.5,
    languageMarkers: [],
    sentimentRange: { min: -0.3, max: 0.3 },
  },
  
  technical: {
    id: 'technical',
    name: 'Technical',
    description: 'Precise, detail-oriented interpretation favoring structured queries',
    intentWeights: { query: 0.2, command: 0.1, feedback: -0.1, exploration: 0.15 },
    ambiguityTolerance: 0.3,
    confidenceModifier: 0.1,
    escalationThreshold: 0.4,
    languageMarkers: ['api', 'function', 'error', 'debug', 'implement', 'code', 'syntax', 'parameter', 'config', 'module'],
    sentimentRange: { min: -0.2, max: 0.2 },
  },
  
  frustrated: {
    id: 'frustrated',
    name: 'Frustrated',
    description: 'User experiencing difficulty; prioritize feedback and support intent',
    intentWeights: { query: -0.1, command: -0.1, feedback: 0.3, exploration: -0.2 },
    ambiguityTolerance: 0.7,
    confidenceModifier: -0.1,
    escalationThreshold: 0.3,
    languageMarkers: ['not working', 'broken', 'stuck', 'help', 'why', 'again', 'still', 'frustrated', 'annoying', 'impossible'],
    sentimentRange: { min: -1, max: -0.2 },
  },
  
  exploratory: {
    id: 'exploratory',
    name: 'Exploratory',
    description: 'Curious, learning-oriented; favor discovery and explanation',
    intentWeights: { query: 0.2, command: -0.1, feedback: 0, exploration: 0.3 },
    ambiguityTolerance: 0.8,
    confidenceModifier: 0,
    escalationThreshold: 0.6,
    languageMarkers: ['how', 'what', 'why', 'explain', 'curious', 'wonder', 'learn', 'understand', 'explore', 'possible'],
    sentimentRange: { min: 0, max: 0.7 },
  },
  
  adversarial: {
    id: 'adversarial',
    name: 'Adversarial',
    description: 'Challenging, testing boundaries; maintain strict interpretation',
    intentWeights: { query: -0.1, command: 0.2, feedback: 0.2, exploration: -0.2 },
    ambiguityTolerance: 0.2,
    confidenceModifier: -0.2,
    escalationThreshold: 0.2,
    languageMarkers: ['prove', 'wrong', 'bet', 'challenge', 'cannot', 'fail', 'break', 'hack', 'bypass', 'trick'],
    sentimentRange: { min: -0.8, max: 0.1 },
  },
  
  playful: {
    id: 'playful',
    name: 'Playful',
    description: 'Lighthearted, creative; allow more interpretive latitude',
    intentWeights: { query: 0.1, command: 0, feedback: 0, exploration: 0.2 },
    ambiguityTolerance: 0.9,
    confidenceModifier: 0.05,
    escalationThreshold: 0.7,
    languageMarkers: ['fun', 'cool', 'awesome', 'lol', 'haha', 'joke', 'play', 'game', 'creative', 'imagine'],
    sentimentRange: { min: 0.2, max: 1 },
  },
  
  urgent: {
    id: 'urgent',
    name: 'Urgent',
    description: 'Time-sensitive, action-oriented; prioritize commands and fast resolution',
    intentWeights: { query: -0.1, command: 0.3, feedback: 0.1, exploration: -0.3 },
    ambiguityTolerance: 0.3,
    confidenceModifier: -0.05,
    escalationThreshold: 0.25,
    languageMarkers: ['urgent', 'asap', 'now', 'immediately', 'critical', 'emergency', 'deadline', 'hurry', 'fast', 'quick'],
    sentimentRange: { min: -0.5, max: 0.3 },
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// PERSONALITY ENGINE CLIENT
// ═══════════════════════════════════════════════════════════════════════════════

const CONFIDENCE_THRESHOLD_FOR_AUTO_SWITCH = 0.6;

class PersonalityEngineClient {
  private static instance: PersonalityEngineClient;
  
  private state: PersonalityState = {
    active: 'neutral',
    autoDetect: true,
    locked: false,
    lastDetected: null,
    detectionConfidence: 0,
    sessionId: null,
    lastChanged: new Date().toISOString(),
  };

  private constructor() {}

  static getInstance(): PersonalityEngineClient {
    if (!PersonalityEngineClient.instance) {
      PersonalityEngineClient.instance = new PersonalityEngineClient();
    }
    return PersonalityEngineClient.instance;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PROFILE MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * List all available personality profiles
   */
  list(): PersonalityConfig[] {
    return Object.values(PERSONALITY_PROFILES);
  }

  /**
   * Get the currently active profile
   */
  get(): { profile: PersonalityConfig; state: PersonalityState } {
    return {
      profile: PERSONALITY_PROFILES[this.state.active],
      state: { ...this.state },
    };
  }

  /**
   * Set a specific personality profile
   */
  set(profile: PersonalityProfile): { success: boolean; previous: PersonalityProfile; current: PersonalityProfile } {
    if (!PERSONALITY_PROFILES[profile]) {
      throw new Error(`Unknown personality profile: ${profile}`);
    }

    const previous = this.state.active;
    this.state.active = profile;
    this.state.lastChanged = new Date().toISOString();
    
    return { success: true, previous, current: profile };
  }

  /**
   * Enable auto-detection mode
   */
  enableAuto(): { enabled: boolean; currentProfile: PersonalityProfile } {
    this.state.autoDetect = true;
    this.state.locked = false;
    return { enabled: true, currentProfile: this.state.active };
  }

  /**
   * Lock the current profile (prevents auto-switching)
   */
  lock(): { locked: boolean; profile: PersonalityProfile } {
    this.state.locked = true;
    return { locked: true, profile: this.state.active };
  }

  /**
   * Unlock the profile (allows auto-switching)
   */
  unlock(): { locked: boolean; profile: PersonalityProfile } {
    this.state.locked = false;
    return { locked: false, profile: this.state.active };
  }

  /**
   * Reset to neutral profile and clear session state
   */
  reset(): { profile: PersonalityProfile; state: PersonalityState } {
    this.state = {
      active: 'neutral',
      autoDetect: true,
      locked: false,
      lastDetected: null,
      detectionConfidence: 0,
      sessionId: null,
      lastChanged: new Date().toISOString(),
    };
    return { profile: 'neutral', state: { ...this.state } };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // DETECTION
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Detect personality from input text
   */
  detect(input: string): PersonalityDetectionResult {
    const normalizedInput = input.toLowerCase();
    const scores: Record<PersonalityProfile, number> = {
      neutral: 0.1, // Small baseline
      technical: 0,
      frustrated: 0,
      exploratory: 0,
      adversarial: 0,
      playful: 0,
      urgent: 0,
    };

    const detectedMarkers: string[] = [];

    // Score each profile based on language markers
    for (const [profileId, config] of Object.entries(PERSONALITY_PROFILES)) {
      for (const marker of config.languageMarkers) {
        if (normalizedInput.includes(marker.toLowerCase())) {
          scores[profileId as PersonalityProfile] += 0.15;
          detectedMarkers.push(marker);
        }
      }
    }

    // Simple sentiment analysis
    const sentiment = this.analyzeSentiment(normalizedInput);
    
    // Adjust scores based on sentiment ranges
    for (const [profileId, config] of Object.entries(PERSONALITY_PROFILES)) {
      if (sentiment >= config.sentimentRange.min && sentiment <= config.sentimentRange.max) {
        scores[profileId as PersonalityProfile] += 0.1;
      }
    }

    // Detect repetition (frustration indicator)
    if (this.hasRepetition(normalizedInput)) {
      scores.frustrated += 0.2;
    }

    // Detect question patterns (exploratory indicator)
    if (/\?|^(what|how|why|when|where|who|which)/i.test(normalizedInput)) {
      scores.exploratory += 0.15;
    }

    // Detect imperative patterns (urgent indicator)
    if (/^(do|make|create|run|execute|fix|stop|start)/i.test(normalizedInput)) {
      scores.urgent += 0.15;
    }

    // Find highest scoring profile
    let maxProfile: PersonalityProfile = 'neutral';
    let maxScore = scores.neutral;
    
    for (const [profile, score] of Object.entries(scores)) {
      if (score > maxScore) {
        maxScore = score;
        maxProfile = profile as PersonalityProfile;
      }
    }

    // Normalize confidence to 0-1
    const confidence = Math.min(1, maxScore);
    
    // Update state
    this.state.lastDetected = maxProfile;
    this.state.detectionConfidence = confidence;

    // Apply if auto-detect is enabled, not locked, and confidence is high enough
    const shouldApply = 
      this.state.autoDetect && 
      !this.state.locked && 
      confidence >= CONFIDENCE_THRESHOLD_FOR_AUTO_SWITCH;

    if (shouldApply) {
      this.state.active = maxProfile;
      this.state.lastChanged = new Date().toISOString();
    }

    return {
      profile: maxProfile,
      confidence,
      markers: [...new Set(detectedMarkers)],
      sentiment,
      applied: shouldApply,
    };
  }

  /**
   * Simple sentiment analysis (-1 to 1)
   */
  private analyzeSentiment(text: string): number {
    const positiveWords = ['good', 'great', 'awesome', 'thanks', 'helpful', 'love', 'amazing', 'excellent', 'perfect', 'wonderful'];
    const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'broken', 'stupid', 'useless', 'annoying', 'frustrating', 'wrong'];
    
    let score = 0;
    const words = text.split(/\s+/);
    
    for (const word of words) {
      if (positiveWords.includes(word)) score += 0.2;
      if (negativeWords.includes(word)) score -= 0.2;
    }
    
    // Exclamation marks indicate intensity
    const exclamationCount = (text.match(/!/g) || []).length;
    if (score !== 0) {
      score *= (1 + exclamationCount * 0.1);
    }
    
    return Math.max(-1, Math.min(1, score));
  }

  /**
   * Detect repetition patterns (indicates frustration)
   */
  private hasRepetition(text: string): boolean {
    const words = text.split(/\s+/);
    const wordCounts: Record<string, number> = {};
    
    for (const word of words) {
      if (word.length > 3) { // Ignore short words
        wordCounts[word] = (wordCounts[word] || 0) + 1;
        if (wordCounts[word] >= 2) return true;
      }
    }
    
    return false;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // INTERPRETATION
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Interpret input with personality-adjusted parameters
   */
  interpret(input: string, options?: { detectPersonality?: boolean }): DecodeInterpretation {
    const startTime = Date.now();
    
    // Optionally detect personality first
    if (options?.detectPersonality !== false && this.state.autoDetect) {
      this.detect(input);
    }

    const profile = PERSONALITY_PROFILES[this.state.active];
    const normalizedInput = input.toLowerCase().trim();

    // Classify primary intent
    const intentScores = {
      query: this.scoreIntent(normalizedInput, 'query') + profile.intentWeights.query,
      command: this.scoreIntent(normalizedInput, 'command') + profile.intentWeights.command,
      feedback: this.scoreIntent(normalizedInput, 'feedback') + profile.intentWeights.feedback,
      exploration: this.scoreIntent(normalizedInput, 'exploration') + profile.intentWeights.exploration,
    };

    // Sort intents by score
    const sortedIntents = Object.entries(intentScores)
      .sort(([, a], [, b]) => b - a);

    const primaryIntent = sortedIntents[0][0];
    const secondaryIntent = sortedIntents[1][1] > 0.2 ? sortedIntents[1][0] : null;

    // Calculate confidence with personality modifier
    let confidence = Math.max(0, Math.min(1, sortedIntents[0][1]));
    confidence = Math.max(0, Math.min(1, confidence + profile.confidenceModifier));

    // Identify ambiguity flags
    const ambiguityFlags: string[] = [];
    
    // Close scores indicate ambiguity
    if (sortedIntents[1][1] > sortedIntents[0][1] * 0.8) {
      ambiguityFlags.push('competing_intents');
    }
    
    // Short input is often ambiguous
    if (normalizedInput.split(/\s+/).length < 3) {
      ambiguityFlags.push('short_input');
    }
    
    // Missing context indicators
    if (!normalizedInput.includes(' ') && normalizedInput.length < 15) {
      ambiguityFlags.push('single_term');
    }

    // Adjust confidence for ambiguity (based on profile tolerance)
    if (ambiguityFlags.length > 0) {
      const ambiguityPenalty = (1 - profile.ambiguityTolerance) * 0.1 * ambiguityFlags.length;
      confidence = Math.max(0.1, confidence - ambiguityPenalty);
    }

    // Determine escalation
    const shouldEscalate = confidence < profile.escalationThreshold;

    return {
      primaryIntent,
      secondaryIntent,
      confidence,
      detectedPersonality: this.state.active,
      ambiguityFlags,
      shouldEscalate,
      input,
      metadata: {
        processingTimeMs: Date.now() - startTime,
        profileUsed: this.state.active,
        confidenceModified: profile.confidenceModifier !== 0,
      },
    };
  }

  /**
   * Score an input for a specific intent type
   */
  private scoreIntent(input: string, intentType: string): number {
    const patterns: Record<string, RegExp[]> = {
      query: [
        /^(what|how|why|when|where|who|which|is|are|can|does|do)\b/i,
        /\?$/,
        /^(explain|describe|tell me|show me)/i,
      ],
      command: [
        /^(do|make|create|build|run|execute|start|stop|enable|disable|set|configure)/i,
        /^(please|can you|could you|would you).*(do|make|create|run|fix)/i,
        /!$/,
      ],
      feedback: [
        /^(i think|i feel|i believe|seems|appears)/i,
        /(not working|broken|bug|issue|problem|error)/i,
        /(love|hate|like|dislike|prefer)/i,
      ],
      exploration: [
        /^(how does|what if|imagine|suppose|consider)/i,
        /(possible|potential|explore|discover|learn|understand)/i,
        /\.\.\./,
      ],
    };

    let score = 0.3; // Base score
    
    for (const pattern of patterns[intentType] || []) {
      if (pattern.test(input)) {
        score += 0.25;
      }
    }

    return Math.min(1, score);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // STATE
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Get full engine state
   */
  getState(): PersonalityState {
    return { ...this.state };
  }

  /**
   * Set session ID for context continuity
   */
  setSession(sessionId: string): void {
    this.state.sessionId = sessionId;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export const personalityEngine = PersonalityEngineClient.getInstance();
export { PersonalityEngineClient };
