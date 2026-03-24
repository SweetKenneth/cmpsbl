/**
 * Support Bot Engine
 * Governed Evolving Support System
 * 
 * A proof-of-concept for evolving software: learns from verified resolutions,
 * escalates uncertainty, and produces audit-safe responses.
 * 
 * Integrations with substrate architecture:
 * - 40 primitives across 4 categories (CORE, SYSTEM, CCR, OCG, Execution, ESZ, EPZ, EMZ, CSZ, Fields, Plane, Shell)
 * - BRAIN (CCR zone): Read-only recall + reinforcement for verified resolutions
 * - DECODE: Intent classification + sentiment detection
 * - VISION: Observability & monitoring
 * - SYSTEM (CCR zone): Ticket state + escalation hooks
 * - GOVERNANCE mesh overlay: Safety checks on responses
 * - KNOWLEDGE BASE: Pre-trained FAQ data for immediate utility
 * - NEXUS: Multi-provider AI routing for response generation
 *
 * MEMORY POLICY: On initialization, purge all previously learned support memories
 * so the bot relearns exclusively from the current knowledge base. This prevents
 * stale or incorrect architecture numbers from persisting in memory.
 */

import { memoryCore, MemoryEntry } from '../memory-core';
import { governanceGuard } from '../governance-guard';
import { telemetryEngine } from '../telemetry-engine';
import { 
  FULL_KNOWLEDGE_BASE, 
  KNOWLEDGE_CATEGORIES,
  type KnowledgeEntry,
  type KnowledgeCategory 
} from './knowledge-base';
import type {
  SupportBotState,
  SupportBotConfig,
  SupportBotPhase,
  SupportCommand,
  SupportCommandResult,
  SupportResponse,
  Resolution,
  SupportMemory,
  MemoryMatch,
  RecallResult,
  DetectedIntent,
  DetectedSentiment,
  IntentCategory,
  PainPattern,
  PatternAnalysis,
  LearningEvent,
  ConversationMessage,
  AuditEntry,
  EscalationReason,
  UserFeedback,
} from './types';

// ============================================================================
// Default Configuration
// ============================================================================

export const DEFAULT_SUPPORT_BOT_CONFIG: SupportBotConfig = {
  min_answer_confidence: 0.7,
  escalation_threshold: 0.5,
  learning_threshold: 0.8,
  max_warm_memories: 1000,
  memory_decay_rate: 0.01,
  recall_limit: 10,
  daily_learning_cap: 50,
  verification_required: true,
  auto_reinforce: false,
  include_explanations: true,
  suggest_follow_ups: true,
  max_response_length: 2000,
  auto_escalate_frustration: 0.8,
  human_available: true,
};

// ============================================================================
// Intent Keywords Map
// ============================================================================

const INTENT_KEYWORDS: Record<IntentCategory, string[]> = {
  question: ['what', 'how', 'why', 'when', 'where', 'which', 'who', 'can', 'does', 'is'],
  bug_report: ['bug', 'error', 'broken', 'crash', 'fail', 'issue', 'problem', 'wrong', 'not working'],
  feature_request: ['feature', 'request', 'add', 'want', 'need', 'could you', 'please add', 'wish'],
  how_to: ['how to', 'how do', 'tutorial', 'guide', 'steps', 'instructions', 'setup', 'configure'],
  troubleshoot: ['fix', 'solve', 'resolve', 'debug', 'troubleshoot', 'help', 'stuck', 'cant', "can't"],
  feedback: ['feedback', 'suggestion', 'improve', 'better', 'opinion', 'think', 'love', 'hate'],
  account: ['account', 'login', 'password', 'email', 'profile', 'settings', 'subscription', 'billing'],
  general: [],
};

// ============================================================================
// Support Bot Engine
// ============================================================================

export class SupportBotEngine {
  private state: SupportBotState;
  private phaseTrace: SupportBotPhase[] = [];

