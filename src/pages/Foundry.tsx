/**
 * Memory Stream — Discover & crystallize software capabilities
 * Authenticated users mine, score, and vault discoveries.
 * Anonymous users get an explainer with CTAs to sign up and browse the Junkyard.
 */
import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SEO } from '@/components/SEO';
import { useAuth } from '@/contexts/AuthContext';
import { useFoundryState } from '@/hooks/useFoundryState';
import { useVaultState } from '@/hooks/useVaultState';
import { useEngineSubscription } from '@/hooks/useEngineSubscription';
import { usePricingEngine } from '@/hooks/usePricingEngine';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { FoundryMiningPanel } from '@/components/foundry/FoundryMiningPanel';
import { FoundryInventory } from '@/components/foundry/FoundryInventory';
import { FoundryStats } from '@/components/foundry/FoundryStats';
import { FoundryTierLegend } from '@/components/foundry/FoundryTierLegend';
import { MemoryRiver } from '@/components/hero/MemoryRiver';
import { PublicNav } from '@/components/PublicNav';
import { EnhancedFooter } from '@/components/EnhancedFooter';
import { RelatedCapabilities } from '@/components/RelatedCapabilities';
import { Button } from '@/components/ui/button';
import {
  ArrowRight, Archive, Waves, Key, Zap,
} from 'lucide-react';

