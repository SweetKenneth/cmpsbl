/**
 * CodeAgent File Context Reader — Read Before Write
 * Understands file contents, dependencies, and relationships
 * 
 * Reads real file content via the pf-substrate edge function,
 * with an in-memory + localStorage cache for performance.
 */

import { supabase } from '@/integrations/supabase/client';

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
  dependencies: Map<string, string[]>;
  dependents: Map<string, string[]>;
  modules: Map<string, string[]>;
  lastUpdated: Date;
}

let projectGraph: ProjectGraph = {
  files: new Map(),
  dependencies: new Map(),
  dependents: new Map(),
  modules: new Map(),
  lastUpdated: new Date(),
};

// Persistent disk cache key
const FILE_CACHE_KEY = 'cmpsbl_file_context_cache';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

interface CacheEntry {
  content: string;
  fetchedAt: number;
}

// In-memory content cache
const contentCache = new Map<string, CacheEntry>();

// Hydrate from localStorage once on load
try {
  const stored = localStorage.getItem(FILE_CACHE_KEY);
  if (stored) {
    const entries: Record<string, CacheEntry> = JSON.parse(stored);
    const now = Date.now();
    for (const [path, entry] of Object.entries(entries)) {
      if (now - entry.fetchedAt < CACHE_TTL_MS) {
        contentCache.set(path, entry);
      }
    }
  }
} catch { /* storage unavailable */ }

function persistCache(): void {
  try {
    const obj: Record<string, CacheEntry> = {};
    contentCache.forEach((v, k) => { obj[k] = v; });
    localStorage.setItem(FILE_CACHE_KEY, JSON.stringify(obj));
  } catch { /* quota exceeded or unavailable */ }
}

// ═══════════════════════════════════════════════════════════════
// REAL FILE READING
// ═══════════════════════════════════════════════════════════════

/**
 * Fetch real file content from the substrate edge function.
 * Falls back to brain_events data and finally to structural inference.
 */
async function fetchRealContent(path: string): Promise<string | null> {
  // 1. Check in-memory cache
  const cached = contentCache.get(path);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return cached.content;
  }

  // 2. Try edge function (pf-substrate file_read resolver)
  try {
    const { data, error } = await supabase.functions.invoke('pf-substrate', {
      body: {
        resolver: 'core.file_read',
        payload: { path },
      },
    });
    if (!error && data?.content && typeof data.content === 'string') {
      contentCache.set(path, { content: data.content, fetchedAt: Date.now() });
      persistCache();
      return data.content;
    }
  } catch { /* resolver not available — fall through */ }

  // 3. Try to reconstruct from brain_events (encoded practice logs store file_path)
  try {
    const { data: events } = await supabase
      .from('brain_events')
      .select('data')
      .eq('module', 'encoded')
      .ilike('data->>file_path', `%${path.split('/').pop()}%`)
      .order('created_at', { ascending: false })
      .limit(1);

    const eventData = events?.[0]?.data as Record<string, unknown> | undefined;
    if (eventData?.original_code && typeof eventData.original_code === 'string') {
      contentCache.set(path, { content: eventData.original_code as string, fetchedAt: Date.now() });
      persistCache();
      return eventData.original_code as string;
    }
  } catch { /* no event data */ }

  // 4. Return null — caller should handle missing content gracefully
  return null;
}

/**
 * Synchronous file context read. Uses cached content if available,
 * otherwise returns a skeleton and triggers async fetch.
 */
export function readFileContext(path: string): FileContext {
  if (projectGraph.files.has(path)) {
    return projectGraph.files.get(path)!;
  }

  const language = inferLanguage(path);
  const cachedEntry = contentCache.get(path);
  const content = cachedEntry?.content ?? null;
  const exists = content !== null || isKnownPath(path);

  const context: FileContext = {
    path,
    exists,
    content,
    language,
    size: content?.length || 0,
    lastModified: exists ? new Date() : undefined,
    structure: content ? parseFileStructure(content, language) : null,
  };

  projectGraph.files.set(path, context);

  // If we have no content yet, fire async fetch to populate cache for next call
  if (!content && exists) {
    fetchRealContent(path).then(fetched => {
      if (fetched) {
        context.content = fetched;
        context.size = fetched.length;
        context.structure = parseFileStructure(fetched, language);
        projectGraph.files.set(path, context);
      }
    }).catch(() => {});
  }

  return context;
}

/**
 * Async version — waits for real content before returning.
 */
