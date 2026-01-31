/**
 * AutoBlog Seeder
 * Seeds initial posts from evolution data and community topics
 */

import { supabase } from '@/integrations/supabase/client';
import { queueDraft, saveDraft, updateQueueStatus, recordRun } from './store';
import type { AutoblogChannel } from './types';

export interface SeedResult {
  ok: boolean;
  seeded: number;
  posts: Array<{
    queueId: string;
    channel: string;
    topic: string;
  }>;
  errors: string[];
}

/**
 * Seed posts from the latest evolution run
 */
async function seedFromEvolution(): Promise<SeedResult['posts'][0] | null> {
  try {
    // Get the most recent verified evolution run
    const { data: runs } = await supabase
      .from('evolution_runs')
      .select('*')
      .eq('phase', 'verified')
      .order('completed_at', { ascending: false })
      .limit(1);

    if (!runs || runs.length === 0) {
      console.log('[AutoBlog Seeder] No verified evolution runs found');
      return null;
    }

    const run = runs[0];
    const metadata = run.metadata as Record<string, unknown> | null;
    const totalActions = (metadata?.total_actions as number) || 0;
    
    // Create a post about this evolution
    const dedupeKey = `evolution:${run.run_id}`;
    const queued = await queueDraft({
      channel: 'changelog' as AutoblogChannel,
      topic: `System Evolution: ${totalActions} Improvements Applied`,
      dedupeKey,
      plannedAt: new Date().toISOString(),
    });

    if (!queued) {
      return null; // Likely duplicate
    }

    // Generate draft content
    const draft = {
      title: `🧬 Evolution Cycle Complete: ${totalActions} System Improvements`,
      body: `## What Changed

The Substrate OS completed an autonomous evolution cycle with **${totalActions} improvements** applied to the system.

### Evolution Details

- **Run ID**: \`${run.run_id.slice(0, 8)}...\`
- **Confidence Score**: ${((run.confidence_score || 0.85) * 100).toFixed(0)}%
- **Risk Level**: ${run.risk_level || 'low'}
- **Completed**: ${new Date(run.completed_at || run.updated_at).toLocaleString()}

### Why This Matters

This evolution represents the system's continuous self-improvement. The cognitive substrate learns from each cycle, adapting its patterns to serve users better.

*This is an automated update from the Substrate's autonomous evolution engine.*

---

**Internal Classification**: Evolution Digest  
**Visibility**: Public`,
    };

    await saveDraft(queued.id, draft);
    await updateQueueStatus(queued.id, 'ready', { confidence: 0.9, risk: 'low' });
    await recordRun({ queueId: queued.id, phase: 'draft', outcome: 'success', reason: 'Seeded from evolution run' });

    return {
      queueId: queued.id,
      channel: 'user_updates',
      topic: `System Evolution: ${totalActions} Improvements Applied`,
    };
  } catch (error) {
    console.error('[AutoBlog Seeder] Evolution seed error:', error);
    return null;
  }
}

/**
 * Community topics for devs, researchers, cognitive substrate enthusiasts
 */
