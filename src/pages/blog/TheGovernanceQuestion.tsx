/**
 * Chapter 16: The Governance Question — November 2025
 */
import { Link } from "react-router-dom";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { SEO } from "@/components/SEO";
import { BlogArticleJsonLd } from "@/components/blog/BlogArticleJsonLd";
import { BlogPostNav } from "@/components/blog/BlogPostNav";
import heroImg from "@/assets/blog/ai-governance-compliance-v9.jpg";

const SLUG = "the-governance-question";

export default function TheGovernanceQuestion() {
  return (
    <>
      <SEO title="The Governance Question — Runtime AI Compliance" description="AI governance has been a whitepaper exercise. With AUDIT and IDENTITY, we made it a runtime property — cryptographic proof that guardrails were active." type="article" publishedTime="2025-11-10" keywords={["AI governance runtime", "compliance logging", "cryptographic audit trail", "AUDIT node"]} canonical={`https://cmpsbl.com/blog/${SLUG}`} topicCluster="substrate-governance" breadcrumbs={[{ name: "Home", url: "https://cmpsbl.com" }, { name: "Blog", url: "https://cmpsbl.com/blog" }, { name: "The Governance Question", url: `https://cmpsbl.com/blog/${SLUG}` }]} />
      <BlogArticleJsonLd title="The Governance Question — Runtime AI Compliance" description="Cryptographic proof that AI guardrails were active at runtime." slug={SLUG} datePublished="2025-11-10" imageUrl={heroImg} keywords={["AUDIT", "governance", "compliance"]} />
      <PublicNav />
      <main className="min-h-screen bg-background">
        <article className="container max-w-3xl mx-auto px-4 py-16">
          <img src={heroImg} alt="AI governance and compliance framework" className="w-full rounded-xl mb-8 aspect-video object-cover" />
          <h1 className="text-4xl font-black mb-4">The Governance Question</h1>
          <p className="text-muted-foreground mb-8">November 10, 2025 · 13 min read · Written by the CMPSBL team</p>
          <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
            <p className="text-lg leading-relaxed">Enterprise customers started asking the question we'd been avoiding: "Can you prove your AI was operating within bounds at 3:47 AM on Tuesday?" We couldn't. That gap between "we logged it" and "we can prove it" became the entire focus of November.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">AUDIT: Cryptographic Logging</h2>
            <p>AUDIT introduced <a href="https://en.wikipedia.org/wiki/Hash_chain" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">hash-chained</a> compliance logs. Every capability invocation gets recorded in an append-only ledger where each entry includes a hash of the previous entry. Tampering breaks the chain — the same guarantee that makes blockchains trustworthy, without the overhead.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">IDENTITY: Who Did What</h2>
            <p>The second problem was attribution. When something goes wrong, you need to know who initiated the action. IDENTITY tags every action with a verified identity token — actor type, authentication method, authorization scope. Complete provenance. This extends <Link to="/blog/identity-at-every-layer" className="text-primary hover:underline">ACCESS</Link> from "who are you" to "what did you do."</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">The Regulatory Reality</h2>
            <p>The <a href="https://artificialintelligenceact.eu/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">EU AI Act</a>. <a href="https://www.nist.gov/artificial-intelligence/executive-order-safe-secure-and-trustworthy-artificial-intelligence" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">NIST's AI Risk Management Framework</a>. SOC 2. HIPAA. Regulated industries need cryptographic proof that guardrails were enforced during every operation.</p>

            <p>We built governance infrastructure not because it's exciting but because without it, the substrate can't enter the markets that need it most. <Link to="/blog/cybersecurity-through-cognition" className="text-primary hover:underline">DEFENSE's zero-trust mesh</Link> and <Link to="/blog/protocols-for-machines" className="text-primary hover:underline">RELAY's protocol contracts</Link> both depend on this governance layer.</p>
          </div>
          <BlogPostNav slug={SLUG} />
        </article>
      </main>
      <EnhancedFooter />
    </>
  );
}