  constructor(config: Partial<SupportBotConfig> = {}) {
    this.state = {
      enabled: true,
      phase: 'idle',
      config: { ...DEFAULT_SUPPORT_BOT_CONFIG, ...config },
      learning: {
        total_memories: 0,
        verified_memories: 0,
        pending_verifications: 0,
        learning_events_today: 0,
        reinforcement_budget_remaining: config.daily_learning_cap ?? 50,
      },
      stats: {
        total_questions: 0,
        answered_by_bot: 0,
        escalated: 0,
        avg_confidence: 0,
        avg_satisfaction: 0,
        memories_created: 0,
        patterns_detected: 0,
        uptime_hours: 0,
        knowledge_base_entries: FULL_KNOWLEDGE_BASE.length,
        kb_matches_used: 0,
      },
    };

    // MEMORY WIPE: Purge all previously learned support memories on init.
    // The bot will relearn exclusively from the fresh knowledge base.
    this.purgeLearnedMemories();
  }

  /**
   * Wipe all support_learning memories from the brain.
   * Forces the bot to rely only on the current knowledge base.
   */
  private async purgeLearnedMemories(): Promise<void> {
    try {
      const result = await memoryCore.purgeBySource('support_learning');
      if (result.purged > 0) {
        console.log(`[SupportBot] Wiped ${result.purged} stale learned memories. Starting fresh from KB.`);
      }
      // Reset learning counters
      this.state.learning.total_memories = 0;
      this.state.learning.verified_memories = 0;
      this.state.learning.pending_verifications = 0;
    } catch (err) {
      console.warn('[SupportBot] Memory purge failed (non-fatal):', err);
    }
  }

  // ==========================================================================
  // Phase Management
  // ==========================================================================

  private setPhase(phase: SupportBotPhase): void {
    this.state.phase = phase;
    this.phaseTrace.push(phase);
    
    telemetryEngine.emit(
      'custom',
      'debug',
      { module: 'support.bot' },
      { metadata: { phase, trace_length: this.phaseTrace.length } }
    );
  }

  private resetPhaseTrace(): void {
    this.phaseTrace = [];
  }

  // ==========================================================================
  // Intent & Sentiment Detection (DECODE integration)
  // ==========================================================================

  private async detectIntent(question: string): Promise<DetectedIntent> {
    this.setPhase('understanding');
    
    const lowerQuestion = question.toLowerCase();
    
    // Score each category
    const scores: Record<IntentCategory, number> = {
      question: 0,
      bug_report: 0,
      feature_request: 0,
      how_to: 0,
      troubleshoot: 0,
      feedback: 0,
      account: 0,
      general: 0.1, // Base score
    };

    const matchedKeywords: string[] = [];

    for (const [category, keywords] of Object.entries(INTENT_KEYWORDS)) {
      for (const keyword of keywords) {
        if (lowerQuestion.includes(keyword)) {
          scores[category as IntentCategory] += keyword.split(' ').length * 0.2;
          matchedKeywords.push(keyword);
        }
      }
    }

    // Find primary and secondary
    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const [primary, primaryScore] = sorted[0];
    const [secondary] = sorted[1];

    return {
      primary,
      secondary: primaryScore > 0.3 ? secondary : undefined,
      confidence: Math.min(0.95, primaryScore + 0.3),
      keywords: matchedKeywords,
      category: primary as IntentCategory,
    };
  }

  private async detectSentiment(question: string): Promise<DetectedSentiment> {
    const lowerQuestion = question.toLowerCase();
    
    // Simple sentiment analysis
    const negativeWords = ['frustrated', 'angry', 'annoyed', 'terrible', 'awful', 'hate', 'broken', 'useless', 'worst'];
    const positiveWords = ['love', 'great', 'awesome', 'excellent', 'thanks', 'amazing', 'helpful', 'wonderful'];
    const urgentWords = ['urgent', 'asap', 'immediately', 'critical', 'emergency', 'now', 'help!'];

    let negScore = 0;
    let posScore = 0;
    let urgency = 0;

    for (const word of negativeWords) {
      if (lowerQuestion.includes(word)) negScore += 0.2;
    }
    for (const word of positiveWords) {
      if (lowerQuestion.includes(word)) posScore += 0.2;
    }
    for (const word of urgentWords) {
      if (lowerQuestion.includes(word)) urgency += 0.25;
    }

    // Check for frustration indicators
    const exclamationCount = (question.match(/!/g) || []).length;
    const capsRatio = (question.match(/[A-Z]/g) || []).length / question.length;
    const frustration = Math.min(1, negScore + exclamationCount * 0.1 + capsRatio * 0.5);

    const polarity = posScore > negScore ? 'positive' : negScore > posScore ? 'negative' : 'neutral';

    return {
      polarity,
      intensity: Math.min(1, Math.max(posScore, negScore)),
      frustration,
      urgency: Math.min(1, urgency),
    };
  }

