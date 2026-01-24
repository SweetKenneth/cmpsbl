/**
 * CodeAgent v3 - AST-Level Analysis
 * Parse TypeScript/JavaScript into abstract syntax trees
 */

export interface ImportStatement {
  source: string;
  specifiers: string[];
  isDefault: boolean;
  line: number;
}

export interface ExportStatement {
  name: string;
  isDefault: boolean;
  type: 'function' | 'class' | 'const' | 'type' | 'interface';
  line: number;
}

export interface FunctionDeclaration {
  name: string;
  params: { name: string; type?: string }[];
  returnType?: string;
  isAsync: boolean;
  isExported: boolean;
  startLine: number;
  endLine: number;
  complexity: number;
}

export interface TypeDefinition {
  name: string;
  kind: 'interface' | 'type' | 'enum';
  properties: { name: string; type: string; optional: boolean }[];
  line: number;
}

export interface ASTAnalysis {
  imports: ImportStatement[];
  exports: ExportStatement[];
  functions: FunctionDeclaration[];
  types: TypeDefinition[];
  dependencies: string[];
  cyclomaticComplexity: number;
  linesOfCode: number;
  hasJSX: boolean;
}

/**
 * Analyze TypeScript/JavaScript code and extract AST information
 */
export function analyzeCode(code: string, filename: string = 'unknown.ts'): ASTAnalysis {
  const lines = code.split('\n');
  const imports = parseImports(code);
  const exports = parseExports(code);
  const functions = parseFunctions(code);
  const types = parseTypes(code);
  
  const dependencies = [...new Set(imports.map(i => i.source))];
  const cyclomaticComplexity = calculateComplexity(code);
  const hasJSX = /(<[A-Z][a-zA-Z]*|<\/|<[a-z]+\s)/.test(code);

  return {
    imports,
    exports,
    functions,
    types,
    dependencies,
    cyclomaticComplexity,
    linesOfCode: lines.filter(l => l.trim() && !l.trim().startsWith('//')).length,
    hasJSX
  };
}

function parseImports(code: string): ImportStatement[] {
  const imports: ImportStatement[] = [];
  const lines = code.split('\n');
  
  const importRegex = /import\s+(?:(\{[^}]+\})|(\w+)(?:\s*,\s*\{([^}]+)\})?)\s+from\s+['"]([^'"]+)['"]/g;
  const defaultImportRegex = /import\s+(\w+)\s+from\s+['"]([^'"]+)['"]/g;
  
  let match;
  while ((match = importRegex.exec(code)) !== null) {
    const namedImports = match[1] || match[3];
    const defaultImport = match[2];
    const source = match[4];
    
    const specifiers: string[] = [];
    if (defaultImport) specifiers.push(defaultImport);
    if (namedImports) {
      specifiers.push(...namedImports.replace(/[{}]/g, '').split(',').map(s => s.trim()).filter(Boolean));
    }
    
    const line = code.substring(0, match.index).split('\n').length;
    imports.push({ source, specifiers, isDefault: !!defaultImport, line });
  }
  
  return imports;
}

function parseExports(code: string): ExportStatement[] {
  const exports: ExportStatement[] = [];
  
  const patterns = [
    { regex: /export\s+default\s+function\s+(\w+)/g, type: 'function' as const, isDefault: true },
    { regex: /export\s+function\s+(\w+)/g, type: 'function' as const, isDefault: false },
    { regex: /export\s+const\s+(\w+)/g, type: 'const' as const, isDefault: false },
    { regex: /export\s+interface\s+(\w+)/g, type: 'interface' as const, isDefault: false },
    { regex: /export\s+type\s+(\w+)/g, type: 'type' as const, isDefault: false },
    { regex: /export\s+class\s+(\w+)/g, type: 'class' as const, isDefault: false },
  ];
  
  for (const { regex, type, isDefault } of patterns) {
    let match;
    while ((match = regex.exec(code)) !== null) {
      const line = code.substring(0, match.index).split('\n').length;
      exports.push({ name: match[1], isDefault, type, line });
    }
  }
  
  return exports;
}

