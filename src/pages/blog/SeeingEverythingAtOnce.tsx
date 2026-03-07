/**
 * Chapter 5: Seeing Everything at Once — March 2025
 */
import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { BlogArticleJsonLd } from "@/components/blog/BlogArticleJsonLd";
import { BlogArticleLayout } from "@/components/blog/BlogArticleLayout";
import heroImg from "@/assets/blog/promptfluid-vision-dashboard.jpg";
import imgCascade from "@/assets/blog/how-promptfluid-works-cascade.jpg";

const SLUG = "seeing-everything-at-once";

export default function SeeingEverythingAtOnce() {
  return (
    <BlogArticleLayout slug={SLUG} title="Seeing Everything at Once" subtitle="Real-time observability across the substrate" date="March 20, 2025" readTime="11 min read" heroImage={heroImg} heroAlt="VISION observability dashboard" chapter={5} showRewrittenNotice={false} head={<><SEO title="Seeing Everything at Once — The VISION Node" description="When we couldn't debug our own system, we built VISION — real-time observability across every node, every request, every cost." type="article" image={heroImg} publishedTime="2025-03-20" keywords={["AI observability", "VISION node", "real-time monitoring", "substrate telemetry"]} canonical={`https://cmpsbl.com/blog/${SLUG}`} topicCluster="substrate-nodes" breadcrumbs={[{ name: "Home", url: "https://cmpsbl.com" }, { name: "Blog", url: "https://cmpsbl.com/blog" }, { name: "Seeing Everything at Once", url: `https://cmpsbl.com/blog/${SLUG}` }]} /><BlogArticleJsonLd title="Seeing Everything at Once — The VISION Node" description="Real-time observability across every node in the substrate." slug={SLUG} datePublished="2025-03-20" imageUrl={heroImg} keywords={["VISION", "observability", "telemetry"]} /></>}>
      <p className="text-lg leading-relaxed">By mid-March, we had three nodes running — <Link to="/blog/routing-the-unknown" className="text-primary hover:underline">NEXUS</Link>, <Link to="/blog/teaching-machines-to-remember" className="text-primary hover:underline">BRAIN</Link>, and <Link to="/blog/when-bots-found-us-first" className="text-primary hover:underline">DEFENSE</Link>. They worked. But when something went wrong, we had no idea where. We were debugging by grep.</p>
      <p>That's when we built VISION. Not because it was next on the roadmap, but because we literally couldn't operate without it.</p>

      <h2 className="text-2xl font-bold text-foreground mt-8">The Observability Gap</h2>
      <p>Traditional monitoring tells you what happened. VISION needed to tell us why. We built VISION as a <a href="https://opentelemetry.io/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">distributed tracing</a> layer that follows every request from ingress to response. Every node emits structured telemetry — latency, cost, cache hits, errors — and VISION correlates it into a single timeline.</p>
      <figure className="my-8"><img src={imgCascade} alt="Request flowing through multiple substrate nodes with VISION tracking each step" className="w-full rounded-xl aspect-video object-cover" loading="lazy" /><figcaption className="text-sm text-muted-foreground/70 mt-2 text-center">VISION traces every request across the entire substrate — from ingress through processing to response.</figcaption></figure>

      <h2 className="text-2xl font-bold text-foreground mt-8">Cost Tracking</h2>
      <p>The surprise feature was cost tracking. Once we could see exactly what every request cost — which model was used, how many tokens were consumed, what the cache saved us — cost optimization became trivial.</p>

      <h2 className="text-2xl font-bold text-foreground mt-8">Health Scoring</h2>
      <p>VISION introduced system-wide health scoring. Each node gets a 0-100 health score based on error rate, latency, and throughput. When health drops below threshold, VISION doesn't just alert — it feeds data back to <Link to="/blog/routing-the-unknown" className="text-primary hover:underline">NEXUS</Link> for routing adjustments and to <Link to="/blog/when-bots-found-us-first" className="text-primary hover:underline">DEFENSE</Link> for anomaly correlation.</p>
      <p>This was the first time nodes started working together. VISION didn't just observe — it informed. That closed-loop pattern became fundamental to everything we built afterward, especially <Link to="/blog/nodes-that-talk" className="text-primary hover:underline">RIPPLE's event bus</Link>.</p>
    </BlogArticleLayout>
  );
}
