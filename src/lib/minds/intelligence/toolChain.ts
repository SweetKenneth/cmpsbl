/**
 * Minds Intelligence Layer — Tool Chain Composition
 * Deterministic multi-step workflow execution.
 * Chains are configurable per Mind.
 */

import { isFeatureActive } from './featureFlags';

export type ToolStepStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped';

export interface ToolStep {
  id: string;
  tool: string;
  description: string;
  /** Input mapping: keys from previous step outputs */
  inputMapping?: Record<string, string>;
  /** Timeout in ms */
  timeoutMs: number;
  /** Whether to continue chain on failure */
  continueOnFailure: boolean;
  /** Max retries for this step */
  maxRetries: number;
}

export interface ToolChainDefinition {
  id: string;
  name: string;
  description: string;
  steps: ToolStep[];
  /** Which Mind SKUs can use this chain */
  allowedMinds: string[] | '*';
}

export interface ToolChainExecution {
  chainId: string;
  startedAt: number;
  steps: Array<{
    stepId: string;
    status: ToolStepStatus;
    output?: unknown;
    error?: string;
    durationMs?: number;
    retryCount: number;
  }>;
  status: 'running' | 'completed' | 'failed' | 'aborted';
  completedAt?: number;
}

/** Pre-defined tool chains per Mind archetype */
const CHAIN_REGISTRY: Map<string, ToolChainDefinition> = new Map();

// ─── Default chains ───

CHAIN_REGISTRY.set('research-report', {
  id: 'research-report',
  name: 'Research → Summarize → Draft → Format',
  description: 'Full research pipeline from query to formatted report',
  allowedMinds: ['research', 'hybrid', 'analyst'],
  steps: [
    {
      id: 'research',
      tool: 'web_research',
      description: 'Gather sources and raw data',
      timeoutMs: 30_000,
      continueOnFailure: false,
      maxRetries: 2,
    },
    {
      id: 'summarize',
      tool: 'summarize',
      description: 'Extract key findings from research',
      inputMapping: { content: 'research.output' },
      timeoutMs: 15_000,
      continueOnFailure: false,
      maxRetries: 1,
    },
    {
      id: 'draft',
      tool: 'draft_document',
      description: 'Draft structured report',
      inputMapping: { findings: 'summarize.output' },
      timeoutMs: 20_000,
      continueOnFailure: false,
      maxRetries: 1,
    },
    {
      id: 'format',
      tool: 'format_output',
      description: 'Apply formatting and citations',
      inputMapping: { document: 'draft.output' },
      timeoutMs: 10_000,
      continueOnFailure: true,
      maxRetries: 1,
    },
  ],
});

CHAIN_REGISTRY.set('sales-prospect', {
  id: 'sales-prospect',
  name: 'Research → Score → Prep → Draft',
  description: 'Sales prospect research and outreach prep',
  allowedMinds: ['sales'],
  steps: [
    {
      id: 'research',
      tool: 'prospect_research',
      description: 'Research company and contact',
      timeoutMs: 25_000,
      continueOnFailure: false,
      maxRetries: 2,
    },
    {
      id: 'score',
      tool: 'deal_score',
      description: 'Score deal probability',
      inputMapping: { prospect: 'research.output' },
      timeoutMs: 10_000,
      continueOnFailure: true,
      maxRetries: 1,
    },
    {
      id: 'prep',
      tool: 'meeting_prep',
      description: 'Generate meeting brief and talking points',
      inputMapping: { prospect: 'research.output', score: 'score.output' },
      timeoutMs: 15_000,
      continueOnFailure: false,
      maxRetries: 1,
    },
    {
      id: 'draft',
      tool: 'outreach_draft',
      description: 'Draft personalized outreach',
      inputMapping: { brief: 'prep.output' },
      timeoutMs: 10_000,
      continueOnFailure: true,
      maxRetries: 1,
    },
  ],
});

CHAIN_REGISTRY.set('lesson-plan', {
  id: 'lesson-plan',
  name: 'Analyze → Scaffold → Generate → Review',
  description: 'Curriculum design pipeline',
  allowedMinds: ['educator'],
  steps: [
    {
      id: 'analyze',
      tool: 'learning_gap_analysis',
      description: 'Identify knowledge gaps and objectives',
      timeoutMs: 15_000,
      continueOnFailure: false,
      maxRetries: 1,
    },
    {
      id: 'scaffold',
      tool: 'curriculum_scaffold',
      description: 'Build lesson structure',
      inputMapping: { gaps: 'analyze.output' },
      timeoutMs: 15_000,
      continueOnFailure: false,
      maxRetries: 1,
    },
    {
      id: 'generate',
      tool: 'content_generate',
      description: 'Generate lesson content and exercises',
      inputMapping: { structure: 'scaffold.output' },
      timeoutMs: 20_000,
      continueOnFailure: false,
      maxRetries: 1,
    },
    {
      id: 'review',
      tool: 'quality_review',
      description: 'Review for accuracy and pedagogical quality',
      inputMapping: { lesson: 'generate.output' },
      timeoutMs: 10_000,
      continueOnFailure: true,
      maxRetries: 1,
    },
  ],
});

