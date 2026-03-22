/**
 * FeaturedSection — Premium hero products with compelling visuals
 * Mobile-first design, high conversion focus
 * OS License now redirects to licensing page (tiered pricing)
 */

import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Globe, ShoppingCart, Star, Check, Cpu, Brain, Shield, 
  Moon, Zap, Lock, ArrowRight, Sparkles, Crown, Layers,
  Users, TrendingUp, Award, FileText
} from 'lucide-react';
import { MARKETPLACE_PRODUCTS, formatPrice } from '@/config/marketplace-products';
import { LICENSING_PRODUCTS } from '@/config/licensing-products';

interface FeaturedSectionProps {
  onBuyOS: () => void;
  onBuyWorldEngine: () => void;
  isLoading?: boolean;
}

export function FeaturedSection({ onBuyOS, onBuyWorldEngine, isLoading }: FeaturedSectionProps) {
  return (
    <section className="py-12 sm:py-16 relative overflow-hidden">
      {/* Background accent with multiple layers */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.05),transparent_70%)] pointer-events-none" />
      
      <div className="container mx-auto px-4 relative">
        {/* Section header with enhanced styling */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <Badge className="mb-4 gap-1.5 bg-gradient-to-r from-neon-amber to-neon-amber text-white border-0 shadow-lg shadow-neon-amber/25">
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
          {/* Substrate Licensing Card - Now links to licensing page */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            whileHover={{ y: -4 }}
          >
            <Card className="relative overflow-hidden h-full group border-2 border-primary/30 hover:border-primary/60 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/20">
              {/* Gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-primary/5 to-neon-purple/10 pointer-events-none" />
              
              {/* Animated glow on hover */}
              <motion.div 
                className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0 pointer-events-none"
                initial={{ opacity: 0, x: '-100%' }}
                whileHover={{ opacity: 1, x: '100%' }}
                transition={{ duration: 0.8 }}
              />
              
              <CardContent className="p-6 sm:p-8 relative">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <motion.div 
                    className="p-4 rounded-2xl bg-gradient-to-br from-primary to-neon-purple shadow-xl shadow-primary/30"
                    whileHover={{ scale: 1.05, rotate: 3 }}
                  >
                    <Cpu className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                  </motion.div>
                  <Badge className="bg-gradient-to-r from-neon-green to-neon-cyan text-white border-0 shadow-lg gap-1">
                    <FileText className="w-3 h-3" />
                    Enterprise Licensing
                  </Badge>
                </div>

                {/* Content */}
                <h3 className="text-2xl sm:text-3xl font-black mb-2">CMPSBL Substrate</h3>
                <p className="text-muted-foreground text-sm sm:text-base mb-6">
                  Cognitive infrastructure for models, apps, and autonomous systems.
                  Licensed for Developers, Research, Enterprise, and Strategic partners.
                </p>

                {/* Features grid with hover effects */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {[
                    { icon: Brain, label: '3-Tier Memory', desc: 'Never forgets', color: 'text-neon-purple' },
                    { icon: Shield, label: 'Defense System', desc: 'Anti-drift', color: 'text-neon-magenta' },
                    { icon: Moon, label: 'Dream Cycles', desc: 'Self-improve', color: 'text-neon-purple' },
                    { icon: Zap, label: 'AI Routing', desc: 'Multi-provider', color: 'text-neon-green' },
                  ].map(({ icon: Icon, label, desc, color }) => (
                    <motion.div 
                      key={label} 
                      className="flex items-start gap-2 p-2.5 rounded-lg bg-background/50 border border-border/50 hover:border-primary/30 transition-colors"
                      whileHover={{ scale: 1.02 }}
                    >
                      <Icon className={`w-4 h-4 ${color} mt-0.5 shrink-0`} />
                      <div>
                        <span className="text-sm font-medium block">{label}</span>
                        <span className="text-[10px] text-muted-foreground">{desc}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Licensing tiers summary */}
                <div className="space-y-2 mb-6 p-4 rounded-xl bg-muted/50 border border-border/50">
                  {[
                    { text: 'Developer License — $2,999/yr', highlight: true },
                    { text: 'Team License — $9,999/yr', highlight: false },
                    { text: 'Research License — $19,999/yr', highlight: false },
                    { text: 'Enterprise License — $49,999/yr', highlight: false },
                    { text: 'Strategic License — Custom', highlight: true },
                  ].map(({ text, highlight }) => (
                    <div key={text} className="flex items-center gap-2 text-sm">
                      <Check className={`w-4 h-4 shrink-0 ${highlight ? 'text-neon-green' : 'text-muted-foreground'}`} />
                      <span className={highlight ? 'font-medium' : ''}>{text}</span>
                    </div>
                  ))}
                </div>

                {/* Price & CTA */}
                <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-medium text-muted-foreground">Starting at</span>
                      <motion.span 
                        className="text-3xl sm:text-4xl font-black text-primary"
                        initial={{ scale: 0.9 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ once: true }}
                      >
                        $2,999
                      </motion.span>
                      <span className="text-muted-foreground">/year</span>
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      Tiered licensing options
                    </p>
                  </div>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button 
                      asChild
                      size="lg"
                      className="w-full sm:w-auto gap-2 shadow-lg shadow-primary/25"
                    >
                      <Link to="/substrate/licensing">
                        <FileText className="w-5 h-5" />
                        View Licensing
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </Button>
                  </motion.div>
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
            whileHover={{ y: -4 }}
          >
            <Card className="relative overflow-hidden h-full group border-2 border-neon-amber/30 hover:border-neon-amber/60 transition-all duration-300 hover:shadow-2xl hover:shadow-neon-amber/20">
              {/* Gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-neon-amber/15 via-neon-amber/5 to-neon-amber/10 pointer-events-none" />
              
              <CardContent className="p-6 sm:p-8 relative">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <motion.div 
                    className="p-4 rounded-2xl bg-gradient-to-br from-neon-amber to-neon-amber shadow-xl shadow-neon-amber/30"
                    whileHover={{ scale: 1.05, rotate: -3 }}
                  >
                    <Globe className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                  </motion.div>
                  <Badge variant="outline" className="border-neon-amber/50 text-orange-600 bg-neon-amber/5 gap-1">
                    <Layers className="w-3 h-3" />
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
                    { icon: Brain, label: 'NPC Memory', desc: 'Remember players', color: 'text-neon-purple' },
                    { icon: Moon, label: 'Dream Cycles', desc: 'NPCs evolve', color: 'text-neon-purple' },
                    { icon: Globe, label: 'World State', desc: 'Persistent', color: 'text-neon-amber' },
                    { icon: Users, label: 'Multi-Agent', desc: 'Coordinated', color: 'text-neon-cyan' },
                  ].map(({ icon: Icon, label, desc, color }) => (
                    <motion.div 
                      key={label} 
                      className="flex items-start gap-2 p-2.5 rounded-lg bg-background/50 border border-border/50 hover:border-neon-amber/30 transition-colors"
                      whileHover={{ scale: 1.02 }}
                    >
                      <Icon className={`w-4 h-4 ${color} mt-0.5 shrink-0`} />
                      <div>
                        <span className="text-sm font-medium block">{label}</span>
                        <span className="text-[10px] text-muted-foreground">{desc}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* What's included */}
                <div className="space-y-2 mb-6 p-4 rounded-xl bg-muted/50 border border-border/50">
                  {[
                    { text: 'Complete world engine', highlight: true },
                    { text: 'Unity/Unreal ready', highlight: false },
                    { text: 'NPC personality system', highlight: true },
                    { text: 'Example scenes', highlight: false },
                  ].map(({ text, highlight }) => (
                    <div key={text} className="flex items-center gap-2 text-sm">
                      <Check className={`w-4 h-4 shrink-0 ${highlight ? 'text-neon-green' : 'text-muted-foreground'}`} />
                      <span className={highlight ? 'font-medium' : ''}>{text}</span>
                    </div>
                  ))}
                </div>

                {/* Price & CTA */}
                <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
                  <div>
                    <div className="flex items-baseline gap-2">
                      <motion.span 
                        className="text-4xl sm:text-5xl font-black text-neon-amber"
                        initial={{ scale: 0.9 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ once: true }}
                      >
                        {formatPrice(MARKETPLACE_PRODUCTS.world_engine.amount)}
                      </motion.span>
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      One-time payment
                    </p>
                  </div>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button 
                      onClick={onBuyWorldEngine} 
                      disabled={isLoading} 
                      size="lg"
                      variant="outline"
                      className="w-full sm:w-auto gap-2 border-neon-amber/50 text-orange-600 hover:bg-neon-amber/10 hover:border-neon-amber"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      Buy Now
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Trust indicators */}
        <motion.div 
          className="flex flex-wrap justify-center gap-6 mt-10 pt-8 border-t border-border/30"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          {[
            { icon: Award, label: 'Zero Drift Guarantee', color: 'text-neon-green' },
            { icon: Users, label: '500+ Developers', color: 'text-primary' },
            { icon: TrendingUp, label: 'Enterprise Ready', color: 'text-neon-purple' },
          ].map(({ icon: TrustIcon, label, color }) => (
            <div key={label} className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrustIcon className={`w-4 h-4 ${color}`} />
              <span>{label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
