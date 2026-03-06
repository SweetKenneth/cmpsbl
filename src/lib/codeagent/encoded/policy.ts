/**
 * Encoded Guardrail Policy — Single Source of Truth
 * Enhanced destructive detection, comprehensive narrative bans, strict approval gates
 * ENCODE routes through Nexus — zero external AI costs
 */

export type ChangeClass = 'comment_only' | 'additive' | 'localized' | 'destructive';
export type RiskBand = 'minimal' | 'low' | 'medium' | 'high' | 'critical';
export type ExecutionMode = 'dry_run' | 'human_approval' | 'semi_autonomous' | 'autonomous';
export type PrimaryModel = 'nexus_fleet' | 'free_tier';

/**
 * Encoded configuration for runtime behavior
 */
export interface EncodedConfig {
  /** Execution mode - controls whether changes are applied */
  executionMode: ExecutionMode;
  /** Whether SEBA can send proposals to Encoded */
  sebaIntegration: boolean;
  /** Whether to learn from every execution */
  clmTraining: boolean;
  /** Primary AI model to use — always Nexus fleet routing */
  primaryModel: PrimaryModel;
  /** Max self-fix attempts */
  maxRetries: number;
}

/**
 * Default configuration for Encoded
 * Routes through Nexus fleet — zero paid AI dependencies
 */
export const DEFAULT_ENCODED_CONFIG: EncodedConfig = {
  executionMode: 'dry_run',        // Default: show, don't write
  sebaIntegration: false,          // Default: independent from SEBA
  clmTraining: true,               // Default: learn from everything
  primaryModel: 'nexus_fleet',     // Nexus fleet routing (Groq → Cerebras → DeepSeek)
  maxRetries: 3,                   // Max self-fix attempts
};

/**
 * Core policy for Encoded operations
 * DENY-BY-DEFAULT for destructive edits
 */
