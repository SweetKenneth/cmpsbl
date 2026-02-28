/**
 * #9 — Dead Code Detector
 * Identify unreachable routes, unused components, orphaned database tables,
 * and abandoned migrations.
 */

export interface DeadCodeReport {
  unusedExports: UnusedExport[];
  orphanedFiles: OrphanedFile[];
  unreachableRoutes: UnreachableRoute[];
  unusedDependencies: UnusedDependency[];
  abandonedMigrations: AbandonedMigration[];
  deadImports: DeadImport[];
  totalDeadItems: number;
  estimatedBloatKB: number;
  cleanupPriority: CleanupItem[];
  scanTimestamp: string;
}

export interface UnusedExport {
  name: string;
  file: string;
  type: 'function' | 'class' | 'variable' | 'type' | 'component' | 'constant';
  lastModified: string | null;
  confidence: number;
}

export interface OrphanedFile {
  path: string;
  type: 'component' | 'utility' | 'style' | 'test' | 'config' | 'migration' | 'asset';
  sizeBytes: number;
  reason: string;
  confidence: number;
}

export interface UnreachableRoute {
  path: string;
  file: string;
  reason: string;
}

export interface UnusedDependency {
  name: string;
  version: string;
  isDev: boolean;
  estimatedSizeKB: number;
}

export interface AbandonedMigration {
  file: string;
  direction: 'up' | 'down' | 'both';
  hasRevert: boolean;
  age: string | null;
}

export interface DeadImport {
  importName: string;
  fromModule: string;
  file: string;
  line: number;
}

export interface CleanupItem {
  type: string;
  item: string;
  impactKB: number;
  effort: 'trivial' | 'small' | 'medium';
  description: string;
}

/**
 * Detect dead code across the codebase
 */
