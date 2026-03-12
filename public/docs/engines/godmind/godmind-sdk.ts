/**
 * GODMIND SDK — Copy-paste module for your project
 * 
 * CMPSBL Composable Engine: Cognitive Superpipeline
 * Pipeline: PANDORA → AXIOM → SYNAPSE → ECHO
 * 
 * Usage:
 *   import { Godmind } from './godmind-sdk';
 *   const gm = new Godmind('your-api-key');
 *   const result = await gm.reason('What are the implications of X?');
 * 
 * @version 1.0.0
 * @license Perpetual — Single-seat
 */

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface GodmindOptions {
  /** Processing depth: shallow (fast), standard (balanced), deep (thorough) */
  depth?: 'shallow' | 'standard' | 'deep';
  /** Which pipeline stages to run. Default: all four. */
  stages?: ('pandora' | 'axiom' | 'synapse' | 'echo')[];
  /** Max refinement iterations (1-3). Default: 1. */
  maxIterations?: number;
  /** AI temperature (0-1). Default: 0.7. */
  temperature?: number;
}

export interface GodmindStageResult {
  stage: string;
  output: string;
  confidence: number;
  reasoning_tokens: number;
  latency_ms: number;
}

export interface GodmindResult {
  success: boolean;
  action: string;
  result: string;
  confidence: number;
  pipeline: {
    stages: GodmindStageResult[];
    total_tokens: number;
    total_latency_ms: number;
    depth: string;
    iterations: number;
  };
}

export interface GodmindError {
  success: false;
  error: string;
}

// ═══════════════════════════════════════════════════════════════
// CLIENT
// ═══════════════════════════════════════════════════════════════

export class Godmind {
  private readonly apiKey: string;
  private readonly baseUrl: string;

  /**
   * Create a GODMIND client.
   * @param apiKey Your CMPSBL API key (from https://cmpsbl.com/api-access)
   * @param baseUrl Override the API endpoint (default: CMPSBL production)
   */
  constructor(apiKey: string, baseUrl?: string) {
    if (!apiKey) throw new Error('GODMIND: API key is required');
    this.apiKey = apiKey;
    this.baseUrl = baseUrl || 'https://bxodolqqczjuahwdrswy.supabase.co/functions/v1/engine-godmind';
  }

  // ─── Core Actions ───────────────────────────────────────────

  /**
   * Reason about a topic — full 4-stage cognitive pipeline.
   * Best for: complex questions, strategic analysis, research synthesis.
   */
  async reason(input: string, context?: Record<string, unknown>, options?: GodmindOptions): Promise<GodmindResult> {
    return this.execute('reason', input, context, options);
  }

  /**
   * Analyze data, text, or a situation.
   * Best for: data interpretation, pattern detection, root cause analysis.
   */
  async analyze(input: string, context?: Record<string, unknown>, options?: GodmindOptions): Promise<GodmindResult> {
    return this.execute('analyze', input, context, options);
  }

  /**
   * Plan a strategy, project, or approach.
   * Best for: project planning, decision trees, roadmaps.
   */
  async plan(input: string, context?: Record<string, unknown>, options?: GodmindOptions): Promise<GodmindResult> {
    return this.execute('plan', input, context, options);
  }

  /**
   * Evaluate a proposal, idea, or decision.
   * Best for: risk assessment, feasibility analysis, trade-off comparison.
   */
  async evaluate(input: string, context?: Record<string, unknown>, options?: GodmindOptions): Promise<GodmindResult> {
    return this.execute('evaluate', input, context, options);
  }

  // ─── Pipeline Control ──────────────────────────────────────

  /**
   * Run only the hypothesis generation stage (PANDORA).
   * Returns creative hypotheses and reasoning plans.
   */
  async hypothesize(input: string, context?: Record<string, unknown>): Promise<GodmindResult> {
    return this.execute('reason', input, context, { stages: ['pandora'] });
  }

  /**
   * Run hypothesis + validation (PANDORA → AXIOM).
   * Returns validated hypotheses with logical analysis.
   */
  async validate(input: string, context?: Record<string, unknown>): Promise<GodmindResult> {
    return this.execute('analyze', input, context, { stages: ['pandora', 'axiom'] });
  }

  /**
   * Run the full pipeline with deep analysis.
   * Slower but most thorough. Use for critical decisions.
   */
  async deepReason(input: string, context?: Record<string, unknown>): Promise<GodmindResult> {
    return this.execute('reason', input, context, { depth: 'deep', maxIterations: 2 });
  }

  // ─── Internal ──────────────────────────────────────────────

  private async execute(
    action: string,
    input: string,
    context?: Record<string, unknown>,
    options?: GodmindOptions,
  ): Promise<GodmindResult> {
    const res = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Engine-Key': this.apiKey,
      },
      body: JSON.stringify({
        action,
        input,
        context,
        options: options ? {
          depth: options.depth,
          stages: options.stages,
          max_iterations: options.maxIterations,
          temperature: options.temperature,
        } : undefined,
      }),
    });

    if (!res.ok) {
      const err: GodmindError = await res.json().catch(() => ({ success: false, error: `HTTP ${res.status}` }));
      throw new GodmindAPIError(err.error || `Request failed with status ${res.status}`, res.status);
    }

    return res.json();
  }
}

// ═══════════════════════════════════════════════════════════════
// ERROR CLASS
// ═══════════════════════════════════════════════════════════════

export class GodmindAPIError extends Error {
  constructor(message: string, public status: number) {
    super(`GODMIND: ${message}`);
    this.name = 'GodmindAPIError';
  }
}
