/**
 * SubstrateGraph — Concentric shell visualization of the 40-primitive substrate.
 * DEFENSE Layer as outermost shell → Layers → Engines & Agents → Organs at core.
 * Click any primitive to inspect details.
 */
import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Primitive metadata ───────────────────────────────────────────

interface PrimitiveMeta {
  id: string;
  label: string;
  category: 'organ' | 'layer' | 'engine' | 'agent';
  categoryLabel: string;
  weight: number;
  description: string;
}

const PRIMITIVES: PrimitiveMeta[] = [
  // ORGANS (12)
  { id: 'core',        label: 'CORE',        category: 'organ',  categoryLabel: 'Organ',  weight: 0.110, description: 'Kernel boot authority — initializes all primitives, maintains canonical weighted registry.' },
  { id: 'system',      label: 'SYSTEM',      category: 'organ',  categoryLabel: 'Organ',  weight: 0.040, description: 'Lifecycle management, configuration state, diagnostics aggregation, and self-repair loop.' },
  { id: 'brain',       label: 'BRAIN',       category: 'organ',  categoryLabel: 'Organ',  weight: 0.040, description: 'Reasoning organ — reflection cycles, pattern recognition, learning orchestration.' },
  { id: 'memory',      label: 'MEMORY',      category: 'organ',  categoryLabel: 'Organ',  weight: 0.040, description: 'Tiered persistent storage — hot/warm/cold recall with vector retrieval.' },
  { id: 'nerve',       label: 'NERVE',       category: 'organ',  categoryLabel: 'Organ',  weight: 0.025, description: 'Operational signaling, consensus repair, inter-primitive coordination.' },
  { id: 'ripple',      label: 'RIPPLE',      category: 'organ',  categoryLabel: 'Organ',  weight: 0.025, description: 'Signal & event bus — inter-primitive communication, cascade detection.' },
  { id: 'relay',       label: 'RELAY',       category: 'organ',  categoryLabel: 'Organ',  weight: 0.025, description: 'Webhook dispatch, external integration relay.' },
  { id: 'identity',    label: 'IDENTITY',    category: 'organ',  categoryLabel: 'Organ',  weight: 0.025, description: 'Session management, role resolution, entity binding.' },
  { id: 'access',      label: 'ACCESS',      category: 'organ',  categoryLabel: 'Organ',  weight: 0.025, description: 'API entitlements, rate limiting, billing integration.' },
  { id: 'nexus',       label: 'NEXUS',       category: 'organ',  categoryLabel: 'Organ',  weight: 0.023, description: 'AI provider routing gateway — model selection, fallback chains.' },
  { id: 'audit',       label: 'AUDIT',       category: 'organ',  categoryLabel: 'Organ',  weight: 0.025, description: 'Integrity ledger — immutable logging, chain-of-custody.' },
  { id: 'integration', label: 'INTEGRATION', category: 'organ',  categoryLabel: 'Organ',  weight: 0.020, description: 'Dependency resolver — cross-surface binding, boots last.' },
  // LAYERS (8)
  { id: 'defense',     label: 'DEFENSE',     category: 'layer',  categoryLabel: 'Layer',  weight: 0.030, description: 'Terminal boundary enforcement — outermost containment shell.' },
  { id: 'immunity',    label: 'IMMUNITY',    category: 'layer',  categoryLabel: 'Layer',  weight: 0.030, description: 'Adaptive resilience, threat adaptation, self-healing.' },
  { id: 'governance',  label: 'GOVERNANCE',  category: 'layer',  categoryLabel: 'Layer',  weight: 0.030, description: 'Policy enforcement overlay — action legitimacy supervision.' },
  { id: 'intent',      label: 'INTENT',      category: 'layer',  categoryLabel: 'Layer',  weight: 0.030, description: 'Purpose alignment, goal tracking, capability discovery.' },
  { id: 'evolution',   label: 'EVOLUTION',   category: 'layer',  categoryLabel: 'Layer',  weight: 0.020, description: 'Mutation lifecycle & self-evolution layer.' },
  { id: 'inclusive',   label: 'INCLUSIVE',    category: 'layer',  categoryLabel: 'Layer',  weight: 0.021, description: 'Accessibility layer — WCAG scanning, compliance reporting.' },
  { id: 'conscience',  label: 'CONSCIENCE',  category: 'layer',  categoryLabel: 'Layer',  weight: 0.020, description: 'Ethical assessment & bias detection.' },
  { id: 'treaty',      label: 'TREATY',      category: 'layer',  categoryLabel: 'Layer',  weight: 0.020, description: 'Contract negotiation & SLA enforcement.' },
  // ENGINES (10)
  { id: 'dream',       label: 'DREAM',       category: 'engine', categoryLabel: 'Engine', weight: 0.040, description: 'Synthesis engine — creative combination, heuristic generation, SimNap cycles.' },
  { id: 'cortex',      label: 'CORTEX',      category: 'engine', categoryLabel: 'Engine', weight: 0.023, description: 'Autonomous orchestrator — multi-surface coordination, task routing.' },
  { id: 'oracle',      label: 'ORACLE',      category: 'engine', categoryLabel: 'Engine', weight: 0.020, description: 'Predictive modeling & probabilistic reasoning.' },
  { id: 'forge',       label: 'FORGE',       category: 'engine', categoryLabel: 'Engine', weight: 0.015, description: 'Artifact synthesis & manufacturing engine.' },
  { id: 'compass',     label: 'COMPASS',     category: 'engine', categoryLabel: 'Engine', weight: 0.020, description: 'Geospatial analysis & navigation.' },
  { id: 'atlas',       label: 'ATLAS',       category: 'engine', categoryLabel: 'Engine', weight: 0.020, description: 'System map & capability registry — the global view of what exists.' },
  { id: 'economy',     label: 'ECONOMY',     category: 'engine', categoryLabel: 'Engine', weight: 0.021, description: 'Value & cost tracking — ROI calculation, usage metering.' },
  { id: 'sandbox',     label: 'SANDBOX',     category: 'engine', categoryLabel: 'Engine', weight: 0.021, description: 'Isolated execution environment — safe experimentation.' },
  { id: 'medic',       label: 'MEDIC',       category: 'engine', categoryLabel: 'Engine', weight: 0.022, description: 'Autonomous diagnostics & self-repair engine.' },
  { id: 'reflex',      label: 'REFLEX',      category: 'engine', categoryLabel: 'Engine', weight: 0.020, description: 'Edge computing orchestration engine.' },
  // AGENTS (10)
  { id: 'encode',      label: 'ENCODE',      category: 'agent',  categoryLabel: 'Agent',  weight: 0.023, description: 'Code generation agent — fix generation, output formatting.' },
  { id: 'decode',      label: 'DECODE',      category: 'agent',  categoryLabel: 'Agent',  weight: 0.023, description: 'Epistemic interpreter — prompt parsing, intent extraction, NLU.' },
  { id: 'vision',      label: 'VISION',      category: 'agent',  categoryLabel: 'Agent',  weight: 0.023, description: 'Observability & telemetry — health aggregation, metric visualization.' },
  { id: 'phantom',     label: 'PHANTOM',     category: 'agent',  categoryLabel: 'Agent',  weight: 0.017, description: 'Privacy protection & anonymization agent.' },
  { id: 'lingua',      label: 'LINGUA',      category: 'agent',  categoryLabel: 'Agent',  weight: 0.015, description: 'Translation & localization agent.' },
  { id: 'echo',        label: 'ECHO',        category: 'agent',  categoryLabel: 'Agent',  weight: 0.020, description: 'Digital twin simulation & replay agent.' },
  { id: 'harvest',     label: 'HARVEST',     category: 'agent',  categoryLabel: 'Agent',  weight: 0.015, description: 'Data acquisition & ETL agent.' },
  { id: 'sovereign',   label: 'SOVEREIGN',   category: 'agent',  categoryLabel: 'Agent',  weight: 0.020, description: 'Data sovereignty & jurisdictional compliance agent.' },
  { id: 'engineer',    label: 'ENGINEER',    category: 'agent',  categoryLabel: 'Agent',  weight: 0.020, description: 'Infrastructure automation & deployment agent.' },
  { id: 'observer',    label: 'OBSERVER',    category: 'agent',  categoryLabel: 'Agent',  weight: 0.018, description: 'Divergence testing & shadow mesh operations agent.' },
];

