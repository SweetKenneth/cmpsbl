/**
 * CodeAgent v3 - PR-Style Review Queue
 * Generate patches that queue for approval before applying
 */

import { supabase } from '@/integrations/supabase/client';

export interface PRPatch {
  id: string;
  title: string;
  description: string;
  diff: string;
  filesChanged: string[];
  additions: number;
  deletions: number;
  status: 'pending' | 'approved' | 'rejected' | 'deployed' | 'rolled_back';
  createdAt: Date;
  approvedAt?: Date;
  deployedAt?: Date;
  rollbackId?: string;
  author: 'codeagent' | 'user';
  reviewNotes?: string;
  validationErrors?: string[];
}

export interface DiffHunk {
  oldStart: number;
  oldLines: number;
  newStart: number;
  newLines: number;
  content: string;
  type: 'add' | 'remove' | 'context';
}

export interface FileDiff {
  path: string;
  status: 'added' | 'modified' | 'deleted';
  hunks: DiffHunk[];
  additions: number;
  deletions: number;
}

// In-memory queue (persisted to Supabase)
let prQueue: PRPatch[] = [];

/**
 * Create a new PR for review
 */
export async function createPR(
  title: string,
  description: string,
  changes: { path: string; before: string; after: string }[]
): Promise<PRPatch> {
  const diff = generateUnifiedDiff(changes);
  const filesChanged = changes.map(c => c.path);
  const additions = (diff.match(/^\+[^+]/gm) || []).length;
  const deletions = (diff.match(/^-[^-]/gm) || []).length;
  
  const pr: PRPatch = {
    id: `pr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    title,
    description,
    diff,
    filesChanged,
    additions,
    deletions,
    status: 'pending',
    createdAt: new Date(),
    author: 'codeagent'
  };
  
  // Validate the changes
  const validationErrors = validateChanges(changes);
  if (validationErrors.length > 0) {
    pr.validationErrors = validationErrors;
  }
  
  prQueue.push(pr);
  
  // Persist to database
  try {
    await supabase.from('brain_events').insert({
      event_type: 'pr_created',
      module: 'codeagent',
      data: {
        pr_id: pr.id,
        title: pr.title,
        files_changed: pr.filesChanged,
        additions: pr.additions,
        deletions: pr.deletions
      }
    });
  } catch (e) {
    console.warn('Failed to persist PR:', e);
  }
  
  return pr;
}

/**
 * Get all pending PRs
 */
export function getPendingPRs(): PRPatch[] {
  return prQueue.filter(pr => pr.status === 'pending');
}

/**
 * Get all PRs
 */
export function getAllPRs(): PRPatch[] {
  return [...prQueue].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

/**
 * Approve a PR
 */
export async function approvePR(prId: string, notes?: string): Promise<PRPatch | null> {
  const pr = prQueue.find(p => p.id === prId);
  if (!pr || pr.status !== 'pending') return null;
  
  pr.status = 'approved';
  pr.approvedAt = new Date();
  pr.reviewNotes = notes;
  
  // Log approval
  try {
    await supabase.from('brain_events').insert({
      event_type: 'pr_approved',
      module: 'codeagent',
      data: { pr_id: prId, notes }
    });
  } catch (e) {
    console.warn('Failed to log PR approval:', e);
  }
  
  return pr;
}

/**
 * Reject a PR
 */
export async function rejectPR(prId: string, reason: string): Promise<PRPatch | null> {
  const pr = prQueue.find(p => p.id === prId);
  if (!pr || pr.status !== 'pending') return null;
  
  pr.status = 'rejected';
  pr.reviewNotes = reason;
  
  // Log rejection
  try {
    await supabase.from('brain_events').insert({
      event_type: 'pr_rejected',
      module: 'codeagent',
      data: { pr_id: prId, reason }
    });
  } catch (e) {
    console.warn('Failed to log PR rejection:', e);
  }
  
  return pr;
}

/**
 * Mark PR as deployed
 */
export async function markDeployed(prId: string): Promise<PRPatch | null> {
  const pr = prQueue.find(p => p.id === prId);
  if (!pr || pr.status !== 'approved') return null;
  
  pr.status = 'deployed';
  pr.deployedAt = new Date();
  pr.rollbackId = `rollback_${prId}`;
  
  // Log deployment
  try {
    await supabase.from('brain_events').insert({
      event_type: 'pr_deployed',
      module: 'codeagent',
      data: { pr_id: prId, rollback_id: pr.rollbackId }
    });
  } catch (e) {
    console.warn('Failed to log PR deployment:', e);
  }
  
  return pr;
}

/**
 * Rollback a deployed PR
 */
export async function rollbackPR(prId: string): Promise<boolean> {
  const pr = prQueue.find(p => p.id === prId);
  if (!pr || pr.status !== 'deployed') return false;
  
  pr.status = 'rolled_back';
  
  // Log rollback
  try {
    await supabase.from('brain_events').insert({
      event_type: 'pr_rolled_back',
      module: 'codeagent',
      data: { pr_id: prId }
    });
  } catch (e) {
    console.warn('Failed to log PR rollback:', e);
  }
  
  return true;
}

/**
 * Generate unified diff format
 */
function generateUnifiedDiff(
  changes: { path: string; before: string; after: string }[]
): string {
  let diff = '';
  
  for (const change of changes) {
    const beforeLines = change.before.split('\n');
    const afterLines = change.after.split('\n');
    
    diff += `--- a/${change.path}\n`;
    diff += `+++ b/${change.path}\n`;
    
    const hunks = computeDiffHunks(beforeLines, afterLines);
    
    for (const hunk of hunks) {
      diff += `@@ -${hunk.oldStart},${hunk.oldLines} +${hunk.newStart},${hunk.newLines} @@\n`;
      diff += hunk.content;
    }
  }
  
  return diff;
}

/**
 * Compute diff hunks between two versions
 */
function computeDiffHunks(
  before: string[],
  after: string[]
): DiffHunk[] {
  const hunks: DiffHunk[] = [];
  
  // Simple line-by-line diff
  let i = 0, j = 0;
  let currentHunk: DiffHunk | null = null;
  
  while (i < before.length || j < after.length) {
    if (i < before.length && j < after.length && before[i] === after[j]) {
      // Context line
      if (currentHunk) {
        currentHunk.content += ` ${before[i]}\n`;
        currentHunk.oldLines++;
        currentHunk.newLines++;
      }
      i++;
      j++;
    } else if (i < before.length && (j >= after.length || before[i] !== after[j])) {
      // Deletion
      if (!currentHunk) {
        currentHunk = {
          oldStart: i + 1,
          oldLines: 0,
          newStart: j + 1,
          newLines: 0,
          content: '',
          type: 'remove'
        };
      }
      currentHunk.content += `-${before[i]}\n`;
      currentHunk.oldLines++;
      i++;
    } else if (j < after.length) {
      // Addition
      if (!currentHunk) {
        currentHunk = {
          oldStart: i + 1,
          oldLines: 0,
          newStart: j + 1,
          newLines: 0,
          content: '',
          type: 'add'
        };
      }
      currentHunk.content += `+${after[j]}\n`;
      currentHunk.newLines++;
      j++;
    }
    
    // End hunk after accumulating changes
    if (currentHunk && currentHunk.content.length > 500) {
      hunks.push(currentHunk);
      currentHunk = null;
    }
  }
  
  if (currentHunk) {
    hunks.push(currentHunk);
  }
  
  return hunks;
}

/**
 * Parse diff into structured format
 */
export function parseDiff(diff: string): FileDiff[] {
  const files: FileDiff[] = [];
  const fileBlocks = diff.split(/(?=^--- )/m).filter(Boolean);
  
  for (const block of fileBlocks) {
    const pathMatch = block.match(/^--- a\/(.+)\n\+\+\+ b\/(.+)/m);
    if (!pathMatch) continue;
    
    const path = pathMatch[2];
    const hunks: DiffHunk[] = [];
    let additions = 0;
    let deletions = 0;
    
    const hunkMatches = block.matchAll(/@@ -(\d+),?(\d*) \+(\d+),?(\d*) @@([\s\S]*?)(?=@@ |$)/g);
    
    for (const match of hunkMatches) {
      const content = match[5];
      additions += (content.match(/^\+/gm) || []).length;
      deletions += (content.match(/^-/gm) || []).length;
      
      hunks.push({
        oldStart: parseInt(match[1]),
        oldLines: parseInt(match[2]) || 1,
        newStart: parseInt(match[3]),
        newLines: parseInt(match[4]) || 1,
        content,
        type: additions > deletions ? 'add' : deletions > additions ? 'remove' : 'context'
      });
    }
    
    const status = deletions === 0 && block.includes('new file') ? 'added' :
                   additions === 0 && block.includes('deleted file') ? 'deleted' : 'modified';
    
    files.push({ path, status, hunks, additions, deletions });
  }
  
  return files;
}

/**
 * Validate changes before creating PR
 */
function validateChanges(
  changes: { path: string; before: string; after: string }[]
): string[] {
  const errors: string[] = [];
  
  for (const change of changes) {
    // Check for syntax issues (basic)
    if (change.path.endsWith('.ts') || change.path.endsWith('.tsx')) {
      const brackets = (change.after.match(/\{/g) || []).length;
      const closeBrackets = (change.after.match(/\}/g) || []).length;
      if (brackets !== closeBrackets) {
        errors.push(`${change.path}: Mismatched brackets`);
      }
      
      const parens = (change.after.match(/\(/g) || []).length;
      const closeParens = (change.after.match(/\)/g) || []).length;
      if (parens !== closeParens) {
        errors.push(`${change.path}: Mismatched parentheses`);
      }
    }
    
    // Check for TODO/FIXME comments being introduced
    if (change.after.includes('TODO') && !change.before.includes('TODO')) {
      errors.push(`${change.path}: New TODO comment introduced`);
    }
    
    // Check for console.log in production code
    if (/console\.(log|debug)/.test(change.after) && !change.path.includes('.test.')) {
      errors.push(`${change.path}: Console statement detected`);
    }
  }
  
  return errors;
}

/**
 * Clear all PRs (for testing)
 */
export function clearQueue(): void {
  prQueue = [];
}

/**
 * Get PR by ID
 */
export function getPR(prId: string): PRPatch | undefined {
  return prQueue.find(p => p.id === prId);
}
