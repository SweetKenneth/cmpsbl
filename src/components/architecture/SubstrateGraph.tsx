/**
 * SubstrateGraph — Interactive 2D concentric ring visualization of the 40-node topology.
 * SVG-based for accessibility + framer-motion for interactions.
 * Click a node → detail panel slides in.
 */
import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Data ────────────────────────────────────────────────────────

interface NodeDef {
  id: string;
  label: string;
  sector: string;
  weight: number;
  description: string;
}

const NODES: NodeDef[] = [
  { id: 'core', label: 'CORE', sector: 'core', weight: 0.110, description: 'Kernel orchestration & boot authority' },
  { id: 'system', label: 'SYSTEM', sector: 'system', weight: 0.040, description: 'Lifecycle management, configuration, diagnostics' },
  { id: 'brain', label: 'BRAIN', sector: 'ccr', weight: 0.040, description: 'Reasoning & cognition zone' },
  { id: 'memory', label: 'MEMORY', sector: 'ccr', weight: 0.040, description: 'Tiered memory storage zone' },
  { id: 'dream', label: 'DREAM', sector: 'ccr', weight: 0.040, description: 'Dream synthesis zone' },
  { id: 'ripple', label: 'RIPPLE', sector: 'ocg', weight: 0.025, description: 'Signal & event bus' },
  { id: 'access', label: 'ACCESS', sector: 'ocg', weight: 0.025, description: 'Entitlements & API keys' },
  { id: 'identity', label: 'IDENTITY', sector: 'ocg', weight: 0.025, description: 'Session & role management' },
  { id: 'relay', label: 'RELAY', sector: 'ocg', weight: 0.025, description: 'Webhook dispatch' },
  { id: 'audit', label: 'AUDIT', sector: 'ocg', weight: 0.025, description: 'Integrity ledger' },
  { id: 'nerve', label: 'NERVE', sector: 'ocg', weight: 0.025, description: 'Inter-node signaling & consensus repair' },
  { id: 'decode', label: 'DECODE', sector: 'execution', weight: 0.023, description: 'Epistemic interpreter' },
  { id: 'encode', label: 'ENCODE', sector: 'execution', weight: 0.023, description: 'Code generation pipeline' },
  { id: 'vision', label: 'VISION', sector: 'execution', weight: 0.023, description: 'Observability & telemetry' },
  { id: 'cortex', label: 'CORTEX', sector: 'execution', weight: 0.023, description: 'Autonomous orchestrator' },
  { id: 'nexus', label: 'NEXUS', sector: 'execution', weight: 0.023, description: 'AI provider routing' },
  { id: 'economy', label: 'ECONOMY', sector: 'execution', weight: 0.021, description: 'Metering & billing' },
  { id: 'sandbox', label: 'SANDBOX', sector: 'execution', weight: 0.021, description: 'Isolated execution' },
  { id: 'inclusive', label: 'INCLUSIVE', sector: 'execution', weight: 0.021, description: 'WCAG compatibility' },
  { id: 'medic', label: 'MEDIC', sector: 'execution', weight: 0.022, description: 'Autonomous diagnostics & self-repair' },
  { id: 'integration', label: 'INTEGRATION', sector: 'execution', weight: 0.020, description: 'Dependency resolver (boots last)' },
  { id: 'sovereign', label: 'SOVEREIGN', sector: 'esz', weight: 0.020, description: 'Data sovereignty & jurisdictional compliance' },
  { id: 'oracle', label: 'ORACLE', sector: 'esz', weight: 0.020, description: 'Predictive modeling & probabilistic reasoning' },
  { id: 'conscience', label: 'CONSCIENCE', sector: 'esz', weight: 0.020, description: 'Ethical assessment & bias detection' },
  { id: 'treaty', label: 'TREATY', sector: 'esz', weight: 0.020, description: 'Contract negotiation & SLA enforcement' },
  { id: 'compass', label: 'COMPASS', sector: 'epz', weight: 0.020, description: 'Geospatial analysis & navigation' },
  { id: 'echo', label: 'ECHO', sector: 'epz', weight: 0.020, description: 'Digital twin simulation & replay' },
  { id: 'reflex', label: 'REFLEX', sector: 'epz', weight: 0.020, description: 'Edge computing orchestration' },
  { id: 'forge', label: 'FORGE', sector: 'emz', weight: 0.015, description: 'Artifact synthesis & manufacturing' },
  { id: 'lingua', label: 'LINGUA', sector: 'emz', weight: 0.015, description: 'Translation & localization' },
  { id: 'harvest', label: 'HARVEST', sector: 'emz', weight: 0.015, description: 'Data acquisition & ETL pipelines' },
  { id: 'evolution', label: 'EVOLUTION', sector: 'csz', weight: 0.020, description: 'Mutation lifecycle & self-evolution' },
  { id: 'shadow', label: 'SHADOW', sector: 'csz', weight: 0.018, description: 'Divergence testing & shadow mesh operations' },
  { id: 'phantom', label: 'PHANTOM', sector: 'csz', weight: 0.017, description: 'Privacy protection & anonymization' },
  { id: 'immunity', label: 'IMMUNITY', sector: 'field', weight: 0.030, description: 'Resilience field' },
  { id: 'intent', label: 'INTENT', sector: 'field', weight: 0.030, description: 'Capability discovery field' },
  { id: 'governance', label: 'GOVERNANCE', sector: 'plane', weight: 0.030, description: 'Policy enforcement overlay plane' },
  { id: 'defense', label: 'DEFENSE', sector: 'shell', weight: 0.030, description: 'Outer containment shell' },
];

