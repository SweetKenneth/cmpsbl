/**
 * Explore — The CMPSBL Gateway
 * Premium homepage with cinematic flow and bold visual identity
 */

import { useRef } from "react";
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
import { TechShowcase } from "@/components/home/TechShowcase";
import { CodeLabCTA } from "@/components/codelab/CodeLabCTA";
import { SynergyDepotCTA } from "@/components/explore/SynergyDepotCTA";
import { LnchblCTA } from "@/components/LnchblCTA";

// Section divider with animated gradient
function SectionDivider() {
  return (
    <div className="relative py-10 sm:py-14">
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

  return (
    <div ref={containerRef} className="min-h-screen bg-background overflow-x-hidden overflow-y-visible">
      <SEO 
        title="CMPSBL® Substrate OS v8.0.0 — 14-Module Cognitive Infrastructure"
        description="The cognitive infrastructure standard: 14 modules, 5 layers, 147 synergy pipelines, 269 capabilities, 310+ terminal commands. Free exploration tier with premium Engine subscriptions."
        canonical="https://cmpsbl.com"
        keywords={['CMPSBL', 'Substrate OS', 'v8.0.0', 'SYNERGY+', '14-module architecture', 'cognitive OS', 'AI governance', 'persistent memory', 'dream cycles', 'synergy pipelines', 'engine marketplace']}
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

      {/* LNCHBL Free Download CTA */}
      <LnchblCTA />

      {/* Built For Section - Who is this for */}
      <BuiltForSection />

      <SectionDivider />

      {/* Why Substrate - 14 Module Differentiators */}
      <WhySubstrate />

      <SectionDivider />

      {/* Tech Showcase - Interactive SDK Code Examples */}
      <TechShowcase />

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
                Build AI That Remembers,{" "}
                <br className="hidden sm:block" />
                Dreams, and Evolves
              </h2>
              <p className="text-white/70 text-base sm:text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
                Start with production-ready templates, explore the SDK in CodeLab, 
                or dive into the documentation. Your cognitive infrastructure journey starts here.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="px-8 h-14 text-base bg-white text-primary hover:bg-white/90 font-bold shadow-2xl shadow-black/20 hover:scale-[1.02] transition-all">
                  <Link to="/codelab">
                    <Terminal className="w-5 h-5 mr-2" />
                    Start in CodeLab
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="px-8 h-14 text-base border-white/30 text-white hover:bg-white/10 font-semibold backdrop-blur-sm">
                  <Link to="/documentation">
                    <BookOpen className="w-5 h-5 mr-2" />
                    Read Docs
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
