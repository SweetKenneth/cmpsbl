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
          <p className="text-muted-foreground mb-8">June 14, 2025 · 14 min read · Written by the CMPSBL team</p>
          <RewrittenNotice />
          <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
            <p className="text-lg leading-relaxed">By June, we had twelve nodes running. New team members would ask "what does this node connect to?" and get different answers from different engineers. Our own architecture had outgrown our understanding of it.</p>

            <p>This wasn't just an onboarding problem. During incident response, we'd waste twenty minutes tracing call chains manually before we could even begin fixing the issue. We had monitoring through <Link to="/blog/seeing-everything-at-once" className="text-primary hover:underline">VISION</Link>, but VISION told you what was happening — not why. Understanding "why" required knowing the architecture, and our architecture documentation was perpetually two weeks out of date.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">Auto-Discovery</h2>
            <p>ATLAS doesn't rely on manually maintained documentation. It watches <Link to="/blog/nodes-that-talk" className="text-primary hover:underline">RIPPLE's event bus</Link> and infers capability graphs from actual usage. If NEXUS calls BRAIN 400 times per hour, ATLAS knows that dependency is real — not aspirational.</p>

            <p>The inference engine uses a sliding window of event data — typically seven days — to build and continuously update the capability graph. Edges in the graph represent actual inter-node communication: RPC calls, event subscriptions, data flows. Each edge carries metadata: average latency, call frequency, error rate, and data volume. This means the graph isn't just a topology — it's a performance model. You can ask ATLAS "what's the slowest path through the substrate?" and get an answer based on real-world measurements, not architectural assumptions.</p>

            <p>ATLAS also detects implicit dependencies that don't show up in direct call graphs. When DECODE's output quality correlates with BRAIN's cache hit rate (even though DECODE never calls BRAIN directly), ATLAS flags it as a statistical dependency. These hidden couplings were responsible for some of our most confusing production incidents — fixing the direct caller didn't help because the real cause was an indirect dependency three hops away.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">The Living Map</h2>
            <p>ATLAS produces a real-time capability map. Every node's health, throughput, latency, and dependency graph — always current, never stale. This map became the foundation for our <Link to="/blog/thirty-eight-nodes-deep" className="text-primary hover:underline">architecture documentation</Link> and the public <a href="https://cmpsbl.com/architecture" className="text-primary hover:underline">architecture page</a>.</p>

            <p>The map updates every 60 seconds. When a new node comes online, ATLAS discovers it within one cycle. When a dependency pattern changes — say, a code deployment shifts traffic from one model provider to another — the map reflects it in real time. We stopped maintaining architecture diagrams in wikis. The diagram is the system itself, observed by ATLAS.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">Impact Analysis</h2>
            <p>Before ATLAS, deploying changes was guesswork. "If I update BRAIN's API, what breaks?" ATLAS answers that with certainty — it knows every consumer of every capability. Zero-surprise deployments became possible because we could finally see the blast radius of any change.</p>

            <p>We integrated ATLAS into our deployment pipeline. Before any change ships, ATLAS generates an impact report: which nodes will be affected, which API contracts might break, and what the estimated performance impact will be based on historical patterns for similar changes. The deployment either gets a green light or a warning with specific risk factors. This reduced our post-deployment incident rate by 71% in the first quarter after rollout.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">Capability Versioning</h2>
            <p>ATLAS tracks capability evolution over time. When a node adds a new function or deprecates an old one, ATLAS records the change and notifies dependent nodes. This historical record became invaluable for debugging regressions — "this started failing last Tuesday, what changed?" ATLAS can answer that question in seconds by showing the delta between two points in time.</p>

            <p>ATLAS was unglamorous infrastructure. Nobody demos a dependency graph to investors. But without it, the substrate would have collapsed under its own complexity long before we reached <Link to="/blog/thirty-eight-nodes-deep" className="text-primary hover:underline">thirty-eight nodes</Link>. It's the kind of tool that proves its value by preventing problems you never see.</p>
          </div>
          <BlogPostNav slug={SLUG} />
        </article>
      </main>
      <EnhancedFooter />
    </>
  );
}