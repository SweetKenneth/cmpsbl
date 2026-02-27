/**
 * Templates — Free public template showcase
 * Horizontal scroll by category, all templates free, template generator CTA at $19
 */

import { useState, useRef, useCallback } from 'react';
import { SEO } from '@/components/SEO';
import { PublicNav } from '@/components/PublicNav';
import { EnhancedFooter } from '@/components/EnhancedFooter';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  ChevronLeft, ChevronRight, Sparkles, ArrowRight,
  Star, Flame, Package, Wand2, Gift, Zap,
} from 'lucide-react';
import {
  SHOWCASE_TEMPLATES,
  TEMPLATE_CATEGORIES,
  type ShowcaseTemplate,
  type TemplateRarity,
} from '@/data/templates-showcase';
import { motion } from 'framer-motion';

/* ─── Rarity badge ─── */
function RarityBadge({ rarity }: { rarity: TemplateRarity }) {
  if (rarity === 'mythic') {
    return (
      <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 text-[10px] font-bold uppercase tracking-wider">
        <Flame className="w-3 h-3 mr-1" />
        Mythic
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="text-[10px] font-mono uppercase tracking-wider border-emerald-500/30 text-emerald-400">
      <Star className="w-3 h-3 mr-1" />
      Great
    </Badge>
  );
}

/* ─── Template Card ─── */
function TemplateCard({ template }: { template: ShowcaseTemplate }) {
  const Icon = template.icon;

  return (
    <Card className="group relative overflow-hidden border-border/40 hover:border-primary/30 transition-all duration-300 h-full bg-card/50 backdrop-blur-sm">
      {template.rarity === 'mythic' && (
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5 pointer-events-none" />
      )}
      <CardContent className="p-5 flex flex-col h-full">
        <div className="flex items-start justify-between mb-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          <RarityBadge rarity={template.rarity} />
        </div>

        <h3 className="font-bold text-sm mb-1.5 group-hover:text-primary transition-colors">
          {template.name}
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed mb-3 flex-1">
          {template.description}
        </p>

        {/* Crown Jewel Feature */}
        <div className="rounded-lg bg-muted/50 border border-border/30 px-3 py-2 mb-3">
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mb-0.5 uppercase tracking-wider font-medium">
            <Sparkles className="w-3 h-3 text-amber-500" />
            Crown Jewel Feature
          </div>
          <div className="text-xs font-medium text-foreground">
            {template.crownJewelFeature}
          </div>
        </div>

        {/* Tags + Build time */}
        <div className="flex items-center justify-between">
          <div className="flex gap-1 flex-wrap">
            {template.tags.slice(0, 3).map(tag => (
              <Badge key={tag} variant="secondary" className="text-[9px] px-1.5 py-0 font-mono">
                {tag}
              </Badge>
            ))}
          </div>
          <span className="text-[10px] text-muted-foreground">{template.buildTime}</span>
        </div>
      </CardContent>
    </Card>
  );
}

/* ─── Category Row (Horizontal Scroll) ─── */
function CategoryRow({
  category,
  templates,
}: {
  category: typeof TEMPLATE_CATEGORIES[number];
  templates: ShowcaseTemplate[];
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const CatIcon = category.icon;

  const scroll = useCallback((direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -340 : 340,
      behavior: 'smooth',
    });
  }, []);

  const mythicCount = templates.filter(t => t.rarity === 'mythic').length;

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5 }}
      className="relative"
    >
      {/* Category Header */}
      <div className="container mx-auto px-4 mb-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", category.bg)}>
              <CatIcon className={cn("w-5 h-5", category.text)} />
            </div>
            <div>
              <h3 className="text-lg font-bold tracking-tight">{category.name}</h3>
              <p className="text-xs text-muted-foreground">
                {templates.length} templates
                {mythicCount > 0 && (
                  <span className="ml-1.5 text-amber-500">· {mythicCount} mythic</span>
                )}
              </p>
            </div>
          </div>

          {/* Scroll arrows */}
          <div className="hidden sm:flex items-center gap-1.5">
            <button
              onClick={() => scroll('left')}
              className="w-8 h-8 rounded-lg border border-border/50 flex items-center justify-center hover:bg-muted transition-colors"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4 text-muted-foreground" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="w-8 h-8 rounded-lg border border-border/50 flex items-center justify-center hover:bg-muted transition-colors"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Scroll Track */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4 px-4 lg:px-[max(1rem,calc((100vw-80rem)/2+1rem))] no-scrollbar"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {templates.map((template) => (
          <div
            key={template.id}
            className="min-w-[280px] max-w-[320px] snap-start shrink-0"
          >
            <TemplateCard template={template} />
          </div>
        ))}
        <div className="shrink-0 w-4 lg:w-1" aria-hidden />
      </div>
    </motion.section>
  );
}

