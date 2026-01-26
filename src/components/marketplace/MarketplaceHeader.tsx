/**
 * MarketplaceHeader — Compact hero with search
 */

import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Server, Brain, Shield, Moon } from 'lucide-react';
import { MarketplaceSearch } from './MarketplaceSearch';
import { TEMPLATES } from '@/data/templates';

interface MarketplaceHeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  resultCount: number;
}

export function MarketplaceHeader({ searchQuery, onSearchChange, resultCount }: MarketplaceHeaderProps) {
  return (
    <section className="relative bg-gradient-to-b from-primary/5 via-background to-background border-b">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-50" />
        <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl opacity-50" />
      </div>

      <div className="container mx-auto px-4 py-12 md:py-16 relative">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center mb-4"
        >
          <Badge variant="outline" className="gap-2 px-4 py-2 text-sm border-primary/30 bg-primary/5">
            <Sparkles className="w-4 h-4 text-primary" />
            Template Marketplace
          </Badge>
        </motion.div>

        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-5xl font-black mb-3">
            <span className="bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
              AI Templates That
            </span>
            <br />
            <span className="bg-gradient-to-r from-primary via-violet-500 to-cyan-500 bg-clip-text text-transparent">
              Remember, Defend & Evolve
            </span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {TEMPLATES.length}+ production-ready templates for the promptfluid® substrate.
            Build AI that doesn't forget, drift, or get hijacked.
          </p>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <MarketplaceSearch
            value={searchQuery}
            onChange={onSearchChange}
            resultCount={resultCount}
          />
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap justify-center gap-6 mt-8 text-sm"
        >
          <div className="flex items-center gap-2 text-muted-foreground">
            <Brain className="w-4 h-4 text-violet-500" />
            <span>Memory Systems</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Shield className="w-4 h-4 text-rose-500" />
            <span>Drift Prevention</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Moon className="w-4 h-4 text-purple-500" />
            <span>Dream Cycles</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Server className="w-4 h-4 text-orange-500" />
            <span>World Engine</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
