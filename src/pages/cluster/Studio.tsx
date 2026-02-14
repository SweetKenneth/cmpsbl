import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Rocket, ArrowRight, CheckCircle, Layers, Globe, Zap, Code2 } from "lucide-react";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { SEO } from "@/components/SEO";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Card } from "@/components/ui/card";
import ogImage from "@/assets/og/studio.jpg";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

const stagger = (i: number) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5, delay: i * 0.1 },
});

const capabilities = [
  { icon: Globe, title: "URL-to-Site Rebuild", description: "Paste any URL — Studio crawls, extracts content, and regenerates a modernized, accessible version in minutes." },
  { icon: Layers, title: "Multi-Framework Export", description: "Output to React, Next.js, static HTML, or headless CMS — whatever your stack requires." },
  { icon: Zap, title: "Instant WCAG Compliance", description: "Every rebuild ships with WCAG AA compliance, semantic HTML, and accessible navigation baked in." },
  { icon: Code2, title: "SEO-Ready Architecture", description: "Structured data, meta tags, Open Graph, canonical URLs, and sitemap generation — all automatic." },
];

export default function Studio() {
  return (
    <>
      <SEO
        title="CMPSBL Studio — Autonomous Site Generator"
        description="From legacy to modern in minutes: Studio rebuilds sites with accessibility and SEO baked in."
        canonical="https://cmpsbl.com/cluster/studio-autonomous-site-generator"
        image={ogImage}
        type="article"
        keywords={[
          'site generator', 'website rebuilder', 'autonomous site builder',
          'AI site generation', 'website modernization', 'legacy site migration'
        ]}
      />

      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": "Studio: Autonomous Site Generator with Rebuilder",
          "description": "Paste a URL, get a modernized site. Studio + Rebuilder resurrect old designs into accessible, SEO-ready experiences.",
          "image": ogImage,
          "datePublished": "2025-11-04",
          "author": { "@type": "Organization", "name": "PromptFluid" }
        })}
      </script>

      <div className="min-h-screen bg-background">
        <PublicNav />

        {/* Ambient glow */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <motion.div
            className="absolute top-20 left-1/3 w-[500px] h-[500px] rounded-full"
            style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.06) 0%, transparent 60%)" }}
            animate={{ x: [-40, 40, -40], y: [-20, 20, -20] }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <article className="relative z-10 container mx-auto px-4 pt-24 pb-16 max-w-4xl">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "The Firsts", href: "/pillars/promptfluid-the-firsts" },
              { label: "Studio" }
            ]}
            className="mb-8"
          />

          <motion.div {...fadeUp} className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-primary-variant flex items-center justify-center shadow-lg shadow-primary/20">
              <Rocket className="w-8 h-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Studio
              </h1>
              <p className="text-xl text-muted-foreground">Autonomous Site Generator with Rebuilder</p>
            </div>
          </motion.div>

          <div className="prose prose-lg dark:prose-invert max-w-none space-y-12">
            <motion.section {...fadeUp} transition={{ duration: 0.6, delay: 0.1 }}>
              <h2 className="text-3xl font-bold mb-4">What It Does</h2>
              <p className="text-lg text-muted-foreground mb-6">
                Studio is the substrate's autonomous site generation engine. Point it at any URL and it will crawl, 
                extract, and rebuild the entire site into a modern, accessible, SEO-optimized experience — no manual 
                work required.
              </p>
              <ul className="space-y-3">
                {[
                  "Paste URL → content crawl → modernized, accessible variants",
                  "Export to frameworks, bundle assets, ship fast",
                  "Automatic WCAG AA compliance and semantic HTML",
                  "Open Graph, structured data, and sitemap generation"
                ].map((item, i) => (
                  <motion.li key={i} {...stagger(i)} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                    <span>{item}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.section>

            {/* Capabilities Grid */}
            <section>
              <motion.h2 {...fadeUp} className="text-3xl font-bold mb-6">Core Capabilities</motion.h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {capabilities.map((cap, i) => (
                  <motion.div key={cap.title} {...stagger(i)}>
                    <Card className="p-6 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
                      <cap.icon className="w-8 h-8 text-primary mb-3" />
                      <h3 className="text-lg font-semibold mb-2">{cap.title}</h3>
                      <p className="text-sm text-muted-foreground">{cap.description}</p>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </section>

            <motion.section {...fadeUp} transition={{ duration: 0.6, delay: 0.2 }}>
              <h2 className="text-3xl font-bold mb-4">Why It Matters</h2>
              <p className="text-lg leading-relaxed text-muted-foreground">
                Legacy sites are everywhere — outdated designs, broken accessibility, poor SEO. Studio handles 
                modernization at scale, automatically enforcing WCAG compliance and search-engine best practices. 
                What once took weeks of manual migration now takes minutes.
              </p>
            </motion.section>

            <motion.section {...fadeUp} transition={{ duration: 0.6, delay: 0.3 }}>
              <h2 className="text-3xl font-bold mb-4">The Loop</h2>
              <p className="text-lg leading-relaxed text-muted-foreground">
                Every rebuild feeds data back into the substrate. Clarity validates accessibility scores, 
                Verify certifies plugin compliance, and Brain learns from every generation — continuously 
                improving output quality across the entire system.
              </p>
            </motion.section>

            <motion.section {...fadeUp} className="mt-16 p-8 bg-muted/30 rounded-xl border border-border">
              <h3 className="text-2xl font-bold mb-6">Related Content</h3>
              <div className="grid gap-4">
                {[
                  { to: "/pillars/promptfluid-the-firsts", label: "The Firsts — Full Chronicle" },
                  { to: "/cluster/inclusive-module-accessibility", label: "INCLUSIVE — Human Compatibility" },
                  { to: "/cluster/verify-worlds-first-ai-plugin-certification", label: "Verify — Plugin Certification" },
                  { to: "/", label: "Home" },
                ].map((link) => (
                  <Link key={link.to} to={link.to} className="flex items-center justify-between p-4 bg-background rounded-lg border border-border hover:border-primary/40 hover:shadow-md hover:shadow-primary/5 transition-all group">
                    <span className="font-semibold">{link.label}</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                ))}
              </div>
            </motion.section>
          </div>
        </article>

        <EnhancedFooter />
      </div>
    </>
  );
}
