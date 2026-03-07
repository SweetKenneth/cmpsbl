/**
 * Chapter 30: Packing Intelligence — November 2025
 */
import { Link } from "react-router-dom";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { SEO } from "@/components/SEO";
import { BlogArticleJsonLd } from "@/components/blog/BlogArticleJsonLd";
import { BlogPostNav } from "@/components/blog/BlogPostNav";
import { RewrittenNotice } from "@/components/blog/RewrittenNotice";
import heroImg from "@/assets/blog/clockless-account-setup-artifact-packs.jpg";

const SLUG = "packing-intelligence";

export default function PackingIntelligence() {
  return (
    <>
      <SEO title="Packing Intelligence — Artifact Packs" description="Packs bundle related capabilities into themed collections — curated, priced, and instantly deployable." type="article" image={heroImg} publishedTime="2025-11-05" keywords={["artifact packs", "bundled AI", "substrate bundles"]} canonical={`https://cmpsbl.com/blog/${SLUG}`} topicCluster="substrate-platform" breadcrumbs={[{ name: "Home", url: "https://cmpsbl.com" }, { name: "Blog", url: "https://cmpsbl.com/blog" }, { name: "Packing Intelligence", url: `https://cmpsbl.com/blog/${SLUG}` }]} />
      <BlogArticleJsonLd title="Packing Intelligence — Artifact Packs" description="Bundled AI capabilities in themed collections." slug={SLUG} datePublished="2025-11-05" imageUrl={heroImg} keywords={["packs", "bundles", "artifacts"]} />
      <PublicNav />
      <main className="min-h-screen bg-background">
        <article className="container max-w-3xl mx-auto px-4 py-16">
          <img src={heroImg} alt="Artifact Packs bundling substrate capabilities" className="w-full rounded-xl mb-8 aspect-video object-cover" />
          <h1 className="text-4xl font-black mb-4">Packing Intelligence</h1>
          <p className="text-muted-foreground mb-8">November 5, 2025 · 9 min read · Written by the CMPSBL team</p>
          <RewrittenNotice />
          <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
            <p className="text-lg leading-relaxed">Individual artifacts solved individual problems. But customers didn't want to assemble solutions from components — they wanted solutions. "I need a complete security posture" not "I need a bot detector, a vulnerability scanner, and an audit logger."</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">Curated Bundles</h2>
            <p>Packs are curated collections of related artifacts. The Security Pack includes <Link to="/blog/when-bots-found-us-first" className="text-primary hover:underline">DEFENSE</Link> configurations, vulnerability scanning tools, and <Link to="/blog/the-governance-question" className="text-primary hover:underline">AUDIT</Link> compliance reports. The Content Pack includes research tools, writing agents, and editorial workflows. Each Pack is tested as a complete solution, not a grab bag.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">Activation Slots</h2>
            <p>Packs don't just include artifacts — they include activation slots. A slot lets you deploy the Pack's artifacts into your own substrate environment. Slot capacity determines how many concurrent operations the Pack can handle. This solved the "I bought it but how do I run it" problem.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">Pack Economics</h2>
            <p>Packs are cheaper than buying components individually — typically 30-40% savings. But the real value is in integration. Every artifact in a Pack is pre-configured to work with every other artifact in the same Pack. No glue code, no integration headaches.</p>

            <p>Packs were the product that enterprise customers actually wanted to buy. Not infrastructure, not APIs, not agents — solutions in a box. The <Link to="/blog/the-marketplace" className="text-primary hover:underline">Store</Link> became a Pack-first experience.</p>
          </div>
          <BlogPostNav slug={SLUG} />
        </article>
      </main>
      <EnhancedFooter />
    </>
  );
}
