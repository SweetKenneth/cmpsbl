/**
 * CodeAgent v3 - Error Pattern Database
 * Track and learn from every error to prevent recurrence
 */

import { supabase } from '@/integrations/supabase/client';

export interface ErrorPattern {
  id: string;
  errorType: string;
  message: string;
  stackSignature: string;
  module: string;
  frequency: number;
  lastSeen: Date;
  firstSeen: Date;
  resolution?: string;
  preventionRule?: string;
  confidence: number;
}

export interface ErrorResolution {
  pattern: ErrorPattern;
  suggestedFix: string;
  confidence: number;
  appliedCount: number;
  successRate: number;
}

// In-memory pattern cache (bounded)
const MAX_ERROR_PATTERNS = 200;
const errorPatternCache = new Map<string, ErrorPattern>();

/**
 * Record an error occurrence and update patterns
 */
export async function recordError(
  error: Error | string,
  context: { module: string; action: string; code?: string }
): Promise<ErrorPattern> {
  const errorMessage = typeof error === 'string' ? error : error.message;
  const errorStack = typeof error === 'string' ? '' : error.stack || '';
  
  const signature = generateStackSignature(errorStack, errorMessage);
  const errorType = classifyError(errorMessage);
  
  // Check cache first
  let pattern = errorPatternCache.get(signature);
  
  if (pattern) {
    pattern.frequency++;
    pattern.lastSeen = new Date();
  } else {
    pattern = {
      id: signature,
      errorType,
      message: errorMessage,
      stackSignature: signature,
      module: context.module,
      frequency: 1,
      lastSeen: new Date(),
      firstSeen: new Date(),
      confidence: 0.5
    };
    // Evict oldest if at capacity
    if (errorPatternCache.size >= MAX_ERROR_PATTERNS) {
      const oldest = errorPatternCache.keys().next().value;
      if (oldest) errorPatternCache.delete(oldest);
    }
    errorPatternCache.set(signature, pattern);
  }
  
  // Persist to database
  try {
    await supabase.from('brain_events').insert({
      event_type: 'error_pattern',
      module: context.module,
      data: {
        error_type: errorType,
        message: errorMessage,
        signature,
        action: context.action,
        code_snippet: context.code?.substring(0, 500)
      }
    });
  } catch (e) {
    console.warn('Failed to persist error pattern:', e);
  }
  
  return pattern;
}

/**
 * Generate a unique signature for similar errors
 */
function generateStackSignature(stack: string, message: string): string {
  // Extract key parts of stack trace
  const stackLines = stack.split('\n').slice(0, 5);
  const normalizedLines = stackLines.map(line => 
    line.replace(/:\d+:\d+/g, ':X:X') // Normalize line numbers
        .replace(/\/.+\//g, '/.../') // Normalize paths
  );
  
  // Create hash-like signature
  const content = message + normalizedLines.join('');
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    hash = ((hash << 5) - hash) + content.charCodeAt(i);
    hash = hash & hash;
  }
  
  return `err_${Math.abs(hash).toString(36)}`;
}

/**
 * Classify error into categories
 */
function classifyError(message: string): string {
  const patterns: [RegExp, string][] = [
    [/undefined is not a function/i, 'type_error'],
    [/cannot read propert/i, 'null_reference'],
    [/is not defined/i, 'reference_error'],
    [/syntax error/i, 'syntax_error'],
    [/network|fetch|cors/i, 'network_error'],
    [/timeout/i, 'timeout_error'],
    [/permission|unauthorized|403|401/i, 'auth_error'],
    [/not found|404/i, 'not_found'],
    [/rls|row level security/i, 'rls_error'],
    [/duplicate|unique|constraint/i, 'constraint_error'],
    [/import|module|export/i, 'module_error'],
    [/type.*expected|assignable/i, 'typescript_error'],
  ];
  
  for (const [regex, type] of patterns) {
    if (regex.test(message)) return type;
  }
  
  return 'unknown';
}

/**
 * Find matching patterns and suggest resolutions
 */
export async function findResolution(
  error: Error | string
): Promise<ErrorResolution | null> {
  const errorMessage = typeof error === 'string' ? error : error.message;
  const errorType = classifyError(errorMessage);
  
  // Check known resolutions
  const resolutions = getKnownResolutions();
  const matching = resolutions.find(r => r.pattern.errorType === errorType);
  
  if (matching) {
    return {
      ...matching,
      suggestedFix: matching.suggestedFix.replace('{message}', errorMessage)
    };
  }
  
  // Query database for similar patterns
  try {
    const { data } = await supabase
      .from('brain_memories')
      .select('*')
      .eq('memory_type', 'error_resolution')
      .textSearch('content', errorType)
      .limit(1);
    
    if (data && data.length > 0) {
      const memory = data[0];
      return {
        pattern: {
          id: memory.id,
          errorType,
          message: errorMessage,
          stackSignature: '',
          module: 'brain',
          frequency: 1,
          lastSeen: new Date(),
          firstSeen: new Date(memory.created_at),
          confidence: memory.confidence || 0.7
        },
        suggestedFix: memory.content,
        confidence: memory.confidence || 0.7,
        appliedCount: 0,
        successRate: 0.8
      };
    }
  } catch (e) {
    console.warn('Failed to query error patterns:', e);
  }
  
  return null;
}

