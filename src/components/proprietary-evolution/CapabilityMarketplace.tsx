/**
 * Capability Marketplace — Grouped Bundle View with Drill-Down
 * 
 * Displays discovered capabilities organized into thematic bundles.
 * Users select bundles (or drill into individual capabilities) before ascending.
 * AI-Proposed / Human-Approved governance model.
 */

import { useState, useMemo, useCallback } from 'react';
import {
  Brain, Shield, Workflow, Code2, Database, Scale, Sparkles, Eye, KeyRound,
  Zap, ChevronDown, ChevronRight, Check, Minus, Package, Trophy, Layers,
  Link2, Trash2, Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { labelPrimitive } from '@/lib/export/primitive-labels';

// ═══ TYPES ═══

export interface CollisionResult {
  nodeA: string;
  nodeB: string;
  capability: string;
  cjpiScore: number;
  tier: string;
  chain?: string[];
  chainDepth?: number;
  sectorsCrossed?: number;
  synergyBonus?: number;
  description?: string;
}

interface CapabilityBundle {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  nodes: Set<string>;
  capabilities: CollisionResult[];
  avgCjpi: number;
  maxCjpi: number;
  tierBreakdown: Record<string, number>;
}

// ═══ BUNDLE DEFINITIONS ═══

const BUNDLE_DEFS: {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  nodes: string[];
  businessValue: string;
}[] = [
  {
    id: 'cognitive',
    name: 'Cognitive Intelligence',
    description: 'Autonomous reasoning, persistent memory, and generative synthesis',
    icon: Brain,
    nodes: ['BRAIN', 'MEMORY', 'DREAM'],
    businessValue: 'Your code gains the ability to reason, remember, and imagine — turning static logic into adaptive intelligence.',
  },
  {
    id: 'predictive',
    name: 'Predictive Analytics',
    description: 'Forecasting, temporal replay, and navigational awareness',
    icon: Sparkles,
    nodes: ['ORACLE', 'ECHO', 'COMPASS'],
    businessValue: 'See the future before it arrives. Predictive capabilities that turn your data into foresight.',
  },
  {
    id: 'security',
    name: 'Security & Defense',
    description: 'Threat detection, adaptive immunity, stealth routing, and divergence testing',
    icon: Shield,
    nodes: ['DEFENSE', 'IMMUNITY', 'PHANTOM', 'SHADOW'],
    businessValue: 'Multi-layer security architecture that hardens, adapts, and makes your attack surface invisible.',
  },
  {
    id: 'orchestration',
    name: 'Orchestration & Workflow',
    description: 'Task coordination, intent routing, signal consensus, and event propagation',
    icon: Workflow,
    nodes: ['CORTEX', 'INTENT', 'NERVE', 'RIPPLE'],
    businessValue: 'Coordinate complex multi-step workflows with intelligent routing and real-time signal processing.',
  },
  {
    id: 'codegen',
    name: 'Code & Build',
    description: 'Code generation, parsing, artifact scaffolding, and performance optimization',
    icon: Code2,
    nodes: ['ENCODE', 'DECODE', 'FORGE', 'ENGINEER'],
    businessValue: 'Autonomous software manufacturing — from spec to deployed artifact without manual intervention.',
  },
  {
    id: 'data',
    name: 'Data & Intelligence',
    description: 'Data acquisition, language translation, and dependency resolution',
    icon: Database,
    nodes: ['HARVEST', 'LINGUA', 'INTEGRATION'],
    businessValue: 'Acquire, translate, and integrate data from any source in any language automatically.',
  },
  {
    id: 'governance',
    name: 'Governance & Ethics',
    description: 'Policy enforcement, bias detection, compliance negotiation, and immutable audit',
    icon: Scale,
    nodes: ['GOVERNANCE', 'CONSCIENCE', 'TREATY', 'AUDIT'],
    businessValue: 'Built-in ethical guardrails and compliance automation — governance that scales with your system.',
  },
  {
    id: 'evolution',
    name: 'Evolution & Optimization',
    description: 'Adaptive mutation, edge computing, and isolated execution',
    icon: Zap,
    nodes: ['EVOLUTION', 'REFLEX', 'SANDBOX'],
    businessValue: 'Self-improving systems that evolve, react at edge speed, and safely test mutations in isolation.',
  },
  {
    id: 'identity',
    name: 'Identity & Access',
    description: 'Authentication, entity resolution, data sovereignty, and webhook dispatch',
    icon: KeyRound,
    nodes: ['ACCESS', 'IDENTITY', 'SOVEREIGN', 'RELAY'],
    businessValue: 'Enterprise-grade identity, entitlements, and cross-border data sovereignty out of the box.',
  },
  {
    id: 'observability',
    name: 'Observability & Health',
    description: 'Telemetry rendering, capability governance, cost metering, diagnostics, and accessibility',
    icon: Eye,
    nodes: ['VISION', 'ATLAS', 'ECONOMY', 'MEDIC', 'INCLUSIVE', 'CORE', 'SYSTEM', 'NEXUS'],
    businessValue: 'Full-spectrum observability — see, measure, diagnose, and optimize every aspect of your system.',
  },
];

// ═══ TIER HELPERS ═══

const tierColor = (tier: string) => {
  const colors: Record<string, string> = {
    apex: 'text-neon-amber', mythic: 'text-neon-purple', relic: 'text-neon-blue',
    prime: 'text-neon-green', mint: 'text-muted-foreground',
  };
  return colors[tier] || 'text-muted-foreground';
};

const tierBg = (tier: string) => {
  const colors: Record<string, string> = {
    apex: 'bg-neon-amber/10 border-neon-amber/20',
    mythic: 'bg-neon-purple/10 border-neon-purple/20',
    relic: 'bg-neon-blue/10 border-neon-blue/20',
    prime: 'bg-neon-green/10 border-neon-green/15',
    mint: 'bg-muted/10 border-border/20',
  };
  return colors[tier] || 'bg-muted/10 border-border/20';
};

// ═══ COMPONENT ═══

interface CapabilityMarketplaceProps {
  results: CollisionResult[];
  selectedCapabilities: Set<string>;
  onSelectionChange: (selected: Set<string>) => void;
  onDiscard: (result: CollisionResult, idx: number) => void;
  discardingId: string | null;
}

export function CapabilityMarketplace({
  results,
  selectedCapabilities,
  onSelectionChange,
  onDiscard,
  discardingId,
}: CapabilityMarketplaceProps) {
  const [expandedBundle, setExpandedBundle] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'bundles' | 'individual'>('bundles');

  // Group results into bundles
  const bundles = useMemo(() => {
    const grouped: CapabilityBundle[] = [];

    for (const def of BUNDLE_DEFS) {
      const nodeSet = new Set(def.nodes);
      const matching = results.filter(r => {
        // Check if any chain node belongs to this bundle
        const chainNodes = r.chain || [r.nodeA, r.nodeB];
        return chainNodes.some(n => nodeSet.has(n));
      });

      if (matching.length === 0) continue;

      const avgCjpi = Math.round(matching.reduce((s, r) => s + r.cjpiScore, 0) / matching.length);
      const maxCjpi = Math.max(...matching.map(r => r.cjpiScore));

      const tierBreakdown: Record<string, number> = {};
      for (const r of matching) {
        tierBreakdown[r.tier] = (tierBreakdown[r.tier] || 0) + 1;
      }

      grouped.push({
        id: def.id,
        name: def.name,
        description: def.description,
        icon: def.icon,
        nodes: nodeSet,
        capabilities: matching.sort((a, b) => b.cjpiScore - a.cjpiScore),
        avgCjpi,
        maxCjpi,
        tierBreakdown,
      });
    }

    return grouped.sort((a, b) => b.maxCjpi - a.maxCjpi);
  }, [results]);

  // Selection helpers
  const toggleCapability = useCallback((capName: string) => {
    const next = new Set(selectedCapabilities);
    if (next.has(capName)) {
      next.delete(capName);
    } else {
      next.add(capName);
    }
    onSelectionChange(next);
  }, [selectedCapabilities, onSelectionChange]);

  const toggleBundle = useCallback((bundle: CapabilityBundle) => {
    const next = new Set(selectedCapabilities);
    const allSelected = bundle.capabilities.every(c => next.has(c.capability));
    
    if (allSelected) {
      // Deselect all in bundle
      for (const c of bundle.capabilities) next.delete(c.capability);
    } else {
      // Select all in bundle
      for (const c of bundle.capabilities) next.add(c.capability);
    }
    onSelectionChange(next);
  }, [selectedCapabilities, onSelectionChange]);

  const selectAll = useCallback(() => {
    onSelectionChange(new Set(results.map(r => r.capability)));
  }, [results, onSelectionChange]);

  const deselectAll = useCallback(() => {
    onSelectionChange(new Set());
  }, [onSelectionChange]);

  const getBundleSelectionState = (bundle: CapabilityBundle): 'all' | 'some' | 'none' => {
    const selected = bundle.capabilities.filter(c => selectedCapabilities.has(c.capability)).length;
    if (selected === 0) return 'none';
    if (selected === bundle.capabilities.length) return 'all';
    return 'some';
  };

  const selectedCount = results.filter(r => selectedCapabilities.has(r.capability)).length;

  return (
    <div className="space-y-4">
      {/* ═══ Header Bar ═══ */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-primary" />
          <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
            Capability Marketplace
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center rounded-lg border border-border/20 overflow-hidden">
            <button
              onClick={() => setViewMode('bundles')}
              className={cn(
                "px-2.5 py-1 text-[10px] font-mono transition-colors",
                viewMode === 'bundles'
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Bundles
            </button>
            <button
              onClick={() => setViewMode('individual')}
              className={cn(
                "px-2.5 py-1 text-[10px] font-mono transition-colors",
                viewMode === 'individual'
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Individual
            </button>
          </div>

          {/* Bulk actions */}
          <Button size="sm" variant="ghost" onClick={selectAll} className="h-7 text-[10px]">
            Select All
          </Button>
          <Button size="sm" variant="ghost" onClick={deselectAll} className="h-7 text-[10px]">
            Clear
          </Button>
        </div>
      </div>

      {/* Selection summary */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/5 border border-primary/10">
        <Check className="w-3.5 h-3.5 text-primary" />
        <span className="text-xs text-foreground font-medium">
          {selectedCount} of {results.length} capabilities selected
        </span>
        <span className="text-[10px] text-muted-foreground">
          — selected capabilities will be locked during Ascension
        </span>
      </div>

      {/* ═══ BUNDLE VIEW ═══ */}
      {viewMode === 'bundles' && (
        <div className="space-y-2">
          {bundles.map(bundle => {
            const isExpanded = expandedBundle === bundle.id;
            const selState = getBundleSelectionState(bundle);
            const BundleIcon = bundle.icon;
            const topTier = Object.entries(bundle.tierBreakdown)
              .sort(([,a], [,b]) => b - a)[0]?.[0] || 'mint';

            return (
              <div
                key={bundle.id}
                className={cn(
                  "rounded-xl border transition-all",
                  selState === 'all'
                    ? "border-primary/30 bg-primary/[0.03]"
                    : selState === 'some'
                    ? "border-primary/15 bg-card/40"
                    : "border-border/20 bg-card/30"
                )}
              >
                {/* Bundle Header */}
                <div
                  className="flex items-center gap-3 px-4 py-3 cursor-pointer"
                  onClick={() => setExpandedBundle(isExpanded ? null : bundle.id)}
                >
                  {/* Selection checkbox */}
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleBundle(bundle); }}
                    className={cn(
                      "w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors",
                      selState === 'all'
                        ? "bg-primary border-primary"
                        : selState === 'some'
                        ? "bg-primary/30 border-primary/50"
                        : "border-border/40 hover:border-primary/40"
                    )}
                  >
                    {selState === 'all' && <Check className="w-3 h-3 text-primary-foreground" />}
                    {selState === 'some' && <Minus className="w-3 h-3 text-primary-foreground" />}
                  </button>

                  <BundleIcon className="w-4.5 h-4.5 text-primary/70 shrink-0" />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">{bundle.name}</span>
                      <span className="text-[9px] font-mono text-muted-foreground px-1.5 py-0.5 rounded bg-muted/30">
                        {bundle.capabilities.length}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
                      {bundle.description}
                    </p>
                  </div>

                  {/* Bundle score */}
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-right">
                      <span className={cn(
                        "text-xs font-mono font-bold",
                        bundle.maxCjpi >= 85 ? "text-neon-amber" :
                        bundle.maxCjpi >= 65 ? "text-neon-purple" :
                        bundle.maxCjpi >= 45 ? "text-primary" : "text-muted-foreground"
                      )}>
                        ↑{bundle.maxCjpi}
                      </span>
                      <span className="text-[9px] text-muted-foreground block">
                        avg {bundle.avgCjpi}
                      </span>
                    </div>

                    {isExpanded
                      ? <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      : <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    }
                  </div>
                </div>

                {/* Bundle Expanded — Individual Capabilities */}
                {isExpanded && (
                  <div className="px-4 pb-3 space-y-1.5 border-t border-border/10 pt-3">
                    {/* Business Value callout */}
                    {BUNDLE_DEFS.find(d => d.id === bundle.id)?.businessValue && (
                      <div className="px-3 py-2 rounded-lg bg-primary/5 border border-primary/10 mb-3">
                        <p className="text-[11px] text-primary/80 leading-relaxed">
                          <span className="font-semibold text-primary">BUSINESS VALUE: </span>
                          {BUNDLE_DEFS.find(d => d.id === bundle.id)!.businessValue}
                        </p>
                      </div>
                    )}

                    {bundle.capabilities.map((cap, capIdx) => {
                      const isSelected = selectedCapabilities.has(cap.capability);
                      const globalIdx = results.indexOf(cap);

                      return (
                        <div
                          key={capIdx}
                          className={cn(
                            "rounded-lg border px-3 py-2 transition-colors",
                            isSelected
                              ? "border-primary/20 bg-primary/[0.03]"
                              : "border-border/10 bg-card/20 hover:bg-card/40"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            {/* Individual checkbox */}
                            <button
                              onClick={() => toggleCapability(cap.capability)}
                              className={cn(
                                "w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors",
                                isSelected
                                  ? "bg-primary border-primary"
                                  : "border-border/40 hover:border-primary/40"
                              )}
                            >
                              {isSelected && <Check className="w-2.5 h-2.5 text-primary-foreground" />}
                            </button>

                            <span className={cn(
                              "text-[10px] font-mono font-bold uppercase shrink-0",
                              tierColor(cap.tier)
                            )}>
                              {cap.tier}
                            </span>

                            <span className="text-xs text-foreground/80 truncate flex-1">
                              {cap.capability}
                            </span>

                            {(cap.chainDepth || 2) > 2 && (
                              <span className="flex items-center gap-0.5 text-[9px] font-mono text-muted-foreground shrink-0">
                                <Link2 className="w-2.5 h-2.5" />
                                {cap.chainDepth}N
                              </span>
                            )}

                            <span className={cn(
                              "text-xs font-mono font-bold shrink-0",
                              cap.cjpiScore >= 85 ? "text-neon-amber" :
                              cap.cjpiScore >= 65 ? "text-neon-purple" :
                              cap.cjpiScore >= 45 ? "text-primary" : "text-muted-foreground"
                            )}>
                              {cap.cjpiScore}
                            </span>

                            {/* Discard */}
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-5 w-5 p-0 text-destructive/50 hover:text-destructive hover:bg-destructive/10"
                              disabled={discardingId === `${globalIdx}`}
                              onClick={(e) => { e.stopPropagation(); onDiscard(cap, globalIdx); }}
                            >
                              {discardingId === `${globalIdx}` ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Trash2 className="w-3 h-3" />
                              )}
                            </Button>
                          </div>

                          {/* Chain + description (always visible in expanded view) */}
                          {cap.chain && cap.chain.length > 0 && (
                            <div className="flex items-center gap-1 flex-wrap mt-1.5 ml-6">
                              {cap.chain.map((node, idx) => (
                                <span key={idx} className="flex items-center gap-1">
                                  <span className={cn(
                                    "text-[8px] font-mono px-1 py-0.5 rounded",
                                    idx === 0 ? "bg-primary/20 text-primary" : "bg-muted/30 text-foreground/60"
                                  )}>
                                    {idx === 0 ? `Ψ₄₁ ${node}` : labelPrimitive(node)}
                                  </span>
                                  {idx < cap.chain!.length - 1 && (
                                    <span className="text-muted-foreground/30 text-[7px]">→</span>
                                  )}
                                </span>
                              ))}
                            </div>
                          )}

                          {cap.description && (
                            <p className="text-[10px] text-muted-foreground leading-relaxed mt-1.5 ml-6 line-clamp-2">
                              {cap.description}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ═══ INDIVIDUAL VIEW ═══ */}
      {viewMode === 'individual' && (
        <div className="space-y-1.5 max-h-[32rem] overflow-y-auto">
          {results.map((r, i) => {
            const isSelected = selectedCapabilities.has(r.capability);

            return (
              <div
                key={i}
                className={cn(
                  "rounded-lg border px-3 py-2 transition-colors",
                  isSelected
                    ? "border-primary/20 bg-primary/[0.03]"
                    : tierBg(r.tier)
                )}
              >
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleCapability(r.capability)}
                    className={cn(
                      "w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors",
                      isSelected
                        ? "bg-primary border-primary"
                        : "border-border/40 hover:border-primary/40"
                    )}
                  >
                    {isSelected && <Check className="w-2.5 h-2.5 text-primary-foreground" />}
                  </button>

                  <span className={cn("text-[10px] font-mono font-bold uppercase shrink-0", tierColor(r.tier))}>
                    {r.tier}
                  </span>

                  <span className="text-xs text-foreground/80 truncate flex-1">{r.capability}</span>

                  {(r.chainDepth || 2) > 2 && (
                    <span className="flex items-center gap-0.5 text-[9px] font-mono text-muted-foreground shrink-0">
                      <Link2 className="w-2.5 h-2.5" />{r.chainDepth}N
                    </span>
                  )}

                  <span className={cn(
                    "text-xs font-mono font-bold shrink-0",
                    r.cjpiScore >= 85 ? "text-neon-amber" :
                    r.cjpiScore >= 65 ? "text-neon-purple" :
                    r.cjpiScore >= 45 ? "text-primary" : "text-muted-foreground"
                  )}>
                    {r.cjpiScore}
                  </span>

                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-5 w-5 p-0 text-destructive/50 hover:text-destructive hover:bg-destructive/10"
                    disabled={discardingId === `${i}`}
                    onClick={() => onDiscard(r, i)}
                  >
                    {discardingId === `${i}` ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Trash2 className="w-3 h-3" />
                    )}
                  </Button>
                </div>

                {r.description && (
                  <p className="text-[10px] text-muted-foreground leading-relaxed mt-1 ml-6 line-clamp-2">
                    {r.description}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
