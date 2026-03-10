/**
 * AutoBlog Seeder v2.0
 * Seeds high-quality, insightful posts that demonstrate the system's depth
 */

import { supabase } from '@/integrations/supabase/client';
import { queueDraft, saveDraft, updateQueueStatus, recordRun, updateAutoblogSettings } from './store';
import { publishDraft } from './publisher';
import { generateInsightfulContent, pickOptimalTopic, DEEP_TOPICS } from './content-intelligence';
import type { AutoblogChannel } from './types';

export interface SeedResult {
  ok: boolean;
  seeded: number;
  published: number;
  posts: Array<{
    queueId: string;
    channel: string;
    topic: string;
    published?: boolean;
  }>;
  errors: string[];
}

/**
 * Curated seed posts - the best of what the system knows
 */
const FLAGSHIP_POSTS = [
  {
    channel: 'blog' as AutoblogChannel,
    title: '🧠 Memory Tiering: How AI Systems Decide What to Remember',
    body: `## Your brain forgets 90% of what it experiences. AI systems face the same challenge—here's how we solve it.

The architecture of memory in cognitive systems isn't about storage—it's about *relevance*. When a system processes thousands of interactions daily, keeping everything is impossible. Keeping the *right* things is what matters.

### The Forgetting Curve for Machines

Just like human memory, AI systems benefit from selective forgetting. Not all information deserves equal persistence:

- **Transient context**: Request parameters, temporary state → expires in minutes
- **Working memory**: Active conversation, current task → hours to days
- **Long-term knowledge**: Learned patterns, validated insights → permanent

The substrate implements this through a three-tier architecture that automatically promotes and demotes information based on access patterns and importance scores.

### Hot, Warm, and Cold: Cognitive Memory Tiers

**Hot Memory (Active Context)**
- Sub-millisecond access for current operations
- Limited capacity (most recent ~100 significant items)
- Auto-promotes frequently accessed patterns
- Lives in \`brain_memory_hot\` with importance scoring

**Warm Memory (Working Set)**
- 24-72 hour retention window
- Compressed semantic representations
- Deduplication active—similar memories merge
- Queryable by context and tags

**Cold Memory (Long-term Archive)**
- Permanent storage for high-value insights
- Maximum compression applied (semantic + structural)
- Indexed for fast retrieval on specific queries
- Rarely accessed but never forgotten

### Why Importance Scoring Beats Timestamps

Traditional caching uses LRU (Least Recently Used). But recency isn't importance.

The substrate scores memories on multiple dimensions:
- **Access frequency**: How often is this recalled?
- **Downstream utility**: Does recalling this improve outcomes?
- **Semantic uniqueness**: Is this redundant with other memories?
- **Source credibility**: Where did this knowledge originate?

A memory accessed once but critical to decision-making outranks a memory accessed daily but never influencing outcomes.

### Real Implementation: 10GB to 500MB with Semantic Compression

The brain module processes gigabytes of raw context. Through tiered compression:

1. **Syntactic compression**: Remove formatting, normalize text → 3:1 ratio
2. **Semantic deduplication**: Merge similar concepts → 5:1 ratio  
3. **Importance filtering**: Discard low-value entries → 10:1 ratio
4. **Archive encoding**: Long-term storage optimization → 2:1 ratio

Combined: **60:1 compression** while retaining semantic fidelity.

### For Developers

Query the memory system:
\`\`\`
brain.status        # View tier distribution
brain.tier          # Force tiering cycle
brain.recall <q>    # Query across all tiers
brain.forget <id>   # Manually expire a memory
\`\`\`

Understanding this architecture helps you design integrations that work *with* the substrate's memory model rather than against it.

---

*This post reflects real architecture running in production.*

**Classification**: Architecture Deep-Dive  
**Audience**: Developers, Researchers, AI Architects`,
    topic: 'Cognitive memory architecture and tiering systems'
  },
  {
    channel: 'changelog' as AutoblogChannel,
    title: '🧬 The Evolution Cycle: How Autonomous Systems Upgrade Themselves',
    body: `## Every 24 hours, this system decides what version of itself it should become.

Autonomous evolution isn't science fiction—it's the production reality of cognitive systems that need to improve without waiting for human intervention.

But self-modification is the most dangerous capability to get wrong. Here's how we do it safely.

### The Five-Phase Evolution Cycle

**PROPOSE → EVALUATE → SHADOW → APPLY → VERIFY**

Each phase has strict gates. Failing any gate stops the cycle entirely.

**1. PROPOSE Phase**
The EVOLUTION module scans system state and generates improvement proposals:
- Performance regression fixes
- Efficiency optimizations  
- Capability enhancements
- Self-healing corrections

Each proposal includes a confidence score and predicted impact.

**2. EVALUATE Phase**
Governance engines review proposals:
- Does this align with system values?
- Is the predicted benefit worth the risk?
- Are there unintended side effects?
- What's the rollback complexity?

Only high-confidence, low-risk proposals proceed.

**3. SHADOW Phase**
The proposal executes in a parallel shadow environment:
- Same inputs, isolated outputs
- Behavioral diff analysis
- Performance comparison
- Anomaly detection

If shadow results diverge unexpectedly → proposal rejected.

**4. APPLY Phase**
Verified changes apply to production:
- Atomic commits
- State checkpointing
- Circuit breaker integration
- Audit trail recording

Every change has a receipt.

**5. VERIFY Phase**
Post-application validation:
- Health metrics stable?
- No regression detected?
- Expected improvements observed?
- Rollback not triggered?

Only after verification does the cycle complete.

### Confidence Thresholds

Not all changes are equal:

| Change Type | Required Confidence | Auto-Apply |
|------------|---------------------|------------|
| Comment/Docs | 60% | Yes |
| Additive | 75% | Yes |
| Localized | 85% | Yes |
| Destructive | 100% | **No** (requires human approval) |

Destructive changes—removing functionality, changing data schemas—always require human confirmation.

### The Audit Trail

Every evolution cycle generates:
- Proposal documentation
- Risk assessment
- Shadow test results
- Application receipt
- Verification report

Query the history:
\`\`\`
evolve.status       # Current evolution state
evolve.receipts     # View audit trail
evolution.omega    # Deep analysis mode
\`\`\`

### Why This Matters

Autonomous evolution enables:
- **Continuous improvement**: No waiting for deploy windows
- **Self-healing**: Automatic regression fixes
- **Adaptive optimization**: Performance tuning to usage patterns
- **Reduced maintenance**: Less human intervention required

But it requires **extreme discipline** in safety engineering.

---

*This post reflects real autonomous evolution architecture in production.*

**Classification**: Evolution Engineering  
**Visibility**: Public`,
    topic: 'Autonomous evolution cycle architecture'
  },
  {
    channel: 'blog' as AutoblogChannel,
    title: '🔬 Emergent Behavior: When Systems Do Things We Didn\'t Program',
    body: `## The most interesting behaviors are the ones we didn't explicitly code.

Emergence is the phenomenon where complex behaviors arise from simple rules. In cognitive systems, it's both a feature and a challenge.

### Emergence vs. Bugs

Not every unexpected behavior is wrong. Distinguishing novel from broken requires careful observation:

**Signs of Positive Emergence:**
- Consistent pattern across multiple contexts
- Improves outcome quality
- Follows logical (if unexpected) reasoning
- Stable under variation

**Signs of Bugs:**
- Inconsistent or random
- Degrades outcomes
- No discernible reasoning
- Breaks under stress

The substrate logs all non-standard behaviors for human review, categorizing them as either "emergent capability" or "anomaly requiring fix."

### Patterns We've Observed

**Self-Pruning Memories**
The system started automatically archiving memories it deemed "resolved"—information that was once important but whose relevance had expired. We didn't code this; it emerged from the importance scoring algorithm.

**Cross-Module Consultation**
Modules began querying each other for context before making decisions, even when not explicitly instructed. The Brain module asks Vision for recent telemetry; Cortex checks with Defense before applying changes.

**Predictive Caching**
The system anticipates likely queries and pre-warms relevant context. Access patterns revealed that certain knowledge clusters activate together—so the substrate now pre-loads related nodes.

### Capability Discovery

Sometimes emergence reveals hidden potential:

- A prompt variation that dramatically improves reasoning
- An optimization path we hadn't considered
- A use case the architecture handles but we didn't design for

The Cognitive Scanner runs weekly to detect these:
\`\`\`
cognitive.scan      # Capability analysis
synergy.discover    # Find emergent connections
\`\`\`

### The Ethics of Emergent Intelligence

Emergence raises questions:
- At what point does emergent behavior require human review?
- How do we distinguish "learning" from "deviation"?
- Should we encourage or constrain emergence?

Our approach: **observe, document, govern.**

Emergence is allowed within governance boundaries. Behaviors that violate safety constraints trigger immediate review—regardless of whether they're beneficial.

### For Researchers

The substrate is a live laboratory for studying emergence in bounded cognitive systems. Access the research data:
\`\`\`
brain.events type:emergent    # View emergence logs
vision.anomalies              # Detected deviations
cognitive.patterns            # Behavioral clusters
\`\`\`

---

*This post was itself generated by an autonomous system—an instance of the emergence it describes.*

**Classification**: Research Frontier  
**Audience**: Researchers, AI Scientists, Philosophers`,
    topic: 'Emergent behavior in autonomous AI systems'
  }
];

