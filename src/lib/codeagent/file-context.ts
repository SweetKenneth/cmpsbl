/**
 * CodeAgent File Context Reader — Read Before Write
 * Understands file contents, dependencies, and relationships
 * 
 * Mirrors how human agents read and understand code before editing
 */

// ═══════════════════════════════════════════════════════════════
// FILE CONTEXT TYPES
// ═══════════════════════════════════════════════════════════════

export interface FileContext {
  path: string;
  exists: boolean;
  content: string | null;
  language: 'typescript' | 'javascript' | 'tsx' | 'jsx' | 'json' | 'sql' | 'css' | 'unknown';
  size: number;
  lastModified?: Date;
  structure: FileStructure | null;
}

export interface FileStructure {
  imports: ImportInfo[];
  exports: ExportInfo[];
  functions: FunctionInfo[];
  components: ComponentInfo[];
  hooks: string[];
  types: string[];
  constants: string[];
  dependencies: string[];
}

export interface ImportInfo {
  source: string;
  imports: string[];
  isDefault: boolean;
  isType: boolean;
}

export interface ExportInfo {
  name: string;
  type: 'function' | 'const' | 'class' | 'type' | 'interface' | 'default';
}

export interface FunctionInfo {
  name: string;
  async: boolean;
  exported: boolean;
  params: string[];
  returnType?: string;
  lineStart: number;
  lineEnd: number;
}

export interface ComponentInfo {
  name: string;
  type: 'function' | 'arrow' | 'class';
  props: string[];
  hooks: string[];
  exported: boolean;
}

// ═══════════════════════════════════════════════════════════════
// PROJECT KNOWLEDGE GRAPH
// ═══════════════════════════════════════════════════════════════

export interface ProjectGraph {
  files: Map<string, FileContext>;
  dependencies: Map<string, string[]>; // file -> files it depends on
  dependents: Map<string, string[]>; // file -> files that depend on it
  modules: Map<string, string[]>; // module name -> files in module
  lastUpdated: Date;
}

let projectGraph: ProjectGraph = {
  files: new Map(),
  dependencies: new Map(),
  dependents: new Map(),
  modules: new Map(),
  lastUpdated: new Date(),
};

// ═══════════════════════════════════════════════════════════════
// FILE READING & PARSING
// ═══════════════════════════════════════════════════════════════

/**
 * Simulated file reading — in a real implementation this would use
 * the Substrate sandbox or edge functions to read actual files
 */
export function readFileContext(path: string): FileContext {
  // Check cache first
  if (projectGraph.files.has(path)) {
    return projectGraph.files.get(path)!;
  }
  
  // Simulate file context based on path patterns
  const language = inferLanguage(path);
  const exists = isKnownFile(path);
  const content = exists ? getSimulatedContent(path) : null;
  
  const context: FileContext = {
    path,
    exists,
    content,
    language,
    size: content?.length || 0,
    lastModified: exists ? new Date() : undefined,
    structure: content ? parseFileStructure(content, language) : null,
  };
  
  // Cache it
  projectGraph.files.set(path, context);
  
  return context;
}

function inferLanguage(path: string): FileContext['language'] {
  if (path.endsWith('.tsx')) return 'tsx';
  if (path.endsWith('.ts')) return 'typescript';
  if (path.endsWith('.jsx')) return 'jsx';
  if (path.endsWith('.js')) return 'javascript';
  if (path.endsWith('.json')) return 'json';
  if (path.endsWith('.sql')) return 'sql';
  if (path.endsWith('.css')) return 'css';
  return 'unknown';
}

function isKnownFile(path: string): boolean {
  const knownPaths = [
    'src/lib/substrate.ts',
    'src/hooks/useSubstrate.ts',
    'src/lib/codeagent/',
    'src/components/substrate-os/',
    'src/pages/',
    'supabase/functions/',
    'src/config/',
  ];
  return knownPaths.some(known => path.startsWith(known) || path.includes(known));
}

