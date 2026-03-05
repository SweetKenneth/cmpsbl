/**
 * ENCODE Discussion Channel
 * Allows ENCODE to ask questions, raise risks, and request clarification
 * before writing code — routed through the module bus.
 */

import { publish, subscribe, type ModuleSignal } from '../module-bus';
import { emit } from '../events';

// ═══════════════════════════════════════════════════════════════
// SIGNAL TYPES
// ═══════════════════════════════════════════════════════════════

export const DISCUSSION_SIGNALS = {
  /** ENCODE asks a question about a plan */
  PLAN_QUESTION: 'encode.plan.question',
  /** ENCODE raises a risk or concern */
  PLAN_RISK: 'encode.plan.risk',
  /** ENCODE requests clarification on intent */
  PLAN_CLARIFICATION: 'encode.plan.clarification',
  /** DECODE or USER responds to an ENCODE question */
  PLAN_ANSWER: 'encode.plan.answer',
  /** ENCODE signals readiness to execute */
  PLAN_READY: 'encode.plan.ready',
} as const;

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

// In-memory discussion threads per plan
const discussions: Map<string, DiscussionMessage[]> = new Map();

// ═══════════════════════════════════════════════════════════════
// ENCODE DISCUSSION API
// ═══════════════════════════════════════════════════════════════

/**
 * ENCODE asks a question about a plan before generating code.
 */
export async function askQuestion(planId: string, message: string): Promise<DiscussionMessage> {
  const msg = createMessage(planId, 'ENCODE', 'question', message);

  await publish('encode', DISCUSSION_SIGNALS.PLAN_QUESTION, {
    plan_id: planId,
    message,
    discussion_id: msg.id,
  }, { to: '*', priority: 'normal' });

  emit({
    module: 'encode',
    event_type: 'discussion_question',
    outcome: 'succeeded',
    data: { plan_id: planId, discussion_id: msg.id },
  });

  return msg;
}

/**
 * ENCODE raises a risk or concern about a plan.
 */
export async function raiseRisk(planId: string, riskDescription: string): Promise<DiscussionMessage> {
  const msg = createMessage(planId, 'ENCODE', 'risk', riskDescription);

  await publish('encode', DISCUSSION_SIGNALS.PLAN_RISK, {
    plan_id: planId,
    risk: riskDescription,
    discussion_id: msg.id,
  }, { to: '*', priority: 'high' });

  emit({
    module: 'encode',
    event_type: 'discussion_risk',
    outcome: 'succeeded',
    data: { plan_id: planId, discussion_id: msg.id },
  });

  return msg;
}

/**
 * ENCODE requests clarification on an intent.
 */
export async function requestClarification(planId: string, question: string): Promise<DiscussionMessage> {
  const msg = createMessage(planId, 'ENCODE', 'clarification', question);

  await publish('encode', DISCUSSION_SIGNALS.PLAN_CLARIFICATION, {
    plan_id: planId,
    question,
    discussion_id: msg.id,
  }, { to: 'decode', priority: 'normal' });

  return msg;
}

/**
 * Respond to a discussion message (from DECODE or USER).
 */
export async function respondToDiscussion(
  planId: string,
  discussionId: string,
  response: string,
  from: 'DECODE' | 'USER' = 'USER'
): Promise<DiscussionMessage> {
  const thread = discussions.get(planId) ?? [];
  const original = thread.find(m => m.id === discussionId);
  if (original) {
    original.resolved = true;
    original.response = response;
  }

  const msg = createMessage(planId, from, 'answer', response);

  await publish(from === 'DECODE' ? 'decode' : 'system', DISCUSSION_SIGNALS.PLAN_ANSWER, {
    plan_id: planId,
    original_discussion_id: discussionId,
    response,
  }, { to: 'encode', priority: 'normal' });

  return msg;
}

/**
 * ENCODE signals it is ready to execute after all questions are resolved.
 */
export async function signalReady(planId: string): Promise<DiscussionMessage> {
  const msg = createMessage(planId, 'ENCODE', 'ready', 'All questions resolved. Ready to execute.');

  await publish('encode', DISCUSSION_SIGNALS.PLAN_READY, {
    plan_id: planId,
  }, { to: '*', priority: 'normal' });

  return msg;
}

// ═══════════════════════════════════════════════════════════════
// QUERIES
// ═══════════════════════════════════════════════════════════════

/** Get all discussion messages for a plan */
export function getDiscussion(planId: string): DiscussionMessage[] {
  return [...(discussions.get(planId) ?? [])];
}

/** Check if all questions for a plan are resolved */
export function allQuestionsResolved(planId: string): boolean {
  const thread = discussions.get(planId) ?? [];
  const openQuestions = thread.filter(
    m => (m.type === 'question' || m.type === 'clarification') && !m.resolved
  );
  return openQuestions.length === 0;
}

/** Get unresolved discussion count for a plan */
export function unresolvedCount(planId: string): number {
  const thread = discussions.get(planId) ?? [];
  return thread.filter(
    m => (m.type === 'question' || m.type === 'clarification' || m.type === 'risk') && !m.resolved
  ).length;
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
  const msg: DiscussionMessage = {
    id: `disc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    plan_id: planId,
    from,
    type,
    message,
    timestamp: new Date().toISOString(),
    resolved: type === 'answer' || type === 'ready',
  };

  if (!discussions.has(planId)) {
    discussions.set(planId, []);
  }
  discussions.get(planId)!.push(msg);

  return msg;
}
