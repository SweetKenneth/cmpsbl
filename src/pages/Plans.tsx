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
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-40 left-1/4 w-[500px] h-[500px] rounded-full animate-hero-orb-1" style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.04) 0%, transparent 60%)" }} />
        <div className="absolute bottom-40 right-1/4 w-[400px] h-[400px] rounded-full animate-hero-orb-3" style={{ background: "radial-gradient(circle, hsl(var(--neon-purple) / 0.03) 0%, transparent 60%)" }} />
      </div>

      <SEO
        title="Plans — Builder to Architect | CMPSBL"
        description="Four tiers of cognitive infrastructure: Builder (free, 3 slots), Studio ($29/mo), Creator ($49/mo), Architect ($79/mo). Full runtime on every plan. Scale slots, memory, exports, and routing as you grow."
        canonical="https://cmpsbl.com/plans"
        image="/og/plans.jpg"
      />

      <PublicNav />

      <main className="pt-28 sm:pt-32 pb-20 relative z-10">
        <div className="container mx-auto px-4 mb-6">
          <PublicBreadcrumb />
        </div>
        <UpgradeContent />
      </main>

      <PageSEOBlock path="/plans" title="Plans & Pricing" faq={[
        { question: "Is there a free tier for CMPSBL?", answer: "Yes. Builder tier is free with 3 capability slots, full runtime access, and no credit card required." },
        { question: "What plans does CMPSBL offer?", answer: "Four tiers: Builder (free), Studio ($29/mo), Creator ($49/mo), and Architect ($79/mo). Annual billing saves 20%." },
        { question: "Can I upgrade later?", answer: "Yes. Start on Builder and upgrade anytime. All paid plans include a 7-day free trial." },
        { question: "What does each tier include?", answer: "Every tier includes full runtime access, Memory Stream pulls, vault storage, and Member Hub. Higher tiers add more slots, exports, custom memory, and priority routing." },
      ]} />

      <EnhancedFooter />
    </div>
  );
}
