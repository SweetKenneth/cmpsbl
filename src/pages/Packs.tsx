/**
 * Packs — Manage artifact pack activations
 * All 24 packs visible. Active-first sorting. Filter/search.
 */
import { useState, useMemo } from 'react';
import { SEO } from '@/components/SEO';
import { PublicNav } from '@/components/PublicNav';
import { EnhancedFooter } from '@/components/EnhancedFooter';
import { useEngineSubscription } from '@/hooks/useEngineSubscription';
import { useArtifactSlots } from '@/hooks/useArtifactSlots';
import { SlotCapacityIndicator } from '@/components/slots/SlotCapacityIndicator';
import { SlotPressureModal } from '@/components/slots/SlotPressureModal';
import { PackActivationCard } from '@/components/slots/PackActivationCard';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Package, Search } from 'lucide-react';
import { ARTIFACT_PACKS, STRATEGIC_DOMAINS, type ProductTier } from '@/lib/quarry/types';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function Packs() {
  const { tier: currentTier } = useEngineSubscription();
  const [search, setSearch] = useState('');
  const [activeDomain, setActiveDomain] = useState<string | null>(null);
  const [pressureModal, setPressureModal] = useState<{ open: boolean; packName?: string }>({ open: false });

  const currentProductTier: ProductTier =
    currentTier === 'enterprise' ? 'architect' :
    ['architect', 'pro', 'creator', 'builder'].includes(currentTier) ? 'operator' :
    'builder';

  const slotState = useArtifactSlots(currentTier);

  const filteredPacks = useMemo(() => {
    let packs = [...ARTIFACT_PACKS];

    // Domain filter
    if (activeDomain) {
      const domain = STRATEGIC_DOMAINS.find(d => d.id === activeDomain);
      if (domain) packs = packs.filter(p => domain.packIds.includes(p.id));
    }

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      packs = packs.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    }

    // Active-first sorting
    packs.sort((a, b) => {
      const aActive = slotState.isPackActive(a.id) ? 1 : 0;
      const bActive = slotState.isPackActive(b.id) ? 1 : 0;
      return bActive - aActive;
    });

    return packs;
  }, [activeDomain, search, slotState]);

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Manage Packs — Clockless"
        description="Activate and manage your artifact packs. Every pack = 1 slot."
      />
      <PublicNav />

      <main className="pt-28 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-10 space-y-3"
            >
              <Badge variant="outline" className="px-3 py-1 text-xs border-primary/30">
                <Package className="w-3 h-3 mr-1.5 inline" />
                Pack Management
              </Badge>
              <h1 className="text-3xl md:text-4xl font-bold">Manage Your Packs</h1>
              <p className="text-muted-foreground max-w-lg mx-auto">
                All 24 packs available. Every pack = 1 slot. Activate what you need.
              </p>
            </motion.div>

            {/* Slot capacity */}
            <div className="flex justify-center mb-8">
              <SlotCapacityIndicator slotState={slotState} variant="full" className="max-w-sm w-full" />
            </div>

            {/* Search + domain filters */}
            <div className="space-y-4 mb-8">
              <div className="relative max-w-md mx-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search packs..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex flex-wrap justify-center gap-2">
                <button
                  onClick={() => setActiveDomain(null)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-xs font-medium transition-all',
                    !activeDomain
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted/50 text-muted-foreground hover:text-foreground'
                  )}
                >
                  All Domains
                </button>
                {STRATEGIC_DOMAINS.map(d => (
                  <button
                    key={d.id}
                    onClick={() => setActiveDomain(activeDomain === d.id ? null : d.id)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-xs font-medium transition-all',
                      activeDomain === d.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted/50 text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {d.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Pack grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredPacks.map(pack => (
                <PackActivationCard
                  key={pack.id}
                  pack={pack}
                  slotState={slotState}
                  onActivate={async (id) => { await slotState.activate.mutateAsync(id); }}
                  onDeactivate={async (id) => { await slotState.deactivate.mutateAsync(id); }}
                  onSlotPressure={(name) => setPressureModal({ open: true, packName: name })}
                />
              ))}
            </div>

            {filteredPacks.length === 0 && (
              <div className="text-center py-16 text-muted-foreground">
                <Package className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p>No packs match your search.</p>
              </div>
            )}
          </div>
        </div>

        <SlotPressureModal
          open={pressureModal.open}
          onOpenChange={(open) => setPressureModal({ ...pressureModal, open })}
          currentTier={currentProductTier}
          packName={pressureModal.packName}
        />
      </main>

      <EnhancedFooter />
    </div>
  );
}
