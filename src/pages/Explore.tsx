/**
 * Explore — The CMPSBL Gateway
 * Narrative flow: Hero → Stats → What It Is → How It's Different → Who It's For →
 * Activation Model → Governance → Social Proof → Evolution → Engines → Final CTA
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
const GovernanceSignal = lazy(() => import("@/components/home/GovernanceSignal").then(m => ({ default: m.GovernanceSignal })));
const SocialProof = lazy(() => import("@/components/home/SocialProof").then(m => ({ default: m.SocialProof })));
const EvolutionCTA = lazy(() => import("@/components/home/EvolutionCTA").then(m => ({ default: m.EvolutionCTA })));
const EnginesCTA = lazy(() => import("@/components/home/EnginesCTA").then(m => ({ default: m.EnginesCTA })));
const UseCaseShowcase = lazy(() => import("@/components/home/UseCaseShowcase").then(m => ({ default: m.UseCaseShowcase })));

// Section divider with animated gradient, memory-stream accent, and side flair
// Uses CSS keyframes instead of framer-motion to avoid 56KB dependency
function SectionDivider() {
  return (
    <div className="relative py-12 sm:py-16">
      {/* Outer fade line */}
      <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-border/30 to-transparent" />
      {/* Colored memory-stream accent */}
      <div className="absolute left-[10%] right-[10%] top-1/2 h-px">
        <div className="h-full divider-flow" />
      </div>
      {/* Center diamond with concentric rings — CSS pulse replaces motion.div */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div 
          className="w-2.5 h-2.5 bg-primary/50 rotate-45 rounded-[1px] animate-divider-diamond"
        />
        <div className="absolute -inset-2 border border-primary/10 rotate-45 rounded-[2px]" />
        <div className="absolute -inset-4 border border-primary/5 rotate-45 rounded-[3px]" />
        <div className="absolute inset-0 w-2.5 h-2.5 bg-primary/20 rotate-45 blur-md" />
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
        description="Governed cognitive infrastructure where intelligence persists, adapts, and compounds. Free to start with 3 artifact slots. Composable AI substrate for agentic systems that learn."
        canonical="https://cmpsbl.com"
        image="https://cmpsbl.com/og/home.jpg"
        keywords={['composable AI', 'cognitive infrastructure', 'AI substrate', 'agentic AI platform', 'governed AI', 'adaptive intelligence', 'AI agent memory', 'self-improving software', 'artifact packs']}
        faq={[
          { question: 'What is CMPSBL?', answer: 'CMPSBL is composable cognitive infrastructure — a modular AI substrate where intelligence persists across sessions, adapts through governed evolution, and compounds over time.' },
          { question: 'How does persistent memory work?', answer: 'CMPSBL provides multi-tier persistent memory that gives AI agents permanent recall across sessions. Add it to any agent in under an hour with the free tier.' },
          { question: 'What are artifact packs?', answer: 'Artifact packs are bundles of capabilities you activate on demand. Each pack uses one slot. Your plan determines how many slots you have — not which packs you can access.' },
          { question: 'Is there a free tier?', answer: 'Yes. The Builder tier is completely free — 3 artifact slots, full runtime access, persistent memory, and governed orchestration. No credit card required.' },
          { question: 'What AI providers does CMPSBL support?', answer: 'CMPSBL routes across multiple providers including OpenAI, Anthropic, Google, and open-source models through the NEXUS router. Bring your own keys or use managed routing.' },
        ]}
      />

      <PublicNav />

      {/* Ambient animated mesh background — layered for depth */}
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
        {/* ═══ WHAT IT IS — 9 core systems ═══ */}
        <WhySubstrate />

        {/* ═══ MENTAL MODEL — How CMPSBL Works ═══ */}
        <HowCmpsblWorks />

        <SectionDivider />

        {/* ═══ HOW IT'S DIFFERENT — Dream · Remember · Adapt · Self-Improve ═══ */}
        <DifferentiationSection />

        <SectionDivider />

        {/* ═══ WHO IT'S FOR — Game Devs, Developers, Enterprise ═══ */}
        <BuiltForSection />

        <SectionDivider />

        {/* ═══ ACTIVATION MODEL — Packs & Slots ═══ */}
        <ArtifactPacksSection />

        <SectionDivider />

        {/* ═══ TECHNICAL CREDIBILITY — Governance & Observability ═══ */}
        <GovernanceSignal />

        {/* ═══ SOCIAL PROOF — Testimonials ═══ */}
        <SocialProof />

        <SectionDivider />

        {/* ═══ USE CASES — What you can build ═══ */}
        <UseCaseShowcase />

        <SectionDivider />

        {/* ═══ SELF-IMPROVEMENT — Evolution CTA ═══ */}
        <EvolutionCTA />

        {/* ═══ SEALED ENGINES — 20 Engines CTA ═══ */}
        <EnginesCTA />
      </Suspense>

      {/* ═══ FINAL CTA — Cinematic closing ═══ */}
      <section className="relative z-10 px-4 py-16 sm:py-32 overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute inset-0 pointer-events-none hidden sm:block">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/10 rounded-full blur-[200px]" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-5xl mx-auto relative"
        >
          <div className="relative rounded-2xl sm:rounded-[2rem] overflow-hidden shadow-2xl shadow-primary/15 group/cta">
            {/* Layered gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-violet-600" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/15 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent" />
            
            {/* Animated grid overlay */}
            <div 
              className="absolute inset-0 opacity-[0.07]"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), 
                  linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)
                `,
                backgroundSize: "50px 50px",
              }}
            />
            
            {/* Glow orbs */}
            <motion.div 
              className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-white/10 blur-[100px]"
              animate={{ scale: [1, 1.3, 1], opacity: [0.25, 0.5, 0.25] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div 
              className="absolute -bottom-24 -left-24 w-56 h-56 rounded-full bg-white/10 blur-[80px]"
              animate={{ scale: [1.3, 1, 1.3], opacity: [0.5, 0.2, 0.5] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            />
            
            {/* Flowing accent at top */}
            <div className="h-[2px] memory-stream-bar opacity-70" />

            <div className="relative p-7 sm:p-14 md:p-20 text-center">
              {/* Floating badge */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 border border-white/20 backdrop-blur-sm mb-8"
              >
                <Sparkles className="w-4 h-4 text-white" />
                <span className="text-sm font-semibold text-white/90">Signal → Silicon</span>
              </motion.div>
              
              <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-white mb-6 leading-[1.05] tracking-tight">
                Build on the{" "}
                <br className="hidden sm:block" />
                <span className="text-white/80 drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">Substrate</span>
              </h2>
              <p className="text-white/60 text-base sm:text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
                Persistent memory, governed evolution, and DREAM cycles — systems that adapt and improve themselves. Start free with 3 pipeline slots.
              </p>
              
              {/* Mini stats row */}
              <div className="flex flex-wrap justify-center gap-6 sm:gap-12 mb-10">
                 {[
                   { value: "38", label: "Substrate Nodes" },
                   { value: "24", label: "Pipeline Packs" },
                   { value: "20", label: "Sealed Engines" },
                   { value: "99.9%", label: "Uptime SLA" },
                ].map((stat) => (
                  <div key={stat.label} className="text-center group/cta-stat hover:scale-105 transition-transform duration-300">
                    <div className="text-2xl sm:text-3xl font-black text-white group-hover/cta-stat:drop-shadow-[0_0_12px_rgba(255,255,255,0.35)] transition-all duration-300">{stat.value}</div>
                    <div className="text-[10px] sm:text-xs font-semibold text-white/40 uppercase tracking-wider mt-0.5">{stat.label}</div>
                  </div>
                ))}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="relative px-10 h-14 sm:h-16 text-base sm:text-lg bg-white text-primary hover:bg-white/90 font-bold shadow-2xl shadow-black/25 hover:scale-[1.02] active:scale-[0.98] transition-all rounded-xl cta-ring">
                  <Link to="/auth">
                    <Sparkles className="w-5 h-5 mr-2" />
                    Start Building — Free
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="px-8 h-14 sm:h-16 text-base sm:text-lg border-white/25 text-white hover:bg-white/10 font-semibold backdrop-blur-sm rounded-xl">
                  <Link to="/upgrade">
                    <Terminal className="w-5 h-5 mr-2" />
                    View Plans
                  </Link>
                </Button>
              </div>
            </div>
            
            {/* Bottom accent */}
            <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          </div>
        </motion.div>
      </section>

      <Suspense fallback={<div className="min-h-[100px]" />}>
        <EnhancedFooter />
      </Suspense>
    </div>
  );
}
