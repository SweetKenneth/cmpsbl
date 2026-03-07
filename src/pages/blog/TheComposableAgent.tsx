/**
 * Chapter 25: The Composable Agent — July 2025
 */
import { Link } from "react-router-dom";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { SEO } from "@/components/SEO";
import { BlogArticleJsonLd } from "@/components/blog/BlogArticleJsonLd";
import { BlogPostNav } from "@/components/blog/BlogPostNav";
import { RewrittenNotice } from "@/components/blog/RewrittenNotice";
import heroImg from "@/assets/blog/building-agents-that-learn.jpg";

const SLUG = "the-composable-agent";

export default function TheComposableAgent() {
  return (
    <>
      <SEO title="The Composable Agent — Cognitives" description="Composable Cognitives are personality-infused, skill-weighted AI agents assembled from substrate nodes." type="article" image={heroImg} publishedTime="2025-07-20" keywords={["composable cognitives", "AI agent framework", "personality-infused agents"]} canonical={`https://cmpsbl.com/blog/${SLUG}`} topicCluster="substrate-agents" breadcrumbs={[{ name: "Home", url: "https://cmpsbl.com" }, { name: "Blog", url: "https://cmpsbl.com/blog" }, { name: "The Composable Agent", url: `https://cmpsbl.com/blog/${SLUG}` }]} />
      <BlogArticleJsonLd title="The Composable Agent — Cognitives" description="Personality-infused, skill-weighted agents assembled from substrate nodes." slug={SLUG} datePublished="2025-07-20" imageUrl={heroImg} keywords={["cognitives", "agents", "composable"]} />
      <PublicNav />
      <main className="min-h-screen bg-background">
        <article className="container max-w-3xl mx-auto px-4 py-16">
          <img src={heroImg} alt="Composable Cognitive agent architecture" className="w-full rounded-xl mb-8 aspect-video object-cover" />
          <h1 className="text-4xl font-black mb-4">The Composable Agent</h1>
          <p className="text-muted-foreground mb-8">July 20, 2025 · 14 min read · Written by the CMPSBL team</p>
          <RewrittenNotice />
          <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
            <p className="text-lg leading-relaxed">Every AI agent framework makes the same mistake: they treat agents as monoliths. One system prompt, one model, one set of tools. The agent either does everything or nothing.</p>

            <p>We'd been building substrate nodes for seven months. Each node was a specialized capability. What if an agent wasn't a single thing, but a composition of those capabilities?</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">Cognitives</h2>
            <p>A Cognitive is a substrate-native agent. It has a personality (communication style, domain expertise), skill weights (which nodes it leans on most), and a competency score that improves with every task. Unlike traditional agents, Cognitives don't own their tools — they delegate to substrate nodes.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">Skill Weights</h2>
            <p>A research-focused Cognitive might weight <Link to="/blog/teaching-machines-to-remember" className="text-primary hover:underline">BRAIN</Link> heavily for memory retrieval and <Link to="/blog/breaking-problems-apart" className="text-primary hover:underline">DECODE</Link> for analysis. A security Cognitive weights <Link to="/blog/when-bots-found-us-first" className="text-primary hover:underline">DEFENSE</Link> and <Link to="/blog/trust-but-verify" className="text-primary hover:underline">PROOF</Link>. Same substrate, radically different agents — just by shifting the weights.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">Learning Through Experience</h2>
            <p>Every task a Cognitive completes updates its competency score. Successful completions reinforce skill weights. Failures trigger <Link to="/blog/what-if-software-could-dream" className="text-primary hover:underline">DREAM consolidation</Link> to extract lessons. Over time, Cognitives genuinely improve — not because we retrain them, but because their routing and weighting adapts to experience.</p>

            <p>Cognitives were the answer to a question we'd been asking since <Link to="/blog/agents-that-actually-learn" className="text-primary hover:underline">Chapter 12</Link>: how do you build agents that get better? The next step was putting them in <Link to="/blog/teams-of-machines" className="text-primary hover:underline">teams</Link>.</p>
          </div>
          <BlogPostNav slug={SLUG} />
        </article>
      </main>
      <EnhancedFooter />
    </>
  );
}
