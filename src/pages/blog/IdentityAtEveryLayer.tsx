/**
 * Chapter 7: Identity at Every Layer — April 2025
 */
import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { BlogArticleJsonLd } from "@/components/blog/BlogArticleJsonLd";
import { BlogArticleLayout } from "@/components/blog/BlogArticleLayout";
import heroImg from "@/assets/blog/promptfluid-access-identity-billing.jpg";
import imgSetup from "@/assets/blog/clockless-account-setup-artifact-packs.jpg";

const SLUG = "identity-at-every-layer";

export default function IdentityAtEveryLayer() {
  return (
    <BlogArticleLayout slug={SLUG} title="Identity at Every Layer" subtitle="Authentication, API keys, and tier-based entitlements" date="April 15, 2025" readTime="10 min read" heroImage={heroImg} heroAlt="ACCESS organ identity and entitlements" chapter={7} showRewrittenNotice={false} head={<><SEO title="Identity at Every Layer — The ACCESS Organ" description="Authentication, API keys, rate limits, and tier-based entitlements. How ACCESS made the substrate safe to open to the world." type="article" image={heroImg} publishedTime="2025-04-15" keywords={["API identity management", "ACCESS organ", "tier-based entitlements", "API key lifecycle"]} canonical={`https://cmpsbl.com/blog/${SLUG}`} topicCluster="substrate-primitives" breadcrumbs={[{ name: "Home", url: "https://cmpsbl.com" }, { name: "Blog", url: "https://cmpsbl.com/blog" }, { name: "Identity at Every Layer", url: `https://cmpsbl.com/blog/${SLUG}` }]} /><BlogArticleJsonLd title="Identity at Every Layer — The ACCESS Organ" description="How ACCESS made the substrate safe with identity and entitlements." slug={SLUG} datePublished="2025-04-15" imageUrl={heroImg} keywords={["ACCESS", "identity", "API keys"]} /></>}>
      <p className="text-sm sm:text-base leading-relaxed">We were ready to let other people use the substrate. But "other people" meant strangers on the internet hitting our API with requests we couldn't predict. We needed to know who was calling, what they were allowed to do, and how much of it they could do. The gap between "internal tool" and "public product" is wider than most engineers realize — and it's mostly filled with identity infrastructure.</p>

      <h2 className="text-2xl font-bold text-foreground mt-8">The API Key Problem</h2>
      <p>API keys seem simple until you need to manage thousands of them. ACCESS was built to own the entire <a href="https://cheatsheetseries.owasp.org/cheatsheets/API_Security_Cheat_Sheet.html" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">identity lifecycle</a>. From key generation to usage tracking to automatic expiration. Every API key has scopes (which primitives can it access?), rate limits (how fast?), and quotas (how much per day?).</p>
      <p>The first design was too simple — a key was just a string mapped to a customer ID. Then we needed to support multiple keys per customer (test vs. production), key rotation without downtime, emergency revocation, and scope-based access control. ACCESS ended up with a full key lifecycle: generation → activation → rotation → deactivation → expiration. Each transition is logged, auditable, and reversible within a grace period.</p>
      <p>Key storage was its own challenge. We hash keys with SHA-256 and store only the hash plus a four-character prefix for identification. The full key is shown once at creation and never again. This means even if our database is compromised, the attacker gets useless hashes. We learned this pattern from <a href="https://stripe.com/docs/keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Stripe's key management</a> — no need to reinvent what's proven.</p>

      <h2 className="text-2xl font-bold text-foreground mt-8">Tier-Based Entitlements</h2>
      <p>Not every customer needs every capability. Free tier gets <Link to="/blog/routing-the-unknown" className="text-primary hover:underline">NEXUS</Link> routing and basic <Link to="/blog/teaching-machines-to-remember" className="text-primary hover:underline">BRAIN</Link> memory. Pro tier gets <Link to="/blog/when-bots-found-us-first" className="text-primary hover:underline">DEFENSE</Link>, <Link to="/blog/seeing-everything-at-once" className="text-primary hover:underline">VISION</Link>, and expanded memory. Enterprise gets everything plus custom retention policies and dedicated support.</p>
      <figure className="my-8"><img src={imgSetup} alt="Developer account setup with API keys and tier-based entitlements" className="w-full rounded-xl aspect-video object-cover" loading="lazy" /><figcaption className="text-sm text-muted-foreground/70 mt-2 text-center">ACCESS manages the complete identity lifecycle — from onboarding to API key management to tier entitlements.</figcaption></figure>
      <p>ACCESS enforces these boundaries at the request level. Before any node processes a request, ACCESS validates the key, checks the tier, verifies the quota, and either passes it through or returns a clear error. This validation adds about 3ms to every request — a cost we spent weeks optimizing down from the original 15ms by caching entitlement lookups and using bloom filters for rapid key validation.</p>

      <h2 className="text-2xl font-bold text-foreground mt-8">Rate Limiting That Learns</h2>
      <p>Static rate limits are frustrating for customers. A developer building an integration hits the limit during a burst of testing and has to wait. ACCESS uses adaptive rate limiting: the baseline limit applies, but short bursts are allowed up to 3x the rate for 30 seconds. If the burst is sustained, it clamps back down. This feels fair to developers while still protecting the system from abuse.</p>
      <p>We also implemented per-primitive rate limits, not just per-key. A customer might be allowed 1000 requests per minute total, but only 100 per minute to BRAIN Organ (which is expensive) and 500 per minute to NEXUS Organ (which is cheap). This granularity prevents customers from accidentally spending their entire quota on expensive operations.</p>

      <h2 className="text-2xl font-bold text-foreground mt-8">Usage as Data</h2>
      <p>Every request, tagged by customer, tier, node, cost, and latency. We could see which primitives were most popular, which tiers were hitting their limits, and where customers were struggling. This data later became essential for <Link to="/blog/the-governance-question" className="text-primary hover:underline">AUDIT's cryptographic logging</Link> — every usage record feeds the compliance chain.</p>
      <p>ACCESS wasn't glamorous. Nobody gets excited about authentication. But it was the node that made the substrate a product instead of a project. Without ACCESS, we had a technology demo. With ACCESS, we had something customers could depend on. For how we later extended this to <Link to="/blog/building-on-the-substrate" className="text-primary hover:underline">developer experience</Link>, see Chapter 9.</p>
    </BlogArticleLayout>
  );
}
