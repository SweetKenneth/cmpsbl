/**
 * SubstrateGraph — Interactive ASCII-tree topology of the 40-primitive substrate.
 * Organized by the four-category primitive taxonomy.
 * Click any primitive to inspect details.
 */
import { useState, useCallback } from "react";
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

const PRIMITIVE_MAP: Record<string, PrimitiveMeta> = {
  // ── ORGANS (12) — Internal infrastructure sustaining the substrate ──
  CORE:        { id: 'core',        label: 'CORE',        category: 'organ',  categoryLabel: 'Organ',  weight: 0.110, description: 'Kernel orchestration & boot authority — initializes all layers, maintains canonical registry.' },
  SYSTEM:      { id: 'system',      label: 'SYSTEM',      category: 'organ',  categoryLabel: 'Organ',  weight: 0.040, description: 'Lifecycle management, configuration state, diagnostics aggregation, and self-repair loop.' },
  NERVE:       { id: 'nerve',       label: 'NERVE',       category: 'organ',  categoryLabel: 'Organ',  weight: 0.025, description: 'Operational signaling, consensus repair, inter-primitive coordination.' },
  RIPPLE:      { id: 'ripple',      label: 'RIPPLE',      category: 'organ',  categoryLabel: 'Organ',  weight: 0.025, description: 'Signal & event bus — inter-zone communication, cascade detection.' },
  RELAY:       { id: 'relay',       label: 'RELAY',       category: 'organ',  categoryLabel: 'Organ',  weight: 0.025, description: 'Webhook dispatch, external integration relay.' },
  IDENTITY:    { id: 'identity',    label: 'IDENTITY',    category: 'organ',  categoryLabel: 'Organ',  weight: 0.025, description: 'Session management, role resolution, entity binding.' },
  ACCESS:      { id: 'access',      label: 'ACCESS',      category: 'organ',  categoryLabel: 'Organ',  weight: 0.025, description: 'API entitlements, rate limiting, billing integration.' },
  NEXUS:       { id: 'nexus',       label: 'NEXUS',       category: 'organ',  categoryLabel: 'Organ',  weight: 0.023, description: 'AI provider routing gateway — model selection, fallback chains.' },
  AUDIT:       { id: 'audit',       label: 'AUDIT',       category: 'organ',  categoryLabel: 'Organ',  weight: 0.025, description: 'Integrity ledger — immutable logging, chain-of-custody.' },
  INTEGRATION: { id: 'integration', label: 'INTEGRATION', category: 'organ',  categoryLabel: 'Organ',  weight: 0.020, description: 'Dependency resolver — cross-surface binding, boots last.' },
  BRAIN:       { id: 'brain',       label: 'BRAIN',       category: 'organ',  categoryLabel: 'Organ',  weight: 0.040, description: 'Reasoning engine — reflection cycles, pattern recognition, learning orchestration.' },
  MEMORY:      { id: 'memory',      label: 'MEMORY',      category: 'organ',  categoryLabel: 'Organ',  weight: 0.040, description: 'Tiered persistent storage — hot/warm/cold recall with vector retrieval.' },

  // ── LAYERS (8) — Ambient overlays that protect and govern ──
  DEFENSE:     { id: 'defense',     label: 'DEFENSE',     category: 'layer',  categoryLabel: 'Layer',  weight: 0.030, description: 'Terminal boundary enforcement — outermost containment shell.' },
  IMMUNITY:    { id: 'immunity',    label: 'IMMUNITY',    category: 'layer',  categoryLabel: 'Layer',  weight: 0.030, description: 'Adaptive resilience, threat adaptation, self-healing.' },
  GOVERNANCE:  { id: 'governance',  label: 'GOVERNANCE',  category: 'layer',  categoryLabel: 'Layer',  weight: 0.030, description: 'Policy enforcement overlay — action legitimacy supervision.' },
  INTENT:      { id: 'intent',      label: 'INTENT',      category: 'layer',  categoryLabel: 'Layer',  weight: 0.030, description: 'Purpose alignment, goal tracking, capability discovery.' },
  EVOLUTION:   { id: 'evolution',   label: 'EVOLUTION',   category: 'layer',  categoryLabel: 'Layer',  weight: 0.020, description: 'Mutation lifecycle & self-evolution layer.' },
  INCLUSIVE:   { id: 'inclusive',    label: 'INCLUSIVE',    category: 'layer',  categoryLabel: 'Layer',  weight: 0.021, description: 'Accessibility layer — WCAG scanning, compliance reporting.' },
  CONSCIENCE:  { id: 'conscience',  label: 'CONSCIENCE',  category: 'layer',  categoryLabel: 'Layer',  weight: 0.020, description: 'Ethical assessment & bias detection.' },
  TREATY:      { id: 'treaty',      label: 'TREATY',      category: 'layer',  categoryLabel: 'Layer',  weight: 0.020, description: 'Contract negotiation & SLA enforcement.' },

  // ── ENGINES (10) — Invoked processing powerhouses ──
  DREAM:       { id: 'dream',       label: 'DREAM',       category: 'engine', categoryLabel: 'Engine', weight: 0.040, description: 'Synthesis zone — creative combination, heuristic generation, SimNap cycles.' },
  CORTEX:      { id: 'cortex',      label: 'CORTEX',      category: 'engine', categoryLabel: 'Engine', weight: 0.023, description: 'Autonomous orchestrator — multi-surface coordination, task routing.' },
  ORACLE:      { id: 'oracle',      label: 'ORACLE',      category: 'engine', categoryLabel: 'Engine', weight: 0.020, description: 'Predictive modeling & probabilistic reasoning.' },
  FORGE:       { id: 'forge',       label: 'FORGE',       category: 'engine', categoryLabel: 'Engine', weight: 0.015, description: 'Artifact synthesis & manufacturing engine.' },
  COMPASS:     { id: 'compass',     label: 'COMPASS',     category: 'engine', categoryLabel: 'Engine', weight: 0.020, description: 'Geospatial analysis & navigation.' },
  ATLAS:       { id: 'atlas',       label: 'ATLAS',       category: 'engine', categoryLabel: 'Engine', weight: 0.020, description: 'System map & capability registry — the global view of what exists.' },
  ECONOMY:     { id: 'economy',     label: 'ECONOMY',     category: 'engine', categoryLabel: 'Engine', weight: 0.021, description: 'Value & cost tracking — ROI calculation, usage metering.' },
  SANDBOX:     { id: 'sandbox',     label: 'SANDBOX',     category: 'engine', categoryLabel: 'Engine', weight: 0.021, description: 'Isolated execution environment — safe experimentation.' },
  MEDIC:       { id: 'medic',       label: 'MEDIC',       category: 'engine', categoryLabel: 'Engine', weight: 0.022, description: 'Autonomous diagnostics & self-repair engine.' },
  REFLEX:      { id: 'reflex',      label: 'REFLEX',      category: 'engine', categoryLabel: 'Engine', weight: 0.020, description: 'Edge computing orchestration engine.' },

  // ── AGENTS (10) — Autonomous actors that decide and act ──
  ENCODE:      { id: 'encode',      label: 'ENCODE',      category: 'agent',  categoryLabel: 'Agent',  weight: 0.023, description: 'Code generation agent — fix generation, output formatting.' },
  DECODE:      { id: 'decode',      label: 'DECODE',      category: 'agent',  categoryLabel: 'Agent',  weight: 0.023, description: 'Epistemic interpreter — prompt parsing, intent extraction, NLU.' },
  VISION:      { id: 'vision',      label: 'VISION',      category: 'agent',  categoryLabel: 'Agent',  weight: 0.023, description: 'Observability & telemetry — health aggregation, metric visualization.' },
  PHANTOM:     { id: 'phantom',     label: 'PHANTOM',     category: 'agent',  categoryLabel: 'Agent',  weight: 0.017, description: 'Privacy protection & anonymization agent.' },
  LINGUA:      { id: 'lingua',      label: 'LINGUA',      category: 'agent',  categoryLabel: 'Agent',  weight: 0.015, description: 'Translation & localization agent.' },
  ECHO:        { id: 'echo',        label: 'ECHO',        category: 'agent',  categoryLabel: 'Agent',  weight: 0.020, description: 'Digital twin simulation & replay agent.' },
  HARVEST:     { id: 'harvest',     label: 'HARVEST',     category: 'agent',  categoryLabel: 'Agent',  weight: 0.015, description: 'Data acquisition & ETL agent.' },
  SOVEREIGN:   { id: 'sovereign',   label: 'SOVEREIGN',   category: 'agent',  categoryLabel: 'Agent',  weight: 0.020, description: 'Data sovereignty & jurisdictional compliance agent.' },
  ENGINEER:    { id: 'engineer',    label: 'ENGINEER',    category: 'agent',  categoryLabel: 'Agent',  weight: 0.020, description: 'Infrastructure automation & deployment agent.' },
  OBSERVER:    { id: 'observer',    label: 'OBSERVER',    category: 'agent',  categoryLabel: 'Agent',  weight: 0.018, description: 'Divergence testing & shadow mesh operations agent.' },
};

