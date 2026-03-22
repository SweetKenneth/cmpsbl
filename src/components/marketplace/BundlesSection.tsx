/**
 * BundlesSection — Volume packs and stacks with discounts
 * Component for funnel phase F
 */

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  Package, ShoppingCart, Check, ArrowRight, Sparkles, 
  Gift, TrendingUp, Star, Zap, Brain, Shield
} from 'lucide-react';
import { BUNDLES, TEMPLATE_STACKS } from '@/config/marketplace-bundles';
import { formatPrice as formatPriceUtil } from '@/config/marketplace-products';
import { TEMPLATES } from '@/data/templates';

interface BundlesSectionProps {
  onBuyBundle?: (bundleId: string) => void;
  isLoading?: boolean;
}

export function BundlesSection({ onBuyBundle, isLoading }: BundlesSectionProps) {
  return (
    <section className="py-12 sm:py-16 relative overflow-hidden" id="bundles">
      {/* Background accent */}
      <div className="absolute inset-0 bg-gradient-to-b from-neon-green/[0.02] via-transparent to-transparent pointer-events-none" />
      
      <div className="container mx-auto px-4 relative">
        {/* Section header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <Badge className="mb-4 gap-1.5 bg-gradient-to-r from-neon-green to-neon-cyan text-white border-0 shadow-lg">
            <Gift className="w-3.5 h-3.5" />
            Save Up to 30%
          </Badge>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black mb-3">
            Bundles & Stacks
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Curated template collections designed for specific outcomes. Save more when you buy together.
          </p>
        </motion.div>

        {/* Stacks Grid */}
        <div className="mb-12">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Developer Stacks
            <Badge variant="outline" className="ml-2">Outcome-focused</Badge>
          </h3>
          
          <div className="grid sm:grid-cols-2 gap-6">
            {TEMPLATE_STACKS.map((stack, index) => (
              <motion.div
                key={stack.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -4 }}
              >
                <Card className="h-full border-2 hover:border-primary/50 transition-all hover:shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/20">
                        <Package className="w-6 h-6 text-primary" />
                      </div>
                      <Badge className="bg-neon-green/10 text-neon-green border-neon-green/30">
                        {Math.round(stack.discount * 100)}% OFF
                      </Badge>
                    </div>

                    <h4 className="text-xl font-bold mb-2">{stack.name}</h4>
                    <p className="text-sm text-muted-foreground mb-3">{stack.description}</p>

                    {/* Stack Pricing */}
                    {(() => {
                      // Calculate stack price from templates
                      const templatePrices: Record<string, number> = {
                        'self-healing-chatbot': 8700,
                        'memory-persistence-core': 8700,
                        'context-continuity-engine': 8700,
                        'cognitive-firewall': 8700,
                        'support-memory-agent': 8700,
                        'behavioral-anchor-system': 8700,
                        'goal-persistence-module': 8700,
                        'observability-dashboard': 8700,
                        'autonomous-improvement-loop': 29900,
                        'learning-consolidation-engine': 29900,
                        'knowledge-graph-builder': 29900,
                        'drift-prevention-engine': 8700,
                        'personality-guard-system': 8700,
                      };
                      const originalPrice = stack.templateIds.reduce((sum, id) => sum + (templatePrices[id] || 8700), 0);
                      const discountedPrice = Math.round(originalPrice * (1 - stack.discount));
                      return (
                        <div className="mb-3">
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-black text-primary">
                              {formatPriceUtil(discountedPrice)}
                            </span>
                            <span className="text-sm text-muted-foreground line-through">
                              {formatPriceUtil(originalPrice)}
                            </span>
                          </div>
                          <p className="text-xs text-neon-green font-medium">
                            Save {formatPriceUtil(originalPrice - discountedPrice)}
                          </p>
                        </div>
                      );
                    })()}

                    {/* Outcome highlight */}
                    <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 mb-4">
                      <p className="text-sm font-medium text-primary flex items-start gap-2">
                        <TrendingUp className="w-4 h-4 mt-0.5 shrink-0" />
                        {stack.outcome}
                      </p>
                    </div>

                    {/* Included templates */}
                    <div className="mb-4">
                      <p className="text-xs text-muted-foreground mb-2">Includes {stack.templateIds.length} templates:</p>
                      <div className="flex flex-wrap gap-1">
                        {stack.templateIds.slice(0, 3).map(id => {
                          const template = TEMPLATES.find(t => t.id === id);
                          return template ? (
                            <Badge key={id} variant="secondary" className="text-[10px]">
                              {template.name}
                            </Badge>
                          ) : null;
                        })}
                        {stack.templateIds.length > 3 && (
                          <Badge variant="outline" className="text-[10px]">
                            +{stack.templateIds.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Modules */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {stack.modules.map(mod => (
                        <Badge key={mod} variant="outline" className="text-[10px] gap-1">
                          {mod === 'brain' && <Brain className="w-3 h-3" />}
                          {mod === 'defense' && <Shield className="w-3 h-3" />}
                          {mod}
                        </Badge>
                      ))}
                    </div>

                    {/* CTA */}
                    <Button 
                      className="w-full gap-2"
                      onClick={() => onBuyBundle?.(stack.id)}
                      disabled={isLoading}
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Get Stack
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Volume Bundles */}
        <div>
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Package className="w-5 h-5 text-neon-amber" />
            Volume Bundles
            <Badge variant="outline" className="ml-2 border-neon-amber/30 text-neon-amber">Best Savings</Badge>
          </h3>

          <div className="grid sm:grid-cols-3 gap-6">
            {BUNDLES.map((bundle, index) => (
              <motion.div
                key={bundle.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -4 }}
              >
                <Card className={cn(
                  "h-full border-2 transition-all hover:shadow-xl",
                  index === 1 && "border-neon-amber/50 shadow-lg shadow-neon-amber/10"
                )}>
                  <CardContent className="p-6">
                    {index === 1 && (
                      <Badge className="mb-4 bg-gradient-to-r from-neon-amber to-neon-amber text-white border-0">
                        <Star className="w-3 h-3 mr-1 fill-current" />
                        Most Popular
                      </Badge>
                    )}

                    <h4 className="text-lg font-bold mb-2">{bundle.name}</h4>
                    <p className="text-sm text-muted-foreground mb-4">{bundle.description}</p>

                    {/* Pricing */}
                    <div className="mb-4">
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-primary">
                          {formatPriceUtil(bundle.bundlePrice)}
                        </span>
                        <span className="text-sm text-muted-foreground line-through">
                          {formatPriceUtil(bundle.originalPrice)}
                        </span>
                      </div>
                      <p className="text-xs text-neon-green font-medium">
                        Save {formatPriceUtil(bundle.savings)} ({bundle.savingsPercent}% off)
                      </p>
                    </div>

                    {/* Templates count */}
                    <div className="flex items-center gap-2 mb-4 text-sm">
                      <Sparkles className="w-4 h-4 text-primary" />
                      <span>{bundle.templateIds.length} templates included</span>
                    </div>

                    {/* CTA */}
                    <Button 
                      className="w-full gap-2"
                      variant={index === 1 ? "default" : "outline"}
                      onClick={() => onBuyBundle?.(bundle.id)}
                      disabled={isLoading}
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Buy Bundle
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
