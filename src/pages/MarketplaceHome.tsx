/**
 * MarketplaceHome — Steam/App Store style marketplace landing
 * Lives at marketplace.cmpsbl.com
 * Browse freely, auth to buy. Shared SSO with substrates.
 */

import { useState, useMemo, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { PublicNav } from '@/components/PublicNav';
import { EnhancedFooter } from '@/components/EnhancedFooter';
import { cn } from '@/lib/utils';
import {
  Search, ShoppingCart, Star, TrendingUp, Filter, X,
  Shield, Zap, Eye, Globe, Package,
  Store, Award, Tag, Cpu, Lock,
} from 'lucide-react';
import {
  CATEGORY_META,
  SUBSTRATE_META,
  type MarketplaceItem,
  type ListingCategory,
  type SourceSubstrate,
} from '@/agents/merchant/merchant-engine';
import { useMarketplaceInventory } from '@/hooks/useMarketplaceInventory';

type SortOption = 'featured' | 'newest' | 'price-low' | 'price-high' | 'rating' | 'cjpi';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-low', label: 'Price: Low → High' },
  { value: 'price-high', label: 'Price: High → Low' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'cjpi', label: 'CJPI Score' },
];

const TIER_COLORS: Record<string, string> = {
  Mint: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  Prime: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
  Relic: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  Mythic: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  Apex: 'bg-primary/10 text-primary border-primary/30',
};

export default function MarketplaceHome() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ListingCategory | 'all'>('all');
  const [selectedSubstrate, setSelectedSubstrate] = useState<SourceSubstrate | 'all'>('all');
  const [sort, setSort] = useState<SortOption>('featured');
  const [showFilters, setShowFilters] = useState(false);
  const [buyingId, setBuyingId] = useState<string | null>(null);

  const { data: inventory = [], isLoading } = useMarketplaceInventory();

  const stats = useMemo(() => {
    if (inventory.length === 0) return { total: 0, featured: 0, avgPrice: '$0', substrates: 0 };
    const featured = inventory.filter(i => i.isFeatured).length;
    const avgCents = Math.round(inventory.reduce((s, i) => s + i.priceCents, 0) / inventory.length);
    const substrates = new Set(inventory.map(i => i.sourceSubstrate)).size;
    return { total: inventory.length, featured, avgPrice: `$${(avgCents / 100).toFixed(0)}`, substrates };
  }, [inventory]);

  const handleBuy = useCallback(async (item: MarketplaceItem) => {
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
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (err) {
      toast.error('Checkout failed', { description: err instanceof Error ? err.message : 'Please try again' });
    } finally {
      setBuyingId(null);
    }
  }, []);

  const filteredItems = useMemo(() => {
    let items = [...inventory];

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(i =>
        i.title.toLowerCase().includes(q) ||
        i.subtitle.toLowerCase().includes(q) ||
        i.tags.some(t => t.includes(q)) ||
        i.category.includes(q)
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      items = items.filter(i => i.category === selectedCategory);
    }

    // Substrate filter
    if (selectedSubstrate !== 'all') {
      items = items.filter(i => i.sourceSubstrate === selectedSubstrate);
    }

    // Sort
    switch (sort) {
      case 'featured':
        items.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0) || b.cjpiScore - a.cjpiScore);
        break;
      case 'newest':
        items.sort((a, b) => b.addedAt.localeCompare(a.addedAt));
        break;
      case 'price-low':
        items.sort((a, b) => a.priceCents - b.priceCents);
        break;
      case 'price-high':
        items.sort((a, b) => b.priceCents - a.priceCents);
        break;
      case 'rating':
        items.sort((a, b) => b.rating - a.rating);
        break;
      case 'cjpi':
        items.sort((a, b) => b.cjpiScore - a.cjpiScore);
        break;
    }

    return items;
  }, [search, selectedCategory, selectedSubstrate, sort, inventory]);

  const featuredItems = useMemo(() =>
    MERCHANT_INVENTORY.filter(i => i.isFeatured).slice(0, 4),
  []);

  const activeCategories = useMemo(() => {
    const cats = new Set(MERCHANT_INVENTORY.map(i => i.category));
    return Array.from(cats) as ListingCategory[];
  }, []);

  return (
    <>
      <Helmet>
        <title>CMPSBL Marketplace — Premium Software from Every Substrate</title>
        <meta name="description" content="Shop the best cognitive software from across the CMPSBL ecosystem. Enterprise-grade engines, agents, and memory chains — $10 to $50." />
      </Helmet>

      <PublicNav />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/30">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-background to-[hsl(var(--neon-purple))]/5" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.12),transparent_60%)]" />

        <div className="container mx-auto px-4 py-16 md:py-24 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-4xl mx-auto"
          >
            <Badge variant="outline" className="gap-2 px-4 py-2 mb-6 border-primary/40 bg-primary/10">
              <Store className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">CMPSBL Marketplace</span>
            </Badge>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight mb-6">
              <span className="text-foreground">The Best Software</span>
              <br />
              <span className="text-primary">From Every Substrate</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Enterprise-grade engines, agents, and memory chains curated by MERCHANT™ 
              from across the entire CMPSBL ecosystem.{' '}
              <span className="text-foreground font-semibold">$10–$50. Plug and play.</span>
            </p>

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

            {/* Stats */}
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

      {/* Featured Carousel */}
      <section className="py-12 border-b border-border/20">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold">Featured This Week</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredItems.map((item) => (
              <FeaturedCard key={item.id} item={item} onBuy={() => handleBuy(item)} isLoading={buyingId === item.id} />
            ))}
          </div>
        </div>
      </section>

      {/* Main Browse */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar Filters (desktop) */}
            <aside className="hidden lg:block w-64 shrink-0 space-y-6">
              <FilterPanel
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                selectedSubstrate={selectedSubstrate}
                setSelectedSubstrate={setSelectedSubstrate}
                categories={activeCategories}
              />
            </aside>

            {/* Main content */}
            <div className="flex-1">
              {/* Toolbar */}
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <Button
                  variant="outline"
                  size="sm"
                  className="lg:hidden gap-2"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="w-4 h-4" />
                  Filters
                </Button>

                <div className="flex-1" />

                <span className="text-sm text-muted-foreground">
                  {filteredItems.length} {filteredItems.length === 1 ? 'product' : 'products'}
                </span>

                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortOption)}
                  className="text-sm bg-card border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {SORT_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              {/* Mobile Filters */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="lg:hidden mb-6 overflow-hidden"
                  >
                    <FilterPanel
                      selectedCategory={selectedCategory}
                      setSelectedCategory={setSelectedCategory}
                      selectedSubstrate={selectedSubstrate}
                      setSelectedSubstrate={setSelectedSubstrate}
                      categories={activeCategories}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Product Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredItems.map((item) => (
                  <ProductCard key={item.id} item={item} onBuy={() => handleBuy(item)} isLoading={buyingId === item.id} />
                ))}
              </div>

              {filteredItems.length === 0 && (
                <div className="text-center py-20">
                  <Package className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-lg font-medium text-muted-foreground">No products match your filters</p>
                  <Button variant="outline" size="sm" className="mt-4" onClick={() => { setSearch(''); setSelectedCategory('all'); setSelectedSubstrate('all'); }}>
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* MERCHANT Info */}
      <section className="py-16 border-t border-border/20 bg-muted/20">
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
              MERCHANT™ is an autonomous agent that scans all CMPSBL substrates every 8 hours,
              identifying the highest-quality software from S-Tier vaults, A-Tier vaults,
              and Memory Stream discoveries. Only software scoring CJPI 75+ qualifies.
              Pricing is set by the ECONOMY engine for maximum accessibility.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: Eye, label: 'Scans 6 Substrates', desc: 'Every 8 hours' },
                { icon: Shield, label: 'CJPI 75+ Only', desc: 'Quality threshold' },
                { icon: Tag, label: '$10–$50 Range', desc: 'ECONOMY pricing' },
                { icon: Lock, label: 'Sealed Runtime', desc: 'Plug and play' },
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

      <EnhancedFooter />
    </>
  );
}

