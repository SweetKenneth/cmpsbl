/**
 * SubstrateGraph — Interactive ASCII-tree topology of the 40-node substrate.
 * Based on the canonical ATLAS topology diagram.
 * Click any node to inspect details.
 */
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Node metadata ───────────────────────────────────────────────

interface NodeMeta {
  id: string;
  label: string;
  sector: string;
  sectorLabel: string;
  weight: number;
  description: string;
}

const NODE_MAP: Record<string, NodeMeta> = {
  CORE:        { id: 'core',        label: 'CORE',        sector: 'kernel',    sectorLabel: 'Kernel',             weight: 0.110, description: 'Kernel orchestration & boot authority — initializes all layers, maintains canonical registry.' },
  SYSTEM:      { id: 'system',      label: 'SYSTEM',      sector: 'kernel',    sectorLabel: 'Kernel',             weight: 0.040, description: 'Lifecycle management, configuration state, diagnostics aggregation, and self-repair loop.' },
  BRAIN:       { id: 'brain',       label: 'BRAIN',       sector: 'ccr',       sectorLabel: 'Cognitive/CCR',      weight: 0.040, description: 'Reasoning engine — reflection cycles, pattern recognition, learning orchestration.' },
  MEMORY:      { id: 'memory',      label: 'MEMORY',      sector: 'ccr',       sectorLabel: 'Cognitive/CCR',      weight: 0.040, description: 'Tiered persistent storage — hot/warm/cold recall with vector retrieval.' },
  DREAM:       { id: 'dream',       label: 'DREAM',       sector: 'ccr',       sectorLabel: 'Cognitive/CCR',      weight: 0.040, description: 'Synthesis zone — creative combination, heuristic generation, SimNap cycles.' },
  RIPPLE:      { id: 'ripple',      label: 'RIPPLE',      sector: 'ocg',       sectorLabel: 'Compliance/OCG',     weight: 0.025, description: 'Signal & event bus — inter-zone communication, cascade detection.' },
  ACCESS:      { id: 'access',      label: 'ACCESS',      sector: 'ocg',       sectorLabel: 'Compliance/OCG',     weight: 0.025, description: 'API entitlements, rate limiting, billing integration.' },
  IDENTITY:    { id: 'identity',    label: 'IDENTITY',    sector: 'ocg',       sectorLabel: 'Compliance/OCG',     weight: 0.025, description: 'Session management, role resolution, entity binding.' },
  RELAY:       { id: 'relay',       label: 'RELAY',       sector: 'ocg',       sectorLabel: 'Compliance/OCG',     weight: 0.025, description: 'Webhook dispatch, external integration relay.' },
  AUDIT:       { id: 'audit',       label: 'AUDIT',       sector: 'ocg',       sectorLabel: 'Compliance/OCG',     weight: 0.025, description: 'Integrity ledger — immutable logging, chain-of-custody.' },
  NERVE:       { id: 'nerve',       label: 'NERVE',       sector: 'ocg',       sectorLabel: 'Compliance/OCG',     weight: 0.025, description: 'Operational signaling, consensus repair, inter-node coordination.' },
  DECODE:      { id: 'decode',      label: 'DECODE',      sector: 'execution', sectorLabel: 'Execution',          weight: 0.023, description: 'Epistemic interpreter — prompt parsing, intent extraction, NLU.' },
  ENCODE:      { id: 'encode',      label: 'ENCODE',      sector: 'execution', sectorLabel: 'Execution',          weight: 0.023, description: 'Code generation engine — fix generation, output formatting.' },
  VISION:      { id: 'vision',      label: 'VISION',      sector: 'execution', sectorLabel: 'Execution',          weight: 0.023, description: 'Observability & telemetry — health aggregation, metric visualization.' },
  CORTEX:      { id: 'cortex',      label: 'CORTEX',      sector: 'execution', sectorLabel: 'Execution',          weight: 0.023, description: 'Autonomous orchestrator — multi-surface coordination, task routing.' },
  NEXUS:       { id: 'nexus',       label: 'NEXUS',       sector: 'execution', sectorLabel: 'Execution',          weight: 0.023, description: 'AI provider routing gateway — model selection, fallback chains.' },
  ECONOMY:     { id: 'economy',     label: 'ECONOMY',     sector: 'execution', sectorLabel: 'Execution',          weight: 0.021, description: 'Value & cost tracking — ROI calculation, usage metering.' },
  SANDBOX:     { id: 'sandbox',     label: 'SANDBOX',     sector: 'execution', sectorLabel: 'Execution',          weight: 0.021, description: 'Isolated execution environment — safe experimentation.' },
  INCLUSIVE:   { id: 'inclusive',    label: 'INCLUSIVE',    sector: 'execution', sectorLabel: 'Execution',          weight: 0.021, description: 'Accessibility engine — WCAG scanning, compliance reporting.' },
  MEDIC:       { id: 'medic',       label: 'MEDIC',       sector: 'execution', sectorLabel: 'Execution',          weight: 0.022, description: 'Autonomous diagnostics & self-repair engine.' },
  INTEGRATION: { id: 'integration', label: 'INTEGRATION', sector: 'execution', sectorLabel: 'Execution',          weight: 0.020, description: 'Dependency resolver — cross-surface binding, boots last.' },
  SOVEREIGN:   { id: 'sovereign',   label: 'SOVEREIGN',   sector: 'esz',       sectorLabel: 'Sovereignty (ESZ)',   weight: 0.020, description: 'Data sovereignty & jurisdictional compliance.' },
  ORACLE:      { id: 'oracle',      label: 'ORACLE',      sector: 'esz',       sectorLabel: 'Sovereignty (ESZ)',   weight: 0.020, description: 'Predictive modeling & probabilistic reasoning.' },
  CONSCIENCE:  { id: 'conscience',  label: 'CONSCIENCE',  sector: 'esz',       sectorLabel: 'Sovereignty (ESZ)',   weight: 0.020, description: 'Ethical assessment & bias detection.' },
  TREATY:      { id: 'treaty',      label: 'TREATY',      sector: 'esz',       sectorLabel: 'Sovereignty (ESZ)',   weight: 0.020, description: 'Contract negotiation & SLA enforcement.' },
  COMPASS:     { id: 'compass',     label: 'COMPASS',     sector: 'epz',       sectorLabel: 'Perception (EPZ)',    weight: 0.020, description: 'Geospatial analysis & navigation.' },
  ECHO:        { id: 'echo',        label: 'ECHO',        sector: 'epz',       sectorLabel: 'Perception (EPZ)',    weight: 0.020, description: 'Digital twin simulation & replay.' },
  REFLEX:      { id: 'reflex',      label: 'REFLEX',      sector: 'epz',       sectorLabel: 'Perception (EPZ)',    weight: 0.020, description: 'Edge computing orchestration.' },
  FORGE:       { id: 'forge',       label: 'FORGE',       sector: 'emz',       sectorLabel: 'Manufacturing (EMZ)', weight: 0.015, description: 'Artifact synthesis & manufacturing engine.' },
  LINGUA:      { id: 'lingua',      label: 'LINGUA',      sector: 'emz',       sectorLabel: 'Manufacturing (EMZ)', weight: 0.015, description: 'Translation & localization engine.' },
  HARVEST:     { id: 'harvest',     label: 'HARVEST',     sector: 'emz',       sectorLabel: 'Manufacturing (EMZ)', weight: 0.015, description: 'Data acquisition & ETL engine.' },
  EVOLUTION:   { id: 'evolution',   label: 'EVOLUTION',   sector: 'csz',       sectorLabel: 'Covert (CSZ)',        weight: 0.020, description: 'Mutation lifecycle & self-evolution engine.' },
  SHADOW:      { id: 'shadow',      label: 'SHADOW',      sector: 'csz',       sectorLabel: 'Covert (CSZ)',        weight: 0.018, description: 'Divergence testing & shadow mesh operations.' },
  PHANTOM:     { id: 'phantom',     label: 'PHANTOM',     sector: 'csz',       sectorLabel: 'Covert (CSZ)',        weight: 0.017, description: 'Privacy protection & anonymization.' },
  GOVERNANCE:  { id: 'governance',  label: 'GOVERNANCE',  sector: 'mesh',      sectorLabel: 'Mesh Overlays',       weight: 0.030, description: 'Policy enforcement overlay — action legitimacy supervision.' },
  INTENT:      { id: 'intent',      label: 'INTENT',      sector: 'mesh',      sectorLabel: 'Mesh Overlays',       weight: 0.030, description: 'Purpose alignment, goal tracking, capability discovery.' },
  IMMUNITY:    { id: 'immunity',    label: 'IMMUNITY',    sector: 'mesh',      sectorLabel: 'Mesh Overlays',       weight: 0.030, description: 'Adaptive resilience, threat adaptation, self-healing.' },
  DEFENSE:     { id: 'defense',     label: 'DEFENSE',     sector: 'mesh',      sectorLabel: 'Mesh Overlays',       weight: 0.030, description: 'Terminal boundary enforcement — outermost containment shell.' },
  ENGINEER:    { id: 'engineer',    label: 'ENGINEER',    sector: 'plane',     sectorLabel: 'Plane',               weight: 0.020, description: 'Infrastructure automation & deployment orchestration.' },
  ATLAS:       { id: 'atlas',       label: 'ATLAS',       sector: 'plane',     sectorLabel: 'Plane',               weight: 0.020, description: 'System map & capability registry — the global view of what exists.' },
};

