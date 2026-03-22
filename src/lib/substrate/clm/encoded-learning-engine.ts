/**
 * Encoded Learning Engine
 * v10.5.4 ARCHITECT — 24/7 continuous learning for code-writing mastery
 * 
 * This engine runs permanently, studying code patterns, analyzing mistakes,
 * and improving Encoded's ability to write better code.
 */

import { supabase } from '@/integrations/supabase/client';
import { secureGet, secureSet } from '@/lib/system/secureStorage';
import { budgetGovernor } from './budget-governor';
import { ENCODED_CODE_CURRICULUM, getEncodedCurriculum, type Topic } from './encoded-curriculum';
import { learningEngine } from '../learning-engine';
import { memoryCore } from '../memory-core';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface CodeLearningJob {
  id: string;
  topic: Topic;
  prompt: string;
  systemPrompt: string;
  focus: 'pattern' | 'anti-pattern' | 'best-practice' | 'technique' | 'review';
  estimatedUnits: number;
  createdAt: string;
}

export interface CodeLearningResult {
  jobId: string;
  topic: string;
  success: boolean;
  unitsUsed: number;
  durationMs: number;
  insightsGenerated: number;
  patternsLearned: string[];
  antiPatternsIdentified: string[];
  timestamp: string;
}

export interface EncodedLearningState {
  isRunning: boolean;
  enabled: boolean;
  totalJobsCompleted: number;
  lastJobAt: string | null;
  currentFocus: string | null;
  masteryScores: Record<string, number>;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

const STORAGE_KEY = 'encoded_learning_state';
const LEARNING_INTERVAL_MS = 15 * 60 * 1000; // 15 minutes between learning cycles
const MAX_TOKENS = 1500;

// Code-focused system prompt
const ENCODED_SYSTEM_PROMPT = `You are Encoded, an elite code-writing agent studying to become the best coder possible.

Your ONLY purpose is to learn and improve your code-writing abilities. Focus exclusively on:
- Writing cleaner, more maintainable code
- Mastering TypeScript, React, and modern web patterns
- Understanding and avoiding anti-patterns
- Learning advanced techniques and optimizations
- Improving code review and self-correction abilities

For each topic you study:
1. Extract the core principles and patterns
2. Identify common mistakes and anti-patterns
3. Note practical techniques you can apply immediately
4. Create mental models for decision-making
5. Connect learnings to your existing knowledge

You are building a permanent knowledge base to write better code. Every insight matters.
Be specific, practical, and focused on code excellence.`;

// ═══════════════════════════════════════════════════════════════════════════════
// ENCODED LEARNING ENGINE CLASS
// ═══════════════════════════════════════════════════════════════════════════════

class EncodedLearningEngineClient {
  private static instance: EncodedLearningEngineClient;
  private state: EncodedLearningState;
  private intervalId: ReturnType<typeof setInterval> | null = null;

  private constructor() {
    this.state = this.loadState();
  }

