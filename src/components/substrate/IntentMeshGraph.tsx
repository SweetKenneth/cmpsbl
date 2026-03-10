/**
 * Intent Mesh Visualization — Interactive Force-Directed Graph Component
 * Replaces static copy with a live mesh diagram
 *
 * Renders an SVG-based force simulation showing module nodes
 * with connections representing resolver relationships.
 */

import { useEffect, useRef, useMemo, useState } from 'react';
import { motion } from 'framer-motion';

interface MeshNode {
  id: string;
  label: string;
  layer: string;
  resolvers: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

interface MeshEdge {
  source: string;
  target: string;
  weight: number;
}

const LAYER_COLORS: Record<string, string> = {
  Kernel: 'hsl(var(--primary))',
  Cognitive: 'hsl(260, 70%, 60%)',
  Operational: 'hsl(340, 70%, 60%)',
  Administrative: 'hsl(40, 80%, 55%)',
  Orchestrator: 'hsl(185, 70%, 50%)',
  Infrastructure: 'hsl(145, 60%, 50%)',
};

const MODULES: Array<{ id: string; label: string; layer: string; resolvers: number }> = [
  { id: 'brain', label: 'BRAIN', layer: 'Kernel', resolvers: 3 },
  { id: 'memory', label: 'MEMORY', layer: 'Kernel', resolvers: 4 },
  { id: 'cortex', label: 'CORTEX', layer: 'Kernel', resolvers: 3 },
  { id: 'decode', label: 'DECODE', layer: 'Cognitive', resolvers: 2 },
  { id: 'encode', label: 'ENCODE', layer: 'Cognitive', resolvers: 2 },
  { id: 'dream', label: 'DREAM', layer: 'Cognitive', resolvers: 2 },
  { id: 'defense', label: 'DEFENSE', layer: 'Operational', resolvers: 7 },
  { id: 'identity', label: 'IDENTITY', layer: 'Operational', resolvers: 4 },
  { id: 'vision', label: 'VISION', layer: 'Operational', resolvers: 4 },
  { id: 'economy', label: 'ECONOMY', layer: 'Administrative', resolvers: 4 },
  { id: 'audit', label: 'AUDIT', layer: 'Administrative', resolvers: 3 },
  { id: 'access', label: 'ACCESS', layer: 'Administrative', resolvers: 2 },
  { id: 'nexus', label: 'NEXUS', layer: 'Orchestrator', resolvers: 2 },
  { id: 'relay', label: 'RELAY', layer: 'Orchestrator', resolvers: 3 },
  { id: 'sandbox', label: 'SANDBOX', layer: 'Orchestrator', resolvers: 2 },
  { id: 'system', label: 'SYSTEM', layer: 'Infrastructure', resolvers: 2 },
  { id: 'evolution', label: 'EVOLUTION', layer: 'Infrastructure', resolvers: 2 },
  { id: 'inclusive', label: 'INCLUSIVE', layer: 'Infrastructure', resolvers: 2 },
  { id: 'ripple', label: 'RIPPLE', layer: 'Infrastructure', resolvers: 2 },
  { id: 'integration', label: 'INTEG.', layer: 'Infrastructure', resolvers: 2 },
  { id: 'clm', label: 'CLM', layer: 'Infrastructure', resolvers: 1 },
];

// Key cross-module edges (representing resolver relationships)
const EDGES: MeshEdge[] = [
  { source: 'brain', target: 'memory', weight: 3 },
  { source: 'brain', target: 'cortex', weight: 2 },
  { source: 'cortex', target: 'decode', weight: 2 },
  { source: 'cortex', target: 'encode', weight: 2 },
  { source: 'memory', target: 'dream', weight: 2 },
  { source: 'decode', target: 'brain', weight: 1 },
  { source: 'defense', target: 'identity', weight: 3 },
  { source: 'defense', target: 'audit', weight: 2 },
  { source: 'vision', target: 'economy', weight: 1 },
  { source: 'nexus', target: 'relay', weight: 2 },
  { source: 'nexus', target: 'brain', weight: 1 },
  { source: 'system', target: 'evolution', weight: 2 },
  { source: 'system', target: 'cortex', weight: 1 },
  { source: 'clm', target: 'brain', weight: 2 },
  { source: 'clm', target: 'memory', weight: 2 },
  { source: 'sandbox', target: 'encode', weight: 1 },
  { source: 'ripple', target: 'relay', weight: 1 },
  { source: 'economy', target: 'access', weight: 1 },
  { source: 'identity', target: 'access', weight: 1 },
  { source: 'integration', target: 'nexus', weight: 1 },
  { source: 'dream', target: 'brain', weight: 2 },
];

export function IntentMeshGraph({ className = '' }: { className?: string }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });
  const animRef = useRef<number>(0);

  // Initialize nodes with positions
  const nodesRef = useRef<MeshNode[]>(
    MODULES.map((m, i) => {
      const angle = (i / MODULES.length) * Math.PI * 2;
      const radius = 180;
      return {
        ...m,
        x: 400 + Math.cos(angle) * radius + (Math.random() - 0.5) * 40,
        y: 250 + Math.sin(angle) * radius + (Math.random() - 0.5) * 40,
        vx: 0,
        vy: 0,
      };
    })
  );

  const [, forceUpdate] = useState(0);

  // Simple force simulation
  useEffect(() => {
    let running = true;
    let tick = 0;

    function simulate() {
      if (!running) return;
      const nodes = nodesRef.current;
      const cx = dimensions.width / 2;
      const cy = dimensions.height / 2;

      // Center gravity
      for (const n of nodes) {
        n.vx += (cx - n.x) * 0.002;
        n.vy += (cy - n.y) * 0.002;
      }

      // Repulsion between nodes
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[j].x - nodes[i].x;
          const dy = nodes[j].y - nodes[i].y;
          const dist = Math.max(1, Math.sqrt(dx * dx + dy * dy));
          const force = 800 / (dist * dist);
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;
          nodes[i].vx -= fx;
          nodes[i].vy -= fy;
          nodes[j].vx += fx;
          nodes[j].vy += fy;
        }
      }

      // Edge attraction
      for (const edge of EDGES) {
        const s = nodes.find(n => n.id === edge.source);
        const t = nodes.find(n => n.id === edge.target);
        if (!s || !t) continue;
        const dx = t.x - s.x;
        const dy = t.y - s.y;
        const dist = Math.max(1, Math.sqrt(dx * dx + dy * dy));
        const force = (dist - 120) * 0.005 * edge.weight;
        s.vx += (dx / dist) * force;
        s.vy += (dy / dist) * force;
        t.vx -= (dx / dist) * force;
        t.vy -= (dy / dist) * force;
      }

      // Apply velocity with damping
      const damping = 0.85;
      for (const n of nodes) {
        n.vx *= damping;
        n.vy *= damping;
        n.x += n.vx;
        n.y += n.vy;
        // Bounds
        n.x = Math.max(40, Math.min(dimensions.width - 40, n.x));
        n.y = Math.max(40, Math.min(dimensions.height - 40, n.y));
      }

      tick++;
      if (tick % 2 === 0) forceUpdate(t => t + 1);
      if (tick < 300) {
        animRef.current = requestAnimationFrame(simulate);
      }
    }

    animRef.current = requestAnimationFrame(simulate);
    return () => {
      running = false;
      cancelAnimationFrame(animRef.current);
    };
  }, [dimensions]);

  // Resize observer
  useEffect(() => {
    const el = svgRef.current?.parentElement;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      for (const entry of entries) {
        setDimensions({
          width: entry.contentRect.width || 800,
          height: Math.max(400, entry.contentRect.height || 500),
        });
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const nodes = nodesRef.current;
  const activeEdges = hoveredNode
    ? EDGES.filter(e => e.source === hoveredNode || e.target === hoveredNode)
    : EDGES;

  return (
    <div className={`relative w-full ${className}`} style={{ minHeight: 400 }}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
        className="w-full h-full"
        style={{ minHeight: 400 }}
      >
        {/* Edges */}
        {EDGES.map((edge, i) => {
          const s = nodes.find(n => n.id === edge.source);
          const t = nodes.find(n => n.id === edge.target);
          if (!s || !t) return null;
          const isActive = !hoveredNode || edge.source === hoveredNode || edge.target === hoveredNode;
          return (
            <line
              key={i}
              x1={s.x}
              y1={s.y}
              x2={t.x}
              y2={t.y}
              stroke={isActive ? 'hsl(var(--primary) / 0.4)' : 'hsl(var(--muted-foreground) / 0.1)'}
              strokeWidth={isActive ? edge.weight * 0.8 : 0.5}
              style={{ transition: 'stroke 0.3s, stroke-width 0.3s' }}
            />
          );
        })}

        {/* Nodes */}
        {nodes.map(node => {
          const color = LAYER_COLORS[node.layer] || 'hsl(var(--primary))';
          const isHovered = hoveredNode === node.id;
          const isConnected = hoveredNode
            ? EDGES.some(e =>
                (e.source === hoveredNode && e.target === node.id) ||
                (e.target === hoveredNode && e.source === node.id)
              ) || hoveredNode === node.id
            : true;

          return (
            <g
              key={node.id}
              style={{ cursor: 'pointer' }}
              onMouseEnter={() => setHoveredNode(node.id)}
              onMouseLeave={() => setHoveredNode(null)}
            >
              <circle
                cx={node.x}
                cy={node.y}
                r={isHovered ? 22 : 16 + node.resolvers}
                fill={color}
                opacity={isConnected ? (isHovered ? 1 : 0.8) : 0.2}
                style={{ transition: 'r 0.2s, opacity 0.3s' }}
              />
              {isHovered && (
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={28}
                  fill="none"
                  stroke={color}
                  strokeWidth={2}
                  opacity={0.4}
                />
              )}
              <text
                x={node.x}
                y={node.y + 1}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="white"
                fontSize={isHovered ? 10 : 8}
                fontWeight="bold"
                opacity={isConnected ? 1 : 0.3}
                style={{ pointerEvents: 'none', transition: 'opacity 0.3s' }}
              >
                {node.label}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="absolute bottom-2 left-2 flex flex-wrap gap-2">
        {Object.entries(LAYER_COLORS).map(([layer, color]) => (
          <span key={layer} className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
            {layer}
          </span>
        ))}
      </div>
    </div>
  );
}
