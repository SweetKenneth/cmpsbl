/**
 * CMPSBL® Node Engine
 * 
 * Describe it in plain language → one AI call → node created.
 * Or merge existing nodes → emergent combinations.
 * 
 * This is the ONLY place AI touches the product —
 * on demand, when chosen, not stuffed into everything.
 */

export interface NodeCreationRequest {
  description: string;
  targetCapabilities: string[];
  preferredLanguage: string;
  requestedBy: string;
}

export interface NodeMergeRequest {
  nodeIds: string[];
  mergeStrategy: 'combine' | 'synthesize' | 'layer';
  requestedBy: string;
}

export interface GeneratedNode {
  id: string;
  name: string;
  description: string;
  capabilities: string[];
  language: string;
  cjpiEstimate: number;
  source: 'created' | 'merged';
  parentNodeIds?: string[];
  createdAt: string;
}

/**
 * Validate node creation request
 */
export function validateCreationRequest(req: NodeCreationRequest): {
  valid: boolean;
  reason?: string;
} {
  if (!req.description.trim() || req.description.length < 20) {
    return { valid: false, reason: 'Description must be at least 20 characters.' };
  }

  if (req.targetCapabilities.length === 0) {
    return { valid: false, reason: 'At least one target capability is required.' };
  }

  return { valid: true };
}

/**
 * Validate node merge request
 */
export function validateMergeRequest(req: NodeMergeRequest): {
  valid: boolean;
  reason?: string;
} {
  if (req.nodeIds.length < 2) {
    return { valid: false, reason: 'At least two nodes are required for a merge.' };
  }

  if (req.nodeIds.length > 5) {
    return { valid: false, reason: 'Maximum 5 nodes per merge operation.' };
  }

  const unique = new Set(req.nodeIds);
  if (unique.size !== req.nodeIds.length) {
    return { valid: false, reason: 'Duplicate nodes are not allowed.' };
  }

  return { valid: true };
}
