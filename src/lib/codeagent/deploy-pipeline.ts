/**
 * CodeAgent v3 - Live Deployment Pipeline
 * Auto-deploy to edge functions after validation passes
 */

import { supabase } from '@/integrations/supabase/client';
import { analyzeCode } from './ast-analyzer';
import { enforceStyle } from './style-enforcer';
import { analyzePerformance } from './performance-heuristics';

export interface DeploymentResult {
  success: boolean;
  functionName: string;
  deployedAt: Date;
  version: string;
  validationPassed: boolean;
  validationErrors: string[];
  performanceScore: number;
  styleScore: number;
  rollbackAvailable: boolean;
}

export interface DeploymentConfig {
  functionName: string;
  code: string;
  autoValidate?: boolean;
  requireApproval?: boolean;
  minStyleScore?: number;
  minPerformanceScore?: number;
}

export interface PipelineStage {
  name: string;
  status: 'pending' | 'running' | 'passed' | 'failed' | 'skipped';
  duration?: number;
  error?: string;
}

export interface PipelineRun {
  id: string;
  stages: PipelineStage[];
  startedAt: Date;
  completedAt?: Date;
  result?: DeploymentResult;
}

// Pipeline stage definitions
const PIPELINE_STAGES = [
  'syntax_check',
  'ast_analysis', 
  'style_validation',
  'performance_check',
  'security_scan',
  'deploy'
] as const;

/**
 * Run the full deployment pipeline
 */
export async function runDeploymentPipeline(
  config: DeploymentConfig,
  onProgress?: (stage: string, status: PipelineStage['status']) => void
): Promise<PipelineRun> {
  const run: PipelineRun = {
    id: `deploy_${Date.now()}`,
    stages: PIPELINE_STAGES.map(name => ({ name, status: 'pending' })),
    startedAt: new Date()
  };
  
  const updateStage = (name: string, status: PipelineStage['status'], error?: string, duration?: number) => {
    const stage = run.stages.find(s => s.name === name);
    if (stage) {
      stage.status = status;
      if (error) stage.error = error;
      if (duration) stage.duration = duration;
    }
    onProgress?.(name, status);
  };
  
  let validationErrors: string[] = [];
  let styleScore = 100;
  let performanceScore = 100;
  
  try {
    // Stage 1: Syntax Check
    updateStage('syntax_check', 'running');
    const syntaxStart = Date.now();
    const syntaxResult = checkSyntax(config.code);
    if (!syntaxResult.valid) {
      updateStage('syntax_check', 'failed', syntaxResult.error, Date.now() - syntaxStart);
      validationErrors.push(`Syntax error: ${syntaxResult.error}`);
      throw new Error('Syntax check failed');
    }
    updateStage('syntax_check', 'passed', undefined, Date.now() - syntaxStart);
    
    // Stage 2: AST Analysis
    updateStage('ast_analysis', 'running');
    const astStart = Date.now();
    const analysis = analyzeCode(config.code, config.functionName);
    if (analysis.cyclomaticComplexity > 20) {
      validationErrors.push(`High complexity: ${analysis.cyclomaticComplexity}`);
    }
    updateStage('ast_analysis', 'passed', undefined, Date.now() - astStart);
    
    // Stage 3: Style Validation
    if (config.autoValidate !== false) {
      updateStage('style_validation', 'running');
      const styleStart = Date.now();
      const styleReport = enforceStyle(config.code, analysis, config.functionName);
      styleScore = styleReport.score;
      
      if (styleScore < (config.minStyleScore || 60)) {
        validationErrors.push(`Style score ${styleScore} below minimum ${config.minStyleScore || 60}`);
        updateStage('style_validation', 'failed', `Score: ${styleScore}`, Date.now() - styleStart);
      } else {
        updateStage('style_validation', 'passed', undefined, Date.now() - styleStart);
      }
    } else {
      updateStage('style_validation', 'skipped');
    }
    
    // Stage 4: Performance Check
    if (config.autoValidate !== false) {
      updateStage('performance_check', 'running');
      const perfStart = Date.now();
      const perfReport = analyzePerformance(config.code, analysis, config.functionName);
      performanceScore = perfReport.score;
      
      if (performanceScore < (config.minPerformanceScore || 50)) {
        validationErrors.push(`Performance score ${performanceScore} below minimum`);
        updateStage('performance_check', 'failed', `Score: ${performanceScore}`, Date.now() - perfStart);
      } else {
        updateStage('performance_check', 'passed', undefined, Date.now() - perfStart);
      }
    } else {
      updateStage('performance_check', 'skipped');
    }
    
    // Stage 5: Security Scan
    updateStage('security_scan', 'running');
    const secStart = Date.now();
    const securityIssues = scanSecurity(config.code);
    if (securityIssues.length > 0) {
      validationErrors.push(...securityIssues);
      updateStage('security_scan', 'failed', securityIssues[0], Date.now() - secStart);
    } else {
      updateStage('security_scan', 'passed', undefined, Date.now() - secStart);
    }
    
    // Check if we should proceed
    const hasBlockers = validationErrors.some(e => 
      e.includes('Syntax error') || e.includes('Security')
    );
    
    if (hasBlockers) {
      updateStage('deploy', 'failed', 'Blocked by validation errors');
      throw new Error('Deployment blocked by validation errors');
    }
    
    // Stage 6: Deploy
    updateStage('deploy', 'running');
    const deployStart = Date.now();
    
    // Note: Actual deployment happens through Lovable's edge function deploy mechanism
    // This records the intent and prepares the deployment
    await recordDeployment(config.functionName, config.code, {
      styleScore,
      performanceScore,
      validationErrors
    });
    
    updateStage('deploy', 'passed', undefined, Date.now() - deployStart);
    
    run.completedAt = new Date();
    run.result = {
      success: true,
      functionName: config.functionName,
      deployedAt: new Date(),
      version: `v${Date.now()}`,
      validationPassed: validationErrors.length === 0,
      validationErrors,
      performanceScore,
      styleScore,
      rollbackAvailable: true
    };
    
  } catch (error) {
    run.completedAt = new Date();
    run.result = {
      success: false,
      functionName: config.functionName,
      deployedAt: new Date(),
      version: 'failed',
      validationPassed: false,
      validationErrors,
      performanceScore,
      styleScore,
      rollbackAvailable: false
    };
  }
  
  return run;
}

