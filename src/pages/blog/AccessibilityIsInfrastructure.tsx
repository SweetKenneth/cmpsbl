/**
 * Chapter 15: Accessibility Is Infrastructure — October 2025
 * Building INCLUSIVE and why it matters.
 */
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { SEO } from "@/components/SEO";
import heroImg from "@/assets/blog/cmptbl-mission-accessibility.jpg";

export default function AccessibilityIsInfrastructure() {
  return (
    <>
      <SEO
        title="Accessibility Is Infrastructure — The INCLUSIVE Node"
        description="We built INCLUSIVE because accessibility shouldn't require a dedicated team. AI-powered scanning and remediation, available to every application on the substrate."
        type="article"
        publishedTime="2025-10-15"
        keywords={['AI accessibility', 'INCLUSIVE node', 'automated WCAG compliance', 'accessibility remediation', 'inclusive design AI']}
      />
      <PublicNav />
      <main className="min-h-screen bg-background">
        <article className="container max-w-3xl mx-auto px-4 py-16">
          <img src={heroImg} alt="INCLUSIVE node accessibility mission" className="w-full rounded-xl mb-8 aspect-video object-cover" />
          <h1 className="text-4xl font-black mb-4">Accessibility Is Infrastructure</h1>
          <p className="text-muted-foreground mb-8">October 15, 2025 · 10 min read · Written by the CMPSBL team</p>
          <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
            <p className="text-lg leading-relaxed">Most companies treat accessibility as a compliance checkbox. Hire an auditor. Get a report. Fix the critical issues. Forget about it until the next audit. The web stays inaccessible because the economics don't support continuous compliance.</p>

            <p>We built INCLUSIVE to change that calculus.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">The Problem</h2>
            <p>Accessibility audits are expensive — $5,000 to $50,000 depending on site complexity. They produce a snapshot that's outdated the moment a developer ships a new feature. The result: companies either pay for continuous auditing (prohibitive) or let compliance drift (common).</p>

            <p>Meanwhile, over 1 billion people worldwide live with some form of disability. The web is their primary interface to the world, and most of it excludes them.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">What INCLUSIVE Does</h2>
            <p>INCLUSIVE is an AI-powered accessibility scanner and remediator. It analyzes DOM structure, evaluates WCAG 2.2 criteria, identifies violations, and — critically — generates fix recommendations with production-ready code.</p>

            <p>It's not just flagging problems. It's solving them. Missing ARIA labels get generated. Color contrast violations get correction suggestions. Focus management issues get remediation patterns. The goal is to make the fix as easy as the detection.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">Why We Built It</h2>
            <p>Honestly? Because we needed it ourselves. Our own dashboard had accessibility issues — color contrast in dark mode, missing focus indicators, unlabeled icons. We built INCLUSIVE to fix our own product and realized it was useful enough to be a node.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">Free Tier</h2>
            <p>INCLUSIVE is available on the free tier. We made that decision deliberately. Accessibility shouldn't be a premium feature. Every application built on the substrate gets basic accessibility scanning at no cost. Premium tiers add automated remediation, continuous monitoring, and compliance reporting.</p>

            <p>This isn't charity — it's infrastructure. Accessible software is better software. Period.</p>
          </div>
        </article>
      </main>
      <EnhancedFooter />
    </>
  );
}
