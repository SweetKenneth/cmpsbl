/**
 * UserPurchases — Display purchased templates and recommendations
 */

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { 
  Package, Download, Clock, Sparkles, ArrowRight, 
  CheckCircle, Eye, ShoppingCart
} from 'lucide-react';
import { useMarketplaceUser } from '@/hooks/useMarketplaceUser';
import { TEMPLATES, type Template } from '@/data/templates';
import { getTemplatePricing, formatPrice } from '@/config/marketplace-products';
import { formatDistanceToNow } from 'date-fns';
import { generateDisplayName, getRarityBadge } from '@/lib/templateNames';

interface UserPurchasesProps {
  onPreview: (template: Template) => void;
  onBuy: (template: Template) => void;
  isLoading?: boolean;
}

export function UserPurchases({ onPreview, onBuy, isLoading }: UserPurchasesProps) {
  const { 
    isLoggedIn, 
    purchases, 
    recommendations, 
    recentlyViewed,
    loading 
  } = useMarketplaceUser();

  if (!isLoggedIn) {
    return null;
  }

  if (loading) {
    return (
      <div className="py-8">
        <div className="container mx-auto px-4">
          <div className="h-40 rounded-xl bg-muted/50 animate-pulse" />
        </div>
      </div>
    );
  }

  const purchasedTemplates = purchases.map(p => {
    const template = TEMPLATES.find(t => t.id === p.template_id);
    return { ...p, template };
  }).filter(p => p.template);

  return (
    <div className="space-y-8 py-8 border-t border-border/50">
      <div className="container mx-auto px-4">
        
        {/* Your Purchases */}
        {purchasedTemplates.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" />
                Your Templates
              </h2>
              <Badge variant="outline" className="gap-1">
                <CheckCircle className="w-3 h-3 text-system-green" />
                {purchasedTemplates.length} Owned
              </Badge>
            </div>
            
            <ScrollArea className="w-full">
              <div className="flex gap-4 pb-4">
                {purchasedTemplates.map((purchase, index) => {
                  const template = purchase.template!;
                  const Icon = template.icon;
                  const displayName = generateDisplayName(template.id, template.category, template.difficulty);
                  const rarity = getRarityBadge(template.difficulty);
                  
                  return (
                    <motion.div
                      key={purchase.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card 
                        className="w-[280px] shrink-0 cursor-pointer hover:shadow-lg hover:border-primary/50 transition-all"
                        onClick={() => onPreview(template)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3 mb-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                              <Icon className="w-6 h-6 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-sm break-words">
                                {displayName}
                              </h3>
                              <p className="text-[10px] text-muted-foreground/70 line-clamp-2">{template.name}</p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                <Clock className="w-3 h-3" />
                                {formatDistanceToNow(new Date(purchase.purchased_at), { addSuffix: true })}
                              </div>
                            </div>
                            <Badge className={cn("text-[10px]", rarity.bgColor, rarity.color, rarity.borderColor)}>
                              {rarity.label}
                            </Badge>
                          </div>
                          
                          <Button variant="outline" size="sm" className="w-full gap-2">
                            <Download className="w-3.5 h-3.5" />
                            Download ({purchase.download_count})
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </section>
        )}

        {/* Recently Viewed */}
        {recentlyViewed.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Eye className="w-5 h-5 text-neon-blue" />
                Recently Viewed
              </h2>
            </div>
            
            <ScrollArea className="w-full">
              <div className="flex gap-4 pb-4">
                {recentlyViewed.map((template, index) => {
                  const Icon = template.icon;
                  const pricing = getTemplatePricing(template.difficulty, template.id);
                  const isPurchased = purchases.some(p => p.template_id === template.id);
                  const displayName = generateDisplayName(template.id, template.category, template.difficulty);
                  const rarity = getRarityBadge(template.difficulty);
                  
                  return (
                    <motion.div
                      key={template.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card 
                        className="w-[240px] shrink-0 cursor-pointer hover:shadow-lg hover:border-primary/50 transition-all"
                        onClick={() => onPreview(template)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3 mb-3">
                            <div className="p-2 rounded-lg bg-muted">
                              <Icon className="w-5 h-5 text-foreground" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-sm break-words">
                                {displayName}
                              </h3>
                              <p className="text-[10px] text-muted-foreground/70 line-clamp-2">
                                {template.name}
                              </p>
                              <Badge className={cn("text-[9px] h-4 px-1.5 mt-1", rarity.bgColor, rarity.color, rarity.borderColor)}>
                                {rarity.label}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-primary">
                              {formatPrice(pricing.amount)}
                            </span>
                            {isPurchased ? (
                              <Badge variant="outline" className="text-[10px]">
                                Owned
                              </Badge>
                            ) : (
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-7 text-xs"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onBuy(template);
                                }}
                                disabled={isLoading}
                              >
                                Buy
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </section>
        )}

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-neon-purple" />
                Recommended For You
              </h2>
              <Button variant="ghost" size="sm" className="gap-1 text-xs">
                View All
                <ArrowRight className="w-3 h-3" />
              </Button>
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recommendations.slice(0, 3).map((template, index) => {
                const Icon = template.icon;
                const pricing = getTemplatePricing(template.difficulty, template.id);
                const displayName = generateDisplayName(template.id, template.category, template.difficulty);
                const rarity = getRarityBadge(template.difficulty);
                
                return (
                  <motion.div
                    key={template.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card 
                      className="cursor-pointer hover:shadow-lg hover:border-primary/50 transition-all group"
                      onClick={() => onPreview(template)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="p-3 rounded-xl bg-neon-purple/10 border border-neon-purple/20">
                            <Icon className="w-8 h-8 text-neon-purple" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold group-hover:text-primary transition-colors">
                                {displayName}
                              </h3>
                              <Badge className={cn("text-[9px] h-4 px-1.5", rarity.bgColor, rarity.color, rarity.borderColor)}>
                                {rarity.label}
                              </Badge>
                            </div>
                            <p className="text-[10px] text-muted-foreground/70 -mt-0.5 mb-1">{template.name}</p>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {template.description}
                            </p>
                            
                            <div className="flex items-center justify-between mt-3">
                              <span className="text-lg font-bold text-primary">
                                {formatPrice(pricing.amount)}
                              </span>
                              <Button 
                                size="sm" 
                                className="gap-1"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onBuy(template);
                                }}
                                disabled={isLoading}
                              >
                                <ShoppingCart className="w-3.5 h-3.5" />
                                Buy
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
