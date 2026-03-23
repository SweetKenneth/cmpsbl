/**
 * Mesh Topology Visualization — Force-directed graph of module connections
 * Shows how modules connect via resolved intents
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { labelPrimitive } from '@/lib/export/primitive-labels';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Network, Maximize2, Minimize2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getMeshStats, MESH_MANIFEST, getMeshModules } from '@/lib/substrate/intent-mesh';

interface GraphNode {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  resolverCount: number;
  color: string;
}

interface GraphEdge {
  source: string;
  target: string;
  weight: number;
}

const MODULE_COLORS: Record<string, string> = {
  'DEFENSE Layer': 'hsl(0, 80%, 60%)',
  'BRAIN Organ': 'hsl(270, 70%, 65%)',
  'CORTEX Engine': 'hsl(200, 80%, 60%)',
  'VISION Agent': 'hsl(45, 90%, 55%)',
  'IDENTITY Organ': 'hsl(160, 70%, 50%)',
  'MEMORY Organ': 'hsl(300, 60%, 60%)',
  'NEXUS Organ': 'hsl(30, 85%, 55%)',
  'RELAY Organ': 'hsl(180, 70%, 50%)',
  'AUDIT Organ': 'hsl(220, 65%, 55%)',
  'ECONOMY Engine': 'hsl(120, 60%, 50%)',
  'SANDBOX Engine': 'hsl(340, 65%, 55%)',
  'INCLUSIVE Layer': 'hsl(90, 65%, 50%)',
  'DECODE Agent': 'hsl(250, 75%, 65%)',
  'DREAM Engine': 'hsl(280, 80%, 65%)',
  'SYSTEM Organ': 'hsl(210, 50%, 55%)',
  'ENCODE Agent': 'hsl(330, 70%, 60%)',
  'EVOLUTION Layer': 'hsl(15, 75%, 55%)',
  'RIPPLE Organ': 'hsl(195, 75%, 55%)',
  'ACCESS Organ': 'hsl(150, 60%, 50%)',
  'INTEGRATION Organ': 'hsl(60, 65%, 50%)',
  'CORE Organ': 'hsl(0, 0%, 70%)',
};

export function MeshTopologyGraph() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const nodesRef = useRef<GraphNode[]>([]);
  const edgesRef = useRef<GraphEdge[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [stats, setStats] = useState<{ connections: number; modules: number }>({ connections: 0, modules: 0 });
  const dragRef = useRef<{ nodeId: string | null; offsetX: number; offsetY: number }>({ nodeId: null, offsetX: 0, offsetY: 0 });

  const buildGraph = useCallback(async () => {
    setLoading(true);
    try {
      const meshStats = await getMeshStats();
      const modules = getMeshModules();
      
      // Build nodes from modules
      const width = expanded ? 900 : 600;
      const height = expanded ? 600 : 400;
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(width, height) * 0.35;

      const nodes: GraphNode[] = modules.map((mod, i) => {
        const angle = (2 * Math.PI * i) / modules.length;
        const resolverCount = MESH_MANIFEST.filter(r => r.module === mod).length;
        return {
          id: mod,
          x: centerX + radius * Math.cos(angle),
          y: centerY + radius * Math.sin(angle),
          vx: 0,
          vy: 0,
          resolverCount,
          color: MODULE_COLORS[mod] || 'hsl(0, 0%, 60%)',
        };
      });

      // Build edges from shared domains (manifest cross-references)
      const edges: GraphEdge[] = [];
      const edgeSet = new Set<string>();

      // From top routes (actual traffic)
      for (const route of meshStats.topRoutes) {
        const key = [route.source, route.target].sort().join('-');
        if (!edgeSet.has(key)) {
          edgeSet.add(key);
          edges.push({ source: route.source, target: route.target, weight: route.count });
        }
      }

      // From shared domains in manifest (structural connections)
      for (let i = 0; i < modules.length; i++) {
        const aResolvers = MESH_MANIFEST.filter(r => r.module === modules[i]);
        const aDomainsSet = new Set(aResolvers.flatMap(r => r.domains));
        for (let j = i + 1; j < modules.length; j++) {
          const bResolvers = MESH_MANIFEST.filter(r => r.module === modules[j]);
          const bDomainsSet = new Set(bResolvers.flatMap(r => r.domains));
          const shared = [...aDomainsSet].filter(d => bDomainsSet.has(d));
          if (shared.length > 0) {
            const key = [modules[i], modules[j]].sort().join('-');
            if (!edgeSet.has(key)) {
              edgeSet.add(key);
              edges.push({ source: modules[i], target: modules[j], weight: shared.length });
            }
          }
        }
      }

      nodesRef.current = nodes;
      edgesRef.current = edges;
      setStats({ connections: edges.length, modules: modules.length });
    } catch {
      // fail silently
    } finally {
      setLoading(false);
    }
  }, [expanded]);

  useEffect(() => { buildGraph(); }, [buildGraph]);

  // Force simulation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    const simulate = () => {
      const nodes = nodesRef.current;
      const edges = edgesRef.current;
      if (nodes.length === 0) return;

      // Apply forces
      for (const node of nodes) {
        if (dragRef.current.nodeId === node.id) continue;
        node.vx *= 0.9;
        node.vy *= 0.9;

        // Center gravity
        node.vx += (width / 2 - node.x) * 0.001;
        node.vy += (height / 2 - node.y) * 0.001;

        // Repulsion
        for (const other of nodes) {
          if (other.id === node.id) continue;
          const dx = node.x - other.x;
          const dy = node.y - other.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = 800 / (dist * dist);
          node.vx += (dx / dist) * force;
          node.vy += (dy / dist) * force;
        }
      }

      // Spring forces from edges
      for (const edge of edges) {
        const source = nodes.find(n => n.id === edge.source);
        const target = nodes.find(n => n.id === edge.target);
        if (!source || !target) continue;
        const dx = target.x - source.x;
        const dy = target.y - source.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const idealDist = 120;
        const force = (dist - idealDist) * 0.005;
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        if (dragRef.current.nodeId !== source.id) { source.vx += fx; source.vy += fy; }
        if (dragRef.current.nodeId !== target.id) { target.vx -= fx; target.vy -= fy; }
      }

      // Update positions
      for (const node of nodes) {
        if (dragRef.current.nodeId === node.id) continue;
        node.x += node.vx;
        node.y += node.vy;
        node.x = Math.max(30, Math.min(width - 30, node.x));
        node.y = Math.max(30, Math.min(height - 30, node.y));
      }

      // Draw
      ctx.clearRect(0, 0, width, height);

      // Edges
      for (const edge of edges) {
        const source = nodes.find(n => n.id === edge.source);
        const target = nodes.find(n => n.id === edge.target);
        if (!source || !target) continue;
        const isHovered = hoveredNode === source.id || hoveredNode === target.id;
        ctx.beginPath();
        ctx.moveTo(source.x, source.y);
        ctx.lineTo(target.x, target.y);
        ctx.strokeStyle = isHovered ? 'hsla(45, 90%, 55%, 0.6)' : 'hsla(0, 0%, 50%, 0.15)';
        ctx.lineWidth = isHovered ? Math.min(3, edge.weight * 0.5 + 1) : Math.min(2, edge.weight * 0.3 + 0.5);
        ctx.stroke();
      }

      // Nodes
      for (const node of nodes) {
        const isHovered = hoveredNode === node.id;
        const r = 8 + node.resolverCount * 1.5;

        // Glow
        if (isHovered) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, r + 6, 0, Math.PI * 2);
          ctx.fillStyle = node.color.replace(')', ', 0.2)').replace('hsl', 'hsla');
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
        ctx.fillStyle = isHovered ? node.color : node.color.replace(')', ', 0.8)').replace('hsl', 'hsla');
        ctx.fill();
        ctx.strokeStyle = isHovered ? 'white' : 'hsla(0, 0%, 100%, 0.3)';
        ctx.lineWidth = isHovered ? 2 : 1;
        ctx.stroke();

        // Label
        ctx.font = isHovered ? 'bold 10px monospace' : '9px monospace';
        ctx.fillStyle = isHovered ? 'white' : 'hsla(0, 0%, 100%, 0.7)';
        ctx.textAlign = 'center';
        ctx.fillText(node.id, node.x, node.y + r + 14);

        if (isHovered) {
          ctx.font = '8px monospace';
          ctx.fillStyle = 'hsla(0, 0%, 100%, 0.5)';
          ctx.fillText(`${node.resolverCount} resolvers`, node.x, node.y + r + 24);
        }
      }

      animationRef.current = requestAnimationFrame(simulate);
    };

    simulate();
    return () => cancelAnimationFrame(animationRef.current);
  }, [hoveredNode, expanded]);

  // Mouse handlers
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    const my = (e.clientY - rect.top) * (canvas.height / rect.height);

    if (dragRef.current.nodeId) {
      const node = nodesRef.current.find(n => n.id === dragRef.current.nodeId);
      if (node) {
        node.x = mx;
        node.y = my;
        node.vx = 0;
        node.vy = 0;
      }
      return;
    }

    let found: string | null = null;
    for (const node of nodesRef.current) {
      const r = 8 + node.resolverCount * 1.5;
      const dx = mx - node.x;
      const dy = my - node.y;
      if (dx * dx + dy * dy < (r + 6) * (r + 6)) {
        found = node.id;
        break;
      }
    }
    setHoveredNode(found);
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    const my = (e.clientY - rect.top) * (canvas.height / rect.height);

    for (const node of nodesRef.current) {
      const r = 8 + node.resolverCount * 1.5;
      const dx = mx - node.x;
      const dy = my - node.y;
      if (dx * dx + dy * dy < (r + 6) * (r + 6)) {
        dragRef.current = { nodeId: node.id, offsetX: dx, offsetY: dy };
        break;
      }
    }
  }, []);

  const handleMouseUp = useCallback(() => {
    dragRef.current = { nodeId: null, offsetX: 0, offsetY: 0 };
  }, []);

  const canvasWidth = expanded ? 900 : 600;
  const canvasHeight = expanded ? 600 : 400;

  return (
    <Card className={cn("border border-border/30 bg-muted/10 transition-all", expanded && "col-span-full")}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Network className="w-4 h-4 text-neon-amber" />
            Mesh Topology
            <Badge variant="secondary" className="text-[9px]">{stats.modules} modules • {stats.connections} connections</Badge>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => buildGraph()} disabled={loading}>
              <RefreshCw className={cn("h-3 w-3", loading && "animate-spin")} />
            </Button>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setExpanded(!expanded)}>
              {expanded ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <canvas
          ref={canvasRef}
          width={canvasWidth}
          height={canvasHeight}
          className="w-full rounded-lg cursor-grab active:cursor-grabbing"
          style={{ maxHeight: expanded ? '600px' : '400px' }}
          onMouseMove={handleMouseMove}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
        <p className="text-[10px] text-muted-foreground mt-2 text-center">
          Drag nodes to reposition • Hover to highlight connections • Size = resolver count
        </p>
      </CardContent>
    </Card>
  );
}