/**
 * Get built-in known resolutions
 */
function getKnownResolutions(): ErrorResolution[] {
  return [
    {
      pattern: {
        id: 'rls_error',
        errorType: 'rls_error',
        message: 'RLS policy violation',
        stackSignature: '',
        module: 'database',
        frequency: 100,
        lastSeen: new Date(),
        firstSeen: new Date(),
        confidence: 0.9,
        preventionRule: 'Always check auth.uid() in RLS policies'
      },
      suggestedFix: 'Check RLS policies on the affected table. Ensure user is authenticated and the policy allows the operation.',
      confidence: 0.9,
      appliedCount: 50,
      successRate: 0.95
    },
    {
      pattern: {
        id: 'null_reference',
        errorType: 'null_reference',
        message: 'Cannot read property of undefined',
        stackSignature: '',
        module: 'runtime',
        frequency: 500,
        lastSeen: new Date(),
        firstSeen: new Date(),
        confidence: 0.85,
        preventionRule: 'Use optional chaining (?.) for potentially undefined values'
      },
      suggestedFix: 'Add null check or use optional chaining: `object?.property` instead of `object.property`',
      confidence: 0.85,
      appliedCount: 200,
      successRate: 0.92
    },
    {
      pattern: {
        id: 'network_error',
        errorType: 'network_error',
        message: 'Network request failed',
        stackSignature: '',
        module: 'api',
        frequency: 80,
        lastSeen: new Date(),
        firstSeen: new Date(),
        confidence: 0.8,
        preventionRule: 'Wrap API calls in try-catch with retry logic'
      },
      suggestedFix: 'Check network connectivity. Verify API endpoint URL and CORS headers. Consider adding retry logic.',
      confidence: 0.8,
      appliedCount: 30,
      successRate: 0.88
    },
    {
      pattern: {
        id: 'typescript_error',
        errorType: 'typescript_error',
        message: 'Type not assignable',
        stackSignature: '',
        module: 'types',
        frequency: 200,
        lastSeen: new Date(),
        firstSeen: new Date(),
        confidence: 0.9,
        preventionRule: 'Run type checker before deployment'
      },
      suggestedFix: 'Review type definitions. Ensure the value matches the expected type or add proper type assertion.',
      confidence: 0.9,
      appliedCount: 100,
      successRate: 0.94
    },
    {
      pattern: {
        id: 'module_error',
        errorType: 'module_error',
        message: 'Module not found',
        stackSignature: '',
        module: 'imports',
        frequency: 150,
        lastSeen: new Date(),
        firstSeen: new Date(),
        confidence: 0.85,
        preventionRule: 'Verify import paths use correct aliases (@/)'
      },
      suggestedFix: 'Check import path. Use @/ alias for src/ imports. Ensure the module exists and is exported.',
      confidence: 0.85,
      appliedCount: 75,
      successRate: 0.91
    }
  ];
}

/**
 * Learn from successful error resolution
 */
export async function learnResolution(
  pattern: ErrorPattern,
  resolution: string,
  success: boolean
): Promise<void> {
  try {
    await supabase.from('brain_memories').upsert({
      id: `resolution_${pattern.id}`,
      memory_type: 'error_resolution',
      content: resolution,
      tags: [pattern.errorType, pattern.module],
      confidence: success ? Math.min(pattern.confidence + 0.1, 1) : Math.max(pattern.confidence - 0.1, 0),
      access_count: 1
    });
  } catch (e) {
    console.warn('Failed to learn resolution:', e);
  }
}

/**
 * Get error statistics for a module
 */
export function getErrorStats(module?: string): {
  totalErrors: number;
  byType: Record<string, number>;
  recentErrors: ErrorPattern[];
} {
  const patterns = Array.from(errorPatternCache.values())
    .filter(p => !module || p.module === module);
  
  const byType: Record<string, number> = {};
  for (const p of patterns) {
    byType[p.errorType] = (byType[p.errorType] || 0) + p.frequency;
  }
  
  const recentErrors = patterns
    .sort((a, b) => b.lastSeen.getTime() - a.lastSeen.getTime())
    .slice(0, 10);
  
  return {
    totalErrors: patterns.reduce((sum, p) => sum + p.frequency, 0),
    byType,
    recentErrors
  };
}
