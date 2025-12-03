import { Link } from "react-router-dom";
import { Rocket, ArrowRight, CheckCircle } from "lucide-react";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { SEO } from "@/components/SEO";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import ogImage from "@/assets/og/studio.jpg";

export default function Studio() {
  return (
    <>
      <SEO
        title="PromptFluid Studio — Autonomous Site Generator (Rebuilder Inside)"
        description="From legacy to modern in minutes: Studio rebuilds sites with accessibility and SEO baked in."
        canonical="https://promptfluid.com/cluster/studio-autonomous-site-generator"
        image={ogImage}
        type="article"
        keywords={[
          'site generator',
          'website rebuilder',
          'autonomous site builder',
          'AI site generation',
          'website modernization',
          'legacy site migration'
        ]}
      />

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": "Studio: Autonomous Site Generator with Rebuilder",
          "description": "Paste a URL, get a modernized site. Studio + Rebuilder resurrect old designs into accessible, SEO-ready experiences.",
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
              { label: "Studio" }
            ]}
            className="mb-8"
          />

          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-primary-variant flex items-center justify-center">
              <Rocket className="w-8 h-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Studio
              </h1>
              <p className="text-xl text-muted-foreground">Autonomous Site Generator with Rebuilder</p>
            </div>
          </div>

          <div className="prose prose-lg dark:prose-invert max-w-none space-y-8">
            <section>
              <h2 className="text-3xl font-bold mb-4">What It Does</h2>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <span>Paste URL → content crawl → modernized, accessible variants</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <span>Export to frameworks, bundle assets, ship fast</span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4">Why It Matters</h2>
              <p className="text-lg leading-relaxed">
                Modernization at scale; automatic WCAG & SEO baked in
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4">The Loop</h2>
              <p className="text-lg leading-relaxed">
                Feeds Clarity & Verify; Brain learns from every rebuild
              </p>
            </section>

            <section className="mt-16 p-8 bg-muted/30 rounded-xl border border-border">
              <h3 className="text-2xl font-bold mb-6">Related Content</h3>
              <div className="grid gap-4">
                <Link to="/pillars/promptfluid-the-firsts" className="flex items-center justify-between p-4 bg-background rounded-lg border border-border hover:border-primary transition-colors group">
                  <span className="font-semibold">The Firsts — Full Chronicle</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/cluster/clarity-ai-accessibility-and-autofix" className="flex items-center justify-between p-4 bg-background rounded-lg border border-border hover:border-primary transition-colors group">
                  <span className="font-semibold">Clarity — AI Accessibility</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/cluster/verify-worlds-first-ai-plugin-certification" className="flex items-center justify-between p-4 bg-background rounded-lg border border-border hover:border-primary transition-colors group">
                  <span className="font-semibold">Verify — Plugin Certification</span>
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
