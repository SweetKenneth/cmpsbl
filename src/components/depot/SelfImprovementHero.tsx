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
      {/* Layered gradient backgrounds */}
      <div className="absolute inset-0 bg-gradient-to-b from-violet-950/20 via-background to-background" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_center,_var(--tw-gradient-stops))] from-violet-500/15 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-cyan-500/10 via-transparent to-transparent" />
      
      {/* Animated glow orbs */}
      <motion.div 
        className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-violet-600/20 via-fuchsia-500/10 to-transparent blur-3xl"
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute -bottom-20 right-0 w-[400px] h-[400px] rounded-full bg-gradient-to-tl from-cyan-500/15 via-blue-500/10 to-transparent blur-3xl"
        animate={{ 
          scale: [1, 1.15, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
      
      <div className="relative container mx-auto px-4 py-16 md:py-24 lg:py-32">
        <div className="max-w-5xl mx-auto">
          {/* Announcement badge */}
          <motion.div 
            className="flex justify-center mb-6 md:mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-violet-500/30 bg-violet-500/10 backdrop-blur-sm">
              <Crown className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-semibold text-violet-300">
                World's First Self-Improving AI Marketplace
              </span>
              <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-[10px]">
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
              <span className="block bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent pb-2">
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
            <span className="text-violet-400 font-semibold">learn to learn</span>,{' '}
            <span className="text-cyan-400 font-semibold">optimize their own optimization</span>, and{' '}
            <span className="text-fuchsia-400 font-semibold">compound intelligence</span>{' '}
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
              className="w-full sm:w-auto h-14 px-8 text-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 shadow-lg shadow-violet-500/25 border-0 touch-manipulation"
            >
              <Crown className="w-5 h-5 mr-2" />
              View Apex Capabilities
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={onExplore}
              className="w-full sm:w-auto h-14 px-8 text-lg border-violet-500/30 hover:bg-violet-500/10 touch-manipulation"
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
              color="violet"
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
              {/* Glow effect */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity" />
              
              <div className="relative p-6 md:p-8 rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-950/80 via-background to-background backdrop-blur-xl">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
                  {/* Icon */}
                  <div className="shrink-0 p-4 rounded-xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 border border-violet-500/20">
                    <Zap className="w-8 h-8 text-violet-400" />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                        APEX TIER
                      </Badge>
                      <Badge variant="outline" className="border-violet-500/30 text-violet-400">
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
                    className="shrink-0 w-full md:w-auto bg-violet-600 hover:bg-violet-500 touch-manipulation"
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
  const colorClasses = {
    violet: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
    cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  };

  const iconColors = {
    violet: 'text-violet-400',
    cyan: 'text-cyan-400',
    emerald: 'text-emerald-400',
    amber: 'text-amber-400',
  };

  return (
    <div className={cn(
      "p-4 rounded-xl border backdrop-blur-sm text-center transition-all hover:scale-[1.02]",
      colorClasses[color]
    )}>
      <Icon className={cn("w-6 h-6 mx-auto mb-2", iconColors[color])} />
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
