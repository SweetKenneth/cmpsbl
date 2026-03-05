/**
 * ENCODE Discussion Channel — CP-backed, scoped delivery
 * Allows ENCODE to ask questions, raise risks, and request clarification
 * before writing code — routed through the module bus with scoped recipients.
 */

import { publish, type ModuleSignal } from '../module-bus';
import { emit } from '../events';
import { cpPut, cpGet, cpList } from '../control-plane/adapters/queueStateAdapter';

// ═══════════════════════════════════════════════════════════════
// SIGNAL TYPES
// ═══════════════════════════════════════════════════════════════

export const DISCUSSION_SIGNALS = {
  PLAN_QUESTION: 'encode.plan.question',
  PLAN_RISK: 'encode.plan.risk',
  PLAN_CLARIFICATION: 'encode.plan.clarification',
  PLAN_ANSWER: 'encode.plan.answer',
  PLAN_READY: 'encode.plan.ready',
} as const;

/** Scoped recipient map — no wildcards */
const SIGNAL_RECIPIENTS: Record<string, readonly string[]> = {
  [DISCUSSION_SIGNALS.PLAN_QUESTION]: ['decode', 'encode', 'governance'],
  [DISCUSSION_SIGNALS.PLAN_RISK]: ['decode', 'encode', 'governance'],
  [DISCUSSION_SIGNALS.PLAN_CLARIFICATION]: ['decode'],
  [DISCUSSION_SIGNALS.PLAN_ANSWER]: ['encode'],
  [DISCUSSION_SIGNALS.PLAN_READY]: ['decode', 'encode', 'governance'],
};

// ═══════════════════════════════════════════════════════════════
// DISCUSSION MESSAGE TYPES
// ═══════════════════════════════════════════════════════════════

export interface DiscussionMessage {
  id: string;
  plan_id: string;
  from: 'ENCODE' | 'DECODE' | 'USER' | 'SYSTEM';
  type: 'question' | 'risk' | 'clarification' | 'answer' | 'ready';
  message: string;
  timestamp: string;
  resolved: boolean;
  response?: string;
}

// ═══════════════════════════════════════════════════════════════
// CP KEY HELPERS
// ═══════════════════════════════════════════════════════════════

function discussionKey(planId: string, msgId: string): string {
  return `encode:discussion:${planId}:${msgId}`;
}

function discussionPrefix(planId: string): string {
  return `encode:discussion:${planId}:`;
}

// ═══════════════════════════════════════════════════════════════
// SCOPED PUBLISH HELPER
// ═══════════════════════════════════════════════════════════════

async function scopedPublish(
  from: 'encode' | 'decode' | 'system',
  signalType: string,
  payload: Record<string, unknown>,
  priority: 'normal' | 'high' = 'normal'
): Promise<void> {
  const recipients = SIGNAL_RECIPIENTS[signalType] || ['decode', 'encode'];

  // Guard: never include raw patch content in payloads — only summaries + IDs
  const safePayload = { ...payload };
  delete safePayload.patch_content;
  delete safePayload.code;
  delete safePayload.diff;

  for (const to of recipients) {
    await publish(from, signalType, safePayload as Record<string, unknown>, {
      to: to as Parameters<typeof publish>[3] extends { to?: infer U } ? U : string,
      priority,
    } as Parameters<typeof publish>[3]);
  }
}

// ═══════════════════════════════════════════════════════════════
// ENCODE DISCUSSION API
// ═══════════════════════════════════════════════════════════════

export async function askQuestion(planId: string, message: string): Promise<DiscussionMessage> {
  const msg = createMessage(planId, 'ENCODE', 'question', message);
  await persistMessage(msg);

  await scopedPublish('encode', DISCUSSION_SIGNALS.PLAN_QUESTION, {
    plan_id: planId,
    message,
    discussion_id: msg.id,
  });

  emit({
    module: 'encode',
    event_type: 'discussion_question',
    outcome: 'succeeded',
    data: { plan_id: planId, discussion_id: msg.id },
  });

  return msg;
}