const PRIMITIVE_MAP = Object.fromEntries(PRIMITIVES.map(p => [p.label, p]));

// ─── Ring configuration ─────────────────────────────────────────
// Concentric rings from outside in: DEFENSE shell → Layers → Engines+Agents → Organs

const RING_CONFIG = {
  organ:  { ring: 3, color: 'hsl(var(--neon-amber, 45 100% 60%))',  bgClass: 'bg-neon-amber/10 border-neon-amber/20', label: 'Organs' },
  engine: { ring: 2, color: 'hsl(var(--neon-green, 142 70% 49%))',  bgClass: 'bg-neon-green/10 border-neon-green/20', label: 'Engines' },
  agent:  { ring: 2, color: 'hsl(var(--neon-purple, 280 70% 60%))', bgClass: 'bg-neon-purple/10 border-neon-purple/20', label: 'Agents' },
  layer:  { ring: 1, color: 'hsl(var(--neon-cyan, 190 90% 50%))',   bgClass: 'bg-neon-cyan/10 border-neon-cyan/20', label: 'Layers' },
};

const CATEGORY_BG: Record<string, string> = {
  organ:  'bg-neon-amber/10 border-neon-amber/20',
  layer:  'bg-neon-cyan/10 border-neon-cyan/20',
  engine: 'bg-neon-green/10 border-neon-green/20',
  agent:  'bg-neon-purple/10 border-neon-purple/20',
};

