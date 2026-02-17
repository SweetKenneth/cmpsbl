/**
 * Clockless & the CMPSBL World Engine — Canonical Reference
 */

import { SEO } from "@/components/SEO";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { Badge } from "@/components/ui/badge";
import { Clock, Globe, BookOpen, Link2, Layers } from "lucide-react";

export default function ClocklessWorldEngine() {
  return (
    <>
      <SEO
        title="Clockless & the CMPSBL World Engine"
        description="Why CMPSBL uses the terms Clockless and World Engine, how they relate, and how this framing improves clarity for developers, researchers, and the broader market."
        keywords={["Clockless", "World Engine", "CMPSBL", "cognitive substrate", "brand clarity", "developer reference"]}
      />

      <PublicNav />

      <main className="min-h-screen bg-background">
        {/* Hero */}
        <section className="relative py-16 md:py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
          <div className="container mx-auto px-4 relative">
            <div className="max-w-3xl mx-auto text-center">
              <Badge variant="outline" className="mb-6 px-4 py-2 text-sm border-primary/30">
                <BookOpen className="w-4 h-4 mr-2 inline" />
                Canonical Reference
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
                <span className="bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
                  Clockless & the CMPSBL World Engine
                </span>
              </h1>
              <p className="text-lg text-muted-foreground">
                Terminology clarity for developers, researchers, and the broader market.
              </p>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto space-y-16">

              {/* Clockless */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold">Clockless</h2>
                </div>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>Clockless describes how intelligence behaves inside CMPSBL.</p>
                  <p>
                    The system does not rely on timers, cron jobs, or scheduled automation.
                    Learning, evolution, and adaptation occur in response to state, intent, and internal signals — not time.
                  </p>
                  <p>Intelligence improves when conditions are met, not when a clock fires.</p>
                  <p className="text-foreground font-medium">
                    Clockless is not a feature.<br />
                    It is a behavioral property of the system.
                  </p>
                </div>
              </div>

              <hr className="border-border/50" />

              {/* Why World Engine */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Globe className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold">Why CMPSBL Is a World Engine</h2>
                </div>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    CMPSBL is referred to as a World Engine because it behaves like a bounded, persistent environment rather than a traditional application.
                  </p>
                  <p>A World Engine implies:</p>
                  <ul className="space-y-2 pl-1">
                    {[
                      'Persistent internal state',
                      'Governed evolution',
                      'Defined internal rules and constraints',
                      'Memory that compounds over time',
                      'Systems that can be observed, studied, and reasoned about',
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <span className="text-primary mt-1.5 shrink-0">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <p>
                    This framing is intentional for developers and researchers who need to understand how intelligence behaves across long time horizons.
                  </p>
                </div>
              </div>

              <hr className="border-border/50" />

              {/* Brand Fluidity */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Layers className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold">Brand Fluidity & Market Clarity</h2>
                </div>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    Internally and academically, CMPSBL can accurately be described as a cognitive substrate.
                  </p>
                  <p>
                    However, the term "cognitive substrate" is not yet widely understood outside research circles and often creates unnecessary friction or confusion in broader technical markets.
                  </p>
                  <p>The use of:</p>
                  <ul className="space-y-2 pl-1">
                    <li className="flex items-start gap-3">
                      <span className="text-primary mt-1.5 shrink-0">•</span>
                      <span><strong className="text-foreground">Clockless</strong> — to describe behavior</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-primary mt-1.5 shrink-0">•</span>
                      <span><strong className="text-foreground">World Engine</strong> — to describe architecture</span>
                    </li>
                  </ul>
                  <p>
                    provides clearer mental models without reducing technical rigor.
                  </p>
                  <p>
                    This shift improves communication with developers, researchers, and investors while preserving the underlying reality of what the system is.
                  </p>
                </div>
              </div>

              <hr className="border-border/50" />

              {/* How Terms Relate */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Link2 className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold">How the Terms Relate</h2>
                </div>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    Clockless explains <em>how</em> intelligence evolves.<br />
                    The World Engine defines <em>where</em> and <em>under what rules</em> that evolution occurs.
                  </p>
                  <p className="text-foreground font-medium">
                    Clockless is the principle.<br />
                    The World Engine is the structure.
                  </p>
                </div>
              </div>

              <hr className="border-border/50" />

              {/* Canonical Reference */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold">Canonical Reference</h2>
                </div>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>This page exists to prevent terminology drift across:</p>
                  <ul className="space-y-2 pl-1">
                    {[
                      'Documentation',
                      'Research citations',
                      'Developer discussions',
                      'Investor materials',
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <span className="text-primary mt-1.5 shrink-0">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <p>When referencing CMPSBL:</p>
                  <ul className="space-y-2 pl-1">
                    <li className="flex items-start gap-3">
                      <span className="text-primary mt-1.5 shrink-0">•</span>
                      <span>Use <strong className="text-foreground">Clockless</strong> to describe system behavior</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-primary mt-1.5 shrink-0">•</span>
                      <span>Use <strong className="text-foreground">World Engine</strong> to describe system architecture</span>
                    </li>
                  </ul>
                </div>
              </div>

            </div>
          </div>
        </section>
      </main>

      <EnhancedFooter />
    </>
  );
}