CHAIN_REGISTRY.set('code-review', {
  id: 'code-review',
  name: 'Parse → Analyze → Suggest → Format',
  description: 'Code review and improvement pipeline',
  allowedMinds: ['coding'],
  steps: [
    {
      id: 'parse',
      tool: 'code_parse',
      description: 'Parse and understand code structure',
      timeoutMs: 10_000,
      continueOnFailure: false,
      maxRetries: 1,
    },
    {
      id: 'analyze',
      tool: 'code_analyze',
      description: 'Identify issues, patterns, and improvements',
      inputMapping: { ast: 'parse.output' },
      timeoutMs: 15_000,
      continueOnFailure: false,
      maxRetries: 1,
    },
    {
      id: 'suggest',
      tool: 'code_suggest',
      description: 'Generate improvement suggestions',
      inputMapping: { analysis: 'analyze.output' },
      timeoutMs: 15_000,
      continueOnFailure: true,
      maxRetries: 1,
    },
    {
      id: 'format',
      tool: 'review_format',
      description: 'Format as structured review',
      inputMapping: { suggestions: 'suggest.output' },
      timeoutMs: 5_000,
      continueOnFailure: true,
      maxRetries: 1,
    },
  ],
});

// ─── Execution engine ───

const activeExecutions = new Map<string, ToolChainExecution>();

/** Resolve an input mapping to actual values from previous step outputs */
function resolveInputs(
  execution: ToolChainExecution,
  mapping?: Record<string, string>
): Record<string, unknown> {
  if (!mapping) return {};
  const resolved: Record<string, unknown> = {};

  for (const [key, ref] of Object.entries(mapping)) {
    const [stepId, field] = ref.split('.');
    const step = execution.steps.find(s => s.stepId === stepId);
    if (step?.output && field) {
      resolved[key] = typeof step.output === 'object' && step.output !== null
        ? (step.output as Record<string, unknown>)[field]
        : step.output;
    }
  }

  return resolved;
}

/** Execute a tool chain */
export async function executeChain(
  chainId: string,
  mindSku: string,
  initialInput: Record<string, unknown>,
  toolExecutor: (tool: string, input: Record<string, unknown>) => Promise<unknown>
): Promise<ToolChainExecution> {
  if (!isFeatureActive('tool_chain_composition')) {
    throw new Error('Tool chain composition is not active');
  }

  const chain = CHAIN_REGISTRY.get(chainId);
  if (!chain) throw new Error(`Unknown chain: ${chainId}`);

  if (chain.allowedMinds !== '*' && !chain.allowedMinds.includes(mindSku)) {
    throw new Error(`Mind "${mindSku}" not allowed for chain "${chainId}"`);
  }

  const execution: ToolChainExecution = {
    chainId,
    startedAt: Date.now(),
    steps: chain.steps.map(s => ({
      stepId: s.id,
      status: 'pending' as ToolStepStatus,
      retryCount: 0,
    })),
    status: 'running',
  };

  const executionId = `${chainId}-${Date.now()}`;
  activeExecutions.set(executionId, execution);

  try {
    for (let i = 0; i < chain.steps.length; i++) {
      const stepDef = chain.steps[i];
      const stepExec = execution.steps[i];

      stepExec.status = 'running';
      const startTime = Date.now();

      // Resolve inputs from previous steps or initial input
      const inputs = i === 0
        ? initialInput
        : { ...initialInput, ...resolveInputs(execution, stepDef.inputMapping) };

      let lastError: string | undefined;

      for (let retry = 0; retry <= stepDef.maxRetries; retry++) {
        try {
          const result = await Promise.race([
            toolExecutor(stepDef.tool, inputs),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error(`Step "${stepDef.id}" timed out after ${stepDef.timeoutMs}ms`)), stepDef.timeoutMs)
            ),
          ]);

          stepExec.output = result;
          stepExec.status = 'completed';
          stepExec.durationMs = Date.now() - startTime;
          stepExec.retryCount = retry;
          lastError = undefined;
          break;
        } catch (err) {
          lastError = err instanceof Error ? err.message : String(err);
          stepExec.retryCount = retry;
        }
      }

      if (lastError) {
        stepExec.status = 'failed';
        stepExec.error = lastError;
        stepExec.durationMs = Date.now() - startTime;

        if (!stepDef.continueOnFailure) {
          execution.status = 'failed';
          execution.completedAt = Date.now();
          // Mark remaining steps as skipped
          for (let j = i + 1; j < execution.steps.length; j++) {
            execution.steps[j].status = 'skipped';
          }
          return execution;
        }
      }
    }

    execution.status = 'completed';
    execution.completedAt = Date.now();
  } finally {
    // Cleanup after 5 minutes
    setTimeout(() => activeExecutions.delete(executionId), 300_000);
  }

  return execution;
}

/** Register a custom chain */
export function registerChain(chain: ToolChainDefinition): void {
  CHAIN_REGISTRY.set(chain.id, chain);
}

/** Get chain definition */
export function getChain(chainId: string): ToolChainDefinition | undefined {
  return CHAIN_REGISTRY.get(chainId);
}

/** Get all chains available for a Mind */
export function getChainsForMind(mindSku: string): ToolChainDefinition[] {
  return Array.from(CHAIN_REGISTRY.values()).filter(
    c => c.allowedMinds === '*' || c.allowedMinds.includes(mindSku)
  );
}

/** Get active execution count */
export function getActiveExecutionCount(): number {
  return activeExecutions.size;
}
