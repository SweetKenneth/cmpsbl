/**
 * Chapter 21: When One Model Isn't Enough — March 2025
 */
import { Link } from "react-router-dom";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { SEO } from "@/components/SEO";
import { BlogArticleJsonLd } from "@/components/blog/BlogArticleJsonLd";
import { BlogPostNav } from "@/components/blog/BlogPostNav";
import { RewrittenNotice } from "@/components/blog/RewrittenNotice";
import heroImg from "@/assets/blog/cascade-ai-adaptive-intelligence.jpg";
import imgCascade from "@/assets/blog/how-promptfluid-works-cascade.jpg";

const SLUG = "when-one-model-isnt-enough";

export default function WhenOneModelIsntEnough() {
  return (
    <>
      <SEO title="When One Model Isn't Enough — The CASCADE Node" description="A single LLM can't handle everything. CASCADE chains multiple models into adaptive pipelines that match complexity to capability." type="article" image={heroImg} publishedTime="2025-03-25" keywords={["CASCADE node", "multi-model pipelines", "adaptive AI"]} canonical={`https://cmpsbl.com/blog/${SLUG}`} topicCluster="substrate-nodes" breadcrumbs={[{ name: "Home", url: "https://cmpsbl.com" }, { name: "Blog", url: "https://cmpsbl.com/blog" }, { name: "When One Model Isn't Enough", url: `https://cmpsbl.com/blog/${SLUG}` }]} />
      <BlogArticleJsonLd title="When One Model Isn't Enough — The CASCADE Node" description="Multi-model pipelines that match complexity to capability." slug={SLUG} datePublished="2025-03-25" imageUrl={heroImg} keywords={["CASCADE", "multi-model", "adaptive"]} />
      <PublicNav />
      <main className="min-h-screen bg-background">
        <article className="container max-w-3xl mx-auto px-4 py-16">
          <img src={heroImg} alt="CASCADE adaptive intelligence pipeline" className="w-full rounded-xl mb-8 aspect-video object-cover" />
          <h1 className="text-4xl font-black mb-4">When One Model Isn't Enough</h1>
          <p className="text-muted-foreground mb-8">March 25, 2025 · 12 min read · Written by the CMPSBL team</p>
          <RewrittenNotice />
          <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
            <p className="text-lg leading-relaxed">By late March, <Link to="/blog/routing-the-unknown" className="text-primary hover:underline">NEXUS</Link> was routing requests to the best single model. But some problems don't have a "best single model." They need a pipeline.</p>

            <p>A legal document analysis might need GPT-4 for comprehension, Claude for summarization, and a specialized model for entity extraction. Sending the whole thing to one model meant paying for capability you didn't need — or missing capability you did.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">The Pipeline Pattern</h2>
            <p>CASCADE decomposes complex requests into stages. Each stage routes to the optimal model for that specific task. The output of one stage becomes the input for the next. A <a href="https://en.wikipedia.org/wiki/Pipeline_(computing)" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">pipeline architecture</a> where every step is cost-optimized and capability-matched.</p>

            <figure className="my-8">
              <img src={imgCascade} alt="CASCADE pipeline showing multiple models processing stages of a single request" className="w-full rounded-xl aspect-video object-cover" loading="lazy" />
              <figcaption className="text-sm text-muted-foreground/70 mt-2 text-center">CASCADE chains models into adaptive pipelines — each stage matched to the right capability.</figcaption>
            </figure>

            <h2 className="text-2xl font-bold text-foreground mt-8">Adaptive Complexity</h2>
            <p>Not every request needs a pipeline. CASCADE's first job is classifying request complexity. Simple queries go straight to a fast model. Medium complexity gets a two-stage pipeline. High complexity gets the full cascade. This classification alone cut our average cost per request by 40%.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">Error Propagation</h2>
            <p>Pipelines amplify errors. If stage one gets it wrong, stage two builds on a bad foundation. CASCADE validates between stages — each intermediate output gets a confidence score. Below threshold, the pipeline retries or falls back. This validation layer later evolved into <Link to="/blog/trust-but-verify" className="text-primary hover:underline">PROOF</Link>.</p>

            <p>CASCADE was where we first understood that the future of AI isn't picking the right model. It's orchestrating many models into something greater than any individual one. <Link to="/blog/breaking-problems-apart" className="text-primary hover:underline">DECODE</Link> took this further by handling the decomposition itself.</p>
          </div>
          <BlogPostNav slug={SLUG} />
        </article>
      </main>
      <EnhancedFooter />
    </>
  );
}
