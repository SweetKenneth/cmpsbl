/**
 * MarketplaceHeader — Premium hero with immersive visuals
 * Mobile-first, visually compelling marketplace entrance
 */

import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Sparkles, Brain, Shield, Moon, Zap, Server, 
  ChevronRight, Award, TrendingUp, Star 
} from 'lucide-react';
import { MarketplaceSearch } from './MarketplaceSearch';
import { TEMPLATES } from '@/data/templates';

interface MarketplaceHeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  resultCount: number;
}

export function MarketplaceHeader({ searchQuery, onSearchChange, resultCount }: MarketplaceHeaderProps) {
  return (
    <section className="relative overflow-hidden">
      {/* Immersive background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-violet-500/5" />
      
      {/* Animated orbs - hidden on mobile for GPU performance */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none hidden sm:block">
        <motion.div 
          className="absolute top-1/3 left-[10%] w-72 h-72 bg-primary/20 rounded-full blur-[100px]"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div 
          className="absolute top-1/2 right-[15%] w-96 h-96 bg-violet-500/15 rounded-full blur-[120px]"
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.2, 0.4],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div 
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-64 bg-cyan-500/10 rounded-full blur-[80px]"
          animate={{ 
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-grid-white/[0.02] [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />

      <div className="container mx-auto px-4 py-12 md:py-20 relative">
        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap justify-center gap-2 mb-6"
        >
          <Badge variant="outline" className="gap-1.5 px-3 py-1.5 bg-background/50 backdrop-blur-sm border-primary/30">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span className="text-xs font-medium">Trusted by 500+ developers</span>
          </Badge>
          <Badge variant="outline" className="gap-1.5 px-3 py-1.5 bg-background/50 backdrop-blur-sm border-emerald-500/30">
            <Award className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-xs font-medium">Zero Drift Guarantee</span>
          </Badge>
        </motion.div>

        {/* Main headline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-4 tracking-tight">
            <span className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              AI Templates That
            </span>
            <br />
            <span className="bg-gradient-to-r from-primary via-violet-500 to-cyan-400 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
              Never Forget
            </span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
            {TEMPLATES.length}+ production-ready cognitive templates with built-in memory,
            drift prevention & self-improvement. From <span className="text-primary font-semibold">$27</span>.
          </p>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-2xl mx-auto mb-8"
        >
          <MarketplaceSearch
            value={searchQuery}
            onChange={onSearchChange}
            resultCount={resultCount}
          />
        </motion.div>

        {/* Feature pills - 2 column on mobile, row on desktop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 sm:flex sm:flex-wrap justify-center gap-3 sm:gap-4 max-w-3xl mx-auto"
        >
          {[
            { icon: Brain, label: 'Persistent Memory', color: 'text-violet-500', bg: 'bg-violet-500/10' },
            { icon: Shield, label: 'Drift Prevention', color: 'text-rose-500', bg: 'bg-rose-500/10' },
            { icon: Moon, label: 'Dream Cycles', color: 'text-purple-500', bg: 'bg-purple-500/10' },
            { icon: Server, label: 'World Engine', color: 'text-orange-500', bg: 'bg-orange-500/10' },
          ].map(({ icon: Icon, label, color, bg }) => (
            <div 
              key={label}
              className={`flex items-center gap-2 px-3 py-2 rounded-full ${bg} border border-current/10`}
            >
              <Icon className={`w-4 h-4 ${color}`} />
              <span className="text-xs sm:text-sm font-medium text-foreground">{label}</span>
            </div>
          ))}
        </motion.div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap justify-center gap-6 sm:gap-10 mt-10 pt-8 border-t border-border/30"
        >
          {[
            { value: '50+', label: 'Templates' },
            { value: '13', label: 'Core Modules' },
            { value: '0%', label: 'AI Drift' },
            { value: '24/7', label: 'Memory' },
          ].map(({ value, label }) => (
            <div key={label} className="text-center">
              <div className="text-2xl sm:text-3xl font-black text-foreground">{value}</div>
              <div className="text-xs text-muted-foreground">{label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
