/**
 * Explore — The CMPSBL Gateway
 * Comprehensive showcase of cognitive infrastructure capabilities
 * Polished for maximum conversion across gaming, dev, and enterprise audiences
 */

import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowRight, 
  Terminal, 
  BookOpen,
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

// Animated gradient orb
function GradientOrb({ className, delay = 0 }: { className?: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.5, delay, ease: "easeOut" }}
      className={cn(
        "absolute rounded-full blur-[100px] pointer-events-none",
        className
      )}
    />
  );
}

// Section divider
function SectionDivider() {
  return (
    <div className="relative py-12 sm:py-16">
      <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
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

      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <GradientOrb className="w-[600px] h-[600px] -top-48 -left-48 bg-primary/10" delay={0} />
        <GradientOrb className="w-[500px] h-[500px] top-1/4 -right-48 bg-primary/8" delay={0.2} />
        <GradientOrb className="w-[400px] h-[400px] bottom-0 left-1/4 bg-primary/6" delay={0.4} />
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

      {/* Final CTA */}
      <section className="relative z-10 px-4 py-16 sm:py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <div className="relative p-8 sm:p-12 md:p-16 rounded-3xl overflow-hidden text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/80 to-primary/60" />
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
            
            <div className="relative">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary-foreground mb-3 sm:mb-4">
                Build AI That Remembers, Dreams, and Evolves
              </h2>
              <p className="text-primary-foreground/80 text-sm sm:text-base md:text-lg max-w-xl mx-auto mb-6 sm:mb-8">
                Start with production-ready templates, dive into comprehensive documentation, 
                or see the substrate orchestrating autonomous workflows in real-time.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <Button asChild size="lg" className="px-6 sm:px-8 bg-background text-foreground hover:bg-background/90 font-semibold">
                  <Link to="/codelab">
                    <Terminal className="w-4 h-4 mr-2" />
                    Start in CodeLab
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="px-6 sm:px-8 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                  <Link to="/documentation">
                    <BookOpen className="w-4 h-4 mr-2" />
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
