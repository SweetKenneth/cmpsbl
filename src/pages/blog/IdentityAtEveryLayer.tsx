/**
 * Chapter 7: Identity at Every Layer — April 2025
 * ACCESS and entitlements.
 */
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { SEO } from "@/components/SEO";
import heroImg from "@/assets/blog/promptfluid-access-identity-billing.jpg";

export default function IdentityAtEveryLayer() {
  return (
    <>
      <SEO
        title="Identity at Every Layer — The ACCESS Node"
        description="Authentication, API keys, rate limits, and tier-based entitlements. How ACCESS made the substrate safe to open to the world."
        type="article"
        publishedTime="2025-04-15"
        keywords={['API identity management', 'ACCESS node', 'tier-based entitlements', 'API key lifecycle', 'rate limiting AI']}
      />
      <PublicNav />
      <main className="min-h-screen bg-background">
        <article className="container max-w-3xl mx-auto px-4 py-16">
          <img src={heroImg} alt="ACCESS node identity and entitlements" className="w-full rounded-xl mb-8 aspect-video object-cover" />
          <h1 className="text-4xl font-black mb-4">Identity at Every Layer</h1>
          <p className="text-muted-foreground mb-8">April 15, 2025 · 10 min read · Written by the CMPSBL team</p>
          <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
            <p className="text-lg leading-relaxed">We were ready to let other people use the substrate. But "other people" meant strangers on the internet hitting our API with requests we couldn't predict. We needed to know who was calling, what they were allowed to do, and how much of it they could do.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">The API Key Problem</h2>
            <p>API keys seem simple until you need to manage thousands of them. Creation, rotation, revocation, scoping, rate limiting per key, usage tracking per key. We looked at existing solutions — most were bolt-on middleware that didn't integrate with the rest of the infrastructure.</p>

            <p>ACCESS was built to own the entire identity lifecycle. From key generation to usage tracking to automatic expiration. Every API key has scopes (which nodes can it access?), rate limits (how fast?), and quotas (how much per day?).</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">Tier-Based Entitlements</h2>
            <p>Not every customer needs every capability. Free tier gets NEXUS routing and basic BRAIN memory. Pro tier gets DEFENSE, VISION, and expanded memory. Enterprise gets everything, including nodes that haven't been released yet.</p>

            <p>ACCESS enforces these boundaries at the request level. Before any node processes a request, ACCESS validates the key, checks the tier, verifies the quota, and either passes it through or returns a clear error explaining what's missing.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">Usage as Data</h2>
            <p>The unexpected benefit of ACCESS was the data it generated. Every request, tagged by customer, tier, node, cost, and latency. We could see which nodes were most popular, which tiers were hitting their limits, and where pricing needed adjustment — all from ACCESS logs.</p>

            <p>ACCESS wasn't glamorous. Nobody gets excited about authentication. But it was the node that made the substrate a product instead of a project.</p>
          </div>
        </article>
      </main>
      <EnhancedFooter />
    </>
  );
}
