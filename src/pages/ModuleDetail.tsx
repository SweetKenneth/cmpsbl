/**
 * Node Detail Page — Hybrid marketing hero + technical depth
 * SEO: /modules/:slug — captures specific node intent
 */

import { useParams, Link, Navigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Code, Layers, Plug, Sparkles } from "lucide-react";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { getModuleBySlug, MODULE_REGISTRY } from "@/lib/modules/module-registry";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function ModuleDetail() {
  const { slug } = useParams<{ slug: string }>();
  const mod = slug ? getModuleBySlug(slug) : undefined;

  if (!mod) return <Navigate to="/modules" replace />;

  // Find prev/next for navigation
  const idx = MODULE_REGISTRY.findIndex(m => m.slug === slug);
  const prev = idx > 0 ? MODULE_REGISTRY[idx - 1] : null;
  const next = idx < MODULE_REGISTRY.length - 1 ? MODULE_REGISTRY[idx + 1] : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": `CMPSBL ${mod.name} Node`,
    "description": mod.description,
    "url": `https://cmpsbl.com/modules/${mod.slug}`,
    "applicationCategory": "AI Operating System",
    "operatingSystem": "Cloud",
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
    "publisher": { "@type": "Organization", "name": "CMPSBL", "url": "https://cmpsbl.com" },
  };

  // Generate FAQ schema from highlights for AI crawler citation
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": `What does the ${mod.name} node do in CMPSBL's AI Operating System?`,
        "acceptedAnswer": { "@type": "Answer", "text": mod.heroDescription },
      },
      ...mod.highlights.map(h => ({
        "@type": "Question",
        "name": `What is ${h.title} in CMPSBL ${mod.name}?`,
        "acceptedAnswer": { "@type": "Answer", "text": h.description },
      })),
      {
        "@type": "Question",
        "name": `What are the key features of CMPSBL ${mod.name}?`,
        "acceptedAnswer": { "@type": "Answer", "text": mod.features.join(". ") + "." },
      },
    ],
  };

  return (
    <>
      <Helmet>
        <title>{mod.useCaseH1} | CMPSBL {mod.name}</title>
        <meta name="description" content={`${mod.heroDescription.slice(0, 155)}…`} />
        <link rel="canonical" href={`https://cmpsbl.com/modules/${mod.slug}`} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
      </Helmet>

      <PublicNav />

      <main className="min-h-screen bg-background">
        {/* ═══ Hero Section (Marketing) ═══ */}
        <section className="relative py-14 sm:py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
          <div className="container mx-auto max-w-4xl px-4 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Breadcrumb */}
              <Link to="/modules" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
                <ArrowLeft className="w-4 h-4" />
                All Nodes
              </Link>

              <div className="flex items-center gap-3 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <mod.icon className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <span className="text-xs font-bold tracking-widest uppercase text-muted-foreground">{mod.layer} Layer</span>
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
                    {mod.name} <span className="text-muted-foreground font-normal">— {mod.tagline}</span>
                  </h1>
                </div>
              </div>

              <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-3xl">
                {mod.heroDescription}
              </p>

              <div className="flex flex-wrap gap-3 mt-8">
                <Button asChild size="lg" className="rounded-xl">
                  <Link to="/developers">
                    Get Started Free <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="rounded-xl">
                  <Link to="/documentation">View Documentation</Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ═══ Features ═══ */}
        <section className="py-12 sm:py-16 border-t border-border/50">
          <div className="container mx-auto max-w-4xl px-4">
            <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
              <Check className="w-5 h-5 text-primary" /> Key Capabilities
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {mod.features.map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-start gap-3 p-4 rounded-xl border border-border bg-card shimmer-on-hover card-lift"
                >
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <span className="text-sm text-foreground">{feature}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ Why This Node (SEO-Rich Highlights) ═══ */}
        <section className="py-12 sm:py-16 bg-muted/30 border-t border-border/50">
          <div className="container mx-auto max-w-4xl px-4">
            <h2 className="text-2xl font-bold mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" /> Why {mod.name}?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-2xl">
              What makes {mod.name} different from every other {mod.layer.toLowerCase()}-layer solution on the market.
            </p>
            <div className="space-y-6">
              {mod.highlights.map((highlight, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-6 rounded-xl border border-border bg-card hover:border-primary/20 transition-colors shimmer-on-hover card-lift"
                >
                  <h3 className="text-lg font-bold text-foreground mb-2">{highlight.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{highlight.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ Code Example (Technical) ═══ */}
        <section className="py-12 sm:py-16 bg-muted/30 border-t border-border/50">
          <div className="container mx-auto max-w-4xl px-4">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Code className="w-5 h-5 text-primary" /> Quick Start
            </h2>
            <div className="rounded-xl border border-primary/20 bg-card overflow-hidden shadow-lg shadow-primary/5">
              <div className="px-4 py-2.5 border-b border-border bg-muted/50 flex items-center gap-2 text-xs text-muted-foreground">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-destructive/50" />
                  <div className="w-3 h-3 rounded-full bg-accent/50" />
                  <div className="w-3 h-3 rounded-full bg-primary/50" />
                </div>
                <span className="font-mono">example.ts</span>
              </div>
              <pre className="p-5 sm:p-6 overflow-x-auto text-[13px] sm:text-sm font-mono text-primary/90 leading-relaxed">
                <code>{mod.codeSnippet}</code>
              </pre>
            </div>
          </div>
        </section>

        {/* ═══ Integrations ═══ */}
        <section className="py-12 sm:py-16 border-t border-border/50">
          <div className="container mx-auto max-w-4xl px-4">
            <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
              <Plug className="w-5 h-5 text-primary" /> Integrations
            </h2>
            <div className="flex flex-wrap gap-3">
              {mod.integrations.map((integration, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="px-4 py-2 rounded-full border border-border bg-card text-sm font-medium hover:border-primary/30 hover:bg-primary/5 transition-colors cursor-default"
                >
                  {integration}
                </motion.span>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ Use Cases ═══ */}
        <section className="py-12 sm:py-16 bg-muted/30 border-t border-border/50">
          <div className="container mx-auto max-w-4xl px-4">
            <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
              <Layers className="w-5 h-5 text-primary" /> Use Cases
            </h2>
            <div className="space-y-4">
              {mod.useCases.map((useCase, i) => (
                <div key={i} className="flex items-start gap-3 p-5 rounded-xl border border-border bg-card">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-primary">{i + 1}</span>
                  </div>
                  <p className="text-foreground leading-relaxed">{useCase}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ Prev/Next Navigation ═══ */}
        <section className="py-12 border-t border-border/50">
          <div className="container mx-auto max-w-4xl px-4">
            <div className="flex justify-between gap-4">
              {prev ? (
                <Link to={`/modules/${prev.slug}`} className="group flex items-center gap-3 p-4 rounded-xl border border-border hover:border-primary/30 transition-colors flex-1">
                  <ArrowLeft className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  <div>
                    <div className="text-xs text-muted-foreground">Previous</div>
                    <div className="font-semibold text-sm">{prev.name}</div>
                  </div>
                </Link>
              ) : <div />}
              {next ? (
                <Link to={`/modules/${next.slug}`} className="group flex items-center gap-3 p-4 rounded-xl border border-border hover:border-primary/30 transition-colors flex-1 justify-end text-right">
                  <div>
                    <div className="text-xs text-muted-foreground">Next</div>
                    <div className="font-semibold text-sm">{next.name}</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </Link>
              ) : <div />}
            </div>
          </div>
        </section>

        {/* ═══ CTA ═══ */}
        <section className="py-14 sm:py-20 bg-gradient-to-b from-primary/5 to-transparent border-t border-border/50">
          <div className="container mx-auto max-w-3xl px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to build with {mod.name}?</h2>
            <p className="text-muted-foreground mb-8">Start for free. No credit card required.</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Button asChild size="lg" className="rounded-xl">
                <Link to="/developers">Get Started Free <ArrowRight className="w-4 h-4 ml-2" /></Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-xl">
                <Link to="/modules">Explore All Nodes</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <EnhancedFooter />
    </>
  );
}
