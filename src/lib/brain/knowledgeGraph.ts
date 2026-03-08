/**
 * CMPSBL® BRAIN — Knowledge Graph
 * Client library for enhanced semantic knowledge graph
 */

import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

export type NodeType = string;
export type RelationType = string;

export interface GraphNode {
  id: string;
  node_type: string;
  label: string;
  description?: string;
  memory_tier?: string;
  weight: number;
  centrality_score: number;
  cluster_id?: string;
  attributes: Record<string, any>;
}

export interface GraphEdge {
  id: string;
  source_id: string;
  target_id: string;
  relation: string;
  relation_type: string;
  weight: number;
  confidence: number;
}

// Helper to safely convert Json to Record<string, any>
function parseAttributes(attrs: Json | null): Record<string, any> {
  if (attrs === null || attrs === undefined) return {};
  if (typeof attrs === 'object' && !Array.isArray(attrs)) return attrs as Record<string, any>;
  return {};
}

// Map database row to GraphNode
function mapToGraphNode(row: any): GraphNode {
  return {
    id: row.id,
    node_type: row.node_type,
    label: row.label,
    description: row.description ?? undefined,
    memory_tier: row.memory_tier ?? undefined,
    weight: row.weight ?? 1,
    centrality_score: row.centrality_score ?? 0,
    cluster_id: row.cluster_id ?? undefined,
    attributes: parseAttributes(row.attributes),
  };
}

export interface GraphStats {
  total_nodes: number;
  total_edges: number;
  clusters: number;
  node_types: Record<string, number>;
  relation_types: Record<string, number>;
}

export interface GraphQueryResult {
  center_node: GraphNode;
  related_nodes: GraphNode[];
  edges: GraphEdge[];
  paths?: string[][];
}

/**
 * Build or rebuild the knowledge graph
 */
