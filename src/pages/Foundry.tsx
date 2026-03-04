/**
 * Memory Stream — Public Crystallization Page
 * Per-user vault. Quality floor >= 68. No bias exposed.
 * 
 * - Anonymous: preview + CTA
 * - Authenticated: crystallize button, vault, stats
 */
import { useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/contexts/AuthContext';
import { useFoundryState } from '@/hooks/useFoundryState';
import { FoundryPreview } from '@/components/foundry/FoundryPreview';
import { FoundryMiningPanel } from '@/components/foundry/FoundryMiningPanel';
import { FoundryInventory } from '@/components/foundry/FoundryInventory';
import { FoundryStats } from '@/components/foundry/FoundryStats';
import { FoundryTierLegend } from '@/components/foundry/FoundryTierLegend';
import { MemoryRiver } from '@/components/hero/MemoryRiver';
import { PublicNav } from '@/components/PublicNav';
import { EnhancedFooter } from '@/components/EnhancedFooter';

export default function Foundry() {
  const { user, loading: authLoading } = useAuth();
  const foundry = useFoundryState();
  const [activeTab, setActiveTab] = useState<'mine' | 'inventory'>('mine');
  const [crystallizing, setCrystallizing] = useState(false);

  if (authLoading || foundry.isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground font-mono text-sm animate-pulse">
          Loading Memory Stream...
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Memory Stream — CMPSBL®</title>
        <meta name="description" content="Discover crystallized pipelines from the Memory Stream. Every pull is a production-grade pipeline scored and tiered by quality." />
      </Helmet>

      <PublicNav />

      <div className="min-h-screen bg-background text-foreground">
        {!user ? (
          <FoundryPreview />
        ) : (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 md:py-16">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="text-xs font-mono uppercase tracking-[0.4em] text-muted-foreground mb-4">
                Memory Stream
              </div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-foreground mb-4">
                Crystallize Pipelines
              </h1>
              <p className="text-muted-foreground/70 max-w-lg mx-auto text-sm">
                The Memory Stream is a continuous substrate of evolving software systems.
                The engine samples the stream and crystallizes viable pipelines.
                Quality floor: 68+. No filler. Only stable systems survive.
              </p>
            </div>

            {/* Memory Stream visualization */}
            <div className="relative w-full h-32 sm:h-24 mb-8 rounded-lg overflow-hidden border border-border/10 bg-card/20">
              <MemoryRiver crystallizing={crystallizing} />
            </div>

            {/* Stats row */}
            <FoundryStats
              inventoryCount={foundry.inventoryCount}
              bestPull={foundry.bestPull}
              totalMines={foundry.userState?.totalMines ?? 0}
              streakDays={foundry.userState?.streakDays ?? 0}
              tierCounts={foundry.tierCounts}
            />

            {/* Tab bar */}
            <div className="flex items-center gap-1 border-b border-border/20 mb-8 mt-8">
              <button
                onClick={() => setActiveTab('mine')}
                className={`px-4 py-2.5 font-mono text-sm transition-colors border-b-2 -mb-px ${
                  activeTab === 'mine'
                    ? 'border-primary text-foreground font-bold'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                Crystallize
              </button>
              <button
                onClick={() => setActiveTab('inventory')}
                className={`px-4 py-2.5 font-mono text-sm transition-colors border-b-2 -mb-px ${
                  activeTab === 'inventory'
                    ? 'border-primary text-foreground font-bold'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                Vault ({foundry.inventoryCount})
              </button>
            </div>

            {/* Content */}
            {activeTab === 'mine' ? (
              <div className="space-y-8">
                <FoundryMiningPanel
                  isMining={foundry.isMining}
                  lastResult={foundry.lastMineResult}
                  onMine={foundry.mine}
                  onCrystallizing={setCrystallizing}
                />
                <FoundryTierLegend />
              </div>
            ) : (
              <FoundryInventory inventory={foundry.inventory} />
            )}
          </div>
        )}
      </div>

      <EnhancedFooter />
    </>
  );
}
