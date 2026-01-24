/**
 * CodeAgent Workflow Engine — Robust Read-Think-Write-Confirm-Submit Pattern
 * v1.0.0 — Mirrors the human agent workflow for reliable code changes
 * 
 * Workflow stages:
 * 1. READ: Gather context, understand scope, read related files
 * 2. THINK: Analyze impact, check dependencies, plan changes
 * 3. WRITE: Generate code with templates and patterns
 * 4. CONFIRM: Validate, preview, get approval
 * 5. SUBMIT: Apply changes, record for rollback, learn from outcome
 */

import { 
  shadowGenerate, 
  shadowValidate, 
  getShadowModeStatus,
  type ShadowGenerationRequest,
  type ShadowGenerationResult 
} from './shadow-mode';
import { recordChange, getRecentChanges } from './rollback';
import { assessAction, checkForbiddenPatterns, checkRequiredPatterns } from './knowledge';
import { getServiceHealth } from './circuit-breaker';

// ═══════════════════════════════════════════════════════════════
// WORKFLOW TYPES
// ═══════════════════════════════════════════════════════════════

export type WorkflowStage = 'idle' | 'reading' | 'thinking' | 'writing' | 'confirming' | 'submitting' | 'complete' | 'failed';

export interface WorkflowState {
  stage: WorkflowStage;
  startedAt: Date;
  completedStages: WorkflowStage[];
  currentStageProgress: number;
  request: WorkflowRequest | null;
  context: WorkflowContext;
  result: WorkflowResult | null;
  error: string | null;
}

export interface WorkflowRequest {
  description: string;
  module: string;
  changeType: string;
  filePath?: string;
  existingCode?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
}

export interface WorkflowContext {
  relatedFiles: string[];
  dependencies: string[];
  impactedModules: string[];
  risks: string[];
  patterns: string[];
  existingCode?: string;
  brainKnowledge: Array<{
    id: string;
    title: string;
    confidence: number;
    content: string;
  }>;
}

export interface WorkflowResult {
  code: string;
  filePath: string;
  operation: 'create' | 'modify' | 'delete';
  confidence: number;
  validation: {
    passed: boolean;
    issues: string[];
    metrics: {
      lines: number;
      complexity: 'low' | 'medium' | 'high';
      safe: boolean;
    };
  };
  preview: string;
  approved: boolean;
  appliedAt?: Date;
  rollbackId?: string;
}

// ═══════════════════════════════════════════════════════════════
// WORKFLOW STATE MANAGEMENT
// ═══════════════════════════════════════════════════════════════

let currentWorkflow: WorkflowState = createInitialState();

function createInitialState(): WorkflowState {
  return {
    stage: 'idle',
    startedAt: new Date(),
    completedStages: [],
    currentStageProgress: 0,
    request: null,
    context: {
      relatedFiles: [],
      dependencies: [],
      impactedModules: [],
      risks: [],
      patterns: [],
      brainKnowledge: [],
    },
    result: null,
    error: null,
  };
}

export function getWorkflowState(): WorkflowState {
  return { ...currentWorkflow };
}

export function resetWorkflow(): void {
  currentWorkflow = createInitialState();
}

// ═══════════════════════════════════════════════════════════════
// STAGE 1: READ — Gather Context
// ═══════════════════════════════════════════════════════════════

async function stageRead(request: WorkflowRequest): Promise<WorkflowContext> {
  currentWorkflow.stage = 'reading';
  currentWorkflow.currentStageProgress = 0;
  
  const context: WorkflowContext = {
    relatedFiles: [],
    dependencies: [],
    impactedModules: [],
    risks: [],
    patterns: [],
    brainKnowledge: [],
  };
  
  // Simulate reading related files based on module
  currentWorkflow.currentStageProgress = 25;
  await delay(200);
  
  // Determine related files
  context.relatedFiles = getRelatedFiles(request.module, request.changeType);
  currentWorkflow.currentStageProgress = 50;
  
  // Check dependencies
  context.dependencies = getDependencies(request.module);
  currentWorkflow.currentStageProgress = 75;
  
  // Query brain for relevant knowledge
  context.brainKnowledge = await queryBrainKnowledge(request.description, request.module);
  currentWorkflow.currentStageProgress = 100;
  
  currentWorkflow.completedStages.push('reading');
  return context;
}

