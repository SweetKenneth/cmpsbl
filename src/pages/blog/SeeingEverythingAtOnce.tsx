/**
 * Chapter 5: Seeing Everything at Once — March 2025
 * Building VISION for full observability.
 */
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { SEO } from "@/components/SEO";
import heroImg from "@/assets/blog/promptfluid-vision-dashboard.jpg";

export default function SeeingEverythingAtOnce() {
  return (
    <>
      <SEO
        title="Seeing Everything at Once — The VISION Node"
        description="When we couldn't debug our own system, we built VISION — real-time observability across every node, every request, every cost."
        type="article"
        publishedTime="2025-03-20"
        keywords={['AI observability', 'VISION node', 'real-time monitoring', 'substrate telemetry', 'cost tracking AI']}
      />
      <PublicNav />
      <main className="min-h-screen bg-background">
        <article className="container max-w-3xl mx-auto px-4 py-16">
          <img src={heroImg} alt="VISION observability dashboard" className="w-full rounded-xl mb-8 aspect-video object-cover" />
          <h1 className="text-4xl font-black mb-4">Seeing Everything at Once</h1>
          <p className="text-muted-foreground mb-8">March 20, 2025 · 11 min read · Written by the CMPSBL team</p>
          <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
            <p className="text-lg leading-relaxed">By mid-March, we had three nodes running — NEXUS, BRAIN, and DEFENSE. They worked. But when something went wrong, we had no idea where. Was it a routing failure? A memory corruption? A false positive in DEFENSE? We were debugging by grep.</p>

            <p>That's when we built VISION. Not because it was next on the roadmap, but because we literally couldn't operate without it.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">The Observability Gap</h2>
            <p>Traditional monitoring tells you what happened. VISION needed to tell us why. When a request took 12 seconds instead of 2, we needed to see which node was slow, which provider was degraded, and whether the memory retrieval was the bottleneck or the model inference.</p>

            <p>We built VISION as a distributed tracing layer that follows every request from ingress to response. Every node emits structured telemetry — latency, cost, cache hits, errors — and VISION correlates it into a single timeline.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">Cost Tracking</h2>
            <p>The surprise feature was cost tracking. Once we could see exactly what every request cost — which model was used, how many tokens were consumed, what the cache saved us — cost optimization became trivial. We could see in real time that one customer's workload was 10x more expensive than it needed to be because their prompts were bloated.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">Health Scoring</h2>
            <p>VISION introduced system-wide health scoring. Each node gets a 0-100 health score based on error rate, latency, and throughput. The overall substrate health is a weighted composite. When health drops below threshold, VISION doesn't just alert — it feeds data back to NEXUS for routing adjustments and to DEFENSE for anomaly correlation.</p>

            <p>This was the first time nodes started working together. VISION didn't just observe — it informed. That closed-loop pattern became fundamental to everything we built afterward.</p>
          </div>
        </article>
      </main>
      <EnhancedFooter />
    </>
  );
}
