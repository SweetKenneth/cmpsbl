/**
 * Encoded Nexus Generator — Real AI Code Generation via pf-nexus-router
 * v1.0.0 — Connects Encoded to the free-tier AI routing layer
 * 
 * Flow:
 * 1. Check Brain for existing patterns (brain-first.ts)
 * 2. Build optimized prompt (encoded-prompts.ts)
 * 3. Call pf-nexus-router for generation
 * 4. Validate and refine output
 * 5. Store learnings in Brain memory
 */

import { supabase } from '@/integrations/supabase/client';
import { checkBrainFirst, recordSkillUsage, type BrainCheckResult } from './brain-first';
import { selectPromptForTask, buildRefinementPrompt, buildVerificationPrompt } from './encoded-prompts';
import { learnFromCodeAction } from './learning-engine';
import { checkForbiddenPatterns, checkRequiredPatterns } from './knowledge';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface NexusGenerationRequest {
  module: string;
  changeType: string;
  description: string;
  filePath?: string;
  existingCode?: string;
  priority?: 'speed' | 'reliability' | 'cost';
}

export interface NexusGenerationResult {
  success: boolean;
  code: string;
  filePath: string;
  operation: 'create' | 'modify';
  confidence: number;
  provider: string;
  model: string;
  latencyMs: number;
  brainAssisted: boolean;
  validation: {
    safe: boolean;
    issues: string[];
  };
  learningId?: string;
}

export interface GenerationStats {
  totalGenerations: number;
  successRate: number;
  avgLatencyMs: number;
  brainHitRate: number;
  topProvider: string;
}

// ═══════════════════════════════════════════════════════════════
// IN-MEMORY STATS
// ═══════════════════════════════════════════════════════════════

const stats = {
  totalGenerations: 0,
  successfulGenerations: 0,
  totalLatencyMs: 0,
  brainHits: 0,
  providerCounts: {} as Record<string, number>,
};

// ═══════════════════════════════════════════════════════════════
// MAIN GENERATION FUNCTION
// ═══════════════════════════════════════════════════════════════

/**
 * Generate code using the Nexus router with Brain-first optimization
 */
export async function generateWithNexus(
  request: NexusGenerationRequest
): Promise<NexusGenerationResult> {
  const startTime = Date.now();
  stats.totalGenerations++;

  try {
    // Step 1: Check Brain for relevant patterns
    console.log('[Nexus] Step 1: Checking Brain for patterns...');
    const brainCheck = await checkBrainFirst(
      request.description,
      request.module,
      request.changeType
    );

    let brainAssisted = false;
    let generatedCode = '';
    let provider = 'nexus';
    let model = 'llama-3.3-70b';

    // Step 2: Decide generation strategy
    if (brainCheck.canAnswerLocally && brainCheck.localAnswer) {
      // Brain has high-confidence patterns - use them directly
      console.log('[Nexus] Brain can answer locally with high confidence');
      generatedCode = synthesizeFromBrain(brainCheck, request);
      brainAssisted = true;
      provider = 'brain-memory';
      model = 'local-patterns';
      stats.brainHits++;
    } else {
      // Need to call Nexus router for generation
      console.log('[Nexus] Calling pf-nexus-router for generation...');
      
      // Build optimized prompt with learned patterns
      const prompt = selectPromptForTask(
        request.changeType,
        request.description,
        request.module,
        {
          existingCode: request.existingCode,
          learnedPatterns: brainCheck.skills,
          failedPatterns: await getFailedPatterns(request.module),
        }
      );

      // Call the Nexus router
      const nexusResult = await callNexusRouter(prompt, request.priority);
      
      if (!nexusResult.success) {
        throw new Error(nexusResult.error || 'Nexus generation failed');
      }

      generatedCode = extractCode(nexusResult.content);
      provider = nexusResult.provider;
      model = nexusResult.model;
      brainAssisted = brainCheck.skills.length > 0;
    }

    // Step 3: Validate the generated code
    console.log('[Nexus] Step 3: Validating generated code...');
    const validation = await validateGeneratedCode(generatedCode, request.changeType);

    // Step 4: Refine if issues found
    if (!validation.safe && validation.issues.length > 0) {
      console.log('[Nexus] Issues found, attempting refinement...');
      const refined = await refineCode(generatedCode, validation.issues, request.priority);
      if (refined.success) {
        generatedCode = refined.code;
        validation.safe = true;
        validation.issues = [];
      }
    }

    // Step 5: Determine file path
    const filePath = request.filePath || inferFilePath(request.module, request.changeType);

    // Step 6: Record learning
    const latencyMs = Date.now() - startTime;
    const learningOutcome = await learnFromCodeAction({
      id: `gen_${Date.now()}`,
      actionType: 'generate',
      module: request.module,
      changeType: request.changeType,
      description: request.description,
      code: generatedCode,
      outcome: validation.safe ? 'success' : 'partial',
      duration: latencyMs,
      metadata: { provider, model, brainAssisted },
    });

    // Update stats
    stats.successfulGenerations++;
    stats.totalLatencyMs += latencyMs;
    stats.providerCounts[provider] = (stats.providerCounts[provider] || 0) + 1;

    // Record skill usage for reinforcement
    for (const skill of brainCheck.skills.slice(0, 3)) {
      await recordSkillUsage(skill.id, validation.safe);
    }

    return {
      success: true,
      code: generatedCode,
      filePath,
      operation: request.existingCode ? 'modify' : 'create',
      confidence: validation.safe ? 0.9 : 0.6,
      provider,
      model,
      latencyMs,
      brainAssisted,
      validation,
      learningId: learningOutcome.actionId,
    };

  } catch (error) {
    const latencyMs = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Log failure for learning
    await learnFromCodeAction({
      id: `gen_${Date.now()}`,
      actionType: 'generate',
      module: request.module,
      changeType: request.changeType,
      description: request.description,
      code: '',
      outcome: 'failure',
      duration: latencyMs,
      metadata: { error: errorMessage },
    });

    return {
      success: false,
      code: '',
      filePath: request.filePath || '',
      operation: 'create',
      confidence: 0,
      provider: 'error',
      model: 'none',
      latencyMs,
      brainAssisted: false,
      validation: { safe: false, issues: [errorMessage] },
    };
  }
}

