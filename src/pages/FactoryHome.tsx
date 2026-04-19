/**
 * FactoryHome — Series B Homepage
 * Hero → Live Stats → SDK/CLI → Trust Visual → Built For → Mana Showcase →
 * Trust Visual → Discovery Dual → Free Value → Trust Visual → Social Proof →
 * Final CTA → Patent Trust
 */

import { lazy, Suspense, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Terminal, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import { CmpsblWelcome } from "@/components/onboarding/CmpsblWelcome";
import { PublicNav } from "@/components/PublicNav";
import { HeroMetaSubstrate } from "@/components/hero/HeroMetaSubstrate";
import { LiveStatsBar } from "@/components/home/LiveStatsBar";
import { TrustVisual } from "@/components/home/TrustVisual";
import { AscensionV2ReleaseCTA } from "@/components/home/AscensionV2ReleaseCTA";

import trustInfrastructure from "@/assets/trust-infrastructure.jpg";
import trustEngineering from "@/assets/trust-engineering.jpg";
import trustCognitive from "@/assets/trust-cognitive.jpg";

const EnhancedFooter = lazy(() => import("@/components/EnhancedFooter").then(m => ({ default: m.EnhancedFooter })));
const NpmPackagesCTA = lazy(() => import("@/components/home/NpmPackagesCTA").then(m => ({ default: m.NpmPackagesCTA })));
const DiscoveryDualCards = lazy(() => import("@/components/home/DiscoveryDualCards").then(m => ({ default: m.DiscoveryDualCards })));
const ManaShowcase = lazy(() => import("@/components/home/ManaShowcase").then(m => ({ default: m.ManaShowcase })));
const PatentTrustStrip = lazy(() => import("@/components/home/PatentTrustStrip").then(m => ({ default: m.PatentTrustStrip })));
const FreeValueProposition = lazy(() => import("@/components/home/FreeValueProposition").then(m => ({ default: m.FreeValueProposition })));
const BuiltForSection = lazy(() => import("@/components/home/BuiltForSection").then(m => ({ default: m.BuiltForSection })));
const SocialProof = lazy(() => import("@/components/home/SocialProof").then(m => ({ default: m.SocialProof })));

function SectionDivider() {
  return (
    <div className="relative py-10 sm:py-14 md:py-16">
      <div className="absolute inset-x-[10%] top-1/2 h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />
      <div className="absolute inset-x-[20%] top-1/2 translate-y-[1px] h-px bg-gradient-to-r from-transparent via-primary/10 to-transparent" />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="w-2 h-2 bg-primary/25 rotate-45 rounded-[2px] animate-divider-diamond" />
        <div className="absolute inset-0 -m-2 rounded-full bg-primary/5 blur-sm animate-fade-pulse" />
      </div>
    </div>
  );
}

export default function FactoryHome() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} className="min-h-screen bg-background overflow-x-hidden overflow-y-visible">
      <SEO
        title="CMPSBL® — Governed Cognitive Infrastructure | Free SDK"
        description="The patented dual-layer substrate where intelligence persists, adapts, and compounds. Free SDK and CLI. 40 primitives. Zero AI tricks. Ascension transforms code. Mana attaches silently."
        canonical="https://cmpsbl.com"
        image="https://cmpsbl.com/og/home-v2.jpg"
        keywords={['cognitive infrastructure', 'code hardening', 'software discovery', 'CJPI', 'Memory Stream', 'Ascension', 'Mana', 'Layer 2', 'free SDK', 'composable AI', 'governed AI', 'silent attachment', 'software symbiosis']}
        faq={[
          { question: 'What is CMPSBL?', answer: 'CMPSBL is governed cognitive infrastructure — a patented dual-layer substrate where intelligence persists across sessions, adapts through deterministic evolution, and compounds over time. No AI inside the output.' },
          { question: 'Is there a free tier?', answer: 'Yes. Free is forever — Ascension v2 (rate-limited), the @cmpsbl/cli, the @cmpsbl/sdk, DECODE, and Crown Jewel system bonuses. No credit card required.' },
          { question: 'What is Ascension?', answer: 'Ascension transforms code by colliding it against 40 substrate primitives. Zero external AI calls. Your code gains security, governance, and resilience — without modification to the original source.' },
          { question: 'What is Mana?', answer: 'Mana is the Universal Software Adhesion Layer — it silently attaches capabilities (payments, security, telemetry) to any codebase without requiring developer permission or source modification. Protected by U.S. patent.' },
          { question: 'How does pricing work?', answer: 'Two plans. Free forever with rate-limited Ascension, CLI, and SDK. Pro at $29/mo unlocks unlimited Ascension, full 9-language polyglot export, DREAM synthesis, priority queue, and Store credits. Enterprise is by contract.' },
        ]}
      />

      <PublicNav />
      <CmpsblWelcome />

      {/* Ambient animated mesh background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 gradient-mesh opacity-80" />
        <div
          className="absolute -top-48 -left-48 w-[900px] h-[900px] rounded-full animate-hero-orb-1"
          style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.07) 0%, hsl(var(--primary) / 0.02) 35%, transparent 55%)" }}
        />
        <div
          className="absolute top-1/3 -right-20 w-[600px] h-[600px] rounded-full animate-hero-orb-2"
          style={{ background: "radial-gradient(circle, hsl(var(--neon-cyan) / 0.05) 0%, hsl(var(--neon-cyan) / 0.01) 35%, transparent 55%)" }}
        />
        <div
          className="absolute -bottom-48 -right-48 w-[700px] h-[700px] rounded-full animate-hero-orb-3"
          style={{ background: "radial-gradient(circle, hsl(var(--neon-purple) / 0.06) 0%, hsl(var(--neon-purple) / 0.015) 35%, transparent 55%)" }}
        />
        <div
          className="absolute top-[60%] left-1/3 w-[500px] h-[400px] rounded-full animate-hero-orb-1 opacity-40"
          style={{ background: "radial-gradient(ellipse, hsl(var(--neon-magenta) / 0.04) 0%, transparent 50%)" }}
        />
      </div>

      {/* ═══ HERO (untouched) ═══ */}
      <HeroMetaSubstrate />

      {/* ═══ ASCENSION V2 RELEASE CTA ═══ */}
      <AscensionV2ReleaseCTA />

      {/* ═══ LIVE METRICS ═══ */}
      <LiveStatsBar />

      <Suspense fallback={<div className="min-h-[200px]" />}>
        {/* ═══ FREE SDK + CLI ═══ */}
        <NpmPackagesCTA />

        <SectionDivider />
        <TrustVisual
          src={trustInfrastructure}
          alt="Modern software teams building on trusted governed infrastructure"
          caption="First autonomous AI dreaming capability"
          date="Sep 2025"
        />

        <SectionDivider />

        {/* ═══ BUILT FOR ═══ */}
        <BuiltForSection />

        <SectionDivider />

        {/* ═══ MANA — category-defining innovation ═══ */}
        <ManaShowcase />

        <SectionDivider />
        <TrustVisual
          src={trustEngineering}
          alt="Professional engineering environment with secure governed software workflows"
          caption="40-Primitive substrate reaches full orchestration"
          date="Jan 2025"
        />

        <SectionDivider />

        {/* ═══ MEMORY STREAM + ASCENSION ═══ */}
        <DiscoveryDualCards />

        <SectionDivider />

        {/* ═══ FREE → PAID ═══ */}
        <FreeValueProposition />

        <SectionDivider />
        <TrustVisual
          src={trustCognitive}
          alt="Protected cognitive architecture with secure pathways and persistent software memory"
          caption="Autonomous Memory Stream completes first 8-hour cycle"
          date="Dec 2025"
        />

        <SectionDivider />

        {/* ═══ SOCIAL PROOF ═══ */}
        <SocialProof />

        <SectionDivider />
      </Suspense>

      {/* ═══ FINAL CTA ═══ */}
      <section className="relative z-10 px-3 sm:px-4 py-16 sm:py-32 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none hidden sm:block">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/10 rounded-full blur-[200px]" />
        </div>
        <div className="max-w-5xl mx-auto relative animate-fade-in-up">
          <div className="relative rounded-2xl sm:rounded-[2rem] overflow-hidden shadow-2xl shadow-primary/15 group/cta">
            <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--neon-cyan))] via-[hsl(var(--neon-purple))] to-[hsl(var(--neon-magenta))]" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent" />

            <div
              className="absolute inset-0 opacity-[0.05]"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), 
                  linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)
                `,
                backgroundSize: "50px 50px",
              }}
            />

            <div className="relative p-6 sm:p-14 md:p-20 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 border border-white/20 backdrop-blur-sm mb-6 sm:mb-8 animate-fade-in" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
                <Sparkles className="w-4 h-4 text-white" />
                <span className="text-sm font-semibold text-white/90">Ready to Build?</span>
              </div>

              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white mb-4 sm:mb-6 leading-[1.05] tracking-tight animate-fade-in" style={{ animationDelay: '0.4s', animationFillMode: 'both' }}>
                Install the SDK.
                <br />
                <span className="text-white/80">Build Something Real.</span>
              </h2>
               <p className="text-white/80 text-base sm:text-lg max-w-lg mx-auto mb-8 sm:mb-10 leading-relaxed font-medium animate-fade-in" style={{ animationDelay: '0.5s', animationFillMode: 'both' }}>
                 40 primitives. Dual patents. Zero AI tricks. The substrate is free&nbsp;— start building today.
               </p>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center animate-fade-in" style={{ animationDelay: '0.6s', animationFillMode: 'both' }}>
                <Button asChild size="lg" className="relative px-8 sm:px-10 h-12 sm:h-16 text-sm sm:text-lg bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-bold shadow-2xl shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all rounded-xl">
                  <Link to="/auth">
                    <Terminal className="w-5 h-5 mr-2" />
                    npm install @cmpsbl/sdk
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
                <Button asChild size="lg" className="px-6 sm:px-8 h-12 sm:h-16 text-sm sm:text-lg border border-white/30 bg-white/10 text-white hover:bg-white/20 font-semibold backdrop-blur-sm rounded-xl">
                  <Link to="/plans">
                    View Plans
                  </Link>
                </Button>
              </div>

              {/* Tier quick-reference — v19.1: Free + Pro */}
              <div className="flex items-center justify-center gap-3 sm:gap-4 mt-6 animate-fade-in flex-wrap" style={{ animationDelay: '0.7s', animationFillMode: 'both' }}>
                <span className="text-[10px] sm:text-xs text-white/70 font-mono font-medium">
                  <span className="text-white font-bold">Free</span> forever
                </span>
                <span className="text-white/20">·</span>
                <span className="text-[10px] sm:text-xs text-white/70 font-mono font-medium">
                  <span className="text-white font-bold">Pro</span> $29/mo — unlimited Ascension
                </span>
                <span className="text-white/20">·</span>
                <span className="text-[10px] sm:text-xs text-white/60 font-mono">
                  <span className="text-white/80">Enterprise</span> by contract
                </span>
              </div>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          </div>
        </div>
      </section>

      <Suspense fallback={<div className="min-h-[100px]" />}>
        <PatentTrustStrip />
      </Suspense>

      <Suspense fallback={<div className="min-h-[100px]" />}>
        <EnhancedFooter />
      </Suspense>
    </div>
  );
}
