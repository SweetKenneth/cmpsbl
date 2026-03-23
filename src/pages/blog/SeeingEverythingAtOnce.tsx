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
    <BlogArticleLayout slug={SLUG} title="Seeing Everything at Once" subtitle="Real-time observability across the substrate" date="March 20, 2025" readTime="11 min read" heroImage={heroImg} heroAlt="VISION observability dashboard" chapter={5} showRewrittenNotice={false} head={<><SEO title="Seeing Everything at Once — The VISION Agent" description="When we couldn't debug our own system, we built VISION — real-time observability across every node, every request, every cost." type="article" image={heroImg} publishedTime="2025-03-20" keywords={["AI observability", "VISION agent", "real-time monitoring", "substrate telemetry"]} canonical={`https://cmpsbl.com/blog/${SLUG}`} topicCluster="substrate-primitives" breadcrumbs={[{ name: "Home", url: "https://cmpsbl.com" }, { name: "Blog", url: "https://cmpsbl.com/blog" }, { name: "Seeing Everything at Once", url: `https://cmpsbl.com/blog/${SLUG}` }]} /><BlogArticleJsonLd title="Seeing Everything at Once — The VISION Agent" description="Real-time observability across every node in the substrate." slug={SLUG} datePublished="2025-03-20" imageUrl={heroImg} keywords={["VISION", "observability", "telemetry"]} /></>}>
      <p className="text-lg leading-relaxed">By mid-March, we had three nodes running — <Link to="/blog/routing-the-unknown" className="text-primary hover:underline">NEXUS</Link>, <Link to="/blog/teaching-machines-to-remember" className="text-primary hover:underline">BRAIN</Link>, and <Link to="/blog/when-bots-found-us-first" className="text-primary hover:underline">DEFENSE</Link>. They worked. But when something went wrong, we had no idea where. A request would fail and we'd spend forty minutes grepping through three separate log streams trying to correlate timestamps. We were debugging distributed systems with a text editor.</p>
      <p>That's when we built VISION. Not because it was next on the roadmap, but because we literally couldn't operate without it.</p>

      <h2 className="text-2xl font-bold text-foreground mt-8">The Observability Gap</h2>
      <p>Traditional monitoring tells you what happened. A metric spiked. A log entry appeared. An alert fired. But in a multi-node cognitive system, "what happened" isn't the useful question. The useful question is "why" — and answering it requires following a single request across every node it touched, seeing every decision that was made, and understanding the cascade of effects.</p>
      <p>We built VISION as a <a href="https://opentelemetry.io/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">distributed tracing</a> layer that follows every request from ingress to response. Every node emits structured telemetry — latency, cost, cache hits, errors, model selection rationale — and VISION correlates it into a single timeline. One request, one trace, complete visibility.</p>
      <p>The implementation was harder than expected. Each node had its own internal timing model. NEXUS measured latency from request receipt to provider response. BRAIN measured retrieval time separately from embedding time. DEFENSE counted analysis time but not the time spent waiting for behavioral history. Normalizing all of these into a coherent trace format took two weeks of arguing about what "latency" actually means in each context.</p>

      <figure className="my-8"><img src={imgCascade} alt="Request flowing through multiple substrate primitives with VISION tracking each step" className="w-full rounded-xl aspect-video object-cover" loading="lazy" /><figcaption className="text-sm text-muted-foreground/70 mt-2 text-center">VISION traces every request across the entire substrate — from ingress through processing to response.</figcaption></figure>

      <h2 className="text-2xl font-bold text-foreground mt-8">Cost Tracking</h2>
      <p>The surprise feature was cost tracking. Once we could see exactly what every request cost — which model was used, how many tokens were consumed, what the cache saved us — cost optimization became trivial. We discovered that 12% of our API spend was going to requests that hit the semantic cache anyway but were processed in parallel before the cache returned. A simple race-condition fix saved us $400/month immediately.</p>
      <p>Cost tracking also revealed usage patterns we hadn't anticipated. Certain customer integrations were calling NEXUS in tight loops — ten identical requests within a second — because their retry logic didn't respect our response headers. VISION let us identify these patterns, reach out to the developers, and help them fix their implementations. Win-win, but invisible without observability.</p>

      <h2 className="text-2xl font-bold text-foreground mt-8">Health Scoring</h2>
      <p>VISION introduced system-wide health scoring. Each node gets a 0-100 health score based on error rate, latency percentiles (p50, p95, p99), throughput, and queue depth. The score isn't a simple average — it's weighted by recency, so a brief spike three hours ago matters less than elevated latency right now.</p>
      <p>When health drops below threshold, VISION doesn't just alert — it feeds data back to <Link to="/blog/routing-the-unknown" className="text-primary hover:underline">NEXUS</Link> for routing adjustments and to <Link to="/blog/when-bots-found-us-first" className="text-primary hover:underline">DEFENSE</Link> for anomaly correlation. A degraded node might indicate a targeted attack, an upstream provider issue, or simply a traffic spike. VISION provides the data; other nodes make the decisions.</p>

      <h2 className="text-2xl font-bold text-foreground mt-8">The Closed Loop</h2>
      <p>This was the first time nodes started working together. VISION didn't just observe — it informed. That closed-loop pattern became fundamental to everything we built afterward. Observability isn't a dashboard you stare at; it's a data stream that other systems consume. When we built <Link to="/blog/nodes-that-talk" className="text-primary hover:underline">RIPPLE's event bus</Link> two weeks later, VISION was its most prolific publisher — emitting health events, cost anomalies, and latency warnings that every other node could subscribe to.</p>
      <p>We also learned something counterintuitive: too much observability is almost as bad as too little. Our first implementation emitted telemetry for every function call inside every node. The result was a firehose — 50MB of trace data per hour — that was expensive to store and impossible to navigate. We pared it down to decision-point telemetry: only emit traces at points where the system made a meaningful choice. That reduced data volume by 85% while keeping diagnostic value nearly intact.</p>
    </BlogArticleLayout>
  );
}
