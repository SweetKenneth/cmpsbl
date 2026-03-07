/**
 * Chapter 35: Gaming the Substrate — January 2026
 */
import { Link } from "react-router-dom";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { SEO } from "@/components/SEO";
import { BlogArticleJsonLd } from "@/components/blog/BlogArticleJsonLd";
import { BlogPostNav } from "@/components/blog/BlogPostNav";
import { RewrittenNotice } from "@/components/blog/RewrittenNotice";
import heroImg from "@/assets/blog/cascade-ai-brain-cycles.jpg";

const SLUG = "gaming-the-substrate";

export default function GamingTheSubstrate() {
  return (
    <>
      <SEO title="Gaming the Substrate" description="Games need real-time AI that remembers, adapts, and creates. The Gaming Substrate applies cognitive infrastructure to interactive entertainment." type="article" image={heroImg} publishedTime="2026-01-30" keywords={["gaming AI", "gaming substrate", "adaptive game AI"]} canonical={`https://cmpsbl.com/blog/${SLUG}`} topicCluster="substrate-verticals" breadcrumbs={[{ name: "Home", url: "https://cmpsbl.com" }, { name: "Blog", url: "https://cmpsbl.com/blog" }, { name: "Gaming the Substrate", url: `https://cmpsbl.com/blog/${SLUG}` }]} />
      <BlogArticleJsonLd title="Gaming the Substrate" description="Cognitive infrastructure for interactive entertainment." slug={SLUG} datePublished="2026-01-30" imageUrl={heroImg} keywords={["gaming", "AI", "adaptive"]} />
      <PublicNav />
      <main className="min-h-screen bg-background">
        <article className="container max-w-3xl mx-auto px-4 py-16">
          <img src={heroImg} alt="Gaming substrate — adaptive AI for games" className="w-full rounded-xl mb-8 aspect-video object-cover" />
          <h1 className="text-4xl font-black mb-4">Gaming the Substrate</h1>
          <p className="text-muted-foreground mb-8">January 30, 2026 · 11 min read · Written by the CMPSBL team</p>
          <RewrittenNotice />
          <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
            <p className="text-lg leading-relaxed">A game studio reached out in January. They wanted NPCs that remember player actions, adapt their behavior, and create unique storylines. Traditional game AI couldn't do it. The substrate could — we just hadn't tried.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">The Gaming Stack</h2>
            <p><Link to="/blog/teaching-machines-to-remember" className="text-primary hover:underline">BRAIN</Link> gives NPCs persistent memory. <Link to="/blog/the-composable-agent" className="text-primary hover:underline">Cognitives</Link> give them personality. <Link to="/blog/interfaces-that-think" className="text-primary hover:underline">MORPH</Link> generates dynamic dialogue interfaces. <Link to="/blog/what-if-software-could-dream" className="text-primary hover:underline">DREAM</Link> consolidates player interaction patterns during off-peak hours. The same substrate, applied to a domain we never planned for.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">Real-Time Constraints</h2>
            <p>Games have latency budgets that enterprise software doesn't. An NPC response needs to arrive in under 200ms, not 2 seconds. This forced us to optimize <Link to="/blog/routing-the-unknown" className="text-primary hover:underline">NEXUS routing</Link> for latency-first selection and expand BRAIN's hot memory tier for sub-50ms retrieval.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">Emergent Narratives</h2>
            <p>The unexpected result: stories that no one wrote. When NPCs have real memory and genuine personality, their interactions with players produce narratives that emerge from the system rather than from a script. Players create their own story — the substrate just provides the cognitive infrastructure to make it coherent.</p>

            <p>Gaming validated our architecture in ways enterprise never did. If the substrate can handle real-time, personality-rich, memory-persistent AI for games, it can handle anything.</p>
          </div>
          <BlogPostNav slug={SLUG} />
        </article>
      </main>
      <EnhancedFooter />
    </>
  );
}
