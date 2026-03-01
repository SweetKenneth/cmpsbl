/**
 * Crown Jewel Similarity Guard
 * Prevents duplicate/derivative artifact generation.
 * Compares structural signatures using normalized token analysis.
 */

export interface StructuralSignature {
  id: string;
  exports: string[];
  interfaces: string[];
  functions: string[];
  typeAliases: string[];
  importCount: number;
  lineCount: number;
}

/**
 * Extract a structural signature from TypeScript source code.
 */
export function extractSignature(id: string, source: string): StructuralSignature {
  const lines = source.split('\n');
  const exports = lines.filter(l => /^export\s/.test(l.trim())).map(l => l.trim().slice(0, 60));
  const interfaces = [...source.matchAll(/interface\s+(\w+)/g)].map(m => m[1]);
  const functions = [...source.matchAll(/function\s+(\w+)/g)].map(m => m[1]);
  const typeAliases = [...source.matchAll(/type\s+(\w+)\s*=/g)].map(m => m[1]);
  const importCount = lines.filter(l => /^import\s/.test(l.trim())).length;

  return { id, exports, interfaces, functions, typeAliases, importCount, lineCount: lines.length };
}

/**
 * Compute structural overlap between two signatures (0..1).
 */
export function computeOverlap(a: StructuralSignature, b: StructuralSignature): number {
  const setOverlap = (sa: string[], sb: string[]): number => {
    if (sa.length === 0 && sb.length === 0) return 0;
    const setA = new Set(sa);
    const setB = new Set(sb);
    const intersection = [...setA].filter(x => setB.has(x)).length;
    const union = new Set([...sa, ...sb]).size;
    return union === 0 ? 0 : intersection / union;
  };

  const interfaceOverlap = setOverlap(a.interfaces, b.interfaces);
  const functionOverlap = setOverlap(a.functions, b.functions);
  const typeOverlap = setOverlap(a.typeAliases, b.typeAliases);

  // Weighted average
  return interfaceOverlap * 0.4 + functionOverlap * 0.4 + typeOverlap * 0.2;
}

/**
 * Check if a new artifact is a derivative of any existing artifact.
 * Returns the conflicting artifact ID if overlap > threshold.
 */
export function checkDerivative(
  newSig: StructuralSignature,
  existing: StructuralSignature[],
  threshold = 0.6
): { isDerivative: boolean; conflictsWith?: string; overlap?: number } {
  for (const ex of existing) {
    if (ex.id === newSig.id) continue;
    const overlap = computeOverlap(newSig, ex);
    if (overlap > threshold) {
      return { isDerivative: true, conflictsWith: ex.id, overlap };
    }
  }
  return { isDerivative: false };
}