function parseFunctions(code: string): FunctionDeclaration[] {
  const functions: FunctionDeclaration[] = [];
  
  const funcRegex = /(export\s+)?(async\s+)?function\s+(\w+)\s*\(([^)]*)\)(?:\s*:\s*([^{]+))?\s*\{/g;
  const arrowRegex = /(export\s+)?const\s+(\w+)\s*=\s*(async\s+)?\([^)]*\)\s*(?::\s*([^=]+))?\s*=>/g;
  
  let match;
  while ((match = funcRegex.exec(code)) !== null) {
    const startLine = code.substring(0, match.index).split('\n').length;
    const params = parseParams(match[4]);
    
    functions.push({
      name: match[3],
      params,
      returnType: match[5]?.trim(),
      isAsync: !!match[2],
      isExported: !!match[1],
      startLine,
      endLine: startLine + 10, // Approximate
      complexity: calculateFunctionComplexity(code.substring(match.index))
    });
  }
  
  while ((match = arrowRegex.exec(code)) !== null) {
    const startLine = code.substring(0, match.index).split('\n').length;
    
    functions.push({
      name: match[2],
      params: [],
      returnType: match[4]?.trim(),
      isAsync: !!match[3],
      isExported: !!match[1],
      startLine,
      endLine: startLine + 5,
      complexity: 1
    });
  }
  
  return functions;
}

function parseParams(paramString: string): { name: string; type?: string }[] {
  if (!paramString.trim()) return [];
  
  return paramString.split(',').map(p => {
    const [name, type] = p.split(':').map(s => s.trim());
    return { name: name.replace(/[?=].*/, ''), type };
  });
}

function parseTypes(code: string): TypeDefinition[] {
  const types: TypeDefinition[] = [];
  
  const interfaceRegex = /(?:export\s+)?interface\s+(\w+)\s*\{([^}]+)\}/g;
  const typeRegex = /(?:export\s+)?type\s+(\w+)\s*=\s*\{([^}]+)\}/g;
  
  let match;
  while ((match = interfaceRegex.exec(code)) !== null) {
    const line = code.substring(0, match.index).split('\n').length;
    const properties = parseProperties(match[2]);
    types.push({ name: match[1], kind: 'interface', properties, line });
  }
  
  while ((match = typeRegex.exec(code)) !== null) {
    const line = code.substring(0, match.index).split('\n').length;
    const properties = parseProperties(match[2]);
    types.push({ name: match[1], kind: 'type', properties, line });
  }
  
  return types;
}

function parseProperties(propString: string): { name: string; type: string; optional: boolean }[] {
  return propString.split(/[;\n]/).filter(p => p.includes(':')).map(p => {
    const optional = p.includes('?');
    const [name, type] = p.split(':').map(s => s.replace('?', '').trim());
    return { name, type: type || 'unknown', optional };
  });
}

function calculateComplexity(code: string): number {
  const branches = (code.match(/\b(if|else|for|while|switch|case|catch|&&|\|\||\?)/g) || []).length;
  return Math.max(1, branches);
}

function calculateFunctionComplexity(funcCode: string): number {
  // Get just the function body (approximate)
  const bodyMatch = funcCode.match(/\{([\s\S]*?)\}/);
  if (!bodyMatch) return 1;
  return calculateComplexity(bodyMatch[1]);
}

/**
 * Check if a modification would break types
 */
export function checkTypeCompatibility(
  original: ASTAnalysis,
  modified: ASTAnalysis
): { compatible: boolean; issues: string[] } {
  const issues: string[] = [];
  
  // Check removed exports that might be used elsewhere
  for (const exp of original.exports) {
    const stillExists = modified.exports.find(e => e.name === exp.name);
    if (!stillExists) {
      issues.push(`Removed export: ${exp.name} - may break imports in other files`);
    }
  }
  
  // Check changed function signatures
  for (const func of original.functions) {
    const modifiedFunc = modified.functions.find(f => f.name === func.name);
    if (modifiedFunc) {
      if (func.params.length !== modifiedFunc.params.length) {
        issues.push(`Function ${func.name}: parameter count changed from ${func.params.length} to ${modifiedFunc.params.length}`);
      }
    }
  }
  
  // Check changed type definitions
  for (const type of original.types) {
    const modifiedType = modified.types.find(t => t.name === type.name);
    if (modifiedType) {
      const removedProps = type.properties.filter(p => 
        !modifiedType.properties.find(mp => mp.name === p.name)
      );
      if (removedProps.length > 0) {
        issues.push(`Type ${type.name}: removed properties: ${removedProps.map(p => p.name).join(', ')}`);
      }
    }
  }
  
  return { compatible: issues.length === 0, issues };
}
