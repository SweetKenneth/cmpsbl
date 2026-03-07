/**
 * Chapter 5: Seeing Everything at Once — March 2025
 */
import { Link } from "react-router-dom";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { SEO } from "@/components/SEO";
import { BlogArticleJsonLd } from "@/components/blog/BlogArticleJsonLd";
import { BlogPostNav } from "@/components/blog/BlogPostNav";
import heroImg from "@/assets/blog/promptfluid-vision-dashboard.jpg";
import imgCascade from "@/assets/blog/how-promptfluid-works-cascade.jpg";

const SLUG = "seeing-everything-at-once";

export default function SeeingEverythingAtOnce() {
  return (
    <>
      <SEO title="Seeing Everything at Once — The VISION Node" description="When we couldn't debug our own system, we built VISION — real-time observability across every node, every request, every cost." type="article" image={heroImg} publishedTime="2025-03-20" keywords={["AI observability", "VISION node", "real-time monitoring", "substrate telemetry"]} canonical={`https://cmpsbl.com/blog/${SLUG}`} topicCluster="substrate-nodes" breadcrumbs={[{ name: "Home", url: "https://cmpsbl.com" }, { name: "Blog", url: "https://cmpsbl.com/blog" }, { name: "Seeing Everything at Once", url: `https://cmpsbl.com/blog/${SLUG}` }]} />
      <BlogArticleJsonLd title="Seeing Everything at Once — The VISION Node" description="Real-time observability across every node in the substrate." slug={SLUG} datePublished="2025-03-20" imageUrl={heroImg} keywords={["VISION", "observability", "telemetry"]} />
      <PublicNav />
      <main className="min-h-screen bg-background">
        <article className="container max-w-3xl mx-auto px-4 py-16">
          <img src={heroImg} alt="VISION observability dashboard" className="w-full rounded-xl mb-8 aspect-video object-cover" />
          <h1 className="text-4xl font-black mb-4">Seeing Everything at Once</h1>
          <p className="text-muted-foreground mb-8">March 20, 2025 · 11 min read · Written by the CMPSBL team</p>
          <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
            <p className="text-lg leading-relaxed">By mid-March, we had three nodes running — <Link to="/blog/routing-the-unknown" className="text-primary hover:underline">NEXUS</Link>, <Link to="/blog/teaching-machines-to-remember" className="text-primary hover:underline">BRAIN</Link>, and <Link to="/blog/when-bots-found-us-first" className="text-primary hover:underline">DEFENSE</Link>. They worked. But when something went wrong, we had no idea where. We were debugging by grep.</p>

            <p>That's when we built VISION. Not because it was next on the roadmap, but because we literally couldn't operate without it.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">The Observability Gap</h2>
            <p>Traditional monitoring tells you what happened. VISION needed to tell us why. We built VISION as a <a href="https://opentelemetry.io/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">distributed tracing</a> layer that follows every request from ingress to response. Every node emits structured telemetry — latency, cost, cache hits, errors — and VISION correlates it into a single timeline.</p>

            <figure className="my-8">
              <img src={imgCascade} alt="Request flowing through multiple substrate nodes with VISION tracking each step" className="w-full rounded-xl aspect-video object-cover" loading="lazy" />
              <figcaption className="text-sm text-muted-foreground/70 mt-2 text-center">VISION traces every request across the entire substrate — from ingress through processing to response.</figcaption>
            </figure>

            <h2 className="text-2xl font-bold text-foreground mt-8">Cost Tracking</h2>
            <p>The surprise feature was cost tracking. Once we could see exactly what every request cost — which model was used, how many tokens were consumed, what the cache saved us — cost optimization became trivial.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">Health Scoring</h2>
            <p>VISION introduced system-wide health scoring. Each node gets a 0-100 health score based on error rate, latency, and throughput. When health drops below threshold, VISION doesn't just alert — it feeds data back to <Link to="/blog/routing-the-unknown" className="text-primary hover:underline">NEXUS</Link> for routing adjustments and to <Link to="/blog/when-bots-found-us-first" className="text-primary hover:underline">DEFENSE</Link> for anomaly correlation.</p>

            <p>This was the first time nodes started working together. VISION didn't just observe — it informed. That closed-loop pattern became fundamental to everything we built afterward, especially <Link to="/blog/nodes-that-talk" className="text-primary hover:underline">RIPPLE's event bus</Link>.</p>
          </div>
          <BlogPostNav slug={SLUG} />
        </article>
      </main>
      <EnhancedFooter />
    </>
  );
}