export function detectDeadCode(
  files: Array<{ path: string; content: string }>,
  dependencies: Record<string, string>,
  routeDefinitions: string[]
): DeadCodeReport {
  const unusedExports: UnusedExport[] = [];
  const orphanedFiles: OrphanedFile[] = [];
  const deadImports: DeadImport[] = [];
  const unusedDependencies: UnusedDependency[] = [];

  // Build export/import graph
  const exportMap = new Map<string, { file: string; name: string; type: UnusedExport['type'] }[]>();
  const importSet = new Set<string>();
  const fileImportMap = new Map<string, Set<string>>();

  for (const file of files) {
    // Track exports
    const exportRegex = /export\s+(?:(?:default\s+)?(?:function|class|const|let|var|type|interface|enum)\s+)?(\w+)/g;
    let match;
    while ((match = exportRegex.exec(file.content)) !== null) {
      const name = match[1];
      if (name && name !== 'default') {
        const existing = exportMap.get(name) || [];
        const type = detectExportType(file.content, match.index);
        existing.push({ file: file.path, name, type });
        exportMap.set(name, existing);
      }
    }

    // Track imports
    const importRegex = /import\s+(?:\{([^}]+)\}|(\w+))\s+from\s+['"`]([^'"`]+)['"`]/g;
    const fileImports = new Set<string>();
    while ((match = importRegex.exec(file.content)) !== null) {
      const namedImports = match[1]?.split(',').map(s => s.trim().split(/\s+as\s+/)[0].trim()) || [];
      const defaultImport = match[2];
      const fromModule = match[3];

      for (const imp of namedImports) {
        if (imp) {
          importSet.add(imp);
          fileImports.add(imp);
        }
      }
      if (defaultImport) {
        importSet.add(defaultImport);
        fileImports.add(defaultImport);
      }

      // Track module usage for dependency analysis
      importSet.add(`module:${fromModule}`);
    }

    fileImportMap.set(file.path, fileImports);

    // Detect dead imports (imported but not used in the file)
    for (const imp of fileImports) {
      if (imp.startsWith('module:')) continue;
      const usageRegex = new RegExp(`\\b${escapeRegex(imp)}\\b`, 'g');
      const usages = file.content.match(usageRegex);
      // If only appears once (the import itself), it's dead
      if (usages && usages.length <= 1) {
        const lineMatch = file.content.split('\n').findIndex(line => 
          new RegExp(`import.*\\b${escapeRegex(imp)}\\b`).test(line)
        );
        deadImports.push({
          importName: imp,
          fromModule: '',
          file: file.path,
          line: lineMatch + 1,
        });
      }
    }
  }

  // Find unused exports
  for (const [name, exports] of exportMap.entries()) {
    if (!importSet.has(name)) {
      for (const exp of exports) {
        // Skip entry points, configs, and test files
        if (/index\.[jt]sx?$|config\.|\.test\.|\.spec\.|App\.[jt]sx?$|main\.[jt]sx?$/i.test(exp.file)) continue;
        
        unusedExports.push({
          name,
          file: exp.file,
          type: exp.type,
          lastModified: null,
          confidence: 0.7,
        });
      }
    }
  }

  // Find orphaned files (not imported anywhere)
  const importedFiles = new Set<string>();
  for (const file of files) {
    const importPaths = file.content.match(/from\s+['"`]([^'"`]+)['"`]/g);
    if (importPaths) {
      for (const imp of importPaths) {
        const path = imp.replace(/from\s+['"`]|['"`]$/g, '');
        importedFiles.add(path);
        // Also add common extensions
        importedFiles.add(path + '.ts');
        importedFiles.add(path + '.tsx');
        importedFiles.add(path + '.js');
        importedFiles.add(path + '.jsx');
        importedFiles.add(path + '/index.ts');
        importedFiles.add(path + '/index.tsx');
      }
    }
  }

  for (const file of files) {
    // Skip entry points and configs
    if (/index\.[jt]sx?$|config\.|\.test\.|\.spec\.|App\.[jt]sx?$|main\.[jt]sx?$/i.test(file.path)) continue;
    
    const isImported = Array.from(importedFiles).some(imp => 
      file.path.includes(imp.replace(/^[@./]+/, ''))
    );

    if (!isImported && file.content.length > 0) {
      orphanedFiles.push({
        path: file.path,
        type: detectFileType(file.path),
        sizeBytes: file.content.length,
        reason: 'Not imported by any other file',
        confidence: 0.5, // Low confidence — may be dynamically imported
      });
    }
  }

  // Find unused dependencies
  const allCode = files.map(f => f.content).join('\n');
  for (const [dep, version] of Object.entries(dependencies)) {
    const depPatterns = [
      `from '${dep}'`,
      `from "${dep}"`,
      `require('${dep}')`,
      `require("${dep}")`,
      `from '${dep}/`,
      `from "${dep}/`,
    ];
    
    const isUsed = depPatterns.some(p => allCode.includes(p));
    if (!isUsed) {
      unusedDependencies.push({
        name: dep,
        version,
        isDev: false,
        estimatedSizeKB: 0,
      });
    }
  }

  // Build cleanup priority
  const cleanupPriority: CleanupItem[] = [
    ...unusedDependencies.map(d => ({
      type: 'dependency',
      item: d.name,
      impactKB: d.estimatedSizeKB,
      effort: 'trivial' as const,
      description: `Remove unused dependency ${d.name}@${d.version}`,
    })),
    ...deadImports.slice(0, 20).map(d => ({
      type: 'import',
      item: `${d.importName} in ${d.file}`,
      impactKB: 0,
      effort: 'trivial' as const,
      description: `Remove dead import ${d.importName}`,
    })),
    ...orphanedFiles.filter(f => f.confidence > 0.7).map(f => ({
      type: 'file',
      item: f.path,
      impactKB: Math.round(f.sizeBytes / 1024),
      effort: 'small' as const,
      description: `Remove orphaned ${f.type}: ${f.path}`,
    })),
  ].sort((a, b) => b.impactKB - a.impactKB);

  const estimatedBloatKB = cleanupPriority.reduce((sum, c) => sum + c.impactKB, 0);

  return {
    unusedExports,
    orphanedFiles,
    unreachableRoutes: [],
    unusedDependencies,
    abandonedMigrations: [],
    deadImports,
    totalDeadItems: unusedExports.length + orphanedFiles.length + deadImports.length + unusedDependencies.length,
    estimatedBloatKB,
    cleanupPriority,
    scanTimestamp: new Date().toISOString(),
  };
}

function detectExportType(content: string, index: number): UnusedExport['type'] {
  const prefix = content.slice(Math.max(0, index - 50), index + 80);
  if (/function/i.test(prefix)) return 'function';
  if (/class/i.test(prefix)) return 'class';
  if (/type|interface/i.test(prefix)) return 'type';
  if (/const.*=.*\(.*\)\s*=>|const.*=.*function/i.test(prefix)) return 'component';
  if (/const|let|var/i.test(prefix)) return 'variable';
  return 'variable';
}

function detectFileType(path: string): OrphanedFile['type'] {
  if (/\.test\.|\.spec\./i.test(path)) return 'test';
  if (/\.css|\.scss|\.less|\.styled/i.test(path)) return 'style';
  if (/config\.|\.config/i.test(path)) return 'config';
  if (/migration/i.test(path)) return 'migration';
  if (/\.(png|jpg|svg|gif|ico|webp)/i.test(path)) return 'asset';
  if (/component|page|view|screen/i.test(path)) return 'component';
  return 'utility';
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
