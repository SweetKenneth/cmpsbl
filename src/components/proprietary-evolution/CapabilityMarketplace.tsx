/**
 * Capability Marketplace — Dynamic Bundle Clustering with Drill-Down
 * 
 * Bundles EMERGE from actual discovery results rather than mapping to static categories.
 * Different code produces different bundle shapes. No pre-defined groups.
 */

import { useState, useMemo, useCallback } from 'react';
import {
  Check, Minus, Package, ChevronDown, ChevronRight, Link2, Trash2, Loader2,
  Zap, Layers,
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

interface DynamicBundle {
  id: string;
  /** The primary substrate node that anchors this cluster */
  anchorNode: string;
  /** Human-readable label for the cluster */
  label: string;
  /** Short description derived from the capabilities within */
  summary: string;
  capabilities: CollisionResult[];
  avgCjpi: number;
  maxCjpi: number;
  topTier: string;
  /** How many unique substrate nodes participate */
  nodeSpan: number;
}

// ═══ NODE LABELS — for dynamic naming ═══

const NODE_LABEL: Record<string, string> = {
  CORE: 'System Orchestration', SYSTEM: 'Lifecycle Management', BRAIN: 'Autonomous Reasoning',
  MEMORY: 'Persistent Recall', DREAM: 'Generative Synthesis',
  RIPPLE: 'Event Propagation', ACCESS: 'Entitlement Control', IDENTITY: 'Entity Resolution',
  RELAY: 'Webhook Dispatch', AUDIT: 'Integrity Ledger', NERVE: 'Signal Consensus',
  DECODE: 'Intent Parsing', ENCODE: 'Code Generation', VISION: 'Observability Rendering',
  CORTEX: 'Workflow Orchestration', NEXUS: 'AI Routing', ECONOMY: 'Cost Metering',
  SANDBOX: 'Isolated Execution', INCLUSIVE: 'Accessibility Compliance', MEDIC: 'Diagnostic Repair',
  INTEGRATION: 'Dependency Resolution',
  SOVEREIGN: 'Data Sovereignty', ORACLE: 'Predictive Forecasting', CONSCIENCE: 'Bias Detection',
  TREATY: 'Compliance Negotiation',
  COMPASS: 'Navigation Mapping', ECHO: 'Temporal Replay', REFLEX: 'Edge Reaction',
  FORGE: 'Artifact Scaffolding', LINGUA: 'Language Translation', HARVEST: 'Data Acquisition',
  EVOLUTION: 'Adaptive Optimization', SHADOW: 'Divergence Testing', PHANTOM: 'Stealth Anonymization',
  IMMUNITY: 'Resilience Hardening', INTENT: 'Action Planning',
  GOVERNANCE: 'Policy Enforcement', ATLAS: 'Capability Governance', ENGINEER: 'Performance Optimization',
  DEFENSE: 'Threat Detection',
};

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

/**
 * Clusters discoveries by their primary substrate interaction node (nodeB / chain[1]).
 * Merges small clusters (≤1 item) into their strongest neighbor.
 * Result: bundles that genuinely reflect what was discovered, not predefined groups.
 */
function clusterCapabilities(results: CollisionResult[]): DynamicBundle[] {
  // Step 1: Group by primary substrate node (the first non-candidate node in the chain)
  const nodeGroups = new Map<string, CollisionResult[]>();

  for (const r of results) {
    // Primary interaction node = nodeB (the substrate node that was collided with)
    const primaryNode = r.nodeB || (r.chain && r.chain.length > 1 ? r.chain[1] : 'UNKNOWN');
    const existing = nodeGroups.get(primaryNode) || [];
    existing.push(r);
    nodeGroups.set(primaryNode, existing);
  }

  // Step 2: Build initial bundles
  const bundles: DynamicBundle[] = [];
  for (const [node, caps] of nodeGroups) {
    const avgCjpi = Math.round(caps.reduce((s, c) => s + c.cjpiScore, 0) / caps.length);
    const maxCjpi = Math.max(...caps.map(c => c.cjpiScore));
    const sortedCaps = [...caps].sort((a, b) => b.cjpiScore - a.cjpiScore);

    // Count unique substrate nodes across all chains in this cluster
    const allNodes = new Set<string>();
    for (const c of caps) {
      if (c.chain) c.chain.forEach(n => allNodes.add(n));
      allNodes.add(c.nodeB);
    }
    // Remove candidate node from count
    if (caps[0]?.nodeA) allNodes.delete(caps[0].nodeA);

    const topTier = sortedCaps[0]?.tier || 'mint';
    const nodeLabel = NODE_LABEL[node] || node;

    // Generate a summary from the actual capability names
    const capNames = sortedCaps.slice(0, 3).map(c => {
      // Extract the meaningful part of the capability name
      const clean = c.capability
        .replace(/_Plus_\w+/g, '')
        .replace(/_With_\w+/g, '')
        .replace(/_/g, ' ');
      return clean;
    });
    const summary = capNames.length > 2
      ? `${capNames.slice(0, 2).join(', ')} + ${caps.length - 2} more`
      : capNames.join(', ');

    bundles.push({
      id: node,
      anchorNode: node,
      label: `${nodeLabel} Cluster`,
      summary,
      capabilities: sortedCaps,
      avgCjpi,
      maxCjpi,
      topTier,
      nodeSpan: allNodes.size,
    });
  }

  // Step 3: Merge micro-clusters (1 capability) into their best neighbor
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

  // If we have nowhere to merge, keep micro-clusters as-is
  if (merged.length === 0) {
    return bundles.sort((a, b) => b.maxCjpi - a.maxCjpi);
  }

  // Merge each micro-cluster into the bundle with the highest affinity
  for (const micro of microClusters) {
    // Find the bundle sharing the most chain nodes
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

export function CapabilityMarketplace({
  results,
  selectedCapabilities,
  onSelectionChange,
  onDiscard,
  discardingId,
}: CapabilityMarketplaceProps) {
  const [expandedBundle, setExpandedBundle] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'bundles' | 'individual'>('bundles');

  // Dynamically cluster based on actual results
  const bundles = useMemo(() => clusterCapabilities(results), [results]);

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
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-primary" />
          <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
            Discovered Capabilities — {bundles.length} {bundles.length === 1 ? 'cluster' : 'clusters'}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg border border-border/20 overflow-hidden">
            <button
              onClick={() => setViewMode('bundles')}
              className={cn(
                "px-2.5 py-1 text-[10px] font-mono transition-colors",
                viewMode === 'bundles' ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Clusters
            </button>
            <button
              onClick={() => setViewMode('individual')}
              className={cn(
                "px-2.5 py-1 text-[10px] font-mono transition-colors",
                viewMode === 'individual' ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              All
            </button>
          </div>
          <Button size="sm" variant="ghost" onClick={selectAll} className="h-7 text-[10px]">Select All</Button>
          <Button size="sm" variant="ghost" onClick={deselectAll} className="h-7 text-[10px]">Clear</Button>
        </div>
      </div>

      {/* Selection summary */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/5 border border-primary/10">
        <Check className="w-3.5 h-3.5 text-primary" />
        <span className="text-xs text-foreground font-medium">
          {selectedCount} of {results.length} selected
        </span>
        <span className="text-[10px] text-muted-foreground">
          — selected capabilities lock during Ascension
        </span>
      </div>

      {/* ═══ DYNAMIC BUNDLE VIEW ═══ */}
      {viewMode === 'bundles' && (
        <div className="space-y-2">
          {bundles.map(bundle => {
            const isExpanded = expandedBundle === bundle.id;
            const selState = getBundleState(bundle);

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
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">{bundle.label}</span>
                      <span className="text-[9px] font-mono text-muted-foreground px-1.5 py-0.5 rounded bg-muted/30">
                        {bundle.capabilities.length}
                      </span>
                      {bundle.nodeSpan > 1 && (
                        <span className="flex items-center gap-0.5 text-[9px] font-mono text-muted-foreground">
                          <Layers className="w-2.5 h-2.5" />
                          {bundle.nodeSpan} nodes
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1 font-mono">
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

        <span className="text-xs text-foreground/80 truncate flex-1">{cap.capability.replace(/_/g, ' ')}</span>

        {(cap.chainDepth || 2) > 2 && (
          <span className="flex items-center gap-0.5 text-[9px] font-mono text-muted-foreground shrink-0">
            <Link2 className="w-2.5 h-2.5" />{cap.chainDepth}N
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
}
