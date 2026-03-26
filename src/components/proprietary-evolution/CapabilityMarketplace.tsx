/**
 * Capability Marketplace — Dynamic Bundle Clustering with Drill-Down
 * 
 * Bundles EMERGE from actual discovery results rather than mapping to static categories.
 * Each bundle generates a dynamic system identity based on its dominant nodes and depth.
 */

import { useState, useMemo, useCallback } from 'react';
import {
  Check, Minus, Package, ChevronDown, ChevronRight, Trash2, Loader2,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { labelPrimitive } from '@/lib/export/primitive-labels';
import {
  resolveArchetypeName,
  generateBundleIdentity,
  generateMatchRationale,
  getImpactTier,
  getImpactTierStyle,
  type ImpactTier,
} from '@/lib/discovery/chain-archetypes';

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

interface DynamicBundle {
  id: string;
  anchorNode: string;
  /** Dynamic system identity — generated, not predefined */
  label: string;
  /** Archetype name if resolved */
  archetypeName: string | null;
  /** Impact classification */
  impactTier: ImpactTier;
  summary: string;
  capabilities: CollisionResult[];
  avgCjpi: number;
  maxCjpi: number;
  topTier: string;
  nodeSpan: number;
  avgDepth: number;
  /** Dominant nodes driving this bundle's identity */
  dominantNodes: string[];
}

// ═══ TIER HELPERS ═══

const tierColor = (tier: string) => {
  const colors: Record<string, string> = {
    apex: 'text-neon-amber', mythic: 'text-neon-purple', relic: 'text-neon-blue',
    prime: 'text-neon-green', mint: 'text-muted-foreground',
  };
  return colors[tier] || 'text-muted-foreground';
};

const tierRank = (tier: string): number => {
  const ranks: Record<string, number> = { apex: 5, mythic: 4, relic: 3, prime: 2, mint: 1 };
  return ranks[tier] || 0;
};

// ═══ DYNAMIC CLUSTERING ═══

function clusterCapabilities(results: CollisionResult[]): DynamicBundle[] {
  // Group by primary substrate node + depth tier
  const depthBucket = (d: number) => d <= 2 ? 'shallow' : d <= 4 ? 'mid' : 'deep';

  const compositeGroups = new Map<string, CollisionResult[]>();

  for (const r of results) {
    const primaryNode = r.nodeB || (r.chain && r.chain.length > 1 ? r.chain[1] : 'UNKNOWN');
    const depth = depthBucket(r.chainDepth || 2);
    const key = `${primaryNode}::${depth}`;
    const existing = compositeGroups.get(key) || [];
    existing.push(r);
    compositeGroups.set(key, existing);
  }

  // Build initial bundles
  const bundles: DynamicBundle[] = [];
  for (const [compositeKey, caps] of compositeGroups) {
    const [node] = compositeKey.split('::');
    const avgCjpi = Math.round(caps.reduce((s, c) => s + c.cjpiScore, 0) / caps.length);
    const maxCjpi = Math.max(...caps.map(c => c.cjpiScore));
    const avgDepth = caps.reduce((s, c) => s + (c.chainDepth || 2), 0) / caps.length;
    const sortedCaps = [...caps].sort((a, b) => b.cjpiScore - a.cjpiScore);

    // Collect all participating nodes (excluding the user's candidate)
    const allNodes = new Set<string>();
    for (const c of caps) {
      if (c.chain) c.chain.forEach(n => allNodes.add(n));
      allNodes.add(c.nodeB);
    }
    if (caps[0]?.nodeA) allNodes.delete(caps[0].nodeA);

    // Determine dominant nodes by frequency
    const nodeFreq = new Map<string, number>();
    for (const c of caps) {
      const nodes = c.chain ? c.chain.filter(n => n !== c.nodeA) : [c.nodeB];
      for (const n of nodes) {
        nodeFreq.set(n, (nodeFreq.get(n) || 0) + 1);
      }
    }
    const dominantNodes = [...nodeFreq.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([n]) => n);

    const topTier = sortedCaps[0]?.tier || 'mint';
    const impactTier = getImpactTier(Math.round(avgDepth));
    const label = generateBundleIdentity(dominantNodes, avgDepth);
    const archetypeName = dominantNodes.length >= 2
      ? resolveArchetypeName(dominantNodes.slice(0, 2))
      : null;

    const capNames = sortedCaps.slice(0, 3).map(c =>
      c.capability.replace(/_Plus_\w+/g, '').replace(/_With_\w+/g, '').replace(/_/g, ' ')
    );
    const summary = caps.length > 3
      ? `${capNames.slice(0, 2).join(', ')} + ${caps.length - 2} more`
      : capNames.join(', ');

    bundles.push({
      id: compositeKey,
      anchorNode: node,
      label,
      archetypeName,
      impactTier,
      summary,
      capabilities: sortedCaps,
      avgCjpi,
      maxCjpi,
      topTier,
      nodeSpan: allNodes.size,
      avgDepth,
      dominantNodes,
    });
  }

  // Merge micro-clusters (1 capability) into strongest neighbor
  const MIN_CLUSTER_SIZE = 2;
  const merged: DynamicBundle[] = [];
  const microClusters: DynamicBundle[] = [];

  for (const b of bundles) {
    if (b.capabilities.length < MIN_CLUSTER_SIZE) {
      microClusters.push(b);
    } else {
      merged.push(b);
    }
  }

  if (merged.length === 0) {
    return bundles.sort((a, b) => b.maxCjpi - a.maxCjpi);
  }

  for (const micro of microClusters) {
    let bestBundle = merged[0];
    let bestOverlap = 0;

    const microNodes = new Set<string>();
    for (const c of micro.capabilities) {
      if (c.chain) c.chain.forEach(n => microNodes.add(n));
    }

    for (const bundle of merged) {
      const bundleNodes = new Set<string>();
      for (const c of bundle.capabilities) {
        if (c.chain) c.chain.forEach(n => bundleNodes.add(n));
      }
      let overlap = 0;
      for (const n of microNodes) {
        if (bundleNodes.has(n)) overlap++;
      }
      if (overlap > bestOverlap || (overlap === bestOverlap && bundle.maxCjpi > bestBundle.maxCjpi)) {
        bestOverlap = overlap;
        bestBundle = bundle;
      }
    }

    bestBundle.capabilities.push(...micro.capabilities);
    bestBundle.capabilities.sort((a, b) => b.cjpiScore - a.cjpiScore);
    bestBundle.avgCjpi = Math.round(
      bestBundle.capabilities.reduce((s, c) => s + c.cjpiScore, 0) / bestBundle.capabilities.length
    );
    bestBundle.maxCjpi = Math.max(bestBundle.maxCjpi, micro.maxCjpi);
    if (tierRank(micro.topTier) > tierRank(bestBundle.topTier)) {
      bestBundle.topTier = micro.topTier;
    }
  }

  // Re-generate summaries after merging
  for (const b of merged) {
    const capNames = b.capabilities.slice(0, 3).map(c =>
      c.capability.replace(/_Plus_\w+/g, '').replace(/_With_\w+/g, '').replace(/_/g, ' ')
    );
    b.summary = capNames.length > 2 && b.capabilities.length > 3
      ? `${capNames.slice(0, 2).join(', ')} + ${b.capabilities.length - 2} more`
      : capNames.join(', ');
  }

  return merged.sort((a, b) => b.maxCjpi - a.maxCjpi);
}

// ═══ COMPONENT ═══

interface CapabilityMarketplaceProps {
  results: CollisionResult[];
  selectedCapabilities: Set<string>;
  onSelectionChange: (selected: Set<string>) => void;
  onDiscard: (result: CollisionResult, idx: number) => void;
  discardingId: string | null;
}

type SortKey = 'cjpi' | 'depth' | 'tier';
type FilterImpact = 'all' | 'Enhancement' | 'System Upgrade' | 'Architectural Shift';

export function CapabilityMarketplace({
  results,
  selectedCapabilities,
  onSelectionChange,
  onDiscard,
  discardingId,
}: CapabilityMarketplaceProps) {
  const [expandedBundle, setExpandedBundle] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'bundles' | 'individual'>('bundles');
  const [sortBy, setSortBy] = useState<SortKey>('cjpi');
  const [filterImpact, setFilterImpact] = useState<FilterImpact>('all');

  const allBundles = useMemo(() => clusterCapabilities(results), [results]);

  const bundles = useMemo(() => {
    let filtered = allBundles;
    if (filterImpact !== 'all') {
      filtered = filtered.filter(b => b.impactTier === filterImpact);
    }
    const sorted = [...filtered];
    if (sortBy === 'cjpi') sorted.sort((a, b) => b.maxCjpi - a.maxCjpi);
    else if (sortBy === 'depth') sorted.sort((a, b) => b.avgDepth - a.avgDepth);
    else if (sortBy === 'tier') sorted.sort((a, b) => tierRank(b.topTier) - tierRank(a.topTier));
    return sorted;
  }, [allBundles, sortBy, filterImpact]);

  // ═══ COMPOSITION COHERENCE ═══
  const coherenceStats = useMemo(() => {
    const selected = results.filter(r => selectedCapabilities.has(r.capability));
    if (selected.length === 0) return null;
    const avgDepth = selected.reduce((s, r) => s + (r.chainDepth || 2), 0) / selected.length;
    const deepCount = selected.filter(r => (r.chainDepth || 2) >= 5).length;
    const uniqueNodes = new Set<string>();
    selected.forEach(r => r.chain?.forEach(n => uniqueNodes.add(n)));
    const coherence = Math.max(0, Math.min(100,
      100 - (deepCount > 3 ? (deepCount - 3) * 15 : 0) - (uniqueNodes.size > 15 ? (uniqueNodes.size - 15) * 3 : 0)
    ));
    return {
      count: selected.length,
      avgDepth: Math.round(avgDepth * 10) / 10,
      deepCount,
      uniqueNodes: uniqueNodes.size,
      coherence: Math.round(coherence),
    };
  }, [results, selectedCapabilities]);

  const toggleCapability = useCallback((capName: string) => {
    const next = new Set(selectedCapabilities);
    if (next.has(capName)) next.delete(capName);
    else next.add(capName);
    onSelectionChange(next);
  }, [selectedCapabilities, onSelectionChange]);

  const toggleBundle = useCallback((bundle: DynamicBundle) => {
    const next = new Set(selectedCapabilities);
    const allSelected = bundle.capabilities.every(c => next.has(c.capability));
    if (allSelected) {
      for (const c of bundle.capabilities) next.delete(c.capability);
    } else {
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

  const getBundleState = (bundle: DynamicBundle): 'all' | 'some' | 'none' => {
    const selected = bundle.capabilities.filter(c => selectedCapabilities.has(c.capability)).length;
    if (selected === 0) return 'none';
    if (selected === bundle.capabilities.length) return 'all';
    return 'some';
  };

  const selectedCount = results.filter(r => selectedCapabilities.has(r.capability)).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-primary" />
          <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
            Capability Systems — {bundles.length} discovered
          </h3>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center rounded-lg border border-border/20 overflow-hidden">
            <button
              onClick={() => setViewMode('bundles')}
              className={cn(
                "px-3 py-2 text-[10px] font-mono transition-colors min-h-[36px]",
                viewMode === 'bundles' ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Systems
            </button>
            <button
              onClick={() => setViewMode('individual')}
              className={cn(
                "px-3 py-2 text-[10px] font-mono transition-colors min-h-[36px]",
                viewMode === 'individual' ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              All
            </button>
          </div>
          <Button size="sm" variant="ghost" onClick={selectAll} className="h-9 min-h-[36px] text-[10px]">Select All</Button>
          <Button size="sm" variant="ghost" onClick={deselectAll} className="h-9 min-h-[36px] text-[10px]">Clear</Button>
        </div>
      </div>

      {/* ═══ SORT / FILTER CONTROLS ═══ */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider">Sort</span>
          {(['cjpi', 'depth', 'tier'] as SortKey[]).map(key => (
            <button
              key={key}
              onClick={() => setSortBy(key)}
              className={cn(
                "px-2.5 py-1.5 text-[10px] font-mono rounded-md border transition-colors min-h-[32px]",
                sortBy === key
                  ? "bg-primary/15 text-primary border-primary/30"
                  : "text-muted-foreground border-border/20 hover:text-foreground hover:border-border/40"
              )}
            >
              {key === 'cjpi' ? 'CJPI ↓' : key === 'depth' ? 'Depth ↓' : 'Tier ↓'}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider">Filter</span>
          {(['all', 'Enhancement', 'System Upgrade', 'Architectural Shift'] as FilterImpact[]).map(key => (
            <button
              key={key}
              onClick={() => setFilterImpact(key)}
              className={cn(
                "px-2.5 py-1.5 text-[10px] font-mono rounded-md border transition-colors min-h-[32px]",
                filterImpact === key
                  ? "bg-primary/15 text-primary border-primary/30"
                  : "text-muted-foreground border-border/20 hover:text-foreground hover:border-border/40"
              )}
            >
              {key === 'all' ? 'All' : key === 'Enhancement' ? 'ENH' : key === 'System Upgrade' ? 'SYS' : 'ARCH'}
            </button>
          ))}
        </div>
      </div>

      {/* Selection summary + Coherence panel */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/5 border border-primary/10">
          <Check className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs text-foreground font-medium">
            {selectedCount} of {results.length} selected
          </span>
          <span className="text-[10px] text-muted-foreground">
            — selected capabilities lock during Ascension
          </span>
        </div>

        {/* ═══ COMPOSITION COHERENCE PANEL ═══ */}
        {coherenceStats && coherenceStats.count > 0 && (
          <div className={cn(
            "px-3 py-2.5 rounded-lg border space-y-2",
            coherenceStats.coherence >= 70 ? "bg-neon-green/5 border-neon-green/20" :
            coherenceStats.coherence >= 40 ? "bg-neon-amber/5 border-neon-amber/20" :
            "bg-destructive/5 border-destructive/20"
          )}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Composition Coherence</span>
              <span className={cn(
                "text-sm font-mono font-bold",
                coherenceStats.coherence >= 70 ? "text-neon-green" :
                coherenceStats.coherence >= 40 ? "text-neon-amber" :
                "text-destructive"
              )}>
                {coherenceStats.coherence}%
              </span>
            </div>
            <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-mono">
              <span>Avg depth: {coherenceStats.avgDepth}N</span>
              <span>Nodes: {coherenceStats.uniqueNodes}</span>
              <span>Deep chains: {coherenceStats.deepCount}</span>
            </div>
            {coherenceStats.coherence < 70 && (
              <p className="text-[10px] text-neon-amber leading-relaxed">
                ⚠ {coherenceStats.deepCount > 3
                  ? `${coherenceStats.deepCount} deep chains selected — consider removing some to maintain export coherence.`
                  : 'Wide node span may reduce pack coherence. Consider focusing on fewer systems.'}
              </p>
            )}
          </div>
        )}
      </div>

      {/* ═══ DYNAMIC BUNDLE VIEW ═══ */}
      {viewMode === 'bundles' && (
        <div className="space-y-2">
          {bundles.map(bundle => {
            const isExpanded = expandedBundle === bundle.id;
            const selState = getBundleState(bundle);
            const impactStyle = getImpactTierStyle(bundle.impactTier);

            return (
              <div
                key={bundle.id}
                className={cn(
                  "rounded-xl border transition-all",
                  selState === 'all' ? "border-primary/30 bg-primary/[0.03]"
                    : selState === 'some' ? "border-primary/15 bg-card/40"
                    : "border-border/20 bg-card/30"
                )}
              >
                {/* Bundle Header */}
                <div
                  className="flex items-center gap-3 px-4 py-3 cursor-pointer"
                  onClick={() => setExpandedBundle(isExpanded ? null : bundle.id)}
                >
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleBundle(bundle); }}
                    className={cn(
                      "w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors",
                      selState === 'all' ? "bg-primary border-primary"
                        : selState === 'some' ? "bg-primary/30 border-primary/50"
                        : "border-border/40 hover:border-primary/40"
                    )}
                  >
                    {selState === 'all' && <Check className="w-3 h-3 text-primary-foreground" />}
                    {selState === 'some' && <Minus className="w-3 h-3 text-primary-foreground" />}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-foreground">{bundle.label}</span>
                      <span className={cn(
                        "text-[8px] font-mono px-1.5 py-0.5 rounded-full border font-bold uppercase tracking-wider",
                        impactStyle
                      )}>
                        {bundle.impactTier}
                      </span>
                      <span className="text-[9px] font-mono text-muted-foreground px-1.5 py-0.5 rounded bg-muted/30">
                        {bundle.capabilities.length}
                      </span>
                    </div>
                    {bundle.archetypeName && (
                      <p className="text-[10px] font-mono text-primary/60 mt-0.5">
                        {bundle.archetypeName}
                      </p>
                    )}
                    <p className="text-[11px] text-muted-foreground mt-0.5 break-words font-mono">
                      {bundle.summary}
                    </p>
                  </div>

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
                      <span className="text-[9px] text-muted-foreground block">avg {bundle.avgCjpi}</span>
                    </div>
                    <span className={cn("text-[9px] font-mono font-bold uppercase", tierColor(bundle.topTier))}>
                      {bundle.topTier}
                    </span>
                    {isExpanded
                      ? <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      : <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    }
                  </div>
                </div>

                {/* Expanded — Individual Capabilities */}
                {isExpanded && (
                  <div className="px-4 pb-3 space-y-1.5 border-t border-border/10 pt-3">
                    {bundle.capabilities.map((cap, capIdx) => {
                      const isSelected = selectedCapabilities.has(cap.capability);
                      const globalIdx = results.indexOf(cap);

                      return (
                        <CapabilityRow
                          key={capIdx}
                          cap={cap}
                          isSelected={isSelected}
                          globalIdx={globalIdx}
                          discardingId={discardingId}
                          onToggle={() => toggleCapability(cap.capability)}
                          onDiscard={() => onDiscard(cap, globalIdx)}
                        />
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
          {results.map((r, i) => (
            <CapabilityRow
              key={i}
              cap={r}
              isSelected={selectedCapabilities.has(r.capability)}
              globalIdx={i}
              discardingId={discardingId}
              onToggle={() => toggleCapability(r.capability)}
              onDiscard={() => onDiscard(r, i)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ═══ Shared Capability Row ═══

function CapabilityRow({
  cap, isSelected, globalIdx, discardingId, onToggle, onDiscard,
}: {
  cap: CollisionResult;
  isSelected: boolean;
  globalIdx: number;
  discardingId: string | null;
  onToggle: () => void;
  onDiscard: () => void;
}) {
  const chainDepth = cap.chainDepth || 2;
  const impactTier = getImpactTier(chainDepth);
  const impactStyle = getImpactTierStyle(impactTier);
  const rationale = generateMatchRationale(
    cap.chain || [cap.nodeA, cap.nodeB],
    cap.cjpiScore,
    cap.synergyBonus,
  );

  return (
    <div className={cn(
      "rounded-lg border px-3 py-2 transition-colors",
      isSelected ? "border-primary/20 bg-primary/[0.03]" : "border-border/10 bg-card/20 hover:bg-card/40"
    )}>
      <div className="flex items-center gap-2">
        <button
          onClick={onToggle}
          className={cn(
            "w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors",
            isSelected ? "bg-primary border-primary" : "border-border/40 hover:border-primary/40"
          )}
        >
          {isSelected && <Check className="w-2.5 h-2.5 text-primary-foreground" />}
        </button>

        <span className={cn("text-[10px] font-mono font-bold uppercase shrink-0", tierColor(cap.tier))}>
          {cap.tier}
        </span>

        <span className="text-xs text-foreground/80 break-words flex-1">{cap.capability.replace(/_/g, ' ')}</span>

        <span className={cn(
          "text-[8px] font-mono px-1.5 py-0.5 rounded-full border font-semibold shrink-0",
          impactStyle
        )}>
          {chainDepth}N · {impactTier === 'Enhancement' ? 'ENH' : impactTier === 'System Upgrade' ? 'SYS' : 'ARCH'}
        </span>

        <span className={cn(
          "text-xs font-mono font-bold shrink-0",
          cap.cjpiScore >= 85 ? "text-neon-amber" :
          cap.cjpiScore >= 65 ? "text-neon-purple" :
          cap.cjpiScore >= 45 ? "text-primary" : "text-muted-foreground"
        )}>
          {cap.cjpiScore}
        </span>

        <Button
          size="sm" variant="ghost"
          className="h-5 w-5 p-0 text-destructive/50 hover:text-destructive hover:bg-destructive/10"
          disabled={discardingId === `${globalIdx}`}
          onClick={(e) => { e.stopPropagation(); onDiscard(); }}
        >
          {discardingId === `${globalIdx}`
            ? <Loader2 className="w-3 h-3 animate-spin" />
            : <Trash2 className="w-3 h-3" />
          }
        </Button>
      </div>

      {/* Chain visualization */}
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

      {/* Match rationale — why this matched */}
      <div className="flex items-start gap-1.5 mt-1.5 ml-6">
        <Info className="w-2.5 h-2.5 text-muted-foreground/40 shrink-0 mt-0.5" />
        <p className="text-[10px] text-muted-foreground/60 leading-relaxed italic">
          {rationale}
        </p>
      </div>

      {cap.description && (
        <p className="text-[10px] text-muted-foreground leading-relaxed mt-1 ml-6">
          {cap.description}
        </p>
      )}
    </div>
  );
}
