/**
 * MarketplaceHome — Blog-style horizontal scroll carousels grouped by category
 * Lives at marketplace.cmpsbl.com
 * Browse freely, auth to buy. Shared SSO with substrates.
 */

import { useState, useMemo, useCallback, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { StructuredData } from '@/components/seo/StructuredData';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PublicNav } from '@/components/PublicNav';
import { EnhancedFooter } from '@/components/EnhancedFooter';
import { JunkyardCTA } from '@/components/shared/JunkyardCTA';
import { cn } from '@/lib/utils';
import {
  Search, ShoppingCart, Star, TrendingUp, X, ChevronLeft, ChevronRight,
  Shield, Zap, Eye, Globe, Package, Gift, Download,
  Store, Award, Tag, Cpu, Lock, Clock,
} from 'lucide-react';
import {
  CATEGORY_META,
  SUBSTRATE_META,
  type MarketplaceItem,
  type ListingCategory,
  type SourceSubstrate,
} from '@/agents/merchant/merchant-engine';
import { useMarketplaceInventory } from '@/hooks/useMarketplaceInventory';
import { MARKETPLACE_IMAGES } from '@/assets/marketplace';
import { downloadMarketplaceArtifact } from '@/lib/export/marketplace-export';
import merchantHeroBg from '@/assets/marketplace/merchant-hero-bg.jpg';

const TIER_COLORS: Record<string, string> = {
  Mint: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  Prime: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
  Relic: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  Mythic: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  Apex: 'bg-primary/10 text-primary border-primary/30',
};

const TIER_BORDER: Record<string, string> = {
  Mint: 'border-emerald-500/20 hover:border-emerald-500/40',
  Prime: 'border-sky-500/20 hover:border-sky-500/40',
  Relic: 'border-amber-500/20 hover:border-amber-500/40',
  Mythic: 'border-purple-500/20 hover:border-purple-500/40',
  Apex: 'border-primary/20 hover:border-primary/40',
};

