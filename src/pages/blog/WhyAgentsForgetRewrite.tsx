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
    <BlogArticleLayout slug={SLUG} title="Why Agents Forget" subtitle="Context loss is the silent killer of AI agents" date="June 8, 2025" readTime="11 min read" heroImage={heroImg} heroAlt="Agent memory fading over time" chapter={10} showRewrittenNotice={false} head={<><SEO title="Why Agents Forget — The Memory Problem" description="Context loss is the silent killer of AI agents. Here's why it happens, what the industry gets wrong about it, and what we've learned building persistent memory." type="article" image={heroImg} publishedTime="2025-06-08" keywords={["agent memory loss", "AI context degradation", "why agents forget", "persistent memory challenges"]} canonical={`https://cmpsbl.com/blog/${SLUG}`} topicCluster="substrate-cognition" breadcrumbs={[{ name: "Home", url: "https://cmpsbl.com" }, { name: "Blog", url: "https://cmpsbl.com/blog" }, { name: "Why Agents Forget", url: `https://cmpsbl.com/blog/${SLUG}` }]} /><BlogArticleJsonLd title="Why Agents Forget — The Memory Problem" description="Why AI agents lose context and what actually works for persistent memory." slug={SLUG} datePublished="2025-06-08" imageUrl={heroImg} keywords={["agent memory", "context loss", "persistent memory"]} /></>}>
      <p className="text-lg leading-relaxed">By June, developers were building agents on our <Link to="/blog/teaching-machines-to-remember" className="text-primary hover:underline">memory layer</Link> and hitting the same problems we'd struggled with internally. Agents that worked perfectly in testing forgot everything in production.</p>

      <h2 className="text-2xl font-bold text-foreground mt-8">The Context Window Illusion</h2>
      <p>The biggest misconception: larger context windows solve memory. They don't. A 200K token context window is like a desk piled with every document you've ever touched. In practice, most models start degrading around 30-40K tokens — the <a href="https://arxiv.org/abs/2307.03109" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">"lost in the middle"</a> phenomenon is real and well-documented.</p>

      <figure className="my-8">
        <img src={imgAntiPatterns} alt="Common memory anti-patterns — stuffing context windows, flat retrieval, no decay management" className="w-full rounded-xl aspect-video object-cover" loading="lazy" />
        <figcaption className="text-sm text-muted-foreground/70 mt-2 text-center">The three most common memory anti-patterns that cause agents to fail in production.</figcaption>
      </figure>

      <h2 className="text-2xl font-bold text-foreground mt-8">Why RAG Isn't Enough</h2>
      <p><a href="https://en.wikipedia.org/wiki/Retrieval-augmented_generation" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Retrieval-Augmented Generation</a> was supposed to fix this. And it works — for the first ten thousand memories. Beyond that, retrieval quality degrades. <a href="https://en.wikipedia.org/wiki/Cosine_similarity" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Embedding similarity</a> becomes less reliable at scale.</p>

      <h2 className="text-2xl font-bold text-foreground mt-8">What Actually Works</h2>
      <p><strong>Tiered decay.</strong> Active reinforcement should persist. Unreferenced memories should compress. This mirrors <a href="https://en.wikipedia.org/wiki/Atkinson%E2%80%93Shiffrin_memory_model" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">biological memory</a> and dramatically improves retrieval quality.</p>

      <p><strong>Structured indexing.</strong> Don't just embed everything. Tag memories with metadata: who, when, why, what changed. Retrieve by structure first, semantic similarity second.</p>

      <figure className="my-8">
        <img src={imgCrystallization} alt="Memory crystallization — converting raw interactions into structured, retrievable knowledge" className="w-full rounded-xl aspect-video object-cover" loading="lazy" />
        <figcaption className="text-sm text-muted-foreground/70 mt-2 text-center">Memory crystallization: transforming raw interaction data into structured, retrievable knowledge.</figcaption>
      </figure>

      <p><strong>Consolidation cycles.</strong> Periodically merge similar memories into summarized representations. This is exactly what <Link to="/blog/what-if-software-could-dream" className="text-primary hover:underline">DREAM</Link> does during off-peak hours.</p>

      <p>These aren't revolutionary insights. They're engineering discipline. For the patterns that build on top of these fundamentals, see <Link to="/blog/agents-that-actually-learn" className="text-primary hover:underline">Agents That Actually Learn</Link>.</p>
    </BlogArticleLayout>
  );
}
