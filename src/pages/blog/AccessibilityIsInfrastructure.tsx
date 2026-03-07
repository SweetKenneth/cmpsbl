/**
 * Chapter 15: Accessibility Is Infrastructure — October 2025
 */
import { Link } from "react-router-dom";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { SEO } from "@/components/SEO";
import { BlogArticleJsonLd } from "@/components/blog/BlogArticleJsonLd";
import { BlogPostNav } from "@/components/blog/BlogPostNav";
import heroImg from "@/assets/blog/cmptbl-mission-accessibility.jpg";
import imgFixes from "@/assets/blog/automated-accessibility-fixes.jpg";

const SLUG = "accessibility-is-infrastructure";

export default function AccessibilityIsInfrastructure() {
  return (
    <>
      <SEO title="Accessibility Is Infrastructure — The INCLUSIVE Node" description="We built INCLUSIVE because accessibility shouldn't require a dedicated team. AI-powered scanning and remediation, available to every application." type="article" image={heroImg} publishedTime="2025-10-15" keywords={["AI accessibility", "INCLUSIVE node", "automated WCAG compliance", "accessibility remediation"]} canonical={`https://cmpsbl.com/blog/${SLUG}`} topicCluster="substrate-nodes" breadcrumbs={[{ name: "Home", url: "https://cmpsbl.com" }, { name: "Blog", url: "https://cmpsbl.com/blog" }, { name: "Accessibility Is Infrastructure", url: `https://cmpsbl.com/blog/${SLUG}` }]} />
      <BlogArticleJsonLd title="Accessibility Is Infrastructure — The INCLUSIVE Node" description="AI-powered accessibility scanning and remediation for every app." slug={SLUG} datePublished="2025-10-15" imageUrl={heroImg} keywords={["INCLUSIVE", "accessibility", "WCAG"]} />
      <PublicNav />
      <main className="min-h-screen bg-background">
        <article className="container max-w-3xl mx-auto px-4 py-16">
          <img src={heroImg} alt="INCLUSIVE node accessibility mission" className="w-full rounded-xl mb-8 aspect-video object-cover" />
          <h1 className="text-4xl font-black mb-4">Accessibility Is Infrastructure</h1>
          <p className="text-muted-foreground mb-8">October 15, 2025 · 10 min read · Written by the CMPSBL team</p>
          <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
            <p className="text-lg leading-relaxed">Most companies treat accessibility as a compliance checkbox. We built INCLUSIVE to change that calculus.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">The Problem</h2>
            <p>Accessibility audits are expensive — $5,000 to $50,000 depending on site complexity. They produce a snapshot that's outdated the moment a developer ships a new feature. Meanwhile, over <a href="https://www.who.int/news-room/fact-sheets/detail/disability-and-health" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">1 billion people worldwide</a> live with some form of disability.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">What INCLUSIVE Does</h2>
            <p>INCLUSIVE is an AI-powered accessibility scanner and remediator. It analyzes DOM structure, evaluates <a href="https://www.w3.org/WAI/WCAG22/quickref/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">WCAG 2.2 criteria</a>, identifies violations, and generates fix recommendations with production-ready code.</p>

            <figure className="my-8">
              <img src={imgFixes} alt="Automated accessibility fixes — ARIA labels, color contrast, focus management remediation" className="w-full rounded-xl aspect-video object-cover" loading="lazy" />
              <figcaption className="text-sm text-muted-foreground/70 mt-2 text-center">INCLUSIVE doesn't just flag problems — it generates production-ready fixes for ARIA, contrast, and focus issues.</figcaption>
            </figure>

            <p>It's not just flagging problems — it's solving them. Missing <a href="https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">ARIA labels</a> get generated. Color contrast violations get correction suggestions. Focus management issues get remediation patterns.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">Why We Built It</h2>
            <p>Honestly? Because we needed it ourselves. Our own <Link to="/blog/seeing-everything-at-once" className="text-primary hover:underline">VISION dashboard</Link> had accessibility issues. We built INCLUSIVE to fix our own product and realized it was useful enough to be a node.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">Free Tier</h2>
            <p>INCLUSIVE is available on the free tier. Accessibility shouldn't be a premium feature. Every application built on the substrate gets basic scanning at no cost via <Link to="/blog/identity-at-every-layer" className="text-primary hover:underline">ACCESS</Link> entitlements. Premium tiers add automated remediation and continuous monitoring.</p>

            <p>This isn't charity — it's infrastructure. Accessible software is better software. The <Link to="/blog/signal-to-silicon" className="text-primary hover:underline">complete pipeline</Link> treats accessibility as a first-class quality dimension.</p>
          </div>
          <BlogPostNav slug={SLUG} />
        </article>
      </main>
      <EnhancedFooter />
    </>
  );
}
