/**
 * CodeAgent v3 - Style Guide Enforcement
 * Learn and enforce coding style automatically
 */

import { ASTAnalysis } from './ast-analyzer';

export interface StyleRule {
  id: string;
  name: string;
  description: string;
  category: 'naming' | 'formatting' | 'imports' | 'components' | 'types' | 'best-practices';
  severity: 'error' | 'warning' | 'info';
  check: (code: string, analysis: ASTAnalysis) => StyleViolation[];
  autofix?: (code: string, violation: StyleViolation) => string;
}

export interface StyleViolation {
  rule: string;
  message: string;
  line: number;
  column?: number;
  suggestion?: string;
  autoFixable: boolean;
}

export interface StyleReport {
  file: string;
  violations: StyleViolation[];
  score: number;
  summary: {
    errors: number;
    warnings: number;
    infos: number;
  };
}

// Core style rules based on project patterns
const STYLE_RULES: StyleRule[] = [
  {
    id: 'naming-components',
    name: 'PascalCase Components',
    description: 'React components should use PascalCase naming',
    category: 'naming',
    severity: 'error',
    check: (code, analysis) => {
      const violations: StyleViolation[] = [];
      
      for (const func of analysis.functions) {
        if (analysis.hasJSX && func.isExported) {
          if (!/^[A-Z][a-zA-Z0-9]*$/.test(func.name)) {
            violations.push({
              rule: 'naming-components',
              message: `Component "${func.name}" should use PascalCase`,
              line: func.startLine,
              suggestion: toPascalCase(func.name),
              autoFixable: true
            });
          }
        }
      }
      
      return violations;
    }
  },
  {
    id: 'naming-hooks',
    name: 'usePrefix for Hooks',
    description: 'Custom hooks should start with "use"',
    category: 'naming',
    severity: 'error',
    check: (code, analysis) => {
      const violations: StyleViolation[] = [];
      
      for (const func of analysis.functions) {
        // Detect hooks by usage patterns
        const funcBody = code.substring(func.startLine);
        const usesHooks = /use[A-Z]|useState|useEffect|useCallback/.test(funcBody);
        
        if (usesHooks && !func.name.startsWith('use') && !func.name.match(/^[A-Z]/)) {
          violations.push({
            rule: 'naming-hooks',
            message: `Hook "${func.name}" should start with "use"`,
            line: func.startLine,
            suggestion: `use${toPascalCase(func.name)}`,
            autoFixable: true
          });
        }
      }
      
      return violations;
    }
  },
  {
    id: 'imports-order',
    name: 'Import Order',
    description: 'Imports should be ordered: external, @/, relative',
    category: 'imports',
    severity: 'warning',
    check: (code, analysis) => {
      const violations: StyleViolation[] = [];
      const imports = analysis.imports;
      
      let lastType = 0; // 0: external, 1: alias, 2: relative
      
      for (const imp of imports) {
        const type = imp.source.startsWith('.') ? 2 : imp.source.startsWith('@/') ? 1 : 0;
        
        if (type < lastType) {
          violations.push({
            rule: 'imports-order',
            message: `Import "${imp.source}" should come before relative/alias imports`,
            line: imp.line,
            suggestion: 'Reorder imports: external → @/ alias → relative',
            autoFixable: false
          });
        }
        lastType = type;
      }
      
      return violations;
    }
  },
  {
    id: 'no-any',
    name: 'No Explicit Any',
    description: 'Avoid using explicit "any" type',
    category: 'types',
    severity: 'warning',
    check: (code) => {
      const violations: StyleViolation[] = [];
      const lines = code.split('\n');
      
      lines.forEach((line, i) => {
        if (/:\s*any\b/.test(line) && !line.includes('// eslint-disable')) {
          violations.push({
            rule: 'no-any',
            message: 'Avoid explicit "any" type',
            line: i + 1,
            suggestion: 'Use "unknown" or define a proper type',
            autoFixable: false
          });
        }
      });
      
      return violations;
    }
  },
  {
    id: 'prefer-const',
    name: 'Prefer Const',
    description: 'Use const for variables that are never reassigned',
    category: 'best-practices',
    severity: 'info',
    check: (code) => {
      const violations: StyleViolation[] = [];
      const lines = code.split('\n');
      
      lines.forEach((line, i) => {
        if (/^\s*let\s+\w+\s*=/.test(line)) {
          // Simple heuristic: if no reassignment in next 20 lines, suggest const
          const following = lines.slice(i + 1, i + 21).join('\n');
          const varName = line.match(/let\s+(\w+)/)?.[1];
          
          if (varName && !new RegExp(`${varName}\\s*=`).test(following)) {
            violations.push({
              rule: 'prefer-const',
              message: `Consider using const for "${varName}"`,
              line: i + 1,
              suggestion: 'Replace "let" with "const"',
              autoFixable: true
            });
          }
        }
      });
      
      return violations;
    }
  },
  {
    id: 'component-size',
    name: 'Component Size',
    description: 'Components should be under 200 lines',
    category: 'components',
    severity: 'warning',
    check: (code, analysis) => {
      const violations: StyleViolation[] = [];
      
      if (analysis.hasJSX && analysis.linesOfCode > 200) {
        violations.push({
          rule: 'component-size',
          message: `Component has ${analysis.linesOfCode} lines, consider splitting`,
          line: 1,
          suggestion: 'Extract sub-components or hooks to reduce complexity',
          autoFixable: false
        });
      }
      
      return violations;
    }
  },
  {
    id: 'complexity',
    name: 'Cyclomatic Complexity',
    description: 'Functions should have low cyclomatic complexity',
    category: 'best-practices',
    severity: 'warning',
    check: (code, analysis) => {
      const violations: StyleViolation[] = [];
      
      for (const func of analysis.functions) {
        if (func.complexity > 10) {
          violations.push({
            rule: 'complexity',
            message: `Function "${func.name}" has complexity ${func.complexity}, consider refactoring`,
            line: func.startLine,
            suggestion: 'Extract helper functions or use early returns',
            autoFixable: false
          });
        }
      }
      
      return violations;
    }
  },
  {
    id: 'semantic-colors',
    name: 'Semantic Color Tokens',
    description: 'Use semantic color tokens instead of hardcoded colors',
    category: 'best-practices',
    severity: 'error',
    check: (code) => {
      const violations: StyleViolation[] = [];
      const lines = code.split('\n');
      
      const hardcodedPatterns = [
        /text-white/,
        /text-black/,
        /bg-white/,
        /bg-black/,
        /bg-gray-/,
        /text-gray-/,
        /#[0-9a-fA-F]{3,6}/,
        /rgb\(/,
        /rgba\(/
      ];
      
      lines.forEach((line, i) => {
        for (const pattern of hardcodedPatterns) {
          if (pattern.test(line) && !line.includes('//')) {
            violations.push({
              rule: 'semantic-colors',
              message: 'Use semantic color tokens (--background, --foreground, etc.)',
              line: i + 1,
              suggestion: 'Replace with semantic token from design system',
              autoFixable: false
            });
            break;
          }
        }
      });
      
      return violations;
    }
  }
];

/**
 * Analyze code for style violations
 */
export function enforceStyle(
  code: string,
  analysis: ASTAnalysis,
  filename: string
): StyleReport {
  const violations: StyleViolation[] = [];
  
  for (const rule of STYLE_RULES) {
    violations.push(...rule.check(code, analysis));
  }
  
  const summary = {
    errors: violations.filter(v => STYLE_RULES.find(r => r.id === v.rule)?.severity === 'error').length,
    warnings: violations.filter(v => STYLE_RULES.find(r => r.id === v.rule)?.severity === 'warning').length,
    infos: violations.filter(v => STYLE_RULES.find(r => r.id === v.rule)?.severity === 'info').length
  };
  
  // Score: 100 - (errors * 10) - (warnings * 5) - (infos * 1)
  const score = Math.max(0, 100 - summary.errors * 10 - summary.warnings * 5 - summary.infos);
  
  return {
    file: filename,
    violations,
    score,
    summary
  };
}

/**
 * Auto-fix violations where possible
 */
export function autoFixViolations(code: string, violations: StyleViolation[]): string {
  let fixed = code;
  
  // Sort by line descending to avoid offset issues
  const fixable = violations
    .filter(v => v.autoFixable)
    .sort((a, b) => b.line - a.line);
  
  for (const violation of fixable) {
    const rule = STYLE_RULES.find(r => r.id === violation.rule);
    if (rule?.autofix) {
      fixed = rule.autofix(fixed, violation);
    }
  }
  
  return fixed;
}

/**
 * Learn style patterns from existing code
 */
export function learnStylePatterns(
  files: Map<string, { code: string; analysis: ASTAnalysis }>
): Record<string, number> {
  const patterns: Record<string, number> = {
    avgComplexity: 0,
    avgLinesPerFile: 0,
    constVsLet: 0,
    arrowVsFunction: 0,
    semicolonUsage: 0
  };
  
  let totalFiles = 0;
  let totalComplexity = 0;
  let totalLines = 0;
  let constCount = 0;
  let letCount = 0;
  let arrowCount = 0;
  let functionCount = 0;
  let semicolonCount = 0;
  let noSemicolonCount = 0;
  
  for (const [, { code, analysis }] of files) {
    totalFiles++;
    totalComplexity += analysis.cyclomaticComplexity;
    totalLines += analysis.linesOfCode;
    
    constCount += (code.match(/\bconst\s/g) || []).length;
    letCount += (code.match(/\blet\s/g) || []).length;
    arrowCount += (code.match(/=>/g) || []).length;
    functionCount += (code.match(/\bfunction\s/g) || []).length;
    semicolonCount += (code.match(/;$/gm) || []).length;
    noSemicolonCount += (code.match(/[^;]$/gm) || []).length;
  }
  
  if (totalFiles > 0) {
    patterns.avgComplexity = Math.round(totalComplexity / totalFiles * 10) / 10;
    patterns.avgLinesPerFile = Math.round(totalLines / totalFiles);
    patterns.constVsLet = constCount / Math.max(1, letCount);
    patterns.arrowVsFunction = arrowCount / Math.max(1, functionCount);
    patterns.semicolonUsage = semicolonCount / Math.max(1, noSemicolonCount);
  }
  
  return patterns;
}

// Helper functions
function toPascalCase(str: string): string {
  return str
    .split(/[-_\s]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

export { STYLE_RULES };
