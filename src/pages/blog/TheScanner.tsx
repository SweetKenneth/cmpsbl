/**
 * Chapter 39: The Scanner — March 2026
 */
import { Link } from "react-router-dom";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { SEO } from "@/components/SEO";
import { BlogArticleJsonLd } from "@/components/blog/BlogArticleJsonLd";
import { BlogPostNav } from "@/components/blog/BlogPostNav";
import { RewrittenNotice } from "@/components/blog/RewrittenNotice";
import heroImg from "@/assets/blog/defense-ai-security.jpg";

const SLUG = "the-scanner";

export default function TheScanner() {
  return (
    <>
      <SEO title="The Scanner — Automated Security & Accessibility Auditing" description="The Scanner runs automated security and accessibility audits and generates actionable fix reports." type="article" image={heroImg} publishedTime="2026-03-01" keywords={["security scanner", "accessibility scanner", "automated auditing"]} canonical={`https://cmpsbl.com/blog/${SLUG}`} topicCluster="substrate-tools" breadcrumbs={[{ name: "Home", url: "https://cmpsbl.com" }, { name: "Blog", url: "https://cmpsbl.com/blog" }, { name: "The Scanner", url: `https://cmpsbl.com/blog/${SLUG}` }]} />
      <BlogArticleJsonLd title="The Scanner" description="Automated security and accessibility auditing." slug={SLUG} datePublished="2026-03-01" imageUrl={heroImg} keywords={["scanner", "security", "accessibility"]} />
      <PublicNav />
      <main className="min-h-screen bg-background">
        <article className="container max-w-3xl mx-auto px-4 py-16">
          <img src={heroImg} alt="The Scanner — automated security and accessibility auditing" className="w-full rounded-xl mb-8 aspect-video object-cover" />
          <h1 className="text-4xl font-black mb-4">The Scanner</h1>
          <p className="text-muted-foreground mb-8">March 1, 2026 · 11 min read · Written by the CMPSBL team</p>
          <RewrittenNotice />
          <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
            <p className="text-lg leading-relaxed">Most websites have security vulnerabilities and accessibility failures they don't know about. Professional audits cost thousands. Automated tools are shallow. We built the Scanner to bridge that gap.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">Two Scanners, One Pipeline</h2>
            <p>The Scanner combines <Link to="/blog/when-bots-found-us-first" className="text-primary hover:underline">DEFENSE</Link> security analysis with <Link to="/blog/accessibility-is-infrastructure" className="text-primary hover:underline">INCLUSIVE</Link> accessibility auditing. One scan, two reports. Security gets a vulnerability assessment with severity scoring. Accessibility gets WCAG compliance status with specific remediation guidance.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">Beyond Detection</h2>
            <p>Most scanners tell you what's wrong. Ours tells you how to fix it. Each finding includes a priority level, an effort estimate, and generated fix code. <Link to="/blog/from-thought-to-artifact" className="text-primary hover:underline">FORGE</Link> produces the remediation artifacts. <Link to="/blog/trust-but-verify" className="text-primary hover:underline">PROOF</Link> validates the fixes before suggesting them.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">Free Tier</h2>
            <p>The Scanner is free for basic scans. We made this decision deliberately. Security and accessibility shouldn't be gated by budget. The free tier runs the same analysis as the paid tier — it just limits scan frequency and artifact generation. This aligns with our <Link to="/blog/open-standards" className="text-primary hover:underline">open standards</Link> philosophy: some things should be accessible to everyone.</p>

            <p>The Scanner is the most tangible thing the substrate produces. Enter a URL, get a report. No API keys, no onboarding, no commitment. It's how most new users discover CMPSBL — and how we demonstrate that cognitive infrastructure produces real, measurable value.</p>
          </div>
          <BlogPostNav slug={SLUG} />
        </article>
      </main>
      <EnhancedFooter />
    </>
  );
}
