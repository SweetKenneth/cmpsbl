/**
 * Graph Search Utility
 * Navigate the Brain's knowledge graph to find related memories and concepts
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface GraphEdge {
  target_id: string;
  relation: string;
  weight: number;
}

/**
 * Get related nodes from a starting point using breadth-first traversal
 * @param startId - UUID of the starting node
 * @param depth - How many hops to traverse (default: 2)
 * @param supabaseClient - Optional Supabase client instance
 * @returns Array of related edges with their metadata
 */
export async function getRelated(
  startId: string,
  depth: number = 2,
  supabaseClient?: any
): Promise<GraphEdge[]> {
  const supabase = supabaseClient || createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  let frontier = [startId];
  const visited = new Set([startId]);
  const result: GraphEdge[] = [];

  for (let i = 0; i < depth; i++) {
    if (frontier.length === 0) break;

    const { data: edges, error } = await supabase
      .from('brain_graph_edges')
      .select('target_id, relation, weight')
      .in('source_id', frontier);

    if (error) {
      console.error('Graph search error:', error);
      break;
    }

    const nextFrontier: string[] = [];

    for (const edge of edges || []) {
      if (!visited.has(edge.target_id)) {
        visited.add(edge.target_id);
        result.push(edge);
        nextFrontier.push(edge.target_id);
      }
    }

    frontier = nextFrontier;
  }

  return result;
}

/**
 * Get all edges connected to a node (both incoming and outgoing)
 */
export async function getConnectedEdges(
  nodeId: string,
  supabaseClient?: any
): Promise<{ incoming: GraphEdge[]; outgoing: GraphEdge[] }> {
  const supabase = supabaseClient || createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  const [outgoingResult, incomingResult] = await Promise.all([
    supabase
      .from('brain_graph_edges')
      .select('target_id, relation, weight')
      .eq('source_id', nodeId),
    supabase
      .from('brain_graph_edges')
      .select('source_id as target_id, relation, weight')
      .eq('target_id', nodeId)
  ]);

  return {
    outgoing: outgoingResult.data || [],
    incoming: incomingResult.data || []
  };
}

/**
 * Find shortest path between two nodes
 */
export async function findPath(
  startId: string,
  targetId: string,
  maxDepth: number = 5,
  supabaseClient?: any
): Promise<string[] | null> {
  const supabase = supabaseClient || createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  const queue: Array<{ id: string; path: string[] }> = [{ id: startId, path: [startId] }];
  const visited = new Set([startId]);

  while (queue.length > 0) {
    const current = queue.shift()!;
    
    if (current.path.length > maxDepth) continue;
    if (current.id === targetId) return current.path;

    const { data: edges } = await supabase
      .from('brain_graph_edges')
      .select('target_id')
      .eq('source_id', current.id);

    for (const edge of edges || []) {
      if (!visited.has(edge.target_id)) {
        visited.add(edge.target_id);
        queue.push({
          id: edge.target_id,
          path: [...current.path, edge.target_id]
        });
      }
    }
  }

  return null; // No path found
}
