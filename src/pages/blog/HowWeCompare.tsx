/**
 * Chapter 11: How We Compare — June 2025
 * Honest look at the AI platform landscape.
 */
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { SEO } from "@/components/SEO";
import heroImg from "@/assets/blog/ai-product-comparison-2025.jpg";

export default function HowWeCompare() {
  return (
    <>
      <SEO
        title="How We Compare — Honest AI Platform Landscape"
        description="An honest comparison of CMPSBL against OpenAI, Anthropic, LangChain, and other AI platforms. What we do better. What they do better."
        type="article"
        publishedTime="2025-06-20"
        keywords={['AI platform comparison', 'CMPSBL vs OpenAI', 'cognitive infrastructure comparison', 'AI infrastructure landscape']}
      />
      <PublicNav />
      <main className="min-h-screen bg-background">
        <article className="container max-w-3xl mx-auto px-4 py-16">
          <img src={heroImg} alt="AI platform landscape comparison" className="w-full rounded-xl mb-8 aspect-video object-cover" />
          <h1 className="text-4xl font-black mb-4">How We Compare</h1>
          <p className="text-muted-foreground mb-8">June 20, 2025 · 16 min read · Written by the CMPSBL team</p>
          <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
            <p className="text-lg leading-relaxed">People ask us how we compare to OpenAI, Anthropic, LangChain, and the rest. The honest answer is: we're not competing with most of them. We're a different layer of the stack.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">What We're Not</h2>
            <p>We don't train models. We don't compete with GPT or Claude on model quality. We don't offer a chatbot product. If you need a better model, go to OpenAI or Anthropic — we route to them anyway.</p>

            <p>We also don't compete with LangChain or LlamaIndex as frameworks. Those are excellent tools for building AI applications. We're the infrastructure layer that sits beneath them.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">What We Are</h2>
            <p>We're cognitive infrastructure. The layer between your application and the AI providers. We handle routing, memory, security, observability, event coordination, identity, and governance — the operational complexity that every AI application needs but nobody wants to build.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">Where We're Better</h2>
            <p><strong>Persistent memory.</strong> No major platform offers cross-session, cross-deployment memory with tiered decay and consolidation. BRAIN does.</p>

            <p><strong>Multi-provider routing.</strong> Most platforms are single-provider. NEXUS routes to the best provider for each request, automatically.</p>

            <p><strong>Integrated security.</strong> DEFENSE isn't a middleware add-on. It's woven into every request path.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">Where They're Better</h2>
            <p><strong>Model quality.</strong> OpenAI and Anthropic have the best models. Period. We use their models.</p>

            <p><strong>Framework ecosystem.</strong> LangChain has thousands of integrations. We have dozens. Their community is larger.</p>

            <p><strong>Enterprise maturity.</strong> AWS Bedrock has SOC 2, HIPAA, FedRAMP. We're working on it.</p>

            <p>We're honest about this because trust matters more than positioning. Use us where we're strong. Use them where they're strong. Ideally, use us together — that's what we designed for.</p>
          </div>
        </article>
      </main>
      <EnhancedFooter />
    </>
  );
}