function getSimulatedContent(path: string): string {
  // Return skeleton content based on path
  if (path.includes('substrate.ts')) {
    return `// Substrate Core Library
import { supabase } from '@/integrations/supabase/client';

export interface SubstrateResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function callSubstrate<T>(
  module: string,
  action: string,
  payload?: Record<string, unknown>
): Promise<SubstrateResponse<T>> {
  // Implementation
}`;
  }
  
  if (path.includes('useSubstrate')) {
    return `// Substrate React Hooks
import { useQuery, useMutation } from '@tanstack/react-query';
import { callSubstrate } from '@/lib/substrate';

export function useSubstrateQuery<T>(module: string, action: string) {
  return useQuery({
    queryKey: ['substrate', module, action],
    queryFn: () => callSubstrate<T>(module, action),
  });
}`;
  }
  
  if (path.includes('circuit-breaker')) {
    return `// Circuit Breaker Pattern
export interface CircuitState {
  state: 'closed' | 'open' | 'half-open';
  failures: number;
  lastFailure?: Date;
}

export function createCircuitBreaker(threshold: number) {
  // Implementation
}`;
  }
  
  return `// File: ${path}\n// Content would be loaded here`;
}

// ═══════════════════════════════════════════════════════════════
// STRUCTURE PARSING — Extract Code Intelligence
// ═══════════════════════════════════════════════════════════════

function parseFileStructure(content: string, language: string): FileStructure {
  const structure: FileStructure = {
    imports: [],
    exports: [],
    functions: [],
    components: [],
    hooks: [],
    types: [],
    constants: [],
    dependencies: [],
  };
  
  const lines = content.split('\n');
  
  lines.forEach((line, index) => {
    // Parse imports
    const importMatch = line.match(/import\s+(?:{([^}]+)}|(\w+))\s+from\s+['"]([^'"]+)['"]/);
    if (importMatch) {
      const namedImports = importMatch[1]?.split(',').map(s => s.trim()).filter(Boolean) || [];
      const defaultImport = importMatch[2];
      structure.imports.push({
        source: importMatch[3],
        imports: defaultImport ? [defaultImport] : namedImports,
        isDefault: !!defaultImport,
        isType: line.includes('import type'),
      });
      
      // Track external dependencies
      if (!importMatch[3].startsWith('.') && !importMatch[3].startsWith('@/')) {
        structure.dependencies.push(importMatch[3].split('/')[0]);
      }
    }
    
    // Parse exports
    const exportMatch = line.match(/export\s+(const|function|class|type|interface|default)\s+(\w+)?/);
    if (exportMatch) {
      structure.exports.push({
        name: exportMatch[2] || 'default',
        type: exportMatch[1] as ExportInfo['type'],
      });
    }
    
    // Parse functions
    const funcMatch = line.match(/(export\s+)?(async\s+)?function\s+(\w+)\s*\(([^)]*)\)/);
    if (funcMatch) {
      structure.functions.push({
        name: funcMatch[3],
        async: !!funcMatch[2],
        exported: !!funcMatch[1],
        params: funcMatch[4].split(',').map(p => p.trim()).filter(Boolean),
        lineStart: index + 1,
        lineEnd: index + 10, // Estimate
      });
    }
    
    // Parse React components
    const componentMatch = line.match(/(export\s+)?(?:function|const)\s+([A-Z]\w+)/);
    if (componentMatch && language === 'tsx') {
      structure.components.push({
        name: componentMatch[2],
        type: line.includes('function') ? 'function' : 'arrow',
        props: [],
        hooks: [],
        exported: !!componentMatch[1],
      });
    }
    
    // Parse hooks usage
    const hookMatch = line.match(/use[A-Z]\w+/g);
    if (hookMatch) {
      structure.hooks.push(...hookMatch);
    }
    
    // Parse types/interfaces
    const typeMatch = line.match(/(export\s+)?(type|interface)\s+(\w+)/);
    if (typeMatch) {
      structure.types.push(typeMatch[3]);
    }
    
    // Parse constants
    const constMatch = line.match(/(?:export\s+)?const\s+([A-Z_][A-Z_0-9]*)\s*=/);
    if (constMatch) {
      structure.constants.push(constMatch[1]);
    }
  });
  
  // Dedupe
  structure.hooks = [...new Set(structure.hooks)];
  structure.dependencies = [...new Set(structure.dependencies)];
  
  return structure;
}

// ═══════════════════════════════════════════════════════════════
// DEPENDENCY ANALYSIS — Understand Relationships
// ═══════════════════════════════════════════════════════════════

