/**
 * Chapter 32: Thirty-Eight Nodes Deep — December 2025
 */
import { Link } from "react-router-dom";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { SEO } from "@/components/SEO";
import { BlogArticleJsonLd } from "@/components/blog/BlogArticleJsonLd";
import { BlogPostNav } from "@/components/blog/BlogPostNav";
import { RewrittenNotice } from "@/components/blog/RewrittenNotice";
import heroImg from "@/assets/blog/what-makes-clockless-different.jpg";

const SLUG = "thirty-eight-nodes-deep";

export default function ThirtyEightNodesDeep() {
  return (
    <>
      <SEO title="Thirty-Eight Nodes Deep — The Complete Architecture" description="From one function to thirty-eight interconnected nodes. A technical map of the complete substrate architecture." type="article" image={heroImg} publishedTime="2025-12-15" keywords={["substrate architecture", "38-node system", "cognitive infrastructure"]} canonical={`https://cmpsbl.com/blog/${SLUG}`} topicCluster="substrate-architecture" breadcrumbs={[{ name: "Home", url: "https://cmpsbl.com" }, { name: "Blog", url: "https://cmpsbl.com/blog" }, { name: "Thirty-Eight Nodes Deep", url: `https://cmpsbl.com/blog/${SLUG}` }]} />
      <BlogArticleJsonLd title="Thirty-Eight Nodes Deep" description="The complete substrate architecture map." slug={SLUG} datePublished="2025-12-15" imageUrl={heroImg} keywords={["architecture", "38 nodes", "substrate"]} />
      <PublicNav />
      <main className="min-h-screen bg-background">
        <article className="container max-w-3xl mx-auto px-4 py-16">
          <img src={heroImg} alt="Complete substrate architecture — 38 nodes" className="w-full rounded-xl mb-8 aspect-video object-cover" />
          <h1 className="text-4xl font-black mb-4">Thirty-Eight Nodes Deep</h1>
          <p className="text-muted-foreground mb-8">December 15, 2025 · 18 min read · Written by the CMPSBL team</p>
          <RewrittenNotice />
          <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
            <p className="text-lg leading-relaxed">Twelve months. From <Link to="/blog/the-first-line-of-code" className="text-primary hover:underline">one function in December 2024</Link> to thirty-eight interconnected nodes by December 2025. This chapter is a map — where every node sits, what it does, and how they connect.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">The Layers</h2>
            <p>The substrate organizes into four layers. <strong>Ingress</strong>: <Link to="/blog/routing-the-unknown" className="text-primary hover:underline">NEXUS</Link>, <Link to="/blog/identity-at-every-layer" className="text-primary hover:underline">ACCESS</Link>, <Link to="/blog/when-bots-found-us-first" className="text-primary hover:underline">DEFENSE</Link>, <Link to="/blog/the-intent-layer" className="text-primary hover:underline">Intent Mesh</Link>. <strong>Processing</strong>: <Link to="/blog/when-one-model-isnt-enough" className="text-primary hover:underline">CASCADE</Link>, <Link to="/blog/breaking-problems-apart" className="text-primary hover:underline">DECODE</Link>, <Link to="/blog/trust-but-verify" className="text-primary hover:underline">PROOF</Link>, <Link to="/blog/teaching-machines-to-remember" className="text-primary hover:underline">BRAIN</Link>. <strong>Output</strong>: <Link to="/blog/from-thought-to-artifact" className="text-primary hover:underline">FORGE</Link>, <Link to="/blog/interfaces-that-think" className="text-primary hover:underline">MORPH</Link>, <Link to="/blog/protocols-for-machines" className="text-primary hover:underline">RELAY</Link>. <strong>Meta</strong>: <Link to="/blog/seeing-everything-at-once" className="text-primary hover:underline">VISION</Link>, <Link to="/blog/mapping-what-we-built" className="text-primary hover:underline">ATLAS</Link>, <Link to="/blog/what-if-software-could-dream" className="text-primary hover:underline">DREAM</Link>, <Link to="/blog/the-governance-question" className="text-primary hover:underline">AUDIT</Link>.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">The Connective Tissue</h2>
            <p><Link to="/blog/nodes-that-talk" className="text-primary hover:underline">RIPPLE</Link> connects everything. Every node emits events. Every node can subscribe to events from any other node. This event bus is what makes the substrate a system rather than a collection of services. Without RIPPLE, thirty-eight nodes would be thirty-eight microservices with no shared purpose.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">What We Didn't Build</h2>
            <p>Some planned nodes never shipped. PREDICT was supposed to forecast user behavior — we realized <Link to="/blog/what-if-software-could-dream" className="text-primary hover:underline">DREAM</Link> handled it better. SYNC was a real-time collaboration node — redundant once RIPPLE matured. Knowing what not to build saved us as much time as knowing what to build.</p>

            <p>Thirty-eight nodes sounds overwhelming. But each one is simple. The complexity is in the connections, not the components. That's the whole thesis of <a href="https://en.wikipedia.org/wiki/Composability" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">composable architecture</a> — and it's why we called the company CMPSBL.</p>
          </div>
          <BlogPostNav slug={SLUG} />
        </article>
      </main>
      <EnhancedFooter />
    </>
  );
}