export default function Templates() {
  const [generatorLoading, setGeneratorLoading] = useState(false);

  const handleGeneratorCheckout = async () => {
    try {
      setGeneratorLoading(true);
      toast.info('Opening checkout...');

      const { data, error } = await supabase.functions.invoke('marketplace-checkout', {
        body: {
          product_type: 'template_generator',
          price_id: 'price_1SyZufQ7FtTiAL4aN8eIsVXE',
          product_id: 'prod_TwSqj6y5PfMkPy',
        },
      });

      if (error) throw error;
      if (data?.url) {
        window.location.assign(data.url);
      }
    } catch (err) {
      toast.error('Checkout failed. Please try again.');
    } finally {
      setGeneratorLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Free Templates — Build on the CMPSBL Substrate"
        description="30 free templates, each powered by a Crown Jewel capability. From chatbots to threat detection — start building in minutes."
      />
      <PublicNav />

      {/* ═══ HERO ═══ */}
      <section className="relative overflow-hidden border-b border-border/30">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
        <div className="container mx-auto px-4 pt-28 pb-16 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 mb-6">
              <Gift className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-medium text-emerald-400">Every template is free</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight mb-4">
              Start Building{' '}
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Now
              </span>
            </h1>

            <p className="text-lg text-muted-foreground mb-6 max-w-xl mx-auto leading-relaxed">
              30 production-ready templates. Each one powered by a Crown Jewel capability
              from the substrate. No paywall. No trial. Just build.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
              <Badge variant="outline" className="px-3 py-1.5 text-xs border-amber-500/30 text-amber-400">
                <Flame className="w-3 h-3 mr-1.5" />
                8 Mythic Drops
              </Badge>
              <Badge variant="outline" className="px-3 py-1.5 text-xs">
                <Package className="w-3 h-3 mr-1.5" />
                6 Categories
              </Badge>
              <Badge variant="outline" className="px-3 py-1.5 text-xs">
                <Sparkles className="w-3 h-3 mr-1.5" />
                Crown Jewel in Every Template
              </Badge>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ TEMPLATE GENERATOR CTA ═══ */}
      <section className="border-b border-border/30 bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center gap-6 sm:gap-8"
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0">
              <Wand2 className="w-7 h-7 text-primary" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-lg font-bold mb-1">Template Generator</h2>
              <p className="text-sm text-muted-foreground">
                Want something custom? Describe what you need in plain English and get a
                production-ready template with Crown Jewel capabilities baked in.
              </p>
            </div>
            <Button
              onClick={handleGeneratorCheckout}
              disabled={generatorLoading}
              className="shrink-0 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            >
              {generatorLoading ? 'Loading...' : '$19 · One-Time'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* ═══ CATEGORY NAV ═══ */}
      <section className="border-b border-border/30 sticky top-16 z-30 bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto py-3 no-scrollbar" style={{ scrollbarWidth: 'none' }}>
            {TEMPLATE_CATEGORIES.map((cat) => {
              const CIcon = cat.icon;
              const count = SHOWCASE_TEMPLATES.filter(t => t.category === cat.id).length;
              return (
                <a
                  key={cat.id}
                  href={`#cat-${cat.id}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
                >
                  <CIcon className="w-3.5 h-3.5" />
                  {cat.name}
                  <span className="text-[10px] opacity-50">({count})</span>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ TEMPLATE ROWS ═══ */}
      <div className="py-12 space-y-12">
        {TEMPLATE_CATEGORIES.map((cat) => {
          const templates = SHOWCASE_TEMPLATES.filter(t => t.category === cat.id);
          if (templates.length === 0) return null;
          return (
            <div key={cat.id} id={`cat-${cat.id}`}>
              <CategoryRow category={cat} templates={templates} />
            </div>
          );
        })}
      </div>

      {/* ═══ BOTTOM CTA ═══ */}
      <section className="border-t border-border/30 bg-muted/20">
        <div className="container mx-auto px-4 py-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl font-bold mb-3">
              Need Something Specific?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              The Template Generator creates custom templates from natural language.
              Describe your idea — get production code with Crown Jewel capabilities.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button
                onClick={handleGeneratorCheckout}
                disabled={generatorLoading}
                size="lg"
                className="bg-gradient-to-r from-primary to-primary/80"
              >
                <Wand2 className="w-4 h-4 mr-2" />
                Template Generator · $19
              </Button>
              <Button variant="outline" size="lg" asChild>
                <a href="/codelab">
                  <Zap className="w-4 h-4 mr-2" />
                  Open CodeLab
                </a>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <EnhancedFooter />
    </div>
  );
}
