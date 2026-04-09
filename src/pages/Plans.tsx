/**
 * Plans — Dedicated subscription plans page.
 * Wraps the shared UpgradeContent with full-page SEO, nav, and footer.
 * Linked from account popover and main nav.
 */
import { SEO } from '@/components/SEO';
import { PublicNav } from '@/components/PublicNav';
import { EnhancedFooter } from '@/components/EnhancedFooter';
import { PageSEOBlock } from '@/components/seo/PageSEOBlock';
import { UpgradeContent } from '@/components/store/UpgradeContent';
import { PublicBreadcrumb } from '@/components/navigation/PublicBreadcrumb';

export default function Plans() {
  return (
    <div className="min-h-screen bg-background relative">
      {/* Lab ambient glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 gradient-mesh opacity-60" />
        <div className="absolute top-40 left-1/4 w-[500px] h-[500px] rounded-full animate-hero-orb-1" style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.04) 0%, transparent 60%)" }} />
        <div className="absolute bottom-40 right-1/4 w-[400px] h-[400px] rounded-full animate-hero-orb-3" style={{ background: "radial-gradient(circle, hsl(var(--neon-purple) / 0.03) 0%, transparent 60%)" }} />
        {/* Scan line */}
        <div className="absolute inset-x-0 top-0 h-full overflow-hidden">
          <div className="absolute inset-x-0 h-px lab-scan-line" style={{ animationDuration: "10s" }} />
        </div>
        {/* Dot grid texture */}
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

      <PublicNav />

      <main className="pt-28 sm:pt-32 pb-20 relative z-10">
        <div className="container mx-auto px-4 mb-6">
          <PublicBreadcrumb />
        </div>
        <UpgradeContent />
      </main>

      <PageSEOBlock path="/plans" title="Plans & Pricing" faq={[
        { question: "Is there a free tier for CMPSBL?", answer: "Yes. CMPSBL PRIME™ is free forever with Memory Stream, Ascension, Crown Jewel npm access, and software exports." },
        { question: "What plans does CMPSBL offer?", answer: "Free (Prime), Studio ($29 — 3 substrates), Creator ($49 — 6 substrates), Architect ($79 — all + ULTIMATE), and Enterprise ($999+ — white-label with custom branding)." },
        { question: "Can I upgrade later?", answer: "Yes. Start free and upgrade anytime. All paid plans include a 7-day free trial." },
        { question: "What is CMPSBL ULTIMATE™?", answer: "The universal substrate tier with all 143+ primitives across every industry vertical. Available on Architect ($79/mo) and Enterprise plans." },
      ]} />

      <EnhancedFooter />
    </div>
  );
}