// ═══════════════════════════════════════════════════════════════
// NEXUS ROUTER INTEGRATION
// ═══════════════════════════════════════════════════════════════

interface NexusRouterResponse {
  success: boolean;
  content: string;
  provider: string;
  model: string;
  error?: string;
  latency_ms?: number;
  healthScore?: number;
}

async function callNexusRouter(
  prompt: string,
  priority: 'speed' | 'reliability' | 'cost' = 'speed'
): Promise<NexusRouterResponse> {
  try {
    const { data, error } = await supabase.functions.invoke('pf-nexus-router', {
      body: {
        prompt,
        systemPrompt: 'You are Encoded, a senior software architect. Output ONLY code, no explanations.',
        temperature: 0.3, // Lower temperature for more deterministic code
        maxTokens: 2000,
        priority,
        metadata: { source: 'encoded', type: 'code_generation' },
      },
    });

    if (error) {
      console.error('[Nexus] Router error:', error);
      
      // Report 429 exhaustion to provider-discovery for limit calibration
      if (error.message?.includes('429') || error.message?.includes('rate limit')) {
        reportProviderExhaustion(data?.provider || 'unknown', 429, error.message).catch(() => {});
      }
      
      return {
        success: false,
        content: '',
        provider: 'error',
        model: 'none',
        error: error.message,
      };
    }

    return {
      success: data?.success || false,
      content: data?.content || '',
      provider: data?.provider || 'unknown',
      model: data?.model || 'unknown',
      latency_ms: data?.latency_ms,
      healthScore: data?.healthScore,
    };

  } catch (error) {
    console.error('[Nexus] Call failed:', error);
    
    // Report potential exhaustion
    const errMsg = error instanceof Error ? error.message : 'Unknown error';
    if (errMsg.includes('429') || errMsg.includes('rate limit')) {
      reportProviderExhaustion('unknown', 429, errMsg).catch(() => {});
    }
    
    return {
      success: false,
      content: '',
      provider: 'error',
      model: 'none',
      error: errMsg,
    };
  }
}

// ═══════════════════════════════════════════════════════════════
// CODE SYNTHESIS FROM BRAIN
// ═══════════════════════════════════════════════════════════════

function synthesizeFromBrain(
  brainCheck: BrainCheckResult,
  request: NexusGenerationRequest
): string {
  // Find the best matching template from Brain skills
  const templateSkills = brainCheck.skills.filter(s => 
    s.skillType === 'template' || s.skillType === 'pattern'
  );

  if (templateSkills.length === 0) {
    return brainCheck.localAnswer || '';
  }

  // Use the highest confidence template
  const bestTemplate = templateSkills.sort((a, b) => b.confidence - a.confidence)[0];
  
  // Replace placeholders
  let code = bestTemplate.content;
  code = code.replace(/\{\{module\}\}/g, request.module);
  code = code.replace(/\{\{description\}\}/g, request.description);
  code = code.replace(/\{\{timestamp\}\}/g, new Date().toISOString());

  return code;
}

// ═══════════════════════════════════════════════════════════════
// VALIDATION
// ═══════════════════════════════════════════════════════════════

