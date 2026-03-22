/**
 * CLM Learning Orchestrator
 * Coordinates the constant learning loop
 * 
 * NOTE: Primary learning now runs SERVER-SIDE via pf-clm-engine (pg_cron every 5 min).
 * This client-side orchestrator is SUPPLEMENTARY — it runs when a browser tab is open
 * to provide additional learning capacity on top of the 24/7 server engine.
 * 
 * Responsibilities:
 * - Pick next topic (curriculum, gaps, SR, deep dives)
 * - Build and execute learning jobs
 * - Run reflection after each job
 * - Trigger prune/dream cycles periodically
 * - Enforce budget and safety constraints
 */

import { supabase } from '@/integrations/supabase/client';
import { budgetGovernor } from './budget-governor';
import { topicBank, type TopicSelection, type Topic } from './topic-bank';
import { spacedRepetition, type ReviewResult } from './spaced-repetition';
import { learningEngine } from '../learning-engine';
import { memoryCore } from '../memory-core';
import type { CLMConfig, LearningJobResult } from './config';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface LearningJob {
  id: string;
  topic: Topic;
  source: string;
  prompt: string;
  systemPrompt: string;
  maxTokens: number;
  estimatedUnits: number;
  createdAt: string;
}

export interface OrchestratorState {
  isRunning: boolean;
  currentJob: LearningJob | null;
  lastJobAt: string | null;
  totalJobsToday: number;
  jobsSinceLastDream: number;
  lastDreamAt: string | null;
  lastPruneAt: string | null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

const JOBS_BEFORE_DREAM = 6;
const MAX_TOKENS_STANDARD = 1200;
const MAX_TOKENS_MICRO = 300;

// ═══════════════════════════════════════════════════════════════════════════════
// ORCHESTRATOR CLASS
// ═══════════════════════════════════════════════════════════════════════════════

class LearningOrchestratorClient {
  private static instance: LearningOrchestratorClient;
  private state: OrchestratorState = {
    isRunning: false,
    currentJob: null,
    lastJobAt: null,
    totalJobsToday: 0,
    jobsSinceLastDream: 0,
    lastDreamAt: null,
    lastPruneAt: null,
  };

  private constructor() {
    this.loadState();
  }

