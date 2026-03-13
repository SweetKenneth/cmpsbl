/**
 * Packs — Manage capability pack activations
 * Horizontal scroll rows grouped by strategic domain.
 * Click any pack card for full details modal.
 */
import { useState, useMemo } from 'react';
import { SEO } from '@/components/SEO';
import { PublicNav } from '@/components/PublicNav';
import { EnhancedFooter } from '@/components/EnhancedFooter';
import { useEngineSubscription } from '@/hooks/useEngineSubscription';
import { useArtifactSlots } from '@/hooks/useArtifactSlots';
import { SlotCapacityIndicator } from '@/components/slots/SlotCapacityIndicator';
import { SlotPressureModal } from '@/components/slots/SlotPressureModal';
import { PackDomainRow } from '@/components/slots/PackDomainRow';
import { PackDetailModal } from '@/components/slots/PackDetailModal';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Package, Search } from 'lucide-react';
import { ARTIFACT_PACKS, STRATEGIC_DOMAINS, type ProductTier, type ArtifactPack } from '@/lib/quarry/types';
import { motion } from 'framer-motion';

export default function Packs() {
  const { tier: currentTier } = useEngineSubscription();
  const [search, setSearch] = useState('');
  const [pressureModal, setPressureModal] = useState<{ open: boolean; packName?: string }>({ open: false });
  const [detailPack, setDetailPack] = useState<ArtifactPack | null>(null);

  const currentProductTier: ProductTier =
    currentTier === 'enterprise' ? 'architect' :
    ['architect', 'pro', 'creator', 'builder'].includes(currentTier) ? 'operator' :
    'builder';

  const slotState = useArtifactSlots(currentTier);

  // Build domain rows with optional search filtering
  const domainRows = useMemo(() => {
    const q = search.trim().toLowerCase();

    return STRATEGIC_DOMAINS.map(domain => {
      let packs = ARTIFACT_PACKS.filter(p => domain.packIds.includes(p.id));

      if (q) {
        packs = packs.filter(p =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
        );
      }

      return { domain, packs };
    }).filter(row => row.packs.length > 0);
  }, [search]);

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Memory Packs — 24 AI Capability Modules | CMPSBL"
        description="Activate 24 Memory Packs across 6 strategic domains. Each pack unlocks specific capabilities using exactly 1 slot — persistent memory, defense, routing, and more. Start free with 3 slots."
        canonical="https://cmpsbl.com/packs"
        keywords={['capability packs', 'AI capabilities', 'CMPSBL packs', 'composable AI systems', 'persistent memory pack', 'AI routing', 'defense pack']}
      />
      <PublicNav />

      <main className="pt-24 sm:pt-28 pb-20">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8 sm:mb-10 px-4 space-y-3"
          >
            <Badge variant="outline" className="px-3 py-1 text-xs border-primary/30">
              <Package className="w-3 h-3 mr-1.5 inline" />
              Pack Management
            </Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight">Memory Packs</h1>
            <p className="text-sm sm:text-base text-muted-foreground max-w-lg mx-auto leading-relaxed">
              24 memory packs across 6 strategic domains. Every pack = 1 slot. Activate what you need, swap anytime.
            </p>
          </motion.div>

          {/* Slot capacity */}
          <div className="flex justify-center mb-6 sm:mb-8 px-4">
            <SlotCapacityIndicator slotState={slotState} variant="full" className="max-w-sm w-full" />
          </div>

          {/* Search */}
          <div className="mb-8 sm:mb-10 px-4">
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search packs..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-10 h-10 sm:h-11"
              />
            </div>
          </div>

          {/* Domain rows — horizontal scroll */}
          <div className="space-y-8 sm:space-y-10">
            {domainRows.map(({ domain, packs }, idx) => (
              <PackDomainRow
                key={domain.id}
                domainName={domain.name}
                thesis={domain.thesis}
                packs={packs}
                slotState={slotState}
                onActivate={async (id) => { await slotState.activate.mutateAsync(id); }}
                onDeactivate={async (id) => { await slotState.deactivate.mutateAsync(id); }}
                onSlotPressure={(name) => setPressureModal({ open: true, packName: name })}
                onViewDetails={(pack) => setDetailPack(pack)}
                index={idx}
              />
            ))}
          </div>

          {domainRows.length === 0 && (
            <div className="text-center py-16 text-muted-foreground px-4">
              <Package className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">No packs match your search.</p>
            </div>
          )}
        </div>

        <SlotPressureModal
          open={pressureModal.open}
          onOpenChange={(open) => setPressureModal({ ...pressureModal, open })}
          currentTier={currentProductTier}
          packName={pressureModal.packName}
        />

        <PackDetailModal
          pack={detailPack}
          open={!!detailPack}
          onOpenChange={(open) => { if (!open) setDetailPack(null); }}
          slotState={slotState}
          onActivate={async (id) => { await slotState.activate.mutateAsync(id); }}
          onDeactivate={async (id) => { await slotState.deactivate.mutateAsync(id); }}
          onSlotPressure={(name) => setPressureModal({ open: true, packName: name })}
        />
      </main>

      <EnhancedFooter />
    </div>
  );
}
