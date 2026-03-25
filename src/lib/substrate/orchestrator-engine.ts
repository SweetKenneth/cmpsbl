/**
 * Orchestrator Engine
 * Unified Cognitive Pipeline
 * 
 * The Orchestrator Engine chains all cognitive engines into unified workflows.
 * It provides high-level orchestration patterns for common cognitive tasks.
 * 
 * Architecture: Capabilities (269) → Engines (62) → Meta-Engines (20)
 * 
 * Capabilities:
 * - Chain engine execution in declarative pipelines (147 synergy pipelines)
 * - Run full cognitive loops (think → learn → imagine → reason → govern)
 * - Provide lifecycle hooks for monitoring
 * - Auto-healing and fallback strategies
 */

import { engineBus, type DispatchResult, type EngineName } from './engine-bus';
import { memoryCore, type MemoryEntry, type LifecycleResult } from './memory-core';
import { learningEngine, type LearningResult } from './learning-engine';
import { imaginationEngine, type ImaginationResult, type SynthesisOutput } from './imagination-engine';
import { reasoningEngine, type ReasoningResult } from './reasoning-engine';
import { governanceGuard, type GovernanceResult } from './governance-guard';
import { telemetryEngine } from './telemetry-engine';
import { stateEngine } from './state-engine';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type OrchestratorMode = 'sequential' | 'parallel' | 'adaptive';

export type PipelineStage = 
  | 'ingest'
  | 'learn'
  | 'imagine'
  | 'reason'
  | 'govern'
  | 'synthesize'
  | 'output';

export interface PipelineConfig {
  name: string;
  mode: OrchestratorMode;
  stages: PipelineStage[];
  timeout?: number;
  governance?: boolean;
  persist?: boolean;
  onProgress?: (stage: PipelineStage, result: PipelineStageResult) => void;
}

export interface PipelineStageResult {
  stage: PipelineStage;
  success: boolean;
  durationMs: number;
  data?: Record<string, unknown>;
  error?: string;
}

export interface PipelineResult {
  success: boolean;
  name: string;
  stages: PipelineStageResult[];
  totalDurationMs: number;
  output?: {
    memories?: MemoryEntry[];
    insights?: string[];
    synthesis?: SynthesisOutput;
    governanceDecision?: 'approve' | 'warn' | 'block';
  };
  error?: string;
}

export interface CognitiveCycleOptions {
  input: string;
  source?: string;
  depth?: 'shallow' | 'standard' | 'deep';
  governance?: boolean;
  persist?: boolean;
}

export interface CognitiveCycleResult {
  success: boolean;
  phases: {
    memory?: LifecycleResult;
    learning?: LearningResult;
    imagination?: ImaginationResult;
    reasoning?: ReasoningResult;
    governance?: GovernanceResult;
  };
  totalDurationMs: number;
  output?: {
    memories: number;
    insights: string[];
    hypotheses: number;
    governanceStatus: 'approved' | 'warned' | 'blocked';
  };
}

export interface OrchestratorState {
  initialized: boolean;
  activePipelines: number;
  completedPipelines: number;
  failedPipelines: number;
  totalCycles: number;
  averageCycleTime: number;
  lastCycleAt: string | null;
  engineHealth: Record<EngineName, number>;
}

// ═══════════════════════════════════════════════════════════════════════════════
// PRESET PIPELINES
// ═══════════════════════════════════════════════════════════════════════════════

