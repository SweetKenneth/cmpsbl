/**
 * Encoded File Anchoring — Export/Handler/Entrypoint Detection
 * Ensures structural integrity is preserved across edits
 */

import { ENCODED_POLICY } from './policy';

/**
 * Compute SHA-256 hash of text (browser-compatible)
 */
export async function sha256(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Synchronous hash for simple comparison (non-crypto, fast)
 */
export function quickHash(text: string): string {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}

/**
 * File anchors — structural elements that must be preserved
 */
export interface FileAnchors {
  /** Named exports */
  exports: string[];
  /** Handler functions (e.g., handleRequest, handler) */
  handlers: string[];
  /** Event listeners (e.g., fetch, message) */
  entrypoints: string[];
  /** Default export presence */
  hasDefaultExport: boolean;
  /** Type exports */
  typeExports: string[];
}

/**
 * Extract structural anchors from TypeScript code
 */
export function extractAnchors(code: string): FileAnchors {
  const exports: string[] = [];
  const handlers: string[] = [];
  const entrypoints: string[] = [];
  const typeExports: string[] = [];
  let hasDefaultExport = false;

  // Named exports: export const/function/class/let Name
  const exportMatches = code.matchAll(
    /\bexport\s+(?:async\s+)?(function|const|let|class)\s+([A-Za-z_$][A-Za-z0-9_$]*)/g
  );
  for (const m of exportMatches) {
    exports.push(m[2]);
  }

  // Re-exports: export { Name } from './module'
  const reExportMatches = code.matchAll(
    /\bexport\s+\{([^}]+)\}/g
  );
  for (const m of reExportMatches) {
    const names = m[1].split(',').map(n => n.trim().split(/\s+as\s+/).pop()!.trim()).filter(Boolean);
    exports.push(...names.filter(n => !n.startsWith('type ')));
  }

  // Type exports: export type/interface Name
  const typeMatches = code.matchAll(
    /\bexport\s+(type|interface)\s+([A-Za-z_$][A-Za-z0-9_$]*)/g
  );
  for (const m of typeMatches) {
    typeExports.push(m[2]);
  }

  // Default export check
  if (/\bexport\s+default\b/.test(code)) {
    hasDefaultExport = true;
  }

  // Handler functions (common patterns)
  const handlerPatterns = [
    /async\s+function\s+(handle[A-Za-z]*)\s*\(/g,
    /const\s+(handle[A-Za-z]*)\s*=\s*async/g,
    /function\s+(handler)\s*\(/gi,
    /const\s+(handler)\s*=/gi,
  ];
  
  for (const pattern of handlerPatterns) {
    const matches = code.matchAll(pattern);
    for (const m of matches) {
      handlers.push(m[1]);
    }
  }

  // Deno/Edge function entrypoints
  if (/Deno\.serve\s*\(/.test(code)) {
    entrypoints.push('Deno.serve');
  }
  if (/addEventListener\s*\(\s*['"]fetch['"]/.test(code)) {
    entrypoints.push('fetch');
  }
  if (/addEventListener\s*\(\s*['"]message['"]/.test(code)) {
    entrypoints.push('message');
  }

  return {
    exports: [...new Set(exports)].sort(),
    handlers: [...new Set(handlers)].sort(),
    entrypoints: [...new Set(entrypoints)].sort(),
    typeExports: [...new Set(typeExports)].sort(),
    hasDefaultExport,
  };
}

/**
 * Compare two sets of anchors for structural changes
 */
export function compareAnchors(
  before: FileAnchors,
  after: FileAnchors
): {
  preserved: boolean;
  removedExports: string[];
  removedHandlers: string[];
  removedEntrypoints: string[];
  removedTypeExports: string[];
  defaultExportChanged: boolean;
  summary: string;
} {
  const removedExports = before.exports.filter(e => !after.exports.includes(e));
  const removedHandlers = before.handlers.filter(h => !after.handlers.includes(h));
  const removedEntrypoints = before.entrypoints.filter(e => !after.entrypoints.includes(e));
  const removedTypeExports = before.typeExports.filter(t => !after.typeExports.includes(t));
  const defaultExportChanged = before.hasDefaultExport && !after.hasDefaultExport;

  const preserved = 
    removedExports.length === 0 &&
    removedHandlers.length === 0 &&
    removedEntrypoints.length === 0 &&
    !defaultExportChanged;

  const issues: string[] = [];
  if (removedExports.length > 0) {
    issues.push(`Removed exports: ${removedExports.join(', ')}`);
  }
  if (removedHandlers.length > 0) {
    issues.push(`Removed handlers: ${removedHandlers.join(', ')}`);
  }
  if (removedEntrypoints.length > 0) {
    issues.push(`Removed entrypoints: ${removedEntrypoints.join(', ')}`);
  }
  if (defaultExportChanged) {
    issues.push('Default export removed');
  }

  return {
    preserved,
    removedExports,
    removedHandlers,
    removedEntrypoints,
    removedTypeExports,
    defaultExportChanged,
    summary: preserved ? 'All anchors preserved' : issues.join('; '),
  };
}

/**
 * Detect narrative or personality code (forbidden in production)
 */
export function detectNarrative(code: string): {
  detected: boolean;
  matches: string[];
} {
  const matches: string[] = [];
  
  for (const pattern of ENCODED_POLICY.narrativePatterns) {
    const match = code.match(pattern);
    if (match) {
      matches.push(match[0]);
    }
  }

  return {
    detected: matches.length > 0,
    matches,
  };
}

/**
 * Extract import statements for dependency tracking
 */
export function extractImports(code: string): string[] {
  const imports: string[] = [];
  
  // ES6 imports
  const importMatches = code.matchAll(
    /import\s+(?:(?:\{[^}]*\}|[^{}\s]+)\s+from\s+)?['"]([^'"]+)['"]/g
  );
  for (const m of importMatches) {
    imports.push(m[1]);
  }
  
  // Dynamic imports
  const dynamicMatches = code.matchAll(/import\s*\(\s*['"]([^'"]+)['"]\s*\)/g);
  for (const m of dynamicMatches) {
    imports.push(m[1]);
  }

  return [...new Set(imports)].sort();
}
