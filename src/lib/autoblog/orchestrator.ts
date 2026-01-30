/**
 * AutoBlog Orchestrator
 * High-level operations (no trade secrets)
 */

import { 
  getAutoblogSettings, 
  queueDraft, 
  updateQueueStatus, 
  saveDraft as storeDraft,
  getDraft,
  recordRun
} from './store';
import { guardAutoblogAction } from './policy';
import { shouldPostNow, computeDedupeKey } from './rules';
import { checkAutoblogCircuit, reportSuccess, reportFailure } from './circuit';
import type { AutoblogSettings, AutoblogQueueItem, AutoblogDraft } from './types';

export interface AutoblogStatusResult {
  ok: boolean;
  settings: AutoblogSettings | null;
  circuit: {
    state: string;
    canProceed: boolean;
  };
}

export interface AutoblogOperationResult {
  ok: boolean;
  blocked?: boolean;
  reason?: string;
  queueId?: string;
  data?: Record<string, unknown>;
}

/**
 * Get AutoBlog status
 */
export async function getAutoblogStatus(): Promise<AutoblogStatusResult> {
  const settings = await getAutoblogSettings();
  const circuit = await checkAutoblogCircuit();
  
  return {
    ok: true,
    settings,
    circuit: {
      state: circuit.state,
      canProceed: circuit.canProceed
    }
  };
}

/**
 * Plan a new blog post
 */
export async function autoblogPlan(): Promise<AutoblogOperationResult> {
  const settings = await getAutoblogSettings();
  const gate = await guardAutoblogAction('plan', settings);
  
  if (!gate.allowed) {
    return { ok: false, blocked: true, reason: gate.reason };
  }

  const decision = await shouldPostNow(settings!);
  
  if (!decision.allowed) {
    return { ok: false, blocked: true, reason: decision.reason };
  }

  const dedupeKey = computeDedupeKey(decision.channel!, decision.topic);
  const queued = await queueDraft({
    channel: decision.channel!,
    topic: decision.topic,
    dedupeKey,
    plannedAt: decision.plannedAt
  });

  if (!queued) {
    return { ok: false, reason: 'Failed to queue (possible duplicate)' };
  }

  await recordRun({
    queueId: queued.id,
    phase: 'plan',
    outcome: 'success',
    reason: decision.reason
  });

  return { 
    ok: true, 
    queueId: queued.id,
    data: {
      channel: decision.channel,
      topic: decision.topic,
      plannedAt: decision.plannedAt
    }
  };
}

/**
 * Generate draft for queued item
 */
export async function autoblogDraft(queueId: string): Promise<AutoblogOperationResult> {
  const settings = await getAutoblogSettings();
  const gate = await guardAutoblogAction('draft', settings);
  
  if (!gate.allowed) {
    return { ok: false, blocked: true, reason: gate.reason };
  }

  await updateQueueStatus(queueId, 'drafting');

  try {
    // Draft generation happens internally
    // Only high-level reason is recorded
    const draftContent = await generateDraftContent(queueId);
    
    if (!draftContent) {
      await updateQueueStatus(queueId, 'failed', { error: 'Draft generation failed' });
      await reportFailure('Draft generation failed');
      return { ok: false, reason: 'Draft generation failed' };
    }

    await storeDraft(queueId, draftContent);
    await updateQueueStatus(queueId, 'ready');
    
    await recordRun({
      queueId,
      phase: 'draft',
      outcome: 'success',
      reason: 'Draft created under governed intent'
    });

    await reportSuccess();

    return { ok: true, queueId };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    await updateQueueStatus(queueId, 'failed', { error: message });
    await reportFailure(message);
    
    await recordRun({
      queueId,
      phase: 'draft',
      outcome: 'failed',
      reason: message
    });

    return { ok: false, reason: message };
  }
}

/**
 * Verify draft meets quality and safety standards
 */
export async function autoblogVerify(queueId: string): Promise<AutoblogOperationResult> {
  const settings = await getAutoblogSettings();
  const gate = await guardAutoblogAction('verify', settings);
  
  if (!gate.allowed) {
    return { ok: false, blocked: true, reason: gate.reason };
  }

  const draft = await getDraft(queueId);
  
  if (!draft || !draft.body) {
    return { ok: false, reason: 'No draft found to verify' };
  }

  // Verification checks (details internal)
  const checks = {
    hasTitle: !!draft.title,
    hasBody: draft.body.length > 100,
    noSecrets: !containsSecrets(draft.body),
    appropriateLength: draft.body.length < 10000
  };

  const passed = Object.values(checks).every(Boolean);
  const confidence = passed ? 0.9 : 0.3;

  await updateQueueStatus(queueId, 'ready', {
    confidence,
    risk: passed ? 'low' : 'high'
  });

  await recordRun({
    queueId,
    phase: 'verify',
    outcome: passed ? 'success' : 'blocked',
    reason: passed ? 'Safety and governance checks passed' : 'Verification failed'
  });

  return {
    ok: passed,
    blocked: !passed,
    queueId,
    data: {
      confidence,
      checks: Object.keys(checks).filter(k => checks[k as keyof typeof checks])
    }
  };
}

/**
 * Publish verified draft
 */
export async function autoblogPublish(queueId: string): Promise<AutoblogOperationResult> {
  const settings = await getAutoblogSettings();
  const gate = await guardAutoblogAction('publish', settings);
  
  if (!gate.allowed) {
    return { ok: false, blocked: true, reason: gate.reason };
  }

  const draft = await getDraft(queueId);
  
  if (!draft) {
    return { ok: false, reason: 'No draft found to publish' };
  }

  try {
    // Publishing logic is internal
    // For now, mark as published (actual publishing integrates with site)
    await updateQueueStatus(queueId, 'published');
    
    await recordRun({
      queueId,
      phase: 'publish',
      outcome: 'success',
      reason: 'Published under governed intent'
    });

    await reportSuccess();

    return { ok: true, queueId };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Publish failed';
    await updateQueueStatus(queueId, 'failed', { error: message });
    await reportFailure(message);

    await recordRun({
      queueId,
      phase: 'publish',
      outcome: 'failed',
      reason: message
    });

    return { ok: false, reason: message };
  }
}

/**
 * Abort a queued/drafting item
 */
export async function autoblogAbort(
  queueId: string, 
  reason = 'Aborted by operator'
): Promise<AutoblogOperationResult> {
  await updateQueueStatus(queueId, 'aborted', { error: reason });
  
  await recordRun({
    queueId,
    phase: 'publish',
    outcome: 'blocked',
    reason: `Aborted: ${reason}`
  });

  return { ok: true, queueId, reason };
}

// Internal helpers (no secrets exposed)

async function generateDraftContent(queueId: string): Promise<{ title: string; body: string } | null> {
  // Placeholder: actual generation is internal
  // Returns high-level organism-focused content
  return {
    title: 'System Evolution Update',
    body: `## Why the System Changed

The substrate observed new pressures and adapted accordingly. This update reflects learned responses that improve stability and capability.

### Observed Pressures
- System patterns required optimization
- New behaviors emerged from usage

### Resulting Capabilities
- Enhanced operational stability
- Improved response characteristics

*This is an automated evolution log entry.*`
  };
}

function containsSecrets(text: string): boolean {
  const secretPatterns = [
    /sk_[a-zA-Z0-9]{20,}/,
    /api[_-]?key/i,
    /password/i,
    /secret/i,
    /token=[a-zA-Z0-9]+/i
  ];
  
  return secretPatterns.some(pattern => pattern.test(text));
}
