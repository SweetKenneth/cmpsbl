/**
 * Chapter 9: Building on the Substrate — May 2025
 */
import { Link } from "react-router-dom";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { SEO } from "@/components/SEO";
import { BlogArticleJsonLd } from "@/components/blog/BlogArticleJsonLd";
import { BlogPostNav } from "@/components/blog/BlogPostNav";
import heroImg from "@/assets/blog/promptfluid-studio-build-apps.jpg";

const SLUG = "building-on-the-substrate";

export default function BuildingOnTheSubstrate() {
  return (
    <>
      <SEO title="Building on the Substrate — Developer Experience" description="We had eight nodes and no developer documentation. Making the substrate usable meant rethinking how developers interact with cognitive infrastructure." type="article" publishedTime="2025-05-25" keywords={["AI developer experience", "substrate SDK", "ENCODE node", "cognitive infrastructure API"]} canonical={`https://cmpsbl.com/blog/${SLUG}`} topicCluster="substrate-developer" breadcrumbs={[{ name: "Home", url: "https://cmpsbl.com" }, { name: "Blog", url: "https://cmpsbl.com/blog" }, { name: "Building on the Substrate", url: `https://cmpsbl.com/blog/${SLUG}` }]} />
      <BlogArticleJsonLd title="Building on the Substrate — Developer Experience" description="How we made cognitive infrastructure usable for developers." slug={SLUG} datePublished="2025-05-25" imageUrl={heroImg} keywords={["developer experience", "ENCODE", "SDK"]} />
      <PublicNav />
      <main className="min-h-screen bg-background">
        <article className="container max-w-3xl mx-auto px-4 py-16">
          <img src={heroImg} alt="Developer building on the substrate" className="w-full rounded-xl mb-8 aspect-video object-cover" />
          <h1 className="text-4xl font-black mb-4">Building on the Substrate</h1>
          <p className="text-muted-foreground mb-8">May 25, 2025 · 11 min read · Written by the CMPSBL team</p>
          <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
            <p className="text-lg leading-relaxed">Eight nodes. Thousands of lines of infrastructure code. Zero developer documentation. By May 2025, the substrate was powerful and completely unusable by anyone who didn't build it.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">The API Surface Problem</h2>
            <p>Each node had its own API. Different conventions, different error formats, different authentication patterns. <Link to="/blog/routing-the-unknown" className="text-primary hover:underline">NEXUS</Link> used path parameters. <Link to="/blog/teaching-machines-to-remember" className="text-primary hover:underline">BRAIN</Link> used JSON bodies. <Link to="/blog/when-bots-found-us-first" className="text-primary hover:underline">DEFENSE</Link> used headers.</p>

            <p>We unified everything behind a single endpoint — one URL, one authentication method, following <a href="https://swagger.io/specification/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">OpenAPI</a> conventions. The request body tells the substrate which node to invoke.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">ENCODE: From Intent to Code</h2>
            <p>ENCODE started as our internal tool for generating integration code. You describe what you want — "route this through NEXUS with BRAIN memory and DEFENSE enabled" — and ENCODE generates the API call, complete with authentication, error handling, and retry logic.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">The DECODE → ENCODE Pipeline</h2>
            <p>DECODE takes natural language. ENCODE produces structured output. Together, they form a pipeline where a developer can describe intent in plain English and receive production-ready code. For <Link to="/blog/how-we-compare" className="text-primary hover:underline">how this compares</Link> to other AI development platforms, see Chapter 11.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">What We Learned</h2>
            <p>Developer experience isn't a feature. It's the product. The most sophisticated infrastructure in the world is worthless if people can't use it. We should have built ENCODE on <Link to="/blog/the-first-line-of-code" className="text-primary hover:underline">day one</Link>. The <Link to="/blog/protocols-for-machines" className="text-primary hover:underline">machine protocol</Link> work later extended this philosophy to non-human consumers.</p>
          </div>
          <BlogPostNav slug={SLUG} />
        </article>
      </main>
      <EnhancedFooter />
    </>
  );
}
