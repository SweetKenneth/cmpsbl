/**
 * Chapter 23: Trust But Verify — May 2025
 */
import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { BlogArticleJsonLd } from "@/components/blog/BlogArticleJsonLd";
import { BlogArticleLayout } from "@/components/blog/BlogArticleLayout";
import heroImg from "@/assets/blog/ai-governance-compliance-v9.jpg";

const SLUG = "trust-but-verify";

export default function TrustButVerify() {
  return (
    <BlogArticleLayout slug={SLUG} title="Trust But Verify" subtitle="Output validation, hallucination detection, and the PROOF node" date="May 18, 2025" readTime="17 min read" heroImage={heroImg} heroAlt="PROOF node validating AI outputs" chapter={23} head={<><SEO title="Trust But Verify — The PROOF Node" description="AI outputs are probabilistic. PROOF validates them against constraints, catches hallucinations, and ensures quality thresholds." type="article" image={heroImg} publishedTime="2025-05-18" keywords={["PROOF node", "AI validation", "hallucination detection"]} canonical={`https://cmpsbl.com/blog/${SLUG}`} topicCluster="substrate-nodes" breadcrumbs={[{ name: "Home", url: "https://cmpsbl.com" }, { name: "Blog", url: "https://cmpsbl.com/blog" }, { name: "Trust But Verify", url: `https://cmpsbl.com/blog/${SLUG}` }]} /><BlogArticleJsonLd title="Trust But Verify — The PROOF Node" description="Output validation and hallucination detection." slug={SLUG} datePublished="2025-05-18" imageUrl={heroImg} keywords={["PROOF", "validation", "hallucination"]} /></>}>
      <p className="text-lg leading-relaxed">In May, a customer's chatbot confidently told a user their refund had been processed. It hadn't. The model hallucinated a transaction ID. That was the week we built PROOF.</p>
      <p>Every model hallucinates. The question isn't whether your AI will make things up — it's whether you'll catch it before your users do. The refund incident wasn't catastrophic — the customer caught it before money moved — but it was a preview of what happens when you deploy AI without validation. We couldn't ship faster and hope for the best. We needed a systematic answer.</p>

      <h2 className="text-2xl font-bold text-foreground mt-8">Constraint-Based Validation</h2>
      <p>PROOF validates AI outputs against developer-defined constraints. "The response must reference only existing product IDs." "Code output must parse without syntax errors." "Numerical claims must be within 5% of source data." These aren't vibes — they're executable validation rules.</p>
      <p>Constraints come in three flavors. <strong>Structural constraints</strong> check format — valid JSON, parseable code, correct schema. These catch about 15% of problems and are the cheapest to run. <strong>Referential constraints</strong> verify that referenced entities exist — product IDs, customer names, database records. These catch fabricated references, the most common hallucination type in enterprise contexts. <strong>Semantic constraints</strong> check logical consistency — do the numbers add up? Does the conclusion follow from the evidence? These are the hardest to implement but catch the most dangerous errors: outputs that look right but are substantively wrong.</p>
      <p>We built a constraint DSL (domain-specific language) so developers can define validation rules declaratively. A financial services customer wrote 47 constraints in their first week. "Revenue projections must not exceed 3x historical growth rate." "Competitor names must exist in our market database." "Risk ratings must correlate with provided financial ratios." These constraints caught 23 hallucinations in the first month that would have reached end users.</p>

      <h2 className="text-2xl font-bold text-foreground mt-8">Confidence Scoring</h2>
      <p>Every PROOF-validated output gets a confidence score from 0-100. High confidence passes through. Low confidence triggers re-generation with tighter constraints. Very low confidence escalates to a human review queue. This scoring system feeds into <Link to="/blog/seeing-everything-at-once" className="text-primary hover:underline">VISION's</Link> quality dashboards.</p>
      <p>The scoring model combines multiple signals: constraint pass rate, internal consistency checks, source attribution strength, and historical accuracy for similar request types. A score of 90+ means all constraints passed and the output matches high-confidence historical patterns. A score below 40 means multiple constraint failures or anomalous patterns that the system has never seen before. The thresholds are configurable per customer — a medical information provider might set their pass threshold at 95, while a creative writing tool might accept 60.</p>

      <h2 className="text-2xl font-bold text-foreground mt-8">The Hallucination Taxonomy</h2>
      <p>We categorized hallucinations into types: fabricated references (citing papers that don't exist), confident wrongness (stating incorrect facts with high certainty), context drift (answering a different question), and creative interpolation (filling gaps with plausible-but-wrong details). Each type requires a different detection strategy.</p>
      <p>Fabricated references are the easiest to catch — cross-reference against known databases. Confident wrongness is harder — you need external knowledge to verify claims. Context drift is detectable by comparing input intent with output topic. Creative interpolation is the hardest because the output is internally consistent and stylistically appropriate; it just happens to be wrong. For creative interpolation, we developed a "provenance tracing" approach: every claim in the output must trace back to either the input data or a verified knowledge source. Claims without provenance get flagged.</p>

      <h2 className="text-2xl font-bold text-foreground mt-8">The Re-Generation Loop</h2>
      <p>When PROOF rejects an output, it doesn't just say "try again." It provides structured feedback to the generation pipeline about what failed. "The third paragraph references a non-existent case study. Regenerate with this constraint: all case studies must come from the following verified list." This targeted re-generation produces better second attempts than naive retries. Our data shows that targeted re-generation succeeds on the first retry 78% of the time, compared to 31% for blind retries.</p>
      <p>PROOF didn't eliminate hallucinations. Nothing does. But it dropped our hallucination-to-user rate by 87%. Later, <Link to="/blog/the-governance-question" className="text-primary hover:underline">AUDIT</Link> used PROOF scores as part of its compliance evidence chain, and the constraint system became a selling point for regulated industries where output accuracy isn't optional — it's legally required.</p>
    </BlogArticleLayout>
  );
}