export async function buildKnowledgeGraph(options?: {
  rebuild?: boolean;
  includeWarm?: boolean;
  maxNodes?: number;
}): Promise<{ success: boolean; result: any }> {
  try {
    const { data, error } = await supabase.functions.invoke('pf-brain-knowledge-graph-v2', {
      body: {
        operation: options?.rebuild ? 'rebuild' : 'build',
        include_warm: options?.includeWarm ?? true,
        max_nodes: options?.maxNodes || 1000,
      },
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Knowledge graph build error:', error);
    return { success: false, result: null };
  }
}

/**
 * Get graph statistics
 */
export async function getGraphStats(): Promise<GraphStats> {
  try {
    const { data, error } = await supabase.functions.invoke('pf-brain-knowledge-graph-v2', {
      body: { operation: 'stats' },
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Graph stats error:', error);
    return {
      total_nodes: 0,
      total_edges: 0,
      clusters: 0,
      node_types: {},
      relation_types: {},
    };
  }
}

/**
 * Query the knowledge graph from a starting node
 */
export async function queryGraph(
  nodeId: string,
  depth: number = 2
): Promise<GraphQueryResult | null> {
  try {
    const { data, error } = await supabase.functions.invoke('pf-brain-knowledge-graph-v2', {
      body: { operation: 'query', node_id: nodeId, depth },
    });

    if (error) throw error;

    const centerNode = data.nodes?.find((n: any) => n.id === nodeId);
    const relatedNodes = data.nodes?.filter((n: any) => n.id !== nodeId) || [];

    return {
      center_node: centerNode,
      related_nodes: relatedNodes,
      edges: data.edges || [],
    };
  } catch (error) {
    console.error('Graph query error:', error);
    return null;
  }
}

/**
 * Get nodes by type
 */
export async function getNodesByType(
  type: NodeType,
  limit: number = 50
): Promise<GraphNode[]> {
  try {
    const { data, error } = await supabase
      .from('brain_graph_nodes')
      .select('*')
      .eq('node_type', type)
      .order('weight', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data || []).map(mapToGraphNode);
  } catch (error) {
    console.error('Get nodes error:', error);
    return [];
  }
}

/**
 * Get nodes in a cluster
 */
export async function getClusterNodes(
  clusterId: string,
  limit: number = 100
): Promise<GraphNode[]> {
  try {
    const { data, error } = await supabase
      .from('brain_graph_nodes')
      .select('*')
      .eq('cluster_id', clusterId)
      .order('weight', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data || []).map(mapToGraphNode);
  } catch (error) {
    console.error('Get cluster nodes error:', error);
    return [];
  }
}

/**
 * Get all clusters
 */
export async function getClusters(): Promise<Array<{ id: string; count: number }>> {
  try {
    const { data, error } = await supabase
      .from('brain_graph_nodes')
      .select('cluster_id')
      .not('cluster_id', 'is', null)
      .limit(5000);

    if (error) throw error;

    const clusterCounts = new Map<string, number>();
    for (const node of data || []) {
      if (node.cluster_id) {
        clusterCounts.set(
          node.cluster_id,
          (clusterCounts.get(node.cluster_id) || 0) + 1
        );
      }
    }

    return Array.from(clusterCounts.entries())
      .map(([id, count]) => ({ id, count }))
      .sort((a, b) => b.count - a.count);
  } catch (error) {
    console.error('Get clusters error:', error);
    return [];
  }
}

/**
 * Find connections between two nodes
 */
export async function findPath(
  sourceId: string,
  targetId: string,
  maxDepth: number = 5
): Promise<string[] | null> {
  try {
    // Batch-load all edges once to avoid N+1 queries
    const { data: allEdges } = await supabase
      .from('brain_graph_edges')
      .select('source_id, target_id')
      .limit(5000);

    if (!allEdges || allEdges.length === 0) return null;

    // Build adjacency list
    const adjacency = new Map<string, string[]>();
    for (const edge of allEdges) {
      if (!adjacency.has(edge.source_id)) adjacency.set(edge.source_id, []);
      adjacency.get(edge.source_id)!.push(edge.target_id);
    }

    // BFS using in-memory adjacency
    const queue: Array<{ id: string; path: string[] }> = [
      { id: sourceId, path: [sourceId] },
    ];
    const visited = new Set([sourceId]);

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (current.path.length > maxDepth) continue;
      if (current.id === targetId) return current.path;

      for (const neighbor of adjacency.get(current.id) || []) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push({ id: neighbor, path: [...current.path, neighbor] });
        }
      }
    }

    return null; // No path found
  } catch (error) {
    console.error('Find path error:', error);
    return null;
  }
}

/**
 * Get edges by relation type
 */
export async function getEdgesByType(
  relationType: RelationType,
  limit: number = 100
): Promise<GraphEdge[]> {
  try {
    const { data, error } = await supabase
      .from('brain_graph_edges')
      .select('*')
      .eq('relation_type', relationType)
      .order('weight', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Get edges error:', error);
    return [];
  }
}

/**
 * Add a manual edge between nodes
 */
export async function addEdge(
  sourceId: string,
  targetId: string,
  relation: string,
  relationType: RelationType = 'associative',
  weight: number = 0.7
): Promise<boolean> {
  try {
    const { error } = await supabase.from('brain_graph_edges').insert({
      source_id: sourceId,
      target_id: targetId,
      relation,
      relation_type: relationType,
      weight,
      confidence: 1.0,
    });

    return !error;
  } catch (error) {
    console.error('Add edge error:', error);
    return false;
  }
}

/**
 * Get the most connected nodes (highest centrality)
 */
export async function getHubNodes(limit: number = 20): Promise<GraphNode[]> {
  try {
    // Calculate connection counts
    const { data: edges } = await supabase
      .from('brain_graph_edges')
      .select('source_id, target_id');

    const connectionCounts = new Map<string, number>();
    for (const edge of edges || []) {
      connectionCounts.set(
        edge.source_id,
        (connectionCounts.get(edge.source_id) || 0) + 1
      );
      connectionCounts.set(
        edge.target_id,
        (connectionCounts.get(edge.target_id) || 0) + 1
      );
    }

    // Get top connected node IDs
    const topIds = Array.from(connectionCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([id]) => id);

    if (topIds.length === 0) return [];

    const { data: nodes } = await supabase
      .from('brain_graph_nodes')
      .select('*')
      .in('id', topIds);

    // Sort by connection count and map to GraphNode
    return (nodes || []).map(mapToGraphNode).sort((a, b) => {
      const countA = connectionCounts.get(a.id) || 0;
      const countB = connectionCounts.get(b.id) || 0;
      return countB - countA;
    });
  } catch (error) {
    console.error('Get hub nodes error:', error);
    return [];
  }
}

/**
 * Search nodes by label or description
 */
export async function searchNodes(
  query: string,
  options?: {
    nodeType?: NodeType;
    limit?: number;
  }
): Promise<GraphNode[]> {
  try {
    // Sanitize query to prevent PostgREST filter injection
    const sanitized = query.replace(/[%_\\,().'";]/g, '');
    if (!sanitized) return [];

    let q = supabase
      .from('brain_graph_nodes')
      .select('*')
      .or(`label.ilike.%${sanitized}%,description.ilike.%${sanitized}%`)
      .order('weight', { ascending: false })
      .limit(options?.limit || 20);

    if (options?.nodeType) {
      q = q.eq('node_type', options.nodeType);
    }

    const { data, error } = await q;
    if (error) throw error;
    return (data || []).map(mapToGraphNode);
  } catch (error) {
    console.error('Search nodes error:', error);
    return [];
  }
}
