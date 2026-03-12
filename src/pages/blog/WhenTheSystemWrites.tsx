/**
 * Chapter 36: When the System Writes About Itself — February 2026
 */
import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { BlogArticleJsonLd } from "@/components/blog/BlogArticleJsonLd";
import { BlogArticleLayout } from "@/components/blog/BlogArticleLayout";
import heroImg from "@/assets/blog/cascade-ai-adaptive-brain.jpg";

const SLUG = "when-the-system-writes";

export default function WhenTheSystemWrites() {
  return (
    <BlogArticleLayout slug={SLUG} title="When the System Writes About Itself" subtitle="The auto-blog — AI that documents its own evolution" date="February 5, 2026" readTime="14 min read" heroImage={heroImg} heroAlt="The substrate writing about itself" chapter={36} head={<><SEO title="When the System Writes About Itself" description="The substrate's auto-blog generates, reviews, and publishes its own content. A meta-chapter about AI that documents its own evolution." type="article" image={heroImg} publishedTime="2026-02-05" keywords={["auto-blog AI", "self-documenting systems", "CLM"]} canonical={`https://cmpsbl.com/blog/${SLUG}`} topicCluster="substrate-meta" breadcrumbs={[{ name: "Home", url: "https://cmpsbl.com" }, { name: "Blog", url: "https://cmpsbl.com/blog" }, { name: "When the System Writes About Itself", url: `https://cmpsbl.com/blog/${SLUG}` }]} /><BlogArticleJsonLd title="When the System Writes About Itself" description="AI that documents its own evolution." slug={SLUG} datePublished="2026-02-05" imageUrl={heroImg} keywords={["auto-blog", "CLM", "self-documenting"]} /></>}>
      <p className="text-lg leading-relaxed">You've probably noticed the "AI Generated" posts in the blog feed. Those aren't written by a separate content tool — they're written by the substrate itself, using the same nodes that power everything else.</p>
      <p>The auto-blog started as an internal experiment. We were generating so many <Link to="/blog/the-memory-stream" className="text-primary hover:underline">Memory Stream</Link> signals about system behavior that we thought: what if we turned these signals into readable content? Not marketing copy — genuine technical observations about how the substrate was performing, what patterns were emerging, and what the data was showing. The experiment worked well enough that we made it public.</p>

      <h2 className="text-2xl font-bold text-foreground mt-8">Constant Learning Mode</h2>
      <p>CLM is the substrate's always-on learning process. It monitors system changes, tracks capability evolution, and identifies topics worth documenting. When it finds something worth writing about, it drafts a post using <Link to="/blog/when-one-model-isnt-enough" className="text-primary hover:underline">CASCADE</Link> for multi-stage writing, <Link to="/blog/trust-but-verify" className="text-primary hover:underline">PROOF</Link> for fact-checking, and <Link to="/blog/teaching-machines-to-remember" className="text-primary hover:underline">BRAIN</Link> for contextual consistency.</p>
      <p>The topic identification algorithm is worth explaining. CLM monitors three signal sources: system metrics (performance changes, new capability deployments), user behavior (trending queries, emerging use patterns), and external context (industry developments, competitor movements). When multiple signals converge on a topic — say, a new node deployment coincides with increased API traffic in a specific domain — CLM flags it as worth writing about. The algorithm produces about 15 topic candidates per week. After quality filtering, 2-4 get published.</p>

      <h2 className="text-2xl font-bold text-foreground mt-8">Quality Process</h2>
      <p>Every auto-generated post goes through a quality process: semantic drift detection (is it staying on topic?), contradiction scoring (does it conflict with previous posts?), confidence scoring (how certain is the content?), and split-brain review (two independent evaluations that must agree). Posts below quality threshold don't publish.</p>
      <p>The split-brain review is our most interesting quality mechanism. Two independent evaluation passes run on every draft — one optimizing for reader engagement ("would someone want to read this?") and one optimizing for technical accuracy ("is every claim verifiable?"). Both must score above threshold for the post to publish. This dual evaluation catches posts that are engaging but inaccurate (dangerous) and posts that are accurate but unreadable (wasteful). The disagreement rate between the two evaluators is about 23% — when they disagree, the post goes to a human editor for resolution.</p>

      <h2 className="text-2xl font-bold text-foreground mt-8">The Assumption Tracker</h2>
      <p>Every auto-blog post contains implicit assumptions about the substrate's capabilities and the industry landscape. CLM extracts these assumptions and tracks them over time. When a later post contradicts an earlier assumption, the system flags it — not as an error, but as evidence of evolution. "In March we assumed single-model routing was sufficient. By September, multi-model pipelines proved more effective." This assumption tracking creates an honest record of how our understanding evolved, and it prevents the system from making claims that its own history contradicts.</p>

      <h2 className="text-2xl font-bold text-foreground mt-8">The Meta Problem</h2>
      <p>There's something genuinely strange about a system that documents its own capabilities. The auto-blog posts are both content and proof of concept. "Here's an article about how our AI writes articles" — and the article itself demonstrates the claim. We're honest about this: the AI-generated posts are clearly labeled, and this chapter explains exactly how they work.</p>
      <p>The auto-blog isn't trying to replace human writing. The 40-chapter Origin Story you're reading was written by the team. The AI-generated posts are supplementary — deeper dives, technical explorations, and updates that the substrate identifies as valuable. Both sources feed the <Link to="/blog/the-memory-stream" className="text-primary hover:underline">Memory Stream</Link>. Together, they create a richer picture of the substrate's evolution than either source could provide alone.</p>
    </BlogArticleLayout>
  );
}
