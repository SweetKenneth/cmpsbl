/**
 * Chapter 23: Trust But Verify — May 2025
 */
import { Link } from "react-router-dom";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { SEO } from "@/components/SEO";
import { BlogArticleJsonLd } from "@/components/blog/BlogArticleJsonLd";
import { BlogPostNav } from "@/components/blog/BlogPostNav";
import { RewrittenNotice } from "@/components/blog/RewrittenNotice";
import heroImg from "@/assets/blog/ai-governance-compliance-v9.jpg";

const SLUG = "trust-but-verify";

export default function TrustButVerify() {
  return (
    <>
      <SEO title="Trust But Verify — The PROOF Node" description="AI outputs are probabilistic. PROOF validates them against constraints, catches hallucinations, and ensures quality thresholds." type="article" image={heroImg} publishedTime="2025-05-18" keywords={["PROOF node", "AI validation", "hallucination detection"]} canonical={`https://cmpsbl.com/blog/${SLUG}`} topicCluster="substrate-nodes" breadcrumbs={[{ name: "Home", url: "https://cmpsbl.com" }, { name: "Blog", url: "https://cmpsbl.com/blog" }, { name: "Trust But Verify", url: `https://cmpsbl.com/blog/${SLUG}` }]} />
      <BlogArticleJsonLd title="Trust But Verify — The PROOF Node" description="Output validation and hallucination detection." slug={SLUG} datePublished="2025-05-18" imageUrl={heroImg} keywords={["PROOF", "validation", "hallucination"]} />
      <PublicNav />
      <main className="min-h-screen bg-background">
        <article className="container max-w-3xl mx-auto px-4 py-16">
          <img src={heroImg} alt="PROOF node validating AI outputs" className="w-full rounded-xl mb-8 aspect-video object-cover" />
          <h1 className="text-4xl font-black mb-4">Trust But Verify</h1>
          <p className="text-muted-foreground mb-8">May 18, 2025 · 13 min read · Written by the CMPSBL team</p>
          <RewrittenNotice />
          <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
            <p className="text-lg leading-relaxed">In May, a customer's chatbot confidently told a user their refund had been processed. It hadn't. The model hallucinated a transaction ID. That was the week we built PROOF.</p>

            <p>Every model hallucinates. The question isn't whether your AI will make things up — it's whether you'll catch it before your users do.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">Constraint-Based Validation</h2>
            <p>PROOF validates AI outputs against developer-defined constraints. "The response must reference only existing product IDs." "Code output must parse without syntax errors." "Numerical claims must be within 5% of source data." These aren't vibes — they're executable validation rules.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">Confidence Scoring</h2>
            <p>Every PROOF-validated output gets a confidence score from 0-100. High confidence passes through. Low confidence triggers re-generation with tighter constraints. Very low confidence escalates to a human review queue. This scoring system feeds into <Link to="/blog/seeing-everything-at-once" className="text-primary hover:underline">VISION's</Link> quality dashboards.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">The Hallucination Taxonomy</h2>
            <p>We categorized hallucinations into types: fabricated references (citing papers that don't exist), confident wrongness (stating incorrect facts with high certainty), context drift (answering a different question), and creative interpolation (filling gaps with plausible-but-wrong details). Each type requires a different detection strategy.</p>

            <p>PROOF didn't eliminate hallucinations. Nothing does. But it dropped our hallucination-to-user rate by 87%. Later, <Link to="/blog/the-governance-question" className="text-primary hover:underline">AUDIT</Link> used PROOF scores as part of its compliance evidence chain.</p>
          </div>
          <BlogPostNav slug={SLUG} />
        </article>
      </main>
      <EnhancedFooter />
    </>
  );
}