const SECTOR_META: Record<string, { color: string; label: string; ring: number }> = {
  core:      { color: 'hsl(var(--primary))',       label: 'Kernel',              ring: 0 },
  system:    { color: 'hsl(var(--primary) / 0.8)', label: 'System',              ring: 0 },
  ccr:       { color: 'hsl(200, 80%, 60%)',        label: 'Cognitive Core',      ring: 1 },
  ocg:       { color: 'hsl(45, 85%, 55%)',         label: 'Compliance Grid',     ring: 2 },
  execution: { color: 'hsl(140, 65%, 50%)',        label: 'Execution',           ring: 3 },
  esz:       { color: 'hsl(280, 70%, 60%)',        label: 'Sovereignty Zone',    ring: 4 },
  epz:       { color: 'hsl(180, 60%, 50%)',        label: 'Perception Zone',     ring: 4 },
  emz:       { color: 'hsl(25, 80%, 55%)',         label: 'Manufacturing Zone',  ring: 4 },
  csz:       { color: 'hsl(320, 60%, 55%)',        label: 'Covert Systems',      ring: 4 },
  field:     { color: 'hsl(160, 70%, 50%)',        label: 'Field Overlays',      ring: 5 },
  plane:     { color: 'hsl(220, 70%, 60%)',        label: 'Governance Plane',    ring: 5 },
  shell:     { color: 'hsl(0, 70%, 55%)',          label: 'Defense Shell',       ring: 6 },
};

// ─── Ring layout math ────────────────────────────────────────────

interface PlacedNode extends NodeDef {
  x: number;
  y: number;
  color: string;
  sectorLabel: string;
}

function layoutNodes(size: number): PlacedNode[] {
  const cx = size / 2;
  const cy = size / 2;
  const maxR = size * 0.42;
  const rings: Record<number, NodeDef[]> = {};

  NODES.forEach(n => {
    const ring = SECTOR_META[n.sector]?.ring ?? 3;
    if (!rings[ring]) rings[ring] = [];
    rings[ring].push(n);
  });

  const placed: PlacedNode[] = [];
  const ringCount = 7;

  for (let r = 0; r <= 6; r++) {
    const nodes = rings[r] || [];
    if (nodes.length === 0) continue;
    const radius = r === 0 ? 0 : (r / ringCount) * maxR + maxR * 0.12;
    const angleStep = (2 * Math.PI) / Math.max(nodes.length, 1);
    const offset = r * 0.3;

    nodes.forEach((n, i) => {
      const angle = offset + i * angleStep - Math.PI / 2;
      const meta = SECTOR_META[n.sector];
      placed.push({
        ...n,
        x: r === 0 && nodes.length <= 2 ? cx + (i === 0 ? -14 : 14) : cx + Math.cos(angle) * radius,
        y: r === 0 && nodes.length <= 2 ? cy + (i === 0 ? -10 : 10) : cy + Math.sin(angle) * radius,
        color: meta?.color ?? 'hsl(var(--muted-foreground))',
        sectorLabel: meta?.label ?? n.sector,
      });
    });
  }

  return placed;
}

// ─── Component ───────────────────────────────────────────────────

