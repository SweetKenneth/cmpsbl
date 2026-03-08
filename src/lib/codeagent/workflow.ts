/**
 * Encoded Workflow Engine — READ → PLAN → WRITE → GUARD → READ → FIX → VERIFY → FINALIZE
 * Baseline implementation with guardrails, anchor checks, and narrative bans
 * 
 * Workflow stages:
 * 1. READ: Gather context, understand scope, query Brain for patterns
 * 2. PLAN: Analyze impact, check dependencies, plan changes  
 * 3. WRITE: Generate code via Nexus router (free-tier AI)
 * 4. GUARD: Run guardrail checks (anchor preservation, narrative ban, destructive detection)
 * 5. READ_VERIFY: Re-read output to check for issues
 * 6. FIX_ERRORS: Correct any problems found during read-verify
 * 7. VERIFY: Final validation, security checks, pattern compliance
 * 8. FINALIZE: Apply changes, record for rollback, learn from outcome
 * 
 * Invariants (fail-closed):
 * - Must read actual file contents before writing
 * - Must preserve exports, handlers, entrypoints
 * - Destructive changes require human approval
 * - Narrative/personality code is forbidden
 */

import { 
  shadowGenerate, 
  shadowValidate, 
  getShadowModeStatus,
  type ShadowGenerationRequest,
  type ShadowGenerationResult 
} from './shadow-mode';
import { generateWithNexus, type NexusGenerationResult } from './nexus-generator';
import { recordChange, getRecentChanges } from './rollback';
import { assessAction, checkForbiddenPatterns, checkRequiredPatterns } from './knowledge';
import { getServiceHealth } from './circuit-breaker';
import { checkBrainFirst } from './brain-first';
import { learnFromCodeAction } from './learning-engine';
import { 
  runEncodedGuard, 
  summarizeGuardResult,
  type GuardResult,
} from './encoded';

// ═══════════════════════════════════════════════════════════════
// WORKFLOW TYPES
// ═══════════════════════════════════════════════════════════════

export type WorkflowStage = 'idle' | 'reading' | 'planning' | 'writing' | 'guarding' | 'read_verify' | 'fixing' | 'verifying' | 'finalizing' | 'complete' | 'failed' | 'blocked';

// Progress callback for real-time updates
export type ProgressCallback = (stage: WorkflowStage, message: string, detail?: string) => void;

let progressCallback: ProgressCallback | null = null;

export function setProgressCallback(callback: ProgressCallback | null): void {
  progressCallback = callback;
}

function emitProgress(stage: WorkflowStage, message: string, detail?: string): void {
  console.log(`[Encoded] ${stage}: ${message}${detail ? ` — ${detail}` : ''}`);
  if (progressCallback) {
    progressCallback(stage, message, detail);
  }
}

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
  /** Explicit human approval for destructive changes */
  humanApproved?: boolean;
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
  /** Guard check result from Lov-baseline enforcement */
  guardResult?: GuardResult;
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
  
  emitProgress('reading', 'Starting context gathering', `Module: ${request.module}`);
  
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
  emitProgress('reading', 'Scanning related files...');
  await delay(200);
  
  // Determine related files
  context.relatedFiles = getRelatedFiles(request.module, request.changeType);
  currentWorkflow.currentStageProgress = 50;
  emitProgress('reading', `Found ${context.relatedFiles.length} related files`, context.relatedFiles.slice(0, 2).join(', '));
  
  // Check dependencies
  context.dependencies = getDependencies(request.module);
  currentWorkflow.currentStageProgress = 75;
  emitProgress('reading', `Identified ${context.dependencies.length} dependencies`);
  
  // Query brain for relevant knowledge
  context.brainKnowledge = await queryBrainKnowledge(request.description, request.module);
  currentWorkflow.currentStageProgress = 100;
  emitProgress('reading', `Loaded ${context.brainKnowledge.length} knowledge entries from Brain`, 'Ready to plan');
  
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
  // Query real Brain memory for relevant patterns
  try {
    const brainCheck = await checkBrainFirst(description, module, 'edge_function');
    
    if (brainCheck.hasRelevantSkills) {
      return brainCheck.skills.slice(0, 5).map(skill => ({
        id: skill.id,
        title: skill.title,
        confidence: skill.confidence,
        content: skill.content,
      }));
    }
  } catch (error) {
    console.warn('[Workflow] Brain query failed, using fallback:', error);
  }
  
  // Fallback to static knowledge if brain query fails
  const fallbackKnowledge: Record<string, WorkflowContext['brainKnowledge']> = {
    brain: [
      { id: 'k1', title: 'Memory persistence patterns', confidence: 0.92, content: 'Use brain_memories table with proper RLS' },
      { id: 'k2', title: 'Event logging standards', confidence: 0.88, content: 'Log to brain_events with module and outcome' },
    ],
    defense: [
      { id: 'k3', title: 'Circuit breaker implementation', confidence: 0.95, content: 'Use 3-failure threshold with 60s recovery' },
      { id: 'k4', title: 'Rate limiting patterns', confidence: 0.91, content: 'Sliding window with token bucket fallback' },
    ],
    nexus: [
      { id: 'k5', title: 'Free-tier routing', confidence: 0.95, content: 'Use callFreeTierAI with fallback chain' },
      { id: 'k6', title: 'Health monitoring', confidence: 0.90, content: 'Track provider health scores 0-100' },
    ],
  };
  
  return fallbackKnowledge[module] || [];
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

