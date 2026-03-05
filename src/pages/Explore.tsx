/**
 * Explore — The CMPSBL Gateway
 * Narrative flow: Hero → Stats → What It Is → How It's Different → Who It's For →
 * Activation Model → Governance → Social Proof → Evolution → Engines → Final CTA
 */

import { useRef, lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
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
const DifferentiationSection = lazy(() => import("@/components/home/DifferentiationSection").then(m => ({ default: m.DifferentiationSection })));
const BuiltForSection = lazy(() => import("@/components/home/BuiltForSection").then(m => ({ default: m.BuiltForSection })));
const ArtifactPacksSection = lazy(() => import("@/components/home/ArtifactPacksSection").then(m => ({ default: m.ArtifactPacksSection })));
const GovernanceSignal = lazy(() => import("@/components/home/GovernanceSignal").then(m => ({ default: m.GovernanceSignal })));
const SocialProof = lazy(() => import("@/components/home/SocialProof").then(m => ({ default: m.SocialProof })));
const EvolutionCTA = lazy(() => import("@/components/home/EvolutionCTA").then(m => ({ default: m.EvolutionCTA })));
const EnginesCTA = lazy(() => import("@/components/home/EnginesCTA").then(m => ({ default: m.EnginesCTA })));

// Section divider with animated gradient and memory-stream accent
function SectionDivider() {
  return (
    <div className="relative py-10 sm:py-14">
      {/* Outer fade line */}
      <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-border/30 to-transparent" />
      {/* Colored memory-stream accent */}
      <div className="absolute left-[15%] right-[15%] top-1/2 h-px">
        <div className="h-full memory-stream-bar opacity-15" />
      </div>
      {/* Center diamond with glow */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <motion.div 
          className="w-2 h-2 bg-primary/40 rotate-45"
          animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="absolute inset-0 w-2 h-2 bg-primary/20 rotate-45 blur-sm" />
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

        {/* ═══ SELF-IMPROVEMENT — Evolution CTA ═══ */}
        <EvolutionCTA />

        {/* ═══ SEALED ENGINES — 20 Engines CTA ═══ */}
        <EnginesCTA />
      </Suspense>

      {/* ═══ FINAL CTA — Cinematic closing ═══ */}
      <section className="relative z-10 px-4 py-14 sm:py-32">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-5xl mx-auto"
        >
          <div className="relative rounded-2xl sm:rounded-[2rem] overflow-hidden shadow-2xl shadow-primary/10 group/cta">
            {/* Deep gradient background with richer depth */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-violet-600" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
            
            {/* Animated grid overlay */}
            <div 
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), 
                  linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)
                `,
                backgroundSize: "60px 60px",
              }}
            />
            
            {/* Glow orbs */}
            <motion.div 
              className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/10 blur-[80px]"
              animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div 
              className="absolute -bottom-20 -left-20 w-48 h-48 rounded-full bg-white/10 blur-[60px]"
              animate={{ scale: [1.3, 1, 1.3], opacity: [0.6, 0.3, 0.6] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            />
            
            {/* Flowing accent at top */}
            <div className="h-[2px] memory-stream-bar opacity-60" />

            <div className="relative p-6 sm:p-14 md:p-20 text-center">
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
              
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 leading-[1.08] tracking-tight">
                Build on the{" "}
                <br className="hidden sm:block" />
                <span className="text-white/85 drop-shadow-lg">Substrate</span>
              </h2>
              <p className="text-white/70 text-base sm:text-lg md:text-xl max-w-2xl mx-auto mb-6 leading-relaxed">
                The substrate and Memory Stream working together — systems that DREAM, ADAPT, and EVOLVE,
                governed by policy, powered by persistent memory. Start free with 3 pipeline slots.
              </p>
              
              {/* Mini stats row */}
              <div className="flex flex-wrap justify-center gap-6 sm:gap-10 mb-10">
                 {[
                   { value: "1,143+", label: "Crystallized" },
                   { value: "24", label: "Pipeline Packs" },
                   { value: "68+", label: "Quality Floor" },
                   { value: "99.9%", label: "Uptime SLA" },
                ].map((stat) => (
                  <div key={stat.label} className="text-center group/cta-stat hover:scale-105 transition-transform duration-300">
                    <div className="text-2xl sm:text-3xl font-black text-white group-hover/cta-stat:drop-shadow-[0_0_8px_rgba(255,255,255,0.3)] transition-all duration-300">{stat.value}</div>
                    <div className="text-[10px] sm:text-xs font-semibold text-white/50 uppercase tracking-wider">{stat.label}</div>
                  </div>
                ))}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="px-8 h-14 text-base bg-white text-primary hover:bg-white/90 font-bold shadow-2xl shadow-black/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                  <Link to="/start-here">
                    <Sparkles className="w-5 h-5 mr-2" />
                    Start Building
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="px-8 h-14 text-base border-white/30 text-white hover:bg-white/10 font-semibold backdrop-blur-sm">
                  <Link to="/upgrade">
                    <Terminal className="w-5 h-5 mr-2" />
                    View Plans
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      <Suspense fallback={<div className="min-h-[100px]" />}>
        <EnhancedFooter />
      </Suspense>
    </div>
  );
}
