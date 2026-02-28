/**
 * Explore — The CMPSBL Gateway
 * v12 homepage: Artifact pack focus, differentiation clarity, hero preserved
 */

import { useRef } from "react";
import PromptFluidHome from "./PromptFluidHome";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowRight, 
  Terminal, 
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";

// Components
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { HeroMetaSubstrate } from "@/components/hero/HeroMetaSubstrate";
import { LiveStatsBar } from "@/components/home/LiveStatsBar";
import { DifferentiationSection } from "@/components/home/DifferentiationSection";
import { ArtifactPacksSection } from "@/components/home/ArtifactPacksSection";
import { AgentsSection } from "@/components/home/AgentsSection";
import { GovernanceSignal } from "@/components/home/GovernanceSignal";
import { BuiltForSection } from "@/components/home/BuiltForSection";
import { useMetric } from "@/stores/publicMetricsStore";

// Section divider with animated gradient
function SectionDivider() {
  return (
    <div className="relative py-6 sm:py-14">
      <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      <motion.div 
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary/40"
        animate={{ scale: [1, 1.5, 1], opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

export default function Explore() {
  const containerRef = useRef<HTMLDivElement>(null);
  const hostname = window.location.hostname;
  const providersCount = useMetric('providersCount');
  const linesOfCodeDisplay = useMetric('linesOfCodeDisplay');

  // Show PromptFluid business page when entering through promptfluid.com
  const isPromptFluid = hostname === "promptfluid.com" || hostname === "www.promptfluid.com";
  if (isPromptFluid) {
    return <PromptFluidHome />;
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-background overflow-x-hidden overflow-y-visible relative">
      <SEO 
        title="Composable AI Infrastructure | CMPSBL"
        description="Governed cognitive infrastructure where intelligence persists, adapts, and compounds. Free to start with 3 artifact slots. Modular AI substrate for agentic systems that learn."
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

      {/* Hero Section — H1 rotation and diagram UNTOUCHED */}
      <HeroMetaSubstrate />

      {/* Live System Metrics Bar */}
      <LiveStatsBar />

      {/* Choose Your Path — First section after Hero */}
      <BuiltForSection />

      <SectionDivider />

      {/* Differentiation: Dream · Remember · Adapt · Self-Improve */}
      <DifferentiationSection />

      <SectionDivider />

      {/* Artifact Packs — How the activation model works */}
      <ArtifactPacksSection />

      <SectionDivider />

      {/* Agents — Practical entry points */}
      <AgentsSection />

      <SectionDivider />

      {/* Governance Signal — Technical credibility */}
      <GovernanceSignal />

      {/* Final CTA — Cinematic closing */}
      <section className="relative px-4 py-14 sm:py-32">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-5xl mx-auto"
        >
          <div className="relative rounded-2xl sm:rounded-[2rem] overflow-hidden">
            {/* Deep gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-violet-600" />
            
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
                <span className="text-sm font-semibold text-white/90">The Future is Cognitive</span>
              </motion.div>
              
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-foreground mb-5 leading-[1.1] tracking-tight">
                Build What{" "}
                <br className="hidden sm:block" />
                <span className="bg-gradient-to-r from-foreground via-foreground/90 to-primary bg-clip-text text-transparent">Compounds</span>
              </h2>
              <p className="text-foreground/70 text-base sm:text-lg md:text-xl max-w-2xl mx-auto mb-6 leading-relaxed">
                Persistent memory, governed orchestration, and 24 artifact packs —
                running on {linesOfCodeDisplay} lines of production code. Start free today.
              </p>
              
              {/* Mini stats row */}
              <div className="flex flex-wrap justify-center gap-6 sm:gap-10 mb-10">
                {[
                   { value: "9", label: "Modules" },
                   { value: "24", label: "Artifact Packs" },
                   { value: String(providersCount), label: "AI Providers" },
                   { value: "99.9%", label: "Uptime" },
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <div className="text-2xl sm:text-3xl font-black text-white">{stat.value}</div>
                    <div className="text-[10px] sm:text-xs font-semibold text-white/50 uppercase tracking-wider">{stat.label}</div>
                  </div>
                ))}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="px-8 h-14 text-base bg-white text-primary hover:bg-white/90 font-bold shadow-2xl shadow-black/20 hover:scale-[1.02] transition-all">
                  <Link to="/auth">
                    <Sparkles className="w-5 h-5 mr-2" />
                    Start Free — 3 Artifact Slots
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="px-8 h-14 text-base border-white/30 text-white hover:bg-white/10 font-semibold backdrop-blur-sm">
                  <Link to="/packs">
                    <Terminal className="w-5 h-5 mr-2" />
                    Explore Packs
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      <EnhancedFooter />
    </div>
  );
}