const SECTOR_COLORS: Record<string, string> = {
  kernel:    'text-primary',
  ccr:       'text-neon-blue',
  ocg:       'text-neon-amber',
  execution: 'text-neon-green',
  esz:       'text-neon-purple',
  epz:       'text-neon-cyan',
  emz:       'text-neon-amber',
  csz:       'text-neon-magenta',
  mesh:      'text-neon-cyan',
  plane:     'text-primary',
};

const SECTOR_BG: Record<string, string> = {
  kernel:    'bg-primary/10 border-primary/20',
  ccr:       'bg-neon-blue/10 border-neon-blue/20',
  ocg:       'bg-neon-amber/10 border-neon-amber/20',
  execution: 'bg-neon-green/10 border-neon-green/20',
  esz:       'bg-neon-purple/10 border-neon-purple/20',
  epz:       'bg-neon-cyan/10 border-neon-cyan/20',
  emz:       'bg-neon-amber/10 border-neon-amber/20',
  csz:       'bg-neon-magenta/10 border-neon-magenta/20',
  mesh:      'bg-neon-cyan/10 border-neon-cyan/20',
  plane:     'bg-primary/10 border-primary/20',
};

// ─── Tree structure ─────────────────────────────────────────────

interface TreeLine {
  prefix: string;    // tree drawing characters (├─, │, └─, etc.)
  label: string;     // the sector label part like "Kernel (2):"
  nodes?: string[];  // node names to render as clickable
  isContinuation?: boolean; // for wrapped execution line
}

