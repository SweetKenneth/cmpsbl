/**
 * Self-Improvement Hero — Bold Hero Section for Capabilities Depot
 * Positions Self-Improvement as revolutionary flagship product
 * Mobile-first design with premium visual treatment
 * v1.0.0
 */

import { 
  Zap, 
  Sparkles, 
  ArrowRight, 
  Shield, 
  LockOpen,
  Brain,
  TrendingUp,
  Scale,
  ShieldCheck,
  Crown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SelfImprovementHeroProps {
  onExplore: () => void;
  onViewApex: () => void;
}

export function SelfImprovementHero({ onExplore, onViewApex }: SelfImprovementHeroProps) {
  return (
    <section className="relative overflow-hidden bg-background">
      {/* Zero-tint background: only background + ultra-low-opacity foreground texture */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_hsl(var(--foreground)/0.06)_0%,_transparent_60%)]"
      />

      {/* Subtle animated orb: foreground only (no theme-tinted tokens like muted/primary) */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-foreground/5 blur-3xl"
        animate={{
          scale: [1, 1.08, 1],
          opacity: [0.06, 0.1, 0.06],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Grid pattern overlay: foreground only */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(hsl(var(--foreground)/0.06)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--foreground)/0.06)_1px,transparent_1px)] bg-[size:64px_64px]"
      />
      
      <div className="relative container mx-auto px-4 py-16 md:py-24 lg:py-32">
        <div className="max-w-5xl mx-auto">
          {/* Announcement badge */}
          <motion.div 
            className="flex justify-center mb-6 md:mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border/60 bg-card/60 backdrop-blur-sm">
              <Crown className="w-4 h-4 text-foreground" />
              <span className="text-sm font-semibold text-foreground">
                World's First Self-Improving AI Marketplace
              </span>
              <Badge className="bg-background text-foreground border-border/60 text-[10px]">
                PIONEERING
              </Badge>
            </div>
          </motion.div>

          {/* Main headline - mobile-first typography */}
          <motion.div 
            className="text-center mb-6 md:mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tight leading-[0.95]">
              <span className="block text-foreground mb-2">
                Systems That
              </span>
              <span className="block text-foreground pb-2">
                Improve Themselves
              </span>
            </h1>
          </motion.div>

          {/* Subheadline */}
          <motion.p 
            className="text-center text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto mb-8 md:mb-10 leading-relaxed px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            The first marketplace for{' '}
            <span className="text-foreground font-semibold">recursive self-improvement</span>{' '}
            capabilities. Download cognitive artifacts that{' '}
            <span className="text-foreground font-semibold">learn to learn</span>,{' '}
            <span className="text-foreground font-semibold">optimize their own optimization</span>, and{' '}
            <span className="text-foreground font-semibold">compound intelligence</span>{' '}
            over time.
          </motion.p>

          {/* CTA buttons - mobile optimized */}
          <motion.div 
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 md:mb-16 px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Button 
              size="lg" 
              onClick={onViewApex}
              className="w-full sm:w-auto h-14 px-8 text-lg bg-foreground text-background hover:bg-foreground/90 border-0 touch-manipulation"
            >
              <Crown className="w-5 h-5 mr-2" />
              View Apex Capabilities
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={onExplore}
              className="w-full sm:w-auto h-14 px-8 text-lg border-border/60 hover:bg-foreground/5 touch-manipulation"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Explore All Capabilities
            </Button>
          </motion.div>

          {/* Trust indicators - mobile carousel-friendly */}
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 max-w-4xl mx-auto px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <TrustCard 
              icon={Brain}
              label="Recursive"
              value="Self-Optimization"
              color="cyan"
            />
            <TrustCard 
              icon={TrendingUp}
              label="Exponential"
              value="Growth Curves"
              color="cyan"
            />
            <TrustCard 
              icon={ShieldCheck}
              label="Governed"
              value="Bounded Safety"
              color="emerald"
            />
            <TrustCard 
              icon={LockOpen}
              label="Licensed"
              value="Local Execution"
              color="amber"
            />
          </motion.div>

          {/* Flagship product callout */}
          <motion.div 
            className="mt-12 md:mt-16 max-w-3xl mx-auto px-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
          >
            <div className="relative group">
              {/* Subtle border glow - neutral */}
              <div className="absolute -inset-0.5 bg-border/50 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity" />
              
              <div className="relative p-6 md:p-8 rounded-2xl border border-border/50 bg-card/90 backdrop-blur-xl">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
                  {/* Icon */}
                  <div className="shrink-0 p-4 rounded-xl bg-muted border border-border/50">
                    <Zap className="w-8 h-8 text-foreground" />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <Badge className="bg-background text-foreground border-border/60">
                        APEX TIER
                      </Badge>
                      <Badge variant="outline" className="border-border/60 text-foreground">
                        $6,999
                      </Badge>
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold text-foreground mb-2">
                      Recursive Self-Optimization Core
                    </h3>
                    <p className="text-sm md:text-base text-muted-foreground">
                      The crown jewel. A system that improves its own improvement algorithms — 
                      creating infinite capability ceilings with bounded recursion safety.
                    </p>
                  </div>
                  
                  {/* CTA */}
                  <Button 
                    onClick={onViewApex}
                    className="shrink-0 w-full md:w-auto bg-foreground text-background hover:bg-foreground/90 touch-manipulation"
                  >
                    Learn More
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}

interface TrustCardProps {
  icon: typeof Brain;
  label: string;
  value: string;
  color: 'violet' | 'cyan' | 'emerald' | 'amber';
}

function TrustCard({ icon: Icon, label, value, color }: TrustCardProps) {
  // Intentionally neutral — avoid any theme-tinted semantic tokens and all direct colors.
  // Keep the prop for API stability; styling is uniform.
  void color;

  return (
    <div className={cn(
      "p-4 rounded-xl border backdrop-blur-sm text-center transition-all hover:scale-[1.02]",
      "border-border/60 bg-card/60 text-foreground"
    )}>
      <Icon className="w-6 h-6 mx-auto mb-2 text-foreground" />
      <div className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wider mb-1">
        {label}
      </div>
      <div className="text-xs md:text-sm font-semibold text-foreground">
        {value}
      </div>
    </div>
  );
}

export default SelfImprovementHero;
