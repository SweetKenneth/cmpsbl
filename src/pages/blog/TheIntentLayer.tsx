/**
 * Chapter 31: The Intent Layer — November 2025
 */
import { Link } from "react-router-dom";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { SEO } from "@/components/SEO";
import { BlogArticleJsonLd } from "@/components/blog/BlogArticleJsonLd";
import { BlogPostNav } from "@/components/blog/BlogPostNav";
import { RewrittenNotice } from "@/components/blog/RewrittenNotice";
import heroImg from "@/assets/blog/ai-triad-intelligent-routing.jpg";

const SLUG = "the-intent-layer";

export default function TheIntentLayer() {
  return (
    <>
      <SEO title="The Intent Layer — Intent Mesh" description="The Intent Mesh translates natural language into substrate operations across any number of nodes." type="article" image={heroImg} publishedTime="2025-11-20" keywords={["Intent Mesh", "natural language routing", "semantic routing"]} canonical={`https://cmpsbl.com/blog/${SLUG}`} topicCluster="substrate-nodes" breadcrumbs={[{ name: "Home", url: "https://cmpsbl.com" }, { name: "Blog", url: "https://cmpsbl.com/blog" }, { name: "The Intent Layer", url: `https://cmpsbl.com/blog/${SLUG}` }]} />
      <BlogArticleJsonLd title="The Intent Layer — Intent Mesh" description="Natural language to substrate operations." slug={SLUG} datePublished="2025-11-20" imageUrl={heroImg} keywords={["Intent Mesh", "NLU", "routing"]} />
      <PublicNav />
      <main className="min-h-screen bg-background">
        <article className="container max-w-3xl mx-auto px-4 py-16">
          <img src={heroImg} alt="Intent Mesh routing natural language to substrate nodes" className="w-full rounded-xl mb-8 aspect-video object-cover" />
          <h1 className="text-4xl font-black mb-4">The Intent Layer</h1>
          <p className="text-muted-foreground mb-8">November 20, 2025 · 17 min read · Written by the CMPSBL team</p>
          <RewrittenNotice />
          <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
            <p className="text-lg leading-relaxed">"I want to know if my website is secure and accessible." That's a sentence a human says. What the substrate hears is: invoke <Link to="/blog/when-bots-found-us-first" className="text-primary hover:underline">DEFENSE</Link> for security scanning, invoke <Link to="/blog/accessibility-is-infrastructure" className="text-primary hover:underline">INCLUSIVE</Link> for accessibility auditing, merge results through <Link to="/blog/breaking-problems-apart" className="text-primary hover:underline">DECODE</Link>, and format via <Link to="/blog/from-thought-to-artifact" className="text-primary hover:underline">FORGE</Link>. The Intent Mesh bridges that gap.</p>

            <p>Before the Intent Mesh, using the substrate required knowing its vocabulary. Developers had to specify which nodes to invoke, what parameters to pass, and how to compose operations. It was powerful but opaque — like writing SQL when you want to ask a question. The Intent Mesh is the natural language interface that turns questions into queries.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">Intent Classification</h2>
            <p>The mesh classifies user intent at multiple levels. What domain? (security, accessibility, content). What operation? (analyze, generate, monitor). What scope? (one page, whole site, ongoing). Each classification narrows which nodes participate and how they interact.</p>

            <p>Classification isn't binary — it's probabilistic. "Check my site" might be 70% security, 20% accessibility, 10% performance. The mesh uses these probabilities to weight node participation. High-probability intents get primary resources. Lower-probability intents get secondary resources in case the primary interpretation was wrong. This hedging strategy means the mesh delivers useful results even when its initial classification is slightly off — which happens about 15% of the time with ambiguous inputs.</p>

            <p>We trained the classifier on 50,000 real user inputs collected during our beta period (with consent and anonymization). The training data revealed interesting patterns: users rarely ask for exactly one thing. "Is my site secure?" almost always implies "and what should I fix?" The mesh learned to include remediation in its execution plan for security queries, even when the user didn't explicitly ask for fixes.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">Multi-Node Orchestration</h2>
            <p>Simple intents map to single nodes. Complex intents fan out across the substrate. The Intent Mesh builds an execution plan — a directed graph of node invocations with data dependencies — and executes it through <Link to="/blog/nodes-that-talk" className="text-primary hover:underline">RIPPLE</Link>. The user sees one response. The substrate performed twelve operations.</p>

            <p>The execution planner is the most sophisticated part of the Intent Mesh. It considers node capabilities, current load, cost, and expected quality when building plans. A plan for "analyze my competitor's website" might involve DEFENSE for technical analysis, BRAIN for historical context from previous analyses, DECODE for structural decomposition, CASCADE for multi-model synthesis, PROOF for validation, and FORGE for report generation — all orchestrated in the correct dependency order with parallel execution where possible. Plan construction takes about 200ms. Plan execution takes seconds to minutes depending on complexity.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">Learning From Misses</h2>
            <p>When users rephrase or retry, the mesh learns. "That's not what I meant" signals are gold. Every correction refines the intent classification model. Over time, the mesh anticipates what users want before they finish typing — the same pattern that <Link to="/blog/interfaces-that-think" className="text-primary hover:underline">MORPH</Link> uses to pre-render interfaces.</p>

            <p>We track a metric called "intent satisfaction rate" — the percentage of intents that produce the result the user wanted on the first try. It started at 67% during beta. By November it reached 84%. The improvement comes almost entirely from the learning loop: corrections from the 16% of misses continuously refine the classifier. We estimate the theoretical ceiling is around 92%, with the remaining 8% being genuinely ambiguous inputs that even a human coordinator would need to clarify.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">Intent Composition</h2>
            <p>Advanced users discovered they could compose intents. "Run a security scan, then for each critical finding, generate a fix, test it, and add it to my CI pipeline." This is actually five intents chained together with conditional logic. The mesh supports this through intent composition — building complex workflows from simple natural language descriptions. It's the most powerful way to use the substrate, and it emerged organically from users pushing the boundaries of what they could express.</p>

            <p>The Intent Mesh was the final abstraction layer. Users no longer need to know about nodes, capabilities, or substrate architecture. They just say what they want. The substrate figures out the rest.</p>
          </div>
          <BlogPostNav slug={SLUG} />
        </article>
      </main>
      <EnhancedFooter />
    </>
  );
}