const TREE: TreeLine[] = [
  { prefix: '├─', label: 'Kernel (2):',            nodes: ['CORE', 'SYSTEM'] },
  { prefix: '├─', label: 'Cognitive/CCR (3):',     nodes: ['BRAIN', 'MEMORY', 'DREAM'] },
  { prefix: '├─', label: 'Compliance/OCG (6):',    nodes: ['RIPPLE', 'ACCESS', 'IDENTITY', 'RELAY', 'AUDIT', 'NERVE'] },
  { prefix: '├─', label: 'Execution (11):',        nodes: ['DECODE', 'ENCODE', 'VISION', 'CORTEX', 'NEXUS'] },
  { prefix: '│ ', label: '',                        nodes: ['ECONOMY', 'SANDBOX', 'INCLUSIVE', 'MEDIC', 'INTEGRATION'], isContinuation: true },
  { prefix: '├─', label: 'ESZ (4):',               nodes: ['SOVEREIGN', 'ORACLE', 'CONSCIENCE', 'TREATY'] },
  { prefix: '├─', label: 'EPZ (3):',               nodes: ['COMPASS', 'ECHO', 'REFLEX'] },
  { prefix: '├─', label: 'EMZ (3):',               nodes: ['FORGE', 'LINGUA', 'HARVEST'] },
  { prefix: '├─', label: 'CSZ (3):',               nodes: ['EVOLUTION', 'SHADOW', 'PHANTOM'] },
  { prefix: '├─', label: 'Mesh Overlays (4):',     nodes: ['GOVERNANCE', 'INTENT', 'IMMUNITY', 'DEFENSE'] },
  { prefix: '└─', label: 'Plane (2):',             nodes: ['ENGINEER', 'ATLAS'] },
];

