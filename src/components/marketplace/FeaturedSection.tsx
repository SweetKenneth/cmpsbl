/**
 * FeaturedSection — Premium hero products with compelling visuals
 * Mobile-first design, high conversion focus
 */

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { 
  Globe, ShoppingCart, Star, Check, Cpu, Brain, Shield, 
  Moon, Zap, Lock, ArrowRight, Sparkles, Crown, Layers
} from 'lucide-react';
import { MARKETPLACE_PRODUCTS, formatPrice } from '@/config/marketplace-products';

interface FeaturedSectionProps {
  onBuyOS: () => void;
  onBuyWorldEngine: () => void;
  isLoading?: boolean;
}

export function FeaturedSection({ onBuyOS, onBuyWorldEngine, isLoading }: FeaturedSectionProps) {
  return (
    <section className="py-12 sm:py-16 relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
      
      <div className="container mx-auto px-4 relative">
        {/* Section header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <Badge className="mb-4 gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
            <Crown className="w-3.5 h-3.5" />
            Premium Products
          </Badge>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black mb-3">
            Complete Cognitive Solutions
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Self-host the entire substrate or power immersive game worlds with persistent AI memory
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {/* OS License Card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Card className="relative overflow-hidden h-full group border-2 border-primary/30 hover:border-primary/60 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10">
              {/* Gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-primary/5 to-violet-500/10 pointer-events-none" />
              
              {/* Animated glow on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              
              <CardContent className="p-6 sm:p-8 relative">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-primary to-violet-600 shadow-xl shadow-primary/30">
                    <Cpu className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                  </div>
                  <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-lg">
                    <Star className="w-3 h-3 mr-1 fill-current" />
                    Best Value
                  </Badge>
                </div>

                {/* Content */}
                <h3 className="text-2xl sm:text-3xl font-black mb-2">Substrate OS License</h3>
                <p className="text-muted-foreground text-sm sm:text-base mb-6">
                  Self-host the complete promptfluid® cognitive operating system. 
                  13 modules, BYOK configuration, unlimited potential.
                </p>

                {/* Features grid */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {[
                    { icon: Brain, label: '3-Tier Memory', desc: 'Never forgets' },
                    { icon: Shield, label: 'Defense System', desc: 'Anti-drift' },
                    { icon: Moon, label: 'Dream Cycles', desc: 'Self-improve' },
                    { icon: Zap, label: 'AI Routing', desc: 'Multi-provider' },
                  ].map(({ icon: Icon, label, desc }) => (
                    <div key={label} className="flex items-start gap-2 p-2 rounded-lg bg-background/50">
                      <Icon className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <div>
                        <span className="text-sm font-medium block">{label}</span>
                        <span className="text-[10px] text-muted-foreground">{desc}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* What's included */}
                <div className="space-y-2 mb-6 p-4 rounded-xl bg-muted/50 border border-border/50">
                  {['Full source code', 'Single-domain license', '6 months updates', 'Priority support'].map((item) => (
                    <div key={item} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-system-green shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                {/* Price & CTA */}
                <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl sm:text-5xl font-black text-primary">
                        {formatPrice(MARKETPLACE_PRODUCTS.os_license.amount)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">One-time payment</p>
                  </div>
                  <Button 
                    onClick={onBuyOS} 
                    disabled={isLoading} 
                    size="lg"
                    className="w-full sm:w-auto gap-2 shadow-lg shadow-primary/25"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Buy Now
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* World Engine Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Card className="relative overflow-hidden h-full group border-2 border-orange-500/30 hover:border-orange-500/60 transition-all duration-300 hover:shadow-2xl hover:shadow-orange-500/10">
              {/* Gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/15 via-orange-500/5 to-amber-500/10 pointer-events-none" />
              
              <CardContent className="p-6 sm:p-8 relative">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 shadow-xl shadow-orange-500/30">
                    <Globe className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                  </div>
                  <Badge variant="outline" className="border-orange-500/50 text-orange-500 bg-orange-500/5">
                    <Layers className="w-3 h-3 mr-1" />
                    Game Dev
                  </Badge>
                </div>

                {/* Content */}
                <h3 className="text-2xl sm:text-3xl font-black mb-2">World Engine Complete</h3>
                <p className="text-muted-foreground text-sm sm:text-base mb-6">
                  Full game world engine with NPC memory, physics integration, 
                  dream cycles, and persistent world state.
                </p>

                {/* Features grid */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {[
                    { icon: Brain, label: 'NPC Memory', desc: 'Remember players' },
                    { icon: Moon, label: 'Dream Cycles', desc: 'NPCs evolve' },
                    { icon: Globe, label: 'World State', desc: 'Persistent' },
                    { icon: Zap, label: 'Multi-Agent', desc: 'Coordinated' },
                  ].map(({ icon: Icon, label, desc }) => (
                    <div key={label} className="flex items-start gap-2 p-2 rounded-lg bg-background/50">
                      <Icon className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" />
                      <div>
                        <span className="text-sm font-medium block">{label}</span>
                        <span className="text-[10px] text-muted-foreground">{desc}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* What's included */}
                <div className="space-y-2 mb-6 p-4 rounded-xl bg-muted/50 border border-border/50">
                  {['Complete world engine', 'Unity/Unreal ready', 'NPC personality system', 'Example scenes'].map((item) => (
                    <div key={item} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-system-green shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                {/* Price & CTA */}
                <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl sm:text-5xl font-black text-orange-500">
                        {formatPrice(MARKETPLACE_PRODUCTS.world_engine.amount)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">One-time payment</p>
                  </div>
                  <Button 
                    onClick={onBuyWorldEngine} 
                    disabled={isLoading} 
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto gap-2 border-orange-500/50 text-orange-500 hover:bg-orange-500/10"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Buy Now
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
