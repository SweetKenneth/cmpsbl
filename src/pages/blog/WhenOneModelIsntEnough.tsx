/**
 * Chapter 21: When One Model Isn't Enough — March 2025
 */
import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { BlogArticleJsonLd } from "@/components/blog/BlogArticleJsonLd";
import { BlogArticleLayout } from "@/components/blog/BlogArticleLayout";
import heroImg from "@/assets/blog/cascade-ai-adaptive-intelligence.jpg";
import imgCascade from "@/assets/blog/how-promptfluid-works-cascade.jpg";

const SLUG = "when-one-model-isnt-enough";

export default function WhenOneModelIsntEnough() {
  return (
    <BlogArticleLayout slug={SLUG} title="When One Model Isn't Enough" subtitle="Multi-model chains that match complexity to capability" date="March 25, 2025" readTime="16 min read" heroImage={heroImg} heroAlt="CORTEX adaptive intelligence system" chapter={21} head={<><SEO title="When One Model Isn't Enough — The CORTEX Engine" description="A single LLM can't handle everything. CORTEX chains multiple models into adaptive processes that match complexity to capability." type="article" image={heroImg} publishedTime="2025-03-25" keywords={["CORTEX engine", "multi-model chains", "adaptive AI"]} canonical={`https://cmpsbl.com/blog/${SLUG}`} topicCluster="substrate-primitives" breadcrumbs={[{ name: "Home", url: "https://cmpsbl.com" }, { name: "Blog", url: "https://cmpsbl.com/blog" }, { name: "When One Model Isn't Enough", url: `https://cmpsbl.com/blog/${SLUG}` }]} /><BlogArticleJsonLd title="When One Model Isn't Enough — The CORTEX Engine" description="Multi-model chains that match complexity to capability." slug={SLUG} datePublished="2025-03-25" imageUrl={heroImg} keywords={["CORTEX", "multi-model", "adaptive"]} /></>}>
      <p className="text-sm sm:text-base leading-relaxed">By late March, <Link to="/blog/routing-the-unknown" className="text-primary hover:underline">NEXUS</Link> was routing requests to the best single model. But some problems don't have a "best single model." They need a chain.</p>
      <p>A legal document analysis might need GPT-4 for comprehension, Claude for summarization, and a specialized model for entity extraction. Sending the whole thing to one model meant paying for capability you didn't need — or missing capability you did. We were watching requests fail not because any model was bad, but because no single model was good enough at everything the request demanded.</p>

      <h2 className="text-2xl font-bold text-foreground mt-8">The Pipeline Pattern</h2>
      <p>CORTEX decomposes complex requests into stages. Each stage routes to the optimal model for that specific task. The output of one stage becomes the input for the next. A <a href="https://en.wikipedia.org/wiki/Pipeline_(computing)" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">pipeline architecture</a> where every step is cost-optimized and capability-matched.</p>
      <p>The key insight was that pipeline stages aren't just sequential — they can branch and merge. A document analysis might fork into parallel comprehension and entity extraction paths, then merge at a synthesis stage. This directed acyclic graph approach gives CORTEX the flexibility to handle workflows that linear pipelines can't express. We spent two weeks getting the merge semantics right — how do you combine outputs from two models that disagree? — and the solution involved confidence-weighted averaging that later became a core primitive across the substrate.</p>

      <figure className="my-8">
        <img src={imgCascade} alt="CORTEX pipeline showing multiple models processing stages of a single request" className="w-full rounded-xl aspect-video object-cover" loading="lazy" />
        <figcaption className="text-sm text-muted-foreground/70 mt-2 text-center">CORTEX chains models into adaptive pipelines — each stage matched to the right capability.</figcaption>
      </figure>

      <h2 className="text-2xl font-bold text-foreground mt-8">Adaptive Complexity</h2>
      <p>Not every request needs a pipeline. CORTEX's first job is classifying request complexity. Simple queries go straight to a fast model. Medium complexity gets a two-stage pipeline. High complexity gets the full cortex. This classification alone cut our average cost per request by 40%.</p>
      <p>The complexity classifier itself is a lightweight model — fine-tuned on six months of NEXUS routing data. It looks at token count, domain keywords, structural patterns (does the prompt contain multiple questions? code blocks? tabular data?), and historical performance data for similar requests. Classification adds about 15ms of latency but saves an average of $0.003 per request at scale. When you're processing hundreds of thousands of requests daily, that's the difference between a profitable product and an expensive hobby.</p>

      <h2 className="text-2xl font-bold text-foreground mt-8">Error Propagation</h2>
      <p>Pipelines amplify errors. If stage one gets it wrong, stage two builds on a bad foundation. CORTEX validates between stages — each intermediate output gets a confidence score. Below threshold, the pipeline retries or falls back. This validation layer later evolved into <Link to="/blog/trust-but-verify" className="text-primary hover:underline">AUDIT</Link>.</p>
      <p>We learned this the hard way. In our first week of testing, a three-stage pipeline for financial analysis produced a report that cited statistics from a hallucinated study. Stage one generated the analysis. Stage two summarized it — including the hallucinated citation. Stage three formatted it into a professional report, making the hallucination look even more authoritative. The confidence of the final output was high because each individual stage performed well. But garbage in, confident garbage out. Inter-stage validation wasn't optional — it was the difference between a product you could trust and one you couldn't.</p>

      <h2 className="text-2xl font-bold text-foreground mt-8">Model Selection Strategy</h2>
      <p>CORTEX maintains a capability matrix — a scored grid of which models perform best at which tasks. This matrix isn't static. Every pipeline execution updates the scores based on actual output quality. A model that underperforms on entity extraction in legal documents gets deprioritized for that specific stage. Over time, CORTEX builds a highly specialized understanding of model strengths that goes far beyond published benchmarks.</p>
      <p>We also discovered that model version updates could silently break pipelines. When a provider updates their model, the capability profile shifts — sometimes subtly, sometimes dramatically. CORTEX now runs shadow pipelines on model updates, comparing outputs to the previous version before switching production traffic. This canary system caught three regressions in Q2 2025 alone that would have degraded customer-facing outputs.</p>

      <h2 className="text-2xl font-bold text-foreground mt-8">The Cost Equation</h2>
      <p>Multi-model pipelines sound expensive. In practice, they're cheaper than single-model approaches for complex tasks. A $0.01/token model handling a task it takes 2000 tokens to complete poorly costs more than a three-stage pipeline using $0.001, $0.005, and $0.002/token models that complete the same task in 800 total tokens with higher quality. CORTEX optimizes for cost-adjusted quality — the best output per dollar spent.</p>
      <p>CORTEX was where we first understood that the future of AI isn't picking the right model. It's orchestrating many models into something greater than any individual one. <Link to="/blog/breaking-problems-apart" className="text-primary hover:underline">DECODE</Link> took this further by handling the decomposition itself.</p>
    </BlogArticleLayout>
  );
}
