/**
 * Chapter 1: The First Line of Code — December 2024
 * Why we started building cognitive infrastructure.
 */
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { SEO } from "@/components/SEO";
import heroImg from "@/assets/blog/promptfluid-market-disruptor.jpg";

export default function TheFirstLineOfCode() {
  return (
    <>
      <SEO
        title="The First Line of Code — Why We Started Building"
        description="In December 2024, we wrote the first line of what would become the CMPSBL substrate. This is the honest story of why."
        type="article"
        publishedTime="2024-12-15"
        keywords={['cognitive infrastructure origin', 'AI substrate story', 'CMPSBL founding', 'why build AI infrastructure']}
      />
      <PublicNav />
      <main className="min-h-screen bg-background">
        <article className="container max-w-3xl mx-auto px-4 py-16">
          <img src={heroImg} alt="The beginning of the CMPSBL substrate" className="w-full rounded-xl mb-8 aspect-video object-cover" />
          <h1 className="text-4xl font-black mb-4">The First Line of Code</h1>
          <p className="text-muted-foreground mb-8">December 15, 2024 · 12 min read · Written by the CMPSBL team</p>
          <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
            <p className="text-lg leading-relaxed">In December 2024, we sat in front of a blank editor and asked a question that wouldn't leave us alone: what if AI infrastructure wasn't something you rented by the token, but something you owned — something that could think?</p>

            <p>The AI landscape at the time was clear in its limitations. You could call an API. You could get a response. But the moment the request ended, everything was gone. No memory. No learning. No continuity. Every interaction started from zero.</p>

            <p>We'd spent months watching teams duct-tape context windows together, build fragile RAG pipelines that broke under load, and pay escalating costs for models that couldn't remember a conversation from five minutes ago. The tooling was impressive in isolation but architecturally bankrupt.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">The Problem We Couldn't Ignore</h2>
            <p>The fundamental issue wasn't model quality — the models were extraordinary. The issue was infrastructure. There was no layer between "call an API" and "build everything yourself." No persistent memory. No governance. No way for systems to learn from their own experience.</p>

            <p>Enterprise teams were spending more time on plumbing than on intelligence. Authentication, rate limiting, model routing, audit trails, cost tracking — every team was rebuilding these from scratch. And none of it carried forward.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">What We Decided to Build</h2>
            <p>We decided to build the missing layer. Not another model. Not another wrapper. Infrastructure — cognitive infrastructure that could persist state, route intelligently, secure itself, and learn from every interaction.</p>

            <p>The first commit was a routing function. Embarrassingly simple. It took a request, checked which AI provider was healthy, and forwarded it. That was it. But in that simple function was the seed of everything that followed: the idea that infrastructure should make decisions, not just pass messages.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">The Architecture Decision</h2>
            <p>We made one decision early that shaped everything: the system would be modular. Not microservices-for-the-sake-of-it modular, but genuinely composable. Each capability would be a node — independently deployable, independently testable, independently valuable.</p>

            <p>This wasn't obvious at the time. Monoliths ship faster. But we'd watched enough AI projects collapse under their own weight to know that composability wasn't a luxury — it was a survival requirement.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">December Nights</h2>
            <p>By the end of December, we had three things working: a routing layer that could failover between providers, a primitive memory store that persisted conversation context across sessions, and a rate limiter that actually understood usage patterns.</p>

            <p>It wasn't much. But it was ours, and it worked, and every piece of it carried state forward. That was the breakthrough we cared about — not the sophistication of any individual component, but the fact that the system remembered.</p>

            <p>We didn't know it yet, but we'd just written the first three nodes of what would become a 40-node cognitive substrate. The story was just beginning.</p>
          </div>
        </article>
      </main>
      <EnhancedFooter />
    </>
  );
}
