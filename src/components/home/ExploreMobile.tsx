/**
 * Explore — Mobile Layout
 * Stripped decorative layers for GPU savings, compact spacing,
 * sticky section nav, touch-optimized CTA sizing
 */

import { useRef, lazy, Suspense } from "react";
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

// Minimal divider for mobile — saves GPU vs animated diamond
function MobileDivider() {
  return (
    <div className="py-8">
      <div className="h-px bg-gradient-to-r from-transparent via-border/40 to-transparent" />
    </div>
  );
}

export default function ExploreMobile() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <SEO
        title="Composable AI Infrastructure | CMPSBL"
        description="Governed cognitive infrastructure where intelligence persists, adapts, and compounds. Free to start with 3 capability slots."
        canonical="https://cmpsbl.com"
        image="https://cmpsbl.com/og/home.jpg"
        keywords={['composable AI', 'cognitive infrastructure', 'AI platform', 'agentic AI']}
      />

      <PublicNav />
      <CmpsblWelcome />

      {/* Mobile: single subtle ambient glow instead of 4+ heavy orbs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 gradient-mesh opacity-60" />
        <div
          className="absolute -top-32 left-1/4 w-[400px] h-[400px] rounded-full"
          style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.06) 0%, transparent 50%)" }}
        />
      </div>

      <HeroMetaSubstrate />
      <LiveStatsBar />

      <Suspense fallback={<div className="min-h-[120px]" />}>
        {/* Mobile priority order: Who it's for first (builds interest), then differentiation */}
        <BuiltForSection />
        <MobileDivider />

        <ArtifactPacksSection />
        <MobileDivider />

        <WhySubstrate />
        <DifferentiationSection />
        <MobileDivider />

        <UseCaseShowcase />
        <MobileDivider />

        <HowCmpsblWorks />
        <MobileDivider />

        <NpmPackagesCTA />
        <MobileDivider />

        <SocialProof />
        <MobileDivider />
      </Suspense>

      {/* Mobile CTA — full-width, thumb-friendly */}
      <section className="relative z-10 px-3 py-12">
        <div className="relative rounded-2xl overflow-hidden shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--neon-cyan))] via-[hsl(var(--neon-purple))] to-[hsl(var(--neon-magenta))]" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />

          <div className="relative p-6 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 border border-white/20 backdrop-blur-sm mb-5">
              <Sparkles className="w-3.5 h-3.5 text-white" />
              <span className="text-xs font-semibold text-white/90">Ready to Build?</span>
            </div>

            <h2 className="text-2xl font-black text-white mb-3 leading-tight">
              Start Building<br />
              <span className="text-white/80">Today — Free</span>
            </h2>
            <p className="text-white/70 text-sm max-w-sm mx-auto mb-6 leading-relaxed">
              Persistent memory, governed evolution, and self-improvement — all included. No credit card required.
            </p>

            <div className="flex flex-col gap-3">
              <Button asChild size="lg" className="w-full h-12 text-sm bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-bold shadow-xl rounded-xl">
                <Link to="/auth">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Start Building — Free
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="w-full h-12 text-sm border-white/30 text-white hover:bg-white/10 font-semibold rounded-xl">
                <Link to="/store?tab=plans">
                  <Terminal className="w-4 h-4 mr-2" />
                  View Plans
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Suspense fallback={<div className="min-h-[80px]" />}>
        <EnhancedFooter />
      </Suspense>
    </div>
  );
}