// ─── Component ───────────────────────────────────────────────────

function NodeChip({ name, selected, onSelect }: { name: string; selected: boolean; onSelect: () => void }) {
  const meta = NODE_MAP[name];
  if (!meta) return <span className="text-muted-foreground">{name}</span>;

  const colorClass = SECTOR_COLORS[meta.sector] ?? 'text-muted-foreground';

  return (
    <button
      onClick={onSelect}
      className={cn(
        "font-mono font-bold text-[11px] sm:text-xs tracking-wide px-1.5 py-0.5 rounded transition-all duration-150",
        "hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/40",
        selected
          ? "bg-primary/15 text-primary ring-1 ring-primary/30"
          : colorClass
      )}
    >
      {name}
    </button>
  );
}

export function SubstrateGraph({ className }: { className?: string }) {
  const [selected, setSelected] = useState<NodeMeta | null>(null);

  const handleSelect = useCallback((name: string) => {
    const meta = NODE_MAP[name];
    if (!meta) return;
    setSelected(prev => prev?.id === meta.id ? null : meta);
  }, []);

  return (
    <div className={cn("relative", className)}>
      <div className="bg-card/60 backdrop-blur-sm border border-border/40 rounded-2xl p-4 sm:p-6 overflow-x-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-border/30">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-destructive/60" />
            <span className="w-2.5 h-2.5 rounded-full bg-neon-amber/60" />
            <span className="w-2.5 h-2.5 rounded-full bg-neon-green/60" />
          </div>
          <span className="text-[10px] font-mono text-muted-foreground/50 tracking-wider uppercase">
            40-Node Topology · 12 Sectors
          </span>
        </div>

        {/* Tree */}
        <div className="font-mono text-xs sm:text-sm leading-[2.2] sm:leading-[2.4] whitespace-nowrap select-none">
          {TREE.map((line, i) => (
            <div key={i} className="flex items-baseline gap-0 min-h-[1.5em]">
              <span className="text-border/60 shrink-0 w-[2ch]">{line.prefix}</span>
              {line.label && (
                <span className="text-muted-foreground/70 shrink-0 mr-1">{line.label}</span>
              )}
              {line.isContinuation && (
                <span className="text-border/40 shrink-0 mr-1 w-[17ch]">{'                 '}</span>
              )}
              {line.nodes && (
                <span className="flex flex-wrap items-baseline gap-x-0.5 gap-y-0">
                  {line.nodes.map((name, j) => (
                    <span key={name} className="flex items-baseline">
                      <NodeChip
                        name={name}
                        selected={selected?.label === name}
                        onSelect={() => handleSelect(name)}
                      />
                      {j < line.nodes!.length - 1 && (
                        <span className="text-border/40 mx-0.5">→</span>
                      )}
                    </span>
                  ))}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Node count badge */}
        <div className="mt-4 pt-3 border-t border-border/20 flex items-center gap-2 text-[10px] font-mono text-muted-foreground/40">
          <span className="w-1.5 h-1.5 rounded-full bg-neon-green/50 animate-pulse" />
          <span>Σ 40 nodes · weights = 1.000</span>
        </div>
      </div>

      {/* ─── Detail panel ─── */}
      <AnimatePresence>
        {selected && (
          <motion.div
            key={selected.id}
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "mt-3 p-4 rounded-xl border shadow-xl backdrop-blur-md",
              SECTOR_BG[selected.sector] ?? 'bg-card/95 border-border/40'
            )}
          >
            <button
              onClick={() => setSelected(null)}
              className="absolute top-3 right-3 w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Close"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            <div className="flex items-center gap-3 mb-2">
              <span className="text-lg font-black font-mono tracking-tight text-foreground">{selected.label}</span>
              <span className="text-[10px] font-mono text-muted-foreground/60 bg-background/30 px-2 py-0.5 rounded">
                {selected.sectorLabel} · {(selected.weight * 100).toFixed(1)}%
              </span>
            </div>

            <p className="text-sm text-muted-foreground/80 leading-relaxed max-w-lg">
              {selected.description}
            </p>

            <div className="mt-3 flex items-center gap-4 text-[10px] text-muted-foreground/40 font-mono">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" />
                Operational
              </span>
              <span>Sector: {selected.sector.toUpperCase()}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
