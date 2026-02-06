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
import { supabase } from '@/integrations/supabase/client';
import { guardAutoblogAction } from './policy';
import { shouldPostNow, computeDedupeKey } from './rules';
import { checkAutoblogCircuit, reportSuccess, reportFailure } from './circuit';
import { publishDraft, publishAllReady } from './publisher';
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

  // Use the new publisher module
  const result = await publishDraft(queueId);
  
  if (result.ok) {
    return { 
      ok: true, 
      queueId,
      data: {
        postId: result.postId,
        slug: result.slug,
      }
    };
  } else {
    return { ok: false, reason: result.error };
  }
}

/**
 * Publish all ready drafts
 */
export async function autoblogPublishAll(): Promise<AutoblogOperationResult> {
  const settings = await getAutoblogSettings();
  const gate = await guardAutoblogAction('publish', settings);
  
  if (!gate.allowed) {
    return { ok: false, blocked: true, reason: gate.reason };
  }

  const result = await publishAllReady();
  
  return {
    ok: result.published > 0 || result.failed === 0,
    data: {
      published: result.published,
      failed: result.failed,
    }
  };
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
  try {
    // Get the queue item details
    const { data: queueItem } = await supabase
      .from('autoblog_queue')
      .select('*')
      .eq('id', queueId)
      .single();
    
    if (!queueItem) return null;
    
    const { topic, channel } = queueItem;
    
    // Try to use new content intelligence system first
    try {
      const { generateInsightfulContent, pickOptimalTopic } = await import('./content-intelligence');
      
      // Pick optimal topic if none specified
      const selection = await pickOptimalTopic();
      if (selection) {
        const content = await generateInsightfulContent(selection.category, selection.topicIndex);
        if (content) {
          return { title: content.title, body: content.body };
        }
      }
    } catch (contentError) {
      console.warn('[AutoBlog] Content intelligence unavailable:', contentError);
    }
    
    // Fallback: Try NEXUS for intelligent content generation
    try {
      const { substrate } = await import('../substrate');
      
      if (substrate.nexus?.text) {
        const prompt = `Write a deeply insightful, technically accurate blog post about "${topic || 'cognitive system architecture'}". 

Channel: ${channel}
Style: Technical but accessible, like Anthropic's research blog meets a senior engineer's notes.
Length: 500-800 words.
Format: Markdown with clear headers and code examples where relevant.

REQUIREMENTS:
- Start with a compelling hook that challenges assumptions
- Include real technical depth, not marketing fluff
- Reference specific architectural patterns or algorithms
- End with actionable insights for developers/researchers
- Avoid: "revolutionary", "game-changing", "exciting!", "incredible"
- Include terminal commands readers can try

EXAMPLES OF GOOD HOOKS:
- "Your brain forgets 90% of what it experiences. AI systems face the same challenge."
- "The most dangerous capability isn't intelligence—it's self-modification without constraints."`;

        const response = await substrate.nexus.text(prompt);
       
        const respObj = response as unknown as Record<string, unknown>;
        const responseContent = respObj?.content || respObj?.response || respObj?.data;
        
        if (responseContent && typeof responseContent === 'string') {
          const lines = responseContent.split('\n').filter((l: string) => l.trim());
          let title = topic || 'System Architecture Deep-Dive';
          let body = responseContent;
          
          if (lines[0]?.startsWith('#')) {
            title = `🧠 ${lines[0].replace(/^#+\s*/, '').trim()}`;
            body = lines.slice(1).join('\n').trim();
          }
          
          return { title, body };
        }
      }
    } catch (nexusError) {
      console.warn('[AutoBlog] NEXUS unavailable:', nexusError);
    }
    
    // Final fallback: Rich template content
    const timestamp = new Date().toISOString().split('T')[0];
    const title = topic 
      ? `🧠 ${topic.charAt(0).toUpperCase() + topic.slice(1)}: Architecture & Insights`
      : `🧬 Cognitive Substrate: Evolution Update - ${timestamp}`;
    
    const body = `## Why This Matters

${topic ? `Understanding ${topic} is fundamental to building systems that improve themselves.` : 'Autonomous systems that learn from their own operation represent the next frontier of software architecture.'}

### The Core Challenge

Every cognitive system faces the same tension: **capability vs. stability**. Add too much flexibility and the system becomes unpredictable. Add too much constraint and it can't adapt.

### Our Approach

The substrate implements a **bounded evolution model**:

1. **Observe**: Gather telemetry on system behavior
2. **Propose**: Generate potential improvements
3. **Evaluate**: Score proposals by risk and benefit
4. **Shadow**: Test in parallel before applying
5. **Verify**: Confirm no regressions after change

### For Developers

Query the system state:
\`\`\`
system.status       # Global health
brain.status        # Memory distribution
evolve.receipts     # Audit trail
\`\`\`

### Key Insights

- **Emergence is a feature, not a bug** — when properly constrained
- **Rollback semantics are non-negotiable** — every change must be reversible
- **Confidence > speed** — it's better to wait than to break production

---

*This update reflects ongoing learning from ${new Date().toLocaleDateString()} operations.*

**Classification**: System Log  
**Visibility**: Public`;

    return { title, body };
  } catch (error) {
    console.error('[AutoBlog] Draft generation failed:', error);
    return null;
  }
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
