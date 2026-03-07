/**
 * Chapter 6: Nodes That Talk — April 2025
 * RIPPLE and event-driven architecture.
 */
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { SEO } from "@/components/SEO";
import heroImg from "@/assets/blog/promptfluid-ripple-network.jpg";

export default function NodesThatTalk() {
  return (
    <>
      <SEO
        title="Nodes That Talk — Event-Driven Architecture"
        description="When five nodes needed to coordinate, point-to-point calls broke down. RIPPLE introduced pub/sub event propagation across the substrate."
        type="article"
        publishedTime="2025-04-02"
        keywords={['event-driven AI', 'RIPPLE node', 'pub/sub architecture', 'inter-node communication', 'event sourcing AI']}
      />
      <PublicNav />
      <main className="min-h-screen bg-background">
        <article className="container max-w-3xl mx-auto px-4 py-16">
          <img src={heroImg} alt="RIPPLE event bus architecture" className="w-full rounded-xl mb-8 aspect-video object-cover" />
          <h1 className="text-4xl font-black mb-4">Nodes That Talk</h1>
          <p className="text-muted-foreground mb-8">April 2, 2025 · 12 min read · Written by the CMPSBL team</p>
          <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
            <p className="text-lg leading-relaxed">Five nodes. Each doing its job independently. But they couldn't talk to each other without going through a central controller. When DEFENSE detected a threat, it couldn't tell NEXUS to reroute. When BRAIN updated memory, VISION didn't know until the next poll cycle. We had independent nodes but no nervous system.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">The Coordination Problem</h2>
            <p>Point-to-point communication doesn't scale. With five nodes, that's 20 possible connections. With ten nodes, it's 90. With forty — which is where we were heading — it's 1,560. Every node would need to know about every other node. That's not architecture, that's spaghetti.</p>

            <p>We needed a bus. Not a message queue — those add latency and complexity. An event bus that lets any node broadcast a signal and any other node subscribe to it.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">RIPPLE: Pub/Sub for Nodes</h2>
            <p>RIPPLE is deceptively simple. A node emits an event — "threat detected," "memory updated," "provider degraded." Any node that cares about that event type receives it. No direct coupling. No shared state. Just signals propagating through the substrate.</p>

            <p>The elegance is in what it enables. DEFENSE emits "threat.detected" → NEXUS adjusts routing. BRAIN emits "memory.consolidated" → DREAM schedules processing. VISION emits "health.degraded" → CORTEX triggers failover. Each node stays independent but the system behaves coherently.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">Webhook Reliability</h2>
            <p>RIPPLE also handles external communication. Webhooks to customer endpoints, API callbacks, integration events. Every outbound message gets retry logic, dead-letter queuing, and delivery confirmation. If your endpoint is down, RIPPLE retries with exponential backoff for 72 hours before giving up.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">The Nervous System</h2>
            <p>RIPPLE transformed the substrate from a collection of tools into a coordinated system. Before RIPPLE, each node was an island. After RIPPLE, they were a network. That distinction matters more than any individual capability we built.</p>
          </div>
        </article>
      </main>
      <EnhancedFooter />
    </>
  );
}