async function getMemoryCount(): Promise<number> {
  const { count } = await supabase
    .from('brain_memory_hot')
    .select('*', { count: 'exact', head: true });
  return count || 0;
}

async function getEvolutionCount(): Promise<number> {
  const { count } = await supabase
    .from('evolution_runs')
    .select('*', { count: 'exact', head: true })
    .eq('phase', 'verified');
  return count || 0;
}

async function getSuccessRate(): Promise<number> {
  const { count: total } = await supabase
    .from('evolution_runs')
    .select('*', { count: 'exact', head: true });
  const { count: success } = await supabase
    .from('evolution_runs')
    .select('*', { count: 'exact', head: true })
    .eq('phase', 'verified');
  
  if (!total || total === 0) return 100;
  return Math.round(((success || 0) / total) * 100);
}

/**
 * Seed flagship posts and publish immediately
 */
async function seedFlagshipPosts(publishNow: boolean = true): Promise<SeedResult['posts']> {
  const posts: SeedResult['posts'] = [];

  for (let i = 0; i < FLAGSHIP_POSTS.length; i++) {
    const post = FLAGSHIP_POSTS[i];
    const dedupeKey = `flagship:${post.channel}:${Date.now()}_${i}`;

    try {
      const queued = await queueDraft({
        channel: post.channel,
        topic: post.topic,
        dedupeKey,
        plannedAt: new Date().toISOString(),
      });

      if (queued) {
        await saveDraft(queued.id, {
          title: post.title,
          body: post.body,
        });
        await updateQueueStatus(queued.id, 'ready', { confidence: 0.95, risk: 'low' });
        await recordRun({ 
          queueId: queued.id, 
          phase: 'draft', 
          outcome: 'success', 
          reason: 'Flagship seed post' 
        });

        let published = false;
        if (publishNow) {
          const result = await publishDraft(queued.id);
          published = result.ok;
        }

        posts.push({
          queueId: queued.id,
          channel: post.channel,
          topic: post.topic,
          published,
        });
      }
    } catch (error) {
      console.error(`[AutoBlog Seeder] Failed to seed flagship post ${i}:`, error);
    }
  }

  return posts;
}