function getRelatedFiles(module: string, changeType: string): string[] {
  const moduleFiles: Record<string, string[]> = {
    brain: ['src/lib/substrate.ts', 'src/hooks/useSubstrate.ts', 'supabase/functions/pf-substrate/index.ts'],
    defense: ['src/lib/codeagent/circuit-breaker.ts', 'src/lib/codeagent/executor.ts'],
    decode: ['src/components/substrate-os/DecodeTab.tsx', 'src/hooks/useSubstrate.ts'],
    nexus: ['src/lib/substrate.ts', 'src/components/substrate-os/NexusTab.tsx'],
    vision: ['src/components/substrate-os/VisionTab.tsx', 'src/hooks/useSubstrate.ts'],
    modernizer: ['src/pages/Modernizer.tsx', 'src/components/modernizer/'],
    system: ['src/lib/substrate.ts', 'src/config/'],
    core: ['src/lib/codeagent/', 'src/config/'],
  };
  
  return moduleFiles[module] || ['src/lib/substrate.ts'];
}

function getDependencies(module: string): string[] {
  const deps: Record<string, string[]> = {
    brain: ['@supabase/supabase-js', 'date-fns'],
    defense: ['@tanstack/react-query'],
    decode: ['framer-motion', 'lucide-react'],
    nexus: ['recharts', 'date-fns'],
    vision: ['recharts'],
    modernizer: ['framer-motion', 'jszip'],
    system: [],
    core: [],
  };
  
  return deps[module] || [];
}

async function queryBrainKnowledge(description: string, module: string): Promise<WorkflowContext['brainKnowledge']> {
  await delay(100);
  
  // Return simulated brain knowledge based on module
  const knowledge: Record<string, WorkflowContext['brainKnowledge']> = {
    brain: [
      { id: 'k1', title: 'Memory persistence patterns', confidence: 0.92, content: 'Use brain_memories table with proper RLS' },
      { id: 'k2', title: 'Event logging standards', confidence: 0.88, content: 'Log to brain_events with module and outcome' },
    ],
    defense: [
      { id: 'k3', title: 'Circuit breaker implementation', confidence: 0.95, content: 'Use 3-failure threshold with 60s recovery' },
      { id: 'k4', title: 'Rate limiting patterns', confidence: 0.91, content: 'Sliding window with token bucket fallback' },
    ],
    modernizer: [
      { id: 'k5', title: 'Job status management', confidence: 0.89, content: 'Use modernizer_jobs table with status enum' },
      { id: 'k6', title: 'Accessibility scanning', confidence: 0.87, content: 'WCAG 2.1 AA compliance checks' },
    ],
  };
  
  return knowledge[module] || [];
}

// ═══════════════════════════════════════════════════════════════
// STAGE 2: THINK — Analyze and Plan
// ═══════════════════════════════════════════════════════════════

interface ThinkingResult {
  impactedModules: string[];
  risks: string[];
  patterns: string[];
  assessment: {
    canProceed: boolean;
    confidenceLevel: 'low' | 'medium' | 'high' | 'unknown';
    requiresApproval: boolean;
    warnings: string[];
    suggestions: string[];
  };
}

