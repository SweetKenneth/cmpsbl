/**
 * FeaturedSection — Hero products: OS License and World Engine
 */

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { 
  Server, Globe, ShoppingCart, Star, Check, Cpu, Brain, Shield, 
  Moon, Zap, Lock, ArrowRight 
} from 'lucide-react';
import { MARKETPLACE_PRODUCTS, formatPrice } from '@/config/marketplace-products';

interface FeaturedSectionProps {
  onBuyOS: () => void;
  onBuyWorldEngine: () => void;
  isLoading?: boolean;
}

export function FeaturedSection({ onBuyOS, onBuyWorldEngine, isLoading }: FeaturedSectionProps) {
  return (
    <section className="py-12 bg-gradient-to-b from-transparent via-primary/5 to-transparent">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <Badge variant="outline" className="mb-3 gap-1.5">
            <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
            Premium Products
          </Badge>
          <h2 className="text-2xl md:text-3xl font-bold">
            Complete Solutions
          </h2>
          <p className="text-muted-foreground mt-2">
            Self-host the entire substrate or power immersive game worlds
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {/* OS License Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Card className="relative overflow-hidden border-primary/30 h-full group hover:border-primary/60 transition-all">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-violet-500/10 pointer-events-none" />
              <CardContent className="p-6 relative">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-violet-600 shadow-lg">
                    <Cpu className="w-8 h-8 text-white" />
                  </div>
                  <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
                    Best Value
                  </Badge>
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold mb-2">Substrate OS License</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Self-host the complete promptfluid® cognitive operating system. 
                  13 modules, BYOK configuration, single-install license.
                </p>

                {/* Features */}
                <div className="grid grid-cols-2 gap-2 mb-6">
                  {[
                    { icon: Brain, label: '3-Tier Memory' },
                    { icon: Shield, label: 'Defense System' },
                    { icon: Moon, label: 'Dream Cycles' },
                    { icon: Zap, label: 'AI Routing' },
                  ].map(({ icon: Icon, label }) => (
                    <div key={label} className="flex items-center gap-2 text-sm">
                      <Icon className="w-4 h-4 text-primary" />
                      <span>{label}</span>
                    </div>
                  ))}
                </div>

                {/* Price & CTA */}
                <div className="flex items-end justify-between">
                  <div>
                    <span className="text-4xl font-black text-primary">
                      {formatPrice(MARKETPLACE_PRODUCTS.os_license.amount)}
                    </span>
                    <p className="text-xs text-muted-foreground">One-time • Single domain</p>
                  </div>
                  <Button onClick={onBuyOS} disabled={isLoading} className="gap-2">
                    <ShoppingCart className="w-4 h-4" />
                    Buy Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* World Engine Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Card className="relative overflow-hidden border-orange-500/30 h-full group hover:border-orange-500/60 transition-all">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-amber-500/10 pointer-events-none" />
              <CardContent className="p-6 relative">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 shadow-lg">
                    <Globe className="w-8 h-8 text-white" />
                  </div>
                  <Badge variant="outline" className="border-orange-500/50 text-orange-500">
                    Game Dev
                  </Badge>
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold mb-2">World Engine Complete</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Full game world engine with NPC memory, physics integration, 
                  dream cycles, and persistent world state.
                </p>

                {/* Features */}
                <div className="grid grid-cols-2 gap-2 mb-6">
                  {[
                    { icon: Brain, label: 'NPC Memory' },
                    { icon: Moon, label: 'Dream Cycles' },
                    { icon: Globe, label: 'World State' },
                    { icon: Zap, label: 'Multi-Agent' },
                  ].map(({ icon: Icon, label }) => (
                    <div key={label} className="flex items-center gap-2 text-sm">
                      <Icon className="w-4 h-4 text-orange-500" />
                      <span>{label}</span>
                    </div>
                  ))}
                </div>

                {/* Price & CTA */}
                <div className="flex items-end justify-between">
                  <div>
                    <span className="text-4xl font-black text-orange-500">
                      {formatPrice(MARKETPLACE_PRODUCTS.world_engine.amount)}
                    </span>
                    <p className="text-xs text-muted-foreground">One-time • Single project</p>
                  </div>
                  <Button 
                    onClick={onBuyWorldEngine} 
                    disabled={isLoading} 
                    variant="outline"
                    className="gap-2 border-orange-500/50 text-orange-500 hover:bg-orange-500/10"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Buy Now
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
