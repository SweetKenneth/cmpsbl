/**
 * Chapter 12: Agents That Actually Learn — July 2025
 * Patterns that work for learning agents.
 */
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { SEO } from "@/components/SEO";
import heroImg from "@/assets/blog/building-agents-that-learn.jpg";

export default function AgentsThatActuallyLearn() {
  return (
    <>
      <SEO
        title="Agents That Actually Learn — Patterns That Work"
        description="After months of building learning agents, these are the architectural patterns that actually improve agent performance over time."
        type="article"
        publishedTime="2025-07-12"
        keywords={['learning AI agents', 'agent improvement patterns', 'AI architecture patterns', 'experience-based learning', 'agent competency']}
      />
      <PublicNav />
      <main className="min-h-screen bg-background">
        <article className="container max-w-3xl mx-auto px-4 py-16">
          <img src={heroImg} alt="Agents learning from experience" className="w-full rounded-xl mb-8 aspect-video object-cover" />
          <h1 className="text-4xl font-black mb-4">Agents That Actually Learn</h1>
          <p className="text-muted-foreground mb-8">July 12, 2025 · 15 min read · Written by the CMPSBL team</p>
          <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
            <p className="text-lg leading-relaxed">Everyone wants agents that learn. Few achieve it. After seven months of building on the substrate, we've seen patterns that work and patterns that waste compute. Here's what separates agents that actually improve from agents that just accumulate data.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">Pattern 1: Feedback Loops, Not Fine-Tuning</h2>
            <p>The instinct is to fine-tune models on past interactions. In practice, this is expensive, slow, and often counterproductive — fine-tuning on a narrow domain degrades general capability. What works better: storing successful interaction patterns in BRAIN and retrieving them as few-shot examples for similar future requests.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">Pattern 2: Competency Scoring</h2>
            <p>Track what your agent is good at and bad at. We introduced competency scores — per-task-type success rates that update after every interaction. When an agent's competency for a task type drops below threshold, it escalates to a more capable model or to a human. When competency is high, it uses cheaper, faster models.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">Pattern 3: Experience Replay</h2>
            <p>Borrowed from reinforcement learning. During DREAM cycles, the substrate replays successful interactions and extracts generalizable heuristics. Not "what happened" but "why it worked." These heuristics get stored as compressed wisdom that improves routing and response quality without increasing context size.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">Pattern 4: Graceful Forgetting</h2>
            <p>Counterintuitively, agents that forget strategically outperform agents that remember everything. Outdated information causes errors. Conflicting memories create confusion. Intentional memory pruning — removing memories that are old, unreinforced, or contradicted by newer data — keeps the knowledge base clean and retrieval quality high.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">The Compound Effect</h2>
            <p>None of these patterns individually creates a breakthrough. Combined, they create agents that measurably improve week over week. Our internal benchmarks show 12-18% improvement in task success rate over a 90-day period using these patterns together.</p>

            <p>That's not AGI. It's engineering. And it works.</p>
          </div>
        </article>
      </main>
      <EnhancedFooter />
    </>
  );
}
