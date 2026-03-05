/**
 * ENCODE Pipeline — DECODE->PLAN->ENCODE task routing + BRAIN recall/writeback
 * 
 * Pipeline stages:
 *   INPUT → ANALYZE → CLASSIFY → PLAN → EXECUTE → FORMAT → OUTPUT
 * 
 * The PLAN stage generates a PatchPlan that must be approved before
 * ENCODE can generate code. This prevents direct execution after classification.
 */

import { emit } from '../events';
import { memoryCore } from '../memory-core';
import { generatePatchPlan, storePlan, loadPlan, verifyPlan, type PatchPlan } from '../plans';
import { publish } from '../module-bus';
import type { EncodeTaskPacket, EncodeTaskResult, EncodeArtifact } from './index';
import { enqueueTask, completeTask } from './index';

// ═══════════════════════════════════════════════════════════════════════════════
// BRAIN INTEGRATION
// ═══════════════════════════════════════════════════════════════════════════════

export interface BrainContext {
  memories: Array<{ key: string; content: string; relevance: number }>;
  timestamp: string;
}

/**
 * Recall context from BRAIN for an ENCODE task
 */
export async function recallForEncode(keys: string[], query?: string): Promise<BrainContext> {
  const memories: BrainContext['memories'] = [];
  
  // Pull from memory core by keys
  for (const key of keys) {
    try {
      const result = await memoryCore.recall(key, 3);
      if (result.success) {
        memories.push({
          key,
          content: JSON.stringify(result.metadata || {}),
          relevance: 0.7,
        });
      }
    } catch {
      // Key not found, skip
    }
  }

  // Also search by query if provided
  if (query) {
    try {
      const queryResult = await memoryCore.recall(query, 5);
      if (queryResult.success) {
        memories.push({
          key: 'query-match',
          content: JSON.stringify(queryResult.metadata || {}),
          relevance: 0.6,
        });
      }
    } catch {
      // Query failed, skip
    }
  }

  emit({ module: 'encode', event_type: 'brain_recall', outcome: 'succeeded', data: { keysRequested: keys.length, memoriesFound: memories.length } });
  
  return { memories, timestamp: new Date().toISOString() };
}

/**
 * Write back learnings and receipts from ENCODE — event-only, no BRAIN tier write
 */
export async function writebackFromEncode(data: {
  taskId: string;
  summary: string;
  artifacts: EncodeArtifact[];
  tags: string[];
}): Promise<string> {
  const receiptId = `enc-receipt-${Date.now()}`;

  // Emit event only — no longer writes to brain_memory_hot
  emit({ module: 'encode', event_type: 'brain_writeback', outcome: 'succeeded', data: { receiptId, taskId: data.taskId, summary: data.summary, artifactCount: data.artifacts.length } });
  
  return receiptId;
}

// ═══════════════════════════════════════════════════════════════════════════════
// DECODE -> ENCODE ROUTING
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Route an intent from DECODE to ENCODE as a structured task packet
 */
export async function routeFromDecode(
  intentText: string,
  context: {
    targetSurface?: EncodeTaskPacket['targetSurface'];
    brainKeys?: string[];
    destructiveAllowed?: boolean;
    requiresApproval?: boolean;
    acceptance?: string[];
  } = {}
): Promise<EncodeTaskPacket> {
  const brainKeys = context.brainKeys || [];
  const brainContext = await recallForEncode(brainKeys, intentText);

  const task = enqueueTask({
    intentSummary: intentText,
    targetSurface: context.targetSurface || 'code',
    constraints: {
      destructiveAllowed: context.destructiveAllowed ?? false,
      requiresApproval: context.requiresApproval ?? true,
    },
    contextRefs: {
      brainKeys: [...brainKeys, ...brainContext.memories.map(m => m.key)],
    },
    acceptance: context.acceptance || ['builds_without_errors', 'tests_pass'],
  });

  emit({ module: 'encode', event_type: 'decode_routed', outcome: 'succeeded', data: { taskId: task.id, brainContextSize: brainContext.memories.length } });

  return task;
}

/**
 * Complete a task and write results back to BRAIN
 */
export async function completeAndWriteback(
  taskId: string,
  result: {
    success: boolean;
    artifacts: EncodeArtifact[];
    learnings: string[];
    executionMs: number;
  }
): Promise<EncodeTaskResult> {
  const receipt = completeTask(taskId, {
    ...result,
    completedAt: new Date().toISOString(),
  });

  if (result.success && result.learnings.length > 0) {
    const brainReceiptId = await writebackFromEncode({
      taskId,
      summary: result.learnings.join('; '),
      artifacts: result.artifacts,
      tags: ['encode', result.success ? 'success' : 'failure'],
    });
    receipt.brainReceiptId = brainReceiptId;
  }

  return receipt;
}