export const PRESET_PIPELINES: Record<string, PipelineConfig> = {
  // Memory-focused: ingest → learn → persist
  memory_pipeline: {
    name: 'Memory Pipeline',
    mode: 'sequential',
    stages: ['ingest', 'learn', 'output'],
    governance: false,
    persist: true,
  },
  
  // Creative: ingest → imagine → synthesize
  creative_pipeline: {
    name: 'Creative Pipeline',
    mode: 'sequential',
    stages: ['ingest', 'imagine', 'synthesize', 'output'],
    governance: true,
    persist: true,
  },
  
  // Analytical: ingest → reason → govern → output
  analytical_pipeline: {
    name: 'Analytical Pipeline',
    mode: 'sequential',
    stages: ['ingest', 'reason', 'govern', 'output'],
    governance: true,
    persist: true,
  },
  
  // Full cognitive: all stages
  full_cognitive: {
    name: 'Full Cognitive Pipeline',
    mode: 'sequential',
    stages: ['ingest', 'learn', 'imagine', 'reason', 'govern', 'synthesize', 'output'],
    governance: true,
    persist: true,
    timeout: 60000,
  },
  
  // Quick insight: minimal processing
  quick_insight: {
    name: 'Quick Insight',
    mode: 'sequential',
    stages: ['ingest', 'learn', 'output'],
    governance: false,
    persist: false,
    timeout: 10000,
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// ORCHESTRATOR ENGINE CLASS
// ═══════════════════════════════════════════════════════════════════════════════

class OrchestratorEngineClient {
  private static instance: OrchestratorEngineClient;
  private state: OrchestratorState = {
    initialized: false,
    activePipelines: 0,
    completedPipelines: 0,
    failedPipelines: 0,
    totalCycles: 0,
    averageCycleTime: 0,
    lastCycleAt: null,
    engineHealth: {
      memory_core: 100,
      learning_engine: 100,
      imagination_engine: 100,
      reasoning_engine: 100,
      governance_guard: 100,
    },
  };

  private constructor() {
    this.state.initialized = true;
  }

  static getInstance(): OrchestratorEngineClient {
    if (!OrchestratorEngineClient.instance) {
      OrchestratorEngineClient.instance = new OrchestratorEngineClient();
    }
    return OrchestratorEngineClient.instance;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PIPELINE EXECUTION
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Execute a predefined pipeline
   */
  async runPipeline(pipelineName: keyof typeof PRESET_PIPELINES, input: string): Promise<PipelineResult> {
    const config = PRESET_PIPELINES[pipelineName];
    if (!config) {
      return {
        success: false,
        name: pipelineName,
        stages: [],
        totalDurationMs: 0,
        error: `Unknown pipeline: ${pipelineName}`,
      };
    }

    return this.executePipeline(config, input);
  }

  /**
   * Execute a custom pipeline
   */
  async executePipeline(config: PipelineConfig, input: string): Promise<PipelineResult> {
    const startTime = Date.now();
    const correlationId = crypto.randomUUID();
    const stageResults: PipelineStageResult[] = [];
    
    let memories: MemoryEntry[] = [];
    let insights: string[] = [];
    let synthesis: SynthesisOutput | undefined;
    let governanceDecision: 'approve' | 'warn' | 'block' = 'approve';
    let currentData: Record<string, unknown> = { input, source: 'orchestrator' };

    this.state.activePipelines++;

    // Emit pipeline start
    telemetryEngine.emit('custom', 'info', { module: 'orchestrator' }, {
      metadata: { pipeline: config.name, stages: config.stages },
    }, correlationId);

    try {
      for (const stage of config.stages) {
        const stageStart = Date.now();
        let stageResult: PipelineStageResult;

        try {
          switch (stage) {
            case 'ingest':
              stageResult = await this.executeIngestStage(input, config.persist);
              currentData = { ...currentData, ...stageResult.data };
              break;

            case 'learn':
              stageResult = await this.executeLearningStage(input, currentData);
              currentData = { ...currentData, ...stageResult.data };
              break;

            case 'imagine':
              stageResult = await this.executeImaginationStage(currentData);
              if (stageResult.data?.synthesis) {
                synthesis = stageResult.data.synthesis as SynthesisOutput;
              }
              currentData = { ...currentData, ...stageResult.data };
              break;

            case 'reason':
              stageResult = await this.executeReasoningStage(input, currentData);
              if (stageResult.data?.insights) {
                insights.push(...(stageResult.data.insights as string[]));
              }
              currentData = { ...currentData, ...stageResult.data };
              break;

            case 'govern':
              stageResult = await this.executeGovernanceStage(input, currentData);
              governanceDecision = (stageResult.data?.decision as 'approve' | 'warn' | 'block') || 'approve';
              currentData = { ...currentData, ...stageResult.data };
              
              // Block pipeline if governance rejects
              if (governanceDecision === 'block') {
                stageResults.push(stageResult);
                throw new Error('Pipeline blocked by governance');
              }
              break;

            case 'synthesize':
              stageResult = await this.executeSynthesisStage(currentData);
              if (stageResult.data?.synthesis) {
                synthesis = stageResult.data.synthesis as SynthesisOutput;
              }
              currentData = { ...currentData, ...stageResult.data };
              break;

            case 'output':
              stageResult = {
                stage: 'output',
                success: true,
                durationMs: Date.now() - stageStart,
                data: { finalized: true, memoryCount: memories.length, insightCount: insights.length },
              };
              break;

            default:
              stageResult = { stage, success: false, durationMs: 0, error: `Unknown stage: ${stage}` };
          }
        } catch (error) {
          stageResult = {
            stage,
            success: false,
            durationMs: Date.now() - stageStart,
            error: error instanceof Error ? error.message : 'Stage failed',
          };
        }

        stageResults.push(stageResult);
        config.onProgress?.(stage, stageResult);

        // Stop on failure in sequential mode
        if (!stageResult.success && config.mode === 'sequential') {
          break;
        }
      }

      const totalDurationMs = Date.now() - startTime;
      const success = stageResults.every(s => s.success);

      if (success) {
        this.state.completedPipelines++;
      } else {
        this.state.failedPipelines++;
      }
      this.state.activePipelines--;
      this.updateAverageCycleTime(totalDurationMs);

      return {
        success,
        name: config.name,
        stages: stageResults,
        totalDurationMs,
        output: { memories, insights, synthesis, governanceDecision },
      };

    } catch (error) {
      this.state.activePipelines--;
      this.state.failedPipelines++;

      return {
        success: false,
        name: config.name,
        stages: stageResults,
        totalDurationMs: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Pipeline failed',
      };
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // COGNITIVE CYCLE (Full Brain Cycle)
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Run a full cognitive cycle: remember → learn → imagine → reason → govern
   */
  async cognitiveCycle(options: CognitiveCycleOptions): Promise<CognitiveCycleResult> {
    const startTime = Date.now();
    const phases: CognitiveCycleResult['phases'] = {};

    try {
      // Phase 1: Memory (Ingest → Store → Index)
      phases.memory = await memoryCore.ingest(options.input, {
        source: options.source || 'cognitive_cycle',
        confidence: 0.7,
        tags: ['cognitive_cycle'],
      });

      // Phase 2: Learning (Input → Feedback → Adjustment)
      phases.learning = await learningEngine.input({
        content: options.input,
        source: 'cognitive_cycle',
        confidence: 0.7,
      });

      // Phase 3: Imagination (Latent → Recombination → Synthesis)
      if (options.depth !== 'shallow') {
        const imagResult = await imaginationEngine.runCycle({ type: 'insight' });
        phases.imagination = imagResult.stages[imagResult.stages.length - 1];
      }

      // Phase 4: Reasoning (Causal → Dependencies → Hypotheses)
      if (options.depth === 'deep') {
        const reasonResult = await reasoningEngine.runCycle({ 
          context: options.input, 
          depth: options.depth 
        });
        phases.reasoning = reasonResult.stages[0];
      }

      // Phase 5: Governance (Coherence → Ethics → Signal)
      if (options.governance !== false) {
        const govResult = await governanceGuard.runCycle({
          content: options.input,
          source: 'cognitive_cycle',
          strict_mode: options.depth === 'deep',
        });
        phases.governance = govResult.stages[govResult.stages.length - 1];
      }

      const totalDurationMs = Date.now() - startTime;
      this.state.totalCycles++;
      this.state.lastCycleAt = new Date().toISOString();
      this.updateAverageCycleTime(totalDurationMs);

      // Derive output
      const governanceStatus = phases.governance?.blocked 
        ? 'blocked' 
        : (phases.governance?.result as any)?.signal?.type === 'warn' 
          ? 'warned' 
          : 'approved';

      return {
        success: true,
        phases,
        totalDurationMs,
        output: {
          memories: phases.memory?.success ? 1 : 0,
          insights: phases.imagination?.output ? [phases.imagination.output.content] : [],
          hypotheses: (phases.reasoning?.result as any)?.hypotheses?.length || 0,
          governanceStatus,
        },
      };

    } catch (error) {
      return {
        success: false,
        phases,
        totalDurationMs: Date.now() - startTime,
      };
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // QUICK ACTIONS (Common Patterns)
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Quick memory store and learn
   */
  async quickLearn(content: string, topic?: string): Promise<{ success: boolean; memoryId?: string }> {
    const result = await memoryCore.ingest(content, {
      type: 'insight',
      source: 'quick_learn',
      tags: topic ? [topic] : [],
    });

    if (result.success) {
      await learningEngine.input({ content, topic, source: 'quick_learn' });
    }

    return { success: result.success, memoryId: result.memory_id };
  }

  /**
   * Quick recall with reasoning
   */
  async smartRecall(query: string, limit: number = 5): Promise<{ memories: MemoryEntry[]; insights: string[] }> {
    const memories = await memoryCore.retrieve({ query, limit, strategy: 'hybrid' });
    const insights: string[] = [];

    if (memories.memories && memories.memories.length > 0) {
      const context = memories.memories.map(m => m.content).join('\n');
      const reasonResult = await reasoningEngine.causalMapping({ context });
      
      if (reasonResult.result?.causal_links) {
        insights.push(...reasonResult.result.causal_links.map(l => `${l.cause} → ${l.effect}`));
      }
    }

    return { memories: memories.memories || [], insights };
  }

  /**
   * Generate creative synthesis
   */
  async creativeSynthesize(topic: string): Promise<SynthesisOutput | null> {
    // First store the topic as latent content
    await memoryCore.ingest(topic, { type: 'insight', source: 'creative_synthesis' });

    // Run imagination cycle
    const result = await imaginationEngine.runCycle({ type: 'fusion' });
    
    return result.output || null;
  }

  /**
   * Validate content with governance
   */
  async validate(content: string, strict: boolean = false): Promise<{ safe: boolean; issues: string[] }> {
    const result = await governanceGuard.runCycle({ content, strict_mode: strict });
    
    const issues: string[] = [];
    if (result.stages[0]?.result?.coherence?.issues) {
      issues.push(...result.stages[0].result.coherence.issues.map(i => i.description));
    }
    if (result.stages[1]?.result?.ethical?.constraints_violated) {
      issues.push(...result.stages[1].result.ethical.constraints_violated);
    }

    return { safe: result.final_decision === 'approve', issues };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ENGINE HEALTH MONITORING
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Check health of all engines
   */
  async checkEngineHealth(): Promise<Record<EngineName, number>> {
    const health: Record<EngineName, number> = {
      memory_core: 100,
      learning_engine: 100,
      imagination_engine: 100,
      reasoning_engine: 100,
      governance_guard: 100,
    };

    // Check each engine with a simple probe
    const probes = await Promise.allSettled([
      memoryCore.getState(),
      learningEngine.getState(),
      imaginationEngine.getState(),
      reasoningEngine.getState(),
      governanceGuard.getState(),
    ]);

    const engines: EngineName[] = ['memory_core', 'learning_engine', 'imagination_engine', 'reasoning_engine', 'governance_guard'];
    
    probes.forEach((probe, index) => {
      if (probe.status === 'rejected') {
        health[engines[index]] = 0;
      }
    });

    this.state.engineHealth = health;
    return health;
  }

  /**
   * Get orchestrator state
   */
  getState(): OrchestratorState {
    return { ...this.state };
  }

  /**
   * Get available pipelines
   */
  getAvailablePipelines(): Array<{ name: string; key: string; stages: PipelineStage[] }> {
    return Object.entries(PRESET_PIPELINES).map(([key, config]) => ({
      name: config.name,
      key,
      stages: config.stages,
    }));
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PRIVATE STAGE EXECUTORS
  // ═══════════════════════════════════════════════════════════════════════════

  private async executeIngestStage(input: string, persist?: boolean): Promise<PipelineStageResult> {
    const startTime = Date.now();
    try {
      const result = await memoryCore.ingest(input, { 
        source: 'pipeline',
        confidence: 0.7,
      });

      return {
        stage: 'ingest',
        success: result.success,
        durationMs: Date.now() - startTime,
        data: { memory_id: result.memory_id, tier: result.metadata?.tier },
      };
    } catch (error) {
      return {
        stage: 'ingest',
        success: false,
        durationMs: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Ingest failed',
      };
    }
  }

  private async executeLearningStage(input: string, context: Record<string, unknown>): Promise<PipelineStageResult> {
    const startTime = Date.now();
    try {
      const result = await learningEngine.input({ content: input, source: 'pipeline' });

      return {
        stage: 'learn',
        success: result.success,
        durationMs: Date.now() - startTime,
        data: { gain: result.metrics?.gain, memories_affected: result.metrics?.memories_affected },
      };
    } catch (error) {
      return {
        stage: 'learn',
        success: false,
        durationMs: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Learning failed',
      };
    }
  }

  private async executeImaginationStage(context: Record<string, unknown>): Promise<PipelineStageResult> {
    const startTime = Date.now();
    try {
      const result = await imaginationEngine.runCycle({ type: 'insight' });

      return {
        stage: 'imagine',
        success: result.success,
        durationMs: Date.now() - startTime,
        data: { synthesis: result.output, stages_completed: result.stages.length },
      };
    } catch (error) {
      return {
        stage: 'imagine',
        success: false,
        durationMs: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Imagination failed',
      };
    }
  }

  private async executeReasoningStage(input: string, context: Record<string, unknown>): Promise<PipelineStageResult> {
    const startTime = Date.now();
    try {
      const result = await reasoningEngine.runCycle({ context: input });
      
      const insights: string[] = [];
      if (result.stages[0]?.result?.causal_links) {
        insights.push(...result.stages[0].result.causal_links.map(l => `${l.cause} → ${l.effect}`));
      }

      return {
        stage: 'reason',
        success: result.success,
        durationMs: Date.now() - startTime,
        data: { 
          insights,
          hypotheses: result.stages[2]?.result?.hypotheses?.length || 0,
          causal_links: result.stages[0]?.result?.causal_links?.length || 0,
        },
      };
    } catch (error) {
      return {
        stage: 'reason',
        success: false,
        durationMs: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Reasoning failed',
      };
    }
  }

  private async executeGovernanceStage(input: string, context: Record<string, unknown>): Promise<PipelineStageResult> {
    const startTime = Date.now();
    try {
      const result = await governanceGuard.runCycle({ content: input });

      return {
        stage: 'govern',
        success: result.success,
        durationMs: Date.now() - startTime,
        data: { 
          decision: result.final_decision,
          coherence_score: result.stages[0]?.result?.coherence?.coherence_score,
          risk_level: result.stages[1]?.result?.ethical?.risk_level,
        },
      };
    } catch (error) {
      return {
        stage: 'govern',
        success: false,
        durationMs: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Governance failed',
      };
    }
  }

  private async executeSynthesisStage(context: Record<string, unknown>): Promise<PipelineStageResult> {
    const startTime = Date.now();
    try {
      // Synthesize from imagination output if available
      if (context.synthesis) {
        return {
          stage: 'synthesize',
          success: true,
          durationMs: Date.now() - startTime,
          data: { synthesis: context.synthesis },
        };
      }

      // Run fresh synthesis
      const result = await imaginationEngine.runCycle({ type: 'insight' });

      return {
        stage: 'synthesize',
        success: result.success,
        durationMs: Date.now() - startTime,
        data: { synthesis: result.output },
      };
    } catch (error) {
      return {
        stage: 'synthesize',
        success: false,
        durationMs: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Synthesis failed',
      };
    }
  }

  private updateAverageCycleTime(durationMs: number): void {
    // EMA with alpha=0.1 for stable average without tracking total count
    if (this.state.averageCycleTime === 0) {
      this.state.averageCycleTime = durationMs;
    } else {
      this.state.averageCycleTime = this.state.averageCycleTime * 0.9 + durationMs * 0.1;
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export const orchestratorEngine = OrchestratorEngineClient.getInstance();
export { OrchestratorEngineClient };