async function stageThink(request: WorkflowRequest, context: WorkflowContext): Promise<ThinkingResult> {
  currentWorkflow.stage = 'thinking';
  currentWorkflow.currentStageProgress = 0;
  
  const result: ThinkingResult = {
    impactedModules: [],
    risks: [],
    patterns: [],
    assessment: {
      canProceed: true,
      confidenceLevel: 'medium',
      requiresApproval: false,
      warnings: [],
      suggestions: [],
    },
  };
  
  // Analyze impacted modules
  currentWorkflow.currentStageProgress = 25;
  result.impactedModules = analyzeImpact(request.module, request.changeType);
  await delay(150);
  
  // Identify risks
  currentWorkflow.currentStageProgress = 50;
  result.risks = identifyRisks(request, context);
  await delay(150);
  
  // Determine patterns to use
  currentWorkflow.currentStageProgress = 75;
  result.patterns = selectPatterns(request.changeType);
  
  // Run assessment
  currentWorkflow.currentStageProgress = 90;
  const assessment = assessAction(
    request.description,
    request.module,
    request.changeType,
    context.brainKnowledge.map(k => ({
      id: k.id,
      category: 'skill' as const,
      title: k.title,
      content: k.content,
      confidence: k.confidence,
      useCount: 1,
      successRate: 0.9,
      tags: [request.module],
      createdAt: new Date(),
      updatedAt: new Date(),
    }))
  );
  
  result.assessment = {
    canProceed: assessment.canProceed,
    confidenceLevel: assessment.confidenceLevel,
    requiresApproval: assessment.requiresApproval,
    warnings: assessment.warnings,
    suggestions: assessment.suggestions,
  };
  
  currentWorkflow.currentStageProgress = 100;
  currentWorkflow.completedStages.push('thinking');
  
  return result;
}

function analyzeImpact(module: string, changeType: string): string[] {
  const impactMap: Record<string, string[]> = {
    edge_function: [module, 'substrate'],
    config_update: [module, 'system'],
    prompt_refinement: [module, 'brain'],
    rls_policy: [module, 'defense', 'auth'],
    rate_limit: [module, 'defense', 'access'],
  };
  
  return impactMap[changeType] || [module];
}

function identifyRisks(request: WorkflowRequest, context: WorkflowContext): string[] {
  const risks: string[] = [];
  
  if (request.changeType === 'rls_policy') {
    risks.push('RLS changes affect data access security');
  }
  
  if (request.changeType === 'edge_function' && request.module === 'brain') {
    risks.push('Brain module changes may affect learning and memory');
  }
  
  if (context.dependencies.length > 3) {
    risks.push('Multiple dependencies increase integration complexity');
  }
  
  if (request.priority === 'critical') {
    risks.push('Critical priority requires immediate attention and careful review');
  }
  
  return risks;
}

function selectPatterns(changeType: string): string[] {
  const patternMap: Record<string, string[]> = {
    edge_function: ['cors-headers', 'error-handling', 'json-response', 'rate-limiting'],
    config_update: ['typed-config', 'feature-flags', 'environment-aware'],
    prompt_refinement: ['system-prompt', 'context-injection', 'output-format'],
    rls_policy: ['user-ownership', 'role-based', 'operator-access'],
    rate_limit: ['sliding-window', 'token-bucket', 'circuit-breaker'],
  };
  
  return patternMap[changeType] || ['general'];
}

// ═══════════════════════════════════════════════════════════════
// STAGE 3: WRITE — Generate Code
// ═══════════════════════════════════════════════════════════════

async function stageWrite(
  request: WorkflowRequest, 
  context: WorkflowContext,
  thinking: ThinkingResult
): Promise<ShadowGenerationResult> {
  currentWorkflow.stage = 'writing';
  currentWorkflow.currentStageProgress = 0;
  
  // Generate code using shadow mode
  currentWorkflow.currentStageProgress = 30;
  
  const shadowRequest: ShadowGenerationRequest = {
    module: request.module,
    changeType: request.changeType,
    description: request.description,
    filePath: request.filePath,
  };
  
  currentWorkflow.currentStageProgress = 50;
  const generated = await shadowGenerate(shadowRequest);
  
  currentWorkflow.currentStageProgress = 100;
  currentWorkflow.completedStages.push('writing');
  
  return generated;
}