async function validateGeneratedCode(
  code: string,
  changeType: string
): Promise<{ safe: boolean; issues: string[] }> {
  const issues: string[] = [];

  // Check forbidden patterns
  const forbidden = checkForbiddenPatterns(code);
  if (!forbidden.safe) {
    issues.push(...forbidden.violations);
  }

  // Check required patterns for edge functions
  if (changeType === 'edge_function') {
    const required = checkRequiredPatterns(code, true);
    if (!required.complete) {
      issues.push(...required.missing);
    }
  }

  // Basic syntax checks
  if (code.includes('any') && !code.includes('// eslint-disable')) {
    issues.push('TypeScript "any" type detected - prefer explicit types');
  }

  if (code.includes('console.log') && changeType === 'edge_function') {
    // This is actually okay for edge functions (logging)
  }

  return {
    safe: issues.length === 0,
    issues,
  };
}

// ═══════════════════════════════════════════════════════════════
// CODE REFINEMENT
// ═══════════════════════════════════════════════════════════════

async function refineCode(
  code: string,
  issues: string[],
  priority?: 'speed' | 'reliability' | 'cost'
): Promise<{ success: boolean; code: string }> {
  try {
    const refinementPrompt = buildRefinementPrompt(code, issues);
    const result = await callNexusRouter(refinementPrompt, priority);

    if (result.success && result.content) {
      return {
        success: true,
        code: extractCode(result.content),
      };
    }

    return { success: false, code };
  } catch {
    return { success: false, code };
  }
}

// ═══════════════════════════════════════════════════════════════
// ANTI-PATTERN RETRIEVAL
// ═══════════════════════════════════════════════════════════════

async function getFailedPatterns(
  module: string
): Promise<Array<{ pattern: string; reason: string; count: number }>> {
  try {
    const { data } = await supabase
      .from('brain_events')
      .select('data')
      .eq('module', 'codeagent')
      .eq('outcome', 'failed')
      .order('created_at', { ascending: false })
      .limit(10);

    if (!data || data.length === 0) return [];

    // Extract common failure patterns
    const patterns: Record<string, { reason: string; count: number }> = {};
    
    for (const event of data) {
      const eventData = event.data as Record<string, unknown> | null;
      const error = eventData?.error as string;
      if (error) {
        const key = error.substring(0, 50);
        if (patterns[key]) {
          patterns[key].count++;
        } else {
          patterns[key] = { reason: error, count: 1 };
        }
      }
    }

    return Object.entries(patterns).map(([pattern, info]) => ({
      pattern,
      reason: info.reason,
      count: info.count,
    }));

  } catch {
    return [];
  }
}

// ═══════════════════════════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════════════════════════

function extractCode(content: string): string {
  // Extract code from markdown code blocks
  const codeBlockMatch = content.match(/```(?:typescript|ts|javascript|js|sql)?\n?([\s\S]*?)```/);
  if (codeBlockMatch) {
    return codeBlockMatch[1].trim();
  }

  // If no code block, return content as-is (trimmed)
  return content.trim();
}

function inferFilePath(module: string, changeType: string): string {
  switch (changeType) {
    case 'edge_function':
      return `supabase/functions/pf-${module}/index.ts`;
    case 'react_component':
      return `src/components/${module}/${capitalize(module)}Component.tsx`;
    case 'react_hook':
      return `src/hooks/use${capitalize(module)}.ts`;
    case 'config_update':
      return `src/config/${module}.config.ts`;
    case 'rls_policy':
      return `supabase/migrations/${Date.now()}_${module}_rls.sql`;
    case 'rate_limit':
      return `src/lib/${module}/rate-limiter.ts`;
    default:
      return `src/lib/${module}/generated.ts`;
  }
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ═══════════════════════════════════════════════════════════════
// STATS & MONITORING
// ═══════════════════════════════════════════════════════════════

export function getGenerationStats(): GenerationStats {
  const topProvider = Object.entries(stats.providerCounts)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || 'none';

  return {
    totalGenerations: stats.totalGenerations,
    successRate: stats.totalGenerations > 0 
      ? stats.successfulGenerations / stats.totalGenerations 
      : 0,
    avgLatencyMs: stats.totalGenerations > 0 
      ? stats.totalLatencyMs / stats.totalGenerations 
      : 0,
    brainHitRate: stats.totalGenerations > 0 
      ? stats.brainHits / stats.totalGenerations 
      : 0,
    topProvider,
  };
}

export function resetGenerationStats(): void {
  stats.totalGenerations = 0;
  stats.successfulGenerations = 0;
  stats.totalLatencyMs = 0;
  stats.brainHits = 0;
  stats.providerCounts = {};
}
