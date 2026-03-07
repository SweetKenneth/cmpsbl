/**
 * Chapter 29: The Marketplace — October 2025
 */
import { Link } from "react-router-dom";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { SEO } from "@/components/SEO";
import { BlogArticleJsonLd } from "@/components/blog/BlogArticleJsonLd";
import { BlogPostNav } from "@/components/blog/BlogPostNav";
import { RewrittenNotice } from "@/components/blog/RewrittenNotice";
import heroImg from "@/assets/blog/artifact-pack-capabilities.jpg";

const SLUG = "the-marketplace";

export default function TheMarketplace() {
  return (
    <>
      <SEO title="The Marketplace — Substrate Store" description="The Store became a discovery layer — browse, preview, purchase, and deploy substrate-generated software." type="article" image={heroImg} publishedTime="2025-10-25" keywords={["substrate store", "AI marketplace", "artifact discovery"]} canonical={`https://cmpsbl.com/blog/${SLUG}`} topicCluster="substrate-platform" breadcrumbs={[{ name: "Home", url: "https://cmpsbl.com" }, { name: "Blog", url: "https://cmpsbl.com/blog" }, { name: "The Marketplace", url: `https://cmpsbl.com/blog/${SLUG}` }]} />
      <BlogArticleJsonLd title="The Marketplace — Substrate Store" description="Discovery, preview, and deployment of substrate artifacts." slug={SLUG} datePublished="2025-10-25" imageUrl={heroImg} keywords={["store", "marketplace", "artifacts"]} />
      <PublicNav />
      <main className="min-h-screen bg-background">
        <article className="container max-w-3xl mx-auto px-4 py-16">
          <img src={heroImg} alt="Substrate Store marketplace" className="w-full rounded-xl mb-8 aspect-video object-cover" />
          <h1 className="text-4xl font-black mb-4">The Marketplace</h1>
          <p className="text-muted-foreground mb-8">October 25, 2025 · 10 min read · Written by the CMPSBL team</p>
          <RewrittenNotice />
          <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
            <p className="text-lg leading-relaxed"><Link to="/blog/from-thought-to-artifact" className="text-primary hover:underline">FORGE</Link> could produce artifacts. But they sat in databases, invisible. Customers couldn't browse what the substrate had produced. They couldn't compare, preview, or deploy without talking to us directly.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">The Store</h2>
            <p>We built the Substrate Store as a discovery layer. Every artifact is categorized, scored, and previewable. Security tools, accessibility fixers, data enrichment pipelines, content generators — all browsable like an app store, but for AI-generated software components.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">Preview Before Deploy</h2>
            <p>Nobody trusts AI-generated code sight unseen. The Store lets developers preview artifact outputs, inspect the generation pipeline, and verify <Link to="/blog/trust-but-verify" className="text-primary hover:underline">PROOF scores</Link> before deploying. Transparency builds trust.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">Tiered Access</h2>
            <p>The Store respects <Link to="/blog/identity-at-every-layer" className="text-primary hover:underline">ACCESS tier entitlements</Link>. Free tier users can browse and deploy basic artifacts. Pro tier gets premium artifacts and customization. Enterprise gets white-label deployment and custom artifact generation.</p>

            <p>The Store changed our business model. We went from selling API access to selling outcomes. Customers don't care how many NEXUS calls they make — they care that the security audit artifact catches real vulnerabilities. <Link to="/blog/packing-intelligence" className="text-primary hover:underline">Packs</Link> took this further by bundling related artifacts together.</p>
          </div>
          <BlogPostNav slug={SLUG} />
        </article>
      </main>
      <EnhancedFooter />
    </>
  );
}
