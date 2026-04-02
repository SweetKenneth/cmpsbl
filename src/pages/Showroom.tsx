/**
 * Showroom — Solution-forward marketplace of Memory Stream discoveries.
 * Pulls live data from the discoveries table. No Crown Jewel registry data.
 * Horizontal-scroll carousels grouped by CJPI tier with Stripe checkout.
 */

import { useState, useMemo, useRef, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search, Sparkles, Shield, Zap, Package,
  Brain, Eye, Lock, RefreshCw, Wrench,
  ChevronLeft, ChevronRight, ArrowRight, X,
  ShoppingCart, Loader2, CheckCircle,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { PublicNav } from '@/components/PublicNav';
import { EnhancedFooter } from '@/components/EnhancedFooter';
import { RelatedCapabilities } from '@/components/RelatedCapabilities';
import { PageSEOBlock } from '@/components/seo/PageSEOBlock';
import { PublicBreadcrumb } from '@/components/navigation/PublicBreadcrumb';
import { type PublicTier, getTierBadgeClass } from '@/lib/foundry/public-tiers';
import { fetchShowroomCatalog, getShowroomPriceDisplay, type ShowroomItem, type PainPointId } from '@/lib/showroom/catalog-loader';
import { openCheckoutRedirect } from '@/lib/checkout/checkoutRedirect';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Category images
import imgSecurity from '@/assets/showroom/security-compliance.jpg';
import imgGovernance from '@/assets/showroom/governance-policy.jpg';
import imgIntelligence from '@/assets/showroom/decision-intelligence.jpg';
import imgObservability from '@/assets/showroom/monitoring-visibility.jpg';
import imgResilience from '@/assets/showroom/resilience-recovery.jpg';
import imgOptimization from '@/assets/showroom/performance-optimization.jpg';

// ═══ Category image map ═══
const CATEGORY_IMAGES: Record<string, string> = {
  security: imgSecurity,
  governance: imgGovernance,
  intelligence: imgIntelligence,
  observability: imgObservability,
  resilience: imgResilience,
  optimization: imgOptimization,
};

// Catalog loaded via react-query from Memory Stream
// ═══ Tier config ═══
const TIER_CONFIG = [
  {
    id: 'Apex' as PublicTier,
    label: 'APEX',
    subtitle: 'Perfect score — one of a kind',
    price: '$1,952',
    bg: 'bg-primary/10',
    text: 'text-primary',
    border: 'border-primary/30',
    badgeClass: 'bg-primary/15 text-primary border-primary/25',
    glow: 'hover:shadow-primary/8',
    accent: 'from-primary via-primary to-primary',
  },
  {
    id: 'Mythic' as PublicTier,
    label: 'MYTHIC',
    subtitle: 'Near-perfect cognitive artifacts',
    price: '$188–$198',
    bg: 'bg-purple-500/10',
    text: 'text-purple-400',
    border: 'border-purple-500/30',
    badgeClass: 'bg-purple-500/15 text-purple-400 border-purple-500/25',
    glow: 'hover:shadow-purple-500/8',
    accent: 'from-purple-500 via-purple-400 to-purple-500',
  },
  {
    id: 'Relic' as PublicTier,
    label: 'RELIC',
    subtitle: 'High-complexity discoveries',
    price: '$135–$140',
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    border: 'border-amber-500/30',
    badgeClass: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
    glow: 'hover:shadow-amber-500/8',
    accent: 'from-amber-500 via-amber-400 to-amber-500',
  },
  {
    id: 'Prime' as PublicTier,
    label: 'PRIME',
    subtitle: 'Production-ready capabilities',
    price: '$100–$111',
    bg: 'bg-sky-500/10',
    text: 'text-sky-400',
    border: 'border-sky-500/30',
    badgeClass: 'bg-sky-500/15 text-sky-400 border-sky-500/25',
    glow: 'hover:shadow-sky-500/8',
    accent: 'from-sky-500 via-sky-400 to-sky-500',
  },
  {
    id: 'Mint' as PublicTier,
    label: 'MINT',
    subtitle: 'Entry-level discoveries',
    price: '$68–$79',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    border: 'border-emerald-500/30',
    badgeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
    glow: 'hover:shadow-emerald-500/8',
    accent: 'from-emerald-500 via-emerald-400 to-emerald-500',
  },
] as const;

type TierConfig = typeof TIER_CONFIG[number];

// ═══ Pain-point categories ═══
const PAIN_POINTS = [
  { id: 'all' as const, label: 'All Solutions', icon: Package },
  { id: 'security' as const, label: 'Security', icon: Shield },
  { id: 'intelligence' as const, label: 'Decisions', icon: Brain },
  { id: 'observability' as const, label: 'Monitoring', icon: Eye },
  { id: 'resilience' as const, label: 'Reliability', icon: RefreshCw },
  { id: 'governance' as const, label: 'Governance', icon: Lock },
  { id: 'optimization' as const, label: 'Performance', icon: Zap },
] as const;

function getTierLabel(score: number): PublicTier {
  if (score === 100) return 'Apex';
  if (score >= 94) return 'Mythic';
  if (score >= 90) return 'Relic';
  if (score >= 80) return 'Prime';
  if (score >= 68) return 'Mint';
  return 'Raw';
}

// ═══ Horizontal Scroll Carousel ═══
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
        className="flex gap-4 sm:gap-5 overflow-x-auto snap-x snap-mandatory pb-4 -mx-4 px-4 md:mx-0 md:px-0"
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

// ═══ Discovery Card with image + purchase ═══
function DiscoveryCard({
  item,
  index,
  tierConfig,
  onPurchase,
  purchasing,
}: {
  item: ShowroomItem;
  index: number;
  tierConfig: TierConfig;
  onPurchase: (item: ShowroomItem) => void;
  purchasing: string | null;
}) {
  const tier = getTierLabel(item.score);
  const image = CATEGORY_IMAGES[item.category] || imgOptimization;
  const priceDisplay = getShowroomPriceDisplay(item.score);
  const isLoading = purchasing === item.id;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.04, duration: 0.4 }}
      className="snap-start shrink-0 w-[300px] sm:w-[340px]"
    >
      <div className={cn(
        "group relative h-full rounded-2xl border bg-card overflow-hidden transition-all duration-300 flex flex-col",
        "hover:scale-[1.02] hover:shadow-2xl",
        "border-border/40",
        tierConfig.glow,
      )}>
        {/* Image */}
        <div className="relative h-40 overflow-hidden">
          <img
            src={image}
            alt={item.name}
            loading="lazy"
            width={768}
            height={512}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />

          <Badge
            variant="outline"
            className={cn(
              "absolute top-3 left-3 text-xs font-black tracking-wider border backdrop-blur-sm",
              getTierBadgeClass(tier),
            )}
          >
            {tier}
          </Badge>

          <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-background/80 backdrop-blur-sm border border-border/30">
            <span className="text-sm font-black text-foreground">{priceDisplay}</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 flex flex-col">
          <h3 className="text-base font-bold text-foreground mb-2 leading-tight group-hover:text-primary transition-colors">
            {item.name}
          </h3>

          <p className="text-sm text-muted-foreground/80 leading-relaxed mb-4 line-clamp-3 flex-1">
            {item.solutionDesc}
          </p>

          {/* Footer: category + CJPI */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-muted-foreground/60 px-2 py-0.5 rounded-full border border-border/30 bg-muted/20">
              {item.painLabel}
            </span>
            <div className="flex items-center gap-2 text-xs text-muted-foreground/50">
              <span className="font-mono">CJPI {item.score}</span>
              <span>·</span>
              <span>{item.chain.length} primitives</span>
            </div>
          </div>

          {/* Purchase button */}
          <Button
            size="sm"
            className="w-full gap-2 rounded-xl font-bold"
            onClick={() => onPurchase(item)}
            disabled={isLoading || purchasing !== null}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Opening checkout…
              </>
            ) : (
              <>
                <ShoppingCart className="w-3.5 h-3.5" />
                Purchase · {priceDisplay}
              </>
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

// ═══ Main page ═══
export default function Showroom() {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTier, setSelectedTier] = useState<PublicTier | null>(null);
  const [painFilter, setPainFilter] = useState<PainPointId | 'all'>('all');
  const [purchasing, setPurchasing] = useState<string | null>(null);

  const showSuccess = searchParams.get('success') === 'true';
  const successItem = searchParams.get('item');

  // Fetch live catalog from Memory Stream
  const { data: catalog = [], isLoading: catalogLoading } = useQuery<ShowroomItem[]>({
    queryKey: ['showroom-catalog'],
    queryFn: () => fetchShowroomCatalog(50),
    staleTime: 1000 * 60 * 5,
  });

  // Group by tier
  const itemsByTier = useMemo(() => {
    const grouped: Record<string, ShowroomItem[]> = {};
    catalog.forEach((item) => {
      const tier = getTierLabel(item.score);
      if (!grouped[tier]) grouped[tier] = [];
      grouped[tier].push(item);
    });
    return grouped;
  }, [catalog]);

  // Filter for search/tier/pain
  const filteredItems = useMemo(() => catalog.filter((item) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.solutionDesc.toLowerCase().includes(q) ||
        item.painLabel.toLowerCase().includes(q)
      );
    }
    if (selectedTier) return getTierLabel(item.score) === selectedTier;
    if (painFilter !== 'all') return item.painId === painFilter;
    return true;
  }), [catalog, searchQuery, selectedTier, painFilter]);

  const showBrowseMode = !searchQuery && !selectedTier && painFilter === 'all';

  const handlePurchase = useCallback(async (item: ShowroomItem) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('Please sign in to purchase.', {
        action: { label: 'Sign In', onClick: () => { window.location.href = '/auth'; } },
      });
      return;
    }

    setPurchasing(item.id);
    try {
      openCheckoutRedirect({
        fn: 'showroom-checkout',
        body: {
          item_id: item.id,
          item_name: item.name,
          cjpi_score: item.score,
        },
      });
      toast.success('Opening secure checkout…');
    } catch {
      toast.error('Failed to open checkout. Please try again.');
    } finally {
      setPurchasing(null);
    }
  }, []);

  return (
    <>
      <Helmet>
        <title>Showroom — Browse Certified Software Discoveries | CMPSBL</title>
        <meta name="description" content="Find exactly what your software needs. Search by problem, sort by solution, and purchase one-of-a-kind certified discoveries from the CMPSBL Showroom." />
        <link rel="canonical" href="https://cmpsbl.com/showroom" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <PublicNav />

        <div className="container mx-auto px-3 sm:px-4 pt-20">
          <PublicBreadcrumb />
        </div>

        {/* ═══ SUCCESS BANNER ═══ */}
        {showSuccess && (
          <div className="container mx-auto px-3 sm:px-4 pt-4">
            <Alert className="border-emerald-500/30 bg-emerald-500/5">
              <CheckCircle className="h-5 w-5 text-emerald-500" />
              <AlertTitle className="text-emerald-400">Purchase Successful!</AlertTitle>
              <AlertDescription className="text-muted-foreground">
                Your discovery{successItem ? ` (${successItem})` : ''} has been certified and retired from the catalog. Check your email for delivery details.
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* ═══ HERO ═══ */}
        <section className="relative pt-8 sm:pt-10 pb-12 sm:pb-16 px-3 sm:px-4 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
          <div className="relative container mx-auto max-w-5xl text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 mb-5">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-xs font-mono tracking-wider text-primary">THE SHOWROOM</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mb-3 sm:mb-4">
                Find What Your Software <span className="text-primary">Needs</span>
              </h1>

              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-4 leading-relaxed">
                Every discovery is a one-of-a-kind certified capability scored by CJPI.
                Once purchased, it's retired from the catalog forever.
              </p>

              <div className="flex items-center justify-center gap-4 mb-4 text-sm text-muted-foreground">
                <span className="font-mono">{catalog.length} discoveries</span>
                <span className="text-border">·</span>
                <span>{TIER_CONFIG.filter(t => itemsByTier[t.id]?.length).length} tiers</span>
                <span className="text-border">·</span>
                <span>Catalog rotates every 8 hours</span>
              </div>

              <Button asChild variant="outline" size="sm" className="rounded-xl font-semibold gap-2">
                <Link to="/ascension">
                  <Wrench className="w-3.5 h-3.5" />
                  Or bring your own code
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </Button>
            </motion.div>
          </div>
        </section>

        {/* ═══ STICKY TOOLBAR ═══ */}
        <section className="sticky top-16 z-40 border-b border-border/50 bg-background/95 backdrop-blur-xl">
          <div className="container mx-auto px-4 py-3">
            <div className="relative mb-3">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={`Search ${CATALOG.length} discoveries...`}
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setSelectedTier(null); setPainFilter('all'); }}
                className="pl-10 h-12 text-base rounded-xl bg-card border-border"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-muted" aria-label="Clear search">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              )}
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
              <button
                onClick={() => { setSelectedTier(null); setPainFilter('all'); }}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-all shrink-0",
                  !selectedTier && painFilter === 'all'
                    ? "bg-foreground text-background border-foreground"
                    : "border-border text-muted-foreground hover:border-foreground/30"
                )}
              >
                All
              </button>
              {TIER_CONFIG.map((tier) => {
                const count = itemsByTier[tier.id]?.length || 0;
                if (!count) return null;
                return (
                  <button
                    key={tier.id}
                    onClick={() => { setSelectedTier(selectedTier === tier.id ? null : tier.id); setPainFilter('all'); setSearchQuery(''); }}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-all shrink-0 flex items-center gap-1.5",
                      selectedTier === tier.id
                        ? cn(tier.bg, tier.text, tier.border)
                        : "border-border text-muted-foreground hover:border-foreground/30"
                    )}
                  >
                    {tier.label}
                    <span className="opacity-70">{count}</span>
                  </button>
                );
              })}

              <div className="w-px h-6 bg-border/50 shrink-0 self-center mx-1" />

              {PAIN_POINTS.filter(p => p.id !== 'all').map((pp) => (
                <button
                  key={pp.id}
                  onClick={() => { setPainFilter(painFilter === pp.id ? 'all' : pp.id); setSelectedTier(null); setSearchQuery(''); }}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-all shrink-0 flex items-center gap-1.5",
                    painFilter === pp.id
                      ? "bg-primary/10 text-primary border-primary/30"
                      : "border-border text-muted-foreground hover:border-foreground/30"
                  )}
                >
                  <pp.icon className="w-3 h-3" />
                  {pp.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ CONTENT ═══ */}
        <main className="flex-1">
          <div className="container mx-auto px-4 pt-6 pb-2">
            <p className="text-sm text-muted-foreground">
              {filteredItems.length} {filteredItems.length === 1 ? 'discovery' : 'discoveries'}
              {searchQuery && <> matching "<span className="text-foreground font-medium">{searchQuery}</span>"</>}
            </p>
          </div>

          {showBrowseMode ? (
            <div className="pb-12">
              {TIER_CONFIG.filter(tier => itemsByTier[tier.id]?.length).map(tier => {
                const items = itemsByTier[tier.id] || [];
                return (
                  <section key={tier.id} className="mb-10">
                    <div className="container mx-auto px-4 mb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", tier.bg)}>
                            <Sparkles className={cn("w-4 h-4", tier.text)} />
                          </div>
                          <div>
                            <h2 className="font-bold text-lg">{tier.label}</h2>
                            <p className="text-xs text-muted-foreground">
                              {items.length} {items.length === 1 ? 'discovery' : 'discoveries'} · {tier.price}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => setSelectedTier(tier.id)}
                          className="text-xs text-primary font-medium flex items-center gap-1 hover:underline"
                        >
                          View all <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <div className="container mx-auto px-4">
                      <ScrollCarousel>
                        {items.map((item, i) => (
                          <DiscoveryCard
                            key={item.id}
                            item={item}
                            index={i}
                            tierConfig={tier}
                            onPurchase={handlePurchase}
                            purchasing={purchasing}
                          />
                        ))}
                      </ScrollCarousel>
                    </div>
                  </section>
                );
              })}
            </div>
          ) : (
            <div className="container mx-auto px-4 py-6">
              {filteredItems.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredItems.map((item, i) => {
                    const tier = getTierLabel(item.score);
                    const tierConfig = TIER_CONFIG.find(t => t.id === tier) || TIER_CONFIG[4];
                    return (
                      <DiscoveryCard
                        key={item.id}
                        item={item}
                        index={i}
                        tierConfig={tierConfig}
                        onPurchase={handlePurchase}
                        purchasing={purchasing}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-20">
                  <Package className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No discoveries found</h3>
                  <p className="text-sm text-muted-foreground mb-4">Try adjusting your filters</p>
                  <Button variant="ghost" onClick={() => { setSearchQuery(''); setSelectedTier(null); setPainFilter('all'); }}>
                    Clear all filters
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* ═══ PRICING GUIDE ═══ */}
          <section className="border-t border-border/50 bg-card/30">
            <div className="container mx-auto px-3 sm:px-4 py-12 sm:py-16 text-center">
              <div className="inline-flex flex-col items-center gap-3 p-5 sm:p-8 rounded-2xl border border-border/40 bg-card/50">
                <h2 className="text-xl font-black tracking-tight mb-1">How Pricing Works</h2>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-lg">
                  Every discovery is scored by CJPI. Higher scores mean more complex, more capable software.
                  One purchase — it's yours forever, retired from the catalog.
                </p>
                <div className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground">
                  {TIER_CONFIG.map((tier) => (
                    <div key={tier.id} className="flex items-center gap-2">
                      <div className={cn("w-6 h-[3px] rounded bg-gradient-to-r", tier.accent)} />
                      <span>{tier.label} · {tier.price}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3 mt-2">
                  <Button asChild size="sm" className="gap-1 rounded-xl font-bold">
                    <Link to="/ascension">
                      <Wrench className="w-3.5 h-3.5" />
                      Run Diagnostic
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </section>
        </main>

        <RelatedCapabilities />
        <PageSEOBlock path="/showroom" title="Showroom — Certified Discoveries" faq={[
          { question: "What are CMPSBL discoveries?", answer: "Discoveries are one-of-a-kind certified software capabilities found by the Memory Stream. Each is scored by CJPI (Crown Jewel Performance Index) and priced by tier." },
          { question: "How does showroom pricing work?", answer: "Discoveries are priced by CJPI score: Mint ($68–$79), Prime ($100–$111), Relic ($135–$140), Mythic ($188–$198), and Apex ($1,952 fixed). Once purchased, the discovery is permanently retired." },
          { question: "How often does the catalog rotate?", answer: "The Memory Stream runs autonomously every 8 hours, discovering and scoring new capabilities. The catalog is always evolving." },
        ]} />
        <EnhancedFooter />
      </div>
    </>
  );
}
