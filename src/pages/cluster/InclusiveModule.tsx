/**
 * INCLUSIVE Module — Human Compatibility Pipeline
 * v9.1.0 ARCHITECT — Substrate Module
 */

import { Link } from "react-router-dom";
import { Accessibility, ArrowRight, CheckCircle } from "lucide-react";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { SEO } from "@/components/SEO";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import ogImage from "@/assets/og/clarity.jpg";

export default function InclusiveModule() {
  return (
    <>
      <SEO
        title="INCLUSIVE Module — Human Compatibility Pipeline | CMPSBL"
        description="AI that scans and fixes accessibility issues as it audits, delivering living WCAG 2.2 compliance. The 14th substrate module for human compatibility."
        canonical="https://cmpsbl.com/cluster/inclusive-module-accessibility"
        image={ogImage}
        type="article"
        keywords={[
          'AI accessibility',
          'WCAG compliance',
          'automated accessibility fixes',
          'web accessibility',
          'accessibility repair',
          'WCAG 2.2',
          'INCLUSIVE module',
          'human compatibility'
        ]}
      />

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": "INCLUSIVE: Human Compatibility Pipeline",
          "description": "The INCLUSIVE module scans and repairs accessibility in real time—no overlays, no waiting.",
          "image": ogImage,
          "datePublished": "2025-11-04",
          "author": {
            "@type": "Organization",
            "name": "PromptFluid"
          }
        })}
      </script>

      <div className="min-h-screen bg-background">
        <PublicNav />

        <article className="container mx-auto px-4 pt-24 pb-16 max-w-4xl">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Modules", href: "/solutions" },
              { label: "INCLUSIVE" }
            ]}
            className="mb-8"
          />

          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-primary-variant flex items-center justify-center">
              <Accessibility className="w-8 h-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                INCLUSIVE Module
              </h1>
              <p className="text-xl text-muted-foreground">Human Compatibility Pipeline — 14th Substrate Module</p>
            </div>
          </div>

          <div className="prose prose-lg dark:prose-invert max-w-none space-y-8">
            <section>
              <p className="text-xl text-muted-foreground leading-relaxed mb-6">
                INCLUSIVE is the substrate's human compatibility pipeline. It scans, repairs, and validates 
                accessibility issues automatically—no overlays, no band-aids. Real code fixes help your 
                outputs stay WCAG 2.2 compliant without manual intervention.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4">What INCLUSIVE Fixes Automatically</h2>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <span><strong>Missing alt text</strong> — AI-generated contextual descriptions for images</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <span><strong>Color contrast issues</strong> — Automatic palette adjustments to meet AA/AAA standards</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <span><strong>Form labels</strong> — ARIA labels and semantic HTML structure for all inputs</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <span><strong>Heading structure</strong> — Proper H1-H6 hierarchy enforcement</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <span><strong>Keyboard traps</strong> — Focus management and tab order optimization</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <span><strong>ARIA landmarks</strong> — Navigation, main, complementary roles added automatically</span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4">Substrate Integration</h2>
              <p className="text-muted-foreground mb-4">
                INCLUSIVE is the 14th module in the substrate boot sequence, positioned after SYSTEM and before DEFENSE:
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <span><strong>SYSTEM</strong> — Audit aggregation and health surfaces</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <span><strong>VISION</strong> — Metrics and observability integration</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <span><strong>DEFENSE</strong> — Severity escalation to risk pipeline</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <span><strong>MODERNIZER</strong> — Regression-triggered proposals</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <span><strong>TEMPLATES</strong> — Compliance gate for template approval</span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4">Capabilities</h2>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <span><strong>inclusive.scan</strong> — Scan targets for accessibility issues</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <span><strong>inclusive.repair</strong> — Automatically repair detected issues</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <span><strong>inclusive.validate</strong> — Validate WCAG 2.2 compliance</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <span><strong>inclusive.profile</strong> — Create accessibility profiles</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <span><strong>inclusive.report</strong> — Generate compliance reports</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <span><strong>inclusive.selfScan</strong> — Scan substrate's own interfaces</span>
                </li>
              </ul>
            </section>

            <section className="p-8 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl border border-primary/20">
              <h3 className="text-2xl font-bold mb-4">Built by PromptFluid®</h3>
              <p className="text-muted-foreground mb-6">
                The INCLUSIVE module is part of the CMPSBL cognitive orchestration substrate, developed by PromptFluid®. 
                Accessibility is a fundamental right—not a feature.
              </p>
              <Link 
                to="/solutions" 
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
              >
                View All Modules
                <ArrowRight className="w-5 h-5" />
              </Link>
            </section>

            <section className="mt-16 p-8 bg-muted/30 rounded-xl border border-border">
              <h3 className="text-2xl font-bold mb-6">Related Content</h3>
              <div className="grid gap-4">
                <Link to="/solutions" className="flex items-center justify-between p-4 bg-background rounded-lg border border-border hover:border-primary transition-colors group">
                  <span className="font-semibold">All Modules — Full Catalog</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/cluster/verify-worlds-first-ai-plugin-certification" className="flex items-center justify-between p-4 bg-background rounded-lg border border-border hover:border-primary transition-colors group">
                  <span className="font-semibold">Verify — Plugin Certification</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/cluster/studio-autonomous-site-generator" className="flex items-center justify-between p-4 bg-background rounded-lg border border-border hover:border-primary transition-colors group">
                  <span className="font-semibold">Studio — Site Generator</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/" className="flex items-center justify-between p-4 bg-background rounded-lg border border-border hover:border-primary transition-colors group">
                  <span className="font-semibold">Home</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </section>
          </div>
        </article>

        <EnhancedFooter />
      </div>
    </>
  );
}
