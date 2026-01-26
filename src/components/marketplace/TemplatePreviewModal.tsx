/**
 * TemplatePreviewModal — Immersive full preview with protected code
 * Mobile-optimized, high-conversion design
 */

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import {
  Code, ShoppingCart, CreditCard, Eye, Sparkles, Zap, Clock, Star, 
  Lock, Shield, Brain, Moon, MessageSquare, Settings, Server, Check,
  ArrowRight, Award, Download
} from 'lucide-react';
import type { Template } from '@/data/templates';
import { getTemplatePricing, formatPrice } from '@/config/marketplace-products';
import { BlurredCodePreview } from './BlurredCodePreview';
import { useMarketplaceUser } from '@/hooks/useMarketplaceUser';

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

const difficultyConfig: Record<string, { label: string; color: string; bg: string }> = {
  beginner: { label: 'Beginner', color: 'text-emerald-400', bg: 'bg-emerald-500/15' },
  intermediate: { label: 'Intermediate', color: 'text-amber-400', bg: 'bg-amber-500/15' },
  advanced: { label: 'Advanced', color: 'text-rose-400', bg: 'bg-rose-500/15' },
  premium: { label: 'Premium', color: 'text-violet-400', bg: 'bg-violet-500/15' },
  elite: { label: 'Elite', color: 'text-amber-400', bg: 'bg-gradient-to-r from-amber-500/20 to-orange-500/20' },
  pro: { label: 'Pro', color: 'text-cyan-400', bg: 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20' },
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
  const difficulty = difficultyConfig[template.difficulty] || difficultyConfig.beginner;
  const isPurchased = hasPurchased(template.id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-hidden p-0">
        <div className="flex flex-col lg:flex-row h-full max-h-[95vh]">
          {/* Left: Preview Content */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-4 border-b shrink-0">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30 shrink-0">
                  <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <DialogTitle className="text-lg sm:text-xl font-bold mb-2 pr-8">
                    {template.name}
                  </DialogTitle>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="gap-1 text-xs">
                      <CategoryIcon className="w-3 h-3" />
                      {template.category}
                    </Badge>
                    <Badge className={cn("text-xs border-0", difficulty.bg, difficulty.color)}>
                      {difficulty.label}
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
                <TabsContent value="preview" className="mt-0 space-y-4">
                  {/* Visual Preview */}
                  <div className="aspect-video rounded-xl bg-gradient-to-br from-primary/15 via-primary/5 to-muted/50 border-2 border-primary/20 flex items-center justify-center overflow-hidden">
                    <div className="text-center space-y-4 p-6">
                      <div className="w-20 h-20 sm:w-28 sm:h-28 mx-auto rounded-2xl bg-card border-2 shadow-2xl flex items-center justify-center">
                        <Icon className="w-10 h-10 sm:w-14 sm:h-14 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-lg font-semibold">{template.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Production-ready cognitive template
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="p-4 rounded-xl bg-muted/50 border">
                    <h4 className="font-semibold mb-2">About this template</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {template.description}
                    </p>
                  </div>

                  {/* Core Capabilities */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 rounded-xl bg-violet-500/5 border border-violet-500/20">
                      <Brain className="w-6 h-6 text-violet-500 mb-2" />
                      <h4 className="font-medium text-sm mb-1">Memory Enabled</h4>
                      <p className="text-xs text-muted-foreground">
                        Persists state across sessions
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/20">
                      <Shield className="w-6 h-6 text-rose-500 mb-2" />
                      <h4 className="font-medium text-sm mb-1">Drift Protected</h4>
                      <p className="text-xs text-muted-foreground">
                        Self-correcting behavior
                      </p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="code" className="mt-0">
                  {/* Protected code preview */}
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
                      <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border">
                        <div className="p-1.5 rounded-lg bg-primary/10 shrink-0">
                          <Sparkles className="w-4 h-4 text-primary" />
                        </div>
                        <span className="font-medium text-sm">{feature}</span>
                      </div>
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
                      ].map((item) => (
                        <li key={item} className="flex items-center gap-2 text-sm">
                          <Check className="w-4 h-4 text-system-green shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </TabsContent>
              </ScrollArea>
            </Tabs>
          </div>

          {/* Right: Purchase Panel */}
          <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l bg-gradient-to-b from-muted/30 to-muted/50 p-4 sm:p-6 flex flex-col shrink-0">
            <div className="flex-1 space-y-5">
              {/* Price */}
              <div className="text-center lg:text-left">
                <div className="text-4xl sm:text-5xl font-black text-primary">
                  {formatPrice(pricing.amount)}
                </div>
                <p className="text-sm text-muted-foreground">One-time payment</p>
              </div>

              {/* Quick Info */}
              <div className="space-y-3 p-4 rounded-xl bg-background/50 border">
                <div className="flex items-center gap-3 text-sm">
                  <Lock className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span>Single-project license</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Code className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span>Full source code included</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Download className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span>Instant download</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Shield className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span>Secure payment via Stripe</span>
                </div>
              </div>

              {/* Rating */}
              <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20 flex items-center gap-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-4 h-4 text-amber-500 fill-amber-500" />
                  ))}
                </div>
                <span className="text-sm font-semibold">5.0</span>
                <span className="text-xs text-muted-foreground">(Premium)</span>
              </div>

              {/* Trust badge */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Shield className="w-4 h-4 text-system-green" />
                <span>Protected by promptfluid® Trade Secret License</span>
              </div>
            </div>

            {/* CTA */}
            <div className="space-y-3 pt-5 border-t mt-4">
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
              )}
              <p className="text-xs text-center text-muted-foreground">
                Instant delivery after payment
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