  // ==========================================================================
  // Knowledge Base Search (Pre-trained FAQ matching)
  // ==========================================================================

  private searchKnowledgeBase(question: string, intent: DetectedIntent): MemoryMatch[] {
    const lowerQuestion = question.toLowerCase();
    const matches: MemoryMatch[] = [];

    for (const entry of FULL_KNOWLEDGE_BASE) {
      let score = 0;

      // Keyword matching
      const matchingKeywords = entry.keywords.filter(k => lowerQuestion.includes(k.toLowerCase()));
      score += matchingKeywords.length * 0.15;

      // Category match
      if (entry.category === intent.category) score += 0.25;

      // Question pattern similarity (simple word overlap)
      const questionWords = new Set(lowerQuestion.split(/\s+/));
      const patternWords = entry.question_pattern.toLowerCase().split(/\s+/);
      const overlap = patternWords.filter(w => questionWords.has(w)).length;
      score += overlap * 0.05;

      // Priority boost
      const priorityBoosts: Record<string, number> = {
        critical: 0.15,
        high: 0.1,
        medium: 0.05,
        low: 0,
      };
      score += priorityBoosts[entry.priority] || 0;

      // Only include if there's meaningful relevance
      if (score >= 0.2) {
        const supportMemory: SupportMemory = {
          id: entry.id,
          question_pattern: entry.question_pattern,
          answer: entry.answer,
          confidence: entry.confidence,
          times_used: 0,
          times_helpful: 0,
          times_escalated: 0,
          category: entry.category,
          keywords: entry.keywords,
          created_at: new Date().toISOString(),
          last_used_at: new Date().toISOString(),
          verified: entry.verified,
        };

        matches.push({
          memory: supportMemory,
          similarity: Math.min(1, score + 0.3), // Boost KB matches
          relevance_score: score,
          recency_boost: 1, // KB entries are always "fresh"
        });
      }
    }

    // Sort by similarity
    matches.sort((a, b) => b.similarity - a.similarity);
    return matches.slice(0, 5); // Top 5 KB matches
  }

  // ==========================================================================
  // Memory Recall (BRAIN integration + Knowledge Base)
  // ==========================================================================

  private async recallRelevantMemories(question: string, intent: DetectedIntent): Promise<RecallResult> {
    this.setPhase('recalling');
    
    const startTime = Date.now();
    
    // First, search the pre-trained knowledge base
    const kbMatches = this.searchKnowledgeBase(question, intent);
    
    try {
      // Query from memory core using the recall method (legacy alias for retrieve)
      const result = await memoryCore.recall(question, this.state.config.recall_limit);

      let memoryMatches: MemoryMatch[] = [];
      
      if (result.success && result.memories) {
        memoryMatches = result.memories.map((m: MemoryEntry, i: number) => ({
          memory: this.convertToSupportMemory(m),
          similarity: 1 - (i * 0.1), // Approximate similarity decay
          relevance_score: this.calculateRelevance(m, intent),
          recency_boost: this.calculateRecencyBoost(m.created_at || new Date().toISOString()),
        }));
      }

      // Merge KB matches with memory matches, prioritizing KB for high-confidence matches
      const allMatches = [...kbMatches, ...memoryMatches];
      
      // Sort by combined score
      allMatches.sort((a, b) => {
        const scoreA = a.similarity * 0.4 + a.relevance_score * 0.4 + a.recency_boost * 0.2;
        const scoreB = b.similarity * 0.4 + b.relevance_score * 0.4 + b.recency_boost * 0.2;
        return scoreB - scoreA;
      });

      // Dedupe by ID
      const seen = new Set<string>();
      const uniqueMatches = allMatches.filter(m => {
        if (seen.has(m.memory.id)) return false;
        seen.add(m.memory.id);
        return true;
      });

      return {
        matches: uniqueMatches.slice(0, this.state.config.recall_limit),
        total_searched: kbMatches.length + (result.memories?.length || 0),
        search_time_ms: Date.now() - startTime,
        coverage_score: uniqueMatches.length > 0 ? uniqueMatches[0].similarity : 0,
      };
    } catch (error) {
      console.error('Memory recall failed:', error);
      
      // Fall back to KB matches if memory recall fails
      if (kbMatches.length > 0) {
        return {
          matches: kbMatches,
          total_searched: kbMatches.length,
          search_time_ms: Date.now() - startTime,
          coverage_score: kbMatches[0].similarity,
        };
      }
      
      return {
        matches: [],
        total_searched: 0,
        search_time_ms: Date.now() - startTime,
        coverage_score: 0,
      };
    }
  }

