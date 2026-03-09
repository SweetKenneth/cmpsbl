/**
 * Memory Stream — Public Crystallization Page
 * Per-user vault. Quality floor >= 68. No bias exposed.
 * 
 * - Anonymous: preview + CTA
 * - Authenticated: crystallize button, vault, stats
 */
import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { SEO } from '@/components/SEO';
import { useAuth } from '@/contexts/AuthContext';
import { useFoundryState } from '@/hooks/useFoundryState';
import { useVaultState } from '@/hooks/useVaultState';
import { useEngineSubscription } from '@/hooks/useEngineSubscription';
import { supabase } from '@/integrations/supabase/client';
import { FoundryMiningPanel } from '@/components/foundry/FoundryMiningPanel';
import { FoundryInventory } from '@/components/foundry/FoundryInventory';
import { FoundryStats } from '@/components/foundry/FoundryStats';
import { FoundryTierLegend } from '@/components/foundry/FoundryTierLegend';
import { MemoryRiver } from '@/components/hero/MemoryRiver';
import { PublicNav } from '@/components/PublicNav';
import { EnhancedFooter } from '@/components/EnhancedFooter';
import { FoundryHero } from '@/components/foundry-demo/FoundryHero';
import { FoundryDemoVideo } from '@/components/foundry-demo/FoundryDemoVideo';
import { MemoryStreamExplainer } from '@/components/foundry-demo/MemoryStreamExplainer';
import { ProofNumbers } from '@/components/foundry-demo/ProofNumbers';
import { RecursiveLoop } from '@/components/foundry-demo/RecursiveLoop';
import { CrownJewelShowcase } from '@/components/foundry-demo/CrownJewelShowcase';
import { LiveDiscoveryStream } from '@/components/foundry-demo/LiveDiscoveryStream';
import { CategoryBreakdown } from '@/components/foundry-demo/CategoryBreakdown';
import { TierDistribution } from '@/components/foundry-demo/TierDistribution';
import { VerifyPanel } from '@/components/foundry-demo/VerifyPanel';
import { FoundryMidCTA } from '@/components/foundry-demo/FoundryMidCTA';
import { FoundryPostProofCTA } from '@/components/foundry-demo/FoundryPostProofCTA';
import { FoundryFinalCTA } from '@/components/foundry-demo/FoundryFinalCTA';


export default function Foundry() {
  const { user, loading: authLoading } = useAuth();
  const foundry = useFoundryState();
  const vaultState = useVaultState();
  const { tier: subscriptionTier } = useEngineSubscription();
  const [activeTab, setActiveTab] = useState<'mine' | 'inventory'>('mine');
  const [crystallizing, setCrystallizing] = useState(false);
  const [discoveries, setDiscoveries] = useState<any[]>([]);

  const handleInventoryRemove = useCallback(async (id: string): Promise<boolean> => {
    if (!user) return false;
    const { error } = await supabase
      .from('foundry_inventory')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);
    if (error) {
      console.error('[Foundry] remove failed', error);
      return false;
    }
    await foundry.reload();
    return true;
  }, [user, foundry.reload]);

  // Load discoveries for anonymous view
  useEffect(() => {
    if (user) return;
    async function load() {
      const all: any[] = [];
      let from = 0;
      const pageSize = 1000;
      while (true) {
        const { data } = await supabase
          .from('discoveries')
          .select('name, cjpi, tier, category, module_chain, created_at')
          .order('cjpi', { ascending: false })
          .range(from, from + pageSize - 1);
        if (!data || data.length === 0) break;
        all.push(...data);
        if (data.length < pageSize) break;
        from += pageSize;
      }
      setDiscoveries(all);
    }
    load();
  }, [user]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 rounded-full border-2 border-primary/30 border-t-primary"
        />
        <div className="text-muted-foreground font-mono text-sm">
          Loading Memory Stream...
        </div>
      </div>
    );
  }

  if (user && foundry.isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 rounded-full border-2 border-primary/30 border-t-primary"
        />
        <div className="text-muted-foreground font-mono text-sm">
          Loading Memory Stream...
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO 
        title="Memory Stream — CMPSBL®"
        description="Discover crystallized pipelines from the Memory Stream. Every pull is a production-grade pipeline scored and tiered by quality."
        canonical="https://cmpsbl.com/foundry"
        image="https://cmpsbl.com/og-memory-stream.jpg"
        keywords={['memory stream', 'crystallized pipelines', 'AI software discovery', 'CMPSBL foundry']}
      />

      <PublicNav />

      <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
        {/* Substrate ambient background */}
        <div className="absolute inset-0 pointer-events-none z-0 substrate-grid-bg opacity-30" />
        <div className="absolute inset-0 pointer-events-none z-0 animate-substrate-breathe">
          <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl" style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.06), transparent)" }} />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl" style={{ background: "radial-gradient(circle, hsl(var(--neon-cyan) / 0.04), transparent)" }} />
        </div>
        {!user ? (
          <div className="min-h-screen bg-background text-foreground relative z-10">
            {/* Demo video — above hero, below stats */}
            <FoundryDemoVideo />
            <div id="hero"><FoundryHero /></div>
            <MemoryStreamExplainer />
            <div id="proof"><ProofNumbers /></div>
            <div id="engine"><RecursiveLoop /></div>
            {/* Mid-page conversion nudge */}
            <FoundryMidCTA />
            <div id="apex"><CrownJewelShowcase /></div>
            <div id="stream"><LiveDiscoveryStream discoveries={discoveries} /></div>
            <CategoryBreakdown />
            <TierDistribution />
            <div id="verify"><VerifyPanel /></div>
            <FoundryPostProofCTA />
            <FoundryFinalCTA />
          </div>
        ) : (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 md:py-16 relative z-10">
            {/* Header */}
            <div className="text-center mb-10">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 mb-5"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-live-pulse" />
                <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-primary/80">Memory Stream</span>
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter mb-4"
              >
                <span className="section-gradient-text">Crystallize Pipelines</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-muted-foreground/70 max-w-lg mx-auto text-sm leading-relaxed"
              >
                The Memory Stream is a continuous substrate of evolving software systems.
                The engine samples the stream and crystallizes viable pipelines.
                Quality floor: 68+. No filler. Only stable systems survive.
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

            {/* Content */}
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
              <FoundryInventory inventory={foundry.inventory} onRemove={handleInventoryRemove} />
            )}
          </div>
        )}
      </div>

      <EnhancedFooter />
    </>
  );
}
