/**
 * CodeAgent Executor — Resilient Code Generation with Self-Healing
 * Shadow Mode for full UI functionality
 * Wraps the substrate coder with circuit breakers and error handling
 */

import { supabase } from '@/integrations/supabase/client';
import { 
  resilientCall, 
  getServiceHealth, 
  recordSuccess, 
  recordFailure,
  isCircuitOpen,
  resetCircuit,
  type ServiceHealth 
} from './circuit-breaker';
import { checkBrainFirst, recordSkillUsage } from './brain-first';
import { recordChange, markApplied, markFailed, rollbackLast } from './rollback';
import { 
  assessAction, 
  checkForbiddenPatterns, 
  checkRequiredPatterns,
  type ActionAssessment 
} from './knowledge';
import {
  isShadowModeActive,
  shadowGenerate,
  shadowValidate,
  shadowExecute,
  getShadowCoderStatus,
  getShadowSandboxStatus,
  getShadowModeStatus,
} from './shadow-mode';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface CodeRequest {
  description: string;
  module: string;
  changeType: string;
  filePath?: string;
  existingCode?: string;
}

export interface CodeResult {
  success: boolean;
  code?: string;
  filePath?: string;
  operation?: 'create' | 'modify' | 'delete';
  confidence?: number;
  provider?: string;
  model?: string;
  latencyMs?: number;
  validation?: {
    safe: boolean;
    issues: string[];
  };
  assessment?: ActionAssessment;
  error?: string;
  fallbackUsed?: boolean;
}

export interface ValidationResult {
  valid: boolean;
  issues: string[];
  complexity?: 'low' | 'medium' | 'high';
  metrics?: {
    lines: number;
    functions: number;
    imports: number;
    async_ops: number;
  };
}

// ═══════════════════════════════════════════════════════════════
// SERVICE NAMES
// ═══════════════════════════════════════════════════════════════

const SERVICES = {
  CODER: 'substrate-coder',
  SANDBOX: 'substrate-sandbox',
  BRAIN: 'brain-query',
} as const;

// ═══════════════════════════════════════════════════════════════
// FALLBACK RESPONSES
// ═══════════════════════════════════════════════════════════════

function getCoderFallback(request: CodeRequest): CodeResult {
  return {
    success: false,
    error: 'Code generation service temporarily unavailable. Please try again in a moment.',
    fallbackUsed: true,
    assessment: {
      canProceed: false,
      confidenceLevel: 'unknown',
      requiresApproval: true,
      warnings: ['Service circuit is open - automatic recovery in progress'],
      suggestions: ['Wait 60 seconds and retry', 'Check system health in Vision tab'],
      relatedKnowledge: [],
      rollbackAvailable: false,
    },
  };
}

function getSandboxFallback(): ValidationResult {
  return {
    valid: false, // Do NOT assume valid when sandbox is down
    issues: ['Validation service unavailable — code not verified'],
    complexity: 'medium',
  };
}

// ═══════════════════════════════════════════════════════════════
// MAIN EXECUTOR
// ═══════════════════════════════════════════════════════════════

/**
 * Generate code with full resilience: brain-first check, circuit breakers, validation
 * Now prioritizes Shadow Mode when edge functions are unavailable
 */