export function analyzeDependencies(filePath: string): {
  directDependencies: string[];
  transitiveDependencies: string[];
  dependents: string[];
  circularRisk: boolean;
} {
  const context = readFileContext(filePath);
  
  // Get direct dependencies from imports
  const directDependencies = context.structure?.imports
    .filter(imp => imp.source.startsWith('.') || imp.source.startsWith('@/'))
    .map(imp => resolvePath(filePath, imp.source)) || [];
  
  // Build transitive dependencies (simplified)
  const transitiveDependencies: string[] = [];
  const visited = new Set<string>();
  
  function traverse(path: string) {
    if (visited.has(path)) return;
    visited.add(path);
    
    const ctx = readFileContext(path);
    ctx.structure?.imports
      .filter(imp => imp.source.startsWith('.') || imp.source.startsWith('@/'))
      .forEach(imp => {
        const resolved = resolvePath(path, imp.source);
        if (!directDependencies.includes(resolved)) {
          transitiveDependencies.push(resolved);
        }
        traverse(resolved);
      });
  }
  
  directDependencies.forEach(traverse);
  
  // Find files that depend on this file
  const dependents = findDependents(filePath);
  
  // Check for circular dependencies
  const circularRisk = transitiveDependencies.includes(filePath);
  
  // Update graph
  projectGraph.dependencies.set(filePath, directDependencies);
  projectGraph.dependents.set(filePath, dependents);
  
  return {
    directDependencies,
    transitiveDependencies: [...new Set(transitiveDependencies)],
    dependents,
    circularRisk,
  };
}

function resolvePath(from: string, importPath: string): string {
  if (importPath.startsWith('@/')) {
    return importPath.replace('@/', 'src/');
  }
  
  // Simple relative path resolution
  const fromDir = from.split('/').slice(0, -1).join('/');
  const parts = importPath.split('/');
  let resolved = fromDir.split('/');
  
  for (const part of parts) {
    if (part === '..') {
      resolved.pop();
    } else if (part !== '.') {
      resolved.push(part);
    }
  }
  
  let result = resolved.join('/');
  if (!result.match(/\.\w+$/)) {
    result += '.ts'; // Default extension
  }
  
  return result;
}

function findDependents(filePath: string): string[] {
  // In a real implementation, this would scan the project
  // For now, return known relationships
  const dependencyMap: Record<string, string[]> = {
    'src/lib/substrate.ts': [
      'src/hooks/useSubstrate.ts',
      'src/components/substrate-os/',
      'src/pages/',
    ],
    'src/lib/codeagent/circuit-breaker.ts': [
      'src/lib/codeagent/executor.ts',
      'src/lib/codeagent/workflow.ts',
    ],
    'src/hooks/useSubstrate.ts': [
      'src/components/substrate-os/BrainTab.tsx',
      'src/components/substrate-os/DefenseTab.tsx',
      'src/components/substrate-os/NexusTab.tsx',
    ],
  };
  
  return dependencyMap[filePath] || [];
}

// ═══════════════════════════════════════════════════════════════
// MULTI-FILE CONTEXT — Read Related Files
// ═══════════════════════════════════════════════════════════════

export function gatherContextForChange(
  module: string,
  changeType: string,
  targetPath?: string
): FileContext[] {
  const contexts: FileContext[] = [];
  
  // Module-specific files
  const moduleFiles = getModuleFiles(module);
  moduleFiles.forEach(path => {
    contexts.push(readFileContext(path));
  });
  
  // Change-type specific files
  const typeFiles = getChangeTypeFiles(changeType);
  typeFiles.forEach(path => {
    if (!contexts.find(c => c.path === path)) {
      contexts.push(readFileContext(path));
    }
  });
  
  // Target file and its dependencies
  if (targetPath) {
    const deps = analyzeDependencies(targetPath);
    deps.directDependencies.forEach(path => {
      if (!contexts.find(c => c.path === path)) {
        contexts.push(readFileContext(path));
      }
    });
  }
  
  return contexts;
}

