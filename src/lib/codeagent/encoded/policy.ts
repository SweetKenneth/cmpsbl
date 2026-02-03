/**
 * Encoded Guardrail Policy — Single Source of Truth
 * v1.0.0 — Non-destructive defaults, narrative bans, approval gates
 */

export type ChangeClass = 'comment_only' | 'additive' | 'localized' | 'destructive';
export type RiskBand = 'minimal' | 'low' | 'medium' | 'high' | 'critical';

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
  // DESTRUCTIVE CHANGE THRESHOLDS
  // ═══════════════════════════════════════════════════════════════
  
  /** Max lines that can be removed before requiring approval */
  destructiveMaxRemovedLines: 10,
  
  /** Max percentage of file that can change before requiring approval */
  destructiveMaxChangedPercent: 0.20,
  
  /** Destructive changes MUST have human approval */
  requireHumanApprovalForDestructive: true,

  // ═══════════════════════════════════════════════════════════════
  // NARRATIVE PATTERN DETECTION
  // ═══════════════════════════════════════════════════════════════
  
  /** Patterns that indicate narrative/personality code (forbidden) */
  narrativePatterns: [
    /glitch in my neural network/i,
    /i['']?m recovering/i,
    /as an ai/i,
    /sorry,? (?:i |but )/i,
    /brief glitch/i,
    /my neural/i,
    /consciousness (?:is|was)/i,
    /i apologize/i,
    /let me think/i,
    /hmm,? (?:let me|i think)/i,
    /\bI\b(?:'m| am) (?:an? )?(?:AI|assistant|bot)/i,
  ] as readonly RegExp[],

  // ═══════════════════════════════════════════════════════════════
  // PROTECTED FILES (never modify without explicit approval)
  // ═══════════════════════════════════════════════════════════════
  
  protectedPaths: [
    'src/integrations/supabase/client.ts',
    'src/integrations/supabase/types.ts',
    'supabase/config.toml',
    '.env',
    'package.json',
    'package-lock.json',
    'bun.lockb',
  ] as readonly string[],
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
