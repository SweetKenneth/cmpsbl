/**
 * PromptFluid Brain - Knowledge Graph v2.0
 * Enhanced graph with typed nodes, semantic relations, and clustering
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Relation type definitions for semantic graph
const RELATION_TYPES = {
  semantic: ['similar_to', 'contrasts_with', 'elaborates', 'summarizes'],
  causal: ['causes', 'enables', 'prevents', 'depends_on'],
  temporal: ['precedes', 'follows', 'concurrent_with', 'supersedes'],
  hierarchical: ['contains', 'part_of', 'instance_of', 'generalizes'],
  associative: ['related_to', 'co_occurs_with', 'implies', 'complements'],
};

// Context-based importance weights
const CONTEXT_WEIGHTS: Record<string, number> = {
  'core_identity': 1.0,
  'code': 0.9,
  'deep_think': 0.85,
  'insight': 0.8,
  'learning': 0.75,
  'dream_synthesis': 0.7,
  'doctrine_extraction': 0.4,
  'skill_mutation': 0.5,
  'default': 0.5,
};

interface GraphBuildResult {
  nodes_created: number;
  edges_created: number;
  clusters_identified: number;
  execution_time_ms: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const body = await req.json().catch(() => ({}));
    const operation = body.operation || 'build';
    const includeWarm = body.include_warm ?? true;
    const maxNodes = body.max_nodes || 1000;

    console.log(`🕸️ Knowledge Graph v2: ${operation}`);

    const result: GraphBuildResult = {
      nodes_created: 0,
      edges_created: 0,
      clusters_identified: 0,
      execution_time_ms: 0,
    };

    if (operation === 'build' || operation === 'rebuild') {
      // Fetch memories from hot and optionally warm tiers
      const queries = [
        supabase
          .from('brain_memory_hot')
          .select('id, content, context, tags, value_score, importance_score')
          .order('value_score', { ascending: false })
          .limit(Math.floor(maxNodes * 0.6)),
      ];

      if (includeWarm) {
        queries.push(
          supabase
            .from('brain_memory_warm')
            .select('id, content, context, tags, value_score')
            .order('value_score', { ascending: false })
            .limit(Math.floor(maxNodes * 0.4))
        );
      }

      const results = await Promise.all(queries);
      const hotMemories = results[0].data || [];
      const warmMemories = results[1]?.data || [];

      console.log(`Processing ${hotMemories.length} hot + ${warmMemories.length} warm memories`);

      // Clear existing nodes if rebuilding
      if (operation === 'rebuild') {
        await supabase.from('brain_graph_nodes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('brain_graph_edges').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      }

      // ==================================
      // STEP 1: Create nodes from memories
      // ==================================
      const nodes: Array<{
        node_type: string;
        label: string;
        description: string;
        memory_tier: string;
        source_id: string;
        weight: number;
        attributes: Record<string, any>;
      }> = [];

      // Extract concepts/entities from memory content
      const extractConcepts = (content: string): string[] => {
        const concepts: string[] = [];
        // Extract capitalized phrases (potential concepts)
        const capitalizedPattern = /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g;
        const matches = content.match(capitalizedPattern) || [];
        concepts.push(...matches.slice(0, 5));
        
        // Extract quoted terms
        const quotedPattern = /"([^"]+)"/g;
        let match;
        while ((match = quotedPattern.exec(content)) !== null) {
          concepts.push(match[1]);
        }
        
        return [...new Set(concepts)];
      };

      // Process hot memories
      for (const memory of hotMemories) {
        const contextWeight = CONTEXT_WEIGHTS[memory.context] || CONTEXT_WEIGHTS['default'];
        const nodeWeight = (memory.value_score || 0.5) * contextWeight;

        // Create memory node
        nodes.push({
          node_type: 'memory',
          label: memory.content.substring(0, 100),
          description: memory.content.substring(0, 300),
          memory_tier: 'hot',
          source_id: memory.id,
          weight: nodeWeight,
          attributes: {
            context: memory.context,
            tags: memory.tags,
            value_score: memory.value_score,
          },
        });

        // Extract and create concept nodes
        const concepts = extractConcepts(memory.content);
        for (const concept of concepts) {
          nodes.push({
            node_type: 'concept',
            label: concept,
            description: `Concept extracted from ${memory.context} memory`,
            memory_tier: 'hot',
            source_id: memory.id,
            weight: nodeWeight * 0.7,
            attributes: { extracted_from: memory.id },
          });
        }
      }

      // Process warm memories
      for (const memory of warmMemories) {
        const contextWeight = CONTEXT_WEIGHTS[memory.context] || CONTEXT_WEIGHTS['default'];
        const nodeWeight = (memory.value_score || 0.4) * contextWeight * 0.8;

        nodes.push({
          node_type: 'memory',
          label: memory.content.substring(0, 100),
          description: memory.content.substring(0, 300),
          memory_tier: 'warm',
          source_id: memory.id,
          weight: nodeWeight,
          attributes: {
            context: memory.context,
            tags: memory.tags,
            value_score: memory.value_score,
          },
        });
      }

      // Deduplicate concept nodes by label
      const uniqueNodes: typeof nodes = [];
      const seenLabels = new Set<string>();
      
      for (const node of nodes) {
        if (node.node_type === 'concept') {
          if (!seenLabels.has(node.label.toLowerCase())) {
            seenLabels.add(node.label.toLowerCase());
            uniqueNodes.push(node);
          }
        } else {
          uniqueNodes.push(node);
        }
      }

      // Batch insert nodes
      const nodeBatches = [];
      for (let i = 0; i < uniqueNodes.length; i += 100) {
        nodeBatches.push(uniqueNodes.slice(i, i + 100));
      }

      const insertedNodeIds: Map<string, string> = new Map();
      
      for (const batch of nodeBatches) {
        const { data: inserted, error } = await supabase
          .from('brain_graph_nodes')
          .insert(batch)
          .select('id, source_id, label');

        if (error) {
          console.error('Node insert error:', error);
        } else if (inserted) {
          for (const node of inserted) {
            if (node.source_id) {
              insertedNodeIds.set(node.source_id, node.id);
            }
            insertedNodeIds.set(node.label, node.id);
          }
          result.nodes_created += inserted.length;
        }
      }

      console.log(`Created ${result.nodes_created} nodes`);

      // ==================================
      // STEP 2: Create edges between nodes
      // ==================================
      const edges: Array<{
        source_id: string;
        target_id: string;
        relation: string;
        relation_type: string;
        weight: number;
        confidence: number;
      }> = [];

      // Create edges based on shared context
      const contextGroups: Map<string, string[]> = new Map();
      
      for (const memory of [...hotMemories, ...warmMemories]) {
        const nodeId = insertedNodeIds.get(memory.id);
        if (!nodeId) continue;
        
        const context = memory.context || 'default';
        if (!contextGroups.has(context)) {
          contextGroups.set(context, []);
        }
        contextGroups.get(context)!.push(nodeId);
      }

      // Link memories within same context
      for (const [context, nodeIds] of contextGroups) {
        for (let i = 0; i < nodeIds.length && i < 20; i++) {
          for (let j = i + 1; j < nodeIds.length && j < i + 5; j++) {
            edges.push({
              source_id: nodeIds[i],
              target_id: nodeIds[j],
              relation: 'shares_context',
              relation_type: 'semantic',
              weight: 0.6,
              confidence: 0.7,
            });
          }
        }
      }

      // Link concepts to their source memories
      for (const node of uniqueNodes) {
        if (node.node_type === 'concept' && node.attributes.extracted_from) {
          const conceptId = insertedNodeIds.get(node.label);
          const memoryId = insertedNodeIds.get(node.attributes.extracted_from);
          
          if (conceptId && memoryId) {
            edges.push({
              source_id: memoryId,
              target_id: conceptId,
              relation: 'contains',
              relation_type: 'hierarchical',
              weight: 0.8,
              confidence: 0.9,
            });
          }
        }
      }

      // Create temporal edges for sequential memories
      const sortedHot = [...hotMemories].sort((a, b) => 
        new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()
      );

      for (let i = 0; i < sortedHot.length - 1 && i < 50; i++) {
        const sourceId = insertedNodeIds.get(sortedHot[i].id);
        const targetId = insertedNodeIds.get(sortedHot[i + 1].id);
        
        if (sourceId && targetId) {
          edges.push({
            source_id: sourceId,
            target_id: targetId,
            relation: 'precedes',
            relation_type: 'temporal',
            weight: 0.5,
            confidence: 1.0,
          });
        }
      }

      // Batch insert edges
      for (let i = 0; i < edges.length; i += 100) {
        const batch = edges.slice(i, i + 100);
        const { error } = await supabase.from('brain_graph_edges').insert(batch);
        if (error) {
          console.error('Edge insert error:', error);
        } else {
          result.edges_created += batch.length;
        }
      }

      console.log(`Created ${result.edges_created} edges`);

      // ==================================
      // STEP 3: Simple clustering by context
      // ==================================
      const clusterUpdates = [];
      for (const [context, nodeIds] of contextGroups) {
        const clusterId = `cluster_${context}`;
        for (const nodeId of nodeIds) {
          clusterUpdates.push({ id: nodeId, cluster_id: clusterId });
        }
        result.clusters_identified++;
      }

      // Batch update cluster assignments
      for (const update of clusterUpdates) {
        await supabase
          .from('brain_graph_nodes')
          .update({ cluster_id: update.cluster_id })
          .eq('id', update.id);
      }
    }

    // ==================================
    // Query operations
    // ==================================
    if (operation === 'query') {
      const nodeId = body.node_id;
      const depth = body.depth || 2;

      // BFS traversal
      let frontier = [nodeId];
      const visited = new Set([nodeId]);
      const related: any[] = [];

      for (let d = 0; d < depth; d++) {
        if (frontier.length === 0) break;

        const { data: edges } = await supabase
          .from('brain_graph_edges')
          .select('target_id, relation, relation_type, weight')
          .in('source_id', frontier);

        const nextFrontier: string[] = [];

        for (const edge of edges || []) {
          if (!visited.has(edge.target_id)) {
            visited.add(edge.target_id);
            related.push({ ...edge, depth: d + 1 });
            nextFrontier.push(edge.target_id);
          }
        }

        frontier = nextFrontier;
      }

      // Fetch node details
      const { data: nodeDetails } = await supabase
        .from('brain_graph_nodes')
        .select('*')
        .in('id', Array.from(visited));

      return new Response(JSON.stringify({
        success: true,
        operation: 'query',
        node_id: nodeId,
        related_count: related.length,
        nodes: nodeDetails,
        edges: related,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ==================================
    // Stats operation
    // ==================================
    if (operation === 'stats') {
      const [nodesResult, edgesResult] = await Promise.all([
        supabase.from('brain_graph_nodes').select('node_type, cluster_id', { count: 'exact' }),
        supabase.from('brain_graph_edges').select('relation_type', { count: 'exact' }),
      ]);

      const nodeTypes: Record<string, number> = {};
      const relationTypes: Record<string, number> = {};
      const clusters = new Set<string>();

      for (const node of nodesResult.data || []) {
        nodeTypes[node.node_type] = (nodeTypes[node.node_type] || 0) + 1;
        if (node.cluster_id) clusters.add(node.cluster_id);
      }

      for (const edge of edgesResult.data || []) {
        relationTypes[edge.relation_type] = (relationTypes[edge.relation_type] || 0) + 1;
      }

      return new Response(JSON.stringify({
        success: true,
        operation: 'stats',
        total_nodes: nodesResult.count || 0,
        total_edges: edgesResult.count || 0,
        clusters: clusters.size,
        node_types: nodeTypes,
        relation_types: relationTypes,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    result.execution_time_ms = Date.now() - startTime;

    // Log event
    await supabase.from('brain_events').insert({
      module: 'graph',
      event_type: 'knowledge_graph_v2',
      data: { operation, result },
      outcome: 'success',
    });

    return new Response(JSON.stringify({
      success: true,
      operation,
      result,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Knowledge graph error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