export async function readFileContextAsync(path: string): Promise<FileContext> {
  const language = inferLanguage(path);
  const content = await fetchRealContent(path);
  const exists = content !== null;

  const context: FileContext = {
    path,
    exists,
    content,
    language,
    size: content?.length || 0,
    lastModified: exists ? new Date() : undefined,
    structure: content ? parseFileStructure(content, language) : null,
  };

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

/**
 * Check whether a path belongs to a known project directory.
 */
function isKnownPath(path: string): boolean {
  const knownRoots = [
    'src/', 'supabase/functions/', 'docs/', 'public/',
  ];
  return knownRoots.some(root => path.startsWith(root));
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
        lineEnd: index + 10,
      });
    }

    // Parse React components
    const componentMatch = line.match(/(export\s+)?(?:function|const)\s+([A-Z]\w+)/);
    if (componentMatch && (language === 'tsx' || language === 'jsx')) {
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

  structure.hooks = [...new Set(structure.hooks)];
  structure.dependencies = [...new Set(structure.dependencies)];

  return structure;
}

// ═══════════════════════════════════════════════════════════════
// DEPENDENCY ANALYSIS
// ═══════════════════════════════════════════════════════════════

export function analyzeDependencies(filePath: string): {
  directDependencies: string[];
  transitiveDependencies: string[];
  dependents: string[];
  circularRisk: boolean;
} {
  const context = readFileContext(filePath);

  const directDependencies = context.structure?.imports
    .filter(imp => imp.source.startsWith('.') || imp.source.startsWith('@/'))
    .map(imp => resolvePath(filePath, imp.source)) || [];

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

  // Build dependents from the graph — scan all cached files for imports of this file
  const dependents = findDependents(filePath);

  const circularRisk = transitiveDependencies.includes(filePath);

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
    result += '.ts';
  }

  return result;
}

/**
 * Build dependents list by scanning cached project graph.
 * Uses real import data from parsed files instead of a hardcoded map.
 */
function findDependents(filePath: string): string[] {
  const dependents: string[] = [];
  const normalizedTarget = filePath.replace(/\.\w+$/, '');

  // Scan all files we've already parsed for imports pointing to this file
  projectGraph.files.forEach((ctx, cachedPath) => {
    if (cachedPath === filePath) return;
    if (!ctx.structure) return;

    const importsTarget = ctx.structure.imports.some(imp => {
      const resolved = resolvePath(cachedPath, imp.source).replace(/\.\w+$/, '');
      return resolved === normalizedTarget;
    });

    if (importsTarget) {
      dependents.push(cachedPath);
    }
  });

  return dependents;
}

// ═══════════════════════════════════════════════════════════════
// MULTI-FILE CONTEXT
// ═══════════════════════════════════════════════════════════════

export function gatherContextForChange(
  module: string,
  changeType: string,
  targetPath?: string
): FileContext[] {
  const contexts: FileContext[] = [];

  const moduleFiles = getModuleFiles(module);
  moduleFiles.forEach(path => {
    contexts.push(readFileContext(path));
  });

  const typeFiles = getChangeTypeFiles(changeType);
  typeFiles.forEach(path => {
    if (!contexts.find(c => c.path === path)) {
      contexts.push(readFileContext(path));
    }
  });

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
  try {
    const { navigateIntent } = require('./encoded/substrate-navigator');
    const result = navigateIntent(module);
    if (result.targetFiles.length > 0) {
      return result.targetFiles;
    }
  } catch { /* fallback */ }

  const mapping: Record<string, string[]> = {
    brain: ['src/lib/substrate.ts', 'src/hooks/useSubstrate.ts', 'src/core/metrics/moduleAdapters/brain.adapter.ts'],
    defense: ['src/lib/defense/', 'src/lib/codeagent/circuit-breaker.ts', 'src/lib/codeagent/executor.ts'],
    nexus: ['src/lib/nexus/', 'src/lib/nexus/core.ts', 'src/lib/nexus/router.ts'],
    vision: ['src/lib/substrate/telemetry-engine.ts', 'src/hooks/useSubstrate.ts'],
    decode: ['src/lib/substrate/decode/', 'src/lib/substrate.ts'],
    encode: ['src/lib/substrate/encode-module/', 'src/lib/codeagent/encoded/'],
    evolution: ['src/lib/evolution-mesh/', 'src/lib/evolve/'],
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
// CONTEXT SUMMARY
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
  contentCache.clear();
  try { localStorage.removeItem(FILE_CACHE_KEY); } catch { /* ok */ }
}
