/**
 * Encoded Change Guard — Validation before any write operation
 * Fail-closed enforcement of guardrails with dangerous import detection
 */

import { 
  ENCODED_POLICY, 
  type ChangeClass, 
  type RiskBand,
  getRiskBand,
  isProtectedPath,
  getApprovalRequirements,
} from './policy';
import { 
  extractAnchors, 
  compareAnchors, 
  detectNarrative,
  quickHash,
  type FileAnchors,
} from './anchor';

/**
 * Diff statistics between two versions of code
 */
export interface DiffStats {
  added: number;
  removed: number;
  changed: number;
  totalBefore: number;
  totalAfter: number;
  changePercent: number;
}

/**
 * Result of running the Encoded guard
 */
export interface GuardResult {
  /** Whether the change is allowed to proceed */
  ok: boolean;
  /** Classification of the change */
  changeClass: ChangeClass;
  /** Risk assessment */
  risk: RiskBand;
  /** Anchors from before state */
  anchorsBefore: FileAnchors;
  /** Anchors from after state */
  anchorsAfter: FileAnchors;
  /** Whether anchors are preserved */
  anchorsPreserved: boolean;
  /** Hash of before content */
  hashBefore: string;
  /** Hash of after content */
  hashAfter: string;
  /** Diff statistics */
  diff: DiffStats;
  /** Reasons for blocking (if any) */
  reasons: string[];
  /** Warnings (non-blocking) */
  warnings: string[];
  /** Whether human approval was provided */
  humanApproved: boolean;
  /** File path being modified */
  filePath?: string;
}

/**
 * Compute line-by-line diff statistics
 */
export function computeDiffStats(before: string, after: string): DiffStats {
  const linesBefore = before.split('\n');
  const linesAfter = after.split('\n');
  
  let added = 0;
  let removed = 0;
  let changed = 0;
  
  const maxLines = Math.max(linesBefore.length, linesAfter.length);
  
  for (let i = 0; i < maxLines; i++) {
    const lineBefore = linesBefore[i];
    const lineAfter = linesAfter[i];
    
    if (lineBefore === undefined && lineAfter !== undefined) {
      added++;
    } else if (lineAfter === undefined && lineBefore !== undefined) {
      removed++;
    } else if (lineBefore !== lineAfter) {
      changed++;
    }
  }
  
  const totalBefore = linesBefore.length;
  const totalAfter = linesAfter.length;
  const changePercent = totalBefore > 0 
    ? Math.min((added + removed + changed) / totalBefore, 1.0)
    : 1;
  
  return { added, removed, changed, totalBefore, totalAfter, changePercent };
}

/**
 * Classify a change based on diff stats and anchor comparison
 */
export function classifyChange(
  before: string,
  after: string,
  anchorsBefore: FileAnchors,
  anchorsAfter: FileAnchors
): ChangeClass {
  const diff = computeDiffStats(before, after);
  const anchorComparison = compareAnchors(anchorsBefore, anchorsAfter);
  
  // If anchors are not preserved, it's destructive
  if (!anchorComparison.preserved) {
    return 'destructive';
  }
  
  // Check if only comments changed
  const codeOnlyBefore = before.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
  const codeOnlyAfter = after.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
  if (codeOnlyBefore.trim() === codeOnlyAfter.trim()) {
    return 'comment_only';
  }
  
  // Pure additions (no removals or changes)
  if (diff.removed === 0 && diff.changed === 0 && diff.added > 0) {
    return 'additive';
  }
  
  // Small, localized changes within thresholds
  if (
    diff.removed <= ENCODED_POLICY.destructiveMaxRemovedLines &&
    diff.changePercent <= ENCODED_POLICY.destructiveMaxChangedPercent
  ) {
    return 'localized';
  }
  
  // Everything else is destructive
  return 'destructive';
}

/**
 * Run the Encoded guard — validate a proposed change
 * 
 * @param before - Original file contents (MUST be real, not fabricated)
 * @param after - Proposed new contents
 * @param humanApproved - Whether explicit human approval was given
 * @param filePath - Optional file path for protected path checking
 */
