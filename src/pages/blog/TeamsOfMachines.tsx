/**
 * Chapter 26: Teams of Machines — August 2025
 */
import { Link } from "react-router-dom";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { SEO } from "@/components/SEO";
import { BlogArticleJsonLd } from "@/components/blog/BlogArticleJsonLd";
import { BlogPostNav } from "@/components/blog/BlogPostNav";
import { RewrittenNotice } from "@/components/blog/RewrittenNotice";
import heroImg from "@/assets/blog/ai-business-operations-2025.jpg";

const SLUG = "teams-of-machines";

export default function TeamsOfMachines() {
  return (
    <>
      <SEO title="Teams of Machines — The Agency System" description="One agent isn't enough for real work. The Agency system orchestrates teams of cognitives with leaders, specialists, and shared learning." type="article" image={heroImg} publishedTime="2025-08-12" keywords={["AI agency system", "multi-agent orchestration", "agent teams"]} canonical={`https://cmpsbl.com/blog/${SLUG}`} topicCluster="substrate-agents" breadcrumbs={[{ name: "Home", url: "https://cmpsbl.com" }, { name: "Blog", url: "https://cmpsbl.com/blog" }, { name: "Teams of Machines", url: `https://cmpsbl.com/blog/${SLUG}` }]} />
      <BlogArticleJsonLd title="Teams of Machines — The Agency System" description="Multi-agent orchestration with leaders, specialists, and shared learning." slug={SLUG} datePublished="2025-08-12" imageUrl={heroImg} keywords={["agency", "multi-agent", "orchestration"]} />
      <PublicNav />
      <main className="min-h-screen bg-background">
        <article className="container max-w-3xl mx-auto px-4 py-16">
          <img src={heroImg} alt="Agency system orchestrating agent teams" className="w-full rounded-xl mb-8 aspect-video object-cover" />
          <h1 className="text-4xl font-black mb-4">Teams of Machines</h1>
          <p className="text-muted-foreground mb-8">August 12, 2025 · 15 min read · Written by the CMPSBL team</p>
          <RewrittenNotice />
          <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
            <p className="text-lg leading-relaxed">A single <Link to="/blog/the-composable-agent" className="text-primary hover:underline">Cognitive</Link> can handle a task. But real business operations aren't single tasks — they're workflows requiring multiple specialists working in coordination.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">The Agency Model</h2>
            <p>An Agency is a team of Cognitives. Every Agency has a leader Cognitive that coordinates work, delegates to specialists, and synthesizes results. A market research Agency might have a web scraper, a data analyst, a report writer, and a quality reviewer — each a Cognitive with different skill weights.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">Shared Learning</h2>
            <p>The breakthrough was shared learning. When one Cognitive in an Agency learns something — a new heuristic, a better approach, a discovered edge case — that knowledge propagates to the whole team through <Link to="/blog/what-if-software-could-dream" className="text-primary hover:underline">DREAM's consolidation</Link>. The team gets collectively smarter, not just individually.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">Economics</h2>
            <p>Every Agency tracks its own economics. Task cost, compute time, ROI per operation. We built the economics layer because we needed to answer a simple question: "Is this Agency saving money compared to doing it manually?" If the answer is no, something is wrong with the configuration.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">Templates</h2>
            <p>Configuring Agencies from scratch is complex. Agency Templates are pre-configured team compositions for common use cases — content creation, market research, security auditing, data enrichment. Deploy a template, customize the specifics, and you have a working AI team in minutes.</p>

            <p>Agencies were where the substrate stopped being infrastructure and started being a product. Not "here are nodes" but "here is a team that does your job." The artifacts those teams produce needed somewhere to go — which led to <Link to="/blog/from-thought-to-artifact" className="text-primary hover:underline">FORGE</Link>.</p>
          </div>
          <BlogPostNav slug={SLUG} />
        </article>
      </main>
      <EnhancedFooter />
    </>
  );
}