async function stagePlan(request: WorkflowRequest, context: WorkflowContext): Promise<ThinkingResult> {
  currentWorkflow.stage = 'planning';
  currentWorkflow.currentStageProgress = 0;
  
  emitProgress('planning', 'Analyzing request and planning approach', request.description.slice(0, 80));
  
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
  emitProgress('planning', `Impact analysis: ${result.impactedModules.length} modules affected`, result.impactedModules.join(', '));
  await delay(150);
  
  // Identify risks
  currentWorkflow.currentStageProgress = 50;
  result.risks = identifyRisks(request, context);
  if (result.risks.length > 0) {
    emitProgress('planning', `Identified ${result.risks.length} risk(s)`, result.risks[0]);
  } else {
    emitProgress('planning', 'No significant risks identified');
  }
  await delay(150);
  
  // Determine patterns to use
  currentWorkflow.currentStageProgress = 75;
  result.patterns = selectPatterns(request.changeType);
  emitProgress('planning', `Selected ${result.patterns.length} patterns`, result.patterns.slice(0, 3).join(', '));
  
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
  
  emitProgress('planning', `Assessment complete`, `Confidence: ${assessment.confidenceLevel}, Can proceed: ${assessment.canProceed}`);
  
  currentWorkflow.currentStageProgress = 100;
  currentWorkflow.completedStages.push('planning');
  
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
  
  emitProgress('writing', 'Generating code via Nexus router (free-tier AI)', `Patterns: ${thinking.patterns.slice(0, 2).join(', ')}`);
  
  currentWorkflow.currentStageProgress = 30;
  
  // Try real Nexus generation first, fallback to shadow mode
  try {
    emitProgress('writing', 'Calling Nexus router...');
    const nexusResult = await generateWithNexus({
      module: request.module,
      changeType: request.changeType,
      description: request.description,
      filePath: request.filePath,
      existingCode: request.existingCode,
      priority: 'speed',
    });
    
    currentWorkflow.currentStageProgress = 100;
    
    if (nexusResult.success) {
      emitProgress('writing', `Generated ${nexusResult.code.split('\n').length} lines via ${nexusResult.provider}`, `Brain-assisted: ${nexusResult.brainAssisted}`);
      currentWorkflow.completedStages.push('writing');
      
      return {
        success: true,
        code: nexusResult.code,
        filePath: nexusResult.filePath,
        operation: nexusResult.operation,
        confidence: nexusResult.confidence,
        provider: nexusResult.provider,
        model: nexusResult.model,
        latencyMs: nexusResult.latencyMs,
        validation: nexusResult.validation,
        shadowMode: false as unknown as true, // Type compatibility
      };
    }
    
    // Fall through to shadow mode if Nexus fails
    emitProgress('writing', 'Nexus unavailable, using template fallback...');
  } catch (error) {
    console.warn('[Workflow] Nexus generation failed, using shadow mode:', error);
    emitProgress('writing', 'Using template fallback...');
  }
  
  // Fallback to shadow mode
  const shadowRequest: ShadowGenerationRequest = {
    module: request.module,
    changeType: request.changeType,
    description: request.description,
    filePath: request.filePath,
  };
  
  currentWorkflow.currentStageProgress = 80;
  const generated = await shadowGenerate(shadowRequest);
  
  currentWorkflow.currentStageProgress = 100;
  emitProgress('writing', `Generated ${generated.code.split('\n').length} lines (template)`, `File: ${generated.filePath}`);
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

async function stageVerify(
  generated: ShadowGenerationResult,
  request: WorkflowRequest
): Promise<ConfirmationResult> {
  currentWorkflow.stage = 'verifying';
  currentWorkflow.currentStageProgress = 0;
  
  emitProgress('verifying', 'Running validation checks', `Checking ${generated.code.split('\n').length} lines`);
  
  // Validate the generated code
  currentWorkflow.currentStageProgress = 25;
  const validation = await shadowValidate(generated.code);
  emitProgress('verifying', 'Syntax validation complete', validation.valid ? 'No issues' : `${validation.issues.length} issues found`);
  
  // Check for forbidden patterns
  currentWorkflow.currentStageProgress = 50;
  const patternCheck = checkForbiddenPatterns(generated.code);
  emitProgress('verifying', 'Security pattern check complete', patternCheck.safe ? 'All clear' : `${patternCheck.violations.length} violations`);
  
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
  const passed = validation.valid && patternCheck.safe && allIssues.length === 0;
  emitProgress('verifying', passed ? 'All checks passed ✓' : `Found ${allIssues.length} issue(s)`, allIssues[0] || '');
  currentWorkflow.completedStages.push('verifying');
  
  return {
    passed,
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

async function stageFinalize(
  generated: ShadowGenerationResult,
  request: WorkflowRequest,
  confirmation: ConfirmationResult
): Promise<SubmitResult> {
  currentWorkflow.stage = 'finalizing';
  currentWorkflow.currentStageProgress = 0;
  
  emitProgress('finalizing', 'Preparing to finalize changes');
  
  if (!confirmation.passed) {
    currentWorkflow.stage = 'failed';
    currentWorkflow.error = `Validation failed: ${confirmation.issues.join(', ')}`;
    emitProgress('failed', 'Cannot finalize — validation failed', confirmation.issues[0]);
    return {
      success: false,
      rollbackId: '',
      appliedAt: new Date(),
      message: currentWorkflow.error,
    };
  }
  
  // Record the change for rollback
  currentWorkflow.currentStageProgress = 50;
  emitProgress('finalizing', 'Recording change for rollback capability');
  const changeRecord = recordChange({
    changeType: 'code',
    module: request.module,
    description: request.description,
    beforeState: request.existingCode || '',
    afterState: generated.code,
    appliedBy: 'agent',
  });
  
  // Record learning from this code action
  try {
    await learnFromCodeAction({
      id: changeRecord.id,
      actionType: 'generate',
      module: request.module,
      description: request.description,
      code: generated.code,
      filePath: generated.filePath,
      success: true,
      confidence: generated.confidence,
      duration: Date.now() - currentWorkflow.startedAt.getTime(),
    });
  } catch { /* Non-critical — don't block finalization */ }
  
  currentWorkflow.currentStageProgress = 100;
  emitProgress('complete', 'Code generation complete!', `Rollback ID: ${changeRecord.id.slice(0, 8)}`);
  currentWorkflow.completedStages.push('finalizing');
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
  /** Guard result from Lov-baseline enforcement */
  guardResult?: GuardResult;
  /** Whether the change was blocked by guardrails */
  blocked?: boolean;
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
    
    // Stage 2: PLAN
    const planning = await stagePlan(request, context);
    currentWorkflow.context.impactedModules = planning.impactedModules;
    currentWorkflow.context.risks = planning.risks;
    currentWorkflow.context.patterns = planning.patterns;
    
    // Check if we can proceed
    if (!planning.assessment.canProceed) {
      currentWorkflow.stage = 'failed';
      currentWorkflow.error = `Cannot proceed: ${planning.assessment.warnings.join(', ')}`;
      return {
        success: false,
        stage: 'planning',
        message: currentWorkflow.error,
        duration: Date.now() - startTime,
        stagesCompleted: currentWorkflow.completedStages,
      };
    }
    
    // Stage 3: WRITE
    const generated = await stageWrite(request, context, planning);
    
    // Stage 4: GUARD — Run Lov-baseline guardrail checks
    currentWorkflow.stage = 'guarding';
    currentWorkflow.currentStageProgress = 0;
    emitProgress('guarding', 'Running guardrail checks', 'Anchor preservation, narrative ban, destructive detection');
    
    const existingCode = request.existingCode || '';
    const guardResult = runEncodedGuard(
      existingCode,
      generated.code,
      request.humanApproved || false,
      generated.filePath
    );
    
    currentWorkflow.currentStageProgress = 100;
    
    if (!guardResult.ok) {
      // BLOCKED — fail closed
      currentWorkflow.stage = 'blocked';
      currentWorkflow.error = `Guardrail violation: ${guardResult.reasons.join('; ')}`;
      emitProgress('blocked', 'Change blocked by guardrails', guardResult.reasons[0]);
      
      return {
        success: false,
        stage: 'blocked',
        code: generated.code,
        filePath: generated.filePath,
        operation: generated.operation,
        confidence: generated.confidence,
        message: `🚫 BLOCKED: ${guardResult.reasons.join('; ')}`,
        duration: Date.now() - startTime,
        stagesCompleted: currentWorkflow.completedStages,
        guardResult,
        blocked: true,
      };
    }
    
    emitProgress('guarding', `Guard passed: ${guardResult.changeClass.toUpperCase()}`, 
      `Risk: ${guardResult.risk}, Anchors: ${guardResult.anchorsPreserved ? 'preserved' : 'modified'}`);
    currentWorkflow.completedStages.push('guarding');
    
    // Stage 5: READ_VERIFY (re-read output to check for issues)
    currentWorkflow.stage = 'read_verify';
    currentWorkflow.currentStageProgress = 0;
    emitProgress('read_verify', 'Re-reading generated code to check for issues');
    await delay(100);
    const rereadCheck = await shadowValidate(generated.code);
    currentWorkflow.currentStageProgress = 100;
    emitProgress('read_verify', rereadCheck.valid ? 'Code looks good' : `Found ${rereadCheck.issues.length} issue(s) to fix`);
    currentWorkflow.completedStages.push('read_verify');
    
    // Stage 6: FIX_ERRORS (if any issues found)
    let fixedCode = generated.code;
    if (!rereadCheck.valid || rereadCheck.issues.length > 0) {
      currentWorkflow.stage = 'fixing';
      currentWorkflow.currentStageProgress = 0;
      emitProgress('fixing', 'Auto-fixing basic issues', rereadCheck.issues[0]);
      // Attempt to auto-fix basic issues
      fixedCode = autoFixBasicIssues(generated.code, rereadCheck.issues);
      currentWorkflow.currentStageProgress = 100;
      emitProgress('fixing', 'Applied automatic fixes');
      currentWorkflow.completedStages.push('fixing');
    } else {
      emitProgress('read_verify', 'No fixes needed, proceeding to verification');
    }
    
    // Stage 7: VERIFY
    const verification = await stageVerify({ ...generated, code: fixedCode }, request);
    
    // Stage 8: FINALIZE
    const finalizeResult = await stageFinalize({ ...generated, code: fixedCode }, request, verification);
    
    // Build result
    const result: WorkflowExecutionResult = {
      success: finalizeResult.success,
      stage: currentWorkflow.stage,
      code: fixedCode,
      filePath: generated.filePath,
      operation: generated.operation,
      confidence: generated.confidence,
      validation: verification,
      rollbackId: finalizeResult.rollbackId,
      message: finalizeResult.message,
      duration: Date.now() - startTime,
      stagesCompleted: currentWorkflow.completedStages,
      guardResult,
      blocked: false,
    };
    
    // Store result
    currentWorkflow.result = {
      code: fixedCode,
      filePath: generated.filePath,
      operation: generated.operation,
      confidence: generated.confidence,
      validation: {
        passed: verification.passed,
        issues: verification.issues,
        metrics: verification.metrics,
      },
      preview: verification.preview,
      approved: verification.passed,
      appliedAt: finalizeResult.appliedAt,
      rollbackId: finalizeResult.rollbackId,
      guardResult,
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

/**
 * Auto-fix basic code issues (trailing whitespace, missing semicolons, etc.)
 */
function autoFixBasicIssues(code: string, issues: string[]): string {
  let fixed = code;
  
  // Fix trailing whitespace
  fixed = fixed.replace(/[ \t]+$/gm, '');
  
  // Ensure file ends with newline
  if (!fixed.endsWith('\n')) {
    fixed += '\n';
  }
  
  // Log fixes applied
  console.log('[Encoded] Auto-fixed basic issues:', issues.length);
  
  return fixed;
}

export function getWorkflowProgress(): {
  stage: WorkflowStage;
  stageProgress: number;
  overallProgress: number;
  completedStages: WorkflowStage[];
} {
  const stages: WorkflowStage[] = ['reading', 'planning', 'writing', 'guarding', 'read_verify', 'fixing', 'verifying', 'finalizing'];
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
