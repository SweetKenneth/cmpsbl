/**
 * FactoryHome — Software Refurbishment Center landing page
 * Hero → Live Stats → Pillars → Journey → Catalog → Open Archive → Guarantee
 */

import { lazy, Suspense } from "react";
import { SEO } from "@/components/SEO";
import { PublicNav } from "@/components/PublicNav";
import { SubstrateTiers } from "@/components/home/SubstrateTiers";
import { CmpsblWelcome } from "@/components/onboarding/CmpsblWelcome";
import { HeroMetaSubstrate } from "@/components/hero/HeroMetaSubstrate";
import { LiveStatsBar } from "@/components/home/LiveStatsBar";
import { DiagnosticExample } from "@/components/home/DiagnosticExample";
import { CustomerJourney } from "@/components/home/CustomerJourney";
import { FactoryPillars } from "@/components/home/FactoryPillars";
import { ShowroomPreview } from "@/components/home/ShowroomPreview";
import { FactoryGuarantee } from "@/components/home/FactoryGuarantee";
import { JunkyardBanner } from "@/components/factory/JunkyardBanner";
import { LabAmbient, ScanLine, Crosshair, MeasureMarkers, StatusIndicator } from "@/components/decorative/LabDecorations";

const EnhancedFooter = lazy(() => import("@/components/EnhancedFooter").then(m => ({ default: m.EnhancedFooter })));

function SectionDivider() {
  return (
    <div className="relative py-10 sm:py-14 lab-section-glow">
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

      {/* Lab-grade ambient background */}
      <LabAmbient />

      {/* Technical measure markers — desktop only */}
      <MeasureMarkers />

      {/* Decorative crosshairs */}
      <Crosshair className="top-[30%] left-[5%] hidden lg:block" size={100} color="--neon-cyan" />
      <Crosshair className="top-[60%] right-[8%] hidden lg:block" size={70} color="--neon-purple" />

      {/* ═══ HERO ═══ */}
      <HeroMetaSubstrate />

      {/* ═══ LIVE CENTER STATUS ═══ */}
      <LiveStatsBar />

      {/* ═══ EXAMPLE OUTPUT + BEFORE/AFTER ═══ */}
      <DiagnosticExample />

      {/* ═══ PIPELINE ═══ */}
      <CustomerJourney />

      <SectionDivider />

      {/* ═══ THREE PILLARS (Specialists — after value is clear) ═══ */}
      <FactoryPillars />

      <SectionDivider />

      {/* ═══ CATALOG PREVIEW ═══ */}
      <ShowroomPreview />

      <SectionDivider />

      {/* ═══ OPEN ARCHIVE ═══ */}
      <JunkyardBanner />

      <SectionDivider />

      {/* ═══ SUBSTRATE ACCESS TIERS ═══ */}
      <SubstrateTiers />

      <SectionDivider />

      {/* ═══ THE GUARANTEE ═══ */}
      <FactoryGuarantee />

      <Suspense fallback={<div className="min-h-[100px]" />}>
        <EnhancedFooter />
      </Suspense>
    </div>
  );
}