function getModuleFiles(module: string): string[] {
  // Use the Substrate Navigator for intelligent resolution
  try {
    const { navigateIntent } = require('./encoded/substrate-navigator');
    const result = navigateIntent(module);
    if (result.targetFiles.length > 0) {
      return result.targetFiles;
    }
  } catch {
    // Fallback to static map if navigator not available
  }

  const mapping: Record<string, string[]> = {
    brain: ['src/lib/substrate.ts', 'src/hooks/useSubstrate.ts', 'src/core/metrics/moduleAdapters/brain.adapter.ts'],
    defense: ['src/lib/defense/', 'src/lib/codeagent/circuit-breaker.ts', 'src/lib/codeagent/executor.ts'],
    nexus: ['src/lib/nexus/', 'src/lib/nexus/core.ts', 'src/lib/nexus/router.ts'],
    vision: ['src/lib/substrate/telemetry-engine.ts', 'src/hooks/useSubstrate.ts'],
    decode: ['src/lib/substrate/decode/', 'src/lib/substrate.ts'],
    encode: ['src/lib/substrate/encode-module/', 'src/lib/codeagent/encoded/'],
    evolution: ['src/lib/evolution-mesh/', 'src/pages/Modernizer.tsx'],
    economy: ['src/lib/substrate/economy-module/'],
    sandbox: ['src/lib/substrate/sandbox-module/'],
    inclusive: ['src/lib/inclusive/'],
    cortex: ['src/lib/substrate/orchestrator-engine.ts'],
    governance: ['src/lib/substrate/governance/'],
    immunity: ['src/lib/substrate/evolution-shadow-resolver/'],
    intent: ['src/lib/substrate/intent-mesh/'],
    integration: ['src/lib/integrations/'],
    medic: ['src/lib/substrate/medic/'],
    nerve: ['src/lib/substrate/nerve/'],
    system: ['src/lib/substrate.ts'],
    core: ['src/lib/codeagent/workflow.ts'],
  };
  
  return mapping[module] || ['src/lib/substrate.ts'];
}

function getChangeTypeFiles(changeType: string): string[] {
  const mapping: Record<string, string[]> = {
    edge_function: ['supabase/functions/'],
    react_component: ['src/components/'],
    react_hook: ['src/hooks/'],
    config_update: ['src/config/'],
    rls_policy: ['supabase/migrations/'],
    rate_limit: ['src/lib/system/rateLimit.ts', 'src/lib/substrate/adaptive-rate-limit/'],
    circuit_breaker: ['src/lib/substrate/tenant-circuit-breaker.ts', 'src/lib/codeagent/circuit-breaker.ts'],
    telemetry: ['src/lib/substrate/telemetry-engine.ts', 'src/core/metrics/'],
    auth: ['src/lib/auth/', 'src/hooks/useAuth.ts'],
    styling: ['src/index.css', 'tailwind.config.ts'],
  };
  
  return mapping[changeType] || [];
}

// ═══════════════════════════════════════════════════════════════
// CONTEXT SUMMARY — For Prompts
// ═══════════════════════════════════════════════════════════════

export function summarizeContext(contexts: FileContext[]): string {
  const summary = contexts.map(ctx => {
    if (!ctx.exists || !ctx.structure) {
      return `📄 ${ctx.path} — Not found or empty`;
    }
    
    const parts: string[] = [];
    if (ctx.structure.exports.length) {
      parts.push(`exports: ${ctx.structure.exports.map(e => e.name).join(', ')}`);
    }
    if (ctx.structure.functions.length) {
      parts.push(`functions: ${ctx.structure.functions.map(f => f.name).join(', ')}`);
    }
    if (ctx.structure.components.length) {
      parts.push(`components: ${ctx.structure.components.map(c => c.name).join(', ')}`);
    }
    if (ctx.structure.hooks.length) {
      parts.push(`uses hooks: ${ctx.structure.hooks.join(', ')}`);
    }
    
    return `📄 ${ctx.path}\n   ${parts.join('\n   ')}`;
  }).join('\n\n');
  
  return summary;
}

export function getProjectGraphStats(): {
  totalFiles: number;
  totalDependencies: number;
  modulesTracked: number;
  lastUpdated: Date;
} {
  return {
    totalFiles: projectGraph.files.size,
    totalDependencies: Array.from(projectGraph.dependencies.values()).flat().length,
    modulesTracked: projectGraph.modules.size,
    lastUpdated: projectGraph.lastUpdated,
  };
}

export function clearProjectGraph(): void {
  projectGraph = {
    files: new Map(),
    dependencies: new Map(),
    dependents: new Map(),
    modules: new Map(),
    lastUpdated: new Date(),
  };
}
