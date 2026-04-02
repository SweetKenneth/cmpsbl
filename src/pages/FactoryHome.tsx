/**
 * FactoryHome — Software Refurbishment Center landing page
 * Hero → Live Stats → Pillars → Journey → Catalog → Open Archive → Guarantee
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

const EnhancedFooter = lazy(() => import("@/components/EnhancedFooter").then(m => ({ default: m.EnhancedFooter })));

function SectionDivider() {
  return (
    <div className="relative py-10 sm:py-14">
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
        title="CMPSBL® — Software Refurbishment Center"
        description="Memory Stream discovers. Ascension refurbishes. 40 Primitives power everything. No AI tricks. No lock-in. Just certified builds."
        canonical="https://cmpsbl.com"
        image="https://cmpsbl.com/og/home-v2.jpg"
        keywords={['cognitive infrastructure', 'code refurbishment', 'software discovery', 'CJPI', 'Memory Stream', 'Ascension', 'software refurbishment center']}
        faq={[
          { question: 'What is CMPSBL?', answer: 'CMPSBL is a software refurbishment center — it discovers capabilities in code, refurbishes and hardens them, and sends them back production-ready. No AI inside the output.' },
          { question: 'What is Memory Stream?', answer: 'Memory Stream is the autonomous discovery engine that runs 8-hour cycles finding capabilities nobody asked it to find. Every discovery is scored, priced, and placed in the Catalog.' },
          { question: 'What is Ascension?', answer: 'Ascension is the refurbishment lab. Submit your code, we scan it for vulnerabilities and capabilities, refurbish it with up to 20 primitives, and send it back. 3-day evaluation period included.' },
          { question: 'How does pricing work?', answer: 'Catalog discoveries are priced by CJPI score: $1-$2 per point depending on tier, with perfect 100s priced at $1,952 (the year of the first compiler). Once purchased, a discovery is permanently retired.' },
          { question: 'Is there a free tier?', answer: 'Yes. Builder tier is free — browse the Catalog, access the Open Archive for Raw-tier discoveries, and view diagnostics.' },
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

      {/* ═══ HERO ═══ */}
      <HeroMetaSubstrate />

      {/* ═══ LIVE CENTER STATUS ═══ */}
      <LiveStatsBar />

      {/* ═══ THREE PILLARS ═══ */}
      <FactoryPillars />

      <SectionDivider />

      {/* ═══ CUSTOMER JOURNEY ═══ */}
      <CustomerJourney />

      <SectionDivider />

      {/* ═══ CATALOG PREVIEW ═══ */}
      <ShowroomPreview />

      <SectionDivider />

      {/* ═══ OPEN ARCHIVE ═══ */}
      <JunkyardBanner />

      <SectionDivider />

      {/* ═══ THE GUARANTEE ═══ */}
      <FactoryGuarantee />

      <Suspense fallback={<div className="min-h-[100px]" />}>
        <EnhancedFooter />
      </Suspense>
    </div>
  );
}