export async function raiseRisk(planId: string, riskDescription: string): Promise<DiscussionMessage> {
  const msg = createMessage(planId, 'ENCODE', 'risk', riskDescription);
  await persistMessage(msg);

  await scopedPublish('encode', DISCUSSION_SIGNALS.PLAN_RISK, {
    plan_id: planId,
    risk: riskDescription,
    discussion_id: msg.id,
  }, 'high');

  emit({
    module: 'encode',
    event_type: 'discussion_risk',
    outcome: 'succeeded',
    data: { plan_id: planId, discussion_id: msg.id },
  });

  return msg;
}

export async function requestClarification(planId: string, question: string): Promise<DiscussionMessage> {
  const msg = createMessage(planId, 'ENCODE', 'clarification', question);
  await persistMessage(msg);

  await scopedPublish('encode', DISCUSSION_SIGNALS.PLAN_CLARIFICATION, {
    plan_id: planId,
    question,
    discussion_id: msg.id,
  });

  return msg;
}

export async function respondToDiscussion(
  planId: string,
  discussionId: string,
  response: string,
  from: 'DECODE' | 'USER' = 'USER'
): Promise<DiscussionMessage> {
  // Mark original as resolved — clone before write-back
  const original = await cpGet<DiscussionMessage>(discussionKey(planId, discussionId));
  if (original) {
    const updated: DiscussionMessage = { ...original, resolved: true, response };
    await cpPut<DiscussionMessage>(discussionKey(planId, discussionId), updated);
  }

  const msg = createMessage(planId, from, 'answer', response);
  await persistMessage(msg);

  await scopedPublish(
    from === 'DECODE' ? 'decode' : 'system',
    DISCUSSION_SIGNALS.PLAN_ANSWER,
    { plan_id: planId, original_discussion_id: discussionId, response },
  );

  return msg;
}

export async function signalReady(planId: string): Promise<DiscussionMessage> {
  const msg = createMessage(planId, 'ENCODE', 'ready', 'All questions resolved. Ready to execute.');
  await persistMessage(msg);

  await scopedPublish('encode', DISCUSSION_SIGNALS.PLAN_READY, {
    plan_id: planId,
  });

  return msg;
}

// ═══════════════════════════════════════════════════════════════
// QUERIES
// ═══════════════════════════════════════════════════════════════

export async function getDiscussion(planId: string): Promise<DiscussionMessage[]> {
  const entries = await cpList<DiscussionMessage>(discussionPrefix(planId));
  return entries
    .map(e => ({ ...e.value })) // clone to avoid mutating cache
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
}

export async function allQuestionsResolved(planId: string): Promise<boolean> {
  const thread = await getDiscussion(planId);
  const openQuestions = thread.filter(
    m => (m.type === 'question' || m.type === 'clarification') && !m.resolved
  );
  return openQuestions.length === 0;
}

export async function unresolvedCount(planId: string): Promise<number> {
  const thread = await getDiscussion(planId);
  return thread.filter(
    m => (m.type === 'question' || m.type === 'clarification' || m.type === 'risk') && !m.resolved
  ).length;
}

// ═══════════════════════════════════════════════════════════════
// HEALTH CHECK (on-demand, no timers)
// ═══════════════════════════════════════════════════════════════

export async function discussionHealth(): Promise<{ ok: boolean; detail: string }> {
  try {
    const testPlanId = `health-${Date.now()}`;
    const msg = createMessage(testPlanId, 'SYSTEM', 'question', 'Health check');
    await persistMessage(msg);
    const thread = await getDiscussion(testPlanId);
    if (thread.length > 0 && thread[0].id === msg.id) {
      return { ok: true, detail: 'Discussion storage operational, ordering stable' };
    }
    return { ok: false, detail: 'Thread retrieval mismatch' };
  } catch (err: unknown) {
    return { ok: false, detail: err instanceof Error ? err.message : 'Unknown error' };
  }
}

// ═══════════════════════════════════════════════════════════════
// INTERNAL
// ═══════════════════════════════════════════════════════════════

function createMessage(
  planId: string,
  from: DiscussionMessage['from'],
  type: DiscussionMessage['type'],
  message: string
): DiscussionMessage {
  return {
    id: `disc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    plan_id: planId,
    from,
    type,
    message,
    timestamp: new Date().toISOString(),
    resolved: type === 'answer' || type === 'ready',
  };
}

async function persistMessage(msg: DiscussionMessage): Promise<void> {
  await cpPut<DiscussionMessage>(discussionKey(msg.plan_id, msg.id), msg);
}
