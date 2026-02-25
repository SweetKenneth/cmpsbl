/**
 * Explore — The CMPSBL Gateway
 * Premium homepage with cinematic flow and bold visual identity
 * When visitors arrive via promptfluid.com, renders PromptFluid business page instead.
 */

import { useRef } from "react";
import PromptFluidHome from "./PromptFluidHome";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowRight, 
  Terminal, 
  BookOpen,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import { cn } from "@/lib/utils";

// Components
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { HeroMetaSubstrate } from "@/components/hero/HeroMetaSubstrate";
import { WhySubstrate } from "@/components/home/WhySubstrate";
import { BuiltForSection } from "@/components/home/BuiltForSection";

import { CodeLabCTA } from "@/components/codelab/CodeLabCTA";
import { SynergyDepotCTA } from "@/components/explore/SynergyDepotCTA";
import { LnchblCTA } from "@/components/LnchblCTA";
import { LiveStatsBar } from "@/components/home/LiveStatsBar";
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
  const modulesCount = useMetric('modulesCount');
  const enginesCount = useMetric('enginesCount');
  const metaEnginesCount = useMetric('metaEnginesCount');
  const providersCount = useMetric('providersCount');
  const linesOfCodeDisplay = useMetric('linesOfCodeDisplay');

  // Show PromptFluid business page when entering through promptfluid.com
  const isPromptFluid = hostname === "promptfluid.com" || hostname === "www.promptfluid.com";
  if (isPromptFluid) {
    return <PromptFluidHome />;
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-background overflow-x-hidden overflow-y-visible">
      <SEO 
        title="Composable AI Infrastructure | CMPSBL"
        description="Governed cognitive infrastructure where intelligence persists, adapts, and compounds. Modular AI substrate for agentic systems that learn."
        canonical="https://cmpsbl.com"
        image="https://cmpsbl.com/og/home.jpg"
        keywords={['composable AI', 'cognitive infrastructure', 'AI substrate', 'agentic AI platform', 'governed AI', 'adaptive intelligence', 'AI agent memory', 'self-improving software']}
        faq={[
          { question: 'What is CMPSBL?', answer: 'CMPSBL is composable cognitive infrastructure — a modular AI substrate where intelligence persists across sessions, adapts through governed evolution, and compounds over time through autonomous learning cycles.' },
          { question: 'How does persistent memory work?', answer: 'CMPSBL provides multi-tier persistent memory (working, episodic, semantic) that gives AI agents permanent recall across sessions. Add it to any agent in under an hour with the free tier.' },
          { question: 'What makes CMPSBL different from LangChain or Mem0?', answer: 'CMPSBL is complete cognitive infrastructure — not a library or single feature. It combines persistent memory, autonomous dream-cycle learning, governed evolution, security mesh overlays, and multi-provider routing in one composable substrate.' },
          { question: 'Is there a free tier?', answer: 'Yes. CMPSBL offers a free tier with persistent memory, basic module access, and composable artifacts. Scale to Creator, Architect, or Enterprise tiers as your workloads grow.' },
          { question: 'What AI providers does CMPSBL support?', answer: 'CMPSBL routes across multiple providers including OpenAI, Anthropic, Google, and open-source models through the NEXUS module. Bring your own keys or use managed routing.' },
        ]}
      />

      <PublicNav />

      {/* Ambient animated mesh background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 gradient-mesh opacity-80" />
        <motion.div
          className="absolute top-0 left-0 w-[800px] h-[800px] rounded-full"
          style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.06) 0%, transparent 60%)" }}
          animate={{ x: [-100, 100, -100], y: [-50, 50, -50] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full"
          style={{ background: "radial-gradient(circle, hsl(var(--neon-purple) / 0.05) 0%, transparent 60%)" }}
          animate={{ x: [100, -100, 100], y: [50, -50, 50] }}
          transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Hero Section */}
      <HeroMetaSubstrate />

      {/* Live System Metrics Bar */}
      <LiveStatsBar />

      {/* Composable Cognitives CTA */}
      <section className="relative z-10 py-12 sm:py-20 px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <div className="relative overflow-hidden rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-500/[0.04] via-card/50 to-orange-500/[0.04] backdrop-blur-sm">
            {/* Accent bar */}
            <div className="h-1 w-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500" />
            
            {/* Glow */}
            <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-amber-500/10 blur-[80px] pointer-events-none" />
            
            <div className="relative p-6 sm:p-10 md:p-12 text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/25 mb-6"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-xs font-bold tracking-wide text-amber-500 uppercase">Composable Cognitives</span>
              </motion.div>
              
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black mb-4 tracking-tight">
                Own Superpowered{" "}
                <span 
                  style={{
                    background: "linear-gradient(135deg, hsl(var(--neon-amber, 45 93% 58%)), hsl(var(--primary)))",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  AI Agents
                </span>
              </h2>
              <p className="text-muted-foreground text-base sm:text-lg mb-8 max-w-xl mx-auto leading-relaxed">
                Download once. Run anywhere. No subscriptions, no vendor lock-in — 
                just superpowered cognitive agents you own forever.
              </p>
              <Button asChild size="lg" className="px-8 h-13 text-base font-bold gap-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 hover:scale-[1.02] transition-all border-0">
                <Link to="/composable-cognitives">
                  <Sparkles className="w-5 h-5" />
                  Shop Cognitives
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* LNCHBL Free Download CTA */}
      <LnchblCTA />

      {/* Built For Section - Who is this for */}
      <BuiltForSection />

      <SectionDivider />

      {/* Why Substrate — 10-Entity + 5-Mesh Differentiators */}
      <WhySubstrate />

      <SectionDivider />

      {/* Synergy Pipelines & Capabilities Depot */}
      <SynergyDepotCTA />

      <SectionDivider />

      {/* CodeLab CTA */}
      <CodeLabCTA />

      {/* Final CTA — Cinematic closing */}
      <section className="relative z-10 px-4 py-14 sm:py-32">
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
              
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white mb-5 leading-[1.1] tracking-tight">
                Your AI Finally{" "}
                <br className="hidden sm:block" />
                <span className="bg-gradient-to-r from-white via-white/90 to-cyan-200 bg-clip-text text-transparent">Remembers</span>
              </h2>
              <p className="text-white/70 text-base sm:text-lg md:text-xl max-w-2xl mx-auto mb-6 leading-relaxed">
                Persistent memory, self-evolving architecture, and a {providersCount}-provider AI fallback chain —
                running on {linesOfCodeDisplay} lines of production code. Start free today.
              </p>
              
              {/* Mini stats row */}
              <div className="flex flex-wrap justify-center gap-6 sm:gap-10 mb-10">
                {[
                  { value: String(modulesCount), label: "Entities" },
                  { value: String(enginesCount + metaEnginesCount), label: "Engines" },
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
                  <Link to="/start-here">
                    <Sparkles className="w-5 h-5 mr-2" />
                    Start Here
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="px-8 h-14 text-base border-white/30 text-white hover:bg-white/10 font-semibold backdrop-blur-sm">
                  <Link to="/composable-cognitives">
                    <Terminal className="w-5 h-5 mr-2" />
                    Browse Cognitives
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