  private convertToSupportMemory(m: MemoryEntry): SupportMemory {
    return {
      id: m.id || '',
      question_pattern: m.content?.substring(0, 200) || '',
      answer: (m.metadata?.answer as string) || m.content || '',
      confidence: m.confidence || 0.5,
      times_used: m.access_count || 0,
      times_helpful: (m.metadata?.times_helpful as number) || 0,
      times_escalated: (m.metadata?.times_escalated as number) || 0,
      category: (m.metadata?.category as IntentCategory) || 'general',
      keywords: m.tags || [],
      created_at: m.created_at || new Date().toISOString(),
      last_used_at: m.last_accessed || m.created_at || new Date().toISOString(),
      verified: (m.metadata?.verified as boolean) || false,
      source_resolution_id: m.metadata?.source_resolution_id as string | undefined,
    };
  }

  private calculateRelevance(memory: MemoryEntry, intent: DetectedIntent): number {
    let score = 0.3; // Base score
    
    // Category match
    if (memory.metadata?.category === intent.category) score += 0.3;
    
    // Keyword overlap
    const memoryKeywords = new Set(memory.tags || []);
    const matchingKeywords = intent.keywords.filter(k => memoryKeywords.has(k));
    score += matchingKeywords.length * 0.1;
    
    // Verified bonus
    if (memory.metadata?.verified) score += 0.2;
    
    return Math.min(1, score);
  }

