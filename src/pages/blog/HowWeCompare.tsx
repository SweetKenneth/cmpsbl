/**
 * Chapter 11: How We Compare — June 2025
 */
import { Link } from "react-router-dom";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { SEO } from "@/components/SEO";
import { BlogArticleJsonLd } from "@/components/blog/BlogArticleJsonLd";
import { BlogPostNav } from "@/components/blog/BlogPostNav";
import heroImg from "@/assets/blog/ai-product-comparison-2025.jpg";

const SLUG = "how-we-compare";

export default function HowWeCompare() {
  return (
    <>
      <SEO title="How We Compare — Honest AI Platform Landscape" description="An honest comparison of CMPSBL against OpenAI, Anthropic, LangChain, and other AI platforms. What we do better. What they do better." type="article" publishedTime="2025-06-20" keywords={["AI platform comparison", "CMPSBL vs OpenAI", "cognitive infrastructure comparison"]} canonical={`https://cmpsbl.com/blog/${SLUG}`} topicCluster="substrate-business" breadcrumbs={[{ name: "Home", url: "https://cmpsbl.com" }, { name: "Blog", url: "https://cmpsbl.com/blog" }, { name: "How We Compare", url: `https://cmpsbl.com/blog/${SLUG}` }]} />
      <BlogArticleJsonLd title="How We Compare — Honest AI Platform Landscape" description="Honest comparison of CMPSBL vs major AI platforms." slug={SLUG} datePublished="2025-06-20" imageUrl={heroImg} keywords={["AI comparison", "infrastructure landscape"]} />
      <PublicNav />
      <main className="min-h-screen bg-background">
        <article className="container max-w-3xl mx-auto px-4 py-16">
          <img src={heroImg} alt="AI platform landscape comparison" className="w-full rounded-xl mb-8 aspect-video object-cover" />
          <h1 className="text-4xl font-black mb-4">How We Compare</h1>
          <p className="text-muted-foreground mb-8">June 20, 2025 · 16 min read · Written by the CMPSBL team</p>
          <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
            <p className="text-lg leading-relaxed">People ask us how we compare to <a href="https://openai.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">OpenAI</a>, <a href="https://anthropic.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Anthropic</a>, <a href="https://www.langchain.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">LangChain</a>, and the rest. The honest answer is: we're not competing with most of them. We're a different layer of the stack.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">What We're Not</h2>
            <p>We don't train models. We don't compete with GPT or Claude on model quality. We also don't compete with LangChain or <a href="https://www.llamaindex.ai/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">LlamaIndex</a> as frameworks. We're the infrastructure layer that sits beneath them.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">What We Are</h2>
            <p>We're cognitive infrastructure. The layer between your application and the AI providers. We handle <Link to="/blog/routing-the-unknown" className="text-primary hover:underline">routing</Link>, <Link to="/blog/teaching-machines-to-remember" className="text-primary hover:underline">memory</Link>, <Link to="/blog/when-bots-found-us-first" className="text-primary hover:underline">security</Link>, <Link to="/blog/seeing-everything-at-once" className="text-primary hover:underline">observability</Link>, <Link to="/blog/nodes-that-talk" className="text-primary hover:underline">event coordination</Link>, <Link to="/blog/identity-at-every-layer" className="text-primary hover:underline">identity</Link>, and <Link to="/blog/the-governance-question" className="text-primary hover:underline">governance</Link>.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">Where We're Better</h2>
            <p><strong>Persistent memory.</strong> No major platform offers cross-session, cross-deployment memory with tiered decay and consolidation. <Link to="/blog/teaching-machines-to-remember" className="text-primary hover:underline">BRAIN</Link> does.</p>
            <p><strong>Multi-provider routing.</strong> Most platforms are single-provider. <Link to="/blog/routing-the-unknown" className="text-primary hover:underline">NEXUS</Link> routes to the best provider for each request, automatically.</p>
            <p><strong>Integrated security.</strong> <Link to="/blog/when-bots-found-us-first" className="text-primary hover:underline">DEFENSE</Link> isn't middleware — it's woven into every request path.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">Where They're Better</h2>
            <p><strong>Model quality.</strong> OpenAI and Anthropic have the best models. Period.</p>
            <p><strong>Framework ecosystem.</strong> LangChain has thousands of integrations.</p>
            <p><strong>Enterprise maturity.</strong> <a href="https://aws.amazon.com/bedrock/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">AWS Bedrock</a> has SOC 2, HIPAA, FedRAMP.</p>

            <p>We're honest about this because trust matters more than positioning. Use us where we're strong. Use them where they're strong. Ideally, use us together — that's what we <Link to="/blog/building-on-the-substrate" className="text-primary hover:underline">designed for</Link>.</p>
          </div>
          <BlogPostNav slug={SLUG} />
        </article>
      </main>
      <EnhancedFooter />
    </>
  );
}
