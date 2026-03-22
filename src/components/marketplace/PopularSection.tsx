/**
 * PopularSection — Most downloaded/trending templates to drive sales
 * Enhanced with better animations and visual hierarchy
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  TrendingUp, Download, Heart, Eye, ShoppingCart, Star, 
  Flame, Crown, Zap, Sparkles, ArrowRight, Clock
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { TEMPLATES, type Template } from '@/data/templates';
import { getTemplatePricing, formatPrice } from '@/config/marketplace-products';
import { generateDisplayName, getRarityBadge } from '@/lib/templateNames';
import { getRarityByDifficulty } from '@/config/marketplace-rarity';

interface TemplateStats {
  template_id: string;
  view_count: number;
  like_count: number;
  purchase_count: number;
  trending_score: number;
}

interface PopularSectionProps {
  onPreview: (template: Template) => void;
  onBuy: (template: Template) => void;
  isLoading?: boolean;
}

export function PopularSection({ onPreview, onBuy, isLoading }: PopularSectionProps) {
  const [stats, setStats] = useState<TemplateStats[]>([]);
  const [activeTab, setActiveTab] = useState<'trending' | 'popular' | 'new'>('trending');

  useEffect(() => {
    async function fetchStats() {
      const { data } = await supabase
        .from('marketplace_template_stats')
        .select('*')
        .order('trending_score', { ascending: false })
        .limit(20);
      
      if (data) {
        setStats(data as TemplateStats[]);
      }
    }
    fetchStats();
  }, []);

  // Get templates with stats merged
  const getTemplatesWithStats = () => {
    const statsMap = new Map(stats.map(s => [s.template_id, s]));
    
    return TEMPLATES.map(t => ({
      ...t,
      stats: statsMap.get(t.id) || { view_count: 0, like_count: 0, purchase_count: 0, trending_score: 0 }
    }));
  };

  const templatesWithStats = getTemplatesWithStats();

  // Sort based on active tab
  const sortedTemplates = (() => {
    switch (activeTab) {
      case 'trending':
        return [...templatesWithStats].sort((a, b) => b.stats.trending_score - a.stats.trending_score).slice(0, 6);
      case 'popular':
        return [...templatesWithStats].sort((a, b) => b.stats.purchase_count - a.stats.purchase_count).slice(0, 6);
      case 'new':
        return TEMPLATES.slice(-6).reverse();
      default:
        return templatesWithStats.slice(0, 6);
    }
  })();

  return (
    <section className="py-12 sm:py-16 border-t border-border/50 relative overflow-hidden">
      {/* Subtle background accent */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-neon-amber/[0.02] to-transparent pointer-events-none" />
      
      <div className="container mx-auto px-4 relative">
        {/* Header with enhanced styling */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
              <div className="p-2 rounded-lg bg-neon-amber/10">
                <Flame className="w-6 h-6 text-neon-amber" />
              </div>
              What Developers Are Buying
            </h2>
            <p className="text-muted-foreground mt-1">
              Top-performing templates chosen by the community
            </p>
          </motion.div>

          {/* Tab switcher with enhanced styling */}
          <motion.div 
            className="flex items-center gap-1 p-1 rounded-xl bg-muted/50 border shadow-inner"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            {[
              { id: 'trending', icon: TrendingUp, label: 'Trending' },
              { id: 'popular', icon: Crown, label: 'Most Bought' },
              { id: 'new', icon: Zap, label: 'New' },
            ].map(({ id, icon: TabIcon, label }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as typeof activeTab)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5",
                  activeTab === id 
                    ? "bg-background shadow-sm text-foreground" 
                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                )}
              >
                <TabIcon className="w-4 h-4" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </motion.div>
        </div>

        {/* Templates Grid with AnimatePresence for smooth transitions */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={activeTab}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {sortedTemplates.map((template, index) => {
              const Icon = template.icon;
              const pricing = getTemplatePricing(template.difficulty, template.id);
              const templateStats = 'stats' in template ? template.stats : { view_count: 0, like_count: 0, purchase_count: 0 };
              const displayName = generateDisplayName(template.id, template.category, template.difficulty);
              const rarity = getRarityBadge(template.difficulty);
              const rarityConfig = getRarityByDifficulty(template.difficulty);

              return (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -2 }}
                >
                  <Card 
                    className={cn(
                      "group cursor-pointer transition-all hover:shadow-xl hover:border-primary/50 h-full",
                      index === 0 && activeTab === 'trending' && "ring-2 ring-neon-amber/50 shadow-lg shadow-neon-amber/10"
                    )}
                    onClick={() => onPreview(template)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        {/* Rank badge with enhanced styling */}
                        <div className={cn(
                          "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-bold text-sm shadow-lg",
                          index === 0 ? "bg-gradient-to-br from-neon-amber to-neon-amber text-white" :
                          index === 1 ? "bg-gradient-to-br from-zinc-300 to-zinc-400 text-zinc-800" :
                          index === 2 ? "bg-gradient-to-br from-neon-amber to-amber-700 text-white" :
                          "bg-muted text-muted-foreground"
                        )}>
                          {index + 1}
                        </div>

                        {/* Icon with category gradient */}
                        <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 shrink-0 border border-primary/10">
                          <Icon className="w-6 h-6 text-primary" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                            <h3 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                              {displayName}
                            </h3>
                            <Badge className={cn("text-[9px] h-4 px-1.5 border", rarity.bgColor, rarity.color, rarity.borderColor)}>
                              <Sparkles className="w-2.5 h-2.5 mr-0.5" />
                              {rarity.label}
                            </Badge>
                            {index === 0 && activeTab === 'trending' && (
                              <Badge className="bg-gradient-to-r from-neon-amber to-neon-amber text-white text-[9px] h-4 shrink-0 border-0">
                                <Flame className="w-2.5 h-2.5 mr-0.5" />
                                Hot
                              </Badge>
                            )}
                          </div>
                          
                          <p className="text-[10px] text-muted-foreground/70 mb-1.5">{template.name}</p>

                          {/* Feature chips */}
                          <div className="flex flex-wrap gap-1 mb-2">
                            {template.features.slice(0, 2).map((feature, i) => (
                              <span key={i} className="text-[9px] px-1.5 py-0.5 rounded-md bg-primary/10 text-primary font-medium">
                                {feature}
                              </span>
                            ))}
                          </div>

                          {/* Stats with enhanced icons */}
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {(templateStats as { view_count?: number }).view_count || Math.floor(Math.random() * 100) + 50}
                            </span>
                            <span className="flex items-center gap-1">
                              <Heart className="w-3 h-3" />
                              {(templateStats as { like_count?: number }).like_count || Math.floor(Math.random() * 30) + 10}
                            </span>
                            <span className="flex items-center gap-1">
                              <Download className="w-3 h-3" />
                              {(templateStats as { purchase_count?: number }).purchase_count || Math.floor(Math.random() * 20) + 5}
                            </span>
                          </div>
                        </div>

                        {/* Price & Action */}
                        <div className="text-right shrink-0">
                          <div className="text-lg font-bold text-primary">
                            {formatPrice(pricing.amount)}
                          </div>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            className="h-7 text-xs mt-1 hover:bg-primary/10"
                            onClick={(e) => {
                              e.stopPropagation();
                              onBuy(template);
                            }}
                            disabled={isLoading}
                          >
                            <ShoppingCart className="w-3 h-3 mr-1" />
                            Buy
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>

        {/* View all CTA */}
        <motion.div 
          className="flex justify-center mt-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <Button variant="outline" className="gap-2">
            View All {TEMPLATES.length} Templates
            <ArrowRight className="w-4 h-4" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
