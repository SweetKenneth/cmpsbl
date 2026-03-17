/**
 * Packs — Standalone memory packs page.
 * Now wraps the shared PacksContent component.
 */
import { SEO } from '@/components/SEO';
import { PublicNav } from '@/components/PublicNav';
import { EnhancedFooter } from '@/components/EnhancedFooter';
import { RelatedCapabilities } from '@/components/RelatedCapabilities';
import { PageSEOBlock } from '@/components/seo/PageSEOBlock';
import { PacksContent } from '@/components/store/PacksContent';

export default function Packs() {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Memory Packs — Activate & Swap Capabilities | CMPSBL"
        description="24 Memory Packs across 6 strategic domains: memory, coordination, intelligence, resilience, sovereignty, and perception. Each pack = 1 slot. Activate, swap, and combine — start free with 3 slots."
        canonical="https://cmpsbl.com/packs"
        keywords={['Memory Packs', 'AI capability slots', 'CMPSBL packs', 'strategic domains', 'composable capabilities', 'slot activation']}
      />
      <PublicNav />

      <main className="pt-24 sm:pt-28 pb-20">
        <div className="max-w-6xl mx-auto">
          <PacksContent />
        </div>
      </main>

      <RelatedCapabilities />
      <PageSEOBlock path="/packs" title="Capability Packs" faq={[
        { question: "What are CMPSBL capability packs?", answer: "Capability packs are curated sets of engine capabilities across 6 strategic domains. Each pack uses exactly 1 memory slot. Choose packs that match your workload — swap anytime." },
        { question: "How many packs can I activate?", answer: "Your plan controls how many memory slots you have: Builder (3), Studio (6), Creator (9), Architect (12). Each active pack uses one slot." },
      ]} />
      <EnhancedFooter />
    </div>
  );
}