const CATEGORY_COLORS: Record<string, string> = {
  organ:  'text-neon-amber',
  layer:  'text-neon-cyan',
  engine: 'text-neon-green',
  agent:  'text-neon-purple',
};

const CATEGORY_BG: Record<string, string> = {
  organ:  'bg-neon-amber/10 border-neon-amber/20',
  layer:  'bg-neon-cyan/10 border-neon-cyan/20',
  engine: 'bg-neon-green/10 border-neon-green/20',
  agent:  'bg-neon-purple/10 border-neon-purple/20',
};

// ─── Tree structure ─────────────────────────────────────────────

interface TreeLine {
  prefix: string;
  label: string;
  primitives?: string[];
  isContinuation?: boolean;
}

const TREE: TreeLine[] = [
  { prefix: '├─', label: 'Organs (12):',  primitives: ['CORE', 'SYSTEM', 'NERVE', 'RIPPLE', 'RELAY', 'IDENTITY'] },
  { prefix: '│ ', label: '',               primitives: ['ACCESS', 'NEXUS', 'AUDIT', 'INTEGRATION', 'BRAIN', 'MEMORY'], isContinuation: true },
  { prefix: '├─', label: 'Layers (8):',   primitives: ['DEFENSE', 'IMMUNITY', 'GOVERNANCE', 'INTENT'] },
  { prefix: '│ ', label: '',               primitives: ['EVOLUTION', 'INCLUSIVE', 'CONSCIENCE', 'TREATY'], isContinuation: true },
  { prefix: '├─', label: 'Engines (10):', primitives: ['DREAM', 'CORTEX', 'ORACLE', 'FORGE', 'COMPASS'] },
  { prefix: '│ ', label: '',               primitives: ['ATLAS', 'ECONOMY', 'SANDBOX', 'MEDIC', 'REFLEX'], isContinuation: true },
  { prefix: '└─', label: 'Agents (10):',  primitives: ['ENCODE', 'DECODE', 'VISION', 'PHANTOM', 'LINGUA'] },
  { prefix: '  ', label: '',               primitives: ['ECHO', 'HARVEST', 'SOVEREIGN', 'ENGINEER', 'OBSERVER'], isContinuation: true },
];

