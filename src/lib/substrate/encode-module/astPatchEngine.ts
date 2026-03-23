/**
 * ENCODE AST-Aware Patch Engine — v1.0.0
 * Parses and manipulates code at the Abstract Syntax Tree level.
 * Enables precise surgical edits and semantic-aware merging.
 * 
 * Uses a lightweight token-based AST approximation (no external parser).
 * Supports:
 *   - Function-level extraction and replacement
 *   - Import manipulation (add/remove/reorder)
 *   - Type signature editing
 *   - Export management
 *   - Block-level insertion
 */

// ═══ Types ════════════════════════════════════════════════════════

export type ASTNodeType =
  | 'import' | 'export' | 'function' | 'arrow_function'
  | 'interface' | 'type_alias' | 'enum' | 'class'
  | 'const' | 'let' | 'var' | 'comment' | 'block' | 'unknown';

export interface ASTNode {
  type: ASTNodeType;
  name: string;
  startLine: number;
  endLine: number;
  exported: boolean;
  content: string;
  children?: ASTNode[];
}

export interface ASTParseResult {
  nodes: ASTNode[];
  imports: ImportNode[];
  exports: string[];
  lineCount: number;
}

export interface ImportNode {
  source: string;
  specifiers: string[];
  isTypeOnly: boolean;
  line: number;
  raw: string;
}

export interface PatchOperation {
  type: 'replace' | 'insert_before' | 'insert_after' | 'remove' | 'wrap';
  targetName: string;
  targetType?: ASTNodeType;
  content?: string;
  wrapBefore?: string;
  wrapAfter?: string;
}

export interface PatchResult {
  success: boolean;
  output: string;
  operations: number;
  errors: string[];
}

// ═══ Lightweight AST Parser ═══════════════════════════════════════

const PATTERNS = {
  import: /^(import\s+(?:type\s+)?(?:\{[^}]*\}|\*\s+as\s+\w+|\w+).*?from\s+['"][^'"]+['"];?)/,
  exportFunction: /^(export\s+(?:async\s+)?function\s+(\w+))/,
  function: /^((?:async\s+)?function\s+(\w+))/,
  arrowConst: /^(export\s+)?const\s+(\w+)\s*(?::\s*[^=]+)?\s*=\s*(?:async\s+)?\(/,
  arrowConstSimple: /^(export\s+)?const\s+(\w+)\s*=\s*\(/,
  interface: /^(export\s+)?interface\s+(\w+)/,
  typeAlias: /^(export\s+)?type\s+(\w+)\s*=/,
  enum: /^(export\s+)?enum\s+(\w+)/,
  class: /^(export\s+)?class\s+(\w+)/,
  constDecl: /^(export\s+)?const\s+(\w+)\s*(?::\s*[^=]+)?\s*=/,
  letDecl: /^(export\s+)?let\s+(\w+)/,
  blockComment: /^\/\*\*/,
  lineComment: /^\/\//,
  exportStatement: /^export\s+\{([^}]*)\}/,
  reExport: /^export\s+(?:\*|\{[^}]*\})\s+from/,
};

/**
 * Parse code into a lightweight AST
 */
