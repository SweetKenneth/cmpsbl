/**
 * MarketplaceHeader — Premium hero with immersive visuals
 * Mobile-first, visually compelling marketplace entrance
 */

import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Sparkles, Brain, Shield, Moon, Zap, Server, 
  ChevronRight, Award, TrendingUp, Star, Gift, Rocket
} from 'lucide-react';
import { MarketplaceSearch } from './MarketplaceSearch';
import { TEMPLATES } from '@/data/templates';
import { BUNDLES, AGENCY_PACKS } from '@/config/marketplace-bundles';
import { Link } from 'react-router-dom';

interface MarketplaceHeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  resultCount: number;
}

export function MarketplaceHeader({ searchQuery, onSearchChange, resultCount }: MarketplaceHeaderProps) {
  return (
    <section className="relative overflow-hidden">
      {/* Immersive background with richer gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-violet-500/5" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.15),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,hsl(280_100%_60%/0.08),transparent_50%)]" />
      
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
        {/* Trust badges with enhanced styling */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap justify-center gap-2 mb-6"
        >
          <Badge variant="outline" className="gap-1.5 px-3 py-1.5 bg-background/50 backdrop-blur-sm border-primary/30 shadow-lg shadow-primary/5">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span className="text-xs font-medium">Trusted by 500+ developers</span>
          </Badge>
          <Badge variant="outline" className="gap-1.5 px-3 py-1.5 bg-background/50 backdrop-blur-sm border-emerald-500/30 shadow-lg shadow-emerald-500/5">
            <Award className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-xs font-medium">Zero Drift Guarantee</span>
          </Badge>
          <Badge variant="outline" className="gap-1.5 px-3 py-1.5 bg-background/50 backdrop-blur-sm border-violet-500/30 shadow-lg shadow-violet-500/5 hidden sm:flex">
            <Rocket className="w-3.5 h-3.5 text-violet-500" />
            <span className="text-xs font-medium">{TEMPLATES.length}+ Templates</span>
          </Badge>
        </motion.div>

        {/* Main headline with enhanced typography */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-8"
        >
           <h1 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 tracking-tight">
             <span className="text-foreground">AI Templates That</span>
             <br />
             <span className="text-primary">Never Forget</span>
           </h1>
        <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4 leading-relaxed">
            {TEMPLATES.length}+ production-ready cognitive templates with built-in memory,
            drift prevention & self-improvement. 
            <span className="block mt-1 font-medium text-foreground">
              From <span className="text-primary">$19</span> • Bundles from <span className="text-emerald-500">${(BUNDLES[2]?.bundlePrice / 100 || 95).toFixed(0)}</span>
            </span>
          </p>
        </motion.div>

        {/* Search with enhanced wrapper */}
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
          className="grid grid-cols-2 sm:flex sm:flex-wrap justify-center gap-3 sm:gap-4 max-w-4xl mx-auto"
        >
          {[
            { icon: Brain, label: 'Persistent Memory', color: 'text-violet-500', bg: 'bg-violet-500/10', border: 'border-violet-500/20' },
            { icon: Shield, label: 'Drift Prevention', color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
            { icon: Moon, label: 'Offline Learning', color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
            { icon: Server, label: 'NEXUS Router', color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
            { icon: Zap, label: 'Multi-Provider', color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
          ].map(({ icon: Icon, label, color, bg, border }) => (
            <motion.div 
              key={label}
              whileHover={{ scale: 1.05 }}
              className={`flex items-center gap-2 px-3 py-2 rounded-full ${bg} border ${border} cursor-default transition-shadow hover:shadow-lg`}
            >
              <Icon className={`w-4 h-4 ${color}`} />
              <span className="text-xs sm:text-sm font-medium text-foreground">{label}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats bar with enhanced styling */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap justify-center gap-6 sm:gap-10 mt-10 pt-8 border-t border-border/30"
        >
          {[
            { value: `${TEMPLATES.length}+`, label: 'Templates', accent: 'text-primary' },
            { value: '14', label: 'Core Nodes', accent: 'text-violet-500' },
            { value: '0%', label: 'AI Drift', accent: 'text-emerald-500' },
            { value: `${BUNDLES.length}`, label: 'Bundles', accent: 'text-orange-500' },
          ].map(({ value, label, accent }) => (
            <div key={label} className="text-center group cursor-default">
              <div className={`text-2xl sm:text-3xl font-black ${accent} transition-transform group-hover:scale-110`}>{value}</div>
              <div className="text-xs text-muted-foreground">{label}</div>
            </div>
          ))}
        </motion.div>

        {/* Quick CTAs for funnel */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-wrap justify-center gap-3 mt-8"
        >
          <Button variant="outline" size="sm" className="gap-2 text-xs" asChild>
            <Link to="#bundles">
              <Gift className="w-3.5 h-3.5" />
              View Bundles
            </Link>
          </Button>
          <Button variant="outline" size="sm" className="gap-2 text-xs border-orange-500/30 text-orange-600 hover:bg-orange-500/10" asChild>
            <Link to="#agencies">
              <TrendingUp className="w-3.5 h-3.5" />
              For Agencies
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
