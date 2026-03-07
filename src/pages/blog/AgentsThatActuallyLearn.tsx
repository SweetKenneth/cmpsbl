/**
 * Chapter 12: Agents That Actually Learn — July 2025
 */
import { Link } from "react-router-dom";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { SEO } from "@/components/SEO";
import { BlogArticleJsonLd } from "@/components/blog/BlogArticleJsonLd";
import { BlogPostNav } from "@/components/blog/BlogPostNav";
import heroImg from "@/assets/blog/building-agents-that-learn.jpg";

const SLUG = "agents-that-actually-learn";

export default function AgentsThatActuallyLearn() {
  return (
    <>
      <SEO title="Agents That Actually Learn — Patterns That Work" description="After months of building learning agents, these are the architectural patterns that actually improve agent performance over time." type="article" publishedTime="2025-07-12" keywords={["learning AI agents", "agent improvement patterns", "experience-based learning", "agent competency"]} canonical={`https://cmpsbl.com/blog/${SLUG}`} topicCluster="substrate-cognition" breadcrumbs={[{ name: "Home", url: "https://cmpsbl.com" }, { name: "Blog", url: "https://cmpsbl.com/blog" }, { name: "Agents That Actually Learn", url: `https://cmpsbl.com/blog/${SLUG}` }]} />
      <BlogArticleJsonLd title="Agents That Actually Learn — Patterns That Work" description="Architectural patterns that actually improve agent performance." slug={SLUG} datePublished="2025-07-12" imageUrl={heroImg} keywords={["learning agents", "competency scoring", "experience replay"]} />
      <PublicNav />
      <main className="min-h-screen bg-background">
        <article className="container max-w-3xl mx-auto px-4 py-16">
          <img src={heroImg} alt="Agents learning from experience" className="w-full rounded-xl mb-8 aspect-video object-cover" />
          <h1 className="text-4xl font-black mb-4">Agents That Actually Learn</h1>
          <p className="text-muted-foreground mb-8">July 12, 2025 · 15 min read · Written by the CMPSBL team</p>
          <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
            <p className="text-lg leading-relaxed">Everyone wants agents that learn. Few achieve it. After seven months of building on the substrate, we've seen patterns that work. Here's what separates agents that actually improve from agents that just accumulate data.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">Pattern 1: Feedback Loops, Not Fine-Tuning</h2>
            <p>The instinct is to <a href="https://en.wikipedia.org/wiki/Fine-tuning_(deep_learning)" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">fine-tune</a> models on past interactions. In practice, this is expensive and often counterproductive. What works better: storing successful interaction patterns in <Link to="/blog/teaching-machines-to-remember" className="text-primary hover:underline">BRAIN</Link> and retrieving them as <a href="https://arxiv.org/abs/2005.14165" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">few-shot examples</a> for similar future requests.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">Pattern 2: Competency Scoring</h2>
            <p>Track what your agent is good at and bad at. We introduced competency scores — per-task-type success rates. When competency drops below threshold, escalate to a more capable model via <Link to="/blog/routing-the-unknown" className="text-primary hover:underline">NEXUS</Link>. When competency is high, use cheaper, faster models.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">Pattern 3: Experience Replay</h2>
            <p>Borrowed from <a href="https://en.wikipedia.org/wiki/Experience_replay" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">reinforcement learning</a>. During <Link to="/blog/what-if-software-could-dream" className="text-primary hover:underline">DREAM cycles</Link>, the substrate replays successful interactions and extracts generalizable heuristics. Not "what happened" but "why it worked."</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">Pattern 4: Graceful Forgetting</h2>
            <p>Counterintuitively, agents that forget strategically outperform agents that remember everything. As we explored in <Link to="/blog/why-agents-forget" className="text-primary hover:underline">Why Agents Forget</Link>, outdated information causes errors. Intentional memory pruning keeps retrieval quality high.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">The Compound Effect</h2>
            <p>Combined, these patterns create agents that measurably improve week over week. Our benchmarks show 12-18% improvement in task success rate over 90 days. That's not AGI. It's engineering. And it's what <Link to="/blog/when-software-starts-evolving" className="text-primary hover:underline">EVOLUTION</Link> later automated at the substrate level.</p>
          </div>
          <BlogPostNav slug={SLUG} />
        </article>
      </main>
      <EnhancedFooter />
    </>
  );
}
