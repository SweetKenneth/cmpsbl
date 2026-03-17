/**
 * Upgrade — Standalone upgrade/pricing page.
 * Now wraps the shared UpgradeContent component.
 */
import { SEO } from '@/components/SEO';
import { PublicNav } from '@/components/PublicNav';
import { EnhancedFooter } from '@/components/EnhancedFooter';
import { PageSEOBlock } from '@/components/seo/PageSEOBlock';
import { UpgradeContent } from '@/components/store/UpgradeContent';

export default function Upgrade() {
  return (
    <div className="min-h-screen bg-background relative">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-40 left-1/4 w-[500px] h-[500px] rounded-full animate-hero-orb-1" style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.04) 0%, transparent 60%)" }} />
        <div className="absolute bottom-40 right-1/4 w-[400px] h-[400px] rounded-full animate-hero-orb-3" style={{ background: "radial-gradient(circle, hsl(var(--neon-purple) / 0.03) 0%, transparent 60%)" }} />
      </div>
      <SEO
        title="Pricing — Free to Architect Plans | CMPSBL"
        description="CMPSBL plans: Builder (free, 3 slots), Studio ($29/mo, 6 slots), Creator ($49/mo, 9 slots), Architect ($79/mo, unlimited). Every tier gets full 40-node runtime. Scale vault and Memory Stream pulls."
      />
      <PublicNav />

      <main className="pt-28 pb-20">
        <UpgradeContent />
      </main>

      <PageSEOBlock path="/upgrade" title="Upgrade & Pricing" faq={[
        { question: "Is there a free tier for CMPSBL?", answer: "Yes. The Builder tier is completely free with 3 memory slots, full runtime access, and no credit card required. Upgrade anytime to unlock more slots and premium capabilities." },
        { question: "What plans does CMPSBL offer?", answer: "Four tiers: Builder (free, 3 slots), Studio ($29/mo, 6 slots), Creator ($79/mo, 9 slots), and Architect ($199/mo, 12 slots). Enterprise custom plans also available." },
      ]} />
      <EnhancedFooter />
    </div>
  );
}