export function runEncodedGuard(
  before: string,
  after: string,
  humanApproved: boolean,
  filePath?: string
): GuardResult {
  const reasons: string[] = [];
  const warnings: string[] = [];
  
  // INVARIANT 1: Must have read the file first
  if (ENCODED_POLICY.requireFileRead && before === '') {
    // Allow empty before if creating a new file
    if (after.trim() !== '') {
      warnings.push('Before state is empty — treating as new file creation');
    }
  }
  
  // INVARIANT 2: Check protected paths
  if (filePath && isProtectedPath(filePath)) {
    if (!humanApproved) {
      reasons.push(`Protected file: ${filePath} requires explicit approval`);
    } else {
      warnings.push(`Modifying protected file: ${filePath}`);
    }
  }
  
  // Extract anchors
  const anchorsBefore = extractAnchors(before);
  const anchorsAfter = extractAnchors(after);
  const anchorComparison = compareAnchors(anchorsBefore, anchorsAfter);
  
  // INVARIANT 3: Anchor check
  if (ENCODED_POLICY.requireAnchorCheck && !anchorComparison.preserved) {
    if (!humanApproved) {
      reasons.push(`Anchor violation: ${anchorComparison.summary}`);
    } else {
      warnings.push(`Anchor changes approved: ${anchorComparison.summary}`);
    }
  }
  
  // INVARIANT 4: Narrative code check
  const narrativeCheck = detectNarrative(after);
  if (ENCODED_POLICY.denyNarrativeCode && narrativeCheck.detected) {
    reasons.push(`Narrative code detected: "${narrativeCheck.matches[0]}"`);
  }
  
  // INVARIANT 4b: Dangerous import detection
  const dangerousImports = detectDangerousImports(after);
  if (dangerousImports.length > 0) {
    if (!humanApproved) {
      reasons.push(`Dangerous imports detected: ${dangerousImports.join(', ')}`);
    } else {
      warnings.push(`Dangerous imports approved: ${dangerousImports.join(', ')}`);
    }
  }
  
  // Compute stats and classify
  const diff = computeDiffStats(before, after);
  const changeClass = classifyChange(before, after, anchorsBefore, anchorsAfter);
  const risk = getRiskBand(changeClass);
  
  // INVARIANT 5: Destructive changes need approval
  const approvalReqs = getApprovalRequirements(changeClass);
  if (approvalReqs.requiresApproval && !humanApproved) {
    reasons.push(approvalReqs.reason);
  }
  
  // Hash for tracking
  const hashBefore = quickHash(before);
  const hashAfter = quickHash(after);
  
  // FAIL CLOSED: Any reasons = blocked
  const ok = ENCODED_POLICY.failClosed ? reasons.length === 0 : true;
  
  return {
    ok,
    changeClass,
    risk,
    anchorsBefore,
    anchorsAfter,
    anchorsPreserved: anchorComparison.preserved,
    hashBefore,
    hashAfter,
    diff,
    reasons,
    warnings,
    humanApproved,
    filePath,
  };
}

/**
 * Quick check if a change would be blocked
 */
export function wouldBlock(
  before: string,
  after: string,
  humanApproved: boolean = false,
  filePath?: string
): boolean {
  const result = runEncodedGuard(before, after, humanApproved, filePath);
  return !result.ok;
}

/**
 * Get a human-readable summary of the guard result
 */
export function summarizeGuardResult(result: GuardResult): string {
  const lines: string[] = [];
  
  lines.push(`**Change Classification**: ${result.changeClass.toUpperCase()}`);
  lines.push(`**Risk Level**: ${result.risk}`);
  lines.push(`**Status**: ${result.ok ? '✅ ALLOWED' : '🚫 BLOCKED'}`);
  lines.push('');
  
  lines.push(`**Diff Stats**:`);
  lines.push(`- Lines added: ${result.diff.added}`);
  lines.push(`- Lines removed: ${result.diff.removed}`);
  lines.push(`- Lines changed: ${result.diff.changed}`);
  lines.push(`- Change percent: ${(result.diff.changePercent * 100).toFixed(1)}%`);
  lines.push('');
  
  lines.push(`**Anchors**: ${result.anchorsPreserved ? '✅ Preserved' : '⚠️ Modified'}`);
  lines.push(`- Exports: ${result.anchorsAfter.exports.length} (before: ${result.anchorsBefore.exports.length})`);
  lines.push(`- Handlers: ${result.anchorsAfter.handlers.length}`);
  lines.push(`- Entrypoints: ${result.anchorsAfter.entrypoints.length}`);
  lines.push('');
  
  if (result.reasons.length > 0) {
    lines.push(`**Block Reasons**:`);
    result.reasons.forEach(r => lines.push(`- ❌ ${r}`));
    lines.push('');
  }
  
  if (result.warnings.length > 0) {
    lines.push(`**Warnings**:`);
    result.warnings.forEach(w => lines.push(`- ⚠️ ${w}`));
  }
  
  return lines.join('\n');
}

/**
 * Detect dangerous or unapproved import patterns in generated code
 */
/** Known-safe package prefixes for import allowlisting */
const SAFE_PACKAGE_PREFIXES = [
  '.', '@/', '@supabase', '@radix-ui', '@tanstack', '@hookform', '@react-three',
  'react', 'lucide', 'sonner', 'zod', 'zustand', 'framer',
  'class-variance', 'clsx', 'tailwind', 'date-fns', 'recharts', 'three',
  'cmdk', 'vaul', 'next-themes', 'embla', 'input-otp', 'remark',
  'jszip', 'vitest', 'jsdom',
] as const;

function detectDangerousImports(code: string): string[] {
  const dangerous: string[] = [];
  const lines = code.split('\n');
  
  for (const line of lines) {
    // Check ALL lines for eval/Function (not just import lines)
    if (/\beval\s*\(|\bnew\s+Function\s*\(/i.test(line)) {
      dangerous.push('eval() or new Function() — code injection risk');
    }

    const importMatch = line.match(/import\s+.*from\s+['"]([^'"]+)['"]/);
    if (!importMatch) continue;
    const source = importMatch[1];
    
    // Flag service role key imports
    if (/service[_-]?role/i.test(line)) {
      dangerous.push(`Service role key import: ${source}`);
    }
    
    // Flag direct .env or process.env access
    if (/process\.env|import\.meta\.env\.(?!VITE_)/i.test(line)) {
      dangerous.push(`Non-VITE env access in: ${source}`);
    }
    
    // Flag unknown npm packages (not in known safe list)
    if (!SAFE_PACKAGE_PREFIXES.some(prefix => source.startsWith(prefix))) {
      dangerous.push(`Unknown package: ${source} — requires approval`);
    }
  }
  
  return [...new Set(dangerous)]; // Deduplicate
}
