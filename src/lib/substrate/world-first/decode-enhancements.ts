/**
 * DECODE Module Enhancements — v10.5.4 ARCHITECT Epoch
 * IntentAmplifier, ContextualParser, EmotionDetector, MultimodalFusion
 */

// ═══════════════════════════════════════════════════════════════════════════════
// INTENT AMPLIFIER — Weak signal boosting for unclear intents
// ═══════════════════════════════════════════════════════════════════════════════

interface IntentSignal {
  intent: string;
  confidence: number;
  source: 'explicit' | 'implicit' | 'contextual';
}

interface AmplificationResult {
  originalIntent: string;
  originalConfidence: number;
  amplifiedConfidence: number;
  supportingSignals: IntentSignal[];
  amplificationFactor: number;
}

export class IntentAmplifier {
  private signalHistory: IntentSignal[] = [];
  private contextWindow: number = 10;
  private amplificationThreshold: number = 0.4;

  /** Record an intent signal */
  recordSignal(intent: string, confidence: number, source: IntentSignal['source']): void {
    this.signalHistory.push({
      intent,
      confidence,
      source,
    });

    if (this.signalHistory.length > 100) {
      this.signalHistory.shift();
    }
  }

  /** Amplify a weak intent signal using context */
  amplify(intent: string, baseConfidence: number): AmplificationResult {
    // Find supporting signals from history
    const recentSignals = this.signalHistory.slice(-this.contextWindow);
    const supportingSignals = recentSignals.filter(s => 
      this.calculateSimilarity(s.intent, intent) > 0.6
    );

    // Calculate amplification factor
    let amplificationFactor = 1.0;
    
    if (supportingSignals.length > 0) {
      // Boost based on supporting evidence
      const avgSupportConfidence = supportingSignals.reduce((a, b) => a + b.confidence, 0) / supportingSignals.length;
      amplificationFactor += (avgSupportConfidence * 0.3) * (supportingSignals.length / this.contextWindow);
    }

    // Explicit signals get extra boost
    const explicitSupport = supportingSignals.filter(s => s.source === 'explicit');
    if (explicitSupport.length > 0) {
      amplificationFactor += 0.2;
    }

    const amplifiedConfidence = Math.min(1, baseConfidence * amplificationFactor);

    return {
      originalIntent: intent,
      originalConfidence: baseConfidence,
      amplifiedConfidence,
      supportingSignals,
      amplificationFactor,
    };
  }

  /** Check if intent should be accepted after amplification */
  shouldAccept(intent: string, baseConfidence: number, acceptThreshold: number = 0.7): boolean {
    if (baseConfidence >= acceptThreshold) return true;
    if (baseConfidence < this.amplificationThreshold) return false;

    const result = this.amplify(intent, baseConfidence);
    return result.amplifiedConfidence >= acceptThreshold;
  }