export function parseAST(code: string): ASTParseResult {
  const lines = code.split('\n');
  const nodes: ASTNode[] = [];
  const imports: ImportNode[] = [];
  const exports: string[] = [];

  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trim();
    if (!line) { i++; continue; }

    // Imports
    if (PATTERNS.import.test(line)) {
      const match = line.match(/from\s+['"]([^'"]+)['"]/);
      const specMatch = line.match(/\{([^}]*)\}/);
      const isType = line.includes('import type');

      imports.push({
        source: match?.[1] || '',
        specifiers: specMatch ? specMatch[1].split(',').map(s => s.trim()).filter(Boolean) : [],
        isTypeOnly: isType,
        line: i,
        raw: lines[i],
      });

      nodes.push({ type: 'import', name: match?.[1] || '', startLine: i, endLine: i, exported: false, content: lines[i] });
      i++; continue;
    }

    // Re-exports
    if (PATTERNS.reExport.test(line)) {
      const endLine = findBlockEnd(lines, i);
      nodes.push({ type: 'export', name: 're-export', startLine: i, endLine, exported: true, content: lines.slice(i, endLine + 1).join('\n') });
      i = endLine + 1; continue;
    }

    // Block comments (/** ... */)
    if (PATTERNS.blockComment.test(line)) {
      const endLine = findCommentEnd(lines, i);
      nodes.push({ type: 'comment', name: 'jsdoc', startLine: i, endLine, exported: false, content: lines.slice(i, endLine + 1).join('\n') });
      i = endLine + 1; continue;
    }

    // Functions
    const fnMatch = line.match(PATTERNS.exportFunction) || line.match(PATTERNS.function);
    if (fnMatch) {
      const name = fnMatch[2];
      const exported = line.startsWith('export');
      const endLine = findBlockEnd(lines, i);
      nodes.push({ type: 'function', name, startLine: i, endLine, exported, content: lines.slice(i, endLine + 1).join('\n') });
      if (exported) exports.push(name);
      i = endLine + 1; continue;
    }

    // Interfaces
    const ifaceMatch = line.match(PATTERNS.interface);
    if (ifaceMatch) {
      const name = ifaceMatch[2];
      const exported = !!ifaceMatch[1];
      const endLine = findBlockEnd(lines, i);
      nodes.push({ type: 'interface', name, startLine: i, endLine, exported, content: lines.slice(i, endLine + 1).join('\n') });
      if (exported) exports.push(name);
      i = endLine + 1; continue;
    }

    // Type aliases
    const typeMatch = line.match(PATTERNS.typeAlias);
    if (typeMatch) {
      const name = typeMatch[2];
      const exported = !!typeMatch[1];
      const endLine = findStatementEnd(lines, i);
      nodes.push({ type: 'type_alias', name, startLine: i, endLine, exported, content: lines.slice(i, endLine + 1).join('\n') });
      if (exported) exports.push(name);
      i = endLine + 1; continue;
    }

    // Enums
    const enumMatch = line.match(PATTERNS.enum);
    if (enumMatch) {
      const name = enumMatch[2];
      const exported = !!enumMatch[1];
      const endLine = findBlockEnd(lines, i);
      nodes.push({ type: 'enum', name, startLine: i, endLine, exported, content: lines.slice(i, endLine + 1).join('\n') });
      if (exported) exports.push(name);
      i = endLine + 1; continue;
    }

    // Arrow functions as const
    const arrowMatch = line.match(PATTERNS.arrowConst) || line.match(PATTERNS.arrowConstSimple);
    if (arrowMatch) {
      const name = arrowMatch[2];
      const exported = !!arrowMatch[1];
      const endLine = findBlockEnd(lines, i);
      nodes.push({ type: 'arrow_function', name, startLine: i, endLine, exported, content: lines.slice(i, endLine + 1).join('\n') });
      if (exported) exports.push(name);
      i = endLine + 1; continue;
    }

    // Const declarations
    const constMatch = line.match(PATTERNS.constDecl);
    if (constMatch) {
      const name = constMatch[2];
      const exported = !!constMatch[1];
      const endLine = findStatementEnd(lines, i);
      nodes.push({ type: 'const', name, startLine: i, endLine, exported, content: lines.slice(i, endLine + 1).join('\n') });
      if (exported) exports.push(name);
      i = endLine + 1; continue;
    }

    // Export statements
    const exportMatch = line.match(PATTERNS.exportStatement);
    if (exportMatch) {
      const names = exportMatch[1].split(',').map(s => s.trim()).filter(Boolean);
      exports.push(...names);
      nodes.push({ type: 'export', name: 'named', startLine: i, endLine: i, exported: true, content: lines[i] });
      i++; continue;
    }

    i++;
  }

  return { nodes, imports, exports: [...new Set(exports)], lineCount: lines.length };
}

// ═══ AST Patch Operations ═════════════════════════════════════════

/**
 * Apply patch operations to code using AST awareness
 */
