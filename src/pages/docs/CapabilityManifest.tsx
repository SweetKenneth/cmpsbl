/**
 * Capability & Memory Manifest — Downloadable developer reference
 * Shows all public-safe capabilities grouped by tier and system
 */

import { useState, useMemo } from 'react';
import { SEO } from '@/components/SEO';
import { PublicNav } from '@/components/PublicNav';
import { EnhancedFooter } from '@/components/EnhancedFooter';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  Download, Search, Shield, Brain, Zap, Eye, BarChart3,
  CheckCircle2, Lock, Sparkles, FileJson, ArrowRight,
} from 'lucide-react';
import { PUBLIC_CAPABILITY_MANIFEST, type PublicCapability } from '@/lib/capabilities/public-capability-manifest';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const CATEGORY_META: Record<string, { icon: React.ElementType; label: string; color: string }> = {
  security: { icon: Shield, label: 'Security', color: 'text-neon-green' },
  intelligence: { icon: Brain, label: 'Intelligence', color: 'text-neon-purple' },
  optimization: { icon: Zap, label: 'Optimization', color: 'text-neon-amber' },
  compliance: { icon: CheckCircle2, label: 'Compliance', color: 'text-neon-cyan' },
  observability: { icon: Eye, label: 'Observability', color: 'text-neon-magenta' },
};

const TIER_META: Record<string, { label: string; color: string }> = {
  creator: { label: 'Creator', color: 'border-neon-purple/30 text-neon-purple' },
  architect: { label: 'Architect', color: 'border-neon-amber/30 text-neon-amber' },
  enterprise: { label: 'Architect', color: 'border-neon-amber/30 text-neon-amber' },
};

function downloadManifestJSON() {
  const manifest = PUBLIC_CAPABILITY_MANIFEST.map(c => ({
    name: c.name,
    tier: c.tier === 'enterprise' ? 'architect' : c.tier,
    system: c.module,
    outcome: c.outcome_summary,
    category: c.category,
    crown_jewel: c.is_crown_jewel || false,
  }));
  const blob = new Blob([JSON.stringify({ version: '1.0', capabilities: manifest }, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'cmpsbl-capability-manifest.json';
  a.click();
  URL.revokeObjectURL(url);
}

export default function CapabilityManifest() {
  const [search, setSearch] = useState('');
  const [filterTier, setFilterTier] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const filtered = useMemo(() => {
    return PUBLIC_CAPABILITY_MANIFEST.filter(c => {
      if (filterTier !== 'all' && c.tier !== filterTier) return false;
      if (filterCategory !== 'all' && c.category !== filterCategory) return false;
      if (search) {
        const q = search.toLowerCase();
        return c.name.toLowerCase().includes(q) || c.module.toLowerCase().includes(q) || c.outcome_summary.toLowerCase().includes(q);
      }
      return true;
    });
  }, [search, filterTier, filterCategory]);

  const stats = useMemo(() => ({
    total: PUBLIC_CAPABILITY_MANIFEST.length,
    crownJewels: PUBLIC_CAPABILITY_MANIFEST.filter(c => c.is_crown_jewel).length,
    systems: new Set(PUBLIC_CAPABILITY_MANIFEST.map(c => c.module)).size,
  }), []);

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Capability Manifest — CMPSBL Developer Reference"
        description="Browse and download the full CMPSBL capability manifest. Every system, capability, and memory — organized by tier and category."
      />
      <PublicNav />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/30">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
        <div className="container mx-auto px-4 pt-28 pb-14 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto text-center"
          >
            <Badge variant="outline" className="mb-4 px-3 py-1 text-xs border-primary/30">
              <FileJson className="w-3 h-3 mr-1.5 inline" />
              Developer Reference
            </Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mb-4">
              Capability <span className="text-primary">Manifest</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-6 max-w-xl mx-auto">
              {stats.total} capabilities across {stats.systems} systems. {stats.crownJewels} Apex Discoveries.
              Browse, search, or download the full JSON manifest.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button onClick={downloadManifestJSON} className="gap-2">
                <Download className="w-4 h-4" />
                Download JSON Manifest
              </Button>
              <Button variant="outline" asChild>
                <Link to="/documentation">
                  Full Docs <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Filters */}
      <section className="border-b border-border/30 sticky top-16 z-30 bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search capabilities..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
            </div>
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar" style={{ scrollbarWidth: 'none' }}>
              {['all', 'creator', 'architect'].map(t => (
                <button
                  key={t}
                  onClick={() => setFilterTier(t)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0",
                    filterTier === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  {t === 'all' ? 'All Tiers' : t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
              <div className="w-px bg-border/50 mx-1" />
              {Object.entries(CATEGORY_META).map(([key, meta]) => {
                const CIcon = meta.icon;
                return (
                  <button
                    key={key}
                    onClick={() => setFilterCategory(filterCategory === key ? 'all' : key)}
                    className={cn(
                      "flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0",
                      filterCategory === key ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/50"
                    )}
                  >
                    <CIcon className={cn("w-3 h-3", meta.color)} />
                    {meta.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="container mx-auto px-4 py-10">
        <p className="text-sm text-muted-foreground mb-6">{filtered.length} capabilities</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((cap, i) => {
            const catMeta = CATEGORY_META[cap.category] || CATEGORY_META.intelligence;
            const tierMeta = TIER_META[cap.tier] || TIER_META.creator;
            const CatIcon = catMeta.icon;
            return (
              <motion.div
                key={`${cap.name}-${i}`}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.02, 0.5) }}
              >
                <Card className="h-full border-border/40 hover:border-primary/20 transition-colors bg-card/50">
                  <CardContent className="p-4 space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <CatIcon className={cn("w-4 h-4 shrink-0", catMeta.color)} />
                        <h3 className="text-sm font-bold leading-tight">{cap.name}</h3>
                      </div>
                      {cap.is_crown_jewel && (
                        <Sparkles className="w-3.5 h-3.5 text-neon-amber shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{cap.outcome_summary}</p>
                    <div className="flex items-center gap-2 pt-1">
                      <Badge variant="outline" className="text-[9px] px-1.5 py-0 font-mono">{cap.module}</Badge>
                      <Badge variant="outline" className={cn("text-[9px] px-1.5 py-0", tierMeta.color)}>
                        {tierMeta.label}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            <p>No capabilities match your filters.</p>
          </div>
        )}
      </section>

      {/* Bottom CTA */}
      <section className="border-t border-border/30 bg-muted/20">
        <div className="container mx-auto px-4 py-14 text-center">
          <h2 className="text-2xl font-bold mb-3">Ready to Build?</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Start with 30 free templates or explore the full artifact catalog.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild>
              <Link to="/templates">
                <Sparkles className="w-4 h-4 mr-2" />
                Free Templates
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/store?tab=plans">View Plans</Link>
            </Button>
          </div>
        </div>
      </section>

      <EnhancedFooter />
    </div>
  );
}
