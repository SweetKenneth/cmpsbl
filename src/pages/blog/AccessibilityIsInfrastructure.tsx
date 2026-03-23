/**
 * Chapter 15: Accessibility Is Infrastructure — October 2025
 */
import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { BlogArticleJsonLd } from "@/components/blog/BlogArticleJsonLd";
import { BlogArticleLayout } from "@/components/blog/BlogArticleLayout";
import heroImg from "@/assets/blog/cmptbl-mission-accessibility.jpg";
import imgFixes from "@/assets/blog/automated-accessibility-fixes.jpg";

const SLUG = "accessibility-is-infrastructure";

export default function AccessibilityIsInfrastructure() {
  return (
    <BlogArticleLayout slug={SLUG} title="Accessibility Is Infrastructure" subtitle="AI-powered scanning and remediation for every application" date="October 15, 2025" readTime="10 min read" heroImage={heroImg} heroAlt="INCLUSIVE layer accessibility mission" chapter={15} showRewrittenNotice={false} head={<><SEO title="Accessibility Is Infrastructure — The INCLUSIVE Layer" description="We built INCLUSIVE because accessibility shouldn't require a dedicated team. AI-powered scanning and remediation, available to every application." type="article" image={heroImg} publishedTime="2025-10-15" keywords={["AI accessibility", "INCLUSIVE layer", "automated WCAG compliance", "accessibility remediation"]} canonical={`https://cmpsbl.com/blog/${SLUG}`} topicCluster="substrate-primitives" breadcrumbs={[{ name: "Home", url: "https://cmpsbl.com" }, { name: "Blog", url: "https://cmpsbl.com/blog" }, { name: "Accessibility Is Infrastructure", url: `https://cmpsbl.com/blog/${SLUG}` }]} /><BlogArticleJsonLd title="Accessibility Is Infrastructure — The INCLUSIVE Layer" description="AI-powered accessibility scanning and remediation for every app." slug={SLUG} datePublished="2025-10-15" imageUrl={heroImg} keywords={["INCLUSIVE", "accessibility", "WCAG"]} /></>}>
      <p className="text-lg leading-relaxed">Most companies treat accessibility as a compliance checkbox — something that gets checked once a year during an audit and forgotten until the next one. We built INCLUSIVE to change that calculus. Not because we're altruistic (though we are), but because accessibility is a quality dimension that affects every user, and quality should be automated.</p>

      <h2 className="text-2xl font-bold text-foreground mt-8">The Problem</h2>
      <p>Accessibility audits are expensive — $5,000 to $50,000 depending on site complexity. They produce a static report that's outdated the moment a developer ships a new feature. A team can spend three months remediating audit findings, then deploy a single component that introduces five new violations. Meanwhile, over <a href="https://www.who.int/news-room/fact-sheets/detail/disability-and-health" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">1 billion people worldwide</a> live with some form of disability.</p>
      <p>The tooling gap is stark. Existing automated scanners (axe, Lighthouse, WAVE) catch about 30-40% of WCAG violations. The rest require manual testing — keyboard navigation, screen reader compatibility, cognitive load assessment. That's not scalable. A team of three developers can't manually test every page after every deployment.</p>

      <h2 className="text-2xl font-bold text-foreground mt-8">What INCLUSIVE Does</h2>
      <p>INCLUSIVE is an AI-powered accessibility scanner and remediator. It analyzes DOM structure, evaluates <a href="https://www.w3.org/WAI/WCAG22/quickref/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">WCAG 2.2 criteria</a>, identifies violations, and generates fix recommendations with production-ready code. It goes beyond what rule-based scanners can catch by using AI to evaluate semantic context — is this image decorative or informational? Does this button label make sense out of context? Is this color contrast sufficient for the specific content type?</p>

      <figure className="my-8">
        <img src={imgFixes} alt="Automated accessibility fixes — ARIA labels, color contrast, focus management remediation" className="w-full rounded-xl aspect-video object-cover" loading="lazy" />
        <figcaption className="text-sm text-muted-foreground/70 mt-2 text-center">INCLUSIVE doesn't just flag problems — it generates production-ready fixes for ARIA, contrast, and focus issues.</figcaption>
      </figure>

      <p>It's not just flagging problems — it's solving them. Missing <a href="https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">ARIA labels</a> get generated from semantic analysis of the element and its context. Color contrast violations get correction suggestions that maintain the design intent. Focus management issues get remediation patterns that work with the existing component architecture.</p>

      <h2 className="text-2xl font-bold text-foreground mt-8">The Scoring System</h2>
      <p>Every scan produces a score from 0 to 100 — a weighted combination of automated test results, AI-evaluated semantic issues, and structural best practices. The score is actionable: a 72 means "passes basic compliance but has meaningful gaps." An 95 means "excellent accessibility with minor improvements possible." We deliberately don't allow 100 because accessibility is never "done" — there's always room for improvement.</p>
      <p>Scores are tracked over time, so teams can see their accessibility trajectory. Are deployments generally improving or degrading accessibility? Which components introduce the most violations? This longitudinal view turns accessibility from a point-in-time audit into a continuous quality metric.</p>

      <h2 className="text-2xl font-bold text-foreground mt-8">Why We Built It</h2>
      <p>Honestly? Because we needed it ourselves. Our own <Link to="/blog/seeing-everything-at-once" className="text-primary hover:underline">VISION dashboard</Link> had accessibility issues — insufficient color contrast in the telemetry graphs, missing ARIA labels on interactive elements, keyboard traps in modal dialogs. We built INCLUSIVE to fix our own product and realized it was useful enough to be a node.</p>

      <h2 className="text-2xl font-bold text-foreground mt-8">Free Tier</h2>
      <p>INCLUSIVE is available on the free tier. Accessibility shouldn't be a premium feature. Every application built on the substrate gets basic scanning at no cost via <Link to="/blog/identity-at-every-layer" className="text-primary hover:underline">ACCESS</Link> entitlements. Premium tiers add automated remediation, continuous monitoring, and regression alerts.</p>

      <p>This isn't charity — it's infrastructure. Accessible software is better software. It has better SEO, better usability, better legal standing. The <Link to="/blog/signal-to-silicon" className="text-primary hover:underline">complete system</Link> treats accessibility as a first-class quality dimension, right alongside security, performance, and reliability.</p>
    </BlogArticleLayout>
  );
}
