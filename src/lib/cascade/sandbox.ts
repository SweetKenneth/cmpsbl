/**
 * Cascade Patch Sandbox
 * Dry-run validator for YAML patch specs
 */

export interface SandboxWarning {
  type: 'error' | 'warning' | 'info';
  message: string;
  line?: number;
}

export interface SandboxResult {
  valid: boolean;
  warnings: SandboxWarning[];
  fileCount: number;
  operationCount: number;
}

/**
 * Validate a YAML patch specification
 */
export function validatePatchYaml(yaml: string): SandboxResult {
  const warnings: SandboxWarning[] = [];
  let fileCount = 0;
  let operationCount = 0;

  if (!yaml || typeof yaml !== 'string') {
    return {
      valid: false,
      warnings: [{ type: 'error', message: 'Empty or invalid YAML input' }],
      fileCount: 0,
      operationCount: 0
    };
  }

  const lines = yaml.split('\n');

  // Check for required top-level fields
  if (!yaml.includes('patch_title:')) {
    warnings.push({ type: 'warning', message: 'Missing patch_title field' });
  }

  if (!yaml.includes('files:')) {
    warnings.push({ type: 'error', message: 'Missing files block - patch has no file operations' });
  }

  if (!yaml.includes('- path:')) {
    warnings.push({ type: 'error', message: 'No file paths defined in patch' });
  }

  // Check indentation consistency
  let prevIndent = 0;
  let inconsistentIndent = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim() === '') continue;
    
    const indent = line.match(/^(\s*)/)?.[1].length || 0;
    
    // Check for tab characters
    if (line.includes('\t')) {
      warnings.push({ 
        type: 'warning', 
        message: `Tab character found on line ${i + 1} - use spaces for YAML`,
        line: i + 1
      });
    }

    // Check for odd indentation (YAML typically uses 2-space)
    if (indent > 0 && indent % 2 !== 0) {
      inconsistentIndent = true;
    }

    prevIndent = indent;
  }

  if (inconsistentIndent) {
    warnings.push({ type: 'warning', message: 'Inconsistent indentation detected - use 2-space indents' });
  }

  // Count files and operations
  const fileMatches = yaml.match(/- path:/g);
  fileCount = fileMatches?.length || 0;

  const opMatches = yaml.match(/- type:\s*(create|modify|delete)/g);
  operationCount = opMatches?.length || 0;

  // Check for common issues
  if (yaml.includes('```')) {
    warnings.push({ type: 'info', message: 'Contains code fence markers - may need cleanup' });
  }

  if (yaml.length > 40000) {
    warnings.push({ type: 'warning', message: `Large patch (${Math.round(yaml.length / 1000)}k chars) - consider splitting` });
  }

  // Check for missing operation types
  const pathCount = (yaml.match(/- path:/g) || []).length;
  const typeCount = (yaml.match(/- type:/g) || []).length;
  if (pathCount > 0 && typeCount < pathCount) {
    warnings.push({ type: 'warning', message: 'Some files may be missing operation types' });
  }

  const hasErrors = warnings.some(w => w.type === 'error');

  return {
    valid: !hasErrors,
    warnings,
    fileCount,
    operationCount
  };
}

/**
 * Check if a file path looks like it should exist
 * (basic heuristic based on common patterns)
 */
export function checkFilePath(path: string): { exists: boolean; reason?: string } {
  // Common patterns that suggest new files
  const newFilePatterns = [
    /^src\/pages\/.*\.tsx$/,
    /^src\/components\/.*\.tsx$/,
    /^src\/lib\/.*\.ts$/,
    /^supabase\/functions\/.*\/index\.ts$/,
    /^docs\/.*\.md$/
  ];

  // Patterns that are suspicious
  const suspiciousPatterns = [
    /^\//, // Absolute paths
    /\.\.\// , // Parent traversal
    /node_modules/,
    /\.env/
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(path)) {
      return { exists: false, reason: 'Suspicious path pattern detected' };
    }
  }

  // For now, return unknown - in future could integrate with file system check
  return { exists: true };
}

/**
 * Extract all file paths from a YAML patch
 */
export function extractFilePaths(yaml: string): string[] {
  const paths: string[] = [];
  const matches = yaml.matchAll(/- path:\s*["']?([^"'\n]+)["']?/g);
  
  for (const match of matches) {
    if (match[1]) {
      paths.push(match[1].trim());
    }
  }
  
  return paths;
}
