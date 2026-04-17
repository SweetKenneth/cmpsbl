/**
 * Plans — Dedicated subscription plans page.
 * Wraps the shared UpgradeContent with full-page SEO, nav, and footer.
 */
import { SEO } from '@/components/SEO';
import { StructuredData } from '@/components/seo/StructuredData';
import { PublicNav } from '@/components/PublicNav';
import { EnhancedFooter } from '@/components/EnhancedFooter';
import { PageSEOBlock } from '@/components/seo/PageSEOBlock';
import { UpgradeContent } from '@/components/store/UpgradeContent';
import { PublicBreadcrumb } from '@/components/navigation/PublicBreadcrumb';
import { TrialBanner } from '@/components/adoption/TrialBanner';
import { CompoundingValueDashboard } from '@/components/adoption/CompoundingValueDashboard';
import { TierLayersOverview } from '@/components/plans/TierLayersOverview';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

export default function Plans() {
  return (
    <div className="min-h-screen bg-background relative">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 gradient-mesh opacity-60" />
        <div className="absolute top-40 left-1/4 w-[500px] h-[500px] rounded-full animate-hero-orb-1" style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.04) 0%, transparent 60%)" }} />
        <div className="absolute bottom-40 right-1/4 w-[400px] h-[400px] rounded-full animate-hero-orb-3" style={{ background: "radial-gradient(circle, hsl(var(--neon-purple) / 0.03) 0%, transparent 60%)" }} />
        <div className="absolute inset-0" style={{
          backgroundImage: "radial-gradient(circle, hsl(var(--primary) / 0.02) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }} />
      </div>

      <SEO
        title="Plans — Free to Enterprise | CMPSBL"
        description="Choose your substrates: Free (Prime), Studio ($29 — 3 verticals), Creator ($49 — 6 verticals), Architect ($79 — all + ULTIMATE), Enterprise ($999+ — white-label). Memory Stream, Ascension, and Crown Jewel npm free for all."
        canonical="https://cmpsbl.com/plans"
        image="https://cmpsbl.com/og/plans.jpg"
      />
      <StructuredData
        type="product"
        data={{
          name: "CMPSBL Subscription Plans",
          description: "Governed cognitive infrastructure plans from free Builder to Enterprise. Persistent memory, AI routing, security hardening, and autonomous evolution.",
          url: "https://cmpsbl.com/plans",
          price: "0",
          category: "Software",
        }}
      />
      <StructuredData
        type="breadcrumb"
        data={{ items: [
          { name: "Home", url: "https://cmpsbl.com" },
          { name: "Plans", url: "https://cmpsbl.com/plans" },
        ]}}
      />

      <PublicNav />

      <main className="pt-28 sm:pt-32 pb-20 relative z-10">
        <div className="container mx-auto px-4 mb-6">
          <PublicBreadcrumb />
          <TrialBanner />
        </div>

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="container mx-auto px-4 text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-4">
            <Zap className="w-3.5 h-3.5" />
            Substrate Access Plans
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mb-3">
            Start free.
            <br />
            <span className="bg-gradient-to-r from-[hsl(var(--neon-cyan))] to-[hsl(var(--neon-purple))] bg-clip-text text-transparent">
              Scale without limits.
            </span>
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto leading-relaxed font-medium">
            Every plan includes Memory Stream, Ascension scanning, and Crown Jewel npm access.
            Choose the substrate depth that matches your ambition.
          </p>
        </motion.div>

        <UpgradeContent />

        <TierLayersOverview />

        <div className="container mx-auto px-4 mt-12">
          <h2 className="text-lg font-bold text-foreground mb-4">Your Compounding Value</h2>
          <CompoundingValueDashboard />
        </div>
      </main>

      <PageSEOBlock path="/plans" title="Plans & Pricing" faq={[
        { question: "Is there a free tier for CMPSBL?", answer: "Yes. CMPSBL PRIME™ is free forever with Memory Stream, Ascension, Crown Jewel npm access, and software exports." },
        { question: "What plans does CMPSBL offer?", answer: "Free (Prime), Studio ($29 — 3 substrates), Creator ($49 — 6 substrates), Architect ($79 — all + ULTIMATE), and Enterprise ($999+ — white-label with custom branding)." },
        { question: "Can I upgrade later?", answer: "Yes. Start free and upgrade anytime. All paid plans include a 7-day free trial." },
        { question: "What is CMPSBL ULTIMATE™?", answer: "The universal substrate tier with all 143+ primitives across every industry vertical. Available on Architect ($79/mo) and Enterprise plans." },
        { question: "How many industry verticals are available?", answer: "12 active verticals: Cyber, Fintech, Robotics, Quantum, LLM, Agency, Media, Health, Legal, Gaming, Education — plus ULTIMATE which combines all primitives." },
        { question: "What is CMPSBL Mana?", answer: "Mana is the patented runtime loader that injects behavioral wrappers at export boundaries without source modification. Ascension scans export deployment-ready Mana configurations." },
      ]} />

      <EnhancedFooter />
    </div>
  );
}
