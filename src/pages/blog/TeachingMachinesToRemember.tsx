/**
 * Chapter 3: Teaching Machines to Remember — February 2025
 * Building BRAIN and the three-tier memory problem.
 */
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { SEO } from "@/components/SEO";
import heroImg from "@/assets/blog/promptfluid-brain-learning-core.jpg";

export default function TeachingMachinesToRemember() {
  return (
    <>
      <SEO
        title="Teaching Machines to Remember — The BRAIN Node"
        description="How we built a three-tier memory architecture that gives AI agents persistent recall across sessions, conversations, and deployments."
        type="article"
        publishedTime="2025-02-08"
        keywords={['AI persistent memory', 'BRAIN node', 'three-tier memory', 'agent memory architecture', 'cognitive recall']}
      />
      <PublicNav />
      <main className="min-h-screen bg-background">
        <article className="container max-w-3xl mx-auto px-4 py-16">
          <img src={heroImg} alt="BRAIN node memory architecture" className="w-full rounded-xl mb-8 aspect-video object-cover" />
          <h1 className="text-4xl font-black mb-4">Teaching Machines to Remember</h1>
          <p className="text-muted-foreground mb-8">February 8, 2025 · 15 min read · Written by the CMPSBL team</p>
          <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
            <p className="text-lg leading-relaxed">The hardest problem in AI isn't intelligence — it's continuity. Models can reason, generate, analyze. But the moment a session ends, everything is gone. We'd solved routing with NEXUS. Now we needed to solve forgetting.</p>

            <p>February 2025 was the month we built BRAIN, and it nearly broke us.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">Why Context Windows Aren't Memory</h2>
            <p>The industry's answer to memory was "bigger context windows." 128K tokens. 200K. A million. But cramming everything into a single prompt isn't memory — it's a pile. There's no prioritization, no decay, no consolidation. It's expensive, slow, and it still resets when the conversation ends.</p>

            <p>Real memory needs tiers. Some things should be instantly available. Some should be archived but retrievable. Some should fade unless reinforced. We modeled BRAIN after how biological memory actually works.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">Three Tiers</h2>
            <p><strong>Hot memory</strong> — the current context. What's happening right now. Fast, small, expensive to maintain. This is your working memory: the active conversation, the current task, the immediate state.</p>

            <p><strong>Warm memory</strong> — recent history. Conversations from the last few hours or days. Indexed, searchable, retrieved on demand. This is where patterns start to form — recurring topics, user preferences, decision history.</p>

            <p><strong>Cold memory</strong> — the archive. Everything that's ever happened, compressed and stored. Slow to access but permanent. This is where long-term learning lives — the accumulated experience that makes an agent smarter over months, not minutes.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">The Hard Part: Knowing What to Remember</h2>
            <p>Storage is easy. Retrieval is hard. The real challenge wasn't "where do we put this" but "when do we surface it." BRAIN needed to know that a user's preference from three weeks ago was relevant to today's request — without being told to look.</p>

            <p>We built a relevance scorer that weighs recency, frequency, and semantic similarity. It's not perfect. Some memories surface when they shouldn't. Others stay buried when they're needed. But it's dramatically better than starting from zero every time.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">The Result</h2>
            <p>By the end of February, agents running on BRAIN could remember conversations from weeks ago, recall user preferences without being reminded, and build on previous interactions instead of repeating them. It wasn't human-level memory. But it was real persistence, and it changed what was possible.</p>

            <p>BRAIN also exposed something we hadn't anticipated: once agents could remember, they needed to be secured differently. Memory is a liability if the wrong person can access it. That realization led directly to the next node we built.</p>
          </div>
        </article>
      </main>
      <EnhancedFooter />
    </>
  );
}