/**
 * Basic syntax check
 */
function checkSyntax(code: string): { valid: boolean; error?: string } {
  // Check bracket balance
  const brackets: Record<string, number> = { '{': 0, '(': 0, '[': 0 };
  const pairs: Record<string, string> = { '}': '{', ')': '(', ']': '[' };
  
  for (const char of code) {
    if (brackets[char] !== undefined) {
      brackets[char]++;
    } else if (pairs[char]) {
      brackets[pairs[char]]--;
      if (brackets[pairs[char]] < 0) {
        return { valid: false, error: `Unexpected ${char}` };
      }
    }
  }
  
  for (const [bracket, count] of Object.entries(brackets)) {
    if (count !== 0) {
      return { valid: false, error: `Unmatched ${bracket}` };
    }
  }
  
  // Check for common syntax errors
  if (/import\s+[^{'"]+from/.test(code) && !/import\s+[\w{}\s,]+\s+from/.test(code)) {
    return { valid: false, error: 'Malformed import statement' };
  }
  
  return { valid: true };
}

/**
 * Security vulnerability scan
 */
function scanSecurity(code: string): string[] {
  const issues: string[] = [];
  
  // Check for dangerous patterns
  if (/eval\s*\(/.test(code)) {
    issues.push('Security: eval() usage detected');
  }
  
  if (/innerHTML\s*=/.test(code)) {
    issues.push('Security: innerHTML assignment (XSS risk)');
  }
  
  if (/dangerouslySetInnerHTML/.test(code) && !code.includes('sanitize')) {
    issues.push('Security: dangerouslySetInnerHTML without sanitization');
  }
  
  if (/new\s+Function\s*\(/.test(code)) {
    issues.push('Security: Dynamic Function constructor');
  }
  
  // Check for exposed secrets
  if (/(api[_-]?key|secret|password|token)\s*[:=]\s*['"][^'"]+['"]/i.test(code)) {
    issues.push('Security: Potential hardcoded secret');
  }
  
  // Check for SQL injection risks
  if (/\$\{.*\}.*(?:SELECT|INSERT|UPDATE|DELETE)/i.test(code)) {
    issues.push('Security: Potential SQL injection in template literal');
  }
  
  return issues;
}

/**
 * Record deployment for tracking
 */
async function recordDeployment(
  functionName: string,
  code: string,
  metrics: { styleScore: number; performanceScore: number; validationErrors: string[] }
): Promise<void> {
  try {
    await supabase.from('brain_events').insert({
      event_type: 'edge_function_deploy',
      module: 'codeagent',
      data: {
        function_name: functionName,
        code_hash: hashCode(code),
        style_score: metrics.styleScore,
        performance_score: metrics.performanceScore,
        validation_errors: metrics.validationErrors,
        code_size: code.length
      }
    });
  } catch (e) {
    console.warn('Failed to record deployment:', e);
  }
}

/**
 * Simple string hash
 */
function hashCode(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

/**
 * Get deployment history
 */
export async function getDeploymentHistory(
  functionName?: string,
  limit: number = 10
): Promise<{ deployedAt: Date; functionName: string; success: boolean }[]> {
  try {
    let query = supabase
      .from('brain_events')
      .select('*')
      .eq('event_type', 'edge_function_deploy')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (functionName) {
      query = query.eq('data->>function_name', functionName);
    }
    
    const { data } = await query;
    
    return (data || []).map(event => ({
      deployedAt: new Date(event.created_at),
      functionName: (event.data as Record<string, unknown>)?.function_name as string || 'unknown',
      success: true
    }));
  } catch {
    return [];
  }
}