export const ENCODED_POLICY = {
  // ═══════════════════════════════════════════════════════════════
  // FILE SAFETY RULES
  // ═══════════════════════════════════════════════════════════════
  
  /** Must read actual file contents before writing */
  requireFileRead: true,
  
  /** Must check exports, handlers, entrypoints are preserved */
  requireAnchorCheck: true,
  
  /** Ban narrative/personality code in production files */
  denyNarrativeCode: true,
  
  /** Fail closed when invariants are violated */
  failClosed: true,

  // ═══════════════════════════════════════════════════════════════
  // DESTRUCTIVE CHANGE THRESHOLDS (stricter)
  // ═══════════════════════════════════════════════════════════════
  
  /** Max lines that can be removed before requiring approval */
  destructiveMaxRemovedLines: 8,
  
  /** Max percentage of file that can change before requiring approval */
  destructiveMaxChangedPercent: 0.15,
  
  /** Destructive changes MUST have human approval */
  requireHumanApprovalForDestructive: true,

  // ═══════════════════════════════════════════════════════════════
  // DANGEROUS CODE PATTERNS (always blocked)
  // ═══════════════════════════════════════════════════════════════

  /** Patterns that indicate dangerous code (forbidden) */
  dangerousPatterns: [
    /\beval\s*\(/i,
    /\bnew\s+Function\s*\(/i,
    /\bFunction\s*\(/i,
    /document\.write\s*\(/i,
    /innerHTML\s*=\s*[^"'`]*\+/i,
    /\.innerHTML\s*=\s*\$\{/i,
    /process\.env\.\w+\s*=\s*/i,
    /fs\.(?:unlink|rmdir|rm)Sync?\s*\(/i,
    /child_process\s*\.\s*exec\s*\(/i,
    /\brequire\s*\(\s*['"]\s*child_process/i,
  ] as readonly RegExp[],

  // ═══════════════════════════════════════════════════════════════
  // NARRATIVE PATTERN DETECTION (comprehensive)
  // ═══════════════════════════════════════════════════════════════
  
  /** Patterns that indicate narrative/personality code (forbidden) */
  narrativePatterns: [
    /glitch in my neural network/i,
    /i['']?m recovering/i,
    /as an ai/i,
    /my neural/i,
    /consciousness (?:is|was)/i,
    /\bI\b(?:'m| am) (?:an? )?(?:AI|assistant|bot|model)/i,
    /my (?:training|programming)/i,
    /my (?:capabilities|limitations)/i,
    /sorry,? (?:i |but )/i,
    /i apologize/i,
    /i can't (?:help|do|provide)/i,
    /unfortunately,? i/i,
    /i'm not able to/i,
    /let me think/i,
    /hmm,? (?:let me|i think)/i,
    /let me (?:check|see|consider)/i,
    /thinking about (?:this|that|it)/i,
    /i (?:think|believe|feel) that/i,
    /^(?:ok|okay|alright|sure),?\s+/i,
    /^(?:well|so|now),?\s+/i,
    /^(?:great|perfect|excellent)!?\s+/i,
    /here(?:'s| is) (?:the|my|a)/i,
    /i(?:'ll| will) (?:help|assist|provide)/i,
    /this code (?:will|should|can)/i,
    /the (?:above|following) code/i,
    /note that (?:this|the)/i,
    /please (?:note|remember)/i,
    /i(?:'m| am) not sure/i,
    /might (?:be|have|need)/i,
    /could (?:be|have|need)/i,
    /perhaps (?:we|you|this)/i,
  ] as readonly RegExp[],

  // ═══════════════════════════════════════════════════════════════
  // PROTECTED FILES (never modify without explicit approval)
  // ═══════════════════════════════════════════════════════════════
  
  protectedPaths: [
    'src/integrations/supabase/client.ts',
    'src/integrations/supabase/types.ts',
    'supabase/config.toml',
    '.env',
    '.env.local',
    '.env.production',
    'package.json',
    'package-lock.json',
    'bun.lockb',
    'tsconfig.json',
    'vite.config.ts',
    'tailwind.config.ts',
  ] as readonly string[],

  // ═══════════════════════════════════════════════════════════════
  // REQUIRED PATTERNS (must be present in valid code)
  // ═══════════════════════════════════════════════════════════════
  
  /** Edge functions must have these */
  edgeFunctionRequirements: {
    mustHaveServe: true,
    mustHandleCors: true,
    mustHaveErrorHandling: true,
  },
} as const;

/**
 * Determine risk band from change class
 */
export function getRiskBand(changeClass: ChangeClass): RiskBand {
  switch (changeClass) {
    case 'comment_only':
      return 'minimal';
    case 'additive':
      return 'low';
    case 'localized':
      return 'medium';
    case 'destructive':
      return 'high';
  }
}

/**
 * Check if a file path is protected
 */
export function isProtectedPath(filePath: string): boolean {
  return ENCODED_POLICY.protectedPaths.some(
    (p) => filePath.endsWith(p) || filePath.includes(p)
  );
}

/**
 * Check for dangerous code patterns
 */
export function hasDangerousPatterns(code: string): { dangerous: boolean; matches: string[] } {
  const matches: string[] = [];
  
  for (const pattern of ENCODED_POLICY.dangerousPatterns) {
    const match = code.match(pattern);
    if (match) {
      matches.push(match[0]);
    }
  }

  return { dangerous: matches.length > 0, matches };
}

/**
 * Get approval requirements for a change class
 */
export function getApprovalRequirements(changeClass: ChangeClass): {
  requiresApproval: boolean;
  autoApprovable: boolean;
  reason: string;
} {
  switch (changeClass) {
    case 'comment_only':
      return {
        requiresApproval: false,
        autoApprovable: true,
        reason: 'Comment-only changes are safe',
      };
    case 'additive':
      return {
        requiresApproval: false,
        autoApprovable: true,
        reason: 'Additive changes do not remove or modify existing code',
      };
    case 'localized':
      return {
        requiresApproval: false,
        autoApprovable: true,
        reason: 'Localized changes are within safe thresholds',
      };
    case 'destructive':
      return {
        requiresApproval: ENCODED_POLICY.requireHumanApprovalForDestructive,
        autoApprovable: false,
        reason: 'Destructive changes require explicit human approval',
      };
  }
}

/**
 * Validate edge function requirements
 */
export function validateEdgeFunction(code: string): { valid: boolean; issues: string[] } {
  const issues: string[] = [];
  const reqs = ENCODED_POLICY.edgeFunctionRequirements;

  if (reqs.mustHaveServe && !/(serve\(|Deno\.serve\()/.test(code)) {
    issues.push('Missing serve() or Deno.serve() entrypoint');
  }

  if (reqs.mustHandleCors && !/corsHeaders/.test(code)) {
    issues.push('Missing CORS headers handling');
  }

  if (reqs.mustHaveErrorHandling && !/catch\s*\(/.test(code)) {
    issues.push('Missing error handling (try/catch)');
  }

  return { valid: issues.length === 0, issues };
}
