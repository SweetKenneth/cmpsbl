/**
 * TemplatePreviewModal — Immersive full preview with protected code
 * Mobile-optimized, high-conversion design with proper close controls
 * Enhanced with better visual hierarchy and funnel surfaces
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import {
  Code, ShoppingCart, CreditCard, Eye, Sparkles, Zap, Clock, Star, 
  Lock, Shield, Brain, Moon, MessageSquare, Settings, Server, Check,
  ArrowRight, Award, Download, X, ArrowLeft, Gift, TrendingUp
} from 'lucide-react';
import type { Template } from '@/data/templates';
import { getTemplatePricing, formatPrice } from '@/config/marketplace-products';
import { BlurredCodePreview } from './BlurredCodePreview';
import { useMarketplaceUser } from '@/hooks/useMarketplaceUser';
import { generateDisplayName, getRarityBadge } from '@/lib/templateNames';
import { getRarityByDifficulty } from '@/config/marketplace-rarity';
import { TEMPLATE_STACKS } from '@/config/marketplace-bundles';

const categoryIcons: Record<string, React.ElementType> = {
  brain: Brain,
  decode: MessageSquare,
  defense: Shield,
  nexus: Zap,
  vision: Eye,
  dream: Moon,
  system: Settings,
  world_engine: Server,
};

interface TemplatePreviewModalProps {
  template: Template | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBuy: (template: Template) => void;
  isLoading?: boolean;
}

export function TemplatePreviewModal({ 
  template, 
  open, 
  onOpenChange, 
  onBuy, 
  isLoading 
}: TemplatePreviewModalProps) {
  const [activeTab, setActiveTab] = useState('preview');
  const { hasPurchased } = useMarketplaceUser();

  if (!template) return null;

  const Icon = template.icon;
  const CategoryIcon = categoryIcons[template.category] || Zap;
  const pricing = getTemplatePricing(template.difficulty, template.id);
  const isPurchased = hasPurchased(template.id);
  const displayName = generateDisplayName(template.id, template.category, template.difficulty);
  const rarity = getRarityBadge(template.difficulty);
  const rarityConfig = getRarityByDifficulty(template.difficulty);

  // Find related stacks that include this template
  const relatedStacks = TEMPLATE_STACKS.filter(stack => 
    stack.templateIds.includes(template.id)
  ).slice(0, 2);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[85vh] sm:h-auto sm:max-h-[85vh] overflow-hidden p-0 flex flex-col">
        {/* Mobile Header with Close Button */}
        <div className="flex items-center justify-between p-3 border-b bg-muted/30 shrink-0 lg:hidden">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onOpenChange(false)}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Marketplace
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="h-8 w-8"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Desktop Close Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 z-50 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm border shadow-sm hidden lg:flex hover:bg-background"
        >
          <X className="w-4 h-4" />
        </Button>

        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
          {/* Left: Preview Content */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            <DialogHeader className="px-4 sm:px-6 pt-3 sm:pt-6 pb-3 sm:pb-4 border-b shrink-0">
              <div className="flex items-start gap-3 sm:gap-4">
                <motion.div 
                  className="p-2.5 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30 shrink-0"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <Icon className="w-5 h-5 sm:w-8 sm:h-8 text-primary" />
                </motion.div>
                <div className="flex-1 min-w-0">
                  <DialogTitle className="text-base sm:text-xl font-bold mb-0.5 sm:mb-1">
                    {displayName}
                  </DialogTitle>
                  <p className="text-xs text-muted-foreground/70 mb-1.5 sm:mb-2">{template.name}</p>
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    <Badge className={cn("text-[10px] gap-1 border", rarity.bgColor, rarity.color, rarity.borderColor)}>
                      <Sparkles className="w-3 h-3" />
                      {rarity.label}
                    </Badge>
                    <Badge variant="outline" className="gap-1 text-xs">
                      <CategoryIcon className="w-3 h-3" />
                      {template.category}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3.5 h-3.5" />
                      {template.estimatedTime}
                    </div>
                  </div>
                </div>
              </div>
            </DialogHeader>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
              <div className="px-4 sm:px-6 pt-4 shrink-0">
                <TabsList className="grid grid-cols-3 w-full max-w-md">
                  <TabsTrigger value="preview" className="gap-1.5 text-xs sm:text-sm">
                    <Eye className="w-4 h-4" />
                    <span className="hidden sm:inline">Preview</span>
                  </TabsTrigger>
                  <TabsTrigger value="code" className="gap-1.5 text-xs sm:text-sm">
                    <Code className="w-4 h-4" />
                    <span className="hidden sm:inline">Code</span>
                  </TabsTrigger>
                  <TabsTrigger value="features" className="gap-1.5 text-xs sm:text-sm">
                    <Sparkles className="w-4 h-4" />
                    <span className="hidden sm:inline">Features</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              <ScrollArea className="flex-1 px-4 sm:px-6 py-4">
                <AnimatePresence mode="wait">
                  <TabsContent value="preview" className="mt-0 space-y-4">
                    {/* Visual Preview with rarity image */}
                    <motion.div 
                      className="aspect-video rounded-xl bg-gradient-to-br from-primary/15 via-primary/5 to-muted/50 border-2 border-primary/20 flex items-center justify-center overflow-hidden relative"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {/* Rarity background */}
                      <img 
                        src={rarityConfig.image} 
                        alt={rarity.label}
                        className="absolute inset-0 w-full h-full object-cover opacity-20"
                      />
                      <div className="text-center space-y-4 p-6 relative z-10">
                        <motion.div 
                          className="w-20 h-20 sm:w-28 sm:h-28 mx-auto rounded-2xl bg-card border-2 shadow-2xl flex items-center justify-center"
                          whileHover={{ scale: 1.05, rotate: 2 }}
                        >
                          <Icon className="w-10 h-10 sm:w-14 sm:h-14 text-primary" />
                        </motion.div>
                        <div className="space-y-1">
                          <p className="text-lg font-semibold">{displayName}</p>
                          <p className="text-xs text-muted-foreground/70">{template.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Production-ready cognitive template
                          </p>
                        </div>
                      </div>
                    </motion.div>

                    {/* Description */}
                    <div className="p-4 rounded-xl bg-muted/50 border">
                      <h4 className="font-semibold mb-2">About this template</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {template.description}
                      </p>
                    </div>

                    {/* Core Capabilities with icons */}
                    <div className="grid grid-cols-2 gap-3">
                      <motion.div 
                        className="p-4 rounded-xl bg-neon-purple/5 border border-neon-purple/20"
                        whileHover={{ scale: 1.02 }}
                      >
                        <Brain className="w-6 h-6 text-neon-purple mb-2" />
                        <h4 className="font-medium text-sm mb-1">Memory Enabled</h4>
                        <p className="text-xs text-muted-foreground">
                          Persists state across sessions
                        </p>
                      </motion.div>
                      <motion.div 
                        className="p-4 rounded-xl bg-neon-magenta/5 border border-neon-magenta/20"
                        whileHover={{ scale: 1.02 }}
                      >
                        <Shield className="w-6 h-6 text-neon-magenta mb-2" />
                        <h4 className="font-medium text-sm mb-1">Drift Protected</h4>
                        <p className="text-xs text-muted-foreground">
                          Self-correcting behavior
                        </p>
                      </motion.div>
                    </div>

                    {/* Related Stacks Cross-sell */}
                    {relatedStacks.length > 0 && (
                      <div className="p-4 rounded-xl bg-gradient-to-r from-neon-green/5 to-neon-cyan/5 border border-neon-green/20">
                        <div className="flex items-center gap-2 mb-3">
                          <Gift className="w-5 h-5 text-neon-green" />
                          <h4 className="font-semibold text-sm">Save with a Stack</h4>
                          <Badge className="bg-neon-green/10 text-neon-green border-neon-green/30 text-[10px]">
                            Up to 30% off
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-3">
                          This template is part of curated stacks that help you ship faster:
                        </p>
                        <div className="space-y-2">
                          {relatedStacks.map(stack => (
                            <div key={stack.id} className="flex items-center justify-between p-2 rounded-lg bg-background/50 border">
                              <div>
                                <p className="text-sm font-medium">{stack.name}</p>
                                <p className="text-[10px] text-muted-foreground">{stack.templateIds.length} templates</p>
                              </div>
                              <Badge variant="outline" className="text-neon-green border-neon-green/30">
                                -{Math.round(stack.discount * 100)}%
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="code" className="mt-0">
                    <BlurredCodePreview
                      code={template.code}
                      isPurchased={isPurchased}
                      onBuy={() => onBuy(template)}
                      isLoading={isLoading}
                    />
                  </TabsContent>

                  <TabsContent value="features" className="mt-0 space-y-4">
                    <div className="grid gap-3">
                      {template.features.map((feature, i) => (
                        <motion.div 
                          key={i} 
                          className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                        >
                          <div className="p-1.5 rounded-lg bg-primary/10 shrink-0">
                            <Sparkles className="w-4 h-4 text-primary" />
                          </div>
                          <span className="font-medium text-sm">{feature}</span>
                        </motion.div>
                      ))}
                    </div>

                    <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Award className="w-5 h-5 text-primary" />
                        What you get
                      </h4>
                      <ul className="space-y-2.5">
                        {[
                          'Full source code',
                          'Integration documentation', 
                          'Single-project license',
                          'Substrate compatibility',
                          '90-day support'
                        ].map((item, i) => (
                          <motion.li 
                            key={item} 
                            className="flex items-center gap-2 text-sm"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                          >
                            <Check className="w-4 h-4 text-neon-green shrink-0" />
                            {item}
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                  </TabsContent>
                </AnimatePresence>
              </ScrollArea>
            </Tabs>
          </div>

          {/* Right: Purchase Panel */}
          <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l bg-gradient-to-b from-muted/30 to-muted/50 shrink-0 overflow-y-auto">
            <ScrollArea className="h-full max-h-[40vh] lg:max-h-none">
              <div className="p-4 sm:p-5 space-y-4">
                {/* Price with enhanced styling */}
                <div className="flex items-center justify-between lg:block lg:text-left">
                  <div>
                    <motion.div 
                      className="text-2xl lg:text-4xl font-black text-primary"
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                    >
                      {formatPrice(pricing.amount)}
                    </motion.div>
                    <p className="text-xs text-muted-foreground">One-time payment</p>
                  </div>
                  
                  {/* Mobile CTA inline with price */}
                  <div className="lg:hidden">
                    {isPurchased ? (
                      <Button size="sm" variant="outline" className="gap-1.5">
                        <Download className="w-4 h-4" />
                        Download
                      </Button>
                    ) : (
                      <Button 
                        size="sm" 
                        className="gap-1.5 shadow-lg shadow-primary/25"
                        onClick={() => onBuy(template)}
                        disabled={isLoading}
                      >
                        <CreditCard className="w-4 h-4" />
                        {isLoading ? '...' : 'Buy Now'}
                      </Button>
                    )}
                  </div>
                </div>

                {/* Quick Info - Desktop only */}
                <div className="hidden lg:block space-y-2.5 p-3 rounded-xl bg-background/50 border">
                  {[
                    { icon: Lock, label: 'Single-project license' },
                    { icon: Code, label: 'Full source code' },
                    { icon: Download, label: 'Instant download' },
                    { icon: Shield, label: 'Secure payment' },
                  ].map(({ icon: ItemIcon, label }) => (
                    <div key={label} className="flex items-center gap-2.5 text-sm">
                      <ItemIcon className="w-4 h-4 text-muted-foreground shrink-0" />
                      <span>{label}</span>
                    </div>
                  ))}
                </div>

                {/* Mobile Quick Info - Compact horizontal */}
                <div className="flex flex-wrap gap-2 lg:hidden">
                  <Badge variant="outline" className="text-xs gap-1">
                    <Code className="w-3 h-3" /> Full Code
                  </Badge>
                  <Badge variant="outline" className="text-xs gap-1">
                    <Download className="w-3 h-3" /> Instant
                  </Badge>
                  <Badge variant="outline" className="text-xs gap-1">
                    <Shield className="w-3 h-3" /> Secure
                  </Badge>
                </div>

                {/* Rating */}
                <div className="p-2.5 rounded-lg bg-neon-amber/5 border border-neon-amber/20 flex items-center gap-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="w-3.5 h-3.5 text-neon-amber fill-neon-amber" />
                    ))}
                  </div>
                  <span className="text-sm font-semibold">5.0</span>
                  <span className="text-xs text-muted-foreground">(Premium)</span>
                </div>

                {/* Rarity tier indicator */}
                <div className={cn(
                  "p-2.5 rounded-lg border flex items-center gap-2",
                  rarity.bgColor, rarity.borderColor
                )}>
                  <Sparkles className={cn("w-4 h-4", rarity.color)} />
                  <span className={cn("text-sm font-medium", rarity.color)}>{rarity.label} Tier</span>
                </div>

                {/* Trust badge */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Shield className="w-3.5 h-3.5 text-neon-green shrink-0" />
                  <span>CMPSBL® Trade Secret License</span>
                </div>

                {/* Desktop CTA */}
                <div className="hidden lg:block space-y-2 pt-3 border-t">
                  {isPurchased ? (
                    <Button 
                      size="lg" 
                      className="w-full gap-2"
                      variant="outline"
                    >
                      <Download className="w-5 h-5" />
                      Download Again
                    </Button>
                  ) : (
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button 
                        size="lg" 
                        className="w-full gap-2 shadow-lg shadow-primary/25"
                        onClick={() => onBuy(template)}
                        disabled={isLoading}
                      >
                        <CreditCard className="w-5 h-5" />
                        {isLoading ? 'Processing...' : 'Purchase Now'}
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  )}
                  <p className="text-xs text-center text-muted-foreground">
                    Instant delivery after payment
                  </p>
                </div>

                {/* Upgrade prompt */}
                <div className="p-3 rounded-xl bg-gradient-to-r from-neon-purple/5 to-neon-purple/5 border border-neon-purple/20">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-neon-purple" />
                    <span className="text-xs font-semibold">Need more?</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mb-2">
                    Get commercial rights with Agency Packs starting at $199/mo
                  </p>
                  <Button variant="ghost" size="sm" className="h-6 text-[10px] text-neon-purple hover:text-neon-purple p-0">
                    Learn about licensing →
                  </Button>
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