export default function MarketplaceHome() {
  const [search, setSearch] = useState('');
  const [selectedSubstrate, setSelectedSubstrate] = useState<SourceSubstrate | 'all'>('all');
  const [buyingId, setBuyingId] = useState<string | null>(null);

  const { data: inventory = [], isLoading } = useMarketplaceInventory();

  /** The current free item (rotates every 8h) */
  const freeItem = useMemo(() => inventory.find(i => i.priceCents === 0) ?? null, [inventory]);

  const stats = useMemo(() => {
    if (inventory.length === 0) return { total: 0, featured: 0, avgPrice: '$0', substrates: 0 };
    const featured = inventory.filter(i => i.isFeatured).length;
    const paidItems = inventory.filter(i => i.priceCents > 0);
    const avgCents = paidItems.length > 0 ? Math.round(paidItems.reduce((s, i) => s + i.priceCents, 0) / paidItems.length) : 0;
    const substrates = new Set(inventory.map(i => i.sourceSubstrate)).size;
    return { total: inventory.length, featured, avgPrice: `$${(avgCents / 100).toFixed(0)}`, substrates };
  }, [inventory]);

  const handleBuy = useCallback(async (item: MarketplaceItem) => {
    /** Free items — immediate Convex Core™ Sealed Artifact download, no auth required */
    if (item.priceCents === 0) {
      toast.info('Generating Convex Core™ Sealed Artifact...', { description: `Packaging ${item.title} for download.` });
      try {
        await downloadMarketplaceArtifact(item);
        toast.success('Download complete!', { description: `${item.title} — full Convex Core™ Sealed Artifact ZIP with source, docs, and User Guide.` });
      } catch (err) {
        toast.error('Download failed', { description: err instanceof Error ? err.message : 'Please try again' });
      }
      return;
    }

    setBuyingId(item.id);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please sign in to purchase', { description: 'Redirecting to login...' });
        window.location.href = `/auth?redirect=/marketplace`;
        return;
      }
      const { data, error } = await supabase.functions.invoke('marketplace-checkout', {
        body: {
          product_type: 'capability',
          unit_amount_usd: Math.round(item.priceCents / 100),
          item_name: `CMPSBL: ${item.title}`,
          capability_id: item.sourceId,
          product_id: item.slug,
        },
      });
      if (error) throw error;
      if (data?.url) window.open(data.url, '_blank');
    } catch (err) {
      toast.error('Checkout failed', { description: err instanceof Error ? err.message : 'Please try again' });
    } finally {
      setBuyingId(null);
    }
  }, []);

  const filteredItems = useMemo(() => {
    let items = [...inventory];
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(i =>
        i.title.toLowerCase().includes(q) ||
        i.subtitle.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q) ||
        i.tags.some(t => t.includes(q)) ||
        i.category.includes(q)
      );
    }
    if (selectedSubstrate !== 'all') {
      items = items.filter(i => i.sourceSubstrate === selectedSubstrate);
    }
    return items;
  }, [search, selectedSubstrate, inventory]);

  /** Group filtered items by category */
  const categoryRows = useMemo(() => {
    const map = new Map<ListingCategory, MarketplaceItem[]>();
    for (const item of filteredItems) {
      const arr = map.get(item.category) || [];
      arr.push(item);
      map.set(item.category, arr);
    }
    return Array.from(map.entries())
      .sort((a, b) => {
        const aMax = Math.max(...a[1].map(i => i.cjpiScore));
        const bMax = Math.max(...b[1].map(i => i.cjpiScore));
        return bMax - aMax;
      });
  }, [filteredItems]);

  const featuredItems = useMemo(() =>
    inventory.filter(i => i.isFeatured).slice(0, 6),
  [inventory]);

  /** Insert "How It Works" section in the middle of category rows */
  const midIndex = Math.floor(categoryRows.length / 2);

  return (
    <>
      <Helmet>
        <title>CMPSBL Marketplace — Premium Software from Every Substrate</title>
        <meta name="description" content="Shop the best cognitive software from across the CMPSBL ecosystem. Enterprise-grade engines, agents, and memory chains — $10 to $50." />
        <link rel="canonical" href="https://marketplace.cmpsbl.com" />
        <meta property="og:title" content="CMPSBL Marketplace — Premium Cognitive Software" />
        <meta property="og:description" content="Enterprise-grade engines, agents, and memory chains curated by MERCHANT™. $10 to $50." />
        <meta property="og:url" content="https://marketplace.cmpsbl.com" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="CMPSBL" />
      </Helmet>
      <StructuredData
        type="breadcrumb"
        data={{ items: [
          { name: "Home", url: "https://cmpsbl.com" },
          { name: "Marketplace", url: "https://marketplace.cmpsbl.com" },
        ]}}
      />
      <StructuredData
        type="webApplication"
        data={{
          name: "CMPSBL Marketplace",
          description: "Enterprise-grade cognitive software curated by MERCHANT™ from across all CMPSBL substrates. Engines, agents, and memory chains — $10 to $50.",
          url: "https://marketplace.cmpsbl.com",
          features: "CJPI-Scored Software, Autonomous Curation, S-Tier Vault Access, Memory Chain Products, 8-Hour Refresh Cycle, Plug-and-Play Deployment",
        }}
      />


      <PublicNav />

      {/* Hero — full bleed with MERCHANT Agent background */}
      <section className="relative overflow-hidden border-b border-border/30">
        <img
          src={merchantHeroBg}
          alt="MERCHANT Agent scanning digital marketplace"
          className="absolute inset-0 w-full h-full object-cover"
          width={1920}
          height={640}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/70 to-background" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/60 via-transparent to-background/60" />

        <div className="container mx-auto px-4 py-16 md:py-24 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-4xl mx-auto"
          >
            {/* New Drops badge */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
              <Badge variant="outline" className="gap-2 px-4 py-2 border-[hsl(var(--neon-green))]/40 bg-[hsl(var(--neon-green))]/10 text-[hsl(var(--neon-green))]">
                <Clock className="w-3.5 h-3.5" />
                <span className="text-xs font-bold">New Drops Every 8 Hours</span>
              </Badge>
              <Badge variant="outline" className="gap-2 px-4 py-2 border-[hsl(var(--neon-cyan))]/40 bg-[hsl(var(--neon-cyan))]/10 text-[hsl(var(--neon-cyan))]">
                <Gift className="w-3.5 h-3.5" />
                <span className="text-xs font-bold">1 Free Item — Always Available</span>
              </Badge>
            </div>

            <Badge variant="outline" className="gap-2 px-4 py-2 mb-6 border-primary/40 bg-primary/10">
              <Store className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">CMPSBL Marketplace</span>
            </Badge>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight mb-6">
              <span className="text-foreground">The Best Software</span>
              <br />
              <span className="text-primary">From Every Substrate</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-4">
              Enterprise-grade engines, agents, and memory chains curated by MERCHANT™ 
              from across the entire CMPSBL ecosystem.{' '}
              <span className="text-foreground font-semibold">$10–$50. Plug and play.</span>
            </p>

            {freeItem && (
              <p className="text-sm text-[hsl(var(--neon-cyan))] mb-8 flex items-center justify-center gap-2">
                <Gift className="w-4 h-4" />
                <span>
                  <strong>Today's Free Drop:</strong> {freeItem.title} — no sign-in, instant download. Rotates every 8 hours.
                </span>
              </p>
            )}

            {!freeItem && <div className="mb-8" />}

            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto mb-8">
              <div className="relative flex items-center bg-card border rounded-2xl shadow-xl border-border/50 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/20 transition-all">
                <Search className="absolute left-4 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search engines, agents, memory chains..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-12 pr-12 py-6 text-base bg-transparent border-0 focus-visible:ring-0"
                />
                {search && (
                  <Button variant="ghost" size="icon" className="absolute right-3" onClick={() => setSearch('')}>
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Dynamic Stats */}
            <div className="flex flex-wrap justify-center gap-6 md:gap-10">
              {[
                { value: `${stats.total}`, label: 'Products', icon: Package },
                { value: stats.avgPrice, label: 'Avg Price', icon: Tag },
                { value: `${stats.substrates}`, label: 'Substrates', icon: Globe },
                { value: `${stats.featured}`, label: 'Featured', icon: Award },
              ].map(({ value, label, icon: Icon }) => (
                <div key={label} className="text-center">
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <Icon className="w-4 h-4 text-primary" />
                    <span className="text-2xl font-black text-primary">{value}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Substrate pills */}
      <div className="border-b border-border/30">
        <div className="container mx-auto px-4 py-3">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1" style={{ scrollbarWidth: 'none' }}>
            <SubstratePill
              active={selectedSubstrate === 'all'}
              onClick={() => setSelectedSubstrate('all')}
              label="All Substrates"
              count={inventory.length}
            />
            {Object.entries(SUBSTRATE_META).map(([key, meta]) => {
              const count = inventory.filter(i => i.sourceSubstrate === key).length;
              if (count === 0) return null;
              return (
                <SubstratePill
                  key={key}
                  active={selectedSubstrate === key}
                  onClick={() => setSelectedSubstrate(key as SourceSubstrate)}
                  label={meta.label}
                  count={count}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Featured Row */}
      {featuredItems.length > 0 && selectedSubstrate === 'all' && !search && (
        <section className="py-10 border-b border-border/20">
          <div className="container mx-auto px-4 mb-5">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold">Featured This Week</h2>
              <span className="text-xs text-muted-foreground ml-auto">{featuredItems.length} items</span>
            </div>
          </div>
          <div className="container mx-auto px-4">
            <ScrollCarousel>
              {featuredItems.map(item => (
                <div key={item.id} className="snap-start shrink-0 w-[320px] sm:w-[360px]">
                  <ProductCard item={item} onBuy={() => handleBuy(item)} isLoading={buyingId === item.id} />
                </div>
              ))}
            </ScrollCarousel>
          </div>
        </section>
      )}

      {/* Category Rows — with How It Works inserted in the middle */}
      <section className="py-8 space-y-12">
        {categoryRows.map(([category, items], idx) => (
          <div key={category}>
            {/* Insert How It Works section at the midpoint */}
            {idx === midIndex && (
              <MerchantInfoSection />
            )}

            <div className={idx === midIndex ? 'mt-12' : undefined}>
              <div className="container mx-auto px-4 mb-5">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{CATEGORY_META[category].emoji}</span>
                  <h2 className="text-lg sm:text-xl font-bold">{CATEGORY_META[category].label}</h2>
                  <Badge variant="outline" className="text-[10px] h-5 ml-1">{items.length}</Badge>
                  <span className="text-xs text-muted-foreground ml-auto hidden sm:block">
                    Scroll to browse →
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
                  {getCategoryDescription(category)}
                </p>
              </div>
              <div className="container mx-auto px-4">
                <ScrollCarousel>
                  {items
                    .sort((a, b) => b.cjpiScore - a.cjpiScore)
                    .map(item => (
                      <div key={item.id} className="snap-start shrink-0 w-[320px] sm:w-[360px]">
                        <ProductCard item={item} onBuy={() => handleBuy(item)} isLoading={buyingId === item.id} />
                      </div>
                    ))}
                </ScrollCarousel>
              </div>
            </div>
          </div>
        ))}

        {categoryRows.length === 0 && (
          <div className="text-center py-20">
            <Package className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-lg font-medium text-muted-foreground">No products match your search</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={() => { setSearch(''); setSelectedSubstrate('all'); }}>
              Clear Filters
            </Button>
          </div>
        )}
      </section>

      <JunkyardCTA />
      <EnhancedFooter />
    </>
  );
}

/* ═══ MERCHANT Info — How the Marketplace Works ═══ */

function MerchantInfoSection() {
  return (
    <section className="py-16 bg-muted/20 border-y border-border/20 mb-12">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <Badge variant="outline" className="gap-2 px-4 py-2 mb-6 border-primary/30">
            <Cpu className="w-4 h-4 text-primary" />
            Curated by MERCHANT™
          </Badge>
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            How the Marketplace Works
          </h2>
          <p className="text-muted-foreground mb-8">
            MERCHANT™ is a policy-governed AI worker that scans all CMPSBL substrates every 8 hours,
            identifying the highest-quality software from S-Tier vaults, A-Tier vaults,
            and Memory Stream discoveries. Only software scoring CJPI 75+ qualifies.
            Pricing is set by the ECONOMY engine for maximum accessibility.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Eye, label: 'Scans 6 Substrates', desc: 'Every 8 hours' },
              { icon: Shield, label: 'CJPI 75+ Only', desc: 'Quality threshold' },
              { icon: Tag, label: '$10–$50 Range', desc: 'ECONOMY pricing' },
              { icon: Lock, label: 'Convex Core™ Sealed Artifact', desc: 'Plug and play' },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="p-4 rounded-xl bg-card border border-border/50 text-center">
                <Icon className="w-6 h-6 text-primary mx-auto mb-2" />
                <div className="text-sm font-semibold">{label}</div>
                <div className="text-xs text-muted-foreground">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══ Scroll Carousel ═══ */

function ScrollCarousel({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: 'left' | 'right') => {
    if (!ref.current) return;
    const amount = ref.current.clientWidth * 0.7;
    ref.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  return (
    <div className={cn("group relative", className)}>
      <button
        onClick={() => scroll('left')}
        aria-label="Scroll left"
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-background/90 border border-border shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity -translate-x-1/2 hidden md:flex"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <div
        ref={ref}
        className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4 -mx-4 px-4 md:mx-0 md:px-0"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {children}
      </div>
      <button
        onClick={() => scroll('right')}
        aria-label="Scroll right"
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-background/90 border border-border shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity translate-x-1/2 hidden md:flex"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}

/* ═══ Product Card — detailed with image ═══ */

function ProductCard({ item, onBuy, isLoading }: { item: MarketplaceItem; onBuy: () => void; isLoading?: boolean }) {
  const meta = CATEGORY_META[item.category];
  const substrateMeta = SUBSTRATE_META[item.sourceSubstrate];
  const image = MARKETPLACE_IMAGES[item.slug];

  return (
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
      <div className={cn(
        "h-full rounded-xl border overflow-hidden bg-card transition-all duration-200 hover:shadow-xl flex flex-col",
        item.priceCents === 0
          ? 'border-[hsl(var(--neon-green))]/50 hover:border-[hsl(var(--neon-green))] shadow-[0_0_20px_-5px_hsl(var(--neon-green)/0.3)]'
          : TIER_BORDER[item.tier] || 'border-border hover:border-primary/30',
      )}>
        {/* Image header */}
        <div className="relative h-40 overflow-hidden bg-muted/30">
          {image ? (
            <img
              src={image}
              alt={item.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
              width={896}
              height={512}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-muted/50 to-muted/20 flex items-center justify-center">
              <span className="text-4xl">{meta.emoji}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />

          {/* Floating badges */}
          <div className="absolute top-2 left-2 flex gap-1.5">
            <Badge className={cn('text-[10px] h-5 px-1.5 backdrop-blur-md', TIER_COLORS[item.tier])}>
              {item.tier} · CJPI {item.cjpiScore}
            </Badge>
          </div>
          <div className="absolute top-2 right-2 flex gap-1.5">
            {item.priceCents === 0 && (
              <Badge className="text-[10px] h-5 bg-[hsl(var(--neon-cyan))]/90 text-white gap-1 backdrop-blur-md animate-pulse">
                <Gift className="w-3 h-3" />
                Free Drop
              </Badge>
            )}
            {item.isFeatured && item.priceCents > 0 && (
              <Badge className="text-[10px] h-5 bg-primary/90 text-primary-foreground gap-1 backdrop-blur-md">
                <TrendingUp className="w-3 h-3" />
                Featured
              </Badge>
            )}
            {item.isNew && (
              <Badge className="text-[10px] h-5 bg-[hsl(var(--neon-green))]/90 text-white backdrop-blur-md">
                New
              </Badge>
            )}
          </div>

          {/* Price floating */}
          <div className="absolute bottom-2 right-2">
            {item.priceCents === 0 ? (
              <div className="bg-[hsl(var(--neon-green))]/90 backdrop-blur-md rounded-lg px-3 py-1.5 border border-[hsl(var(--neon-green))]/50 animate-pulse">
                <span className="text-sm font-black text-white flex items-center gap-1">
                  <Gift className="w-3.5 h-3.5" />
                  FREE
                </span>
              </div>
            ) : (
              <div className="bg-card/90 backdrop-blur-md rounded-lg px-3 py-1 border border-border/30">
                <span className="text-xl font-black text-primary">${(item.priceCents / 100).toFixed(0)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 flex-1 flex flex-col space-y-3">
          {/* Substrate + category */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <Badge variant="outline" className="text-[10px] h-5 px-1.5">
              {substrateMeta.label}
            </Badge>
            <Badge variant="outline" className="text-[10px] h-5 px-1.5">
              {meta.emoji} {meta.label}
            </Badge>
          </div>

          {/* Title & subtitle */}
          <div>
            <h3 className="font-bold text-sm leading-tight">{item.title}</h3>
            <p className="text-xs text-muted-foreground mt-1">{item.subtitle}</p>
          </div>

          {/* Description */}
          <p className="text-[11px] text-muted-foreground/80 leading-relaxed">
            {item.description}
          </p>

          {/* Pain points solved */}
          <div className="space-y-1">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Solves</span>
            {item.painPoints.map((p, i) => (
              <div key={i} className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
                <span className="text-primary mt-0.5 shrink-0">✓</span>
                <span>{p}</span>
              </div>
            ))}
          </div>

          {/* Features */}
          <div className="flex flex-wrap gap-1">
            {item.features.slice(0, 4).map(f => (
              <span key={f} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                {f}
              </span>
            ))}
          </div>

          {/* Primitive chain */}
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Zap className="w-3 h-3 shrink-0" />
            <span className="font-mono">{item.primitiveChain.join(' → ')}</span>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1">
            {item.tags.map(tag => (
              <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded-full border border-border/40 text-muted-foreground/70">
                #{tag}
              </span>
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 mt-auto border-t border-border/30">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-primary fill-primary" />
                <span className="text-xs font-medium">{item.rating}</span>
              </div>
              <span className="text-[10px] text-muted-foreground">· v{item.version}</span>
            </div>
            {item.priceCents === 0 ? (
              <Button size="sm" className="gap-1.5 text-xs shadow-md bg-[hsl(var(--neon-green))] hover:bg-[hsl(var(--neon-green))]/80 text-white" onClick={onBuy}>
                <Download className="w-3.5 h-3.5" />
                Free Download
              </Button>
            ) : (
              <Button size="sm" className="gap-1.5 text-xs shadow-md" onClick={onBuy} disabled={isLoading}>
                <ShoppingCart className="w-3.5 h-3.5" />
                {isLoading ? '...' : 'Buy'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ═══ Substrate Pill ═══ */

function SubstratePill({ active, onClick, label, count }: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all border',
        active
          ? 'bg-primary/15 text-primary border-primary/30'
          : 'bg-card text-muted-foreground border-border/50 hover:bg-muted hover:text-foreground'
      )}
    >
      {label}
      <span className="ml-1.5 text-[10px] tabular-nums opacity-60">{count}</span>
    </button>
  );
}

/* ═══ Category Descriptions ═══ */

function getCategoryDescription(category: ListingCategory): string {
  const descriptions: Record<ListingCategory, string> = {
    'meta-engine': 'Core algorithmic engines that power prediction, discovery, and recursive analysis across the substrate.',
    'meta-agent': 'Policy-governed AI workers that operate on a schedule, scanning, curating, and optimizing system resources.',
    'memory-chain': 'Intelligent data lifecycle management — retention, migration, and selective forgetting systems.',
    'security-module': 'Breach calculation, penalty estimation, and covert signal routing for enterprise security.',
    'robotics-controller': 'Spatial awareness, mesh optimization, and coordination protocols for robotic systems.',
    'quantum-optimizer': 'Calibration engines and probability systems leveraging quantum-inspired algorithms.',
    'llm-toolkit': 'Translation, terminology management, and multi-format parsing tools for language model integration.',
    'agency-workflow': 'Multi-agent negotiation, gossip protocols, and distributed state synchronization engines.',
    'governance-tool': 'Ethical constraint enforcement, compliance checking, and cross-border data transfer arbitration.',
    'integration-bridge': 'UI compilation, migration management, and API contract evolution for seamless system integration.',
    'analytics-engine': 'Flame graph profiling, impact analysis, and performance bottleneck detection systems.',
    'defense-layer': 'Event storm dampening, autoimmune prevention, and adaptive rate-limiting for system resilience.',
  };
  return descriptions[category] || '';
}