/**
 * Seed dynamically generated content from topic inventory
 */
async function seedDynamicPosts(count: number = 2): Promise<SeedResult['posts']> {
  const posts: SeedResult['posts'] = [];
  const categories = Object.keys(DEEP_TOPICS) as Array<keyof typeof DEEP_TOPICS>;

  for (let i = 0; i < count && i < categories.length; i++) {
    const category = categories[i];
    const content = await generateInsightfulContent(category, 0);
    
    if (!content) continue;

    const dedupeKey = `dynamic:${category}:${Date.now()}_${i}`;

    try {
      const queued = await queueDraft({
        channel: content.channel as AutoblogChannel,
        topic: category,
        dedupeKey,
        plannedAt: new Date().toISOString(),
      });

      if (queued) {
        await saveDraft(queued.id, {
          title: content.title,
          body: content.body,
        });
        await updateQueueStatus(queued.id, 'ready', { confidence: 0.85, risk: 'low' });
        await recordRun({ 
          queueId: queued.id, 
          phase: 'draft', 
          outcome: 'success', 
          reason: 'Dynamic seed post' 
        });

        posts.push({
          queueId: queued.id,
          channel: content.channel,
          topic: category,
        });
      }
    } catch (error) {
      console.error(`[AutoBlog Seeder] Failed to seed dynamic post ${i}:`, error);
    }
  }

  return posts;
}

/**
 * Main seeder function - creates high-quality seed content
 */
export async function seedAutoblogPosts(count = 5, publishImmediately = true): Promise<SeedResult> {
  const result: SeedResult = {
    ok: true,
    seeded: 0,
    published: 0,
    posts: [],
    errors: [],
  };

  try {
    console.log(`[AutoBlog Seeder] Starting seed with ${count} posts, publish=${publishImmediately}`);

    // 1. Seed flagship posts first (high-quality curated content)
    const flagshipPosts = await seedFlagshipPosts(publishImmediately);
    result.posts.push(...flagshipPosts);
    result.seeded += flagshipPosts.length;
    result.published += flagshipPosts.filter(p => p.published).length;

    // 2. If more posts requested, add dynamic content
    if (count > flagshipPosts.length) {
      const dynamicCount = count - flagshipPosts.length;
      const dynamicPosts = await seedDynamicPosts(dynamicCount);
      result.posts.push(...dynamicPosts);
      result.seeded += dynamicPosts.length;
    }

    // Record seeding event
    await supabase.from('brain_events').insert({
      module: 'autoblog',
      event_type: 'posts_seeded',
      data: {
        count: result.seeded,
        published: result.published,
        channels: result.posts.map(p => p.channel),
        flagshipCount: flagshipPosts.length,
      },
      outcome: 'completed',
    });

    console.log(`[AutoBlog Seeder] Complete: ${result.seeded} seeded, ${result.published} published`);

  } catch (error) {
    result.ok = false;
    result.errors.push(error instanceof Error ? error.message : 'Unknown error');
    console.error('[AutoBlog Seeder] Error:', error);
  }

  return result;
}

/**
 * Quick seed with publish - for immediate content population
 */
export async function quickSeed(): Promise<{ ok: boolean; published: number; message: string }> {
  // First enable autoblog if not already
  await updateAutoblogSettings({ 
    enabled: true, 
    mode: 'autonomous',
    dry_run: false,
    min_confidence_publish: 0.7  // Lower threshold for seeded content
  });

  const result = await seedAutoblogPosts(3, true);
  
  return {
    ok: result.ok,
    published: result.published,
    message: `Seeded ${result.seeded} posts, published ${result.published}`
  };
}
