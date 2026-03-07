/**
 * Chapter 37: Open Standards — February 2026
 */
import { Link } from "react-router-dom";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { SEO } from "@/components/SEO";
import { BlogArticleJsonLd } from "@/components/blog/BlogArticleJsonLd";
import { BlogPostNav } from "@/components/blog/BlogPostNav";
import { RewrittenNotice } from "@/components/blog/RewrittenNotice";
import heroImg from "@/assets/blog/ai-governance-namespace-unified.jpg";

const SLUG = "open-standards";

export default function OpenStandards() {
  return (
    <>
      <SEO title="Open Standards — Building Standards, Not Moats" description="We registered governance domains, published protocol specs, and open-sourced our terminology." type="article" image={heroImg} publishedTime="2026-02-15" keywords={["open standards AI", "AI governance standards", "protocol specifications"]} canonical={`https://cmpsbl.com/blog/${SLUG}`} topicCluster="substrate-governance" breadcrumbs={[{ name: "Home", url: "https://cmpsbl.com" }, { name: "Blog", url: "https://cmpsbl.com/blog" }, { name: "Open Standards", url: `https://cmpsbl.com/blog/${SLUG}` }]} />
      <BlogArticleJsonLd title="Open Standards" description="Building standards, not moats." slug={SLUG} datePublished="2026-02-15" imageUrl={heroImg} keywords={["open standards", "governance", "protocols"]} />
      <PublicNav />
      <main className="min-h-screen bg-background">
        <article className="container max-w-3xl mx-auto px-4 py-16">
          <img src={heroImg} alt="Open standards for AI governance" className="w-full rounded-xl mb-8 aspect-video object-cover" />
          <h1 className="text-4xl font-black mb-4">Open Standards</h1>
          <p className="text-muted-foreground mb-8">February 15, 2026 · 10 min read · Written by the CMPSBL team</p>
          <RewrittenNotice />
          <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
            <p className="text-lg leading-relaxed">We could have kept everything proprietary. Node names, protocol specs, governance terminology — all locked behind our brand. Instead, we published it as open standards. Here's why.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">The Governance Namespace</h2>
            <p>We registered domain names for <a href="https://en.wikipedia.org/wiki/AI_alignment" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">AI governance concepts</a> and published canonical definitions. Not because we own these ideas — but because the industry needs shared vocabulary. When we say "audit trail" and a competitor says "compliance log," we're describing the same concept with different words. Standards fix that.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">The Foundations Page</h2>
            <p>Our <Link to="/foundations" className="text-primary hover:underline">Foundations page</Link> documents the principles we built on. Not marketing copy — actual engineering principles with rationale. Composability over monoliths. Observable by default. Learning from experience. Governance as runtime, not policy. These aren't just our standards — they're patterns that work, and anyone should use them.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">LLMs.txt and Machine Protocols</h2>
            <p>Building on our <Link to="/blog/protocols-for-machines" className="text-primary hover:underline">earlier protocol work</Link>, we published complete machine-readable specifications for every substrate capability. AI agents from any platform can discover and interact with the substrate using standardized protocols. Interoperability isn't a feature — it's a requirement for an ecosystem.</p>

            <p>Open standards are a bet. We're betting that a larger, standardized ecosystem benefits everyone more than a smaller, proprietary one. Time will tell if we're right. But the decision felt like the right one to make.</p>
          </div>
          <BlogPostNav slug={SLUG} />
        </article>
      </main>
      <EnhancedFooter />
    </>
  );
}