  static getInstance(): LearningOrchestratorClient {
    if (!LearningOrchestratorClient.instance) {
      LearningOrchestratorClient.instance = new LearningOrchestratorClient();
    }
    return LearningOrchestratorClient.instance;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // MAIN ORCHESTRATION LOOP
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Run a single learning cycle (called by scheduler)
   */
  async runCycle(): Promise<LearningJobResult | null> {
    // Check if we can execute
    const canExecute = budgetGovernor.canExecute();
    if (!canExecute.allowed) {
      console.log(`[CLM] Cannot execute: ${canExecute.reason}`);
      return null;
    }

    // Prevent concurrent runs
    if (this.state.isRunning) {
      console.log('[CLM] Already running, skipping');
      return null;
    }

    this.state.isRunning = true;
    const startTime = Date.now();
    let result: LearningJobResult;

    try {
      // 1. Select topic
      const srQueue = [spacedRepetition.getNextDueTopic()].filter(Boolean) as Topic[];
      const selection = await topicBank.selectNextTopic(srQueue);
      
      if (!selection) {
        throw new Error('No topics available for study');
      }

      // 2. Check budget
      if (!budgetGovernor.requestBudget(selection.estimatedUnits)) {
        throw new Error('Insufficient budget for selected topic');
      }

      // 3. Build learning job
      const job = this.buildLearningJob(selection);
      this.state.currentJob = job;

      // 4. Execute learning
      const learningResult = await this.executeLearningJob(job);

      // 5+6. Reflection and graph update are independent — run in parallel
      const [reflectionGenerated, graphResult] = await Promise.all([
        this.runDeepReflection(job, learningResult),
        this.updateMemoryGraph(job, learningResult),
      ]);
      const { nodes, edges } = graphResult;

      // 7. Add to spaced repetition queue
      if (selection.source === 'core_curriculum' || selection.source === 'deep_dive') {
        spacedRepetition.addToQueue(selection.topic, learningResult.confidence || 0.7);
      } else if (selection.source === 'spaced_repetition') {
        spacedRepetition.processReview(selection.topic.id, {
          recallQuality: learningResult.success ? 4 : 2,
          confidence: learningResult.confidence || 0.5,
          durationMs: Date.now() - startTime,
        } as ReviewResult);
      }

      // 8. Check for dream/prune cycle
      this.state.jobsSinceLastDream++;
      if (this.state.jobsSinceLastDream >= JOBS_BEFORE_DREAM) {
        // Fire-and-forget — don't block the cycle result
        this.runPruneAndDream().catch(() => {});
        this.state.jobsSinceLastDream = 0;
      }

      result = {
        jobId: job.id,
        topic: job.topic.name,
        success: true,
        unitsUsed: selection.estimatedUnits,
        durationMs: Date.now() - startTime,
        reflectionGenerated,
        graphNodesCreated: nodes,
        graphEdgesCreated: edges,
        timestamp: new Date().toISOString(),
      };

    } catch (error) {
      result = {
        jobId: this.state.currentJob?.id || crypto.randomUUID(),
        topic: this.state.currentJob?.topic.name || 'unknown',
        success: false,
        unitsUsed: 1, // Charge minimum for failed attempt
        durationMs: Date.now() - startTime,
        reflectionGenerated: false,
        graphNodesCreated: 0,
        graphEdgesCreated: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      };
    } finally {
      this.state.isRunning = false;
      this.state.currentJob = null;
      this.state.lastJobAt = new Date().toISOString();
      this.state.totalJobsToday++;
      this.persistState();
    }

    // Record with budget governor
    budgetGovernor.recordJobCompletion(result);

    return result;
  }

  /**
   * Run a single job on demand (for manual triggers)
   */
  async runOnce(topicId?: string): Promise<LearningJobResult | null> {
    if (topicId) {
      const topic = topicBank.getTopic(topicId);
      if (topic) {
        const selection: TopicSelection = {
          topic,
          source: topic.category,
          reason: 'Manual trigger',
          estimatedUnits: 10,
        };
        
        const job = this.buildLearningJob(selection);
        // Execute directly...
        // (simplified for manual runs)
      }
    }
    
    return this.runCycle();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // JOB BUILDING
  // ═══════════════════════════════════════════════════════════════════════════

  private buildLearningJob(selection: TopicSelection): LearningJob {
    const budgetState = budgetGovernor.getState();
    const maxTokens = budgetState.microLearningMode ? MAX_TOKENS_MICRO : MAX_TOKENS_STANDARD;

    const prompt = this.buildLearningPrompt(selection.topic);
    const systemPrompt = this.buildSystemPrompt(selection);

    return {
      id: crypto.randomUUID(),
      topic: selection.topic,
      source: selection.source,
      prompt,
      systemPrompt,
      maxTokens,
      estimatedUnits: selection.estimatedUnits,
      createdAt: new Date().toISOString(),
    };
  }

  private buildLearningPrompt(topic: Topic): string {
    return `Study and analyze the following topic in depth:

**Topic:** ${topic.name}

**Related Domains:** ${topic.domainAnchors.join(', ')}

**Related Modules:** ${topic.moduleRefs.join(', ')}

**Key Performance Indicators to Consider:**
${topic.kpis.map(k => `- ${k}`).join('\n')}

Provide:
1. Core concepts and principles
2. Common pitfalls and anti-patterns
3. Best practices and recommendations
4. How this connects to other substrate capabilities
5. Actionable insights for improvement

Focus on practical, implementable knowledge.`;
  }

  private buildSystemPrompt(selection: TopicSelection): string {
    return `You are the Substrate Brain's learning engine, studying "${selection.topic.name}" (source: ${selection.source}, reason: ${selection.reason}).

Your role is to:
- Extract essential knowledge and patterns
- Identify connections to existing substrate modules
- Generate actionable insights
- Flag potential risks or gaps

Be concise, precise, and focused on practical utility. This learning will be stored in the memory graph and used for future decision-making.`;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // EXECUTION
  // ═══════════════════════════════════════════════════════════════════════════

  private async executeLearningJob(job: LearningJob): Promise<{
    success: boolean;
    content: string;
    confidence: number;
  }> {
    try {
      // Use Nexus router via edge function
      const { data, error } = await supabase.functions.invoke('pf-nexus-router', {
        body: {
          prompt: job.prompt,
          systemPrompt: job.systemPrompt,
          maxTokens: job.maxTokens,
          temperature: 0.7,
          metadata: {
            routeKey: 'clm-learning',
            topicId: job.topic.id,
            jobId: job.id,
          },
        },
      });

      if (error) throw error;

      const content = data?.content || data?.response || '';
      const confidence = this.assessConfidence(content);

      // Store the learning via Memory module's salience-gated pipeline
      // (learningEngine.input() now routes through memoryCore.ingest() with CLM confidence cap)
      await learningEngine.input({
        content: `[CLM Learning: ${job.topic.name}]\n\n${content}`,
        source: 'clm_orchestrator',
        topic: job.topic.id,
        confidence: Math.min(confidence, 0.55), // Cap to prevent hot tier flooding
        metadata: {
          job_id: job.id,
          topic_category: job.topic.category,
          learning_source: job.source,
        },
      });

      return { success: true, content, confidence };
    } catch (error) {
      console.error('[CLM] Learning job failed:', error);
      return { success: false, content: '', confidence: 0 };
    }
  }

  private assessConfidence(content: string): number {
    // Simple heuristic for confidence assessment
    if (!content || content.length < 100) return 0.3;
    if (content.length < 500) return 0.5;
    if (content.length < 1000) return 0.7;
    return 0.85;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // REFLECTION
  // ═══════════════════════════════════════════════════════════════════════════

  private async runDeepReflection(job: LearningJob, learningResult: {
    success: boolean;
    content: string;
    confidence: number;
  }): Promise<boolean> {
    if (!learningResult.success) return false;

    try {
      // Use memory core's reflect capability
      const reflection = await memoryCore.reflect({
        scope: 'session',
        depth: 'standard',
        minConfidence: 0.5,
      });

      if (reflection.success && reflection.insights && reflection.insights.length > 0) {
        // Store reflection insights — capped confidence to route to warm tier
        await memoryCore.ingest(
          `[CLM Reflection: ${job.topic.name}]\n\n${reflection.insights.join('\n')}`,
          {
            type: 'reflection',
            source: 'clm_deep_reflection',
            confidence: 0.5, // ← capped; reflections are supplementary, not critical
            tags: ['clm', 'reflection', job.topic.id],
            metadata: {
              job_id: job.id,
              insights_count: reflection.insights.length,
            },
          }
        );
        return true;
      }
    } catch (error) {
      console.error('[CLM] Reflection failed:', error);
    }

    return false;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // MEMORY GRAPH
  // ═══════════════════════════════════════════════════════════════════════════

  private async updateMemoryGraph(job: LearningJob, learningResult: {
    success: boolean;
    content: string;
    confidence: number;
  }): Promise<{ nodes: number; edges: number }> {
    if (!learningResult.success) return { nodes: 0, edges: 0 };

    let nodesCreated = 0;
    let edgesCreated = 0;

    try {
      // Create topic node in graph
      const { data: nodeData, error: nodeError } = await supabase
        .from('brain_graph_edges')
        .insert({
          source_id: job.id,
          target_id: job.topic.id,
          relation: 'learning',
          weight: learningResult.confidence,
        });

      if (!nodeError) {
        nodesCreated++;

        // Create edges to module references
        for (const moduleRef of job.topic.moduleRefs) {
          try {
            await supabase.from('brain_graph_edges').insert({
              source_id: job.topic.id,
              target_id: moduleRef.toLowerCase(),
              relation: 'concept_module',
              weight: 0.7,
            });
            edgesCreated++;
          } catch {
            // Non-critical
          }
        }

        // Create edges to domain anchors
        for (const anchor of job.topic.domainAnchors) {
          try {
            await supabase.from('brain_graph_edges').insert({
              source_id: job.topic.id,
              target_id: anchor,
              relation: 'topic_concept',
              weight: 0.6,
            });
            edgesCreated++;
          } catch {
            // Non-critical
          }
        }
      }
    } catch (error) {
      console.error('[CLM] Graph update failed:', error);
    }

    return { nodes: nodesCreated, edges: edgesCreated };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // DREAM & PRUNE CYCLES
  // ═══════════════════════════════════════════════════════════════════════════

  private async runPruneAndDream(): Promise<void> {
    try {
      // Run auto-degradation first (warm → cold for stale memories)
      const degradation = await memoryCore.autoDegradeStaleMemories(14);
      if (degradation.demoted > 0) {
        console.log(`[CLM] Auto-degraded ${degradation.demoted} stale warm→cold memories`);
      }

      // Run prune
      const { data: pruneResult } = await supabase.functions.invoke('pf-brain-memory-prune', {
        body: { tier: 'all', aggressive: false },
      });
      this.state.lastPruneAt = new Date().toISOString();

      // Then run dream cycle
      const { data: dreamResult } = await supabase.functions.invoke('pf-dream-cycle', {
        body: { source: 'clm_orchestrator' },
      });
      this.state.lastDreamAt = new Date().toISOString();

      // Store dream output as speculative hypothesis
      if (dreamResult?.insights) {
        await memoryCore.ingest(
          `[CLM Dream Hypothesis]\n\n${dreamResult.insights}`,
          {
            type: 'dream',
            source: 'clm_dream_cycle',
            confidence: 0.5, // Speculative until reinforced
            tags: ['clm', 'dream', 'hypothesis'],
            metadata: {
              is_speculative: true,
              needs_reinforcement: true,
            },
          }
        );
      }

      this.persistState();
    } catch (error) {
      console.error('[CLM] Prune/dream cycle failed:', error);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // STATE MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════════

  getState(): OrchestratorState {
    return { ...this.state };
  }

  private loadState(): void {
    try {
      const { secureGet } = require('@/lib/system/secureStorage') as typeof import('@/lib/system/secureStorage');
      const parsed = secureGet('clm_orchestrator_state') as typeof this.state | null;
      if (parsed) {
        const today = new Date().toISOString().split('T')[0];
        const lastJobDay = parsed.lastJobAt?.split('T')[0];
        if (lastJobDay === today) {
          this.state = { ...this.state, ...parsed };
        }
      }
    } catch {
      /* Storage unavailable — use default state */
    }
  }

  private persistState(): void {
    try {
      const { secureSet } = require('@/lib/system/secureStorage') as typeof import('@/lib/system/secureStorage');
      secureSet('clm_orchestrator_state', this.state);
    } catch {
      /* Quota exceeded — non-critical */
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export const learningOrchestrator = LearningOrchestratorClient.getInstance();
export { LearningOrchestratorClient };
