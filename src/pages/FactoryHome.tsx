/**
 * FactoryHome — Classic Car Factory landing page
 * Hero → Pillars → Journey → Showroom → Guarantee
 * 
 * NOTE: Keeps the existing HeroMetaSubstrate hero (brand recognition).
 * Factory narrative sections are layered below.
 */

import { lazy, Suspense } from "react";
import { SEO } from "@/components/SEO";
import { PublicNav } from "@/components/PublicNav";
import { CmpsblWelcome } from "@/components/onboarding/CmpsblWelcome";
import { HeroMetaSubstrate } from "@/components/hero/HeroMetaSubstrate";
import { LiveStatsBar } from "@/components/home/LiveStatsBar";
import { FactoryPillars } from "@/components/home/FactoryPillars";
import { CustomerJourney } from "@/components/home/CustomerJourney";
import { ShowroomPreview } from "@/components/home/ShowroomPreview";
import { FactoryGuarantee } from "@/components/home/FactoryGuarantee";
import { JunkyardBanner } from "@/components/factory/JunkyardBanner";
import { DecodeFactoryVoice } from "@/components/factory/DecodeFactoryVoice";

const EnhancedFooter = lazy(() => import("@/components/EnhancedFooter").then(m => ({ default: m.EnhancedFooter })));

function SectionDivider() {
  return (
    <div className="relative py-12 sm:py-16">
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
  return (
    <div className="min-h-screen bg-background overflow-x-hidden overflow-y-visible">
      <SEO
        title="CMPSBL® — Where Machines Learn How to Improve"
        description="Classic car factory for software. Memory Stream discovers. Ascension restores. 40 Primitives power everything. No AI tricks. No lock-in. Just classics."
        canonical="https://cmpsbl.com"
        image="https://cmpsbl.com/og/home-v2.jpg"
        keywords={['cognitive infrastructure', 'code restoration', 'software discovery', 'CJPI', 'Memory Stream', 'Ascension', 'AI governance', 'composable AI']}
        faq={[
          { question: 'What is CMPSBL?', answer: 'CMPSBL is a classic car factory for software — it discovers capabilities in code, restores and hardens them, and sends them back production-ready. No AI inside the output.' },
          { question: 'What is Memory Stream?', answer: 'Memory Stream is the autonomous discovery engine that runs 8-hour cycles finding capabilities nobody asked it to find. Every discovery is scored, priced, and placed in the Showroom.' },
          { question: 'What is Ascension?', answer: 'Ascension is the restoration shop. Bring us your code, we scan it for vulnerabilities and capabilities, restore it with up to 20 primitives, and send it back. Three-day test drive included.' },
          { question: 'How does pricing work?', answer: 'Showroom discoveries are priced by CJPI score: $1-$2 per point depending on tier, with perfect 100s priced at $1,952 (the year of the first compiler). Once purchased, a discovery is permanently retired.' },
          { question: 'Is there a free tier?', answer: 'Yes. Builder tier is free — browse the Showroom, access the Junkyard for Raw-tier discoveries, and view diagnostics.' },
        ]}
      />

      <PublicNav />
      <CmpsblWelcome />

      {/* Ambient mesh background */}
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
      </div>

      {/* ═══ HERO — preserved for brand recognition ═══ */}
      <HeroMetaSubstrate />

      {/* ═══ LIVE METRICS ═══ */}
      <LiveStatsBar />

      {/* ═══ THREE PILLARS ═══ */}
      <FactoryPillars />

      <SectionDivider />

      {/* ═══ CUSTOMER JOURNEY ═══ */}
      <CustomerJourney />

      <SectionDivider />

      {/* ═══ SHOWROOM PREVIEW ═══ */}
      <ShowroomPreview />

      <SectionDivider />

      {/* ═══ JUNKYARD — free Raw-tier discoveries ═══ */}
      <JunkyardBanner />

      <SectionDivider />

      {/* ═══ DECODE VOICE — discovery commentator preview ═══ */}
      <section className="relative z-10 px-3 sm:px-6 py-8 sm:py-12">
        <div className="max-w-3xl mx-auto">
          <DecodeFactoryVoice role="commentator" />
        </div>
      </section>

      <SectionDivider />

      {/* ═══ THE GUARANTEE — replaces old generic CTA ═══ */}
      <FactoryGuarantee />

      <Suspense fallback={<div className="min-h-[100px]" />}>
        <EnhancedFooter />
      </Suspense>
    </div>
  );
}
