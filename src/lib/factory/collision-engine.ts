/**
 * CMPSBL® Collision Engine (Model 4)
 * 
 * Upload two codebases. Discover capabilities neither has alone. 1 + 1 = 3.
 * Included in Architect membership.
 */

export interface CollisionInput {
  codebaseA: {
    id: string;
    name: string;
    language: string;
    signatureHash: string;
  };
  codebaseB: {
    id: string;
    name: string;
    language: string;
    signatureHash: string;
  };
}

export interface CollisionResult {
  id: string;
  inputA: string;
  inputB: string;
  emergentCapabilities: EmergentCapability[];
  cjpiScore: number;
  collisionStrength: number;
  timestamp: string;
}

export interface EmergentCapability {
  name: string;
  description: string;
  sourceContribution: { a: number; b: number };
  noveltyScore: number;
}

/**
 * Validate collision inputs are compatible
 */
export function validateCollisionInputs(input: CollisionInput): {
  valid: boolean;
  reason?: string;
} {
  if (input.codebaseA.signatureHash === input.codebaseB.signatureHash) {
    return { valid: false, reason: 'Cannot collide a codebase with itself.' };
  }

  if (!input.codebaseA.id || !input.codebaseB.id) {
    return { valid: false, reason: 'Both codebases must have valid identifiers.' };
  }

  return { valid: true };
}

/**
 * Calculate collision strength — how much emergent behavior the combination produces
 * Scale: 0-100
 */
export function calculateCollisionStrength(capabilities: EmergentCapability[]): number {
  if (capabilities.length === 0) return 0;

  const avgNovelty = capabilities.reduce((s, c) => s + c.noveltyScore, 0) / capabilities.length;
  const countBonus = Math.min(capabilities.length * 5, 30);

  return Math.min(Math.round(avgNovelty + countBonus), 100);
}
