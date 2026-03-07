/**
 * Chapter 6: Nodes That Talk — April 2025
 */
import { Link } from "react-router-dom";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { SEO } from "@/components/SEO";
import { BlogArticleJsonLd } from "@/components/blog/BlogArticleJsonLd";
import { BlogPostNav } from "@/components/blog/BlogPostNav";
import heroImg from "@/assets/blog/promptfluid-ripple-network.jpg";
import imgEcosystem from "@/assets/blog/promptfluid-ecosystem.jpg";

const SLUG = "nodes-that-talk";

export default function NodesThatTalk() {
  return (
    <>
      <SEO title="Nodes That Talk — Event-Driven Architecture" description="When five nodes needed to coordinate, point-to-point calls broke down. RIPPLE introduced pub/sub event propagation across the substrate." type="article" image={heroImg} publishedTime="2025-04-02" keywords={["event-driven AI", "RIPPLE node", "pub/sub architecture", "inter-node communication"]} canonical={`https://cmpsbl.com/blog/${SLUG}`} topicCluster="substrate-nodes" breadcrumbs={[{ name: "Home", url: "https://cmpsbl.com" }, { name: "Blog", url: "https://cmpsbl.com/blog" }, { name: "Nodes That Talk", url: `https://cmpsbl.com/blog/${SLUG}` }]} />
      <BlogArticleJsonLd title="Nodes That Talk — Event-Driven Architecture" description="Pub/sub event propagation across the substrate." slug={SLUG} datePublished="2025-04-02" imageUrl={heroImg} keywords={["RIPPLE", "event-driven", "pub/sub"]} />
      <PublicNav />
      <main className="min-h-screen bg-background">
        <article className="container max-w-3xl mx-auto px-4 py-16">
          <img src={heroImg} alt="RIPPLE event bus architecture" className="w-full rounded-xl mb-8 aspect-video object-cover" />
          <h1 className="text-4xl font-black mb-4">Nodes That Talk</h1>
          <p className="text-muted-foreground mb-8">April 2, 2025 · 12 min read · Written by the CMPSBL team</p>
          <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
            <p className="text-lg leading-relaxed">Five nodes. Each doing its job independently. But they couldn't talk to each other without going through a central controller. When <Link to="/blog/when-bots-found-us-first" className="text-primary hover:underline">DEFENSE</Link> detected a threat, it couldn't tell <Link to="/blog/routing-the-unknown" className="text-primary hover:underline">NEXUS</Link> to reroute. When <Link to="/blog/teaching-machines-to-remember" className="text-primary hover:underline">BRAIN</Link> updated memory, <Link to="/blog/seeing-everything-at-once" className="text-primary hover:underline">VISION</Link> didn't know until the next poll cycle.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">The Coordination Problem</h2>
            <p>Point-to-point communication doesn't scale. With five nodes, that's 20 possible connections. With forty — which is where we were heading — it's 1,560. We needed an <a href="https://en.wikipedia.org/wiki/Publish%E2%80%93subscribe_pattern" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">event bus</a> that lets any node broadcast a signal and any other node subscribe to it.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">RIPPLE: Pub/Sub for Nodes</h2>
            <p>RIPPLE is deceptively simple. A node emits an event — "threat detected," "memory updated," "provider degraded." Any node that cares about that event type receives it. No direct coupling. No shared state. Just signals propagating through the substrate.</p>

            <figure className="my-8">
              <img src={imgEcosystem} alt="Nodes communicating through RIPPLE's event bus — signals propagating across the substrate" className="w-full rounded-xl aspect-video object-cover" loading="lazy" />
              <figcaption className="text-sm text-muted-foreground/70 mt-2 text-center">RIPPLE connects every node through a pub/sub event bus — the substrate's nervous system.</figcaption>
            </figure>

            <p>The elegance is in what it enables. DEFENSE emits "threat.detected" → NEXUS adjusts routing. BRAIN emits "memory.consolidated" → <Link to="/blog/what-if-software-could-dream" className="text-primary hover:underline">DREAM</Link> schedules processing. VISION emits "health.degraded" → CORTEX triggers failover.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">Webhook Reliability</h2>
            <p>RIPPLE also handles external communication. Every outbound message gets <a href="https://en.wikipedia.org/wiki/Exponential_backoff" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">exponential backoff</a> retry logic, dead-letter queuing, and delivery confirmation. This pattern later evolved into the dedicated <Link to="/blog/protocols-for-machines" className="text-primary hover:underline">RELAY node</Link>.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">The Nervous System</h2>
            <p>RIPPLE transformed the substrate from a collection of tools into a coordinated system. Before RIPPLE, each node was an island. After RIPPLE, they were a network. That distinction matters more than any individual capability we built.</p>
          </div>
          <BlogPostNav slug={SLUG} />
        </article>
      </main>
      <EnhancedFooter />
    </>
  );
}
