/**
 * Chapter 2: Routing the Unknown — January 2025
 */
import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { BlogArticleJsonLd } from "@/components/blog/BlogArticleJsonLd";
import { BlogArticleLayout } from "@/components/blog/BlogArticleLayout";
import heroImg from "@/assets/blog/promptfluid-nexus-api-gateway.jpg";
import imgRouting from "@/assets/blog/ai-triad-intelligent-routing.jpg";

const SLUG = "routing-the-unknown";

export default function RoutingTheUnknown() {
  return (
    <BlogArticleLayout slug={SLUG} title="Routing the Unknown" subtitle="Building the NEXUS intelligent routing gateway" date="January 10, 2025" readTime="14 min read" heroImage={heroImg} heroAlt="NEXUS routing gateway architecture" chapter={2} showRewrittenNotice={false} head={<><SEO title="Routing the Unknown — Building the NEXUS Node" description="How the NEXUS organ evolved from a simple failover function into an intelligent AI routing gateway with cost arbitrage and health-weighted selection." type="article" image={heroImg} publishedTime="2025-01-10" keywords={["AI routing gateway", "NEXUS organ", "multi-provider AI", "intelligent model selection", "cost arbitrage AI"]} canonical={`https://cmpsbl.com/blog/${SLUG}`} topicCluster="substrate-primitives" breadcrumbs={[{ name: "Home", url: "https://cmpsbl.com" }, { name: "Blog", url: "https://cmpsbl.com/blog" }, { name: "Routing the Unknown", url: `https://cmpsbl.com/blog/${SLUG}` }]} /><BlogArticleJsonLd title="Routing the Unknown — Building the NEXUS Node" description="How NEXUS evolved from failover into intelligent AI routing." slug={SLUG} datePublished="2025-01-10" imageUrl={heroImg} keywords={["NEXUS", "AI routing", "multi-provider"]} /></>}>
      <p className="text-lg leading-relaxed">January 2025. The <Link to="/blog/the-first-line-of-code" className="text-primary hover:underline">routing function from December</Link> was already showing cracks. It knew how to failover, but it didn't know how to choose. Every request went to the same provider until it broke, then fell to the next. That's not routing — that's panic.</p>

      <p>We needed something that understood the request. Not just "which provider is up" but "which provider is best for this specific task, at this price point, with this latency requirement." That's when NEXUS stopped being a function and started being a node.</p>

      <h2 className="text-2xl font-bold text-foreground mt-8">The Multi-Provider Problem</h2>
      <p>In January 2025, the AI provider landscape was fracturing. <a href="https://openai.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">OpenAI</a>, <a href="https://anthropic.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Anthropic</a>, <a href="https://deepmind.google/technologies/gemini/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Gemini</a>, <a href="https://mistral.ai" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Mistral</a> — each had strengths. Claude was better at nuanced reasoning. GPT was faster for structured output. Gemini handled longer contexts. No single provider was best at everything.</p>
      <p>Most teams picked one and lived with its limitations. We decided to route to all of them, intelligently, based on the actual characteristics of each request. The alternative — asking developers to manually choose a provider for every use case — was a non-starter. They'd pick the one they knew and use it for everything, leaving performance and cost savings on the table.</p>

      <h2 className="text-2xl font-bold text-foreground mt-8">Health-Weighted Selection</h2>
      <p>The first real feature was health scoring. Every provider got a rolling score based on latency, error rate, and throughput. Requests routed to the healthiest option by default. Simple, but it eliminated the "provider is degraded and nobody noticed" problem that had cost us three outages in December. This approach later informed how <Link to="/blog/seeing-everything-at-once" className="text-primary hover:underline">VISION</Link> built system-wide health scoring.</p>
      <p>Health scores update every 30 seconds from live traffic data. We tried polling provider status pages, but those are updated manually by humans — they lag reality by 10-30 minutes. By tracking actual request latency and error rates, NEXUS detects degradation within seconds. During one OpenAI incident in late January, NEXUS detected elevated latency 22 minutes before OpenAI's status page acknowledged the issue and had already rerouted traffic to Anthropic.</p>

      <figure className="my-8">
        <img src={imgRouting} alt="Intelligent routing across multiple AI providers with health scoring and cost arbitrage" className="w-full rounded-xl aspect-video object-cover" loading="lazy" />
        <figcaption className="text-sm text-muted-foreground/70 mt-2 text-center">NEXUS routes requests across providers using health scores, cost data, and task complexity analysis.</figcaption>
      </figure>

      <h2 className="text-2xl font-bold text-foreground mt-8">Cost Arbitrage</h2>
      <p>The second feature was cost-aware routing. Not every request needs the most expensive model. A classification task doesn't need GPT-4. A summarization can run on a smaller model. NEXUS learned to match request complexity to model capability, and the cost savings were immediate — 40% reduction in our own API spend within the first week.</p>
      <p>The complexity estimation isn't perfect — it never will be. We use a lightweight heuristic that analyzes token count, prompt structure, and domain signals. A prompt with code blocks and "debug this" routes differently than a prompt with "summarize the following." We were wrong about 8% of the time in early testing, sending complex tasks to cheap models and getting poor results. The fix was a quality feedback loop: when a downstream node (or user) signals dissatisfaction, NEXUS logs the routing decision as suboptimal and adjusts the heuristic weights. Over six months, the misrouting rate dropped from 8% to under 3%.</p>

      <h2 className="text-2xl font-bold text-foreground mt-8">Semantic Caching</h2>
      <p>The third feature came from frustration. We kept seeing identical requests hitting the API over and over. So we added a <a href="https://en.wikipedia.org/wiki/Semantic_similarity" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">semantic cache</a>. Not just exact-match caching, but embedding-based similarity. If a request was close enough to something we'd already answered, serve the cached result. Response times dropped from seconds to milliseconds.</p>
      <p>The similarity threshold was the tricky part. Too strict (0.99 cosine similarity) and almost nothing hits the cache. Too loose (0.85) and you start serving stale or mismatched responses. We settled on 0.95 with domain-specific adjustment — technical queries get a tighter threshold than conversational ones, because "explain recursion" and "explain recursion in Python" might need different answers, while "how are you?" and "how are you doing?" definitely don't. The cache hit rate stabilized around 18% across all traffic, saving roughly $2,000/month by March.</p>

      <h2 className="text-2xl font-bold text-foreground mt-8">Streaming and Resilience</h2>
      <p>One challenge we underestimated: streaming responses. Most AI interactions use <a href="https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">server-sent events</a> for real-time token delivery. Routing a streaming request is harder than routing a batch request because you can't retry mid-stream without the user seeing a restart. NEXUS handles this with pre-flight health checks — before opening a stream, it verifies the target provider is healthy and has capacity. If a stream fails mid-delivery, NEXUS can resume from the last delivered token using a different provider, though the model switch sometimes introduces subtle style shifts that observant users notice.</p>

      <h2 className="text-2xl font-bold text-foreground mt-8">The First Real Node</h2>
      <p>By the end of January, NEXUS was the first thing in the system that felt like it was making decisions. It wasn't just passing data — it was evaluating, choosing, optimizing. That's when we realized what we were building wasn't just infrastructure. It was infrastructure that thinks.</p>
      <p>NEXUS became the template for every primitive that followed. Independent. Stateful. Decision-capable. The pattern was set — and it held through all 40 primitives, even through the <Link to="/blog/burning-it-down" className="text-primary hover:underline">SPARTA rebuild</Link>.</p>
    </BlogArticleLayout>
  );
}