/** Anonymous landing — explains Memory Stream + links to Junkyard */
function MemoryStreamLanding() {
  return (
    <div className="min-h-screen bg-background">
      <PublicNav />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-24 pb-16 relative z-10">
        {/* Hero */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 mb-5"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-live-pulse" />
            <span className="text-xs font-mono uppercase tracking-[0.3em] text-primary/80">Memory Stream</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter mb-4"
          >
            <span className="section-gradient-text">Crystallize Memories</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground/70 max-w-lg mx-auto text-sm sm:text-base leading-relaxed"
          >
            The Memory Stream continuously discovers new software capabilities.
            Pull scored discoveries into your vault — quality floor of 68+. No filler.
            Only proven capabilities survive.
          </motion.p>
        </div>

        {/* Memory River visualization */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
          className="relative w-full mb-10"
        >
          <MemoryRiver crystallizing={false} compact hideTagline hideLegend />
        </motion.div>

        {/* How it works */}
        <div className="grid sm:grid-cols-3 gap-4 mb-10">
          {[
            { icon: Waves, title: 'Pull', description: 'The substrate surfaces a random scored discovery from the Memory Stream. Each pull is unique.' },
            { icon: Zap, title: 'Score', description: 'Every discovery is scored by CJPI — a 0-100 quality index. Only 68+ makes it to your vault.' },
            { icon: Key, title: 'Vault', description: 'Keep what you pull. Your vault grows with each crystallization. Export, deploy, or trade.' },
          ].map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.title} className="rounded-xl border border-border/20 bg-card/20 p-5 text-center">
                <div className="w-10 h-10 rounded-lg border border-border/20 bg-card/40 flex items-center justify-center mx-auto mb-3">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-bold text-sm mb-1.5">{step.title}</h3>
                <p className="text-xs text-muted-foreground/60 leading-relaxed">{step.description}</p>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-14">
          <Button asChild size="lg" className="gap-2 rounded-xl text-sm font-bold">
            <Link to="/auth">
              <Key className="w-4 h-4" />
              Create Account & Start Pulling
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="gap-2 rounded-xl text-sm">
            <Link to="/plans">
              View Tier Limits
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </Button>
        </div>

        {/* Junkyard CTA */}
        <div className="rounded-xl border border-neon-amber/15 bg-gradient-to-r from-neon-amber/5 via-transparent to-neon-amber/5 p-6 sm:p-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-neon-amber/20 bg-neon-amber/5 mb-3">
            <Archive className="w-3.5 h-3.5 text-neon-amber" />
            <span className="text-xs font-mono tracking-wider text-neon-amber">FREE</span>
          </div>
          <h2 className="text-lg sm:text-xl font-black mb-2">Looking for Free Stuff?</h2>
          <p className="text-sm text-muted-foreground/70 max-w-md mx-auto mb-4">
            Browse the Junkyard — discarded tech, broken builds, raw discoveries.
            Everything is free to take. Gems sometimes surface.
          </p>
          <Button asChild variant="outline" className="gap-2 border-neon-amber/30 text-neon-amber hover:bg-neon-amber/10">
            <Link to="/junkyard">
              <Archive className="w-4 h-4" />
              Browse the Junkyard
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </Button>
        </div>
      </div>

      <RelatedCapabilities />
      <EnhancedFooter />
    </div>
  );
}

// ─── Main Export ───
export default function Foundry() {
  const { user, loading: authLoading } = useAuth();
  const foundry = useFoundryState();
  const vaultState = useVaultState();
  const { tier: subscriptionTier } = useEngineSubscription();
  const pricingEngine = usePricingEngine();
  const [activeTab, setActiveTab] = useState<'mine' | 'inventory'>('mine');
  const [crystallizing, setCrystallizing] = useState(false);

  const handleRepriceAll = useCallback(async () => {
    const result = await pricingEngine.repriceAllDiscoveries();
    if (result.success === 0 && result.failed === 0) {
      toast.info('All items already priced — nothing to do');
    } else {
      toast.success(`Priced ${result.success} new artifacts${result.failed ? ` (${result.failed} failed)` : ''}`);
    }
    await foundry.reload();
  }, [foundry.reload, pricingEngine]);

  const handleRepriceOne = useCallback(async (id: string) => {
    const item = foundry.inventory?.find((i: any) => i.id === id);
    if (!item) return;
    await pricingEngine.priceOne({
      vault_id: item.id,
      pipeline_name: item.artifactName,
      pipeline_score: item.score,
      pipeline_tier: item.publicTier,
      pipeline_category: item.category,
      system_chain: item.systemChain,
      valuation_display: item.valuationDisplay,
    });
    toast.success(`Repriced ${item.artifactName}`);
    await foundry.reload();
  }, [foundry.inventory, foundry.reload, pricingEngine]);

  const handleInventoryRemove = useCallback(async (id: string): Promise<boolean> => {
    if (!user) return false;
    const { error } = await supabase
      .from('foundry_inventory')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);
    if (error) return false;
    await foundry.reload();
    return true;
  }, [user, foundry.reload]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 rounded-full border-2 border-primary/30 border-t-primary"
        />
        <div className="text-muted-foreground font-mono text-sm">Loading...</div>
      </div>
    );
  }

  // Anonymous users see the Memory Stream landing with Junkyard CTA
  if (!user) {
    return (
      <>
        <SEO
          title="Memory Stream — Discover & Collect Software Capabilities | CMPSBL"
          description="Discover scored, tiered, exportable software capabilities. 5 rarity tiers from Mint to Apex, quality floor of 68+, and per-user persistent vault. Start mining free."
          canonical="https://cmpsbl.com/foundry"
          image="https://cmpsbl.com/og/foundry.jpg"
          keywords={['memory stream', 'crystallized memories', 'AI software discovery', 'CMPSBL', 'quality scoring', 'composable capabilities']}
        />
        <MemoryStreamLanding />
      </>
    );
  }

  if (foundry.isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 rounded-full border-2 border-primary/30 border-t-primary"
        />
        <div className="text-muted-foreground font-mono text-sm">Loading Memory Stream...</div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title="Memory Stream — Discover & Collect Software Capabilities | CMPSBL"
        description="Discover scored, tiered, exportable software capabilities. 5 rarity tiers from Mint to Apex, quality floor of 68+, and per-user persistent vault. Start mining free."
        canonical="https://cmpsbl.com/foundry"
        image="https://cmpsbl.com/og/foundry.jpg"
        keywords={['memory stream', 'crystallized memories', 'AI software discovery', 'CMPSBL', 'quality scoring', 'composable capabilities']}
      />

      <PublicNav />

      <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none z-0 substrate-grid-bg opacity-30" />
        <div className="absolute inset-0 pointer-events-none z-0 animate-substrate-breathe">
          <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl" style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.06), transparent)" }} />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl" style={{ background: "radial-gradient(circle, hsl(var(--neon-cyan) / 0.04), transparent)" }} />
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 md:py-16 relative z-10">
          {/* Header */}
          <div className="text-center mb-10 pt-16">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 mb-5"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-live-pulse" />
              <span className="text-xs font-mono uppercase tracking-[0.3em] text-primary/80">Memory Stream</span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter mb-4"
            >
              <span className="section-gradient-text">Crystallize Memories</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-muted-foreground/70 max-w-lg mx-auto text-sm leading-relaxed"
            >
              The Memory Stream continuously discovers new software capabilities.
              The engine scores each discovery and crystallizes the best into your vault.
              Quality floor: 68+. No filler. Only proven capabilities survive.
            </motion.p>
          </div>

          {/* Memory Stream visualization */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 }}
            className="relative w-full mb-8"
          >
            <MemoryRiver crystallizing={crystallizing} compact hideTagline hideLegend />
          </motion.div>

          <FoundryStats
            inventoryCount={foundry.inventoryCount}
            bestPull={foundry.bestPull}
            totalMines={foundry.userState?.totalMines ?? 0}
            streakDays={foundry.userState?.streakDays ?? 0}
            tierCounts={foundry.tierCounts}
            inventory={foundry.inventory?.map((i: any) => ({ score: i.score, category: i.category, systemChain: i.systemChain }))}
          />

          {/* Tab bar */}
          <div className="flex items-center gap-1 border-b border-border/20 mb-8 mt-8">
            <button
              onClick={() => setActiveTab('mine')}
              className={`relative px-5 py-3 sm:py-2.5 font-mono text-sm transition-colors -mb-px min-h-[44px] ${
                activeTab === 'mine'
                  ? 'text-foreground font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Crystallize
              {activeTab === 'mine' && (
                <motion.div
                  layoutId="foundry-tab"
                  className="absolute bottom-0 left-0 right-0 h-[2px] memory-stream-bar"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </button>
            <button
              onClick={() => setActiveTab('inventory')}
              className={`relative px-5 py-3 sm:py-2.5 font-mono text-sm transition-colors -mb-px min-h-[44px] ${
                activeTab === 'inventory'
                  ? 'text-foreground font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Vault ({vaultState.vaultCount})
              {activeTab === 'inventory' && (
                <motion.div
                  layoutId="foundry-tab"
                  className="absolute bottom-0 left-0 right-0 h-[2px] memory-stream-bar"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          </div>

          {activeTab === 'mine' ? (
            <div className="space-y-8">
              <FoundryMiningPanel
                isMining={foundry.isMining}
                lastResult={foundry.lastMineResult}
                onMine={foundry.mine}
                onCrystallizing={setCrystallizing}
                subscriptionTier={subscriptionTier}
                vaultCount={vaultState.vaultCount}
                pullsToday={vaultState.pullsToday}
                onVaultChange={vaultState.refresh}
                onKeepPipeline={vaultState.keepPipeline}
                onRecordPull={vaultState.recordPull}
              />
              <FoundryTierLegend />
            </div>
          ) : (
            <FoundryInventory inventory={foundry.inventory} onRemove={handleInventoryRemove} onReprice={handleRepriceOne} onRepriceAll={handleRepriceAll} repricing={pricingEngine.loading} subscriptionTier={subscriptionTier} />
          )}

          {/* Junkyard CTA */}
          <div className="mt-12 rounded-xl border border-neon-amber/15 bg-gradient-to-r from-neon-amber/5 via-transparent to-neon-amber/5 p-5 sm:p-7 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-neon-amber/20 bg-neon-amber/5 mb-3">
              <Archive className="w-3.5 h-3.5 text-neon-amber" />
              <span className="text-xs font-mono tracking-wider text-neon-amber">FREE</span>
            </div>
            <h3 className="text-base sm:text-lg font-black mb-2">Browse the Junkyard</h3>
            <p className="text-sm text-muted-foreground/70 max-w-md mx-auto mb-4">
              Discarded tech, broken builds, raw discoveries — everything is free to take.
              Gems sometimes surface.
            </p>
            <Button asChild variant="outline" className="gap-2 border-neon-amber/30 text-neon-amber hover:bg-neon-amber/10">
              <Link to="/junkyard">
                <Archive className="w-4 h-4" />
                Browse the Junkyard
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <RelatedCapabilities />
      <EnhancedFooter />
    </>
  );
}