export function SubstrateGraph({ className }: { className?: string }) {
  const [selected, setSelected] = useState<PlacedNode | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  const SIZE = 600;
  const nodes = useMemo(() => layoutNodes(SIZE), []);

  const handleClick = useCallback((node: PlacedNode) => {
    setSelected(prev => prev?.id === node.id ? null : node);
  }, []);

  const coreNode = nodes.find(n => n.id === 'core');

  return (
    <div className={cn("relative", className)}>
      <div className="w-full aspect-square max-w-[600px] mx-auto relative">
        <svg
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="w-full h-full"
          role="img"
          aria-label="CMPSBL Substrate 40-node topology"
        >
          <defs>
            {/* Pulse animation for CORE */}
            <radialGradient id="core-glow">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.2" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Ring guides */}
          {[1, 2, 3, 4, 5, 6].map(r => {
            const radius = (r / 7) * SIZE * 0.42 + SIZE * 0.42 * 0.12;
            return (
              <circle
                key={r}
                cx={SIZE / 2}
                cy={SIZE / 2}
                r={radius}
                fill="none"
                stroke="hsl(var(--border) / 0.12)"
                strokeWidth="0.8"
                strokeDasharray="3 6"
              />
            );
          })}

          {/* Connection lines from core → ring-1/system */}
          {coreNode && nodes.filter(n => n.sector === 'ccr' || n.sector === 'system').map(n => (
            <line
              key={`conn-${n.id}`}
              x1={coreNode.x}
              y1={coreNode.y}
              x2={n.x}
              y2={n.y}
              stroke="hsl(var(--primary) / 0.08)"
              strokeWidth="0.8"
            />
          ))}

          {/* CORE ambient glow */}
          {coreNode && (
            <circle
              cx={coreNode.x}
              cy={coreNode.y}
              r="40"
              fill="url(#core-glow)"
              className="animate-pulse"
            />
          )}

          {/* Nodes */}
          {nodes.map(node => {
            const isHovered = hovered === node.id;
            const isSelected = selected?.id === node.id;
            const isCore = node.sector === 'core';
            const nodeR = isCore ? 20 : 14;

            return (
              <g
                key={node.id}
                onClick={() => handleClick(node)}
                onMouseEnter={() => setHovered(node.id)}
                onMouseLeave={() => setHovered(null)}
                className="cursor-pointer"
                role="button"
                aria-label={`${node.label} — ${node.description}`}
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleClick(node)}
              >
                {/* Hover/select glow ring */}
                {(isHovered || isSelected) && (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={nodeR + 5}
                    fill="none"
                    stroke={node.color}
                    strokeWidth="1.5"
                    opacity={0.4}
                    strokeDasharray={isSelected ? "none" : "2 2"}
                  />
                )}
                {/* Node circle */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={nodeR}
                  fill={isSelected ? node.color : `${node.color.replace(')', ' / 0.12)')}`}
                  stroke={node.color}
                  strokeWidth={isSelected ? 2 : 1}
                  opacity={isHovered || isSelected ? 1 : 0.75}
                  className="transition-opacity duration-200"
                />
                {/* Label */}
                <text
                  x={node.x}
                  y={node.y + 0.5}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={isSelected ? 'hsl(var(--background))' : 'hsl(var(--foreground))'}
                  fontSize={isCore ? 8.5 : 6}
                  fontWeight="800"
                  fontFamily="system-ui, sans-serif"
                  letterSpacing="0.3"
                  className="select-none pointer-events-none"
                >
                  {node.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* ─── Detail panel ─── */}
      <AnimatePresence>
        {selected && (
          <motion.div
            key={selected.id}
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="absolute bottom-0 left-0 right-0 sm:bottom-4 sm:left-4 sm:right-4 p-4 sm:p-5 rounded-t-2xl sm:rounded-2xl bg-card/95 backdrop-blur-md border border-border/40 shadow-2xl z-20"
          >
            <button
              onClick={() => setSelected(null)}
              className="absolute top-3 right-3 w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Close detail"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center text-xs font-black border"
                style={{
                  background: `${selected.color.replace(')', ' / 0.1)')}`,
                  borderColor: `${selected.color.replace(')', ' / 0.25)')}`,
                  color: selected.color,
                }}
              >
                {selected.label.slice(0, 3)}
              </div>
              <div>
                <h3 className="text-base font-black text-foreground">{selected.label}</h3>
                <p className="text-[11px] text-muted-foreground font-mono">
                  {selected.sectorLabel} · Weight {(selected.weight * 100).toFixed(1)}%
                </p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed">{selected.description}</p>

            <div className="mt-3 flex items-center gap-4 text-[10px] text-muted-foreground/50 font-mono">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Operational
              </span>
              <span>Sector: {selected.sector.toUpperCase()}</span>
              <span>Ring {SECTOR_META[selected.sector]?.ring ?? '?'}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