  static getInstance(): EncodedLearningEngineClient {
    if (!EncodedLearningEngineClient.instance) {
      EncodedLearningEngineClient.instance = new EncodedLearningEngineClient();
    }
    return EncodedLearningEngineClient.instance;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // LIFECYCLE
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Start the 24/7 learning loop
   */
  start(): void {
    if (this.intervalId) {
      console.log('[Encoded Learning] Already running');
      return;
    }

    this.state.enabled = true;
    this.persistState();

    console.log('[Encoded Learning] 🚀 Starting 24/7 code-writing learning...');

    // Run immediately
    this.runLearningCycle();

    // Then run every 15 minutes (skip when tab is hidden)
    this.intervalId = setInterval(() => {
      if (document.visibilityState === 'hidden') return;
      this.runLearningCycle();
    }, LEARNING_INTERVAL_MS);
  }

  /**
   * Stop the learning loop
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.state.enabled = false;
    this.state.isRunning = false;
    this.persistState();
    console.log('[Encoded Learning] ⏹️ Stopped');
  }

  /**
   * Get current state
   */
  getState(): EncodedLearningState {
    return { ...this.state };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // LEARNING CYCLE
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Run a single learning cycle
   */
  async runLearningCycle(): Promise<CodeLearningResult | null> {
    // Check budget
    const canExecute = budgetGovernor.canExecute();
    if (!canExecute.allowed) {
      console.log(`[Encoded Learning] Cannot execute: ${canExecute.reason}`);
      return null;
    }

    if (this.state.isRunning) {
      console.log('[Encoded Learning] Already running a cycle');
      return null;
    }

    this.state.isRunning = true;
    this.state.currentFocus = 'selecting topic';
    const startTime = Date.now();

    try {
      // 1. Select next topic
      const topic = await this.selectNextTopic();
      if (!topic) {
        throw new Error('No topic available');
      }

      this.state.currentFocus = topic.name;

      // 2. Request budget
      const units = Math.ceil(topic.weight * 8);
      if (!budgetGovernor.requestBudget(units)) {
        throw new Error('Insufficient budget');
      }

      // 3. Build learning job
      const job = this.buildLearningJob(topic, units);

      // 4. Execute learning
      const learningContent = await this.executeLearning(job);

      // 5. Extract insights
      const insights = this.extractInsights(learningContent);

      // 6. Store in memory
      await this.storeKnowledge(job, learningContent, insights);

      // 7. Update mastery
      this.updateMastery(topic.id, 0.1);

      const result: CodeLearningResult = {
        jobId: job.id,
        topic: topic.name,
        success: true,
        unitsUsed: units,
        durationMs: Date.now() - startTime,
        insightsGenerated: insights.patterns.length + insights.antiPatterns.length,
        patternsLearned: insights.patterns,
        antiPatternsIdentified: insights.antiPatterns,
        timestamp: new Date().toISOString(),
      };

      this.state.totalJobsCompleted++;
      this.state.lastJobAt = result.timestamp;

      console.log(`[Encoded Learning] ✅ Learned: ${topic.name} (+${insights.patterns.length} patterns)`);

      return result;

    } catch (error) {
      console.error('[Encoded Learning] ❌ Cycle failed:', error);
      return null;
    } finally {
      this.state.isRunning = false;
      this.state.currentFocus = null;
      this.persistState();
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // TOPIC SELECTION
  // ═══════════════════════════════════════════════════════════════════════════

  private async selectNextTopic(): Promise<Topic | null> {
    const curriculum = getEncodedCurriculum();
    
    // Weighted selection based on:
    // 1. Priority (higher weight for lower priority numbers)
    // 2. Mastery (lower mastery = more likely to select)
    // 3. Recency (avoid recently studied topics)
    
    const scored = curriculum.map(topic => {
      const mastery = this.state.masteryScores[topic.id] || 0;
      const priorityScore = (51 - topic.priority) / 50; // 1.0 for priority 1, 0.02 for priority 50
      const masteryScore = 1 - mastery; // 1.0 for 0% mastery, 0.0 for 100%
      const weightScore = topic.weight;
      
      return {
        topic,
        score: (priorityScore * 0.4) + (masteryScore * 0.4) + (weightScore * 0.2),
      };
    });

    // Sort by score and add randomness
    scored.sort((a, b) => b.score - a.score);
    
    // Pick from top 10 with weighted random
    const top10 = scored.slice(0, 10);
    const totalScore = top10.reduce((sum, s) => sum + s.score, 0);
    let random = Math.random() * totalScore;
    
    for (const item of top10) {
      random -= item.score;
      if (random <= 0) {
        return item.topic;
      }
    }

    return top10[0]?.topic || null;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // JOB BUILDING
  // ═══════════════════════════════════════════════════════════════════════════

  private buildLearningJob(topic: Topic, units: number): CodeLearningJob {
    const focusOptions: CodeLearningJob['focus'][] = [
      'pattern', 'anti-pattern', 'best-practice', 'technique', 'review'
    ];
    const focus = focusOptions[Math.floor(Math.random() * focusOptions.length)];

    const prompt = this.buildPrompt(topic, focus);

    return {
      id: crypto.randomUUID(),
      topic,
      prompt,
      systemPrompt: ENCODED_SYSTEM_PROMPT,
      focus,
      estimatedUnits: units,
      createdAt: new Date().toISOString(),
    };
  }

  private buildPrompt(topic: Topic, focus: CodeLearningJob['focus']): string {
    const focusInstructions: Record<CodeLearningJob['focus'], string> = {
      'pattern': 'Focus on identifying and understanding key patterns. What are the core patterns used? How do they work? When should they be applied?',
      'anti-pattern': 'Focus on anti-patterns and mistakes. What are common pitfalls? How can they be avoided? What are the warning signs?',
      'best-practice': 'Focus on best practices and conventions. What are the industry standards? How should code be structured?',
      'technique': 'Focus on specific techniques and implementations. How is this done in practice? What are the exact steps?',
      'review': 'Focus on code review perspective. What would you look for? What improvements would you suggest? What quality issues exist?',
    };

    return `Study the following topic to improve your code-writing abilities:

**Topic:** ${topic.name}

**Related Concepts:** ${topic.domainAnchors.join(', ')}

**Key Metrics to Improve:**
${topic.kpis.map(k => `- ${k}`).join('\n')}

**Focus Area:** ${focus.replace('-', ' ')}
${focusInstructions[focus]}

Provide:
1. 3-5 specific, actionable patterns or techniques
2. 2-3 common mistakes and how to avoid them
3. Code examples demonstrating the concepts
4. Decision framework: when to apply these patterns
5. How this connects to writing better React/TypeScript code

Be specific and practical. Focus on immediately applicable knowledge.`;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // EXECUTION
  // ═══════════════════════════════════════════════════════════════════════════

  private async executeLearning(job: CodeLearningJob): Promise<string> {
    try {
      const { data, error } = await supabase.functions.invoke('pf-nexus-router', {
        body: {
          prompt: job.prompt,
          systemPrompt: job.systemPrompt,
          maxTokens: MAX_TOKENS,
          temperature: 0.7,
          metadata: {
            routeKey: 'encoded-learning',
            topicId: job.topic.id,
            jobId: job.id,
            focus: job.focus,
          },
        },
      });

      if (error) throw error;
      return data?.content || data?.response || '';
    } catch (error) {
      console.error('[Encoded Learning] Execution failed:', error);
      return '';
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // INSIGHT EXTRACTION
  // ═══════════════════════════════════════════════════════════════════════════

  private extractInsights(content: string): {
    patterns: string[];
    antiPatterns: string[];
    techniques: string[];
  } {
    const patterns: string[] = [];
    const antiPatterns: string[] = [];
    const techniques: string[] = [];

    if (!content) return { patterns, antiPatterns, techniques };

    // Simple extraction based on common markers
    const lines = content.split('\n');
    let currentSection = '';

    for (const line of lines) {
      const lower = line.toLowerCase();
      
      if (lower.includes('pattern') || lower.includes('principle')) {
        currentSection = 'pattern';
      } else if (lower.includes('anti-pattern') || lower.includes('mistake') || lower.includes('avoid')) {
        currentSection = 'anti';
      } else if (lower.includes('technique') || lower.includes('approach')) {
        currentSection = 'technique';
      }

      // Extract bullet points
      if (line.trim().startsWith('-') || line.trim().match(/^\d+\./)) {
        const item = line.replace(/^[-\d.]+/, '').trim();
        if (item.length > 10 && item.length < 200) {
          if (currentSection === 'pattern') {
            patterns.push(item);
          } else if (currentSection === 'anti') {
            antiPatterns.push(item);
          } else if (currentSection === 'technique') {
            techniques.push(item);
          }
        }
      }
    }

    return {
      patterns: patterns.slice(0, 5),
      antiPatterns: antiPatterns.slice(0, 3),
      techniques: techniques.slice(0, 3),
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // KNOWLEDGE STORAGE
  // ═══════════════════════════════════════════════════════════════════════════

  private async storeKnowledge(
    job: CodeLearningJob,
    content: string,
    insights: { patterns: string[]; antiPatterns: string[]; techniques: string[] }
  ): Promise<void> {
    // Fire main learning intake (non-blocking — we don't need its result for pattern storage)
    const mainPromise = learningEngine.input({
      content: `[Encoded Code Learning: ${job.topic.name}]\n\n${content}`,
      source: 'encoded_learning_engine',
      topic: job.topic.id,
      confidence: 0.85,
      metadata: {
        job_id: job.id,
        focus: job.focus,
        patterns_count: insights.patterns.length,
        anti_patterns_count: insights.antiPatterns.length,
        is_code_learning: true,
      },
    });

    // Batch all pattern + anti-pattern ingestions in parallel instead of sequential awaits
    const patternIngestions = insights.patterns.map(pattern =>
      memoryCore.ingest(
        `[Code Pattern: ${job.topic.name}] ${pattern}`,
        {
          type: 'heuristic',
          source: 'encoded_learning',
          confidence: 0.9,
          tags: ['encoded', 'pattern', job.topic.id],
          metadata: { category: 'code_pattern', topic: job.topic.name },
        }
      )
    );

    const antiPatternIngestions = insights.antiPatterns.map(antiPattern =>
      memoryCore.ingest(
        `[Anti-Pattern Warning: ${job.topic.name}] ${antiPattern}`,
        {
          type: 'error_pattern',
          source: 'encoded_learning',
          confidence: 0.9,
          tags: ['encoded', 'anti-pattern', job.topic.id],
          metadata: { category: 'anti_pattern', topic: job.topic.name },
        }
      )
    );

    // Await all in parallel — single round of promises
    await Promise.all([mainPromise, ...patternIngestions, ...antiPatternIngestions]);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // MASTERY TRACKING
  // ═══════════════════════════════════════════════════════════════════════════

  private updateMastery(topicId: string, increment: number): void {
    const current = this.state.masteryScores[topicId] || 0;
    this.state.masteryScores[topicId] = Math.min(1, current + increment);
    this.persistState();
  }

  getMasteryScore(topicId: string): number {
    return this.state.masteryScores[topicId] || 0;
  }

  getOverallMastery(): number {
    const scores = Object.values(this.state.masteryScores);
    if (scores.length === 0) return 0;
    return scores.reduce((sum, s) => sum + s, 0) / ENCODED_CODE_CURRICULUM.length;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PERSISTENCE
  // ═══════════════════════════════════════════════════════════════════════════

  private loadState(): EncodedLearningState {
    try {
      const stored = secureGet<EncodedLearningState>(STORAGE_KEY);
      if (stored) return stored;
    } catch {
      /* Storage unavailable — use defaults */
    }
    
    return {
      isRunning: false,
      enabled: false,
      totalJobsCompleted: 0,
      lastJobAt: null,
      currentFocus: null,
      masteryScores: {},
    };
  }

  private persistState(): void {
    try {
      secureSet(STORAGE_KEY, this.state);
    } catch {
      /* Non-critical: learning state rebuilt on next session */
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export const encodedLearningEngine = EncodedLearningEngineClient.getInstance();

// Auto-start on module load
if (typeof window !== 'undefined') {
  // Start after a short delay to let other systems initialize
  setTimeout(() => {
    const state = encodedLearningEngine.getState();
    if (!state.enabled) {
      console.log('[Encoded Learning] 🎓 Initializing 24/7 code-writing learning...');
      encodedLearningEngine.start();
    }
  }, 5000);
}
