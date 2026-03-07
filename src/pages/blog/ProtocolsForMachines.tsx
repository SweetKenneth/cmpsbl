/**
 * Chapter 17: Protocols for Machines — December 2025
 * LLMs.txt, machine communication, and the protocol layer.
 */
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { SEO } from "@/components/SEO";
import heroImg from "@/assets/blog/ai-protocol-standards-v9.jpg";

export default function ProtocolsForMachines() {
  return (
    <>
      <SEO
        title="Protocols for Machines — How AI Systems Should Talk"
        description="We adopted LLMs.txt, built machine-readable documentation, and established protocol standards for autonomous agent communication across the substrate."
        type="article"
        publishedTime="2025-12-05"
        keywords={['AI protocol standards', 'LLMs.txt protocol', 'machine-to-machine communication', 'agent communication protocol', 'RELAY node']}
      />
      <PublicNav />
      <main className="min-h-screen bg-background">
        <article className="container max-w-3xl mx-auto px-4 py-16">
          <img src={heroImg} alt="AI protocol standards" className="w-full rounded-xl mb-8 aspect-video object-cover" />
          <h1 className="text-4xl font-black mb-4">Protocols for Machines</h1>
          <p className="text-muted-foreground mb-8">December 5, 2025 · 14 min read · Written by the CMPSBL team</p>
          <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
            <p className="text-lg leading-relaxed">In December 2025, we realized something uncomfortable: the substrate was being consumed by AI agents as often as human developers. Bots were reading our documentation, parsing our API responses, and making decisions based on error messages that were written for humans. We needed protocols designed for machines.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">LLMs.txt Adoption</h2>
            <p>The llmstxt.org protocol gave us a framework. A structured file at the root of your domain that tells AI systems what your service does, what it can do, and how to interact with it. We implemented it immediately — not just for the marketing site but for the API itself.</p>

            <p>The result was measurable. AI agents that consumed our LLMs.txt file made 40% fewer malformed requests. They understood capability boundaries before hitting them. They could self-correct without human intervention.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">RELAY: Outbound Communication</h2>
            <p>The RELAY node emerged from the protocol work. Every outbound message from the substrate — webhook deliveries, API callbacks, inter-service communication — flows through RELAY. Consistent retry logic. Dead-letter queuing. Delivery confirmation. Any node can emit a message without implementing HTTP clients or retry strategies.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">Protocol Contracts</h2>
            <p>We established three guarantees for machine-to-machine communication: every message has a verified sender (IDENTITY), every delivery is confirmed or escalated (RELAY), and every interaction is logged with cryptographic integrity (AUDIT).</p>

            <p>These aren't optional middleware. They're enforced at the substrate level. You can't send a message without IDENTITY verification. You can't skip delivery confirmation. The protocol is the product.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">AI Governance Namespace</h2>
            <p>We also registered governance-related domain names — not as a land grab, but to establish canonical vocabulary for AI governance concepts. Terms like "governed runtime," "actor attribution," and "capability scope" need consistent definitions across the industry. We published these definitions as open standards, not proprietary terminology.</p>
          </div>
        </article>
      </main>
      <EnhancedFooter />
    </>
  );
}