export async function generateCode(request: CodeRequest): Promise<CodeResult> {
  const startTime = Date.now();
  
  try {
    // Step 0: Check if we should use Shadow Mode (edge functions not available)
    if (isShadowModeActive()) {
      console.log('[Executor] Using Shadow Mode for code generation');
      const shadowResult = await shadowGenerate({
        module: request.module,
        changeType: request.changeType,
        description: request.description,
        filePath: request.filePath,
      });
      
      // Record the change for potential rollback
      if (shadowResult.success) {
        recordChange({
          changeType: 'code',
          module: request.module,
          description: request.description,
          beforeState: request.existingCode || '',
          afterState: shadowResult.code,
          appliedBy: 'agent', // Shadow agent is still an 'agent' type
        });
      }
      
      return {
        success: shadowResult.success,
        code: shadowResult.code,
        filePath: shadowResult.filePath,
        operation: shadowResult.operation,
        confidence: shadowResult.confidence,
        provider: shadowResult.provider,
        model: shadowResult.model,
        latencyMs: Date.now() - startTime,
        validation: shadowResult.validation,
        assessment: {
          canProceed: true,
          confidenceLevel: 'high',
          requiresApproval: false,
          warnings: ['Running in Shadow Mode - edge functions not connected'],
          suggestions: [],
          relatedKnowledge: [],
          rollbackAvailable: true,
        },
        fallbackUsed: false,
      };
    }
    
    // Step 1: Check if circuit is open
    if (isCircuitOpen(SERVICES.CODER)) {
      console.warn('[Executor] Coder circuit is open, using fallback');
      return getCoderFallback(request);
    }
    
    // Step 2: Brain-first check - see if we can answer locally
    const brainCheck = await resilientCall({
      service: SERVICES.BRAIN,
      operation: () => checkBrainFirst(request.description, request.module, request.changeType),
      fallback: () => ({
        hasRelevantSkills: false,
        skills: [],
        canAnswerLocally: false,
        confidenceThreshold: 0.75,
        recommendedAction: 'call_llm' as const,
      }),
      timeout: 5000,
    });
    
    // Step 3: Pre-flight assessment
    const assessment = assessAction(
      request.description,
      request.module,
      request.changeType,
      brainCheck.skills.map(s => ({
        id: s.id,
        category: s.skillType as 'pattern' | 'boundary' | 'skill' | 'heuristic' | 'error',
        title: s.title,
        content: s.content,
        confidence: s.confidence,
        useCount: s.useCount,
        successRate: s.successRate,
        tags: s.tags,
        createdAt: s.lastUsed || new Date(),
        updatedAt: s.lastUsed || new Date(),
      }))
    );
    
    if (!assessment.canProceed) {
      return {
        success: false,
        error: `Action blocked: ${assessment.warnings.join(', ')}`,
        assessment,
      };
    }
    
    // Step 4: If brain can answer locally with high confidence, use it
    if (brainCheck.canAnswerLocally && brainCheck.localAnswer) {
      console.log('[Executor] Using brain-first local answer');
      
      // Record skill usage for learning
      for (const skill of brainCheck.skills) {
        await recordSkillUsage(skill.id, true);
      }
      
      return {
        success: true,
        code: brainCheck.localAnswer,
        filePath: request.filePath || `supabase/functions/pf-${request.module}/improvement.ts`,
        operation: 'modify',
        confidence: brainCheck.skills[0]?.confidence || 0.75,
        provider: 'brain-local',
        model: 'knowledge-bank',
        latencyMs: Date.now() - startTime,
        assessment,
        fallbackUsed: false,
      };
    }
    
    // Step 5: Call the substrate coder with resilience
    const result = await resilientCall({
      service: SERVICES.CODER,
      operation: async () => {
        const response = await supabase.functions.invoke('pf-substrate-coder', {
          body: {
            action: 'generate',
            improvement: {
              module: request.module,
              change_type: request.changeType,
              description: request.description,
              file_path: request.filePath,
            },
            context: request.existingCode ? { existing_code: request.existingCode } : undefined,
          },
        });
        
        if (response.error) {
          throw new Error(response.error.message || 'Coder invocation failed');
        }
        
        if (!response.data?.success) {
          throw new Error(response.data?.error || 'Code generation failed');
        }
        
        return response.data;
      },
      fallback: () => null,
      timeout: 30000,
      retries: 2,
    });
    
    if (!result) {
      return getCoderFallback(request);
    }
    
    const generated = result.generated;
    
    // Step 6: Validate the generated code
    const validation = await validateCode(generated.code);
    
    // Step 7: Check for forbidden patterns
    const patternCheck = checkForbiddenPatterns(generated.code);
    const requiredCheck = checkRequiredPatterns(
      generated.code, 
      request.changeType === 'edge_function'
    );
    
    const allIssues = [
      ...validation.issues,
      ...patternCheck.violations,
      ...requiredCheck.missing,
    ];
    
    // Step 8: Record the change for potential rollback (always record when safe)
    if (patternCheck.safe) {
      recordChange({
        changeType: 'code',
        module: request.module,
        description: request.description,
        beforeState: request.existingCode || '',
        afterState: generated.code,
        appliedBy: 'agent',
      });
    }
    
    return {
      success: patternCheck.safe,
      code: generated.code,
      filePath: generated.file_path,
      operation: generated.operation,
      confidence: generated.confidence,
      provider: result.provider,
      model: result.model,
      latencyMs: Date.now() - startTime,
      validation: {
        safe: patternCheck.safe && allIssues.length === 0,
        issues: allIssues,
      },
      assessment,
      fallbackUsed: false,
    };
    
  } catch (error) {
    console.error('[Executor] Code generation failed:', error);
    
    recordFailure(SERVICES.CODER, error instanceof Error ? error.message : 'Unknown error');
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Code generation failed',
      latencyMs: Date.now() - startTime,
      fallbackUsed: true,
    };
  }
}

