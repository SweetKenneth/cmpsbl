/**
 * Chapter 11: How We Compare — June 2025
 */
import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { BlogArticleJsonLd } from "@/components/blog/BlogArticleJsonLd";
import { BlogArticleLayout } from "@/components/blog/BlogArticleLayout";
import heroImg from "@/assets/blog/ai-product-comparison-2025.jpg";
import imgDiff from "@/assets/blog/what-makes-clockless-different.jpg";

const SLUG = "how-we-compare";

export default function HowWeCompare() {
  return (
    <BlogArticleLayout slug={SLUG} title="How We Compare" subtitle="An honest look at the AI platform landscape" date="June 20, 2025" readTime="16 min read" heroImage={heroImg} heroAlt="AI platform landscape comparison" chapter={11} showRewrittenNotice={false} head={<><SEO title="How We Compare — Honest AI Platform Landscape" description="An honest comparison of CMPSBL against OpenAI, Anthropic, LangChain, and other AI platforms. What we do better. What they do better." type="article" image={heroImg} publishedTime="2025-06-20" keywords={["AI platform comparison", "CMPSBL vs OpenAI", "cognitive infrastructure comparison"]} canonical={`https://cmpsbl.com/blog/${SLUG}`} topicCluster="substrate-business" breadcrumbs={[{ name: "Home", url: "https://cmpsbl.com" }, { name: "Blog", url: "https://cmpsbl.com/blog" }, { name: "How We Compare", url: `https://cmpsbl.com/blog/${SLUG}` }]} /><BlogArticleJsonLd title="How We Compare — Honest AI Platform Landscape" description="Honest comparison of CMPSBL vs major AI platforms." slug={SLUG} datePublished="2025-06-20" imageUrl={heroImg} keywords={["AI comparison", "infrastructure landscape"]} /></>}>
      <p className="text-lg leading-relaxed">People ask us how we compare to <a href="https://openai.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">OpenAI</a>, <a href="https://anthropic.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Anthropic</a>, <a href="https://www.langchain.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">LangChain</a>, and the rest. The honest answer is: we're not competing with most of them. We're a different layer of the stack.</p>

      <h2 className="text-2xl font-bold text-foreground mt-8">What We're Not</h2>
      <p>We don't train models. We don't compete with GPT or Claude on model quality. We also don't compete with LangChain or <a href="https://www.llamaindex.ai/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">LlamaIndex</a> as frameworks. We're the infrastructure layer that sits beneath them.</p>

      <h2 className="text-2xl font-bold text-foreground mt-8">What We Are</h2>
      <p>We're cognitive infrastructure. The layer between your application and the AI providers. We handle <Link to="/blog/routing-the-unknown" className="text-primary hover:underline">routing</Link>, <Link to="/blog/teaching-machines-to-remember" className="text-primary hover:underline">memory</Link>, <Link to="/blog/when-bots-found-us-first" className="text-primary hover:underline">security</Link>, <Link to="/blog/seeing-everything-at-once" className="text-primary hover:underline">observability</Link>, <Link to="/blog/nodes-that-talk" className="text-primary hover:underline">event coordination</Link>, <Link to="/blog/identity-at-every-layer" className="text-primary hover:underline">identity</Link>, and <Link to="/blog/the-governance-question" className="text-primary hover:underline">governance</Link>.</p>

      <figure className="my-8">
        <img src={imgDiff} alt="What makes cognitive infrastructure different from traditional AI platforms" className="w-full rounded-xl aspect-video object-cover" loading="lazy" />
        <figcaption className="text-sm text-muted-foreground/70 mt-2 text-center">The cognitive infrastructure layer sits between your application and AI providers — complementing, not competing.</figcaption>
      </figure>

      <h2 className="text-2xl font-bold text-foreground mt-8">Where We're Better</h2>
      <p><strong>Persistent memory.</strong> No major platform offers cross-session, cross-deployment memory with tiered decay and consolidation. <Link to="/blog/teaching-machines-to-remember" className="text-primary hover:underline">BRAIN</Link> does.</p>
      <p><strong>Multi-provider routing.</strong> Most platforms are single-provider. <Link to="/blog/routing-the-unknown" className="text-primary hover:underline">NEXUS</Link> routes to the best provider for each request, automatically.</p>
      <p><strong>Integrated security.</strong> <Link to="/blog/when-bots-found-us-first" className="text-primary hover:underline">DEFENSE</Link> isn't middleware — it's woven into every request path.</p>

      <h2 className="text-2xl font-bold text-foreground mt-8">Where They're Better</h2>
      <p><strong>Model quality.</strong> OpenAI and Anthropic have the best models. Period.</p>
      <p><strong>Framework ecosystem.</strong> LangChain has thousands of integrations.</p>
      <p><strong>Enterprise maturity.</strong> <a href="https://aws.amazon.com/bedrock/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">AWS Bedrock</a> has SOC 2, HIPAA, FedRAMP.</p>

      <p>We're honest about this because trust matters more than positioning. Use us where we're strong. Use them where they're strong. Ideally, use us together — that's what we <Link to="/blog/building-on-the-substrate" className="text-primary hover:underline">designed for</Link>.</p>
    </BlogArticleLayout>
  );
}
