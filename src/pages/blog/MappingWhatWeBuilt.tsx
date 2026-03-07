/**
 * Chapter 24: Mapping What We Built — June 2025
 */
import { Link } from "react-router-dom";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { SEO } from "@/components/SEO";
import { BlogArticleJsonLd } from "@/components/blog/BlogArticleJsonLd";
import { BlogPostNav } from "@/components/blog/BlogPostNav";
import { RewrittenNotice } from "@/components/blog/RewrittenNotice";
import heroImg from "@/assets/blog/promptfluid-ecosystem.jpg";

const SLUG = "mapping-what-we-built";

export default function MappingWhatWeBuilt() {
  return (
    <>
      <SEO title="Mapping What We Built — The ATLAS Node" description="With twelve nodes running, we couldn't remember what called what. ATLAS auto-discovers capabilities and maps dependencies in real time." type="article" image={heroImg} publishedTime="2025-06-14" keywords={["ATLAS node", "capability discovery", "dependency mapping"]} canonical={`https://cmpsbl.com/blog/${SLUG}`} topicCluster="substrate-nodes" breadcrumbs={[{ name: "Home", url: "https://cmpsbl.com" }, { name: "Blog", url: "https://cmpsbl.com/blog" }, { name: "Mapping What We Built", url: `https://cmpsbl.com/blog/${SLUG}` }]} />
      <BlogArticleJsonLd title="Mapping What We Built — The ATLAS Node" description="Auto-discovery and real-time dependency mapping." slug={SLUG} datePublished="2025-06-14" imageUrl={heroImg} keywords={["ATLAS", "capability map", "discovery"]} />
      <PublicNav />
      <main className="min-h-screen bg-background">
        <article className="container max-w-3xl mx-auto px-4 py-16">
          <img src={heroImg} alt="ATLAS mapping the substrate ecosystem" className="w-full rounded-xl mb-8 aspect-video object-cover" />
          <h1 className="text-4xl font-black mb-4">Mapping What We Built</h1>
          <p className="text-muted-foreground mb-8">June 14, 2025 · 10 min read · Written by the CMPSBL team</p>
          <RewrittenNotice />
          <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
            <p className="text-lg leading-relaxed">By June, we had twelve nodes running. New team members would ask "what does this node connect to?" and get different answers from different engineers. Our own architecture had outgrown our understanding of it.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">Auto-Discovery</h2>
            <p>ATLAS doesn't rely on manually maintained documentation. It watches <Link to="/blog/nodes-that-talk" className="text-primary hover:underline">RIPPLE's event bus</Link> and infers capability graphs from actual usage. If NEXUS calls BRAIN 400 times per hour, ATLAS knows that dependency is real — not aspirational.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">The Living Map</h2>
            <p>ATLAS produces a real-time capability map. Every node's health, throughput, latency, and dependency graph — always current, never stale. This map became the foundation for our <Link to="/blog/thirty-eight-nodes-deep" className="text-primary hover:underline">architecture documentation</Link> and the public <a href="https://cmpsbl.com/architecture" className="text-primary hover:underline">architecture page</a>.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">Impact Analysis</h2>
            <p>Before ATLAS, deploying changes was guesswork. "If I update BRAIN's API, what breaks?" ATLAS answers that with certainty — it knows every consumer of every capability. Zero-surprise deployments became possible because we could finally see the blast radius of any change.</p>

            <p>ATLAS was unglamorous infrastructure. Nobody demos a dependency graph to investors. But without it, the substrate would have collapsed under its own complexity long before we reached <Link to="/blog/thirty-eight-nodes-deep" className="text-primary hover:underline">thirty-eight nodes</Link>.</p>
          </div>
          <BlogPostNav slug={SLUG} />
        </article>
      </main>
      <EnhancedFooter />
    </>
  );
}