// ═══════════════════════════════════════════════════════════════
// STAGE 4: CONFIRM — Validate and Preview
// ═══════════════════════════════════════════════════════════════

interface ConfirmationResult {
  passed: boolean;
  issues: string[];
  metrics: {
    lines: number;
    complexity: 'low' | 'medium' | 'high';
    safe: boolean;
  };
  preview: string;
}

async function stageConfirm(
  generated: ShadowGenerationResult,
  request: WorkflowRequest
): Promise<ConfirmationResult> {
  currentWorkflow.stage = 'confirming';
  currentWorkflow.currentStageProgress = 0;
  
  // Validate the generated code
  currentWorkflow.currentStageProgress = 25;
  const validation = await shadowValidate(generated.code);
  
  // Check for forbidden patterns
  currentWorkflow.currentStageProgress = 50;
  const patternCheck = checkForbiddenPatterns(generated.code);
  
  // Check for required patterns
  currentWorkflow.currentStageProgress = 75;
  const requiredCheck = checkRequiredPatterns(
    generated.code,
    request.changeType === 'edge_function'
  );
  
  const allIssues = [
    ...validation.issues,
    ...patternCheck.violations,
    ...requiredCheck.missing,
  ];
  
  currentWorkflow.currentStageProgress = 100;
  currentWorkflow.completedStages.push('confirming');
  
  return {
    passed: validation.valid && patternCheck.safe && allIssues.length === 0,
    issues: allIssues,
    metrics: {
      lines: validation.metrics?.lines || 0,
      complexity: validation.complexity || 'medium',
      safe: patternCheck.safe,
    },
    preview: generatePreview(generated, validation),
  };
}

function generatePreview(generated: ShadowGenerationResult, validation: Awaited<ReturnType<typeof shadowValidate>>): string {
  const lines = generated.code.split('\n');
  const preview = lines.slice(0, 20).join('\n');
  const truncated = lines.length > 20 ? `\n// ... ${lines.length - 20} more lines` : '';
  
  return `// File: ${generated.filePath}
// Operation: ${generated.operation}
// Confidence: ${(generated.confidence * 100).toFixed(0)}%
// Lines: ${validation.metrics?.lines || 0}
// Complexity: ${validation.complexity}

${preview}${truncated}`;
}

// ═══════════════════════════════════════════════════════════════
// STAGE 5: SUBMIT — Apply Changes
// ═══════════════════════════════════════════════════════════════

interface SubmitResult {
  success: boolean;
  rollbackId: string;
  appliedAt: Date;
  message: string;
}

async function stageSubmit(
  generated: ShadowGenerationResult,
  request: WorkflowRequest,
  confirmation: ConfirmationResult
): Promise<SubmitResult> {
  currentWorkflow.stage = 'submitting';
  currentWorkflow.currentStageProgress = 0;
  
  if (!confirmation.passed) {
    currentWorkflow.stage = 'failed';
    currentWorkflow.error = `Validation failed: ${confirmation.issues.join(', ')}`;
    return {
      success: false,
      rollbackId: '',
      appliedAt: new Date(),
      message: currentWorkflow.error,
    };
  }
  
  // Record the change for rollback
  currentWorkflow.currentStageProgress = 50;
  const changeRecord = recordChange({
    changeType: 'code',
    module: request.module,
    description: request.description,
    beforeState: request.existingCode || '',
    afterState: generated.code,
    appliedBy: 'agent',
  });
  
  currentWorkflow.currentStageProgress = 100;
  currentWorkflow.completedStages.push('submitting');
  currentWorkflow.stage = 'complete';
  
  return {
    success: true,
    rollbackId: changeRecord.id,
    appliedAt: new Date(),
    message: `Successfully generated ${request.changeType} for ${request.module} module`,
  };
}

// ═══════════════════════════════════════════════════════════════
// MAIN WORKFLOW EXECUTOR
// ═══════════════════════════════════════════════════════════════