  private calculateRecencyBoost(createdAt: string): number {
    const ageHours = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60);
    // Decay: full boost for <24h, decreasing over 30 days
    return Math.max(0, 1 - (ageHours / (24 * 30)));
  }

  // ==========================================================================
  // Response Generation (REASONING integration)
  // ==========================================================================

  private async generateResponse(
    question: string,
    intent: DetectedIntent,
    sentiment: DetectedSentiment,
    recall: RecallResult
  ): Promise<SupportResponse> {
    this.setPhase('reasoning');

    // Check if we should auto-escalate due to frustration
    if (sentiment.frustration >= this.state.config.auto_escalate_frustration) {
      return this.createEscalationResponse('user_requested', []);
    }

    // No memories found
    if (recall.matches.length === 0) {
      return this.createEscalationResponse('no_relevant_memory', []);
    }

    // Build response from best matches
    const topMatches = recall.matches.slice(0, 3);
    const avgConfidence = topMatches.reduce((sum, m) => sum + m.similarity * m.memory.confidence, 0) / topMatches.length;

    // Track KB usage - count matches that came from knowledge base (IDs starting with known prefixes)
    const kbPrefixes = ['codelab_', 'marketplace_', 'licensing_', 'general_'];
    const kbUsed = topMatches.filter(m => kbPrefixes.some(p => m.memory.id.startsWith(p))).length;
    if (kbUsed > 0) {
      this.state.stats.kb_matches_used += kbUsed;
    }

    // Check confidence threshold
    if (avgConfidence < this.state.config.escalation_threshold) {
      return this.createEscalationResponse('low_confidence', topMatches.map(m => m.memory));
    }

    // Synthesize answer from memories
    const answer = this.synthesizeAnswer(question, topMatches, intent);
    const explanation = this.state.config.include_explanations 
      ? this.generateExplanation(topMatches)
      : undefined;

    // Governance check
    this.setPhase('validating');
    const governanceResult = await this.checkGovernance(answer, question);
    
    if (!governanceResult.approved) {
      return this.createEscalationResponse('governance_block', topMatches.map(m => m.memory));
    }

    // Build final response
    const response: SupportResponse = {
      answer,
      explanation,
      confidence: avgConfidence,
      sources: topMatches.map(m => m.memory),
      suggested_actions: this.generateSuggestedActions(intent, topMatches),
      follow_up_questions: this.state.config.suggest_follow_ups 
        ? this.generateFollowUps(intent, recall)
        : undefined,
      escalation_available: this.state.config.human_available,
      governance_cleared: true,
    };

    // Ensure response length limit
    if (response.answer.length > this.state.config.max_response_length) {
      response.answer = response.answer.substring(0, this.state.config.max_response_length - 3) + '...';
    }

    return response;
  }

  private synthesizeAnswer(question: string, matches: MemoryMatch[], intent: DetectedIntent): string {
    if (matches.length === 0) return "I don't have enough information to answer that.";

    const primary = matches[0].memory;
    let answer = primary.answer;

    // Add context from secondary matches if relevant
    if (matches.length > 1 && matches[1].similarity > 0.7) {
      const secondary = matches[1].memory;
      if (secondary.category === primary.category) {
        answer += `\n\nAdditionally: ${secondary.answer.substring(0, 200)}`;
      }
    }

    return answer;
  }

  private generateExplanation(matches: MemoryMatch[]): string {
    const sources = matches.map(m => 
      `• "${m.memory.question_pattern.substring(0, 50)}..." (${Math.round(m.similarity * 100)}% match, verified: ${m.memory.verified})`
    ).join('\n');

    return `This answer was synthesized from ${matches.length} related support memory entries:\n${sources}`;
  }

  private generateSuggestedActions(intent: DetectedIntent, matches: MemoryMatch[]): SupportResponse['suggested_actions'] {
    const actions: SupportResponse['suggested_actions'] = [];

    // Always offer escalation if available
    if (this.state.config.human_available) {
      actions.push({
        type: 'escalate',
        label: 'Talk to a human',
        target: 'escalate',
        confidence: 1,
      });
    }

    // Category-specific suggestions
    if (intent.category === 'how_to') {
      actions.push({
        type: 'doc',
        label: 'View documentation',
        target: '/docs',
        confidence: 0.8,
      });
    }

    if (intent.category === 'bug_report') {
      actions.push({
        type: 'command',
        label: 'Report this issue',
        target: 'system.report_bug',
        confidence: 0.9,
      });
    }

    return actions;
  }

  private generateFollowUps(intent: DetectedIntent, recall: RecallResult): string[] {
    const followUps: string[] = [];

    if (intent.category === 'troubleshoot') {
      followUps.push('Did this resolve your issue?');
      followUps.push('Would you like me to explain the steps in more detail?');
    }

    if (intent.category === 'how_to') {
      followUps.push('Would you like a step-by-step walkthrough?');
    }

    if (recall.coverage_score < 0.6) {
      followUps.push('Can you provide more details about your situation?');
    }

    return followUps.slice(0, 3);
  }

  private createEscalationResponse(reason: EscalationReason, sources: SupportMemory[]): SupportResponse {
    this.setPhase('escalating');

    const messages: Record<EscalationReason, string> = {
      low_confidence: "I'm not confident enough to provide a reliable answer. Let me connect you with someone who can help.",
      ambiguous_intent: "I'm having trouble understanding exactly what you need. Could you rephrase, or would you prefer to speak with a human?",
      no_relevant_memory: "I don't have experience with this specific issue yet. Let me escalate to a human who can help and learn from their solution.",
      governance_block: "I can't provide this type of answer directly. Let me connect you with a team member.",
      user_requested: "I sense this is urgent or complex. Let me get a human involved right away.",
      complex_issue: "This seems like a complex issue that needs human expertise. Escalating now.",
      sensitive_topic: "This topic requires human judgment. Connecting you now.",
    };

    return {
      answer: messages[reason],
      confidence: 0,
      sources,
      escalation_available: this.state.config.human_available,
      governance_cleared: true,
    };
  }

  // ==========================================================================
  // Governance Check
  // ==========================================================================

  private async checkGovernance(answer: string, question: string): Promise<{ approved: boolean; reason?: string }> {
    try {
      const result = await governanceGuard.coherenceValidation({
        content: answer,
        context: question,
        source: 'support_bot',
      });

      return {
        approved: result.success && !result.blocked,
        reason: result.blocked ? result.error : undefined,
      };
    } catch {
      // Default to approved if governance check fails
      return { approved: true };
    }
  }

  // ==========================================================================
  // Learning from Resolutions
  // ==========================================================================

  async learnFromResolution(resolutionId: string): Promise<LearningEvent | null> {
    this.setPhase('learning');

    // Check daily cap
    if (this.state.learning.learning_events_today >= this.state.config.daily_learning_cap) {
      console.warn('Daily learning cap reached');
      return null;
    }

    try {
      // Fetch resolution (simulated - would query from support_resolutions table)
      const resolution = await this.fetchResolution(resolutionId);
      
      if (!resolution) {
        throw new Error('Resolution not found');
      }

      // Verify the resolution is marked as verified
      if (this.state.config.verification_required && resolution.verification !== 'verified') {
        console.warn('Resolution not verified, skipping learning');
        return null;
      }

      // Create or reinforce memory - store in WARM tier only (as per spec)
      await memoryCore.ingest(
        JSON.stringify({
          question_pattern: resolution.ticket_id,
          answer: resolution.answer,
          explanation: resolution.explanation,
        }),
        {
          type: 'general',
          source: 'support_learning',
          confidence: resolution.confidence,
          tags: ['support', 'verified', 'warm-tier'],
          metadata: {
            category: 'general' as IntentCategory,
            verified: true,
            source_resolution_id: resolutionId,
          },
        }
      );

      // Record learning event
      const learningEvent: LearningEvent = {
        id: `le_${Date.now()}`,
        resolution_id: resolutionId,
        memory_id: `mem_${Date.now()}`,
        reinforcement_type: 'positive',
        delta: resolution.confidence * 0.1,
        reason: 'Learned from verified resolution',
        created_at: new Date().toISOString(),
      };

      // Update learning state
      this.state.learning.learning_events_today++;
      this.state.learning.reinforcement_budget_remaining--;
      this.state.learning.last_learning_at = new Date().toISOString();
      this.state.stats.memories_created++;

      // Emit telemetry
      telemetryEngine.emit(
        'custom',
        'info',
        { module: 'support.bot' },
        { metadata: { resolution_id: resolutionId, delta: learningEvent.delta } }
      );

      return learningEvent;
    } catch (error) {
      console.error('Learning failed:', error);
      return null;
    }
  }

  private async fetchResolution(resolutionId: string): Promise<Resolution | null> {
    try {
      // Query memory for verified resolutions
      const recall = await this.recall(`resolution:${resolutionId}`, 1);
      if (recall.memories.length > 0) {
        const memory = recall.memories[0];
        const parsed = typeof memory.content === 'string' ? JSON.parse(memory.content) : memory.content;
        return {
          id: resolutionId,
          ticket_id: parsed.ticket_id ?? resolutionId,
          answer: parsed.answer ?? memory.content,
          explanation: parsed.explanation ?? '',
          confidence: memory.confidence ?? parsed.confidence ?? 0,
          sources: parsed.sources ?? [],
          resolved_by: parsed.resolved_by ?? 'system',
          verification: parsed.verification ?? 'unverified',
          learning_applied: parsed.learning_applied ?? false,
          created_at: memory.created_at ?? new Date().toISOString(),
        };
      }
      return null;
    } catch {
      return null;
    }
  }

  // ==========================================================================
  // Pattern Detection (VISION integration)
  // ==========================================================================

  async detectPatterns(lookbackDays: number = 7): Promise<PatternAnalysis> {
    // Query recent support interactions and identify patterns
    const patterns: PainPattern[] = [];
    
    // This would analyze support history for recurring issues
    // Simulated pattern detection
    const analysis: PatternAnalysis = {
      patterns,
      emerging_issues: [],
      resolved_patterns: [],
      health_score: 0.85,
    };

    this.state.stats.patterns_detected = patterns.length;
    return analysis;
  }

  // ==========================================================================
  // Audit & Compliance
  // ==========================================================================

  private async createAuditEntry(
    question: string,
    response: SupportResponse,
    sessionId: string
  ): Promise<AuditEntry> {
    const entry: AuditEntry = {
      id: `audit_${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'support_response',
      phase: this.state.phase,
      input_hash: this.hashInput(question),
      output_summary: response.answer.substring(0, 100),
      confidence: response.confidence,
      escalated: !response.governance_cleared || response.confidence < this.state.config.min_answer_confidence,
      memory_ids: response.sources.map(s => s.id),
      governance_result: response.governance_cleared,
      session_id: sessionId,
    };

    // Would persist to audit log table
    return entry;
  }

  private hashInput(input: string): string {
    // Simple hash for privacy - in production use crypto
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return `h_${Math.abs(hash).toString(16)}`;
  }

  // ==========================================================================
  // Command Execution
  // ==========================================================================

  async execute(command: SupportCommand): Promise<SupportCommandResult> {
    const startTime = Date.now();
    this.resetPhaseTrace();
    this.setPhase('idle');

    try {
      let data: unknown;

      switch (command.type) {
        case 'ask':
          data = await this.handleAsk(command.question);
          break;

        case 'explain':
          data = await this.handleExplain(command.issue_id);
          break;

        case 'learn':
          data = await this.learnFromResolution(command.resolution_id);
          break;

        case 'escalate':
          data = await this.handleEscalate(command.reason);
          break;

        case 'feedback':
          data = await this.handleFeedback(command.ticket_id, command.feedback);
          break;

        case 'patterns':
          data = await this.detectPatterns(command.lookback_days);
          break;

        case 'status':
          data = this.getState();
          break;

        case 'history':
          data = this.getConversationHistory(command.limit);
          break;

        case 'purge_session':
          data = this.purgeSession();
          break;

        case 'configure':
          data = this.updateConfig(command.config);
          break;

        case 'knowledge_base':
          data = this.handleKnowledgeBase(command.action, command.query);
          break;

        default:
          throw new Error(`Unknown command type`);
      }

      this.setPhase('idle');

      return {
        success: true,
        command: command.type,
        data,
        duration_ms: Date.now() - startTime,
        phase_trace: [...this.phaseTrace],
      };
    } catch (error) {
      this.setPhase('idle');
      return {
        success: false,
        command: command.type,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration_ms: Date.now() - startTime,
        phase_trace: [...this.phaseTrace],
      };
    }
  }

  // ==========================================================================
  // Command Handlers
  // ==========================================================================

  private async handleAsk(question: string): Promise<SupportResponse> {
    // Update stats
    this.state.stats.total_questions++;

    // Detect intent and sentiment
    const intent = await this.detectIntent(question);
    const sentiment = await this.detectSentiment(question);

    // Recall relevant memories
    const recall = await this.recallRelevantMemories(question, intent);

    // Generate response
    this.setPhase('responding');
    const response = await this.generateResponse(question, intent, sentiment, recall);

    // Update stats based on response
    if (response.confidence >= this.state.config.min_answer_confidence) {
      this.state.stats.answered_by_bot++;
      this.state.stats.avg_confidence = 
        (this.state.stats.avg_confidence * (this.state.stats.answered_by_bot - 1) + response.confidence) / 
        this.state.stats.answered_by_bot;
    } else {
      this.state.stats.escalated++;
    }

    // Add to conversation history
    const sessionId = this.state.current_session?.session_id || `session_${Date.now()}`;
    if (!this.state.current_session) {
      this.state.current_session = {
        session_id: sessionId,
        started_at: new Date().toISOString(),
        messages: [],
        context: {},
      };
    }

    this.state.current_session.messages.push(
      {
        id: `msg_${Date.now()}_user`,
        role: 'user',
        content: question,
        timestamp: new Date().toISOString(),
        metadata: { intent, sentiment },
      },
      {
        id: `msg_${Date.now()}_bot`,
        role: 'bot',
        content: response.answer,
        timestamp: new Date().toISOString(),
        metadata: { confidence: response.confidence, sources: response.sources.map(s => s.id) },
      }
    );

    // Create audit entry
    await this.createAuditEntry(question, response, sessionId);

    return response;
  }

  private async handleExplain(issueId: string): Promise<{ explanation: string; sources: string[] }> {
    // Would fetch issue details and provide explanation
    return {
      explanation: `Explanation for issue ${issueId}: This issue was identified based on pattern analysis and resolved using verified solution templates.`,
      sources: ['doc_001', 'resolution_042'],
    };
  }

  private async handleEscalate(reason?: EscalationReason): Promise<{ escalated: boolean; ticket_id: string }> {
    const ticketId = `esc_${Date.now()}`;
    
    telemetryEngine.emit(
      'custom',
      'warn',
      { module: 'support.bot' },
      { metadata: { reason, ticket_id: ticketId } }
    );

    return { escalated: true, ticket_id: ticketId };
  }

  private async handleFeedback(ticketId: string, feedback: UserFeedback): Promise<{ recorded: boolean }> {
    // Record feedback and potentially trigger learning
    if (feedback.helpful && feedback.rating && feedback.rating >= 4) {
      // Could trigger positive reinforcement
      telemetryEngine.emit(
        'custom',
        'info',
        { module: 'support.bot' },
        { metadata: { ticket_id: ticketId, rating: feedback.rating } }
      );
    }

    return { recorded: true };
  }

  private getConversationHistory(limit: number = 20): ConversationMessage[] {
    return this.state.current_session?.messages.slice(-limit) || [];
  }

  private purgeSession(): { purged: boolean } {
    this.state.current_session = undefined;
    return { purged: true };
  }

  private updateConfig(config: Partial<SupportBotConfig>): SupportBotConfig {
    this.state.config = { ...this.state.config, ...config };
    return this.state.config;
  }

  private handleKnowledgeBase(
    action: 'list' | 'stats' | 'search' = 'stats',
    query?: string
  ): {
    action: string;
    total_entries: number;
    categories: Record<string, number>;
    entries?: Array<{ id: string; question: string; category: string; priority: string }>;
    search_results?: Array<{ id: string; question: string; answer: string; score: number }>;
  } {
    const categoryStats: Record<string, number> = {
      platform: KNOWLEDGE_CATEGORIES.platform.length,
      pricing: KNOWLEDGE_CATEGORIES.pricing.length,
      getting_started: KNOWLEDGE_CATEGORIES.getting_started.length,
      security: KNOWLEDGE_CATEGORIES.security.length,
      support: KNOWLEDGE_CATEGORIES.support.length,
    };

    const result: ReturnType<typeof this.handleKnowledgeBase> = {
      action,
      total_entries: FULL_KNOWLEDGE_BASE.length,
      categories: categoryStats,
    };

    if (action === 'list') {
      result.entries = FULL_KNOWLEDGE_BASE.map(e => ({
        id: e.id,
        question: e.question_pattern,
        category: e.category,
        priority: e.priority,
      }));
    }

    if (action === 'search' && query) {
      const lowerQuery = query.toLowerCase();
      const matches = FULL_KNOWLEDGE_BASE
        .map(entry => {
          let score = 0;
          // Keyword match
          entry.keywords.forEach(k => {
            if (lowerQuery.includes(k.toLowerCase())) score += 0.2;
          });
          // Question pattern match
          if (entry.question_pattern.toLowerCase().includes(lowerQuery)) score += 0.5;
          // Content match
          if (entry.answer.toLowerCase().includes(lowerQuery)) score += 0.3;
          return { entry, score };
        })
        .filter(m => m.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);

      result.search_results = matches.map(m => ({
        id: m.entry.id,
        question: m.entry.question_pattern,
        answer: m.entry.answer.substring(0, 200) + (m.entry.answer.length > 200 ? '...' : ''),
        score: m.score,
      }));
    }

    return result;
  }

  // ==========================================================================
  // State Access
  // ==========================================================================

  getState(): SupportBotState {
    return { ...this.state };
  }

  isEnabled(): boolean {
    return this.state.enabled;
  }

  enable(): void {
    this.state.enabled = true;
  }

  disable(): void {
    this.state.enabled = false;
  }
}

// ============================================================================
// Singleton Export
// ============================================================================

export const supportBot = new SupportBotEngine();

// Re-export types and knowledge base
export * from './types';
export { 
  FULL_KNOWLEDGE_BASE, 
  KNOWLEDGE_CATEGORIES,
  PLATFORM_KNOWLEDGE,
  PRICING_KNOWLEDGE,
  GETTING_STARTED_KNOWLEDGE,
  SECURITY_KNOWLEDGE,
  SUPPORT_KNOWLEDGE,
  type KnowledgeEntry,
  type KnowledgeCategory,
} from './knowledge-base';
