/**
 * Chapter 12: Agents That Actually Learn — July 2025
 */
import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { BlogArticleJsonLd } from "@/components/blog/BlogArticleJsonLd";
import { BlogArticleLayout } from "@/components/blog/BlogArticleLayout";
import heroImg from "@/assets/blog/building-agents-that-learn.jpg";
import imgAdaptive from "@/assets/blog/brain-adaptive-learning.jpg";

const SLUG = "agents-that-actually-learn";

export default function AgentsThatActuallyLearn() {
  return (
    <BlogArticleLayout slug={SLUG} title="Agents That Actually Learn" subtitle="Patterns that genuinely improve agent performance over time" date="July 12, 2025" readTime="15 min read" heroImage={heroImg} heroAlt="Agents learning from experience" chapter={12} showRewrittenNotice={false} head={<><SEO title="Agents That Actually Learn — Patterns That Work" description="After months of building learning agents, these are the architectural patterns that actually improve agent performance over time." type="article" image={heroImg} publishedTime="2025-07-12" keywords={["learning AI agents", "agent improvement patterns", "experience-based learning", "agent competency"]} canonical={`https://cmpsbl.com/blog/${SLUG}`} topicCluster="substrate-cognition" breadcrumbs={[{ name: "Home", url: "https://cmpsbl.com" }, { name: "Blog", url: "https://cmpsbl.com/blog" }, { name: "Agents That Actually Learn", url: `https://cmpsbl.com/blog/${SLUG}` }]} /><BlogArticleJsonLd title="Agents That Actually Learn — Patterns That Work" description="Architectural patterns that actually improve agent performance." slug={SLUG} datePublished="2025-07-12" imageUrl={heroImg} keywords={["learning agents", "competency scoring", "experience replay"]} /></>}>
      <p className="text-sm sm:text-base leading-relaxed">Everyone wants agents that learn. Few achieve it. After seven months of building on the substrate, we've seen hundreds of agents deployed by customers and partners. Most don't improve over time — they just accumulate data. Here's what separates agents that actually get better from agents that just get bigger.</p>

      <h2 className="text-2xl font-bold text-foreground mt-8">Pattern 1: Feedback Loops, Not Fine-Tuning</h2>
      <p>The instinct is to <a href="https://en.wikipedia.org/wiki/Fine-tuning_(deep_learning)" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">fine-tune</a> models on past interactions. In practice, this is expensive ($500-5,000 per fine-tuning run), slow (hours to days), and often counterproductive — fine-tuned models can lose generalization on tasks outside the training distribution.</p>
      <p>What works better: storing successful interaction patterns in <Link to="/blog/teaching-machines-to-remember" className="text-primary hover:underline">BRAIN</Link> and retrieving them as <a href="https://arxiv.org/abs/2005.14165" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">few-shot examples</a> for similar future requests. The model stays general; the memory provides specialization. When a customer support agent successfully resolves a billing dispute, that interaction pattern is stored and retrieved when a similar dispute appears. The agent doesn't "learn" billing — it remembers how it succeeded before.</p>
      <p>The key subtlety: you need to store the interaction at the right level of abstraction. Too specific ("user John asked about invoice #4567") and it won't generalize. Too abstract ("user asked about billing") and it loses useful detail. We found that storing the strategy ("acknowledge frustration → reference specific charge → offer resolution options → confirm satisfaction") works best — abstract enough to generalize, specific enough to be actionable.</p>

      <h2 className="text-2xl font-bold text-foreground mt-8">Pattern 2: Competency Scoring</h2>
      <p>Track what your agent is good at and bad at. We introduced competency scores — per-task-type success rates tracked over rolling 30-day windows. When competency drops below threshold, escalate to a more capable model via <Link to="/blog/routing-the-unknown" className="text-primary hover:underline">NEXUS</Link>. When competency is high, use cheaper, faster models. This creates a natural optimization loop: the system spends premium model costs only where they're needed.</p>
      <p>Competency scoring also reveals capability gaps. If an agent consistently scores below 60% on a specific task type, that's a signal that the task needs better prompt engineering, additional memory context, or perhaps a different architectural approach entirely. Without scoring, you'd never know — the agent would silently underperform and nobody would notice until a customer complained.</p>

      <figure className="my-8">
        <img src={imgAdaptive} alt="Adaptive learning feedback loop — competency scoring driving model selection and memory retrieval" className="w-full rounded-xl aspect-video object-cover" loading="lazy" />
        <figcaption className="text-sm text-muted-foreground/70 mt-2 text-center">The adaptive learning loop: competency scores drive model selection, memory retrieval, and escalation decisions.</figcaption>
      </figure>

      <h2 className="text-2xl font-bold text-foreground mt-8">Pattern 3: Experience Replay</h2>
      <p>Borrowed from <a href="https://en.wikipedia.org/wiki/Experience_replay" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">reinforcement learning</a>. During <Link to="/blog/what-if-software-could-dream" className="text-primary hover:underline">DREAM cycles</Link>, the substrate replays successful interactions and extracts generalizable heuristics. Not "what happened" but "why it worked."</p>
      <p>The extraction process is surprisingly effective. Given a successful customer support interaction, DREAM identifies the structural pattern: greeting → problem identification → empathy statement → solution proposal → confirmation. Given a successful code review, DREAM identifies: scope assessment → critical path analysis → specific suggestions → alternative approaches. These patterns, once extracted, become reusable templates that improve performance on novel tasks that share structural similarity.</p>

      <h2 className="text-2xl font-bold text-foreground mt-8">Pattern 4: Graceful Forgetting</h2>
      <p>Counterintuitively, agents that forget strategically outperform agents that remember everything. As we explored in <Link to="/blog/why-agents-forget" className="text-primary hover:underline">Why Agents Forget</Link>, outdated information doesn't just waste storage — it actively degrades performance. A memory from three months ago about pricing that has since changed will cause the agent to give wrong information with high confidence.</p>
      <p>Intentional memory pruning keeps retrieval quality high. We implement this through decay functions that reduce memory relevance over time unless reinforced by access. Memories that are retrieved and useful get reinforced. Memories that are never retrieved decay and eventually archive. This mirrors the biological process that makes human memory adaptive rather than encyclopedic.</p>

      <h2 className="text-2xl font-bold text-foreground mt-8">The Compound Effect</h2>
      <p>Combined, these patterns create agents that measurably improve week over week. Our benchmarks show 12-18% improvement in task success rate over 90 days. That's not AGI. It's engineering discipline applied to a system that has the infrastructure to support it. Without persistent memory, there's nothing to improve. Without competency scoring, there's no way to measure improvement. Without DREAM, there's no mechanism for improvement.</p>
      <p>These patterns compose — that's the key insight. Feedback loops populate memory. Competency scoring identifies where memory is weak. Experience replay fills the gaps. Graceful forgetting keeps the signal-to-noise ratio high. Each pattern alone provides modest improvement. Together, they create genuine compounding learning. And it's what <Link to="/blog/when-software-starts-evolving" className="text-primary hover:underline">EVOLUTION</Link> later automated at the substrate level — applying these same patterns not to individual agents, but to the infrastructure itself.</p>
    </BlogArticleLayout>
  );
}
