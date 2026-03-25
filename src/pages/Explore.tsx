/**
 * Explore — The CMPSBL Gateway
 * Single responsive component — all content on all viewports
 */

import { lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import { CmpsblWelcome } from "@/components/onboarding/CmpsblWelcome";
import { PublicNav } from "@/components/PublicNav";
import { HeroMetaSubstrate } from "@/components/hero/HeroMetaSubstrate";
import { LiveStatsBar } from "@/components/home/LiveStatsBar";

const EnhancedFooter = lazy(() => import("@/components/EnhancedFooter").then(m => ({ default: m.EnhancedFooter })));
const WhySubstrate = lazy(() => import("@/components/home/WhySubstrate").then(m => ({ default: m.WhySubstrate })));
const HowCmpsblWorks = lazy(() => import("@/components/home/HowCmpsblWorks").then(m => ({ default: m.HowCmpsblWorks })));
const DifferentiationSection = lazy(() => import("@/components/home/DifferentiationSection").then(m => ({ default: m.DifferentiationSection })));
const BuiltForSection = lazy(() => import("@/components/home/BuiltForSection").then(m => ({ default: m.BuiltForSection })));
const ArtifactPacksSection = lazy(() => import("@/components/home/ArtifactPacksSection").then(m => ({ default: m.ArtifactPacksSection })));
const SocialProof = lazy(() => import("@/components/home/SocialProof").then(m => ({ default: m.SocialProof })));
const UseCaseShowcase = lazy(() => import("@/components/home/UseCaseShowcase").then(m => ({ default: m.UseCaseShowcase })));
const NpmPackagesCTA = lazy(() => import("@/components/home/NpmPackagesCTA").then(m => ({ default: m.NpmPackagesCTA })));

function SectionDivider() {
  return (
    <div className="py-8 md:py-16">
      <div className="h-px bg-gradient-to-r from-transparent via-border/40 md:via-border/50 to-transparent md:mx-[10%]" />
      {/* Diamond accent — visible on larger screens */}
      <div className="hidden md:block relative">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -mt-[0.5px]">
          <div className="w-2 h-2 bg-primary/25 rotate-45 rounded-[2px] animate-divider-diamond" />
          <div className="absolute inset-0 -m-2 rounded-full bg-primary/5 blur-sm animate-fade-pulse" />
        </div>
      </div>
    </div>
  );
}

export default function Explore() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden overflow-y-visible">
      <SEO
        title="Composable AI Infrastructure | CMPSBL"
        description="Governed cognitive infrastructure where intelligence persists, adapts, and compounds. Free to start with 3 capability slots. Composable AI platform for agentic systems that learn."
        canonical="https://cmpsbl.com"
        image="https://cmpsbl.com/og/home.jpg"
        keywords={['composable AI', 'cognitive infrastructure', 'AI platform', 'agentic AI', 'governed AI', 'adaptive intelligence', 'AI agent memory', 'self-improving software', 'capability packs']}
        faq={[
          { question: 'What is CMPSBL?', answer: 'CMPSBL is composable cognitive infrastructure — a modular AI platform where intelligence persists across sessions, adapts through governed evolution, and compounds over time.' },
          { question: 'How does persistent memory work?', answer: 'CMPSBL provides multi-tier persistent memory that gives AI agents permanent recall across sessions. Add it to any agent in under an hour with the free tier.' },
          { question: 'What are capability packs?', answer: 'Capability packs are bundles of features you activate on demand. Each pack uses one slot. Your plan determines how many slots you have — not which packs you can access.' },
          { question: 'Is there a free tier?', answer: 'Yes. The Builder tier is completely free — 3 capability slots, full runtime access, persistent memory, and governed orchestration. No credit card required.' },
          { question: 'What AI providers does CMPSBL support?', answer: 'CMPSBL routes across multiple providers including OpenAI, Anthropic, Google, and open-source models through the intelligent router. Bring your own keys or use managed routing.' },
        ]}
      />

      <PublicNav />
      <CmpsblWelcome />

      {/* Multi-layered ambient background — scales with viewport */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 gradient-mesh opacity-60 md:opacity-80" />
        <div
          className="absolute -top-32 md:-top-48 left-1/4 md:-left-48 w-[400px] md:w-[900px] h-[400px] md:h-[900px] rounded-full md:animate-hero-orb-1"
          style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.06) 0%, hsl(var(--primary) / 0.02) 35%, transparent 55%)" }}
        />
        <div
          className="absolute top-1/3 -right-20 w-[300px] md:w-[600px] h-[300px] md:h-[600px] rounded-full md:animate-hero-orb-2"
          style={{ background: "radial-gradient(circle, hsl(var(--neon-cyan) / 0.05) 0%, hsl(var(--neon-cyan) / 0.01) 35%, transparent 55%)" }}
        />
        <div
          className="absolute -bottom-32 md:-bottom-48 -right-32 md:-right-48 w-[400px] md:w-[700px] h-[400px] md:h-[700px] rounded-full md:animate-hero-orb-3"
          style={{ background: "radial-gradient(circle, hsl(var(--neon-purple) / 0.06) 0%, hsl(var(--neon-purple) / 0.015) 35%, transparent 55%)" }}
        />
        <div
          className="hidden md:block absolute top-[60%] left-1/3 w-[500px] h-[400px] rounded-full animate-hero-orb-1 opacity-40"
          style={{ background: "radial-gradient(ellipse, hsl(var(--neon-magenta) / 0.04) 0%, transparent 50%)" }}
        />
      </div>

      <HeroMetaSubstrate />
      <LiveStatsBar />

      <Suspense fallback={<div className="min-h-[120px] md:min-h-[200px]" />}>
        <NpmPackagesCTA />
        <SectionDivider />

        <BuiltForSection />
        <SectionDivider />

        <ArtifactPacksSection />
        <SectionDivider />

        <WhySubstrate />
        <DifferentiationSection />
        <SectionDivider />

        <UseCaseShowcase />
        <SectionDivider />

        <HowCmpsblWorks />
        <SectionDivider />

        <SocialProof />
        <SectionDivider />
      </Suspense>

      {/* Final CTA — responsive sizing */}
      <section className="relative z-10 px-3 md:px-4 py-12 md:py-32 overflow-hidden">
        <div className="md:absolute md:inset-0 pointer-events-none hidden md:block">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/10 rounded-full blur-[200px]" />
        </div>
        <div className="max-w-5xl mx-auto relative">
          <div className="relative rounded-2xl md:rounded-[2rem] overflow-hidden shadow-xl md:shadow-2xl md:shadow-primary/15">
            <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--neon-cyan))] via-[hsl(var(--neon-purple))] to-[hsl(var(--neon-magenta))]" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent" />

            <div
              className="hidden md:block absolute inset-0 opacity-[0.05]"
              style={{
                backgroundImage: `linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)`,
                backgroundSize: "50px 50px",
              }}
            />

            <div className="relative p-6 md:p-14 lg:p-20 text-center">
              <div className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-white/15 border border-white/20 backdrop-blur-sm mb-5 md:mb-8">
                <Sparkles className="w-3.5 md:w-4 h-3.5 md:h-4 text-white" />
                <span className="text-xs md:text-sm font-semibold text-white/90">Ready to Build?</span>
              </div>

              <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-black text-white mb-3 md:mb-6 leading-tight tracking-tight">
                Start Building<br />
                <span className="text-white/80">Today — Free</span>
              </h2>
              <p className="text-white/70 text-sm md:text-lg max-w-sm md:max-w-2xl mx-auto mb-6 md:mb-10 leading-relaxed">
                Persistent memory, governed evolution, and self-improvement cycles — all included.
                Start with 3 capability slots, no credit card required.
              </p>

              <div className="flex flex-col md:flex-row gap-3 md:gap-4 md:justify-center">
                <Button asChild size="lg" className="w-full md:w-auto h-12 md:h-16 text-sm md:text-lg bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-bold shadow-xl md:shadow-2xl md:shadow-primary/25 md:hover:scale-[1.02] md:active:scale-[0.98] transition-all rounded-xl md:px-10">
                  <Link to="/auth">
                    <Sparkles className="w-4 md:w-5 h-4 md:h-5 mr-2" />
                    Start Building — Free
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="w-full md:w-auto h-12 md:h-16 text-sm md:text-lg border-white/30 text-white hover:bg-white/10 font-semibold md:backdrop-blur-sm rounded-xl md:px-8">
                  <Link to="/store?tab=plans">
                    <Terminal className="w-4 md:w-5 h-4 md:h-5 mr-2" />
                    View Plans
                  </Link>
                </Button>
              </div>
            </div>

            <div className="hidden md:block h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          </div>
        </div>
      </section>

      <Suspense fallback={<div className="min-h-[80px] md:min-h-[100px]" />}>
        <EnhancedFooter />
      </Suspense>
    </div>
  );
}
