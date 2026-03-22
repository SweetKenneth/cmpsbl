/**
 * Explore — The CMPSBL Gateway
 * Narrative flow: Hero → Stats → NPM → Who It's For → Packs →
 * Core Systems → Differentiation → Use Cases → Mental Model → Social Proof → Final CTA
 *
 * NOTE: framer-motion is NOT imported here to avoid pulling 56KB into the
 * landing page critical path. All animations use CSS keyframes instead.
 */

import { useRef, lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { 
  ArrowRight, 
  Terminal, 
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import { CmpsblWelcome } from "@/components/onboarding/CmpsblWelcome";

// Above-fold: eager
import { PublicNav } from "@/components/PublicNav";
import { HeroMetaSubstrate } from "@/components/hero/HeroMetaSubstrate";
import { LiveStatsBar } from "@/components/home/LiveStatsBar";

// Below-fold: lazy loaded to reduce initial JS and improve FCP
const EnhancedFooter = lazy(() => import("@/components/EnhancedFooter").then(m => ({ default: m.EnhancedFooter })));
const WhySubstrate = lazy(() => import("@/components/home/WhySubstrate").then(m => ({ default: m.WhySubstrate })));
const HowCmpsblWorks = lazy(() => import("@/components/home/HowCmpsblWorks").then(m => ({ default: m.HowCmpsblWorks })));
const DifferentiationSection = lazy(() => import("@/components/home/DifferentiationSection").then(m => ({ default: m.DifferentiationSection })));
const BuiltForSection = lazy(() => import("@/components/home/BuiltForSection").then(m => ({ default: m.BuiltForSection })));
const ArtifactPacksSection = lazy(() => import("@/components/home/ArtifactPacksSection").then(m => ({ default: m.ArtifactPacksSection })));

const SocialProof = lazy(() => import("@/components/home/SocialProof").then(m => ({ default: m.SocialProof })));
const UseCaseShowcase = lazy(() => import("@/components/home/UseCaseShowcase").then(m => ({ default: m.UseCaseShowcase })));
const NpmPackagesCTA = lazy(() => import("@/components/home/NpmPackagesCTA").then(m => ({ default: m.NpmPackagesCTA })));

// Clean section divider — minimal, refined
function SectionDivider() {
  return (
    <div className="relative py-10 sm:py-14">
      <div className="absolute inset-x-[15%] top-1/2 h-px bg-gradient-to-r from-transparent via-border/40 to-transparent" />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="w-1.5 h-1.5 bg-primary/30 rotate-45 rounded-[1px]" />
      </div>
    </div>
  );
}

export default function Explore() {
  const containerRef = useRef<HTMLDivElement>(null);
  return (
    <div ref={containerRef} className="min-h-screen bg-background overflow-x-hidden overflow-y-visible">
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

      {/* Ambient animated mesh background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 gradient-mesh opacity-80" />
        <div
          className="absolute -top-40 -left-40 w-[800px] h-[800px] rounded-full animate-hero-orb-1"
          style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.06) 0%, transparent 55%)" }}
        />
        <div
          className="absolute top-1/3 right-0 w-[500px] h-[500px] rounded-full animate-hero-orb-2"
          style={{ background: "radial-gradient(circle, hsl(var(--neon-cyan) / 0.04) 0%, transparent 55%)" }}
        />
        <div
          className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full animate-hero-orb-3"
          style={{ background: "radial-gradient(circle, hsl(var(--neon-purple) / 0.05) 0%, transparent 55%)" }}
        />
      </div>

      {/* ═══ HERO ═══ */}
      <HeroMetaSubstrate />

      {/* ═══ LIVE METRICS ═══ */}
      <LiveStatsBar />

      <Suspense fallback={<div className="min-h-[200px]" />}>
        {/* ═══ NPM SDK ═══ */}
        <NpmPackagesCTA />

        <SectionDivider />

        {/* ═══ WHO IT'S FOR ═══ */}
        <BuiltForSection />

        <SectionDivider />

        {/* ═══ ACTIVATION MODEL ═══ */}
        <ArtifactPacksSection />

        <SectionDivider />

        {/* ═══ CORE SYSTEMS ═══ */}
        <WhySubstrate />

        {/* ═══ DIFFERENTIATION ═══ */}
        <DifferentiationSection />

        <SectionDivider />

        {/* ═══ USE CASES ═══ */}
        <UseCaseShowcase />

        <SectionDivider />

        {/* ═══ MENTAL MODEL ═══ */}
        <HowCmpsblWorks />

        <SectionDivider />

        {/* ═══ SOCIAL PROOF ═══ */}
        <SocialProof />

        <SectionDivider />
      </Suspense>

      {/* ═══ FINAL CTA ═══ */}
      <section className="relative z-10 px-3 sm:px-4 py-14 sm:py-32 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none hidden sm:block">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/10 rounded-full blur-[200px]" />
        </div>
        <div className="max-w-5xl mx-auto relative animate-fade-in-up">
          <div className="relative rounded-2xl sm:rounded-[2rem] overflow-hidden shadow-2xl shadow-primary/15 group/cta">
            {/* Layered gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--neon-cyan))] via-[hsl(var(--neon-purple))] to-[hsl(var(--neon-magenta))]" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            
            {/* Grid overlay */}
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
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 border border-white/20 backdrop-blur-sm mb-8 animate-fade-in" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
                <Sparkles className="w-4 h-4 text-white" />
                <span className="text-sm font-semibold text-white/90">Ready to Build?</span>
              </div>
              
              <h2 className="text-2xl sm:text-5xl md:text-6xl font-black text-white mb-4 sm:mb-6 leading-[1.05] tracking-tight">
                Start Building{" "}
                <br className="hidden sm:block" />
                <span className="text-white/80">Today — Free</span>
              </h2>
              <p className="text-white/70 text-sm sm:text-lg max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed">
                Persistent memory, governed evolution, and self-improvement cycles — all included. 
                Start with 3 capability slots, no credit card required.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <Button asChild size="lg" className="relative px-8 sm:px-10 h-12 sm:h-16 text-sm sm:text-lg bg-white text-gray-900 hover:bg-white/90 font-bold shadow-2xl shadow-black/25 hover:scale-[1.02] active:scale-[0.98] transition-all rounded-xl">
                  <Link to="/auth">
                    <Sparkles className="w-5 h-5 mr-2" />
                    Start Building — Free
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="px-6 sm:px-8 h-12 sm:h-16 text-sm sm:text-lg border-white/30 text-white hover:bg-white/10 font-semibold backdrop-blur-sm rounded-xl">
                  <Link to="/store?tab=plans">
                    <Terminal className="w-5 h-5 mr-2" />
                    View Plans
                  </Link>
                </Button>
              </div>
            </div>
            
            <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          </div>
        </div>
      </section>

      <Suspense fallback={<div className="min-h-[100px]" />}>
        <EnhancedFooter />
      </Suspense>
    </div>
  );
}