/* ═══ Sub-components ═══ */

function FeaturedCard({ item, onBuy, isLoading }: { item: MarketplaceItem; onBuy: () => void; isLoading?: boolean }) {
  const meta = CATEGORY_META[item.category];

  return (
    <Card className="group relative overflow-hidden border-2 border-primary/20 hover:border-primary/40 transition-all hover:shadow-xl hover:shadow-primary/5">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-[hsl(var(--neon-purple))] to-[hsl(var(--neon-cyan))]" />
      <CardContent className="p-5 space-y-3">
        <div className="flex items-start justify-between">
          <Badge className={cn('text-[10px]', TIER_COLORS[item.tier])}>
            {item.tier}
          </Badge>
          <Badge variant="outline" className="text-[10px] gap-1">
            <Star className="w-3 h-3 fill-primary text-primary" />
            {item.rating}
          </Badge>
        </div>

        <div>
          <h3 className="font-bold text-sm leading-tight group-hover:text-primary transition-colors">
            {item.title}
          </h3>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.subtitle}</p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[10px] gap-1">
            {meta.emoji} {meta.label}
          </Badge>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border/30">
          <span className="text-xl font-black text-primary">
            ${(item.priceCents / 100).toFixed(0)}
          </span>
          <Button size="sm" className="gap-1.5 text-xs" onClick={onBuy} disabled={isLoading}>
            <ShoppingCart className="w-3.5 h-3.5" />
            {isLoading ? '...' : 'Buy'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ProductCard({ item, onBuy, isLoading }: { item: MarketplaceItem; onBuy: () => void; isLoading?: boolean }) {
  const meta = CATEGORY_META[item.category];
  const substrateMeta = SUBSTRATE_META[item.sourceSubstrate];

  return (
    <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.2 }}>
      <Card className="group h-full overflow-hidden border hover:border-primary/30 transition-all hover:shadow-lg">
        {/* Header strip */}
        <div className="h-24 relative overflow-hidden bg-gradient-to-br from-muted/50 to-muted/20">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-14 h-14 rounded-xl bg-card border border-border/50 flex items-center justify-center shadow-lg">
              <span className="text-2xl">{meta.emoji}</span>
            </div>
          </div>
          {item.isFeatured && (
            <Badge className="absolute top-2 left-2 text-[10px] bg-primary/90 text-primary-foreground gap-1">
              <TrendingUp className="w-3 h-3" />
              Featured
            </Badge>
          )}
          {item.isNew && (
            <Badge className="absolute top-2 right-2 text-[10px] bg-[hsl(var(--neon-green))]/90 text-white gap-1">
              New
            </Badge>
          )}
        </div>

        <CardContent className="p-4 space-y-3">
          {/* Badges row */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <Badge className={cn('text-[10px] h-5 px-1.5', TIER_COLORS[item.tier])}>
              {item.tier} · {item.cjpiScore}
            </Badge>
            <Badge variant="outline" className="text-[10px] h-5 px-1.5">
              {substrateMeta.label}
            </Badge>
          </div>

          {/* Title */}
          <h3 className="font-bold text-sm leading-tight group-hover:text-primary transition-colors line-clamp-2">
            {item.title}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-2">{item.subtitle}</p>

          {/* Pain points */}
          <div className="space-y-1">
            {item.painPoints.slice(0, 2).map((p, i) => (
              <div key={i} className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
                <span className="text-primary mt-0.5">✓</span>
                <span>{p}</span>
              </div>
            ))}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1">
            {item.tags.slice(0, 3).map(tag => (
              <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                {tag}
              </span>
            ))}
          </div>

          {/* Chain */}
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Zap className="w-3 h-3" />
            {item.primitiveChain.join(' → ')}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-border/30">
            <div>
              <span className="text-xl font-black text-primary">
                ${(item.priceCents / 100).toFixed(0)}
              </span>
              <div className="flex items-center gap-1 mt-0.5">
                <Star className="w-3 h-3 text-primary fill-primary" />
                <span className="text-[10px] text-muted-foreground">{item.rating}</span>
                <span className="text-[10px] text-muted-foreground ml-1">· {item.downloads} sold</span>
              </div>
            </div>
            <Button size="sm" className="gap-1.5 text-xs shadow-md" onClick={onBuy} disabled={isLoading}>
              <ShoppingCart className="w-3.5 h-3.5" />
              {isLoading ? '...' : 'Buy'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function FilterPanel({
  selectedCategory,
  setSelectedCategory,
  selectedSubstrate,
  setSelectedSubstrate,
  categories,
}: {
  selectedCategory: ListingCategory | 'all';
  setSelectedCategory: (v: ListingCategory | 'all') => void;
  selectedSubstrate: SourceSubstrate | 'all';
  setSelectedSubstrate: (v: SourceSubstrate | 'all') => void;
  categories: ListingCategory[];
}) {
  return (
    <div className="space-y-6">
      {/* Substrate Filter */}
      <div>
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Globe className="w-4 h-4 text-primary" />
          Substrate
        </h3>
        <div className="space-y-1">
          <FilterButton
            active={selectedSubstrate === 'all'}
            onClick={() => setSelectedSubstrate('all')}
            label="All Substrates"
          />
          {Object.entries(SUBSTRATE_META).map(([key, meta]) => (
            <FilterButton
              key={key}
              active={selectedSubstrate === key}
              onClick={() => setSelectedSubstrate(key as SourceSubstrate)}
              label={meta.label}
              count={MERCHANT_INVENTORY.filter(i => i.sourceSubstrate === key).length}
            />
          ))}
        </div>
      </div>

      {/* Category Filter */}
      <div>
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Package className="w-4 h-4 text-primary" />
          Category
        </h3>
        <div className="space-y-1">
          <FilterButton
            active={selectedCategory === 'all'}
            onClick={() => setSelectedCategory('all')}
            label="All Categories"
          />
          {categories.map(cat => {
            const meta = CATEGORY_META[cat];
            return (
              <FilterButton
                key={cat}
                active={selectedCategory === cat}
                onClick={() => setSelectedCategory(cat)}
                label={`${meta.emoji} ${meta.label}`}
                count={MERCHANT_INVENTORY.filter(i => i.category === cat).length}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

function FilterButton({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between',
        active
          ? 'bg-primary/10 text-primary font-medium'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
      )}
    >
      <span className="truncate">{label}</span>
      {count !== undefined && (
        <span className="text-[10px] tabular-nums text-muted-foreground">{count}</span>
      )}
    </button>
  );
}
