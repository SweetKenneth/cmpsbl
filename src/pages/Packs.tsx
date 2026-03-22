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
        description="24 capability packs across 6 categories: memory, coordination, intelligence, resilience, sovereignty, and perception. Each pack uses 1 slot. Activate, swap, and combine — start free with 3 slots."
        canonical="https://cmpsbl.com/packs"
        keywords={['capability packs', 'AI capability slots', 'CMPSBL packs', 'composable capabilities', 'slot activation']}
      />
      <PublicNav />

      <main className="pt-28 sm:pt-32 pb-20">
        <div className="max-w-6xl mx-auto">
          <PacksContent />
        </div>
      </main>

      <RelatedCapabilities />
      <PageSEOBlock path="/packs" title="Capability Packs" faq={[
        { question: "What are CMPSBL capability packs?", answer: "Capability packs are curated bundles of features across 6 categories. Each pack uses exactly 1 slot. Choose packs that match your needs — swap anytime." },
        { question: "How many packs can I activate?", answer: "Your plan determines your slot count: Builder (3 free), Studio (6), Creator (9), Architect (12). Each active pack uses one slot." },
      ]} />
      <EnhancedFooter />
    </div>
  );
}