// ─── SVG Concentric Diagram ─────────────────────────────────────

function ConcentricDiagram({ selected, onSelect }: { selected: PrimitiveMeta | null; onSelect: (p: PrimitiveMeta) => void }) {
  const size = 380;
  const cx = size / 2;
  const cy = size / 2;

  // Ring radii
  const rings = {
    defense: { r: 178, strokeWidth: 24 },  // outermost
    layers:  { r: 148, strokeWidth: 18 },
    middle:  { r: 110, strokeWidth: 18 },   // engines + agents
    organs:  { r: 65,  strokeWidth: 22 },    // innermost
    core:    { r: 20,  strokeWidth: 0 },     // CORE dot at center
  };

  const organs = PRIMITIVES.filter(p => p.category === 'organ' && p.label !== 'CORE');
  const layers = PRIMITIVES.filter(p => p.category === 'layer' && p.label !== 'DEFENSE');
  const engines = PRIMITIVES.filter(p => p.category === 'engine');
  const agents = PRIMITIVES.filter(p => p.category === 'agent');
  const defense = PRIMITIVES.find(p => p.label === 'DEFENSE')!;
  const core = PRIMITIVES.find(p => p.label === 'CORE')!;

  // Place primitives evenly around a ring
  const placeOnRing = (items: PrimitiveMeta[], radius: number, offsetAngle = 0) =>
    items.map((p, i) => {
      const angle = offsetAngle + (2 * Math.PI * i) / items.length - Math.PI / 2;
      return { ...p, x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) };
    });

  // Interleave engines and agents on the middle ring
  const middleItems: PrimitiveMeta[] = [];
  const maxLen = Math.max(engines.length, agents.length);
  for (let i = 0; i < maxLen; i++) {
    if (i < engines.length) middleItems.push(engines[i]);
    if (i < agents.length) middleItems.push(agents[i]);
  }

  const organPositions = placeOnRing(organs, rings.organs.r, 0.15);
  const layerPositions = placeOnRing(layers, rings.layers.r, 0.2);
  const middlePositions = placeOnRing(middleItems, rings.middle.r, 0.1);

  const allPositions = [
    ...organPositions,
    ...layerPositions,
    ...middlePositions,
  ];

  const getFontSize = (cat: string) => {
    if (cat === 'organ') return 5.5;
    return 5;
  };

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full max-w-[380px] mx-auto">
      <defs>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* DEFENSE — outermost shell ring */}
      <circle cx={cx} cy={cy} r={rings.defense.r} fill="none" stroke="hsl(var(--neon-cyan, 190 90% 50%))" strokeWidth="1.5" opacity="0.15" />
      <circle cx={cx} cy={cy} r={rings.defense.r + 10} fill="none" stroke="hsl(var(--neon-cyan, 190 90% 50%))" strokeWidth="0.5" opacity="0.08" strokeDasharray="4 6" />
      {/* DEFENSE label on outer ring */}
      <g
        className="cursor-pointer"
        onClick={() => onSelect(defense)}
      >
        <text x={cx} y={cy - rings.defense.r - 4} textAnchor="middle" fontSize="7" fontWeight="900" fontFamily="monospace"
          fill={selected?.id === 'defense' ? 'hsl(var(--primary))' : 'hsl(var(--neon-cyan, 190 90% 50%))'}
          opacity={selected?.id === 'defense' ? 1 : 0.7}
        >
          DEFENSE LAYER
        </text>
        <text x={cx} y={cy - rings.defense.r + 6} textAnchor="middle" fontSize="4.5" fontFamily="monospace"
          fill="hsl(var(--muted-foreground))" opacity="0.5"
        >
          outermost containment shell
        </text>
      </g>

      {/* Layers ring */}
      <circle cx={cx} cy={cy} r={rings.layers.r} fill="none" stroke="hsl(var(--neon-cyan, 190 90% 50%))" strokeWidth="0.8" opacity="0.12" />

      {/* Middle ring (Engines + Agents) */}
      <circle cx={cx} cy={cy} r={rings.middle.r} fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth="0.5" opacity="0.1" strokeDasharray="2 4" />

      {/* Organs ring */}
      <circle cx={cx} cy={cy} r={rings.organs.r} fill="none" stroke="hsl(var(--neon-amber, 45 100% 60%))" strokeWidth="0.8" opacity="0.15" />

      {/* CORE — center dot */}
      <g className="cursor-pointer" onClick={() => onSelect(core)}>
        <circle cx={cx} cy={cy} r={14} fill="hsl(var(--neon-amber, 45 100% 60%))" opacity={selected?.id === 'core' ? 0.3 : 0.12} />
        <circle cx={cx} cy={cy} r={8} fill="hsl(var(--neon-amber, 45 100% 60%))" opacity={selected?.id === 'core' ? 0.5 : 0.25} />
        <circle cx={cx} cy={cy} r={3} fill="hsl(var(--neon-amber, 45 100% 60%))" opacity="0.8" filter="url(#glow)" />
        <text x={cx} y={cy + 22} textAnchor="middle" fontSize="6" fontWeight="900" fontFamily="monospace"
          fill={selected?.id === 'core' ? 'hsl(var(--primary))' : 'hsl(var(--neon-amber, 45 100% 60%))'}
          opacity={selected?.id === 'core' ? 1 : 0.8}
        >
          CORE
        </text>
      </g>

      {/* Connection lines from CORE to organs */}
      {organPositions.map((p) => (
        <line key={`conn-${p.id}`} x1={cx} y1={cy} x2={p.x} y2={p.y}
          stroke="hsl(var(--neon-amber, 45 100% 60%))" strokeWidth="0.3" opacity="0.08" />
      ))}

      {/* Render all positioned primitives */}
      {allPositions.map((p) => {
        const isSelected = selected?.id === p.id;
        const cat = p.category;
        const ringCfg = RING_CONFIG[cat];
        const fontSize = getFontSize(cat);
        const dotR = cat === 'organ' ? 3.5 : 3;

        return (
          <g key={p.id} className="cursor-pointer" onClick={() => onSelect(p)}>
            {/* Glow on selection */}
            {isSelected && (
              <circle cx={p.x} cy={p.y} r={dotR + 4} fill={ringCfg.color} opacity="0.15" filter="url(#glow)" />
            )}
            {/* Dot */}
            <circle cx={p.x} cy={p.y} r={dotR}
              fill={isSelected ? 'hsl(var(--primary))' : ringCfg.color}
              opacity={isSelected ? 0.9 : 0.6}
            />
            {/* Label */}
            <text x={p.x} y={p.y - dotR - 3} textAnchor="middle" fontSize={fontSize} fontWeight="700" fontFamily="monospace"
              fill={isSelected ? 'hsl(var(--primary))' : 'hsl(var(--foreground))'}
              opacity={isSelected ? 1 : 0.65}
            >
              {p.label}
            </text>
          </g>
        );
      })}

      {/* Ring labels */}
      <text x={cx + rings.organs.r + 2} y={cy - rings.organs.r + 14} fontSize="4" fontFamily="monospace"
        fill="hsl(var(--neon-amber, 45 100% 60%))" opacity="0.4" transform={`rotate(30, ${cx + rings.organs.r + 2}, ${cy - rings.organs.r + 14})`}
      >
        ORGANS
      </text>
      <text x={cx + rings.middle.r + 2} y={cy - rings.middle.r + 14} fontSize="4" fontFamily="monospace"
        fill="hsl(var(--muted-foreground))" opacity="0.3" transform={`rotate(25, ${cx + rings.middle.r + 2}, ${cy - rings.middle.r + 14})`}
      >
        ENGINES + AGENTS
      </text>
      <text x={cx + rings.layers.r + 2} y={cy - rings.layers.r + 14} fontSize="4" fontFamily="monospace"
        fill="hsl(var(--neon-cyan, 190 90% 50%))" opacity="0.3" transform={`rotate(20, ${cx + rings.layers.r + 2}, ${cy - rings.layers.r + 14})`}
      >
        LAYERS
      </text>
    </svg>
  );
}

