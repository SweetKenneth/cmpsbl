/**
 * Chapter 16: The Governance Question — November 2025
 * Runtime compliance and why it matters.
 */
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { SEO } from "@/components/SEO";
import heroImg from "@/assets/blog/ai-governance-compliance-v9.jpg";

export default function TheGovernanceQuestion() {
  return (
    <>
      <SEO
        title="The Governance Question — Runtime AI Compliance"
        description="AI governance has been a whitepaper exercise. With AUDIT and IDENTITY, we made it a runtime property — cryptographic proof that guardrails were active."
        type="article"
        publishedTime="2025-11-10"
        keywords={['AI governance runtime', 'compliance logging', 'cryptographic audit trail', 'actor attribution', 'AUDIT node']}
      />
      <PublicNav />
      <main className="min-h-screen bg-background">
        <article className="container max-w-3xl mx-auto px-4 py-16">
          <img src={heroImg} alt="AI governance and compliance framework" className="w-full rounded-xl mb-8 aspect-video object-cover" />
          <h1 className="text-4xl font-black mb-4">The Governance Question</h1>
          <p className="text-muted-foreground mb-8">November 10, 2025 · 13 min read · Written by the CMPSBL team</p>
          <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
            <p className="text-lg leading-relaxed">Enterprise customers started asking the question we'd been avoiding: "Can you prove your AI was operating within bounds at 3:47 AM on Tuesday?" We couldn't. Our logging was good but not provable. That gap between "we logged it" and "we can prove it" became the entire focus of November.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">AUDIT: Cryptographic Logging</h2>
            <p>AUDIT introduced hash-chained compliance logs. Every capability invocation, every model call, every data access gets recorded in an append-only ledger where each entry includes a hash of the previous entry. Tampering with any record breaks the chain — the same guarantee that makes blockchains trustworthy, without the overhead.</p>

            <p>This sounds like over-engineering until a compliance auditor asks "prove that your AI guardrails were active during this incident." With AUDIT, you can. Without it, you're trusting that logs weren't modified after the fact.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">IDENTITY: Who Did What</h2>
            <p>The second problem was attribution. When something goes wrong in an AI system, you need to know who initiated the action — was it a human operator, an automated pipeline, or an AI agent acting autonomously? In complex systems, the answer is often unclear.</p>

            <p>IDENTITY tags every action with a verified identity token. The token includes the actor type (human, agent, pipeline), the authentication method, the authorization scope, and a timestamp. Complete provenance for every decision in the system.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">The Regulatory Reality</h2>
            <p>The EU AI Act. NIST's AI Risk Management Framework. SOC 2. HIPAA. Regulated industries need more than "we have guardrails" — they need "here's the cryptographic proof that guardrails were enforced during every operation." That's what AUDIT and IDENTITY provide.</p>

            <p>We built governance infrastructure not because it's exciting — it isn't — but because without it, the substrate can't enter the markets that need it most.</p>
          </div>
        </article>
      </main>
      <EnhancedFooter />
    </>
  );
}
