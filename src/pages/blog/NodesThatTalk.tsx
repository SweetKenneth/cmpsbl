/**
 * Chapter 6: Primitives That Talk — April 2025
 */
import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { BlogArticleJsonLd } from "@/components/blog/BlogArticleJsonLd";
import { BlogArticleLayout } from "@/components/blog/BlogArticleLayout";
import heroImg from "@/assets/blog/promptfluid-ripple-network.jpg";
import imgEcosystem from "@/assets/blog/promptfluid-ecosystem.jpg";

const SLUG = "nodes-that-talk";

export default function NodesThatTalk() {
  return (
    <BlogArticleLayout slug={SLUG} title="Primitives That Talk" subtitle="Event-driven architecture with RIPPLE Organ" date="April 2, 2025" readTime="12 min read" heroImage={heroImg} heroAlt="RIPPLE Organ event bus architecture" chapter={6} showRewrittenNotice={false} head={<><SEO title="Primitives That Talk — Event-Driven Architecture" description="When five primitives needed to coordinate, point-to-point calls broke down. RIPPLE Organ introduced pub/sub event propagation across the substrate." type="article" image={heroImg} publishedTime="2025-04-02" keywords={["event-driven AI", "RIPPLE Organ", "pub/sub architecture", "inter-primitive communication"]} canonical={`https://cmpsbl.com/blog/${SLUG}`} topicCluster="substrate-primitives" breadcrumbs={[{ name: "Home", url: "https://cmpsbl.com" }, { name: "Blog", url: "https://cmpsbl.com/blog" }, { name: "Primitives That Talk", url: `https://cmpsbl.com/blog/${SLUG}` }]} /><BlogArticleJsonLd title="Primitives That Talk — Event-Driven Architecture" description="Pub/sub event propagation across the substrate." slug={SLUG} datePublished="2025-04-02" imageUrl={heroImg} keywords={["RIPPLE Organ", "event-driven", "pub/sub"]} /></>}>
      <p className="text-lg leading-relaxed">Five nodes. Each doing its job independently. But they couldn't talk to each other without going through a central controller. When <Link to="/blog/when-bots-found-us-first" className="text-primary hover:underline">DEFENSE</Link> detected a threat, it couldn't tell <Link to="/blog/routing-the-unknown" className="text-primary hover:underline">NEXUS</Link> to reroute. When <Link to="/blog/teaching-machines-to-remember" className="text-primary hover:underline">BRAIN</Link> updated memory, <Link to="/blog/seeing-everything-at-once" className="text-primary hover:underline">VISION</Link> didn't know until the next poll cycle. We were building a brain with neurons that couldn't fire.</p>

      <h2 className="text-2xl font-bold text-foreground mt-8">The Coordination Problem</h2>
      <p>Point-to-point communication doesn't scale. With five nodes, that's 20 possible connections. With forty — which is where we were heading — it's 1,560. Every new node would need to integrate with every existing node. We needed an <a href="https://en.wikipedia.org/wiki/Publish%E2%80%93subscribe_pattern" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">event bus</a> that lets any node broadcast a signal and any other node subscribe to it, with zero knowledge of who's listening.</p>
      <p>We evaluated existing message brokers — RabbitMQ, Kafka, NATS. All excellent. All designed for microservices that process thousands of messages per second with guaranteed delivery. Our problem was different: cognitive events with semantic meaning, variable priority, and context-dependent routing. A "threat detected" event at severity 9 needs different handling than a "memory updated" event. We needed a bus that understood urgency, not just ordering.</p>

      <h2 className="text-2xl font-bold text-foreground mt-8">RIPPLE: Pub/Sub for Nodes</h2>
      <p>RIPPLE is deceptively simple. A node emits an event — "threat detected," "memory updated," "provider degraded." Any node that cares about that event type receives it. No direct coupling. No shared state. Just signals propagating through the substrate like ripples across water.</p>
      <figure className="my-8"><img src={imgEcosystem} alt="Primitives communicating through RIPPLE's event bus" className="w-full rounded-xl aspect-video object-cover" loading="lazy" /><figcaption className="text-sm text-muted-foreground/70 mt-2 text-center">RIPPLE connects every primitive through a pub/sub event bus — the substrate's nervous system.</figcaption></figure>
      <p>The elegance is in what it enables. DEFENSE emits "threat.detected" → NEXUS adjusts routing. BRAIN emits "memory.consolidated" → <Link to="/blog/what-if-software-could-dream" className="text-primary hover:underline">DREAM</Link> schedules processing. VISION emits "health.degraded" → CORTEX triggers failover. None of these nodes need to know about each other. They just emit and subscribe.</p>

      <h2 className="text-2xl font-bold text-foreground mt-8">Priority Propagation</h2>
      <p>RIPPLE's distinctive feature is priority-aware propagation. Events carry a priority field (1-10) that determines processing order. When DEFENSE detects a critical threat (priority 10), that event jumps the queue ahead of routine telemetry updates (priority 2). This means security events propagate through the substrate in under 5ms, while background consolidation events might take 50-100ms during peak load.</p>
      <p>We also added event coalescence: if VISION emits five "health.degraded" events for the same node within a second, RIPPLE coalesces them into a single event with an aggregated severity. This prevents event storms from overwhelming downstream subscribers — a problem we hit during our first load test when VISION was emitting 200 events per second and NEXUS was spending more time processing health updates than routing requests.</p>

      <h2 className="text-2xl font-bold text-foreground mt-8">Webhook Reliability</h2>
      <p>RIPPLE also handles external communication. Every outbound message gets <a href="https://en.wikipedia.org/wiki/Exponential_backoff" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">exponential backoff</a> retry logic, dead-letter queuing, and delivery confirmation. Failed deliveries don't disappear — they land in a dead-letter queue where they can be inspected, replayed, or escalated. This pattern later evolved into the dedicated <Link to="/blog/protocols-for-machines" className="text-primary hover:underline">RELAY node</Link> when outbound communication became complex enough to warrant its own node.</p>

      <h2 className="text-2xl font-bold text-foreground mt-8">The Nervous System</h2>
      <p>RIPPLE transformed the substrate from a collection of tools into a coordinated system. Before RIPPLE, each primitive was an island. After RIPPLE, they were a network. That distinction matters more than any individual capability we built. It's the difference between having five hammers and having a hand.</p>
      <p>The most telling metric: before RIPPLE, the average time between DEFENSE detecting a threat and NEXUS adjusting routing was 45 seconds (one poll cycle). After RIPPLE, it was 8 milliseconds. That's the difference between blocking an attack and absorbing one.</p>
    </BlogArticleLayout>
  );
}
