/**
 * CORTEX — Workflow Template Registry
 * Reusable pipeline patterns: fan-out/fan-in, retry chains, sequential flows.
 */

export type WorkflowPattern = 'sequential' | 'fan-out' | 'fan-in' | 'fan-out-fan-in' | 'retry-chain' | 'conditional' | 'saga';

export interface WorkflowTemplate {
  id: string;
  name: string;
  pattern: WorkflowPattern;
  description: string;
  stages: WorkflowStageTemplate[];
  retryPolicy?: RetryPolicy;
  timeoutMs?: number;
  tags: string[];
  usageCount: number;
  successRate: number;
  createdAt: string;
}

export interface WorkflowStageTemplate {
  stageId: string;
  name: string;
  dependencies: string[];
  resolver?: string;
  isOptional?: boolean;
  timeoutMs?: number;
  retryable?: boolean;
}

export interface RetryPolicy {
  maxRetries: number;
  backoffMs: number;
  backoffMultiplier: number;
  maxBackoffMs: number;
}

const templateStore = new Map<string, WorkflowTemplate>();

// Built-in templates
const BUILT_IN_TEMPLATES: WorkflowTemplate[] = [
  {
    id: 'tpl-sequential-analysis',
    name: 'Sequential Analysis',
    pattern: 'sequential',
    description: 'Linear pipeline: decode → analyze → encode output',
    stages: [
      { stageId: 'decode', name: 'Decode Input', dependencies: [] },
      { stageId: 'analyze', name: 'Analyze', dependencies: ['decode'] },
      { stageId: 'encode', name: 'Encode Output', dependencies: ['analyze'] },
    ],
    tags: ['analysis', 'basic'],
    usageCount: 0,
    successRate: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'tpl-fan-out-fan-in',
    name: 'Parallel Multi-Node Analysis',
    pattern: 'fan-out-fan-in',
    description: 'Fan out to multiple analyzers, merge results',
    stages: [
      { stageId: 'split', name: 'Split Input', dependencies: [] },
      { stageId: 'brain-analyze', name: 'BRAIN Analysis', dependencies: ['split'] },
      { stageId: 'oracle-predict', name: 'ORACLE Prediction', dependencies: ['split'] },
      { stageId: 'conscience-check', name: 'CONSCIENCE Check', dependencies: ['split'] },
      { stageId: 'merge', name: 'Merge Results', dependencies: ['brain-analyze', 'oracle-predict', 'conscience-check'] },
    ],
    tags: ['parallel', 'multi-node', 'consensus'],
    usageCount: 0,
    successRate: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'tpl-saga-workflow',
    name: 'Saga Workflow',
    pattern: 'saga',
    description: 'Compensating transaction pattern with rollback stages',
    stages: [
      { stageId: 'validate', name: 'Validate', dependencies: [], retryable: true },
      { stageId: 'reserve', name: 'Reserve Resources', dependencies: ['validate'], retryable: true },
      { stageId: 'execute', name: 'Execute', dependencies: ['reserve'] },
      { stageId: 'confirm', name: 'Confirm', dependencies: ['execute'] },
    ],
    retryPolicy: { maxRetries: 3, backoffMs: 1000, backoffMultiplier: 2, maxBackoffMs: 10000 },
    tags: ['saga', 'transactional', 'rollback'],
    usageCount: 0,
    successRate: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'tpl-retry-chain',
    name: 'Retry Chain',
    pattern: 'retry-chain',
    description: 'Escalating retry with fallback providers',
    stages: [
      { stageId: 'primary', name: 'Primary Attempt', dependencies: [], retryable: true },
      { stageId: 'fallback-1', name: 'Fallback 1', dependencies: [], isOptional: true },
      { stageId: 'fallback-2', name: 'Fallback 2', dependencies: [], isOptional: true },
    ],
    retryPolicy: { maxRetries: 3, backoffMs: 500, backoffMultiplier: 2, maxBackoffMs: 8000 },
    tags: ['retry', 'resilience'],
    usageCount: 0,
    successRate: 1,
    createdAt: new Date().toISOString(),
  },
];

export function initTemplateRegistry(): void {
  for (const t of BUILT_IN_TEMPLATES) {
    templateStore.set(t.id, t);
  }
}

export function getTemplate(id: string): WorkflowTemplate | undefined {
  return templateStore.get(id);
}

export function registerTemplate(template: WorkflowTemplate): void {
  templateStore.set(template.id, template);
}

export function listTemplates(pattern?: WorkflowPattern): WorkflowTemplate[] {
  const all = Array.from(templateStore.values());
  return pattern ? all.filter(t => t.pattern === pattern) : all;
}

export function recordTemplateUsage(id: string, success: boolean): void {
  const t = templateStore.get(id);
  if (!t) return;
  t.usageCount++;
  const totalSuccess = t.successRate * (t.usageCount - 1) + (success ? 1 : 0);
  t.successRate = totalSuccess / t.usageCount;
}

export function findBestTemplate(tags: string[]): WorkflowTemplate | undefined {
  const all = Array.from(templateStore.values());
  let best: WorkflowTemplate | undefined;
  let bestScore = -1;

  for (const t of all) {
    const overlap = t.tags.filter(tag => tags.includes(tag)).length;
    const score = overlap * 10 + t.successRate * 5 + Math.min(t.usageCount, 100) * 0.1;
    if (score > bestScore) {
      bestScore = score;
      best = t;
    }
  }

  return best;
}

// Auto-init
initTemplateRegistry();
