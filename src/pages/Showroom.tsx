/**
 * Showroom — Solution-forward marketplace of Memory Stream discoveries.
 * Searchable, sortable by pain point, tier-differentiated.
 * Clear, human-readable descriptions focused on what the software *does*.
 */

import { useState, useMemo, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Search, Filter, ArrowRight, Sparkles, Shield, Zap, Package,
  Brain, Eye, Lock, RefreshCw, Wrench, ChevronDown, X, Star,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { PublicNav } from '@/components/PublicNav';
import { EnhancedFooter } from '@/components/EnhancedFooter';
import { useAuth } from '@/contexts/AuthContext';
import { useVaultState } from '@/hooks/useVaultState';
import { type PublicTier, getTierBadgeClass, PUBLIC_TIERS } from '@/lib/foundry/public-tiers';
import { getFunctionalDescription } from '@/lib/pipeline-descriptions';

// ═══ Pain-point categories ═══
const PAIN_POINTS = [
  { id: 'all', label: 'All Solutions', icon: Package },
  { id: 'security', label: 'Security & Compliance', icon: Shield },
  { id: 'intelligence', label: 'Decision Making', icon: Brain },
  { id: 'observability', label: 'Monitoring & Visibility', icon: Eye },
  { id: 'resilience', label: 'Reliability & Recovery', icon: RefreshCw },
  { id: 'governance', label: 'Policy & Governance', icon: Lock },
  { id: 'optimization', label: 'Performance', icon: Zap },
] as const;

type PainPointId = typeof PAIN_POINTS[number]['id'];

// ═══ Tier filter config ═══
const TIER_FILTERS: { id: PublicTier | 'all'; label: string; color: string }[] = [
  { id: 'all', label: 'All Tiers', color: 'text-foreground' },
  { id: 'Apex', label: 'Apex · $1,952', color: 'text-primary' },
  { id: 'Mythic', label: 'Mythic · $188–$198', color: 'text-purple-400' },
  { id: 'Relic', label: 'Relic · $135–$140', color: 'text-amber-400' },
  { id: 'Prime', label: 'Prime · $100–$111', color: 'text-sky-400' },
  { id: 'Mint', label: 'Mint · $68–$79', color: 'text-emerald-400' },
];

// ═══ Solution-forward description generator ═══
function toSolutionDescription(name: string, chain: string[], category: string | null): string {
  const technical = getFunctionalDescription(name, chain);
  
  // Map technical descriptions to solution-forward language
  const painMap: Record<string, string> = {
    security: 'Protects your software from vulnerabilities and unauthorized access.',
    governance: 'Keeps your systems compliant with policies and audit requirements.',
    intelligence: 'Helps your software make smarter decisions automatically.',
    data: 'Manages and protects your data across all operations.',
    routing: 'Ensures the right information reaches the right place instantly.',
    optimization: 'Makes your software faster, leaner, and more efficient.',
    events: 'Responds to changes in real-time so nothing slips through.',
    analysis: 'Finds patterns and problems before they become costly.',
    resilience: 'Keeps your systems running even when things go wrong.',
    observability: 'Gives you full visibility into what your software is doing.',
    compliance: 'Ensures your software meets accessibility and industry standards.',
    generation: 'Creates and maintains code artifacts automatically.',
    integration: 'Connects your systems so they work together seamlessly.',
    simulation: 'Tests changes safely before they hit production.',
    coordination: 'Keeps all parts of your system in sync.',
    translation: 'Bridges language and format barriers across your stack.',
    economics: 'Tracks and optimizes the cost of running your software.',
    maintenance: 'Keeps everything running smoothly with minimal intervention.',
    orchestration: 'Manages complex workflows from start to finish.',
  };

  // Try to find a matching domain for a cleaner description
  if (category && painMap[category]) {
    return painMap[category];
  }
  
  // Fallback to enriched technical description
  return technical;
}

// ═══ Map domains to pain point filter IDs ═══
function domainToPainPoint(category: string | null): PainPointId {
  if (!category) return 'all';
  const map: Record<string, PainPointId> = {
    security: 'security',
    governance: 'governance',
    compliance: 'governance',
    intelligence: 'intelligence',
    analysis: 'intelligence',
    routing: 'intelligence',
    data: 'observability',
    observability: 'observability',
    events: 'observability',
    resilience: 'resilience',
    maintenance: 'resilience',
    optimization: 'optimization',
    economics: 'optimization',
    generation: 'optimization',
    orchestration: 'optimization',
    integration: 'optimization',
    simulation: 'optimization',
    coordination: 'optimization',
    translation: 'optimization',
  };
  return map[category] || 'all';
}

// ═══ Price calculator ═══
function getPrice(score: number): string {
  if (score === 100) return '$1,952';
  if (score >= 94) return `$${(score * 2).toLocaleString()}`;
  if (score >= 90) return `$${Math.round(score * 1.5).toLocaleString()}`;
  if (score >= 80) return `$${Math.round(score * 1.25).toLocaleString()}`;
  if (score >= 68) return `$${score}`;
  return 'Free';
}

function getTierLabel(score: number): PublicTier {
  if (score === 100) return 'Apex';
  if (score >= 94) return 'Mythic';
  if (score >= 90) return 'Relic';
  if (score >= 80) return 'Prime';
  if (score >= 68) return 'Mint';
  return 'Raw';
}

// ═══ Discovery card ═══
function DiscoveryCard({ item }: { item: ShowroomItem }) {
  const tier = getTierLabel(item.score);
  const badgeClass = getTierBadgeClass(tier);
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "group relative rounded-2xl border bg-card/50 backdrop-blur-sm p-5 sm:p-6",
        "hover:border-primary/30 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5",
        "transition-all duration-300",
        tier === 'Apex' && "ring-1 ring-primary/20",
        tier === 'Mythic' && "ring-1 ring-purple-500/15",
      )}
    >
      {/* Tier + Price header */}
      <div className="flex items-start justify-between mb-3">
        <Badge variant="outline" className={cn("text-[10px] font-black tracking-wider border", badgeClass)}>
          {tier}
        </Badge>
        <div className="text-right">
          <div className="text-lg font-black text-foreground">{getPrice(item.score)}</div>
          <div className="text-[10px] text-muted-foreground">CJPI {item.score}</div>
        </div>
      </div>

      {/* Name */}
      <h3 className="text-sm sm:text-base font-bold text-foreground mb-2 leading-tight group-hover:text-primary transition-colors">
        {item.name}
      </h3>

      {/* Solution description — plain language */}
      <p className="text-xs sm:text-sm text-muted-foreground/80 leading-relaxed mb-4">
        {item.solutionDesc}
      </p>

      {/* Category pill */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-medium text-muted-foreground/60 px-2 py-0.5 rounded-full border border-border/30 bg-muted/20">
          {item.painLabel}
        </span>
        {item.chain.length > 0 && (
          <span className="text-[10px] text-muted-foreground/40">
            {item.chain.length} specialist{item.chain.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* One-shot indicator */}
      {tier !== 'Raw' && (
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-2 h-2 rounded-full bg-primary/50 animate-pulse" />
        </div>
      )}
    </motion.div>
  );
}

interface ShowroomItem {
  id: string;
  name: string;
  score: number;
  chain: string[];
  category: string | null;
  solutionDesc: string;
  painLabel: string;
  painId: PainPointId;
}

// ═══ Main page ═══
export default function Showroom() {
  const { user } = useAuth();
  const vault = useVaultState();
  const [search, setSearch] = useState('');
  const [painFilter, setPainFilter] = useState<PainPointId>('all');
  const [tierFilter, setTierFilter] = useState<PublicTier | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Transform vault discoveries into showroom items
  const items: ShowroomItem[] = useMemo(() => {
    const raw = vault.inventory || [];
    return raw.map((item: any) => {
      const chain = item.systemChain || item.system_chain || [];
      const cat = item.category || null;
      const painId = domainToPainPoint(cat);
      const painConfig = PAIN_POINTS.find(p => p.id === painId);
      return {
        id: item.id || item.artifactId,
        name: item.artifactName || item.artifact_name || item.name || 'Unknown Discovery',
        score: item.score || 0,
        chain,
        category: cat,
        solutionDesc: toSolutionDescription(item.artifactName || item.name || '', chain, cat),
        painLabel: painConfig?.label || 'General',
        painId,
      };
    }).sort((a: ShowroomItem, b: ShowroomItem) => b.score - a.score);
  }, [vault.inventory]);

  // Demo items when no vault data
  const demoItems: ShowroomItem[] = useMemo(() => {
    if (items.length > 0) return [];
    return [
      { id: 'd1', name: 'Drift Prevention Engine', score: 97, chain: ['GOVERNANCE', 'EVOLUTION', 'AUDIT'], category: 'governance', solutionDesc: 'Stops your software from quietly changing behavior over time. Catches configuration drift before it causes production issues.', painLabel: 'Policy & Governance', painId: 'governance' },
      { id: 'd2', name: 'Threat Hardening Pipeline', score: 94, chain: ['DEFENSE', 'SENTINEL', 'IDENTITY'], category: 'security', solutionDesc: 'Finds and fixes security vulnerabilities in your existing code without rewriting it. Hardens authentication and access controls.', painLabel: 'Security & Compliance', painId: 'security' },
      { id: 'd3', name: 'Self-Healing Runtime', score: 91, chain: ['MEDIC', 'SYSTEM', 'DEFENSE'], category: 'resilience', solutionDesc: 'Detects failures and recovers automatically. Keeps your systems running even when individual components break.', painLabel: 'Reliability & Recovery', painId: 'resilience' },
      { id: 'd4', name: 'Predictive Decision Core', score: 88, chain: ['ORACLE', 'BRAIN', 'CORTEX'], category: 'intelligence', solutionDesc: 'Anticipates what your software needs before problems happen. Makes smarter automated decisions based on patterns.', painLabel: 'Decision Making', painId: 'intelligence' },
      { id: 'd5', name: 'Full-Stack Observer', score: 85, chain: ['ANALYTICS', 'VISION', 'ECHO'], category: 'observability', solutionDesc: 'Shows you exactly what your software is doing at every level. Replays events and surfaces issues before users notice.', painLabel: 'Monitoring & Visibility', painId: 'observability' },
      { id: 'd6', name: 'Cost Optimization Engine', score: 82, chain: ['ECONOMY', 'HARMONY', 'EVOLUTION'], category: 'optimization', solutionDesc: 'Finds where your software is wasting resources and fixes it. Balances performance against infrastructure costs.', painLabel: 'Performance', painId: 'optimization' },
      { id: 'd7', name: 'Compliance Certification Suite', score: 100, chain: ['AUDIT', 'GOVERNANCE', 'WITNESS', 'INCLUSIVE'], category: 'governance', solutionDesc: 'Generates audit-ready compliance reports and certificates. Proves your software meets industry standards — automatically.', painLabel: 'Policy & Governance', painId: 'governance' },
      { id: 'd8', name: 'Legacy API Bridge', score: 79, chain: ['INTEGRATION', 'LINGUA', 'NEXUS'], category: 'integration', solutionDesc: 'Connects your old APIs with modern systems without rewriting either side. Translates formats and protocols on the fly.', painLabel: 'Performance', painId: 'optimization' },
      { id: 'd9', name: 'Encrypted State Vault', score: 96, chain: ['MEMORY', 'PHANTOM', 'DEFENSE'], category: 'security', solutionDesc: 'Stores sensitive data with military-grade encryption. No one — not even us — can read it without your keys.', painLabel: 'Security & Compliance', painId: 'security' },
      { id: 'd10', name: 'Autonomous Patch Pipeline', score: 74, chain: ['EVOLUTION', 'ENGINEER', 'SYSTEM'], category: 'maintenance', solutionDesc: 'Finds outdated dependencies and patches them safely. Keeps your software up to date without breaking anything.', painLabel: 'Performance', painId: 'optimization' },
      { id: 'd11', name: 'Real-Time Anomaly Detector', score: 93, chain: ['SENTINEL', 'ANALYTICS', 'REFLEX'], category: 'observability', solutionDesc: 'Spots unusual behavior the moment it happens. Alerts you before small anomalies become big outages.', painLabel: 'Monitoring & Visibility', painId: 'observability' },
      { id: 'd12', name: 'Smart Workflow Orchestrator', score: 86, chain: ['SYSTEM', 'COMPASS', 'NERVE'], category: 'orchestration', solutionDesc: 'Manages complex multi-step processes without manual intervention. Routes tasks to the right component automatically.', painLabel: 'Performance', painId: 'optimization' },
    ];
  }, [items]);

  const displayItems = items.length > 0 ? items : demoItems;

  // Filtered results
  const filtered = useMemo(() => {
    let result = displayItems;
    
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(i => 
        i.name.toLowerCase().includes(q) || 
        i.solutionDesc.toLowerCase().includes(q) ||
        i.painLabel.toLowerCase().includes(q)
      );
    }
    
    if (painFilter !== 'all') {
      result = result.filter(i => i.painId === painFilter);
    }
    
    if (tierFilter !== 'all') {
      result = result.filter(i => getTierLabel(i.score) === tierFilter);
    }
    
    return result;
  }, [displayItems, search, painFilter, tierFilter]);

  return (
    <>
      <Helmet>
        <title>Showroom — Browse Certified Software Discoveries | CMPSBL</title>
        <meta name="description" content="Find exactly what your software needs. Search by problem, sort by solution, and purchase one-of-a-kind certified discoveries from the CMPSBL refurbishment catalog." />
        <link rel="canonical" href="https://cmpsbl.com/showroom" />
      </Helmet>

      <PublicNav />

      <main className="min-h-screen pt-24 sm:pt-28 pb-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          
          {/* ═══ HERO ═══ */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10 sm:mb-14"
          >
            <Badge variant="outline" className="mb-5 border-primary/30 px-4 py-1.5 inline-flex backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 mr-2 text-primary" />
              <span className="text-xs font-semibold tracking-wide">The Showroom</span>
            </Badge>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mb-4">
              Find What Your Software <span className="text-primary">Needs</span>
            </h1>

            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8">
              Every discovery is a one-of-a-kind certified capability. Search by the problem you're solving.
              Once purchased, it's retired from the catalog forever.
            </p>

            {/* Search bar */}
            <div className="relative max-w-2xl mx-auto">
              <div className={cn(
                "relative flex items-center transition-all duration-300",
                "bg-card border rounded-2xl shadow-lg border-border/50",
              )}>
                <Search className="absolute left-4 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by problem... (e.g., 'security', 'drift prevention', 'compliance')"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-12 pr-24 py-6 text-base bg-transparent border-0 focus-visible:ring-0 placeholder:text-muted-foreground/60"
                />
                {search && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-14 h-8 w-8"
                    onClick={() => setSearch('')}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-3 h-9 w-9"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className={cn("w-4 h-4", showFilters && "text-primary")} />
                </Button>
              </div>

              {/* Result count */}
              <div className="mt-3 text-center">
                <span className="text-sm text-muted-foreground">
                  Showing <span className="font-semibold text-foreground">{filtered.length}</span> {filtered.length === 1 ? 'discovery' : 'discoveries'}
                  {items.length === 0 && <span className="text-muted-foreground/50 ml-1">(demo catalog)</span>}
                </span>
              </div>
            </div>
          </motion.div>

          {/* ═══ FILTERS ═══ */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mb-8"
              >
                <div className="rounded-2xl border border-border/40 bg-card/40 backdrop-blur-sm p-5 sm:p-6 space-y-5">
                  {/* Tier filters */}
                  <div>
                    <div className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.15em] mb-2.5">Quality Tier</div>
                    <div className="flex flex-wrap gap-2">
                      {TIER_FILTERS.map(t => (
                        <Button
                          key={t.id}
                          variant={tierFilter === t.id ? "default" : "outline"}
                          size="sm"
                          className={cn(
                            "text-xs font-bold rounded-xl h-8",
                            tierFilter === t.id 
                              ? "shadow-sm" 
                              : "hover:border-primary/30"
                          )}
                          onClick={() => setTierFilter(t.id)}
                        >
                          <span className={tierFilter !== t.id ? t.color : ''}>{t.label}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ═══ PAIN POINT TABS ═══ */}
          <div className="flex items-center gap-2 mb-8 overflow-x-auto scrollbar-hide pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
            {PAIN_POINTS.map(pp => (
              <Button
                key={pp.id}
                variant={painFilter === pp.id ? "default" : "outline"}
                size="sm"
                className={cn(
                  "gap-1.5 text-xs font-bold rounded-xl whitespace-nowrap shrink-0 h-9",
                  painFilter === pp.id
                    ? "shadow-md shadow-primary/20"
                    : "hover:border-primary/30 hover:bg-primary/5"
                )}
                onClick={() => setPainFilter(pp.id)}
              >
                <pp.icon className="w-3.5 h-3.5" />
                {pp.label}
              </Button>
            ))}
          </div>

          {/* ═══ GRID ═══ */}
          <AnimatePresence mode="popLayout">
            {filtered.length > 0 ? (
              <motion.div
                layout
                className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5"
              >
                {filtered.map(item => (
                  <DiscoveryCard key={item.id} item={item} />
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
              >
                <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
                <p className="text-muted-foreground font-medium mb-2">No discoveries match your search</p>
                <p className="text-sm text-muted-foreground/60 mb-6">Try a different problem or broaden your filters</p>
                <Button variant="outline" size="sm" onClick={() => { setSearch(''); setPainFilter('all'); setTierFilter('all'); }}>
                  Clear Filters
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ═══ PRICING GUIDE ═══ */}
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            className="mt-20 sm:mt-28"
          >
            <div className="rounded-2xl border border-border/30 bg-card/30 backdrop-blur-sm p-6 sm:p-8">
              <div className="text-center mb-8">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight mb-2">How Pricing Works</h2>
                <p className="text-sm text-muted-foreground max-w-lg mx-auto">
                  Every discovery is scored by CJPI. Higher scores mean more complex, more capable software. One purchase — it's yours forever.
                </p>
              </div>

              <div className="grid sm:grid-cols-5 gap-3">
                {[
                  { tier: 'Mint', range: '68–79', rate: '$1/pt', example: '$68–$79', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
                  { tier: 'Prime', range: '80–89', rate: '$1.25/pt', example: '$100–$111', color: 'text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-500/30' },
                  { tier: 'Relic', range: '90–93', rate: '$1.50/pt', example: '$135–$140', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
                  { tier: 'Mythic', range: '94–99', rate: '$2/pt', example: '$188–$198', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
                  { tier: 'Apex', range: '100', rate: 'Fixed', example: '$1,952', color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/30' },
                ].map(t => (
                  <div key={t.tier} className={cn("rounded-xl border p-4 text-center", t.bg, t.border)}>
                    <div className={cn("text-xs font-black uppercase tracking-wider mb-1.5", t.color)}>{t.tier}</div>
                    <div className="text-base font-black text-foreground mb-1">{t.example}</div>
                    <div className="text-[10px] text-muted-foreground">CJPI {t.range} · {t.rate}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.section>

          {/* ═══ BOTTOM CTA ═══ */}
          <motion.section
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-16 sm:mt-20 text-center pb-8"
          >
            <p className="text-sm text-muted-foreground/70 mb-6 max-w-md mx-auto">
              Don't see what you need? Bring us your code and we'll find capabilities you didn't know you had.
            </p>
            <Button asChild size="lg" className="gap-2 rounded-xl font-bold">
              <Link to="/ascension">
                <Wrench className="w-4 h-4" />
                Book a Consultation
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </Button>
          </motion.section>
        </div>
      </main>

      <EnhancedFooter />
    </>
  );
}