  private calculateSimilarity(a: string, b: string): number {
    const wordsA = new Set(a.toLowerCase().split(/\s+/));
    const wordsB = new Set(b.toLowerCase().split(/\s+/));
    const intersection = [...wordsA].filter(w => wordsB.has(w)).length;
    const union = wordsA.size + wordsB.size - intersection;
    return union > 0 ? intersection / union : 0;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONTEXTUAL PARSER — Context-aware parsing with memory
// ═══════════════════════════════════════════════════════════════════════════════

interface ParsingContext {
  conversationHistory: string[];
  userProfile: Record<string, unknown>;
  sessionState: Record<string, unknown>;
  domainHints: string[];
}

interface ParseResult {
  parsedIntent: string;
  entities: Array<{ name: string; value: string; confidence: number }>;
  context: ParsingContext;
  ambiguities: string[];
  suggestions: string[];
}

export class ContextualParser {
  private context: ParsingContext = {
    conversationHistory: [],
    userProfile: {},
    sessionState: {},
    domainHints: [],
  };

  /** Update context */
  updateContext(updates: Partial<ParsingContext>): void {
    if (updates.conversationHistory) {
      this.context.conversationHistory.push(...updates.conversationHistory);
      if (this.context.conversationHistory.length > 50) {
        this.context.conversationHistory = this.context.conversationHistory.slice(-50);
      }
    }
    if (updates.userProfile) {
      Object.assign(this.context.userProfile, updates.userProfile);
    }
    if (updates.sessionState) {
      Object.assign(this.context.sessionState, updates.sessionState);
    }
    if (updates.domainHints) {
      this.context.domainHints = [...new Set([...this.context.domainHints, ...updates.domainHints])].slice(-20);
    }
  }

  /** Parse input with context awareness */
  parse(input: string): ParseResult {
    const entities: ParseResult['entities'] = [];
    const ambiguities: string[] = [];
    const suggestions: string[] = [];

    // Extract entities
    const patterns = [
      { regex: /(?:my name is |i'm |i am )(\w+)/i, entity: 'user_name' },
      { regex: /(\d+)\s*(dollars?|usd|\$)/i, entity: 'amount' },
      { regex: /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i, entity: 'date' },
      { regex: /(tomorrow|today|yesterday|next week)/i, entity: 'relative_date' },
    ];

    for (const { regex, entity } of patterns) {
      const match = input.match(regex);
      if (match) {
        entities.push({
          name: entity,
          value: match[1],
          confidence: 0.9,
        });
      }
    }

    // Resolve ambiguities using context
    const pronouns = input.match(/\b(it|this|that|they|them)\b/gi);
    if (pronouns && pronouns.length > 0) {
      const lastMentioned = this.context.sessionState['lastMentionedEntity'];
      if (lastMentioned) {
        entities.push({
          name: 'resolved_reference',
          value: String(lastMentioned),
          confidence: 0.7,
        });
      } else {
        ambiguities.push(`Ambiguous pronoun: "${pronouns[0]}" - please clarify`);
      }
    }

    // Generate suggestions based on domain hints
    if (this.context.domainHints.length > 0) {
      suggestions.push(`Context: ${this.context.domainHints.slice(0, 3).join(', ')}`);
    }

    // Detect intent
    const parsedIntent = this.detectIntent(input);

    return {
      parsedIntent,
      entities,
      context: { ...this.context },
      ambiguities,
      suggestions,
    };
  }

  private detectIntent(input: string): string {
    const intentPatterns: Array<{ patterns: RegExp[]; intent: string }> = [
      { patterns: [/help|assist|support/i], intent: 'request_help' },
      { patterns: [/buy|purchase|order/i], intent: 'purchase' },
      { patterns: [/cancel|stop|nevermind/i], intent: 'cancel' },
      { patterns: [/show|display|list/i], intent: 'query' },
      { patterns: [/create|make|add|new/i], intent: 'create' },
      { patterns: [/update|change|modify|edit/i], intent: 'update' },
      { patterns: [/delete|remove/i], intent: 'delete' },
    ];

    for (const { patterns, intent } of intentPatterns) {
      if (patterns.some(p => p.test(input))) {
        return intent;
      }
    }

    return 'unknown';
  }

  /** Clear context */
  clearContext(): void {
    this.context = {
      conversationHistory: [],
      userProfile: {},
      sessionState: {},
      domainHints: [],
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EMOTION DETECTOR — Sentiment and emotional state analysis
// ═══════════════════════════════════════════════════════════════════════════════

interface EmotionProfile {
  primary: string;
  secondary?: string;
  valence: number;      // -1 to 1
  arousal: number;      // 0 to 1
  confidence: number;
}

interface EmotionHistory {
  emotions: EmotionProfile[];
  trend: 'positive' | 'negative' | 'stable' | 'volatile';
  avgValence: number;
}

export class EmotionDetector {
  private history: Array<EmotionProfile & { timestamp: number }> = [];
  
  private emotionLexicon: Record<string, { emotion: string; valence: number; arousal: number }> = {
    // Positive emotions
    'happy': { emotion: 'joy', valence: 0.8, arousal: 0.6 },
    'excited': { emotion: 'excitement', valence: 0.9, arousal: 0.9 },
    'grateful': { emotion: 'gratitude', valence: 0.8, arousal: 0.3 },
    'love': { emotion: 'love', valence: 0.9, arousal: 0.5 },
    'amazing': { emotion: 'joy', valence: 0.9, arousal: 0.7 },
    'great': { emotion: 'joy', valence: 0.7, arousal: 0.5 },
    'thanks': { emotion: 'gratitude', valence: 0.7, arousal: 0.3 },
    // Negative emotions
    'angry': { emotion: 'anger', valence: -0.8, arousal: 0.9 },
    'frustrated': { emotion: 'frustration', valence: -0.6, arousal: 0.7 },
    'sad': { emotion: 'sadness', valence: -0.7, arousal: 0.2 },
    'worried': { emotion: 'anxiety', valence: -0.5, arousal: 0.6 },
    'disappointed': { emotion: 'disappointment', valence: -0.6, arousal: 0.3 },
    'hate': { emotion: 'anger', valence: -0.9, arousal: 0.8 },
    'terrible': { emotion: 'distress', valence: -0.8, arousal: 0.6 },
    // Neutral/mixed
    'confused': { emotion: 'confusion', valence: -0.2, arousal: 0.5 },
    'curious': { emotion: 'curiosity', valence: 0.3, arousal: 0.6 },
    'surprised': { emotion: 'surprise', valence: 0.1, arousal: 0.8 },
  };

  /** Detect emotions from text */
  detect(text: string): EmotionProfile {
    const words = text.toLowerCase().split(/\s+/);
    const detectedEmotions: Array<{ emotion: string; valence: number; arousal: number }> = [];

    for (const word of words) {
      const match = this.emotionLexicon[word];
      if (match) {
        detectedEmotions.push(match);
      }
    }

    if (detectedEmotions.length === 0) {
      // Check for punctuation-based signals
      if (text.includes('!')) {
        detectedEmotions.push({ emotion: 'emphasis', valence: 0, arousal: 0.5 });
      }
      if (text.includes('?')) {
        detectedEmotions.push({ emotion: 'uncertainty', valence: 0, arousal: 0.3 });
      }
    }

    // Aggregate emotions
    const profile = this.aggregateEmotions(detectedEmotions);
    
    // Store in history
    this.history.push({
      ...profile,
      timestamp: Date.now(),
    });
    if (this.history.length > 100) this.history.shift();

    return profile;
  }

  private aggregateEmotions(emotions: Array<{ emotion: string; valence: number; arousal: number }>): EmotionProfile {
    if (emotions.length === 0) {
      return {
        primary: 'neutral',
        valence: 0,
        arousal: 0.3,
        confidence: 0.3,
      };
    }

    // Count emotion frequencies
    const counts = new Map<string, number>();
    let totalValence = 0;
    let totalArousal = 0;

    for (const e of emotions) {
      counts.set(e.emotion, (counts.get(e.emotion) || 0) + 1);
      totalValence += e.valence;
      totalArousal += e.arousal;
    }

    // Find primary and secondary emotions
    const sorted = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
    const primary = sorted[0][0];
    const secondary = sorted[1]?.[0];

    return {
      primary,
      secondary,
      valence: totalValence / emotions.length,
      arousal: totalArousal / emotions.length,
      confidence: Math.min(1, emotions.length / 3),
    };
  }

  /** Get emotional history analysis */
  getHistory(timeWindowMs: number = 3600000): EmotionHistory {
    const now = Date.now();
    const recentEmotions = this.history.filter(e => now - e.timestamp < timeWindowMs);

    if (recentEmotions.length === 0) {
      return {
        emotions: [],
        trend: 'stable',
        avgValence: 0,
      };
    }

    // Calculate trend
    const midpoint = Math.floor(recentEmotions.length / 2);
    const oldAvg = recentEmotions.slice(0, midpoint).reduce((a, b) => a + b.valence, 0) / midpoint || 0;
    const newAvg = recentEmotions.slice(midpoint).reduce((a, b) => a + b.valence, 0) / (recentEmotions.length - midpoint) || 0;
    
    // Calculate variance for volatility
    const avgValence = recentEmotions.reduce((a, b) => a + b.valence, 0) / recentEmotions.length;
    const variance = recentEmotions.reduce((a, b) => a + Math.pow(b.valence - avgValence, 2), 0) / recentEmotions.length;

    let trend: EmotionHistory['trend'] = 'stable';
    if (variance > 0.25) trend = 'volatile';
    else if (newAvg - oldAvg > 0.2) trend = 'positive';
    else if (newAvg - oldAvg < -0.2) trend = 'negative';

    return {
      emotions: recentEmotions,
      trend,
      avgValence,
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// MULTIMODAL FUSION — Combining text, voice, image inputs
// ═══════════════════════════════════════════════════════════════════════════════

interface ModalityInput {
  type: 'text' | 'voice' | 'image' | 'gesture';
  content: unknown;
  confidence: number;
  timestamp: number;
}

interface FusionResult {
  primaryIntent: string;
  confidence: number;
  modalities: string[];
  fusionMethod: 'early' | 'late' | 'hybrid';
  coherence: number;
  disambiguated: boolean;
}

export class MultimodalFusion {
  private buffer: ModalityInput[] = [];
  private fusionWindow: number = 2000; // ms
  private weights: Record<ModalityInput['type'], number> = {
    text: 1.0,
    voice: 0.9,
    image: 0.7,
    gesture: 0.5,
  };

  /** Add input from a modality */
  addInput(type: ModalityInput['type'], content: unknown, confidence: number): void {
    this.buffer.push({
      type,
      content,
      confidence,
      timestamp: Date.now(),
    });

    // Prune old inputs
    const cutoff = Date.now() - this.fusionWindow * 2;
    this.buffer = this.buffer.filter(i => i.timestamp > cutoff);
  }

  /** Fuse recent multimodal inputs */
  fuse(): FusionResult {
    const now = Date.now();
    const recentInputs = this.buffer.filter(i => now - i.timestamp < this.fusionWindow);

    if (recentInputs.length === 0) {
      return {
        primaryIntent: 'none',
        confidence: 0,
        modalities: [],
        fusionMethod: 'late',
        coherence: 0,
        disambiguated: false,
      };
    }

    // Determine fusion method based on input count
    let fusionMethod: FusionResult['fusionMethod'] = 'late';
    if (recentInputs.length >= 3) {
      fusionMethod = 'hybrid';
    } else if (recentInputs.length === 1) {
      fusionMethod = 'early';
    }

    // Calculate weighted confidence
    let totalWeight = 0;
    let weightedConfidence = 0;
    const intents: Map<string, number> = new Map();

    for (const input of recentInputs) {
      const weight = this.weights[input.type];
      totalWeight += weight;
      weightedConfidence += input.confidence * weight;

      // Extract intent from content (simplified)
      const intent = this.extractIntent(input);
      intents.set(intent, (intents.get(intent) || 0) + weight);
    }

    // Find primary intent
    const sortedIntents = Array.from(intents.entries()).sort((a, b) => b[1] - a[1]);
    const primaryIntent = sortedIntents[0]?.[0] || 'unknown';

    // Calculate coherence (agreement between modalities)
    const coherence = sortedIntents.length > 0 
      ? sortedIntents[0][1] / totalWeight 
      : 0;

    // Check if fusion helped disambiguate
    const maxSingleConfidence = Math.max(...recentInputs.map(i => i.confidence));
    const fusedConfidence = totalWeight > 0 ? weightedConfidence / totalWeight : 0;
    const disambiguated = fusedConfidence > maxSingleConfidence;

    return {
      primaryIntent,
      confidence: fusedConfidence,
      modalities: [...new Set(recentInputs.map(i => i.type))],
      fusionMethod,
      coherence,
      disambiguated,
    };
  }

  private extractIntent(input: ModalityInput): string {
    // Simplified intent extraction based on modality
    if (input.type === 'text' && typeof input.content === 'string') {
      if (input.content.includes('help')) return 'help';
      if (input.content.includes('stop')) return 'stop';
      return 'query';
    }
    if (input.type === 'gesture' && typeof input.content === 'string') {
      if (input.content === 'wave') return 'greeting';
      if (input.content === 'thumbs_up') return 'confirm';
      if (input.content === 'thumbs_down') return 'reject';
    }
    return 'unknown';
  }

  /** Set modality weights */
  setWeights(weights: Partial<Record<ModalityInput['type'], number>>): void {
    Object.assign(this.weights, weights);
  }

  /** Get modality statistics */
  getStats(): Record<ModalityInput['type'], { count: number; avgConfidence: number }> {
    const stats: Record<string, { count: number; totalConfidence: number }> = {};
    
    for (const input of this.buffer) {
      if (!stats[input.type]) {
        stats[input.type] = { count: 0, totalConfidence: 0 };
      }
      stats[input.type].count++;
      stats[input.type].totalConfidence += input.confidence;
    }

    const result: Record<string, { count: number; avgConfidence: number }> = {};
    for (const [type, { count, totalConfidence }] of Object.entries(stats)) {
      result[type] = { count, avgConfidence: count > 0 ? totalConfidence / count : 0 };
    }

    return result as Record<ModalityInput['type'], { count: number; avgConfidence: number }>;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export const decodeEnhancements = {
  IntentAmplifier,
  ContextualParser,
  EmotionDetector,
  MultimodalFusion,
};

export type {
  IntentSignal,
  AmplificationResult,
  ParsingContext,
  ParseResult,
  EmotionProfile,
  EmotionHistory,
  ModalityInput,
  FusionResult,
};