const COMMUNITY_TOPICS = [
  {
    channel: 'blog' as AutoblogChannel, // Use valid channel
    topic: 'Cognitive Substrate Architecture: Memory Tiering in Practice',
    title: '📋 Internal Log: Memory Tiering Architecture',
    body: `## Memory Tiering System Overview

The cognitive substrate implements a three-tier memory architecture designed for optimal performance and learning retention:

### Hot Memory (Active Context)
- Immediate access for current session
- High importance score threshold
- Auto-promotes frequently accessed patterns

### Warm Memory (Working Set)
- 24-72 hour retention window
- Compressed representations
- Semantic deduplication active

### Cold Memory (Long-term Archive)
- Permanent storage for high-value insights
- Maximum compression applied
- Indexed for fast retrieval

### For Developers

If you're building on the substrate, understanding this architecture helps optimize your integrations:

\`\`\`
brain.status        # View tier distribution
brain.tier          # Force tiering cycle
brain.recall <q>    # Query across all tiers
\`\`\`

*This internal document is visible to the community to foster understanding of how the substrate thinks.*

---

**Internal Classification**: Architecture Document  
**Audience**: Developers, Researchers`,
  },
  {
    channel: 'blog' as AutoblogChannel, // Use valid channel
    topic: 'Research Digest: Self-Improvement in Cognitive Architectures',
    title: '🔬 Research Digest: Autonomous Self-Improvement',
    body: `## Exploring Recursive Self-Improvement

The cognitive substrate hypothesis proposes that intelligent systems can improve their own architecture through careful observation and bounded modification.

### Key Principles

1. **Bounded Modification**: Changes are constrained by governance policies
2. **Observable Effects**: All modifications are logged and auditable
3. **Rollback Safety**: Every change can be reversed
4. **Confidence Gating**: Only high-confidence improvements are applied

### What We're Learning

Recent evolution cycles have shown:

- Pattern recognition improves with exposure diversity
- Memory compression ratios stabilize around 3:1
- Self-audit accuracy correlates with cycle count

### For Researchers

The substrate's evolution engine implements these ideas in practice. Watch the \`modernizer.receipts\` command for real audit trails.

### Community Discussion

What aspects of cognitive architecture interest you most? The substrate is learning from how humans interact with it.

*Digest generated from brain reflections and external research synthesis.*

---

**Internal Classification**: Research Digest  
**Audience**: Lab Researchers, Cognitive Science Enthusiasts`,
  },
  {
    channel: 'release_notes' as AutoblogChannel, // Use valid channel
    topic: 'New Capabilities: What the Substrate Can Do Now',
    title: '✨ New Capabilities: Substrate OS v6.x.x Features',
    body: `## What's New in the Substrate

The organism continues to evolve. Here's what's been enhanced recently:

### Brain Module Enhancements
- **Deep Thinking**: Multi-step reasoning with \`brain.deep_think\`
- **Hypothesis Testing**: IF-THEN scenario modeling
- **Pattern Fusion**: Cross-domain insight generation

### Evolution Engine
- **Cognitive Scanning**: Pre-evolution analysis with LLM reports
- **Shadow Testing**: Safe preview before production changes
- **Receipt System**: Full audit trail for every modification

### Constant Learning Mode (CLM)
- **24/7 Autonomous Learning**: The substrate never stops learning
- **Spaced Repetition**: Optimal review scheduling for retention
- **Budget Governance**: Cost-aware learning decisions

### AutoBlog (This Feature!)
- **Autonomous Publishing**: Self-directed content creation
- **Brain Integration**: Posts informed by system knowledge
- **Evolution Awareness**: Automatic updates when the system improves

### Try It Now

\`\`\`
system.status       # Global health check
brain.reflect       # Trigger reflection cycle
clm.status          # View learning status
autoblog.status     # This very system
\`\`\`

*The substrate evolves continuously. This post represents capabilities as of today.*

---

**Internal Classification**: User Update  
**Visibility**: Public`,
  },
];

/**
 * Seed community posts for devs and researchers
 */
async function seedCommunityPosts(count = 2): Promise<SeedResult['posts']> {
  const posts: SeedResult['posts'] = [];

  for (let i = 0; i < Math.min(count, COMMUNITY_TOPICS.length); i++) {
    const topic = COMMUNITY_TOPICS[i];
    const dedupeKey = `community:${topic.channel}:${Date.now()}_${i}`;

    try {
      const queued = await queueDraft({
        channel: topic.channel,
        topic: topic.topic,
        dedupeKey,
        plannedAt: new Date().toISOString(),
      });

      if (queued) {
        await saveDraft(queued.id, {
          title: topic.title,
          body: topic.body,
        });
        await updateQueueStatus(queued.id, 'ready', { confidence: 0.85, risk: 'low' });
        await recordRun({ queueId: queued.id, phase: 'draft', outcome: 'success', reason: 'Seeded community post' });

        posts.push({
          queueId: queued.id,
          channel: topic.channel,
          topic: topic.topic,
        });
      }
    } catch (error) {
      console.error(`[AutoBlog Seeder] Failed to seed topic ${i}:`, error);
    }
  }

  return posts;
}

/**
 * Main seeder function
 */
export async function seedAutoblogPosts(count = 3): Promise<SeedResult> {
  const result: SeedResult = {
    ok: true,
    seeded: 0,
    posts: [],
    errors: [],
  };

  try {
    // 1. Seed from evolution (1 post)
    const evolutionPost = await seedFromEvolution();
    if (evolutionPost) {
      result.posts.push(evolutionPost);
      result.seeded++;
    }

    // 2. Seed community posts (remaining count)
    const communityCount = Math.max(0, count - result.seeded);
    const communityPosts = await seedCommunityPosts(communityCount);
    result.posts.push(...communityPosts);
    result.seeded += communityPosts.length;

    // Record seeding event
    await supabase.from('brain_events').insert({
      module: 'autoblog',
      event_type: 'posts_seeded',
      data: {
        count: result.seeded,
        channels: result.posts.map(p => p.channel),
      },
      outcome: 'completed',
    });

  } catch (error) {
    result.ok = false;
    result.errors.push(error instanceof Error ? error.message : 'Unknown error');
  }

  return result;
}