export function applyASTPatch(code: string, operations: PatchOperation[]): PatchResult {
  const ast = parseAST(code);
  const lines = code.split('\n');
  const errors: string[] = [];
  let opsApplied = 0;

  // Process operations in reverse line order to avoid offset issues
  const sortedOps = operations.map(op => {
    const target = ast.nodes.find(n =>
      n.name === op.targetName && (!op.targetType || n.type === op.targetType)
    );
    return { op, target };
  }).filter(({ target, op }) => {
    if (!target) {
      errors.push(`Target not found: ${op.targetName} (${op.targetType || 'any'})`);
      return false;
    }
    return true;
  }).sort((a, b) => (b.target?.startLine || 0) - (a.target?.startLine || 0));

  for (const { op, target } of sortedOps) {
    if (!target) continue;

    switch (op.type) {
      case 'replace':
        if (op.content) {
          lines.splice(target.startLine, target.endLine - target.startLine + 1, ...op.content.split('\n'));
          opsApplied++;
        }
        break;

      case 'insert_before':
        if (op.content) {
          lines.splice(target.startLine, 0, ...op.content.split('\n'));
          opsApplied++;
        }
        break;

      case 'insert_after':
        if (op.content) {
          lines.splice(target.endLine + 1, 0, ...op.content.split('\n'));
          opsApplied++;
        }
        break;

      case 'remove':
        lines.splice(target.startLine, target.endLine - target.startLine + 1);
        opsApplied++;
        break;

      case 'wrap':
        if (op.wrapBefore || op.wrapAfter) {
          if (op.wrapAfter) lines.splice(target.endLine + 1, 0, op.wrapAfter);
          if (op.wrapBefore) lines.splice(target.startLine, 0, op.wrapBefore);
          opsApplied++;
        }
        break;
    }
  }

  return {
    success: errors.length === 0,
    output: lines.join('\n'),
    operations: opsApplied,
    errors,
  };
}

/**
 * Find a node by name and optionally by type
 */
export function findNode(code: string, name: string, type?: ASTNodeType): ASTNode | undefined {
  const ast = parseAST(code);
  return ast.nodes.find(n => n.name === name && (!type || n.type === type));
}

/**
 * Add an import to code (deduplicating)
 */
export function addImport(code: string, source: string, specifiers: string[], isType: boolean = false): string {
  const ast = parseAST(code);

  // Check if import from this source already exists
  const existing = ast.imports.find(i => i.source === source);
  if (existing) {
    // Merge specifiers
    const allSpecs = new Set([...existing.specifiers, ...specifiers]);
    const newImport = `import ${isType ? 'type ' : ''}{ ${[...allSpecs].join(', ')} } from '${source}';`;
    const lines = code.split('\n');
    lines[existing.line] = newImport;
    return lines.join('\n');
  }

  // Add new import after last import
  const lastImport = ast.imports[ast.imports.length - 1];
  const insertLine = lastImport ? lastImport.line + 1 : 0;
  const newImport = `import ${isType ? 'type ' : ''}{ ${specifiers.join(', ')} } from '${source}';`;
  const lines = code.split('\n');
  lines.splice(insertLine, 0, newImport);
  return lines.join('\n');
}

// ═══ Block Finders ════════════════════════════════════════════════

function findBlockEnd(lines: string[], start: number): number {
  let depth = 0;
  let foundOpen = false;

  for (let i = start; i < lines.length; i++) {
    for (const char of lines[i]) {
      if (char === '{') { depth++; foundOpen = true; }
      if (char === '}') depth--;
    }
    if (foundOpen && depth <= 0) return i;
  }

  return Math.min(start + 1, lines.length - 1);
}

function findCommentEnd(lines: string[], start: number): number {
  for (let i = start; i < lines.length; i++) {
    if (lines[i].includes('*/')) return i;
  }
  return start;
}

function findStatementEnd(lines: string[], start: number): number {
  let depth = 0;
  for (let i = start; i < lines.length; i++) {
    for (const char of lines[i]) {
      if (char === '{' || char === '(' || char === '[') depth++;
      if (char === '}' || char === ')' || char === ']') depth--;
    }
    if (depth <= 0 && (lines[i].trimEnd().endsWith(';') || lines[i].trimEnd().endsWith('}') || lines[i].trimEnd().endsWith(','))) {
      return i;
    }
  }
  return Math.min(start + 1, lines.length - 1);
}
