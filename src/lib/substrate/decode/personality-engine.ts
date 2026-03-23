/**
 * CMPSBL® DECODE Personality Engine
 * Dynamic Personality Profiles (Server-Synced)
 *
 * Personality profiles now sync with the backend edge function.
 * Changes made via terminal commands persist to the database.
 * 
 * Integrates with 40-primitive / 4-category architecture for personality-aware responses.
 * 
 * Features:
 *   - Direct/professional baseline (no poetry/metaphors)
 *   - Server-side personality storage in brain_config
 *   - Terminal commands sync with backend
 *   - Profiles: neutral, technical, concise, friendly, admin, exploratory
 */

import { supabase } from '@/integrations/supabase/client';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type PersonalityProfile = 
  | 'neutral'
  | 'technical'
  | 'concise'
  | 'friendly'
  | 'admin'
  | 'exploratory';

export interface PersonalityConfig {
  /** Profile identifier */
  id: PersonalityProfile;
  /** Human-readable name */
  name: string;
  /** Description of this personality mode */
  description: string;
  /** Personality traits (0-1 scales) */
  traits: {
    directness: number;      // Higher = more direct
    formality: number;       // Higher = more formal
    verbosity: number;       // Higher = more verbose
    technicality: number;    // Higher = more technical
  };
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
  /** Whether synced with server */
  serverSynced: boolean;
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
// PERSONALITY PROFILES REGISTRY — Direct, Professional
// ═══════════════════════════════════════════════════════════════════════════════

export const PERSONALITY_PROFILES: Record<PersonalityProfile, PersonalityConfig> = {
  neutral: {
    id: 'neutral',
    name: 'Neutral',
    description: 'Direct, professional communication. Clear and efficient.',
    traits: { directness: 0.8, formality: 0.6, verbosity: 0.3, technicality: 0.5 },
  },
  
  technical: {
    id: 'technical',
    name: 'Technical',
    description: 'Precise, developer-focused with code examples.',
    traits: { directness: 0.9, formality: 0.7, verbosity: 0.5, technicality: 0.95 },
  },
  
  concise: {
    id: 'concise',
    name: 'Concise',
    description: 'Minimal responses. Maximum efficiency.',
    traits: { directness: 1.0, formality: 0.5, verbosity: 0.1, technicality: 0.5 },
  },
  
  friendly: {
    id: 'friendly',
    name: 'Friendly',
    description: 'Warm, approachable tone while remaining helpful.',
    traits: { directness: 0.6, formality: 0.3, verbosity: 0.5, technicality: 0.4 },
  },
  
  admin: {
    id: 'admin',
    name: 'Admin',
    description: 'Full technical detail, system administrator mode.',
    traits: { directness: 1.0, formality: 0.8, verbosity: 0.7, technicality: 1.0 },
  },
  
  exploratory: {
    id: 'exploratory',
    name: 'Exploratory',
    description: 'Discovery-focused. Suggests possibilities.',
    traits: { directness: 0.5, formality: 0.4, verbosity: 0.6, technicality: 0.5 },
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// PERSONALITY ENGINE CLIENT — Server-Synced
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
    serverSynced: false,
  };

  private constructor() {
    // Sync with server on initialization
    this.syncFromServer();
  }

  static getInstance(): PersonalityEngineClient {
    if (!PersonalityEngineClient.instance) {
      PersonalityEngineClient.instance = new PersonalityEngineClient();
    }
    return PersonalityEngineClient.instance;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SERVER SYNC
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Sync personality state from server
   */
  async syncFromServer(): Promise<void> {
    try {
      const { data, error } = await supabase.functions.invoke('pf-substrate', {
        body: { module: 'decode', action: 'personality.get' },
      });
      if (!error && data?.personality?.id) {
        const serverId = data.personality.id as PersonalityProfile;
        if (PERSONALITY_PROFILES[serverId]) {
          this.state.active = serverId;
          this.state.serverSynced = true;
          this.state.lastChanged = new Date().toISOString();
        }
      }
    } catch {
      // Server unavailable, use local state
      this.state.serverSynced = false;
    }
  }

  /**
   * Sync personality change to server
   */
  private async syncToServer(profile: PersonalityProfile): Promise<boolean> {
    try {
      const { data, error } = await supabase.functions.invoke('pf-substrate', {
        body: { module: 'decode', action: 'personality.set', payload: { profile } },
      });
      this.state.serverSynced = !error && data?.success;
      return this.state.serverSynced;
    } catch {
      this.state.serverSynced = false;
      return false;
    }
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
   * Set a specific personality profile (syncs to server)
   */
  async set(profile: PersonalityProfile): Promise<{ success: boolean; previous: PersonalityProfile; current: PersonalityProfile }> {
    if (!PERSONALITY_PROFILES[profile]) {
      throw new Error(`Unknown personality profile: ${profile}. Available: ${Object.keys(PERSONALITY_PROFILES).join(', ')}`);
    }

    const previous = this.state.active;
    this.state.active = profile;
    this.state.lastChanged = new Date().toISOString();
    
    // Sync to server (async, don't block)
    this.syncToServer(profile);
    
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
   * Reset to neutral profile and clear session state (syncs to server)
   */
  async reset(): Promise<{ profile: PersonalityProfile; state: PersonalityState }> {
    this.state = {
      active: 'neutral',
      autoDetect: true,
      locked: false,
      lastDetected: null,
      detectionConfidence: 0,
      sessionId: null,
      lastChanged: new Date().toISOString(),
      serverSynced: false,
    };
    
    // Sync reset to server
    await this.syncToServer('neutral');
    
    return { profile: 'neutral', state: { ...this.state } };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // DETECTION (v9.1.0 - Simplified, trait-based)
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Language markers for personality detection
   */
  private static readonly LANGUAGE_MARKERS: Record<PersonalityProfile, string[]> = {
    neutral: [],
    technical: ['api', 'function', 'error', 'debug', 'implement', 'code', 'syntax', 'parameter', 'config', 'module', 'deploy', 'endpoint', 'schema', 'query', 'stack', 'runtime', 'async', 'webhook'],
    concise: ['quick', 'short', 'brief', 'tldr', 'summary', 'eli5', 'tl;dr', 'just tell me', 'bottom line', 'in a nutshell'],
    friendly: ['thanks', 'please', 'appreciate', 'wonderful', 'great', 'awesome', 'hey', 'hi', 'hello', 'sup', 'yo', 'hiya', 'howdy', 'cheers', 'thx', 'ty', 'tysm', 'cool', 'nice', 'sweet', 'dope', 'lit', 'fire', 'goated', 'based', 'w', 'bet', 'fs', 'ngl', 'imo', 'tbh', 'lowkey', 'highkey', 'fr', 'no cap', 'bruh', 'fam', 'bro', 'sis'],
    admin: ['admin', 'system', 'debug', 'diagnostics', 'internal', 'status', 'health', 'metrics', 'logs', 'circuit', 'provider', 'quota', 'uptime'],
    exploratory: ['how', 'what', 'why', 'explain', 'curious', 'wonder', 'learn', 'understand', 'explore', 'possible', 'imagine', 'could it', 'what about', 'tell me about', 'walk me through', 'show me', 'teach me'],
  };

  /**
   * Detect personality from input text
   */
  detect(input: string): PersonalityDetectionResult {
    const normalizedInput = input.toLowerCase();
    const scores: Record<PersonalityProfile, number> = {
      neutral: 0.1,
      technical: 0,
      concise: 0,
      friendly: 0,
      admin: 0,
      exploratory: 0,
    };

    const detectedMarkers: string[] = [];

    // Score each profile based on language markers
    for (const [profileId, markers] of Object.entries(PersonalityEngineClient.LANGUAGE_MARKERS)) {
      for (const marker of markers) {
        if (normalizedInput.includes(marker.toLowerCase())) {
          scores[profileId as PersonalityProfile] += 0.15;
          detectedMarkers.push(marker);
        }
      }
    }

    // Simple sentiment analysis
    const sentiment = this.analyzeSentiment(normalizedInput);
    
    // Boost friendly for positive sentiment
    if (sentiment > 0.3) scores.friendly += 0.15;
    
    // Boost admin for system-related queries
    if (/status|health|debug|system/i.test(normalizedInput)) scores.admin += 0.2;

    // Detect question patterns (exploratory indicator)
    if (/\?|^(what|how|why|when|where|who|which)/i.test(normalizedInput)) {
      scores.exploratory += 0.15;
    }

    // Detect brevity preference
    if (/\b(quick|fast|short|brief|tldr)\b/i.test(normalizedInput)) {
      scores.concise += 0.2;
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
    const positiveWords = ['good', 'great', 'awesome', 'thanks', 'helpful', 'love', 'amazing', 'excellent', 'perfect', 'wonderful', 'fire', 'goated', 'based', 'dope', 'lit', 'sick', 'clean', 'crispy', 'chef kiss', 'slaps', 'bussin', 'w', 'valid', 'peak', 'elite', 'mint', 'clutch', 'solid', 'nailed it', 'chef\'s kiss', 'banger', 'no cap'];
    const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'broken', 'stupid', 'useless', 'annoying', 'frustrating', 'wrong', 'trash', 'mid', 'ass', 'sus', 'cap', 'cringe', 'dead', 'cooked', 'wack', 'janky', 'scuffed', 'l', 'rip', 'fail', 'yikes', 'oof'];
    
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


  // ═══════════════════════════════════════════════════════════════════════════
  // INTERPRETATION (v9.1.0 - Trait-based)
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

    // Classify primary intent using traits for weighting
    const techBoost = profile.traits.technicality * 0.1;
    const directBoost = profile.traits.directness * 0.05;
    
    const intentScores = {
      query: this.scoreIntent(normalizedInput, 'query'),
      command: this.scoreIntent(normalizedInput, 'command') + directBoost,
      feedback: this.scoreIntent(normalizedInput, 'feedback'),
      exploration: this.scoreIntent(normalizedInput, 'exploration') + techBoost,
    };

    // Sort intents by score
    const sortedIntents = Object.entries(intentScores)
      .sort(([, a], [, b]) => b - a);

    const primaryIntent = sortedIntents[0][0];
    const secondaryIntent = sortedIntents[1][1] > 0.2 ? sortedIntents[1][0] : null;

    // Calculate confidence based on traits
    let confidence = Math.max(0, Math.min(1, sortedIntents[0][1]));
    confidence = Math.max(0, Math.min(1, confidence + (profile.traits.directness - 0.5) * 0.1));

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

    // Adjust confidence for ambiguity (based on directness trait)
    if (ambiguityFlags.length > 0) {
      const ambiguityPenalty = (1 - profile.traits.directness) * 0.1 * ambiguityFlags.length;
      confidence = Math.max(0.1, confidence - ambiguityPenalty);
    }

    // Determine escalation (lower directness = lower threshold = faster escalation)
    const escalationThreshold = 0.3 + profile.traits.directness * 0.3;
    const shouldEscalate = confidence < escalationThreshold;

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
        confidenceModified: true,
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
        /^(explain|describe|tell me|show me|walk me through|teach me|eli5|wdym|wym)/i,
        /\b(what's|whats|who's|whos|how's|hows)\b/i,
        /\b(wtf|tf|wth)\b/i,
      ],
      command: [
        /^(do|make|create|build|run|execute|start|stop|enable|disable|set|configure)/i,
        /^(please|can you|could you|would you|pls|plz).*(do|make|create|run|fix)/i,
        /!$/,
        /^(yo|hey|aye|bruh|bro|fam)\s+(do|make|create|run|fix|help)/i,
        /^(gimme|lemme|hook me up|hit me with|send|drop|ship)/i,
      ],
      feedback: [
        /^(i think|i feel|i believe|seems|appears|imo|tbh|ngl|lowkey|highkey)/i,
        /(not working|broken|bug|issue|problem|error|scuffed|janky|cooked|messed up)/i,
        /(love|hate|like|dislike|prefer|fw|don't fw|vibes|vibe|mid|goated|trash|fire|slaps)/i,
        /\b(w|l|rip|oof|yikes|sheesh|damn|bruh|bro)\b/i,
      ],
      exploration: [
        /^(how does|what if|imagine|suppose|consider)/i,
        /(possible|potential|explore|discover|learn|understand)/i,
        /\.\.\./,
        /\b(any way to|is there a|can it|what about|tell me more|deep dive|unpack)\b/i,
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
