/**
 * Chapter 9: Building on the Substrate — May 2025
 * ENCODE and the developer experience.
 */
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { SEO } from "@/components/SEO";
import heroImg from "@/assets/blog/promptfluid-studio-build-apps.jpg";

export default function BuildingOnTheSubstrate() {
  return (
    <>
      <SEO
        title="Building on the Substrate — Developer Experience"
        description="We had eight nodes and no developer documentation. Making the substrate usable meant rethinking how developers interact with cognitive infrastructure."
        type="article"
        publishedTime="2025-05-25"
        keywords={['AI developer experience', 'substrate SDK', 'ENCODE node', 'cognitive infrastructure API', 'developer onboarding']}
      />
      <PublicNav />
      <main className="min-h-screen bg-background">
        <article className="container max-w-3xl mx-auto px-4 py-16">
          <img src={heroImg} alt="Developer building on the substrate" className="w-full rounded-xl mb-8 aspect-video object-cover" />
          <h1 className="text-4xl font-black mb-4">Building on the Substrate</h1>
          <p className="text-muted-foreground mb-8">May 25, 2025 · 11 min read · Written by the CMPSBL team</p>
          <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
            <p className="text-lg leading-relaxed">Eight nodes. Thousands of lines of infrastructure code. Zero developer documentation. By May 2025, the substrate was powerful and completely unusable by anyone who didn't build it.</p>

            <p>The gap between "it works" and "someone else can make it work" is enormous. We'd built the engine but forgotten to build the steering wheel.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">The API Surface Problem</h2>
            <p>Each node had its own API. Different conventions, different error formats, different authentication patterns. NEXUS used path parameters. BRAIN used JSON bodies. DEFENSE used headers. If you wanted to use three nodes in one workflow, you needed to learn three different APIs.</p>

            <p>We unified everything behind a single endpoint. One URL. One authentication method. The request body tells the substrate which node to invoke and what to do. Simple, predictable, documentable.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">ENCODE: From Intent to Code</h2>
            <p>ENCODE started as our internal tool for generating integration code. You describe what you want — "route this through NEXUS with BRAIN memory and DEFENSE enabled" — and ENCODE generates the API call, complete with authentication, error handling, and retry logic.</p>

            <p>We made it customer-facing because we realized the best documentation is documentation that writes itself. ENCODE doesn't just explain the API — it generates working code for your specific use case.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">The DECODE → ENCODE Pipeline</h2>
            <p>DECODE takes natural language. ENCODE produces structured output. Together, they form a pipeline where a developer can describe intent in plain English and receive production-ready code. It's not perfect — complex multi-node orchestrations sometimes need manual adjustment — but for common patterns, it works remarkably well.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">What We Learned</h2>
            <p>Developer experience isn't a feature. It's the product. The most sophisticated infrastructure in the world is worthless if people can't use it. We should have built ENCODE on day one.</p>
          </div>
        </article>
      </main>
      <EnhancedFooter />
    </>
  );
}
