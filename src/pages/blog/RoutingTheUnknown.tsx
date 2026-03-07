/**
 * Chapter 2: Routing the Unknown — January 2025
 * Building NEXUS, the first real node.
 */
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { SEO } from "@/components/SEO";
import heroImg from "@/assets/blog/promptfluid-nexus-api-gateway.jpg";

export default function RoutingTheUnknown() {
  return (
    <>
      <SEO
        title="Routing the Unknown — Building the NEXUS Node"
        description="How the NEXUS node evolved from a simple failover function into an intelligent AI routing gateway with cost arbitrage and health-weighted selection."
        type="article"
        publishedTime="2025-01-10"
        keywords={['AI routing gateway', 'NEXUS node', 'multi-provider AI', 'intelligent model selection', 'cost arbitrage AI']}
      />
      <PublicNav />
      <main className="min-h-screen bg-background">
        <article className="container max-w-3xl mx-auto px-4 py-16">
          <img src={heroImg} alt="NEXUS routing gateway architecture" className="w-full rounded-xl mb-8 aspect-video object-cover" />
          <h1 className="text-4xl font-black mb-4">Routing the Unknown</h1>
          <p className="text-muted-foreground mb-8">January 10, 2025 · 14 min read · Written by the CMPSBL team</p>
          <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
            <p className="text-lg leading-relaxed">January 2025. The routing function from December was already showing cracks. It knew how to failover, but it didn't know how to choose. Every request went to the same provider until it broke, then fell to the next. That's not routing — that's panic.</p>

            <p>We needed something that understood the request. Not just "which provider is up" but "which provider is best for this specific task, at this price point, with this latency requirement." That's when NEXUS stopped being a function and started being a node.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">The Multi-Provider Problem</h2>
            <p>In January 2025, the AI provider landscape was fracturing. OpenAI, Anthropic, Google, Mistral, Cohere — each had strengths. Claude was better at nuanced reasoning. GPT was faster for structured output. Gemini handled longer contexts. No single provider was best at everything.</p>

            <p>Most teams picked one and lived with its limitations. We decided to route to all of them, intelligently, based on the actual characteristics of each request.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">Health-Weighted Selection</h2>
            <p>The first real feature was health scoring. Every provider got a rolling score based on latency, error rate, and throughput. Requests routed to the healthiest option by default. Simple, but it eliminated the "provider is degraded and nobody noticed" problem that plagued every team we talked to.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">Cost Arbitrage</h2>
            <p>The second feature was cost-aware routing. Not every request needs the most expensive model. A classification task doesn't need GPT-4. A summarization can run on a smaller model. NEXUS learned to match request complexity to model capability, and the cost savings were immediate — 40% reduction in our own API spend within the first week.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">Semantic Caching</h2>
            <p>The third feature came from frustration. We kept seeing identical requests — same prompt, same parameters, same everything — hitting the API over and over. So we added a semantic cache. Not just exact-match caching, but embedding-based similarity. If a request was close enough to something we'd already answered, serve the cached result. Response times dropped from seconds to milliseconds.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">The First Real Node</h2>
            <p>By the end of January, NEXUS was the first thing in the system that felt like it was making decisions. It wasn't just passing data — it was evaluating, choosing, optimizing. That's when we realized what we were building wasn't just infrastructure. It was infrastructure that thinks.</p>

            <p>NEXUS became the template for every node that followed. Independent. Stateful. Decision-capable. The pattern was set.</p>
          </div>
        </article>
      </main>
      <EnhancedFooter />
    </>
  );
}