// ─── Main Component ──────────────────────────────────────────────

export function SubstrateGraph({ className }: { className?: string }) {
  const [selected, setSelected] = useState<PrimitiveMeta | null>(null);

  const handleSelect = useCallback((p: PrimitiveMeta) => {
    setSelected(prev => prev?.id === p.id ? null : p);
  }, []);

  return (
    <div className={cn("relative", className)}>
      <div className="bg-card/60 backdrop-blur-sm border border-border/40 rounded-2xl p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 pb-3 border-b border-border/30">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-destructive/60" />
              <span className="w-2.5 h-2.5 rounded-full bg-neon-amber/60" />
              <span className="w-2.5 h-2.5 rounded-full bg-neon-green/60" />
            </div>
            <span className="text-[10px] font-mono text-muted-foreground/50 tracking-wider uppercase">
              Concentric Topology
            </span>
          </div>
          <span className="text-[10px] font-mono text-muted-foreground/30">40 primitives</span>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 mb-3 text-[9px] font-mono">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-neon-amber/60" /> Organs (12)</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-neon-cyan/60" /> Layers (8)</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-neon-green/60" /> Engines (10)</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-neon-purple/60" /> Agents (10)</span>
        </div>

        {/* SVG Diagram */}
        <ConcentricDiagram selected={selected} onSelect={handleSelect} />

        {/* Footer */}
        <div className="mt-3 pt-3 border-t border-border/20 flex items-center gap-2 text-[10px] font-mono text-muted-foreground/40">
          <span className="w-1.5 h-1.5 rounded-full bg-neon-green/50 animate-pulse" />
          <span>Click any primitive to inspect · Σ weights = 1.000</span>
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
              "mt-3 p-4 rounded-xl border shadow-xl backdrop-blur-md relative",
              CATEGORY_BG[selected.category] ?? 'bg-card/95 border-border/40'
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
                {selected.categoryLabel} · {(selected.weight * 100).toFixed(1)}%
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
              <span>Category: {selected.categoryLabel}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