// ─── Component ───────────────────────────────────────────────────

function PrimitiveChip({ name, selected, onSelect }: { name: string; selected: boolean; onSelect: () => void }) {
  const meta = PRIMITIVE_MAP[name];
  if (!meta) return <span className="text-muted-foreground">{name}</span>;

  const colorClass = CATEGORY_COLORS[meta.category] ?? 'text-muted-foreground';

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
  const [selected, setSelected] = useState<PrimitiveMeta | null>(null);

  const handleSelect = useCallback((name: string) => {
    const meta = PRIMITIVE_MAP[name];
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
            40-Primitive Topology · 4 Categories
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
              {line.primitives && (
                <span className="flex flex-wrap items-baseline gap-x-0.5 gap-y-0">
                  {line.primitives.map((name, j) => (
                    <span key={name} className="flex items-baseline">
                      <PrimitiveChip
                        name={name}
                        selected={selected?.label === name}
                        onSelect={() => handleSelect(name)}
                      />
                      {j < line.primitives!.length - 1 && (
                        <span className="text-border/40 mx-0.5">→</span>
                      )}
                    </span>
                  ))}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Primitive count badge */}
        <div className="mt-4 pt-3 border-t border-border/20 flex items-center gap-2 text-[10px] font-mono text-muted-foreground/40">
          <span className="w-1.5 h-1.5 rounded-full bg-neon-green/50 animate-pulse" />
          <span>Σ 40 primitives · weights = 1.000</span>
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