export interface WorkflowExecutionResult {
  success: boolean;
  stage: WorkflowStage;
  code?: string;
  filePath?: string;
  operation?: 'create' | 'modify' | 'delete';
  confidence?: number;
  validation?: ConfirmationResult;
  rollbackId?: string;
  message: string;
  duration: number;
  stagesCompleted: WorkflowStage[];
}

export async function executeWorkflow(request: WorkflowRequest): Promise<WorkflowExecutionResult> {
  const startTime = Date.now();
  resetWorkflow();
  
  currentWorkflow.request = request;
  currentWorkflow.startedAt = new Date();
  
  try {
    // Stage 1: READ
    const context = await stageRead(request);
    currentWorkflow.context = context;
    
    // Stage 2: THINK
    const thinking = await stageThink(request, context);
    currentWorkflow.context.impactedModules = thinking.impactedModules;
    currentWorkflow.context.risks = thinking.risks;
    currentWorkflow.context.patterns = thinking.patterns;
    
    // Check if we can proceed
    if (!thinking.assessment.canProceed) {
      currentWorkflow.stage = 'failed';
      currentWorkflow.error = `Cannot proceed: ${thinking.assessment.warnings.join(', ')}`;
      return {
        success: false,
        stage: 'thinking',
        message: currentWorkflow.error,
        duration: Date.now() - startTime,
        stagesCompleted: currentWorkflow.completedStages,
      };
    }
    
    // Stage 3: WRITE
    const generated = await stageWrite(request, context, thinking);
    
    // Stage 4: CONFIRM
    const confirmation = await stageConfirm(generated, request);
    
    // Stage 5: SUBMIT
    const submitResult = await stageSubmit(generated, request, confirmation);
    
    // Build result
    const result: WorkflowExecutionResult = {
      success: submitResult.success,
      stage: currentWorkflow.stage,
      code: generated.code,
      filePath: generated.filePath,
      operation: generated.operation,
      confidence: generated.confidence,
      validation: confirmation,
      rollbackId: submitResult.rollbackId,
      message: submitResult.message,
      duration: Date.now() - startTime,
      stagesCompleted: currentWorkflow.completedStages,
    };
    
    // Store result
    currentWorkflow.result = {
      code: generated.code,
      filePath: generated.filePath,
      operation: generated.operation,
      confidence: generated.confidence,
      validation: {
        passed: confirmation.passed,
        issues: confirmation.issues,
        metrics: confirmation.metrics,
      },
      preview: confirmation.preview,
      approved: confirmation.passed,
      appliedAt: submitResult.appliedAt,
      rollbackId: submitResult.rollbackId,
    };
    
    return result;
    
  } catch (error) {
    currentWorkflow.stage = 'failed';
    currentWorkflow.error = error instanceof Error ? error.message : 'Unknown error';
    
    return {
      success: false,
      stage: currentWorkflow.stage,
      message: currentWorkflow.error,
      duration: Date.now() - startTime,
      stagesCompleted: currentWorkflow.completedStages,
    };
  }
}

// ═══════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function getWorkflowProgress(): {
  stage: WorkflowStage;
  stageProgress: number;
  overallProgress: number;
  completedStages: WorkflowStage[];
} {
  const stages: WorkflowStage[] = ['reading', 'thinking', 'writing', 'confirming', 'submitting'];
  const completedCount = currentWorkflow.completedStages.length;
  const currentStageIndex = stages.indexOf(currentWorkflow.stage);
  
  const overallProgress = currentStageIndex >= 0
    ? ((currentStageIndex / stages.length) * 100) + (currentWorkflow.currentStageProgress / stages.length)
    : completedCount === stages.length ? 100 : 0;
  
  return {
    stage: currentWorkflow.stage,
    stageProgress: currentWorkflow.currentStageProgress,
    overallProgress: Math.min(100, Math.round(overallProgress)),
    completedStages: currentWorkflow.completedStages,
  };
}
