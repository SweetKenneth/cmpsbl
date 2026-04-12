/**
 * Chapter 10: Why Agents Forget — June 2025
 */
import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { BlogArticleJsonLd } from "@/components/blog/BlogArticleJsonLd";
import { BlogArticleLayout } from "@/components/blog/BlogArticleLayout";
import heroImg from "@/assets/blog/why-agents-forget.jpg";
import imgAntiPatterns from "@/assets/blog/agent-memory-anti-patterns.jpg";
import imgCrystallization from "@/assets/blog/memory-stream-crystallization-guide.jpg";

const SLUG = "why-agents-forget";

export default function WhyAgentsForgetRewrite() {
  return (
    <BlogArticleLayout slug={SLUG} title="Why Agents Forget" subtitle="Context loss is the silent killer of AI agents" date="June 8, 2025" readTime="14 min read" heroImage={heroImg} heroAlt="Agent memory fading over time" chapter={10} showRewrittenNotice={false} head={<><SEO title="Why Agents Forget — The Memory Problem" description="Context loss is the silent killer of AI agents. Here's why it happens, what the industry gets wrong about it, and what we've learned building persistent memory." type="article" image={heroImg} publishedTime="2025-06-08" keywords={["agent memory loss", "AI context degradation", "why agents forget", "persistent memory challenges"]} canonical={`https://cmpsbl.com/blog/${SLUG}`} topicCluster="substrate-cognition" breadcrumbs={[{ name: "Home", url: "https://cmpsbl.com" }, { name: "Blog", url: "https://cmpsbl.com/blog" }, { name: "Why Agents Forget", url: `https://cmpsbl.com/blog/${SLUG}` }]} /><BlogArticleJsonLd title="Why Agents Forget — The Memory Problem" description="Why AI agents lose context and what actually works for persistent memory." slug={SLUG} datePublished="2025-06-08" imageUrl={heroImg} keywords={["agent memory", "context loss", "persistent memory"]} /></>}>
      <p className="text-sm sm:text-base leading-relaxed">By June, developers were building agents on our <Link to="/blog/teaching-machines-to-remember" className="text-primary hover:underline">memory layer</Link> and hitting the same problems we'd struggled with internally. Agents that worked perfectly in testing forgot everything in production. The pattern was always the same: works great with 50 test interactions, falls apart at 5,000 real ones.</p>

      <h2 className="text-2xl font-bold text-foreground mt-8">The Context Window Illusion</h2>
      <p>The biggest misconception: larger context windows solve memory. They don't. A 200K token context window is like a desk piled with every document you've ever touched. In practice, most models start degrading around 30-40K tokens — the <a href="https://arxiv.org/abs/2307.03109" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">"lost in the middle"</a> phenomenon is real and well-documented.</p>
      <p>We ran our own benchmarks. A GPT-4 class model answering questions about a contract performed at 94% accuracy with the relevant clause in the first 2K tokens. Move the clause to position 15K in a 30K context? Accuracy dropped to 71%. Position 80K in a 100K context? 58%. The context window is technically available, but the model's attention isn't uniformly distributed across it. The beginning and end get disproportionate attention; the middle gets lost.</p>

      <figure className="my-8">
        <img src={imgAntiPatterns} alt="Common memory anti-patterns — stuffing context windows, flat retrieval, no decay management" className="w-full rounded-xl aspect-video object-cover" loading="lazy" />
        <figcaption className="text-sm text-muted-foreground/70 mt-2 text-center">The three most common memory anti-patterns that cause agents to fail in production.</figcaption>
      </figure>

      <h2 className="text-2xl font-bold text-foreground mt-8">Why RAG Isn't Enough</h2>
      <p><a href="https://en.wikipedia.org/wiki/Retrieval-augmented_generation" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Retrieval-Augmented Generation</a> was supposed to fix this. And it works — for the first ten thousand memories. Beyond that, retrieval quality degrades. <a href="https://en.wikipedia.org/wiki/Cosine_similarity" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Embedding similarity</a> becomes less reliable at scale because the embedding space gets crowded. Two semantically different memories can have nearly identical embeddings when the corpus is large enough.</p>
      <p>We saw this with a customer building a legal research agent. At 1,000 case summaries, retrieval was excellent — the right case came back 92% of the time. At 50,000 case summaries, that dropped to 67%. The embeddings were still working correctly; the problem was that legal cases share so much structural vocabulary that similarity scores clustered tightly, making discrimination unreliable. RAG alone couldn't solve this — the system needed structured metadata (jurisdiction, year, topic) to narrow the search space before embedding similarity kicked in.</p>

      <h2 className="text-2xl font-bold text-foreground mt-8">What Actually Works</h2>
      <p><strong>Tiered decay.</strong> Active reinforcement should persist. Unreferenced memories should compress. This mirrors <a href="https://en.wikipedia.org/wiki/Atkinson%E2%80%93Shiffrin_memory_model" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">biological memory</a> and dramatically improves retrieval quality. We implemented exponential decay with a configurable half-life — memories lose relevance weight over time unless they're accessed, in which case the clock resets. A memory accessed daily stays hot forever. A memory never accessed again decays to cold tier in about two weeks.</p>

      <p><strong>Structured indexing.</strong> Don't just embed everything. Tag memories with metadata: who, when, why, what changed. Retrieve by structure first, semantic similarity second. This two-phase retrieval pattern consistently outperforms pure vector search. The legal research agent's accuracy went from 67% back to 89% after adding jurisdiction and topic metadata filters before the similarity search.</p>

      <figure className="my-8">
        <img src={imgCrystallization} alt="Memory crystallization — converting raw interactions into structured, retrievable knowledge" className="w-full rounded-xl aspect-video object-cover" loading="lazy" />
        <figcaption className="text-sm text-muted-foreground/70 mt-2 text-center">Memory crystallization: transforming raw interaction data into structured, retrievable knowledge.</figcaption>
      </figure>

      <p><strong>Consolidation cycles.</strong> Periodically merge similar memories into summarized representations. This is exactly what <Link to="/blog/what-if-software-could-dream" className="text-primary hover:underline">DREAM</Link> does during off-peak hours. Five separate conversations about a user's project deadline get consolidated into one summary: "User is working on Project Atlas, deadline March 15, primary concern is API integration, prefers Python examples." That single consolidated memory is more useful than five raw transcripts.</p>

      <p><strong>Forgetting as a feature.</strong> Counter-intuitively, agents need to forget. Outdated information is worse than no information — it leads to confident wrong answers. A memory that says "user's email is john@oldcompany.com" from six months ago will cause the agent to use the wrong email with full confidence. Intentional expiration of certain memory types (contact info, pricing, project status) prevents this class of errors entirely.</p>

      <p>These aren't revolutionary insights. They're engineering discipline. For the patterns that build on top of these fundamentals, see <Link to="/blog/agents-that-actually-learn" className="text-primary hover:underline">Agents That Actually Learn</Link>.</p>
    </BlogArticleLayout>
  );
}