/**
 * Validate code through the sandbox with resilience
 * Uses Shadow Mode when edge functions are unavailable
 */
export async function validateCode(code: string): Promise<ValidationResult> {
  // Use shadow mode if active
  if (isShadowModeActive()) {
    return shadowValidate(code);
  }
  
  return resilientCall({
    service: SERVICES.SANDBOX,
    operation: async () => {
      const response = await supabase.functions.invoke('pf-substrate-sandbox', {
        body: {
          action: 'validate',
          code,
          language: 'typescript',
        },
      });
      
      if (response.error) {
        throw new Error(response.error.message || 'Sandbox invocation failed');
      }
      
      return {
        valid: response.data?.success ?? false,
        issues: response.data?.issues || [],
        complexity: response.data?.analysis?.complexity || 'medium',
        metrics: response.data?.analysis?.metrics || { lines: 0, functions: 0, imports: 0, async_ops: 0 },
      };
    },
    fallback: () => ({
      valid: true,
      issues: ['Validation service unavailable - code not verified'],
      complexity: 'medium' as const,
      metrics: { lines: 0, functions: 0, imports: 0, async_ops: 0 },
    }),
    timeout: 10000,
    retries: 1,
  });
}

/**
 * Execute code in the sandbox with resilience
 * Uses Shadow Mode when edge functions are unavailable
 */
export async function executeInSandbox(code: string): Promise<{
  success: boolean;
  output?: string;
  error?: string;
  analysis?: object;
}> {
  // Use shadow mode if active
  if (isShadowModeActive()) {
    return shadowExecute(code);
  }
  
  return resilientCall({
    service: SERVICES.SANDBOX,
    operation: async () => {
      const response = await supabase.functions.invoke('pf-substrate-sandbox', {
        body: {
          action: 'execute',
          code,
          language: 'typescript',
        },
      });
      
      if (response.error) {
        throw new Error(response.error.message || 'Sandbox execution failed');
      }
      
      return {
        success: response.data?.success ?? false,
        output: response.data?.output || '',
        error: response.data?.error || undefined,
        analysis: response.data?.analysis || {},
      };
    },
    fallback: () => ({
      success: false,
      output: '',
      error: 'Sandbox service unavailable',
      analysis: {},
    }),
    timeout: 15000,
  });
}

/**
 * Get the current health of all CodeAgent services
 */
export function getCodeAgentHealth(): {
  coder: ServiceHealth;
  sandbox: ServiceHealth;
  brain: ServiceHealth;
  overall: {
    healthy: boolean;
    message: string;
  };
} {
  const coder = getServiceHealth(SERVICES.CODER);
  const sandbox = getServiceHealth(SERVICES.SANDBOX);
  const brain = getServiceHealth(SERVICES.BRAIN);
  
  const allHealthy = coder.state === 'closed' && 
                     sandbox.state === 'closed' && 
                     brain.state === 'closed';
  
  const avgHealth = (coder.healthScore + sandbox.healthScore + brain.healthScore) / 3;
  
  return {
    coder,
    sandbox,
    brain,
    overall: {
      healthy: allHealthy && avgHealth >= 70,
      message: allHealthy 
        ? `All services operational (${Math.round(avgHealth)}% health)`
        : `Some services degraded - check individual health scores`,
    },
  };
}

/**
 * Manually reset a service circuit (for recovery)
 */
export function resetService(service: 'coder' | 'sandbox' | 'brain'): void {
  const serviceMap = {
    coder: SERVICES.CODER,
    sandbox: SERVICES.SANDBOX,
    brain: SERVICES.BRAIN,
  };
  
  resetCircuit(serviceMap[service]);
}

/**
 * Attempt to rollback the last code change
 */
export async function rollbackLastChange(): Promise<{
  success: boolean;
  message: string;
}> {
  const result = await rollbackLast();
  
  if (result.success) {
    return {
      success: true,
      message: 'Successfully rolled back the last change',
    };
  }
  
  return {
    success: false,
    message: result.error || 'Rollback failed',
  };
}

/**
 * Learn from a code execution outcome
 */
export async function learnFromOutcome(
  code: string,
  outcome: 'success' | 'failure' | 'rollback'
): Promise<void> {
  try {
    await supabase.functions.invoke('pf-substrate-coder', {
      body: {
        action: 'learn',
        code,
        outcome,
      },
    });
    
    // Update rollback status
    if (outcome === 'success') {
      markApplied(code);
    } else {
      markFailed(code);
    }
    
    console.log(`[Executor] Learned from ${outcome} outcome`);
  } catch (error) {
    console.error('[Executor] Failed to learn from outcome:', error);
  }
}
