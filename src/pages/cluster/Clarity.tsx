import { Link } from "react-router-dom";
import { Accessibility, ArrowRight, CheckCircle } from "lucide-react";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { SEO } from "@/components/SEO";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import ogImage from "@/assets/og/clarity.jpg";

export default function Clarity() {
  return (
    <>
      <SEO
        title="PromptFluid Clarity — Automated WCAG Repair & Compliance"
        description="AI that scans and fixes accessibility issues as it audits, delivering living WCAG 2.2 compliance."
        canonical="https://promptfluid.com/cluster/clarity-ai-accessibility-and-autofix"
        image={ogImage}
        type="article"
        keywords={[
          'AI accessibility',
          'WCAG compliance',
          'automated accessibility fixes',
          'web accessibility',
          'accessibility repair',
          'WCAG 2.2'
        ]}
      />

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": "Clarity: AI Accessibility That Repairs Code",
          "description": "Clarity scans and repairs accessibility in real time—no overlays, no waiting.",
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
              { label: "The Firsts", href: "/pillars/promptfluid-the-firsts" },
              { label: "Clarity" }
            ]}
            className="mb-8"
          />

          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-primary-variant flex items-center justify-center">
              <Accessibility className="w-8 h-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Clarity
              </h1>
              <p className="text-xl text-muted-foreground">AI Accessibility That Repairs Code</p>
            </div>
          </div>

          <div className="prose prose-lg dark:prose-invert max-w-none space-y-8">
            <section>
              <p className="text-xl text-muted-foreground leading-relaxed mb-6">
                Clarity is the world's first AI accessibility scanner that doesn't just audit—it repairs. 
                No overlays, no band-aids. Real code fixes delivered in real time, ensuring your site stays 
                WCAG 2.2 compliant without manual intervention.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4">What Clarity Fixes Automatically</h2>
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
              <h2 className="text-3xl font-bold mb-4">New: Automated Email Follow-Ups</h2>
              <p className="text-muted-foreground mb-4">
                After every free scan, receive a personalized email summary with:
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <span>Top 3 critical issues found on your site</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <span>Count of auto-fixable issues with one-click repair</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <span>Direct upgrade options: $49/mo Pro or $199 one-time fix</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <span>Rate-limited to 1 email per domain per 24 hours to prevent spam</span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4">Continuous Compliance</h2>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <span><strong>Scheduled scans</strong> — Daily, weekly, or monthly automated audits</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <span><strong>Email digests</strong> — Get compliance updates directly in your inbox</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <span><strong>PDF/CSV reporting</strong> — Download audit reports for legal compliance</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <span><strong>Team workflows</strong> — Assign issues, track fixes, collaborate in real time</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <span><strong>White-label options</strong> — Brand the scanner as your own for client work</span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4">Why It's Different</h2>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <span><strong>No overlays</strong> — Real code repair, not accessibility theater</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <span><strong>Brain feedback loop</strong> — Fixes improve PromptFluid ecosystem-wide behavior</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <span><strong>Instant rollback</strong> — One-click restore if any repair breaks your design</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <span><strong>WordPress plugin</strong> — Native integration for WordPress sites</span>
                </li>
              </ul>
            </section>

            <section className="p-8 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl border border-primary/20">
              <h3 className="text-2xl font-bold mb-4">Try It Free</h3>
              <p className="text-muted-foreground mb-6">
                Scan any website for free and get instant compliance scores. Upgrade to unlock auto-repair.
              </p>
              <Link 
                to="/scan" 
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
              >
                Start Free Scan
                <ArrowRight className="w-5 h-5" />
              </Link>
            </section>

            <section className="mt-16 p-8 bg-muted/30 rounded-xl border border-border">
              <h3 className="text-2xl font-bold mb-6">Related Content</h3>
              <div className="grid gap-4">
                <Link to="/pillars/promptfluid-the-firsts" className="flex items-center justify-between p-4 bg-background rounded-lg border border-border hover:border-primary transition-colors group">
                  <span className="font-semibold">The Firsts — Full Chronicle</span>
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
