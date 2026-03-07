/**
 * Chapter 10: Why Agents Forget — June 2025
 * The memory degradation problem, explained honestly.
 */
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { SEO } from "@/components/SEO";
import heroImg from "@/assets/blog/why-agents-forget.jpg";

export default function WhyAgentsForgetRewrite() {
  return (
    <>
      <SEO
        title="Why Agents Forget — The Memory Problem"
        description="Context loss is the silent killer of AI agents. Here's why it happens, what the industry gets wrong about it, and what we've learned building persistent memory."
        type="article"
        publishedTime="2025-06-08"
        keywords={['agent memory loss', 'AI context degradation', 'why agents forget', 'persistent memory challenges', 'memory architecture problems']}
      />
      <PublicNav />
      <main className="min-h-screen bg-background">
        <article className="container max-w-3xl mx-auto px-4 py-16">
          <img src={heroImg} alt="Agent memory fading over time" className="w-full rounded-xl mb-8 aspect-video object-cover" />
          <h1 className="text-4xl font-black mb-4">Why Agents Forget</h1>
          <p className="text-muted-foreground mb-8">June 8, 2025 · 11 min read · Written by the CMPSBL team</p>
          <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
            <p className="text-lg leading-relaxed">By June, developers were building agents on our memory layer and hitting the same problems we'd struggled with internally. Agents that worked perfectly in testing forgot everything in production. Not because the memory was gone — but because retrieving the right memory at the right time is brutally hard.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">The Context Window Illusion</h2>
            <p>The biggest misconception: larger context windows solve memory. They don't. A 200K token context window is like a desk piled with every document you've ever touched. The information is there, but finding it requires reading through everything. Models lose coherence long before they run out of space.</p>

            <p>In practice, most models start degrading in quality around 30-40K tokens regardless of their stated limit. The "lost in the middle" phenomenon — where models attend strongly to the beginning and end of context but neglect the middle — is real and well-documented.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">Why RAG Isn't Enough</h2>
            <p>Retrieval-Augmented Generation was supposed to fix this. Store memories externally, retrieve relevant ones, inject them into the prompt. And it works — for the first ten thousand memories. Beyond that, retrieval quality degrades. Embedding similarity becomes less reliable at scale. False positives increase. Relevant memories get buried under slightly-more-recent but less-relevant results.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">What Actually Works</h2>
            <p>After six months of building memory systems, here's what we've learned:</p>

            <p><strong>Tiered decay.</strong> Not all memories are equal. Active reinforcement (memories that keep getting accessed) should persist. Unreferenced memories should compress and eventually archive. This mirrors biological memory and dramatically improves retrieval quality.</p>

            <p><strong>Structured indexing.</strong> Don't just embed everything. Tag memories with metadata: who, when, why, what changed. Then retrieve by structure first, semantic similarity second.</p>

            <p><strong>Consolidation cycles.</strong> Periodically merge similar memories into summarized representations. Ten separate interactions about a user's preference become one consolidated memory with higher confidence.</p>

            <p>These aren't revolutionary insights. They're engineering discipline applied to a problem the industry keeps trying to solve with bigger numbers.</p>
          </div>
        </article>
      </main>
      <EnhancedFooter />
    </>
  );
}
